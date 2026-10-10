import { createFileRoute } from "@tanstack/react-router";
import { ToolCredentialSubmissionPage } from "@/components/tools/ToolCredentialSubmissionPage";
export const Route = createFileRoute("/_authenticated/sprix")({ component: () => <ToolCredentialSubmissionPage toolKey="financial_literacy" title="وكيل الثقافة المالية — SPRIX" description="أرسل بيانات حساب SPRIX  وهيتم الحل لحظيا مع كل شكرنا ليكم علي اختيار wiso agent." /> });
