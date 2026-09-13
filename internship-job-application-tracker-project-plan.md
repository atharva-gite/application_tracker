# Internship / Job Application Tracker --- Engineering Project Plan

## Purpose

This document is the technical and product reference for building the
Internship / Job Application Tracker.

The application should be treated as a **production-quality product**,
not a tutorial CRUD project. The goal is to deploy it and have real
students use it.

When implementing features, prioritize:

1.  Correctness
2.  Security
3.  Maintainability
4.  Good UX
5.  Testability
6.  Observability
7.  Simplicity
8.  Scalability only where justified

Do not introduce technologies or architectural patterns merely to make
the project look impressive.

------------------------------------------------------------------------

# 1. Product Definition

## 1.1 Target Users

Primary users:

-   University students applying for internships
-   Students applying for graduate/entry-level roles
-   Recent graduates
-   Students applying to software engineering, AI/ML, data, product,
    research, and related roles

The initial product should be optimized for a single student managing
their own job search.

Potential future users:

-   Career switchers
-   Bootcamp graduates
-   University career offices
-   Placement organizations

Do not design the MVP around institutional users.

------------------------------------------------------------------------

## 1.2 Main User Problem

Students often have application information scattered across:

-   Spreadsheets
-   Browser bookmarks
-   Email
-   LinkedIn
-   Company career portals
-   Google Docs
-   Notes applications
-   Calendars

The product should not merely provide another CRUD database.

The core problem is:

> Help students remember what is happening with every application and
> know what they should do next.

The application should make it easy to answer:

### What is happening?

Example:

> I currently have 18 active applications.

### What needs my attention?

Example:

> I have an interview tomorrow.
>
> I need to follow up with a recruiter today.
>
> A job deadline is approaching.

### What is working?

Example:

> I applied to 47 positions this month, received 8 interviews, and have
> 2 offers.

------------------------------------------------------------------------

# 2. Core User Journeys

## 2.1 Add an Application

A user should be able to:

1.  Click `Add Application`
2.  Enter/select company
3.  Enter role
4.  Paste job URL
5.  Select resume version
6.  Select application stage
7.  Enter application date
8.  Optionally enter deadline
9.  Add optional notes/contact information
10. Save

The application should immediately appear in the user's pipeline.

------------------------------------------------------------------------

## 2.2 Manage Application Pipeline

Initial stages:

``` text
Saved
Applied
Assessment
Interview
Offer
Rejected
Withdrawn
```

The UI should allow users to move applications through the pipeline.

Status changes should be recorded in an application history table rather
than simply overwriting the previous status.

------------------------------------------------------------------------

## 2.3 Manage Interviews

For each application, users should be able to record:

-   Interview date/time
-   Interview type
-   Interviewer
-   Meeting URL
-   Interview notes
-   Outcome
-   Preparation notes

Example:

``` text
Google
Software Engineering Intern

Interview #1
September 17
Technical
Interviewer: Jane Doe
Meeting: <URL>

Notes:
- Prepare graph algorithms
- Review previous project
```

------------------------------------------------------------------------

## 2.4 Manage Follow-ups

Users should be able to create follow-ups such as:

``` text
Follow up with recruiter
Due: September 17
```

The dashboard should surface overdue and upcoming follow-ups.

------------------------------------------------------------------------

## 2.5 Analyze the Job Search

The dashboard/analytics area should eventually answer:

-   How many applications have I submitted?
-   How many are active?
-   How many reached interviews?
-   How many resulted in offers?
-   How long do applications remain in each stage?
-   Which sources produce the most interviews?
-   What is my application-to-interview conversion rate?

------------------------------------------------------------------------

# 3. MVP Scope

The MVP should focus on one excellent loop:

> Add application → manage progress → record important information →
> know what to do next.

## Authentication

-   Registration
-   Login
-   Logout
-   Password reset
-   Secure sessions
-   Optional email verification
-   OAuth/social login if supported by the selected authentication
    solution

## Applications

-   Create application
-   Edit application
-   Delete/archive application
-   Status/stage
-   Application date
-   Deadline
-   Job URL
-   Location
-   Employment type
-   Salary if known
-   Application source
-   Description/notes

## Companies

-   Company name
-   Website
-   Industry
-   Location
-   Notes

## Pipeline

Initial statuses:

``` text
Saved
Applied
Assessment
Interview
Offer
Rejected
Withdrawn
```

## Contacts

-   Name
-   Role
-   Email
-   LinkedIn URL
-   Notes

## Interviews

-   Date/time
-   Type
-   Interviewer
-   Meeting URL
-   Notes
-   Outcome

## Resumes/Documents

Users should be able to maintain multiple resume versions.

Examples:

``` text
Resume - Software Engineering
Resume - AI/ML
Resume - Backend
```

Store metadata in PostgreSQL and actual files in object storage.

## Notes

Application-specific notes.

## Follow-ups

-   Follow-up date
-   Reminder
-   Completion state
-   Optional note

## Search and Filtering

Allow filtering by:

-   Status
-   Company
-   Role
-   Date
-   Deadline
-   Location
-   Source

## Dashboard

Show:

-   Active applications
-   Upcoming interviews
-   Upcoming deadlines
-   Outstanding follow-ups
-   Recent activity
-   Basic application metrics

------------------------------------------------------------------------

# 4. Post-MVP Features

Do not implement these until the core product has real users.

## V1.1

Potential features:

-   Email reminders
-   Calendar integration
-   Richer analytics
-   Application templates
-   Bulk editing
-   CSV import/export
-   Keyboard shortcuts
-   Improved search

## V1.2

Potential browser extension:

> Save a job posting directly to the tracker.

The extension could eventually capture:

-   Company
-   Role
-   Job URL
-   Location
-   Job description
-   Deadline

## V2 --- AI-assisted Features

Potential future functionality:

-   Extract application information from job descriptions
-   Recommend a resume version
-   Summarize job descriptions
-   Identify missing application information
-   Generate follow-up suggestions
-   Interview preparation
-   Application-specific interview question generation

AI should not be introduced simply because the project is an AI-related
portfolio project. It should solve a demonstrated user problem.

## Later Integrations

Potentially:

-   Gmail
-   Google Calendar
-   Job APIs
-   Browser extension
-   Automatic application-status detection where technically and legally
    appropriate

------------------------------------------------------------------------

# 5. Features to Avoid Initially

Do NOT initially build:

-   Microservices
-   Kubernetes
-   Native mobile application
-   Social network functionality
-   User feeds
-   Collaboration features
-   University administration features
-   Payment/subscription infrastructure
-   Complex notification infrastructure
-   Automatic scraping of job boards
-   AI chatbot functionality that does not solve a specific workflow
    problem
-   Unnecessary infrastructure such as Redis before there is a real need

These are deliberate exclusions.

The project should demonstrate good engineering judgment by avoiding
unnecessary complexity.

------------------------------------------------------------------------

# 6. Technical Architecture

## 6.1 Architectural Style

Use a **modular monolith** initially.

Do not use microservices.

The initial system should have one deployable application containing:

``` text
Frontend
API
Authentication
Business Logic
Database Access
Background Job Logic
```

The internal architecture should still maintain clear module boundaries.

Conceptually:

``` text
Route
  ↓
Validation
  ↓
Authorization
  ↓
Service / Business Logic
  ↓
Repository / ORM
  ↓
PostgreSQL
```

This allows the application to evolve without requiring microservices.

------------------------------------------------------------------------

# 7. Recommended Technology Stack

  -----------------------------------------------------------------------
  Layer                               Technology
  ----------------------------------- -----------------------------------
  Frontend                            Next.js + React

  Language                            TypeScript

  Styling                             Tailwind CSS

  Backend/API                         Next.js Route Handlers/API

  Database                            PostgreSQL

  ORM                                 Prisma

  Validation                          Zod

  Authentication                      Auth.js or equivalent managed/auth
                                      solution

  Client/server data fetching         Framework data fetching + TanStack
                                      Query where useful

  File storage                        S3-compatible object storage

  Email                               Resend or equivalent transactional
                                      email provider

  Background jobs                     Scheduled jobs initially;
                                      Redis/BullMQ only if required later

  Testing                             Vitest + integration/API tests +
                                      Playwright

  Deployment                          Vercel or equivalent managed
                                      deployment

  CI/CD                               GitHub Actions

  Error monitoring                    Sentry

  Source control                      Git/GitHub
  -----------------------------------------------------------------------

Technology choices should be revisited if actual requirements change.

------------------------------------------------------------------------

# 8. Frontend Architecture

## 8.1 Application Pages

Conceptual structure:

``` text
/
├── Landing Page
├── Login
├── Register
│
└── Application
    ├── Dashboard
    ├── Applications
    ├── Application Detail
    ├── Companies
    ├── Contacts
    ├── Interviews
    ├── Resumes/Documents
    ├── Analytics
    └── Settings
```

------------------------------------------------------------------------

## 8.2 Dashboard

The dashboard should prioritize actionable information.

Example:

``` text
Applications       Interviews       Offers
     42                 7              1

Upcoming
----------------------------------
Google Interview          Tomorrow
Meta Deadline             Sep 18
Stripe Follow-up          Sep 19

Pipeline
----------------------------------
Saved
Applied
Assessment
Interview
Offer
Rejected
Withdrawn
```

Avoid filling the dashboard with metrics that do not help users manage
their job search.

------------------------------------------------------------------------

## 8.3 Application Detail Page

The application detail page is the central workspace.

Conceptual structure:

``` text
Company
Role

[Saved] → [Applied] → [Assessment] → [Interview] → [Offer]

Job Information
Timeline
Contacts
Interviews
Notes
Documents
Follow-ups
```

------------------------------------------------------------------------

## 8.4 State Management

Avoid using Redux for everything.

Use:

### Server state

Framework data fetching and/or TanStack Query.

### Local UI state

React state.

### URL state

Use URL parameters for filters and sorting.

Example:

``` text
/applications?status=interview&sort=deadline
```

This makes filtering:

-   shareable
-   bookmarkable
-   browser-navigation friendly

------------------------------------------------------------------------

## 8.5 Loading States

Every asynchronous screen should have an intentional loading state.

Use:

-   Skeletons
-   Loading indicators
-   Disabled submit buttons
-   Optimistic updates only where safe

Never leave users staring at a blank page.

------------------------------------------------------------------------

## 8.6 Empty States

Example:

``` text
No applications yet.

Add your first application to start tracking your job search.

[+ Add Application]
```

Empty states should guide the user toward the next action.

------------------------------------------------------------------------

## 8.7 Error States

Errors should be actionable.

Prefer:

``` text
Couldn't load your applications.

[Try again]
```

over:

``` text
Something went wrong.
```

Forms should clearly indicate:

-   What failed
-   Which fields need correction
-   Whether entered data was preserved
-   Whether retrying is safe

------------------------------------------------------------------------

## 8.8 Responsive Design

The application must work on desktop and mobile web.

Desktop:

``` text
Sidebar + Content
```

Mobile:

``` text
Compact navigation
Stacked cards
Mobile-friendly forms
```

The primary action, `Add Application`, should remain easy to access on
mobile.

------------------------------------------------------------------------

# 9. Database Design

Use PostgreSQL.

The domain is highly relational, making a relational database
appropriate.

Conceptual ER structure:

``` text
User
 |
 +---- Company
 |
 +---- Application
          |
          +---- ApplicationStatusHistory
          |
          +---- Interview
          |
          +---- Note
          |
          +---- FollowUp
          |
          +---- ApplicationContact ---- Contact
          |
          +---- ApplicationDocument --- Document
```

------------------------------------------------------------------------

# 10. Database Entities

## 10.1 users

Fields:

``` text
id
email
password_hash / auth-provider identifier
name
timezone
created_at
updated_at
```

Authentication provider fields depend on the selected authentication
solution.

------------------------------------------------------------------------

## 10.2 companies

``` text
id
user_id
name
normalized_name
website
industry
location
notes
created_at
updated_at
```

Constraint:

``` text
UNIQUE(user_id, normalized_name)
```

This prevents duplicate company records for the same user.

------------------------------------------------------------------------

## 10.3 applications

``` text
id
user_id
company_id

role_title
job_url
location
employment_type

status

application_date
deadline

source

salary_min
salary_max
salary_currency

description

created_at
updated_at
archived_at
```

Recommended indexes:

``` text
(user_id, status)
(user_id, application_date)
(user_id, deadline)
(user_id, company_id)
```

------------------------------------------------------------------------

## 10.4 application_status_history

Do not only overwrite an application's current status.

Store transitions:

``` text
id
application_id
from_status
to_status
changed_at
```

This enables:

-   Timeline/history
-   Time-in-stage analytics
-   Debugging
-   Auditing

------------------------------------------------------------------------

## 10.5 contacts

``` text
id
user_id
company_id

name
role
email
linkedin_url

created_at
updated_at
```

------------------------------------------------------------------------

## 10.6 application_contacts

Many-to-many relationship:

``` text
application_id
contact_id
relationship_type
```

------------------------------------------------------------------------

## 10.7 interviews

``` text
id
application_id

scheduled_at
duration
type

interviewer_name
meeting_url

status
outcome

notes

created_at
updated_at
```

------------------------------------------------------------------------

## 10.8 notes

``` text
id
user_id
application_id

content

created_at
updated_at
```

------------------------------------------------------------------------

## 10.9 documents

``` text
id
user_id

name
type
filename
mime_type
file_size
storage_key

created_at
```

Actual files should live in object storage.

------------------------------------------------------------------------

## 10.10 application_documents

``` text
application_id
document_id
```

This allows the system to answer:

> Which resume did I use for this application?

------------------------------------------------------------------------

## 10.11 follow_ups

``` text
id
user_id
application_id

due_at
type
note
completed_at

created_at
```

------------------------------------------------------------------------

## 10.12 notifications

``` text
id
user_id

type
title
message

scheduled_for
sent_at
read_at

created_at
```

------------------------------------------------------------------------

## 10.13 audit_events

Recommended for production debugging and auditing:

``` text
id
user_id

entity_type
entity_id
action

metadata
created_at
```

Examples:

``` text
application.created
application.updated
application.status_changed
interview.created
document.uploaded
```

Do not store sensitive information unnecessarily in audit metadata.

------------------------------------------------------------------------

# 11. Ownership and Authorization

Every user-owned entity must ultimately resolve to the authenticated
user.

Core rule:

> A user may only read or mutate resources belonging to that user.

Authorization must be enforced server-side.

Never rely on:

-   hidden frontend fields
-   UI restrictions
-   client-side route guards
-   obscurity of IDs

For example, fetching:

``` text
GET /api/applications/123
```

must verify that application `123` belongs to the current user.

This prevents IDOR/broken-access-control vulnerabilities.

------------------------------------------------------------------------

# 12. API Design

Use REST initially.

## Authentication

``` text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/me
```

------------------------------------------------------------------------

## Applications

``` text
GET    /api/applications
POST   /api/applications
GET    /api/applications/:id
PATCH  /api/applications/:id
DELETE /api/applications/:id

POST   /api/applications/:id/status
GET    /api/applications/:id/history
```

Support query parameters for:

-   pagination
-   search
-   filtering
-   sorting

------------------------------------------------------------------------

## Companies

``` text
GET    /api/companies
POST   /api/companies
GET    /api/companies/:id
PATCH  /api/companies/:id
DELETE /api/companies/:id
```

------------------------------------------------------------------------

## Contacts

``` text
GET    /api/contacts
POST   /api/contacts
PATCH  /api/contacts/:id
DELETE /api/contacts/:id
```

------------------------------------------------------------------------

## Interviews

``` text
GET    /api/applications/:id/interviews
POST   /api/applications/:id/interviews
PATCH  /api/interviews/:id
DELETE /api/interviews/:id
```

------------------------------------------------------------------------

## Notes

``` text
GET    /api/applications/:id/notes
POST   /api/applications/:id/notes
PATCH  /api/notes/:id
DELETE /api/notes/:id
```

------------------------------------------------------------------------

## Documents

``` text
GET    /api/documents
POST   /api/documents/upload
DELETE /api/documents/:id
```

For larger uploads, prefer:

``` text
Client
 ↓
Request signed upload URL
 ↓
Object Storage
 ↓
Persist/confirm metadata
```

rather than routing large files through the application server.

------------------------------------------------------------------------

## Analytics

``` text
GET /api/analytics/overview
GET /api/analytics/applications
GET /api/analytics/conversion
GET /api/analytics/activity
```

------------------------------------------------------------------------

## Notifications

``` text
GET   /api/notifications
PATCH /api/notifications/:id/read
```

------------------------------------------------------------------------

# 13. API Request Lifecycle

Every protected mutation should conceptually follow:

``` text
Request
  ↓
Authentication
  ↓
Input validation
  ↓
Resource lookup
  ↓
Ownership authorization
  ↓
Business rules
  ↓
Database operation
  ↓
Audit event where appropriate
  ↓
Response
```

Do not put all business logic directly inside route handlers.

Prefer:

``` text
Route Handler
    ↓
Service
    ↓
Repository / ORM
```

------------------------------------------------------------------------

# 14. Validation

Use a schema validation library such as Zod.

Validate both client-side and server-side.

Validate:

-   Required fields
-   String lengths
-   URLs
-   Email addresses
-   Dates
-   Enum/status values
-   Numeric ranges
-   File size/type metadata
-   Pagination parameters
-   Search/filter parameters

The server is always the authoritative validation layer.

------------------------------------------------------------------------

# 15. API Error Handling

Use consistent application-level errors.

Example:

``` json
{
  "error": {
    "code": "APPLICATION_NOT_FOUND",
    "message": "Application not found."
  }
}
```

Possible categories:

``` text
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
VALIDATION_ERROR
CONFLICT
RATE_LIMITED
INTERNAL_ERROR
```

Do not expose:

-   stack traces
-   SQL errors
-   internal implementation details
-   secrets
-   sensitive database information

to end users.

------------------------------------------------------------------------

# 16. Authentication and Security

## 16.1 Authentication

Use a mature authentication solution.

Do not implement cryptographic primitives yourself.

Requirements:

-   Secure password hashing if passwords are supported
-   Secure session cookies
-   Session expiration
-   Session invalidation/logout
-   Password reset tokens
-   OAuth state validation
-   Secure OAuth callbacks
-   Optional email verification

------------------------------------------------------------------------

## 16.2 Authorization

Every protected resource must enforce ownership.

Example:

``` text
currentUser.id == application.user_id
```

or an equivalent service-layer authorization check.

Never trust the client to supply a valid `user_id`.

------------------------------------------------------------------------

## 16.3 Input Security

Protect against:

-   SQL injection
-   XSS
-   CSRF where applicable
-   malformed payloads
-   oversized requests
-   unsafe URLs
-   invalid enum values

Use ORM parameterization rather than raw SQL wherever possible.

------------------------------------------------------------------------

# 17. File Upload Security

Resumes and documents require special handling.

Requirements:

-   Maximum file size
-   Allowed file types
-   MIME validation
-   File signature validation where appropriate
-   Randomized storage keys
-   No executable file types
-   Private object storage
-   Signed download URLs
-   Authorization before generating download URLs

Potential later improvement:

-   Malware/virus scanning

Do not serve arbitrary uploaded files directly from the application
without authorization.

------------------------------------------------------------------------

# 18. Rate Limiting

Apply stricter rate limits to:

``` text
Login
Registration
Password reset
File upload
Potentially expensive analytics endpoints
```

Authenticated CRUD endpoints can generally have less restrictive limits.

Rate limiting should protect both the application and its third-party
providers.

------------------------------------------------------------------------

# 19. Sensitive Data

Potentially sensitive information includes:

-   Email addresses
-   Recruiter contact information
-   Resume documents
-   OAuth credentials/tokens
-   Password reset tokens
-   Session identifiers

Do not log:

-   passwords
-   tokens
-   authentication secrets
-   document contents
-   unnecessary personal information

Collect only data required by the product.

------------------------------------------------------------------------

# 20. Email and Notifications

Use a transactional email provider.

Initial email use cases:

-   Password reset
-   Email verification
-   Interview reminders
-   Deadline reminders
-   Follow-up reminders

Do not build a complex notification engine initially.

------------------------------------------------------------------------

# 21. Background Jobs

Initially, keep this simple.

Possible first implementation:

``` text
Scheduled job
   ↓
Find reminders that are due
   ↓
Send emails
   ↓
Mark notification as sent
```

Only introduce:

``` text
Redis
+
BullMQ
+
Dedicated workers
```

when the workload or reliability requirements justify them.

The architecture should allow this migration later.

------------------------------------------------------------------------

# 22. Caching

Do not add Redis caching initially.

PostgreSQL should comfortably handle an initial deployment.

Consider caching later for:

-   Expensive dashboard aggregates
-   Analytics queries
-   Frequently requested data

Only introduce caching after identifying an actual performance need.

------------------------------------------------------------------------

# 23. Third-Party Integrations

Initial:

-   Authentication/OAuth provider
-   Object storage
-   Transactional email
-   Error monitoring

Later:

-   Google Calendar
-   Gmail
-   Browser extension
-   Job APIs

Third-party integrations should be isolated behind service modules so
they can be replaced without changing core business logic.

------------------------------------------------------------------------

# 24. Testing Strategy

Testing should focus on risk.

## 24.1 Unit Tests

Test:

-   Validation
-   Status transition rules
-   Deadline calculations
-   Analytics calculations
-   Filtering
-   Sorting
-   Utility functions

Example:

``` text
Applied → Interview
```

should be valid.

Business rules should be explicit and tested.

------------------------------------------------------------------------

# 25. Integration Tests

Test:

``` text
API → Service → Database
```

Important cases:

### Create application

-   Authenticated user succeeds
-   Unauthenticated user fails
-   Invalid payload fails
-   Database record is created
-   Correct owner is assigned

### Authorization

User A cannot access User B's:

-   Applications
-   Companies
-   Contacts
-   Interviews
-   Notes
-   Documents

This should be one of the highest-priority test areas.

------------------------------------------------------------------------

# 26. API Tests

Test expected HTTP behavior:

``` text
200
201
204
400/422
401
403
404
409
429
500
```

Not every endpoint needs every status, but error behavior should be
intentional.

------------------------------------------------------------------------

# 27. End-to-End Tests

Use Playwright or an equivalent browser automation framework.

Critical E2E journey:

``` text
Register
  ↓
Login
  ↓
Create company
  ↓
Create application
  ↓
Move application to Interview
  ↓
Create interview
  ↓
Add note
  ↓
Upload resume
  ↓
Create follow-up
  ↓
Dashboard reflects changes
```

This validates the core product loop.

------------------------------------------------------------------------

# 28. Important Edge Cases

## Dates

Test:

-   Deadline in the past
-   Deadline today
-   Deadline tomorrow
-   Different user timezones
-   Interview times across timezone boundaries
-   Daylight saving changes where relevant

## Applications

Test:

-   Duplicate applications
-   Same company with multiple roles
-   Archived applications
-   Deleted company references
-   Invalid URLs
-   Extremely long notes
-   Empty optional fields

## Files

Test:

-   Oversized file
-   Invalid extension
-   Invalid MIME type
-   Duplicate filename
-   Failed upload
-   Interrupted upload
-   Unauthorized download

## Concurrency

Test or reason about:

-   Two browser tabs editing the same application
-   Status changed in one tab while another is editing
-   Double-clicking submit
-   Repeated requests

------------------------------------------------------------------------

# 29. Deployment and DevOps

## Development Environment

Recommended:

``` text
Developer Machine
├── Next.js
├── PostgreSQL
└── Object storage / local development equivalent
```

Docker Compose can be used for local PostgreSQL and supporting services.

Do not containerize everything merely for the sake of using Docker.

------------------------------------------------------------------------

# 30. Production Environment

Conceptually:

``` text
GitHub
   ↓
GitHub Actions
   ↓
Tests + Build
   ↓
Production Deployment
   ↓
Next.js Application
   ├── PostgreSQL
   ├── Object Storage
   ├── Email Provider
   └── Sentry
```

Use managed infrastructure wherever it reduces operational overhead.

------------------------------------------------------------------------

# 31. CI/CD

Every pull request should ideally run:

``` text
Install dependencies
      ↓
Lint
      ↓
Type check
      ↓
Unit tests
      ↓
Integration/API tests
      ↓
Build
```

Later add E2E tests to CI where practical.

Production deployments should only occur from a known-good build.

------------------------------------------------------------------------

# 32. Environment Variables

Never commit secrets.

Examples:

``` text
DATABASE_URL
AUTH_SECRET
OAUTH_CLIENT_ID
OAUTH_CLIENT_SECRET
STORAGE_ACCESS_KEY
STORAGE_SECRET_KEY
EMAIL_API_KEY
SENTRY_DSN
```

Use separate environments for:

-   Local development
-   Testing
-   Production

Use the hosting platform's secret/environment-variable system for
production credentials.

------------------------------------------------------------------------

# 33. Database Migrations

All schema changes should be represented by migrations.

Development:

``` text
Change schema
 ↓
Generate migration
 ↓
Run migration
 ↓
Test
```

Production:

``` text
Build
 ↓
Run migration
 ↓
Deploy application
```

Never manually alter the production database as the normal development
workflow.

------------------------------------------------------------------------

# 34. Logging and Observability

Application logs should make production debugging possible.

Useful fields:

``` text
request_id
user_id where appropriate
route
HTTP method
status code
duration
error code
```

Do not log secrets or sensitive content.

------------------------------------------------------------------------

# 35. Error Monitoring

Use Sentry or an equivalent service for:

-   Frontend exceptions
-   Backend exceptions
-   Stack traces
-   Release tracking
-   Error frequency
-   Production debugging

Track errors by release so regressions can be identified.

------------------------------------------------------------------------

# 36. Performance / Observability

Initially monitor:

``` text
API p50/p95 latency
5xx rate
Frontend error rate
Database query latency
File upload failures
Email failures
```

Do not prematurely optimize.

Measure first.

------------------------------------------------------------------------

# 37. Real User Strategy

This is a core part of the project.

Do not wait until the application is "perfect" before recruiting users.

------------------------------------------------------------------------

# 38. First 5 Users

Recruit people who are:

-   Actively applying for internships
-   Actively applying for graduate jobs
-   Classmates
-   Friends
-   Recent graduates
-   Students in technical fields

Do not prioritize people who merely think the product sounds
interesting.

You need people with the actual problem.

------------------------------------------------------------------------

# 39. How to Pitch It

Do not primarily say:

> "This is my portfolio project."

Instead:

> "I'm building a tool to manage internship and job applications. You're
> actively applying right now --- would you be willing to use it for the
> next couple of weeks and give me feedback?"

The goal is actual usage.

------------------------------------------------------------------------

# 40. First User Onboarding

Personally onboard the first users.

Observe:

``` text
Sign up
  ↓
Add first application
  ↓
Add second application
  ↓
Return later
```

Do not immediately explain every feature.

If users cannot discover something, that is product feedback.

------------------------------------------------------------------------

# 41. Instrument Product Usage

Track meaningful events such as:

``` text
signup_completed
application_created
application_updated
application_status_changed
interview_created
followup_created
document_uploaded
dashboard_viewed
analytics_viewed
application_archived
```

Avoid collecting unnecessary personal information.

------------------------------------------------------------------------

# 42. Activation Metric

A useful initial activation definition:

> User creates at least 3 applications within their first 7 days.

This can be revised based on actual behavior.

The important point is that activation should represent genuine product
value rather than merely account creation.

------------------------------------------------------------------------

# 43. Retention Metrics

Track:

-   D1 retention
-   D7 retention
-   D30 retention

Also track application-management activity.

A particularly valuable signal:

> Does the user return because they have another job-search action to
> perform?

------------------------------------------------------------------------

# 44. User Feedback

Use three primary channels.

## In-product feedback

Simple prompt:

> What could make this easier?

## Short interviews

15-minute conversations.

Ask:

-   What did you use?
-   What was annoying?
-   What did you expect but couldn't find?
-   What do you currently use instead?
-   What would make you stop using this?
-   What did you have to do outside the application?

## Behavioral observation

Behavior often tells you more than stated preferences.

Look for:

-   Repeated actions
-   Abandoned forms
-   Unused features
-   Confusing screens
-   Repeated manual work

------------------------------------------------------------------------

# 45. Feedback Prioritization

Use:

``` text
Priority ≈ Impact × Frequency × Confidence
```

Example:

  Issue                               Frequency   Impact   Priority
  --------------------------------- ----------- -------- ----------
  Add Application is hard to find          High     High         P0
  Deadline reminders missing               High     High         P0
  Wants dark mode                        Medium      Low         P2
  Wants AI cover letters                    Low   Medium         P3

Do not automatically build the feature requested by the loudest user.

Look for recurring problems.

------------------------------------------------------------------------

# 46. Bug Handling Process

Every real-user bug should follow:

``` text
Bug Report
   ↓
Reproduce
   ↓
Determine Severity
   ↓
Fix
   ↓
Add Regression Test
   ↓
Deploy
   ↓
Confirm
   ↓
Tell User
```

A bug fix without a regression test should be avoided when practical.

------------------------------------------------------------------------

# 47. Success Metrics

Avoid vanity metrics such as total registered accounts.

## North Star Metric

### Weekly Active Application Managers

Users who:

-   Have at least one active application
-   Perform an application-management action during the week

------------------------------------------------------------------------

# 48. Product Metrics

## Activation

Percentage of new users who create 3+ applications.

## Retention

-   D7
-   D30

## Application activity

Applications created/updated per active user.

## Workflow usage

Percentage of active users using:

-   Interviews
-   Notes
-   Follow-ups
-   Resume/document management

## Conversion

``` text
Application → Interview
Interview → Offer
```

## Operational metrics

``` text
API p95 latency
5xx rate
Frontend error rate
Upload failure rate
Email failure rate
```

------------------------------------------------------------------------

# 49. Development Timeline

Target approximately 6--8 weeks of focused development for the first
serious deployed version.

The product should be deployed before every possible feature is
complete.

------------------------------------------------------------------------

# Phase 0 --- Planning

Duration: approximately 2--3 days.

## Goals

Lock:

-   Product requirements
-   Architecture
-   MVP boundary
-   Database model
-   API structure
-   Security principles
-   Initial UI structure

## Deliverables

-   Product requirements
-   User journeys
-   Database schema
-   API contract
-   Architecture diagram
-   Initial wireframes
-   Repository structure
-   Development backlog
-   Initial ADRs

## Dependencies

None.

## Definition of Done

You can clearly explain what happens from:

``` text
Click "Add Application"
```

through:

``` text
Validation → Authorization → Database → UI update
```

without architectural ambiguity.

------------------------------------------------------------------------

# Phase 1 --- Foundation

Duration: approximately 4--6 days.

## Goals

Create the production foundation.

## Deliverables

-   Repository
-   Next.js
-   TypeScript
-   PostgreSQL
-   Prisma
-   Initial migrations
-   Authentication
-   Environment configuration
-   CI pipeline
-   UI foundation
-   Error handling
-   Logging

## Definition of Done

A user can:

``` text
Register
Login
Logout
```

and authenticated API routes are protected.

------------------------------------------------------------------------

# Phase 2 --- MVP

Duration: approximately 2--3 weeks.

## Week 1

Build:

-   Applications
-   Companies
-   Pipeline
-   Search
-   Filtering
-   Sorting
-   Application detail page

## Week 2

Build:

-   Contacts
-   Interviews
-   Notes
-   Resumes
-   Follow-ups

## Week 3

Build:

-   Dashboard
-   Analytics
-   Deadlines
-   Activity history
-   UI polish

## Definition of Done

A student can realistically manage their internship/job search through
the application.

------------------------------------------------------------------------

# Phase 3 --- Testing

Duration: approximately 4--5 days.

Implement:

-   Unit tests
-   API tests
-   Integration tests
-   Authorization tests
-   E2E tests
-   Edge-case tests

Highest priority:

> User A cannot access User B's data.

------------------------------------------------------------------------

# Phase 4 --- Deployment

Duration: approximately 2--3 days.

Deliver:

-   Production environment
-   Production database
-   Database migrations
-   Object storage
-   Email provider
-   CI/CD
-   Monitoring
-   Domain
-   Backups

## Definition of Done

A completely new user can open the production application and sign
up/use it without developer intervention.

------------------------------------------------------------------------

# Phase 5 --- First Users

Duration: approximately 1--2 weeks.

Target:

``` text
5 users
  ↓
10 users
  ↓
20 users
```

During this phase, spend significant time:

``` text
Observe
 ↓
Interview
 ↓
Identify friction
 ↓
Fix
 ↓
Measure
```

Do not spend the entire phase adding new features.

------------------------------------------------------------------------

# Phase 6 --- Iteration

Continuous.

Prioritize based on real usage.

Potential improvements:

-   Better reminders
-   Better dashboard
-   CSV import
-   Better search
-   Keyboard shortcuts
-   Calendar integration
-   Improved mobile experience

------------------------------------------------------------------------

# Phase 7 --- Advanced Features

Only after the core product demonstrates actual value.

Potential additions:

-   Browser extension
-   AI job extraction
-   Resume recommendations
-   Gmail integration
-   Calendar integration
-   AI interview preparation
-   Automated job information extraction

------------------------------------------------------------------------

# 50. Suggested Repository Architecture

The exact directory structure can change, but maintain clear separation
of concerns.

Conceptual structure:

``` text
project/
│
├── app/
│   ├── (auth)/
│   ├── dashboard/
│   ├── applications/
│   ├── applications/:id/
│   ├── companies/
│   ├── interviews/
│   ├── resumes/
│   ├── analytics/
│   └── settings/
│
├── components/
│   ├── applications/
│   ├── companies/
│   ├── interviews/
│   ├── dashboard/
│   └── ui/
│
├── server/
│   ├── services/
│   ├── repositories/
│   ├── authorization/
│   └── jobs/
│
├── lib/
│   ├── auth/
│   ├── validation/
│   ├── storage/
│   ├── email/
│   └── analytics/
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── docs/
    ├── architecture.md
    ├── api.md
    └── decisions/
```

Do not create directories merely because they appear in this document.
Adapt the structure to the actual implementation.

------------------------------------------------------------------------

# 51. Architecture Decision Records

Create short ADRs for significant decisions.

Recommended initial ADRs:

## ADR-001 --- PostgreSQL

Document why PostgreSQL was selected instead of a document database.

## ADR-002 --- Modular Monolith

Document why the project does not use microservices.

## ADR-003 --- Object Storage

Document why resumes/documents are stored outside PostgreSQL.

## ADR-004 --- Status History

Document why application status changes are persisted as historical
records.

## ADR-005 --- Authorization

Document where and how resource ownership is enforced.

## ADR-006 --- Background Jobs

Document why background infrastructure is initially simple and when a
queue/worker architecture would be introduced.

These decisions should reflect the actual implementation.

------------------------------------------------------------------------

# 52. Engineering Principles for Cursor

When working on this project, follow these principles.

## Do not over-engineer

Prefer the simplest solution that satisfies the requirement.

Do not add:

-   Microservices
-   Redis
-   Message queues
-   Kubernetes
-   Complex event buses
-   Multiple databases

unless a concrete requirement justifies them.

------------------------------------------------------------------------

## Security is server-side

Never assume frontend restrictions are security.

Every protected operation must validate:

``` text
Authentication
+
Authorization
+
Input
```

------------------------------------------------------------------------

## Database integrity matters

Prefer:

-   Foreign keys
-   Unique constraints
-   Check constraints where useful
-   Transactions
-   Proper indexes

Do not rely entirely on application-level validation for data integrity.

------------------------------------------------------------------------

## Business logic should be testable

Avoid putting complex business rules directly into UI components or
route handlers.

Business logic should be isolated into services/functions that can be
unit tested.

------------------------------------------------------------------------

## Preserve history where it matters

Do not destroy meaningful state transitions.

Application status changes should remain historically traceable.

------------------------------------------------------------------------

## Errors should be intentional

Every failure path should have an appropriate:

-   HTTP status
-   application error code
-   user-facing message
-   logging/monitoring behavior

------------------------------------------------------------------------

## Loading and empty states are part of the feature

A feature is not complete if it only works on the happy path.

Implement:

-   Loading
-   Empty
-   Success
-   Validation error
-   Network error
-   Authorization error
-   Not found
-   Server error

states as appropriate.

------------------------------------------------------------------------

## Don't blindly follow the plan

This document is the baseline architecture.

If implementation reveals that a decision is wrong:

1.  Identify the problem
2.  Explain the tradeoff
3.  Propose the smallest appropriate change
4.  Update the relevant documentation/ADR
5.  Continue consistently

Do not introduce architectural changes silently.

------------------------------------------------------------------------

# 53. Definition of Production Quality

A feature should not be considered complete simply because it works
locally.

A production-ready feature should generally include:

``` text
Implementation
+
Validation
+
Authorization
+
Error handling
+
Loading/empty states
+
Tests
+
Logging where useful
+
Documentation where necessary
```

For important functionality, also consider:

``` text
Analytics
+
Monitoring
+
Edge cases
+
Rollback/recovery behavior
```

------------------------------------------------------------------------

# 54. What Makes This Project Strong on a Resume

The project should eventually demonstrate:

## Multi-user authorization

Ability to explain and demonstrate resource-level authorization.

Potential resume framing:

> Designed resource-level authorization ensuring users can only access
> and mutate their own applications, documents, contacts, and interview
> data.

------------------------------------------------------------------------

## Relational data modeling

Ability to explain:

``` text
User
 ↓
Application
 ↓
Company
 ↓
Interview
Contact
Note
Document
Follow-up
```

and why status history is modeled separately.

------------------------------------------------------------------------

## Production API design

Demonstrate:

-   Validation
-   Authorization
-   Error contracts
-   Filtering
-   Pagination
-   Transactions
-   Business rules

------------------------------------------------------------------------

## File storage architecture

Explain:

> Resume files are stored in private object storage while PostgreSQL
> stores metadata and references.

------------------------------------------------------------------------

## Observability

Demonstrate:

-   Structured logs
-   Request IDs
-   Error monitoring
-   Production debugging
-   Latency/error metrics

------------------------------------------------------------------------

## CI/CD

Demonstrate a pipeline that runs:

``` text
Lint
 ↓
Type Check
 ↓
Tests
 ↓
Build
 ↓
Deploy
```

------------------------------------------------------------------------

## Real-user product development

This is potentially the strongest differentiator.

If actual students use the product, you can discuss:

-   Activation
-   Retention
-   Product analytics
-   User feedback
-   Bugs
-   Production incidents
-   Feature prioritization
-   Iterative releases

This turns the project from:

> React + Node + PostgreSQL CRUD application

into:

> A production full-stack application designed, deployed, operated, and
> iterated based on real student usage.

------------------------------------------------------------------------

# 55. Overall Project Narrative

The final project should tell this story:

``` text
Identify a real problem
        ↓
Define a focused MVP
        ↓
Design a maintainable architecture
        ↓
Model relational data
        ↓
Build secure multi-user functionality
        ↓
Add validation and error handling
        ↓
Test critical workflows
        ↓
Deploy
        ↓
Get real users
        ↓
Instrument usage
        ↓
Observe real problems
        ↓
Fix and iterate
        ↓
Add advanced functionality based on evidence
```

The objective is not to maximize the number of technologies.

The objective is to demonstrate that you can take a real product from
**idea → architecture → implementation → deployment → real users →
iteration**.

------------------------------------------------------------------------

# 56. Final Architecture Summary

The baseline architecture should be:

``` text
                         ┌────────────────────┐
                         │      Browser       │
                         │  Next.js / React   │
                         └─────────┬──────────┘
                                   │
                                  HTTPS
                                   │
                                   ▼
                         ┌────────────────────┐
                         │    Next.js App     │
                         │                    │
                         │ UI                 │
                         │ API                │
                         │ Authentication     │
                         │ Services           │
                         │ Authorization      │
                         └───────┬─────┬──────┘
                                 │     │
                         ┌───────┘     └──────────┐
                         ▼                         ▼
                 ┌───────────────┐        ┌────────────────┐
                 │  PostgreSQL   │        │ Object Storage │
                 │               │        │                │
                 │ Users         │        │ Resumes        │
                 │ Applications  │        │ Documents      │
                 │ Companies     │        └────────────────┘
                 │ Interviews    │
                 │ Contacts      │
                 │ Notes         │
                 │ Follow-ups    │
                 └───────────────┘
                         │
                         ▼
                 ┌────────────────┐
                 │ Scheduled Jobs │
                 │                │
                 │ Reminders      │
                 │ Email          │
                 └───────┬────────┘
                         │
                         ▼
                 ┌────────────────┐
                 │ Email Provider │
                 └────────────────┘

External Services:
- OAuth
- Sentry
- GitHub Actions
```

Initial architecture:

**Next.js + TypeScript + PostgreSQL + Prisma + object storage +
transactional email + Sentry + GitHub Actions.**

No microservices.

No Redis initially.

No Kubernetes.

No native mobile app.

No AI initially.

No unnecessary infrastructure.

------------------------------------------------------------------------

# 57. Most Important Rule

Build the product around this principle:

> **Every feature should either improve the student's job-search
> workflow or provide meaningful evidence of production engineering
> ability.**

Before implementing a feature, ask:

1.  Does the user need this?
2.  Is it part of the current MVP?
3.  Does it introduce unnecessary complexity?
4.  How will it be validated?
5.  How will authorization work?
6.  What happens when it fails?
7.  How will it be tested?
8.  How will it be monitored?
9.  How will we know users actually use it?

If these questions cannot be answered, the feature is probably not ready
to implement.
