import { l as createServerFn } from "./createServerFn-yTfeHp1H.mjs";
import { t as requireSupabaseAdmin } from "./auth-middleware-BogctHY4.mjs";
import { t as createServerRpc } from "./createServerRpc-D228ng_7.mjs";
import processModule from "node:process";
import { Buffer } from "node:buffer";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.functions-CT9DYUpc.js
/**
* Secure server-side seam for WISO administrator operations.
*
* IMPORTANT:
* - Browser code may import these createServerFn wrappers safely.
* - The service-role credential never reaches the browser.
* - Every operation is protected by requireSupabaseAdmin.
* - Admin identity comes from context.adminId, derived from the
*   authenticated user's JWT. It is never supplied by the browser.
*/
var adminGetPdfSettings_createServerFn_handler = createServerRpc({
	id: "dacb61c79db7cb80219b4c046f49830f7609ade685e3d833379601718535ebe6",
	name: "adminGetPdfSettings",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminGetPdfSettings.__executeServer(opts));
var adminGetPdfSettings = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(adminGetPdfSettings_createServerFn_handler, async () => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { data, error } = await supabaseAdmin.from("site_settings").select("key,value").like("key", "pdf_%");
	if (error) throw error;
	return Object.fromEntries((data ?? []).map((row) => [row.key, row.value ?? ""]));
});
var adminUpdatePdfSettings_createServerFn_handler = createServerRpc({
	id: "fbc91ad9056fe34977f3c944c4f05c629e6ee135166b7fcd7017b66d2e96951a",
	name: "adminUpdatePdfSettings",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminUpdatePdfSettings.__executeServer(opts));
var adminUpdatePdfSettings = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminUpdatePdfSettings_createServerFn_handler, async ({ data }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const rows = [
		{
			key: "pdf_enabled",
			value: data.pdf_enabled ?? "true"
		},
		{
			key: "pdf_credit_cost",
			value: String(Math.max(0, Number(data.pdf_credit_cost) || 0))
		},
		{
			key: "pdf_supported_types",
			value: data.pdf_supported_types || "[\"worksheet\",\"exam\"]"
		},
		{
			key: "pdf_default_title",
			value: data.pdf_default_title || "ورقة أسئلة WISO"
		},
		{
			key: "pdf_footer_notice",
			value: data.pdf_footer_notice || "WISO Agent — للاستخدام التعليمي الشخصي"
		},
		{
			key: "pdf_promotional_text",
			value: data.pdf_promotional_text || ""
		}
	];
	const { error } = await supabaseAdmin.from("site_settings").upsert(rows);
	if (error) throw error;
	return { success: true };
});
var adminGetPlatformSettings_createServerFn_handler = createServerRpc({
	id: "e6e9aa20a20ef205576a717347fad397b8599eae4856abd35f5f41891ada63a3",
	name: "adminGetPlatformSettings",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminGetPlatformSettings.__executeServer(opts));
var adminGetPlatformSettings = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(adminGetPlatformSettings_createServerFn_handler, async () => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { data, error } = await supabaseAdmin.from("platform_settings").select("*").maybeSingle();
	if (error) throw error;
	if (!data) throw new Error("لا توجد إعدادات منصة");
	return data;
});
var adminUpdatePlatformSettings_createServerFn_handler = createServerRpc({
	id: "8f7b62db00d95a3242676095337bd3e121f15dc04ac9e66701dbad9fa6a44dbd",
	name: "adminUpdatePlatformSettings",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminUpdatePlatformSettings.__executeServer(opts));
var adminUpdatePlatformSettings = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminUpdatePlatformSettings_createServerFn_handler, async ({ data, context }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const patch = {
		...data._status === void 0 ? {} : { platform_status: data._status },
		...data._maintenance === void 0 ? {} : { maintenance_mode: data._maintenance },
		...data._message === void 0 ? {} : { maintenance_message: data._message },
		...data._window_enabled === void 0 ? {} : { global_access_enabled: data._window_enabled },
		...data._window_enabled === false ? {
			global_access_start: null,
			global_access_end: null
		} : {
			...data._window_start === void 0 ? {} : { global_access_start: data._window_start },
			...data._window_end === void 0 ? {} : { global_access_end: data._window_end }
		},
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	};
	const { data: result, error } = await supabaseAdmin.from("platform_settings").update(patch).eq("id", true).select().single();
	if (error) throw error;
	await supabaseAdmin.from("admin_audit_logs").insert({
		admin_id: context.adminId,
		action: "update_platform_settings",
		metadata: patch
	});
	return result;
});
var adminGetContestSettings_createServerFn_handler = createServerRpc({
	id: "e9914173aa76aff78cf54d15d65c6c8a1788b73a1c6c525c56b268abb4c6f59d",
	name: "adminGetContestSettings",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminGetContestSettings.__executeServer(opts));
var adminGetContestSettings = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(adminGetContestSettings_createServerFn_handler, async () => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { data, error } = await supabaseAdmin.from("contest_settings").select("*").maybeSingle();
	if (error) throw error;
	if (!data) throw new Error("لا توجد إعدادات مسابقة");
	return data;
});
var adminGetContestEntriesCount_createServerFn_handler = createServerRpc({
	id: "ede7008e77697f81784f36a335b4fdb4c8e47511cb18621d4c6074f748b22864",
	name: "adminGetContestEntriesCount",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminGetContestEntriesCount.__executeServer(opts));
var adminGetContestEntriesCount = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(adminGetContestEntriesCount_createServerFn_handler, async () => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { count, error } = await supabaseAdmin.from("contest_entries").select("id", {
		count: "exact",
		head: true
	});
	if (error) throw error;
	return count ?? 0;
});
var adminUpdateContestSettings_createServerFn_handler = createServerRpc({
	id: "3e12da166ba3fa88bcce8b294f92ae56ecbc5b78b6fb252f73fc634eb70e13d0",
	name: "adminUpdateContestSettings",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminUpdateContestSettings.__executeServer(opts));
var adminUpdateContestSettings = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminUpdateContestSettings_createServerFn_handler, async ({ data }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { data: existing, error: existingError } = await supabaseAdmin.from("contest_settings").select("id").maybeSingle();
	if (existingError) throw existingError;
	if (!existing) throw new Error("Contest settings record not found");
	const { data: result, error } = await supabaseAdmin.from("contest_settings").update({
		...data,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", existing.id).select().single();
	if (error) throw error;
	return result;
});
var adminGetRevenueSummary_createServerFn_handler = createServerRpc({
	id: "9de661ed26ca37a3ac5fc5c4596bda37f5f97ad7588b8409b51153c222d6ee72",
	name: "adminGetRevenueSummary",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminGetRevenueSummary.__executeServer(opts));
var adminGetRevenueSummary = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(adminGetRevenueSummary_createServerFn_handler, async () => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const [revenue, pending, used, total] = await Promise.all([
		supabaseAdmin.from("revenue_entries").select("amount_egp,source"),
		supabaseAdmin.from("payment_requests").select("amount_egp").eq("status", "pending"),
		supabaseAdmin.from("center_codes").select("id", {
			count: "exact",
			head: true
		}).not("used_by", "is", null),
		supabaseAdmin.from("center_codes").select("id", {
			count: "exact",
			head: true
		})
	]);
	const firstError = [
		revenue,
		pending,
		used,
		total
	].find((r) => r.error)?.error;
	if (firstError) throw firstError;
	const by_source = {};
	for (const row of revenue.data ?? []) by_source[row.source] = (by_source[row.source] ?? 0) + Number(row.amount_egp ?? 0);
	return {
		total_revenue: (revenue.data ?? []).reduce((n, r) => n + Number(r.amount_egp ?? 0), 0),
		pending_revenue: (pending.data ?? []).reduce((n, r) => n + Number(r.amount_egp ?? 0), 0),
		by_source,
		codes_used: used.count ?? 0,
		codes_total: total.count ?? 0
	};
});
var adminGetAiSettings_createServerFn_handler = createServerRpc({
	id: "4fc1e12191c0448732f71857e18d8250c31fea217dfabd02d1e660cffe8fe064",
	name: "adminGetAiSettings",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminGetAiSettings.__executeServer(opts));
var adminGetAiSettings = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(adminGetAiSettings_createServerFn_handler, async () => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { data, error } = await supabaseAdmin.from("ai_settings").select("*").maybeSingle();
	if (error) throw error;
	if (!data) throw new Error("لا توجد إعدادات ذكاء اصطناعي.");
	return data;
});
var adminUpdateAiSettings_createServerFn_handler = createServerRpc({
	id: "ffa861d4c6cec580e7da69da12f56b4b33f8b2cf89c6f0ec42952080e39a69b4",
	name: "adminUpdateAiSettings",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminUpdateAiSettings.__executeServer(opts));
var adminUpdateAiSettings = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminUpdateAiSettings_createServerFn_handler, async ({ data, context }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const patch = {
		updated_at: (/* @__PURE__ */ new Date()).toISOString(),
		updated_by: context.adminId
	};
	if (data._model !== void 0) patch["model"] = data._model;
	if (data._ai_mode_enabled !== void 0) patch["ai_mode_enabled"] = data._ai_mode_enabled;
	if (data._ai_emergency_disabled !== void 0) patch["ai_emergency_disabled"] = data._ai_emergency_disabled;
	if (data._enabled !== void 0) patch["enabled"] = data._enabled;
	const { data: result, error } = await supabaseAdmin.from("ai_settings").update(patch).eq("id", true).select().single();
	if (error) throw error;
	await supabaseAdmin.from("admin_audit_logs").insert({
		admin_id: context.adminId,
		action: "ai_settings_update",
		metadata: result
	});
	return result;
});
var adminGetCenters_createServerFn_handler = createServerRpc({
	id: "bcfa4b57feb6408720ea2170df6d997564c479278d2f25e3520bdb6b13f6e78c",
	name: "adminGetCenters",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminGetCenters.__executeServer(opts));
var adminGetCenters = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(adminGetCenters_createServerFn_handler, async () => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { data, error } = await supabaseAdmin.from("centers").select("id,name,created_at").order("created_at", { ascending: false });
	if (error) throw error;
	return data ?? [];
});
var adminGetPlans_createServerFn_handler = createServerRpc({
	id: "ed033bdf38e65d9eedbb52d1f49483afc81b4a4979eb201b9221ef9580c4b025",
	name: "adminGetPlans",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminGetPlans.__executeServer(opts));
var adminGetPlans = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(adminGetPlans_createServerFn_handler, async () => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { data, error } = await supabaseAdmin.from("subscription_plans").select("id,name_ar").order("sort_order");
	if (error) throw error;
	return data ?? [];
});
var adminGetCenterCodes_createServerFn_handler = createServerRpc({
	id: "682bb3d5f433e0abbd462f7bed1b092acb95c9752196f6fdf7cfa24ec56c2417",
	name: "adminGetCenterCodes",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminGetCenterCodes.__executeServer(opts));
var adminGetCenterCodes = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminGetCenterCodes_createServerFn_handler, async ({ data }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	let query = supabaseAdmin.from("center_codes").select("id,code,center_id,plan_id,code_type,expires_at,sprix_access_days,used_by,used_at,created_at").order("created_at", { ascending: false }).limit(500);
	if (data.centerId) query = query.eq("center_id", data.centerId);
	const { data: rows, error } = await query;
	if (error) throw error;
	const usedIds = [...new Set((rows ?? []).map((row) => row.used_by).filter(Boolean))];
	const { data: profiles, error: profilesError } = usedIds.length ? await supabaseAdmin.from("profiles").select("id,user_code,full_name").in("id", usedIds) : {
		data: [],
		error: null
	};
	if (profilesError) throw profilesError;
	const byUser = new Map((profiles ?? []).map((profile) => [profile.id, {
		userCode: profile.user_code,
		fullName: profile.full_name
	}]));
	return (rows ?? []).map((row) => ({
		...row,
		used_by_user_code: row.used_by ? byUser.get(row.used_by)?.userCode ?? null : null,
		used_by_name: row.used_by ? byUser.get(row.used_by)?.fullName ?? null : null
	}));
});
var adminCreateCenter_createServerFn_handler = createServerRpc({
	id: "1ceecc5b98903ff2db375d1e4b25cbf77239a7ffd3ce458240d6a3cf625202d9",
	name: "adminCreateCenter",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminCreateCenter.__executeServer(opts));
var adminCreateCenter = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminCreateCenter_createServerFn_handler, async ({ data }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { error } = await supabaseAdmin.from("centers").insert({ name: data.name.trim() });
	if (error) throw error;
});
var adminGenerateCenterCodes_createServerFn_handler = createServerRpc({
	id: "4d7d4e947255edb3c088418e2a1480a080eee5f5544d3f880e7c34f6dbff9be8",
	name: "adminGenerateCenterCodes",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminGenerateCenterCodes.__executeServer(opts));
var adminGenerateCenterCodes = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminGenerateCenterCodes_createServerFn_handler, async ({ data, context }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	if (!Number.isInteger(data.count) || data.count < 1 || data.count > 5e3) throw new Error("invalid_count");
	const codeType = data.codeType ?? "question";
	if (data.expiresAt && new Date(data.expiresAt).getTime() <= Date.now()) throw new Error("invalid_expiry");
	if (codeType === "question" && !data.plan) throw new Error("plan_required");
	if (codeType !== "question" && data.sprixAccessDays !== null && data.sprixAccessDays !== void 0) {
		if (!Number.isInteger(data.sprixAccessDays) || data.sprixAccessDays < 1 || data.sprixAccessDays > 3650) throw new Error("invalid_tool_access_days");
	}
	const { data: center, error: centerError } = await supabaseAdmin.from("centers").select("id").eq("id", data.center).maybeSingle();
	if (centerError) throw centerError;
	if (!center) throw new Error("center_not_found");
	if (codeType === "question") {
		const { data: plan, error: planError } = await supabaseAdmin.from("subscription_plans").select("id").eq("id", data.plan).eq("is_active", true).maybeSingle();
		if (planError) throw planError;
		if (!plan) throw new Error("plan_not_found");
	}
	const prefix = codeType === "sprix" ? "WISO-SPRIX-" : codeType === "qureo" ? "WISO-QUREO-" : codeType === "sprix_qureo" ? "WISO-TOOLS-" : "WISO-";
	const rows = Array.from({ length: data.count }, () => ({
		center_id: data.center,
		plan_id: codeType === "question" ? data.plan : null,
		code_type: codeType,
		expires_at: data.expiresAt || null,
		sprix_access_days: codeType === "question" ? null : data.sprixAccessDays ?? 30,
		code: `${prefix}${crypto.randomUUID().replace(/-/g, "").toUpperCase()}`
	}));
	const { error: insertError } = await supabaseAdmin.from("center_codes").insert(rows);
	if (insertError) throw insertError;
	await supabaseAdmin.from("admin_audit_logs").insert({
		admin_id: context.adminId,
		action: "generate_center_codes",
		metadata: {
			center: data.center,
			plan: data.plan ?? null,
			count: data.count,
			code_type: codeType,
			expires_at: data.expiresAt ?? null,
			tool_access_days: codeType === "question" ? null : data.sprixAccessDays ?? 30
		}
	});
	return data.count;
});
var adminGetStats_createServerFn_handler = createServerRpc({
	id: "4d34f4e948b3272ac451a0f7db93c6b0a0c9619794d4dd673c4ed42c5e7eeee5",
	name: "adminGetStats",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminGetStats.__executeServer(opts));
var adminGetStats = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(adminGetStats_createServerFn_handler, async () => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const [profiles, ai, questions, attempts, documents] = await Promise.all([
		supabaseAdmin.from("profiles").select("*").limit(1e5),
		supabaseAdmin.from("ai_usage_logs").select("id", {
			count: "exact",
			head: true
		}),
		supabaseAdmin.from("questions").select("id", {
			count: "exact",
			head: true
		}),
		supabaseAdmin.from("question_attempts").select("id", {
			count: "exact",
			head: true
		}),
		supabaseAdmin.from("documents").select("id", {
			count: "exact",
			head: true
		})
	]);
	const error = [
		profiles,
		ai,
		questions,
		attempts,
		documents
	].find((r) => r.error)?.error;
	if (error) throw error;
	const rows = profiles.data ?? [];
	const now = Date.now();
	return {
		total_users: rows.length,
		active_7d: rows.filter((p) => now - new Date(p.last_active_at).getTime() < 6048e5).length,
		trial_users: rows.filter((p) => new Date(p.trial_expires_at).getTime() > now && p.subscription_status !== "active").length,
		trial_expired: rows.filter((p) => new Date(p.trial_expires_at).getTime() <= now && p.subscription_status !== "active").length,
		active_subscribers: rows.filter((p) => p.subscription_status === "active").length,
		expired_subscribers: rows.filter((p) => p.subscription_status === "expired" || p.subscription_status === "cancelled").length,
		suspended: rows.filter((p) => p.platform_access_status === "suspended").length,
		allowed_now: rows.filter((p) => p.platform_access_status === "allowed").length,
		ai_requests: ai.count ?? 0,
		questions_generated: questions.count ?? 0,
		questions_solved: attempts.count ?? 0,
		documents_uploaded: documents.count ?? 0
	};
});
var adminGetDashboardCounts_createServerFn_handler = createServerRpc({
	id: "cab6e0da7b6324cec0f76065f84076fd7105ed20c3669d90f3e098bb01148014",
	name: "adminGetDashboardCounts",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminGetDashboardCounts.__executeServer(opts));
var adminGetDashboardCounts = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(adminGetDashboardCounts_createServerFn_handler, async () => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const [payments, special, center, running, total] = await Promise.all([
		supabaseAdmin.from("payment_requests").select("id", {
			count: "exact",
			head: true
		}).eq("status", "pending"),
		supabaseAdmin.from("special_requests").select("id", {
			count: "exact",
			head: true
		}).eq("status", "pending"),
		supabaseAdmin.from("center_requests").select("id", {
			count: "exact",
			head: true
		}).in("status", ["new", "reviewing"]),
		supabaseAdmin.from("ai_jobs").select("request_id", {
			count: "exact",
			head: true
		}).eq("status", "running"),
		supabaseAdmin.from("ai_jobs").select("request_id", {
			count: "exact",
			head: true
		})
	]);
	const error = [
		payments,
		special,
		center,
		running,
		total
	].find((r) => r.error)?.error;
	if (error) throw error;
	return {
		pendingPayments: payments.count ?? 0,
		pendingSpecial: special.count ?? 0,
		pendingCenterRequests: center.count ?? 0,
		runningAiJobs: running.count ?? 0,
		totalAiJobs: total.count ?? 0
	};
});
var adminListUsers_createServerFn_handler = createServerRpc({
	id: "35cf6cc28f61c798a570ec39672552de8ed250f60706565e25b34a66f0c5b240",
	name: "adminListUsers",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminListUsers.__executeServer(opts));
var adminListUsers = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminListUsers_createServerFn_handler, async ({ data }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	let query = supabaseAdmin.from("profiles").select("id,user_code,full_name,email,created_at,trial_started_at,trial_expires_at,subscription_status,subscription_expires_at,platform_access_status,access_override,access_expires_at,permanent_access,suspended_at,last_active_at").order("created_at", { ascending: false }).limit(data.limit ?? 200);
	if (data.search?.trim()) {
		const q = data.search.trim();
		query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,user_code.eq.${Number(q) || 0}`);
	}
	const { data: profiles, error } = await query;
	if (error) throw error;
	return Promise.all((profiles ?? []).map(async (p) => {
		const [role, logs] = await Promise.all([supabaseAdmin.rpc("has_role", {
			_user_id: p.id,
			_role: "admin"
		}), supabaseAdmin.from("ai_usage_logs").select("id", {
			count: "exact",
			head: true
		}).eq("user_id", p.id)]);
		return {
			...p,
			is_admin: role.data === true,
			access: {},
			ai_requests: logs.count ?? 0
		};
	}));
});
var adminGetUserDetail_createServerFn_handler = createServerRpc({
	id: "c6aebd0cde54dfb0c41e0efbdc86e4a6d2f069048797740c2c9bb8e8a44c16fd",
	name: "adminGetUserDetail",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminGetUserDetail.__executeServer(opts));
var adminGetUserDetail = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminGetUserDetail_createServerFn_handler, async ({ data }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { data: profile, error } = await supabaseAdmin.from("profiles").select("*").eq("id", data.target).single();
	if (error) throw error;
	const [role, questions, attempts, correct, hard, nightmare, mistakes, weak, documents, ai, audit] = await Promise.all([
		supabaseAdmin.rpc("has_role", {
			_user_id: data.target,
			_role: "admin"
		}),
		supabaseAdmin.from("questions").select("id", {
			count: "exact",
			head: true
		}).eq("user_id", data.target),
		supabaseAdmin.from("question_attempts").select("id", {
			count: "exact",
			head: true
		}).eq("user_id", data.target),
		supabaseAdmin.from("question_attempts").select("id", {
			count: "exact",
			head: true
		}).eq("user_id", data.target).eq("is_correct", true),
		supabaseAdmin.from("question_attempts").select("id,questions!inner(difficulty)", {
			count: "exact",
			head: true
		}).eq("user_id", data.target).in("questions.difficulty", ["hard", "very_hard"]),
		supabaseAdmin.from("question_attempts").select("id,questions!inner(difficulty)", {
			count: "exact",
			head: true
		}).eq("user_id", data.target).eq("questions.difficulty", "nightmare"),
		supabaseAdmin.from("mistakes").select("id", {
			count: "exact",
			head: true
		}).eq("user_id", data.target),
		supabaseAdmin.from("mastery").select("id", {
			count: "exact",
			head: true
		}).eq("user_id", data.target).eq("is_weak", true),
		supabaseAdmin.from("documents").select("id,created_at").eq("user_id", data.target).order("created_at", { ascending: false }),
		supabaseAdmin.from("ai_usage_logs").select("created_at", { count: "exact" }).eq("user_id", data.target).order("created_at", { ascending: false }).limit(1),
		supabaseAdmin.from("admin_audit_logs").select("id,action,created_at,metadata").eq("target_user_id", data.target).order("created_at", { ascending: false })
	]);
	return {
		profile,
		is_admin: role.data === true,
		questions_total: questions.count ?? 0,
		attempts_total: attempts.count ?? 0,
		attempts_correct: correct.count ?? 0,
		hard_solved: hard.count ?? 0,
		nightmare_solved: nightmare.count ?? 0,
		mistakes_total: mistakes.count ?? 0,
		weak_concepts: weak.count ?? 0,
		documents: documents.data ?? [],
		ai_requests: ai.count ?? 0,
		last_ai_activity: ai.data?.[0]?.created_at ?? null,
		audit: audit.data ?? []
	};
});
var adminGrantAccess_createServerFn_handler = createServerRpc({
	id: "f4476c1251ed84beaa56cc46d20f8a8aa5dec4d69fe7815545a4a6811ac05d09",
	name: "adminGrantAccess",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminGrantAccess.__executeServer(opts));
var adminGrantAccess = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminGrantAccess_createServerFn_handler, async ({ data, context }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const patch = data.permanent ? {
		permanent_access: true,
		access_granted_at: (/* @__PURE__ */ new Date()).toISOString(),
		access_expires_at: null,
		access_override: "admin_granted",
		platform_access_status: "allowed",
		suspended_at: null,
		suspended_reason: null
	} : {
		permanent_access: false,
		access_granted_at: (/* @__PURE__ */ new Date()).toISOString(),
		access_expires_at: new Date(Date.now() + (data.days ?? 0) * 864e5).toISOString(),
		access_override: "admin_granted",
		platform_access_status: "allowed",
		suspended_at: null,
		suspended_reason: null
	};
	const { error } = await supabaseAdmin.from("profiles").update(patch).eq("id", data.target);
	if (error) throw error;
	await supabaseAdmin.from("admin_audit_logs").insert({
		admin_id: context.adminId,
		target_user_id: data.target,
		action: "grant_access",
		metadata: patch
	});
});
var adminRevokeAccess_createServerFn_handler = createServerRpc({
	id: "a090998c225a5a28a4e94419fcd0e1ae0fcba5893dfe2bd5d00e335ae387fea9",
	name: "adminRevokeAccess",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminRevokeAccess.__executeServer(opts));
var adminRevokeAccess = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminRevokeAccess_createServerFn_handler, async ({ data, context }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { error } = await supabaseAdmin.from("profiles").update({
		permanent_access: false,
		access_expires_at: null,
		access_granted_at: null,
		access_override: "default"
	}).eq("id", data.target);
	if (error) throw error;
	await supabaseAdmin.from("admin_audit_logs").insert({
		admin_id: context.adminId,
		target_user_id: data.target,
		action: "revoke_access",
		metadata: {}
	});
});
var adminSetSuspended_createServerFn_handler = createServerRpc({
	id: "a05ff7a70de516ddebe17803c5fe7fe53655d9b62cef6d469443d0364aa8dd1e",
	name: "adminSetSuspended",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminSetSuspended.__executeServer(opts));
var adminSetSuspended = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminSetSuspended_createServerFn_handler, async ({ data, context }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const patch = data.suspended ? {
		platform_access_status: "suspended",
		access_override: "suspended",
		suspended_at: (/* @__PURE__ */ new Date()).toISOString(),
		suspended_reason: data.reason ?? null
	} : {
		platform_access_status: "allowed",
		access_override: "default",
		suspended_at: null,
		suspended_reason: null
	};
	const { error } = await supabaseAdmin.from("profiles").update(patch).eq("id", data.target);
	if (error) throw error;
	await supabaseAdmin.from("admin_audit_logs").insert({
		admin_id: context.adminId,
		target_user_id: data.target,
		action: data.suspended ? "suspend_user" : "reactivate_user",
		metadata: { reason: data.reason ?? null }
	});
});
var adminManageTrial_createServerFn_handler = createServerRpc({
	id: "e9baaa745e71f5c5805252640110d0896be882193bf5ca87f41965a54982050e",
	name: "adminManageTrial",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminManageTrial.__executeServer(opts));
var adminManageTrial = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminManageTrial_createServerFn_handler, async ({ data, context }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const hours = data.hours ?? 24;
	const patch = data.action === "reset" ? {
		trial_started_at: (/* @__PURE__ */ new Date()).toISOString(),
		trial_expires_at: new Date(Date.now() + hours * 36e5).toISOString(),
		subscription_status: "trial"
	} : data.action === "extend" ? { trial_expires_at: new Date(Date.now() + hours * 36e5).toISOString() } : { trial_expires_at: (/* @__PURE__ */ new Date()).toISOString() };
	const { error } = await supabaseAdmin.from("profiles").update(patch).eq("id", data.target);
	if (error) throw error;
	await supabaseAdmin.from("admin_audit_logs").insert({
		admin_id: context.adminId,
		target_user_id: data.target,
		action: `trial_${data.action}`,
		metadata: { hours }
	});
});
var adminSetRole_createServerFn_handler = createServerRpc({
	id: "154da85bc7e5915df5164155bbb68a97441082079312d44aab513dabc82f59c3",
	name: "adminSetRole",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminSetRole.__executeServer(opts));
var adminSetRole = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminSetRole_createServerFn_handler, async ({ data, context }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	if (data.target === context.adminId && !data.enabled) throw new Error("cannot_remove_own_admin_role");
	if (data.enabled) {
		const { error } = await supabaseAdmin.from("user_roles").upsert({
			user_id: data.target,
			role: "admin"
		});
		if (error) throw error;
	} else {
		const { error } = await supabaseAdmin.from("user_roles").delete().eq("user_id", data.target).eq("role", "admin");
		if (error) throw error;
	}
	await supabaseAdmin.from("admin_audit_logs").insert({
		admin_id: context.adminId,
		target_user_id: data.target,
		action: "set_role",
		metadata: {
			role: "admin",
			enabled: data.enabled
		}
	});
});
var adminGetPayments_createServerFn_handler = createServerRpc({
	id: "783d1413fe2bbf8624252af4de15cca3f56cc95988413401668f8e36b75427eb",
	name: "adminGetPayments",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminGetPayments.__executeServer(opts));
var adminGetPayments = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminGetPayments_createServerFn_handler, async ({ data }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	let query = supabaseAdmin.from("payment_requests").select("*, subscription_plans(name_ar, price_egp)").order("created_at", { ascending: false });
	if (data.status && data.status !== "all") query = query.eq("status", data.status);
	const { data: rows, error } = await query.limit(200);
	if (error) throw error;
	return rows ?? [];
});
var adminReviewPayment_createServerFn_handler = createServerRpc({
	id: "8db6486cfeed8cc4e2082c52285ad5af0c5cebafde1b3ad5f715d5fbde750b57",
	name: "adminReviewPayment",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminReviewPayment.__executeServer(opts));
var adminReviewPayment = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminReviewPayment_createServerFn_handler, async ({ data, context }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const rpcParams = {
		_request: data.request,
		_approve: data.approve,
		_admin_id: context.adminId,
		...data.reason?.trim() ? { _reason: data.reason.trim() } : {}
	};
	const { data: result, error } = await supabaseAdmin.rpc("admin_review_wiso_payment", rpcParams);
	if (error) throw error;
	return result;
});
var adminGetPaymentProofUrl_createServerFn_handler = createServerRpc({
	id: "411208c8dbba189a2c50db7bbe8c5d01bd8300b6408967450a1cc2925e2a4e67",
	name: "adminGetPaymentProofUrl",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminGetPaymentProofUrl.__executeServer(opts));
var adminGetPaymentProofUrl = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminGetPaymentProofUrl_createServerFn_handler, async ({ data }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { data: signed, error } = await supabaseAdmin.storage.from("payment-proofs").createSignedUrl(data.path, 300);
	if (error) throw error;
	return signed.signedUrl;
});
var adminGetSpecialRequests_createServerFn_handler = createServerRpc({
	id: "53cb86894b1d38473795042a1b48ce63f8f3dd31f3d2093db4aa214dfd5817f4",
	name: "adminGetSpecialRequests",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminGetSpecialRequests.__executeServer(opts));
var adminGetSpecialRequests = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(adminGetSpecialRequests_createServerFn_handler, async () => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { data, error } = await supabaseAdmin.from("special_requests").select("*").order("created_at", { ascending: false });
	if (error) throw error;
	return data ?? [];
});
var adminReviewSpecialRequest_createServerFn_handler = createServerRpc({
	id: "9bf004a9e27b93e18f05889e812c12226368d26fad02245baa1724082348c0b5",
	name: "adminReviewSpecialRequest",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminReviewSpecialRequest.__executeServer(opts));
var adminReviewSpecialRequest = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminReviewSpecialRequest_createServerFn_handler, async ({ data, context }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	if (![
		"accepted",
		"rejected",
		"completed"
	].includes(data.status)) throw new Error("invalid_status");
	const { data: row, error } = await supabaseAdmin.from("special_requests").update({
		status: data.status,
		...data.priceEgp === void 0 ? {} : { price_egp: data.priceEgp },
		...data.adminNote === void 0 ? {} : { admin_note: data.adminNote },
		reviewed_by: context.adminId,
		reviewed_at: (/* @__PURE__ */ new Date()).toISOString(),
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", data.request).select().single();
	if (error) throw error;
	await supabaseAdmin.from("notifications").insert({
		user_id: row.user_id,
		title: "تحديث على طلبك الخاص",
		body: data.adminNote ?? (data.status === "accepted" ? "تم قبول طلبك." : data.status === "rejected" ? "تم رفض طلبك." : "تم إكمال طلبك."),
		kind: "special_request"
	});
	await supabaseAdmin.from("admin_audit_logs").insert({
		admin_id: context.adminId,
		target_user_id: row.user_id,
		action: "review_special_request",
		metadata: {
			request: data.request,
			status: data.status,
			price_egp: data.priceEgp ?? null
		}
	});
});
var adminGetAiStats_createServerFn_handler = createServerRpc({
	id: "93e4a9b1864ed3e5b6ab3d4759997fe3a084dc7ad9d4eb737b10a82bd0e56d9c",
	name: "adminGetAiStats",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminGetAiStats.__executeServer(opts));
var adminGetAiStats = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(adminGetAiStats_createServerFn_handler, async () => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const today = /* @__PURE__ */ new Date();
	today.setHours(0, 0, 0, 0);
	const month = new Date(today.getFullYear(), today.getMonth(), 1);
	const [todayRows, monthRows, logs, errors] = await Promise.all([
		supabaseAdmin.from("ai_usage_logs").select("questions_generated,documents_analyzed,images_analyzed,tokens_used,status,created_at").gte("created_at", today.toISOString()),
		supabaseAdmin.from("ai_usage_logs").select("questions_generated,tokens_used,created_at").gte("created_at", month.toISOString()),
		supabaseAdmin.from("ai_usage_logs").select("questions_generated,documents_analyzed,images_analyzed,tokens_used,status"),
		supabaseAdmin.from("ai_usage_logs").select("id", {
			count: "exact",
			head: true
		}).in("status", ["error", "failed"]).gte("created_at", today.toISOString())
	]);
	const err = [
		todayRows,
		monthRows,
		logs,
		errors
	].find((r) => r.error)?.error;
	if (err) throw err;
	const sum = (rows) => (rows ?? []).reduce((a, r) => ({
		q: a.q + Number(r.questions_generated ?? 0),
		d: a.d + Number(r.documents_analyzed ?? 0),
		i: a.i + Number(r.images_analyzed ?? 0),
		t: a.t + Number(r.tokens_used ?? 0)
	}), {
		q: 0,
		d: 0,
		i: 0,
		t: 0
	});
	const t = sum(todayRows.data);
	const m = sum(monthRows.data);
	const all = sum(logs.data);
	return {
		requests_today: todayRows.data?.length ?? 0,
		requests_month: monthRows.data?.length ?? 0,
		questions_generated: all.q,
		documents_analyzed: all.d,
		images_analyzed: all.i,
		tokens_used: all.t,
		errors_today: errors.count ?? 0,
		errors_total: (logs.data ?? []).filter((r) => r.status === "error" || r.status === "failed").length,
		_today: t,
		_month: m
	};
});
var adminGetAiJobs_createServerFn_handler = createServerRpc({
	id: "6bde7419c6d290ece9b455da9530b78f1393bf13e4ee994a686746de5fbbe90e",
	name: "adminGetAiJobs",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminGetAiJobs.__executeServer(opts));
var adminGetAiJobs = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(adminGetAiJobs_createServerFn_handler, async () => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { data, error } = await supabaseAdmin.from("ai_jobs").select("*").order("created_at", { ascending: false }).limit(50);
	if (error) throw error;
	return data ?? [];
});
var adminGetAiLogs_createServerFn_handler = createServerRpc({
	id: "bbd79d37de23fd008e0617ebb5cfbbfa6cadb2770300a580216496318c3a8a49",
	name: "adminGetAiLogs",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminGetAiLogs.__executeServer(opts));
var adminGetAiLogs = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(adminGetAiLogs_createServerFn_handler, async () => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { data, error } = await supabaseAdmin.from("ai_usage_logs").select("*").order("created_at", { ascending: false }).limit(50);
	if (error) throw error;
	return data ?? [];
});
var adminGetSubjects_createServerFn_handler = createServerRpc({
	id: "7d48b53c4f8672f3e01f1e553abef04532c9ddec8829d42938a642937a9486d9",
	name: "adminGetSubjects",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminGetSubjects.__executeServer(opts));
var adminGetSubjects = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(adminGetSubjects_createServerFn_handler, async () => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { data, error } = await supabaseAdmin.from("subjects").select("*").order("sort_order", { ascending: true });
	if (error) throw error;
	return data ?? [];
});
var adminGetCurriculumContentCounts_createServerFn_handler = createServerRpc({
	id: "1dbb75d01c95bb1ef0823a2f14010fe213a23d2b2aa099602275b4c183ebb43b",
	name: "adminGetCurriculumContentCounts",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminGetCurriculumContentCounts.__executeServer(opts));
var adminGetCurriculumContentCounts = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(adminGetCurriculumContentCounts_createServerFn_handler, async () => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const [units, chapters, topics, bank] = await Promise.all([
		supabaseAdmin.from("units").select("subject_id"),
		supabaseAdmin.from("chapters").select("subject_id"),
		supabaseAdmin.from("topics").select("subject_id"),
		supabaseAdmin.from("question_bank").select("subject_id")
	]);
	const firstError = [
		units,
		chapters,
		topics,
		bank
	].find((r) => r.error)?.error;
	if (firstError) throw firstError;
	const tally = (rows) => {
		const map = {};
		for (const row of rows ?? []) if (row.subject_id) map[row.subject_id] = (map[row.subject_id] ?? 0) + 1;
		return map;
	};
	return {
		units: tally(units.data),
		chapters: tally(chapters.data),
		topics: tally(topics.data),
		bank: tally(bank.data)
	};
});
var adminCreateSubject_createServerFn_handler = createServerRpc({
	id: "3c095e39fbd36c4e50261a88eed2b004cf05d4087287bfb2fe8130a614a9e7ad",
	name: "adminCreateSubject",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminCreateSubject.__executeServer(opts));
var adminCreateSubject = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminCreateSubject_createServerFn_handler, async ({ data }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { error } = await supabaseAdmin.from("subjects").insert(data);
	if (error) throw error;
});
var adminUpdateSubject_createServerFn_handler = createServerRpc({
	id: "728a1acdb9f8094e0b2634e7246e1ea1ffa07d9737a4ef52f17cb04c2ad386ff",
	name: "adminUpdateSubject",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminUpdateSubject.__executeServer(opts));
var adminUpdateSubject = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminUpdateSubject_createServerFn_handler, async ({ data }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { error } = await supabaseAdmin.from("subjects").update(data.patch).eq("id", data.id);
	if (error) throw error;
});
var adminUpdateSubscriptionPlan_createServerFn_handler = createServerRpc({
	id: "4f5caf88181eb6303abe042e694ecc3416bd43fbeb5b113799a92ba3743046db",
	name: "adminUpdateSubscriptionPlan",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminUpdateSubscriptionPlan.__executeServer(opts));
var adminUpdateSubscriptionPlan = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminUpdateSubscriptionPlan_createServerFn_handler, async ({ data }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { error } = await supabaseAdmin.from("subscription_plans").update(data.patch).eq("id", data.id);
	if (error) throw error;
});
var adminCreateSubscriptionPlan_createServerFn_handler = createServerRpc({
	id: "e2e7eb84bdc572628ca2ed482026d72e11aad0f2809a574e38c77e12e9e58a2e",
	name: "adminCreateSubscriptionPlan",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminCreateSubscriptionPlan.__executeServer(opts));
var adminCreateSubscriptionPlan = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminCreateSubscriptionPlan_createServerFn_handler, async ({ data }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { error } = await supabaseAdmin.from("subscription_plans").insert(data);
	if (error) throw error;
});
var adminGetSubscriptionPlans_createServerFn_handler = createServerRpc({
	id: "f89f3eefd20e23378ebaf6782a4be7bc0a1ea3c214f645aa46869503f005ce69",
	name: "adminGetSubscriptionPlans",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminGetSubscriptionPlans.__executeServer(opts));
var adminGetSubscriptionPlans = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(adminGetSubscriptionPlans_createServerFn_handler, async () => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { data, error } = await supabaseAdmin.from("subscription_plans").select("*").order("sort_order", { ascending: true });
	if (error) throw error;
	return data ?? [];
});
var adminGetQuestionSubjects_createServerFn_handler = createServerRpc({
	id: "1382a06fd14c4eda2614f61aa3a63bab3b7775ef55090ae30f881c9df9616ab4",
	name: "adminGetQuestionSubjects",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminGetQuestionSubjects.__executeServer(opts));
var adminGetQuestionSubjects = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(adminGetQuestionSubjects_createServerFn_handler, async () => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { data, error } = await supabaseAdmin.from("subjects").select("id,name_ar").order("sort_order");
	if (error) throw error;
	return data ?? [];
});
var adminGetQuestionBank_createServerFn_handler = createServerRpc({
	id: "74e4e36e629a3b8d301b1d8befec2381abc9217061b0bb937348edc1359d2304",
	name: "adminGetQuestionBank",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminGetQuestionBank.__executeServer(opts));
var adminGetQuestionBank = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminGetQuestionBank_createServerFn_handler, async ({ data }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	let query = supabaseAdmin.from("question_bank").select("id,prompt,difficulty,question_type,quality_status,usage_count,language,school_year,track,lesson_key,concepts,source_label,source_page_from,source_page_to,created_at,subject_id", { count: "exact" }).order("created_at", { ascending: false }).range(data.page * data.pageSize, data.page * data.pageSize + data.pageSize - 1);
	if (data.subjectId) query = query.eq("subject_id", data.subjectId);
	if (data.difficulty) query = query.eq("difficulty", data.difficulty);
	if (data.search?.trim()) query = query.ilike("prompt", `%${data.search.trim()}%`);
	const { data: rows, count, error } = await query;
	if (error) throw error;
	return {
		rows: rows ?? [],
		count: count ?? 0
	};
});
var adminPrepareCurriculumUpload_createServerFn_handler = createServerRpc({
	id: "92e4105056011fa6f746cb9f3626016fee62baa999e9f168cb075eb9239e2b07",
	name: "adminPrepareCurriculumUpload",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminPrepareCurriculumUpload.__executeServer(opts));
var adminPrepareCurriculumUpload = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminPrepareCurriculumUpload_createServerFn_handler, async ({ data, context }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { data: existing, error: existingError } = await supabaseAdmin.from("curriculum_versions").select("id,version,checksum_sha256").eq("subject_id", data.subjectId).order("version", { ascending: false }).limit(1);
	if (existingError) throw existingError;
	if (existing?.some((row) => row.checksum_sha256 === data.checksumSha256)) throw new Error("duplicate_curriculum");
	const nextVersion = (existing?.[0]?.version ?? 0) + 1;
	const safeName = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-180);
	const path = `subjects/${data.subjectId}/v${nextVersion}-${Date.now()}-${safeName}`;
	const { data: version, error } = await supabaseAdmin.from("curriculum_versions").insert({
		subject_id: data.subjectId,
		version: nextVersion,
		filename: data.filename,
		storage_path: path,
		checksum_sha256: data.checksumSha256,
		uploaded_by: context.adminId
	}).select().single();
	if (error) throw error;
	const { data: upload, error: uploadError } = await supabaseAdmin.storage.from("curriculum-books").createSignedUploadUrl(path);
	if (uploadError) throw uploadError;
	const { error: jobError } = await supabaseAdmin.from("curriculum_processing_jobs").insert({ curriculum_version_id: version.id });
	if (jobError) throw jobError;
	return {
		versionId: version.id,
		path,
		token: upload.token
	};
});
var adminProcessCurriculum_createServerFn_handler = createServerRpc({
	id: "971eb9807ba60a8d7a51f2987f350040c838b51405413c247fea66b6dbc24437",
	name: "adminProcessCurriculum",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminProcessCurriculum.__executeServer(opts));
var adminProcessCurriculum = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminProcessCurriculum_createServerFn_handler, async ({ data }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { data: version, error: versionError } = await supabaseAdmin.from("curriculum_versions").select("id,subject_id,filename,storage_path").eq("id", data.versionId).single();
	if (versionError) throw versionError;
	const { data: subject, error: subjectError } = await supabaseAdmin.from("subjects").select("name_ar").eq("id", version.subject_id).single();
	if (subjectError) throw subjectError;
	await supabaseAdmin.from("curriculum_versions").update({
		processing_status: "processing",
		processing_error: null
	}).eq("id", version.id);
	await supabaseAdmin.from("curriculum_processing_jobs").update({
		status: "processing",
		attempts: 1,
		locked_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("curriculum_version_id", version.id);
	try {
		const { data: file, error: fileError } = await supabaseAdmin.storage.from("curriculum-books").download(version.storage_path);
		if (fileError) throw fileError;
		const bytes = Buffer.from(await file.arrayBuffer()).toString("base64");
		const response = await fetch(`${(processModule.env["WISO_AGENT_URL"] ?? "http://127.0.0.1:8000").replace(/\/$/, "")}/v1/curriculum/analyze`, {
			method: "POST",
			headers: {
				"content-type": "application/json",
				authorization: `Bearer ${processModule.env["WISO_AGENT_SECRET"] ?? ""}`
			},
			body: JSON.stringify({
				request_id: `wiso_curriculum_${version.id}`,
				subject_name: subject.name_ar,
				filename: version.filename,
				pdf_base64: bytes
			})
		});
		const body = await response.text();
		if (!response.ok) throw new Error(`curriculum_agent_${response.status}:${body.slice(0, 500)}`);
		const analysis = JSON.parse(body);
		await supabaseAdmin.from("curriculum_pages").delete().eq("curriculum_version_id", version.id);
		await supabaseAdmin.from("curriculum_units").delete().eq("curriculum_version_id", version.id);
		if (analysis.pages.length) await supabaseAdmin.from("curriculum_pages").insert(analysis.pages.map((page) => ({
			curriculum_version_id: version.id,
			page_number: page.page_number,
			extracted_text: page.text
		})));
		let needsReview = false;
		for (let ui = 0; ui < analysis.units.length; ui++) {
			const unit = analysis.units[ui];
			if (!unit) throw new Error(`curriculum_unit_missing:${ui}`);
			needsReview ||= Boolean(unit.needs_review) || Number(unit.confidence ?? 0) < .65;
			const { data: unitRow, error: unitError } = await supabaseAdmin.from("curriculum_units").insert({
				curriculum_version_id: version.id,
				title: unit.title,
				sort_order: ui,
				page_start: unit.page_start ?? null,
				page_end: unit.page_end ?? null,
				confidence: unit.confidence ?? null,
				needs_review: Boolean(unit.needs_review) || Number(unit.confidence ?? 0) < .65
			}).select().single();
			if (unitError) throw unitError;
			for (let li = 0; li < unit.lessons.length; li++) {
				const lesson = unit.lessons[li];
				if (!lesson) throw new Error(`curriculum_lesson_missing:${ui}:${li}`);
				const lessonReview = Boolean(lesson.needs_review) || Number(lesson.confidence ?? 0) < .65;
				needsReview ||= lessonReview;
				const { data: lessonRow, error: lessonError } = await supabaseAdmin.from("curriculum_lessons").insert({
					curriculum_version_id: version.id,
					unit_id: unitRow.id,
					title: lesson.title,
					sort_order: li,
					page_start: lesson.page_start ?? null,
					page_end: lesson.page_end ?? null,
					confidence: lesson.confidence ?? null,
					needs_review: lessonReview
				}).select().single();
				if (lessonError) throw lessonError;
				if (lesson.concepts.length) await supabaseAdmin.from("curriculum_concepts").insert(lesson.concepts.map((concept) => ({
					lesson_id: lessonRow.id,
					title: concept.title,
					description: concept.description ?? null,
					source_page: concept.source_page ?? null,
					needs_review: lessonReview
				})));
			}
		}
		const status = needsReview ? "needs_review" : "completed";
		await supabaseAdmin.from("curriculum_versions").update({
			page_count: analysis.page_count,
			processing_status: status,
			processed_at: (/* @__PURE__ */ new Date()).toISOString()
		}).eq("id", version.id);
		await supabaseAdmin.from("curriculum_processing_jobs").update({
			status,
			completed_at: (/* @__PURE__ */ new Date()).toISOString(),
			updated_at: (/* @__PURE__ */ new Date()).toISOString(),
			locked_at: null
		}).eq("curriculum_version_id", version.id);
		return {
			versionId: version.id,
			status,
			pageCount: analysis.page_count
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		await supabaseAdmin.from("curriculum_versions").update({
			processing_status: "failed",
			processing_error: message
		}).eq("id", version.id);
		await supabaseAdmin.from("curriculum_processing_jobs").update({
			status: "failed",
			error: message,
			updated_at: (/* @__PURE__ */ new Date()).toISOString(),
			locked_at: null
		}).eq("curriculum_version_id", version.id);
		throw error;
	}
});
var adminGetCurriculumVersions_createServerFn_handler = createServerRpc({
	id: "ea9efd495f9d2f09d5c0b3724f44e427a358cc5b92d349d58f0fab33aff17f79",
	name: "adminGetCurriculumVersions",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminGetCurriculumVersions.__executeServer(opts));
var adminGetCurriculumVersions = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminGetCurriculumVersions_createServerFn_handler, async ({ data }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	let query = supabaseAdmin.from("curriculum_versions").select("*").order("created_at", { ascending: false });
	if (data.subjectId) query = query.eq("subject_id", data.subjectId);
	const { data: rows, error } = await query;
	if (error) throw error;
	return rows ?? [];
});
var adminPublishCurriculumVersion_createServerFn_handler = createServerRpc({
	id: "a6706d06ffc120f16d5fb07f74f8e6d71f4809a41e92be4dbd9e81c7321aca37",
	name: "adminPublishCurriculumVersion",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminPublishCurriculumVersion.__executeServer(opts));
var adminPublishCurriculumVersion = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminPublishCurriculumVersion_createServerFn_handler, async ({ data }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { data: version, error: versionError } = await supabaseAdmin.from("curriculum_versions").select("*").eq("id", data.versionId).single();
	if (versionError) throw versionError;
	const [units, lessons] = await Promise.all([supabaseAdmin.from("curriculum_units").select("needs_review").eq("curriculum_version_id", data.versionId).eq("needs_review", true), supabaseAdmin.from("curriculum_lessons").select("needs_review").eq("curriculum_version_id", data.versionId).eq("needs_review", true)]);
	if ((units.data?.length ?? 0) || (lessons.data?.length ?? 0)) throw new Error("curriculum_needs_review");
	await supabaseAdmin.from("curriculum_versions").update({ is_published: false }).eq("subject_id", version.subject_id);
	const { data: result, error } = await supabaseAdmin.from("curriculum_versions").update({
		is_published: true,
		processing_status: "completed",
		processed_at: version.processed_at ?? (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", data.versionId).select().single();
	if (error) throw error;
	return result;
});
var adminSendNotification_createServerFn_handler = createServerRpc({
	id: "2ce335996f2b07a5db45e1394010b15094588b453097d464a8e3d8f8b1ac8a00",
	name: "adminSendNotification",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminSendNotification.__executeServer(opts));
var adminSendNotification = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminSendNotification_createServerFn_handler, async ({ data, context }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	if (!data.title.trim() || !data.body.trim()) throw new Error("notification_content_required");
	let query = supabaseAdmin.from("profiles").select("id").limit(1e5);
	if (data.audience === "user") {
		if (!data.userId) throw new Error("user_required");
		query = query.eq("id", data.userId);
	}
	if (data.audience === "stage") {
		if (!data.stageId) throw new Error("stage_required");
		query = query.eq("academic_stage_id", data.stageId);
	}
	if (data.audience === "track") {
		if (!data.trackId) throw new Error("track_required");
		query = query.eq("academic_track_id", data.trackId);
	}
	const { data: recipients, error } = await query;
	if (error) throw error;
	const rows = (recipients ?? []).map((r) => ({
		user_id: r.id,
		title: data.title.trim(),
		body: data.body.trim(),
		kind: data.type ?? "admin",
		metadata: {
			action_url: data.actionUrl ?? null,
			expires_at: data.expiresAt ?? null
		}
	}));
	if (rows.length) {
		const { error: insertError } = await supabaseAdmin.from("notifications").insert(rows);
		if (insertError) throw insertError;
	}
	await supabaseAdmin.from("admin_audit_logs").insert({
		admin_id: context.adminId,
		action: "send_notification",
		metadata: {
			audience: data.audience,
			count: rows.length
		}
	});
	return { sent: rows.length };
});
var adminGetAcademicStages_createServerFn_handler = createServerRpc({
	id: "6418debdc43746869f80d83965aa6cfd8b0d546d7e1732e01fa148279949b5f2",
	name: "adminGetAcademicStages",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminGetAcademicStages.__executeServer(opts));
var adminGetAcademicStages = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(adminGetAcademicStages_createServerFn_handler, async () => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { data, error } = await supabaseAdmin.from("academic_stages").select("id,name_ar,slug").eq("is_active", true).order("sort_order");
	if (error) throw error;
	return data ?? [];
});
var adminGetAcademicTracks_createServerFn_handler = createServerRpc({
	id: "65bdf57ca9c822586ab3fb39954614cec659f50737c646ea5596027fa21bb234",
	name: "adminGetAcademicTracks",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminGetAcademicTracks.__executeServer(opts));
var adminGetAcademicTracks = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminGetAcademicTracks_createServerFn_handler, async ({ data }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	let query = supabaseAdmin.from("academic_tracks").select("id,name_ar,slug,stage_id").eq("is_active", true).order("sort_order");
	if (data.stageId) query = query.eq("stage_id", data.stageId);
	const { data: rows, error } = await query;
	if (error) throw error;
	return rows ?? [];
});
//#endregion
export { adminCreateCenter_createServerFn_handler, adminCreateSubject_createServerFn_handler, adminCreateSubscriptionPlan_createServerFn_handler, adminGenerateCenterCodes_createServerFn_handler, adminGetAcademicStages_createServerFn_handler, adminGetAcademicTracks_createServerFn_handler, adminGetAiJobs_createServerFn_handler, adminGetAiLogs_createServerFn_handler, adminGetAiSettings_createServerFn_handler, adminGetAiStats_createServerFn_handler, adminGetCenterCodes_createServerFn_handler, adminGetCenters_createServerFn_handler, adminGetContestEntriesCount_createServerFn_handler, adminGetContestSettings_createServerFn_handler, adminGetCurriculumContentCounts_createServerFn_handler, adminGetCurriculumVersions_createServerFn_handler, adminGetDashboardCounts_createServerFn_handler, adminGetPaymentProofUrl_createServerFn_handler, adminGetPayments_createServerFn_handler, adminGetPdfSettings_createServerFn_handler, adminGetPlans_createServerFn_handler, adminGetPlatformSettings_createServerFn_handler, adminGetQuestionBank_createServerFn_handler, adminGetQuestionSubjects_createServerFn_handler, adminGetRevenueSummary_createServerFn_handler, adminGetSpecialRequests_createServerFn_handler, adminGetStats_createServerFn_handler, adminGetSubjects_createServerFn_handler, adminGetSubscriptionPlans_createServerFn_handler, adminGetUserDetail_createServerFn_handler, adminGrantAccess_createServerFn_handler, adminListUsers_createServerFn_handler, adminManageTrial_createServerFn_handler, adminPrepareCurriculumUpload_createServerFn_handler, adminProcessCurriculum_createServerFn_handler, adminPublishCurriculumVersion_createServerFn_handler, adminReviewPayment_createServerFn_handler, adminReviewSpecialRequest_createServerFn_handler, adminRevokeAccess_createServerFn_handler, adminSendNotification_createServerFn_handler, adminSetRole_createServerFn_handler, adminSetSuspended_createServerFn_handler, adminUpdateAiSettings_createServerFn_handler, adminUpdateContestSettings_createServerFn_handler, adminUpdatePdfSettings_createServerFn_handler, adminUpdatePlatformSettings_createServerFn_handler, adminUpdateSubject_createServerFn_handler, adminUpdateSubscriptionPlan_createServerFn_handler };
