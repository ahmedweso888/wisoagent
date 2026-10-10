import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Search, ShieldCheck, ShieldOff, Clock, X } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { adminGetUserDetail, adminGrantAccess, adminListUsers, adminManageTrial, adminRevokeAccess, adminSetRole, adminSetSuspended } from "@/lib/admin.functions";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin/students")({
  head: () => ({
    meta: [
      { title: "إدارة الطلاب — لوحة الإدارة" },
      { name: "description", content: "عرض الطلاب، صلاحيات الوصول، التجربة المجانية، والإيقاف." },
      { property: "og:title", content: "إدارة الطلاب — لوحة الإدارة" },
      {
        property: "og:description",
        content: "عرض الطلاب، صلاحيات الوصول، التجربة المجانية، والإيقاف.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminStudentsPage,
});

type ListedUser = {
  id: string;
  user_code: number;
  full_name: string | null;
  email: string | null;
  created_at: string;
  subscription_status: Database["public"]["Enums"]["subscription_status"];
  platform_access_status: Database["public"]["Enums"]["platform_access_status"];
  access_expires_at: string | null;
  permanent_access: boolean;
  suspended_at: string | null;
  trial_expires_at: string;
  last_active_at: string;
  is_admin: boolean;
  ai_requests: number;
};

type UserDetail = {
  profile: Record<string, unknown> & { id: string; suspended_reason: string | null };
  is_admin: boolean;
  questions_total: number;
  attempts_total: number;
  attempts_correct: number;
  hard_solved: number;
  nightmare_solved: number;
  mistakes_total: number;
  weak_concepts: number;
  ai_requests: number;
  last_ai_activity: string | null;
  documents: { id: string; created_at: string }[];
  audit: { id: string; action: string; created_at: string; metadata: Record<string, unknown> }[];
};

function statusBadge(u: ListedUser) {
  if (u.suspended_at || u.platform_access_status === "suspended") {
    return <Badge variant="destructive">موقوف</Badge>;
  }
  if (u.permanent_access)
    return <Badge className="bg-success text-success-foreground">وصول دائم</Badge>;
  if (u.subscription_status === "active")
    return <Badge className="bg-primary text-primary-foreground">مشترك</Badge>;
  if (new Date(u.trial_expires_at) > new Date())
    return <Badge variant="secondary">تجربة سارية</Badge>;
  return <Badge variant="outline">بلا وصول</Badge>;
}

function AdminStudentsPage() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [suspendReason, setSuspendReason] = useState("");

  useState(() => {
    const t = setTimeout(() => setDebounced(search), 400);
    return () => clearTimeout(t);
  });

  const usersQuery = useQuery({
    queryKey: ["admin", "users", debounced],
    enabled: isAdmin,
    queryFn: async (): Promise<ListedUser[]> => {
      return (await adminListUsers({ data: { ...(debounced ? { search: debounced } : {}), limit: 200 } })) as unknown as ListedUser[];
    },
  });

  const detailQuery = useQuery({
    queryKey: ["admin", "user-detail", selected],
    enabled: isAdmin && Boolean(selected),
    queryFn: async (): Promise<UserDetail> => {
      return (await adminGetUserDetail({ data: { target: selected as string } })) as unknown as UserDetail;
    },
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["admin", "users"] });
    void qc.invalidateQueries({ queryKey: ["admin", "user-detail", selected] });
  };

  const grantAccess = useMutation({
    mutationFn: async (params: { target: string; days?: number; permanent?: boolean }) => {
      await adminGrantAccess({ data: params });
    },
    onSuccess: () => {
      toast.success("تم تحديث صلاحية الوصول");
      invalidate();
    },
    onError: (e: Error) =>
      toast.error(e.message === "forbidden" ? "هذه العملية للمشرفين فقط" : e.message),
  });

  const revokeAccess = useMutation({
    mutationFn: async (target: string) => {
      await adminRevokeAccess({ data: { target } });
    },
    onSuccess: () => {
      toast.success("تم سحب صلاحية الوصول");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setSuspended = useMutation({
    mutationFn: async (params: {
      target: string;
      suspended: boolean;
      reason?: string;
    }) => {
      await adminSetSuspended({ data: params });
    },
    onSuccess: (_data, vars) => {
      toast.success(vars.suspended ? "تم إيقاف الطالب" : "تم إلغاء الإيقاف");
      setSuspendReason("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const manageTrial = useMutation({
    mutationFn: async (params: {
      target: string;
      action: "reset" | "extend" | "disable";
      hours?: number;
    }) => {
      await adminManageTrial({ data: params });
    },
    onSuccess: () => {
      toast.success("تم تحديث التجربة المجانية");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setRole = useMutation({
    mutationFn: async (params: { target: string; enabled: boolean }) => {
      await adminSetRole({ data: params });
    },
    onSuccess: (_data, vars) => {
      toast.success(vars.enabled ? "أصبح مشرفاً" : "أُزيلت صلاحية الإشراف");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!isAdmin) return <Navigate to="/dashboard" />;

  const selectedUser = usersQuery.data?.find((u) => u.id === selected) ?? null;
  const detail = detailQuery.data;

  return (
    <main dir="rtl" className="page-shell">
      <PageHeader
        title="إدارة الطلاب"
        subtitle="بحث في الطلاب، تعديل الصلاحيات، التجربة المجانية، والإيقاف."
        actions={
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو البريد أو الكود"
              className="w-64 pe-3 ps-9"
            />
          </div>
        }
      />

      <div className="mt-7">
        {usersQuery.isPending ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : usersQuery.isError ? (
          <p className="text-sm text-destructive">
            {usersQuery.error instanceof Error && usersQuery.error.message === "forbidden"
              ? "هذه الصفحة متاحة للمشرفين فقط."
              : "تعذّر تحميل قائمة الطلاب."}
          </p>
        ) : !usersQuery.data || usersQuery.data.length === 0 ? (
          <EmptyState
            icon={Search}
            title="لا يوجد طلاب مطابقون"
            description="جرّب كلمة بحث مختلفة."
          />
        ) : (
          <div className="surface-panel overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-right text-muted-foreground">
                  <th className="p-3 font-medium">الطالب</th>
                  <th className="p-3 font-medium">الكود</th>
                  <th className="p-3 font-medium">الحالة</th>
                  <th className="p-3 font-medium">طلبات الذكاء</th>
                  <th className="p-3 font-medium">آخر نشاط</th>
                  <th className="p-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {usersQuery.data.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="p-3">
                      <div className="font-medium">{u.full_name || "بدون اسم"}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </td>
                    <td className="p-3 num text-muted-foreground">{u.user_code}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {statusBadge(u)}
                        {u.is_admin ? <Badge variant="outline">مشرف</Badge> : null}
                      </div>
                    </td>
                    <td className="p-3 num">{u.ai_requests}</td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {u.last_active_at ? new Date(u.last_active_at).toLocaleString("ar-EG") : "—"}
                    </td>
                    <td className="p-3">
                      <Button size="sm" variant="outline" onClick={() => setSelected(u.id)}>
                        التفاصيل
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>{selectedUser?.full_name || "تفاصيل الطالب"}</DialogTitle>
            <DialogDescription>{selectedUser?.email}</DialogDescription>
          </DialogHeader>

          {detailQuery.isPending ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : detailQuery.isError || !detail ? (
            <p className="text-sm text-destructive">تعذّر تحميل تفاصيل الطالب.</p>
          ) : (
            <div className="space-y-6">
              <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MiniStat label="الأسئلة المولّدة" value={detail.questions_total} />
                <MiniStat label="محاولات" value={detail.attempts_total} />
                <MiniStat label="إجابات صحيحة" value={detail.attempts_correct} />
                <MiniStat label="أخطاء" value={detail.mistakes_total} />
                <MiniStat label="صعب/صعب جداً" value={detail.hard_solved} />
                <MiniStat label="تعجيزي" value={detail.nightmare_solved} />
                <MiniStat label="مفاهيم ضعيفة" value={detail.weak_concepts} />
                <MiniStat label="طلبات ذكاء اصطناعي" value={detail.ai_requests} />
              </section>

              <section className="space-y-3 border-t border-border pt-4">
                <h3 className="text-sm font-semibold">إجراءات الوصول</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={grantAccess.isPending}
                    onClick={() => grantAccess.mutate({ target: detail.profile.id, days: 30 })}
                  >
                    <ShieldCheck className="ms-1.5 size-4" />
                    منح 30 يوم
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={grantAccess.isPending}
                    onClick={() =>
                      grantAccess.mutate({ target: detail.profile.id, permanent: true })
                    }
                  >
                    منح وصول دائم
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={revokeAccess.isPending}
                    onClick={() => revokeAccess.mutate(detail.profile.id)}
                  >
                    <ShieldOff className="ms-1.5 size-4" />
                    سحب الوصول
                  </Button>
                </div>
              </section>

              <section className="space-y-3 border-t border-border pt-4">
                <h3 className="text-sm font-semibold">التجربة المجانية</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={manageTrial.isPending}
                    onClick={() =>
                      manageTrial.mutate({ target: detail.profile.id, action: "reset", hours: 24 })
                    }
                  >
                    <Clock className="ms-1.5 size-4" />
                    إعادة ضبط (24 ساعة)
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={manageTrial.isPending}
                    onClick={() =>
                      manageTrial.mutate({ target: detail.profile.id, action: "extend", hours: 24 })
                    }
                  >
                    تمديد 24 ساعة
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={manageTrial.isPending}
                    onClick={() =>
                      manageTrial.mutate({ target: detail.profile.id, action: "disable" })
                    }
                  >
                    إنهاء التجربة
                  </Button>
                </div>
              </section>

              <section className="space-y-3 border-t border-border pt-4">
                <h3 className="text-sm font-semibold">الإيقاف والصلاحيات</h3>
                {detail.profile.suspended_reason ? (
                  <p className="text-xs text-muted-foreground">
                    سبب الإيقاف السابق: {detail.profile.suspended_reason}
                  </p>
                ) : null}
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                    placeholder="سبب الإيقاف (اختياري)"
                    className="w-56"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={setSuspended.isPending}
                    onClick={() =>
                      setSuspended.mutate({
                        target: detail.profile.id,
                        suspended: true,
                        ...(suspendReason ? { reason: suspendReason } : {}),
                      })
                    }
                  >
                    <X className="ms-1.5 size-4" />
                    إيقاف الطالب
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={setSuspended.isPending}
                    onClick={() =>
                      setSuspended.mutate({ target: detail.profile.id, suspended: false })
                    }
                  >
                    إلغاء الإيقاف
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <Button
                    size="sm"
                    variant={detail.is_admin ? "outline" : "secondary"}
                    disabled={setRole.isPending}
                    onClick={() =>
                      setRole.mutate({ target: detail.profile.id, enabled: !detail.is_admin })
                    }
                  >
                    {detail.is_admin ? "إزالة صلاحية الإشراف" : "منح صلاحية الإشراف"}
                  </Button>
                </div>
              </section>

              {detail.audit.length > 0 ? (
                <section className="space-y-2 border-t border-border pt-4">
                  <h3 className="text-sm font-semibold">سجل الإجراءات الإدارية</h3>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {detail.audit.slice(0, 8).map((a) => (
                      <li key={a.id} className="flex items-center justify-between gap-3">
                        <span>{a.action}</span>
                        <span>{new Date(a.created_at).toLocaleString("ar-EG")}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-secondary/60 p-3 text-center">
      <p className="num font-display text-lg font-bold">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
