import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { n as requireSupabaseAuth } from "./auth-middleware-BgIfV4zI.mjs";
import { t as requireSupabaseAdmin } from "./admin.middleware-CR-36Rm9.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
import { n as supabaseAdmin } from "./client.server-BlnvGJA3.mjs";
import { a as decryptToolCredentials, c as getToolCatalog, d as saveToolAccount, i as createToolPaymentProofSignedUrl, l as getToolProduct, n as adminReviewToolOrder, o as getToolAccess, r as createToolOrder, s as getToolAccount, t as adminListToolOrders, u as hasToolAccess } from "./server-LV6XjVEX.mjs";
import processModule from "node:process";
//#region node_modules/.nitro/vite/services/ssr/assets/wiso-tools.functions-DdyzLQi_.js
var DEFAULT_URL = "https://tools-platform-production.up.railway.app";
function apiUrl() {
	return (processModule.env["SPRIX_TOOLS_API_URL"] ?? DEFAULT_URL).replace(/\/$/, "");
}
function apiKey() {
	const key = processModule.env["SPRIX_TOOLS_API_KEY"];
	if (!key) throw new Error("SPRIX_TOOLS_API_KEY is not configured on the server.");
	return key;
}
async function request(path, init = {}, timeoutMs = 3e4) {
	const headers = new Headers(init.headers);
	headers.set("content-type", "application/json");
	headers.set("authorization", `Bearer ${apiKey()}`);
	const response = await fetch(`${apiUrl()}${path}`, {
		...init,
		headers,
		signal: init.signal ?? AbortSignal.timeout(timeoutMs)
	});
	const text = await response.text();
	let body = null;
	if (text) try {
		body = JSON.parse(text);
	} catch {
		body = { message: text.slice(0, 500) };
	}
	if (!response.ok) throw new Error(`TOOLS_API_${response.status}`);
	return body;
}
async function getSprixSubjects(credentials) {
	return request("/api/tools/sprix/subjects", {
		method: "POST",
		body: JSON.stringify({ accounts: [{
			code: credentials.id,
			password: credentials.password
		}] })
	}, 12e4);
}
async function startSprixJob(input) {
	return request("/api/tools/sprix/solve", {
		method: "POST",
		body: JSON.stringify({
			accounts: [{
				code: input.id,
				password: input.password
			}],
			subject_id: input.subjectId
		})
	}, 3e4);
}
async function startQureoJob(input) {
	return request("/api/tools/qureo/solve", {
		method: "POST",
		body: JSON.stringify({
			id: input.id,
			password: input.password
		})
	}, 3e4);
}
async function getPythonJob(requestId) {
	return request(`/api/jobs/${encodeURIComponent(requestId)}`, { method: "GET" }, 15e3);
}
async function stopPythonJob(requestId) {
	return request(`/api/jobs/${encodeURIComponent(requestId)}/stop`, {
		method: "POST",
		body: JSON.stringify({})
	}, 15e3);
}
function normalizePythonStatus(value) {
	switch (value) {
		case "queued": return "queued";
		case "completed": return "completed";
		case "completed_with_errors": return "completed_with_errors";
		case "failed": return "failed";
		case "stopped":
		case "cancelled": return "stopped";
		default: return "in_progress";
	}
}
function toolForPath(value) {
	if (value === "financial_literacy" || value === "qureo") return value;
	throw new Error("INVALID_TOOL");
}
var getToolCatalogFn_createServerFn_handler = createServerRpc({
	id: "a4cd52b12486753e4f399479c86d73e13ee400edf9335022cd90137c88ad88bf",
	name: "getToolCatalogFn",
	filename: "src/lib/wiso-tools.functions.ts"
}, (opts) => getToolCatalogFn.__executeServer(opts));
var getToolCatalogFn = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getToolCatalogFn_createServerFn_handler, async () => getToolCatalog());
var getMyToolAccess_createServerFn_handler = createServerRpc({
	id: "0554eac91121e007ca8350df2886e51b9a7b797df1204820c453dbd063d308e1",
	name: "getMyToolAccess",
	filename: "src/lib/wiso-tools.functions.ts"
}, (opts) => getMyToolAccess.__executeServer(opts));
var getMyToolAccess = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getMyToolAccess_createServerFn_handler, async ({ context }) => getToolAccess(context.userId));
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
}).handler(submitToolPayment_createServerFn_handler, async ({ data, context }) => createToolOrder({
	userId: context.userId,
	productKey: data.productKey,
	method: data.method,
	senderNumber: data.senderNumber,
	screenshotPath: data.screenshotPath
}));
var redeemToolCode_createServerFn_handler = createServerRpc({
	id: "e6a70c1aa358af3e10c57e6377585703f11cbdd4ddf283cbd8221fed51b4a44e",
	name: "redeemToolCode",
	filename: "src/lib/wiso-tools.functions.ts"
}, (opts) => redeemToolCode.__executeServer(opts));
var redeemToolCode = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => {
	if (!input.code.trim()) throw new Error("CODE_REQUIRED");
	return { code: input.code.trim() };
}).handler(redeemToolCode_createServerFn_handler, async ({ data }) => {
	const result = await supabaseAdmin.rpc("redeem_tool_code", { _code: data.code });
	if (result.error) throw result.error;
	return result.data;
});
var getToolAccountStatus_createServerFn_handler = createServerRpc({
	id: "16d4bc0d9bd5e9eb5a729a02ed9cd46ef0eb20eab4816a30020a4d364ff217d1",
	name: "getToolAccountStatus",
	filename: "src/lib/wiso-tools.functions.ts"
}, (opts) => getToolAccountStatus.__executeServer(opts));
var getToolAccountStatus = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).inputValidator((input) => ({ toolKey: toolForPath(input.toolKey) })).handler(getToolAccountStatus_createServerFn_handler, async ({ data, context }) => {
	const account = await getToolAccount(context.userId, data.toolKey);
	return {
		linked: Boolean(account?.verification_status === "verified"),
		verifiedAt: account?.verified_at ?? null
	};
});
var getSprixSubjectsForUser_createServerFn_handler = createServerRpc({
	id: "70f25203114f5f7e30d085f569e714e2876246742af07bfb7dde72baf6c71000",
	name: "getSprixSubjectsForUser",
	filename: "src/lib/wiso-tools.functions.ts"
}, (opts) => getSprixSubjectsForUser.__executeServer(opts));
var getSprixSubjectsForUser = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(getSprixSubjectsForUser_createServerFn_handler, async ({ context }) => {
	if (!await hasToolAccess(context.userId, "financial_literacy")) throw new Error("TOOL_ACCESS_REQUIRED");
	const account = await getToolAccount(context.userId, "financial_literacy");
	if (!account) throw new Error("TOOL_ACCOUNT_REQUIRED");
	const result = await getSprixSubjects(decryptToolCredentials(account.credential_ciphertext));
	await supabaseAdmin.from("tool_accounts").update({ last_used_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", account.id);
	return result;
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
	if (data.toolKey === "financial_literacy") {
		const subjects = await getSprixSubjects({
			id: data.id,
			password: data.password
		});
		if (!(typeof subjects === "object" && subjects !== null && (!("success" in subjects) || subjects.success !== false))) throw new Error("TOOL_CREDENTIALS_INVALID");
	}
	return {
		linked: true,
		...await saveToolAccount(context.userId, data.toolKey, data.id, data.password)
	};
});
var startToolJob_createServerFn_handler = createServerRpc({
	id: "47c63bb40459923080aa0e80f0c8dd3813012350573a5ff10aba13828ed7345c",
	name: "startToolJob",
	filename: "src/lib/wiso-tools.functions.ts"
}, (opts) => startToolJob.__executeServer(opts));
var startToolJob = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => {
	const toolKey = toolForPath(input.toolKey);
	if (toolKey === "financial_literacy" && !input.subjectId?.trim()) throw new Error("SPRIX_SUBJECT_REQUIRED");
	return {
		toolKey,
		subjectId: input.subjectId?.trim() || null
	};
}).handler(startToolJob_createServerFn_handler, async ({ data, context }) => {
	if (!await hasToolAccess(context.userId, data.toolKey)) throw new Error("TOOL_ACCESS_REQUIRED");
	const account = await getToolAccount(context.userId, data.toolKey);
	if (!account || account.verification_status !== "verified") throw new Error("TOOL_ACCOUNT_REQUIRED");
	const credentials = decryptToolCredentials(account.credential_ciphertext);
	const python = data.toolKey === "financial_literacy" ? await startSprixJob({
		id: credentials.id,
		password: credentials.password,
		subjectId: data.subjectId
	}) : await startQureoJob(credentials);
	if (python.success === false || !python.request_id) throw new Error("TOOL_JOB_START_FAILED");
	const status = normalizePythonStatus(python.status);
	const { data: job, error } = await supabaseAdmin.from("tool_jobs").insert({
		user_id: context.userId,
		tool_key: data.toolKey,
		python_request_id: python.request_id,
		status
	}).select("id,tool_key,python_request_id,status,started_at,updated_at,completed_at,error").single();
	if (error) throw error;
	await supabaseAdmin.from("tool_accounts").update({ last_used_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", account.id);
	return job;
});
var getToolJob_createServerFn_handler = createServerRpc({
	id: "edb9fdaf4965cb3a0f7b8a937a88427ae3a907d2befe031d6e22fcc5b022b847",
	name: "getToolJob",
	filename: "src/lib/wiso-tools.functions.ts"
}, (opts) => getToolJob.__executeServer(opts));
var getToolJob = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(getToolJob_createServerFn_handler, async ({ data, context }) => {
	const { data: job, error } = await supabaseAdmin.from("tool_jobs").select("id,tool_key,python_request_id,status,started_at,updated_at,completed_at,error").eq("id", data.jobId).eq("user_id", context.userId).maybeSingle();
	if (error) throw error;
	if (!job) throw new Error("TOOL_JOB_NOT_FOUND");
	const snapshot = await getPythonJob(job.python_request_id);
	const status = normalizePythonStatus(snapshot.status);
	const terminal = [
		"completed",
		"completed_with_errors",
		"failed",
		"stopped"
	].includes(status);
	const patch = {
		status,
		error: typeof snapshot.error === "string" ? snapshot.error.slice(0, 500) : typeof snapshot.message === "string" && (status === "failed" || status === "completed_with_errors") ? snapshot.message.slice(0, 500) : null,
		...terminal ? { completed_at: job.completed_at ?? (/* @__PURE__ */ new Date()).toISOString() } : {},
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	};
	const { data: updated, error: updateError } = await supabaseAdmin.from("tool_jobs").update(patch).eq("id", job.id).eq("user_id", context.userId).select("id,tool_key,python_request_id,status,started_at,updated_at,completed_at,error").single();
	if (updateError) throw updateError;
	return {
		job: updated,
		python: {
			status,
			message: typeof snapshot.message === "string" ? snapshot.message : null,
			logs: Array.isArray(snapshot.logs) ? snapshot.logs.filter((item) => typeof item === "string").slice(-100) : [],
			progress: typeof snapshot.progress === "number" ? snapshot.progress : null
		}
	};
});
var stopToolJob_createServerFn_handler = createServerRpc({
	id: "9553b1a23bcbfb8a013144178123125ea6cf62fed0186695e16af54dcdd61ae6",
	name: "stopToolJob",
	filename: "src/lib/wiso-tools.functions.ts"
}, (opts) => stopToolJob.__executeServer(opts));
var stopToolJob = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(stopToolJob_createServerFn_handler, async ({ data, context }) => {
	const { data: job, error } = await supabaseAdmin.from("tool_jobs").select("id,python_request_id,status").eq("id", data.jobId).eq("user_id", context.userId).maybeSingle();
	if (error) throw error;
	if (!job) throw new Error("TOOL_JOB_NOT_FOUND");
	if ([
		"completed",
		"completed_with_errors",
		"failed",
		"stopped"
	].includes(job.status)) return { stopped: false };
	await stopPythonJob(job.python_request_id);
	await supabaseAdmin.from("tool_jobs").update({
		status: "stopped",
		updated_at: (/* @__PURE__ */ new Date()).toISOString(),
		completed_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", job.id).eq("user_id", context.userId);
	return { stopped: true };
});
var adminGetToolOrders_createServerFn_handler = createServerRpc({
	id: "59f9a6196ddb7139d94d96f00f286ee5cf9d4631b5cd1057cbac52cfda9be00b",
	name: "adminGetToolOrders",
	filename: "src/lib/wiso-tools.functions.ts"
}, (opts) => adminGetToolOrders.__executeServer(opts));
var adminGetToolOrders = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminGetToolOrders_createServerFn_handler, async ({ data }) => adminListToolOrders(data.status));
var adminReviewToolOrderRequest_createServerFn_handler = createServerRpc({
	id: "6e09eb620fa8674c50d723f19e0873b2fd4738a8ebf45a84e6a5aeeee1d46a3f",
	name: "adminReviewToolOrderRequest",
	filename: "src/lib/wiso-tools.functions.ts"
}, (opts) => adminReviewToolOrderRequest.__executeServer(opts));
var adminReviewToolOrderRequest = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminReviewToolOrderRequest_createServerFn_handler, async ({ data, context }) => adminReviewToolOrder({
	orderId: data.orderId,
	approve: data.approve,
	reason: data.reason,
	adminId: context.adminId
}));
var adminGetToolPaymentProofUrl_createServerFn_handler = createServerRpc({
	id: "c02107f430f125f0f3adad22efb0ec7cb0d1ffbd55154254f05f057b70732eae",
	name: "adminGetToolPaymentProofUrl",
	filename: "src/lib/wiso-tools.functions.ts"
}, (opts) => adminGetToolPaymentProofUrl.__executeServer(opts));
var adminGetToolPaymentProofUrl = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminGetToolPaymentProofUrl_createServerFn_handler, async ({ data }) => ({ url: await createToolPaymentProofSignedUrl(data.path) }));
var adminGetToolJobs_createServerFn_handler = createServerRpc({
	id: "c8f959ca0e5bbb83b3fc057d1a349666b515a0ad26058141daf1e38cab1c2fe9",
	name: "adminGetToolJobs",
	filename: "src/lib/wiso-tools.functions.ts"
}, (opts) => adminGetToolJobs.__executeServer(opts));
var adminGetToolJobs = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(adminGetToolJobs_createServerFn_handler, async () => {
	const { data, error } = await supabaseAdmin.from("tool_jobs").select("id,user_id,tool_key,python_request_id,status,started_at,updated_at,completed_at,error").order("updated_at", { ascending: false }).limit(300);
	if (error) throw error;
	return data ?? [];
});
//#endregion
export { adminGetToolJobs_createServerFn_handler, adminGetToolOrders_createServerFn_handler, adminGetToolPaymentProofUrl_createServerFn_handler, adminReviewToolOrderRequest_createServerFn_handler, getMyToolAccess_createServerFn_handler, getMyToolOrders_createServerFn_handler, getSprixSubjectsForUser_createServerFn_handler, getToolAccountStatus_createServerFn_handler, getToolCatalogFn_createServerFn_handler, getToolJob_createServerFn_handler, linkToolAccount_createServerFn_handler, redeemToolCode_createServerFn_handler, startToolJob_createServerFn_handler, stopToolJob_createServerFn_handler, submitToolPayment_createServerFn_handler };
