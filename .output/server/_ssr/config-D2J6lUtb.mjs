//#region node_modules/.nitro/vite/services/ssr/assets/config-D2J6lUtb.js
/** The single WISO default model. */
var WISO_DEFAULT_MODEL = "openai/gpt-5.6-sol";
var DEFAULT_MODELS = { openai: WISO_DEFAULT_MODEL };
/** Every model id WISO is allowed to run. */
var SUPPORTED_MODEL_IDS = { openai: [
	{
		id: "openai/gpt-5.6-sol",
		label: "GPT-5.6 Sol — الأقوى"
	},
	{
		id: "openai/gpt-5.6-terra",
		label: "GPT-5.6 Terra — متوازن"
	},
	{
		id: "openai/gpt-5.6-luna",
		label: "GPT-5.6 Luna — سريع واقتصادي"
	}
] }.openai.map((m) => m.id);
function normalizeModelId(model) {
	if (!model) return WISO_DEFAULT_MODEL;
	const withVendor = model.includes("/") ? model : `openai/${model}`;
	return SUPPORTED_MODEL_IDS.includes(withVendor) ? withVendor : WISO_DEFAULT_MODEL;
}
var AI_CONFIG_DEFAULTS = {
	temperature: 1,
	maxTokens: 4096
};
var PROVIDER_LABELS = { openai: "WISO AI (GPT-5.6)" };
//#endregion
export { normalizeModelId as i, DEFAULT_MODELS as n, PROVIDER_LABELS as r, AI_CONFIG_DEFAULTS as t };
