# ADR-006: Background jobs

## Status

Accepted

## Context

Reminders and transactional email will eventually need scheduled work. Redis
and a worker fleet would add operational burden before there is load.

## Decision

Keep background work in-process and scheduled (or provider-hosted cron) until
reliability or volume requires a queue. Isolate email behind `lib/email` so
the transport can change independently of domain logic.

## Consequences

Phase 1 uses a console email adapter. Password-reset messages are logged
locally. A later Resend (or similar) adapter should not change auth services.
