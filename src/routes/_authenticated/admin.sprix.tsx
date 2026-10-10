import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { RefreshCw, ShieldCheck, Wallet, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { adminClaimAndRunNextSprixJob, adminGetSprixPaymentProofUrl, adminListSprixPayments, adminListSprixQuestions, adminListSprixRuns, adminReviewSprixPaymentRequest } from "@/lib/sprix-agent.functions";

export const Route = createFileRoute("/_authenticated/admin/sprix")({ component: AdminSprixPage });

function AdminSprixPage() {
  const client = useQueryClient();
  const [filter, setFilter] = useState<"pending" | "confirmed" | "rejected" | "all">("pending");
  const questions = useQuery({ queryKey: ["admin-sprix-questions"], queryFn: () => adminListSprixQuestions() });
  const runs = useQuery({ queryKey: ["admin-sprix-runs"], queryFn: () => adminListSprixRuns() });
  const payments = useQuery({ queryKey: ["admin-sprix-payments", filter], queryFn: () => adminListSprixPayments({ data: { status: filter } }) });
  const worker = useMutation({ mutationFn: () => adminClaimAndRunNextSprixJob(), onSuccess: () => { void client.invalidateQueries({ queryKey: ["admin-sprix-runs"] }); } });
  const review = useMutation({
    mutationFn: (input: { paymentId: string; approve: boolean }) => adminReviewSprixPaymentRequest({ data: input }),
    onSuccess: () => { toast.success("تم تحديث طلب الدفع"); void client.invalidateQueries({ queryKey: ["admin-sprix-payments"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const proof = useMutation({ mutationFn: (path: string) => adminGetSprixPaymentProofUrl({ data: { path } }), onSuccess: (data) => window.open(data.url, "_blank", "noopener,noreferrer") });

  const verified = (questions.data ?? []).filter((q) => q.verification_status === "verified").length;
  const unresolved = (questions.data ?? []).filter((q) => q.verification_status === "unresolved").length;
  const failed = (runs.data ?? []).filter((r) => r.status === "failed").length;

  return <main dir="rtl" className="page-shell"><PageHeader title="SPRIX Agent — الإدارة" subtitle="طلبات الدفع، بنك الإجابات والتنفيذات." />
    <div className="mt-7 grid gap-4 md:grid-cols-3"><Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">إجابات موثقة</p><p className="mt-2 text-3xl font-bold">{verified}</p></CardContent></Card><Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">أسئلة تحتاج مراجعة</p><p className="mt-2 text-3xl font-bold">{unresolved}</p></CardContent></Card><Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">تنفيذات فاشلة</p><p className="mt-2 text-3xl font-bold">{failed}</p></CardContent></Card></div>

    <Card className="mt-6"><CardHeader><CardTitle className="flex items-center gap-2"><Wallet className="size-5" /> طلبات الدفع الخاصة بـ SPRIX Agent</CardTitle></CardHeader><CardContent className="space-y-4">
      <div className="flex flex-wrap gap-2">{(["pending", "confirmed", "rejected", "all"] as const).map((value) => <Button key={value} variant={filter === value ? "default" : "outline"} size="sm" onClick={() => setFilter(value)}>{value === "pending" ? "قيد المراجعة" : value === "confirmed" ? "مقبولة" : value === "rejected" ? "مرفوضة" : "الكل"}</Button>)}</div>
      {(payments.data ?? []).length === 0 ? <p className="py-6 text-sm text-muted-foreground">لا توجد طلبات دفع في هذا التصنيف.</p> : (payments.data ?? []).map((item) => <div key={item.id} className="rounded-xl border p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">{item.amount_egp} ج.م · {item.method === "instapay" ? "إنستاباي" : "فودافون كاش"}</p><p className="mt-1 text-sm text-muted-foreground">رقم التحويل: {item.sender_number} · المستخدم: {item.user_id}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString("ar-EG")}</p></div><span className="rounded-full bg-muted px-3 py-1 text-xs">{item.status === "pending" ? "قيد المراجعة" : item.status === "confirmed" ? "مقبول" : "مرفوض"}</span></div><div className="mt-4 flex flex-wrap gap-2">{item.screenshot_path ? <Button variant="outline" size="sm" disabled={proof.isPending} onClick={() => proof.mutate(item.screenshot_path)}><ExternalLink className="size-4" /> فتح صورة التحويل</Button> : null}{item.status === "pending" ? <><Button size="sm" onClick={() => review.mutate({ paymentId: item.id, approve: true })} disabled={review.isPending}>اعتماد وتفعيل SPRIX</Button><Button size="sm" variant="destructive" onClick={() => review.mutate({ paymentId: item.id, approve: false })} disabled={review.isPending}>رفض</Button></> : null}</div></div>)}
    </CardContent></Card>

    <Card className="mt-6"><CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="size-5" /> العامل</CardTitle></CardHeader><CardContent><Button onClick={() => worker.mutate()} disabled={worker.isPending}><RefreshCw className="size-4" /> تشغيل مهمة واحدة</Button>{worker.data?.runId ? <p className="mt-3 text-sm text-muted-foreground">تم تشغيل: {worker.data.runId}</p> : null}</CardContent></Card>
  </main>;
}
