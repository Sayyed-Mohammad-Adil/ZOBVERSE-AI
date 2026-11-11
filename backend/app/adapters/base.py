from abc import ABC, abstractmethod
from typing import List, Dict, Any

class JobSourceAdapter(ABC):
    
    @abstractmethod
    async def search_jobs(self, query: str, location: str, **kwargs) -> List[Dict[str, Any]]:
        pass
    
    @abstractmethod
    async def get_job_details(self, external_job_id: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def normalize_job(self, raw_job: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def get_application_method(self, external_job_id: str) -> str:
        pass

    @abstractmethod
    async def supports_automation(self) -> bool:
        pass

    @abstractmethod
    async def requires_human_action(self, external_job_id: str) -> bool:
        pass

    @abstractmethod
    async def prepare_application(self, external_job_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def track_application(self, external_job_id: str) -> str:
        pass
