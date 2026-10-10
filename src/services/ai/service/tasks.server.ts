/**
 * Provider-independent Study Agent tasks. Prompts + normalized JSON schemas live
 * here; the provider is an implementation detail resolved by the runtime.
 *
 * WISO Engine integration: question generation now flows through the batch
 * orchestrator which handles routing (Luna/Terra/Sol), validation gate,
 * dedup, retry, and escalation automatically.
 */
import { runStructuredTask } from "./runtime.server";
import { generateBatch } from "../engine/batch.server";
import { reserveCredits, commitCredits, releaseCredits } from "../engine/credits.server";
import { generateRequestId } from "../engine/logging.server";
import {
  loadReusableQuestions,
  loadQuestionContext,
  persistQuestionsForStudent,
} from "../engine/question-bank.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type {
  ExtractedSyllabus,
  GeneratedPlan,
  GeneratedQuestion,
  MistakeAnalysis,
  MistakeAnalysisRequest,
  PerformanceSnapshot,
  PlannerRequest,
  QuestionGenerationRequest,
  ValidationReport,
  QuestionGenerationResult,
} from "../types";
import type { TierId } from "../engine/config";

const OBJ = (properties: Record<string, unknown>) => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});

const QUESTION_SCHEMA = OBJ({
  questions: {
    type: "array",
    items: OBJ({
      prompt: { type: "string" },
      questionType: { type: "string" },
      difficulty: { type: "string" },
      difficultyScore: { type: "number" },
      options: {
        type: "array",
        items: OBJ({ key: { type: "string" }, text: { type: "string" } }),
      },
      correctAnswer: { type: "string" },
      explanation: { type: "string" },
      conceptsTested: { type: "array", items: { type: "string" } },
      commonTrap: { type: "string" },
      estimatedTimeSeconds: { type: "number" },
      sourceReferences: {
        type: "array",
        items: OBJ({
          documentId: { type: ["string", "null"] },
          pageNumber: { type: ["number", "null"] },
          quote: { type: "string" },
        }),
      },
    }),
  },
});

const NIGHTMARE_RULES = `You are the Question Generator of an Arabic study platform.
Hard means: deep understanding, multi-concept transfer, hidden assumptions, common misconceptions, edge cases and reasoning.
NEVER make a question hard by adding pointless numbers or length. NEVER go outside the student's syllabus. NEVER produce ambiguous or impossible questions.
Every question needs difficultyScore, conceptsTested, correctAnswer, explanation, sourceReferences, commonTrap and estimatedTimeSeconds.`;

/** Difficulties that are locked behind a server-side entitlement. */
const EXTREME_DIFFICULTIES = new Set(["nightmare", "very_hard"]);

export class NotEntitledError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotEntitledError";
  }
}

/**
 * Server-side authorization gate for a generation request.
 * Runs before credit reservation, tier routing and any provider invocation.
 */
async function assertGenerationAllowed(request: QuestionGenerationRequest): Promise<void> {
  const supabase = (await import("@/integrations/supabase/user-client.server")).getUserSupabase();

  const { data: flag } = await supabase
    .from("feature_flags")
    .select("enabled")
    .eq("flag_key", "ai_question_generation")
    .maybeSingle();
  if (flag && flag.enabled === false) {
    throw new NotEntitledError("generation_disabled");
  }

  const wantsExtreme =
    request.nightmareMode === true || request.difficulties.some((d) => EXTREME_DIFFICULTIES.has(d));
  if (!wantsExtreme) return;

  const { data: state, error } = await supabase.rpc("my_wallet_state");
  if (error) throw new Error(`entitlement_check_failed: ${error.message}`);
  const entitled = Boolean(
    (state as { extreme_difficulty_enabled?: boolean })?.extreme_difficulty_enabled,
  );
  if (!entitled) {
    throw new NotEntitledError("extreme_difficulty_locked");
  }
}

/**
 * Generate questions through the WISO batch orchestrator.
 * Handles: routing (Luna/Terra/Sol), validation gate, dedup, retry, escalation.
 * Credit reservation is handled atomically via the credits module.
 */
export async function generateQuestionsTaskDetailed(
  userId: string,
  request: QuestionGenerationRequest,
): Promise<QuestionGenerationResult> {
  if (!request.subjectSlug || !request.topicIds.length || !request.difficulties.length) {
    throw new Error("subject, lesson and difficulty are required");
  }
  if (!Number.isInteger(request.count) || request.count < 1 || request.count > 500) {
    throw new Error("invalid question count");
  }

  // Entitlement + feature gates run BEFORE any credit reservation or AI call,
  // so an unauthorized "تعجيزي" request can never cost money.
  await assertGenerationAllowed(request);

  const requestId = generateRequestId();
  const reservation = await reserveCredits(userId, requestId, "questions", request.count);
  let committed = false;
  try {
    const reusable = await loadReusableQuestions(userId, request);
    const academicContext = await loadQuestionContext(userId, request);
    const reused = reusable.questions.slice(0, request.count);
    const missing = Math.max(0, request.count - reused.length);

    const generateFn = async (
      _tier: TierId,
      _model: string,
      req: QuestionGenerationRequest,
      count: number,
    ): Promise<GeneratedQuestion[]> => {
      const result = await runStructuredTask<{ questions: GeneratedQuestion[] }>({
        userId,
        agent: "question_generation",
        call: {
          system: NIGHTMARE_RULES,
          user: `Generate ${count} questions.\n${academicContext}\nRequest: ${JSON.stringify(req)}\nLanguage: ${req.language}. Nightmare mode: ${req.nightmareMode}. Source references MUST use only the supplied source anchors.`,
          schemaName: "generated_questions",
          jsonSchema: QUESTION_SCHEMA,
        },
        counts: { questionsGenerated: count },
        difficulty: req.difficulties[0],
        requestId,
      });
      return result.questions ?? [];
    };

    const validateFn = async (question: GeneratedQuestion): Promise<{ passed: boolean } | null> => {
      try {
        const report = await validateQuestionTask(userId, question, requestId);
        return { passed: report.passed };
      } catch {
        return null;
      }
    };

    const generated = missing
      ? await generateBatch(
          { ...request, count: missing, excludeQuestionIds: request.excludeQuestionIds },
          reusable.questions,
          generateFn,
          validateFn,
          requestId,
        )
      : {
          requestId,
          approved: [] as GeneratedQuestion[],
          rejected: [] as GeneratedQuestion[],
          stats: {
            requested: 0,
            generated: 0,
            validated: 0,
            approved: 0,
            rejected: 0,
            duplicates: 0,
            retries: 0,
            escalations: 0,
            replacementCount: 0,
            rounds: 0,
            remaining: 0,
          },
        };

    const finalQuestions = [...reused, ...generated.approved].slice(0, request.count);
    const deliveredQuestions = await persistQuestionsForStudent(
      userId,
      request,
      finalQuestions,
      request.difficulties[0] === "nightmare" || request.difficulties[0] === "very_hard"
        ? "sol"
        : "terra",
    );

    const stats = {
      requested: request.count,
      reused: reused.length,
      generated: generated.stats.generated,
      accepted: deliveredQuestions.length,
      rejected: generated.stats.rejected,
      remaining: Math.max(0, request.count - deliveredQuestions.length),
      retries: generated.stats.retries,
      escalations: generated.stats.escalations,
      replacementCount: generated.stats.replacementCount,
      rounds: generated.stats.rounds,
      status:
        deliveredQuestions.length >= request.count ? ("completed" as const) : ("partial" as const),
    };

    const { data: subject } = await supabaseAdmin
      .from("subjects")
      .select("id")
      .eq("slug", request.subjectSlug)
      .maybeSingle();
    await supabaseAdmin.from("ai_jobs").upsert({
      request_id: requestId,
      user_id: userId,
      subject_id: subject?.id ?? null,
      lesson_key: request.topicIds[0] ?? null,
      difficulty: request.difficulties[0] ?? "medium",
      requested_count: stats.requested,
      reused_count: stats.reused,
      generated_count: stats.generated,
      accepted_count: stats.accepted,
      rejected_count: stats.rejected,
      remaining_count: stats.remaining,
      retry_count: stats.retries,
      replacement_count: stats.replacementCount,
      tier:
        request.difficulties[0] === "nightmare" || request.difficulties[0] === "very_hard"
          ? "sol"
          : "terra",
      status: stats.status,
    });

    await commitCredits(reservation.id, finalQuestions.length);
    committed = true;
    return { requestId, questions: deliveredQuestions, stats };
  } catch (error) {
    if (!committed) await releaseCredits(reservation.id);
    throw error;
  }
}

export async function generateQuestionsTask(
  userId: string,
  request: QuestionGenerationRequest,
): Promise<GeneratedQuestion[]> {
  const result = await generateQuestionsTaskDetailed(userId, request);
  return result.questions;
}

export async function validateQuestionTask(
  userId: string,
  question: GeneratedQuestion,
  requestId?: string,
): Promise<ValidationReport> {
  return runStructuredTask<ValidationReport>({
    userId,
    agent: "question_validation",
    call: {
      system:
        "You are the Question Validator. Reject questions that are out of syllabus, unanswerable, have multiple correct answers, contradict their explanation, are duplicates, or whose difficulty is meaningless.",
      user: `Validate this question:\n${JSON.stringify(question)}`,
      schemaName: "validation_report",
      jsonSchema: OBJ({
        passed: { type: "boolean" },
        checks: {
          type: "array",
          items: OBJ({
            check: { type: "string" },
            passed: { type: "boolean" },
            note: { type: "string" },
          }),
        },
      }),
    },
    requestId,
  });
}

export async function generatePlanTask(
  userId: string,
  request: PlannerRequest,
): Promise<GeneratedPlan> {
  const [masteryResult, mistakesResult, progressResult, topicsResult] = await Promise.all([
    supabaseAdmin
      .from("mastery")
      .select("subject_id,topic_id,concept_id,mastery_score,accuracy,questions_solved,is_weak")
      .eq("user_id", userId)
      .order("mastery_score", { ascending: true })
      .limit(100),
    supabaseAdmin
      .from("mistakes")
      .select("question_id,concept_id,subject_id,mistake_type,ai_analysis,resolved,created_at")
      .eq("user_id", userId)
      .eq("resolved", false)
      .order("created_at", { ascending: false })
      .limit(100),
    supabaseAdmin
      .from("daily_progress")
      .select("day,questions_solved,correct_answers,hard_solved,nightmare_solved,study_minutes")
      .eq("user_id", userId)
      .order("day", { ascending: false })
      .limit(14),
    supabaseAdmin
      .from("topics")
      .select("id,title,subject_id,estimated_minutes,completed")
      .eq("user_id", userId)
      .in(
        "subject_id",
        (
          await supabaseAdmin.from("subjects").select("id").in("slug", request.subjectSlugs)
        ).data?.map((row) => row.id) ?? [],
      )
      .limit(500),
  ]);
  const adaptiveContext = JSON.stringify({
    mastery: masteryResult.data ?? [],
    unresolvedMistakes: mistakesResult.data ?? [],
    recentProgress: progressResult.data ?? [],
    availableTopics: topicsResult.data ?? [],
  });

  const plan = await runStructuredTask<GeneratedPlan>({
    userId,
    agent: "study_planning",
    call: {
      system:
        "You are the WISO Study Planner. Plan backwards from the student's deadline. Finish the syllabus first, then revision and high-difficulty practice. Use the supplied performance/mastery/mistake context; never invent completed work or mastery.",
      user: `Build the adaptive plan for: ${JSON.stringify(request)}\nREAL STUDENT ADAPTIVE CONTEXT: ${adaptiveContext}`,
      schemaName: "generated_plan",
      jsonSchema: OBJ({
        deadline: { type: "string" },
        dailyHoursTarget: { type: "number" },
        items: {
          type: "array",
          items: OBJ({
            level: { type: "string" },
            phase: { type: "string" },
            title: { type: "string" },
            notes: { type: "string" },
            subjectSlug: { type: "string" },
            topicId: { type: ["string", "null"] },
            startsOn: { type: "string" },
            endsOn: { type: "string" },
            estimatedMinutes: { type: "number" },
            questionTarget: { type: "number" },
            targetDifficulty: { type: "string" },
          }),
        },
      }),
    },
  });

  const { data: subjects } = await supabaseAdmin
    .from("subjects")
    .select("id,slug")
    .in("slug", request.subjectSlugs);
  const subjectBySlug = new Map((subjects ?? []).map((row) => [row.slug, row.id]));

  const userSupabase = (
    await import("@/integrations/supabase/user-client.server")
  ).getUserSupabase();
  await userSupabase
    .from("study_plans")
    .update({ is_active: false })
    .eq("user_id", userId)
    .eq("is_active", true);
  const { data: createdPlan, error: planError } = await userSupabase
    .from("study_plans")
    .insert({
      user_id: userId,
      title: "خطة WISO المتكيفة",
      deadline: plan.deadline,
      daily_hours_target: plan.dailyHoursTarget,
      ai_generated: true,
      is_active: true,
    })
    .select("id")
    .single();
  if (planError) throw planError;

  const items = plan.items.map((item, index) => ({
    plan_id: createdPlan.id,
    user_id: userId,
    level: item.level,
    phase: item.phase,
    subject_id: item.subjectSlug ? (subjectBySlug.get(item.subjectSlug) ?? null) : null,
    topic_id: item.topicId ?? null,
    title: item.title,
    notes: item.notes ?? null,
    starts_on: item.startsOn || null,
    ends_on: item.endsOn || null,
    estimated_minutes: Math.max(1, Math.round(item.estimatedMinutes)),
    question_target: Math.max(0, Math.round(item.questionTarget)),
    target_difficulty: item.targetDifficulty,
    completed: false,
    ai_generated: true,
    sort_order: index,
  }));
  if (items.length) {
    const { error: itemError } = await userSupabase.from("study_plan_items").insert(items);
    if (itemError) throw itemError;
  }
  return plan;
}

const SYLLABUS_SCHEMA = OBJ({
  subjectSlug: { type: "string" },
  documentId: { type: "string" },
  units: {
    type: "array",
    items: OBJ({
      title: { type: "string" },
      chapters: {
        type: "array",
        items: OBJ({
          title: { type: "string" },
          pageFrom: { type: ["number", "null"] },
          pageTo: { type: ["number", "null"] },
          topics: {
            type: "array",
            items: OBJ({
              title: { type: "string" },
              estimatedMinutes: { type: "number" },
              concepts: {
                type: "array",
                items: OBJ({
                  title: { type: "string" },
                  description: { type: "string" },
                  difficulty: { type: "string" },
                  learningObjectives: {
                    type: "array",
                    items: OBJ({ statement: { type: "string" } }),
                  },
                  sourceReferences: {
                    type: "array",
                    items: OBJ({
                      documentId: { type: ["string", "null"] },
                      pageNumber: { type: ["number", "null"] },
                      quote: { type: "string" },
                    }),
                  },
                }),
              },
            }),
          },
        }),
      },
    }),
  },
});

export async function analyzeDocumentTask(
  userId: string,
  input: { documentId: string; text?: string; kind: "document" | "image" },
): Promise<ExtractedSyllabus> {
  return runStructuredTask<ExtractedSyllabus>({
    userId,
    agent: "concept_extraction",
    bulk: true,
    call: {
      system:
        "You are the Syllabus Agent. Map the material into units/chapters/topics/concepts. Every concept MUST carry a source reference; drop anything you cannot source.",
      user: `Document id: ${input.documentId}\nKind: ${input.kind}\n${input.text ?? ""}`,
      schemaName: "extracted_syllabus",
      jsonSchema: SYLLABUS_SCHEMA,
    },
    counts: input.kind === "image" ? { imagesAnalyzed: 1 } : { documentsAnalyzed: 1 },
  });
}

export async function analyzeMistakesTask(
  userId: string,
  request: MistakeAnalysisRequest,
): Promise<MistakeAnalysis[]> {
  const result = await runStructuredTask<{ analyses: MistakeAnalysis[] }>({
    userId,
    agent: "mistake_analysis",
    call: {
      system:
        "You are the Mistake Analyzer. Classify each mistake, detect repeated patterns and point at the weak concepts to re-test.",
      user: JSON.stringify(request),
      schemaName: "mistake_analyses",
      jsonSchema: OBJ({
        analyses: {
          type: "array",
          items: OBJ({
            questionId: { type: "string" },
            mistakeType: { type: "string" },
            analysis: { type: "string" },
            weakConceptIds: { type: "array", items: { type: "string" } },
          }),
        },
      }),
    },
  });
  return result.analyses ?? [];
}

export async function performanceTask(
  userId: string,
  payload: unknown,
): Promise<PerformanceSnapshot> {
  return runStructuredTask<PerformanceSnapshot>({
    userId,
    agent: "performance_analysis",
    call: {
      system:
        "You are the Performance Analyzer. Compute mastery, accuracy and the weakest concepts from the attempt data.",
      user: JSON.stringify(payload ?? {}),
      schemaName: "performance_snapshot",
      jsonSchema: OBJ({
        overallMastery: { type: "number" },
        accuracy: { type: "number" },
        questionsSolved: { type: "number" },
        hardSolved: { type: "number" },
        nightmareSolved: { type: "number" },
        averageTimeSeconds: { type: "number" },
        weakConcepts: {
          type: "array",
          items: OBJ({
            conceptId: { type: "string" },
            title: { type: "string" },
            masteryScore: { type: "number" },
          }),
        },
      }),
    },
  });
}
