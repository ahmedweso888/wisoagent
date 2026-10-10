import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Library } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { adminCreateSubject, adminGetCurriculumContentCounts, adminGetCurriculumVersions, adminGetSubjects, adminPrepareCurriculumUpload, adminProcessCurriculum, adminPublishCurriculumVersion, adminUpdateSubject } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

type Subject = Database["public"]["Tables"]["subjects"]["Row"];

export const Route = createFileRoute("/_authenticated/admin/curriculum")({
  head: () => ({
    meta: [
      { title: "المناهج والمواد — لوحة الإدارة" },
      { name: "description", content: "إدارة مواد WISO ومتابعة الوحدات والدروس المستخرجة." },
      { property: "og:title", content: "المناهج والمواد — لوحة الإدارة" },
      {
        property: "og:description",
        content: "إدارة مواد WISO ومتابعة الوحدات والدروس المستخرجة.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminCurriculumPage,
});

type Draft = {
  slug: string;
  name_ar: string;
  name_en: string;
  color: string;
  icon: string;
  sort_order: string;
  visibility_scope: "all" | "stage" | "track";
  academic_stage_id: string;
  academic_track_id: string;
};

const EMPTY: Draft = {
  slug: "",
  name_ar: "",
  name_en: "",
  color: "#425722",
  icon: "book",
  sort_order: "0",
  visibility_scope: "all",
  academic_stage_id: "",
  academic_track_id: "",
};

const FIELDS: { key: keyof Draft; label: string }[] = [
  { key: "name_ar", label: "الاسم بالعربية" },
  { key: "name_en", label: "الاسم بالإنجليزية" },
  { key: "slug", label: "المعرّف (slug)" },
  { key: "color", label: "اللون" },
  { key: "icon", label: "الأيقونة" },
  { key: "sort_order", label: "الترتيب" },
];

function rowOf(draft: Draft) {
  return {
    slug: draft.slug.trim(),
    name_ar: draft.name_ar.trim(),
    name_en: draft.name_en.trim(),
    color: draft.color.trim(),
    icon: draft.icon.trim(),
    sort_order: Number(draft.sort_order) || 0,
    visibility_scope: draft.visibility_scope,
    academic_stage_id: draft.academic_stage_id || null,
    academic_track_id: draft.academic_track_id || null,
  };
}

function SubjectForm({
  draft,
  onChange,
  disabled,
}: {
  draft: Draft;
  onChange: (next: Draft) => void;
  disabled: boolean;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {FIELDS.map((field) => (
        <div key={field.key} className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">{field.label}</Label>
          <Input
            value={draft[field.key]}
            disabled={disabled}
            onChange={(e) => onChange({ ...draft, [field.key]: e.target.value })}
          />
        </div>
      ))}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">نطاق الظهور</Label>
        <Select value={draft.visibility_scope} onValueChange={(value) => onChange({ ...draft, visibility_scope: value as Draft["visibility_scope"], academic_stage_id: value === "all" ? "" : draft.academic_stage_id, academic_track_id: value === "track" ? draft.academic_track_id : "" })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">كل الطلاب</SelectItem><SelectItem value="stage">مرحلة محددة</SelectItem><SelectItem value="track">شعبة محددة</SelectItem></SelectContent>
        </Select>
      </div>
      {draft.visibility_scope !== "all" ? <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">معرّف المرحلة</Label><Input value={draft.academic_stage_id} disabled={disabled} onChange={(e) => onChange({ ...draft, academic_stage_id: e.target.value, academic_track_id: "" })} /></div> : null}
      {draft.visibility_scope === "track" ? <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">معرّف الشعبة</Label><Input value={draft.academic_track_id} disabled={disabled} onChange={(e) => onChange({ ...draft, academic_track_id: e.target.value })} /></div> : null}
    </div>
  );
}

function AdminCurriculumPage() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [newDraft, setNewDraft] = useState<Draft>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [uploadingSubject, setUploadingSubject] = useState<string | null>(null);
  const [processingVersion, setProcessingVersion] = useState<string | null>(null);

  const subjectsQuery = useQuery({
    queryKey: ["admin", "subjects"],
    enabled: isAdmin,
    queryFn: async (): Promise<Subject[]> => {
      return adminGetSubjects();
    },
  });

  const versionsQuery = useQuery({
    queryKey: ["admin", "curriculum-versions"],
    enabled: isAdmin,
    queryFn: () => adminGetCurriculumVersions({ data: {} }),
  });

  const uploadCurriculum = async (subjectId: string, file: File) => {
    if (file.type !== "application/pdf") throw new Error("ارفع ملف PDF فقط");
    if (file.size > 50 * 1024 * 1024) throw new Error("الملف أكبر من 50MB");
    setUploadingSubject(subjectId);
    try {
      const bytes = await file.arrayBuffer();
      const digest = await crypto.subtle.digest("SHA-256", bytes);
      const checksum = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
      const prepared = await adminPrepareCurriculumUpload({ data: { subjectId, filename: file.name, checksumSha256: checksum } });
      const { error } = await supabase.storage.from("curriculum-books").uploadToSignedUrl(prepared.path, prepared.token, file);
      if (error) throw error;
      setProcessingVersion(prepared.versionId);
      await adminProcessCurriculum({ data: { versionId: prepared.versionId } });
      toast.success("تم رفع وتحليل المنهج");
      await qc.invalidateQueries({ queryKey: ["admin", "curriculum-versions"] });
    } finally {
      setUploadingSubject(null);
      setProcessingVersion(null);
    }
  };

  const processVersion = async (versionId: string) => {
    setProcessingVersion(versionId);
    try {
      await adminProcessCurriculum({ data: { versionId } });
      await qc.invalidateQueries({ queryKey: ["admin", "curriculum-versions"] });
      toast.success("تمت إعادة المعالجة");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذرت المعالجة");
    } finally {
      setProcessingVersion(null);
    }
  };

  const publishVersion = async (versionId: string) => {
    try {
      await adminPublishCurriculumVersion({ data: { versionId } });
      await qc.invalidateQueries({ queryKey: ["admin", "curriculum-versions"] });
      toast.success("تم نشر نسخة المنهج");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر نشر المنهج");
    }
  };

  const contentQuery = useQuery({
    queryKey: ["admin", "curriculum-content"],
    enabled: isAdmin,
    queryFn: async () => {
      return adminGetCurriculumContentCounts();
    },
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["admin", "subjects"] });
    void qc.invalidateQueries({ queryKey: ["subjects"] });
  };

  const create = useMutation({
    mutationFn: async (value: Draft) => {
      await adminCreateSubject({ data: rowOf(value) });
    },
    onSuccess: () => {
      toast.success("تمت إضافة المادة");
      setCreating(false);
      setNewDraft(EMPTY);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const save = useMutation({
    mutationFn: async (params: { id: string; draft: Draft }) => {
      await adminUpdateSubject({ data: { id: params.id, patch: rowOf(params.draft) } });
    },
    onSuccess: () => {
      toast.success("تم حفظ المادة");
      setEditing(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!isAdmin) return <Navigate to="/dashboard" />;

  return (
    <main dir="rtl" className="page-shell">
      <PageHeader
        title="المناهج والمواد"
        subtitle="المواد تُدار من هنا. الوحدات والفصول والدروس تُستخرج من ملفات الطلاب وتظهر كأرقام فعلية."
        actions={
          <Button variant={creating ? "outline" : "default"} onClick={() => setCreating((v) => !v)}>
            {creating ? "إلغاء" : "إضافة مادة"}
          </Button>
        }
      />

      {creating ? (
        <section className="surface-panel mt-6 space-y-4 p-5">
          <h2 className="font-display text-base font-semibold">مادة جديدة</h2>
          <SubjectForm draft={newDraft} onChange={setNewDraft} disabled={create.isPending} />
          <Button
            disabled={create.isPending || !newDraft.name_ar.trim() || !newDraft.slug.trim()}
            onClick={() => create.mutate(newDraft)}
          >
            حفظ المادة
          </Button>
        </section>
      ) : null}

      <div className="mt-6 space-y-4">
        {subjectsQuery.isPending ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : subjectsQuery.isError ? (
          <p className="text-sm text-destructive">تعذّر تحميل المواد.</p>
        ) : !subjectsQuery.data?.length ? (
          <EmptyState
            icon={Library}
            title="لا توجد مواد"
            description="أضف أول مادة لبدء بناء المنهج."
          />
        ) : (
          subjectsQuery.data.map((subject) => (
            <div key={subject.id} className="surface-panel space-y-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span
                    className="mt-1 size-3 rounded-full"
                    style={{ backgroundColor: subject.color }}
                    aria-hidden
                  />
                  <div>
                    <p className="font-display text-base font-semibold">{subject.name_ar}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {subject.name_en} · {subject.slug}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {contentQuery.isPending
                        ? "جارٍ حساب محتوى المنهج..."
                        : `${contentQuery.data?.units[subject.id] ?? 0} وحدة · ${
                            contentQuery.data?.chapters[subject.id] ?? 0
                          } فصل · ${contentQuery.data?.topics[subject.id] ?? 0} درس · ${
                            contentQuery.data?.bank[subject.id] ?? 0
                          } سؤال في البنك`}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (editing === subject.id) {
                      setEditing(null);
                      return;
                    }
                    setEditing(subject.id);
                    setDraft({
                      slug: subject.slug,
                      name_ar: subject.name_ar,
                      name_en: subject.name_en,
                      color: subject.color,
                      icon: subject.icon,
                      sort_order: String(subject.sort_order),
                      visibility_scope: (subject.visibility_scope as Draft["visibility_scope"]) ?? "all",
                      academic_stage_id: subject.academic_stage_id ?? "",
                      academic_track_id: subject.academic_track_id ?? "",
                    });
                  }}
                >
                  {editing === subject.id ? "إغلاق" : "تعديل"}
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm">
                  {uploadingSubject === subject.id ? "جاري الرفع والتحليل..." : "رفع منهج PDF"}
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    disabled={uploadingSubject !== null}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      uploadCurriculum(subject.id, file).catch((error) => toast.error(error instanceof Error ? error.message : "تعذر رفع المنهج"));
                      e.currentTarget.value = "";
                    }}
                  />
                </label>
                {versionsQuery.data?.filter((v) => v.subject_id === subject.id).map((version) => (
                  <div key={version.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>v{version.version} · {version.processing_status}</span>
                    {version.processing_status === "failed" ? <Button size="sm" variant="outline" onClick={() => processVersion(version.id)} disabled={processingVersion === version.id}>إعادة المحاولة</Button> : null}
                    {version.processing_status === "completed" && !version.is_published ? <Button size="sm" onClick={() => publishVersion(version.id)}>نشر</Button> : null}
                  </div>
                ))}
              </div>

              {editing === subject.id ? (
                <div className="space-y-4 border-t border-border pt-4">
                  <SubjectForm draft={draft} onChange={setDraft} disabled={save.isPending} />
                  <Button
                    size="sm"
                    disabled={save.isPending}
                    onClick={() => save.mutate({ id: subject.id, draft })}
                  >
                    حفظ التعديلات
                  </Button>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </main>
  );
}
