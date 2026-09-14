# Folio

Internship and job application tracker. Students can add applications, move
them through stages, record interviews and follow-ups, and see what needs
attention next.

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

4. Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), register, then add an
application. The dashboard shows upcoming interviews, deadlines, and follow-ups.
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

## Scripts

- `npm run dev` — development server
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript
- `npm test` — Vitest unit, API, and integration tests
- `npm run test:e2e` — Playwright end-to-end tests (app must be able to reach PostgreSQL)
- `npm run build` — production build
- `npm run db:backup` — `pg_dump` to `backups/` (requires `DATABASE_URL` and `pg_dump`)
