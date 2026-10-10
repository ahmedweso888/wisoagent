from __future__ import annotations

from fastapi import Depends, FastAPI, Header, HTTPException

from .agent import service, settings
from .errors import AgentConfigurationError, ProviderError
from .logging import log_event
from .curriculum import analyze_curriculum
from .schemas import BatchGenerateRequest, BatchGenerateResponse, CurriculumAnalyzeRequest, CurriculumAnalyzeResponse, GenerateRequest, GenerateResponse

app = FastAPI(title="WISO Agent", version="1.0.0")


def require_agent_secret(authorization: str | None = Header(default=None)) -> None:
    expected = settings.agent_secret
    if not expected or authorization != f"Bearer {expected}":
        raise HTTPException(status_code=401, detail="unauthorized")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "wiso-agent"}


@app.get("/ready")
async def ready() -> dict[str, str]:
    try:
        settings.require_runtime_credentials()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return {"status": "ready", "service": "wiso-agent"}


@app.post("/v1/generate", response_model=GenerateResponse)
async def generate(request: GenerateRequest, _: None = Depends(require_agent_secret)) -> GenerateResponse:
    log_event(request.request_id, "request_received", task_type=request.task_type, tier=request.tier)
    try:
        return await service.generate(request)
    except AgentConfigurationError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ProviderError as exc:
        log_event(request.request_id, "provider_error", error=str(exc))
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except ValueError as exc:
        log_event(request.request_id, "invalid_structured_output", error=str(exc))
        raise HTTPException(status_code=502, detail="invalid_structured_output") from exc


@app.post("/v1/generate/batch", response_model=BatchGenerateResponse)
async def generate_batch(
    request: BatchGenerateRequest, _: None = Depends(require_agent_secret)
) -> BatchGenerateResponse:
    if len(request.items) > settings.max_batch_size:
        raise HTTPException(
            status_code=422,
            detail=f"batch_too_large:max={settings.max_batch_size}",
        )
    mismatched = [i for i, item in enumerate(request.items) if item.request_id != request.request_id]
    if mismatched:
        raise HTTPException(status_code=422, detail="request_id_mismatch")
    log_event(request.request_id, "batch_received", items=len(request.items))
    try:
        return await service.generate_batch(request, settings.max_batch_size)
    except AgentConfigurationError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.post("/v1/curriculum/analyze", response_model=CurriculumAnalyzeResponse)
async def analyze_curriculum_endpoint(request: CurriculumAnalyzeRequest, _: None = Depends(require_agent_secret)) -> CurriculumAnalyzeResponse:
    log_event(request.request_id, "curriculum_analysis_received", subject=request.subject_name)
    try:
        return await analyze_curriculum(request, service.provider)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except AgentConfigurationError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ProviderError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

from .sprix_agent.schemas import SprixRunRequest, SprixRunResponse, SprixVerifyRequest, SprixVerifyResponse
from .sprix_agent.service import execute as execute_sprix


@app.post("/v1/sprix/verify", response_model=SprixVerifyResponse)
async def verify_sprix(request: SprixVerifyRequest, _: None = Depends(require_agent_secret)) -> SprixVerifyResponse:
    # Verification opens a disposable browser context. No credentials/session
    # data is persisted by the worker.
    from .sprix_agent.browser import SprixBrowserRunner

    result = await SprixBrowserRunner(request.base_url, 120_000).verify_login(
        request.username, request.password
    )
    return SprixVerifyResponse(**result)


@app.post("/v1/sprix/run", response_model=SprixRunResponse)
async def run_sprix(request: SprixRunRequest, _: None = Depends(require_agent_secret)) -> SprixRunResponse:
    # This endpoint is isolated from all WISO AI/question-generation endpoints.
    # Credentials are used only for the live browser context and are never logged.
    log_event(request.run_id, "sprix_run_received", subject=request.subject)
    return await execute_sprix(request)
