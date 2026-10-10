import { useEffect, useState } from "react";
import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { Menu } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { WisoMark } from "@/components/common/WisoMark";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { captureReferralAttribution } from "@/lib/referral.functions";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,

  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      throw redirect({ to: "/auth" });
    }

    const userId = data.user.id;

    const { data: roleRow, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) {
      throw roleError;
    }

    // Admins do not need student onboarding.
    if (roleRow?.role === "admin") {
      return {
        user: data.user,
        isAdmin: true,
      };
    }

    // Students must complete onboarding before accessing the platform.
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("onboarded_at, school_year")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    if (
      location.pathname !== "/onboarding" &&
      (!profile?.onboarded_at || !profile.school_year)
    ) {
      throw redirect({ to: "/onboarding" });
    }

    return {
      user: data.user,
      isAdmin: false,
    };
  },

  component: AuthedLayout,
});

const NAV = [
  { to: "/dashboard", label: "الرئيسية" },
  { to: "/profile", label: "الملف الشخصي" },
  { to: "/plan", label: "خطة السنة الدراسية" },
  { to: "/generate", label: "مولد الأسئلة" },
  { to: "/wallet", label: "شحن المحفظة" },
  { to: "/requests", label: "الطلبات الخاصة" },
  { to: "/tools", label: "أدوات WISO" },
  { to: "/sprix", label: "الثقافة المالية" },
  { to: "/qureo", label: "Qureo" },
  { to: "/work-with-wiso", label: "اشتغل مع WISO" },
  { to: "/notifications", label: "الإشعارات" },
  { to: "/settings", label: "الإعدادات" },
] as const;

const ADMIN_NAV = [
  { to: "/admin", label: "لوحة الإدارة" },
  { to: "/admin/notifications", label: "إشعارات الإدارة" },
  { to: "/admin/students", label: "الطلاب" },
  { to: "/admin/curriculum", label: "المناهج" },
  { to: "/admin/questions", label: "بنك الأسئلة" },
  { to: "/admin/bundles", label: "الباقات" },
  { to: "/admin/payments", label: "المدفوعات" },
  { to: "/admin/centers", label: "المراكز" },
  { to: "/admin/jobs", label: "مهام الذكاء" },
  { to: "/admin/ai", label: "إعدادات الذكاء" },
  { to: "/admin/requests", label: "الطلبات الخاصة" },
  { to: "/admin/center-requests", label: "طلبات السناتر" },
  { to: "/admin/tools", label: "أدوات WISO" },
  { to: "/admin/sprix", label: "SPRIX Legacy" },
  { to: "/admin/system", label: "إعدادات النظام" },
] as const;

function NavLinks({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const { isAdmin } = useAuth();

  return (
    <div className={cn("space-y-1.5", className)}>
      {NAV.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className="block rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          activeProps={{
            className:
              "bg-sidebar-primary text-sidebar-primary-foreground font-bold",
          }}
        >
          {item.label}
        </Link>
      ))}

      {isAdmin ? (
        <>
          <div className="my-4 h-px bg-sidebar-border" />

          {ADMIN_NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{
                className:
                  "bg-sidebar-primary text-sidebar-primary-foreground font-bold",
              }}
            >
              {item.label}
            </Link>
          ))}
        </>
      ) : null}
    </div>
  );
}

function AuthedLayout() {
  const [open, setOpen] = useState(false);
  const { profile, user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const code = localStorage.getItem("wiso_referral_code");
    if (!code) return;

    void captureReferralAttribution({ data: { code } })
      .then(() => localStorage.removeItem("wiso_referral_code"))
      .catch(() => {
        // Keep the code for a later authenticated retry (e.g. email confirmation).
      });
  }, [user]);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-background lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]"
    >
      <aside className="sticky top-0 hidden h-screen overflow-y-auto bg-sidebar px-4 py-5 text-sidebar-foreground lg:flex lg:flex-col">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 border-b border-sidebar-border px-2 pb-5 font-display font-bold"
        >
          <WisoMark className="h-9 w-14" />
          <span>وكيلك الدراسي</span>
        </Link>

        <nav className="mt-5 flex-1">
          <NavLinks />
        </nav>

        <p className="border-t border-sidebar-border px-3 pt-4 text-xs text-sidebar-foreground/45">
          لو  مغيرتش حاجه . مفيش حاجه هتتغير.....
        </p>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b border-border bg-background/92 backdrop-blur-xl">
          <div className="mx-auto grid max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5 lg:px-8">
            <Link to="/dashboard" className="lg:hidden">
              <WisoMark className="h-8 w-12" />
            </Link>

            <p className="min-w-0 truncate text-xs font-semibold text-muted-foreground sm:text-sm">
              {profile?.full_name
                ? `أهلاً، ${profile.full_name.split(" ")[0]}`
                : "أهلاً بيك في WISO"}
            </p>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="فتح القائمة"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>

              <SheetContent
                side="left"
                className="w-72 border-sidebar-border bg-sidebar text-sidebar-foreground"
              >
                <div className="mt-8">
                  <div className="mb-5 flex items-center gap-3 border-b border-sidebar-border pb-5">
                    <WisoMark className="h-9 w-14" />
                    <span className="font-display font-bold">WISO</span>
                  </div>

                  <NavLinks onNavigate={() => setOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  );
}