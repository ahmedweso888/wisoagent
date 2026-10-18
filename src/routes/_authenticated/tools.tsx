import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
BadgeCheck,
Bot,
CreditCard,
KeyRound,
LockKeyhole,
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
import { ToolCredentialSubmissionPage } from "@/components/tools/ToolCredentialSubmissionPage";
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
const [activeTab, setActiveTab] = useState<"purchase" | "code">("purchase");
const [accountId, setAccountId] = useState("");
const [accountPassword, setAccountPassword] = useState("");

const [redeemedToolKeys, setRedeemedToolKeys] = useState<
Array<"financial_literacy" | "qureo">

> ([]);

const [selectedProduct, setSelectedProduct] =
useState<ToolProductKey | null>(null);

const [method, setMethod] = useState<"vodafone_cash" | "instapay">(
"vodafone_cash",
);

const [senderNumber, setSenderNumber] = useState("");
const [proof, setProof] = useState<File | null>(null);

// نافذتا التأكيد قبل إرسال طلب الدفع.
const [showFirstConfirmation, setShowFirstConfirmation] = useState(false);
const [showSecondConfirmation, setShowSecondConfirmation] = useState(false);

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

// اختيار المنتج وفتح فورم الدفع مباشرة.
const openPurchaseForm = (productKey: ToolProductKey) => {
setSelectedProduct(productKey);
setActiveTab("purchase");


requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    document.getElementById("tool-payment")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
});


};

// التأكد من اكتمال البيانات قبل الانتقال للتأكيد الثاني.
const handleFirstConfirmation = () => {
if (!selectedProduct) {
toast.error("من فضلك اختر الأداة المطلوبة أولًا.");
return;
}


if (!accountId.trim() || !accountPassword) {
  toast.error("من فضلك أدخل الـ ID وكلمة المرور أولًا.");
  return;
}

if (!senderNumber.trim() || !proof) {
  toast.error("من فضلك أدخل رقم التحويل وارفع صورة إثبات الدفع.");
  return;
}

if (pending) {
  toast.error("لديك طلب دفع قيد المراجعة بالفعل.");
  return;
}

setShowFirstConfirmation(false);
setShowSecondConfirmation(true);


};

// الإرسال الفعلي لا يبدأ إلا بعد التأكيد النهائي.
const handleFinalConfirmation = () => {
if (pay.isPending) return;


setShowSecondConfirmation(false);
pay.mutate();


};

const redeem = useMutation({
mutationFn: () => {
setRedeemedToolKeys([]);
return redeemToolCode({ data: { code } });
},


onSuccess: async (result) => {
  setCode("");

  const activation = (result as {
    data?: { code_type?: string };
  })?.data;

  const type = activation?.code_type;

  const keys =
    type === "sprix_qureo"
      ? (["financial_literacy", "qureo"] as const)
      : type === "sprix"
        ? (["financial_literacy"] as const)
        : type === "qureo"
          ? (["qureo"] as const)
          : [];

  if (!keys.length) {
    toast.error(
      "تم التحقق من الكود لكن تعذر تحديد نوع التفعيل. حدّث الصفحة وتواصل مع الدعم.",
    );
    return;
  }

  setRedeemedToolKeys([...keys]);

  toast.success("تم تفعيل الكود بنجاح. أدخل بيانات الحساب أدناه.");

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
          : error.message === "invalid_code"
            ? "كود التفعيل غير صحيح."
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

  if (!accountId.trim() || !accountPassword) {
    throw new Error("أدخل Account ID وPassword قبل إرسال طلب الشراء.");
  }

  if (accountId.length > 200 || accountPassword.length > 500) {
    throw new Error("بيانات الحساب أطول من الحد المسموح.");
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
      accountId: accountId.trim(),
      password: accountPassword,
    },
  });
},

onSuccess: async () => {
  setProof(null);
  setSenderNumber("");
  setAccountId("");
  setAccountPassword("");
  setSelectedProduct(null);
  setShowFirstConfirmation(false);
  setShowSecondConfirmation(false);

  toast.success("تم إرسال طلب الدفع للإدارة.");

  await Promise.all([
    qc.invalidateQueries({
      queryKey: ["wiso-tools-orders"],
    }),
    qc.invalidateQueries({
      queryKey: ["wiso-tools-access"],
    }),
  ]);
},

onError: (error: Error) => toast.error(error.message),


});

const products = catalog.data?.products ?? [];
const methods = catalog.data?.methods ?? [];

const selectedProductDetails = products.find(
(product) => product.key === selectedProduct,
);

const selectedMethodDetails = methods.find(
(item) => item.method_key === method,
);

return ( <main dir="rtl" className="page-shell"> <PageHeader
     title="أدوات WISO"
     subtitle="وكلاء مستقلة عن باقات الأسئلة، مرتبطة بحساب WISO الخاص بك. لديك محاولة واحدة لإدخال بياناتك في كل اشتراك. في حالة حدوث خطأ أثناء إرسال البيانات، تواصل مع الدعم وأرسل الـ ID والباسوورد الصحيحين، مع مراعاة الحروف الكبيرة والصغيرة."
   />

```
  {/* رقم الدفع */}
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

  {/* كروت الأدوات - تصميم صغير */}
  <section className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

      const isSelected = selectedProduct === product.key;

      return (
        <Card
          key={product.key}
          className={`overflow-hidden transition-all duration-200 ${
            isSelected
              ? "border-primary bg-primary/[0.03] ring-1 ring-primary/20"
              : "border-border/70 hover:border-primary/40"
          }`}
        >
          <CardContent className="flex items-center gap-3 p-3">
            <div
              className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                available
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {product.key === "qureo" ? (
                <Bot className="size-5" />
              ) : (
                <Sparkles className="size-5" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="truncate text-sm font-bold">
                  {product.name}
                </h3>

                {available ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                    <BadgeCheck className="size-3" />
                    متاحة
                  </span>
                ) : null}
              </div>

              <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                {product.description}
              </p>

              <p className="mt-1.5 text-sm font-extrabold text-primary">
                {product.priceEgp}{" "}
                <span className="text-[11px] font-medium">جنيه</span>
              </p>
            </div>

            <div className="shrink-0">
              {available ? (
                <Button asChild size="sm" variant="outline">
                  <Link to={href as "/qureo" | "/sprix" | "/tools"}>
                    فتح
                  </Link>
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => openPurchaseForm(product.key)}
                >
                  شراء
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      );
    })}
  </section>

  {/* التبويبات */}
  <div
    className="mt-6 flex flex-wrap gap-2"
    role="tablist"
    aria-label="أدوات WISO"
  >
    <Button
      role="tab"
      aria-selected={activeTab === "purchase"}
      variant={activeTab === "purchase" ? "default" : "outline"}
      onClick={() => setActiveTab("purchase")}
    >
      <CreditCard className="ml-2 size-4" />
      شراء الأدوات
    </Button>

    <Button
      role="tab"
      aria-selected={activeTab === "code"}
      variant={activeTab === "code" ? "default" : "outline"}
      onClick={() => setActiveTab("code")}
    >
      <KeyRound className="ml-2 size-4" />
      تفعيل كود
    </Button>
  </div>

  {/* فورم الدفع */}
  {activeTab === "purchase" ? (
    <section id="tool-payment" className="mt-4 scroll-mt-24">
      <Card>
        <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="size-5" />
            شراء أداة
          </CardTitle>

          <p className="text-sm leading-6 text-muted-foreground">
            اختر الأداة المطلوبة، وأدخل بيانات حسابك، ثم حدد طريقة الدفع
            وأرسل إثبات التحويل لمراجعة طلبك.
          </p>
        </CardHeader>

        <CardContent className="space-y-5 p-4 pt-0 sm:p-6 sm:pt-0">
          {pending ? (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm leading-6">
              لديك طلب دفع قيد المراجعة. سيتم تفعيل الأداة بعد اعتماد
              الإدارة.
            </div>
          ) : null}

          {/* اختيار الأداة */}
          <div className="space-y-3">
            <p className="text-sm font-bold">
              ١. اختر الأداة المطلوبة
            </p>

            <div className="grid gap-2 sm:grid-cols-2">
              {products.map((product) => {
                const isSelected = selectedProduct === product.key;

                return (
                  <button
                    key={product.key}
                    type="button"
                    onClick={() => setSelectedProduct(product.key)}
                    aria-pressed={isSelected}
                    disabled={pay.isPending || Boolean(pending)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-right transition ${
                      isSelected
                        ? "border-primary bg-primary/10 ring-1 ring-primary/20"
                        : "border-border bg-background hover:border-primary/50 hover:bg-muted/40"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <span
                      className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/50"
                      }`}
                    >
                      {isSelected ? (
                        <BadgeCheck className="size-3.5" />
                      ) : null}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold">
                        {product.name}
                      </span>

                      <span className="mt-1 block text-xs font-semibold text-primary">
                        {product.priceEgp} جنيه مصري
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* بيانات الحساب */}
          <div className="space-y-3">
            <p className="text-sm font-bold">
              بيانات حسابك على المنصة اللي عايز تحلها (كيريو، الثقافة
              المالية)
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="purchase-account-id">Account ID</Label>

                <Input
                  id="purchase-account-id"
                  autoComplete="username"
                  value={accountId}
                  onChange={(event) => setAccountId(event.target.value)}
                  maxLength={200}
                  disabled={pay.isPending || Boolean(pending)}
                  placeholder="أدخل Account ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchase-account-password">
                  Password
                </Label>

                <Input
                  id="purchase-account-password"
                  type="password"
                  autoComplete="current-password"
                  value={accountPassword}
                  onChange={(event) =>
                    setAccountPassword(event.target.value)
                  }
                  maxLength={500}
                  disabled={pay.isPending || Boolean(pending)}
                  placeholder="أدخل Password"
                />
              </div>
            </div>
          </div>

          {/* طرق الدفع */}
          <div className="space-y-3">
            <p className="text-sm font-bold">
              ٣. اختر طريقة الدفع
            </p>

            <div className="grid gap-2 sm:grid-cols-2">
              {methods.map((item) => {
                const isSelected = method === item.method_key;

                return (
                  <button
                    key={item.method_key}
                    type="button"
                    onClick={() =>
                      setMethod(item.method_key as typeof method)
                    }
                    aria-pressed={isSelected}
                    disabled={pay.isPending || Boolean(pending)}
                    className={`flex w-full items-start gap-3 rounded-xl border p-3 text-right transition ${
                      isSelected
                        ? "border-primary bg-primary/10 ring-1 ring-primary/20"
                        : "border-border bg-background hover:border-primary/50 hover:bg-muted/40"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <span
                      className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/50"
                      }`}
                    >
                      {isSelected ? (
                        <BadgeCheck className="size-3.5" />
                      ) : null}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold">
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
                        <span className="mt-2 block text-xs leading-5 text-muted-foreground">
                          {item.instructions}
                        </span>
                      ) : null}

                      {isSelected ? (
                        <span className="mt-2 inline-flex rounded-md bg-primary/10 px-2 py-1 text-[11px] font-bold text-primary">
                          تم الاختيار
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* رقم التحويل */}
          <div className="space-y-2">
            <Label htmlFor="tool-sender">
              ٤. الرقم الذي تم التحويل منه
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

          {/* إثبات الدفع */}
          <div className="space-y-2">
            <Label htmlFor="tool-proof">٥. صورة إثبات الدفع</Label>

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
              <p className="break-all text-sm text-primary">
                الملف المختار: {proof.name}
              </p>
            ) : null}
          </div>

          {/* فتح التأكيد الأول بدل الإرسال المباشر */}
          <Button
            className="w-full"
            disabled={
              pay.isPending ||
              !selectedProduct ||
              !proof ||
              !senderNumber.trim() ||
              !accountId.trim() ||
              !accountPassword ||
              Boolean(pending)
            }
            onClick={() => setShowFirstConfirmation(true)}
          >
            <CreditCard className="ml-2 size-4" />
            مراجعة البيانات وإرسال الطلب
          </Button>
        </CardContent>
      </Card>
    </section>
  ) : (
    /* فورم تفعيل الكود */
    <section className="mt-4 max-w-3xl space-y-4">
      <Card>
        <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <KeyRound className="size-5" />
            تفعيل كود
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
          <p className="text-sm leading-6 text-muted-foreground">
            أدخل كود SPRIX أو Qureo أو SPRIX + Qureo. أكواد الأدوات
            منفصلة عن أكواد باقات الأسئلة.
          </p>

          <div className="space-y-2">
            <Label htmlFor="tool-activation-code">
              كود تفعيل الأداة
            </Label>

            <Input
              id="tool-activation-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="أدخل كود التفعيل"
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

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm leading-6">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />

              <span>
                يتم التحقق من الكود على الخادم، ولن يظهر فورم الحساب
                إلا بعد نجاح التفعيل.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {redeemedToolKeys.length > 0 ? (
        <ToolCredentialSubmissionPage
          key={redeemedToolKeys.join("-")}
          toolKey={redeemedToolKeys[0] ?? "financial_literacy"}
          toolKeys={redeemedToolKeys}
          title={
            redeemedToolKeys.length === 2
              ? "SPRIX + Qureo"
              : redeemedToolKeys[0] === "qureo"
                ? "Qureo"
                : "SPRIX للثقافة المالية"
          }
          description="أدخل بيانات الحساب مرة واحدة، وراجعها في خطوتي التأكيد قبل الإرسال."
        />
      ) : null}
    </section>
  )}

  {/* طلبات الأدوات */}
  <section className="mt-6">
    <Card>
      <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-4">
        <CardTitle className="text-lg">طلبات الأدوات</CardTitle>
      </CardHeader>

      <CardContent className="space-y-2 p-4 pt-0 sm:p-6 sm:pt-0">
        {(orders.data ?? []).slice(0, 6).map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 text-sm"
          >
            <div className="min-w-0">
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
                  ? "مقبول وتم الحل يمكنك مراجعه حسابك علي منصة الوزارة"
                  : "مرفوض"}
            </span>
          </div>
        ))}

        {!orders.data?.length ? (
          <p className="py-4 text-sm text-muted-foreground">
            لا توجد طلبات بعد.
          </p>
        ) : null}
      </CardContent>
    </Card>
  </section>

  {/* نافذة التأكيد الأولى */}
  {showFirstConfirmation ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setShowFirstConfirmation(false);
        }
      }}
    >
      <section
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tool-first-confirmation-title"
        className="my-auto w-full max-w-md overflow-hidden rounded-2xl border border-cyan-500/30 bg-background shadow-2xl shadow-cyan-950/20"
      >
        <div className="border-b border-border/70 bg-cyan-500/5 p-5 text-center">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-500">
            <ShieldCheck className="size-7" />
          </div>

          <h2
            id="tool-first-confirmation-title"
            className="text-xl font-extrabold"
          >
            تأكيد صحة البيانات
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            راجع بيانات حسابك والدفع قبل المتابعة.
          </p>
        </div>

        <div className="space-y-3 p-5">
          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">الأداة المطلوبة</p>
            <p className="mt-1 font-bold">
              {selectedProductDetails?.name ?? "لم يتم تحديد الأداة"}
            </p>
            {selectedProductDetails ? (
              <p className="mt-1 text-sm font-semibold text-primary">
                {selectedProductDetails.priceEgp} جنيه مصري
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Account ID</p>
              <p dir="ltr" className="mt-1 break-all text-left text-sm font-semibold">
                {accountId.trim()}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Password</p>
              <p className="mt-1 text-sm font-semibold">
                •••••••• (تم إدخاله)
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">طريقة الدفع</p>
            <p className="mt-1 font-semibold">
              {selectedMethodDetails?.display_name ?? method}
            </p>

            <p className="mt-3 text-xs text-muted-foreground">
              رقم التحويل
            </p>
            <p dir="ltr" className="mt-1 text-left font-semibold">
              {senderNumber.trim()}
            </p>

            <p className="mt-3 text-xs text-muted-foreground">
              إثبات الدفع
            </p>
            <p className="mt-1 break-all text-sm font-semibold">
              {proof?.name ?? "لم يتم اختيار صورة"}
            </p>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-sm leading-6">
            تأكد أن الـ ID وكلمة المرور خاصان بالحساب الصحيح، وأن رقم
            التحويل وصورة الإيصال يخصان عملية الدفع نفسها.
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setShowFirstConfirmation(false)}
            >
              مراجعة البيانات
            </Button>

            <Button
              type="button"
              className="w-full"
              onClick={handleFirstConfirmation}
            >
              نعم، متأكد
            </Button>
          </div>
        </div>
      </section>
    </div>
  ) : null}

  {/* نافذة التأكيد الثانية - الإرسال النهائي */}
  {showSecondConfirmation ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !pay.isPending) {
          setShowSecondConfirmation(false);
        }
      }}
    >
      <section
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tool-second-confirmation-title"
        className="my-auto w-full max-w-md overflow-hidden rounded-2xl border border-cyan-500/40 bg-background shadow-2xl shadow-cyan-950/30"
      >
        <div className="border-b border-border/70 bg-cyan-500/5 p-5 text-center">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-500">
            <LockKeyhole className="size-7" />
          </div>

          <h2
            id="tool-second-confirmation-title"
            className="text-xl font-extrabold"
          >
            تأكيد أخير قبل الإرسال
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            أنت على وشك إرسال طلب شراء إلى الإدارة. تأكد من صحة كل
            البيانات قبل التأكيد النهائي.
          </p>
        </div>

        <div className="space-y-4 p-5">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-amber-500" />
              <div className="space-y-1">
                <p className="font-bold">هل راجعت كل البيانات؟</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  بعد الإرسال، سيظهر طلبك للإدارة لمراجعة الدفع وتفعيل
                  الأداة. لا ترسل الطلب إلا إذا كنت متأكدًا من صحة
                  البيانات والإيصال.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">الأداة</span>
              <span className="font-bold">
                {selectedProductDetails?.name ?? "—"}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-muted-foreground">المبلغ</span>
              <span className="font-bold text-primary">
                {selectedProductDetails
                  ? `${selectedProductDetails.priceEgp} جنيه`
                  : "—"}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-muted-foreground">طريقة الدفع</span>
              <span className="font-bold">
                {selectedMethodDetails?.display_name ?? method}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={pay.isPending}
              onClick={() => {
                setShowSecondConfirmation(false);
                setShowFirstConfirmation(true);
              }}
            >
              رجوع للمراجعة
            </Button>

            <Button
              type="button"
              className="w-full"
              disabled={pay.isPending}
              onClick={handleFinalConfirmation}
            >
              <ShieldCheck className="ml-2 size-4" />
              {pay.isPending
                ? "جارٍ إرسال الطلب..."
                : "نعم، البيانات صحيحة"}
            </Button>
          </div>
        </div>
      </section>
    </div>
  ) : null}
</main>


);
}
