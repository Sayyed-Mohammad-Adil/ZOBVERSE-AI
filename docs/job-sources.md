# Job Source Adapters

All job platforms inherit from `BaseAdapter` defined in `backend/app/adapters/base.py`.

## Adapter Contract

Each adapter defines explicit compliance capabilities:
- `supports_automation: bool`: Declares whether programmatic submission is allowed by platform terms.
- `requires_human_action: bool`: Flags whether anti-bot, captcha, or proprietary logins necessitate candidate intervention.
- `fetch_jobs(query, location, limit)`: Asynchronous search returning normalized `Job` dictionaries.

### Implemented Adapters

1. **LinkedIn Adapter (`app.adapters.linkedin`)**:
   - Queries public guest job search endpoints without authentication.
   - Extracts company, title, location, canonical URL, and external ID.
   - `supports_automation`: True (via permitted assisted mode).
2. **Jobicy Adapter (`app.adapters.jobicy`)**:
   - Reads listings from the Jobicy public remote-jobs API.
   - Stores only fields present in the source response; unavailable descriptions and salaries remain empty.
   - Enforces `supports_automation: False` and `requires_human_action: True` to protect candidate accounts and respect platform guidelines.

Run `alembic upgrade head` after updating to mark legacy synthetic records
unverified, correct old Jobicy source labels, and remove generated LinkedIn
descriptions. Unverified records are excluded from job search and analytics.
