# ADR-003: Object storage for documents

## Status

Accepted (schema now, storage later)

## Context

Resumes and related files must remain private and can be large. Storing bytes
in PostgreSQL would bloat backups and couple file delivery to the app server.

## Decision

PostgreSQL stores document metadata and a `storage_key`. File bytes will live
in private S3-compatible object storage, accessed through authorized signed
URLs. Phase 1 ships the metadata schema only.

## Consequences

Upload/download endpoints wait until Phase 2. Changing storage providers later
should not require a domain-model rewrite.
