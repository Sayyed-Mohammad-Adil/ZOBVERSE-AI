import pytest

from app.api.endpoints.settings import test_ollama_connection as check_ollama_connection
from app.core.config import settings
from app.services.agent_console import AgentConsoleService


class MockResponse:
    status_code = 200

    def __init__(self, models):
        self._models = models

    def json(self):
        return {"models": [{"name": model} for model in self._models]}


class MockClient:
    def __init__(self, response):
        self.response = response

    async def __aenter__(self):
        return self

    async def __aexit__(self, *_args):
        return None

    async def get(self, *_args, **_kwargs):
        return self.response


@pytest.mark.asyncio
async def test_ollama_status_requires_configured_model(monkeypatch):
    monkeypatch.setattr(settings, "DEFAULT_LLM_MODEL", "llama3")
    monkeypatch.setattr(
        "app.api.endpoints.settings.httpx.AsyncClient",
        lambda **_kwargs: MockClient(MockResponse(["llama3:latest"])),
    )

    result = await check_ollama_connection()

    assert result["status"] == "connected"
    assert result["model_available"] is True


@pytest.mark.asyncio
async def test_ollama_status_does_not_report_different_model_as_connected(monkeypatch):
    monkeypatch.setattr(settings, "DEFAULT_LLM_MODEL", "llama3:8b")
    monkeypatch.setattr(
        "app.api.endpoints.settings.httpx.AsyncClient",
        lambda **_kwargs: MockClient(MockResponse(["qwen2:latest"])),
    )

    result = await check_ollama_connection()

    assert result["status"] == "model_missing"
    assert result["service_status"] == "connected"
    assert result["model_available"] is False


def test_empty_agent_console_does_not_seed_fake_logs():
    console = AgentConsoleService()
    user_id = 987654321
    console.clear_logs(user_id)

    assert console.get_logs(user_id) == []
