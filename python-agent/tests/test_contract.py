import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.config import ALLOWED_MODELS, REASONING
from app.schemas import GenerateRequest


class ContractTests(unittest.TestCase):
    def test_only_gpt_56_models_are_allowed(self):
        self.assertEqual(set(ALLOWED_MODELS.values()), {"gpt-5.6-luna", "gpt-5.6-terra", "gpt-5.6-sol"})

    def test_reasoning_levels_are_tier_specific(self):
        self.assertEqual(REASONING["gpt-5.6-luna"], "none")
        self.assertEqual(REASONING["gpt-5.6-terra"], "low")
        self.assertEqual(REASONING["gpt-5.6-sol"], "high")

    def test_request_requires_wiso_request_id(self):
        with self.assertRaises(Exception):
            GenerateRequest(
                request_id="bad",
                task_type="questions",
                tier="terra",
                model="openai/gpt-5.6-terra",
                messages=[{"role": "user", "content": "x"}],
            )


class ApiTests(unittest.TestCase):
    def test_health_and_auth_boundary(self):
        from fastapi.testclient import TestClient
        from app.main import app
        client = TestClient(app)
        self.assertEqual(client.get("/health").status_code, 200)
        self.assertEqual(
            client.post(
                "/v1/generate",
                json={
                    "request_id": "wiso_test",
                    "task_type": "question_generation",
                    "tier": "terra",
                    "model": "openai/gpt-5.6-terra",
                    "messages": [{"role": "user", "content": "x"}],
                },
            ).status_code,
            401,
        )


if __name__ == "__main__":
    unittest.main()
