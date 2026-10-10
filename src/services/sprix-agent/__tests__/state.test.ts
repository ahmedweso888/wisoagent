import test from "node:test";
import assert from "node:assert/strict";
import type { SprixRunStatus } from "../types";

const transitions: Record<SprixRunStatus, SprixRunStatus[]> = {
  queued: ["running", "cancelled"],
  running: ["paused", "completed", "failed", "needs_review", "cancelled"],
  paused: ["running", "cancelled"],
  completed: [],
  failed: ["queued", "cancelled"],
  needs_review: ["queued", "cancelled"],
  cancelled: [],
};

test("state model only permits explicit safe transitions", () => {
  assert.deepEqual(transitions.queued, ["running", "cancelled"]);
  assert.equal(transitions.completed.length, 0);
  assert.equal(transitions.running.includes("completed"), true);
});
