# Production Deployment Guide

## Docker Compose Deployment

The application is fully containerized across 5 cooperating services:
- `frontend`: Next.js 15 SSR server running on port 3000.
- `backend`: FastAPI Uvicorn ASGI server running on port 8000.
- `postgres`: PostgreSQL 16 image with `pgvector` pre-configured on port 5432.
- `worker`: Standalone Python worker daemon continuously polling `background_jobs`.
- `ollama`: Containerized Ollama instance running on port 11434.

### Launching the Stack

```bash
docker compose up -d --build
```

### Checking Container Health

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f worker
```

### Applying Database Migrations in Production

```bash
docker compose exec backend alembic upgrade head
```
