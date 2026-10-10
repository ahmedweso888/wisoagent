import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Package } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { adminCreateSubscriptionPlan, adminGetSubscriptionPlans, adminUpdateSubscriptionPlan } from "@/lib/admin.functions";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

type Plan = Database["public"]["Tables"]["subscription_plans"]["Row"];

export const Route = createFileRoute("/_authenticated/admin/bundles")({
  head: () => ({
    meta: [
      { title: "الباقات والاشتراكات — لوحة الإدارة" },
      { name: "description", content: "إدارة باقات WISO: الأسعار، الأرصدة، والحدود اليومية." },
      { property: "og:title", content: "الباقات والاشتراكات — لوحة الإدارة" },
      {
        property: "og:description",
        content: "إدارة باقات WISO: الأسعار، الأرصدة، والحدود اليومية.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminBundlesPage,
});

type Draft = {
  name_ar: string;
  name_en: string;
  price_egp: string;
  discount_percent: string;
  question_credits: string;
  image_credits: string;
  pdf_credits: string;
  daily_question_limit: string;
  sort_order: string;
};

const EMPTY_DRAFT: Draft = {
  name_ar: "",
  name_en: "",
  price_egp: "0",
  discount_percent: "0",
  question_credits: "0",
  image_credits: "0",
  pdf_credits: "0",
  daily_question_limit: "0",
  sort_order: "0",
};

function toDraft(plan: Plan): Draft {
  return {
    name_ar: plan.name_ar,
    name_en: plan.name_en,
    price_egp: String(plan.price_egp),
    discount_percent: String(plan.discount_percent),
    question_credits: String(plan.question_credits),
    image_credits: String(plan.image_credits),
    pdf_credits: String(plan.pdf_credits),
    daily_question_limit: String(plan.daily_question_limit),
    sort_order: String(plan.sort_order),
  };
}

function draftToRow(draft: Draft) {
  return {
    name_ar: draft.name_ar.trim(),
    name_en: draft.name_en.trim(),
    price_egp: Number(draft.price_egp) || 0,
    discount_percent: Number(draft.discount_percent) || 0,
    question_credits: Number(draft.question_credits) || 0,
    image_credits: Number(draft.image_credits) || 0,
    pdf_credits: Number(draft.pdf_credits) || 0,
    daily_question_limit: Number(draft.daily_question_limit) || 0,
    sort_order: Number(draft.sort_order) || 0,
  };
}

const FIELDS: { key: keyof Draft; label: string; numeric: boolean }[] = [
  { key: "name_ar", label: "الاسم بالعربية", numeric: false },
  { key: "name_en", label: "الاسم بالإنجليزية", numeric: false },
  { key: "price_egp", label: "السعر (ج.م)", numeric: true },
  { key: "discount_percent", label: "نسبة الخصم %", numeric: true },
  { key: "question_credits", label: "رصيد الأسئلة", numeric: true },
  { key: "image_credits", label: "رصيد الصور", numeric: true },
  { key: "pdf_credits", label: "رصيد ملفات PDF", numeric: true },
  { key: "daily_question_limit", label: "حد الأسئلة اليومي", numeric: true },
  { key: "sort_order", label: "الترتيب", numeric: true },
];

function DraftForm({
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
            inputMode={field.numeric ? "decimal" : "text"}
            onChange={(e) => onChange({ ...draft, [field.key]: e.target.value })}
          />
        </div>
      ))}
    </div>
  );
}

function AdminBundlesPage() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [creating, setCreating] = useState(false);
  const [newDraft, setNewDraft] = useState<Draft>(EMPTY_DRAFT);

  const plansQuery = useQuery({
    queryKey: ["admin", "plans"],
    enabled: isAdmin,
    queryFn: async (): Promise<Plan[]> => {
      return (await adminGetSubscriptionPlans()) as Plan[];
    },
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["admin", "plans"] });
    void qc.invalidateQueries({ queryKey: ["plans"] });
  };

  const save = useMutation({
    mutationFn: async (params: { id: string; draft: Draft }) => {
      await adminUpdateSubscriptionPlan({ data: { id: params.id, patch: draftToRow(params.draft) } });
    },
    onSuccess: () => {
      toast.success("تم حفظ الباقة");
      setEditing(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async (params: { id: string; active: boolean }) => {
      await adminUpdateSubscriptionPlan({ data: { id: params.id, patch: { is_active: params.active } } });
    },
    onSuccess: () => {
      toast.success("تم تحديث حالة الباقة");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const create = useMutation({
    mutationFn: async (value: Draft) => {
      await adminCreateSubscriptionPlan({ data: { ...draftToRow(value), is_active: true } });
    },
    onSuccess: () => {
      toast.success("تمت إضافة الباقة");
      setCreating(false);
      setNewDraft(EMPTY_DRAFT);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!isAdmin) return <Navigate to="/dashboard" />;

  return (
    <main dir="rtl" className="page-shell">
      <PageHeader
        title="الباقات والاشتراكات"
        subtitle="هذه الباقات هي المصدر الوحيد لأسعار المنصة وأرصدة الطلاب."
        actions={
          <Button variant={creating ? "outline" : "default"} onClick={() => setCreating((v) => !v)}>
            {creating ? "إلغاء" : "إضافة باقة"}
          </Button>
        }
      />

      {creating ? (
        <section className="surface-panel mt-6 space-y-4 p-5">
          <h2 className="font-display text-base font-semibold">باقة جديدة</h2>
          <DraftForm draft={newDraft} onChange={setNewDraft} disabled={create.isPending} />
          <Button
            disabled={create.isPending || !newDraft.name_ar.trim()}
            onClick={() => create.mutate(newDraft)}
          >
            حفظ الباقة
          </Button>
        </section>
      ) : null}

      <div className="mt-6 space-y-4">
        {plansQuery.isPending ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
        ) : plansQuery.isError ? (
          <p className="text-sm text-destructive">تعذّر تحميل الباقات.</p>
        ) : !plansQuery.data?.length ? (
          <EmptyState
            icon={Package}
            title="لا توجد باقات"
            description="أضف أول باقة ليتمكن الطلاب من الاشتراك."
          />
        ) : (
          plansQuery.data.map((plan) => (
            <div key={plan.id} className="surface-panel space-y-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-base font-semibold">
                    {plan.name_ar}{" "}
                    <span className="text-sm text-muted-foreground">({plan.name_en})</span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {plan.price_egp} ج.م
                    {plan.discount_percent > 0 ? ` · خصم ${plan.discount_percent}%` : ""} ·{" "}
                    {plan.question_credits} سؤال · {plan.image_credits} صورة · {plan.pdf_credits}{" "}
                    ملف · حد يومي {plan.daily_question_limit}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Label className="text-xs text-muted-foreground">مفعّلة</Label>
                  <Switch
                    checked={plan.is_active}
                    disabled={toggleActive.isPending}
                    onCheckedChange={(checked) =>
                      toggleActive.mutate({ id: plan.id, active: checked })
                    }
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (editing === plan.id) {
                        setEditing(null);
                        return;
                      }
                      setEditing(plan.id);
                      setDraft(toDraft(plan));
                    }}
                  >
                    {editing === plan.id ? "إغلاق" : "تعديل"}
                  </Button>
                </div>
              </div>

              {editing === plan.id ? (
                <div className="space-y-4 border-t border-border pt-4">
                  <DraftForm draft={draft} onChange={setDraft} disabled={save.isPending} />
                  <Button
                    size="sm"
                    disabled={save.isPending}
                    onClick={() => save.mutate({ id: plan.id, draft })}
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
