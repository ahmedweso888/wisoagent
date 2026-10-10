import test from "node:test";
import assert from "node:assert/strict";
import { createSprixQuestionFingerprint } from "../fingerprint";

test("fingerprint is stable when option order changes", () => {
  const a = createSprixQuestionFingerprint("ما هو الادخار؟", [{ text: "أ) نعم" }, { text: "ب) لا" }]);
  const b = createSprixQuestionFingerprint("ما هو الادخار؟", [{ text: "ب) لا" }, { text: "أ) نعم" }]);
  assert.equal(a, b);
});

test("fingerprint changes when question content changes", () => {
  const a = createSprixQuestionFingerprint("ما هو الادخار؟", [{ text: "نعم" }]);
  const b = createSprixQuestionFingerprint("ما هو الاستثمار؟", [{ text: "نعم" }]);
  assert.notEqual(a, b);
});
