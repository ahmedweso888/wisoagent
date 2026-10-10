import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  adminGetPdfSettings,
  adminUpdatePdfSettings,
  adminGetPlatformSettings,
  adminGetContestSettings,
  adminGetContestEntriesCount,
  adminGetRevenueSummary,
  adminUpdatePlatformSettings,
  adminUpdateContestSettings,
  adminSendNotification,
} from "@/lib/admin.functions";

import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

type PlatformSettings =
  Database["public"]["Tables"]["platform_settings"]["Row"];

type ContestSettings =
  Database["public"]["Tables"]["contest_settings"]["Row"];

type PlatformStatus =
  Database["public"]["Enums"]["platform_status"];

type Revenue = {
  total_revenue: number;
  pending_revenue: number;
  by_source: Record<string, number>;
  codes_used: number;
  codes_total: number;
};

const STATUS_LABEL: Record<PlatformStatus, string> = {
  open: "مفتوحة",
  closed: "مغلقة",
  maintenance: "صيانة",
};

export const Route = createFileRoute("/_authenticated/admin/system")({
  head: () => ({
    meta: [
      { title: "إعدادات النظام — لوحة الإدارة" },
      {
        name: "description",
        content:
          "حالة المنصة، وضع الصيانة، المسابقة الشهرية، وملخص الإيرادات.",
      },
      {
        property: "og:title",
        content: "إعدادات النظام — لوحة الإدارة",
      },
      {
        property: "og:description",
        content:
          "حالة المنصة، وضع الصيانة، المسابقة الشهرية، وملخص الإيرادات.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminSystemPage,
});

function AdminSystemPage() {
  const { isAdmin } = useAuth();

  const qc = useQueryClient();

  const [message, setMessage] = useState<string | null>(null);
  const [threshold, setThreshold] = useState<string | null>(null);
  const [prize, setPrize] = useState<string | null>(null);
  const [pdfDraft, setPdfDraft] = useState<Record<string, string>>({});
  const [notificationAudience, setNotificationAudience] = useState<"all" | "user" | "stage" | "track">("all");
  const [notificationUserId, setNotificationUserId] = useState("");
  const [notificationStageId, setNotificationStageId] = useState("");
  const [notificationTrackId, setNotificationTrackId] = useState("");
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationBody, setNotificationBody] = useState("");

  const pdfSettings = useQuery({
    queryKey: ["admin", "pdf-settings"],
    enabled: isAdmin,
    queryFn: () => adminGetPdfSettings(),
  });

  const updatePdf = useMutation({
    mutationFn: async () => {
      const current = pdfSettings.data ?? {};
      const values = {
        ...current,
        ...pdfDraft,
      };

      return adminUpdatePdfSettings({
        data: {
          pdf_enabled:
            values["pdf_enabled"] ?? "true",

          pdf_credit_cost:
            values["pdf_credit_cost"] ?? "1",

          pdf_supported_types:
            values["pdf_supported_types"] ||
            '["worksheet","exam"]',

          pdf_default_title:
            values["pdf_default_title"] ||
            "ورقة أسئلة WISO",

          pdf_footer_notice:
            values["pdf_footer_notice"] ||
            "WISO Agent — للاستخدام التعليمي الشخصي",

          pdf_promotional_text:
            values["pdf_promotional_text"] || "",
        },
      });
    },

    onSuccess: () => {
      setPdfDraft({});

      void qc.invalidateQueries({
        queryKey: ["admin", "pdf-settings"],
      });

      toast.success("تم حفظ إعدادات PDF");
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const platformQuery = useQuery({
    queryKey: ["admin", "platform-settings"],
    enabled: isAdmin,
    queryFn: (): Promise<PlatformSettings> =>
      adminGetPlatformSettings(),
  });

  const contestQuery = useQuery({
    queryKey: ["admin", "contest-settings"],
    enabled: isAdmin,
    queryFn: (): Promise<ContestSettings> =>
      adminGetContestSettings(),
  });

  const entriesQuery = useQuery({
    queryKey: ["admin", "contest-entries-count"],
    enabled: isAdmin,
    queryFn: () => adminGetContestEntriesCount(),
  });

  const revenueQuery = useQuery({
    queryKey: ["admin", "revenue"],
    enabled: isAdmin,
    queryFn: (): Promise<Revenue> =>
      adminGetRevenueSummary(),
  });

  const updatePlatform = useMutation({
    mutationFn: async (patch: {
      _status?: PlatformStatus;
      _maintenance?: boolean;
      _message?: string;
    }): Promise<PlatformSettings> => {
      return adminUpdatePlatformSettings({
        data: patch,
      });
    },

    onSuccess: (data) => {
      qc.setQueryData(
        ["admin", "platform-settings"],
        data,
      );

      toast.success("تم حفظ إعدادات المنصة");
    },

    onError: (error: Error) => {
      const message =
        error.message === "forbidden"
          ? "هذه العملية للمشرفين فقط"
          : error.message;

      toast.error(message);
    },
  });

  const updateContest = useMutation({
    mutationFn: async (
      patch: Partial<ContestSettings>,
    ): Promise<ContestSettings> => {
      return adminUpdateContestSettings({
        data: {
          ...(patch.enabled !== undefined
            ? { enabled: patch.enabled }
            : {}),

          ...(patch.verified_students_threshold !== undefined
            ? {
                verified_students_threshold:
                  patch.verified_students_threshold,
              }
            : {}),

          ...(patch.prize_egp !== undefined
            ? {
                prize_egp: patch.prize_egp,
              }
            : {}),
        },
      });
    },

    onSuccess: (data) => {
      qc.setQueryData(
        ["admin", "contest-settings"],
        data,
      );

      setThreshold(null);
      setPrize(null);

      toast.success("تم حفظ إعدادات المسابقة");
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const sendNotification = useMutation({
    mutationFn: () => adminSendNotification({ data: { audience: notificationAudience, ...(notificationUserId ? { userId: notificationUserId } : {}), ...(notificationStageId ? { stageId: notificationStageId } : {}), ...(notificationTrackId ? { trackId: notificationTrackId } : {}), title: notificationTitle, body: notificationBody } }),
    onSuccess: (result) => { toast.success(`تم إرسال الإشعار إلى ${result.sent} طالب`); setNotificationTitle(""); setNotificationBody(""); },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  const platform = platformQuery.data;
  const contest = contestQuery.data;

  return (
    <main dir="rtl" className="page-shell max-w-5xl">
      <PageHeader
        title="إعدادات النظام"
        subtitle="حالة المنصة، وضع الصيانة، المسابقة الشهرية، وملخص الإيرادات الفعلي."
      />

      <section className="surface-panel mt-6 space-y-5 p-5">
        <h2 className="font-display text-base font-semibold">
          حالة المنصة
        </h2>

        {platformQuery.isPending ? (
          <Skeleton className="h-28 w-full" />
        ) : platformQuery.isError || !platform ? (
          <p className="text-sm text-destructive">
            تعذّر تحميل إعدادات المنصة.
          </p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  الحالة
                </Label>

                <Select
                  value={platform.platform_status}
                  onValueChange={(value) =>
                    updatePlatform.mutate({
                      _status: value as PlatformStatus,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {(
                      Object.keys(
                        STATUS_LABEL,
                      ) as PlatformStatus[]
                    ).map((status) => (
                      <SelectItem
                        key={status}
                        value={status}
                      >
                        {STATUS_LABEL[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between gap-4 pt-6">
                <Label className="text-sm">
                  وضع الصيانة
                </Label>

                <Switch
                  checked={platform.maintenance_mode}
                  disabled={updatePlatform.isPending}
                  onCheckedChange={(checked) =>
                    updatePlatform.mutate({
                      _maintenance: checked,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                رسالة الصيانة
              </Label>

              <Textarea
                value={
                  message ??
                  platform.maintenance_message ??
                  ""
                }
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                rows={3}
              />

              <Button
                size="sm"
                className="mt-2"
                disabled={
                  updatePlatform.isPending ||
                  message === null
                }
                onClick={() =>
                  updatePlatform.mutate({
                    _message: message ?? "",
                  })
                }
              >
                حفظ الرسالة
              </Button>
            </div>
          </>
        )}
      </section>

      <section className="surface-panel mt-5 space-y-4 p-5">
        <div>
          <h2 className="font-display text-base font-semibold">
            ملفات PDF
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            العلامة المائية والملكية إلزاميتان دائماً ولا يمكن تعطيلهما.
          </p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <Label>تفعيل التصدير</Label>

          <Switch
            checked={
              (
                pdfDraft["pdf_enabled"] ??
                pdfSettings.data?.["pdf_enabled"] ??
                "true"
              ) === "true"
            }
            onCheckedChange={(checked) =>
              setPdfDraft((old) => ({
                ...old,
                pdf_enabled: String(checked),
              }))
            }
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>تكلفة الملف من رصيد PDF</Label>

            <Input
              inputMode="numeric"
              value={
                pdfDraft["pdf_credit_cost"] ??
                pdfSettings.data?.["pdf_credit_cost"] ??
                "1"
              }
              onChange={(event) =>
                setPdfDraft((old) => ({
                  ...old,
                  pdf_credit_cost:
                    event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label>
              الأنواع المدعومة (JSON)
            </Label>

            <Input
              dir="ltr"
              value={
                pdfDraft["pdf_supported_types"] ??
                pdfSettings.data?.[
                  "pdf_supported_types"
                ] ??
                '["worksheet","exam"]'
              }
              onChange={(event) =>
                setPdfDraft((old) => ({
                  ...old,
                  pdf_supported_types:
                    event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label>العنوان الافتراضي</Label>

            <Input
              value={
                pdfDraft["pdf_default_title"] ??
                pdfSettings.data?.[
                  "pdf_default_title"
                ] ??
                ""
              }
              onChange={(event) =>
                setPdfDraft((old) => ({
                  ...old,
                  pdf_default_title:
                    event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label>نص التذييل</Label>

            <Input
              value={
                pdfDraft["pdf_footer_notice"] ??
                pdfSettings.data?.[
                  "pdf_footer_notice"
                ] ??
                ""
              }
              onChange={(event) =>
                setPdfDraft((old) => ({
                  ...old,
                  pdf_footer_notice:
                    event.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>
            نص ترويجي / مسابقة اختياري
          </Label>

          <Textarea
            value={
              pdfDraft["pdf_promotional_text"] ??
              pdfSettings.data?.[
                "pdf_promotional_text"
              ] ??
              ""
            }
            onChange={(event) =>
              setPdfDraft((old) => ({
                ...old,
                pdf_promotional_text:
                  event.target.value,
              }))
            }
          />
        </div>

        <Button
          disabled={
            updatePdf.isPending ||
            Object.keys(pdfDraft).length === 0
          }
          onClick={() => updatePdf.mutate()}
        >
          حفظ إعدادات PDF
        </Button>
      </section>

      <section className="surface-panel mt-5 space-y-4 p-5">
        <h2 className="font-display text-base font-semibold">
          المسابقة الشهرية
        </h2>

        {contestQuery.isPending ? (
          <Skeleton className="h-24 w-full" />
        ) : contestQuery.isError || !contest ? (
          <p className="text-sm text-destructive">
            تعذّر تحميل إعدادات المسابقة.
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4">
              <Label className="text-sm">
                تفعيل المسابقة
              </Label>

              <Switch
                checked={contest.enabled}
                disabled={updateContest.isPending}
                onCheckedChange={(checked) =>
                  updateContest.mutate({
                    enabled: checked,
                  })
                }
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  عدد الطلاب المطلوب لانطلاق المسابقة
                </Label>

                <Input
                  value={
                    threshold ??
                    String(
                      contest.verified_students_threshold,
                    )
                  }
                  inputMode="numeric"
                  onChange={(event) =>
                    setThreshold(event.target.value)
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  قيمة الجائزة (ج.م)
                </Label>

                <Input
                  value={
                    prize ??
                    String(contest.prize_egp)
                  }
                  inputMode="decimal"
                  onChange={(event) =>
                    setPrize(event.target.value)
                  }
                />
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              المشتركون حالياً:{" "}
              {entriesQuery.data ?? 0} من{" "}
              {contest.verified_students_threshold}
            </p>

            <Button
              size="sm"
              disabled={
                updateContest.isPending ||
                (threshold === null &&
                  prize === null)
              }
              onClick={() =>
                updateContest.mutate({
                  verified_students_threshold:
                    threshold === null
                      ? contest.verified_students_threshold
                      : Number(threshold) || 0,

                  prize_egp:
                    prize === null
                      ? contest.prize_egp
                      : Number(prize) || 0,
                })
              }
            >
              حفظ إعدادات المسابقة
            </Button>
          </>
        )}
      </section>

      <section className="surface-panel mt-5 space-y-4 p-5">
        <h2 className="font-display text-base font-semibold">إرسال إشعار للطلاب</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Select value={notificationAudience} onValueChange={(v) => setNotificationAudience(v as typeof notificationAudience)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الطلاب</SelectItem>
              <SelectItem value="user">طالب محدد</SelectItem>
              <SelectItem value="stage">مرحلة دراسية</SelectItem>
              <SelectItem value="track">شعبة / تخصص</SelectItem>
            </SelectContent>
          </Select>
          {notificationAudience === "user" ? <Input value={notificationUserId} onChange={(e) => setNotificationUserId(e.target.value)} placeholder="معرّف الطالب" /> : null}
          {notificationAudience === "stage" ? <Input value={notificationStageId} onChange={(e) => setNotificationStageId(e.target.value)} placeholder="معرّف المرحلة" /> : null}
          {notificationAudience === "track" ? <Input value={notificationTrackId} onChange={(e) => setNotificationTrackId(e.target.value)} placeholder="معرّف الشعبة" /> : null}
        </div>
        <Input value={notificationTitle} onChange={(e) => setNotificationTitle(e.target.value)} placeholder="عنوان الإشعار" />
        <Textarea value={notificationBody} onChange={(e) => setNotificationBody(e.target.value)} placeholder="نص الإشعار" />
        <Button disabled={sendNotification.isPending || !notificationTitle.trim() || !notificationBody.trim()} onClick={() => sendNotification.mutate()}>إرسال الإشعار</Button>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-base font-semibold">
          ملخص الإيرادات
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {revenueQuery.isPending ? (
            Array.from({ length: 4 }).map(
              (_, index) => (
                <Skeleton
                  key={index}
                  className="h-28 w-full"
                />
              ),
            )
          ) : revenueQuery.isError ? (
            <p className="text-sm text-destructive">
              تعذّر تحميل الإيرادات.
            </p>
          ) : (
            <>
              <StatCard
                label="إجمالي الإيرادات"
                value={`${revenueQuery.data?.total_revenue ?? 0} ج.م`}
                tone="success"
              />

              <StatCard
                label="إيرادات معلّقة"
                value={`${revenueQuery.data?.pending_revenue ?? 0} ج.م`}
                tone="accent"
              />

              <StatCard
                label="أكواد مستخدمة"
                value={
                  revenueQuery.data?.codes_used ?? 0
                }
              />

              <StatCard
                label="إجمالي الأكواد"
                value={
                  revenueQuery.data?.codes_total ?? 0
                }
              />
            </>
          )}
        </div>
      </section>
    </main>
  );
}