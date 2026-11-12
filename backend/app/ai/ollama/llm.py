import httpx

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.models.token_usage import TokenUsage
import logging

logger = logging.getLogger(__name__)

class OllamaService:
    def __init__(self):
        self.base_url = settings.OLLAMA_URL
        self.model = settings.DEFAULT_LLM_MODEL
        
    async def _record_usage(
        self,
        *,
        user_id: int,
        operation: str,
        prompt_tokens: int,
        completion_tokens: int,
    ) -> None:
        try:
            async with AsyncSessionLocal() as db:
                db.add(
                    TokenUsage(
                        user_id=user_id,
                        model=self.model,
                        operation=operation,
                        prompt_tokens=prompt_tokens,
                        completion_tokens=completion_tokens,
                    )
                )
                await db.commit()
        except Exception:
            logger.exception(
                "Could not persist Ollama token usage",
                extra={"user_id": user_id, "model": self.model, "operation": operation},
            )

    async def generate(
        self,
        prompt: str,
        *,
        user_id: int | None = None,
        operation: str = "generation",
    ):
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False
        }
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, timeout=30.0)
                response.raise_for_status()
                result = response.json()
                generated = result.get("response")
                if not isinstance(generated, str) or not generated.strip():
                    raise ValueError("Ollama returned an empty response.")
                if user_id is not None:
                    prompt_tokens = result.get("prompt_eval_count")
                    completion_tokens = result.get("eval_count")
                    counts_are_valid = all(
                        isinstance(count, int) and not isinstance(count, bool) and count >= 0
                        for count in (prompt_tokens, completion_tokens)
                    )
                    if counts_are_valid:
                        await self._record_usage(
                            user_id=user_id,
                            operation=operation,
                            prompt_tokens=prompt_tokens,
                            completion_tokens=completion_tokens,
                        )
                    else:
                        logger.warning(
                            "Ollama response omitted valid token counts; usage not recorded",
                            extra={"user_id": user_id, "model": self.model},
                        )
                return generated
        except Exception as e:
            logger.error(f"Ollama generation failed: {e}")
            raise RuntimeError(f"Ollama generation failed: {e}") from e
