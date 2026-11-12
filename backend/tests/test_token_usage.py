from unittest.mock import AsyncMock

import pytest

from app.ai.ollama.llm import OllamaService


class MockResponse:
    def raise_for_status(self):
        return None

    def json(self):
        return {
            "response": "A generated answer.",
            "prompt_eval_count": 24,
            "eval_count": 8,
        }


class MockClient:
    def __init__(self):
        self.response = MockResponse()

    async def __aenter__(self):
        return self

    async def __aexit__(self, *_args):
        return None

    async def post(self, *_args, **_kwargs):
        return self.response


@pytest.mark.asyncio
async def test_ollama_generation_records_provider_token_counts(monkeypatch):
    service = OllamaService()
    record_usage = AsyncMock()
    monkeypatch.setattr(service, "_record_usage", record_usage)
    monkeypatch.setattr(
        "app.ai.ollama.llm.httpx.AsyncClient",
        lambda: MockClient(),
    )

    result = await service.generate(
        "prompt",
        user_id=42,
        operation="job_fit_review",
    )

    assert result == "A generated answer."
    record_usage.assert_awaited_once_with(
        user_id=42,
        operation="job_fit_review",
        prompt_tokens=24,
        completion_tokens=8,
    )


@pytest.mark.asyncio
async def test_ollama_generation_does_not_attribute_usage_without_user(monkeypatch):
    service = OllamaService()
    record_usage = AsyncMock()
    monkeypatch.setattr(service, "_record_usage", record_usage)
    monkeypatch.setattr(
        "app.ai.ollama.llm.httpx.AsyncClient",
        lambda: MockClient(),
    )

    await service.generate("prompt")

    record_usage.assert_not_awaited()


@pytest.mark.asyncio
async def test_ollama_generation_does_not_fabricate_missing_token_counts(monkeypatch):
    service = OllamaService()
    record_usage = AsyncMock()
    monkeypatch.setattr(service, "_record_usage", record_usage)

    class MissingUsageResponse(MockResponse):
        def json(self):
            return {"response": "A generated answer."}

    class MissingUsageClient(MockClient):
        def __init__(self):
            self.response = MissingUsageResponse()

    monkeypatch.setattr(
        "app.ai.ollama.llm.httpx.AsyncClient",
        lambda: MissingUsageClient(),
    )

    await service.generate("prompt", user_id=42)

    record_usage.assert_not_awaited()
