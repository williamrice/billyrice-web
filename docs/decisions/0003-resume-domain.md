# ADR 0003: Rebuild the resume as canonical career records

- Status: accepted
- Date: 2026-07-25

## Context

The legacy resume copied the JSON Resume document shape into eight database
tables. Public rendering fetched an owner endpoint in the browser, projects were
duplicated, and the admin replaced every child record on each save. The owner
does not require migration, backup, print, or PDF compatibility.

## Decision

- Store named, independently publishable `ProfessionalProfile` versions.
- Select the version rendered at `/resume` through a typed application setting.
- Model organizations, positions, ordered accomplishments, categorized skills,
  education, and credentials as explicit career records.
- Select existing canonical `Project` records through
  `ResumeProjectSelection`; do not duplicate project content.
- Validate small owner-only server actions with Zod and update one record type
  at a time.
- Render the public resume directly on the server as a responsive professional
  narrative.
- Do not maintain JSON Resume, print, PDF, or legacy API compatibility.

## Consequences

- The resume supports implementation, software design, applied AI, leadership,
  and public service without forcing them into a generic work-history payload.
- Existing resume tables are dropped by the clean-start migration.
- The public page has no client fetch, print dependency, or private admin API.
- A version can be duplicated as a safe editing baseline without changing the
  currently configured public version.
- Applying the migration requires a reachable PostgreSQL database.
