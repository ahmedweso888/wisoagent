import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BookOpenCheck } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
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
import { adminGetQuestionBank, adminGetQuestionSubjects } from "@/lib/admin.functions";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

type Difficulty = Database["public"]["Enums"]["difficulty_level"];

export const Route = createFileRoute("/_authenticated/admin/questions")({
  head: () => ({
    meta: [
      { title: "بنك الأسئلة — لوحة الإدارة" },
      { name: "description", content: "استعراض بنك أسئلة WISO المعتمد حسب المادة والصعوبة." },
      { property: "og:title", content: "بنك الأسئلة — لوحة الإدارة" },
      {
        property: "og:description",
        content: "استعراض بنك أسئلة WISO المعتمد حسب المادة والصعوبة.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminQuestionBankPage,
});

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  basic: "سهل",
  medium: "متوسط",
  hard: "صعب",
  very_hard: "صعب جداً",
  nightmare: "تعجيزي",
};

const PAGE_SIZE = 25;

function AdminQuestionBankPage() {
  const { isAdmin } = useAuth();
  const [subjectId, setSubjectId] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const subjectsQuery = useQuery({
    queryKey: ["admin", "subjects"],
    enabled: isAdmin,
    queryFn: async () => {
      return adminGetQuestionSubjects();
    },
  });

  const bankQuery = useQuery({
    queryKey: ["admin", "question-bank", subjectId, difficulty, search, page],
    enabled: isAdmin,
    queryFn: async () => {
      return adminGetQuestionBank({ data: { ...(subjectId !== "all" ? { subjectId } : {}), ...(difficulty !== "all" ? { difficulty } : {}), ...(search.trim() ? { search } : {}), page, pageSize: PAGE_SIZE } });
    },
  });

  if (!isAdmin) return <Navigate to="/dashboard" />;

  const subjectName = (id: string | null) =>
    subjectsQuery.data?.find((s) => s.id === id)?.name_ar ?? "—";
  const total = bankQuery.data?.count ?? 0;
  const lastPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);

  return (
    <main dir="rtl" className="page-shell">
      <PageHeader
        title="بنك الأسئلة"
        subtitle="بنك WISO هو مصدر إعادة الاستخدام قبل أي توليد جديد. الأسئلة تُنشأ وتُعتمد عبر محرك WISO فقط."
      />

      <section className="surface-panel mt-6 grid gap-3 p-5 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">المادة</Label>
          <Select
            value={subjectId}
            onValueChange={(v) => {
              setSubjectId(v);
              setPage(0);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="كل المواد" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل المواد</SelectItem>
              {(subjectsQuery.data ?? []).map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name_ar}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">مستوى الصعوبة</Label>
          <Select
            value={difficulty}
            onValueChange={(v) => {
              setDifficulty(v);
              setPage(0);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="كل المستويات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل المستويات</SelectItem>
              {(Object.keys(DIFFICULTY_LABEL) as Difficulty[]).map((d) => (
                <SelectItem key={d} value={d}>
                  {DIFFICULTY_LABEL[d]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">بحث في نص السؤال</Label>
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="اكتب كلمة من السؤال"
          />
        </div>
      </section>

      <p className="mt-4 text-sm text-muted-foreground">
        {bankQuery.isPending ? "جارٍ التحميل..." : `${total} سؤال مطابق`}
      </p>

      <div className="mt-4 space-y-3">
        {bankQuery.isPending ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : bankQuery.isError ? (
          <p className="text-sm text-destructive">تعذّر تحميل بنك الأسئلة.</p>
        ) : !bankQuery.data?.rows.length ? (
          <EmptyState
            icon={BookOpenCheck}
            title="لا توجد أسئلة مطابقة"
            description="جرّب تغيير الفلاتر، أو انتظر حتى يولّد المحرك أسئلة جديدة."
          />
        ) : (
          bankQuery.data.rows.map((row) => (
            <article key={row.id} className="surface-panel space-y-2 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="max-w-3xl text-sm font-medium leading-7">{row.prompt}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{DIFFICULTY_LABEL[row.difficulty]}</Badge>
                  <Badge variant={row.quality_status === "approved" ? "default" : "outline"}>
                    {row.quality_status === "approved" ? "معتمد" : row.quality_status}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {subjectName(row.subject_id)}
                {row.lesson_key ? ` · درس ${row.lesson_key}` : ""}
                {row.school_year ? ` · ${row.school_year}` : ""}
                {row.track ? ` · ${row.track}` : ""} · استُخدم {row.usage_count} مرة ·{" "}
                {new Date(row.created_at).toLocaleDateString("ar-EG")}
              </p>
              {row.concepts?.length ? (
                <p className="text-xs text-muted-foreground">المفاهيم: {row.concepts.join("، ")}</p>
              ) : null}
              {row.source_label ? (
                <p className="text-xs text-muted-foreground">
                  المصدر: {row.source_label}
                  {row.source_page_from
                    ? ` · صفحات ${row.source_page_from}${
                        row.source_page_to && row.source_page_to !== row.source_page_from
                          ? `–${row.source_page_to}`
                          : ""
                      }`
                    : ""}
                </p>
              ) : null}
            </article>
          ))
        )}
      </div>

      {total > PAGE_SIZE ? (
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            className="text-sm text-primary disabled:text-muted-foreground"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            السابق
          </button>
          <span className="text-xs text-muted-foreground">
            صفحة {page + 1} من {lastPage + 1}
          </span>
          <button
            type="button"
            className="text-sm text-primary disabled:text-muted-foreground"
            disabled={page >= lastPage}
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
          >
            التالي
          </button>
        </div>
      ) : null}
    </main>
  );
}
