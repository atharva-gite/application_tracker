# API

Error responses use:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "You need to sign in to continue."
  }
}
```

Codes: `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`,
`CONFLICT`, `RATE_LIMITED`, `INTERNAL_ERROR`.

All domain endpoints require a session unless noted. Ownership is enforced in
services: another user's resource is returned as `NOT_FOUND`.

## Authentication

| Method | Path | Auth |
| --- | --- | --- |
| `GET` | `/api/health` | public liveness |
| `GET` | `/api/ready` | public readiness (`database`, `storage`, `email`) |
| `POST` | `/api/auth/register` | public, rate limited |
| `POST` | `/api/auth/login` | public, rate limited |
| `POST` | `/api/auth/logout` | required |
| `GET` | `/api/auth/me` | required |
| `POST` | `/api/auth/forgot-password` | public, rate limited |
| `POST` | `/api/auth/reset-password` | public, rate limited |

## Applications

| Method | Path |
| --- | --- |
| `GET` | `/api/applications` |
| `POST` | `/api/applications` |
| `GET` | `/api/applications/:id` |
| `PATCH` | `/api/applications/:id` |
| `DELETE` | `/api/applications/:id` (archives) |
| `POST` | `/api/applications/:id/status` |
| `GET` | `/api/applications/:id/history` |
| `GET`/`POST` | `/api/applications/:id/interviews` |
| `GET`/`POST` | `/api/applications/:id/notes` |
| `GET`/`POST` | `/api/applications/:id/follow-ups` |
| `GET`/`POST` | `/api/applications/:id/contacts` |
| `DELETE` | `/api/applications/:id/contacts/:contactId` |
| `GET`/`POST` | `/api/applications/:id/documents` |
| `DELETE` | `/api/applications/:id/documents/:documentId` |

List query parameters: `page`, `pageSize`, `q`, `status`, `companyId`,
`location`, `source`, `deadlineFrom`, `deadlineTo`, `appliedFrom`, `appliedTo`,
`sort`, `order`, `archived` (`true` \| `false` \| `only`), `view`.

## Companies, contacts, interviews, notes, follow-ups, documents

| Method | Path |
| --- | --- |
| `GET`/`POST` | `/api/companies` |
| `GET`/`PATCH`/`DELETE` | `/api/companies/:id` |
| `GET`/`POST` | `/api/contacts` |
| `PATCH`/`DELETE` | `/api/contacts/:id` |
| `PATCH`/`DELETE` | `/api/interviews/:id` |
| `PATCH`/`DELETE` | `/api/notes/:id` |
| `PATCH`/`DELETE` | `/api/follow-ups/:id` |
| `GET` | `/api/documents` |
| `POST` | `/api/documents/upload` |
| `DELETE` | `/api/documents/:id` |
| `GET` | `/api/documents/:id/download` |

## Analytics

| Method | Path |
| --- | --- |
| `GET` | `/api/analytics/overview` |
| `GET` | `/api/analytics/applications` |
| `GET` | `/api/analytics/conversion` |
| `GET` | `/api/analytics/activity` |
| `GET` | `/api/analytics/stages` |
