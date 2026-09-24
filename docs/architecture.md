# Architecture

Folio is a modular monolith: one Next.js deployable that contains the UI,
API, authentication, business logic, and database access.

```
Route / Server Action
  → Validation (Zod)
  → Authentication
  → Authorization (resource ownership)
  → Service
  → Repository / Prisma
  → PostgreSQL
```

Document bytes go through `lib/storage`. Local disk (`.data/uploads`) is the
development adapter. Production uses S3-compatible object storage selected by
`STORAGE_BUCKET` / `STORAGE_ACCESS_KEY` / `STORAGE_SECRET_KEY`. PostgreSQL still
stores only `documents.storage_key`.

Transactional email is isolated behind `lib/email`. Development logs messages;
production uses Resend when `RESEND_API_KEY` is set.

Follow-up reminders use the existing `notifications` table. A Vercel Cron
request to `GET /api/jobs/reminders` (Bearer `CRON_SECRET`) sends due
follow-up emails. `sent_at` is set only after the email client succeeds.

Unhandled server errors are reported to Sentry when `SENTRY_DSN` is set.
`GET /api/health` is a liveness probe. `GET /api/ready` checks PostgreSQL and
reports the storage and email drivers.

## Phase 2 boundary

The MVP loop is implemented:

- Companies (unique per user via `normalized_name`)
- Applications with search, filters, sorting, list and pipeline board views
- Status changes written in a transaction with `application_status_history`
- Application workspace: interviews, notes, contacts, follow-ups, documents
- One resume per application via `application_documents` (optional; attach later)
- Dashboard, deadlines, activity, and job-search analytics (conversion, sources,
  time in stage, time range)

UI route protection in `proxy.ts` is optimistic only. Every protected API
route and server action authenticates and authorizes on the server.

## Phase 4 boundary

The production deploy path is:

GitHub Actions (lint, typecheck, tests, build, e2e) → Vercel (`vercel-build`
runs `prisma migrate deploy && next build`) → Neon PostgreSQL, R2/S3, Resend,
Sentry.

See [deployment.md](deployment.md) for the operator runbook.
