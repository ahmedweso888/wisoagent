import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Clock,
  Volume2,
  VolumeX,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute(
  "/_authenticated/admin/notifications"
)({
  component: AdminNotificationsPage,
});

type AdminNotification = {
  id: string;
  title: string;
  body: string | null;
  kind: string;
  metadata: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};

function AdminNotificationsPage() {
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();

  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "default"
  );

  const [soundEnabled, setSoundEnabled] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const initializedRef = useRef(false);
  const knownIdsRef = useRef(new Set<string>());

  useEffect(() => {
    audioRef.current = new Audio("/sounds/admin-notification.mp3");

    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const {
    data: notifications = [],
    isLoading: isNotificationsLoading,
    error,
    refetch,
  } = useQuery<AdminNotification[]>({
    queryKey: ["admin", "notifications"],

    queryFn: async () => {
      // RLS في قاعدة البيانات هي التي تسمح للأدمن بالقراءة فقط.
      // نستخدم any مؤقتًا إلى أن يتم تحديث أنواع Supabase للجدول الجديد.
      const { data, error } = await (supabase as any)
        .from("admin_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      return (data ?? []) as AdminNotification[];
    },

    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  });

  // اكتشاف الإشعارات الجديدة فقط، حتى لا نكرر التنبيه
  // لكل الإشعارات القديمة عند فتح الصفحة.
  useEffect(() => {
    if (!notifications.length) return;

    if (!initializedRef.current) {
      knownIdsRef.current = new Set(
        notifications.map((notification) => notification.id)
      );

      initializedRef.current = true;
      return;
    }

    const freshNotifications = notifications.filter(
      (notification) => !knownIdsRef.current.has(notification.id)
    );

    if (!freshNotifications.length) return;

    freshNotifications.forEach((notification) => {
      knownIdsRef.current.add(notification.id);
    });

    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      void audioRef.current.play().catch(() => {
        // قد يمنع المتصفح تشغيل الصوت قبل تفاعل المستخدم معه.
      });
    }

    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      freshNotifications.forEach((notification) => {
        try {
          const browserNotification = new Notification(
            notification.title,
            {
              body: notification.body ?? "وصل طلب جديد إلى لوحة الإدارة.",
              icon: "/favicon.ico",
              tag: notification.id,
            }
          );

          browserNotification.onclick = () => {
            window.focus();
            browserNotification.close();
          };
        } catch (error) {
          console.error("تعذر عرض إشعار المتصفح:", error);
        }
      });
    }
  }, [notifications, soundEnabled]);

  async function enableDeviceNotifications() {
    if (!("Notification" in window)) {
      alert(
        "المتصفح لا يدعم إشعارات النظام. جرّب فتح المنصة في Chrome."
      );
      return;
    }

    try {
      const result = await Notification.requestPermission();

      setPermission(result);

      if (result === "granted") {
        alert("تم تفعيل صلاحية إشعارات المتصفح على هذا الجهاز.");

        // محاولة تجهيز الصوت بعد تفاعل المستخدم.
        if (audioRef.current && soundEnabled) {
          try {
            audioRef.current.currentTime = 0;
            await audioRef.current.play();
          } catch {
            // يمكن تشغيل الصوت لاحقًا عند وصول إشعار جديد.
          }
        }
      } else if (result === "denied") {
        alert(
          "الإشعارات مرفوضة من إعدادات المتصفح. اسمح بها من إعدادات الموقع."
        );
      }
    } catch (error) {
      console.error("فشل طلب صلاحية الإشعارات:", error);
      alert("تعذر طلب صلاحية الإشعارات.");
    }
  }

  async function markAsRead(id: string) {
    const { error } = await (supabase as any)
      .from("admin_notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      alert("تعذر تعليم الإشعار كمقروء.");
      return;
    }

    await queryClient.invalidateQueries({
      queryKey: ["admin", "notifications"],
    });
  }

  async function markAllAsRead() {
    const unreadIds = notifications
      .filter((notification) => !notification.read_at)
      .map((notification) => notification.id);

    if (!unreadIds.length) return;

    const { error } = await (supabase as any)
      .from("admin_notifications")
      .update({ read_at: new Date().toISOString() })
      .in("id", unreadIds);

    if (error) {
      alert("تعذر تعليم الإشعارات كمقروءة.");
      return;
    }

    await queryClient.invalidateQueries({
      queryKey: ["admin", "notifications"],
    });
  }

  

  if (!user || !isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.read_at
  ).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8" dir="rtl">
      {/* رأس الصفحة */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck size={17} />
            لوحة تحكم الأدمن
          </div>

          <h1 className="flex items-center gap-3 text-2xl font-bold md:text-3xl">
            <BellRing className="text-primary" size={30} />
            إشعارات الإدارة
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            تابع طلبات الدفع والأدوات الجديدة من مكان واحد.
          </p>
        </div>

        <button
          onClick={() => void refetch()}
          className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition hover:bg-muted"
        >
          <RefreshCw size={16} />
          تحديث
        </button>
      </div>

      {/* إعدادات الإشعارات */}
      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">
          إعدادات إشعارات الجهاز
        </h2>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Bell size={21} className="text-primary" />

              <div>
                <p className="font-medium">إشعارات المتصفح</p>
                <p className="text-sm text-muted-foreground">
                  السماح بعرض إشعار عند وصول طلب جديد.
                </p>
              </div>
            </div>

            <button
              onClick={() => void enableDeviceNotifications()}
              disabled={permission === "granted"}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {permission === "granted"
                ? "تم تفعيل الإشعارات"
                : "تفعيل الإشعارات"}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <div className="flex items-center gap-3">
              {soundEnabled ? (
                <Volume2 size={21} className="text-primary" />
              ) : (
                <VolumeX size={21} className="text-muted-foreground" />
              )}

              <div>
                <p className="font-medium">صوت الإشعار</p>
                <p className="text-sm text-muted-foreground">
                  تشغيل الصوت عند اكتشاف طلب جديد.
                </p>
              </div>
            </div>

            <button
              onClick={() => setSoundEnabled((enabled) => !enabled)}
              className="rounded-xl border px-4 py-2 text-sm transition hover:bg-muted"
            >
              {soundEnabled ? "كتم الصوت" : "تشغيل الصوت"}
            </button>
          </div>

          {permission === "denied" && (
            <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              الإشعارات محظورة من المتصفح. افتح إعدادات الموقع واسمح
              بالإشعارات، ثم أعد تحميل الصفحة.
            </p>
          )}
        </div>
      </section>

      {/* ملخص الإشعارات */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">إجمالي الإشعارات</p>
          <p className="mt-2 text-3xl font-bold">{notifications.length}</p>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">غير المقروءة</p>
          <p className="mt-2 text-3xl font-bold text-primary">
            {unreadCount}
          </p>
        </div>
      </div>

      {/* قائمة الإشعارات */}
      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
          <div>
            <h2 className="text-lg font-semibold">آخر الإشعارات</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              يتم تحديث القائمة تلقائيًا كل 10 ثوانٍ.
            </p>
          </div>

          <button
            onClick={() => void markAllAsRead()}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition hover:bg-muted disabled:opacity-50"
          >
            <CheckCheck size={16} />
            تعليم الكل كمقروء
          </button>
        </div>

        {isNotificationsLoading ? (
          <div className="p-10 text-center text-muted-foreground">
            جاري تحميل الإشعارات...
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="font-semibold text-destructive">
              تعذر تحميل الإشعارات.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              تأكد من تنفيذ SQL وإنشاء جدول إشعارات الأدمن.
            </p>
            <button
              onClick={() => void refetch()}
              className="mt-4 rounded-xl border px-4 py-2"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell size={40} className="mx-auto text-muted-foreground" />
            <p className="mt-4 font-semibold">لا توجد إشعارات حتى الآن</p>
            <p className="mt-2 text-sm text-muted-foreground">
              ستظهر هنا الطلبات الجديدة عند وصولها.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <article
                key={notification.id}
                className={`p-5 transition ${
                  notification.read_at ? "" : "bg-primary/[0.04]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 rounded-xl p-3 ${
                      notification.read_at
                        ? "bg-muted"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {notification.read_at ? (
                      <Bell size={21} />
                    ) : (
                      <BellRing size={21} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{notification.title}</h3>

                      {!notification.read_at && (
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                          جديد
                        </span>
                      )}
                    </div>

                    {notification.body && (
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                        {notification.body}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(notification.created_at).toLocaleString(
                          "ar-EG"
                        )}
                      </span>

                      <span>النوع: {notification.kind}</span>
                    </div>
                  </div>

                  {!notification.read_at && (
                    <button
                      onClick={() => void markAsRead(notification.id)}
                      title="تعليم كمقروء"
                      aria-label="تعليم الإشعار كمقروء"
                      className="rounded-lg border p-2 transition hover:bg-muted"
                    >
                      <Check size={18} />
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}