import asyncio
import logging
from typing import Any

import httpx

logger = logging.getLogger(__name__)


async def get_with_retries(
    client: httpx.AsyncClient,
    url: str,
    *,
    provider: str,
    params: dict[str, Any] | None = None,
    max_attempts: int = 2,
) -> httpx.Response:
    """Retry transient transport/server errors, but never access restrictions."""
    for attempt in range(1, max_attempts + 1):
        try:
            response = await client.get(url, params=params)
        except (httpx.TimeoutException, httpx.NetworkError):
            if attempt == max_attempts:
                raise
            logger.warning(
                "Transient %s request failure; retrying",
                provider,
                extra={"provider": provider, "attempt": attempt},
            )
        else:
            if response.status_code in {401, 403, 407, 429}:
                return response
            if response.status_code < 500 or attempt == max_attempts:
                return response
            logger.warning(
                "Transient %s HTTP %s response; retrying",
                provider,
                response.status_code,
                extra={"provider": provider, "attempt": attempt},
            )

        await asyncio.sleep(0.2 * attempt)

    raise RuntimeError(f"{provider} request failed without a response")
