import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireSupabaseAdmin } from "@/integrations/supabase/auth-middleware";

/**
 * WISO Partners server functions.
 * All wallet credits are issued by PostgreSQL triggers/functions, never here.
 */

export const getMyPartnersDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getUserSupabase } = await import(
      "@/integrations/supabase/user-client.server"
    );
    const userSupabase = getUserSupabase();

    const { data: linkData, error: linkError } = await userSupabase.rpc(
      "get_or_create_referral_link",
      { _user_id: context.userId },
    );
    if (linkError) throw linkError;

    const link = linkData as {
      id: string;
      code: string;
      referrer_user_id: string;
    };

    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    // These tables are introduced by the WISO Partners migration. The cast
    // keeps this file compatible until Supabase TypeScript types are regenerated.
    const db = supabaseAdmin as unknown as {
      from: (table: string) => any;
    };

    const [visits, attributions, requestRewards, influencer, commissions, wallet] =
      await Promise.all([
        db
          .from("referral_visits")
          .select("id", { count: "exact", head: true })
          .eq("referral_link_id", link.id),
        db
          .from("referral_attributions")
          .select("id", { count: "exact", head: true })
          .eq("referrer_user_id", context.userId),
        db
          .from("referral_request_rewards")
          .select("amount_egp,created_at,referred_user_id,special_request_id")
          .eq("referrer_user_id", context.userId)
          .order("created_at", { ascending: false }),
        db
          .from("influencer_profiles")
          .select("is_active,activated_at")
          .eq("user_id", context.userId)
          .maybeSingle(),
        db
          .from("influencer_commissions")
          .select("id,amount_egp,product_key,created_at,referred_user_id,tool_order_id")
          .eq("influencer_user_id", context.userId)
          .order("created_at", { ascending: false }),
        db
          .from("student_wallets")
          .select("cash_balance_egp")
          .eq("user_id", context.userId)
          .maybeSingle(),
      ]);

    const failed = [
      visits,
      attributions,
      requestRewards,
      influencer,
      commissions,
      wallet,
    ].find((result) => result.error)?.error;
    if (failed) throw failed;

    const requestRewardRows = requestRewards.data ?? [];
    const commissionRows = commissions.data ?? [];
    const referralEarnings = requestRewardRows.reduce(
      (sum: number, row: { amount_egp: number | string | null }) =>
        sum + Number(row.amount_egp ?? 0),
      0,
    );
    const influencerEarnings = commissionRows.reduce(
      (sum: number, row: { amount_egp: number | string | null }) =>
        sum + Number(row.amount_egp ?? 0),
      0,
    );

    return {
      code: link.code,
      link: `/invite/${link.code}`,
      visits: visits.count ?? 0,
      referredUsers: attributions.count ?? 0,
      referralRewards: requestRewardRows,
      referralEarnings,
      influencer: influencer.data,
      commissions: commissionRows,
      influencerEarnings,
      walletBalance: Number(wallet.data?.cash_balance_egp ?? 0),
    };
  });

export const activateMyInfluencerAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { code: string }) => {
    const code = input.code.trim().toUpperCase();
    if (code.length < 8 || code.length > 100) {
      throw new Error("INVALID_INFLUENCER_CODE");
    }
    return { code };
  })
  .handler(async ({ data }) => {
    const { getUserSupabase } = await import(
      "@/integrations/supabase/user-client.server"
    );
    const { data: result, error } = await getUserSupabase().rpc(
      "activate_wiso_influencer",
      { _code: data.code },
    );
    if (error) throw error;
    return result;
  });

export const adminListInfluencerActivationCodes = createServerFn({
  method: "GET",
})
  .middleware([requireSupabaseAdmin])
  .handler(async () => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const db = supabaseAdmin as unknown as {
      from: (table: string) => any;
    };
    const { data, error } = await db
      .from("influencer_activation_codes")
      .select("id,code,max_uses,uses_count,expires_at,is_active,created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const adminCreateInfluencerActivationCode = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAdmin])
  .inputValidator(
    (input: { maxUses: number; expiresAt?: string | null }) => {
      if (!Number.isInteger(input.maxUses) || input.maxUses < 1 || input.maxUses > 10000) {
        throw new Error("INVALID_MAX_USES");
      }
      if (input.expiresAt) {
        const expiry = new Date(input.expiresAt);
        if (Number.isNaN(expiry.getTime()) || expiry.getTime() <= Date.now()) {
          throw new Error("INVALID_EXPIRY_DATE");
        }
      }
      return input;
    },
  )
  .handler(async ({ data, context }) => {
    const { randomBytes } = await import("node:crypto");
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const db = supabaseAdmin as unknown as {
      from: (table: string) => any;
    };
    const code = `WISO-INF-${randomBytes(6).toString("hex").toUpperCase()}`;

    const { data: row, error } = await db
      .from("influencer_activation_codes")
      .insert({
        code,
        max_uses: data.maxUses,
        expires_at: data.expiresAt ?? null,
        created_by: context.userId,
      })
      .select("id,code,max_uses,uses_count,expires_at,is_active,created_at")
      .single();
    if (error) throw error;
    return row;
  });

export const adminSetInfluencerActivationCodeStatus = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAdmin])
  .inputValidator((input: { codeId: string; isActive: boolean }) => {
    if (!/^[0-9a-f-]{36}$/i.test(input.codeId)) {
      throw new Error("INVALID_CODE_ID");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const db = supabaseAdmin as unknown as {
      from: (table: string) => any;
    };
    const { data: row, error } = await db
      .from("influencer_activation_codes")
      .update({ is_active: data.isActive })
      .eq("id", data.codeId)
      .select("id,code,is_active,uses_count,max_uses")
      .single();
    if (error) throw error;
    return row;
  });

export const adminGetInfluencerOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAdmin])
  .handler(async () => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const db = supabaseAdmin as unknown as {
      from: (table: string) => any;
    };
    const [profiles, commissions, referrals] = await Promise.all([
      db
        .from("influencer_profiles")
        .select("user_id,is_active,activated_at")
        .order("activated_at", { ascending: false }),
      db
        .from("influencer_commissions")
        .select("id,influencer_user_id,referred_user_id,tool_order_id,product_key,amount_egp,created_at")
        .order("created_at", { ascending: false })
        .limit(500),
      db
        .from("referral_request_rewards")
        .select("id,referrer_user_id,referred_user_id,special_request_id,amount_egp,created_at")
        .order("created_at", { ascending: false })
        .limit(500),
    ]);
    const failed = [profiles, commissions, referrals].find((result) => result.error)?.error;
    if (failed) throw failed;

    const influencerIds = (profiles.data ?? []).map(
      (row: { user_id: string }) => row.user_id,
    );
    let profileRows: Array<{ id: string; full_name: string | null; phone: string | null }> = [];
    if (influencerIds.length > 0) {
      const { data, error } = await db
        .from("profiles")
        .select("id,full_name,phone")
        .in("id", influencerIds);
      if (error) throw error;
      profileRows = data ?? [];
    }
    const profileById = new Map(
      profileRows.map((row) => [row.id, row]),
    );

    return {
      influencers: (profiles.data ?? []).map(
        (row: { user_id: string; is_active: boolean; activated_at: string }) => ({
          ...row,
          profile: profileById.get(row.user_id) ?? null,
        }),
      ),
      commissions: commissions.data ?? [],
      referralRewards: referrals.data ?? [],
    };
  });
