from dataclasses import dataclass
from typing import Type

from app.adapters.base import JobSourceAdapter
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


DEFAULT_JOB_SOURCES = ["linkedin", "jobicy"]


@dataclass(frozen=True)
class PlatformDefinition:
    id: str
    name: str
    source_name: str
    adapter: Type[JobSourceAdapter]
    search_available: bool
    notice: str


PLATFORMS = (
    PlatformDefinition(
        "linkedin",
        "LinkedIn",
        "LINKEDIN",
        LinkedInAdapter,
        True,
        "Searches public job listings. Application submission still requires candidate review.",
    ),
    PlatformDefinition(
        "indeed",
        "Indeed",
        "INDEED",
        IndeedAdapter,
        False,
        "No authorized Indeed search API is configured. Continue on Indeed's official site.",
    ),
    PlatformDefinition(
        "naukri",
        "Naukri.com",
        "NAUKRI",
        NaukriAdapter,
        False,
        "No authorized Naukri search API is configured. Continue on Naukri's official site.",
    ),
    PlatformDefinition(
        "internshala",
        "Internshala",
        "INTERNSHALA",
        InternshalaAdapter,
        False,
        "No authorized Internshala search API is configured. Continue on its official site.",
    ),
    PlatformDefinition(
        "foundit",
        "Foundit",
        "FOUNDIT",
        FounditAdapter,
        False,
        "No authorized Foundit search API is configured. Continue on its official site.",
    ),
    PlatformDefinition(
        "glassdoor",
        "Glassdoor",
        "GLASSDOOR",
        GlassdoorAdapter,
        False,
        "No authorized Glassdoor search API is configured. Continue on its official site.",
    ),
    PlatformDefinition(
        "wellfound",
        "Wellfound",
        "WELLFOUND",
        WellfoundAdapter,
        False,
        "No authorized Wellfound search API is configured. Continue on its official site.",
    ),
    PlatformDefinition(
        "shine",
        "Shine",
        "SHINE",
        ShineAdapter,
        False,
        "No authorized Shine search API is configured. Continue on its official site.",
    ),
    PlatformDefinition(
        "ziprecruiter",
        "ZipRecruiter",
        "ZIPRECRUITER",
        ZipRecruiterAdapter,
        False,
        "No authorized ZipRecruiter search API is configured. Continue on its official site.",
    ),
    PlatformDefinition(
        "jobicy",
        "Jobicy",
        "JOBICY",
        JobicyAdapter,
        True,
        "Searches listings from Jobicy's public jobs API.",
    ),
)

PLATFORMS_BY_ID = {platform.id: platform for platform in PLATFORMS}
PLATFORMS_BY_SOURCE = {platform.source_name.lower(): platform for platform in PLATFORMS}
JOB_PLATFORM_SOURCES = tuple(platform.source_name.lower() for platform in PLATFORMS)
ALL_SOURCE_NAMES = (*JOB_PLATFORM_SOURCES, "csv_import")


def get_platform(platform_id: str) -> PlatformDefinition | None:
    return PLATFORMS_BY_ID.get(platform_id.strip().lower())


def get_platforms_response() -> list[dict[str, object]]:
    return [
        {
            "id": platform.id,
            "name": platform.name,
            "status": "live" if platform.search_available else "guided_only",
            "notice": platform.notice,
            "capabilities": {
                "search": platform.search_available,
                "job_details": False,
                "application_url": True,
                "application_preparation": True,
                "application_tracking": False,
                "automation_support": False,
                "manual_action_required": True,
            },
        }
        for platform in PLATFORMS
    ]


def create_adapter(platform_id: str) -> JobSourceAdapter | None:
    platform = get_platform(platform_id)
    if platform is None:
        return None
    return platform.adapter()
