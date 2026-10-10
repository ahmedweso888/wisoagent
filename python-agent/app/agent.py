from __future__ import annotations

from .config import Settings
from .generation import GenerationService
from .provider import OpenAIResponsesProvider


settings = Settings.from_env()
service = GenerationService(OpenAIResponsesProvider(settings))
