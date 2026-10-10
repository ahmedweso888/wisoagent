import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Building2 } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminCreateCenter, adminGenerateCenterCodes, adminGetCenterCodes, adminGetCenters, adminGetPlans } from "@/lib/admin.functions";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/admin/centers")({
  head: () => ({
    meta: [
      { title: "المراكز وأكواد التفعيل — لوحة الإدارة" },
      { name: "description", content: "إدارة مراكز WISO وتوليد أكواد التفعيل ومتابعة استخدامها." },
      { property: "og:title", content: "المراكز وأكواد التفعيل — لوحة الإدارة" },
      {
        property: "og:description",
        content: "إدارة مراكز WISO وتوليد أكواد التفعيل ومتابعة استخدامها.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminCentersPage,
});

function AdminCentersPage() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [centerName, setCenterName] = useState("");
  const [selectedCenter, setSelectedCenter] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [codeType, setCodeType] = useState<"question" | "sprix" | "qureo" | "sprix_qureo">("question");
  const [expiresAt, setExpiresAt] = useState("");
  const [sprixAccessDays, setSprixAccessDays] = useState("30");
  const [count, setCount] = useState("10");

  const centersQuery = useQuery({
    queryKey: ["admin", "centers"],
    enabled: isAdmin,
    queryFn: async () => {
      return adminGetCenters();
    },
  });

  const plansQuery = useQuery({
    queryKey: ["admin", "plans"],
    enabled: isAdmin,
    queryFn: async () => {
      return adminGetPlans();
    },
  });

  const codesQuery = useQuery({
    queryKey: ["admin", "center-codes", selectedCenter],
    enabled: isAdmin,
    queryFn: async () => {
      return adminGetCenterCodes({ data: selectedCenter ? { centerId: selectedCenter } : {} });
    },
  });

  const createCenter = useMutation({
    mutationFn: async (name: string) => {
      await adminCreateCenter({ data: { name } });
    },
    onSuccess: () => {
      toast.success("تم إنشاء المركز");
      setCenterName("");
      void qc.invalidateQueries({ queryKey: ["admin", "centers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const generate = useMutation({
    mutationFn: async (params: {
      center: string;
      count: number;
      codeType: "question" | "sprix" | "qureo" | "sprix_qureo";
      plan?: string | null;
      expiresAt?: string | null;
      sprixAccessDays?: number | null;
    }) => {
      return (await adminGenerateCenterCodes({ data: params })) as unknown as number;
    },
    onSuccess: (made) => {
      toast.success(`تم توليد ${made} كود`);
      void qc.invalidateQueries({ queryKey: ["admin", "center-codes"] });
    },
    onError: (e: Error) =>
      toast.error(e.message === "forbidden" ? "هذه العملية للمشرفين فقط" : e.message),
  });

  if (!isAdmin) return <Navigate to="/dashboard" />;

  const codes = codesQuery.data ?? [];
  const used = codes.filter((c) => c.used_by).length;
  const centerName_ = (id: string) => centersQuery.data?.find((c) => c.id === id)?.name ?? "—";

  const exportCsv = () => {
    const header = "code,type,center,plan,status,expires_at,used_by,used_at,created_at";
    const lines = codes.map((c) =>
      [
        c.code,
        c.code_type,
        centerName_(c.center_id),
        plansQuery.data?.find((p) => p.id === c.plan_id)?.name_ar ?? "",
        c.used_by ? "used" : new Date(c.expires_at ?? 0).getTime() <= Date.now() && c.expires_at ? "expired" : "available",
        c.expires_at ?? "",
        c.used_by_name ?? c.used_by ?? "",
        c.used_at ?? "",
        c.created_at,
      ].join(","),
    );
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wiso-center-codes.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main dir="rtl" className="page-shell">
      <PageHeader
        title="المراكز وأكواد التفعيل"
        subtitle="كل كود يُستخدم مرة واحدة فقط ويمنح الطالب الباقة المرتبطة به."
      />

      <section className="surface-panel mt-6 space-y-3 p-5">
        <h2 className="font-display text-base font-semibold">إضافة مركز</h2>
        <div className="flex flex-wrap gap-3">
          <Input
            value={centerName}
            onChange={(e) => setCenterName(e.target.value)}
            placeholder="اسم المركز"
            className="max-w-xs"
          />
          <Button
            disabled={!centerName.trim() || createCenter.isPending}
            onClick={() => createCenter.mutate(centerName)}
          >
            إنشاء
          </Button>
        </div>
      </section>

      <section className="surface-panel mt-5 space-y-4 p-5">
        <h2 className="font-display text-base font-semibold">توليد أكواد</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">نوع الكود</Label>
            <Select
              value={codeType}
              onValueChange={(v) => {
                const next = v as "question" | "sprix" | "qureo" | "sprix_qureo";
                setCodeType(next);
                if (next !== "question") setSelectedPlan("");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر نوع الكود" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="question">WISO Question — باقة أسئلة</SelectItem>
                <SelectItem value="sprix">WISO SPRIX — الثقافة المالية</SelectItem>
                <SelectItem value="qureo">WISO Qureo</SelectItem>
                <SelectItem value="sprix_qureo">WISO SPRIX + Qureo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">المركز</Label>
            <Select value={selectedCenter} onValueChange={setSelectedCenter}>
              <SelectTrigger>
                <SelectValue placeholder="اختر المركز" />
              </SelectTrigger>
              <SelectContent>
                {(centersQuery.data ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {codeType === "question" ? (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">الباقة</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الباقة" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {(plansQuery.data ?? []).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name_ar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">عدد الأكواد</Label>
            <Input value={count} inputMode="numeric" onChange={(e) => setCount(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">انتهاء الكود (اختياري)</Label>
            <Input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </div>
          {codeType !== "question" ? (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">صلاحية الأداة بالأيام</Label>
              <Input type="number" min={1} max={3650} value={sprixAccessDays} onChange={(e) => setSprixAccessDays(e.target.value)} />
            </div>
          ) : null}
        </div>
        <Button
          disabled={!selectedCenter || (codeType === "question" && !selectedPlan) || generate.isPending}
          onClick={() =>
            generate.mutate({
              center: selectedCenter,
              plan: codeType === "question" ? selectedPlan : null,
              count: Number(count) || 0,
              codeType,
              expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
              sprixAccessDays: codeType !== "question" ? Number(sprixAccessDays) || 30 : null,
            })
          }
        >
          توليد الأكواد
        </Button>
      </section>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {codesQuery.isPending
            ? "جارٍ تحميل الأكواد..."
            : `${codes.length} كود · ${used} مستخدم · ${codes.length - used} متاح`}
        </p>
        <Button variant="outline" size="sm" disabled={!codes.length} onClick={exportCsv}>
          تصدير CSV
        </Button>
      </div>

      <div className="mt-4 space-y-2">
        {codesQuery.isPending ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
        ) : codesQuery.isError ? (
          <p className="text-sm text-destructive">تعذّر تحميل الأكواد.</p>
        ) : !codes.length ? (
          <EmptyState
            icon={Building2}
            title="لا توجد أكواد"
            description="اختر مركزاً وباقة ثم ولّد الأكواد."
          />
        ) : (
          codes.map((code) => (
            <div
              key={code.id}
              className="surface-panel flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div>
                <code className="font-mono text-sm">{code.code}</code>
                <p className="mt-1 text-xs text-muted-foreground">
                  {code.code_type === "sprix"
                    ? "SPRIX — الثقافة المالية"
                    : code.code_type === "qureo"
                      ? "Qureo"
                      : code.code_type === "sprix_qureo"
                        ? "SPRIX + Qureo"
                        : "Question"} · {centerName_(code.center_id)}
                  {code.expires_at ? ` · ينتهي ${new Date(code.expires_at).toLocaleString("ar-EG")}` : ""}
                </p>
              </div>
              {code.used_by ? (
                <span className="text-xs text-muted-foreground">
                  {code.used_by_name || "طالب"}{code.used_by_user_code ? ` · #${code.used_by_user_code}` : ""}
                </span>
              ) : null}
              <Badge variant={code.used_by ? "secondary" : (code.expires_at && new Date(code.expires_at).getTime() <= Date.now() ? "destructive" : "default")}>
                {code.used_by
                  ? `مستخدم${code.used_at ? " · " + new Date(code.used_at).toLocaleDateString("ar-EG") : ""}`
                  : code.expires_at && new Date(code.expires_at).getTime() <= Date.now()
                    ? "منتهي"
                    : "متاح"}
              </Badge>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
