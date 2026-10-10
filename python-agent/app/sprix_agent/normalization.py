from __future__ import annotations

import hashlib
import re
import unicodedata

_ARABIC_DIACRITICS = re.compile(r"[\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed]")


def normalize_arabic_text(value: str) -> str:
    value = unicodedata.normalize("NFKC", value)
    value = _ARABIC_DIACRITICS.sub("", value)
    value = re.sub(r"[إأآٱ]", "ا", value)
    value = value.replace("ى", "ي").replace("ؤ", "و").replace("ئ", "ي").replace("ـ", "")
    value = re.sub(r"[\u200b-\u200d\ufeff]", "", value)
    value = re.sub(r"[.,،؛:!?؟()[\]{}\"'`«»]", " ", value)
    value = re.sub(r"\s+", " ", value).strip()
    return value.casefold()


def normalize_option_text(value: str) -> str:
    value = re.sub(r"^\s*(?:[a-dA-Dا-دأ-د]|\d+)[.)\-:]\s*", "", value)
    return normalize_arabic_text(value)


def fingerprint(question: str, options: list[str]) -> str:
    normalized = normalize_arabic_text(question) + "\n" + "\n".join(sorted(normalize_option_text(o) for o in options if normalize_option_text(o)))
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()
