# ADR 0005: PostgreSQL-backed Markdown publishing

- Status: accepted
- Date: 2026-07-25

## Context

The site needs owner-authored technical articles now and an ingestion boundary
for an AI service later. Publishing must not require an application rebuild, and
untrusted content must not execute HTML or MDX.

## Decision

- Store canonical Markdown and article metadata in PostgreSQL.
- Keep `Post` as the current projection and record an immutable `PostRevision`
  snapshot in the same transaction on every save.
- Use explicit `DRAFT` and `PUBLISHED` states and unique, owner-controlled
  slugs.
- Render Markdown on the server with raw HTML disabled.
- Keep domain services independent of server actions so a future authenticated
  REST handler can reuse validation and transactional writes.
- Reserve a unique external ID as an idempotency boundary for future ingestion.

## Consequences

- Publishing and unpublishing take effect without a build.
- Drafts are filtered at the database boundary and never queried by public
  routes.
- Slug changes currently create a new URL; redirect history is deferred to the
  next publishing increment.
- The future AI service still requires strong machine authentication, request
  size limits, rate controls, and audit-safe logging before an API is exposed.
