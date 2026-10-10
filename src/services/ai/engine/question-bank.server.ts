import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getUserSupabase } from "@/integrations/supabase/user-client.server";
import { isDuplicate, normalizedHash } from "./dedup.server";
import type { GeneratedQuestion, QuestionGenerationRequest } from "../types";

export type QuestionBankStats = {
  requested: number;
  reused: number;
  generated: number;
  accepted: number;
  rejected: number;
  remaining: number;
};

type BankRow = {
  id: string;
  subject_id: string | null;
  lesson_key: string | null;
  difficulty: GeneratedQuestion["difficulty"];
  difficulty_score: number;
  question_type: GeneratedQuestion["questionType"];
  prompt: string;
  options: unknown;
  correct_answer: string | null;
  explanation: string | null;
  common_trap: string | null;
  concepts: string[];
  source_label: string | null;
  source_page_from: number | null;
  source_page_to: number | null;
  fingerprint: string;
};

function bankToQuestion(row: BankRow): GeneratedQuestion {
  return {
    prompt: row.prompt,
    questionType: row.question_type,
    difficulty: row.difficulty,
    difficultyScore: Number(row.difficulty_score),
    options: Array.isArray(row.options) ? (row.options as GeneratedQuestion["options"]) : [],
    correctAnswer: row.correct_answer ?? "",
    explanation: row.explanation ?? "",
    conceptsTested: row.concepts ?? [],
    commonTrap: row.common_trap ?? "",
    estimatedTimeSeconds: 120,
    sourceReferences: [
      {
        documentId: null,
        pageNumber: row.source_page_from,
        quote: row.source_label ?? "Question Bank",
      },
    ],
  };
}

export async function loadReusableQuestions(
  userId: string,
  request: QuestionGenerationRequest,
): Promise<{ questions: GeneratedQuestion[]; rows: BankRow[] }> {
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("school_year,track")
    .eq("id", userId)
    .maybeSingle();
  if (profileError) throw profileError;

  const { data: subject, error: subjectError } = await supabaseAdmin
    .from("subjects")
    .select("id")
    .eq("slug", request.subjectSlug)
    .maybeSingle();
  if (subjectError) throw subjectError;
  if (!subject) throw new Error("subject_not_found");

  const { data: history, error: historyError } = await getUserSupabase()
    .from("student_question_history")
    .select("fingerprint")
    .eq("user_id", userId);
  if (historyError) throw historyError;
  const seen = new Set((history ?? []).map((row) => row.fingerprint));

  let query = supabaseAdmin
    .from("question_bank")
    .select(
      "id,subject_id,lesson_key,difficulty,difficulty_score,question_type,prompt,options,correct_answer,explanation,common_trap,concepts,source_label,source_page_from,source_page_to,fingerprint",
    )
    .eq("subject_id", subject.id)
    .eq("quality_status", "approved")
    .eq("language", request.language)
    .order("usage_count", { ascending: true })
    .limit(Math.max(200, request.count * 4));

  if (profile?.school_year) query = query.eq("school_year", profile.school_year);
  if (profile?.track) query = query.or(`track.is.null,track.eq.${profile.track}`);
  if (request.topicIds.length) query = query.in("lesson_key", request.topicIds);
  if (request.difficulties.length) query = query.in("difficulty", request.difficulties);

  const { data, error } = await query;
  if (error) throw error;

  const rows = (data ?? []) as unknown as BankRow[];
  const reusable: BankRow[] = [];
  const selected: GeneratedQuestion[] = [];
  for (const row of rows) {
    if (seen.has(row.fingerprint)) continue;
    const question = bankToQuestion(row);
    if (isDuplicate(question, selected).isDuplicate) continue;
    reusable.push(row);
    selected.push(question);
    if (selected.length >= request.count) break;
  }

  return { questions: selected, rows: reusable };
}

export async function persistQuestionsForStudent(
  userId: string,
  request: QuestionGenerationRequest,
  questions: GeneratedQuestion[],
  tier: string,
): Promise<GeneratedQuestion[]> {
  if (!questions.length) return [];

  const { data: subject, error: subjectError } = await supabaseAdmin
    .from("subjects")
    .select("id")
    .eq("slug", request.subjectSlug)
    .single();
  if (subjectError) throw subjectError;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("school_year,track")
    .eq("id", userId)
    .maybeSingle();

  const userSupabase = getUserSupabase();
  const delivered: GeneratedQuestion[] = [];
  for (const question of questions) {
    const fingerprint = normalizedHash(question.prompt);
    const source = question.sourceReferences[0];
    const { data: bankRow, error: bankError } = await supabaseAdmin
      .from("question_bank")
      .upsert(
        {
          subject_id: subject.id,
          lesson_key: request.topicIds[0] ?? null,
          school_year: profile?.school_year ?? null,
          track: profile?.track ?? null,
          difficulty: question.difficulty,
          difficulty_score: question.difficultyScore,
          question_type: question.questionType,
          prompt: question.prompt,
          options: question.options,
          correct_answer: question.correctAnswer,
          explanation: question.explanation,
          common_trap: question.commonTrap,
          concepts: question.conceptsTested,
          source_label: source?.quote ?? "WISO Agent",
          source_page_from: source?.pageNumber ?? null,
          source_page_to: source?.pageNumber ?? null,
          quality_status: "approved",
          ai_tier: tier,
          fingerprint,
          language: request.language,
          created_by: userId,
        },
        { onConflict: "fingerprint" },
      )
      .select("id,fingerprint")
      .single();
    if (bankError) throw bankError;

    const { data: studentQuestion, error: questionError } = await userSupabase
      .from("questions")
      .insert({
        user_id: userId,
        subject_id: subject.id,
        topic_id: request.topicIds[0] ?? null,
        prompt: question.prompt,
        question_type: question.questionType,
        difficulty: question.difficulty,
        difficulty_score: question.difficultyScore,
        options: question.options,
        correct_answer: question.correctAnswer,
        explanation: question.explanation,
        common_trap: question.commonTrap,
        estimated_time_seconds: question.estimatedTimeSeconds,
        language: request.language,
        ai_generated: true,
        ai_model: `wiso-tier:${tier}`,
        validation_status: "approved",
      })
      .select("id")
      .single();
    if (questionError) throw questionError;

    const { error: historyError } = await userSupabase
      .from("student_question_history")
      .insert({ user_id: userId, bank_question_id: bankRow.id, fingerprint });
    if (historyError) {
      // A unique fingerprint means the same question was already delivered by
      // a concurrent request; do not surface a duplicate as a successful delivery.
      if (!historyError.message.toLowerCase().includes("duplicate")) throw historyError;
      await userSupabase.from("questions").delete().eq("id", studentQuestion.id);
      continue;
    }
    delivered.push(question);
  }

  // Increase bank usage only after the student delivery was recorded.
  const fingerprints = delivered.map((question) => normalizedHash(question.prompt));
  if (!fingerprints.length) return delivered;
  const { data: bankRows } = await supabaseAdmin
    .from("question_bank")
    .select("id,usage_count,fingerprint")
    .in("fingerprint", fingerprints);
  for (const row of bankRows ?? []) {
    await supabaseAdmin
      .from("question_bank")
      .update({ usage_count: Number(row.usage_count ?? 0) + 1 })
      .eq("id", row.id);
  }
  return delivered;
}

export async function loadQuestionContext(
  userId: string,
  request: QuestionGenerationRequest,
): Promise<string> {
  const userSupabase = getUserSupabase();
  const { data, error } = await userSupabase.rpc("generation_curriculum_context", {
    _user_id: userId,
    _subject_slug: request.subjectSlug,
    _lesson_ids: request.topicIds,
  });
  if (error) throw error;
  const context = data as {
    subject?: { id: string; slug: string; name_ar: string };
    lessons?: Array<{
      id: string; title: string; unit?: string | null; page_start?: number | null; page_end?: number | null;
      concepts?: Array<{ title: string; description?: string | null; source_page?: number | null }>;
      pages?: Array<{ page_number: number; text: string }>;
    }>;
  } | null;
  if (!context?.subject || !context.lessons?.length) throw new Error("lesson_context_not_found");
  const lessonText = context.lessons.map((lesson) => {
    const concepts = (lesson.concepts ?? []).map((c) => `${c.title}: ${c.description ?? ""} [ص.${c.source_page ?? "?"}]`).join("\n");
    const pages = (lesson.pages ?? []).map((p) => `PAGE ${p.page_number}\n${p.text}`).join("\n\n");
    return `LESSON ${lesson.id}: ${lesson.title}\nUNIT: ${lesson.unit ?? ""}\nPAGES: ${lesson.page_start ?? "?"}-${lesson.page_end ?? "?"}\nCONCEPTS:\n${concepts}\nSOURCE CONTENT:\n${pages}`;
  }).join("\n\n");
  return `AUTHORIZED PUBLISHED CURRICULUM CONTEXT\nSUBJECT: ${context.subject.name_ar} (${context.subject.slug})\n${lessonText}`;
}
