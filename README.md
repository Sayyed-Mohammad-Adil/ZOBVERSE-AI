# ZOBVERSE AI

**Find. Apply. Get Hired.**

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.8-black?logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.8-61DAFB?logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL 16](https://img.shields.io/badge/PostgreSQL-16_with_pgvector-336791?logo=postgresql)](https://www.postgresql.org/)
[![Light--OCR](https://img.shields.io/badge/%40arcships%2Flight--ocr-0.5.8-00C49F)](https://github.com/arcships/light-ocr)
[![Laya AI](https://img.shields.io/badge/Laya-Structured_Decisions-blueviolet)](https://github.com/)
[![Ollama](https://img.shields.io/badge/Ollama-Local_LLM-white?logo=ollama)](https://ollama.com/)
[![Playwright](https://img.shields.io/badge/Playwright-Browser_Automation-2EAD33?logo=playwright)](https://playwright.dev/)
[![GSAP](https://img.shields.io/badge/GSAP-Luxury_Motion-88CE02?logo=greensock)](https://gsap.com/)
[![Rule 2 Compliant](https://img.shields.io/badge/Policy-Zero_Fabrication-emerald)](https://github.com/)

**ZOBVERSE AI** is a greenfield, production-grade, autonomous AI career assistant and job application platform. Built from first principles with **Next.js 16 (Turbopack)**, **FastAPI**, **PostgreSQL with pgvector**, **@arcships/light-ocr**, **Laya**, and **Ollama**.

ZOBVERSE AI is strictly optimized for **Application Quality and Candidate Reputation**, not indiscriminate spam. It enforces the **Non-Negotiable Rule 2: Zero Fabrication of Candidate Details**, explainable deterministic matching, local offline document vision, and human-in-the-loop review.

---

## Table of Contents

- [1. Core Philosophy & Non-Negotiables](#1-core-philosophy--non-negotiables)
- [2. System Architecture](#2-system-architecture)
- [3. Key Platform Capabilities](#3-key-platform-capabilities)
  - [3.1 Candidate Brain & Multi-Resume Engine](#31-candidate-brain--multi-resume-engine)
  - [3.2 Light-OCR Document Vision Core](#32-light-ocr-document-vision-core)
  - [3.3 Explainable 5-Factor Match Engine](#33-explainable-5-factor-match-engine)
  - [3.4 5-Tier Duplicate Detection Shield](#34-5-tier-duplicate-detection-shield)
  - [3.5 10-Stage Application State Machine](#35-10-stage-application-state-machine)
  - [3.6 Human-in-the-Loop Review Queue](#36-human-in-the-loop-review-queue)
  - [3.7 Verified Question Bank with Attribution](#37-verified-question-bank-with-attribution)
  - [3.8 Interview & Compensation Offer Hub](#38-interview--compensation-offer-hub)
  - [3.9 Reporting & Funnel Analytics Dashboard](#39-reporting--funnel-analytics-dashboard)
  - [3.10 GSAP Luxury Boot Sequence & Top Navbar Center](#310-gsap-luxury-boot-sequence--top-navbar-center)
- [4. Technology Stack](#4-technology-stack)
- [5. Database Architecture & Worker Queue](#5-database-architecture--worker-queue)
- [6. REST API Specification](#6-rest-api-specification)
- [7. Quick Start: Docker Compose](#7-quick-start-docker-compose)
- [8. Local Manual Development Setup](#8-local-manual-development-setup)
- [9. Environment Configuration Reference](#9-environment-configuration-reference)
- [10. Testing, Quality Bar & Verification](#10-testing-quality-bar--verification)
- [11. Security, Privacy & Data Sovereignty](#11-security-privacy--data-sovereignty)

---

## 1. Core Philosophy & Non-Negotiables

Mass indiscriminate job application bots destroy candidate reputations, trigger portal anti-bot blocks, and get candidates permanently blacklisted. ZOBVERSE AI enforces four non-negotiable operational tenets:

1. **Rule 2: Zero Candidate Fabrication**: The platform will never invent years of experience, hallucinate skills, falsify visa requirements, or fabricate references in cover letters or screening forms. If a fact is unverified in the Candidate Brain, the application is paused and routed to the Human-in-the-Loop Review Queue.
2. **Deterministic & Semantic Transparency**: No opaque black-box "match scores". Every role evaluated displays an itemized 0–100% score broken down by Required Skills, Years of Experience, Work Mode/Location, Compensation Range, and Role Seniority.
3. **Local Offline Privacy (Light-OCR)**: Scanned resumes, image scans (PNG, JPG, WebP), and documents are processed locally on the candidate's machine via `@arcships/light-ocr` (PP-OCRv6, PDFium, WebGPU/CPU) with **zero cloud egress** and zero third-party data broker sharing.
4. **Native PostgreSQL Architecture (No Redis, No Celery)**: Application task queues and async processing use PostgreSQL's native `FOR UPDATE SKIP LOCKED` row-level locks, eliminating unnecessary operational overhead and third-party queue dependencies.

---

## 2. System Architecture

```text
                                  ┌─────────────────────────────────────────┐
                                  │      ZOBVERSE AI Web Interface (UI)        │
                                  │   Next.js 16 (App Router) • React 19    │
                                  │   GSAP Motion • Lucide • Tailwind CSS   │
                                  └────────────────────┬────────────────────┘
                                                       │
                                              HTTPS / JSON / SSE
                                                       │
                                                       ▼
                                  ┌─────────────────────────────────────────┐
                                  │       ZOBVERSE AI API Gateway (FastAPI)    │
                                  │  Python 3.12+ • Async SQLAlchemy • Pydantic v2
                                  └────┬───────────────┬────────────────┬───┘
                                       │               │                │
            ┌──────────────────────────┘               │                └──────────────────────────┐
            ▼                                          ▼                                           ▼
┌────────────────────────┐                ┌────────────────────────┐                  ┌────────────────────────┐
│  Document Vision Core  │                │   AI Reasoning Layer   │                  │  PostgreSQL 16 DB      │
│   @arcships/light-ocr  │                │  Laya Decision Engine  │                  │  + pgvector Extension  │
│   PP-OCRv6 • PDFium    │                │  Ollama Generative LLM │                  │  Candidate Profiles    │
│   WebGPU / CPU Offline │                └────────────────────────┘                  │  Applications & Jobs   │
└────────────────────────┘                                                            └───────────┬────────────┘
                                                                                                  │
                                                                                          FOR UPDATE SKIP LOCKED
                                                                                                  │
                                                                                                  ▼
                                                                                      ┌────────────────────────┐
                                                                                      │ PostgreSQL Worker Loop │
                                                                                      │  Authorized Discovery  │
                                                                                      │  Deduplication Engine  │
                                                                                      │  Match & Prepare Queue │
                                                                                      └───────────┬────────────┘
                                                                                                  │
                                                                                     Assisted Headless Session
                                                                                                  │
                                                                                                  ▼
                                                                                      ┌────────────────────────┐
                                                                                      │  Playwright Automation │
                                                                                      │  Anti-Bot Pausing      │
                                                                                      │  Cookie-Auth Portals   │
                                                                                      └────────────────────────┘
```

---

## 3. Key Platform Capabilities

### 3.1 Candidate Brain & Multi-Resume Engine
- **Multi-Resume Management**: Upload multiple tailored versions of your CV (e.g., *Frontend Distributed Lead.pdf*, *Python Backend Specialist.docx*, *ML Engineer Scan.png*).
- **Automated Skill & Entity Extraction**: Laya and native AST parsers extract technical skills, cumulative experience years, educational history, current role, phone, email, and embedded hyperlinks (LinkedIn, GitHub, Portfolio).
- **Intelligent Variant Recommendation**: For each discovered job opportunity, the engine compares all candidate resumes against the job description and automatically selects the highest-scoring CV variant while allowing manual override.

### 3.2 Light-OCR Document Vision Core
- Integrated with [`@arcships/light-ocr`](https://github.com/arcships/light-ocr) for ultra-fast, local, offline OCR.
- **Scanned PDF Recovery**: If an uploaded PDF contains non-selectable bitmap text, ZOBVERSE AI invokes PDFium and PP-OCRv6 Small to extract all textual lines, bounding boxes, and confidence scores locally.
- **Image CV Support**: Direct parsing of PNG, JPEG, JPG, WebP, BMP, and TIFF files.
- **Hardware Acceleration**: Automatically selects WebGPU or CPU execution flavors with zero cloud API keys or network latency.

### 3.3 Explainable 5-Factor Match Engine
Every evaluated job produces a transparent, deterministic match score (0–100%) accompanied by a comprehensive justification card:
- **Skill Alignment (40%)**: Ratio of verified candidate skills against required and preferred job skills.
- **Experience Match (25%)**: Candidate cumulative experience vs employer minimum requirements.
- **Role & Seniority Fit (15%)**: Alignment of target titles (e.g., Staff vs Senior vs Lead).
- **Location & Work Mode (10%)**: Verification of Remote, Hybrid, or On-site compliance with user preferences.
- **Compensation Match (10%)**: Verification against candidate minimum base salary requirements.

### 3.4 Listing & Application Duplicate Protection
Prevents duplicate listings by checking provider IDs and canonicalized job URLs
(known tracking parameters and fragments are removed). Application preparation
also checks for an existing application record for the same candidate and job.
Listings with different URLs are not claimed as duplicates unless an exact
provider ID or URL match is available.

### 3.5 Candidate-Confirmed Application Tracking
The current workflow prepares applications for candidate review and never
reports a provider submission as successful. Application statuses are:
```text
READY ──► APPLIED ──► INTERVIEW ──► OFFER
   ├────► REJECTED
   └────► SKIPPED
```
`APPLIED` is a candidate-confirmed status; no current board adapter submits
applications or confirms submission automatically.

### 3.6 Human-in-the-Loop Review Queue
Prepared applications are stored in `READY` status and can be reviewed before
the candidate opens the official application page. Unknown screening answers
require user input. Authentication challenges, CAPTCHAs, and anti-bot controls
are not bypassed.

### 3.7 Multi-Platform Job Discovery
LinkedIn and Jobicy currently have live search adapters. Indeed, Naukri.com,
Internshala, Foundit, Glassdoor, Wellfound, Shine, and ZipRecruiter are
selectable as guided official-site workflows. Their automated search remains
disabled until an authorized provider API/feed is configured; the application
does not scrape those sites or bypass their controls. Platform selection is
stored per candidate, with LinkedIn enabled by default.

### 3.8 Verified Question Bank with Attribution
- Common screening questions (work authorization, visa sponsorship, notice period, salary expectations, years with specific technologies) are cataloged.
- Every answer includes a **Truthfulness Attribution Tag** (e.g., `Derived from CV: Backend_2026.pdf` or `User Verified`).
- If an employer asks an unverified question, ZOBVERSE AI flags `USER INPUT REQUIRED` rather than guessing.

### 3.9 Interview & Compensation Offer Hub
- **Interview Tracker** ([`/dashboard/interviews`](http://localhost:3000/dashboard/interviews)): Log rounds (Recruiter Screen, Technical Coding, System Design, Behavioral), interviewer names, schedule timestamps, round notes, and feedback.
- **Offer Comparator** ([`/dashboard/offers`](http://localhost:3000/dashboard/offers)): Compare total compensation packages across competing offers, including Base Salary, Bonus, Equity (RSUs/Options), Currency, and Work Flexibility.

### 3.10 Reporting & Funnel Analytics Dashboard
- **Funnel Attrition Visualizer** ([`/dashboard/reporting`](http://localhost:3000/dashboard/reporting)): View conversion drop-offs from raw discovery → qualification → submission → recruiter screen → written offer.
- **Weekly Application Velocity & Cadence**: Daily bar chart measuring submission velocity against configured safety limits (e.g., 10 applications/day) with anti-detection pacing indicators.
- **Platform Performance Matrix**: Conversion rates, average response times, and interview frequencies across LinkedIn, Jobicy, RemoteOK, and direct company ATS portals.
- **Export Engine**: 1-click export of complete application histories and telemetry to CSV and JSON formats.

### 3.11 GSAP Luxury Boot Sequence & Top Navbar Center
- **GSAP Luxury Loader**: A sleek 60fps first-time splash screen built with GSAP timelines, glowing ambient gradient portals, dual rotating neon rings, and an animated initialization telemetry ticker (`Booting Engine...` → `Calibrating Light-OCR...` → `Ready`). Session-gated via `sessionStorage`.
- **Top Navbar Notification Center**: Replaced the sidebar notification link with an interactive popover in the top navbar showing unread counts, recent alerts, and quick "Mark all read" controls.
- **Dedicated Real-Time Terminal**: Accessible via [`/dashboard/console`](http://localhost:3000/dashboard/console) with Server-Sent Events (SSE) streaming live background worker daemon activity.

---

## 4. Technology Stack

| Layer | Technologies | Purpose |
|---|---|---|
| **Frontend Framework** | **Next.js 16.3.8 (Turbopack)** | Server components, fast compilation, static optimization |
| **UI Library** | **React 19.2.8** | Component architecture, client transitions |
| **Styling & Icons** | **Tailwind CSS v4 • Lucide React** | Dark luxury aesthetic, glassmorphism, responsive UI |
| **Motion Engine** | **GSAP (GreenSock)** | High-performance luxury intro and telemetry transitions |
| **Document Vision** | **@arcships/light-ocr 0.5.8** | Local offline OCR (PP-OCRv6, PDFium, WebGPU/CPU) |
| **Backend REST API** | **FastAPI • Python 3.12+** | High-performance async REST API, Pydantic v2 schemas |
| **Database & Vectors**| **PostgreSQL 16 • pgvector** | Relational storage + semantic vector embeddings |
| **ORM & Migrations** | **SQLAlchemy 2.0 (Async) • Alembic** | Async database access, deterministic migration graphs |
| **Decision AI** | **Laya** | Zero-prompt structured entity extraction & classification |
| **Generative AI** | **Ollama (local deep learning)** | Grounded, non-fabricated cover letter generation |
| **Automation** | **Playwright** | Headless portal interaction with anti-bot pause triggers |

---

## 5. Database Architecture & Worker Queue

### PostgreSQL Row-Level Worker Queue (No Redis)
Instead of adding Redis or Celery dependencies, ZOBVERSE AI utilizes PostgreSQL's atomic row-level locking:

```sql
-- Worker atomic lock query pattern
SELECT id, task_type, payload
FROM worker_tasks
WHERE status = 'PENDING'
  AND run_at <= NOW()
ORDER BY priority DESC, id ASC
FOR UPDATE SKIP LOCKED
LIMIT 1;
```

This guarantees:
- **Zero Race Conditions**: Multiple worker instances can run in parallel without double-processing tasks.
- **Crash Safety**: Unfinished tasks revert safely if a worker disconnects.
- **Zero Additional Infrastructure**: Backups, replication, and telemetry reside in one consolidated PostgreSQL database.

### Primary Database Models
- `users`: Authentication credentials, hashed passwords, roles.
- `candidate_profiles`: Full name, phone, email, bio, current role, location, target compensation, skills list.
- `candidate_preferences`: Desired job titles, remote preferences, excluded companies, automation mode (`Assisted` vs `Autonomous`), daily limits.
- `resumes`: Binary file metadata, original filename, parsed plain text, default status.
- `jobs`: Aggregated job postings, title, company, description, salary, platform ID, canonical URL, SHA-256 hash.
- `applications`: Application pipeline records, status enum, match score, resume ID used, submission history JSON.
- `review_items`: Items requiring human approval, reason enum, status, proposed answers.
- `interviews`: Interview rounds, dates, interviewer details, feedback notes.
- `offers`: Compensation packages, base, bonus, equity, decision deadlines.
- `question_bank`: Reusable questions, candidate answers, confidence scores, attribution sources.
- `credentials`: AES-256 encrypted platform session cookies (e.g. LinkedIn `li_at`).

---

## 6. REST API Specification

### Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/register`: Create candidate account.
- `POST /api/v1/auth/login`: Authenticate and receive JWT access token.
- `GET /api/v1/auth/me`: Get current authenticated user profile.

### Candidate Profile & Brain (`/api/v1/profile`, `/api/v1/preferences`)
- `GET /api/v1/profile/{user_id}`: Retrieve Candidate Brain data.
- `PUT /api/v1/profile/{user_id}`: Update candidate details and verified skills.
- `GET /api/v1/preferences/{user_id}`: Retrieve search parameters and automation modes.
- `PUT /api/v1/preferences/{user_id}`: Update daily limits, execution mode, and salary targets.
- `GET /api/v1/settings/job-sources`: List platform capabilities and availability.
- `GET /api/v1/settings/job-sources/preferences`: Read the authenticated candidate's selected platforms.
- `PUT /api/v1/settings/job-sources/preferences`: Save selected platform IDs for the authenticated candidate.

### Resumes & Light-OCR Vision (`/api/v1/resumes`)
- `POST /api/v1/resumes/?user_id={id}`: Upload CV (PDF, DOCX, TXT, PNG, JPG, WebP). Triggers automated text extraction and Laya entity parsing.
- `GET /api/v1/resumes/{user_id}`: List all candidate resumes and default flags.
- `PUT /api/v1/resumes/{resume_id}/default`: Set active default resume.
- `DELETE /api/v1/resumes/{resume_id}`: Remove resume and local files.
- `GET /api/v1/resumes/ocr/status`: Check `@arcships/light-ocr` version, hardware providers (WebGPU/CPU), and engine status.
- `POST /api/v1/resumes/ocr/test`: Direct OCR endpoint to test document recognition on uploaded images or PDFs.

### Job Discovery & Matching (`/api/v1/jobs`, `/api/v1/matching`)
- `GET /api/v1/jobs/`: List discovered opportunities with filter criteria.
- `POST /api/v1/workers/scan`: Search selected live platforms and report guided-only platform availability.
- `POST /api/v1/matching/evaluate`: Compute explainable 5-factor match score for a job.

### Application Pipeline & Review Queue (`/api/v1/applications`, `/api/v1/review`)
- `GET /api/v1/applications/{user_id}`: List active applications and states.
- `POST /api/v1/applications/prepare`: Prepare an application package; it does not submit to a job board.
- `PUT /api/v1/applications/{application_id}`: Update tracking status; `APPLIED` requires candidate confirmation.
- `POST /api/v1/applications/import-csv`: Bulk import historical job applications from CSV.
- `GET /api/v1/review/{user_id}`: List pending human review approval items.
- `POST /api/v1/review/{review_id}/approve`: Approve proposed answers for candidate review.
- `POST /api/v1/review/{review_id}/reject`: Skip or dismiss application.

### Telemetry & Reporting (`/api/v1/analytics`, `/api/v1/notifications`)
- `GET /api/v1/analytics/{user_id}`: Ingested totals, pipeline counts, match distributions.
- `GET /api/v1/notifications/{user_id}`: Candidate notifications and application status updates.
- `PUT /api/v1/notifications/{id}/read`: Mark notification as read.
- `GET /api/v1/settings/stream/logs`: Server-Sent Events (SSE) stream for live agent execution console.

---

## 7. Quick Start: Docker Compose

Docker Compose starts its own PostgreSQL container and volume. If you already
run PostgreSQL in a separate container on host port `5432`, use the manual
development setup below instead; do not assume Compose's database is the same
database as your existing container.

```bash
# 1. Clone repository
git clone https://github.com/Sayyed-Mohammad-Adil/ZOBVERSE-AI.git
cd ZOBVERSE-AI

# 2. Configure deployment secrets in an untracked .env file before starting.

# 3. Build and launch all containers, including the Compose PostgreSQL service
docker compose up -d --build

# 4. Apply migrations to the Compose database
docker compose exec backend alembic upgrade head

# 5. Confirm the schema is current
docker compose exec backend alembic current
```

The browser calls the same-origin `/api/v1` route; Next.js proxies API requests
to the backend service. For local manual development, the proxy defaults to
`http://127.0.0.1:8000`; set `API_PROXY_URL` to the backend origin when it is
hosted elsewhere.

### Deployed Services:
- **ZOBVERSE AI Web UI**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Interactive Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **PostgreSQL Database**: `localhost:5432` (`job_agent`)
- **Ollama Local LLM**: `localhost:11434`

---

## 8. Local Manual Development Setup

### 8.1 Backend Setup (Python 3.12+)

For an existing PostgreSQL container publishing port `5432`, run the backend
and worker on the host and point `DATABASE_URL` at that published port. Use the
same database name and credentials that were configured for the PostgreSQL
container. Put this setting in `backend/.env` (the backend loads `.env` from
its working directory) or export it in the shell used to run Alembic, the API,
and the worker. For example:

```dotenv
DATABASE_URL=postgresql+asyncpg://<user>:<password>@localhost:5432/<database>
```

Do not run a second PostgreSQL container from Compose if you intend to use this
existing database.

```bash
cd backend

# 1. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt
pip install laya

# 3. Apply migrations to the database selected by DATABASE_URL
alembic upgrade head

# 4. Verify the migration revision; it should be at head
alembic current

# 5. Start the FastAPI development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 8.2 Launch Background Worker Daemon

In a separate terminal:

```bash
cd backend
source venv/bin/activate
python -m app.workers.main
```

Always run `alembic upgrade head` before starting the API or worker after
updating the code. The worker and API must use the same `DATABASE_URL` as the
migration command.

### 8.3 Frontend Setup (Node.js 22+)

```bash
cd frontend

# 1. Install Node dependencies
npm install

# 2. Build production assets or start dev server
npm run dev

# Or run optimized production build:
npm run build
npm start
```

### 8.4 Sign In

Create an account through the registration page or sign in with your registered account. No default demo credentials are configured.

---

## 9. Environment Configuration Reference

Docker Compose reads its interpolation values from an untracked `.env` file in
the repository root. For manual backend development, put backend settings in
`backend/.env` or export them in the shell; the backend is started from the
`backend/` directory. The database URL must point to the PostgreSQL instance
you intend to use.

```dotenv
# ==========================================
# Core Database Settings (PostgreSQL 16)
# ==========================================
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_DB=job_agent
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/job_agent

# ==========================================
# Security & JWT Tokens
# ==========================================
JWT_SECRET=<generate-a-strong-random-secret>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# ==========================================
# Local Document Storage
# ==========================================
STORAGE_PATH=./storage/resumes

# ==========================================
# AI Models & Decision Engine
# ==========================================
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral:latest
LAYA_ENABLED=true

# ==========================================
# Browser Automation Settings
# ==========================================
PLAYWRIGHT_HEADLESS=true
PLAYWRIGHT_SLOW_MO_MS=100
MAX_DAILY_APPLICATIONS=10

# ==========================================
# Frontend API proxy (optional; defaults to http://127.0.0.1:8000)
# ==========================================
API_PROXY_URL=http://127.0.0.1:8000
```

---

## 10. Testing, Quality Bar & Verification

ZOBVERSE AI adheres to rigorous quality standards and includes end-to-end automated test suites.

### Running Backend Tests
Run the backend test suite. Configure and migrate a disposable test database before running database integration tests:

```bash
cd backend
./venv/bin/python -m pytest -v
```

### Running Frontend Production Build
Compile and type-check the frontend:

```bash
cd frontend
npm run build
```

### Database migration troubleshooting

If the worker reports an error such as
`column candidate_preferences.job_sources does not exist`, the database used
by the worker is behind the application code. Stop the worker, then from the
repository root run the migration with the same environment and `.env` file
used by the backend:

```bash
cd backend
source venv/bin/activate
alembic current
alembic upgrade head
alembic current
```

The final command should report the current head revision. Restart the API and
worker afterward. A migration run against a different `DATABASE_URL` will not
fix the worker's database. To check a standalone PostgreSQL container, first
identify its name with `docker ps`, then inspect its database with
`docker exec -it <postgres-container> psql -U <user> -d <database>`. Avoid
printing or sharing database passwords when troubleshooting.

---

## 11. Security, Privacy & Data Sovereignty

- **Zero Cloud Leakage**: Document text recognition runs strictly on your machine via `@arcships/light-ocr` without sending candidate resumes or personal data to proprietary third-party OCR services.
- **AES-256 Credential Encryption**: Sensitive browser credentials and LinkedIn session cookies (`li_at`) are encrypted at rest using AES-256.
- **Strict Anti-Bot Safety**: The automation engine strictly pauses when anti-bot challenges or CAPTCHAs appear, alerting the user rather than attempting evasion techniques that risk account suspension.
- **Data Deletion Guarantee**: All uploaded resumes, application audit logs, and profile records can be permanently deleted with a single click.

---

## License

Distributed under the Apache 2.0 License. Built with integrity for authentic, high-quality career growth.
