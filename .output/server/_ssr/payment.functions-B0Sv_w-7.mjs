import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { n as requireSupabaseAuth } from "./auth-middleware-BgIfV4zI.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/payment.functions-B0Sv_w-7.js
var createWisoPaymentRequest_createServerFn_handler = createServerRpc({
	id: "187ef4ab2a3c69ceb5f492ce8252d901a84b2b765d497e1af1571adad43d495c",
	name: "createWisoPaymentRequest",
	filename: "src/lib/payment.functions.ts"
}, (opts) => createWisoPaymentRequest.__executeServer(opts));
var createWisoPaymentRequest = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => {
	if (!input.planId || !input.senderNumber.trim()) throw new Error("بيانات الدفع غير مكتملة.");
	return input;
}).handler(createWisoPaymentRequest_createServerFn_handler, async ({ data, context }) => {
	const { supabaseAdmin } = await import("./client.server-BlnvGJA3.mjs").then((n) => n.t).then((n) => n.t);
	const { data: plan, error: planError } = await supabaseAdmin.from("subscription_plans").select("id,price_egp,is_active").eq("id", data.planId).maybeSingle();
	if (planError) throw planError;
	if (!plan?.is_active) throw new Error("الباقة غير متاحة حاليًا.");
	const screenshotPath = data.screenshotPath?.trim() || null;
	if (screenshotPath && !screenshotPath.startsWith(`${context.userId}/`)) throw new Error("INVALID_PAYMENT_PROOF_PATH");
	const { data: row, error } = await supabaseAdmin.from("payment_requests").insert({
		user_id: context.userId,
		plan_id: plan.id,
		amount_egp: Number(plan.price_egp),
		method: data.method,
		sender_number: data.senderNumber.trim(),
		transaction_number: data.transactionNumber?.trim() || null,
		screenshot_path: screenshotPath
	}).select("id,status,plan_id,amount_egp,created_at").single();
	if (error) throw error;
	return row;
});
//#endregion
export { createWisoPaymentRequest_createServerFn_handler };
