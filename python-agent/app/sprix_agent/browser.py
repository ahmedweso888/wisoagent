from __future__ import annotations

from typing import Any

from .adapter import FinancialLiteracyAdapter
from .normalization import normalize_arabic_text
from .schemas import SprixAnswer


class SprixBrowserRunner:
    def __init__(self, base_url: str, timeout_ms: int) -> None:
        self.base_url = base_url
        self.timeout_ms = timeout_ms
        self.adapter = FinancialLiteracyAdapter()

    async def verify_login(self, username: str, password: str) -> dict[str, Any]:
        try:
            from playwright.async_api import async_playwright
        except ImportError as exc:
            raise RuntimeError("playwright_not_installed") from exc

        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch(headless=True)
            context = await browser.new_context()
            page = await context.new_page()
            page.set_default_timeout(min(self.timeout_ms, 60_000))
            try:
                await page.goto(self.base_url, wait_until="domcontentloaded", timeout=self.timeout_ms)
                await self._login(page, username, password)
                return {"verified": True, "errorCode": None}
            except RuntimeError as exc:
                return {"verified": False, "errorCode": str(exc)}
            finally:
                await context.close()
                await browser.close()

    async def run(self, username: str, password: str, max_questions: int, answers: list[SprixAnswer]) -> dict[str, Any]:
        try:
            from playwright.async_api import async_playwright
        except ImportError as exc:
            raise RuntimeError("playwright_not_installed") from exc

        answer_by_fingerprint = {item.fingerprint: item.correct_option_text for item in answers}
        by_question: dict[str, str] = {}
        for item in answers:
            by_question[item.normalized_question_text] = item.correct_option_text

        processed = 0
        completed = 0
        unresolved = 0
        current_fingerprint: str | None = None

        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch(headless=True)
            context = await browser.new_context()
            page = await context.new_page()
            page.set_default_timeout(min(self.timeout_ms, 60_000))
            try:
                await page.goto(self.base_url, wait_until="domcontentloaded", timeout=self.timeout_ms)
                await self._login(page, username, password)
                await self.adapter.open_subject(page)

                for _ in range(max_questions):
                    if await self.adapter.detect_completion(page):
                        return self._completed(processed, completed, unresolved)

                    question = await self.adapter.extract_question(page)
                    current_fingerprint = question.fingerprint
                    processed += 1

                    answer_text = answer_by_fingerprint.get(question.fingerprint)
                    if answer_text is None:
                        answer_text = by_question.get(normalize_arabic_text(question.text))
                    if answer_text is None:
                        unresolved += 1
                        return {
                            "status": "needs_review",
                            "questionsProcessed": processed,
                            "questionsCompleted": completed,
                            "unresolvedQuestions": unresolved,
                            "currentQuestionFingerprint": current_fingerprint,
                            "unresolvedQuestionText": question.text,
                            "unresolvedQuestionOptions": [option.text for option in question.options],
                            "errorCode": "unverified_question",
                            "errorMessageSafe": "ظهر سؤال غير موجود في بنك إجابات SPRIX الموثق.",
                        }

                    # If a recovered page already has an answer selected, do not
                    # click another option. This avoids blind duplicate submissions.
                    if not await self._has_selected_option(question):
                        await self.adapter.select_answer(question, answer_text)

                    moved = await self.adapter.next_or_complete(page)
                    if not moved:
                        if await self.adapter.detect_completion(page):
                            completed += 1
                            return self._completed(processed, completed, unresolved)
                        return {
                            "status": "failed",
                            "questionsProcessed": processed,
                            "questionsCompleted": completed,
                            "unresolvedQuestions": unresolved,
                            "currentQuestionFingerprint": current_fingerprint,
                            "errorCode": "next_control_not_found",
                            "errorMessageSafe": "تعذر الانتقال للسؤال التالي بأمان.",
                        }

                    await page.wait_for_load_state("domcontentloaded")
                    completed += 1

                return {
                    "status": "failed",
                    "questionsProcessed": processed,
                    "questionsCompleted": completed,
                    "unresolvedQuestions": unresolved,
                    "currentQuestionFingerprint": current_fingerprint,
                    "errorCode": "max_questions_exceeded",
                    "errorMessageSafe": "تجاوز التنفيذ الحد الآمن لعدد الأسئلة.",
                }
            finally:
                await context.close()
                await browser.close()

    @staticmethod
    def _completed(processed: int, completed: int, unresolved: int) -> dict[str, Any]:
        return {
            "status": "completed",
            "questionsProcessed": processed,
            "questionsCompleted": completed,
            "unresolvedQuestions": unresolved,
            "currentQuestionFingerprint": None,
        }

    async def _has_selected_option(self, question: Any) -> bool:
        for option in question.options:
            role = await option.locator.get_attribute("role")
            aria_checked = await option.locator.get_attribute("aria-checked")
            checked = await option.locator.get_attribute("checked")
            if role == "radio" and aria_checked == "true":
                return True
            if checked is not None:
                return True
        return False

    async def _login(self, page: Any, username: str, password: str) -> None:
        inputs = page.locator("input")
        username_input = None
        password_input = None
        for i in range(await inputs.count()):
            node = inputs.nth(i)
            if not await node.is_visible():
                continue
            input_type = (await node.get_attribute("type") or "text").lower()
            name = ((await node.get_attribute("name")) or "").lower()
            autocomplete = ((await node.get_attribute("autocomplete")) or "").lower()
            if input_type == "password" or "password" in name or autocomplete == "current-password":
                password_input = node
            elif input_type in {"email", "text"} and ("user" in name or "email" in name or autocomplete == "username"):
                username_input = node
        if username_input is None or password_input is None:
            raise RuntimeError("login_form_not_found")
        await username_input.fill(username)
        await password_input.fill(password)

        buttons = page.get_by_role("button")
        clicked = False
        for i in range(await buttons.count()):
            button = buttons.nth(i)
            if not await button.is_visible() or not await button.is_enabled():
                continue
            label = ((await button.inner_text()) or "").strip().casefold()
            if any(token in label for token in ("دخول", "تسجيل", "login", "sign in")):
                await button.click()
                clicked = True
                break
        if not clicked:
            submit = page.locator("input[type='submit']")
            if await submit.count() == 1 and await submit.first.is_visible():
                await submit.first.click()
                clicked = True
        if not clicked:
            raise RuntimeError("login_submit_control_not_found")
        await page.wait_for_load_state("domcontentloaded", timeout=self.timeout_ms)
        if await password_input.is_visible():
            raise RuntimeError("invalid_credentials")
