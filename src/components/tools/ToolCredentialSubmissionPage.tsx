import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  CreditCard,
  KeyRound,
  ShieldCheck,
  LockKeyhole,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import {
  getMyToolAccess,
  getToolAccountStatus,
  linkToolAccount,
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
  title,
  description,
}: {
  toolKey: ToolKey;
  title: string;
  description: string;
}) {
  const qc = useQueryClient();

  const [accountId, setAccountId] = useState("");
  const [password, setPassword] = useState("");

  const access = useQuery({
    queryKey: ["wiso-tools-access"],
    queryFn: () => getMyToolAccess(),
  });

  const account = useQuery({
    queryKey: ["wiso-tool-account", toolKey],
    queryFn: () =>
      getToolAccountStatus({
        data: { toolKey },
      }),
  });

  const active =
    access.data?.some(
      (item) => item.tool_key === toolKey && item.available,
    ) ?? false;

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
    mutationFn: () =>
      linkToolAccount({
        data: {
          toolKey,
          id: accountId.trim(),
          password,
        },
      }),

    onSuccess: async () => {
      toast.success("تم حفظ بيانات الحساب واستهلاك المحاولة بنجاح.");

      setPassword("");
      setAccountId("");

      await Promise.all([
        qc.invalidateQueries({
          queryKey: ["wiso-tool-account", toolKey],
        }),
        qc.invalidateQueries({
          queryKey: ["wiso-tools-access"],
        }),
      ]);
    },

    onError: async (error: Error) => {
      await qc.invalidateQueries({
        queryKey: ["wiso-tool-account", toolKey],
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
        toast.error(
          "الأداة غير مفعّلة لحسابك أو انتهت صلاحية التفعيل.",
        );
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
                  <p className="font-bold">
                    الأداة غير مفعّلة لحسابك
                  </p>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    اشترِ الأداة من قسم الدفع أو فعّل اشتراكك باستخدام
                    كود التفعيل إذا كان متوفرًا لديك.
                  </p>
                </div>
              </div>

              <Button asChild className="w-full sm:w-auto">
                <Link to="/tools" hash="tool-payment">
                  <CreditCard className="ml-2 size-4" />
                  اشحن وفعّل الأداة الآن
                </Link>
              </Button>
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
                  onChange={(event) =>
                    setAccountId(event.target.value)
                  }
                  maxLength={200}
                  disabled={submit.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tool-account-password">
                  Password
                </Label>

                <Input
                  id="tool-account-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
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
                onClick={() => submit.mutate()}
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
    </main>
  );
}
