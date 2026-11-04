import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CheckCircle2, ClipboardList, Clock3, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import {
  adminGetToolCodeRequests,
  adminResolveToolCodeRequest,
} from "@/lib/wiso-tools.functions";

export const Route = createFileRoute("/_authenticated/admin/code-requests")({
  head: () => ({
    meta: [
      { title: "طلبات أكواد الأدوات — لوحة الإدارة" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminToolCodeRequestsPage,
});

type CodeRequest = {
  id: string;
  student_name: string | null;
  student_phone: string | null;
  account_id: string;
  account_password: string;
  tool_code_type: string | null;
  status: "pending" | "resolved";
  created_at: string;
  resolved_at: string | null;
};

function AdminToolCodeRequestsPage() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<"pending" | "resolved">("pending");

  const requests = useQuery({
    queryKey: ["admin", "tool-code-requests"],
    enabled: isAdmin,
    queryFn: async () => (await adminGetToolCodeRequests()) as CodeRequest[],
  });

  const resolve = useMutation({
    mutationFn: (requestId: string) =>
      adminResolveToolCodeRequest({ data: { requestId } }),
    onSuccess: async () => {
      toast.success("تم نقل الطلب إلى قائمة المحلولين.");
      await qc.invalidateQueries({ queryKey: ["admin", "tool-code-requests"] });
      setActiveTab("resolved");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!isAdmin) return <Navigate to="/dashboard" />;

  const all = requests.data ?? [];
  const pending = all.filter((item) => item.status === "pending");
  const resolved = all.filter((item) => item.status === "resolved");
  const currentRequests = activeTab === "pending" ? pending : resolved;

  const codeTypeLabel = (type: string | null) => {
    switch (type) {
      case "sprix": return "SPRIX — الثقافة المالية";
      case "qureo": return "Qureo — البرمجة";
      case "sprix_qureo": return "SPRIX + Qureo — الثقافة المالية والبرمجة";
      default: return "نوع غير معروف";
    }
  };

  const renderRequest = (item: CodeRequest) => (
    <div
      key={item.id}
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
    >
      <div className="min-w-0 flex-1 space-y-2">
        <div>
          <p className="font-bold">{item.student_name || "طالب"}</p>
          <p dir="ltr" className="mt-1 text-right text-sm text-muted-foreground">
            {item.student_phone || "لا يوجد رقم هاتف"}
          </p>
        </div>
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
          <p className="text-xs text-muted-foreground">الكود متفعل لـ</p>
          <p className="mt-1 font-semibold">{codeTypeLabel(item.tool_code_type)}</p>
        </div>
        <div className="grid gap-2 rounded-lg bg-muted/50 p-3 text-sm sm:grid-cols-2">
          <div className="min-w-0">
            <p className="mb-1 text-xs text-muted-foreground">Account ID</p>
            <p dir="ltr" className="break-all font-mono">{item.account_id}</p>
          </div>
          <div className="min-w-0">
            <p className="mb-1 text-xs text-muted-foreground">Password</p>
            <div className="flex items-center gap-2" dir="ltr">
              <span className="min-w-0 break-all font-mono">
                {visiblePasswords[item.id] ? item.account_password : "••••••••••••"}
              </span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8 shrink-0"
                aria-label={visiblePasswords[item.id] ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                onClick={() => setVisiblePasswords((current) => ({
                  ...current,
                  [item.id]: !current[item.id],
                }))}
              >
                {visiblePasswords[item.id] ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {activeTab === "pending" ? (
        <Button
          size="sm"
          disabled={resolve.isPending}
          onClick={() => resolve.mutate(item.id)}
        >
          <CheckCircle2 className="ml-2 size-4" />
          تم الحل
        </Button>
      ) : (
        <Badge variant="secondary" className="gap-1">
          <CheckCircle2 className="size-3.5" />
          تم الحل
        </Badge>
      )}
    </div>
  );

  return (
    <main dir="rtl" className="page-shell">
      <PageHeader
        title="طلبات أكواد الأدوات"
        subtitle="طلبات الطلاب المرسلة باستخدام أكواد SPRIX وQureo."
      />

      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          variant={activeTab === "pending" ? "default" : "outline"}
          onClick={() => setActiveTab("pending")}
          className="gap-2"
        >
          <Clock3 className="size-4" />
          الطلبات الجديدة
          <Badge variant={activeTab === "pending" ? "secondary" : "outline"}>{pending.length}</Badge>
        </Button>
        <Button
          variant={activeTab === "resolved" ? "default" : "outline"}
          onClick={() => setActiveTab("resolved")}
          className="gap-2"
        >
          <ClipboardList className="size-4" />
          الطلبات المحلولة
          <Badge variant={activeTab === "resolved" ? "secondary" : "outline"}>{resolved.length}</Badge>
        </Button>
      </div>

      {requests.isPending ? (
        <p className="mt-6 text-sm text-muted-foreground">جارٍ تحميل الطلبات...</p>
      ) : requests.isError ? (
        <div className="mt-6 space-y-3">
          <p className="text-sm text-destructive">تعذّر تحميل الطلبات.</p>
          <Button variant="outline" onClick={() => void requests.refetch()}>
            إعادة المحاولة
          </Button>
        </div>
      ) : (
        <Card className="mt-5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {activeTab === "pending" ? (
                <><Clock3 className="size-5 text-amber-500" /> الطلبات الجديدة</>
              ) : (
                <><ClipboardList className="size-5 text-emerald-600" /> الطلبات المحلولة</>
              )}
              <Badge variant="secondary">{currentRequests.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentRequests.length ? (
              currentRequests.map(renderRequest)
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                {activeTab === "pending" ? "لا توجد طلبات جديدة." : "لا توجد طلبات محلولة حتى الآن."}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </main>
  );
}
