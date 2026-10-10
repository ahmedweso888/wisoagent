import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const createWisoPaymentRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      planId: string;
      method: "vodafone_cash" | "instapay";
      senderNumber: string;
      transactionNumber?: string;
      screenshotPath?: string | null;
    }) => {
      if (!input.planId || !input.senderNumber.trim()) {
        throw new Error("بيانات الدفع غير مكتملة.");
      }
      return input;
    },
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: plan, error: planError } = await supabaseAdmin
      .from("subscription_plans")
      .select("id,price_egp,is_active")
      .eq("id", data.planId)
      .maybeSingle();

    if (planError) throw planError;
    if (!plan?.is_active) throw new Error("الباقة غير متاحة حاليًا.");

    const screenshotPath = data.screenshotPath?.trim() || null;
    if (screenshotPath && !screenshotPath.startsWith(`${context.userId}/`)) {
      throw new Error("INVALID_PAYMENT_PROOF_PATH");
    }

    const { data: row, error } = await supabaseAdmin
      .from("payment_requests")
      .insert({
        user_id: context.userId,
        plan_id: plan.id,
        amount_egp: Number(plan.price_egp),
        method: data.method,
        sender_number: data.senderNumber.trim(),
        transaction_number: data.transactionNumber?.trim() || null,
        screenshot_path: screenshotPath,
      })
      .select("id,status,plan_id,amount_egp,created_at")
      .single();

    if (error) throw error;
    return row;
  });
