import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  KeyRound,
  ShieldCheck,
  LockKeyhole,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import {
  getMyToolAccess,
  getToolAccountStatus,
  linkToolAccount,
  linkToolAccounts,
} from "@/lib/wiso-tools.functions";

import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ToolKey = "qureo" | "financial_literacy";

export function ToolCredentialSubmissionPage({
  toolKey,
  toolKeys,
  title,
  description,
}: {
  toolKey: ToolKey;
  toolKeys?: ToolKey[];
  title: string;
  description: string;
}) {
  const qc = useQueryClient();
  const submissionToolKeys = toolKeys?.length ? toolKeys : [toolKey];
  const combined = submissionToolKeys.length > 1;

  const [accountId, setAccountId] = useState("");
  const [password, setPassword] = useState("");
  const [showFirstConfirmation, setShowFirstConfirmation] = useState(false);
  const [showSecondConfirmation, setShowSecondConfirmation] = useState(false);

  useEffect(() => {
    toast("من فضلك اقرأ التعليمات", {
      description: "تأكد من قراءة التعليمات ومراجعة بياناتك قبل الإرسال.",
      duration: 6000,
    });
  }, []);

  const access = useQuery({
    queryKey: ["wiso-tools-access"],
    queryFn: () => getMyToolAccess(),
  });

  const account = useQuery({
    queryKey: ["wiso-tool-account", ...submissionToolKeys],
    queryFn: async () => {
      const statuses = await Promise.all(submissionToolKeys.map((key) =>
        getToolAccountStatus({ data: { toolKey: key } })
      ));
      return {
        linked: statuses.every((item) => item.linked),
        verifiedAt: statuses.map((item) => item.verifiedAt).filter(Boolean)[0] ?? null,
        attemptConsumed: statuses.some((item) => item.attemptConsumed),
        attemptAvailable: statuses.every((item) => item.attemptAvailable),
      };
    },
  });

  const active =
    submissionToolKeys.every((key) => access.data?.some((item) => item.tool_key === key && item.available) ?? false);

  const accountStatus = account.data as
    | {
        linked?: boolean;
        verifiedAt?: string | null;
        attemptConsumed?: boolean;
        attemptAvailable?: boolean;
      }
    | undefined;

  const attemptConsumed = accountStatus?.attemptConsumed ?? false;
  const attemptAvailable = accountStatus?.attemptAvailable ?? false;

  const canSubmit = active && attemptAvailable && !attemptConsumed;

  const submit = useMutation({
    mutationFn: async () => {
      if (combined) {
        return linkToolAccounts({ data: { toolKeys: submissionToolKeys, id: accountId.trim(), password } });
      }

      const result = await linkToolAccount({
        data: {
          toolKey,
          id: accountId.trim(),
          password,
        },
      });
      return { linked: true as const, result };
    },

    onSuccess: async () => {
      toast.success("تم حفظ بيانات الحساب واستهلاك المحاولة بنجاح.");

      setPassword("");
      setAccountId("");
      setShowFirstConfirmation(false);
      setShowSecondConfirmation(false);

      await Promise.all([
        qc.invalidateQueries({
          queryKey: ["wiso-tool-account", ...submissionToolKeys],
        }),
        qc.invalidateQueries({
          queryKey: ["wiso-tools-access"],
        }),
      ]);
    },

    onError: async (error: Error) => {
      await qc.invalidateQueries({
        queryKey: ["wiso-tool-account"],
      });

      const message = error.message ?? "";

      if (message.includes("TOOL_ATTEMPT_ALREADY_USED")) {
        toast.error("تم استهلاك محاولة إرسال البيانات لهذا التفعيل.");
        return;
      }

      if (message.includes("TOOL_ATTEMPT_NOT_AVAILABLE")) {
        toast.error("لا توجد محاولة إرسال متاحة لهذا التفعيل.");
        return;
      }

      if (message.includes("TOOL_ACCESS_REQUIRED")) {
        toast.error("الأداة غير مفعّلة لحسابك أو انتهت صلاحية التفعيل.");
        return;
      }

      if (message.includes("TOOL_ACCOUNT_ALREADY_BOUND")) {
        toast.error("هذا الحساب مرتبط بمستخدم آخر.");
        return;
      }

      if (message.includes("TOOL_ACCOUNT_REBIND_NOT_ALLOWED")) {
        toast.error("لا يمكن تغيير الحساب المرتبط بعد تأكيده.");
        return;
      }

      toast.error(
        "تعذر حفظ البيانات. راجع البيانات وحاول مرة أخرى إذا كانت المحاولة لم تُستهلك.",
      );
    },
  });

  const isLoading = access.isLoading || account.isLoading;

  const handleFirstConfirmation = () => {
    if (!accountId.trim() || !password) {
      toast.error("من فضلك أدخل الـ ID وكلمة المرور أولًا.");
      return;
    }

    setShowFirstConfirmation(false);
    setShowSecondConfirmation(true);
  };

  const handleFinalConfirmation = () => {
    setShowSecondConfirmation(false);
    submit.mutate();
  };

  return (
    <main dir="rtl" className="page-shell">
      <PageHeader title={title} subtitle={description} />

      <Card className="mt-6 max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5" />
            تفعيل الأداة وإرسال بيانات الحساب
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="rounded-xl border p-4 text-sm text-muted-foreground">
              جارٍ التحقق من التفعيل ومحاولة الإرسال...
            </p>
          ) : access.isError || account.isError ? (
            <div className="rounded-xl border p-4 text-sm leading-6">
              تعذر التحقق من حالة حسابك. حدّث الصفحة وحاول مرة أخرى.
            </div>
          ) : !active ? (
            <div className="space-y-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="flex items-start gap-3">
                <LockKeyhole className="mt-0.5 size-5 shrink-0 text-amber-600" />

                <div>
                  <p className="font-bold">الأداة غير مفعّلة لحسابك</p>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    اشترِ الأداة من قسم الدفع أو فعّل اشتراكك باستخدام
                    كود التفعيل إذا كان متوفرًا لديك.
                  </p>
                </div>
              </div>


            </div>
          ) : attemptConsumed ? (
            <div className="space-y-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="size-5 text-emerald-600" />
                تم استلام بيانات حسابك
              </div>

              <p className="text-sm leading-6 text-muted-foreground">
                تم استهلاك محاولة إرسال البيانات الخاصة بهذا التفعيل.
                لا يمكنك إرسال بيانات بديلة ضمن التفعيل نفسه.
              </p>

              <p className="text-sm leading-6 text-muted-foreground">
                بسبب ضغط الطلبات على WISO Agent، يُرجى التواصل مع الدعم
                إذا لم تتم معالجة حسابك خلال يومين.
              </p>
            </div>
          ) : !attemptAvailable ? (
            <div className="rounded-xl border p-4 text-sm leading-6">
              لا توجد محاولة إرسال متاحة لهذا التفعيل حاليًا. إذا كنت
              قد فعّلت الأداة للتو، حدّث الصفحة أو تواصل مع الدعم.
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
                <div className="mb-2 flex items-center gap-2 font-bold">
                  <LockKeyhole className="size-4 text-primary" />
                  لديك محاولة واحدة لإرسال بيانات الحساب
                </div>

                <p className="leading-6 text-muted-foreground">
                  تأكد من صحة اسم المستخدم وكلمة المرور قبل الإرسال.
                  بمجرد حفظ البيانات بنجاح، تُستهلك المحاولة نهائيًا.
                  إذا حدث خطأ، تواصل مع الدعم وأرسل إثبات التحويل
                  والـ ID وبيانات الحساب اللازمة لمراجعة المشكلة.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tool-account-id">
                  Account ID / اسم المستخدم
                </Label>

                <Input
                  id="tool-account-id"
                  autoComplete="username"
                  value={accountId}
                  onChange={(event) => setAccountId(event.target.value)}
                  maxLength={200}
                  disabled={submit.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tool-account-password">Password</Label>

                <Input
                  id="tool-account-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  maxLength={500}
                  disabled={submit.isPending}
                />
              </div>

              <Button
                className="w-full"
                disabled={
                  submit.isPending ||
                  !canSubmit ||
                  !accountId.trim() ||
                  !password
                }
                onClick={() => setShowFirstConfirmation(true)}
              >
                <KeyRound className="ml-2 size-4" />
                {submit.isPending
                  ? "جارٍ حفظ البيانات..."
                  : "تأكيد وإرسال بيانات الحساب"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

    

      {/* نافذة التأكيد الأولى */}
      {showFirstConfirmation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          dir="rtl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="first-confirmation-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-cyan-400/40 bg-black p-6 shadow-[0_0_35px_rgba(34,211,238,0.15)]">
            <div className="mb-4 flex items-center gap-3">
              <ShieldCheck className="size-7 text-cyan-300" />

              <h2
                id="first-confirmation-title"
                className="text-lg font-bold text-cyan-300"
              >
                تأكيد صحة البيانات
              </h2>
            </div>

            <p className="text-sm leading-7 text-white/85">
              هل أنت متأكد من صحة الـ ID وكلمة المرور التي أدخلتهما؟
              يرجى مراجعتهما جيدًا قبل المتابعة.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                className="flex-1"
                onClick={handleFirstConfirmation}
              >
                نعم، متأكد
              </Button>

              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowFirstConfirmation(false)}
              >
                مراجعة البيانات
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة التأكيد الثانية */}
      {showSecondConfirmation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          dir="rtl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="second-confirmation-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-cyan-400/40 bg-black p-6 shadow-[0_0_35px_rgba(34,211,238,0.15)]">
            <div className="mb-4 flex items-center gap-3">
              <LockKeyhole className="size-7 text-cyan-300" />

              <h2
                id="second-confirmation-title"
                className="text-lg font-bold text-cyan-300"
              >
                تأكيد أخير قبل الإرسال
              </h2>
            </div>

            <p className="text-sm leading-7 text-white/85">
              هل أنت متأكد أن البيانات التي أدخلتها هي نفس البيانات التي
              تستخدمها لتسجيل الدخول إلى منصة الوزارة الرسمية؟
            </p>

            <p className="mt-3 text-sm leading-7 text-amber-300">
              بمجرد نجاح الحفظ، ستُستهلك محاولة الإرسال الخاصة بهذا التفعيل.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                className="flex-1"
                disabled={submit.isPending}
                onClick={handleFinalConfirmation}
              >
                {submit.isPending ? "جارٍ الإرسال..." : "نعم، البيانات صحيحة"}
              </Button>

              <Button
                variant="outline"
                className="flex-1"
                disabled={submit.isPending}
                onClick={() => setShowSecondConfirmation(false)}
              >
                رجوع للمراجعة
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
