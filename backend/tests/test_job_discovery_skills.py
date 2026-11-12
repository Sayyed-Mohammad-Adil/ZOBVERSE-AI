from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from app.ai.laya.decision import LayaDecisionService
from app.api.endpoints.jobs import _candidate_job_match_score
from app.api.endpoints import worker_triggers
from app.matching.engine import MatchingEngine
from app.schemas.preferences import CandidatePreferencesUpdate
from app.workers.job_discovery import build_extraction_text


@pytest.mark.asyncio
async def test_extract_skills_from_job_uses_explicit_requirements():
    service = LayaDecisionService()

    skills = await service.extract_skills_from_job(
        "Software Engineer",
        "Position: Software Engineer at Example. Location: Remote.",
        requirements="Python, FastAPI, Docker",
    )

    assert "Python" in skills
    assert "FastAPI" in skills
    assert "Docker" in skills


def test_job_discovery_builds_extraction_text_only_from_source_fields():
    extraction_text = build_extraction_text(
        title="Software Engineer",
        description="Position: Software Engineer at Example.",
    )

    assert extraction_text == (
        "Title: Software Engineer\n"
        "Description: Position: Software Engineer at Example."
    )


def test_candidate_match_score_uses_real_required_skill_coverage():
    assert _candidate_job_match_score(
        ["Python", "React", "Extra"], ["Python", "React", "Docker"]
    ) == 66.7
    assert _candidate_job_match_score(["Python"], ["Python"]) == 100
    assert _candidate_job_match_score(["Python"], []) is None


def test_daily_application_limit_accepts_at_most_500():
    assert CandidatePreferencesUpdate(daily_application_limit=500).daily_application_limit == 500
    with pytest.raises(ValueError):
        CandidatePreferencesUpdate(daily_application_limit=501)


@pytest.mark.asyncio
async def test_ollama_fit_evaluation_parses_structured_assessment(monkeypatch):
    engine = MatchingEngine()
    monkeypatch.setattr(
        engine.ollama,
        "generate",
        AsyncMock(return_value='{"fit_score": 91, "recommendation": "strong_fit", '
                               '"rationale": "Role matches the supplied backend skills.", '
                               '"matched_skills": ["Python"], "missing_skills": [], "concerns": []}'),
    )

    result = await engine.evaluate_job_fit(
        SimpleNamespace(
            id=1, user_id=42, current_role="Backend Engineer", total_experience_years=5,
            skills="Python", summary="Backend APIs",
        ),
        SimpleNamespace(
            id=2, title="Backend Engineer", company="Example", location="Remote",
            salary_min=100000, salary_max=120000, salary_currency="USD",
            salary_period="Annual", description="Build Python APIs.", requirements="Python",
        ),
    )

    assert result["status"] == "evaluated"
    assert result["fit_score"] == 91
    assert result["recommendation"] == "strong_fit"
    engine.ollama.generate.assert_awaited_once()
    assert engine.ollama.generate.await_args.kwargs == {
        "user_id": 42,
        "operation": "job_fit_review",
    }


@pytest.mark.asyncio
async def test_ollama_fit_evaluation_marks_model_failure_for_review(monkeypatch):
    engine = MatchingEngine()
    monkeypatch.setattr(
        engine.ollama,
        "generate",
        AsyncMock(side_effect=RuntimeError("Ollama is unavailable")),
    )

    result = await engine.evaluate_job_fit(
        SimpleNamespace(
            id=1, current_role=None, total_experience_years=None, skills="Python",
            summary=None,
        ),
        SimpleNamespace(
            id=2, title="Backend Engineer", company="Example", location=None,
            salary_min=None, salary_max=None, salary_currency=None, salary_period=None,
            description="", requirements=None,
        ),
    )

    assert result["status"] == "unavailable"
    assert result["recommendation"] == "human_review"
    assert result["fit_score"] is None


@pytest.mark.asyncio
async def test_live_scan_waits_for_discovery_and_returns_listing_count(monkeypatch):
    class FakeResult:
        def scalars(self):
            return self

        def first(self):
            return None

    class FakeDatabase:
        async def execute(self, _query):
            return FakeResult()

    discover = AsyncMock(return_value={
        "providers": [{"source": "LINKEDIN", "fetched": 2, "newly_saved": 2, "errors": []}],
        "fetched": 2,
        "newly_saved": 2,
        "errors": [],
    })
    monkeypatch.setattr(worker_triggers, "run_discovery", discover)
    monkeypatch.setattr(worker_triggers.agent_console, "broadcast_log", AsyncMock())

    result = await worker_triggers.trigger_job_scan(
        current_user=SimpleNamespace(id=42),
        query="Backend Engineer",
        skills="Python",
        location="Remote",
        source="linkedin",
        db=FakeDatabase(),
    )

    assert result["fetched"] == 2
    assert result["newly_saved"] == 2
    discover.assert_awaited_once()
