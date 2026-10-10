import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireSupabaseAdmin } from "@/lib/admin.middleware";
import { encryptSprixCredentials, hashSprixUsername } from "@/services/sprix-agent/credentials.server";
import { createSprixRun, getSprixCredential, getSprixRunForUser, listSprixRunsForUser, upsertSprixCredential } from "@/services/sprix-agent/db.server";
import { claimNextSprixRun, executeClaimedSprixRun } from "@/services/sprix-agent/worker.server";
import { verifySprixCredentials } from "@/services/sprix-agent/python-client.server";
import { adminListSprixPaymentRequests, adminReviewSprixPayment, createSprixPaymentProofSignedUrl, createSprixPaymentRequest, getSprixPaymentOptions, hasSprixAccess, listMySprixPaymentRequests } from "@/services/sprix-agent/payment.server";
import type { Database } from "@/integrations/supabase/types";

export const saveSprixCredentials = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { username: string; password: string }) => {
    if (!input.username.trim() || !input.password) throw new Error("بيانات تسجيل الدخول غير مكتملة.");
    if (input.username.length > 200 || input.password.length > 500) throw new Error("بيانات تسجيل الدخول غير صالحة.");
    return { username: input.username.trim(), password: input.password };
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (!(await hasSprixAccess(context.userId))) throw new Error("SPRIX_PAYMENT_REQUIRED");

    const baseUrl = process.env["SPRIX_BASE_URL"] ?? "https://egy.app.spx-learning-square.com/dashboard";
    const { error: attemptError } = await supabaseAdmin.rpc("begin_sprix_binding_attempt", {
      _user_id: context.userId,
    });
    if (attemptError) throw attemptError;

    const verification = await verifySprixCredentials({
      username: data.username,
      password: data.password,
      baseUrl,
    });

    if (!verification.verified) {
      throw new Error(
        verification.errorCode === "invalid_credentials"
          ? "بيانات SPRIX غير صحيحة."
          : "تعذر التحقق من تسجيل الدخول إلى SPRIX.",
      );
    }

    await supabaseAdmin.rpc("reset_sprix_binding_attempt", {
      _user_id: context.userId,
    });

    const accountUsernameHash = hashSprixUsername(data.username);
    const { data: existing, error: existingError } = await supabaseAdmin
      .from("sprix_credentials")
      .select("user_id,account_username_hash,verification_status")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (existingError) throw existingError;

    if (
      existing?.verification_status === "verified" &&
      existing.account_username_hash &&
      existing.account_username_hash !== accountUsernameHash
    ) {
      throw new Error("SPRIX_ACCOUNT_REBIND_NOT_ALLOWED");
    }

    const { data: owner, error: ownerError } = await supabaseAdmin
      .from("sprix_credentials")
      .select("user_id")
      .eq("account_username_hash", accountUsernameHash)
      .neq("user_id", context.userId)
      .maybeSingle();
    if (ownerError) throw ownerError;
    if (owner) throw new Error("SPRIX_ACCOUNT_ALREADY_BOUND");

    await upsertSprixCredential(
      context.userId,
      encryptSprixCredentials(data),
      accountUsernameHash,
    );

    return { saved: true, verified: true };
  });

export const getMySprixCredentialStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const credential = await getSprixCredential(context.userId);
    return {
      verified: credential?.verification_status === "verified" && Boolean(credential.verified_at),
      verifiedAt: credential?.verified_at ?? null,
    };
  });

export const createSprixAgentRun = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!(await hasSprixAccess(context.userId))) throw new Error("SPRIX_PAYMENT_REQUIRED");
    const credential = await getSprixCredential(context.userId);
    if (!credential || credential.verification_status !== "verified" || !credential.verified_at) {
      throw new Error("يجب التحقق من تسجيل الدخول إلى SPRIX أولاً.");
    }
    const run = await createSprixRun(context.userId, credential.id);
    // Claim immediately so deployments with a long-lived server can start the worker
    // without exposing the browser worker to the client. Durable recovery remains
    // available through the DB lease/claim function when the process is restarted.
    const claimedRunId = await claimNextSprixRun();
    if (claimedRunId === run.id) {
      void executeClaimedSprixRun(run.id);
    }
    return { runId: run.id, status: claimedRunId === run.id ? "running" : run.status };
  });

export const getSprixAgentRun = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { runId: string }) => input)
  .handler(async ({ data, context }) => {
    return getSprixRunForUser(context.userId, data.runId);
  });

export const listMySprixAgentRuns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => listSprixRunsForUser(context.userId));

export const cancelSprixAgentRun = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { runId: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: run, error } = await supabaseAdmin.from("sprix_agent_runs").select("id,status").eq("id", data.runId).eq("user_id", context.userId).maybeSingle();
    if (error) throw error;
    if (!run) throw new Error("لم يتم العثور على المهمة.");
    if (!["queued", "paused", "running"].includes(run.status)) return { cancelled: false };
    const { error: updateError } = await supabaseAdmin.from("sprix_agent_runs").update({ status: "cancelled", finished_at: new Date().toISOString() }).eq("id", data.runId).eq("user_id", context.userId);
    if (updateError) throw updateError;
    return { cancelled: true };
  });

export const adminListSprixQuestions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAdmin])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.from("sprix_questions").select("id,platform,subject,question_text,options,correct_option_text,verification_status,verified_at,verified_by,created_at,updated_at").order("updated_at", { ascending: false }).limit(500);
    if (error) throw error;
    return data ?? [];
  });

export const adminSetSprixQuestionVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAdmin])
  .inputValidator((input: { questionId: string; status: "verified" | "rejected" | "unresolved"; correctOptionText?: string | null }) => input)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: Database["public"]["Tables"]["sprix_questions"]["Update"] = {
      verification_status: data.status,
      correct_option_text: data.correctOptionText ?? null,
      verified_at: data.status === "verified" ? new Date().toISOString() : null,
      verified_by: data.status === "verified" ? context.adminId : null,
    };
    const { data: row, error } = await supabaseAdmin.from("sprix_questions").update(patch).eq("id", data.questionId).select("*").single();
    if (error) throw error;
    await supabaseAdmin.from("admin_audit_logs").insert({ admin_id: context.adminId, action: "sprix_question_verification", metadata: { question_id: data.questionId, status: data.status } });
    return row;
  });

export const adminListSprixRuns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAdmin])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.from("sprix_agent_runs").select("id,user_id,status,questions_processed,questions_completed,unresolved_questions,error_code,error_message_safe,started_at,finished_at,last_activity_at,created_at").order("created_at", { ascending: false }).limit(200);
    if (error) throw error;
    return data ?? [];
  });

export const adminClaimAndRunNextSprixJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAdmin])
  .handler(async () => {
    const runId = await claimNextSprixRun();
    if (!runId) return { claimed: false, runId: null };
    await executeClaimedSprixRun(runId);
    return { claimed: true, runId };
  });


export const getSprixPaymentOptionsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => getSprixPaymentOptions());

export const submitSprixPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { method: "vodafone_cash" | "instapay"; senderNumber: string; screenshotPath: string }) => input)
  .handler(async ({ data, context }) => {
    return createSprixPaymentRequest({
      userId: context.userId,
      method: data.method,
      senderNumber: data.senderNumber,
      screenshotPath: data.screenshotPath,
    });
  });

export const listMySprixPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => listMySprixPaymentRequests(context.userId));

export const getMySprixAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("sprix_agent_access")
      .select("active,expires_at,source_type")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw error;
    return {
      active:
        data?.active === true &&
        (!data.expires_at || new Date(data.expires_at).getTime() > Date.now()),
      expiresAt: data?.expires_at ?? null,
      sourceType: data?.source_type ?? null,
    };
  });

export const adminListSprixPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAdmin])
  .inputValidator((input: { status?: "pending" | "confirmed" | "rejected" | "all" }) => input)
  .handler(async ({ data }) => adminListSprixPaymentRequests(data.status));

export const adminReviewSprixPaymentRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAdmin])
  .inputValidator((input: { paymentId: string; approve: boolean; reason?: string }) => input)
  .handler(async ({ data, context }) => adminReviewSprixPayment({ ...data, adminId: context.adminId }));

export const adminGetSprixPaymentProofUrl = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAdmin])
  .inputValidator((input: { path: string }) => input)
  .handler(async ({ data }) => ({ url: await createSprixPaymentProofSignedUrl(data.path) }));
