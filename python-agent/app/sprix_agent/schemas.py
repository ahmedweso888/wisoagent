from __future__ import annotations

from pydantic import BaseModel, Field


class SprixAnswer(BaseModel):
    fingerprint: str
    normalized_question_text: str
    correct_option_text: str


class SprixRunRequest(BaseModel):
    run_id: str
    username: str
    password: str
    base_url: str
    subject: str = "الثقافة المالية"
    timeout_ms: int = Field(default=1_200_000, ge=60_000, le=3_600_000)
    max_questions: int = Field(default=500, ge=1, le=5_000)
    verified_answers: list[SprixAnswer] = Field(default_factory=list)


class SprixVerifyRequest(BaseModel):
    username: str
    password: str
    base_url: str


class SprixVerifyResponse(BaseModel):
    verified: bool
    errorCode: str | None = None


class SprixRunResponse(BaseModel):
    status: str
    questionsProcessed: int
    questionsCompleted: int
    unresolvedQuestions: int
    currentQuestionFingerprint: str | None = None
    unresolvedQuestionText: str | None = None
    unresolvedQuestionOptions: list[str] | None = None
    errorCode: str | None = None
    errorMessageSafe: str | None = None
