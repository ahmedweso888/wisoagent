import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/common/Footer";
import { WisoMark } from "@/components/common/WisoMark";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "WISO — دخول الطلاب" },
      {
        name: "description",
        content:
          "سجّل دخولك أو اعمل حساب جديد، وخد كود طالب خاص بيك وتجربة 24 ساعة.",
      },
      { property: "og:title", content: "WISO — دخول الطلاب" },
      {
        property: "og:description",
        content: "حساب واحد لخطة المعركة ومحرك الأسئلة التقيلة.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      toast.error("حصلت مشكلة بسيطة. جرّب تاني كده.");
      return;
    }

    // Successful authentication.
    // The authenticated route will handle admin/student access
    // and student onboarding requirements.
    await navigate({ to: "/dashboard" });

    setLoading(false);
  }

  async function signUp(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName,
        },
      },
    });

    setLoading(false);

    if (error) {
      toast.error("حصلت مشكلة بسيطة. جرّب تاني كده.");
      return;
    }

    if (!data.session) {
      toast.success("بصّ في إيميلك وأكّد الحساب.");
      return;
    }

    void navigate({ to: "/onboarding" });
  }

  async function forgotPassword() {
    if (!email) {
      toast.error("اكتب إيميلك الأول.");
      return;
    }

    setLoading(true);

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    toast.success("بعتنالك لينك لو الإيميل مسجّل عندنا.");
  }

  async function signInWithGoogle() {
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/onboarding`,
      },
    });

    if (error) {
      setLoading(false);
      toast.error("تعذّر الدخول بجوجل. جرّب تاني.");
    }
  }

  return (
    <div
      dir="rtl"
      className="flex min-h-screen flex-col bg-background"
    >
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-2">

        {/* =========================
            AUTH / FORM SECTION
        ========================== */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:order-1 lg:px-14 lg:py-12">
          <div className="w-full max-w-md">

            {/* Logo */}
            <Link
              to="/"
              className="mb-6 flex items-center justify-center gap-2.5"
            >
              <WisoMark className="h-10 w-16" />
              <span className="font-display text-lg font-bold">
                WISO
              </span>
            </Link>

            {/* Heading */}
            <div className="mb-5 text-center">
              <h1 className="font-display text-2xl font-extrabold">
                يلا نبدأ ونخلص اللي ورانا
              </h1>

              <p className="mt-1.5 text-sm text-muted-foreground">
                دخول واحد، وبعدها خطة المعركة والأسئلة التقيلة.
              </p>
            </div>

            {/* Auth Card */}
            <div className="surface-panel p-6">

              {/* Google */}
              <Button
                type="button"
                variant="outline"
                className="mb-4 w-full"
                disabled={loading}
                onClick={signInWithGoogle}
              >
                الدخول بحساب Google
              </Button>

              {/* Divider */}
              <div className="mb-4 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />

                أو بالإيميل

                <span className="h-px flex-1 bg-border" />
              </div>

              {/* Login / Register Tabs */}
              <Tabs defaultValue="login">

                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">
                    دخول
                  </TabsTrigger>

                  <TabsTrigger value="register">
                    حساب جديد
                  </TabsTrigger>
                </TabsList>

                {/* =====================
                    LOGIN
                ====================== */}
                <TabsContent
                  value="login"
                  className="mt-5"
                >
                  <form
                    onSubmit={signIn}
                    className="space-y-4"
                  >
                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="login-email">
                        الإيميل
                      </Label>

                      <Input
                        id="login-email"
                        type="email"
                        dir="ltr"
                        required
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                      />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="login-password">
                        الباسورد
                      </Label>

                      <Input
                        id="login-password"
                        type="password"
                        dir="ltr"
                        required
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                      />
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? "لحظة..." : "يلا ندخل"}
                    </Button>

                    {/* Forgot Password */}
                    <button
                      type="button"
                      onClick={forgotPassword}
                      className="w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
                    >
                      نسيت الباسورد؟
                    </button>
                  </form>
                </TabsContent>

                {/* =====================
                    REGISTER
                ====================== */}
                <TabsContent
                  value="register"
                  className="mt-5"
                >
                  <form
                    onSubmit={signUp}
                    className="space-y-4"
                  >
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="reg-name">
                        اسمك بالكامل
                      </Label>

                      <Input
                        id="reg-name"
                        required
                        value={fullName}
                        onChange={(e) =>
                          setFullName(e.target.value)
                        }
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">
                        الإيميل
                      </Label>

                      <Input
                        id="reg-email"
                        type="email"
                        dir="ltr"
                        required
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                      />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">
                        الباسورد
                      </Label>

                      <Input
                        id="reg-password"
                        type="password"
                        dir="ltr"
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                      />
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading
                        ? "لحظة..."
                        : "اعمل حسابي"}
                    </Button>

                    <p className="text-center text-xs text-muted-foreground">
                      هتاخد كود طالب خاص بيك و40 سؤال مجاني
                      24 ساعة.
                    </p>
                  </form>
                </TabsContent>

              </Tabs>
            </div>
          </div>
        </section>

        {/* =========================
            WISO AGENT IMAGE SECTION
        ========================== */}
        {/* =========================
    WISO AGENT IMAGE SECTION
========================== */}
{/* =========================
    WISO AGENT IMAGE SECTION
========================== */}
<section
  className="
    hero-glow
    relative
    flex
    items-center
    justify-center
    overflow-hidden
    px-5
    pb-10
    pt-8
    sm:px-8
    sm:pb-12
    lg:order-2
    lg:px-10
    lg:py-10
  "
>
  {/* Original grid background */}
  <div
    aria-hidden="true"
    className="app-grid pointer-events-none absolute inset-0"
  />

  {/* Background glow */}
  <div
    aria-hidden="true"
    className="
      pointer-events-none
      absolute
      inset-0
      bg-gradient-to-br
      from-primary/10
      via-transparent
      to-primary/5
    "
  />

  {/* Card */}
  <div className="relative z-10 w-full max-w-2xl">
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        border-border/60
        bg-card
        p-2
        shadow-2xl
        shadow-black/10
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-black/15
        sm:p-3
      "
    >
      <div className="relative overflow-hidden rounded-[1.35rem] bg-muted">
        <img
          src="/wiso-agent-auth.png"
          alt="WISO Agent"
          className="
            block
            h-auto
            w-full
            object-contain
            transition-transform
            duration-700
            group-hover:scale-[1.015]
          "
        />
      </div>
    </div>
  </div>
</section>

      </div>

      <Footer />
    </div>
  );
}