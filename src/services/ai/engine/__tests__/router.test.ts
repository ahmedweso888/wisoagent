import assert from "node:assert/strict";
import test from "node:test";
import { routeTask } from "../router.server";

const cases = [
  ["question_generation", "basic", "terra"],
  ["question_generation", "medium", "terra"],
  ["question_generation", "hard", "terra"],
  ["question_generation", "very_hard", "sol"],
  ["question_generation", "nightmare", "sol"],
  ["concept_extraction", undefined, "luna"],
  ["curriculum_analysis", undefined, "luna"],
  ["study_planning", undefined, "terra"],
] as const;

test("WISO routing policy", () => {
  for (const [taskType, difficulty, tier] of cases) {
    assert.equal(
      routeTask({ taskType: taskType as never, difficulty: difficulty as never }).tier,
      tier,
    );
  }
});

test("nightmare never detours through Terra", () => {
  assert.equal(routeTask({ taskType: "question_generation", difficulty: "nightmare" }).tier, "sol");
});
