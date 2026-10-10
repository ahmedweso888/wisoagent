import assert from "node:assert/strict";
import test from "node:test";
import { isDuplicate, normalizeText } from "../dedup.server";

const q = (prompt: string) =>
  ({
    prompt,
    questionType: "mcq",
    difficulty: "hard",
    difficultyScore: 70,
    options: [
      { key: "A", text: "1" },
      { key: "B", text: "2" },
    ],
    correctAnswer: "A",
    explanation: "شرح كافٍ للسؤال ويشرح الإجابة بوضوح.",
    conceptsTested: ["x"],
    commonTrap: "trap",
    estimatedTimeSeconds: 60,
    sourceReferences: [{ documentId: null, pageNumber: 1, quote: "source" }],
  }) as never;

test("Arabic normalization is deterministic", () => {
  assert.equal(normalizeText("إختبارٌ"), normalizeText("اختبار"));
});

test("exact and near duplicates are rejected", () => {
  const original = q("ما نتيجة التفاعل الكيميائي في هذه الحالة؟");
  assert.equal(isDuplicate(original, [original]).isDuplicate, false);
  assert.equal(
    isDuplicate(q("ما نتيجة التفاعل الكيميائي في هذه الحالة؟"), [original]).isDuplicate,
    true,
  );
});
