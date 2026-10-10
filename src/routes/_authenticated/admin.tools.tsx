import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CheckCircle2, ExternalLink, KeyRound, Wrench } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  adminListToolAccounts,
  adminCompleteToolAccount,
  adminRevealToolCredentials,
  adminGetToolOrders,
  adminGetToolPaymentProofUrl,
  adminReviewToolOrderRequest,
} from "@/lib/wiso-tools.functions";
import { getToolCatalogFn } from "@/lib/wiso-tools.functions";

export const Route = createFileRoute("/_authenticated/admin/tools")({ component: AdminToolsPage });

function AdminToolsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"pending" | "confirmed" | "rejected" | "all">("pending");
  const orders = useQuery({ queryKey: ["admin-tool-orders", filter], queryFn: () => adminGetToolOrders({ data: { status: filter } }) });
  const accounts = useQuery({ queryKey: ["admin-tool-accounts"], queryFn: () => adminListToolAccounts() });
  const [revealed, setRevealed] = useState<Record<string, { id: string; password: string }>>({});
  const reveal = useMutation({
    mutationFn: (accountId: string) => adminRevealToolCredentials({ data: { accountId } }),
    onSuccess: (data, accountId) => setRevealed((current) => ({ ...current, [accountId]: data })),
    onError: (error: Error) => toast.error(error.message),
  });
  const catalog = useQuery({ queryKey: ["wiso-tools-catalog"], queryFn: () => getToolCatalogFn() });
  const completeAccount = useMutation({
    mutationFn: (accountId: string) => adminCompleteToolAccount({ data: { accountId } }),
    onSuccess: async () => {
      toast.success("تم إكمال الطلب وإرسال إشعار للطالب، وتمت إزالته من قائمة الأدمن.");
      setRevealed({});
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["admin-tool-accounts"] }),
        qc.invalidateQueries({ queryKey: ["notifications"] }),
      ]);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const review = useMutation({
    mutationFn: (input: { orderId: string; approve: boolean; reason?: string }) => adminReviewToolOrderRequest({ data: input }),
    onSuccess: async () => {
      toast.success("تم تحديث طلب الأداة.");
      await qc.invalidateQueries({ queryKey: ["admin-tool-orders"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const proof = useMutation({
    mutationFn: (path: string) => adminGetToolPaymentProofUrl({ data: { path } }),
    onSuccess: (data) => window.open(data.url, "_blank", "noopener,noreferrer"),
    onError: (error: Error) => toast.error(error.message),
  });

  const productName = (key: string) => catalog.data?.products.find((item) => item.key === key)?.name ?? key;

  return (
    <main dir="rtl" className="page-shell">
      <PageHeader title="أدوات WISO — الإدارة" subtitle="طلبات الدفع وبيانات حسابات الأدوات التي أرسلها الطلاب للتشغيل المحلي." />

      <section className="mt-7 grid gap-4 md:grid-cols-2">
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">طلبات قيد المراجعة</p><p className="mt-2 text-3xl font-bold">{(orders.data ?? []).filter((item) => item.status === "pending").length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">حسابات الأدوات المستلمة</p><p className="mt-2 text-3xl font-bold">{(accounts.data ?? []).length}</p></CardContent></Card>
      </section>

      <Card className="mt-6">
        <CardHeader><CardTitle className="flex items-center gap-2"><Wrench className="size-5" /> طلبات أدوات WISO</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(["pending","confirmed","rejected","all"] as const).map((value) => (
              <Button key={value} size="sm" variant={filter === value ? "default" : "outline"} onClick={() => setFilter(value)}>
                {value === "pending" ? "قيد المراجعة" : value === "confirmed" ? "مقبولة" : value === "rejected" ? "مرفوضة" : "الكل"}
              </Button>
            ))}
          </div>
          {(orders.data ?? []).map((item) => (
            <div key={item.id} className="rounded-2xl border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{productName(item.product_key)} · {item.amount_egp} ج.م</p>
                  <p className="mt-1 text-sm text-muted-foreground">الطالب: {item.user_id}</p>
                  <p className="mt-1 text-sm text-muted-foreground">الطريقة: {item.method} · الرقم: {item.sender_number}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString("ar-EG")}</p>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs">{item.status === "pending" ? "قيد المراجعة" : item.status === "confirmed" ? "مقبول" : "مرفوض"}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.screenshot_path ? <Button variant="outline" size="sm" onClick={() => proof.mutate(item.screenshot_path)}><ExternalLink className="size-4" /> فتح Screenshot</Button> : null}
                {item.status === "pending" ? (
                  <>
                    <Button size="sm" onClick={() => review.mutate({ orderId: item.id, approve: true })} disabled={review.isPending}>Approve + تفعيل</Button>
                    <Button size="sm" variant="destructive" onClick={() => {
                      const reason = window.prompt("سبب الرفض (اختياري):");
                      review.mutate({
                        orderId: item.id,
                        approve: false,
                        ...(reason ? { reason } : {}),
                      });
                    }} disabled={review.isPending}>Reject</Button>
                  </>
                ) : null}
              </div>
            </div>
          ))}
          {!orders.data?.length ? <p className="py-6 text-sm text-muted-foreground">لا توجد طلبات في هذا التصنيف.</p> : null}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader><CardTitle className="flex items-center gap-2"><KeyRound className="size-5" /> حسابات الأدوات للتشغيل المحلي</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {(accounts.data ?? []).map((account) => {
            const credentials = revealed[account.id];
            return <div key={account.id} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{account.tool_key === "qureo" ? "Qureo" : "SPRIX / الثقافة المالية"}</p>
                  <p className="text-xs text-muted-foreground">User ID: {account.user_id}</p>
                  <p className="text-xs text-muted-foreground">آخر تحديث: {new Date(account.updated_at).toLocaleString("ar-EG")}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" disabled={reveal.isPending || completeAccount.isPending} onClick={() => reveal.mutate(account.id)}>{credentials ? "تحديث عرض البيانات" : "عرض بيانات الدخول"}</Button>
                  <Button size="sm" disabled={completeAccount.isPending} onClick={() => {
                    const label = account.tool_key === "qureo" ? "Qureo" : "SPRIX / الثقافة المالية";
                    if (window.confirm(`تأكيد إكمال طلب ${label}؟ سيتم إرسال إشعار للطالب وإخفاء الطلب من قائمة الأدمن.`)) completeAccount.mutate(account.id);
                  }}><CheckCircle2 className="size-4" /> تم الحل</Button>
                </div>
              </div>
              {credentials ? <div className="mt-3 space-y-2 rounded-lg bg-muted p-3 text-sm">
                <p dir="ltr">ID: <span className="select-all">{credentials.id}</span></p>
                <p dir="ltr">Password: <span className="select-all">{credentials.password}</span></p>
                <div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(credentials.id)}>نسخ ID</Button><Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(credentials.password)}>نسخ Password</Button><Button size="sm" variant="ghost" onClick={() => setRevealed((current) => { const next = { ...current }; delete next[account.id]; return next; })}>إخفاء</Button></div>
              </div> : null}
            </div>;
          })}
          {!accounts.data?.length ? <p className="py-6 text-sm text-muted-foreground">لا توجد حسابات أدوات مستلمة حتى الآن.</p> : null}
        </CardContent>
      </Card>
    </main>
  );
}
