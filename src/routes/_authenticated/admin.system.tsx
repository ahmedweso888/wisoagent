import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Calculator,
  Plus,
  Trash2,
  RotateCcw,
  NotebookPen,
  Save,
  X,
} from "lucide-react";
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

type CalculatorGroup = {
  id: number;
  count: string;
  price: string;
};

type AdminNote = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
};

const ADMIN_NOTES_STORAGE_KEY = "wiso-admin-notes-v1";

const STATUS_LABEL: Record<PlatformStatus, string> = {
  open: "مفتوحة",
  closed: "مغلقة",
  maintenance: "صيانة",
};

const formatNumber = (value: number) =>
  value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });

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

  const [notificationAudience, setNotificationAudience] = useState<
    "all" | "user" | "stage" | "track"
  >("all");

  const [notificationUserId, setNotificationUserId] = useState("");
  const [notificationStageId, setNotificationStageId] = useState("");
  const [notificationTrackId, setNotificationTrackId] = useState("");
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationBody, setNotificationBody] = useState("");

  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [calculatorGroups, setCalculatorGroups] = useState<
    CalculatorGroup[]
  >([{ id: 1, count: "", price: "" }]);

  const [nextCalculatorGroupId, setNextCalculatorGroupId] = useState(2);

  // دفتر ملاحظات الإدارة
  const [adminNotes, setAdminNotes] = useState<AdminNote[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [notesLoaded, setNotesLoaded] = useState(false);

  // تحميل الملاحظات المحفوظة
  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem(ADMIN_NOTES_STORAGE_KEY);

      if (savedNotes) {
        const parsed = JSON.parse(savedNotes);

        if (Array.isArray(parsed)) {
          setAdminNotes(parsed);
        }
      }
    } catch (error) {
      console.error("تعذّر تحميل ملاحظات الإدارة:", error);
    } finally {
      setNotesLoaded(true);
    }
  }, []);

  // حفظ الملاحظات تلقائيًا
  useEffect(() => {
    if (!notesLoaded) return;

    try {
      localStorage.setItem(
        ADMIN_NOTES_STORAGE_KEY,
        JSON.stringify(adminNotes),
      );
    } catch (error) {
      console.error("تعذّر حفظ ملاحظات الإدارة:", error);
      toast.error("تعذّر حفظ الملاحظات على هذا الجهاز");
    }
  }, [adminNotes, notesLoaded]);

  const startNewNote = () => {
    setActiveNoteId(null);
    setNoteTitle("");
    setNoteContent("");
  };

  const openNote = (note: AdminNote) => {
    setActiveNoteId(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
  };

  const saveNote = () => {
    const title = noteTitle.trim();
    const content = noteContent.trim();

    if (!title && !content) {
      toast.error("اكتب عنوانًا أو محتوى للملاحظة أولًا");
      return;
    }

    const now = new Date().toISOString();

    if (activeNoteId) {
      setAdminNotes((notes) =>
        notes.map((note) =>
          note.id === activeNoteId
            ? {
                ...note,
                title: title || "ملاحظة بدون عنوان",
                content,
                updatedAt: now,
              }
            : note,
        ),
      );

      toast.success("تم تحديث الملاحظة");
    } else {
      const newNote: AdminNote = {
        id: crypto.randomUUID(),
        title: title || "ملاحظة بدون عنوان",
        content,
        updatedAt: now,
      };

      setAdminNotes((notes) => [newNote, ...notes]);
      setActiveNoteId(newNote.id);

      toast.success("تم حفظ الملاحظة");
    }
  };

  const deleteNote = (id: string) => {
    setAdminNotes((notes) => notes.filter((note) => note.id !== id));

    if (activeNoteId === id) {
      startNewNote();
    }

    toast.success("تم حذف الملاحظة");
  };

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
          pdf_enabled: values["pdf_enabled"] ?? "true",
          pdf_credit_cost: values["pdf_credit_cost"] ?? "1",
          pdf_supported_types:
            values["pdf_supported_types"] || '["worksheet","exam"]',
          pdf_default_title:
            values["pdf_default_title"] || "ورقة أسئلة WISO",
          pdf_footer_notice:
            values["pdf_footer_notice"] ||
            "WISO Agent — للاستخدام التعليمي الشخصي",
          pdf_promotional_text: values["pdf_promotional_text"] || "",
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
    queryFn: (): Promise<Revenue> => adminGetRevenueSummary(),
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
      qc.setQueryData(["admin", "platform-settings"], data);
      toast.success("تم حفظ إعدادات المنصة");
    },
    onError: (error: Error) => {
      const errorMessage =
        error.message === "forbidden"
          ? "هذه العملية للمشرفين فقط"
          : error.message;

      toast.error(errorMessage);
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
            ? { prize_egp: patch.prize_egp }
            : {}),
        },
      });
    },
    onSuccess: (data) => {
      qc.setQueryData(["admin", "contest-settings"], data);
      setThreshold(null);
      setPrize(null);
      toast.success("تم حفظ إعدادات المسابقة");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const sendNotification = useMutation({
    mutationFn: () =>
      adminSendNotification({
        data: {
          audience: notificationAudience,
          ...(notificationUserId
            ? { userId: notificationUserId }
            : {}),
          ...(notificationStageId
            ? { stageId: notificationStageId }
            : {}),
          ...(notificationTrackId
            ? { trackId: notificationTrackId }
            : {}),
          title: notificationTitle,
          body: notificationBody,
        },
      }),
    onSuccess: (result) => {
      toast.success(`تم إرسال الإشعار إلى ${result.sent} طالب`);
      setNotificationTitle("");
      setNotificationBody("");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  const platform = platformQuery.data;
  const contest = contestQuery.data;
  const usedCodes = revenueQuery.data?.codes_used ?? 0;

  const calculatedGroups = calculatorGroups.map((group) => {
    const countText = group.count.trim();
    const priceText = group.price.trim();

    const count = countText === "" ? 0 : Number(countText);
    const price = priceText === "" ? 0 : Number(priceText);

    const countValid =
      countText !== "" &&
      Number.isSafeInteger(count) &&
      count > 0;

    const priceValid =
      priceText !== "" &&
      Number.isFinite(price) &&
      price >= 0;

    const valid = countValid && priceValid;

    return {
      ...group,
      countNumber: count,
      priceNumber: price,
      valid,
      subtotal: valid ? count * price : 0,
    };
  });

  const calculatorCountTotal = calculatedGroups.reduce(
    (sum, group) => sum + (group.valid ? group.countNumber : 0),
    0,
  );

  const calculatorGrandTotal = calculatedGroups.reduce(
    (sum, group) => sum + group.subtotal,
    0,
  );

  const remainingCodes = usedCodes - calculatorCountTotal;

  const updateCalculatorGroup = (
    id: number,
    field: "count" | "price",
    value: string,
  ) => {
    setCalculatorGroups((groups) =>
      groups.map((group) =>
        group.id === id ? { ...group, [field]: value } : group,
      ),
    );
  };

  const addCalculatorGroup = () => {
    setCalculatorGroups((groups) => [
      ...groups,
      {
        id: nextCalculatorGroupId,
        count: "",
        price: "",
      },
    ]);

    setNextCalculatorGroupId((id) => id + 1);
  };

  const removeCalculatorGroup = (id: number) => {
    setCalculatorGroups((groups) => {
      if (groups.length <= 1) return groups;
      return groups.filter((group) => group.id !== id);
    });
  };

  const resetCalculator = () => {
    setCalculatorGroups([
      {
        id: nextCalculatorGroupId,
        count: "",
        price: "",
      },
    ]);

    setNextCalculatorGroupId((id) => id + 1);
  };

  return (
    <main dir="rtl" className="page-shell max-w-5xl">
      <PageHeader
        title="إعدادات النظام"
        subtitle="حالة المنصة، وضع الصيانة، المسابقة الشهرية، وملخص الإيرادات الفعلي."
      />

      {/* حالة المنصة */}
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
                    {(Object.keys(STATUS_LABEL) as PlatformStatus[]).map(
                      (status) => (
                        <SelectItem key={status} value={status}>
                          {STATUS_LABEL[status]}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between gap-4 pt-6">
                <Label className="text-sm">وضع الصيانة</Label>

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
                value={message ?? platform.maintenance_message ?? ""}
                onChange={(event) => setMessage(event.target.value)}
                rows={3}
              />

              <Button
                size="sm"
                className="mt-2"
                disabled={
                  updatePlatform.isPending || message === null
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

      {/* ملفات PDF */}
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
              (pdfDraft["pdf_enabled"] ??
                pdfSettings.data?.["pdf_enabled"] ??
                "true") === "true"
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
                  pdf_credit_cost: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label>الأنواع المدعومة (JSON)</Label>
            <Input
              dir="ltr"
              value={
                pdfDraft["pdf_supported_types"] ??
                pdfSettings.data?.["pdf_supported_types"] ??
                '["worksheet","exam"]'
              }
              onChange={(event) =>
                setPdfDraft((old) => ({
                  ...old,
                  pdf_supported_types: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label>العنوان الافتراضي</Label>
            <Input
              value={
                pdfDraft["pdf_default_title"] ??
                pdfSettings.data?.["pdf_default_title"] ??
                ""
              }
              onChange={(event) =>
                setPdfDraft((old) => ({
                  ...old,
                  pdf_default_title: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label>نص التذييل</Label>
            <Input
              value={
                pdfDraft["pdf_footer_notice"] ??
                pdfSettings.data?.["pdf_footer_notice"] ??
                ""
              }
              onChange={(event) =>
                setPdfDraft((old) => ({
                  ...old,
                  pdf_footer_notice: event.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>نص ترويجي / مسابقة اختياري</Label>
          <Textarea
            value={
              pdfDraft["pdf_promotional_text"] ??
              pdfSettings.data?.["pdf_promotional_text"] ??
              ""
            }
            onChange={(event) =>
              setPdfDraft((old) => ({
                ...old,
                pdf_promotional_text: event.target.value,
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

      {/* المسابقة الشهرية */}
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
              <Label className="text-sm">تفعيل المسابقة</Label>

              <Switch
                checked={contest.enabled}
                disabled={updateContest.isPending}
                onCheckedChange={(checked) =>
                  updateContest.mutate({ enabled: checked })
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
                    String(contest.verified_students_threshold)
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
                  value={prize ?? String(contest.prize_egp)}
                  inputMode="decimal"
                  onChange={(event) => setPrize(event.target.value)}
                />
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              المشتركون حالياً: {entriesQuery.data ?? 0} من{" "}
              {contest.verified_students_threshold}
            </p>

            <Button
              size="sm"
              disabled={
                updateContest.isPending ||
                (threshold === null && prize === null)
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

      {/* إرسال إشعار */}
      <section className="surface-panel mt-5 space-y-4 p-5">
        <h2 className="font-display text-base font-semibold">
          إرسال إشعار للطلاب
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            value={notificationAudience}
            onValueChange={(value) =>
              setNotificationAudience(
                value as typeof notificationAudience,
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">كل الطلاب</SelectItem>
              <SelectItem value="user">طالب محدد</SelectItem>
              <SelectItem value="stage">مرحلة دراسية</SelectItem>
              <SelectItem value="track">شعبة / تخصص</SelectItem>
            </SelectContent>
          </Select>

          {notificationAudience === "user" && (
            <Input
              value={notificationUserId}
              onChange={(event) =>
                setNotificationUserId(event.target.value)
              }
              placeholder="معرّف الطالب"
            />
          )}

          {notificationAudience === "stage" && (
            <Input
              value={notificationStageId}
              onChange={(event) =>
                setNotificationStageId(event.target.value)
              }
              placeholder="معرّف المرحلة"
            />
          )}

          {notificationAudience === "track" && (
            <Input
              value={notificationTrackId}
              onChange={(event) =>
                setNotificationTrackId(event.target.value)
              }
              placeholder="معرّف الشعبة"
            />
          )}
        </div>

        <Input
          value={notificationTitle}
          onChange={(event) => setNotificationTitle(event.target.value)}
          placeholder="عنوان الإشعار"
        />

        <Textarea
          value={notificationBody}
          onChange={(event) => setNotificationBody(event.target.value)}
          placeholder="نص الإشعار"
        />

        <Button
          disabled={
            sendNotification.isPending ||
            !notificationTitle.trim() ||
            !notificationBody.trim()
          }
          onClick={() => sendNotification.mutate()}
        >
          إرسال الإشعار
        </Button>
      </section>

      {/* دفتر ملاحظات الإدارة */}
      <section className="surface-panel mt-5 space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-display text-base font-semibold">
              <NotebookPen className="h-5 w-5" />
              دفتر ملاحظات الإدارة
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              سجّل أفكارك ومتابعاتك وملاحظاتك الإدارية وارجع لها في أي وقت.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={startNewNote}
          >
            <Plus className="ms-2 h-4 w-4" />
            ملاحظة جديدة
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">
              الملاحظات المحفوظة
            </h3>

            {!notesLoaded ? (
              <Skeleton className="h-20 w-full" />
            ) : adminNotes.length === 0 ? (
              <div className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">
                لسه مفيش ملاحظات محفوظة.
              </div>
            ) : (
              <div className="max-h-[360px] space-y-2 overflow-y-auto">
                {adminNotes.map((note) => (
                  <div
                    key={note.id}
                    className={`flex items-start gap-2 rounded-lg border p-3 ${
                      activeNoteId === note.id
                        ? "border-primary bg-primary/5"
                        : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-start"
                      onClick={() => openNote(note)}
                    >
                      <p className="truncate text-sm font-semibold">
                        {note.title}
                      </p>

                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {note.content || "بدون محتوى"}
                      </p>

                      <p className="mt-2 text-[11px] text-muted-foreground">
                        {new Date(note.updatedAt).toLocaleString("ar-EG")}
                      </p>
                    </button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-destructive"
                      onClick={() => deleteNote(note.id)}
                      aria-label={`حذف ${note.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">
                {activeNoteId ? "تعديل الملاحظة" : "كتابة ملاحظة"}
              </h3>

              {activeNoteId && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={startNewNote}
                >
                  <X className="ms-1 h-4 w-4" />
                  إلغاء التعديل
                </Button>
              )}
            </div>

            <Input
              value={noteTitle}
              onChange={(event) => setNoteTitle(event.target.value)}
              placeholder="عنوان الملاحظة"
              maxLength={120}
            />

            <Textarea
              value={noteContent}
              onChange={(event) => setNoteContent(event.target.value)}
              placeholder="اكتب ملاحظتك هنا..."
              rows={8}
              className="min-h-[180px] resize-y"
            />

            <Button type="button" onClick={saveNote}>
              <Save className="ms-2 h-4 w-4" />
              {activeNoteId ? "حفظ التعديلات" : "حفظ الملاحظة"}
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          الملاحظات محفوظة محليًا على نفس المتصفح والجهاز، وليست متزامنة بين الأجهزة.
        </p>
      </section>

      {/* ملخص الإيرادات وحاسبة الأكواد متعددة المجموعات */}
      <section className="mt-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-base font-semibold">
            ملخص الإيرادات
          </h2>

          <Button
            type="button"
            variant="outline"
            onClick={() => setCalculatorOpen((open) => !open)}
          >
            <Calculator className="ms-2 h-4 w-4" />
            {calculatorOpen
              ? "إخفاء الحاسبة"
              : "حاسبة الأكواد المستخدمة"}
          </Button>
        </div>

        {calculatorOpen && (
          <div className="surface-panel space-y-5 p-5">
            <div>
              <h3 className="font-semibold">
                حاسبة توزيع الأكواد على المجموعات
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                أضف مجموعة لكل سعر بيع مختلف، وحدد عدد الأكواد وسعر الكود
                لحساب قيمة كل مجموعة والإجمالي.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">
                  إجمالي الأكواد المستخدمة فعليًا
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {revenueQuery.isPending
                    ? "جارٍ التحميل..."
                    : revenueQuery.isError
                      ? "تعذّر التحميل"
                      : formatNumber(usedCodes)}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">
                  الأكواد الموجودة في المجموعات
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {formatNumber(calculatorCountTotal)}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">
                  الأكواد المتبقية دون حساب
                </p>

                <p
                  className={`mt-2 text-2xl font-bold ${
                    remainingCodes < 0 ? "text-destructive" : ""
                  }`}
                >
                  {formatNumber(remainingCodes)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {calculatedGroups.map((group, index) => (
                <div
                  key={group.id}
                  className="rounded-xl border p-4 sm:p-5"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h4 className="font-semibold">
                      المجموعة {index + 1}
                    </h4>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={calculatorGroups.length <= 1}
                      onClick={() => removeCalculatorGroup(group.id)}
                      aria-label={`حذف المجموعة ${index + 1}`}
                    >
                      <Trash2 className="ms-2 h-4 w-4" />
                      حذف المجموعة
                    </Button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`calculator-count-${group.id}`}>
                        عدد الأكواد
                      </Label>

                      <Input
                        id={`calculator-count-${group.id}`}
                        type="number"
                        min="1"
                        step="1"
                        inputMode="numeric"
                        placeholder="مثال: 200"
                        value={group.count}
                        onChange={(event) =>
                          updateCalculatorGroup(
                            group.id,
                            "count",
                            event.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`calculator-price-${group.id}`}>
                        سعر الكود الواحد (جنيه)
                      </Label>

                      <Input
                        id={`calculator-price-${group.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        placeholder="مثال: 50"
                        value={group.price}
                        onChange={(event) =>
                          updateCalculatorGroup(
                            group.id,
                            "price",
                            event.target.value,
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/50 p-3">
                    <span className="text-sm text-muted-foreground">
                      إجمالي قيمة المجموعة
                    </span>

                    <span className="text-lg font-bold">
                      {group.valid
                        ? `${formatNumber(group.subtotal)} ج.م`
                        : "—"}
                    </span>
                  </div>

                  {group.count.trim() !== "" &&
                    (!Number.isSafeInteger(group.countNumber) ||
                      group.countNumber <= 0) && (
                      <p className="mt-2 text-sm text-destructive">
                        أدخل عدد أكواد صحيحًا أكبر من صفر.
                      </p>
                    )}

                  {group.price.trim() !== "" &&
                    (!Number.isFinite(group.priceNumber) ||
                      group.priceNumber < 0) && (
                      <p className="mt-2 text-sm text-destructive">
                        أدخل سعرًا صحيحًا لا يقل عن صفر.
                      </p>
                    )}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={addCalculatorGroup}
              >
                <Plus className="ms-2 h-4 w-4" />
                إضافة مجموعة أخرى
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={resetCalculator}
              >
                <RotateCcw className="ms-2 h-4 w-4" />
                مسح الحساب والبدء من جديد
              </Button>
            </div>

            {remainingCodes < 0 && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                مجموع الأكواد في المجموعات أكبر من إجمالي الأكواد المستخدمة
                فعليًا بمقدار {formatNumber(Math.abs(remainingCodes))} كود.
                راجع الأعداد المدخلة.
              </div>
            )}

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
              <p className="text-sm text-muted-foreground">
                إجمالي قيمة جميع المجموعات
              </p>

              <p className="mt-2 text-3xl font-bold text-primary">
                {formatNumber(calculatorGrandTotal)}{" "}
                <span className="text-base font-medium">ج.م</span>
              </p>

              <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <p>
                  عدد الأكواد المحسوبة:{" "}
                  <span className="font-semibold text-foreground">
                    {formatNumber(calculatorCountTotal)}
                  </span>
                </p>

                <p>
                  عدد المجموعات:{" "}
                  <span className="font-semibold text-foreground">
                    {calculatorGroups.length}
                  </span>
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              الحاسبة للحساب فقط؛ لا تخصم الأكواد، ولا تعدّل بيانات الداتا بيز،
              ولا تسجّل إيرادات جديدة. إجمالي الأكواد المستخدمة يُحمّل من
              بيانات النظام الفعلية.
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {revenueQuery.isPending ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28 w-full" />
            ))
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
                value={revenueQuery.data?.codes_used ?? 0}
              />

              <StatCard
                label="إجمالي الأكواد"
                value={revenueQuery.data?.codes_total ?? 0}
              />
            </>
          )}
        </div>
      </section>
    </main>
  );
}