import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { n as requireSupabaseAuth } from "./auth-middleware-BgIfV4zI.mjs";
import { t as createSsrRpc } from "./createSsrRpc-lwvUPFNu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/referral.functions-B-2VJlXX.js
function validCode(value) {
	const code = value.trim().toUpperCase();
	if (!/^REF-[A-F0-9]{24}$/.test(code)) throw new Error("invalid_referral_code");
	return code;
}
var recordReferralVisit = createServerFn({ method: "POST" }).inputValidator((input) => input).handler(createSsrRpc("f73435c13c806aa3e4106c7c4b94f9337b7c5bf2a75eadbbad53bfc6f8288ca3"));
var captureReferralAttribution = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => ({ code: validCode(input.code) })).handler(createSsrRpc("7ca6695471ae7eb288815cfa0b4dd508dc245a25d0d8341fbd57bd2b1245be44"));
var getMyReferralStats = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("aebe00bc31315ea43d6e77b03903f4167a46a787cf18a81839a4699083611319"));
//#endregion
export { getMyReferralStats as n, recordReferralVisit as r, captureReferralAttribution as t };
