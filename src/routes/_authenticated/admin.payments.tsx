import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Wallet, ExternalLink } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminGetPaymentProofUrl, adminGetPayments, adminReviewPayment } from "@/lib/admin.functions";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/admin/payments")({
  head: () => ({
    meta: [
      { title: "طلبات الدفع — لوحة الإدارة" },
      { name: "description", content: "مراجعة طلبات الدفع وقبولها أو رفضها." },
      { property: "og:title", content: "طلبات الدفع — لوحة الإدارة" },
      { property: "og:description", content: "مراجعة طلبات الدفع وقبولها أو رفضها." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPaymentsPage,
});

const STATUS_LABEL: Record<string, string> = {
  pending: "قيد المراجعة",
  confirmed: "مقبول",
  rejected: "مرفوض",
};

const METHOD_LABEL: Record<string, string> = {
  vodafone_cash: "فودافون كاش",
  instapay: "إنستاباي",
};

function AdminPaymentsPage() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"pending" | "confirmed" | "rejected" | "all">("pending");
  const [reasons, setReasons] = useState<Record<string, string>>({});

  const query = useQuery({
    queryKey: ["admin", "payment-requests", filter],
    enabled: isAdmin,
    queryFn: async () => {
      return adminGetPayments({ data: { status: filter } });
    },
  });

  const review = useMutation({
    mutationFn: async (params: { id: string; approve: boolean; reason?: string | undefined }) => {
      await adminReviewPayment({ data: { request: params.id, approve: params.approve, ...(params.reason === undefined ? {} : { reason: params.reason }) } });
    },
    onSuccess: (_data, vars) => {
      toast.success(vars.approve ? "تم قبول الطلب" : "تم رفض الطلب");
      void qc.invalidateQueries({ queryKey: ["admin", "payment-requests"] });
    },
    onError: (e: Error) =>
      toast.error(e.message === "forbidden" ? "هذه العملية للمشرفين فقط" : e.message),
  });

  if (!isAdmin) return <Navigate to="/dashboard" />;

  return (
    <main dir="rtl" className="page-shell">
      <PageHeader title="طلبات الدفع" subtitle="مراجعة إثباتات التحويل وقبول أو رفض طلبات الدفع." />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="mt-6">
        <TabsList>
          <TabsTrigger value="pending">قيد المراجعة</TabsTrigger>
          <TabsTrigger value="confirmed">مقبولة</TabsTrigger>
          <TabsTrigger value="rejected">مرفوضة</TabsTrigger>
          <TabsTrigger value="all">الكل</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-6 space-y-4">
        {query.isPending ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
        ) : query.isError ? (
          <p className="text-sm text-destructive">
            {query.error instanceof Error && query.error.message === "forbidden"
              ? "هذه الصفحة متاحة للمشرفين فقط."
              : "تعذّر تحميل طلبات الدفع."}
          </p>
        ) : !query.data || query.data.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="لا توجد طلبات دفع"
            description="لا توجد طلبات في هذا التصنيف حالياً."
          />
        ) : (
          query.data.map((item) => {
            const plan = item.subscription_plans as { name_ar?: string; price_egp?: number } | null;
            return (
              <div key={item.id} className="surface-panel space-y-3 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {plan?.name_ar ?? "باقة غير محددة"} — {item.amount_egp} ج.م
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      طريقة الدفع: {METHOD_LABEL[item.method] ?? item.method} ·{" "}
                      {new Date(item.created_at).toLocaleString("ar-EG")}
                    </p>
                  </div>
                  <Badge
                    variant={
                      item.status === "confirmed"
                        ? "default"
                        : item.status === "rejected"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {STATUS_LABEL[item.status] ?? item.status}
                  </Badge>
                </div>

                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  <p>
                    <span className="text-muted-foreground">رقم العملية: </span>
                    {item.transaction_number || "—"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">رقم المُرسِل: </span>
                    {item.sender_number || "—"}
                  </p>
                </div>

                {item.screenshot_path ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    onClick={async () => {
                      try {
                        if (!item.screenshot_path) {
  toast.error("لا توجد صورة إثبات دفع");
  return;
}

const url = await adminGetPaymentProofUrl({
  data: { path: item.screenshot_path },
});
                        window.open(url, "_blank", "noopener,noreferrer");
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "تعذر فتح الإثبات");
                      }
                    }}
                  >
                    عرض إثبات التحويل
                    <ExternalLink className="size-3.5" />
                  </button>
                ) : null}

                {item.status === "rejected" && item.reject_reason ? (
                  <p className="text-xs text-destructive">سبب الرفض: {item.reject_reason}</p>
                ) : null}

                {item.status === "pending" ? (
                  <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                    <Button
                      size="sm"
                      disabled={review.isPending}
                      onClick={() => review.mutate({ id: item.id, approve: true })}
                    >
                      قبول
                    </Button>
                    <Input
                      value={reasons[item.id] ?? ""}
                      onChange={(e) => setReasons((v) => ({ ...v, [item.id]: e.target.value }))}
                      placeholder="سبب الرفض (مطلوب)"
                      className="w-64"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={review.isPending || !reasons[item.id]?.trim()}
                      onClick={() =>
                        review.mutate({
                          id: item.id,
                          approve: false,
                          reason: reasons[item.id]?.trim(),
                        })
                      }
                    >
                      رفض
                    </Button>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
