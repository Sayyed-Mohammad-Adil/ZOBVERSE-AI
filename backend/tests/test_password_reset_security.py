import asyncio
from urllib.parse import parse_qs, urlparse

from app.api.endpoints import auth
from app.core.security import (
    create_access_token,
    create_password_reset_token,
    get_password_hash,
    get_password_reset_subject,
    verify_password,
    verify_password_reset_token,
)
from app.models.user import User


class FakeResult:
    def __init__(self, user):
        self.user = user

    def scalars(self):
        return self

    def first(self):
        return self.user


class FakeSession:
    def __init__(self, user):
        self.user = user

    async def execute(self, _query):
        return FakeResult(self.user)

    async def commit(self):
        pass


def test_reset_token_is_valid_for_current_password_only():
    current_hash = get_password_hash("original-password")
    token = create_password_reset_token(42, current_hash)

    assert get_password_reset_subject(token) == "42"
    assert verify_password_reset_token(token, current_hash) == "42"
    assert verify_password_reset_token(token, get_password_hash("changed-password")) is None


def test_access_token_cannot_be_used_as_password_reset_token():
    access_token = create_access_token(42)

    assert get_password_reset_subject(access_token) is None
    assert verify_password_reset_token(access_token, get_password_hash("password")) is None


def test_forgot_password_email_link_resets_account(monkeypatch):
    user = User(
        id=42,
        email="candidate@example.com",
        hashed_password=get_password_hash("original-password"),
    )
    db = FakeSession(user)
    sent_emails = []
    monkeypatch.setattr(auth.settings, "SMTP_HOST", "smtp.example.com")
    monkeypatch.setattr(auth.settings, "SMTP_FROM_EMAIL", "jobs@example.com")
    monkeypatch.setattr(
        auth,
        "_send_password_reset_email",
        lambda recipient, url: sent_emails.append((recipient, url)),
    )

    result = asyncio.run(
        auth.request_password_reset(
            auth.PasswordResetRequest(email=user.email),
            db,
        )
    )

    assert result["message"].startswith("If an account exists")
    assert sent_emails[0][0] == user.email
    token = parse_qs(urlparse(sent_emails[0][1]).query)["token"][0]
    asyncio.run(
        auth.reset_password(
            auth.PasswordResetConfirm(token=token, new_password="new-password"),
            db,
        )
    )

    assert verify_password("new-password", user.hashed_password)
    assert verify_password_reset_token(token, user.hashed_password) is None
