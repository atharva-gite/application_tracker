# ADR-003: Object storage for documents

## Status

Accepted

## Context

Resumes and related files must remain private and can be large. Storing bytes
in PostgreSQL would bloat backups and couple file delivery to the app server.

## Decision

PostgreSQL stores document metadata and a `storage_key`. File bytes live behind
`lib/storage`. The Phase 2 adapter writes to a private local directory
(`.data/uploads`). Production selects an S3-compatible adapter when
`STORAGE_BUCKET`, `STORAGE_ACCESS_KEY`, and `STORAGE_SECRET_KEY` are set
(Cloudflare R2, AWS S3, or MinIO). Downloads stay authorized through
`GET /api/documents/:id/download`. On Vercel, local disk is rejected so files
cannot disappear on the next deploy.

## Consequences

Downloads are authorized through `GET /api/documents/:id/download`. Changing
providers later should not require a schema rewrite.
