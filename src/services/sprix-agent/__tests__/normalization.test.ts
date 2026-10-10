import test from "node:test";
import assert from "node:assert/strict";
import { normalizeArabicText, normalizeOptionText } from "../normalization";

test("normalizes Arabic variants, tashkeel, punctuation and whitespace", () => {
  assert.equal(normalizeArabicText("إِنَّ  المالَ،  مهمٌ!!"), "ان المال مهم");
});

test("normalizes option labels without depending on label order", () => {
  assert.equal(normalizeOptionText("أ) الإجابة الصحيحة"), "الاجابة الصحيحة");
  assert.equal(normalizeOptionText("2. الإجابة الصحيحة"), "الاجابة الصحيحة");
});
