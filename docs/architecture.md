# Architecture

Pipeline is a modular monolith: one Next.js deployable that contains the UI,
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

## Phase 1 boundary

This phase establishes the production foundation:

- Authentication (register, login, logout, password reset)
- Session cookies via Auth.js
- Protected API routes
- Initial Prisma schema and migrations for the full domain
- Structured request logging and a consistent API error contract
- UI shell for public and authenticated pages
- GitHub Actions CI

Application, company, interview, and document workflows are intentionally not
implemented yet.

## Authorization

UI route protection in `proxy.ts` is optimistic only. Every protected API
route and server action must still authenticate and authorize on the server.
Ownership checks live in `server/authorization`.
