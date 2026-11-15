import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Copy, KeyRound, Users, Wallet, Ban, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  adminCreateInfluencerActivationCode,
  adminGetInfluencerOverview,
  adminListInfluencerActivationCodes,
  adminSetInfluencerActivationCodeStatus,
} from "@/lib/partners.functions";

export const Route = createFileRoute("/_authenticated/admin/partners")({
  head: () => ({ meta: [{ title: "إدارة الدعوات والمؤثرين — WISO" }] }),
  component: AdminPartnersPage,
});

function AdminPartnersPage() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [maxUses, setMaxUses] = useState("1");
  const [expiresAt, setExpiresAt] = useState("");
  const codes = useQuery({ queryKey: ["admin-influencer-codes"], queryFn: () => adminListInfluencerActivationCodes(), enabled: isAdmin });
  const overview = useQuery({ queryKey: ["admin-influencer-overview"], queryFn: () => adminGetInfluencerOverview(), enabled: isAdmin });
  const refresh = async () => Promise.all([
    queryClient.invalidateQueries({ queryKey: ["admin-influencer-codes"] }),
    queryClient.invalidateQueries({ queryKey: ["admin-influencer-overview"] }),
  ]);
  const createCode = useMutation({
    mutationFn: () => adminCreateInfluencerActivationCode({ data: { maxUses: Number(maxUses), expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null } }),
    onSuccess: async (row) => { toast.success(`تم إنشاء الكود: ${row.code}`); setMaxUses("1"); setExpiresAt(""); await refresh(); },
    onError: () => toast.error("تعذر إنشاء الكود. راجع عدد مرات الاستخدام وتاريخ الانتهاء."),
  });
  const toggleCode = useMutation({
    mutationFn: (input: { codeId: string; isActive: boolean }) => adminSetInfluencerActivationCodeStatus({ data: input }),
    onSuccess: async () => { toast.success("تم تحديث حالة الكود."); await refresh(); },
    onError: () => toast.error("تعذر تحديث حالة الكود."),
  });

  if (!isAdmin) return <Navigate to="/dashboard" />;
  if (codes.isPending || overview.isPending) return <main dir="rtl" className="page-shell"><Skeleton className="h-10 w-72" /><Skeleton className="mt-6 h-52 w-full" /><Skeleton className="mt-4 h-52 w-full" /></main>;
  if (codes.isError || overview.isError || !codes.data || !overview.data) return <main dir="rtl" className="page-shell"><PageHeader title="إدارة الدعوات والمؤثرين" subtitle="إدارة أكواد المؤثرين ومراجعة العمولات." /><p className="mt-5 text-sm text-destructive">تعذر تحميل البيانات. تأكد من تطبيق Migration نظام WISO Partners.</p><Button className="mt-3" variant="outline" onClick={() => { void codes.refetch(); void overview.refetch(); }}>إعادة المحاولة</Button></main>;

  const totalCommissions = overview.data.commissions.reduce((sum, row) => sum + Number(row.amount_egp ?? 0), 0);
  const totalReferralRewards = overview.data.referralRewards.reduce((sum, row) => sum + Number(row.amount_egp ?? 0), 0);

  return (
    <main dir="rtl" className="page-shell space-y-6">
      <PageHeader title="إدارة الدعوات والمؤثرين" subtitle="إنشاء أكواد تفعيل المؤثرين ومتابعة الحسابات والعمولات ومكافآت الدعوات." />
      <div className="grid gap-3 sm:grid-cols-3"><Summary icon={<Users className="size-4" />} label="المؤثرون" value={overview.data.influencers.length} /><Summary icon={<Wallet className="size-4" />} label="عمولات المؤثرين" value={`${totalCommissions.toLocaleString("ar-EG")} ج.م`} /><Summary icon={<Wallet className="size-4" />} label="مكافآت الدعوات" value={`${totalReferralRewards.toLocaleString("ar-EG")} ج.م`} /></div>

      <Card><CardContent className="space-y-4 p-6"><div className="flex items-center gap-3"><KeyRound className="size-5 text-primary" /><div><h2 className="font-display text-lg font-bold">إنشاء كود تفعيل مؤثر</h2><p className="text-sm text-muted-foreground">انسخ الكود وابعته للمؤثر. كل استخدام ناجح يفعّل حساب مستخدم واحد.</p></div></div>
        <div className="grid gap-3 sm:grid-cols-3"><div className="space-y-2"><Label htmlFor="max-uses">عدد مرات الاستخدام</Label><Input id="max-uses" type="number" min="1" max="10000" value={maxUses} onChange={(event) => setMaxUses(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="expires-at">تاريخ الانتهاء (اختياري)</Label><Input id="expires-at" type="datetime-local" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} /></div><div className="flex items-end"><Button className="w-full" disabled={!Number.isInteger(Number(maxUses)) || Number(maxUses) < 1 || createCode.isPending} onClick={() => createCode.mutate()}>{createCode.isPending ? "جاري الإنشاء..." : "إنشاء كود"}</Button></div></div>
      </CardContent></Card>

      <Card><CardContent className="p-6"><h2 className="font-display text-lg font-bold">أكواد التفعيل</h2><div className="mt-4 space-y-3">{codes.data.length === 0 ? <p className="text-sm text-muted-foreground">لم يتم إنشاء أكواد حتى الآن.</p> : codes.data.map((code) => <div key={code.id} className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="break-all font-mono text-sm font-bold" dir="ltr">{code.code}</p><p className="mt-1 text-xs text-muted-foreground">الاستخدامات: {code.uses_count}/{code.max_uses}{code.expires_at ? ` • ينتهي ${new Date(code.expires_at).toLocaleString("ar-EG")}` : " • بدون تاريخ انتهاء"}</p></div><div className="flex items-center gap-2"><Badge variant={code.is_active ? "default" : "secondary"}>{code.is_active ? "نشط" : "موقوف"}</Badge><Button size="sm" variant="outline" onClick={async () => { await navigator.clipboard.writeText(code.code); toast.success("تم نسخ الكود."); }}><Copy className="ml-1 size-4" />نسخ</Button><Button size="sm" variant="outline" disabled={toggleCode.isPending} onClick={() => toggleCode.mutate({ codeId: code.id, isActive: !code.is_active })}>{code.is_active ? <><Ban className="ml-1 size-4" />إيقاف</> : <><CheckCircle2 className="ml-1 size-4" />تفعيل</>}</Button></div></div>)}</div></CardContent></Card>

      <Card><CardContent className="p-6"><h2 className="font-display text-lg font-bold">حسابات المؤثرين</h2><div className="mt-4 space-y-3">{overview.data.influencers.length === 0 ? <p className="text-sm text-muted-foreground">لا يوجد مؤثرون مفعّلون حتى الآن.</p> : overview.data.influencers.map((person) => <div key={person.user_id} className="flex flex-col gap-1 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{person.profile?.full_name || "مستخدم بدون اسم"}</p><p className="text-xs text-muted-foreground">{person.profile?.phone || "لا يوجد رقم هاتف"}</p><p className="text-xs text-muted-foreground">تاريخ التفعيل: {new Date(person.activated_at).toLocaleDateString("ar-EG")}</p></div><Badge variant={person.is_active ? "default" : "secondary"}>{person.is_active ? "نشط" : "موقوف"}</Badge></div>)}</div></CardContent></Card>

      <Card><CardContent className="p-6"><h2 className="font-display text-lg font-bold">آخر العمولات ومكافآت الدعوات</h2><div className="mt-4 space-y-3">{overview.data.commissions.slice(0, 30).map((row) => { const person = overview.data.influencers.find((item) => item.user_id === row.influencer_user_id); return <div key={row.id} className="flex items-center justify-between gap-3 border-b border-border pb-3 text-sm"><div><p className="font-medium">{person?.profile?.full_name || "مؤثر"} — {row.product_key}</p><p className="text-xs text-muted-foreground">{new Date(row.created_at).toLocaleString("ar-EG")}</p></div><strong className="text-primary">+{Number(row.amount_egp).toLocaleString("ar-EG")} ج.م</strong></div>; })}{overview.data.referralRewards.slice(0, 30).map((row) => <div key={row.id} className="flex items-center justify-between gap-3 border-b border-border pb-3 text-sm"><div><p className="font-medium">مكافأة دعوة — {row.referrer_user_id.slice(0, 8)}</p><p className="text-xs text-muted-foreground">{new Date(row.created_at).toLocaleString("ar-EG")}</p></div><strong className="text-primary">+{Number(row.amount_egp).toLocaleString("ar-EG")} ج.م</strong></div>)}</div></CardContent></Card>
    </main>
  );
}

function Summary({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) { return <Card><CardContent className="p-4"><div className="flex items-center gap-2 text-sm text-muted-foreground">{icon}{label}</div><p className="mt-2 text-2xl font-bold">{value}</p></CardContent></Card>; }
