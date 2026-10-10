import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import { adminGetAiSettings, adminUpdateAiSettings } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { PROVIDER_LABELS } from "@/services/ai/config";
import type { Database } from "@/integrations/supabase/types";
import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";

type AiSettings = Database["public"]["Tables"]["ai_settings"]["Row"];

export const Route = createFileRoute("/_authenticated/admin/ai")({
  head: () => ({
    meta: [
      { title: "إعدادات ذكاء WISO — لوحة الإدارة" },
      { name: "description", content: "التحكم في ذكاء WISO: التفعيل، النموذج، وإيقاف الطوارئ." },
      { property: "og:title", content: "إعدادات ذكاء WISO — لوحة الإدارة" },
      {
        property: "og:description",
        content: "التحكم في ذكاء WISO: التفعيل، النموذج، وإيقاف الطوارئ.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminAiSettingsPage,
});

function statusOf(s: AiSettings) {
  if (s.ai_emergency_disabled) return { label: "متوقف — إيقاف طوارئ", tone: "text-destructive" };
  if (!s.enabled || !s.ai_mode_enabled) return { label: "متوقف", tone: "text-muted-foreground" };
  return { label: "يعمل", tone: "text-primary" };
}

function AdminAiSettingsPage() {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ["admin", "ai-settings"],
    queryFn: async (): Promise<AiSettings> => {
      return adminGetAiSettings();
    },
  });

  const settings = settingsQuery.data;

  const update = useMutation({
    mutationFn: async (patch: {
      _model?: string;
      _ai_mode_enabled?: boolean;
      _ai_emergency_disabled?: boolean;
      _enabled?: boolean;
    }): Promise<AiSettings> => {
      return adminUpdateAiSettings({ data: patch }) as Promise<AiSettings>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["admin", "ai-settings"], data);
      toast.success("تم حفظ الإعدادات");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "تعذّر الحفظ";
      toast.error(message === "forbidden" ? "هذه الصفحة للمشرفين فقط" : message);
    },
  });

  if (settingsQuery.isPending) {
    return (
      <main dir="rtl" className="page-shell max-w-5xl space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-32 w-full" />
      </main>
    );
  }

  if (settingsQuery.isError || !settings) {
    const message =
      settingsQuery.error instanceof Error ? settingsQuery.error.message : "خطأ غير معروف";
    return (
      <main dir="rtl" className="page-shell max-w-5xl">
        <h1 className="font-display text-2xl font-bold">إعدادات ذكاء WISO</h1>
        <p className="mt-3 text-sm text-destructive">
          {message.includes("permission") || message.includes("forbidden")
            ? "هذه الصفحة متاحة للمشرفين فقط."
            : `تعذّر تحميل الإعدادات: ${message}`}
        </p>
        <Button className="mt-4" variant="outline" onClick={() => settingsQuery.refetch()}>
          إعادة المحاولة
        </Button>
      </main>
    );
  }

  const status = statusOf(settings);
  const saving = update.isPending;

  return (
    <main dir="rtl" className="page-shell max-w-5xl">
      <PageHeader
        title="إعدادات ذكاء WISO"
        subtitle={PROVIDER_LABELS.openai}
        actions={
          <Badge
            variant={
              settings.ai_emergency_disabled
                ? "destructive"
                : settings.enabled
                  ? "default"
                  : "secondary"
            }
          >
            الحالة: {status.label}
          </Badge>
        }
      />

      <section className="surface-panel mt-7 divide-y divide-border px-5">
        <div className="flex items-center justify-between gap-6 py-5">
          <div>
            <Label htmlFor="ai-enabled" className="text-base">
              تفعيل الذكاء الاصطناعي
            </Label>
            <p className="mt-1 text-sm text-muted-foreground">
              إيقافه يمنع كل مهام الذكاء الاصطناعي في المنصة.
            </p>
          </div>
          <Switch
            id="ai-enabled"
            disabled={saving}
            checked={settings.enabled && settings.ai_mode_enabled}
            onCheckedChange={(checked) =>
              update.mutate({ _enabled: checked, _ai_mode_enabled: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between gap-6 py-5">
          <div>
            <Label htmlFor="ai-emergency" className="text-base">
              إيقاف طوارئ للذكاء الاصطناعي
            </Label>
            <p className="mt-1 text-sm text-muted-foreground">
              يوقف كل الطلبات فوراً بغضّ النظر عن باقي الإعدادات.
            </p>
          </div>
          <Switch
            id="ai-emergency"
            disabled={saving}
            checked={settings.ai_emergency_disabled}
            onCheckedChange={(checked) => update.mutate({ _ai_emergency_disabled: checked })}
          />
        </div>

        <div className="py-5">
          <Label className="text-base">التوجيه الذكي</Label>
          <p className="mt-1 text-sm leading-7 text-muted-foreground">
            لا يختار المشرف أو الطالب نموذجاً بعينه. WISO يوجّه المهمة داخلياً إلى Luna أو Terra أو
            Sol حسب نوعها وصعوبتها. «تعجيزي» يذهب مباشرة إلى Sol، والمهام الثقيلة الخاصة بالمعالجة
            تذهب إلى Luna.
          </p>
        </div>
      </section>

      <p className="mt-8 text-xs text-muted-foreground">
        مفاتيح الوصول للذكاء الاصطناعي تُدار على الخادم فقط ولا تظهر هنا إطلاقاً.
      </p>
    </main>
  );
}
