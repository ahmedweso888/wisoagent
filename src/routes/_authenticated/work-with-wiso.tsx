import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Copy, Users, WalletCards, CheckCircle2, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getMyReferralStats } from "@/lib/referral.functions";

export const Route = createFileRoute("/_authenticated/work-with-wiso")({
  component: WorkWithWisoPage,
});

function WorkWithWisoPage() {
  const stats = useQuery({
    queryKey: ["my-referral-stats"],
    queryFn: () => getMyReferralStats(),
  });

  const copyLink = async () => {
    if (!stats.data?.link) return;
    await navigator.clipboard.writeText(`${window.location.origin}${stats.data.link}`);
    toast.success("اتنسخ رابط الدعوة.");
  };

  return (
    <main dir="rtl" className="page-shell max-w-5xl">
      <PageHeader
        title="اشتغل مع WISO"
        subtitle="شارك رابطك مع أصحابك وخليهم يبدأوا رحلتهم مع WISO."
      />

      <Card className="mt-7">
        <CardHeader><CardTitle>رابط الدعوة الخاص بيك</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1 rounded-xl border bg-muted/30 p-3 font-mono text-sm" dir="ltr">
              {stats.data ? `${window.location.origin}${stats.data.link}` : "جارٍ إنشاء الرابط..."}
            </div>
            <Button onClick={() => void copyLink()} disabled={!stats.data?.link}>
              <Copy className="me-2 size-4" /> نسخ الرابط
            </Button>
          </div>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
دلوقتي تقدر تذاكر وتشتغل مع wiso يلا خلي صحابك يشتركو واكسب ارباحك 
          </p>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Users} label="دخلوا من الرابط" value={stats.data?.visits ?? 0} />
        <Stat icon={CheckCircle2} label="اشتراكات مدفوعة" value={stats.data?.paidSubscriptions ?? 0} />
        <Stat icon={WalletCards} label="إجمالي الأرباح" value={`${Number(stats.data?.totalRewards ?? 0).toFixed(2)} ج.م`} />
        <Stat icon={WalletCards} label="في المحفظة" value={`${Number(stats.data?.walletBalance ?? 0).toFixed(2)} ج.م`} />
      </div>
    </main>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <Icon className="size-5 text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
