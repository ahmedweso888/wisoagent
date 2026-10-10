import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "الإشعارات — WISO" },
      { name: "description", content: "تنبيهات خطتك وطلباتك وحسابك." },
      { property: "og:title", content: "الإشعارات — WISO" },
      { property: "og:description", content: "آخر تنبيهات WISO الدراسية." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const qc = useQueryClient();
  const notifications = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const readAll = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .is("read_at", null);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
  return (
    <main dir="rtl" className="page-shell max-w-5xl">
      <PageHeader
        title="الإشعارات"
        subtitle="كل ما يخص خطتك وطلباتك في مكان واحد."
        actions={
          <Button variant="outline" size="sm" onClick={() => readAll.mutate()}>
            <CheckCheck className="size-4" />
            علّم الكل مقروء
          </Button>
        }
      />
      <div className="mt-6 space-y-3">
        {notifications.data?.length ? (
          notifications.data.map((item) => (
            <Card key={item.id} className={item.read_at ? "opacity-70" : "border-primary/40"} onClick={() => !item.read_at && markRead.mutate(item.id)}>
              <CardContent className="flex cursor-pointer gap-3 p-4">
                <Bell className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="font-semibold">{item.title}</p>
                  {item.body ? (
                    <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                  ) : null}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleString("ar-EG")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="py-12 text-center text-muted-foreground">مفيش إشعارات جديدة.</p>
        )}
      </div>
    </main>
  );
}
