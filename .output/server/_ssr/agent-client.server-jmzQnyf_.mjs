import { t as AiProviderError } from "./registry.server-BFAt_VVY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/agent-client.server-jmzQnyf_.js
/**
* The only TypeScript -> Python Agent gateway.
*
* Browser code must never import this module. It is intentionally server-only
* and requires a server-side shared secret. The Python Agent is the only
* component allowed to hold OPENAI_API_KEY.
*/
var DEFAULT_TIMEOUT_MS = 75e3;
function agentUrl() {
	return (process.env["WISO_AGENT_URL"] ?? "http://127.0.0.1:8000").replace(/\/$/, "");
}
function agentSecret() {
	const secret = process.env["WISO_AGENT_SECRET"];
	if (!secret) throw new Error("WISO_AGENT_SECRET is not configured on the server.");
	return secret;
}
async function callWisoAgent(input) {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
	try {
		const response = await fetch(`${agentUrl()}/v1/generate`, {
			method: "POST",
			headers: {
				"content-type": "application/json",
				authorization: `Bearer ${agentSecret()}`
			},
			body: JSON.stringify({
				request_id: input.requestId,
				task_type: input.taskType,
				tier: input.tier,
				model: input.model,
				messages: input.request.messages,
				attachments: input.request.attachments?.map((attachment) => ({
					mime_type: attachment.mimeType,
					data_base64: attachment.dataBase64,
					name: attachment.name
				})),
				temperature: input.request.temperature,
				max_tokens: input.request.maxTokens,
				json_schema: input.request.jsonSchema ? {
					name: input.request.jsonSchema.name,
					schema: input.request.jsonSchema.schema
				} : null
			}),
			signal: controller.signal
		});
		const body = await response.text();
		if (!response.ok) throw new AiProviderError(`WISO Agent request failed (${response.status}): ${body.slice(0, 500)}`, "openai", response.status);
		const payload = JSON.parse(body);
		if (payload.request_id !== input.requestId || typeof payload.text !== "string") throw new AiProviderError("WISO Agent returned an invalid response contract.", "openai");
		return {
			text: payload.text,
			tokensUsed: Number(payload.total_tokens) || 0,
			inputTokens: Number(payload.input_tokens) || 0,
			outputTokens: Number(payload.output_tokens) || 0
		};
	} catch (error) {
		if (error instanceof AiProviderError) throw error;
		if (error instanceof Error && error.name === "AbortError") throw new AiProviderError("WISO Agent request timed out.", "openai", 504);
		throw new AiProviderError(`WISO Agent transport error: ${error instanceof Error ? error.message : String(error)}`, "openai");
	} finally {
		clearTimeout(timeout);
	}
}
//#endregion
export { callWisoAgent };
