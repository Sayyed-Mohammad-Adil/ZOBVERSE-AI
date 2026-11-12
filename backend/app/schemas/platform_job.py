from datetime import datetime
from pydantic import AliasChoices, BaseModel, Field


class PlatformJob(BaseModel):
    external_job_id: str = Field(
        validation_alias=AliasChoices("external_job_id", "provider_id")
    )
    title: str
    company: str
    location: str | None = None
    salary_min: float | None = None
    salary_max: float | None = None
    salary_currency: str | None = None
    salary_period: str | None = None
    experience: str | None = None
    description: str = ""
    requirements: str | None = None
    responsibilities: str | None = None
    url: str
    source: str
    work_mode: str | None = None
    posted_at: datetime | None = Field(
        default=None,
        validation_alias=AliasChoices("posted_at", "posted_date"),
    )

    @property
    def provider_id(self) -> str:
        return self.external_job_id

    @property
    def posted_date(self) -> datetime | None:
        return self.posted_at
