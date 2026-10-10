import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { createUuid } from "@/lib/uuid";

export const Route = createFileRoute("/_authenticated/requests")({
  head: () => ({
    meta: [
      { title: "الطلبات الخاصة — WISO" },
      { name: "description", content: "اطلب تجهيز مادة أو مهمة دراسية خاصة." },
      { property: "og:title", content: "الطلبات الخاصة — WISO" },
      { property: "og:description", content: "تابع طلباتك الدراسية الخاصة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RequestsPage,
});

function RequestsPage() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const requests = useQuery({
    queryKey: ["special-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("special_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const submit = useMutation({
    mutationFn: async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) throw new Error("سجّل دخولك من جديد");
      let filePath: string | null = null;
      if (file) {
        if (file.size > 20 * 1024 * 1024) throw new Error("الملف أكبر من 20MB");
        const safeName = file.name.replace(/[^\p{L}\p{N}._-]+/gu, "-");
filePath = `${data.user.id}/${createUuid()}-${safeName}`;        const upload = await supabase.storage.from("study-materials").upload(filePath, file, {
          upsert: false,
          ...(file.type ? { contentType: file.type } : {}),
        });
        if (upload.error) throw upload.error;
      }
      const { error } = await supabase
        .from("special_requests")
        .insert({ user_id: data.user.id, title, details, file_path: filePath });
      if (error) throw error;
    },
    onSuccess: () => {
      setTitle("");
      setDetails("");
      setFile(null);
      toast.success("طلبك اتبعت للمراجعة.");
      void qc.invalidateQueries({ queryKey: ["special-requests"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <main dir="rtl" className="page-shell max-w-5xl">
      <PageHeader
        title="طلبات خاصة"
        subtitle="لو محتاج تجهيز مختلف عن المولد العادي، ابعت التفاصيل هنا."
      />
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">طلب جديد</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="request-title">العنوان</Label>
            <Input id="request-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="request-details">التفاصيل</Label>
            <Textarea
              id="request-details"
              rows={5}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="request-file">ملف أو صورة (اختياري)</Label>
            <Input
              id="request-file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-muted-foreground">
              الملف بيتخزن في مكان خاص، ومبيترسلش للذكاء الاصطناعي أوتوماتيك.
            </p>
          </div>
          <Button disabled={!title || submit.isPending} onClick={() => submit.mutate()}>
            {submit.isPending ? "بيتبعت..." : "ابعت الطلب"}
          </Button>
        </CardContent>
      </Card>
      <div className="mt-6 space-y-3">
        {requests.data?.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
                <div className="min-w-0">
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.details}</p>
                  {item.admin_note ? (
                    <p className="mt-2 text-sm text-primary">رد WISO: {item.admin_note}</p>
                  ) : null}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{item.status}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
