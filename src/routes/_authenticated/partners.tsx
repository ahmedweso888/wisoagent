import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Copy, Gift, Link2, Megaphone, Wallet, Users, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  activateMyInfluencerAccount,
  getMyPartnersDashboard,
} from "@/lib/partners.functions";

export const Route = createFileRoute("/_authenticated/partners")({
  head: () => ({ meta: [{ title: "الدعوات والعمولات — WISO" }] }),
  component: PartnersPage,
});

type Dashboard = Awaited<ReturnType<typeof getMyPartnersDashboard>>;

function money(value: number) {
  return `${value.toLocaleString("ar-EG", { maximumFractionDigits: 2 })} ج.م`;
}

function PartnersPage() {
  const queryClient = useQueryClient();
  const [activationCode, setActivationCode] = useState("");
  const dashboard = useQuery<Dashboard>({
    queryKey: ["my-partners-dashboard"],
    queryFn: () => getMyPartnersDashboard(),
  });
  const activate = useMutation({
    mutationFn: () => activateMyInfluencerAccount({ data: { code: activationCode } }),
    onSuccess: async () => {
      toast.success("تم تفعيل حساب المؤثر بنجاح.");
      setActivationCode("");
      await queryClient.invalidateQueries({ queryKey: ["my-partners-dashboard"] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "تعذر تفعيل الكود";
      toast.error(message.includes("INVALID") ? "كود التفعيل غير صالح أو منتهي أو استُخدم بالكامل." : message);
    },
  });

  const data = dashboard.data;
  const inviteUrl = data ? `${typeof window !== "undefined" ? window.location.origin : ""}${data.link}` : "";

  async function copyInvite() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success("تم نسخ لينك الدعوة.");
    } catch {
      toast.error("تعذر نسخ الرابط. انسخه يدويًا.");
    }
  }

  if (dashboard.isPending) {
    return <main dir="rtl" className="page-shell max-w-5xl"><Skeleton className="h-10 w-64" /><Skeleton className="mt-6 h-40 w-full" /><Skeleton className="mt-4 h-32 w-full" /></main>;
  }

  if (dashboard.isError || !data) {
    return <main dir="rtl" className="page-shell max-w-5xl"><PageHeader title="الدعوات والعمولات" subtitle="شارك WISO واكسب رصيدًا من دعواتك." /><p className="mt-6 text-sm text-destructive">تعذر تحميل بيانات الدعوات. تأكد من تطبيق Migration نظام WISO Partners ثم أعد المحاولة.</p><Button className="mt-3" variant="outline" onClick={() => void dashboard.refetch()}>إعادة المحاولة</Button></main>;
  }

  const isInfluencer = Boolean(data.influencer?.is_active);

  return (
    <main dir="rtl" className="page-shell max-w-5xl space-y-6">
      <PageHeader title="الدعوات والعمولات" subtitle="شارك لينك WISO مع أصحابك، وتابع مكافآتك وعمولاتك من مكان واحد." />

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary"><Link2 className="size-5" /></span><div><h2 className="font-display text-lg font-bold">لينك الدعوة الخاص بي</h2><p className="text-sm text-muted-foreground">أي طالب يسجل من خلاله هيتسجل ضمن دعواتك.</p></div></div>
          <div className="flex flex-col gap-2 sm:flex-row"><Input readOnly dir="ltr" value={inviteUrl} className="text-left" /><Button onClick={() => void copyInvite()} className="shrink-0 gap-2"><Copy className="size-4" />نسخ اللينك</Button></div>
          <div className="grid gap-3 sm:grid-cols-3"><Metric icon={<Users className="size-4" />} label="زيارات اللينك" value={data.visits} /><Metric icon={<Users className="size-4" />} label="المستخدمون المسجلون" value={data.referredUsers} /><Metric icon={<Wallet className="size-4" />} label="مكافآت الدعوات" value={money(data.referralEarnings)} /></div>
          <div className="rounded-xl bg-secondary/60 p-4 text-sm leading-7">تحصل على <strong>10 جنيه رصيد</strong> عند قبول أول طلب خاص يقدمه الطالب الذي سجّل من خلال لينكك. المكافأة تُضاف مرة واحدة فقط لكل طالب بعد قبول الطلب من الإدارة.</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary"><Megaphone className="size-5" /></span><div><h2 className="font-display text-lg font-bold">برنامج المؤثرين</h2><p className="text-sm text-muted-foreground">عمولات على مشتريات الأدوات من خلال دعواتك.</p></div></div>{isInfluencer ? <Badge className="gap-1"><CheckCircle2 className="size-3.5" />مؤثر مفعّل</Badge> : <Badge variant="secondary">غير مفعّل</Badge>}</div>
          {isInfluencer ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2"><Metric icon={<Wallet className="size-4" />} label="إجمالي عمولات المؤثر" value={money(data.influencerEarnings)} /><Metric icon={<Gift className="size-4" />} label="عدد العمولات" value={data.commissions.length} /></div>
              <div className="rounded-xl bg-secondary/60 p-4 text-sm leading-7"><p className="font-semibold">العمولات المعتمدة:</p><p>SPRIX / الثقافة المالية: 20 جنيه</p><p>Qureo / البرمجة: 30 جنيه</p><p>الباقة المجمعة: 50 جنيه</p><p className="mt-2 text-muted-foreground">تُضاف العمولة بعد تأكيد الإدارة لطلب الدفع، ولا تُحتسب الطلبات المرفوضة أو المعلقة.</p></div>
            </>
          ) : (
            <div className="space-y-3"><p className="text-sm leading-7 text-muted-foreground">لو أنت صانع محتوى أو عندك جمهور وعايز تنضم لبرنامج المؤثرين، أدخل كود التفعيل اللي استلمته من إدارة WISO.</p><div className="max-w-md space-y-2"><Label htmlFor="influencer-code">كود تفعيل المؤثر</Label><Input id="influencer-code" dir="ltr" autoComplete="off" placeholder="WISO-INF-XXXXXXXXXXXX" value={activationCode} onChange={(event) => setActivationCode(event.target.value.toUpperCase())} /><Button disabled={activationCode.trim().length < 8 || activate.isPending} onClick={() => activate.mutate()}>{activate.isPending ? "جاري التفعيل..." : "تفعيل حساب المؤثر"}</Button></div></div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6"><h2 className="font-display text-lg font-bold">سجل الأرباح</h2><div className="mt-4 space-y-3">{data.referralRewards.length === 0 && data.commissions.length === 0 ? <p className="text-sm text-muted-foreground">لسه مفيش أرباح. شارك لينك الدعوة وابدأ.</p> : <>
          {data.referralRewards.map((row, index) => <div key={`r-${row.special_request_id}-${index}`} className="flex items-center justify-between gap-3 border-b border-border pb-3 text-sm"><div><p className="font-medium">مكافأة قبول طلب خاص</p><p className="text-xs text-muted-foreground">{new Date(row.created_at).toLocaleDateString("ar-EG")}</p></div><strong className="text-primary">+{money(Number(row.amount_egp))}</strong></div>)}
          {data.commissions.map((row, index) => <div key={`c-${row.id ?? index}`} className="flex items-center justify-between gap-3 border-b border-border pb-3 text-sm"><div><p className="font-medium">عمولة {row.product_key === "financial_literacy" ? "SPRIX" : row.product_key === "qureo" ? "Qureo" : "الباقة المجمعة"}</p><p className="text-xs text-muted-foreground">{new Date(row.created_at).toLocaleDateString("ar-EG")}</p></div><strong className="text-primary">+{money(Number(row.amount_egp))}</strong></div>)}
        </>}</div></CardContent>
      </Card>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return <div className="rounded-xl border border-border p-4"><div className="flex items-center gap-2 text-sm text-muted-foreground">{icon}{label}</div><p className="mt-2 text-xl font-bold">{value}</p></div>;
}
