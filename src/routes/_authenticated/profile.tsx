import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Flame,
  GraduationCap,
  LockKeyhole,
  Phone,
  ShieldCheck,
  Trophy,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { EmptyState } from "@/components/common/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "الملف الشخصي — WISO" },
      { name: "description", content: "بياناتك الدراسية ومستوى تقدمك في WISO." },
    ],
  }),
  component: ProfilePage,
});

function initials(name: string | null | undefined) {
  if (!name) return "؟";
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
}

function ProfilePage() {
  const { profile, user } = useAuth();
  const qc = useQueryClient();
  const [nationalId, setNationalId] = useState("");

  const walletState = useQuery({
    queryKey: ["wallet-state"],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("my_wallet_state");
      if (error) throw error;
      return data as { national_id_verified?: boolean };
    },
  });
  const submitNationalId = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("submit_national_id", {
        _national_id: nationalId,
      });
      if (error) throw error;
      const result = data as { ok?: boolean; reason?: string };
      if (!result.ok) throw new Error(result.reason || "invalid_national_id");
    },
    onSuccess: async () => {
      setNationalId("");
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["wallet-state"] }),
        qc.invalidateQueries({ queryKey: ["profile"] }),
      ]);
      toast.success("تم توثيق الرقم القومي وفتح ملفات PDF.");
    },
    onError: () => toast.error("الرقم القومي غير صحيح. راجع الـ 14 رقم وبيانات الميلاد والمحافظة."),
  });

  const mastery = useQuery({
    queryKey: ["profile-mastery"],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mastery")
        .select("mastery_score,questions_solved,is_weak,subjects(name_ar)")
        .order("mastery_score", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const todayProgress = useQuery({
    queryKey: ["profile-today-progress"],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_progress")
        .select("*")
        .eq("day", new Date().toISOString().slice(0, 10))
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const contestEntry = useQuery({
    queryKey: ["profile-contest-entry"],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contest_entries")
        .select("phone,created_at")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const loading = !profile;

  if (loading) {
    return (
      <main dir="rtl" className="page-shell max-w-5xl">
        <Skeleton className="h-10 w-64" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28 w-full md:col-span-3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </main>
    );
  }

  const avgMastery = mastery.data?.length
    ? Math.round(
        mastery.data.reduce((sum, m) => sum + Number(m.mastery_score), 0) / mastery.data.length,
      )
    : null;
  const totalSolved = mastery.data?.reduce((sum, m) => sum + (m.questions_solved ?? 0), 0) ?? 0;
  const level = Math.max(1, Math.floor((profile.xp ?? 0) / 500) + 1);

  return (
    <main dir="rtl" className="page-shell max-w-5xl">
      <PageHeader title="الملف الشخصي" subtitle="بياناتك الدراسية ومستواك الحقيقي في WISO." />

      <Card className="mt-7">
        <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:items-center sm:gap-5 sm:text-start">
          <Avatar className="size-20 border border-border">
            <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name ?? ""} />
            <AvatarFallback className="bg-secondary text-lg font-bold text-primary">
              {initials(profile.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <h2 className="font-display text-xl font-bold">{profile.full_name ?? "طالب WISO"}</h2>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {profile.school_year ? (
                <Badge variant="secondary" className="gap-1">
                  <GraduationCap className="size-3.5" />
                  {profile.school_year}
                </Badge>
              ) : null}
              {profile.track ? <Badge variant="secondary">{profile.track}</Badge> : null}
              <Badge className="gap-1">
                <Trophy className="size-3.5" />
                المستوى {level}
              </Badge>
            </div>
            {profile.phone ? (
              <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground sm:justify-start">
                <Phone className="size-3.5" />
                {profile.phone}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="نقاط الخبرة"
          value={profile.xp ?? 0}
          hint="تراكمية من نشاطك الفعلي"
          tone="primary"
        />
        <StatCard
          label="أيام التتابع"
          value={profile.streak_days ?? 0}
          hint="أيام متتالية من الحل"
        />
        <StatCard label="أسئلة محلولة" value={totalSolved} hint="إجمالي عبر كل المواد" />
      </div>

      <Card className="mt-6" id="national-id">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            {walletState.data?.national_id_verified ? (
              <ShieldCheck className="mt-0.5 size-6 shrink-0 text-primary" />
            ) : (
              <LockKeyhole className="mt-0.5 size-6 shrink-0 text-primary" />
            )}
            <div className="flex-1">
              <h3 className="font-display text-lg font-bold">توثيق ملفات PDF</h3>
              {walletState.data?.national_id_verified ? (
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  رقمك القومي موثّق وملفات PDF الشخصية متاحة. حفاظاً على أمانك مش بنعرض الرقم هنا،
                  ومش بيتغيّر من إعدادات الطالب.
                </p>
              ) : (
                <>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    الرقم القومي اختياري لكل استخدامات WISO، ومطلوب فقط للطباعة وتنزيل PDF بعلامة
                    ملكية على كل صفحة. التحقق من صحة البنية لا يثبت ملكية الرقم.
                    (يخلي wiso  agent  مسئوليته من اعاده بيعك لملفات وكتب تحتوي علي رقمك القومي وتبعات ذلك (ينصح wiso agent  بعدم اعطاء او عرض ملفات ال pdf الخاصه بك ل اي شخص آخر نظرآ لما يمكن ان يفعله ب رقمك القومي من اعاده بيع او نشر او سرقه هويه شخصيه و تبعات ذلك))
                  </p>
                  <div className="mt-4 max-w-md space-y-2">
                    <Label htmlFor="national-id">الرقم القومي المصري (14 رقم)</Label>
                    <Input
                      id="national-id"
                      dir="ltr"
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={14}
                      value={nationalId}
                      onChange={(event) =>
                        setNationalId(event.target.value.replace(/\D/g, "").slice(0, 14))
                      }
                    />
                    <Button
                      disabled={nationalId.length !== 14 || submitNationalId.isPending}
                      onClick={() => submitNationalId.mutate()}
                    >
                      {submitNationalId.isPending ? "جاري التحقق..." : "تحقق وافتح PDF"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">متوسط الإتقان العام</h3>
            {avgMastery !== null ? (
              <span className="text-sm font-semibold text-primary">{avgMastery}%</span>
            ) : null}
          </div>
          {mastery.isPending ? (
            <Skeleton className="mt-4 h-3 w-full" />
          ) : avgMastery !== null ? (
            <Progress value={avgMastery} className="mt-4" />
          ) : (
            <EmptyState
              icon={UserIcon}
              title="لسه مفيش بيانات إتقان"
              description="حل شوية أسئلة عشان WISO يقدر يحسب مستواك الحقيقي."
              className="mt-4"
            />
          )}
          {mastery.data?.some((m) => m.is_weak) ? (
            <div className="mt-5 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">مواد تحتاج اهتمام</p>
              <div className="flex flex-wrap gap-2">
                {mastery.data
                  .filter((m) => m.is_weak)
                  .map((m, i) => (
                    <Badge key={`${m.subjects?.name_ar}-${i}`} variant="outline">
                      {m.subjects?.name_ar ?? "مادة"}
                    </Badge>
                  ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {contestEntry.data ? (
        <Card className="mt-6">
          <CardContent className="flex items-center gap-3 p-6">
            <Flame className="size-5 text-accent" />
            <div>
              <p className="text-sm font-semibold">مشارك في المسابقة</p>
              <p className="text-xs text-muted-foreground">
                رقم التواصل المسجّل: {contestEntry.data.phone}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {todayProgress.data ? (
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="font-display text-lg font-bold">نشاط اليوم</h3>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">أسئلة</p>
                <p className="mt-1 text-xl font-bold">{todayProgress.data.questions_solved}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">إجابات صحيحة</p>
                <p className="mt-1 text-xl font-bold">{todayProgress.data.correct_answers}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">دقائق مذاكرة</p>
                <p className="mt-1 text-xl font-bold">{todayProgress.data.study_minutes}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">خبرة اليوم</p>
                <p className="mt-1 text-xl font-bold">{todayProgress.data.xp_earned}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </main>
  );
}
