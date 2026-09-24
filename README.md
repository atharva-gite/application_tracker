# Folio

Folio helps a student keep one internship or new-grad search in one place.
Applications, interviews, and follow-ups usually end up split across a
spreadsheet, an inbox, and a calendar. Folio answers three questions: what is
in progress, what needs attention, and what is converting.

Add a role, move it through stages, or import a spreadsheet. The dashboard
shows the interview, deadline, or follow-up that is due next, and flags
applications that have sat in Applied or Assessment for 14 days.

## What a reviewer can check

- **Ownership is enforced on the server.** Every protected route loads the
  session and checks that the resource belongs to that user. See
  [server/authorization/ownership.ts](server/authorization/ownership.ts).
- **Status changes are history, not overwrites.** Each transition is stored in
  `application_status_history` and drives time-in-stage analytics and the
  stalled inbox. See
  [docs/decisions/adr-004-status-history.md](docs/decisions/adr-004-status-history.md).
- **Resume files stay private.** PostgreSQL stores metadata. Bytes go to local
  disk in development and S3-compatible storage in production, and downloads
  check ownership first. See
  [docs/decisions/adr-003-object-storage.md](docs/decisions/adr-003-object-storage.md).
- **CI is the quality gate.** GitHub Actions runs lint, typecheck, tests
  against PostgreSQL, a production build, and Playwright. See
  [.github/workflows/ci.yml](.github/workflows/ci.yml).

## Local setup

1. Start PostgreSQL:

```bash
docker compose up -d
```

2. Copy environment variables:

```bash
cp .env.example .env
cp .env.example .env.local
```

Replace `AUTH_SECRET` with a long random value (`openssl rand -base64 32`).

3. Install dependencies, generate the Prisma client, and migrate:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
```

4. Optional demo account:

```bash
npm run db:seed
```

This loads `demo@folio.local` / `password12` with a mixed pipeline, an upcoming
interview, an overdue follow-up, and a stalled application. The seed refuses
to run when `NODE_ENV=production`.

5. Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), register or sign in with
the demo account, then add an application. The dashboard shows upcoming
interviews, deadlines, follow-ups, and stalled applications.
`GET /api/auth/me` returns `401` when signed out and the current user when
signed in.

Password reset emails are written to the server log until `RESEND_API_KEY` is
set. Resume files are stored under `.data/uploads` locally. On Vercel they
require S3-compatible credentials (see [docs/deployment.md](docs/deployment.md)).

## Production

Deploy from GitHub to Vercel. The `vercel-build` script generates the Prisma
client, applies migrations, then builds Next.js.

```text
GET /api/health   liveness
GET /api/ready    database + storage/email drivers
```

Full checklist: [docs/deployment.md](docs/deployment.md).

Usage metrics stay in Postgres. `npm run metrics` prints activation (share of
signups with 3 applications in the first 7 days) and weekly active application
managers. It does not send data to a third-party analytics vendor.

## Scripts

- `npm run dev` — development server
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript
- `npm test` — Vitest unit, API, and integration tests
- `npm run test:e2e` — Playwright end-to-end tests (app must be able to reach PostgreSQL)
- `npm run build` — production build
- `npm run db:seed` — local demo account (refuses production)
- `npm run metrics` — activation and weekly active application managers
- `npm run db:backup` — `pg_dump` to `backups/` (requires `DATABASE_URL` and `pg_dump`)
