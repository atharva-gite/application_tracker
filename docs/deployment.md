# Production deployment

Pipeline deploys as a single Next.js app on Vercel, with managed PostgreSQL,
S3-compatible object storage, Resend, and Sentry. GitHub Actions is the
quality gate; Vercel is the production runtime.

```
GitHub (main)
  → GitHub Actions: lint, typecheck, tests, build, e2e
  → Vercel production
       ├── PostgreSQL (Neon or equivalent)
       ├── Object storage (Cloudflare R2 or S3)
       ├── Resend
       └── Sentry
```

A new user should be able to open the production URL, create an account, and
track applications without any developer action.

## 1. Production database

Create a PostgreSQL 16 database. Neon is the default recommendation because it
pairs cleanly with Vercel and keeps backups/PITR on the database provider.

1. Create a project and copy the pooled connection string.
2. Set `DATABASE_URL` in Vercel for Production and Preview.
3. Use a separate database (or Neon branch) for preview deployments. Do not
   point preview deploys at the production database.

Schema changes ship through Prisma migrations. Vercel runs:

```bash
prisma generate && prisma migrate deploy && next build
```

via the `vercel-build` script. Never apply production schema changes by hand.

## 2. Object storage

Resumes cannot live on the Vercel filesystem. Configure an S3-compatible
bucket (Cloudflare R2 is enough for the MVP):

| Variable | Example |
| --- | --- |
| `STORAGE_BUCKET` | `pipeline-documents` |
| `STORAGE_ACCESS_KEY` | R2/S3 access key |
| `STORAGE_SECRET_KEY` | R2/S3 secret key |
| `STORAGE_REGION` | `auto` (R2) or `us-east-1` |
| `STORAGE_ENDPOINT` | `https://<accountid>.r2.cloudflarestorage.com` |
| `STORAGE_FORCE_PATH_STYLE` | `true` only for MinIO |

Keep the bucket private. Downloads still go through
`GET /api/documents/:id/download`, which checks ownership before reading bytes.

If these variables are missing on Vercel, uploads fail closed rather than
writing to ephemeral disk.

## 3. Email

Set:

```text
EMAIL_FROM="Pipeline <noreply@yourdomain.com>"
RESEND_API_KEY=re_...
```

Verify the `EMAIL_FROM` domain in Resend. Password-reset mail will not reach
users until this is configured; locally the console adapter still logs the
reset URL.

## 4. Authentication and app URL

```text
AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=https://your-domain.com
```

`AUTH_URL` must be the canonical HTTPS origin. Password-reset links are built
from it. `trustHost` is enabled so Auth.js accepts the Vercel host header.

## 5. Monitoring

Create a Sentry project and set:

```text
SENTRY_DSN=https://...@...ingest.sentry.io/...
NEXT_PUBLIC_SENTRY_DSN=https://...@...ingest.sentry.io/...
```

The public DSN is expected to be public; it only allows ingesting events.
Server API failures and uncaught request errors are reported automatically.
The app error boundary reports client render failures when
`NEXT_PUBLIC_SENTRY_DSN` is set.

## 6. Connect GitHub → Vercel

1. Import `atharva-gite/application_tracker` (this repository) into Vercel.
2. Framework preset: Next.js. Root directory: repository root.
3. Add the environment variables above to Production (and Preview as needed).
4. In Vercel, require the GitHub `CI` check before promoting production.
5. Deploy `main`.

Confirm:

```text
GET https://your-domain.com/api/health   → 200 { "status": "ok" }
GET https://your-domain.com/api/ready    → 200 database ok, storage s3, email resend
```

Then register a new account in a private window.

## 7. Domain

In Vercel → Project → Settings → Domains, add the production hostname and
follow the DNS instructions. Set `AUTH_URL` and `EMAIL_FROM` to that host
before sending real email.

## 8. Backups

Prefer provider backups:

- Neon: enable point-in-time recovery on the paid plan; paid projects also
  retain daily snapshots.
- Otherwise schedule `pg_dump` against a least-privilege role.

Manual dump from a trusted machine:

```bash
set -a && source .env && set +a
npm run db:backup
```

Store dumps outside the application server. Restore with `pg_restore` onto a
new database, then point `DATABASE_URL` at it.

Object storage versioning (R2/S3) is the backup for resume bytes.

## 9. Operations checklist

After each production deploy:

- [ ] `/api/ready` returns 200
- [ ] Register, log in, log out
- [ ] Create an application
- [ ] Upload a resume and download it
- [ ] Request a password reset and receive the email
- [ ] Sentry (if configured) is not flooded with new 5xx events
