# Local Development Guide

## Prerequisites

- Node.js 18+ and npm
- Python 3.12+
- Docker and Docker Compose (with PostgreSQL running on port 5432)

## Environment Configuration

Create `.env` in the root:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/aijobagent
SECRET_KEY=dev-secret-key-change-in-production
STORAGE_PATH=./storage
ENCRYPTION_KEY=your-32-byte-base64-encryption-key=
OLLAMA_BASE_URL=http://localhost:11434
LAYA_MODEL=llama3.2
```

Password reset emails require an SMTP server. Configure `SMTP_HOST`, `SMTP_PORT`,
`SMTP_FROM_EMAIL`, and (when required by your provider) `SMTP_USERNAME` and
`SMTP_PASSWORD`. `SMTP_STARTTLS` defaults to `true`. Set `FRONTEND_URL` to the
frontend's public base URL so reset links point to the right deployment. For
local development, this is usually `http://localhost:3000`. Docker Compose reads
these settings from the repository-root `.env`; when running the backend
directly from `backend/`, place them in `backend/.env` or export them in the shell.

## Running the Test Suite

```bash
cd backend
PYTHONPATH=. ./venv/bin/pytest tests/
```

## Running the Frontend Linter and Build

```bash
cd frontend
npm run build
```
