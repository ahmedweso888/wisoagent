import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Phone, UserRound, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/common/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/onboarding")({
head: () => ({
meta: [
{ title: "ابدأ رحلتك — WISO" },
{
name: "description",
content: "سجّل بياناتك الدراسية عشان WISO يبني خطتك.",
},
{ property: "og:title", content: "ابدأ رحلتك — WISO" },
{
property: "og:description",
content: "سجّل بياناتك الدراسية عشان WISO يبني خطتك.",
},
{ property: "og:type", content: "website" },
{ name: "twitter:card", content: "summary" },
],
}),
component: OnboardingPage,
});

/**

* تحويل الأرقام العربية إلى أرقام إنجليزية.
* مثال: ٠١٠١٢٣٤٥٦٧٨ ← 01012345678
  */
  function normalizeArabicDigits(value: string) {
  return value.replace(/[٠-٩]/g, (digit) =>
  String(digit.charCodeAt(0) - 1632),
  );
  }

function OnboardingPage() {
const { user, profile } = useAuth();
const navigate = useNavigate();
const qc = useQueryClient();

const [fullName, setFullName] = useState(profile?.full_name ?? "");
const [phone, setPhone] = useState(profile?.phone ?? "");
const [schoolYear, setSchoolYear] = useState(profile?.school_year ?? "");
const [track, setTrack] = useState(profile?.track ?? "");

// نافذة تأكيد بيانات الطالب.
const [showConfirmation, setShowConfirmation] = useState(false);

const stages = useQuery({
queryKey: ["academic-stages-onboarding"],
queryFn: async () => {
const { data, error } = await supabase
.from("academic_stages")
.select("id,name_ar,slug")
.eq("is_active", true)
.order("sort_order");


  if (error) throw error;

  return data ?? [];
},


});

const tracks = useQuery({
queryKey: ["academic-tracks-onboarding", schoolYear],
enabled: Boolean(schoolYear),
queryFn: async () => {
const stage = stages.data?.find(
(item) => item.slug === schoolYear,
);


  if (!stage) return [];

  const { data, error } = await supabase
    .from("academic_tracks")
    .select("id,name_ar,slug")
    .eq("stage_id", stage.id)
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw error;

  return data ?? [];
},


});

const save = useMutation({
mutationFn: async () => {
if (!user?.id) {
throw new Error("سجّل دخولك من جديد وحاول مرة أخرى.");
}


  const normalizedPhone = normalizeArabicDigits(phone.trim());

  if (!fullName.trim()) {
    throw new Error("اكتب اسمك الأول.");
  }

  if (!normalizedPhone) {
    throw new Error("اكتب رقم موبايلك للتواصل معاك.");
  }

  const stage = stages.data?.find(
    (item) => item.slug === schoolYear,
  );

  if (!stage) {
    throw new Error("اختار مرحلة دراسية صحيحة");
  }

  const selectedTrack = tracks.data?.find(
    (item) => item.slug === track,
  );

  const onboardingArgs = {
    _stage_id: stage.id,
    ...(selectedTrack?.id
      ? { _track_id: selectedTrack.id }
      : {}),
  };

  const { error: onboardingError } = await supabase.rpc(
    "complete_academic_onboarding",
    onboardingArgs,
  );

  if (onboardingError) throw onboardingError;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName.trim(),
      phone: normalizedPhone,
    })
    .eq("id", user.id);

  if (profileError) throw profileError;
},

onSuccess: async () => {
  setShowConfirmation(false);

  await qc.invalidateQueries();

  toast.success("تم تسجيل بياناتك بنجاح");

  await navigate({ to: "/dashboard" });
},

onError: (e: Error) => {
  toast.error(e.message);
},

});

// فتح نافذة التأكيد بعد التحقق من الحقول المطلوبة.
const handleContinue = () => {
if (!fullName.trim()) {
toast.error("اكتب اسمك الأول.");
return;
}


if (!phone.trim()) {
  toast.error("اكتب رقم موبايلك عشان الدعم يقدر يتواصل معاك.");
  return;
}

if (!schoolYear) {
  toast.error("اختار مرحلتك الدراسية.");
  return;
}

setShowConfirmation(true);


};

return ( <main dir="rtl" className="page-shell max-w-2xl"> <PageHeader
     title="خطوة واحدة وتبدأ"
     subtitle="قولنا بتدرس إيه عشان WISO يظبط الرحلة ليك."
   />


  <Card className="mt-6">
    <CardHeader>
      <CardTitle className="text-base">
        بياناتك الدراسية
      </CardTitle>
    </CardHeader>

    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">الاسم</Label>
        <Input
          id="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          maxLength={200}
          disabled={save.isPending}
          placeholder="اكتب اسمك بالكامل"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">رقم الموبايل</Label>
        <Input
          id="phone"
          type="tel"
          inputMode="tel"
          dir="ltr"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="01xxxxxxxxx"
          maxLength={20}
          disabled={save.isPending}
        />
        <p className="text-xs leading-5 text-muted-foreground">
          اكتب رقم شغال تقدر تستقبل عليه مكالمات أو رسائل من فريق الدعم.
        </p>
      </div>

      <div className="space-y-2">
        <Label>المرحلة الدراسية *</Label>
        <Select
          value={schoolYear}
          onValueChange={(value) => {
            setSchoolYear(value);
            setTrack("");
          }}
          disabled={save.isPending}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختار مرحلتك الدراسية" />
          </SelectTrigger>

          <SelectContent>
            {stages.data?.map((stage) => (
              <SelectItem
                key={stage.id}
                value={stage.slug}
              >
                {stage.name_ar}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="track">الشعبة / التخصص</Label>

        {tracks.data?.length ? (
          <Select
            value={track}
            onValueChange={setTrack}
            disabled={save.isPending}
          >
            <SelectTrigger id="track">
              <SelectValue placeholder="اختار الشعبة" />
            </SelectTrigger>

            <SelectContent>
              {tracks.data.map((item) => (
                <SelectItem
                  key={item.slug}
                  value={item.slug}
                >
                  {item.name_ar}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id="track"
            value={track}
            onChange={(e) => setTrack(e.target.value)}
            disabled={save.isPending}
          />
        )}
      </div>

      <Button
        className="w-full"
        disabled={
          save.isPending ||
          !fullName.trim() ||
          !phone.trim() ||
          !schoolYear
        }
        onClick={handleContinue}
      >
        تأكيد ومتابعة
      </Button>
    </CardContent>
  </Card>

  {/* نافذة تأكيد الاسم ورقم الموبايل */}
  {showConfirmation ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !save.isPending
        ) {
          setShowConfirmation(false);
        }
      }}
    >
      <section
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-confirmation-title"
        className="my-auto w-full max-w-md overflow-hidden rounded-2xl border border-cyan-500/30 bg-background shadow-2xl shadow-cyan-950/20"
      >
        <div className="border-b border-border/70 bg-cyan-500/5 p-5 text-center">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-500">
            <ShieldCheck className="size-7" />
          </div>

          <h2
            id="onboarding-confirmation-title"
            className="text-xl font-extrabold"
          >
            تأكد من بياناتك كويس
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            قبل ما تبدأ رحلتك مع WISO، راجع اسمك ورقم موبايلك وتأكد
            إنهم صحيحين.
          </p>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-3">
            <UserRound className="mt-0.5 size-5 shrink-0 text-primary" />

            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">
                الاسم المسجل
              </p>
              <p className="mt-1 break-words font-bold">
                {fullName.trim()}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-3">
            <Phone className="mt-0.5 size-5 shrink-0 text-primary" />

            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">
                رقم الموبايل
              </p>
              <p
                dir="ltr"
                className="mt-1 break-all text-left font-bold"
              >
                {normalizeArabicDigits(phone.trim())}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-500" />

              <div>
                <p className="font-bold">
                  بياناتك مهمة عشان نقدر نساعدك
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  لو حصلت معاك أي مشكلة في المنصة، فريق الدعم هيحتاج
                  اسمك ورقم موبايلك الصحيح عشان يقدر يتواصل معاك
                  ويساعدك. راجعهم كويس قبل التأكيد.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={save.isPending}
              onClick={() => setShowConfirmation(false)}
            >
              مراجعة البيانات
            </Button>

            <Button
              type="button"
              className="w-full"
              disabled={save.isPending}
              onClick={() => save.mutate()}
            >
              {save.isPending
                ? "بيتسجل..."
                : "تأكيد ومتابعة"}
            </Button>
          </div>
        </div>
      </section>
    </div>
  ) : null}
</main>

);
}
