import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { adminListCenterRequests, adminUpdateCenterRequest } from "@/lib/center-request.functions";

export const Route = createFileRoute("/_authenticated/admin/center-requests")({
  component: AdminCenterRequestsPage,
});

const statuses = [
  ["new", "جديد"],
  ["reviewing", "قيد المراجعة"],
  ["contacted", "تم التواصل"],
  ["approved", "مقبول"],
  ["rejected", "مرفوض"],
] as const;

function AdminCenterRequestsPage() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["admin-center-requests"],
    enabled: isAdmin,
    queryFn: () => adminListCenterRequests(),
  });

  const update = useMutation({
    mutationFn: (input: { requestId: string; status: (typeof statuses)[number][0]; adminNote?: string }) =>
      adminUpdateCenterRequest({ data: input }),
    onSuccess: () => {
      toast.success("تم تحديث الطلب.");
      void qc.invalidateQueries({ queryKey: ["admin-center-requests"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!isAdmin) return <Navigate to="/dashboard" />;

  return (
    <main dir="rtl" className="page-shell">
      <PageHeader title="طلبات السناتر" subtitle="مراجعة طلبات التعاون المقدمة من الطلاب والمستخدمين." />
      <div className="mt-7 space-y-4">
        {(query.data ?? []).map((item) => (
          <RequestCard key={item.id} item={item} disabled={update.isPending} onUpdate={(status, note) => update.mutate({ requestId: item.id, status, adminNote: note })} />
        ))}
        {!query.isPending && !query.data?.length ? (
          <p className="py-10 text-center text-sm text-muted-foreground">لا توجد طلبات حاليًا.</p>
        ) : null}
      </div>
    </main>
  );
}

function RequestCard({
  item,
  disabled,
  onUpdate,
}: {
  key?: string;
  item: {
    id: string;
    user_id: string | null;
    center_name: string;
    center_address: string;
    contact_number: string;
    status: string;
    admin_note: string | null;
    created_at: string;
  };
  disabled: boolean;
  onUpdate: (status: (typeof statuses)[number][0], note: string) => void;
}) {
  const statusLabel = statuses.find(([key]) => key === item.status)?.[1] ?? item.status;
  return (
    <div className="surface-panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display font-semibold"><Building2 className="size-4" />{item.center_name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{item.center_address}</p>
          <p className="mt-1 text-sm text-muted-foreground">التواصل: {item.contact_number}</p>
          <p className="mt-1 text-xs text-muted-foreground">المستخدم: {item.user_id ?? "—"} · {new Date(item.created_at).toLocaleString("ar-EG")}</p>
        </div>
        <Badge>{statusLabel}</Badge>
      </div>
      <div className="mt-4 space-y-3">
        <Textarea defaultValue={item.admin_note ?? ""} placeholder="ملاحظة للطالب..." id={`note-${item.id}`} />
        <div className="flex flex-wrap gap-2">
          {statuses.map(([key, label]) => (
            <Button
              key={key}
              size="sm"
              variant={item.status === key ? "default" : "outline"}
              disabled={disabled}
              onClick={() => {
                const note = (document.getElementById(`note-${item.id}`) as HTMLTextAreaElement | null)?.value ?? "";
                onUpdate(key, note);
              }}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
