from unittest.mock import AsyncMock

import pytest
from fastapi import HTTPException

from app.api.endpoints.applications import create_application, update_application
from app.schemas.application import ApplicationCreate, ApplicationUpdate


@pytest.mark.asyncio
@pytest.mark.parametrize("status", ["APPLIED", "applied"])
async def test_update_requires_candidate_confirmation_before_applied_status(status):
    db = AsyncMock()

    with pytest.raises(HTTPException) as exc_info:
        await update_application(
            1,
            ApplicationUpdate(status=status),
            db,
        )

    assert exc_info.value.status_code == 422
    db.execute.assert_not_awaited()


@pytest.mark.asyncio
@pytest.mark.parametrize("status", ["APPLIED", "applied"])
async def test_create_cannot_start_as_applied(status):
    db = AsyncMock()

    with pytest.raises(HTTPException) as exc_info:
        await create_application(
            1,
            ApplicationCreate(job_id=1, status=status),
            db,
        )

    assert exc_info.value.status_code == 422
    db.execute.assert_not_awaited()
