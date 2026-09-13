# ADR-005: Server-side ownership checks

## Status

Accepted

## Context

Every student-owned record must be unreachable to other users. Frontend
route guards and hidden IDs are not security.

## Decision

1. Resolve the authenticated user on the server from the session cookie.
2. Never trust a client-supplied `user_id`.
3. After loading a resource, compare `resource.user_id` to the session user.
4. Treat other users' resources as `NOT_FOUND` so IDs do not leak existence.

`proxy.ts` may redirect unauthenticated browsers away from `/dashboard`, but
API routes and server actions repeat authentication and authorization.

## Consequences

Authorization logic stays testable in `server/authorization` and is reused by
future domain endpoints.
