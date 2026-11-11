# Security & Privacy Hardening

## 1. Authentication & Password Security
- Passwords are encrypted using standard `bcrypt.hashpw` with salt rounds.
- Tokens are signed with HMAC-SHA256 JWTs using an environment-isolated `SECRET_KEY`.
- Sessions expire after 8 days, requiring token renewal.

## 2. Rule 2 Defense Mechanisms
- **Zero Fabrication**: The agent strictly validates fields before form filling; missing data triggers a pause and flags `ACTION_REQUIRED`.
- **Anti-Bot Compliance**: Playwright agent checks HTML for Cloudflare turnstile, hCaptcha, and reCAPTCHA. If found, it halts immediately to avoid account bans.
- **Duplicate Prevention**: 5 tiers of checks prevent applying twice to the same job.

## 3. Privacy & Data Ownership
- Users can export all personal data via `/api/v1/settings/privacy/export/{user_id}` (GDPR compliant JSON format).
- Full audit logs track all user, AI, and system operations in `audit_logs`.
