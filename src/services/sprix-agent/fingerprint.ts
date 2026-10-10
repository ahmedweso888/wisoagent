import { createHash } from "node:crypto";
import { normalizeArabicText, normalizeOptionText } from "./normalization";
import type { SprixOption } from "./types";

export function createSprixQuestionFingerprint(questionText: string, options: SprixOption[]): string {
  const normalizedQuestion = normalizeArabicText(questionText);
  const normalizedOptions = options
    .map((option) => normalizeOptionText(option.text))
    .filter(Boolean)
    .sort();

  return createHash("sha256")
    .update(`${normalizedQuestion}\n${normalizedOptions.join("\n")}`, "utf8")
    .digest("hex");
}

export function createQuestionFingerprintInput(questionText: string, options: SprixOption[]) {
  return {
    normalizedQuestionText: normalizeArabicText(questionText),
    fingerprint: createSprixQuestionFingerprint(questionText, options),
  };
}
