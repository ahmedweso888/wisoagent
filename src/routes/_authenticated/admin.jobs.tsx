import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Activity } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { StatCard } from "@/components/common/StatCard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminGetAiJobs, adminGetAiLogs, adminGetAiStats } from "@/lib/admin.functions";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/admin/jobs")({
  head: () => ({
    meta: [
      { title: "مهام الذكاء وسجلاته — لوحة الإدارة" },
      { name: "description", content: "متابعة مهام توليد الأسئلة وسجلات استخدام ذكاء WISO." },
      { property: "og:title", content: "مهام الذكاء وسجلاته — لوحة الإدارة" },
      {
        property: "og:description",
        content: "متابعة مهام توليد الأسئلة وسجلات استخدام ذكاء WISO.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminJobsPage,
});

type AiStats = {
  requests_today: number;
  requests_month: number;
  questions_generated: number;
  documents_analyzed: number;
  images_analyzed: number;
  tokens_used: number;
  errors_today: number;
  errors_total: number;
};

const STATUS_LABEL: Record<string, string> = {
  running: "جارية",
  completed: "مكتملة",
  partial: "غير مكتملة",
  failed: "فاشلة",
  ok: "ناجحة",
  error: "خطأ",
};

function AdminJobsPage() {
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState<"jobs" | "logs">("jobs");

  const statsQuery = useQuery({
    queryKey: ["admin", "ai-stats"],
    enabled: isAdmin,
    queryFn: async (): Promise<AiStats> => {
      return (await adminGetAiStats()) as unknown as AiStats;
    },
  });

  const jobsQuery = useQuery({
    queryKey: ["admin", "ai-jobs"],
    enabled: isAdmin && tab === "jobs",
    refetchInterval: tab === "jobs" ? 15_000 : false,
    queryFn: async () => {
      return adminGetAiJobs();
    },
  });

  const logsQuery = useQuery({
    queryKey: ["admin", "ai-logs"],
    enabled: isAdmin && tab === "logs",
    queryFn: async () => {
      return adminGetAiLogs();
    },
  });

  if (!isAdmin) return <Navigate to="/dashboard" />;

  return (
    <main dir="rtl" className="page-shell">
      <PageHeader
        title="مهام الذكاء وسجلاته"
        subtitle="كل عملية لها معرّف طلب واحد يتتبّعها من المحرك حتى تسليم الأسئلة وخصم الرصيد."
      />

      <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsQuery.isPending ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
        ) : statsQuery.isError ? (
          <p className="text-sm text-destructive">تعذّر تحميل إحصاءات الذكاء.</p>
        ) : (
          <>
            <StatCard
              label="طلبات اليوم"
              value={statsQuery.data?.requests_today ?? 0}
              tone="primary"
            />
            <StatCard label="طلبات هذا الشهر" value={statsQuery.data?.requests_month ?? 0} />
            <StatCard
              label="أسئلة مولّدة"
              value={statsQuery.data?.questions_generated ?? 0}
              tone="success"
            />
            <StatCard
              label="أخطاء اليوم"
              value={statsQuery.data?.errors_today ?? 0}
              hint={`إجمالي الأخطاء ${statsQuery.data?.errors_total ?? 0}`}
              tone="destructive"
            />
          </>
        )}
      </section>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mt-8">
        <TabsList>
          <TabsTrigger value="jobs">مهام التوليد</TabsTrigger>
          <TabsTrigger value="logs">سجل الاستخدام</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-5 space-y-3">
        {tab === "jobs" ? (
          jobsQuery.isPending ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
          ) : jobsQuery.isError ? (
            <p className="text-sm text-destructive">تعذّر تحميل المهام.</p>
          ) : !jobsQuery.data?.length ? (
            <EmptyState
              icon={Activity}
              title="لا توجد مهام بعد"
              description="ستظهر هنا مهام توليد الأسئلة فور بدء الطلاب باستخدام المولّد."
            />
          ) : (
            jobsQuery.data.map((job) => (
              <article key={job.request_id} className="surface-panel space-y-2 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <code className="text-xs text-muted-foreground">{job.request_id}</code>
                  <Badge
                    variant={
                      job.status === "completed"
                        ? "default"
                        : job.status === "failed"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {STATUS_LABEL[job.status] ?? job.status}
                  </Badge>
                </div>
                <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-4">
                  <span>مطلوب: {job.requested_count}</span>
                  <span>معاد استخدامه: {job.reused_count}</span>
                  <span>مولّد: {job.generated_count}</span>
                  <span>مقبول: {job.accepted_count}</span>
                  <span>مرفوض: {job.rejected_count}</span>
                  <span>متبقٍ: {job.remaining_count}</span>
                  <span>إعادات: {job.retry_count}</span>
                  <span>استبدالات: {job.replacement_count}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(job.created_at).toLocaleString("ar-EG")}
                  {job.difficulty ? ` · صعوبة ${job.difficulty}` : ""}
                </p>
                {job.error ? <p className="text-xs text-destructive">{job.error}</p> : null}
              </article>
            ))
          )
        ) : logsQuery.isPending ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
        ) : logsQuery.isError ? (
          <p className="text-sm text-destructive">تعذّر تحميل السجل.</p>
        ) : !logsQuery.data?.length ? (
          <EmptyState
            icon={Activity}
            title="لا توجد سجلات"
            description="يظهر هنا سجل كل عملية ذكاء اصطناعي مع الرموز والزمن والحالة."
          />
        ) : (
          logsQuery.data.map((log) => (
            <article key={log.id} className="surface-panel space-y-2 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <code className="text-xs text-muted-foreground">{log.request_id ?? log.id}</code>
                <Badge variant={log.status === "ok" ? "default" : "destructive"}>
                  {STATUS_LABEL[log.status] ?? log.status}
                </Badge>
              </div>
              <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-4">
                <span>المهمة: {log.agent}</span>
                <span>أسئلة: {log.questions_generated}</span>
                <span>مقبول: {log.questions_approved}</span>
                <span>مرفوض: {log.questions_rejected}</span>
                <span>إعادات: {log.retries}</span>
                <span>تصعيدات: {log.escalations}</span>
                <span>رموز: {log.tokens_used}</span>
                <span>زمن: {log.latency_ms ?? "—"} مللي ثانية</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(log.created_at).toLocaleString("ar-EG")}
              </p>
              {log.error ? <p className="text-xs text-destructive">{log.error}</p> : null}
            </article>
          ))
        )}
      </div>
    </main>
  );
}
