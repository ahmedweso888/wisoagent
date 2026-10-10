import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { recordReferralVisit } from "@/lib/referral.functions";
import { createUuid } from "@/lib/uuid";

export const Route = createFileRoute("/invite/$code")({
  component: InvitePage,
});

function InvitePage() {
  const { code } = Route.useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const normalized = code.trim().toUpperCase();
    const keyName = "wiso_referral_visitor";
    const refKey = "wiso_referral_code";
    const visitorKey = localStorage.getItem(keyName) ?? createUuid();
    localStorage.setItem(keyName, visitorKey);
    localStorage.setItem(refKey, normalized);

    void recordReferralVisit({
      data: { code: normalized, visitorKey },
    }).finally(() => {
      void navigate({ to: "/auth" });
    });
  }, [code, navigate]);

  return (
    <main dir="rtl" className="flex min-h-screen items-center justify-center p-6">
      <p className="text-sm text-muted-foreground">جارٍ تجهيز رابط الدعوة...</p>
    </main>
  );
}
