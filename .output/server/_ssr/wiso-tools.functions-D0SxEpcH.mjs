import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { n as requireSupabaseAuth } from "./auth-middleware-BgIfV4zI.mjs";
import { t as createSsrRpc } from "./createSsrRpc-lwvUPFNu.mjs";
import { t as requireSupabaseAdmin } from "./admin.middleware-CR-36Rm9.mjs";
import { l as getToolProduct } from "./server-LV6XjVEX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wiso-tools.functions-D0SxEpcH.js
function toolForPath(value) {
	if (value === "financial_literacy" || value === "qureo") return value;
	throw new Error("INVALID_TOOL");
}
var getToolCatalogFn = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("a4cd52b12486753e4f399479c86d73e13ee400edf9335022cd90137c88ad88bf"));
var getMyToolAccess = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("0554eac91121e007ca8350df2886e51b9a7b797df1204820c453dbd063d308e1"));
var getMyToolOrders = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("3e38cd93809007e6c184df364c21d53f1a3a85a077b39248e217aecfa82adc77"));
var submitToolPayment = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => {
	getToolProduct(input.productKey);
	return input;
}).handler(createSsrRpc("9a215856cd824d0e0f714cf3e6402eb020313b6cbcc02dfbc889bb14c0e4a66e"));
var redeemToolCode = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => {
	if (!input.code.trim()) throw new Error("CODE_REQUIRED");
	return { code: input.code.trim() };
}).handler(createSsrRpc("e6a70c1aa358af3e10c57e6377585703f11cbdd4ddf283cbd8221fed51b4a44e"));
var getToolAccountStatus = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).inputValidator((input) => ({ toolKey: toolForPath(input.toolKey) })).handler(createSsrRpc("16d4bc0d9bd5e9eb5a729a02ed9cd46ef0eb20eab4816a30020a4d364ff217d1"));
var getSprixSubjectsForUser = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("70f25203114f5f7e30d085f569e714e2876246742af07bfb7dde72baf6c71000"));
var linkToolAccount = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => {
	const toolKey = toolForPath(input.toolKey);
	const id = input.id.trim();
	if (!id || !input.password) throw new Error("TOOL_CREDENTIALS_REQUIRED");
	if (id.length > 200 || input.password.length > 500) throw new Error("TOOL_CREDENTIALS_INVALID");
	return {
		toolKey,
		id,
		password: input.password
	};
}).handler(createSsrRpc("45e4e4e46d2771970207e13d10228a561f5a9966eab30fdc7294afbc108c598f"));
var startToolJob = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => {
	const toolKey = toolForPath(input.toolKey);
	if (toolKey === "financial_literacy" && !input.subjectId?.trim()) throw new Error("SPRIX_SUBJECT_REQUIRED");
	return {
		toolKey,
		subjectId: input.subjectId?.trim() || null
	};
}).handler(createSsrRpc("47c63bb40459923080aa0e80f0c8dd3813012350573a5ff10aba13828ed7345c"));
var getToolJob = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("edb9fdaf4965cb3a0f7b8a937a88427ae3a907d2befe031d6e22fcc5b022b847"));
var stopToolJob = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("9553b1a23bcbfb8a013144178123125ea6cf62fed0186695e16af54dcdd61ae6"));
var adminGetToolOrders = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("59f9a6196ddb7139d94d96f00f286ee5cf9d4631b5cd1057cbac52cfda9be00b"));
var adminReviewToolOrderRequest = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("6e09eb620fa8674c50d723f19e0873b2fd4738a8ebf45a84e6a5aeeee1d46a3f"));
var adminGetToolPaymentProofUrl = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("c02107f430f125f0f3adad22efb0ec7cb0d1ffbd55154254f05f057b70732eae"));
var adminGetToolJobs = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(createSsrRpc("c8f959ca0e5bbb83b3fc057d1a349666b515a0ad26058141daf1e38cab1c2fe9"));
//#endregion
export { getMyToolAccess as a, getToolAccountStatus as c, linkToolAccount as d, redeemToolCode as f, submitToolPayment as h, adminReviewToolOrderRequest as i, getToolCatalogFn as l, stopToolJob as m, adminGetToolOrders as n, getMyToolOrders as o, startToolJob as p, adminGetToolPaymentProofUrl as r, getSprixSubjectsForUser as s, adminGetToolJobs as t, getToolJob as u };
