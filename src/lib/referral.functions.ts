import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function hashVisitorKey(value: string): Promise<string> {
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function validCode(value: string): string {
  const code = value.trim().toUpperCase();
  if (!/^REF-[A-F0-9]{24}$/.test(code)) throw new Error("invalid_referral_code");
  return code;
}

export const recordReferralVisit = createServerFn({ method: "POST" })
  .inputValidator((input: { code: string; visitorKey: string }) => input)
  .handler(async ({ data }) => {
    const code = validCode(data.code);
    if (!data.visitorKey || data.visitorKey.length > 200) return { recorded: false };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: link, error: linkError } = await supabaseAdmin
      .from("referral_links")
      .select("id")
      .eq("code", code)
      .maybeSingle();
    if (linkError) throw linkError;
    if (!link) return { recorded: false };

    const visitorHash = await hashVisitorKey(data.visitorKey);
    const { error } = await supabaseAdmin
      .from("referral_visits")
      .upsert(
        {
          referral_link_id: link.id,
          visitor_key_hash: visitorHash,
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: "referral_link_id,visitor_key_hash" },
      );
    if (error) throw error;

    return { recorded: true };
  });

export const captureReferralAttribution = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { code: string }) => ({ code: validCode(input.code) }))
  .handler(async ({ data }) => {
    const { data: result, error } = await (await import(
      "@/integrations/supabase/user-client.server"
    )).getUserSupabase().rpc("capture_referral_attribution", {
      _code: data.code,
    });
    if (error) throw error;
    return result;
  });

export const getMyReferralStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: link, error: linkError } = await supabaseAdmin
      .rpc("get_or_create_referral_link", { _user_id: context.userId });
    if (linkError) throw linkError;

    const referralLink = link as {
      id: string;
      code: string;
      referrer_user_id: string;
    };

    const [visits, attributions, rewards, wallet] = await Promise.all([
      supabaseAdmin
        .from("referral_visits")
        .select("id", { count: "exact", head: true })
        .eq("referral_link_id", referralLink.id),
      supabaseAdmin
        .from("referral_attributions")
        .select("id", { count: "exact", head: true })
        .eq("referrer_user_id", context.userId),
      supabaseAdmin
        .from("referral_rewards")
        .select("reward_amount_egp")
        .eq("referrer_user_id", context.userId),
      supabaseAdmin
        .from("student_wallets")
        .select("cash_balance_egp")
        .eq("user_id", context.userId)
        .maybeSingle(),
    ]);

    const firstError = [visits, attributions, rewards, wallet].find((r) => r.error)?.error;
    if (firstError) throw firstError;

    const rewardRows = rewards.data ?? [];
    const totalRewards = rewardRows.reduce(
      (sum, row) => sum + Number(row.reward_amount_egp ?? 0),
      0,
    );

    return {
      code: referralLink.code,
      link: `/invite/${referralLink.code}`,
      visits: visits.count ?? 0,
      referredUsers: attributions.count ?? 0,
      paidSubscriptions: rewardRows.length,
      totalRewards,
      walletBalance: Number(wallet.data?.cash_balance_egp ?? 0),
    };
  });
