import { l as createServerFn } from "./createServerFn-yTfeHp1H.mjs";
import { n as requireSupabaseAuth } from "./auth-middleware-BogctHY4.mjs";
import { t as requireSupabaseAdmin } from "./admin.middleware-BsoUGKyB.mjs";
import { t as createServerRpc } from "./createServerRpc-D228ng_7.mjs";
import { n as supabaseAdmin } from "./client.server-BlnvGJA3.mjs";
import { a as getToolAccess, c as getToolProduct, i as createToolPaymentProofSignedUrl, l as hasToolAccess, n as adminReviewToolOrder, o as getToolAccount, r as createToolOrder, s as getToolCatalog, t as adminListToolOrders, u as saveToolAccount } from "./server-DhRO9ofi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wiso-tools.functions-DSqOOFP4.js
function toolForPath(value) {
	if (value === "financial_literacy" || value === "qureo") return value;
	throw new Error("INVALID_TOOL");
}
var getToolCatalogFn_createServerFn_handler = createServerRpc({
	id: "a4cd52b12486753e4f399479c86d73e13ee400edf9335022cd90137c88ad88bf",
	name: "getToolCatalogFn",
	filename: "src/lib/wiso-tools.functions.ts"
}, (opts) => getToolCatalogFn.__executeServer(opts));
var getToolCatalogFn = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getToolCatalogFn_createServerFn_handler, async () => {
	return getToolCatalog();
});
var getMyToolAccess_createServerFn_handler = createServerRpc({
	id: "0554eac91121e007ca8350df2886e51b9a7b797df1204820c453dbd063d308e1",
	name: "getMyToolAccess",
	filename: "src/lib/wiso-tools.functions.ts"
}, (opts) => getMyToolAccess.__executeServer(opts));
var getMyToolAccess = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getMyToolAccess_createServerFn_handler, async ({ context }) => {
	return getToolAccess(context.userId);
});
var getMyToolOrders_createServerFn_handler = createServerRpc({
	id: "3e38cd93809007e6c184df364c21d53f1a3a85a077b39248e217aecfa82adc77",
	name: "getMyToolOrders",
	filename: "src/lib/wiso-tools.functions.ts"
}, (opts) => getMyToolOrders.__executeServer(opts));
var getMyToolOrders = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getMyToolOrders_createServerFn_handler, async ({ context }) => {
	const { data, error } = await supabaseAdmin.from("tool_orders").select("id,product_key,amount_egp,method,status,reject_reason,created_at,reviewed_at").eq("user_id", context.userId).order("created_at", { ascending: false }).limit(20);
	if (error) throw error;
	return data ?? [];
});
var submitToolPayment_createServerFn_handler = createServerRpc({
	id: "9a215856cd824d0e0f714cf3e6402eb020313b6cbcc02dfbc889bb14c0e4a66e",
	name: "submitToolPayment",
	filename: "src/lib/wiso-tools.functions.ts"
}, (opts) => submitToolPayment.__executeServer(opts));
var submitToolPayment = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => {
	getToolProduct(input.productKey);
	return input;
}).handler(submitToolPayment_createServerFn_handler, async ({ data, context }) => {
	return createToolOrder({
		userId: context.userId,
		productKey: data.productKey,
		method: data.method,
		senderNumber: data.senderNumber,
		screenshotPath: data.screenshotPath
	});
});
var redeemToolCode_createServerFn_handler = createServerRpc({
	id: "e6a70c1aa358af3e10c57e6377585703f11cbdd4ddf283cbd8221fed51b4a44e",
	name: "redeemToolCode",
	filename: "src/lib/wiso-tools.functions.ts"
}, (opts) => redeemToolCode.__executeServer(opts));
var redeemToolCode = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => {
	const code = input.code.trim();
	if (!code) throw new Error("CODE_REQUIRED");
	return { code };
}).handler(redeemToolCode_createServerFn_handler, async ({ context, data }) => {
	const { data: rpcData, error } = await context.supabase.rpc("redeem_tool_code", { _code: data.code });
	if (error) throw error;
	return {
		success: true,
		data: rpcData
	};
});
var getToolAccountStatus_createServerFn_handler = createServerRpc({
	id: "16d4bc0d9bd5e9eb5a729a02ed9cd46ef0eb20eab4816a30020a4d364ff217d1",
	name: "getToolAccountStatus",
	filename: "src/lib/wiso-tools.functions.ts"
}, (opts) => getToolAccountStatus.__executeServer(opts));
var getToolAccountStatus = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).inputValidator((input) => ({ toolKey: toolForPath(input.toolKey) })).handler(getToolAccountStatus_createServerFn_handler, async ({ data, context }) => {
	const account = await getToolAccount(context.userId, data.toolKey);
	return {
		linked: account?.verification_status === "verified",
		verifiedAt: account?.verified_at ?? null
	};
});
var linkToolAccount_createServerFn_handler = createServerRpc({
	id: "45e4e4e46d2771970207e13d10228a561f5a9966eab30fdc7294afbc108c598f",
	name: "linkToolAccount",
	filename: "src/lib/wiso-tools.functions.ts"
}, (opts) => linkToolAccount.__executeServer(opts));
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
}).handler(linkToolAccount_createServerFn_handler, async ({ data, context }) => {
	if (!await hasToolAccess(context.userId, data.toolKey)) throw new Error("TOOL_ACCESS_REQUIRED");
	return {
		linked: true,
		...await saveToolAccount(context.userId, data.toolKey, data.id, data.password)
	};
});
var adminListToolAccounts_createServerFn_handler = createServerRpc({
	id: "0d87a373f552269003e84e27852b909ccc2ada59af3aabb88d6b00d4ff317d49",
	name: "adminListToolAccounts",
	filename: "src/lib/wiso-tools.functions.ts"
}, (opts) => adminListToolAccounts.__executeServer(opts));
var adminListToolAccounts = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(adminListToolAccounts_createServerFn_handler, async () => {
	const { data, error } = await (await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t)).supabaseAdmin.from("tool_accounts").select("id,user_id,tool_key,account_id_hash,verification_status,created_at,updated_at,completed_at").is("completed_at", null).order("updated_at", { ascending: false }).limit(300);
	if (error) throw error;
	return data ?? [];
});
var adminCompleteToolAccount_createServerFn_handler = createServerRpc({
	id: "3b05958ae505bd8a2a6882162bf62f0f4b38c807147388e1500b064b9f23e667",
	name: "adminCompleteToolAccount",
	filename: "src/lib/wiso-tools.functions.ts"
}, (opts) => adminCompleteToolAccount.__executeServer(opts));
var adminCompleteToolAccount = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => {
	if (!input.accountId || input.accountId.length > 100) throw new Error("INVALID_ACCOUNT_ID");
	return input;
}).handler(adminCompleteToolAccount_createServerFn_handler, async ({ data, context }) => {
	const { data: result, error } = await (await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t)).supabaseAdmin.rpc("admin_complete_tool_account", {
		_account_id: data.accountId,
		_admin_id: context.adminId
	});
	if (error) throw error;
	return result;
});
var adminRevealToolCredentials_createServerFn_handler = createServerRpc({
	id: "adeb6e2ae58ef62a6665fbf9e9351963cfeadee720e879ee865d5bc34d7169d2",
	name: "adminRevealToolCredentials",
	filename: "src/lib/wiso-tools.functions.ts"
}, (opts) => adminRevealToolCredentials.__executeServer(opts));
var adminRevealToolCredentials = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => {
	if (!input.accountId || input.accountId.length > 100) throw new Error("INVALID_ACCOUNT_ID");
	return input;
}).handler(adminRevealToolCredentials_createServerFn_handler, async ({ data }) => {
	const { data: row, error } = await (await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t)).supabaseAdmin.from("tool_accounts").select("credential_ciphertext").eq("id", data.accountId).maybeSingle();
	if (error) throw error;
	if (!row || typeof row.credential_ciphertext !== "string") throw new Error("TOOL_ACCOUNT_NOT_FOUND");
	const { decryptToolCredentials } = await import("./server-DhRO9ofi.mjs").then((n) => n.d).then((n) => n.d);
	return decryptToolCredentials(row.credential_ciphertext);
});
var adminGetToolOrders_createServerFn_handler = createServerRpc({
	id: "59f9a6196ddb7139d94d96f00f286ee5cf9d4631b5cd1057cbac52cfda9be00b",
	name: "adminGetToolOrders",
	filename: "src/lib/wiso-tools.functions.ts"
}, (opts) => adminGetToolOrders.__executeServer(opts));
var adminGetToolOrders = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminGetToolOrders_createServerFn_handler, async ({ data }) => {
	return adminListToolOrders(data.status);
});
var adminReviewToolOrderRequest_createServerFn_handler = createServerRpc({
	id: "6e09eb620fa8674c50d723f19e0873b2fd4738a8ebf45a84e6a5aeeee1d46a3f",
	name: "adminReviewToolOrderRequest",
	filename: "src/lib/wiso-tools.functions.ts"
}, (opts) => adminReviewToolOrderRequest.__executeServer(opts));
var adminReviewToolOrderRequest = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminReviewToolOrderRequest_createServerFn_handler, async ({ data, context }) => {
	return adminReviewToolOrder({
		orderId: data.orderId,
		approve: data.approve,
		...data.reason !== void 0 ? { reason: data.reason } : {},
		adminId: context.adminId
	});
});
var adminGetToolPaymentProofUrl_createServerFn_handler = createServerRpc({
	id: "c02107f430f125f0f3adad22efb0ec7cb0d1ffbd55154254f05f057b70732eae",
	name: "adminGetToolPaymentProofUrl",
	filename: "src/lib/wiso-tools.functions.ts"
}, (opts) => adminGetToolPaymentProofUrl.__executeServer(opts));
var adminGetToolPaymentProofUrl = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminGetToolPaymentProofUrl_createServerFn_handler, async ({ data }) => {
	return { url: await createToolPaymentProofSignedUrl(data.path) };
});
//#endregion
export { adminCompleteToolAccount_createServerFn_handler, adminGetToolOrders_createServerFn_handler, adminGetToolPaymentProofUrl_createServerFn_handler, adminListToolAccounts_createServerFn_handler, adminRevealToolCredentials_createServerFn_handler, adminReviewToolOrderRequest_createServerFn_handler, getMyToolAccess_createServerFn_handler, getMyToolOrders_createServerFn_handler, getToolAccountStatus_createServerFn_handler, getToolCatalogFn_createServerFn_handler, linkToolAccount_createServerFn_handler, redeemToolCode_createServerFn_handler, submitToolPayment_createServerFn_handler };
