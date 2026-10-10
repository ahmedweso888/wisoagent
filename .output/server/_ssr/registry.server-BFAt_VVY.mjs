import { r as __exportAll } from "../_runtime.mjs";
import { i as normalizeModelId, n as DEFAULT_MODELS, t as AI_CONFIG_DEFAULTS } from "./config-D2J6lUtb.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
import processModule from "node:process";
//#region node_modules/.nitro/vite/services/ssr/assets/registry.server-BFAt_VVY.js
var registry_server_BFAt_VVY_exports = /* @__PURE__ */ __exportAll({
	i: () => AiProviderError,
	n: () => registry_server_exports,
	r: () => resolveAiConfig,
	t: () => createProvider
});
var PROVIDER_IDS = ["openai"];
var AiProviderError = class extends Error {
	provider;
	status;
	constructor(message, provider, status) {
		super(message);
		this.provider = provider;
		this.status = status;
		this.name = "AiProviderError";
	}
};
function extractJson(text) {
	const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
	try {
		return JSON.parse(cleaned);
	} catch {
		const first = cleaned.search(/[[{]/);
		const last = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
		if (first >= 0 && last > first) return JSON.parse(cleaned.slice(first, last + 1));
		throw new Error("Provider did not return parsable JSON");
	}
}
var BaseProviderAdapter = class {
	defaults;
	constructor(defaults) {
		this.defaults = defaults;
	}
	assertConfigured() {
		if (!this.isConfigured()) throw new AiProviderError(`Provider "${this.id}" is not configured on the server.`, this.id);
	}
	resolve(input) {
		return {
			model: input.model ?? this.defaults.model,
			temperature: input.temperature ?? this.defaults.temperature,
			maxTokens: input.maxTokens ?? this.defaults.maxTokens
		};
	}
	async generateText(input) {
		this.assertConfigured();
		const resolved = this.resolve(input);
		const startedAt = Date.now();
		const response = await this.chat({
			messages: input.messages,
			...input.attachments ? { attachments: input.attachments } : {},
			...resolved,
			...input.requestId ? { requestId: input.requestId } : {},
			...input.taskType ? { taskType: input.taskType } : {},
			...input.tier ? { tier: input.tier } : {}
		});
		return {
			text: response.text,
			usage: {
				provider: this.id,
				model: resolved.model,
				tokensUsed: response.tokensUsed,
				...response.inputTokens === void 0 ? {} : { inputTokens: response.inputTokens },
				...response.outputTokens === void 0 ? {} : { outputTokens: response.outputTokens },
				latencyMs: Date.now() - startedAt
			}
		};
	}
	async generateStructuredOutput(input) {
		this.assertConfigured();
		const resolved = this.resolve(input);
		const startedAt = Date.now();
		const response = await this.chat({
			messages: input.messages,
			...input.attachments ? { attachments: input.attachments } : {},
			...resolved,
			jsonSchema: {
				name: input.schemaName,
				schema: input.jsonSchema
			},
			...input.requestId ? { requestId: input.requestId } : {},
			...input.taskType ? { taskType: input.taskType } : {},
			...input.tier ? { tier: input.tier } : {}
		});
		return {
			data: extractJson(response.text),
			usage: {
				provider: this.id,
				model: resolved.model,
				tokensUsed: response.tokensUsed,
				...response.inputTokens === void 0 ? {} : { inputTokens: response.inputTokens },
				...response.outputTokens === void 0 ? {} : { outputTokens: response.outputTokens },
				latencyMs: Date.now() - startedAt
			}
		};
	}
	analyzeImage(input) {
		return this.analyzeAttachments(input);
	}
	analyzeDocument(input) {
		return this.analyzeAttachments(input);
	}
	analyzeAttachments(input) {
		return this.generateStructuredOutput({
			messages: [{
				role: "user",
				content: input.instruction
			}],
			attachments: input.attachments,
			schemaName: input.schemaName,
			jsonSchema: input.jsonSchema,
			...input.model ? { model: input.model } : {},
			...input.temperature !== void 0 ? { temperature: input.temperature } : {},
			...input.maxTokens !== void 0 ? { maxTokens: input.maxTokens } : {}
		});
	}
	generateQuestions(input) {
		return this.generateStructuredOutput(input);
	}
	validateQuestion(input) {
		return this.generateStructuredOutput(input);
	}
};
/**
* WISO's single provider adapter.
*
* This adapter deliberately does NOT hold or call the OpenAI API. It forwards
* structured requests to the authenticated Python Agent gateway, which is the
* only production component allowed to hold OPENAI_API_KEY.
*/
var OpenAIProvider = class extends BaseProviderAdapter {
	id = "openai";
	isConfigured() {
		return Boolean(processModule.env["WISO_AGENT_URL"] && processModule.env["WISO_AGENT_SECRET"]);
	}
	configurationNote() {
		if (this.isConfigured()) return "WISO Python Agent gateway (server configured)";
		return "WISO Python Agent gateway is not configured";
	}
	async chat(request) {
		const { callWisoAgent } = await import("./agent-client.server-jmzQnyf_.mjs");
		const tier = request.tier ?? (request.model.includes("luna") ? "luna" : request.model.includes("sol") ? "sol" : "terra");
		return callWisoAgent({
			requestId: request.requestId ?? `wiso_${crypto.randomUUID()}`,
			taskType: request.taskType ?? "unknown",
			tier,
			model: request.model,
			request
		});
	}
};
/**
* Provider registry + active-config resolution.
*
* WISO has ONE AI foundation (the GPT-5.6 family behind the managed gateway).
* Resolution order for the model: admin AI settings row (database) ->
* environment (WISO_AI_MODEL / OPENAI_MODEL) -> code default. Any legacy value
* (Gemini/Anthropic/Model A/Model B) is normalized to the WISO default.
* API keys are read from the server environment ONLY and never leave this layer.
*/
var registry_server_exports = /* @__PURE__ */ __exportAll$1({
	createProvider: () => createProvider,
	envProvider: () => envProvider,
	providerStatuses: () => providerStatuses,
	resolveAiConfig: () => resolveAiConfig
});
function envProvider() {
	return "openai";
}
function envModel() {
	return processModule.env["WISO_AI_MODEL"] || processModule.env["OPENAI_MODEL"] || void 0;
}
function resolveAiConfig(settings) {
	const provider = envProvider();
	return {
		provider,
		model: normalizeModelId(envModel() || DEFAULT_MODELS[provider]),
		temperature: settings ? Number(settings.temperature) : AI_CONFIG_DEFAULTS.temperature,
		maxTokens: settings?.max_tokens ?? AI_CONFIG_DEFAULTS.maxTokens,
		fallbackEnabled: false,
		fallbackProvider: null
	};
}
function createProvider(_id, config) {
	return new OpenAIProvider({
		model: config.model,
		temperature: config.temperature,
		maxTokens: config.maxTokens
	});
}
function providerStatuses(config) {
	return PROVIDER_IDS.map((id) => {
		const provider = createProvider(id, config);
		return {
			id,
			configured: provider.isConfigured(),
			note: provider.configurationNote(),
			active: true
		};
	});
}
//#endregion
export { resolveAiConfig as i, createProvider as n, registry_server_BFAt_VVY_exports as r, AiProviderError as t };
