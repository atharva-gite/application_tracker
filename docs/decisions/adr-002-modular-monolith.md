# ADR-002: Modular monolith

## Status

Accepted

## Context

The first users are individual students. The operational cost of microservices
would exceed any scaling benefit.

## Decision

Ship one Next.js application with clear internal modules: routes, services,
repositories, and authorization. Do not introduce microservices, Redis, or a
message bus until a concrete requirement appears.

## Consequences

Deployment and local development stay simple. Module boundaries still allow
the API and background work to be extracted later without a rewrite.
