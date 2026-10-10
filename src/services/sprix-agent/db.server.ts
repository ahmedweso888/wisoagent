import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database } from "@/integrations/supabase/types";
import { createQuestionFingerprintInput } from "./fingerprint";
import { normalizeOptionText } from "./normalization";
import type { SprixOption, SprixRunSnapshot } from "./types";

export type SprixQuestionRow = Database["public"]["Tables"]["sprix_questions"]["Row"];
export type SprixCredentialRow = Database["public"]["Tables"]["sprix_credentials"]["Row"];
export type SprixRunRow = Database["public"]["Tables"]["sprix_agent_runs"]["Row"];

export async function getSprixCredential(userId: string): Promise<SprixCredentialRow | null> {
  const { data, error } = await supabaseAdmin
    .from("sprix_credentials")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertSprixCredential(userId: string, encryptedCredentials: string, accountUsernameHash: string): Promise<void> {
  const { error } = await supabaseAdmin.from("sprix_credentials").upsert(
    {
      user_id: userId,
      credential_ciphertext: encryptedCredentials,
      encryption_version: 1,
      account_username_hash: accountUsernameHash,
      verification_status: "verified",
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
}

export async function createSprixRun(userId: string, credentialId: string): Promise<SprixRunRow> {
  const { data, error } = await supabaseAdmin
    .from("sprix_agent_runs")
    .insert({ user_id: userId, credential_id: credentialId })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function getSprixRunForUser(userId: string, runId: string): Promise<SprixRunSnapshot | null> {
  const { data, error } = await supabaseAdmin
    .from("sprix_agent_runs")
    .select("id,status,questions_processed,questions_completed,unresolved_questions,current_question_fingerprint,error_code,error_message_safe,last_activity_at")
    .eq("id", runId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    runId: data.id,
    status: data.status,
    questionsProcessed: data.questions_processed,
    questionsCompleted: data.questions_completed,
    unresolvedQuestions: data.unresolved_questions,
    currentQuestionFingerprint: data.current_question_fingerprint,
    errorCode: data.error_code,
    errorMessageSafe: data.error_message_safe,
    lastActivityAt: data.last_activity_at,
  };
}

export async function listSprixRunsForUser(userId: string): Promise<SprixRunSnapshot[]> {
  const { data, error } = await supabaseAdmin
    .from("sprix_agent_runs")
    .select("id,status,questions_processed,questions_completed,unresolved_questions,current_question_fingerprint,error_code,error_message_safe,last_activity_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []).map((row) => ({
    runId: row.id,
    status: row.status,
    questionsProcessed: row.questions_processed,
    questionsCompleted: row.questions_completed,
    unresolvedQuestions: row.unresolved_questions,
    currentQuestionFingerprint: row.current_question_fingerprint,
    errorCode: row.error_code,
    errorMessageSafe: row.error_message_safe,
    lastActivityAt: row.last_activity_at,
  }));
}

export async function findVerifiedAnswer(questionText: string, options: SprixOption[]): Promise<SprixQuestionRow | null> {
  const { fingerprint, normalizedQuestionText } = createQuestionFingerprintInput(questionText, options);
  const exact = await supabaseAdmin
    .from("sprix_questions")
    .select("*")
    .eq("platform", "sprix")
    .eq("subject", "الثقافة المالية")
    .eq("question_fingerprint", fingerprint)
    .eq("verification_status", "verified")
    .maybeSingle();
  if (exact.error) throw exact.error;
  if (exact.data) return exact.data;

  const fallback = await supabaseAdmin
    .from("sprix_questions")
    .select("*")
    .eq("platform", "sprix")
    .eq("subject", "الثقافة المالية")
    .eq("normalized_question_text", normalizedQuestionText)
    .eq("verification_status", "verified");
  if (fallback.error) throw fallback.error;

  const currentOptions = new Set(options.map((option) => normalizeOptionText(option.text)).filter(Boolean));
  const compatible = (fallback.data ?? []).filter((row) => {
    const stored = Array.isArray(row.options) ? row.options : [];
    const storedOptions = new Set(
      stored
        .map((option) => {
          if (typeof option !== "object" || option === null || Array.isArray(option)) return "";
          const text = option["text"];
          return typeof text === "string" ? normalizeOptionText(text) : "";
        })
        .filter(Boolean),
    );
    return storedOptions.size === currentOptions.size && [...currentOptions].every((value) => storedOptions.has(value));
  });

  return compatible.length === 1 ? compatible[0] ?? null : null;
}

export async function upsertUnresolvedQuestion(questionText: string, options: SprixOption[], fingerprint: string, normalizedQuestionText: string): Promise<SprixQuestionRow> {
  const { data, error } = await supabaseAdmin
    .from("sprix_questions")
    .upsert(
      {
        platform: "sprix",
        subject: "الثقافة المالية",
        question_text: questionText,
        normalized_question_text: normalizedQuestionText,
        question_fingerprint: fingerprint,
        options: options as unknown as Database["public"]["Tables"]["sprix_questions"]["Insert"]["options"],
        verification_status: "unresolved",
      },
      { onConflict: "platform,subject,question_fingerprint" },
    )
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
