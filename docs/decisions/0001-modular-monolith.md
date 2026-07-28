# ADR 0001: Keep a modular Next.js monolith

- Status: accepted
- Date: 2026-07-25

## Context

The site needs public portfolio and resume pages, an owner-only admin, database
content, contact delivery, media uploads, and later a blog. The existing Next.js
App Router, PostgreSQL, Prisma, and Better Auth foundation already supports this
deployment shape. Separate services would add authentication, deployment, and
operational coordination without a current scaling requirement.

## Decision

Use one Next.js application and one PostgreSQL database. Organize new code by
domain under `features/`, keep public rendering server-first, and keep the admin
under `/admin` in the same deployment. External object storage and email remain
integrations rather than application services.

## Consequences

- Public pages, admin commands, and HTTP interfaces share domain modules.
- Route files stay thin and do not call the same application through internal
  HTTP requests.
- Domains keep explicit schemas, queries, commands, DTOs, and cache boundaries.
- Redis is permitted as a non-authoritative settings cache under ADR 0004. No
  worker, search service, or separate admin deployment is introduced without a
  new decision and a demonstrated requirement.
