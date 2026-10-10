/**
 * WISO's single provider adapter.
 *
 * This adapter deliberately does NOT hold or call the OpenAI API. It forwards
 * structured requests to the authenticated Python Agent gateway, which is the
 * only production component allowed to hold OPENAI_API_KEY.
 */
import { BaseProviderAdapter, type ChatRequest, type ChatResponse } from "./base.server";
import type { ProviderId } from "./types";

export class OpenAIProvider extends BaseProviderAdapter {
  readonly id: ProviderId = "openai";

  isConfigured() {
    return Boolean(process.env["WISO_AGENT_URL"] && process.env["WISO_AGENT_SECRET"]);
  }

  configurationNote() {
    if (this.isConfigured()) return "WISO Python Agent gateway (server configured)";
    return "WISO Python Agent gateway is not configured";
  }

  protected async chat(request: ChatRequest): Promise<ChatResponse> {
    const { callWisoAgent } = await import("../engine/agent-client.server");
    const tier =
      request.tier ??
      (request.model.includes("luna") ? "luna" : request.model.includes("sol") ? "sol" : "terra");
    return callWisoAgent({
      requestId: request.requestId ?? `wiso_${crypto.randomUUID()}`,
      taskType: request.taskType ?? "unknown",
      tier,
      model: request.model,
      request,
    });
  }
}
