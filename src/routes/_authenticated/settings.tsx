import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "حسابي — WISO" },
      { name: "description", content: "بيانات الطالب وإعدادات حساب WISO." },
      { property: "og:title", content: "حسابي — WISO" },
      { property: "og:description", content: "حدّث بياناتك الدراسية في WISO." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, profile } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [year, setYear] = useState("");
  const [track, setTrack] = useState("");
  useEffect(() => {
    setName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
    setYear(profile?.school_year ?? "");
    setTrack(profile?.track ?? "");
  }, [profile]);
  const save = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("سجّل دخولك من جديد");
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: name, phone, school_year: year, track })
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => toast.success("اتحفظت التغييرات."),
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <main dir="rtl" className="page-shell max-w-3xl">
      <PageHeader
        title="حسابي"
        subtitle="بياناتك دي بتساعد WISO يضبط الخطة والمحتوى المناسب ليك."
      />
      <Card className="mt-6">
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="settings-name">الاسم</Label>
            <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-email">الإيميل</Label>
            <Input id="settings-email" value={user?.email ?? ""} disabled dir="ltr" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-phone">رقم الموبايل</Label>
            <Input id="settings-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="settings-year">السنة الدراسية</Label>
              <Input id="settings-year" value={year} onChange={(e) => setYear(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-track">الشعبة</Label>
              <Input id="settings-track" value={track} onChange={(e) => setTrack(e.target.value)} />
            </div>
          </div>
          <Button disabled={!name || save.isPending} onClick={() => save.mutate()}>
            {save.isPending ? "بيتحفظ..." : "حفظ التغييرات"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
