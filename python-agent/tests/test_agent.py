"""End-to-end contract tests for the WISO Python Agent.

The OpenAI provider is replaced with a controllable stub so the suite never
performs a network call and never needs a real API key.
"""

import asyncio
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
os.environ.setdefault("WISO_AGENT_SECRET", "test-secret")
os.environ.setdefault("OPENAI_API_KEY", "test-key")

from fastapi.testclient import TestClient  # noqa: E402

from app import agent as agent_module  # noqa: E402
from app.errors import ProviderError  # noqa: E402
from app.main import app  # noqa: E402
from app.schemas import GenerateRequest, GenerateResponse  # noqa: E402


SECRET = os.environ["WISO_AGENT_SECRET"]
AUTH = {"Authorization": f"Bearer {SECRET}"}


def payload(**overrides):
    body = {
        "request_id": "wiso_test_1",
        "task_type": "question_generation",
        "tier": "terra",
        "model": "openai/gpt-5.6-terra",
        "messages": [{"role": "user", "content": "اكتب سؤالاً"}],
    }
    body.update(overrides)
    return body


class StubProvider:
    """Deterministic provider stub: returns text, or raises a chosen error."""

    def __init__(self, text: str = '{"questions": []}', error: Exception | None = None):
        self.text = text
        self.error = error
        self.calls: list[GenerateRequest] = []

    async def generate(self, request: GenerateRequest) -> GenerateResponse:
        self.calls.append(request)
        if self.error:
            raise self.error
        await asyncio.sleep(0)
        return GenerateResponse(
            request_id=request.request_id,
            text=self.text,
            input_tokens=10,
            output_tokens=20,
            total_tokens=30,
            latency_ms=5,
            model=request.model,
        )


class AgentApiTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.original = agent_module.service.provider

    def tearDown(self):
        agent_module.service.provider = self.original

    def use(self, provider):
        agent_module.service.provider = provider
        return provider

    # --- security -------------------------------------------------------
    def test_health_is_public(self):
        self.assertEqual(self.client.get("/health").json()["status"], "ok")

    def test_generate_requires_the_agent_secret(self):
        self.assertEqual(self.client.post("/v1/generate", json=payload()).status_code, 401)

    def test_generate_rejects_a_wrong_secret(self):
        response = self.client.post(
            "/v1/generate", json=payload(), headers={"Authorization": "Bearer wrong"}
        )
        self.assertEqual(response.status_code, 401)

    def test_authorized_request_returns_structured_response(self):
        self.use(StubProvider())
        response = self.client.post("/v1/generate", json=payload(), headers=AUTH)
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["request_id"], "wiso_test_1")
        self.assertEqual(body["total_tokens"], 30)

    # --- schema validation ----------------------------------------------
    def test_unknown_fields_are_rejected(self):
        response = self.client.post("/v1/generate", json=payload(hacked=True), headers=AUTH)
        self.assertEqual(response.status_code, 422)

    def test_request_id_must_be_a_wiso_id(self):
        response = self.client.post("/v1/generate", json=payload(request_id="abc"), headers=AUTH)
        self.assertEqual(response.status_code, 422)

    def test_unknown_tier_is_rejected(self):
        response = self.client.post("/v1/generate", json=payload(tier="unsupported-tier"), headers=AUTH)
        self.assertEqual(response.status_code, 422)

    # --- provider behaviour ---------------------------------------------
    def test_provider_error_is_surfaced_as_502(self):
        self.use(StubProvider(error=ProviderError("openai_http_500")))
        response = self.client.post("/v1/generate", json=payload(), headers=AUTH)
        self.assertEqual(response.status_code, 502)

    def test_timeout_is_surfaced_as_502(self):
        self.use(StubProvider(error=ProviderError("openai_timeout")))
        response = self.client.post("/v1/generate", json=payload(), headers=AUTH)
        self.assertEqual(response.status_code, 502)
        self.assertIn("timeout", response.json()["detail"])

    def test_non_json_output_fails_when_a_schema_was_requested(self):
        self.use(StubProvider(text="this is not json"))
        response = self.client.post(
            "/v1/generate",
            json=payload(
                json_schema={
                    "name": "questions",
                    "schema": {"type": "object", "properties": {}, "additionalProperties": False},
                }
            ),
            headers=AUTH,
        )
        self.assertEqual(response.status_code, 502)
        self.assertEqual(response.json()["detail"], "invalid_structured_output")

    # --- batch ------------------------------------------------------------
    def test_batch_reports_remaining_count_by_accepted_count(self):
        self.use(StubProvider())
        response = self.client.post(
            "/v1/generate/batch",
            json={
                "request_id": "wiso_test_1",
                "requested_count": 100,
                "accepted_count": 73,
                "items": [payload(), payload()],
            },
            headers=AUTH,
        )
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["remaining_count"], 27)
        self.assertEqual(body["succeeded"], 2)
        self.assertEqual(body["failed"], 0)

    def test_batch_size_is_capped(self):
        self.use(StubProvider())
        response = self.client.post(
            "/v1/generate/batch",
            json={
                "request_id": "wiso_test_1",
                "requested_count": 10,
                "items": [payload() for _ in range(50)],
            },
            headers=AUTH,
        )
        self.assertEqual(response.status_code, 422)

    def test_batch_item_failure_does_not_fail_the_batch(self):
        self.use(StubProvider(error=ProviderError("openai_http_502")))
        response = self.client.post(
            "/v1/generate/batch",
            json={
                "request_id": "wiso_test_1",
                "requested_count": 5,
                "accepted_count": 5,
                "items": [payload()],
            },
            headers=AUTH,
        )
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["failed"], 1)
        self.assertEqual(body["remaining_count"], 0)

    def test_batch_requires_matching_request_ids(self):
        self.use(StubProvider())
        response = self.client.post(
            "/v1/generate/batch",
            json={
                "request_id": "wiso_test_1",
                "requested_count": 2,
                "items": [payload(request_id="wiso_other")],
            },
            headers=AUTH,
        )
        self.assertEqual(response.status_code, 422)


class RoutingGuardTests(unittest.TestCase):
    """The Agent refuses any model that does not match the routed tier."""

    def setUp(self):
        from app.config import Settings
        from app.provider import OpenAIResponsesProvider

        self.provider = OpenAIResponsesProvider(
            Settings(agent_secret="s", openai_api_key="k")
        )

    def call(self, **kwargs):
        return asyncio.run(self.provider.generate(GenerateRequest(**payload(**kwargs))))

    def test_non_gpt56_model_is_refused(self):
        with self.assertRaises(ProviderError):
            self.call(model="openai/legacy-model")

    def test_tier_and_model_must_agree(self):
        with self.assertRaises(ProviderError):
            self.call(tier="sol", model="openai/gpt-5.6-terra")

    def test_nightmare_tier_only_accepts_sol(self):
        with self.assertRaises(ProviderError):
            self.call(tier="luna", model="openai/gpt-5.6-sol")


if __name__ == "__main__":
    unittest.main()

class CurriculumApiTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_curriculum_requires_agent_secret(self):
        response = self.client.post("/v1/curriculum/analyze", json={
            "request_id": "wiso_curriculum_test",
            "subject_name": "رياضيات",
            "filename": "book.pdf",
            "pdf_base64": "ZmFrZQ==",
        })
        self.assertEqual(response.status_code, 401)
