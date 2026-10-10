import { l as createServerFn } from "./createServerFn-yTfeHp1H.mjs";
import { n as requireSupabaseAuth } from "./auth-middleware-BogctHY4.mjs";
import { t as requireSupabaseAdmin } from "./admin.middleware-BsoUGKyB.mjs";
import { t as createServerRpc } from "./createServerRpc-D228ng_7.mjs";
import { n as supabaseAdmin } from "./client.server-BlnvGJA3.mjs";
import processModule from "node:process";
import { Buffer } from "node:buffer";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/sprix-agent.functions-w_yCaPxW.js
var VERSION = "v1";
var ALGORITHM = "aes-256-gcm";
var IV_BYTES = 12;
function encryptionKey() {
	const raw = processModule.env["SPRIX_CREDENTIAL_ENCRYPTION_KEY"];
	if (!raw) throw new Error("SPRIX_CREDENTIAL_ENCRYPTION_KEY is not configured on the server.");
	const key = Buffer.from(raw, "base64");
	if (key.length !== 32) throw new Error("SPRIX_CREDENTIAL_ENCRYPTION_KEY must be a base64-encoded 32-byte key.");
	return key;
}
function encryptSprixCredentials(credentials) {
	const iv = randomBytes(IV_BYTES);
	const cipher = createCipheriv(ALGORITHM, encryptionKey(), iv);
	const plaintext = Buffer.from(JSON.stringify(credentials), "utf8");
	const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
	const tag = cipher.getAuthTag();
	return [
		VERSION,
		iv.toString("base64url"),
		tag.toString("base64url"),
		ciphertext.toString("base64url")
	].join(".");
}
function decryptSprixCredentials(payload) {
	const [version, ivEncoded, tagEncoded, ciphertextEncoded] = payload.split(".");
	if (version !== VERSION || !ivEncoded || !tagEncoded || !ciphertextEncoded) throw new Error("Invalid SPRIX credential payload.");
	const decipher = createDecipheriv(ALGORITHM, encryptionKey(), Buffer.from(ivEncoded, "base64url"));
	decipher.setAuthTag(Buffer.from(tagEncoded, "base64url"));
	const plaintext = Buffer.concat([decipher.update(Buffer.from(ciphertextEncoded, "base64url")), decipher.final()]).toString("utf8");
	const parsed = JSON.parse(plaintext);
	if (!parsed || typeof parsed !== "object") throw new Error("Invalid SPRIX credential payload.");
	const value = parsed;
	if (typeof value["username"] !== "string" || typeof value["password"] !== "string") throw new Error("Invalid SPRIX credential payload.");
	return {
		username: value["username"],
		password: value["password"]
	};
}
function hashSprixUsername(username) {
	return createHash("sha256").update(username.trim().toLocaleLowerCase("en-US"), "utf8").digest("hex");
}
var ARABIC_DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;
/** Normalize Arabic/Unicode text without changing semantic characters. */
function normalizeArabicText(value) {
	return value.normalize("NFKC").replace(ARABIC_DIACRITICS, "").replace(/[إأآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ؤ/g, "و").replace(/ئ/g, "ي").replace(/ـ/g, "").replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/[\u0660-\u0669]/g, (digit) => String(digit.charCodeAt(0) - 1632)).replace(/[\u06F0-\u06F9]/g, (digit) => String(digit.charCodeAt(0) - 1776)).replace(/[\u0640]/g, "").replace(/[.,،؛:!?؟()[\]{}"'`«»]/g, " ").replace(/\s+/g, " ").trim().toLocaleLowerCase("ar");
}
async function getSprixCredential(userId) {
	const { data, error } = await supabaseAdmin.from("sprix_credentials").select("*").eq("user_id", userId).maybeSingle();
	if (error) throw error;
	return data;
}
async function upsertSprixCredential(userId, encryptedCredentials, accountUsernameHash) {
	const { error } = await supabaseAdmin.from("sprix_credentials").upsert({
		user_id: userId,
		credential_ciphertext: encryptedCredentials,
		encryption_version: 1,
		account_username_hash: accountUsernameHash,
		verification_status: "verified",
		verified_at: (/* @__PURE__ */ new Date()).toISOString(),
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}, { onConflict: "user_id" });
	if (error) throw error;
}
async function createSprixRun(userId, credentialId) {
	const { data, error } = await supabaseAdmin.from("sprix_agent_runs").insert({
		user_id: userId,
		credential_id: credentialId
	}).select("*").single();
	if (error) throw error;
	return data;
}
async function getSprixRunForUser(userId, runId) {
	const { data, error } = await supabaseAdmin.from("sprix_agent_runs").select("id,status,questions_processed,questions_completed,unresolved_questions,current_question_fingerprint,error_code,error_message_safe,last_activity_at").eq("id", runId).eq("user_id", userId).maybeSingle();
	if (error) throw error;
	if (!data) return null;
	return {
		runId: data.id,
		status: data.status,
		questionsProcessed: data.questions_processed,
		questionsCompleted: data.questions_completed,
		unresolvedQuestions: data.unresolved_questions,
		currentQuestionFingerprint: data.current_question_fingerprint,
		errorCode: data.error_code,
		errorMessageSafe: data.error_message_safe,
		lastActivityAt: data.last_activity_at
	};
}
async function listSprixRunsForUser(userId) {
	const { data, error } = await supabaseAdmin.from("sprix_agent_runs").select("id,status,questions_processed,questions_completed,unresolved_questions,current_question_fingerprint,error_code,error_message_safe,last_activity_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(20);
	if (error) throw error;
	return (data ?? []).map((row) => ({
		runId: row.id,
		status: row.status,
		questionsProcessed: row.questions_processed,
		questionsCompleted: row.questions_completed,
		unresolvedQuestions: row.unresolved_questions,
		currentQuestionFingerprint: row.current_question_fingerprint,
		errorCode: row.error_code,
		errorMessageSafe: row.error_message_safe,
		lastActivityAt: row.last_activity_at
	}));
}
function agentUrl() {
	return (processModule.env["WISO_AGENT_URL"] ?? "http://127.0.0.1:8000").replace(/\/$/, "");
}
function agentSecret() {
	const secret = processModule.env["WISO_AGENT_SECRET"];
	if (!secret) throw new Error("WISO_AGENT_SECRET is not configured on the server.");
	return secret;
}
async function verifySprixCredentials(input) {
	const response = await fetch(`${agentUrl()}/v1/sprix/verify`, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			authorization: `Bearer ${agentSecret()}`
		},
		body: JSON.stringify({
			username: input.username,
			password: input.password,
			base_url: input.baseUrl
		}),
		signal: AbortSignal.timeout(135e3)
	});
	const body = await response.text();
	if (!response.ok) throw new Error(`SPRIX verification failed (${response.status})`);
	const payload = JSON.parse(body);
	return {
		verified: payload.verified === true,
		errorCode: payload.errorCode ?? null
	};
}
async function executeSprixInWorker(input) {
	const response = await fetch(`${agentUrl()}/v1/sprix/run`, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			authorization: `Bearer ${agentSecret()}`
		},
		body: JSON.stringify({
			run_id: input.runId,
			username: input.username,
			password: input.password,
			base_url: input.baseUrl,
			subject: input.subject,
			timeout_ms: input.timeoutMs,
			max_questions: input.maxQuestions,
			verified_answers: input.verifiedAnswers.map((answer) => ({
				fingerprint: answer.fingerprint,
				normalized_question_text: answer.normalizedQuestionText,
				correct_option_text: answer.correctOptionText
			}))
		}),
		signal: AbortSignal.timeout(input.timeoutMs + 15e3)
	});
	const body = await response.text();
	if (!response.ok) throw new Error(`SPRIX worker request failed (${response.status}): ${body.slice(0, 500)}`);
	const payload = JSON.parse(body);
	if (!payload || typeof payload["status"] !== "string") throw new Error("Invalid SPRIX worker response.");
	return payload;
}
var DEFAULT_TIMEOUT_MS = 12e5;
var DEFAULT_MAX_QUESTIONS = 500;
var LEASE_MS = 72e5;
var DEFAULT_MAX_RETRIES = 2;
function baseUrl() {
	return (processModule.env["SPRIX_BASE_URL"] ?? "https://egy.app.spx-learning-square.com/dashboard").replace(/\/$/, "") + "/";
}
function maxQuestions() {
	const value = Number(processModule.env["SPRIX_AGENT_MAX_QUESTIONS"] ?? DEFAULT_MAX_QUESTIONS);
	return Number.isInteger(value) && value > 0 && value <= 5e3 ? value : DEFAULT_MAX_QUESTIONS;
}
function timeoutMs() {
	const value = Number(processModule.env["SPRIX_AGENT_TIMEOUT_MS"] ?? DEFAULT_TIMEOUT_MS);
	return Number.isInteger(value) && value >= 6e4 && value <= 36e5 ? value : DEFAULT_TIMEOUT_MS;
}
function maxRetries() {
	const value = Number(processModule.env["SPRIX_AGENT_MAX_RETRIES"] ?? DEFAULT_MAX_RETRIES);
	return Number.isInteger(value) && value >= 0 && value <= 5 ? value : DEFAULT_MAX_RETRIES;
}
async function claimNextSprixRun() {
	const { data, error } = await (await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t)).supabaseAdmin.rpc("claim_next_sprix_agent_run", { _lease_seconds: Math.ceil(LEASE_MS / 1e3) });
	if (error) throw error;
	return typeof data === "string" ? data : null;
}
async function executeClaimedSprixRun(runId) {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { data: run, error } = await supabaseAdmin.from("sprix_agent_runs").select("id,user_id,credential_id,status").eq("id", runId).maybeSingle();
	if (error) throw error;
	if (!run || run.status !== "running") return;
	const credential = await getSprixCredential(run.user_id);
	if (!credential) {
		await markRunFailure(runId, "credentials_missing", "تعذر العثور على بيانات تسجيل الدخول المحفوظة.");
		return;
	}
	try {
		const credentials = decryptSprixCredentials(credential.credential_ciphertext);
		await supabaseAdmin.from("sprix_credentials").update({ last_used_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", credential.id);
		const { data: verifiedRows, error: verifiedError } = await supabaseAdmin.from("sprix_questions").select("question_fingerprint,normalized_question_text,correct_option_text").eq("platform", "sprix").eq("subject", "الثقافة المالية").eq("verification_status", "verified");
		if (verifiedError) throw verifiedError;
		const verifiedAnswers = (verifiedRows ?? []).filter((row) => typeof row.correct_option_text === "string" && row.correct_option_text.length > 0).map((row) => ({
			fingerprint: row.question_fingerprint,
			normalizedQuestionText: row.normalized_question_text,
			correctOptionText: row.correct_option_text
		}));
		let result;
		let lastError = null;
		for (let attempt = 0; attempt <= maxRetries(); attempt += 1) try {
			result = await executeSprixInWorker({
				runId,
				username: credentials.username,
				password: credentials.password,
				baseUrl: baseUrl(),
				subject: "الثقافة المالية",
				timeoutMs: timeoutMs(),
				maxQuestions: maxQuestions(),
				verifiedAnswers
			});
			lastError = null;
			break;
		} catch (error) {
			lastError = error;
			if (attempt >= maxRetries()) throw error;
			console.warn("[SPRIX] retry", {
				runId,
				attempt: attempt + 1
			});
			await new Promise((resolve) => setTimeout(resolve, Math.min(2e3 * (attempt + 1), 6e3)));
		}
		if (!result) throw lastError instanceof Error ? lastError : /* @__PURE__ */ new Error("sprix_worker_no_result");
		const status = result.status === "completed" ? "completed" : result.status === "needs_review" ? "needs_review" : "failed";
		let currentQuestionId = null;
		if (result.status === "needs_review" && result.unresolvedQuestionText && result.currentQuestionFingerprint) {
			const unresolvedOptions = (result.unresolvedQuestionOptions ?? []).map((text) => ({ text }));
			const { data: questionRow, error: questionError } = await supabaseAdmin.from("sprix_questions").upsert({
				platform: "sprix",
				subject: "الثقافة المالية",
				question_text: result.unresolvedQuestionText,
				normalized_question_text: normalizeArabicText(result.unresolvedQuestionText),
				question_fingerprint: result.currentQuestionFingerprint,
				options: unresolvedOptions,
				verification_status: "unresolved"
			}, { onConflict: "platform,subject,question_fingerprint" }).select("id").single();
			if (questionError) throw questionError;
			currentQuestionId = questionRow.id;
			await supabaseAdmin.from("sprix_agent_run_items").upsert({
				run_id: runId,
				question_id: currentQuestionId,
				question_fingerprint: result.currentQuestionFingerprint,
				status: "unresolved"
			}, { onConflict: "run_id,question_fingerprint" });
		}
		await supabaseAdmin.from("sprix_agent_runs").update({
			status,
			questions_processed: result.questionsProcessed,
			questions_completed: result.questionsCompleted,
			unresolved_questions: result.unresolvedQuestions,
			error_code: result.errorCode ?? null,
			current_question_id: currentQuestionId,
			current_question_fingerprint: result.currentQuestionFingerprint ?? null,
			worker_lease_until: null,
			error_message_safe: result.errorMessageSafe ?? null,
			finished_at: (/* @__PURE__ */ new Date()).toISOString(),
			last_activity_at: (/* @__PURE__ */ new Date()).toISOString()
		}).eq("id", runId);
	} catch (error) {
		await markRunFailure(runId, "worker_error", "حدث خطأ أثناء تشغيل وكيل SPRIX. حاول مرة أخرى.");
		console.error("[SPRIX] worker failure", error instanceof Error ? error.message : String(error));
	}
}
async function markRunFailure(runId, errorCode, safeMessage) {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	await supabaseAdmin.from("sprix_agent_runs").update({
		status: "failed",
		worker_lease_until: null,
		error_code: errorCode,
		error_message_safe: safeMessage,
		finished_at: (/* @__PURE__ */ new Date()).toISOString(),
		last_activity_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", runId);
}
var METHODS = /* @__PURE__ */ new Set(["vodafone_cash", "instapay"]);
function getPriceEgp() {
	const raw = processModule.env["SPRIX_AGENT_PRICE_EGP"]?.trim();
	const value = Number(raw);
	if (!Number.isFinite(value) || value <= 0) throw new Error("SPRIX_AGENT_PRICE_NOT_CONFIGURED");
	return Math.round(value * 100) / 100;
}
function normalizeSenderNumber(value) {
	const normalized = value.trim().replace(/[\s()-]/g, "");
	if (!/^[+]?\d{8,20}$/.test(normalized)) throw new Error("INVALID_SENDER_NUMBER");
	return normalized;
}
async function getSprixPaymentOptions() {
	const { data, error } = await supabaseAdmin.from("payment_methods").select("method_key,display_name,account_identifier,instructions,is_active,sort_order").in("method_key", ["vodafone_cash", "instapay"]).eq("is_active", true).order("sort_order", { ascending: true });
	if (error) throw error;
	return {
		priceEgp: getPriceEgp(),
		methods: (data ?? []).filter((item) => METHODS.has(item.method_key))
	};
}
async function createSprixPaymentRequest(input) {
	if (!METHODS.has(input.method)) throw new Error("INVALID_PAYMENT_METHOD");
	if (!input.screenshotPath.startsWith(`${input.userId}/sprix/`)) throw new Error("INVALID_PAYMENT_PROOF_PATH");
	const amount = getPriceEgp();
	const senderNumber = normalizeSenderNumber(input.senderNumber);
	const { data, error } = await supabaseAdmin.from("sprix_payment_requests").insert({
		user_id: input.userId,
		method: input.method,
		amount_egp: amount,
		sender_number: senderNumber,
		screenshot_path: input.screenshotPath
	}).select("id,status,amount_egp,method,sender_number,screenshot_path,created_at").single();
	if (error) {
		if (error.code === "23505") throw new Error("PENDING_SPRIX_PAYMENT_EXISTS");
		throw error;
	}
	return data;
}
async function listMySprixPaymentRequests(userId) {
	const { data, error } = await supabaseAdmin.from("sprix_payment_requests").select("id,method,amount_egp,status,reject_reason,created_at,reviewed_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(20);
	if (error) throw error;
	return data ?? [];
}
async function hasSprixAccess(userId) {
	const { data, error } = await supabaseAdmin.from("sprix_agent_access").select("active,expires_at").eq("user_id", userId).maybeSingle();
	if (error) throw error;
	return data?.active === true && (!data.expires_at || new Date(data.expires_at).getTime() > Date.now());
}
async function adminListSprixPaymentRequests(status) {
	let query = supabaseAdmin.from("sprix_payment_requests").select("id,user_id,method,amount_egp,sender_number,screenshot_path,status,reject_reason,reviewed_by,reviewed_at,created_at").order("created_at", { ascending: false }).limit(200);
	if (status && status !== "all") query = query.eq("status", status);
	const { data, error } = await query;
	if (error) throw error;
	return data ?? [];
}
async function adminReviewSprixPayment(input) {
	const rawDays = Number(processModule.env["SPRIX_AGENT_ACCESS_DAYS"] ?? "30");
	const accessDays = Number.isInteger(rawDays) && rawDays >= 1 && rawDays <= 3650 ? rawDays : 30;
	const rpcParams = {
		_request: input.paymentId,
		_approve: input.approve,
		_admin_id: input.adminId,
		_access_days: accessDays,
		...input.reason?.trim() ? { _reason: input.reason.trim() } : {}
	};
	const { data, error } = await supabaseAdmin.rpc("admin_review_sprix_payment", rpcParams);
	if (error) throw error;
	return data;
}
async function createSprixPaymentProofSignedUrl(path) {
	if (!path.includes("/sprix/")) throw new Error("INVALID_PAYMENT_PROOF_PATH");
	const { data, error } = await supabaseAdmin.storage.from("payment-proofs").createSignedUrl(path, 300);
	if (error) throw error;
	return data.signedUrl;
}
var saveSprixCredentials_createServerFn_handler = createServerRpc({
	id: "eedcde931feebc7851367ffe057ce1946d7255e2df801f0dbd89a50762eeff64",
	name: "saveSprixCredentials",
	filename: "src/lib/sprix-agent.functions.ts"
}, (opts) => saveSprixCredentials.__executeServer(opts));
var saveSprixCredentials = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => {
	if (!input.username.trim() || !input.password) throw new Error("بيانات تسجيل الدخول غير مكتملة.");
	if (input.username.length > 200 || input.password.length > 500) throw new Error("بيانات تسجيل الدخول غير صالحة.");
	return {
		username: input.username.trim(),
		password: input.password
	};
}).handler(saveSprixCredentials_createServerFn_handler, async ({ data, context }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	if (!await hasSprixAccess(context.userId)) throw new Error("SPRIX_PAYMENT_REQUIRED");
	const baseUrl = processModule.env["SPRIX_BASE_URL"] ?? "https://egy.app.spx-learning-square.com/dashboard";
	const { error: attemptError } = await supabaseAdmin.rpc("begin_sprix_binding_attempt", { _user_id: context.userId });
	if (attemptError) throw attemptError;
	const verification = await verifySprixCredentials({
		username: data.username,
		password: data.password,
		baseUrl
	});
	if (!verification.verified) throw new Error(verification.errorCode === "invalid_credentials" ? "بيانات SPRIX غير صحيحة." : "تعذر التحقق من تسجيل الدخول إلى SPRIX.");
	await supabaseAdmin.rpc("reset_sprix_binding_attempt", { _user_id: context.userId });
	const accountUsernameHash = hashSprixUsername(data.username);
	const { data: existing, error: existingError } = await supabaseAdmin.from("sprix_credentials").select("user_id,account_username_hash,verification_status").eq("user_id", context.userId).maybeSingle();
	if (existingError) throw existingError;
	if (existing?.verification_status === "verified" && existing.account_username_hash && existing.account_username_hash !== accountUsernameHash) throw new Error("SPRIX_ACCOUNT_REBIND_NOT_ALLOWED");
	const { data: owner, error: ownerError } = await supabaseAdmin.from("sprix_credentials").select("user_id").eq("account_username_hash", accountUsernameHash).neq("user_id", context.userId).maybeSingle();
	if (ownerError) throw ownerError;
	if (owner) throw new Error("SPRIX_ACCOUNT_ALREADY_BOUND");
	await upsertSprixCredential(context.userId, encryptSprixCredentials(data), accountUsernameHash);
	return {
		saved: true,
		verified: true
	};
});
var getMySprixCredentialStatus_createServerFn_handler = createServerRpc({
	id: "73cdc2b86874b90bd6fbc359294044e81401e768392f4eb3e338635853182d15",
	name: "getMySprixCredentialStatus",
	filename: "src/lib/sprix-agent.functions.ts"
}, (opts) => getMySprixCredentialStatus.__executeServer(opts));
var getMySprixCredentialStatus = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getMySprixCredentialStatus_createServerFn_handler, async ({ context }) => {
	const credential = await getSprixCredential(context.userId);
	return {
		verified: credential?.verification_status === "verified" && Boolean(credential.verified_at),
		verifiedAt: credential?.verified_at ?? null
	};
});
var createSprixAgentRun_createServerFn_handler = createServerRpc({
	id: "3e2fa6e6df61e958cc3443481f3495da86d3b21e1007e92e456c71f75635cd12",
	name: "createSprixAgentRun",
	filename: "src/lib/sprix-agent.functions.ts"
}, (opts) => createSprixAgentRun.__executeServer(opts));
var createSprixAgentRun = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSprixAgentRun_createServerFn_handler, async ({ context }) => {
	if (!await hasSprixAccess(context.userId)) throw new Error("SPRIX_PAYMENT_REQUIRED");
	const credential = await getSprixCredential(context.userId);
	if (!credential || credential.verification_status !== "verified" || !credential.verified_at) throw new Error("يجب التحقق من تسجيل الدخول إلى SPRIX أولاً.");
	const run = await createSprixRun(context.userId, credential.id);
	const claimedRunId = await claimNextSprixRun();
	if (claimedRunId === run.id) executeClaimedSprixRun(run.id);
	return {
		runId: run.id,
		status: claimedRunId === run.id ? "running" : run.status
	};
});
var getSprixAgentRun_createServerFn_handler = createServerRpc({
	id: "0b5e6b7c66da588a80457777a2097a9c698383feafe27fdf07b10dc0722063c3",
	name: "getSprixAgentRun",
	filename: "src/lib/sprix-agent.functions.ts"
}, (opts) => getSprixAgentRun.__executeServer(opts));
var getSprixAgentRun = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(getSprixAgentRun_createServerFn_handler, async ({ data, context }) => {
	return getSprixRunForUser(context.userId, data.runId);
});
var listMySprixAgentRuns_createServerFn_handler = createServerRpc({
	id: "6bea6fcc05dc912a368ea2a6eda7156e55e9f27429ce73f6c0f2f43d0d9eaca2",
	name: "listMySprixAgentRuns",
	filename: "src/lib/sprix-agent.functions.ts"
}, (opts) => listMySprixAgentRuns.__executeServer(opts));
var listMySprixAgentRuns = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(listMySprixAgentRuns_createServerFn_handler, async ({ context }) => listSprixRunsForUser(context.userId));
var cancelSprixAgentRun_createServerFn_handler = createServerRpc({
	id: "9a68af5444f9f04d740ac947d27a5156fdd29c2854234f51c8fb3b192aa096de",
	name: "cancelSprixAgentRun",
	filename: "src/lib/sprix-agent.functions.ts"
}, (opts) => cancelSprixAgentRun.__executeServer(opts));
var cancelSprixAgentRun = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(cancelSprixAgentRun_createServerFn_handler, async ({ data, context }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { data: run, error } = await supabaseAdmin.from("sprix_agent_runs").select("id,status").eq("id", data.runId).eq("user_id", context.userId).maybeSingle();
	if (error) throw error;
	if (!run) throw new Error("لم يتم العثور على المهمة.");
	if (![
		"queued",
		"paused",
		"running"
	].includes(run.status)) return { cancelled: false };
	const { error: updateError } = await supabaseAdmin.from("sprix_agent_runs").update({
		status: "cancelled",
		finished_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", data.runId).eq("user_id", context.userId);
	if (updateError) throw updateError;
	return { cancelled: true };
});
var adminListSprixQuestions_createServerFn_handler = createServerRpc({
	id: "fe6267f3693cbdceb69f8991fedd0a010c5ce6ef4ed7488a1cbd8d9e0ec2e4bd",
	name: "adminListSprixQuestions",
	filename: "src/lib/sprix-agent.functions.ts"
}, (opts) => adminListSprixQuestions.__executeServer(opts));
var adminListSprixQuestions = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(adminListSprixQuestions_createServerFn_handler, async () => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { data, error } = await supabaseAdmin.from("sprix_questions").select("id,platform,subject,question_text,options,correct_option_text,verification_status,verified_at,verified_by,created_at,updated_at").order("updated_at", { ascending: false }).limit(500);
	if (error) throw error;
	return data ?? [];
});
var adminSetSprixQuestionVerification_createServerFn_handler = createServerRpc({
	id: "d333b4a17ffb9d4bac1334fec2ca32ab6da403aba04ebe8c7021c330baaa06b8",
	name: "adminSetSprixQuestionVerification",
	filename: "src/lib/sprix-agent.functions.ts"
}, (opts) => adminSetSprixQuestionVerification.__executeServer(opts));
var adminSetSprixQuestionVerification = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminSetSprixQuestionVerification_createServerFn_handler, async ({ data, context }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const patch = {
		verification_status: data.status,
		correct_option_text: data.correctOptionText ?? null,
		verified_at: data.status === "verified" ? (/* @__PURE__ */ new Date()).toISOString() : null,
		verified_by: data.status === "verified" ? context.adminId : null
	};
	const { data: row, error } = await supabaseAdmin.from("sprix_questions").update(patch).eq("id", data.questionId).select("*").single();
	if (error) throw error;
	await supabaseAdmin.from("admin_audit_logs").insert({
		admin_id: context.adminId,
		action: "sprix_question_verification",
		metadata: {
			question_id: data.questionId,
			status: data.status
		}
	});
	return row;
});
var adminListSprixRuns_createServerFn_handler = createServerRpc({
	id: "69f6670bf4566e8321d35ba4ff1eed16afd59e2cefcc93cf14e32868858e583f",
	name: "adminListSprixRuns",
	filename: "src/lib/sprix-agent.functions.ts"
}, (opts) => adminListSprixRuns.__executeServer(opts));
var adminListSprixRuns = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(adminListSprixRuns_createServerFn_handler, async () => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { data, error } = await supabaseAdmin.from("sprix_agent_runs").select("id,user_id,status,questions_processed,questions_completed,unresolved_questions,error_code,error_message_safe,started_at,finished_at,last_activity_at,created_at").order("created_at", { ascending: false }).limit(200);
	if (error) throw error;
	return data ?? [];
});
var adminClaimAndRunNextSprixJob_createServerFn_handler = createServerRpc({
	id: "9b00ddbb0f8f626bb02d55f6eb732e62a9da94ff611316786d40083af020f28d",
	name: "adminClaimAndRunNextSprixJob",
	filename: "src/lib/sprix-agent.functions.ts"
}, (opts) => adminClaimAndRunNextSprixJob.__executeServer(opts));
var adminClaimAndRunNextSprixJob = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).handler(adminClaimAndRunNextSprixJob_createServerFn_handler, async () => {
	const runId = await claimNextSprixRun();
	if (!runId) return {
		claimed: false,
		runId: null
	};
	await executeClaimedSprixRun(runId);
	return {
		claimed: true,
		runId
	};
});
var getSprixPaymentOptionsFn_createServerFn_handler = createServerRpc({
	id: "ee02f55ae6572aeace10f78b5677c00716ad801b2a560f42042ab52169578abb",
	name: "getSprixPaymentOptionsFn",
	filename: "src/lib/sprix-agent.functions.ts"
}, (opts) => getSprixPaymentOptionsFn.__executeServer(opts));
var getSprixPaymentOptionsFn = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getSprixPaymentOptionsFn_createServerFn_handler, async () => getSprixPaymentOptions());
var submitSprixPayment_createServerFn_handler = createServerRpc({
	id: "db72eef589297bf3de6e6e8593aa5009bce681663902903775b35a02265110cd",
	name: "submitSprixPayment",
	filename: "src/lib/sprix-agent.functions.ts"
}, (opts) => submitSprixPayment.__executeServer(opts));
var submitSprixPayment = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(submitSprixPayment_createServerFn_handler, async ({ data, context }) => {
	return createSprixPaymentRequest({
		userId: context.userId,
		method: data.method,
		senderNumber: data.senderNumber,
		screenshotPath: data.screenshotPath
	});
});
var listMySprixPayments_createServerFn_handler = createServerRpc({
	id: "0bcd1eaf2e5301c7840435120b55c52c8069603e6c167a6462c891ac79f92c7f",
	name: "listMySprixPayments",
	filename: "src/lib/sprix-agent.functions.ts"
}, (opts) => listMySprixPayments.__executeServer(opts));
var listMySprixPayments = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(listMySprixPayments_createServerFn_handler, async ({ context }) => listMySprixPaymentRequests(context.userId));
var getMySprixAccess_createServerFn_handler = createServerRpc({
	id: "c2abf42f6896d5ced8e89834ffcaba1a7c08fc42ceadd4128c8e767a50abbc82",
	name: "getMySprixAccess",
	filename: "src/lib/sprix-agent.functions.ts"
}, (opts) => getMySprixAccess.__executeServer(opts));
var getMySprixAccess = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getMySprixAccess_createServerFn_handler, async ({ context }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { data, error } = await supabaseAdmin.from("sprix_agent_access").select("active,expires_at,source_type").eq("user_id", context.userId).maybeSingle();
	if (error) throw error;
	return {
		active: data?.active === true && (!data.expires_at || new Date(data.expires_at).getTime() > Date.now()),
		expiresAt: data?.expires_at ?? null,
		sourceType: data?.source_type ?? null
	};
});
var adminListSprixPayments_createServerFn_handler = createServerRpc({
	id: "85d5bc3fded16b19862db4b315c34ab56552c0951e275aa68bdb380787558e7e",
	name: "adminListSprixPayments",
	filename: "src/lib/sprix-agent.functions.ts"
}, (opts) => adminListSprixPayments.__executeServer(opts));
var adminListSprixPayments = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminListSprixPayments_createServerFn_handler, async ({ data }) => adminListSprixPaymentRequests(data.status));
var adminReviewSprixPaymentRequest_createServerFn_handler = createServerRpc({
	id: "e8fe93c2a7d4bb880c48a0bb0fd35ee605c973fdae2b4cec5922b79a4cf1103a",
	name: "adminReviewSprixPaymentRequest",
	filename: "src/lib/sprix-agent.functions.ts"
}, (opts) => adminReviewSprixPaymentRequest.__executeServer(opts));
var adminReviewSprixPaymentRequest = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminReviewSprixPaymentRequest_createServerFn_handler, async ({ data, context }) => adminReviewSprixPayment({
	...data,
	adminId: context.adminId
}));
var adminGetSprixPaymentProofUrl_createServerFn_handler = createServerRpc({
	id: "9deda1feaa4bf07392129ccf7c0adae35cfb323cf00fa446fe37814cb751d8bc",
	name: "adminGetSprixPaymentProofUrl",
	filename: "src/lib/sprix-agent.functions.ts"
}, (opts) => adminGetSprixPaymentProofUrl.__executeServer(opts));
var adminGetSprixPaymentProofUrl = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input) => input).handler(adminGetSprixPaymentProofUrl_createServerFn_handler, async ({ data }) => ({ url: await createSprixPaymentProofSignedUrl(data.path) }));
//#endregion
export { adminClaimAndRunNextSprixJob_createServerFn_handler, adminGetSprixPaymentProofUrl_createServerFn_handler, adminListSprixPayments_createServerFn_handler, adminListSprixQuestions_createServerFn_handler, adminListSprixRuns_createServerFn_handler, adminReviewSprixPaymentRequest_createServerFn_handler, adminSetSprixQuestionVerification_createServerFn_handler, cancelSprixAgentRun_createServerFn_handler, createSprixAgentRun_createServerFn_handler, getMySprixAccess_createServerFn_handler, getMySprixCredentialStatus_createServerFn_handler, getSprixAgentRun_createServerFn_handler, getSprixPaymentOptionsFn_createServerFn_handler, listMySprixAgentRuns_createServerFn_handler, listMySprixPayments_createServerFn_handler, saveSprixCredentials_createServerFn_handler, submitSprixPayment_createServerFn_handler };
