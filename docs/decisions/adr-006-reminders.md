# ADR-006: Scheduled follow-up reminders

## Status

Accepted

## Context

Follow-ups need a single due reminder without a job queue. Email already goes
through `lib/email`. Notifications already exist with `scheduled_for` and
`sent_at`.

## Decision

Create one `FOLLOW_UP_REMINDER` notification per follow-up (`type` +
`entity_id` unique). A scheduled HTTP job (`GET /api/jobs/reminders`, Vercel
Cron hourly, `CRON_SECRET`) sends due reminders through the email client and
sets `sent_at` only after a successful send. Failed sends leave `sent_at`
null so the next run can retry.

Do not introduce Redis or BullMQ until volume or reliability requires it.

## Consequences

Reminders are idempotent at the notification row. Completing a follow-up
cancels unsent reminders. Changing the due time reschedules an unsent
reminder.
