import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
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
      toast.success(
        "تم حفظ بيانات الحساب واستهلاك المحاولة بنجاح.",
      );

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
        toast.error(
          "تم استهلاك محاولة إرسال البيانات لهذا التفعيل.",
        );
        return;
      }

      if (message.includes("TOOL_ATTEMPT_NOT_AVAILABLE")) {
        toast.error(
          "لا توجد محاولة إرسال متاحة لهذا التفعيل.",
        );
        return;
      }

      if (message.includes("TOOL_ACCESS_REQUIRED")) {
        toast.error(
          "الأداة غير مفعّلة لحسابك أو انتهت صلاحية التفعيل.",
        );
        return;
      }

      if (message.includes("TOOL_ACCOUNT_ALREADY_BOUND")) {
        toast.error(
          "هذا الحساب مرتبط بمستخدم آخر.",
        );
        return;
      }

      if (message.includes("TOOL_ACCOUNT_REBIND_NOT_ALLOWED")) {
        toast.error(
          "لا يمكن تغيير الحساب المرتبط بعد تأكيده.",
        );
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
      <PageHeader
        title={title}
        subtitle={description}
      />

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
            <div className="rounded-xl border p-4 text-sm">
              تعذر التحقق من حالة حسابك. حدّث الصفحة وحاول مرة أخرى.
            </div>
          ) : !active ? (
            <p className="rounded-xl border p-4 text-sm">
              الأداة غير مفعّلة لحسابك. اشحن أو فعّل كود الأداة أولًا.
            </p>
          ) : attemptConsumed ? (
            <div className="space-y-3 rounded-xl border p-4">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="size-5" />
                تم استلام بيانات حسابك
              </div>

              <p className="text-sm text-muted-foreground">
                تم استهلاك محاولة إرسال البيانات الخاصة بهذا التفعيل.
                لا يمكنك إرسال بيانات بديلة ضمن التفعيل نفسه.
              </p>

              <p className="text-sm text-muted-foreground">
                بسبب ضغط الطلبات على WISO Agent، يُرجى التواصل مع الدعم
                إذا لم تتم معالجة حسابك خلال يومين.
              </p>
            </div>
          ) : !attemptAvailable ? (
            <div className="rounded-xl border p-4 text-sm">
              لا توجد محاولة إرسال متاحة لهذا التفعيل حاليًا.
              إذا كنت قد فعّلت الأداة للتو، حدّث الصفحة أو تواصل مع الدعم.
            </div>
          ) : (
            <>
              <div className="rounded-xl border p-4 text-sm">
                <div className="mb-2 flex items-center gap-2 font-medium">
                  <LockKeyhole className="size-4" />
                  لديك محاولة واحدة لإرسال بيانات الحساب
                </div>

                <p className="text-muted-foreground">
                  تأكد من صحة اسم المستخدم وكلمة المرور قبل الإرسال.
                  بمجرد حفظ البيانات بنجاح، تُستهلك المحاولة نهائيًا，
           لو حصل غلط تواصل مع الدعم وابعت اسكرين التحويل والid والباسوورد وهنراجع بياناتك 
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