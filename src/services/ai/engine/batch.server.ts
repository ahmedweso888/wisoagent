/**
 * WISO question-generation completion loop.
 *
 * The completion condition is accepted >= requested. Generation/rejection
 * counts never masquerade as success. Existing questions are part of the
 * deduplication set, so the engine cannot approve a near-duplicate that is
 * already in the Question Bank or was already accepted in this request.
 */
import { routeTask } from "./router.server";
import { validationGate } from "./validation-gate.server";
import { isDuplicate } from "./dedup.server";
import { generateRequestId, logAiEvent } from "./logging.server";
import { ENGINE_CONFIG, TIER_MODEL_MAP, type DifficultyLevel, type TierId } from "./config";
import type { GeneratedQuestion, QuestionGenerationRequest } from "../types";

export type BatchResult = {
  requestId: string;
  approved: GeneratedQuestion[];
  rejected: GeneratedQuestion[];
  stats: BatchStats;
};

export type BatchStats = {
  requested: number;
  generated: number;
  validated: number;
  approved: number;
  rejected: number;
  duplicates: number;
  retries: number;
  escalations: number;
  replacementCount: number;
  rounds: number;
  remaining: number;
};

type GenerateFn = (
  tier: TierId,
  model: string,
  request: QuestionGenerationRequest,
  count: number,
) => Promise<GeneratedQuestion[]>;

type ValidateFn = (question: GeneratedQuestion) => Promise<{ passed: boolean } | null>;

export async function generateBatch(
  request: QuestionGenerationRequest,
  existingQuestions: GeneratedQuestion[],
  generateFn: GenerateFn,
  validateFn: ValidateFn | null,
  requestId = generateRequestId(),
): Promise<BatchResult> {
  const difficulty = request.difficulties[0] as DifficultyLevel | undefined;
  const approved: GeneratedQuestion[] = [];
  const rejected: GeneratedQuestion[] = [];
  const stats: BatchStats = {
    requested: request.count,
    generated: 0,
    validated: 0,
    approved: 0,
    rejected: 0,
    duplicates: 0,
    retries: 0,
    escalations: 0,
    replacementCount: 0,
    rounds: 0,
    remaining: request.count,
  };

  const duplicatePool = () => [...existingQuestions, ...approved];

  const accept = (question: GeneratedQuestion): boolean => {
    if (isDuplicate(question, duplicatePool()).isDuplicate) {
      stats.duplicates++;
      stats.rejected++;
      rejected.push(question);
      return false;
    }
    approved.push(question);
    return true;
  };

  const validateAndAccept = async (question: GeneratedQuestion): Promise<boolean> => {
    stats.validated++;
    const llmResult = validateFn ? await validateFn(question) : null;
    const gate = await validationGate(
      question,
      difficulty ?? "medium",
      duplicatePool(),
      [],
      llmResult ? { passed: llmResult.passed, checks: [] } : null,
    );
    if (!gate.valid) {
      if (gate.reasons.some((reason) => reason.startsWith("duplicate"))) stats.duplicates++;
      stats.rejected++;
      rejected.push(question);
      return false;
    }
    return accept(question);
  };

  for (let round = 1; round <= ENGINE_CONFIG.maxReplacementRounds; round++) {
    const remainingBefore = request.count - approved.length;
    if (remainingBefore <= 0) break;
    stats.rounds = round;

    const chunks = Math.ceil(remainingBefore / ENGINE_CONFIG.batchSize);
    for (let chunk = 0; chunk < chunks; chunk++) {
      const count = Math.min(ENGINE_CONFIG.batchSize, request.count - approved.length);
      if (count <= 0) break;

      const subRequest: QuestionGenerationRequest = {
        ...request,
        count,
        ...(request.excludeQuestionIds ? { excludeQuestionIds: request.excludeQuestionIds } : {}),
      };
      const routing = routeTask({
        taskType: "question_generation",
        ...(difficulty ? { difficulty } : {}),
      });
      logAiEvent({
        requestId,
        taskType: "question_generation",
        tier: routing.tier,
        model: routing.model,
        status: "generating",
        questionsGenerated: count,
        rounds: round,
      });

      let generated: GeneratedQuestion[] = [];
      try {
        generated = await generateFn(routing.tier, routing.model, subRequest, count);
      } catch (error) {
        logAiEvent({
          requestId,
          taskType: "question_generation",
          tier: routing.tier,
          model: routing.model,
          status: "error",
          error: error instanceof Error ? error.message : String(error),
        });
        continue;
      }
      stats.generated += generated.length;

      for (const question of generated) {
        const passed = await validateAndAccept(question);
        if (passed) continue;

        // Hard: exactly one Terra retry, then Sol replacement if needed.
        if (difficulty === "hard") {
          stats.retries++;
          stats.replacementCount++;
          try {
            const retry = await generateFn(
              "terra",
              TIER_MODEL_MAP.terra,
              { ...subRequest, count: 1 },
              1,
            );
            stats.generated += retry.length;
            const retryQuestion = retry[0];
            if (retryQuestion) {
              if (await validateAndAccept(retryQuestion)) continue;
            }
          } catch {
            // Escalation below is still allowed.
          }

          stats.escalations++;
          stats.replacementCount++;
          try {
            const replacement = await generateFn(
              "sol",
              TIER_MODEL_MAP.sol,
              { ...subRequest, count: 1 },
              1,
            );
            stats.generated += replacement.length;
            if (replacement[0]) await validateAndAccept(replacement[0]);
          } catch {
            // The round will calculate the remaining count and retry safely.
          }
        } else if (difficulty === "very_hard" || difficulty === "nightmare") {
          // Extreme questions are Sol-direct. A single Sol replacement is safe.
          stats.retries++;
          stats.replacementCount++;
          try {
            const replacement = await generateFn(
              "sol",
              TIER_MODEL_MAP.sol,
              { ...subRequest, count: 1 },
              1,
            );
            stats.generated += replacement.length;
            if (replacement[0]) await validateAndAccept(replacement[0]);
          } catch {
            // Continue to next replacement round.
          }
        }
      }
    }

    stats.approved = approved.length;
    stats.remaining = Math.max(0, request.count - approved.length);
    logAiEvent({
      requestId,
      taskType: "question_generation",
      status: "round_complete",
      questionsGenerated: stats.generated,
      questionsApproved: stats.approved,
      questionsRejected: stats.rejected,
      retries: stats.retries,
      escalations: stats.escalations,
      rounds: stats.rounds,
    });
    if (stats.remaining === 0) break;
  }

  stats.approved = approved.length;
  stats.remaining = Math.max(0, request.count - approved.length);
  logAiEvent({
    requestId,
    taskType: "question_generation",
    status: stats.remaining === 0 ? "batch_complete" : "batch_partial",
    questionsGenerated: stats.generated,
    questionsApproved: stats.approved,
    questionsRejected: stats.rejected,
    retries: stats.retries,
    escalations: stats.escalations,
    rounds: stats.rounds,
  });
  return { requestId, approved, rejected, stats };
}
