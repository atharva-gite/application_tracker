# ADR-004: Application status history

## Status

Accepted

## Context

Stage analytics and the application timeline need to know how long a role
spent in each stage. Overwriting `applications.status` would destroy that
history.

## Decision

Keep a current `status` on `applications` and append every transition to
`application_status_history`.

## Consequences

Status changes must run in a transaction that updates both records. Time-in-
stage queries become straightforward.
