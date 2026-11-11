# PostgreSQL Background Queue & Workers

## 1. Concurrency Architecture

In strict adherence to design specifications, the system avoids Redis and Celery in favor of PostgreSQL's native `SKIP LOCKED` capability:

```sql
SELECT * FROM background_jobs
WHERE status = 'PENDING' AND available_at <= NOW()
ORDER BY priority DESC, created_at ASC
FOR UPDATE SKIP LOCKED
LIMIT 1;
```

## 2. Idempotency & Fault Tolerance

- Each job execution updates `attempts` and catches transient failures.
- When an unhandled error occurs, `last_error` is logged and `status` transitions to `FAILED` if `attempts >= max_attempts`.
- Workers verify database unique constraints before creating records to ensure zero duplicate entries on retries.
