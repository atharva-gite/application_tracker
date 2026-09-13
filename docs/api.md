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

## Implemented in Phase 1

| Method | Path | Auth |
| --- | --- | --- |
| `GET` | `/api/health` | public |
| `POST` | `/api/auth/register` | public, rate limited |
| `POST` | `/api/auth/login` | public, rate limited |
| `POST` | `/api/auth/logout` | required |
| `GET` | `/api/auth/me` | required |
| `POST` | `/api/auth/forgot-password` | public, rate limited |
| `POST` | `/api/auth/reset-password` | public, rate limited |

Auth.js also exposes `/api/auth/*` for session handling.

Domain endpoints for applications, companies, interviews, notes, documents,
and analytics are specified in the project plan and will be added in Phase 2.
