# REST API Specification

The backend exposes a versioned REST API under `/api/v1`.

## Endpoints Summary

- **Authentication (`/api/v1/auth`)**:
  - `POST /register`: Register new user.
  - `POST /login`: OAuth2 password bearer token authentication.
  - `GET /me`: Return authenticated user info.
- **Candidate Profile (`/api/v1/profile`)**:
  - `GET /{user_id}`: Fetch candidate details.
  - `PUT /{user_id}`: Update profile, skills, and contact data.
- **Resumes (`/api/v1/resumes`)**:
  - `POST /profile/upload-file/{user_id}`: Upload and parse a candidate resume; response includes extraction and OCR availability status.
  - `GET /user/{user_id}`: List all uploaded resumes.
  - `PUT /{id}/default`: Designate primary default resume.
  - `DELETE /{id}`: Delete resume.
  - `GET /resumes/ocr/status`: Check whether the local OCR executable is available.
  - Scanned PDFs use the local Light-OCR engine with the CPU provider when selectable-text extraction yields little or no text. PDF text extraction requires `pypdf` from `backend/requirements.txt`.
- **Preferences (`/api/v1/preferences`)**:
  - `GET /{user_id}`: Get salary, role, location, selected job platforms, and automation preferences.
  - `PUT /{user_id}`: Update search criteria and daily limits (`daily_application_limit` supports 1–500).
- **Job Discovery & Search (`/api/v1/jobs`, `/api/v1/search`)**:
  - `GET /`: Authenticated search of listings discovered for the signed-in candidate, with salary, location, skill, keyword, and minimum match-score filters. `limit` supports 1–500.
  - Match percentages reflect candidate-skill coverage of extracted job skills; they are not artificially raised to a minimum score.
  - `POST /api/v1/workers/scan`: Authenticated live discovery request; accepts `platforms=linkedin,jobicy` and associates listings with the requesting account. If omitted, the candidate's saved platform selection is used.
  - `GET /api/v1/settings/job-sources`: Return platform names and truthful search/application capabilities.
  - `GET/PUT /api/v1/settings/job-sources/preferences`: Read or save the current candidate's platform selections.
  - LinkedIn uses its existing public listing search; Jobicy uses its public jobs API. Indeed, Naukri.com, and other listed boards are guided-only until an authorized search API/feed is configured. The app does not scrape them.
  - Previously stored listings without an account association remain hidden until that candidate's scan discovers them.
  - Search results, listing details, skill summaries, worker logs, and analytics are restricted to the authenticated account.
- **Matching Engine (`/api/v1/matching`)**:
  - `GET /{user_id}/{job_id}`: Explainable match score, breakdown, matched/missing skills, and concerns.
- **Duplicate Detection (`/api/v1/duplicates`)**:
  - `POST /check`: 5-tier duplicate check against canonical URLs, hashes, and previous applications.
- **Applications (`/api/v1/applications`)**:
  - `GET /{user_id}`: List user applications pipeline.
  - `POST /prepare`: Select a resume, draft a cover letter, and create/update a `READY` record with its source and official application URL. This does not submit the application.
  - `PUT /{app_id}`: Record status updates. Setting `APPLIED` requires `submission_confirmed: true` after candidate confirmation on the official platform.
  - `POST /import-csv`: Import historical applications to seed duplicate prevention.
- **Interviews (`/api/v1/interviews`)**:
  - `GET /{user_id}`, `POST /{user_id}`, `PUT /{id}`, `DELETE /{id}`: Track interview rounds, dates, notes, and feedback.
- **Offers (`/api/v1/offers`)**:
  - `GET /{user_id}`, `POST /{user_id}`, `PUT /{id}`, `DELETE /{id}`: Track offers, equity, and negotiation stages.
- **Review Queue (`/api/v1/review`)**:
  - `GET /{user_id}`: List items needing human decision.
  - `POST /resolve`: Approve, edit, or skip review items.
- **Question Bank (`/api/v1/questions`)**:
  - `GET /{user_id}`, `POST /{user_id}`, `PUT /{id}`, `DELETE /{id}`: CRUD for saved screening questions.
  - `POST /classify`: Laya classification and confidence estimation for screening questions.
- **Analytics (`/api/v1/analytics`)**:
  - `GET /{user_id}`: Pipeline metrics, source breakdown, skill gap intelligence, and per-user Ollama prompt/completion token totals.
  - Token counts are recorded from Ollama response usage fields for job-fit reviews and cover-letter generation after migration `4a7c1d9e2f63`; earlier usage is not backfilled.
- **Settings & Privacy (`/api/v1/settings`)**:
  - `GET /ai/test-ollama`, `GET /ai/test-laya`: Connectivity health tests.
  - `GET /job-sources`: Platform search and application capabilities.
  - `GET /privacy/export/{user_id}`: Full GDPR JSON export of candidate data.
