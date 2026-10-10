import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminGetSpecialRequests, adminReviewSpecialRequest } from "@/lib/admin.functions";
import { useAuth } from "@/hooks/useAuth";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { FileClock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/requests")({
  head: () => ({
    meta: [
      { title: "الطلبات الخاصة — إدارة WISO" },
      { name: "description", content: "مراجعة طلبات الطلاب الخاصة." },
      { property: "og:title", content: "الطلبات الخاصة — إدارة WISO" },
      { property: "og:description", content: "مراجعة طلبات الطلاب الخاصة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminRequestsPage,
});

function AdminRequestsPage() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [note, setNote] = useState<Record<string, string>>({});
  const [price, setPrice] = useState<Record<string, string>>({});
  const requests = useQuery({
    queryKey: ["admin-special-requests"],
    enabled: isAdmin,
    queryFn: async () => {
      return adminGetSpecialRequests();
    },
  });
  const review = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await adminReviewSpecialRequest({ data: { request: id, status, ...(price[id] ? { priceEgp: Number(price[id]) } : {}), ...(note[id] ? { adminNote: note[id] as string } : {}) } });
    },
    onSuccess: () => {
      toast.success("تم تحديث الطلب وإبلاغ الطالب.");
      void qc.invalidateQueries({ queryKey: ["admin-special-requests"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  if (!isAdmin) return <Navigate to="/dashboard" />;
  return (
    <main dir="rtl" className="page-shell">
      <PageHeader
        title="الطلبات الخاصة"
        subtitle="مراجعة وقبول أو رفض الطلبات المرفقة بملفات خاصة."
      />
      <div className="mt-7 space-y-4">
        {requests.isPending ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-44 w-full" />
          ))
        ) : requests.isError ? (
          <p className="text-sm text-destructive">تعذّر تحميل الطلبات.</p>
        ) : requests.data?.length ? (
          requests.data.map((item) => (
            <Card key={item.id}>
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold">{item.title}</h2>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                      {item.details}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      <Badge
                        variant={
                          item.status === "rejected"
                            ? "destructive"
                            : item.status === "pending"
                              ? "secondary"
                              : "default"
                        }
                      >
                        {item.status === "pending"
                          ? "قيد المراجعة"
                          : item.status === "accepted"
                            ? "مقبول"
                            : item.status === "completed"
                              ? "مكتمل"
                              : "مرفوض"}
                      </Badge>{" "}
                      · {new Date(item.created_at).toLocaleString("ar-EG")}
                    </p>
                  </div>
                  {item.file_path ? (
                    <span className="text-xs text-primary">يوجد ملف مرفق</span>
                  ) : null}
                </div>
                <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
                  <div>
                    <Label>ملاحظة للطالب</Label>
                    <Textarea
                      className="mt-2"
                      value={note[item.id] ?? item.admin_note ?? ""}
                      onChange={(e) => setNote((v) => ({ ...v, [item.id]: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>السعر (اختياري)</Label>
                    <Input
                      className="mt-2"
                      type="number"
                      min="0"
                      value={price[item.id] ?? item.price_egp ?? ""}
                      onChange={(e) => setPrice((v) => ({ ...v, [item.id]: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={review.isPending}
                    onClick={() => review.mutate({ id: item.id, status: "accepted" })}
                  >
                    قبول
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={review.isPending}
                    onClick={() => review.mutate({ id: item.id, status: "completed" })}
                  >
                    تم التنفيذ
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={review.isPending}
                    onClick={() => review.mutate({ id: item.id, status: "rejected" })}
                  >
                    رفض
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <EmptyState
            icon={FileClock}
            title="مفيش طلبات حالياً"
            description="الطلبات الجديدة هتظهر هنا أول ما الطلاب يبعتوها."
          />
        )}
      </div>
    </main>
  );
}
