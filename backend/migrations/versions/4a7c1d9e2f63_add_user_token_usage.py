"""Track per-user Ollama token usage.

Revision ID: 4a7c1d9e2f63
Revises: 9f3c2a8b7d41
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "4a7c1d9e2f63"
down_revision: Union[str, None] = "9f3c2a8b7d41"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "token_usage",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("model", sa.String(), nullable=False),
        sa.Column("operation", sa.String(), nullable=False),
        sa.Column("prompt_tokens", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("completion_tokens", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.create_index(
        "ix_token_usage_user_created_at",
        "token_usage",
        ["user_id", "created_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_token_usage_user_created_at", table_name="token_usage")
    op.drop_table("token_usage")
