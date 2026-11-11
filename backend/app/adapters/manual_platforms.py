from typing import Any

from app.adapters.base import JobSourceAdapter


class GuidedPlatformAdapter(JobSourceAdapter):
    source_name = ""
    platform_name = ""

    async def search_jobs(self, query: str, location: str, **kwargs: Any) -> list[dict[str, Any]]:
        raise RuntimeError(
            f"{self.platform_name} does not expose a configured authorized job-search API. "
            "Use its official search page; automated access is disabled."
        )

    async def get_job_details(self, external_job_id: str) -> dict[str, Any]:
        raise NotImplementedError(f"{self.platform_name} job details require the official listing page.")

    async def normalize_job(self, raw_job: dict[str, Any]) -> dict[str, Any]:
        return raw_job

    async def get_application_method(self, external_job_id: str) -> str:
        return "EXTERNAL"

    async def supports_automation(self) -> bool:
        return False

    async def requires_human_action(self, external_job_id: str) -> bool:
        return True

    async def prepare_application(
        self,
        external_job_id: str,
        profile_data: dict[str, Any],
    ) -> dict[str, Any]:
        return {
            "status": "requires_manual",
            "method": "EXTERNAL",
            "notes": f"Complete the application on the official {self.platform_name} page.",
            "data": profile_data,
        }

    async def track_application(self, external_job_id: str) -> str:
        raise NotImplementedError(f"{self.platform_name} does not provide application status tracking.")


class IndeedAdapter(GuidedPlatformAdapter):
    source_name = "INDEED"
    platform_name = "Indeed"


class NaukriAdapter(GuidedPlatformAdapter):
    source_name = "NAUKRI"
    platform_name = "Naukri"


class InternshalaAdapter(GuidedPlatformAdapter):
    source_name = "INTERNSHALA"
    platform_name = "Internshala"


class FounditAdapter(GuidedPlatformAdapter):
    source_name = "FOUNDIT"
    platform_name = "Foundit"


class GlassdoorAdapter(GuidedPlatformAdapter):
    source_name = "GLASSDOOR"
    platform_name = "Glassdoor"


class WellfoundAdapter(GuidedPlatformAdapter):
    source_name = "WELLFOUND"
    platform_name = "Wellfound"


class ShineAdapter(GuidedPlatformAdapter):
    source_name = "SHINE"
    platform_name = "Shine"


class ZipRecruiterAdapter(GuidedPlatformAdapter):
    source_name = "ZIPRECRUITER"
    platform_name = "ZipRecruiter"
