import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, Clock3 } from "lucide-react";
import { toast } from "sonner";
import { aiGeneratePlan } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common/PageHeader";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/plan")({
  head: () => ({
    meta: [
      { title: "خطة السنة الدراسية — WISO" },
      { name: "description", content: "خطتك الدراسية المتكيفة من اليوم وحتى موعدك النهائي." },
    ],
  }),
  component: PlanPage,
});

function PlanPage() {
  const queryClient = useQueryClient();
  const [deadline, setDeadline] = useState("");
  const plan = useQuery({
    queryKey: ["active-plan"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_plans")
        .select("id,title,deadline,daily_hours_target,is_active,study_plan_items(*)")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const subjects = useQuery({
    queryKey: ["plan-subjects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("subjects").select("slug").order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
  const generate = useMutation({
    mutationFn: async () => {
      if (!deadline) throw new Error("اختار موعد إتمام المنهج الأول");
      return aiGeneratePlan({
        data: {
          deadline,
          dailyHoursTarget: 4,
          subjectSlugs: subjects.data?.map((s) => s.slug) ?? [],
        },
      });
    },
    onSuccess: () => {
      toast.success("الخطة اتبنت بناءً على الموعد والمحتوى الحالي.");
      void queryClient.invalidateQueries({ queryKey: ["active-plan"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const complete = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("study_plan_items")
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["active-plan"] }),
  });
  const items = [...(plan.data?.study_plan_items ?? [])].sort((a, b) =>
    (a.starts_on ?? "").localeCompare(b.starts_on ?? ""),
  );
  const done = items.filter((i) => i.completed).length;
  return (
    <main dir="rtl" className="page-shell">
      <PageHeader
        title="خطة السنة"
        subtitle="أنت اختار موعدك، وWISO هيوزّع الطريق ويظبطه مع تقدمك."
      />
      <Card className="mt-7">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="text-sm font-semibold" htmlFor="deadline">
              موعد إتمام المنهج
            </label>
            <Input
              id="deadline"
              className="mt-2 max-w-xs"
              type="date"
              value={deadline || plan.data?.deadline || ""}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          <Button
            disabled={generate.isPending || !subjects.data?.length}
            onClick={() => generate.mutate()}
          >
            {generate.isPending
              ? "WISO بيبني الخطة..."
              : plan.data
                ? "إعادة ضبط الخطة"
                : "ابني خطتي"}
          </Button>
        </CardContent>
      </Card>
      {plan.data ? (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <CalendarDays className="size-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">الموعد النهائي</p>
                  <p className="font-semibold">{plan.data.deadline}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Clock3 className="size-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">الساعات اليومية</p>
                  <p className="font-semibold">{plan.data.daily_hours_target}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <CheckCircle2 className="size-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">الإنجاز</p>
                  <p className="font-semibold">
                    {done} / {items.length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="mt-6 space-y-3">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-4">
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.phase === "revision" ? "مراجعة" : "منهج"} · {item.estimated_minutes}{" "}
                      دقيقة · {item.question_target} سؤال
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={item.completed ? "secondary" : "outline"}
                    disabled={item.completed || complete.isPending}
                    onClick={() => complete.mutate(item.id)}
                  >
                    {item.completed ? "تمت" : "تمّمتها"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card className="mt-8">
          <CardContent className="py-12 text-center text-muted-foreground">
            اختار موعد النهاية واضغط «ابني خطتي». WISO هيقرأ المحتوى والأداء المتاح ويولّد الخطة.
          </CardContent>
        </Card>
      )}
    </main>
  );
}
