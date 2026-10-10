import { decryptSprixCredentials } from "./credentials.server";
import { getSprixCredential } from "./db.server";
import { executeSprixInWorker } from "./python-client.server";
import { normalizeArabicText } from "./normalization";
import type { SprixWorkerResult } from "./types";

const DEFAULT_TIMEOUT_MS = 20 * 60 * 1000;
const DEFAULT_MAX_QUESTIONS = 500;
const LEASE_MS = 2 * 60 * 60 * 1000;
const DEFAULT_MAX_RETRIES = 2;

function baseUrl(): string {
  return (process.env["SPRIX_BASE_URL"] ?? "https://egy.app.spx-learning-square.com/dashboard").replace(/\/$/, "") + "/";
}

function maxQuestions(): number {
  const value = Number(process.env["SPRIX_AGENT_MAX_QUESTIONS"] ?? DEFAULT_MAX_QUESTIONS);
  return Number.isInteger(value) && value > 0 && value <= 5000 ? value : DEFAULT_MAX_QUESTIONS;
}

function timeoutMs(): number {
  const value = Number(process.env["SPRIX_AGENT_TIMEOUT_MS"] ?? DEFAULT_TIMEOUT_MS);
  return Number.isInteger(value) && value >= 60_000 && value <= 60 * 60 * 1000 ? value : DEFAULT_TIMEOUT_MS;
}

function maxRetries(): number {
  const value = Number(process.env["SPRIX_AGENT_MAX_RETRIES"] ?? DEFAULT_MAX_RETRIES);
  return Number.isInteger(value) && value >= 0 && value <= 5 ? value : DEFAULT_MAX_RETRIES;
}

export async function claimNextSprixRun(): Promise<string | null> {
  const { data, error } = await (await import("@/integrations/supabase/client.server")).supabaseAdmin.rpc("claim_next_sprix_agent_run", {
    _lease_seconds: Math.ceil(LEASE_MS / 1000),
  });
  if (error) throw error;
  return typeof data === "string" ? data : null;
}

export async function executeClaimedSprixRun(runId: string): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: run, error } = await supabaseAdmin.from("sprix_agent_runs").select("id,user_id,credential_id,status").eq("id", runId).maybeSingle();
  if (error) throw error;
  if (!run || run.status !== "running") return;

  const credential = await getSprixCredential(run.user_id);
  if (!credential) {
    await markRunFailure(runId, "credentials_missing", "تعذر العثور على بيانات تسجيل الدخول المحفوظة.");
    return;
  }

  try {
    const credentials = decryptSprixCredentials(credential.credential_ciphertext);
    await supabaseAdmin.from("sprix_credentials").update({ last_used_at: new Date().toISOString() }).eq("id", credential.id);

    const { data: verifiedRows, error: verifiedError } = await supabaseAdmin
      .from("sprix_questions")
      .select("question_fingerprint,normalized_question_text,correct_option_text")
      .eq("platform", "sprix")
      .eq("subject", "الثقافة المالية")
      .eq("verification_status", "verified");
    if (verifiedError) throw verifiedError;

    const verifiedAnswers = (verifiedRows ?? [])
      .filter((row) => typeof row.correct_option_text === "string" && row.correct_option_text.length > 0)
      .map((row) => ({
        fingerprint: row.question_fingerprint,
        normalizedQuestionText: row.normalized_question_text,
        correctOptionText: row.correct_option_text as string,
      }));

    let result: SprixWorkerResult | undefined;
    let lastError: unknown = null;
    for (let attempt = 0; attempt <= maxRetries(); attempt += 1) {
      try {
        result = await executeSprixInWorker({
          runId,
          username: credentials.username,
          password: credentials.password,
          baseUrl: baseUrl(),
          subject: "الثقافة المالية",
          timeoutMs: timeoutMs(),
          maxQuestions: maxQuestions(),
          verifiedAnswers,
        });
        lastError = null;
        break;
      } catch (error) {
        lastError = error;
        if (attempt >= maxRetries()) throw error;
        console.warn("[SPRIX] retry", { runId, attempt: attempt + 1 });
        await new Promise((resolve) => setTimeout(resolve, Math.min(2_000 * (attempt + 1), 6_000)));
      }
    }
    if (!result) throw lastError instanceof Error ? lastError : new Error("sprix_worker_no_result");

    const status = result.status === "completed" ? "completed" : result.status === "needs_review" ? "needs_review" : "failed";
    let currentQuestionId: string | null = null;
    if (result.status === "needs_review" && result.unresolvedQuestionText && result.currentQuestionFingerprint) {
      const unresolvedOptions = (result.unresolvedQuestionOptions ?? []).map((text) => ({ text }));
      const { data: questionRow, error: questionError } = await supabaseAdmin
        .from("sprix_questions")
        .upsert({
          platform: "sprix",
          subject: "الثقافة المالية",
          question_text: result.unresolvedQuestionText,
          normalized_question_text: normalizeArabicText(result.unresolvedQuestionText),
          question_fingerprint: result.currentQuestionFingerprint,
          options: unresolvedOptions,
          verification_status: "unresolved",
        }, { onConflict: "platform,subject,question_fingerprint" })
        .select("id")
        .single();
      if (questionError) throw questionError;
      currentQuestionId = questionRow.id;
      await supabaseAdmin.from("sprix_agent_run_items").upsert({
        run_id: runId,
        question_id: currentQuestionId,
        question_fingerprint: result.currentQuestionFingerprint,
        status: "unresolved",
      }, { onConflict: "run_id,question_fingerprint" });
    }
    await supabaseAdmin.from("sprix_agent_runs").update({
      status,
      questions_processed: result.questionsProcessed,
      questions_completed: result.questionsCompleted,
      unresolved_questions: result.unresolvedQuestions,
      error_code: result.errorCode ?? null,
      current_question_id: currentQuestionId,
      current_question_fingerprint: result.currentQuestionFingerprint ?? null,
      worker_lease_until: null,
      error_message_safe: result.errorMessageSafe ?? null,
      finished_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
    }).eq("id", runId);
  } catch (error) {
    await markRunFailure(runId, "worker_error", "حدث خطأ أثناء تشغيل وكيل SPRIX. حاول مرة أخرى.");
    console.error("[SPRIX] worker failure", error instanceof Error ? error.message : String(error));
  }
}

async function markRunFailure(runId: string, errorCode: string, safeMessage: string): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("sprix_agent_runs").update({
    status: "failed",
    worker_lease_until: null,
    error_code: errorCode,
    error_message_safe: safeMessage,
    finished_at: new Date().toISOString(),
    last_activity_at: new Date().toISOString(),
  }).eq("id", runId);
}
