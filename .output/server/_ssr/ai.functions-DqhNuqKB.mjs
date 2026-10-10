import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { n as requireSupabaseAuth } from "./auth-middleware-BgIfV4zI.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai.functions-DqhNuqKB.js
/**
* Secure seam between the browser and the AI Service Layer.
* API keys only ever exist inside these handlers (server environment).
*/
var aiStatus_createServerFn_handler = createServerRpc({
	id: "eb2ee64070a95f5ca231302b02ebc4033bc4338affec0d905e7b745c92a76c32",
	name: "aiStatus",
	filename: "src/lib/ai.functions.ts"
}, (opts) => aiStatus.__executeServer(opts));
var aiStatus = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(aiStatus_createServerFn_handler, async () => {
	const { getActiveConfig } = await import("./runtime.server-CTv0BXmm.mjs");
	const { providerStatuses } = await import("./registry.server-BFAt_VVY.mjs").then((n) => n.r).then((n) => n.n);
	const { config, enabled } = await getActiveConfig();
	return {
		enabled,
		configured: providerStatuses(config).some((p) => p.active && p.configured),
		routing: "server-controlled-wiso-tier-routing"
	};
});
var aiGenerateQuestions_createServerFn_handler = createServerRpc({
	id: "0e55671fb33596161d4fe6e784132040d22a107057638e765de8505129b5aaaa",
	name: "aiGenerateQuestions",
	filename: "src/lib/ai.functions.ts"
}, (opts) => aiGenerateQuestions.__executeServer(opts));
var aiGenerateQuestions = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(aiGenerateQuestions_createServerFn_handler, async ({ data, context }) => {
	const { generateQuestionsTask } = await import("./tasks.server-CszhbjLq.mjs");
	return generateQuestionsTask(context.userId, data);
});
var aiGenerateQuestionBatch_createServerFn_handler = createServerRpc({
	id: "531b40aad68bab08e101058a41eac00e88bbe1df0a9dcdc2cf33d2357a35a2fa",
	name: "aiGenerateQuestionBatch",
	filename: "src/lib/ai.functions.ts"
}, (opts) => aiGenerateQuestionBatch.__executeServer(opts));
var aiGenerateQuestionBatch = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(aiGenerateQuestionBatch_createServerFn_handler, async ({ data, context }) => {
	const { generateQuestionsTaskDetailed } = await import("./tasks.server-CszhbjLq.mjs");
	return generateQuestionsTaskDetailed(context.userId, data);
});
var aiValidateQuestion_createServerFn_handler = createServerRpc({
	id: "9f12c18ce2aef915f802abb099c03cd446cbb12604432ff0d4fe13530b402eb2",
	name: "aiValidateQuestion",
	filename: "src/lib/ai.functions.ts"
}, (opts) => aiValidateQuestion.__executeServer(opts));
var aiValidateQuestion = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(aiValidateQuestion_createServerFn_handler, async ({ data, context }) => {
	const { validateQuestionTask } = await import("./tasks.server-CszhbjLq.mjs");
	return validateQuestionTask(context.userId, data.question);
});
var aiGeneratePlan_createServerFn_handler = createServerRpc({
	id: "4129f48ba34c4a7887ada04e32f14dc3e638686a378b9fe5df2bd9b5e7c75a68",
	name: "aiGeneratePlan",
	filename: "src/lib/ai.functions.ts"
}, (opts) => aiGeneratePlan.__executeServer(opts));
var aiGeneratePlan = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(aiGeneratePlan_createServerFn_handler, async ({ data, context }) => {
	const { generatePlanTask } = await import("./tasks.server-CszhbjLq.mjs");
	return generatePlanTask(context.userId, data);
});
var aiAnalyzeDocument_createServerFn_handler = createServerRpc({
	id: "2a3d37311a0e943084adad332ff1487ff8e6d6204f9f6de7934d667f32d779be",
	name: "aiAnalyzeDocument",
	filename: "src/lib/ai.functions.ts"
}, (opts) => aiAnalyzeDocument.__executeServer(opts));
var aiAnalyzeDocument = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(aiAnalyzeDocument_createServerFn_handler, async ({ data, context }) => {
	const { analyzeDocumentTask } = await import("./tasks.server-CszhbjLq.mjs");
	return analyzeDocumentTask(context.userId, data);
});
var aiAnalyzeMistakes_createServerFn_handler = createServerRpc({
	id: "8f3a73f2e9c9439a2143581228810e980502d64a1c4f69be0a2f1386ab1be0c5",
	name: "aiAnalyzeMistakes",
	filename: "src/lib/ai.functions.ts"
}, (opts) => aiAnalyzeMistakes.__executeServer(opts));
var aiAnalyzeMistakes = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(aiAnalyzeMistakes_createServerFn_handler, async ({ data, context }) => {
	const { analyzeMistakesTask } = await import("./tasks.server-CszhbjLq.mjs");
	return analyzeMistakesTask(context.userId, data);
});
var aiPerformanceSnapshot_createServerFn_handler = createServerRpc({
	id: "846d7caffc75172e18ded6d0c28e7eb857209661a6ced675cb76576f67d89dc9",
	name: "aiPerformanceSnapshot",
	filename: "src/lib/ai.functions.ts"
}, (opts) => aiPerformanceSnapshot.__executeServer(opts));
var aiPerformanceSnapshot = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(aiPerformanceSnapshot_createServerFn_handler, async ({ data, context }) => {
	const { performanceTask } = await import("./tasks.server-CszhbjLq.mjs");
	return performanceTask(context.userId, data.payload);
});
var exportQuestionPdf_createServerFn_handler = createServerRpc({
	id: "3b79787354a6069758866c30d434dc4df383e4f022b85d182fe72e580dafa8b0",
	name: "exportQuestionPdf",
	filename: "src/lib/ai.functions.ts"
}, (opts) => exportQuestionPdf.__executeServer(opts));
var exportQuestionPdf = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(exportQuestionPdf_createServerFn_handler, async ({ data, context }) => {
	const { exportPersonalizedPdf } = await import("./export.server-DtmYwINa.mjs");
	return exportPersonalizedPdf(context.userId, data);
});
//#endregion
export { aiAnalyzeDocument_createServerFn_handler, aiAnalyzeMistakes_createServerFn_handler, aiGeneratePlan_createServerFn_handler, aiGenerateQuestionBatch_createServerFn_handler, aiGenerateQuestions_createServerFn_handler, aiPerformanceSnapshot_createServerFn_handler, aiStatus_createServerFn_handler, aiValidateQuestion_createServerFn_handler, exportQuestionPdf_createServerFn_handler };
