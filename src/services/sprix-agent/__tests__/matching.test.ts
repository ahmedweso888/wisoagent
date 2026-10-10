import test from "node:test";
import assert from "node:assert/strict";
import { createQuestionFingerprintInput } from "../fingerprint";

test("option-order changes do not change the fingerprint input", () => {
  const first = createQuestionFingerprintInput("اختر الإجابة الصحيحة", [{ text: "نعم" }, { text: "لا" }]);
  const second = createQuestionFingerprintInput("اختر الإجابة الصحيحة", [{ text: "لا" }, { text: "نعم" }]);
  assert.equal(first.fingerprint, second.fingerprint);
});
