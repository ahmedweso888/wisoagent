import { createFileRoute } from "@tanstack/react-router";
import { ToolCredentialSubmissionPage } from "@/components/tools/ToolCredentialSubmissionPage";
export const Route = createFileRoute("/_authenticated/qureo")({ component: () => <ToolCredentialSubmissionPage toolKey="qureo" title="Qureo Agent" description="أرسل بيانات حساب Qureo  وهيتم الحل لحظيا مع كل شكرنا ليكم علي اختيار wiso agent." /> });
