import { l as createServerFn } from "./createServerFn-yTfeHp1H.mjs";
import { n as requireSupabaseAuth } from "./auth-middleware-BogctHY4.mjs";
import { t as createSsrRpc } from "./createSsrRpc-Ce7g1tLo.mjs";
import { t as requireSupabaseAdmin } from "./admin.middleware-BsoUGKyB.mjs";
import { c as getToolProduct } from "./server-DhRO9ofi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wiso-tools.functions-CHro184D.js
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
	const code = input.code.trim();
	if (!code) throw new Error("CODE_REQUIRED");
	return { code };
}).handler(createSsrRpc("e6a70c1aa358af3e10c57e6377585703f11cbdd4ddf283cbd8221fed51b4a44e"));
var getToolAccountStatus = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).inputValidator((input) => ({ toolKey: toolForPath(input.toolKey) })).handler(createSsrRpc("16d4bc0d9bd5e9eb5a729a02ed9cd46ef0eb20eab4816a30020a4d364ff217d1"));
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
var adminListToolAccounts = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(createSsrRpc("0d87a373f552269003e84e27852b909ccc2ada59af3aabb88d6b00d4ff317d49"));
var adminCompleteToolAccount = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => {
	if (!input.accountId || input.accountId.length > 100) throw new Error("INVALID_ACCOUNT_ID");
	return input;
}).handler(createSsrRpc("3b05958ae505bd8a2a6882162bf62f0f4b38c807147388e1500b064b9f23e667"));
var adminRevealToolCredentials = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => {
	if (!input.accountId || input.accountId.length > 100) throw new Error("INVALID_ACCOUNT_ID");
	return input;
}).handler(createSsrRpc("adeb6e2ae58ef62a6665fbf9e9351963cfeadee720e879ee865d5bc34d7169d2"));
var adminGetToolOrders = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("59f9a6196ddb7139d94d96f00f286ee5cf9d4631b5cd1057cbac52cfda9be00b"));
var adminReviewToolOrderRequest = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("6e09eb620fa8674c50d723f19e0873b2fd4738a8ebf45a84e6a5aeeee1d46a3f"));
var adminGetToolPaymentProofUrl = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(createSsrRpc("c02107f430f125f0f3adad22efb0ec7cb0d1ffbd55154254f05f057b70732eae"));
//#endregion
export { adminRevealToolCredentials as a, getMyToolOrders as c, linkToolAccount as d, redeemToolCode as f, adminListToolAccounts as i, getToolAccountStatus as l, adminGetToolOrders as n, adminReviewToolOrderRequest as o, submitToolPayment as p, adminGetToolPaymentProofUrl as r, getMyToolAccess as s, adminCompleteToolAccount as t, getToolCatalogFn as u };
