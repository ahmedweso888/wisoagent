from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .normalization import fingerprint, normalize_arabic_text, normalize_option_text


@dataclass(frozen=True)
class SprixOption:
    text: str
    locator: Any


@dataclass(frozen=True)
class SprixQuestion:
    text: str
    options: list[SprixOption]
    fingerprint: str


class FinancialLiteracyAdapter:
    """DOM adapter for SPRIX Financial Literacy.

    The target site could not be inspected from this environment (its public page
    currently rejects automated fetching with HTTP 403). Therefore this adapter
    deliberately avoids fabricated CSS/XPath selectors. It discovers visible
    controls from semantic text/roles and stops safely when the structure is not
    unambiguous.
    """

    subject = "الثقافة المالية"

    async def open_subject(self, page: Any) -> None:
        candidates = page.get_by_text(self.subject, exact=True)
        count = await candidates.count()
        visible = []
        for i in range(count):
            item = candidates.nth(i)
            if await item.is_visible():
                visible.append(item)
        if len(visible) != 1:
            raise RuntimeError("subject_not_found_or_ambiguous")
        await visible[0].click()
        await page.wait_for_load_state("domcontentloaded")

    async def extract_question(self, page: Any) -> SprixQuestion:
        # Prefer semantic question-like elements, then visible text blocks. This is
        # intentionally conservative: ambiguity raises instead of guessing.
        candidates = page.locator("[role='heading'], h1, h2, h3, h4, p, label, legend")
        texts: list[str] = []
        locators: list[Any] = []
        for i in range(min(await candidates.count(), 200)):
            node = candidates.nth(i)
            if not await node.is_visible():
                continue
            text = (await node.inner_text()).strip()
            if 15 <= len(text) <= 1000 and "؟" in text:
                texts.append(text)
                locators.append(node)
        if not texts:
            raise RuntimeError("question_not_found")
        # Longest visible question-mark text is the least ambiguous generic signal.
        question_text = max(texts, key=len)

        option_candidates = page.locator("[role='radio'], input[type='radio'] + label, label, button")
        options: list[SprixOption] = []
        seen: set[str] = set()
        for i in range(min(await option_candidates.count(), 100)):
            node = option_candidates.nth(i)
            if not await node.is_visible():
                continue
            text = (await node.inner_text()).strip()
            normalized = normalize_arabic_text(text)
            if not normalized or normalized == normalize_arabic_text(question_text):
                continue
            if len(text) > 500 or normalized in seen:
                continue
            # Candidate must be a selectable control, not arbitrary page copy.
            tag = await node.evaluate("el => el.tagName.toLowerCase()")
            role = await node.get_attribute("role")
            input_type = await node.get_attribute("type")
            if role not in {"radio", "option"} and tag not in {"button", "label"} and input_type != "radio":
                continue
            seen.add(normalized)
            options.append(SprixOption(text=text, locator=node))
        if len(options) < 2:
            raise RuntimeError("options_not_found_or_ambiguous")
        return SprixQuestion(question_text, options, fingerprint(question_text, [o.text for o in options]))

    async def select_answer(self, question: SprixQuestion, answer_text: str) -> None:
        normalized_answer = normalize_option_text(answer_text)
        matches = [o for o in question.options if normalize_option_text(o.text) == normalized_answer]
        if len(matches) != 1:
            raise RuntimeError("answer_option_not_found_or_ambiguous")
        await matches[0].locator.click()

    async def next_or_complete(self, page: Any) -> bool:
        # Use accessible button names only. The exact site DOM is intentionally not
        # assumed. Return True when a next/continue control was clicked; False means
        # no such control exists and the caller must verify completion separately.
        for label in ("التالي", "متابعة", "التالي >", "Next", "Continue"):
            buttons = page.get_by_role("button", name=label, exact=True)
            count = await buttons.count()
            for i in range(count):
                button = buttons.nth(i)
                if await button.is_visible() and await button.is_enabled():
                    await button.click()
                    return True
        return False

    async def detect_completion(self, page: Any) -> bool:
        markers = ("تم إكمال", "اكتمل الاختبار", "completed", "complete")
        body = normalize_arabic_text(await page.locator("body").inner_text())
        return any(normalize_arabic_text(marker) in body for marker in markers)
