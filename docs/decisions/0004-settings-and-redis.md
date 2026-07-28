# ADR 0004: PostgreSQL settings with an optional Redis cache

- Status: accepted
- Date: 2026-07-25

## Context

The application needs a settings framework for resume selection, public feature
visibility, and presentation configuration such as the Devicon background.
Settings must remain durable and recoverable with the primary application
database. Redis is available in the deployment but should not become a second
source of truth.

## Decision

- Store typed application settings in PostgreSQL as keyed JSON values.
- Define a Zod schema and named query/command for each supported setting.
- Share the read-through and invalidation mechanics while keeping setting keys,
  defaults, schemas, and admin commands explicit.
- Use Redis as an optional read-through cache with bounded TTLs.
- Invalidate the relevant Redis key after the PostgreSQL transaction succeeds.
- Fall back to PostgreSQL whenever Redis is absent, unavailable, or contains an
  invalid value.

## Consequences

- Settings participate in normal PostgreSQL migrations and backups.
- Redis improves hot public reads without becoming required for correctness.
- New settings require an explicit schema and accessor rather than arbitrary
  string access throughout the application.
