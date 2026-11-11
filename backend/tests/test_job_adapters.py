import pytest

from app.adapters.jobicy import JobicyAdapter
from app.adapters.linkedin import LinkedInAdapter


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
