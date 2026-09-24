# ADR-007: Application resume relationship

## Status

Accepted

## Context

Students need to know which resume they sent with a given application.
`application_documents` already models that as a many-to-many link between
`applications` and `documents`. A dedicated `applications.resume_id` would
duplicate that relationship.

The product UI tracks **one resume per application**. Cover letters and other
files can still use the same join table.

## Decision

Reuse `application_documents`. Do not add `resume_id` on `applications`.

Product rules:

- Resume attachment is optional (`Attach later` is valid).
- At most one document of type `RESUME` is linked to an application.
- Attaching or changing a resume replaces the previous resume link.
- Other document types remain many-to-many.
- Deleting a document deletes join rows and object storage, never the
  application (`onDelete: Cascade` on the join table only).
- Linking, viewing, downloading, and deleting require the document and
  application to belong to the authenticated user. Cross-user IDs return
  `NOT_FOUND`.

## Consequences

Resume usage counts are `_count` of `application_documents` for that document.
Changing a resume is a replace of the resume join row, not a new application.
