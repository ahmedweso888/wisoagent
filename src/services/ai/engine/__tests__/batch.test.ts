import assert from "node:assert/strict";
import test from "node:test";

import { generateBatch } from "../batch.server";
import { validateQuestionStructure } from "../validation-gate.server";
import { isDuplicate } from "../dedup.server";
import type { GeneratedQuestion, QuestionGenerationRequest } from "../../types";

function question(
  prompt: string,
  difficultyScore = 40,
  difficulty: GeneratedQuestion["difficulty"] = "medium",
): GeneratedQuestion {
  return {
    prompt,
    questionType: "mcq",
    difficulty,
    difficultyScore,
    options: [
      { key: "a", text: "اختيار أول" },
      { key: "b", text: "اختيار ثانٍ" },
    ],
    correctAnswer: "a",
    explanation: "شرح تفصيلي كافٍ لسبب صحة الإجابة المختارة.",
    conceptsTested: ["مفهوم"],
    commonTrap: "الخلط بين المفهومين",
    estimatedTimeSeconds: 90,
    sourceReferences: [{ documentId: null, pageNumber: 3, quote: "المنهج" }],
  } as GeneratedQuestion;
}

function request(
  count: number,
  difficulty: GeneratedQuestion["difficulty"] = "medium",
): QuestionGenerationRequest {
  return {
    subjectSlug: "arabic",
    topicIds: ["lesson-1"],
    difficulties: [difficulty],
    questionTypes: ["mcq"],
    count,
  } as QuestionGenerationRequest;
}

test("batch completes only when accepted >= requested", async () => {
  let n = 0;
  const result = await generateBatch(
    request(10),
    [],
    async (_tier, _model, _req, count) =>
      Array.from({ length: count }, () => question(`سؤال فريد رقم ${++n} عن القواعد`)),
    null,
  );
  assert.equal(result.stats.approved, 10);
  assert.equal(result.stats.remaining, 0);
  assert.ok(result.approved.length >= result.stats.requested);
});

test("rejected questions do not count as completion and remaining is tracked", async () => {
  let n = 0;
  // Every other question fails structural validation (empty explanation).
  const result = await generateBatch(
    request(6),
    [],
    async (_tier, _model, _req, count) =>
      Array.from({ length: count }, () => {
        n++;
        const q = question(`سؤال رقم ${n} عن الإعراب`);
        if (n % 2 === 0) q.explanation = "";
        return q;
      }),
    null,
  );
  assert.equal(result.stats.approved, 6, "accepted count must reach the requested count");
  assert.ok(result.stats.rejected > 0, "invalid questions must be rejected");
  assert.ok(result.stats.generated > result.stats.approved, "replacement generation must happen");
  assert.equal(result.stats.remaining, 0);
});

test("near-duplicate questions are rejected against the existing bank", async () => {
  const existing = [question("ما هو تعريف الفاعل في الجملة الفعلية؟")];
  const result = await generateBatch(
    request(1),
    existing,
    async () => [question("ما هو تعريف الفاعل في الجملة الفعلية ؟")],
    null,
  );
  assert.equal(result.stats.approved, 0);
  assert.ok(result.stats.duplicates > 0);
  assert.equal(result.stats.remaining, 1, "unfulfilled requests report the remaining count");
});

test("hard difficulty retries on Terra then escalates to Sol", async () => {
  const tiers: string[] = [];
  let n = 0;
  await generateBatch(
    request(1, "hard"),
    [],
    async (tier, _model, _req, count) => {
      tiers.push(tier);
      return Array.from({ length: count }, () => {
        n++;
        const q = question(`سؤال صعب رقم ${n}`, 65, "hard");
        // Only a Sol-generated question is valid.
        if (tier !== "sol") q.correctAnswer = "";
        return q;
      });
    },
    null,
  );
  assert.equal(tiers[0], "terra", "first attempt must be Terra");
  assert.equal(tiers[1], "terra", "one Terra retry");
  assert.equal(tiers[2], "sol", "then escalation to Sol");
});

test("nightmare generation never asks Terra", async () => {
  const tiers: string[] = [];
  let n = 0;
  await generateBatch(
    request(2, "nightmare"),
    [],
    async (tier, _model, _req, count) => {
      tiers.push(tier);
      return Array.from({ length: count }, () => question(`سؤال تعجيزي ${++n}`, 95, "nightmare"));
    },
    null,
  );
  assert.ok(tiers.length > 0);
  assert.ok(
    tiers.every((t) => t === "sol"),
    `expected only sol, got ${tiers.join(",")}`,
  );
});

test("structural validation enforces difficulty score ranges", () => {
  const bad = validateQuestionStructure(question("سؤال متوسط عن النحو", 95), "medium");
  assert.equal(bad.valid, false);
  const good = validateQuestionStructure(question("سؤال متوسط عن النحو", 45), "medium");
  assert.equal(good.valid, true);
});

test("exact duplicates after Arabic normalization are detected", () => {
  const a = question("مَا هُوَ الفاعلُ؟");
  const b = question("ما هو الفاعل ؟");
  assert.equal(isDuplicate(b, [a]).isDuplicate, true);
});
