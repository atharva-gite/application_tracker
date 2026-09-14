<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Folio Engineering Rules

Before modifying code, inspect the existing implementation and understand how the relevant feature currently works.

PROJECT_PLAN.md is the baseline product and architecture reference.

Do not rewrite working functionality simply to match an idealized architecture.

Prefer incremental, surgical changes.

Do not introduce a dependency unless:
1. The existing code cannot reasonably support the requirement, or
2. The dependency provides substantial reliability/maintainability value.

Do not introduce:
- Microservices
- Kubernetes
- Redis
- Message queues
- AI features
- Native mobile apps
- Additional databases

unless a concrete product or engineering requirement justifies them.

Every protected backend operation must enforce:
1. Authentication
2. Authorization/resource ownership
3. Server-side validation

Never rely on frontend authorization.

Business rules belong in the server/service layer, not only in React components.

Prefer database constraints and transactions for data integrity.

Reuse existing:
- Components
- API patterns
- Services
- Validation schemas
- Database relationships
- Design tokens
- Error handling
- Authentication/authorization utilities

Do not create duplicate implementations of existing functionality.

Every new feature should consider:
- Loading state
- Empty state
- Error state
- Validation
- Authorization
- Mobile/responsive behavior
- Accessibility
- Tests

Do not use mock/fake data in production paths.

If a requirement cannot be implemented correctly with the current architecture, explain the problem before making a major architectural change.

After significant changes:
- Run type checking
- Run linting
- Run relevant tests
- Run production build

Fix regressions before declaring the task complete.

Preserve the existing Folio visual language:
- Minimal
- Professional
- Off-white background
- Dark green primary color
- Subtle borders
- Restrained shadows
- Generous whitespace
- No unnecessary gradients
- No excessive colors
- No visual gimmicks

The goal is to build a real product, not maximize the number of technologies or features.