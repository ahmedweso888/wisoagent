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
import {
  adminCreateCenter,
  adminGenerateCenterCodes,
  adminGetCenterCodes,
  adminGetCenters,
  adminGetPlans,
} from "@/lib/admin.functions";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/admin/centers")({
  head: () => ({
    meta: [
      { title: "المراكز وأكواد التفعيل — لوحة الإدارة" },
      {
        name: "description",
        content: "إدارة مراكز WISO وتوليد أكواد التفعيل ومتابعة استخدامها.",
      },
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

type CodeFilter =
  | "all"
  | "question"
  | "sprix"
  | "qureo"
  | "sprix_qureo";

function AdminCentersPage() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();

  const [centerName, setCenterName] = useState("");
  const [selectedCenter, setSelectedCenter] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [codeType, setCodeType] = useState<
    "question" | "sprix" | "qureo" | "sprix_qureo"
  >("question");
  const [expiresAt, setExpiresAt] = useState("");
  const [sprixAccessDays, setSprixAccessDays] = useState("30");
  const [count, setCount] = useState("10");

  // فلتر الأكواد
  const [codeFilter, setCodeFilter] = useState<CodeFilter>("all");

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
      return adminGetCenterCodes({
        data: selectedCenter ? { centerId: selectedCenter } : {},
      });
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
      return (await adminGenerateCenterCodes({
        data: params,
      })) as unknown as number;
    },
    onSuccess: (made) => {
      toast.success(`تم توليد ${made} كود`);
      void qc.invalidateQueries({ queryKey: ["admin", "center-codes"] });
    },
    onError: (e: Error) =>
      toast.error(
        e.message === "forbidden"
          ? "هذه العملية للمشرفين فقط"
          : e.message,
      ),
  });

  if (!isAdmin) return <Navigate to="/dashboard" />;

  const codes = codesQuery.data ?? [];

  const centerName_ = (id: string) =>
    centersQuery.data?.find((c) => c.id === id)?.name ?? "—";

  // أسماء أنواع الأكواد
  const codeTypeLabel = (type: CodeFilter) => {
    switch (type) {
      case "question":
        return "أكواد الأسئلة";
      case "sprix":
        return "الثقافة المالية";
      case "qureo":
        return "البرمجة";
      case "sprix_qureo":
        return "الثقافة المالية والبرمجة";
      default:
        return "جميع أنواع الأكواد";
    }
  };

  // تطبيق الفلتر
  const filteredCodes = codes.filter(
    (code) =>
      codeFilter === "all" || code.code_type === codeFilter,
  );

  const used = filteredCodes.filter((c) => c.used_by).length;
  const available = filteredCodes.length - used;

  // ==========================================
  // PDF EXPORT
  // ==========================================

  const exportPdf = () => {
    if (!filteredCodes.length) {
      toast.error("لا توجد أكواد من النوع المحدد لتصديرها");
      return;
    }

    const escapeHtml = (value: string) =>
      value.replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char] ?? char);

    const rows = filteredCodes
      .map(
        (code, index) => `
        <tr>
          <td>${index + 1}</td>
          <td class="code">${escapeHtml(String(code.code ?? ""))}</td>
          <td>${escapeHtml(centerName_(code.center_id))}</td>
        </tr>
      `,
      )
      .join("");

    const selectedCenterName = selectedCenter
      ? centerName_(selectedCenter)
      : "جميع المراكز";

    const selectedTypeName = codeTypeLabel(codeFilter);

    const printWindow = window.open("", "_blank", "width=1000,height=800");

    if (!printWindow) {
      toast.error("اسمح بفتح النوافذ المنبثقة لتنزيل ملف PDF");
      return;
    }

    printWindow.document.open();

    printWindow.document.write(`<!doctype html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8" />
          <title>${escapeHtml(selectedTypeName)} - WISO Agent</title>

          <style>
            @page {
              size: A4;
              margin: 14mm;
            }

            * {
              box-sizing: border-box;
            }

            body {
              font-family: Arial, Tahoma, sans-serif;
              color: #172033;
              direction: rtl;
              margin: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .header {
              text-align: center;
              border-bottom: 2px solid #243b64;
              padding-bottom: 14px;
              margin-bottom: 20px;
            }

            .brand {
              display: flex;
              justify-content: center;
              align-items: center;
              gap: 12px;
              flex-wrap: wrap;
              margin-bottom: 8px;
            }

            h1 {
              margin: 0;
              font-size: 25px;
              color: #243b64;
            }

            .type-badge {
              background: #e8eef9;
              color: #243b64;
              padding: 7px 14px;
              border-radius: 20px;
              font-size: 13px;
              font-weight: bold;
            }

            .subtitle {
              margin: 0;
              color: #5b6475;
              font-size: 13px;
            }

            .info {
              display: flex;
              justify-content: space-between;
              flex-wrap: wrap;
              gap: 12px;
              margin-bottom: 14px;
              font-size: 12px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            th, td {
              border: 1px solid #cbd3df;
              padding: 10px 8px;
              text-align: center;
              font-size: 12px;
            }

            th {
              background: #243b64;
              color: white;
              font-weight: 700;
            }

            tbody tr:nth-child(even) {
              background: #f2f5fa;
            }

            td.code {
              direction: ltr;
              text-align: center;
              font-family: Consolas, monospace;
              font-weight: 700;
              letter-spacing: .4px;
            }

            .footer {
              margin-top: 18px;
              text-align: center;
              color: #687386;
              font-size: 10px;
            }

            @media screen {
              body {
                padding: 24px;
              }
            }
          </style>
        </head>

        <body>
          <div class="header">

            <div class="brand">
              <h1>WISO Agent</h1>

              <span class="type-badge">
                ${escapeHtml(selectedTypeName)}
              </span>
            </div>

            <p class="subtitle">
              كشف أكواد التفعيل
            </p>

          </div>

          <div class="info">
            <span>المركز: ${escapeHtml(selectedCenterName)}</span>

            <span>نوع الأكواد: ${escapeHtml(selectedTypeName)}</span>

            <span>عدد الأكواد: ${filteredCodes.length}</span>

            <span>تاريخ التصدير: ${new Date().toLocaleDateString("ar-EG")}</span>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 12%">م</th>
                <th style="width: 44%">كود التفعيل</th>
                <th style="width: 44%">اسم السنتر</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
          </table>

          <div class="footer">
            WISO Agent — ${escapeHtml(selectedTypeName)}
          </div>

          <script>
            window.onload = () => {
              window.focus();
              window.print();
            };
          </script>

        </body>
      </html>`);

    printWindow.document.close();
  };

  // ==========================================
  // CSV EXPORT
  // ==========================================

  const exportCsv = () => {
    if (!filteredCodes.length) {
      toast.error("لا توجد أكواد لتصديرها");
      return;
    }

    const escapeCsv = (value: unknown) => {
      const text = String(value ?? "");
      return `"${text.replace(/"/g, '""')}"`;
    };

    const header =
      "code,type,center,plan,status,expires_at,used_by,used_at,created_at";

    const lines = filteredCodes.map((c) =>
      [
        c.code,
        c.code_type,
        centerName_(c.center_id),
        plansQuery.data?.find((p) => p.id === c.plan_id)?.name_ar ?? "",
        c.used_by
          ? "used"
          : new Date(c.expires_at ?? 0).getTime() <= Date.now() &&
              c.expires_at
            ? "expired"
            : "available",
        c.expires_at ?? "",
        c.used_by_name ?? c.used_by ?? "",
        c.used_at ?? "",
        c.created_at,
      ]
        .map(escapeCsv)
        .join(","),
    );

    const blob = new Blob(
      [["\uFEFF", header, ...lines].join("\n")],
      { type: "text/csv;charset=utf-8" },
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `wiso-${codeFilter}-codes.csv`;
    a.click();

    URL.revokeObjectURL(url);
  };

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main dir="rtl" className="page-shell">
      <PageHeader
        title="المراكز وأكواد التفعيل"
        subtitle="كل كود يُستخدم مرة واحدة فقط ويمنح الطالب الباقة المرتبطة به."
      />

      {/* إضافة مركز */}

      <section className="surface-panel mt-6 space-y-3 p-5">
        <h2 className="font-display text-base font-semibold">
          إضافة مركز
        </h2>

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

      {/* توليد الأكواد */}

      <section className="surface-panel mt-5 space-y-4 p-5">
        <h2 className="font-display text-base font-semibold">
          توليد أكواد
        </h2>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              نوع الكود
            </Label>

            <Select
              value={codeType}
              onValueChange={(v) => {
                const next = v as
                  | "question"
                  | "sprix"
                  | "qureo"
                  | "sprix_qureo";

                setCodeType(next);

                if (next !== "question") setSelectedPlan("");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر نوع الكود" />
              </SelectTrigger>

              <SelectContent dir="rtl">
                <SelectItem value="question">
                  WISO Question — باقة أسئلة
                </SelectItem>

                <SelectItem value="sprix">
                  WISO SPRIX — الثقافة المالية
                </SelectItem>

                <SelectItem value="qureo">
                  WISO Qureo — البرمجة
                </SelectItem>

                <SelectItem value="sprix_qureo">
                  WISO SPRIX + Qureo
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              المركز
            </Label>

            <Select
              value={selectedCenter}
              onValueChange={setSelectedCenter}
            >
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
              <Label className="text-xs text-muted-foreground">
                الباقة
              </Label>

              <Select
                value={selectedPlan}
                onValueChange={setSelectedPlan}
              >
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
            <Label className="text-xs text-muted-foreground">
              عدد الأكواد
            </Label>

            <Input
              value={count}
              inputMode="numeric"
              onChange={(e) => setCount(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              انتهاء الكود (اختياري)
            </Label>

            <Input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>

          {codeType !== "question" ? (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                صلاحية الأداة بالأيام
              </Label>

              <Input
                type="number"
                min={1}
                max={3650}
                value={sprixAccessDays}
                onChange={(e) => setSprixAccessDays(e.target.value)}
              />
            </div>
          ) : null}
        </div>

        <Button
          disabled={
            !selectedCenter ||
            (codeType === "question" && !selectedPlan) ||
            generate.isPending
          }
          onClick={() =>
            generate.mutate({
              center: selectedCenter,
              plan: codeType === "question" ? selectedPlan : null,
              count: Number(count) || 0,
              codeType,
              expiresAt: expiresAt
                ? new Date(expiresAt).toISOString()
                : null,
              sprixAccessDays:
                codeType !== "question"
                  ? Number(sprixAccessDays) || 30
                  : null,
            })
          }
        >
          توليد الأكواد
        </Button>
      </section>

      {/* قائمة الأكواد */}

      <div className="mt-8 space-y-4">
        <div>
          <h2 className="font-display text-base font-semibold">
            أكواد التفعيل
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            اختر نوع الأكواد التي تريد عرضها أو تصديرها.
          </p>
        </div>

        {/* الفلاتر */}

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "كل الأكواد"],
              ["question", "أكواد الأسئلة"],
              ["sprix", "الثقافة المالية"],
              ["qureo", "البرمجة"],
              ["sprix_qureo", "الثقافة والبرمجة"],
            ] as const
          ).map(([value, label]) => {
            const filterCount =
              value === "all"
                ? codes.length
                : codes.filter((c) => c.code_type === value).length;

            return (
              <Button
                key={value}
                size="sm"
                variant={codeFilter === value ? "default" : "outline"}
                onClick={() => setCodeFilter(value)}
                className="gap-2"
              >
                {label}

                <Badge
                  variant={
                    codeFilter === value ? "secondary" : "outline"
                  }
                >
                  {filterCount}
                </Badge>
              </Button>
            );
          })}
        </div>

        {/* الإحصائيات والتصدير */}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold">
              {codeTypeLabel(codeFilter)}
            </p>

            <p className="text-sm text-muted-foreground">
              {codesQuery.isPending
                ? "جارٍ تحميل الأكواد..."
                : `${filteredCodes.length} كود · ${used} مستخدم · ${available} متاح`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="default"
              size="sm"
              disabled={!filteredCodes.length}
              onClick={exportPdf}
            >
              تنزيل PDF
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={!filteredCodes.length}
              onClick={exportCsv}
            >
              تصدير CSV
            </Button>
          </div>
        </div>

        {/* عرض الأكواد */}

        <div className="space-y-2">
          {codesQuery.isPending ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))
          ) : codesQuery.isError ? (
            <p className="text-sm text-destructive">
              تعذّر تحميل الأكواد.
            </p>
          ) : !filteredCodes.length ? (
            <EmptyState
              icon={Building2}
              title="لا توجد أكواد"
              description="لا توجد أكواد من النوع المحدد."
            />
          ) : (
            filteredCodes.map((code) => (
              <div
                key={code.id}
                className="surface-panel flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div>
                  <code className="font-mono text-sm">
                    {code.code}
                  </code>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {code.code_type === "sprix"
                      ? "SPRIX — الثقافة المالية"
                      : code.code_type === "qureo"
                        ? "Qureo — البرمجة"
                        : code.code_type === "sprix_qureo"
                          ? "SPRIX + Qureo — الثقافة والبرمجة"
                          : "Question"}{" "}
                    · {centerName_(code.center_id)}
                    {code.expires_at
                      ? ` · ينتهي ${new Date(
                          code.expires_at,
                        ).toLocaleString("ar-EG")}`
                      : ""}
                  </p>
                </div>

                {code.used_by ? (
                  <span className="text-xs text-muted-foreground">
                    {code.used_by_name || "طالب"}
                    {code.used_by_user_code
                      ? ` · #${code.used_by_user_code}`
                      : ""}
                  </span>
                ) : null}

                <Badge
                  variant={
                    code.used_by
                      ? "secondary"
                      : code.expires_at &&
                          new Date(code.expires_at).getTime() <= Date.now()
                        ? "destructive"
                        : "default"
                  }
                >
                  {code.used_by
                    ? `مستخدم${
                        code.used_at
                          ? " · " +
                            new Date(code.used_at).toLocaleDateString(
                              "ar-EG",
                            )
                          : ""
                      }`
                    : code.expires_at &&
                        new Date(code.expires_at).getTime() <= Date.now()
                      ? "منتهي"
                      : "متاح"}
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}