import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  Bot,
  CreditCard,
  KeyRound,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { createUuid } from "@/lib/uuid";
import {
  getMyToolAccess,
  getMyToolOrders,
  getToolCatalogFn,
  redeemToolCode,
  submitToolPayment,
} from "@/lib/wiso-tools.functions";
import type { ToolProductKey } from "@/services/wiso-tools/server";

export const Route = createFileRoute("/_authenticated/tools")({
  component: ToolsPage,
});

function ToolsPage() {
  const qc = useQueryClient();

  const catalog = useQuery({
    queryKey: ["wiso-tools-catalog"],
    queryFn: () => getToolCatalogFn(),
  });

  const access = useQuery({
    queryKey: ["wiso-tools-access"],
    queryFn: () => getMyToolAccess(),
  });

  const orders = useQuery({
    queryKey: ["wiso-tools-orders"],
    queryFn: () => getMyToolOrders(),
  });

  const [code, setCode] = useState("");
  const [selectedProduct, setSelectedProduct] =
    useState<ToolProductKey | null>(null);

  const [method, setMethod] = useState<"vodafone_cash" | "instapay">(
    "vodafone_cash",
  );

  const [senderNumber, setSenderNumber] = useState("");
  const [proof, setProof] = useState<File | null>(null);

  const accessSet = useMemo(
    () =>
      new Set(
        (access.data ?? [])
          .filter((item) => item.available)
          .map((item) => item.tool_key),
      ),
    [access.data],
  );

  const pending = (orders.data ?? []).find(
    (item) => item.status === "pending",
  );

  const redeem = useMutation({
    mutationFn: () => redeemToolCode({ data: { code } }),

    onSuccess: async () => {
      setCode("");

      toast.success("تم تفعيل أداة WISO بنجاح.");

      await qc.invalidateQueries({
        queryKey: ["wiso-tools-access"],
      });
    },

    onError: (error: Error) =>
      toast.error(
        error.message === "code_already_used"
          ? "الكود مستخدم بالفعل."
          : error.message === "code_expired"
            ? "الكود منتهي الصلاحية."
            : error.message === "not_tool_code"
              ? "هذا كود باقة أسئلة وليس كود أدوات."
              : error.message,
      ),
  });

  const pay = useMutation({
    mutationFn: async () => {
      if (!selectedProduct) {
        throw new Error("اختار المنتج أولًا.");
      }

      if (!proof) {
        throw new Error("ارفع صورة إثبات الدفع.");
      }

      if (!senderNumber.trim()) {
        throw new Error("اكتب الرقم الذي تم التحويل منه.");
      }

      if (proof.size > 10 * 1024 * 1024) {
        throw new Error("الصورة يجب ألا تتجاوز 10MB.");
      }

      if (!/^image\/(jpeg|png|webp)$/.test(proof.type)) {
        throw new Error("ارفع JPG أو PNG أو WebP فقط.");
      }

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        throw new Error("سجّل دخولك من جديد.");
      }

      const ext = proof.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${userId}/tools/${createUuid()}.${ext}`;

      const upload = await supabase.storage
        .from("payment-proofs")
        .upload(path, proof, {
          upsert: false,
          contentType: proof.type,
        });

      if (upload.error) {
        throw upload.error;
      }

      return submitToolPayment({
        data: {
          productKey: selectedProduct,
          method,
          senderNumber: senderNumber.trim(),
          screenshotPath: path,
        },
      });
    },

    onSuccess: async () => {
      setProof(null);
      setSenderNumber("");
      setSelectedProduct(null);

      toast.success("تم إرسال طلب الدفع للإدارة.");

      await qc.invalidateQueries({
        queryKey: ["wiso-tools-orders"],
      });
    },

    onError: (error: Error) => toast.error(error.message),
  });

  const products = catalog.data?.products ?? [];
  const methods = catalog.data?.methods ?? [];

  return (
    <main dir="rtl" className="page-shell">
      <PageHeader
        title="أدوات WISO"
        subtitle="وكلاء مستقلة عن باقات الأسئلة، مرتبطة بحساب WISO الخاص بك. لديك محاولة واحدة لإدخال بياناتك في كل اشتراك. في حالة حدوث خطأ أثناء إرسال البيانات، تواصل مع الدعم وأرسل الـ ID والباسوورد الصحيحين، مع مراعاة الحروف الكبيرة والصغيرة."
      />

      <div className="mt-4 text-center">
        <p className="mb-2 text-sm text-muted-foreground">
          رقم الفودافون كاش
        </p>

        <a
          href="tel:01003244623"
          dir="ltr"
          className="inline-block text-2xl font-extrabold tracking-wider text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.45)] transition-colors hover:text-emerald-400 sm:text-3xl"
        >
          01003244623
        </a>
      </div>

      <section className="mt-7 grid gap-5 lg:grid-cols-3">
        {products.map((product) => {
          const available = product.tools.every((tool) =>
            accessSet.has(tool),
          );

          const href =
            product.key === "qureo"
              ? "/qureo"
              : product.key === "financial_literacy"
                ? "/sprix"
                : "/tools";

          return (
            <Card
              key={product.key}
              className="relative overflow-hidden border-primary/15"
            >
              <CardHeader>
                <div className="mb-3 flex items-center justify-between">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    {product.key === "qureo" ? (
                      <Bot className="size-6" />
                    ) : (
                      <Sparkles className="size-6" />
                    )}
                  </div>

                  {available ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                      <BadgeCheck className="size-3.5" />
                      متاح
                    </span>
                  ) : null}
                </div>

                <CardTitle>{product.name}</CardTitle>

                <p className="text-sm text-muted-foreground">
                  {product.description}
                </p>
              </CardHeader>

              <CardContent>
                <p className="font-display text-3xl font-extrabold">
                  {product.priceEgp}{" "}
                  <span className="text-base font-semibold">جنيه</span>
                </p>

                <Button asChild className="mt-5 w-full">
                  <Link
                    {...(available
                      ? {}
                      : { hash: "tool-payment" })}
                    to={href as "/qureo" | "/sprix" | "/tools"}
                  >
                    {available ? "فتح الأداة" : "شراء / تفعيل"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section
        id="tool-payment"
        className="mt-7 grid scroll-mt-24 gap-5 lg:grid-cols-[1fr_.8fr]"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-5" />
              شراء أداة
            </CardTitle>

            <p className="text-sm leading-6 text-muted-foreground">
              اختر الأداة التي تريد تفعيلها، ثم حدد طريقة الدفع التي
              ستستخدمها، وأرسل إثبات التحويل لمراجعة طلبك.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {pending ? (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-6">
                لديك طلب دفع قيد المراجعة. سيتم تفعيل الأداة بعد اعتماد
                الإدارة.
              </div>
            ) : null}

            <div className="space-y-3">
              <p className="text-sm font-bold">١. اختر الأداة المطلوبة</p>

              <div className="grid gap-3 sm:grid-cols-2">
                {products.map((product) => {
                  const isSelected = selectedProduct === product.key;

                  return (
                    <button
                      key={product.key}
                      type="button"
                      onClick={() => setSelectedProduct(product.key)}
                      aria-pressed={isSelected}
                      className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-right transition ${
                        isSelected
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                          : "border-border bg-background hover:border-primary/50 hover:bg-muted/40"
                      }`}
                    >
                      <span
                        className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/50"
                        }`}
                      >
                        {isSelected ? (
                          <BadgeCheck className="size-4" />
                        ) : null}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block font-bold">
                          {product.name}
                        </span>

                        <span className="mt-1 block text-sm font-semibold text-primary">
                          {product.priceEgp} جنيه مصري
                        </span>

                        <span className="mt-2 block text-xs text-muted-foreground">
                          {isSelected ? "تم اختيار هذه الأداة" : "اضغط للاختيار"}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-bold">٢. اختر طريقة الدفع</p>

              <div className="grid gap-3 sm:grid-cols-2">
                {methods.map((item) => {
                  const isSelected = method === item.method_key;

                  return (
                    <button
                      key={item.method_key}
                      type="button"
                      onClick={() =>
                        setMethod(
                          item.method_key as typeof method,
                        )
                      }
                      aria-pressed={isSelected}
                      className={`flex w-full items-start gap-3 rounded-xl border-2 p-4 text-right transition ${
                        isSelected
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                          : "border-border bg-background hover:border-primary/50 hover:bg-muted/40"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/50"
                        }`}
                      >
                        {isSelected ? (
                          <BadgeCheck className="size-4" />
                        ) : null}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block font-bold">
                          {item.display_name}
                        </span>

                        {item.account_identifier ? (
                          <span
                            dir="ltr"
                            className="mt-2 block text-left font-mono text-sm font-semibold"
                          >
                            {item.account_identifier}
                          </span>
                        ) : null}

                        {item.instructions ? (
                          <span className="mt-2 block text-sm leading-6 text-muted-foreground">
                            {item.instructions}
                          </span>
                        ) : null}

                        {isSelected ? (
                          <span className="mt-3 inline-flex rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                            طريقة الدفع المختارة
                          </span>
                        ) : (
                          <span className="mt-3 block text-xs text-muted-foreground">
                            اضغط لاختيار طريقة الدفع
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tool-sender">
                ٣. الرقم الذي تم التحويل منه
              </Label>

              <Input
                id="tool-sender"
                dir="ltr"
                inputMode="tel"
                autoComplete="tel"
                value={senderNumber}
                onChange={(event) => setSenderNumber(event.target.value)}
                placeholder="01xxxxxxxxx"
                disabled={pay.isPending || Boolean(pending)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tool-proof">
                ٤. صورة إثبات الدفع
              </Label>

              <Input
                id="tool-proof"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) =>
                  setProof(event.target.files?.[0] ?? null)
                }
                disabled={pay.isPending || Boolean(pending)}
              />

              <p className="text-xs text-muted-foreground">
                الصيغ المقبولة JPG وPNG وWebP، بحد أقصى 10MB.
              </p>

              {proof ? (
                <p className="text-sm text-primary">
                  الملف المختار: {proof.name}
                </p>
              ) : null}
            </div>

            <Button
              className="w-full"
              disabled={
                pay.isPending ||
                !selectedProduct ||
                !proof ||
                !senderNumber.trim() ||
                Boolean(pending)
              }
              onClick={() => pay.mutate()}
            >
              <CreditCard className="ml-2 size-4" />

              {pay.isPending
                ? "جارٍ إرسال الطلب..."
                : "إرسال طلب الدفع للمراجعة"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="size-5" />
              تفعيل بكود
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-muted-foreground">
              أكواد SPRIX وQureo وSPRIX + Qureo منفصلة عن أكواد باقات
              الأسئلة، ولا تضيف أي Question Credits.
            </p>

            <div className="space-y-2">
              <Label htmlFor="tool-activation-code">
                كود تفعيل الأداة
              </Label>

              <Input
                id="tool-activation-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="WISO-SPRIX-... / WISO-QUREO-..."
                autoComplete="off"
                disabled={redeem.isPending}
              />
            </div>

            <Button
              className="w-full"
              disabled={!code.trim() || redeem.isPending}
              onClick={() => redeem.mutate()}
            >
              <KeyRound className="ml-2 size-4" />

              {redeem.isPending ? "جارٍ التفعيل..." : "تفعيل الكود"}
            </Button>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-6">
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />

                <span>
                  التفعيل مرتبط بحساب WISO الحالي، ويتم التحقق منه على
                  الخادم.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-7">
        <Card>
          <CardHeader>
            <CardTitle>طلبات الأدوات</CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            {(orders.data ?? []).slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 text-sm"
              >
                <div>
                  <span className="font-semibold">
                    {products.find(
                      (product) => product.key === item.product_key,
                    )?.name ?? item.product_key}
                  </span>

                  <span className="mr-2 text-muted-foreground">
                    {item.amount_egp} ج.م
                  </span>
                </div>

                <span
                  className={
                    item.status === "confirmed"
                      ? "font-semibold text-emerald-600"
                      : item.status === "rejected"
                        ? "font-semibold text-destructive"
                        : "font-semibold text-amber-600"
                  }
                >
                  {item.status === "pending"
                    ? "قيد المراجعة"
                    : item.status === "confirmed"
                      ? "مقبول"
                      : "مرفوض"}
                </span>
              </div>
            ))}

            {!orders.data?.length ? (
              <p className="py-5 text-sm text-muted-foreground">
                لا توجد طلبات بعد.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
