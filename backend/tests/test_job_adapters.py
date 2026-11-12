import asyncio

from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from fastapi import HTTPException

from app.adapters.http import get_with_retries
from app.adapters.jobicy import JobicyAdapter
from app.adapters.linkedin import LinkedInAdapter
from app.adapters.manual_platforms import (
    FounditAdapter,
    GlassdoorAdapter,
    IndeedAdapter,
    InternshalaAdapter,
    NaukriAdapter,
    ShineAdapter,
    WellfoundAdapter,
    ZipRecruiterAdapter,
)
from app.adapters.registry import (
    DEFAULT_JOB_SOURCES,
    PLATFORMS,
    create_adapter,
    get_platforms_response,
)
from app.api.endpoints.jobs import get_job
from app.api.endpoints.settings import (
    PlatformConnectionInput,
    connect_platform_account,
    disconnect_platform_account,
    list_platform_connections,
    test_platform_connection as verify_platform_connection,
)
from app.schemas.platform_job import PlatformJob
from app.workers.job_discovery import canonicalize_job_url, run_discovery


class MockResponse:
    status_code = 200

    def __init__(self, data=None, text=""):
        self._data = data or {}
        self.text = text

    def json(self):
        return self._data

    def raise_for_status(self):
        if self.status_code >= 400:
            raise RuntimeError(f"HTTP {self.status_code}")


class MockClient:
    def __init__(self, response):
        self.response = response
        self.request_args = None

    async def __aenter__(self):
        return self

    async def __aexit__(self, *_args):
        return None

    async def get(self, *args, **kwargs):
        self.request_args = (args, kwargs)
        return self.response


class SequenceClient(MockClient):
    def __init__(self, responses):
        super().__init__(None)
        self.responses = iter(responses)
        self.request_count = 0

    async def get(self, *args, **kwargs):
        self.request_count += 1
        return next(self.responses)


@pytest.mark.asyncio
async def test_http_retry_retries_server_errors():
    first = MockResponse()
    first.status_code = 503
    second = MockResponse()
    client = SequenceClient([first, second])

    response = await get_with_retries(client, "https://example.com", provider="TEST")

    assert response is second
    assert client.request_count == 2


@pytest.mark.asyncio
async def test_http_retry_does_not_retry_rate_limits():
    response = MockResponse()
    response.status_code = 429
    client = SequenceClient([response])

    result = await get_with_retries(client, "https://example.com", provider="TEST")

    assert result is response
    assert client.request_count == 1


@pytest.mark.asyncio
async def test_jobicy_adapter_keeps_only_source_provided_job_fields(monkeypatch):
    response = MockResponse({
        "jobs": [
            {
                "id": 123,
                "jobTitle": "Backend Engineer",
                "companyName": "Example Labs",
                "url": "https://jobicy.com/jobs/123",
                "jobGeo": "Worldwide",
                "jobExcerpt": "Build APIs with Python.",
                "annualSalaryMin": 100000,
                "annualSalaryMax": 140000,
                "salaryCurrency": "USD",
            },
            {
                "id": 456,
                "jobTitle": "Frontend Engineer",
                "url": "https://jobicy.com/jobs/456",
            },
        ]
    })
    monkeypatch.setattr(
        "app.adapters.jobicy.httpx.AsyncClient",
        lambda **_kwargs: MockClient(response),
    )

    jobs = await JobicyAdapter().search_jobs("Backend Engineer", "Remote")

    assert len(jobs) == 1
    assert jobs[0]["source"] == "JOBICY"
    assert jobs[0]["external_job_id"] == "jobicy_123"
    assert jobs[0]["company"] == "Example Labs"
    assert jobs[0]["url"] == "https://jobicy.com/jobs/123"
    assert jobs[0]["description"] == "Build APIs with Python."
    assert jobs[0]["work_mode"] == "Remote"


@pytest.mark.asyncio
async def test_linkedin_adapter_does_not_invent_missing_job_details(monkeypatch):
    html = """
    <ul>
      <li><a href="https://www.linkedin.com/jobs/view/123"></a></li>
      <li>
        <a class="base-card__full-link" href="https://www.linkedin.com/jobs/view/456"></a>
        <h3 class="base-search-card__title">Platform Engineer</h3>
        <h4 class="base-search-card__subtitle">Example Systems</h4>
        <span class="job-search-card__location">Toronto, ON</span>
      </li>
    </ul>
    """
    monkeypatch.setattr(
        "app.adapters.linkedin.httpx.AsyncClient",
        lambda **_kwargs: MockClient(MockResponse(text=html)),
    )

    jobs = await LinkedInAdapter().search_jobs("Platform Engineer", "Toronto")

    assert len(jobs) == 1
    assert jobs[0]["title"] == "Platform Engineer"
    assert jobs[0]["company"] == "Example Systems"
    assert jobs[0]["url"] == "https://www.linkedin.com/jobs/view/456"
    assert jobs[0]["description"] == ""
    assert jobs[0]["work_mode"] is None


@pytest.mark.asyncio
async def test_linkedin_search_includes_candidate_skills_in_live_query(monkeypatch):
    client = MockClient(MockResponse(text="<ul></ul>"))
    monkeypatch.setattr(
        "app.adapters.linkedin.httpx.AsyncClient",
        lambda **_kwargs: client,
    )

    await LinkedInAdapter().search_jobs(
        "Backend Engineer",
        "Remote",
        skills="Python, FastAPI, PostgreSQL",
    )

    keywords = client.request_args[1]["params"]["keywords"]
    assert "Backend Engineer" in keywords
    assert "Python" in keywords
    assert "FastAPI" in keywords


@pytest.mark.asyncio
async def test_linkedin_search_surfaces_provider_errors(monkeypatch):
    response = MockResponse(text="Access denied")
    response.status_code = 429
    monkeypatch.setattr(
        "app.adapters.linkedin.httpx.AsyncClient",
        lambda **_kwargs: MockClient(response),
    )

    with pytest.raises(RuntimeError, match="LinkedIn live search request failed"):
        await LinkedInAdapter().search_jobs("Software Engineer", "Remote")


def test_platform_catalog_defaults_linkedin_and_marks_partner_boards_guided():
    platforms = {platform["id"]: platform for platform in get_platforms_response()}

    assert "linkedin" in DEFAULT_JOB_SOURCES
    assert platforms["indeed"]["status"] == "guided_only"
    assert platforms["naukri"]["status"] == "guided_only"
    assert platforms["linkedin"]["capabilities"]["search"] is True
    assert platforms["indeed"]["capabilities"]["automation_support"] is False


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("adapter", "platform"),
    [(IndeedAdapter(), "Indeed"), (NaukriAdapter(), "Naukri")],
)
async def test_partner_boards_require_authorized_search_access(adapter, platform):
    with pytest.raises(RuntimeError, match=f"{platform} does not expose a configured authorized"):
        await adapter.search_jobs("Backend Engineer", "Remote")


def test_canonicalize_job_url_removes_tracking_and_fragment():
    assert canonicalize_job_url(
        "https://www.example.com/jobs/123/?utm_source=feed&refId=abc#details"
    ) == "https://example.com/jobs/123"


def test_platform_job_normalizes_common_listing_fields():
    job = PlatformJob(
        external_job_id="indeed_123",
        title="Backend Engineer",
        company="Example",
        url="https://example.com/jobs/123",
        source="INDEED",
        experience="3+ years",
    )

    assert job.experience == "3+ years"
    assert job.description == ""
    assert job.posted_at is None


def test_platform_job_accepts_common_provider_id_and_posted_date_names():
    job = PlatformJob(
        provider_id="board_123",
        title="Backend Engineer",
        company="Example",
        url="https://example.com/jobs/123",
        source="INDEED",
        posted_date="2025-01-02T00:00:00",
    )

    assert job.external_job_id == "board_123"
    assert job.provider_id == "board_123"
    assert job.posted_at.isoformat() == "2025-01-02T00:00:00"
    assert job.posted_date == job.posted_at


@pytest.mark.asyncio
async def test_guided_only_platforms_return_warnings_not_live_search_errors():
    result = await run_discovery(db=None, sources=["indeed"])

    assert result["fetched"] == 0
    assert result["errors"] == []
    assert result["warnings"]
    assert result["providers"][0]["status"] == "guided_only"


@pytest.mark.asyncio
async def test_guided_only_platform_returns_an_integration_warning():
    result = await run_discovery(
        db=None,
        query="Backend Engineer",
        location="Remote",
        sources=["indeed"],
        user_id=42,
    )

    assert result["fetched"] == 0
    assert result["providers"][0]["source"] == "INDEED"
    assert result["errors"] == []
    assert "authorized Indeed search API" in result["warnings"][0]


@pytest.mark.asyncio
async def test_live_platforms_search_concurrently_and_fail_independently(monkeypatch):
    both_started = asyncio.Event()
    started = set()

    class FakeAdapter:
        def __init__(self, source_name, fail=False):
            self.source_name = source_name
            self.fail = fail

        async def search_jobs(self, *_args, **_kwargs):
            started.add(self.source_name)
            if len(started) == 2:
                both_started.set()
            await asyncio.wait_for(both_started.wait(), timeout=1)
            if self.fail:
                raise RuntimeError("provider unavailable")
            return []

    class FakeDatabase:
        async def rollback(self):
            return None

        async def commit(self):
            return None

    adapters = {
        "linkedin": FakeAdapter("LINKEDIN", fail=True),
        "jobicy": FakeAdapter("JOBICY"),
    }
    monkeypatch.setattr(
        "app.workers.job_discovery.create_adapter",
        lambda platform_id: adapters[platform_id],
    )

    result = await run_discovery(
        db=FakeDatabase(),
        sources=["linkedin", "jobicy"],
    )

    assert started == {"LINKEDIN", "JOBICY"}
    assert [provider["status"] for provider in result["providers"]] == [
        "error",
        "no_results",
    ]
    assert result["fetched"] == 0
    assert result["errors"] == ["LINKEDIN: provider unavailable"]


def test_all_ten_prioritized_platforms_are_registered_in_priority_order():
    expected_ids = [
        "linkedin",
        "indeed",
        "naukri",
        "internshala",
        "foundit",
        "glassdoor",
        "wellfound",
        "shine",
        "ziprecruiter",
        "jobicy",
    ]
    assert [platform.id for platform in PLATFORMS] == expected_ids

    catalog = {platform["id"]: platform for platform in get_platforms_response()}
    assert list(catalog.keys()) == expected_ids
    assert catalog["linkedin"]["status"] == "live"
    assert catalog["jobicy"]["status"] == "live"
    for platform_id in expected_ids:
        assert create_adapter(platform_id) is not None
        if platform_id not in {"linkedin", "jobicy"}:
            assert catalog[platform_id]["status"] == "guided_only"
            assert catalog[platform_id]["capabilities"]["application_preparation"] is True


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("platform_id", "adapter_cls", "platform_label"),
    [
        ("indeed", IndeedAdapter, "Indeed"),
        ("naukri", NaukriAdapter, "Naukri"),
        ("internshala", InternshalaAdapter, "Internshala"),
        ("foundit", FounditAdapter, "Foundit"),
        ("glassdoor", GlassdoorAdapter, "Glassdoor"),
        ("wellfound", WellfoundAdapter, "Wellfound"),
        ("shine", ShineAdapter, "Shine"),
        ("ziprecruiter", ZipRecruiterAdapter, "ZipRecruiter"),
    ],
)
async def test_all_guided_platforms_report_warnings_and_external_preparation(
    platform_id,
    adapter_cls,
    platform_label,
):
    adapter = adapter_cls()
    with pytest.raises(RuntimeError, match=f"{platform_label} does not expose a configured authorized"):
        await adapter.search_jobs("Backend Engineer", "Remote")

    prep = await adapter.prepare_application("ext_1", {"full_name": "Candidate"})
    assert prep["status"] == "requires_manual"
    assert prep["method"] == "EXTERNAL"

    result = await run_discovery(db=None, sources=[platform_id.upper()])
    assert result["fetched"] == 0
    assert result["errors"] == []
    assert result["providers"][0]["status"] == "guided_only"
    assert result["warnings"]


@pytest.mark.asyncio
async def test_run_discovery_reports_unknown_platform_without_crashing():
    result = await run_discovery(db=None, sources=["unknown_board", "indeed"])

    assert result["fetched"] == 0
    assert [provider["status"] for provider in result["providers"]] == [
        "error",
        "guided_only",
    ]
    assert result["errors"] == ["UNKNOWN_BOARD: Unknown job platform: 'unknown_board'."]


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "source_name",
    [
        "LINKEDIN",
        "INDEED",
        "NAUKRI",
        "INTERNSHALA",
        "FOUNDIT",
        "GLASSDOOR",
        "WELLFOUND",
        "SHINE",
        "ZIPRECRUITER",
        "JOBICY",
        "CSV_IMPORT",
    ],
)
async def test_get_job_accepts_all_supported_platform_sources(source_name):
    job = SimpleNamespace(
        id=10,
        title="Backend Engineer",
        company="Example",
        description="Build APIs",
        requirements=None,
        skills="Python",
        source=source_name,
        external_job_id="ext_10",
    )

    class FakeResult:
        def scalars(self):
            return self

        def first(self):
            return job

    class FakeDatabase:
        async def execute(self, _stmt):
            return FakeResult()

    returned = await get_job(
        job_id=10,
        current_user=SimpleNamespace(id=1),
        db=FakeDatabase(),
    )
    assert returned.source == source_name
    assert returned.skills_list == ["Python"]


@pytest.mark.asyncio
async def test_multi_platform_account_linking_lifecycle(monkeypatch):
    from app.api.endpoints import settings as settings_endpoint

    monkeypatch.setattr(settings_endpoint.agent_console, "broadcast_log", AsyncMock())
    stored_creds = []

    class FakeResult:
        def __init__(self, items):
            self._items = items

        def scalars(self):
            return self

        def all(self):
            return list(self._items)

        def first(self):
            return self._items[0] if self._items else None

    class FakeDatabase:
        def __init__(self):
            self.last_stmt = None

        async def execute(self, stmt):
            self.last_stmt = stmt
            text = str(stmt)
            if "candidate_credentials.platform =" in text:
                for cred in stored_creds:
                    if getattr(cred, "_matched", False):
                        return FakeResult([cred])
                return FakeResult([])
            return FakeResult(stored_creds)

        def add(self, obj):
            stored_creds.append(obj)

        async def commit(self):
            return None

        async def refresh(self, _obj):
            return None

    user = SimpleNamespace(id=7)
    db = FakeDatabase()

    initial = await list_platform_connections(current_user=user, db=db)
    assert [item["id"] for item in initial] == [platform.id for platform in PLATFORMS]
    assert all(item["connected"] is False for item in initial)

    with pytest.raises(HTTPException) as unknown_exc:
        await connect_platform_account(
            "unknown_board",
            PlatformConnectionInput(profile_url="https://example.com/u/test"),
            current_user=user,
            db=db,
        )
    assert unknown_exc.value.status_code == 422

    with pytest.raises(HTTPException) as empty_exc:
        await connect_platform_account(
            "naukri",
            PlatformConnectionInput(auth_method="profile_link"),
            current_user=user,
            db=db,
        )
    assert empty_exc.value.status_code == 422

    linked = await connect_platform_account(
        "naukri",
        PlatformConnectionInput(
            auth_method="profile_link",
            profile_url="https://www.naukri.com/mnjuser/profile",
            username="candidate@example.com",
        ),
        current_user=user,
        db=db,
    )
    assert linked["id"] == "naukri"
    assert linked["connected"] is True
    assert linked["profile_url"] == "https://www.naukri.com/mnjuser/profile"
    assert linked["username"] == "c***e@example.com"

    stored_creds[0]._matched = True
    verified = await verify_platform_connection("naukri", current_user=user, db=db)
    assert verified["status"] == "connected"
    assert verified["platform"] == "naukri"

    disconnected = await disconnect_platform_account("naukri", current_user=user, db=db)
    assert disconnected["connected"] is False
    assert disconnected["connection_status"] == "NOT_CONFIGURED"
