"""remove synthetic job adapter values

Revision ID: 8e5c1429a7b3
Revises: 147cabdda31f
Create Date: 2026-11-11
"""
from typing import Sequence, Union

from alembic import op


revision: str = "8e5c1429a7b3"
down_revision: Union[str, None] = "147cabdda31f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        UPDATE jobs
        SET source = 'UNVERIFIED'
        WHERE lower(source) = 'dummy'
           OR left(lower(external_job_id), 6) = 'dummy_'
        """
    )
    op.execute(
        """
        UPDATE jobs
        SET source = 'UNVERIFIED'
        WHERE lower(source) = 'indeed'
          AND lower(canonical_url) LIKE '%indeed.com/viewjob?jk=%'
        """
    )
    op.execute(
        """
        UPDATE jobs
        SET source = 'JOBICY'
        WHERE lower(source) = 'indeed'
        """
    )
    op.execute(
        """
        UPDATE jobs
        SET description = '', requirements = NULL, skills = NULL
        WHERE lower(source) = 'linkedin'
          AND description LIKE
            'Position: % Search query: % Requirements: experience with %, software development best practices, and relevant engineering tools.'
        """
    )


def downgrade() -> None:
    pass
