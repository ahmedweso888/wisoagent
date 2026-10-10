import { l as createServerFn } from "./createServerFn-yTfeHp1H.mjs";
import { n as requireSupabaseAuth } from "./auth-middleware-BogctHY4.mjs";
import { t as createServerRpc } from "./createServerRpc-D228ng_7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/referral.functions-D21KeTCP.js
async function hashVisitorKey(value) {
	const { createHash } = await import("node:crypto");
	return createHash("sha256").update(value, "utf8").digest("hex");
}
function validCode(value) {
	const code = value.trim().toUpperCase();
	if (!/^REF-[A-F0-9]{24}$/.test(code)) throw new Error("invalid_referral_code");
	return code;
}
var recordReferralVisit_createServerFn_handler = createServerRpc({
	id: "f73435c13c806aa3e4106c7c4b94f9337b7c5bf2a75eadbbad53bfc6f8288ca3",
	name: "recordReferralVisit",
	filename: "src/lib/referral.functions.ts"
}, (opts) => recordReferralVisit.__executeServer(opts));
var recordReferralVisit = createServerFn({ method: "POST" }).inputValidator((input) => input).handler(recordReferralVisit_createServerFn_handler, async ({ data }) => {
	const code = validCode(data.code);
	if (!data.visitorKey || data.visitorKey.length > 200) return { recorded: false };
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { data: link, error: linkError } = await supabaseAdmin.from("referral_links").select("id").eq("code", code).maybeSingle();
	if (linkError) throw linkError;
	if (!link) return { recorded: false };
	const visitorHash = await hashVisitorKey(data.visitorKey);
	const { error } = await supabaseAdmin.from("referral_visits").upsert({
		referral_link_id: link.id,
		visitor_key_hash: visitorHash,
		last_seen_at: (/* @__PURE__ */ new Date()).toISOString()
	}, { onConflict: "referral_link_id,visitor_key_hash" });
	if (error) throw error;
	return { recorded: true };
});
var captureReferralAttribution_createServerFn_handler = createServerRpc({
	id: "7ca6695471ae7eb288815cfa0b4dd508dc245a25d0d8341fbd57bd2b1245be44",
	name: "captureReferralAttribution",
	filename: "src/lib/referral.functions.ts"
}, (opts) => captureReferralAttribution.__executeServer(opts));
var captureReferralAttribution = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => ({ code: validCode(input.code) })).handler(captureReferralAttribution_createServerFn_handler, async ({ data }) => {
	const { data: result, error } = await (await import("./user-client.server-Bgk04puY.mjs").then((n) => n.n)).getUserSupabase().rpc("capture_referral_attribution", { _code: data.code });
	if (error) throw error;
	return result;
});
var getMyReferralStats_createServerFn_handler = createServerRpc({
	id: "aebe00bc31315ea43d6e77b03903f4167a46a787cf18a81839a4699083611319",
	name: "getMyReferralStats",
	filename: "src/lib/referral.functions.ts"
}, (opts) => getMyReferralStats.__executeServer(opts));
var getMyReferralStats = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getMyReferralStats_createServerFn_handler, async ({ context }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { data: link, error: linkError } = await supabaseAdmin.rpc("get_or_create_referral_link", { _user_id: context.userId });
	if (linkError) throw linkError;
	const referralLink = link;
	const [visits, attributions, rewards, wallet] = await Promise.all([
		supabaseAdmin.from("referral_visits").select("id", {
			count: "exact",
			head: true
		}).eq("referral_link_id", referralLink.id),
		supabaseAdmin.from("referral_attributions").select("id", {
			count: "exact",
			head: true
		}).eq("referrer_user_id", context.userId),
		supabaseAdmin.from("referral_rewards").select("reward_amount_egp").eq("referrer_user_id", context.userId),
		supabaseAdmin.from("student_wallets").select("cash_balance_egp").eq("user_id", context.userId).maybeSingle()
	]);
	const firstError = [
		visits,
		attributions,
		rewards,
		wallet
	].find((r) => r.error)?.error;
	if (firstError) throw firstError;
	const rewardRows = rewards.data ?? [];
	const totalRewards = rewardRows.reduce((sum, row) => sum + Number(row.reward_amount_egp ?? 0), 0);
	return {
		code: referralLink.code,
		link: `/invite/${referralLink.code}`,
		visits: visits.count ?? 0,
		referredUsers: attributions.count ?? 0,
		paidSubscriptions: rewardRows.length,
		totalRewards,
		walletBalance: Number(wallet.data?.cash_balance_egp ?? 0)
	};
});
//#endregion
export { captureReferralAttribution_createServerFn_handler, getMyReferralStats_createServerFn_handler, recordReferralVisit_createServerFn_handler };
