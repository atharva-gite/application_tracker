# Pipeline

Internship and job application tracker. Phase 1 is the production foundation:
Next.js, PostgreSQL, Prisma, authentication, CI, and the UI shell.

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

Open [http://localhost:3000](http://localhost:3000), register, then confirm
you can log in and log out. `GET /api/auth/me` should return `401` when signed
out and the current user when signed in.

Password reset emails are written to the server log until a transactional
email provider is configured.

## Scripts

- `npm run dev` — development server
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript
- `npm test` — Vitest
- `npm run build` — production build
