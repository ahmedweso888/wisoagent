import {
  BULK_TASK_TYPES,
  SOL_DIRECT_DIFFICULTIES,
  TERRA_DIFFICULTIES,
  TERRA_TASK_TYPES,
  TIER_MODEL_MAP,
  type DifficultyLevel,
  type RoutingDecision,
  type TaskType,
} from "./config";

export type RouteInput = {
  taskType: TaskType;
  difficulty?: DifficultyLevel | undefined;
  bulk?: boolean | undefined;
};

/** One server-side routing decision point. No caller can select a model. */
export function routeTask(input: RouteInput): RoutingDecision {
  if (input.bulk || BULK_TASK_TYPES.has(input.taskType)) {
    return { tier: "luna", model: TIER_MODEL_MAP.luna, routingReason: "bulk_preprocessing" };
  }
  if (input.difficulty && SOL_DIRECT_DIFFICULTIES.has(input.difficulty)) {
    return {
      tier: "sol",
      model: TIER_MODEL_MAP.sol,
      routingReason: "extreme_difficulty_direct_sol",
    };
  }
  if (input.difficulty && TERRA_DIFFICULTIES.has(input.difficulty)) {
    return {
      tier: "terra",
      model: TIER_MODEL_MAP.terra,
      routingReason: "standard_difficulty_terra",
    };
  }
  if (TERRA_TASK_TYPES.has(input.taskType)) {
    return {
      tier: "terra",
      model: TIER_MODEL_MAP.terra,
      routingReason: "standard_educational_task",
    };
  }
  return { tier: "terra", model: TIER_MODEL_MAP.terra, routingReason: "default_terra" };
}
