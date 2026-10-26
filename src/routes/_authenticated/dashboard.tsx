import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarClock,
  CircleAlert,
  CircleCheck,
  Target,
  Wrench,
  ArrowLeft,
  MessageCircle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/common/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "الرئيسية — WISO" },
      { name: "description", content: "لوحتك الدراسية في WISO." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { profile } = useAuth();

  const today = useQuery({
    queryKey: ["daily-progress"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_progress")
        .select("*")
        .eq("day", new Date().toISOString().slice(0, 10))
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const mastery = useQuery({
    queryKey: ["mastery-summary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mastery")
        .select("mastery_score,is_weak,subjects(name_ar)")
        .order("mastery_score", { ascending: true })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  const plan = useQuery({
    queryKey: ["today-plan"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_plans")
        .select("deadline,daily_hours_target,study_plan_items(*)")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const progress = today.data?.questions_solved ?? 0;

  const completed = (plan.data?.study_plan_items ?? []).filter(
    (item) => item.completed,
  ).length;

  const total = plan.data?.study_plan_items?.length ?? 0;

  return (
    <main dir="rtl" className="page-shell">
      <PageHeader
        title={`أهلاً ${profile?.full_name?.split(" ")[0] ?? "بك"}`}
        subtitle="هنا هتلاقي خطتك ومستواك الحقيقي، وكل حاجة بتتطور مع حلك."
      />

      {/* أدوات WISO */}
      <Card className="mt-7 overflow-hidden border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col gap-5 p-5">

          {/* القسم الرئيسي للأدوات */}
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Wrench className="size-6 text-primary" />
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  أدوات WISO في مكان واحد
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  انتقل إلى صفحة الأدوات واكتشف الأدوات المتاحة لحسابك.
                </p>
              </div>
            </div>

            <Button asChild className="w-full gap-2 sm:w-auto">
              <Link to="/tools">
                اكتشف أدوات WISO
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
          </div>

          {/* خط فاصل */}
          <div className="h-px w-full bg-border/70" />

          {/* أزرار دعم المنصة */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <MessageCircle className="size-5 text-primary" />
              </div>

              <div>
                <h3 className="text-sm font-bold">
                  محتاج مساعدة؟
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  فريق دعم WISO جاهز يساعدك عبر واتساب.
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">

              {/* دعم المنصة 1 */}
              <Button
                asChild
                variant="outline"
                className="w-full gap-2 border-primary/30 hover:bg-primary/10 sm:w-auto"
              >
                <a
                  href="https://wa.me/201003244623"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="size-4" />
                  دعم المنصة 1
                </a>
              </Button>

              {/* دعم المنصة 2 */}
              <Button
                asChild
                variant="outline"
                className="w-full gap-2 border-primary/30 hover:bg-primary/10 sm:w-auto"
              >
                <a
                  href="https://wa.me/201068622142"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="size-4" />
                  دعم المنصة 2
                </a>
              </Button>

            </div>
          </div>

        </CardContent>
      </Card>

      {/* إحصائيات الطالب */}
      <div className="mt-7 grid gap-4 md:grid-cols-3">

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Target className="size-5 text-primary" />

              <div>
                <p className="text-xs text-muted-foreground">
                  أسئلة اليوم
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {progress}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <CircleCheck className="size-5 text-primary" />

              <div>
                <p className="text-xs text-muted-foreground">
                  إنجاز الخطة
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {total ? `${completed}/${total}` : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <CalendarClock className="size-5 text-primary" />

              <div>
                <p className="text-xs text-muted-foreground">
                  موعد النهاية
                </p>

                <p className="mt-1 text-lg font-bold">
                  {plan.data?.deadline ?? "لسه ما حددتش"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* مستوى الطالب وخطة اليوم */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_.75fr]">

        {/* نقاط الضعف */}
        <Card>
          <CardContent className="p-6">

            <h2 className="font-display text-xl font-bold">
              نقط محتاجة تركيز
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              دي مبنية على إجاباتك ومحاولاتك الفعلية.
            </p>

            <div className="mt-6 space-y-5">
              {mastery.data?.length ? (
                mastery.data.map((item) => (
                  <div
                    key={`${item.subjects?.name_ar}-${item.mastery_score}`}
                  >
                    <div className="mb-2 flex justify-between text-sm">
                      <span>
                        {item.subjects?.name_ar ?? "مادة"}
                      </span>

                      <span>
                        {Math.round(Number(item.mastery_score))}%
                      </span>
                    </div>

                    <Progress
                      value={Number(item.mastery_score)}
                    />
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  حل شوية أسئلة الأول، وWISO هيبدأ يبني صورة حقيقية عن
                  مستواك.
                </div>
              )}
            </div>

          </CardContent>
        </Card>

        {/* خطة اليوم */}
        <Card>
          <CardContent className="p-6">

            <h2 className="font-display text-xl font-bold">
              خطة اليوم
            </h2>

            <div className="mt-5 space-y-3">

              {plan.data?.study_plan_items
                ?.filter(
                  (item) =>
                    item.starts_on ===
                    new Date().toISOString().slice(0, 10),
                )
                .slice(0, 5)
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-xl border p-3"
                  >
                    <CircleCheck
                      className={`mt-0.5 size-4 ${
                        item.completed
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />

                    <div>
                      <p className="text-sm font-semibold">
                        {item.title}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.estimated_minutes} دقيقة ·{" "}
                        {item.question_target} سؤال
                      </p>
                    </div>
                  </div>
                )) ?? null}

              {!plan.data && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CircleAlert className="size-4" />
                  اختار موعد النهاية من صفحة الخطة.
                </div>
              )}

            </div>

          </CardContent>
        </Card>

      </div>
    </main>
  );
}
