const ARABIC_DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;

/** Normalize Arabic/Unicode text without changing semantic characters. */
export function normalizeArabicText(value: string): string {
  return value
    .normalize("NFKC")
    .replace(ARABIC_DIACRITICS, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ـ/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[\u0660-\u0669]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (digit) => String(digit.charCodeAt(0) - 0x06F0))
    .replace(/[\u0640]/g, "")
    .replace(/[.,،؛:!?؟()[\]{}"'`«»]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("ar");
}

export function normalizeOptionText(value: string): string {
  return normalizeArabicText(value.replace(/^\s*(?:[a-dA-Dا-دأ-د]|\d+)[.)\-:]\s*/u, ""));
}
