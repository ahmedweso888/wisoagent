import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/common/PageHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { createWisoPaymentRequest } from "@/lib/payment.functions";
import { createUuid } from "@/lib/uuid";

export const Route = createFileRoute("/_authenticated/wallet")({
  head: () => ({
    meta: [
      { title: "محفظتي — WISO" },
      { name: "description", content: "رصيد الأسئلة والصور والملفات وطرق الشحن في WISO." },
      { property: "og:title", content: "محفظتي — WISO" },
      { property: "og:description", content: "رصيد الأسئلة والصور والملفات وطرق الشحن في WISO." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WalletPage,
});

type PaymentMethod = "vodafone_cash" | "instapay";

function WalletPage() {
  const qc = useQueryClient();
  const [code, setCode] = useState("");
  const [planId, setPlanId] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("vodafone_cash");
  const [sender, setSender] = useState("");
  const [txn, setTxn] = useState("");
  const [proof, setProof] = useState<File | null>(null);

  const wallet = useQuery({
    queryKey: ["wallet"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("my_wallet");
      if (error) throw error;
      return data;
    },
  });

  const plans = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const ledger = useQuery({
    queryKey: ["ledger"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wallet_ledger")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const redeem = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("redeem_center_code", { _code: code });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("الكود اتفعّل وشحنّا محفظتك.");
      setCode("");
      void qc.invalidateQueries({ queryKey: ["wallet"] });
      void qc.invalidateQueries({ queryKey: ["ledger"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const pay = useMutation({
    mutationFn: async () => {
      const plan = plans.data?.find((p) => p.id === planId);
      if (!plan) throw new Error("اختار باقة الأول");
      const { data: auth } = await supabase.auth.getUser();
      let screenshotPath: string | null = null;
      if (proof) {
        if (proof.size > 10 * 1024 * 1024) throw new Error("صورة الإثبات أكبر من 10MB");
        if (!proof.type.startsWith("image/")) throw new Error("إثبات الدفع لازم يكون صورة");
screenshotPath =
  `${auth.user!.id}/${createUuid()}-${proof.name.replace(/[^\p{L}\p{N}._-]+/gu, "-")}`;        const upload = await supabase.storage
          .from("payment-proofs")
          .upload(screenshotPath, proof, { upsert: false, contentType: proof.type });
        if (upload.error) throw upload.error;
      }
      await createWisoPaymentRequest({
        data: {
          planId: plan.id,
          method,
          senderNumber: sender,
          transactionNumber: txn,
          screenshotPath,
        },
      });
    },
    onSuccess: () => {
      toast.success("طلب الدفع اتبعت، هيتراجع قريب.");
      setSender("");
      setTxn("");
      setProof(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const w = wallet.data as {
    question_credits: number;
    image_credits: number;
    pdf_credits: number;
    cash_balance_egp: number;
  } | null;

  return (
    <main dir="rtl" className="page-shell max-w-5xl">
      <PageHeader title="محفظتي" subtitle=" تابع رصيدك، اختار باقتك، وابعت طلب الشحن من هنا.رقم فودافون كاش (01003244623) تنويه!!!! (قد يتم تغيير الرقم في اي وقت تاكد من الرقم قبل التحويل)" />
   

      <div className="mt-6">
  <Card className="max-w-sm">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm text-muted-foreground">
        رصيد الأسئلة
      </CardTitle>
    </CardHeader>

    <CardContent className="text-3xl font-bold">
      {w?.question_credits ?? 0}
    </CardContent>
  </Card>
  <Card className="max-w-sm">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm text-muted-foreground">
        أرباح الدعوات
      </CardTitle>
    </CardHeader>
    <CardContent className="text-3xl font-bold">
      {Number(w?.cash_balance_egp ?? 0).toFixed(2)} جنيه
    </CardContent>
  </Card>
</div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">كود سنتر</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="WISO-XXXXXXXX"
          />
          <Button disabled={!code || redeem.isPending} onClick={() => redeem.mutate()}>
            تفعيل
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">شحن المحفظة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {plans.data?.map((p) => (
              <Button
                key={p.id}
                type="button"
                onClick={() => setPlanId(p.id)}
                variant="outline"
                className={`h-auto min-h-32 flex-col items-start whitespace-normal p-4 text-start ${
                  planId === p.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                }`}
              >
                <div className="font-semibold">{p.name_ar}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {p.question_credits} سؤال · 
                </div>
                <div className="mt-2 font-bold text-primary">{p.price_egp} جنيه</div>
              </Button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="method">طريقة الدفع</Label>
              <Select
                value={method}
                onValueChange={(value) => setMethod(value as PaymentMethod)}
              >
                <SelectTrigger id="method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vodafone_cash">فودافون كاش</SelectItem>
                  <SelectItem value="instapay">إنستا باي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sender">الرقم المحوّل منه او يوزر الانستا باي </Label>
              <Input id="sender" value={sender} onChange={(e) => setSender(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="txn">وقت التحويل (مش لازم يكون بالتحديد يعني اقرب حاجه) </Label>
              <Input id="txn" value={txn} onChange={(e) => setTxn(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="proof">صورة إثبات التحويل</Label>
            <Input
              id="proof"
              type="file"
              accept="image/*"
              onChange={(e) => setProof(e.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-muted-foreground">
              لو رفعتها، فريق WISO هيراجعها بنفسه مع طلبك.
            </p>
          </div>
          <Button disabled={!planId || pay.isPending} onClick={() => pay.mutate()}>
            {pay.isPending ? "بيتبعت..." : "ابعت طلب الدفع"}
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">آخر الحركات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {ledger.data?.length ? (
            ledger.data.map((row) => (
              <div key={row.id} className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">
                  {row.reason} · {row.resource_type}
                </span>
                <span className={row.delta < 0 ? "text-destructive" : "text-primary"}>
                  {row.delta > 0 ? `+${row.delta}` : row.delta}
                </span>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">لسه مفيش حركات.</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
