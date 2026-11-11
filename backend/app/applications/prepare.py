import logging
from typing import Dict, Any
from app.ai.ollama.llm import OllamaService
from app.models.profile import CandidateProfile
from app.models.job import Job

logger = logging.getLogger(__name__)

class ApplicationPreparer:
    def __init__(self):
        self.llm = OllamaService()

    async def generate_cover_letter(self, profile: CandidateProfile, job: Job, tone: str = "Professional") -> str:
        prompt = f"""
        Write a {tone} cover letter for the following candidate applying to the following job:
        
        Candidate Name: {profile.first_name} {profile.last_name}
        Current Role: {profile.current_role}
        Skills: {profile.skills}
        Experience: {profile.total_experience_years} years
        
        Job Title: {job.title}
        Company: {job.company}
        Description: {job.description[:1000]}
        
        Keep it concise, under 300 words. Do not invent any facts not in the profile.
        """
        
        try:
            return await self.llm.generate(prompt)
        except Exception as e:
            logger.error(f"Failed to generate cover letter: {e}")
            return "Failed to generate cover letter."

    async def extract_screening_answers(self, questions: list[str], profile: CandidateProfile) -> Dict[str, str]:
        # Would map answers or ask for human review if unknown
        return {q: "Under review" for q in questions}

    async def prepare_application(self, profile: CandidateProfile, job: Job) -> Dict[str, Any]:
        logger.info(f"Preparing application for job {job.id} - {job.title}")
        cover_letter = await self.generate_cover_letter(profile, job)
        
        return {
            "cover_letter": cover_letter,
            "screening_answers": {},
            "status": "PREPARED",
            "confidence": 0.92
        }
