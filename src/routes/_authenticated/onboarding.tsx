import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

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
      { name: "description", content: "سجّل بياناتك الدراسية عشان WISO يبني خطتك." },
      { property: "og:title", content: "ابدأ رحلتك — WISO" },
      { property: "og:description", content: "سجّل بياناتك الدراسية عشان WISO يبني خطتك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [schoolYear, setSchoolYear] = useState(profile?.school_year ?? "");
  const [track, setTrack] = useState(profile?.track ?? "");
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
      const stage = stages.data?.find((item) => item.slug === schoolYear);
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
    const stage = stages.data?.find((item) => item.slug === schoolYear);

    if (!stage) {
      throw new Error("اختار مرحلة دراسية صحيحة");
    }

    const selectedTrack = tracks.data?.find((item) => item.slug === track);

    const onboardingArgs = {
      _stage_id: stage.id,
      ...(selectedTrack?.id ? { _track_id: selectedTrack.id } : {}),
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
        phone: phone.trim(),
      })
      .eq("id", user!.id);

    if (profileError) throw profileError;
  },

  onSuccess: async () => {
    await qc.invalidateQueries();
    toast.success("تم تسجيل بياناتك بنجاح");
    await navigate({ to: "/dashboard" });
  },

  onError: (e: Error) => {
    toast.error(e.message);
  },
});



  return (
    <main dir="rtl" className="page-shell max-w-2xl">
      <PageHeader title="خطوة واحدة وتبدأ" subtitle="قولنا بتدرس إيه عشان WISO يظبط الرحلة ليك." />
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">بياناتك الدراسية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">الاسم</Label>
            <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">رقم الموبايل</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>المرحلة الدراسية *</Label>
            <Select
              value={schoolYear}
              onValueChange={(value) => {
                setSchoolYear(value);
                setTrack("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختار مرحلتك الدراسية" />
              </SelectTrigger>
              <SelectContent>
                {stages.data?.map((stage) => (
                  <SelectItem key={stage.id} value={stage.slug}>
                    {stage.name_ar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="track">الشعبة / التخصص</Label>
            {tracks.data?.length ? (
              <Select value={track} onValueChange={setTrack}>
                <SelectTrigger id="track">
                  <SelectValue placeholder="اختار الشعبة" />
                </SelectTrigger>
                <SelectContent>
                  {tracks.data.map((item) => (
                    <SelectItem key={item.slug} value={item.slug}>
                      {item.name_ar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input id="track" value={track} onChange={(e) => setTrack(e.target.value)} />
            )}
          </div>
          <Button
            className="w-full"
            disabled={save.isPending || !fullName.trim() || !schoolYear}
            onClick={() => save.mutate()}
          >
            {save.isPending ? "بيتسجل..." : "يلا نبدأ"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
