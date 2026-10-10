import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Wallet,
  FileClock,
  Bot,
  Sparkles,
  ArrowLeft,
  Library,
  BookOpenCheck,
  Package,
  Building2,
  Activity,
} from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { adminGetDashboardCounts, adminGetStats } from "@/lib/admin.functions";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "لوحة تحكم المشرف — WISO" },
      {
        name: "description",
        content: "نظرة عامة على إحصاءات المنصة، الطلاب، المدفوعات، والذكاء الاصطناعي.",
      },
      { property: "og:title", content: "لوحة تحكم المشرف — WISO" },
      {
        property: "og:description",
        content: "نظرة عامة على إحصاءات المنصة، الطلاب، المدفوعات، والذكاء الاصطناعي.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboardPage,
});

type AdminStats = {
  total_users: number;
  active_7d: number;
  trial_users: number;
  trial_expired: number;
  active_subscribers: number;
  expired_subscribers: number;
  suspended: number;
  allowed_now: number;
  ai_requests: number;
  questions_generated: number;
  questions_solved: number;
  documents_uploaded: number;
};

const ADMIN_LINKS = [
  {
    to: "/admin/students",
    title: "إدارة الطلاب",
    description: "الصلاحيات، التجربة المجانية، الاشتراكات، والإيقاف.",
    icon: Users,
  },
  {
    to: "/admin/curriculum",
    title: "المناهج والمواد",
    description: "إدارة المواد ومتابعة الوحدات والدروس الفعلية.",
    icon: Library,
  },
  {
    to: "/admin/questions",
    title: "بنك الأسئلة",
    description: "استعراض الأسئلة المعتمدة حسب المادة والصعوبة.",
    icon: BookOpenCheck,
  },
  {
    to: "/admin/bundles",
    title: "الباقات والاشتراكات",
    description: "الأسعار، الأرصدة، والحدود اليومية.",
    icon: Package,
  },
  {
    to: "/admin/payments",
    title: "طلبات الدفع",
    description: "مراجعة إثباتات التحويل وقبولها أو رفضها.",
    icon: Wallet,
  },
  {
    to: "/admin/centers",
    title: "المراكز والأكواد",
    description: "إنشاء المراكز وتوليد أكواد التفعيل ومتابعتها.",
    icon: Building2,
  },
  {
    to: "/admin/jobs",
    title: "مهام الذكاء وسجلاته",
    description: "متابعة مهام التوليد وسجل الاستخدام بالكامل.",
    icon: Activity,
  },
  {
    to: "/admin/ai",
    title: "إعدادات الذكاء",
    description: "تفعيل الذكاء الاصطناعي وإيقاف الطوارئ.",
    icon: Bot,
  },
  {
    to: "/admin/requests",
    title: "الطلبات الخاصة",
    description: "مراجعة طلبات الطلاب المرفقة بملفات.",
    icon: FileClock,
  },
  {
    to: "/admin/center-requests",
    title: "طلبات السناتر",
    description: "مراجعة طلبات التعاون المقدمة من الطلاب والمستخدمين.",
    icon: Building2,
  },
  {
    to: "/admin/system",
    title: "إعدادات النظام",
    description: "حالة المنصة، المسابقة، وملخص الإيرادات.",
    icon: Sparkles,
  },
] as const;

function AdminDashboardPage() {
  const { isAdmin } = useAuth();

  const statsQuery = useQuery({
    queryKey: ["admin", "stats"],
    enabled: isAdmin,
    queryFn: async (): Promise<AdminStats> => {
      return (await adminGetStats()) as unknown as AdminStats;
    },
  });

  const countsQuery = useQuery({
    queryKey: ["admin", "dashboard-counts"],
    enabled: isAdmin,
    queryFn: async () => {
      return adminGetDashboardCounts();
    },
  });

  if (!isAdmin) return <Navigate to="/dashboard" />;

  const isPending = statsQuery.isPending || countsQuery.isPending;
  const isError = statsQuery.isError || countsQuery.isError;

  return (
    <main dir="rtl" className="page-shell">
      <PageHeader
        title="لوحة تحكم المشرف"
        subtitle="نظرة عامة سريعة على المنصة مع روابط لإدارة الطلاب والمدفوعات والباقات والذكاء الاصطناعي."
      />

      {isPending ? (
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="mt-7 space-y-3">
          <p className="text-sm text-destructive">
            {statsQuery.error instanceof Error && statsQuery.error.message === "forbidden"
              ? "هذه الصفحة متاحة للمشرفين فقط."
              : "تعذّر تحميل الإحصاءات."}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              void statsQuery.refetch();
              void countsQuery.refetch();
            }}
          >
            إعادة المحاولة
          </Button>
        </div>
      ) : (
        <>
          <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="إجمالي الطلاب"
              value={statsQuery.data?.total_users ?? 0}
              tone="primary"
            />
            <StatCard label="نشِطون آخر 7 أيام" value={statsQuery.data?.active_7d ?? 0} />
            <StatCard
              label="مشتركون فعّالون"
              value={statsQuery.data?.active_subscribers ?? 0}
              tone="success"
            />
            <StatCard
              label="مستخدمون موقوفون"
              value={statsQuery.data?.suspended ?? 0}
              tone="destructive"
            />
            <StatCard
              label="طلبات دفع معلّقة"
              value={countsQuery.data?.pendingPayments ?? 0}
              tone="accent"
            />
            <StatCard
              label="طلبات خاصة معلّقة"
              value={countsQuery.data?.pendingSpecial ?? 0}
              tone="accent"
            />
            <StatCard
              label="طلبات سناتر معلّقة"
              value={countsQuery.data?.pendingCenterRequests ?? 0}
              tone="accent"
            />
            <StatCard
              label="مهام ذكاء اصطناعي جارية"
              value={countsQuery.data?.runningAiJobs ?? 0}
              hint={`من إجمالي ${countsQuery.data?.totalAiJobs ?? 0} مهمة`}
            />
            <StatCard label="طلبات ذكاء اصطناعي" value={statsQuery.data?.ai_requests ?? 0} />
          </section>

          <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ADMIN_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="surface-panel group flex flex-col gap-3 p-5 transition-colors hover:border-primary/40"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
                  <item.icon className="size-5" />
                </span>
                <div>
                  <h2 className="font-display text-base font-semibold">{item.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
                <span className="mt-auto flex items-center gap-1 text-sm font-medium text-primary">
                  فتح
                  <ArrowLeft className="size-4 rotate-180 transition-transform group-hover:-translate-x-1" />
                </span>
              </Link>
            ))}
          </section>
        </>
      )}
    </main>
  );
}
