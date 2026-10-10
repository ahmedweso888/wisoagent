import { i as resolveAiConfig, n as createProvider } from "./registry.server-BFAt_VVY.mjs";
import { randomUUID } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/runtime.server-CTv0BXmm.js
var TIER_MODEL_MAP = {
	luna: "openai/gpt-5.6-luna",
	terra: "openai/gpt-5.6-terra",
	sol: "openai/gpt-5.6-sol"
};
var ENGINE_CONFIG = {
	batchSize: 5,
	maxTerraRetries: 1,
	maxSolRetries: 1,
	duplicateSimilarityThreshold: .85,
	duplicateExactHash: true,
	requestTimeoutMs: 75e3,
	maxReplacementRounds: 8
};
var SOL_DIRECT_DIFFICULTIES = /* @__PURE__ */ new Set(["very_hard", "nightmare"]);
var TERRA_DIFFICULTIES = /* @__PURE__ */ new Set([
	"basic",
	"medium",
	"hard"
]);
var BULK_TASK_TYPES = /* @__PURE__ */ new Set(["curriculum_analysis", "concept_extraction"]);
var TERRA_TASK_TYPES = /* @__PURE__ */ new Set([
	"question_generation",
	"question_validation",
	"study_planning",
	"study_plan_redesign",
	"performance_analysis",
	"mistake_analysis",
	"mastery_analysis",
	"similarity_analysis"
]);
/** One server-side routing decision point. No caller can select a model. */
function routeTask(input) {
	if (input.bulk || BULK_TASK_TYPES.has(input.taskType)) return {
		tier: "luna",
		model: TIER_MODEL_MAP.luna,
		routingReason: "bulk_preprocessing"
	};
	if (input.difficulty && SOL_DIRECT_DIFFICULTIES.has(input.difficulty)) return {
		tier: "sol",
		model: TIER_MODEL_MAP.sol,
		routingReason: "extreme_difficulty_direct_sol"
	};
	if (input.difficulty && TERRA_DIFFICULTIES.has(input.difficulty)) return {
		tier: "terra",
		model: TIER_MODEL_MAP.terra,
		routingReason: "standard_difficulty_terra"
	};
	if (TERRA_TASK_TYPES.has(input.taskType)) return {
		tier: "terra",
		model: TIER_MODEL_MAP.terra,
		routingReason: "standard_educational_task"
	};
	return {
		tier: "terra",
		model: TIER_MODEL_MAP.terra,
		routingReason: "default_terra"
	};
}
/**
* WISO Request ID generator and structured logging.
*
* Every AI operation gets a unique request ID for observability.
* Structured logs go to console (picked up by the error-capture pipeline).
*/
function generateRequestId() {
	return `wiso_${randomUUID()}`;
}
/** Structured log — never logs secrets, API keys, or auth tokens. */
function logAiEvent(context) {
	const entry = Object.entries(context).filter(([, v]) => v !== void 0 && v !== null).map(([k, v]) => `${k}=${v}`).join(" ");
	const level = context.status === "error" ? "error" : "info";
	const prefix = `[wiso:${context.requestId?.slice(0, 12) ?? "unknown"}]`;
	if (level === "error") console.error(`${prefix} ${entry}`);
	else console.log(`${prefix} ${entry}`);
}
async function loadSettings() {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { data } = await supabaseAdmin.from("ai_settings").select("provider, model, temperature, max_tokens, fallback_enabled, fallback_provider, enabled, auto_routing_enabled").maybeSingle();
	return data ?? null;
}
async function getActiveConfig() {
	const settings = await loadSettings();
	return {
		config: resolveAiConfig(settings),
		enabled: settings?.enabled ?? true,
		autoRoutingEnabled: settings?.auto_routing_enabled ?? true
	};
}
async function logUsage(entry) {
	try {
		const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
		await supabaseAdmin.from("ai_usage_logs").insert({
			user_id: entry.userId,
			agent: entry.agent,
			provider: entry.provider,
			model: entry.model,
			tokens_used: entry.tokensUsed,
			latency_ms: entry.latencyMs,
			input_tokens: entry.inputTokens ?? null,
			output_tokens: entry.outputTokens ?? null,
			questions_generated: entry.questionsGenerated ?? 0,
			documents_analyzed: entry.documentsAnalyzed ?? 0,
			images_analyzed: entry.imagesAnalyzed ?? 0,
			status: entry.status,
			error: entry.error ?? null,
			...entry.tier ? { tier: entry.tier } : {},
			...entry.requestId ? { request_id: entry.requestId } : {},
			questions_approved: entry.questionsApproved ?? 0,
			questions_rejected: entry.questionsRejected ?? 0,
			retries: entry.retries ?? 0,
			escalations: entry.escalations ?? 0
		});
	} catch (error) {
		console.error("[ai] usage logging failed", error);
	}
}
/**
* Runs one structured task against the active provider, with optional failover.
* Never creates cost on a provider unless fallback is explicitly enabled.
*
* When auto-routing is enabled, the WISO router selects the tier and model
* based on task type and difficulty. When disabled, uses the configured model.
*/
async function runStructuredTask(options) {
	const { config, enabled } = await getActiveConfig();
	if (!enabled) throw new Error("AI is disabled by the administrator.");
	const requestId = options.requestId ?? generateRequestId();
	const routing = routeTask({
		taskType: options.agent,
		difficulty: options.difficulty,
		bulk: options.bulk
	});
	const tier = routing.tier;
	const model = routing.model;
	logAiEvent({
		requestId,
		userId: options.userId,
		taskType: options.agent,
		tier,
		model,
		status: "starting"
	});
	const order = [config.provider];
	let lastError;
	for (const id of order) {
		const provider = createProvider(id, {
			...config,
			model
		});
		if (!provider.isConfigured()) {
			lastError = /* @__PURE__ */ new Error(`Provider "${id}" is not configured.`);
			continue;
		}
		try {
			const result = await provider.generateStructuredOutput({
				messages: [{
					role: "system",
					content: options.call.system
				}, {
					role: "user",
					content: options.call.user
				}],
				...options.call.attachments ? { attachments: options.call.attachments } : {},
				schemaName: options.call.schemaName,
				jsonSchema: options.call.jsonSchema,
				requestId,
				taskType: options.agent,
				tier
			});
			await logUsage({
				userId: options.userId,
				agent: options.agent,
				provider: result.usage.provider,
				model: result.usage.model,
				tokensUsed: result.usage.tokensUsed,
				latencyMs: result.usage.latencyMs,
				inputTokens: result.usage.inputTokens,
				outputTokens: result.usage.outputTokens,
				status: "ok",
				tier,
				requestId,
				...options.counts ?? {}
			});
			return result.data;
		} catch (error) {
			lastError = error;
			await logUsage({
				userId: options.userId,
				agent: options.agent,
				provider: id,
				model,
				tokensUsed: 0,
				latencyMs: 0,
				status: "error",
				error: error instanceof Error ? error.message : String(error),
				tier,
				requestId
			});
		}
	}
	throw lastError instanceof Error ? lastError : /* @__PURE__ */ new Error("AI request failed");
}
//#endregion
export { TIER_MODEL_MAP as a, getActiveConfig, ENGINE_CONFIG as i, logAiEvent as n, routeTask as r, runStructuredTask, generateRequestId as t };
