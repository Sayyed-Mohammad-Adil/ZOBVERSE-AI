# Database Schema & Migrations

## 1. Schema Overview

The database is built on **PostgreSQL 16** with **pgvector** support and managed via **Alembic**.

### Key Tables

1. `users`: Authentication records, email, bcrypt-hashed passwords.
2. `candidate_profiles`: Contact details, current role, total years of experience, professional summary, skills JSON/CSV.
3. `candidate_preferences`: Minimum & target salaries, preferred currencies, preferred roles, locations, work modes, and automation mode.
4. `resumes`: Uploaded CV documents (PDF, DOCX, TXT), parsed text content, and default resume flag.
5. `jobs`: External job listings with external IDs, titles, companies, locations, salary intervals, raw descriptions, and extracted skills.
6. `applications`: Application records tracking job relation, selected resume, cover letter, status state machine, and status change history.
7. `interviews`: Scheduled interview rounds, dates, interviewers, preparation notes, feedback, and reminders.
8. `offers`: Compensation records, base salary, bonus, equity, currency, location, and negotiation status.
9. `questions`: Saved screening question bank with answers, categories, confidence scores, and source origins.
10. `background_jobs`: PostgreSQL-native queue storing task payload, status, attempt counts, and lock leases.
11. `audit_logs`: Immutable tracking of user, AI, and system actions.

## 2. Migrations

Alembic migration versions are located in `backend/migrations/versions/`.

```bash
# Apply pending migrations
alembic upgrade head

# Rollback one revision
alembic downgrade -1
```
