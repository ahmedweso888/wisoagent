from __future__ import annotations

import asyncio

from .browser import SprixBrowserRunner
from .schemas import SprixRunRequest, SprixRunResponse


async def execute(request: SprixRunRequest) -> SprixRunResponse:
    try:
        result = await asyncio.wait_for(
            SprixBrowserRunner(request.base_url, request.timeout_ms).run(
                request.username, request.password, request.max_questions, request.verified_answers
            ),
            timeout=request.timeout_ms / 1000,
        )
        return SprixRunResponse(**result)
    except asyncio.TimeoutError:
        return SprixRunResponse(
            status="failed", questionsProcessed=0, questionsCompleted=0, unresolvedQuestions=0,
            errorCode="timeout", errorMessageSafe="انتهى وقت تشغيل وكيل SPRIX."
        )
    except RuntimeError as exc:
        code = str(exc).split(":", 1)[0]
        return SprixRunResponse(
            status="failed", questionsProcessed=0, questionsCompleted=0, unresolvedQuestions=0,
            errorCode=code, errorMessageSafe="تعذر إكمال تشغيل وكيل SPRIX بأمان."
        )
