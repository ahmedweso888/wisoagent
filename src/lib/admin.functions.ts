/**
 * Secure server-side seam for WISO administrator operations.
 *
 * IMPORTANT:
 * - Browser code may import these createServerFn wrappers safely.
 * - The service-role credential never reaches the browser.
 * - Every operation is protected by requireSupabaseAdmin.
 * - Admin identity comes from context.adminId, derived from the
 *   authenticated user's JWT. It is never supplied by the browser.
 */

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAdmin } from "@/integrations/supabase/auth-middleware";

import type { Database } from "@/integrations/supabase/types";

type PlatformSettings =
  Database["public"]["Tables"]["platform_settings"]["Row"];

type ContestSettings =
  Database["public"]["Tables"]["contest_settings"]["Row"];

type PlatformStatus =
  Database["public"]["Enums"]["platform_status"];

export type AdminRevenueSummary = {
  total_revenue: number;
  pending_revenue: number;
  by_source: Record<string, number>;
  codes_used: number;
  codes_total: number;
};

/* =========================================================
   PDF SETTINGS
   ========================================================= */

export const adminGetPdfSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAdmin])
  .handler(async () => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");

    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("key,value")
      .like("key", "pdf_%");

    if (error) {
      throw error;
    }

    return Object.fromEntries(
      (data ?? []).map((row) => [row.key, row.value ?? ""]),
    );
  });

export const adminUpdatePdfSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAdmin])
  .inputValidator(
    (input: {
      pdf_enabled?: string;
      pdf_credit_cost?: string;
      pdf_supported_types?: string;
      pdf_default_title?: string;
      pdf_footer_notice?: string;
      pdf_promotional_text?: string;
    }) => input,
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");

    const rows = [
      {
        key: "pdf_enabled",
        value: data.pdf_enabled ?? "true",
      },
      {
        key: "pdf_credit_cost",
        value: String(
          Math.max(0, Number(data.pdf_credit_cost) || 0),
        ),
      },
      {
        key: "pdf_supported_types",
        value:
          data.pdf_supported_types ||
          '["worksheet","exam"]',
      },
      {
        key: "pdf_default_title",
        value:
          data.pdf_default_title ||
          "ورقة أسئلة WISO",
      },
      {
        key: "pdf_footer_notice",
        value:
          data.pdf_footer_notice ||
          "WISO Agent — للاستخدام التعليمي الشخصي",
      },
      {
        key: "pdf_promotional_text",
        value: data.pdf_promotional_text || "",
      },
    ];

    const { error } = await supabaseAdmin
      .from("site_settings")
      .upsert(rows);

    if (error) {
      throw error;
    }

    return {
      success: true,
    };
  });

/* =========================================================
   PLATFORM SETTINGS
   ========================================================= */

export const adminGetPlatformSettings = createServerFn({
  method: "GET",
})
  .middleware([requireSupabaseAdmin])
  .handler(async (): Promise<PlatformSettings> => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");

    const { data, error } = await supabaseAdmin
      .from("platform_settings")
      .select("*")
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error("لا توجد إعدادات منصة");
    }

    return data;
  });

export const adminUpdatePlatformSettings = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAdmin])
  .inputValidator(
    (input: {
      _status?: PlatformStatus;
      _maintenance?: boolean;
      _message?: string;
      _window_enabled?: boolean;
      _window_start?: string | null;
      _window_end?: string | null;
    }) => input,
  )
  .handler(async ({ data, context }): Promise<PlatformSettings> => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");

    /*
     * IMPORTANT:
     * The admin ID comes from the authenticated server context.
     * It is NOT trusted from browser input.
     */
    const patch = {
      ...(data._status === undefined ? {} : { platform_status: data._status }),
      ...(data._maintenance === undefined ? {} : { maintenance_mode: data._maintenance }),
      ...(data._message === undefined ? {} : { maintenance_message: data._message }),
      ...(data._window_enabled === undefined ? {} : { global_access_enabled: data._window_enabled }),
      ...(data._window_enabled === false ? { global_access_start: null, global_access_end: null } : {
        ...(data._window_start === undefined ? {} : { global_access_start: data._window_start }),
        ...(data._window_end === undefined ? {} : { global_access_end: data._window_end }),
      }),
      updated_at: new Date().toISOString(),
    };
    const { data: result, error } = await supabaseAdmin.from("platform_settings").update(patch).eq("id", true).select().single();
    if (error) throw error;
    await supabaseAdmin.from("admin_audit_logs").insert({ admin_id: context.adminId, action: "update_platform_settings", metadata: patch });
    return result;
  });

/* =========================================================
   CONTEST SETTINGS
   ========================================================= */

export const adminGetContestSettings = createServerFn({
  method: "GET",
})
  .middleware([requireSupabaseAdmin])
  .handler(async (): Promise<ContestSettings> => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");

    const { data, error } = await supabaseAdmin
      .from("contest_settings")
      .select("*")
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error("لا توجد إعدادات مسابقة");
    }

    return data;
  });

export const adminGetContestEntriesCount = createServerFn({
  method: "GET",
})
  .middleware([requireSupabaseAdmin])
  .handler(async () => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");

    const { count, error } = await supabaseAdmin
      .from("contest_entries")
      .select("id", {
        count: "exact",
        head: true,
      });

    if (error) {
      throw error;
    }

    return count ?? 0;
  });

export const adminUpdateContestSettings = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAdmin])
  .inputValidator(
    (input: {
      enabled?: boolean;
      verified_students_threshold?: number;
      prize_egp?: number;
    }) => input,
  )
  .handler(async ({ data }): Promise<ContestSettings> => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");

    const { data: existing, error: existingError } =
      await supabaseAdmin
        .from("contest_settings")
        .select("id")
        .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (!existing) {
      throw new Error("Contest settings record not found");
    }

    const { data: result, error } =
      await supabaseAdmin
        .from("contest_settings")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

    if (error) {
      throw error;
    }

    return result;
  });

/* =========================================================
   REVENUE
   ========================================================= */

export const adminGetRevenueSummary = createServerFn({
  method: "GET",
})
  .middleware([requireSupabaseAdmin])
  .handler(async (): Promise<AdminRevenueSummary> => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");

    /*
     * admin_revenue_summary is already designed without auth.uid().
     * Authorization is handled by requireSupabaseAdmin before this call.
     */
    const [revenue, pending, used, total] = await Promise.all([
      supabaseAdmin.from("revenue_entries").select("amount_egp,source"),
      supabaseAdmin.from("payment_requests").select("amount_egp").eq("status", "pending"),
      supabaseAdmin.from("center_codes").select("id", { count: "exact", head: true }).not("used_by", "is", null),
      supabaseAdmin.from("center_codes").select("id", { count: "exact", head: true }),
    ]);
    const firstError = [revenue, pending, used, total].find((r) => r.error)?.error;
    if (firstError) throw firstError;
    const by_source: Record<string, number> = {};
    for (const row of revenue.data ?? []) by_source[row.source] = (by_source[row.source] ?? 0) + Number(row.amount_egp ?? 0);
    return { total_revenue: (revenue.data ?? []).reduce((n, r) => n + Number(r.amount_egp ?? 0), 0), pending_revenue: (pending.data ?? []).reduce((n, r) => n + Number(r.amount_egp ?? 0), 0), by_source, codes_used: used.count ?? 0, codes_total: total.count ?? 0 };
  });
/* =========================================================
   LEGACY ADMIN ROUTE SEAMS
   These keep privileged table/RPC access server-only while the
   existing admin UI is migrated incrementally.
   ========================================================= */

export const adminGetAiSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAdmin])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.from("ai_settings").select("*").maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("لا توجد إعدادات ذكاء اصطناعي.");
    return data;
  });

export const adminUpdateAiSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAdmin])
  .inputValidator((input: { _model?: string; _ai_mode_enabled?: boolean; _ai_emergency_disabled?: boolean; _enabled?: boolean }) => input)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString(), updated_by: context.adminId };
    if (data._model !== undefined) patch["model"] = data._model;
    if (data._ai_mode_enabled !== undefined) patch["ai_mode_enabled"] = data._ai_mode_enabled;
    if (data._ai_emergency_disabled !== undefined) patch["ai_emergency_disabled"] = data._ai_emergency_disabled;
    if (data._enabled !== undefined) patch["enabled"] = data._enabled;
    const { data: result, error } = await supabaseAdmin.from("ai_settings").update(patch as never).eq("id", true).select().single();
    if (error) throw error;
    await supabaseAdmin.from("admin_audit_logs").insert({ admin_id: context.adminId, action: "ai_settings_update", metadata: result });
    return result;
  });

export const adminGetCenters = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("centers").select("id,name,created_at").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
});
export const adminGetPlans = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("subscription_plans").select("id,name_ar").order("sort_order");
  if (error) throw error;
  return data ?? [];
});
export const adminGetCenterCodes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAdmin])
  .inputValidator((input: { centerId?: string }) => input)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let query = supabaseAdmin
      .from("center_codes")
      .select("id,code,center_id,plan_id,code_type,expires_at,sprix_access_days,used_by,used_at,created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (data.centerId) query = query.eq("center_id", data.centerId);
    const { data: rows, error } = await query;
    if (error) throw error;

    const usedIds = [...new Set((rows ?? []).map((row) => row.used_by).filter(Boolean))] as string[];
    const { data: profiles, error: profilesError } = usedIds.length
      ? await supabaseAdmin
          .from("profiles")
          .select("id,user_code,full_name")
          .in("id", usedIds)
      : { data: [], error: null };
    if (profilesError) throw profilesError;

    const byUser = new Map(
      (profiles ?? []).map((profile) => [
        profile.id,
        { userCode: profile.user_code, fullName: profile.full_name },
      ]),
    );

    return (rows ?? []).map((row) => ({
      ...row,
      used_by_user_code: row.used_by ? byUser.get(row.used_by)?.userCode ?? null : null,
      used_by_name: row.used_by ? byUser.get(row.used_by)?.fullName ?? null : null,
    }));
  });

export const adminCreateCenter = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input: { name: string }) => input).handler(async ({ data }) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("centers").insert({ name: data.name.trim() });
  if (error) throw error;
});
export const adminGenerateCenterCodes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAdmin])
  .inputValidator(
    (input: {
      center: string;
      plan?: string | null;
      count: number;
      codeType?: "question" | "sprix" | "qureo" | "sprix_qureo";
      expiresAt?: string | null;
      sprixAccessDays?: number | null;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (!Number.isInteger(data.count) || data.count < 1 || data.count > 5000) {
      throw new Error("invalid_count");
    }

    const codeType = data.codeType ?? "question";
    if (data.expiresAt && new Date(data.expiresAt).getTime() <= Date.now()) {
      throw new Error("invalid_expiry");
    }
    if (codeType === "question" && !data.plan) throw new Error("plan_required");

    if (codeType !== "question" && data.sprixAccessDays !== null && data.sprixAccessDays !== undefined) {
      if (!Number.isInteger(data.sprixAccessDays) || data.sprixAccessDays < 1 || data.sprixAccessDays > 3650) {
        throw new Error("invalid_tool_access_days");
      }
    }

    const { data: center, error: centerError } = await supabaseAdmin
      .from("centers")
      .select("id")
      .eq("id", data.center)
      .maybeSingle();
    if (centerError) throw centerError;
    if (!center) throw new Error("center_not_found");

    if (codeType === "question") {
      const { data: plan, error: planError } = await supabaseAdmin
        .from("subscription_plans")
        .select("id")
        .eq("id", data.plan as string)
        .eq("is_active", true)
        .maybeSingle();
      if (planError) throw planError;
      if (!plan) throw new Error("plan_not_found");
    }

    
    const { randomInt } = await import("node:crypto");

    const prefix = codeType === "question" ? "20" : "10";

    const generateNumericCode = () =>
      prefix +
      Array.from({ length: 14 }, () => randomInt(0, 10)).join("");

    let inserted = false;
    let lastInsertError: { code?: string; message?: string } | null = null;

    for (let attempt = 0; attempt < 10; attempt++) {
      const generatedCodes = new Set<string>();

      while (generatedCodes.size < data.count) {
        generatedCodes.add(generateNumericCode());
      }

      const rows = Array.from(generatedCodes, (code) => ({
        center_id: data.center,
        plan_id: codeType === "question" ? (data.plan as string) : null,
        code_type: codeType,
        expires_at: data.expiresAt || null,
        sprix_access_days:
          codeType === "question" ? null : data.sprixAccessDays ?? 30,
        code,
      }));

      const { error: insertError } = await supabaseAdmin
        .from("center_codes")
        .insert(rows);

      if (!insertError) {
        inserted = true;
        break;
      }

      lastInsertError = insertError;

      if (insertError.code !== "23505") {
        throw insertError;
      }
    }

    if (!inserted) {
      throw new Error(
        lastInsertError?.code === "23505"
          ? "code_generation_conflict"
          : lastInsertError?.message ?? "code_generation_failed",
      );
    }


    await supabaseAdmin.from("admin_audit_logs").insert({
      admin_id: context.adminId,
      action: "generate_center_codes",
      metadata: {
        center: data.center,
        plan: data.plan ?? null,
        count: data.count,
        code_type: codeType,
        expires_at: data.expiresAt ?? null,
        tool_access_days: codeType === "question" ? null : data.sprixAccessDays ?? 30,
      },
    });

    return data.count;
  });

export const adminGetStats = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [profiles, ai, questions, attempts, documents] = await Promise.all([
    supabaseAdmin.from("profiles").select("*").limit(100000),
    supabaseAdmin.from("ai_usage_logs").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("questions").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("question_attempts").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("documents").select("id", { count: "exact", head: true }),
  ]);
  const error = [profiles, ai, questions, attempts, documents].find((r) => r.error)?.error;
  if (error) throw error;
  const rows = profiles.data ?? []; const now = Date.now();
  return { total_users: rows.length, active_7d: rows.filter((p) => now - new Date(p.last_active_at).getTime() < 7 * 86400000).length, trial_users: rows.filter((p) => new Date(p.trial_expires_at).getTime() > now && p.subscription_status !== "active").length, trial_expired: rows.filter((p) => new Date(p.trial_expires_at).getTime() <= now && p.subscription_status !== "active").length, active_subscribers: rows.filter((p) => p.subscription_status === "active").length, expired_subscribers: rows.filter((p) => p.subscription_status === "expired" || p.subscription_status === "cancelled").length, suspended: rows.filter((p) => p.platform_access_status === "suspended").length, allowed_now: rows.filter((p) => p.platform_access_status === "allowed").length, ai_requests: ai.count ?? 0, questions_generated: questions.count ?? 0, questions_solved: attempts.count ?? 0, documents_uploaded: documents.count ?? 0 };
});
export const adminGetDashboardCounts = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [payments, special, center, running, total] = await Promise.all([
    supabaseAdmin.from("payment_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabaseAdmin.from("special_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabaseAdmin.from("center_requests").select("id", { count: "exact", head: true }).in("status", ["new", "reviewing"]),
    supabaseAdmin.from("ai_jobs").select("request_id", { count: "exact", head: true }).eq("status", "running"),
    supabaseAdmin.from("ai_jobs").select("request_id", { count: "exact", head: true }),
  ]);
  const error = [payments, special, center, running, total].find((r) => r.error)?.error;
  if (error) throw error;
  return {
    pendingPayments: payments.count ?? 0,
    pendingSpecial: special.count ?? 0,
    pendingCenterRequests: center.count ?? 0,
    runningAiJobs: running.count ?? 0,
    totalAiJobs: total.count ?? 0,
  };
});

export const adminListUsers = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input: { search?: string; limit?: number }) => input).handler(async ({ data }) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  let query = supabaseAdmin.from("profiles").select("id,user_code,full_name,email,created_at,trial_started_at,trial_expires_at,subscription_status,subscription_expires_at,platform_access_status,access_override,access_expires_at,permanent_access,suspended_at,last_active_at").order("created_at", { ascending: false }).limit(data.limit ?? 200);
  if (data.search?.trim()) { const q = data.search.trim(); query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,user_code.eq.${Number(q) || 0}`); }
  const { data: profiles, error } = await query; if (error) throw error;
  return Promise.all((profiles ?? []).map(async (p) => {
    const [role, logs] = await Promise.all([supabaseAdmin.rpc("has_role", { _user_id: p.id, _role: "admin" }), supabaseAdmin.from("ai_usage_logs").select("id", { count: "exact", head: true }).eq("user_id", p.id)]);
    return { ...p, is_admin: role.data === true, access: {}, ai_requests: logs.count ?? 0 };
  }));
});
export const adminGetUserDetail = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input: { target: string }) => input).handler(async ({ data }) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: profile, error } = await supabaseAdmin.from("profiles").select("*").eq("id", data.target).single(); if (error) throw error;
  const [role, questions, attempts, correct, hard, nightmare, mistakes, weak, documents, ai, audit] = await Promise.all([
    supabaseAdmin.rpc("has_role", { _user_id: data.target, _role: "admin" }),
    supabaseAdmin.from("questions").select("id", { count: "exact", head: true }).eq("user_id", data.target),
    supabaseAdmin.from("question_attempts").select("id", { count: "exact", head: true }).eq("user_id", data.target),
    supabaseAdmin.from("question_attempts").select("id", { count: "exact", head: true }).eq("user_id", data.target).eq("is_correct", true),
    supabaseAdmin.from("question_attempts").select("id,questions!inner(difficulty)", { count: "exact", head: true }).eq("user_id", data.target).in("questions.difficulty", ["hard", "very_hard"]),
    supabaseAdmin.from("question_attempts").select("id,questions!inner(difficulty)", { count: "exact", head: true }).eq("user_id", data.target).eq("questions.difficulty", "nightmare"),
    supabaseAdmin.from("mistakes").select("id", { count: "exact", head: true }).eq("user_id", data.target),
    supabaseAdmin.from("mastery").select("id", { count: "exact", head: true }).eq("user_id", data.target).eq("is_weak", true),
    supabaseAdmin.from("documents").select("id,created_at").eq("user_id", data.target).order("created_at", { ascending: false }),
    supabaseAdmin.from("ai_usage_logs").select("created_at", { count: "exact" }).eq("user_id", data.target).order("created_at", { ascending: false }).limit(1),
    supabaseAdmin.from("admin_audit_logs").select("id,action,created_at,metadata").eq("target_user_id", data.target).order("created_at", { ascending: false }),
  ]);
  return { profile, is_admin: role.data === true, questions_total: questions.count ?? 0, attempts_total: attempts.count ?? 0, attempts_correct: correct.count ?? 0, hard_solved: hard.count ?? 0, nightmare_solved: nightmare.count ?? 0, mistakes_total: mistakes.count ?? 0, weak_concepts: weak.count ?? 0, documents: documents.data ?? [], ai_requests: ai.count ?? 0, last_ai_activity: ai.data?.[0]?.created_at ?? null, audit: audit.data ?? [] };
});
export const adminGrantAccess = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input: { target: string; days?: number; permanent?: boolean }) => input).handler(async ({ data, context }) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const patch: Database["public"]["Tables"]["profiles"]["Update"] = data.permanent ? { permanent_access: true, access_granted_at: new Date().toISOString(), access_expires_at: null, access_override: "admin_granted", platform_access_status: "allowed", suspended_at: null, suspended_reason: null } : { permanent_access: false, access_granted_at: new Date().toISOString(), access_expires_at: new Date(Date.now() + (data.days ?? 0) * 86400000).toISOString(), access_override: "admin_granted", platform_access_status: "allowed", suspended_at: null, suspended_reason: null };
  const { error } = await supabaseAdmin.from("profiles").update(patch).eq("id", data.target);
  if (error) throw error;
  await supabaseAdmin.from("admin_audit_logs").insert({ admin_id: context.adminId, target_user_id: data.target, action: "grant_access", metadata: patch });
});
export const adminRevokeAccess = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input: { target: string }) => input).handler(async ({ data, context }) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("profiles").update({ permanent_access: false, access_expires_at: null, access_granted_at: null, access_override: "default" }).eq("id", data.target);
  if (error) throw error;
  await supabaseAdmin.from("admin_audit_logs").insert({ admin_id: context.adminId, target_user_id: data.target, action: "revoke_access", metadata: {} });
});
export const adminSetSuspended = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input: { target: string; suspended: boolean; reason?: string }) => input).handler(async ({ data, context }) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const patch: Database["public"]["Tables"]["profiles"]["Update"] = data.suspended ? { platform_access_status: "suspended", access_override: "suspended", suspended_at: new Date().toISOString(), suspended_reason: data.reason ?? null } : { platform_access_status: "allowed", access_override: "default", suspended_at: null, suspended_reason: null };
  const { error } = await supabaseAdmin.from("profiles").update(patch).eq("id", data.target);
  if (error) throw error;
  await supabaseAdmin.from("admin_audit_logs").insert({ admin_id: context.adminId, target_user_id: data.target, action: data.suspended ? "suspend_user" : "reactivate_user", metadata: { reason: data.reason ?? null } });
});
export const adminManageTrial = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input: { target: string; action: "reset" | "extend" | "disable"; hours?: number }) => input).handler(async ({ data, context }) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const hours = data.hours ?? 24;
  const patch: Database["public"]["Tables"]["profiles"]["Update"] = data.action === "reset" ? { trial_started_at: new Date().toISOString(), trial_expires_at: new Date(Date.now() + hours * 3600000).toISOString(), subscription_status: "trial" } : data.action === "extend" ? { trial_expires_at: new Date(Date.now() + hours * 3600000).toISOString() } : { trial_expires_at: new Date().toISOString() };
  const { error } = await supabaseAdmin.from("profiles").update(patch).eq("id", data.target);
  if (error) throw error;
  await supabaseAdmin.from("admin_audit_logs").insert({ admin_id: context.adminId, target_user_id: data.target, action: `trial_${data.action}`, metadata: { hours } });
});
export const adminSetRole = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input: { target: string; enabled: boolean }) => input).handler(async ({ data, context }) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  if (data.target === context.adminId && !data.enabled) throw new Error("cannot_remove_own_admin_role");
  if (data.enabled) { const { error } = await supabaseAdmin.from("user_roles").upsert({ user_id: data.target, role: "admin" }); if (error) throw error; } else { const { error } = await supabaseAdmin.from("user_roles").delete().eq("user_id", data.target).eq("role", "admin"); if (error) throw error; }
  await supabaseAdmin.from("admin_audit_logs").insert({ admin_id: context.adminId, target_user_id: data.target, action: "set_role", metadata: { role: "admin", enabled: data.enabled } });
});

export const adminGetPayments = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input: { status?: string }) => input).handler(async ({ data }) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  let query = supabaseAdmin.from("payment_requests").select("*, subscription_plans(name_ar, price_egp)").order("created_at", { ascending: false });
  if (data.status && data.status !== "all") query = query.eq("status", data.status);
  const { data: rows, error } = await query.limit(200);
  if (error) throw error;
  return rows ?? [];
});
export const adminReviewPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAdmin])
  .inputValidator(
    (input: { request: string; approve: boolean; reason?: string }) => input,
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const rpcParams = {
      _request: data.request,
      _approve: data.approve,
      _admin_id: context.adminId,
      ...(data.reason?.trim()
        ? { _reason: data.reason.trim() }
        : {}),
    };

    const { data: result, error } = await supabaseAdmin.rpc(
      "admin_review_wiso_payment",
      rpcParams,
    );

    if (error) throw error;

    return result;
  });
export const adminGetPaymentProofUrl = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input: { path: string }) => input).handler(async ({ data }) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: signed, error } = await supabaseAdmin.storage.from("payment-proofs").createSignedUrl(data.path, 300);
  if (error) throw error;
  return signed.signedUrl;
});

export const adminGetSpecialRequests = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("special_requests").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
});
export const adminReviewSpecialRequest = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input: { request: string; status: string; priceEgp?: number; adminNote?: string }) => input).handler(async ({ data, context }) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  if (!["accepted", "rejected", "completed"].includes(data.status)) throw new Error("invalid_status");
  const { data: row, error } = await supabaseAdmin.from("special_requests").update({ status: data.status, ...(data.priceEgp === undefined ? {} : { price_egp: data.priceEgp }), ...(data.adminNote === undefined ? {} : { admin_note: data.adminNote }), reviewed_by: context.adminId, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", data.request).select().single();
  if (error) throw error;
  await supabaseAdmin.from("notifications").insert({ user_id: row.user_id, title: "تحديث على طلبك الخاص", body: data.adminNote ?? (data.status === "accepted" ? "تم قبول طلبك." : data.status === "rejected" ? "تم رفض طلبك." : "تم إكمال طلبك."), kind: "special_request" });
  await supabaseAdmin.from("admin_audit_logs").insert({ admin_id: context.adminId, target_user_id: row.user_id, action: "review_special_request", metadata: { request: data.request, status: data.status, price_egp: data.priceEgp ?? null } });
});

export const adminGetAiStats = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const month = new Date(today.getFullYear(), today.getMonth(), 1);
  const [todayRows, monthRows, logs, errors] = await Promise.all([
    supabaseAdmin.from("ai_usage_logs").select("questions_generated,documents_analyzed,images_analyzed,tokens_used,status,created_at").gte("created_at", today.toISOString()),
    supabaseAdmin.from("ai_usage_logs").select("questions_generated,tokens_used,created_at").gte("created_at", month.toISOString()),
    supabaseAdmin.from("ai_usage_logs").select("questions_generated,documents_analyzed,images_analyzed,tokens_used,status"),
    supabaseAdmin.from("ai_usage_logs").select("id", { count: "exact", head: true }).in("status", ["error", "failed"]).gte("created_at", today.toISOString()),
  ]);
  const err = [todayRows, monthRows, logs, errors].find((r) => r.error)?.error; if (err) throw err;
  const sum = (rows: Array<{ questions_generated?: number | null; documents_analyzed?: number | null; images_analyzed?: number | null; tokens_used?: number | null }> | null) => (rows ?? []).reduce((a, r) => ({ q: a.q + Number(r.questions_generated ?? 0), d: a.d + Number(r.documents_analyzed ?? 0), i: a.i + Number(r.images_analyzed ?? 0), t: a.t + Number(r.tokens_used ?? 0) }), { q: 0, d: 0, i: 0, t: 0 });
  const t = sum(todayRows.data); const m = sum(monthRows.data); const all = sum(logs.data);
  return { requests_today: todayRows.data?.length ?? 0, requests_month: monthRows.data?.length ?? 0, questions_generated: all.q, documents_analyzed: all.d, images_analyzed: all.i, tokens_used: all.t, errors_today: errors.count ?? 0, errors_total: (logs.data ?? []).filter((r) => r.status === "error" || r.status === "failed").length, _today: t, _month: m };
});
export const adminGetAiJobs = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("ai_jobs").select("*").order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  return data ?? [];
});
export const adminGetAiLogs = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("ai_usage_logs").select("*").order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  return data ?? [];
});

export const adminGetSubjects = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("subjects").select("*").order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
});
export const adminGetCurriculumContentCounts = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [units, chapters, topics, bank] = await Promise.all([
    supabaseAdmin.from("units").select("subject_id"),
    supabaseAdmin.from("chapters").select("subject_id"),
    supabaseAdmin.from("topics").select("subject_id"),
    supabaseAdmin.from("question_bank").select("subject_id"),
  ]);
  const firstError = [units, chapters, topics, bank].find((r) => r.error)?.error;
  if (firstError) throw firstError;
  const tally = (rows: { subject_id: string | null }[] | null) => {
    const map: Record<string, number> = {};
    for (const row of rows ?? []) if (row.subject_id) map[row.subject_id] = (map[row.subject_id] ?? 0) + 1;
    return map;
  };
  return { units: tally(units.data), chapters: tally(chapters.data), topics: tally(topics.data), bank: tally(bank.data) };
});
export const adminCreateSubject = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input: Record<string, unknown>) => input).handler(async ({ data }) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("subjects").insert(data as never);
  if (error) throw error;
});
export const adminUpdateSubject = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input: { id: string; patch: Record<string, unknown> }) => input).handler(async ({ data }) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("subjects").update(data.patch as never).eq("id", data.id);
  if (error) throw error;
});

export const adminUpdateSubscriptionPlan = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input: { id: string; patch: Record<string, unknown> }) => input).handler(async ({ data }) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("subscription_plans").update(data.patch as never).eq("id", data.id);
  if (error) throw error;
});
export const adminCreateSubscriptionPlan = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input: Record<string, unknown>) => input).handler(async ({ data }) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("subscription_plans").insert(data as never);
  if (error) throw error;
});
export const adminGetSubscriptionPlans = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("subscription_plans").select("*").order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
});
export const adminGetQuestionSubjects = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("subjects").select("id,name_ar").order("sort_order");
  if (error) throw error;
  return data ?? [];
});
export const adminGetQuestionBank = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input: { subjectId?: string; difficulty?: string; search?: string; page: number; pageSize: number }) => input).handler(async ({ data }) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  let query = supabaseAdmin.from("question_bank").select("id,prompt,difficulty,question_type,quality_status,usage_count,language,school_year,track,lesson_key,concepts,source_label,source_page_from,source_page_to,created_at,subject_id", { count: "exact" }).order("created_at", { ascending: false }).range(data.page * data.pageSize, data.page * data.pageSize + data.pageSize - 1);
  if (data.subjectId) query = query.eq("subject_id", data.subjectId);
  if (data.difficulty) query = query.eq("difficulty", data.difficulty as never);
  if (data.search?.trim()) query = query.ilike("prompt", `%${data.search.trim()}%`);
  const { data: rows, count, error } = await query;
  if (error) throw error;
  return { rows: rows ?? [], count: count ?? 0 };
});

export const adminPrepareCurriculumUpload = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input: { subjectId: string; filename: string; checksumSha256: string }) => input).handler(async ({ data, context }) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: existing, error: existingError } = await supabaseAdmin.from("curriculum_versions").select("id,version,checksum_sha256").eq("subject_id", data.subjectId).order("version", { ascending: false }).limit(1);
  if (existingError) throw existingError;
  if (existing?.some((row) => row.checksum_sha256 === data.checksumSha256)) throw new Error("duplicate_curriculum");
  const nextVersion = (existing?.[0]?.version ?? 0) + 1;
  const safeName = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-180);
  const path = `subjects/${data.subjectId}/v${nextVersion}-${Date.now()}-${safeName}`;
  const { data: version, error } = await supabaseAdmin.from("curriculum_versions").insert({ subject_id: data.subjectId, version: nextVersion, filename: data.filename, storage_path: path, checksum_sha256: data.checksumSha256, uploaded_by: context.adminId }).select().single();
  if (error) throw error;
  const { data: upload, error: uploadError } = await supabaseAdmin.storage.from("curriculum-books").createSignedUploadUrl(path);
  if (uploadError) throw uploadError;
  const { error: jobError } = await supabaseAdmin.from("curriculum_processing_jobs").insert({ curriculum_version_id: version.id });
  if (jobError) throw jobError;
  return { versionId: version.id, path, token: upload.token };
});

export const adminProcessCurriculum = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input: { versionId: string }) => input).handler(async ({ data }) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: version, error: versionError } = await supabaseAdmin.from("curriculum_versions").select("id,subject_id,filename,storage_path").eq("id", data.versionId).single();
  if (versionError) throw versionError;
  const { data: subject, error: subjectError } = await supabaseAdmin.from("subjects").select("name_ar").eq("id", version.subject_id).single();
  if (subjectError) throw subjectError;
  await supabaseAdmin.from("curriculum_versions").update({ processing_status: "processing", processing_error: null }).eq("id", version.id);
  await supabaseAdmin.from("curriculum_processing_jobs").update({ status: "processing", attempts: 1, locked_at: new Date().toISOString() }).eq("curriculum_version_id", version.id);
  try {
    const { data: file, error: fileError } = await supabaseAdmin.storage.from("curriculum-books").download(version.storage_path);
    if (fileError) throw fileError;
    const bytes = Buffer.from(await file.arrayBuffer()).toString("base64");
    const response = await fetch(`${(process.env["WISO_AGENT_URL"] ?? "http://127.0.0.1:8000").replace(/\/$/, "")}/v1/curriculum/analyze`, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${process.env["WISO_AGENT_SECRET"] ?? ""}` }, body: JSON.stringify({ request_id: `wiso_curriculum_${version.id}`, subject_name: subject.name_ar, filename: version.filename, pdf_base64: bytes }) });
    const body = await response.text();
    if (!response.ok) throw new Error(`curriculum_agent_${response.status}:${body.slice(0,500)}`);
    const analysis = JSON.parse(body) as {
      page_count: number;
      pages: Array<{ page_number: number; text: string }>;
      units: Array<{
        title: string;
        page_start?: number | null;
        page_end?: number | null;
        confidence?: number;
        needs_review?: boolean;
        lessons: Array<{
          title: string;
          page_start?: number | null;
          page_end?: number | null;
          confidence?: number;
          needs_review?: boolean;
          concepts: Array<{ title: string; description?: string; source_page?: number | null }>;
        }>;
      }>;
    };
    await supabaseAdmin.from("curriculum_pages").delete().eq("curriculum_version_id", version.id);
    await supabaseAdmin.from("curriculum_units").delete().eq("curriculum_version_id", version.id);
    if (analysis.pages.length) await supabaseAdmin.from("curriculum_pages").insert(analysis.pages.map((page) => ({ curriculum_version_id: version.id, page_number: page.page_number, extracted_text: page.text })));
    let needsReview = false;
    for (let ui = 0; ui < analysis.units.length; ui++) {
      const unit = analysis.units[ui];
      if (!unit) throw new Error(`curriculum_unit_missing:${ui}`);
      needsReview ||= Boolean(unit.needs_review) || Number(unit.confidence ?? 0) < 0.65;
      const { data: unitRow, error: unitError } = await supabaseAdmin.from("curriculum_units").insert({ curriculum_version_id: version.id, title: unit.title, sort_order: ui, page_start: unit.page_start ?? null, page_end: unit.page_end ?? null, confidence: unit.confidence ?? null, needs_review: Boolean(unit.needs_review) || Number(unit.confidence ?? 0) < 0.65 }).select().single();
      if (unitError) throw unitError;
      for (let li = 0; li < unit.lessons.length; li++) {
        const lesson = unit.lessons[li];
        if (!lesson) throw new Error(`curriculum_lesson_missing:${ui}:${li}`);
        const lessonReview = Boolean(lesson.needs_review) || Number(lesson.confidence ?? 0) < 0.65;
        needsReview ||= lessonReview;
        const { data: lessonRow, error: lessonError } = await supabaseAdmin.from("curriculum_lessons").insert({ curriculum_version_id: version.id, unit_id: unitRow.id, title: lesson.title, sort_order: li, page_start: lesson.page_start ?? null, page_end: lesson.page_end ?? null, confidence: lesson.confidence ?? null, needs_review: lessonReview }).select().single();
        if (lessonError) throw lessonError;
        if (lesson.concepts.length) await supabaseAdmin.from("curriculum_concepts").insert(lesson.concepts.map((concept) => ({ lesson_id: lessonRow.id, title: concept.title, description: concept.description ?? null, source_page: concept.source_page ?? null, needs_review: lessonReview })));
      }
    }
    const status = needsReview ? "needs_review" : "completed";
    await supabaseAdmin.from("curriculum_versions").update({ page_count: analysis.page_count, processing_status: status, processed_at: new Date().toISOString() }).eq("id", version.id);
    await supabaseAdmin.from("curriculum_processing_jobs").update({ status, completed_at: new Date().toISOString(), updated_at: new Date().toISOString(), locked_at: null }).eq("curriculum_version_id", version.id);
    return { versionId: version.id, status, pageCount: analysis.page_count };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await supabaseAdmin.from("curriculum_versions").update({ processing_status: "failed", processing_error: message }).eq("id", version.id);
    await supabaseAdmin.from("curriculum_processing_jobs").update({ status: "failed", error: message, updated_at: new Date().toISOString(), locked_at: null }).eq("curriculum_version_id", version.id);
    throw error;
  }
});

export const adminGetCurriculumVersions = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input: { subjectId?: string }) => input).handler(async ({ data }) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  let query = supabaseAdmin.from("curriculum_versions").select("*").order("created_at", { ascending: false });
  if (data.subjectId) query = query.eq("subject_id", data.subjectId);
  const { data: rows, error } = await query;
  if (error) throw error;
  return rows ?? [];
});
export const adminPublishCurriculumVersion = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input: { versionId: string }) => input).handler(async ({ data }) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: version, error: versionError } = await supabaseAdmin.from("curriculum_versions").select("*").eq("id", data.versionId).single();
  if (versionError) throw versionError;
  const [units, lessons] = await Promise.all([
    supabaseAdmin.from("curriculum_units").select("needs_review").eq("curriculum_version_id", data.versionId).eq("needs_review", true),
    supabaseAdmin.from("curriculum_lessons").select("needs_review").eq("curriculum_version_id", data.versionId).eq("needs_review", true),
  ]);
  if ((units.data?.length ?? 0) || (lessons.data?.length ?? 0)) throw new Error("curriculum_needs_review");
  await supabaseAdmin.from("curriculum_versions").update({ is_published: false }).eq("subject_id", version.subject_id);
  const { data: result, error } = await supabaseAdmin.from("curriculum_versions").update({ is_published: true, processing_status: "completed", processed_at: version.processed_at ?? new Date().toISOString() }).eq("id", data.versionId).select().single();
  if (error) throw error;
  return result;
});

export const adminSendNotification = createServerFn({ method: "POST" }).middleware([requireSupabaseAdmin]).inputValidator((input: { audience: "user" | "stage" | "track" | "all"; userId?: string; stageId?: string; trackId?: string; title: string; body: string; type?: string; actionUrl?: string | null; expiresAt?: string | null }) => input).handler(async ({ data, context }) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  if (!data.title.trim() || !data.body.trim()) throw new Error("notification_content_required");
  let query = supabaseAdmin.from("profiles").select("id").limit(100000);
  if (data.audience === "user") { if (!data.userId) throw new Error("user_required"); query = query.eq("id", data.userId); }
  if (data.audience === "stage") { if (!data.stageId) throw new Error("stage_required"); query = query.eq("academic_stage_id", data.stageId); }
  if (data.audience === "track") { if (!data.trackId) throw new Error("track_required"); query = query.eq("academic_track_id", data.trackId); }
  const { data: recipients, error } = await query; if (error) throw error;
  const rows = (recipients ?? []).map((r) => ({ user_id: r.id, title: data.title.trim(), body: data.body.trim(), kind: data.type ?? "admin", metadata: { action_url: data.actionUrl ?? null, expires_at: data.expiresAt ?? null } }));
  if (rows.length) { const { error: insertError } = await supabaseAdmin.from("notifications").insert(rows); if (insertError) throw insertError; }
  await supabaseAdmin.from("admin_audit_logs").insert({ admin_id: context.adminId, action: "send_notification", metadata: { audience: data.audience, count: rows.length } });
  return { sent: rows.length };
});

export const adminGetAcademicStages = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("academic_stages").select("id,name_ar,slug").eq("is_active", true).order("sort_order");
  if (error) throw error;
  return data ?? [];
});
export const adminGetAcademicTracks = createServerFn({ method: "GET" }).middleware([requireSupabaseAdmin]).inputValidator((input: { stageId?: string }) => input).handler(async ({ data }) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  let query = supabaseAdmin.from("academic_tracks").select("id,name_ar,slug,stage_id").eq("is_active", true).order("sort_order");
  if (data.stageId) query = query.eq("stage_id", data.stageId);
  const { data: rows, error } = await query;
  if (error) throw error;
  return rows ?? [];
});
