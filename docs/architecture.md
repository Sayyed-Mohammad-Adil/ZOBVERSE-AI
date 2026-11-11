# System Architecture

## 1. High-Level Architecture

The AI Job Application Agent is structured as a modular, UI-first platform designed to assist candidates with precision application workflows.

```mermaid
graph TD
    Client[Next.js 15 UI Dashboard] -->|REST / JSON| API[FastAPI Backend]
    API -->|Async ORM| DB[(PostgreSQL 16 + pgvector)]
    API -->|Laya Zero-Prompt Decisions| Laya[Laya Engine]
    API -->|Cover Letters / Generative| Ollama[Ollama Local LLM]
    API -->|Push Task| DBQueue[PostgreSQL background_jobs]
    Worker[PostgreSQL Queue Worker] -->|FOR UPDATE SKIP LOCKED| DBQueue
    Worker -->|Guest Search / Scrape| Adapters[LinkedIn / Jobicy Adapters]
    Worker -->|Assisted Workflow| Browser[Playwright Automation]
    Browser -->|Anti-bot / Challenge| Human[Human Action Required]
```

## 2. Core Principles & Philosophy

1. **Quality over Quantity**: The system optimizes for highly targeted, customized applications that closely align with candidate skills and expectations, rather than blasting thousands of generic submissions.
2. **Strict Rule 2 Compliance**:
   - Zero fabrication of candidate details (experience, skills, salary, authorization).
   - Zero bypass of CAPTCHA, Cloudflare, or anti-bot protections.
   - Zero duplicate applications to the same job opening.
3. **No External Cache Dependency**: Redis and Celery are deliberately omitted in favor of PostgreSQL's native transaction isolation and `SELECT FOR UPDATE SKIP LOCKED` concurrency patterns.
