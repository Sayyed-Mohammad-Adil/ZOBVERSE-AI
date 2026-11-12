# Job Platform Integrations

ZOBVERSE AI uses a shared platform catalog and normalized `PlatformJob` schema.
The catalog separates live search from guided official-site workflows so a
platform is never represented as integrated when no authorized feed is
configured.

## Current search availability

| Platform | Search mode | Application workflow |
|---|---|---|
| LinkedIn | Existing public job-listing search | Prepare for review; candidate submits on LinkedIn |
| Jobicy | Public remote-jobs API | Prepare for review; candidate submits on the employer site |
| Indeed | Guided official-site search | Prepare an imported/saved listing; candidate submits on Indeed |
| Naukri.com | Guided official-site search | Prepare an imported/saved listing; candidate submits on Naukri |
| Internshala | Guided official-site search | Candidate completes the application on Internshala |
| Foundit | Guided official-site search | Candidate completes the application on Foundit |
| Glassdoor | Guided official-site search | Candidate completes the application on Glassdoor |
| Wellfound | Guided official-site search | Candidate completes the application on Wellfound |
| Shine | Guided official-site search | Candidate completes the application on Shine |
| ZipRecruiter | Guided official-site search | Candidate completes the application on ZipRecruiter |

Indeed and Naukri do not have an authorized search API configured in this
project. Their adapters deliberately do not scrape the sites. Live API
integrations require approved partner access and provider-specific API
documentation/credentials; do not add login automation, CAPTCHA workarounds, or
anti-bot evasion.

## Architecture

- `app.adapters.registry` owns platform IDs, display names, capabilities, and
  adapter factories.
- `JobSourceAdapter` is the shared async interface.
- `LinkedInAdapter` and `JobicyAdapter` implement live search.
- Selected live sources are fetched concurrently; a failure from one source is
  reported independently and does not prevent other sources from returning
  results. Per-scan provider states distinguish `available`, `no_results`,
  `error`, and `guided_only`.
- Live HTTP adapters make at most one retry for transient network failures or
  server errors. Authentication, access-denied, and rate-limit responses are
  not retried.
- Guided-only platform adapters report that no search API is configured and
  direct candidates to the official site without fabricating listings.
- `PlatformJob` normalizes provider ID, title, company, location, salary,
  experience, description, URL, source, work mode, and posted date. It accepts
  `provider_id`/`posted_date` as input aliases while retaining the existing
  database-compatible `external_job_id`/`posted_at` fields.
- Discovery canonicalizes listing URLs and removes known tracking parameters
  before checking for an existing provider ID or URL. Application preparation
  also checks for an existing `(user, job)` record.
- Platform choices are stored in `candidate_preferences.job_sources`. New
  candidates default to LinkedIn and the existing Jobicy feed.

## Application safety

All current workflows prepare an application package in `READY` status. They
do not submit to a job board. The saved source URL is shown as the official
continuation link; the candidate confirms a submission in the application
tracker only after submitting on the platform. No integration bypasses
authentication, CAPTCHA, rate limits, or anti-bot controls.

Apply database changes with:

```bash
cd backend
alembic upgrade head
```
