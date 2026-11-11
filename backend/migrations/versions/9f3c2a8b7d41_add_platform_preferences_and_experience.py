"""Add platform preferences and job experience metadata.

Revision ID: 9f3c2a8b7d41
Revises: 51c7a6d2e90f
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "9f3c2a8b7d41"
down_revision: Union[str, None] = "51c7a6d2e90f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("jobs", sa.Column("experience", sa.String(), nullable=True))
    op.add_column(
        "candidate_preferences",
        sa.Column("job_sources", sa.JSON(), nullable=True),
    )
    op.execute(
        "UPDATE candidate_preferences "
        "SET job_sources = '[\"linkedin\", \"jobicy\"]' "
        "WHERE job_sources IS NULL"
    )


def downgrade() -> None:
    op.drop_column("candidate_preferences", "job_sources")
    op.drop_column("jobs", "experience")
