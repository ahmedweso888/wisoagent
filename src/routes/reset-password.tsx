import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WisoMark } from "@/components/common/WisoMark";

export const Route = createFileRoute("/reset-password")({
head: () => ({
meta: [
{ title: "استعادة كلمة السر | WISO" },
{
name: "description",
content: "عيّن كلمة سر جديدة لحسابك في WISO.",
},
],
}),
component: ResetPasswordPage,
});

function ResetPasswordPage() {
const navigate = useNavigate();

const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [checking, setChecking] = useState(true);
const [saving, setSaving] = useState(false);
const [validRecovery, setValidRecovery] = useState(false);

useEffect(() => {
let active = true;


async function checkRecoverySession() {
  try {
    const url = new URL(window.location.href);
    const hash = new URLSearchParams(url.hash.slice(1));

    const hashError = hash.get("error_description") || hash.get("error");

    if (hashError) {
      throw new Error(
        hash.get("error_code") === "otp_expired"
          ? "رابط الاستعادة انتهت صلاحيته. اطلب رابطًا جديدًا."
          : "رابط الاستعادة غير صالح. اطلب رابطًا جديدًا.",
      );
    }

    const code = url.searchParams.get("code");

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        throw new Error(
          "تعذّر التحقق من رابط الاستعادة. اطلب رابطًا جديدًا.",
        );
      }
    } else {
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      const type = hash.get("type");

      if (accessToken && refreshToken && type === "recovery") {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          throw new Error(
            "رابط الاستعادة غير صالح أو انتهت صلاحيته. اطلب رابطًا جديدًا.",
          );
        }
      } else {
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          throw new Error(
            "افتح رابط الاستعادة الذي وصلك في الإيميل، أو اطلب رابطًا جديدًا.",
          );
        }
      }
    }

    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      throw new Error(
        "تعذّر التحقق من جلسة الاستعادة. اطلب رابطًا جديدًا.",
      );
    }

    if (active) {
      setValidRecovery(true);
    }
  } catch (error) {
    if (active) {
      toast.error(
        error instanceof Error
          ? error.message
          : "حصلت مشكلة في رابط الاستعادة.",
      );
      setValidRecovery(false);
    }
  } finally {
    if (active) {
      setChecking(false);
    }
  }
}

void checkRecoverySession();

return () => {
  active = false;
};


}, []);

async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
event.preventDefault();


if (password.length < 8) {
  toast.error("كلمة السر لازم تكون 8 أحرف على الأقل.");
  return;
}

if (password !== confirmPassword) {
  toast.error("كلمتا السر مش متطابقتين.");
  return;
}

setSaving(true);

try {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError || !sessionData.session) {
    throw new Error("جلسة الاستعادة انتهت. اطلب رابطًا جديدًا.");
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    throw error;
  }

  toast.success("تم تغيير كلمة السر بنجاح.");

  await supabase.auth.signOut();

  await navigate({ to: "/auth" });
} catch (error) {
  console.error("Password update error:", error);

  toast.error(
    error instanceof Error
      ? error.message
      : "تعذّر تغيير كلمة السر. جرّب مرة تانية.",
  );
} finally {
  setSaving(false);
}

}

return ( <main
   dir="rtl"
   className="flex min-h-screen items-center justify-center bg-background px-4 py-10"
 > <section className="surface-panel w-full max-w-md p-6 sm:p-8"> <Link
       to="/"
       className="mb-6 flex items-center justify-center gap-2"
     > <WisoMark className="h-10 w-16" /> <span className="font-display text-lg font-bold">WISO</span> </Link>

    <div className="mb-6 text-center">
      <h1 className="text-2xl font-extrabold">
        تعيين كلمة سر جديدة
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        اختار كلمة سر جديدة لحسابك.
      </p>
    </div>

    {checking ? (
      <p className="py-6 text-center text-sm text-muted-foreground">
        بنتحقق من رابط الاستعادة...
      </p>
    ) : !validRecovery ? (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          مش قادرين نتحقق من الرابط. ممكن يكون انتهت صلاحيته أو تم استخدامه
          قبل كده.
        </p>

        <Button
          className="w-full"
          onClick={() => navigate({ to: "/auth" })}
        >
          الرجوع لتسجيل الدخول
        </Button>
      </div>
    ) : (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-password">كلمة السر الجديدة</Label>
          <Input
            id="new-password"
            type="password"
            dir="ltr"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="8 أحرف على الأقل"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">
            أكّد كلمة السر الجديدة
          </Label>
          <Input
            id="confirm-password"
            type="password"
            dir="ltr"
            autoComplete="new-password"
            minLength={8}
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="اكتب كلمة السر مرة تانية"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={saving}
        >
          {saving ? "بنحفظ كلمة السر..." : "حفظ كلمة السر الجديدة"}
        </Button>
      </form>
    )}
  </section>
</main>


);
}