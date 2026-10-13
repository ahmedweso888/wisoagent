import { createFileRoute } from "@tanstack/react-router";
import { ToolCredentialSubmissionPage } from "@/components/tools/ToolCredentialSubmissionPage";
import { toast } from "sonner";
import { useEffect } from "react";

function Page() {
  useEffect(() => {
    toast("من فضلك اقرأ التعليمات", {
      description: "راجع التعليمات جيدًا قبل إرسال بيانات حسابك.",
      duration: 6000,
    });
  }, []);

  return (
    <div className="min-h-screen">
      <ToolCredentialSubmissionPage
        toolKey="financial_literacy"
        title="وكيل الثقافة المالية — SPRIX"
        description="أرسل بيانات حساب SPRIX وهيتم الحل لحظيًا، مع كل شكرنا ليكم على اختيار WISO AGENT."
      />

      <div className="mx-auto w-full max-w-3xl px-4 pb-10">
        <div
          dir="rtl"
          className="relative overflow-hidden rounded-2xl border border-cyan-400/40 bg-black p-5 shadow-[0_0_25px_rgba(34,211,238,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] sm:p-7"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-xl">
              ⚠️
            </div>

            <div className="min-w-0">
              <h2 className="mb-3 text-lg font-bold text-cyan-300 sm:text-xl">
                تنبيه هام — WISO AGENT
              </h2>

              <p className="text-sm leading-8 text-white/85 sm:text-base">
                لو بعد إرسال بياناتك اكتشفت إن فيه خطأ في البيانات، أو
                واجهت مشكلة بسبب الضغط الكبير على الأدوات، برجاء إرسال
                صورة التحويل والبيانات الصحيحة إلى أحد أرقام الدعم المعتمدة.
              </p>

              <div className="mt-4 border-t border-white/10 pt-4">
                <p className="text-sm font-medium leading-7 text-cyan-100">
                  شكرًا لثقتكم وتفهمكم ❤️
                </p>

                <p className="mt-2 text-xs font-bold tracking-widest text-cyan-400">
                  WISO AGENT
                </p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/sprix")({
  component: Page,
});
