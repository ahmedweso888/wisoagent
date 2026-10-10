/** Central WISO AI Engine configuration. Tiers are internal routing levels. */
export type TierId = "luna" | "terra" | "sol";

export type TaskType =
  | "question_generation"
  | "question_validation"
  | "study_planning"
  | "study_plan_redesign"
  | "curriculum_analysis"
  | "concept_extraction"
  | "performance_analysis"
  | "mistake_analysis"
  | "mastery_analysis"
  | "similarity_analysis";

export type RoutingDecision = { tier: TierId; model: string; routingReason: string };

export const TIER_MODEL_MAP: Record<TierId, string> = {
  luna: "openai/gpt-5.6-luna",
  terra: "openai/gpt-5.6-terra",
  sol: "openai/gpt-5.6-sol",
};

export const TIER_REASONING_EFFORT: Record<TierId, "none" | "low" | "medium" | "high"> = {
  luna: "none",
  terra: "low",
  sol: "high",
};

export const ENGINE_CONFIG = {
  batchSize: 5,
  maxTerraRetries: 1,
  maxSolRetries: 1,
  duplicateSimilarityThreshold: 0.85,
  duplicateExactHash: true,
  requestTimeoutMs: 75_000,
  maxReplacementRounds: 8,
} as const;

export type DifficultyLevel = "basic" | "medium" | "hard" | "very_hard" | "nightmare";

export const SOL_DIRECT_DIFFICULTIES: ReadonlySet<DifficultyLevel> = new Set([
  "very_hard",
  "nightmare",
]);
export const TERRA_DIFFICULTIES: ReadonlySet<DifficultyLevel> = new Set([
  "basic",
  "medium",
  "hard",
]);
export const BULK_TASK_TYPES: ReadonlySet<TaskType> = new Set([
  "curriculum_analysis",
  "concept_extraction",
]);
export const TERRA_TASK_TYPES: ReadonlySet<TaskType> = new Set([
  "question_generation",
  "question_validation",
  "study_planning",
  "study_plan_redesign",
  "performance_analysis",
  "mistake_analysis",
  "mastery_analysis",
  "similarity_analysis",
]);
