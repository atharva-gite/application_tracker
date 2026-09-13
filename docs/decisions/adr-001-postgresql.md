# ADR-001: PostgreSQL

## Status

Accepted

## Context

The product models users, companies, applications, interviews, contacts,
documents, and historical status changes. These relationships need constraints
and joins from day one.

## Decision

Use PostgreSQL as the system of record.

## Consequences

Relational integrity (foreign keys, unique constraints, indexes) is enforced
in the database. A document store would push those rules into application code
and make status-history analytics harder.
