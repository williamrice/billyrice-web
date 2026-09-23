# ADR 0004: PostgreSQL settings with Vercel Data Cache

- Status: accepted (revised 2026-09-22)
- Date: 2026-07-25

## Context

The application needs a settings framework for resume selection, public feature
visibility, and presentation configuration such as the Devicon background.
Settings must remain durable and recoverable with the primary application
database. The application is hosted on Vercel and should not require a second
data service for this small, read-heavy workload.

## Decision

- Store typed application settings in PostgreSQL as keyed JSON values.
- Define a Zod schema and named query/command for each supported setting.
- Share the read-through and invalidation mechanics while keeping setting keys,
  defaults, schemas, and admin commands explicit.
- Cache setting reads in the Next.js Data Cache with bounded TTLs.
- Tag each cached setting and expire the relevant tag after the PostgreSQL
  transaction succeeds.
- Treat PostgreSQL as the only source of truth.

## Consequences

- Settings participate in normal PostgreSQL migrations and backups.
- Vercel's managed cache reduces hot public reads without another connection,
  credential, or service to operate.
- Local development uses Next.js's built-in cache with the same semantics.
- New settings require an explicit schema and accessor rather than arbitrary
  string access throughout the application.
