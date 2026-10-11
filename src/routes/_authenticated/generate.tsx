import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  LoaderCircle,
  LockKeyhole,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { aiGenerateQuestionBatch, exportQuestionPdf } from "@/lib/ai.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/generate")({
  head: () => ({
    meta: [
      { title: "مولّد الأسئلة — WISO" },
      { name: "description", content: "ولّد أسئلة متوافقة مع منهجك ومستواك الحقيقي." },
    ],
  }),
  component: GeneratePage,
});


const difficulties = [
  { value: "basic", label: "سهل" },
  { value: "medium", label: "متوسط" },
  { value: "hard", label: "صعب" },
  { value: "nightmare", label: "تعجيزي" },
] as const;

type QueueItem = {
  id: string;
  subjectId: string;
  subjectSlug: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  difficulty: (typeof difficulties)[number]["value"];
  count: number;
  status: "queued" | "running" | "completed" | "partial" | "failed";
  result?: Awaited<ReturnType<typeof aiGenerateQuestionBatch>>;
};

function GeneratePage() {
  const qc = useQueryClient();
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<(typeof difficulties)[number]["value"]>("hard");
  const [count, setCount] = useState(10);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [runningAll, setRunningAll] = useState(false);
  const [selectedResult, setSelectedResult] = useState<QueueItem | null>(null);
  const [comingSoon] = useState(true);

  if (comingSoon) {
    return (
      <main
        dir="rtl"
        className="relative flex min-h-[80vh] items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-[#151b12] via-[#252f1d] to-[#11140e] px-6 py-20 text-center"
      >
        <div className="relative z-10 max-w-xl">
          <div className="mb-8 text-7xl">🚧</div>

          <p className="mb-4 text-sm font-bold tracking-[0.3em] text-lime-300">
            WISO · COMING SOON
          </p>

          <h1 className="text-4xl font-black leading-tight text-white sm:text-6xl">
            مولّد الأسئلة
            <br />
            <span className="text-lime-300">قريبًا جدًا</span>
          </h1>

          <p className="mt-6 text-lg leading-9 text-white/70">
            بنجهّزلك تجربة مميزة لتوليد أسئلة تناسب مستواك وتساعدك تتفوق في
            دراستك.
            <br />
            استنّانا قريبًا على WISO 💚
          </p>
        </div>
      </main>
    );
  }
  const wallet = useQuery({
    queryKey: ["wallet-state"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("my_wallet_state");
      if (error) throw error;
      return data as {
        questions_available?: number;
        bonus_question_credits?: number;
        bonus_expires_at?: string | null;
        extreme_difficulty_enabled?: boolean;
        national_id_verified?: boolean;
      };
    },
  });

  const subjects = useQuery({
    queryKey: ["generator-subjects"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("student_available_subjects");
      if (error) throw error;
      return (data ?? []) as { id: string; slug: string; name_ar: string; sort_order: number }[];
    },
  });

  const topics = useQuery({
    queryKey: ["generator-topics", subject],
    enabled: Boolean(subject),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("student_available_lessons", { _subject_id: subject });
      if (error) throw error;
      return (data ?? []) as {
        id: string;
        title: string;
        sort_order: number;
        unit_id: string | null;
        unit_title: string | null;
        page_start: number | null;
        page_end: number | null;
      }[];
    },
  });

  const balance = Number(wallet.data?.questions_available ?? 0);
  const bonus = Number(wallet.data?.bonus_question_credits ?? 0);
  const bonusExpiresAt = wallet.data?.bonus_expires_at ?? null;
  const extremeUnlocked = wallet.data?.extreme_difficulty_enabled === true;
  const pdfUnlocked = wallet.data?.national_id_verified === true;
  const selectedTopic = useMemo(
    () => topics.data?.find((t) => t.id === topic),
    [topics.data, topic],
  );
  const queuedCredits = queue
    .filter((item) => item.status === "queued" || item.status === "running")
    .reduce((sum, item) => sum + item.count, 0);

  const addToQueue = () => {
    if (!subject || !topic) {
      toast.error("اختار المادة والدرس.");
      return;
    }
    if (count < 1 || count > 500) {
      toast.error("عدد الأسئلة لازم يكون من 1 إلى 500.");
      return;
    }
    if (queuedCredits + count > balance) {
      toast.error("إجمالي الطلبات في الـQueue أكبر من رصيدك الحالي.");
      return;
    }

    const selectedSubject = subjects.data?.find((s) => s.id === subject);
    const selectedLesson = topics.data?.find((t) => t.id === topic);
    if (!selectedSubject || !selectedLesson) return;

    setQueue((items) => [
      ...items,
      {
        id: crypto.randomUUID(),
        subjectId: subject,
        subjectSlug: selectedSubject.slug,
        subjectName: selectedSubject.name_ar,
        topicId: topic,
        topicName: selectedLesson.title,
        difficulty,
        count,
        status: "queued",
      },
    ]);
    toast.success("اتضاف الطلب للـQueue.");
  };

  const createAll = useMutation({
    mutationFn: async () => {
      if (!queue.length) throw new Error("الـQueue فاضية.");
      setRunningAll(true);
      const snapshot = [...queue];

      for (const item of snapshot) {
        if (item.status === "completed") continue;
        setQueue((items) => items.map((q) => q.id === item.id ? { ...q, status: "running" } : q));

        try {
          const result = await aiGenerateQuestionBatch({
            data: {
              subjectSlug: item.subjectSlug,
              topicIds: [item.topicId],
              difficulties: [item.difficulty],
              questionTypes: ["mcq"],
              count: item.count,
              nightmareMode: item.difficulty === "nightmare",
              language: "ar",
            },
          });

          const status = result.stats.status === "completed" ? "completed" : "partial";
          setQueue((items) =>
            items.map((q) => q.id === item.id ? { ...q, status, result } : q),
          );
          setSelectedResult({ ...item, status, result });
          await qc.invalidateQueries({ queryKey: ["wallet-state"] });
        } catch (error) {
          setQueue((items) =>
            items.map((q) => q.id === item.id ? { ...q, status: "failed" } : q),
          );
          toast.error(error instanceof Error ? error.message : "فشل تنفيذ الطلب.");
        }
      }

      return true;
    },
    onSuccess: () => toast.success("تم التعامل مع كل الطلبات الموجودة في الـQueue."),
    onSettled: () => setRunningAll(false),
  });
  

  const exportPdf = useMutation({
    mutationFn: async () => {
      if (!selectedResult?.result) throw new Error("اختار نتيجة مكتملة الأول.");
      const data = await exportQuestionPdf({
        data: {
          requestId: selectedResult.result.requestId,
          documentType: "worksheet",
          subjectName: selectedResult.subjectName,
          topicName: selectedResult.topicName,
          questions: selectedResult.result.questions,
        },
      });
      const binary = atob(data.base64);
      const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: data.mimeType }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = data.filename;
      anchor.click();
      URL.revokeObjectURL(url);
    },
    onSuccess: () => toast.success("ملف PDF الشخصي جاهز."),
    onError: (error: Error) =>
      toast.error(
        error.message === "verified_national_id_required"
          ? "وثّق الرقم القومي من الملف الشخصي أولاً."
          : error.message,
      ),
  });

  return (
    <main dir="rtl" className="page-shell">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">اختار أكتر من طلب قبل ما تبعته للـAI</p>
          <h1 className="mt-2 font-display text-3xl font-black">مولّد الأسئلة</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
            ضيف كل طلباتك واعمل انشاء مره واحدة، وWISO هيتعامل معاها واحدة واحدة. كل طلب هيظهرلك نتيجته بعد ما يخلص.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">الرصيد: {balance} سؤال</Badge>
          <Badge variant="outline">في الـQueue: {queuedCredits}</Badge>
          {bonus > 0 && bonusExpiresAt ? (
            <Badge>منها {bonus} هدية تنتهي {new Date(bonusExpiresAt).toLocaleString("ar-EG")}</Badge>
          ) : null}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <Card>
          <CardContent className="space-y-5 p-6">
            <div>
              <Label>المادة</Label>
              <Select value={subject} onValueChange={(v) => { setSubject(v); setTopic(""); }}>
                <SelectTrigger className="mt-2"><SelectValue placeholder="اختار المادة" /></SelectTrigger>
                <SelectContent>
                  {subjects.data?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name_ar}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>الدرس</Label>
              <Select value={topic} onValueChange={setTopic} disabled={!subject}>
                <SelectTrigger className="mt-2"><SelectValue placeholder={subject ? "اختار الدرس" : "اختار المادة أولاً"} /></SelectTrigger>
                <SelectContent>
                  {topics.data?.map((t) => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
                </SelectContent>
              </Select>
              {selectedTopic ? <p className="mt-2 text-xs text-muted-foreground">{selectedTopic.title}</p> : null}
            </div>

            <div>
              <Label>مستوى الصعوبة</Label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as typeof difficulty)}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {difficulties.map((d) => {
                    const locked = d.value === "nightmare" && !extremeUnlocked;
                    return <SelectItem key={d.value} value={d.value} disabled={locked}>{d.label}{locked ? " 🔒" : ""}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="count">عدد الأسئلة</Label>
              <Input
                id="count"
                className="mt-2"
                type="number"
                min={1}
                max={Math.min(500, Math.max(balance - queuedCredits, 1))}
                value={count}
                onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))}
              />
            </div>

            <Button className="w-full" disabled={!subject || !topic || count > balance - queuedCredits || runningAll} onClick={addToQueue}>
              <Plus className="me-2 size-4" /> إضافة للـQueue
            </Button>

            <Button
              className="w-full"
              variant="secondary"
              disabled={!queue.length || runningAll}
              onClick={() => createAll.mutate()}
            >
              {runningAll ? <LoaderCircle className="me-2 size-4 animate-spin" /> : <img src="https://api.iconify.design/mdi:engine.svg" alt="Engine" className="me-2 size-4" />}
              {runningAll ? "WISO بيشتغل على الطلبات..." : `إنشاء الكل (${queue.length})`}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Queue</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {!queue.length ? (
                <p className="py-12 text-center text-sm text-muted-foreground">كل طلباتك هتظهر هنا قبل ما تروح للمولد</p>
              ) : (
                queue.map((item, index) => (
                  <div key={item.id} className="rounded-xl border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{index + 1}. {item.subjectName} — {item.topicName}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{item.count} سؤال · {difficulties.find((d) => d.value === item.difficulty)?.label}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>{item.status === "queued" ? "في الانتظار" : item.status === "running" ? "جاري" : item.status === "completed" ? "مكتمل" : item.status === "partial" ? "جزئي" : "فشل"}</Badge>
                        {item.status === "queued" && !runningAll ? (
                          <Button size="icon" variant="ghost" onClick={() => setQueue((items) => items.filter((q) => q.id !== item.id))}>
                            <Trash2 className="size-4" />
                          </Button>
                        ) : null}
                      </div>
                    </div>
                    {item.result ? (
                      <Button
                        variant="link"
                        className="mt-2 h-auto px-0"
                        onClick={() => setSelectedResult(item)}
                      >
                        عرض النتيجة
                      </Button>
                    ) : null}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="min-h-80">
            <CardContent className="p-6">
              {!selectedResult?.result ? (
                <div className="flex h-64 flex-col items-center justify-center text-center">
                  <img src="https://api.iconify.design/mdi:engine.svg" alt="Engine" className="size-10 text-primary" />
                  <h2 className="mt-4 font-display text-xl font-bold">النتائج هتظهر هنا</h2>
                  <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">
طلباتك هتظهر هنا بعد ما تروح للمولد
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="font-display text-xl font-bold">نتيجة الطلب</h2>
                      <p className="mt-1 text-xs text-muted-foreground">{selectedResult.subjectName} — {selectedResult.topicName}</p>
                    </div>
                    <CheckCircle2 className="size-6 text-primary" />
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <Button disabled={!pdfUnlocked || exportPdf.isPending} onClick={() => exportPdf.mutate()}>
                      {pdfUnlocked ? <Download className="me-2 size-4" /> : <LockKeyhole className="me-2 size-4" />}
                      {exportPdf.isPending ? "بنجهز PDF..." : "تنزيل PDF"}
                    </Button>
                    {!pdfUnlocked ? (
                      <a href="/profile#national-id" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
                        وثّق الرقم القومي لفتح الطباعة فقط
                      </a>
                    ) : null}
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      ["المطلوب", selectedResult.result.stats.requested],
                      ["مُعاد استخدامه", selectedResult.result.stats.reused],
                      ["مولّد", selectedResult.result.stats.generated],
                      ["مقبول", selectedResult.result.stats.accepted],
                      ["مرفوض", selectedResult.result.stats.rejected],
                      ["المتبقي", selectedResult.result.stats.remaining],
                      ["إعادات", selectedResult.result.stats.retries],
                      ["استبدالات", selectedResult.result.stats.replacementCount],
                    ].map(([key, value]) => (
                      <div key={String(key)} className="rounded-lg border bg-muted/25 p-3">
                        <p className="text-xs text-muted-foreground">{key}</p>
                        <p className="mt-1 text-xl font-bold">{value}</p>
                      </div>
                    ))}
                  </div>

                  {selectedResult.result.stats.remaining > 0 ? (
                    <div className="mt-5 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm">
                      <AlertCircle className="mt-0.5 size-4 shrink-0" />
                      <p>الطلب اتعالج بأمان، والجزء غير المقبول لم يتم خصم رصيده.</p>
                    </div>
                  ) : null}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
