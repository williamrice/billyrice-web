# Website Cleanup and Rebuild Plan

## Outcome

Produce a clean, fast personal website with:

- a server-rendered portfolio and professional resume;
- an owner-only admin for structured editing and publishing;
- canonical projects and skills shared across the site;
- a Markdown blog with safe previews and revision history;
- a small, tested dependency and deployment surface.

The project will retain Next.js, React, TypeScript, Tailwind, PostgreSQL, Prisma,
Better Auth, and Coolify compatibility. Legacy application data will not be
migrated or backed up. The new database begins empty.

## Current progress

Phase 1 is in progress. The repository now has a current flat ESLint setup,
explicit typecheck and Vitest scripts, typed core server configuration,
centralized canonical URLs, a unified admin guard, health/readiness routes,
structured logging, a Node runtime pin, and CI scaffolding. The clean initial
database migration and browser-test harness remain outstanding. The UI layer is
now standardized on current shadcn/Base UI, Tailwind CSS 4, Lucide, Sonner, and
`tw-animate-css`; the previous Radix, Headless UI, MUI, React Icons, Heroicons,
and Devicon dependencies have been removed.

## Decisions already made

- Clean start: destructive replacement of the legacy application schema and
  content is allowed.
- Architecture: one Next.js modular monolith and one PostgreSQL database.
- Admin: same deployment, `/admin`, one Google-authenticated allowlisted owner.
- Settings: typed PostgreSQL records with Redis as an optional read-through cache.
- Canonical origin: `https://billyrice.com`.
- Rendering: server components and cached published projections by default.
- Resume: named professional-profile versions selected through application settings.
- Portfolio: one canonical `Project` model shared with resume content.
- Blog source: Markdown in PostgreSQL; no raw HTML or MDX.
- Media: one shared, hardened S3-compatible media subsystem.
- Print and PDF output are out of scope.
- Deferred: scheduling, search, topic pages, generated social images, newsletter,
  private posts, comments, and multiple authors.

## Target structure

```text
app/
  (public)/             public route composition
  admin/                owner-only pages
  api/                  auth, health, preview, and public HTTP interfaces
features/
  identity/
  resume/
  portfolio/
  publishing/
  media/
  operations/
components/
  ui/                   shared presentation primitives only
prisma/
  schema.prisma
  migrations/
tests/
  integration/
  e2e/
docs/
  decisions/
```

Each feature owns its validation schemas, server queries/commands, DTOs, and
feature-specific UI. Route files remain composition layers.

## Phase 1 — Reset the foundation

Goal: make an empty installation reliable before rebuilding content.

Work:

1. Replace the broken lint command with ESLint CLI configuration compatible
   with Next.js 16.
2. Add `typecheck`, unit/integration test, and end-to-end test scripts.
3. Add a CI workflow that runs install, lint, typecheck, tests, and build.
4. Add typed environment validation and a safe `.env.example`.
5. Normalize the canonical origin and metadata to `billyrice.com`, removing
   conflicting `williamarice.com` references.
6. Fix the admin layout to use the same strict owner guard as mutations.
7. Add `/api/health` for process readiness and a database-aware readiness check
   appropriate for deployment.
8. Add structured error/logging helpers with request-safe context.
9. Rewrite the README with local setup, database reset, test, build, and Coolify
   release instructions.
10. Create the feature folders and an initial architecture decision record.

Exit criteria:

- A new contributor can start the app from the README.
- Empty-state pages render without errors.
- Unauthorized and merely allowlisted/non-admin users cannot access admin data.
- Lint, typecheck, tests, and production build pass.
- Health checks distinguish a running process from unavailable PostgreSQL.

## Phase 2 — Replace the database and remove legacy surfaces

Goal: establish the clean domain model and a fresh initial migration.

Core schema:

- Identity: retain Better Auth `User`, `Session`, `Account`, and `Verification`
  requirements.
- Shared: `MediaAsset`, domain-specific status/visibility enums.
- Resume: `Organization`, `Position`, `Accomplishment`, `Skill`,
  `PositionSkill`, `Education`, `Credential`, `ResumeProfile`, and profile
  selection/order tables.
- Portfolio: canonical `Project`, `ProjectSkill`, `PositionProject`, and ordered
  project media.
- Publishing is added in Phase 5, after the core content model is stable.

Work:

1. Replace legacy application models in `prisma/schema.prisma`.
2. Add constraints, cascade behavior, timestamps, explicit ordering, stable
   slugs, and indexes for public queries.
3. Create and commit a fresh initial Prisma migration.
4. Add a development-only reset/seed path with small fictional/sample content,
   never legacy production content.
5. Remove the legacy resume routes, seed/update endpoints, `public/resume.json`,
   `prisma/schema.prisma.gen`, user-settings surfaces, and duplicate
   project/upload mutation paths.
6. Remove orphaned components and dependencies exposed by those deletions.

Exit criteria:

- A fresh database migrates from zero and the application boots.
- The supported reset command recreates an empty or sample development database.
- No public or admin code imports the removed legacy models.
- Prisma validation, lint, typecheck, tests, and build pass.

## Phase 3 — Rebuild portfolio and resume as vertical slices

Goal: ship the core public product before adding publishing.

Portfolio slice:

1. Implement project queries, Zod command schemas, and owner-only CRUD.
2. Use slugs for `/projects/[slug]`, with list pagination or a deliberate small
   bounded query.
3. Add case-study fields, ordered media, skills, dates, links, draft/published
   states, and content-specific metadata.
4. Server-render project list/detail pages and invalidate their cache tags only
   after successful writes.

Resume slice:

1. Implement focused editors for named resume versions, organizations, positions, accomplishments,
   skills, education, credentials, and profiles.
2. Support duplicating a version and explicit ordering within each version.
3. Server-render `/resume` from the published default profile.
4. Group positions by organization, represent concurrent/current roles, feature
   measurable outcomes, and link claims to projects.
5. Present the resume as a responsive web narrative; print and PDF output are
   intentionally out of scope.
6. Add appropriate Person/ProfilePage structured data.

Exit criteria:

- The complete admin-to-publish flow works from an empty database.
- Draft content never appears publicly.
- Public pages return useful server-rendered HTML without a client data fetch.
- Profile ordering, current roles, authorization, and cache invalidation have
  automated coverage.

## Phase 4 — Consolidate media, contact, and public UI

Goal: remove duplicated infrastructure and reduce security/client-weight risks.

Work:

1. Replace both upload implementations with one media command.
2. Generate collision-resistant keys server-side; validate image bytes, type,
   size, and dimensions; record metadata and alt text.
3. Define deletion behavior so database and object-storage failures are visible
   and retryable.
4. Validate contact requests with Zod, cap field sizes, escape HTML, send a
   plain-text alternative, and stop logging CAPTCHA payloads.
5. Reconcile CAPTCHA environment names and add rate/abuse controls suitable for
   the deployment.
6. Audit all public routes and decide explicitly whether credentials,
   secret-message, licensing, account settings, and privacy pages remain.
   Default: remove account settings; remove secret-message unless it is confirmed
   as a current product feature.
7. Maintain the single shadcn/Base UI and Tailwind component system, use Lucide
   as the only icon package, and minimize `"use client"` boundaries.
8. Add reduced-motion behavior and complete keyboard, focus, semantic, contrast,
   and image-alt review.
9. Tighten CSP and remote image allowlists around the final integrations.

Exit criteria:

- Only one upload and one project mutation implementation exist.
- Invalid or oversized uploads and unauthorized mutations are rejected.
- Contact input cannot inject markup into email.
- The removed dependency set is confirmed by a clean install and build.
- Critical public flows pass an accessibility check.

## Phase 5 — Add publishing

Goal: add a safe, durable blog only after the professional-content core is stable.

Schema:

- `Post`, `PostRevision`, `Category`, `Tag`, `PostTag`, and `Redirect`.
- Optional explicit `PostProject` and `PostSkill` joins.
- Unique normalized slugs, revision numbers, publication indexes, and status
  constraints.

Work:

1. Build owner-only Markdown editing with metadata validation and preview.
2. Disallow raw HTML; render and sanitize on the server with a fixed pipeline.
3. Store immutable revisions and restore an old revision as a new revision.
4. Implement draft, published, and unlisted states.
5. Add signed, short-lived, `noindex` draft previews.
6. Create redirects when published slugs change.
7. Add cached post pages, index/archive pagination, category/tag pages, code
   highlighting, table of contents, reading time, and cover-image alt text.
8. Add content metadata, Article JSON-LD, RSS, and sitemap integration.
9. Add portable Markdown-plus-metadata export. This is content portability, not
   a legacy-data backup workflow.

Exit criteria:

- Draft-to-preview-to-publish, revision restore, slug redirect, and unpublish
  flows pass integration and end-to-end tests.
- Malicious Markdown fixtures cannot emit unsafe HTML or URL schemes.
- RSS, sitemap, canonical URLs, and social metadata reflect published content.

## Phase 6 — Production hardening and launch cleanup

Goal: make the rebuilt site boring to deploy and operate.

Work:

1. Define one Coolify release command that runs committed Prisma migrations once
   before new traffic.
2. Pin the supported Node/npm runtime and document PostgreSQL connection limits.
3. Add application error tracking and useful deployment/request correlation.
4. Add security-header, authorization-matrix, upload-abuse, and critical-path
   browser tests.
5. Measure public route performance, JavaScript, fonts, and image payloads; set
   budgets based on the rebuilt baseline.
6. Validate responsive layouts, keyboard use, reduced motion, metadata, robots,
   sitemap, and broken links.
7. Delete all remaining legacy code, unused assets, stale routes, unused
   dependencies, and temporary feature flags.
8. Update README and decision records to match the deployed system.

Exit criteria:

- Fresh install, migration, test, build, and deploy succeed from documented
  commands.
- No critical accessibility or security findings remain.
- Public pages meet the recorded performance budgets.
- Repository search finds no references to retired models, routes, components,
  environment variables, or dependencies.

## Recommended execution order

Deliver work as small vertical pull requests:

1. Tooling, environment validation, canonical metadata, and auth guard.
2. Fresh schema and legacy deletion.
3. Project read/publish path, then project admin.
4. Resume public narrative, then resume admin/profile composer.
5. Media and contact hardening.
6. UI/dependency/accessibility cleanup.
7. Blog schema and renderer.
8. Blog admin/revisions/previews.
9. Feeds/SEO and production hardening.

Do not build the blog while core portfolio/resume schema or media boundaries are
still moving.

## Explicit non-goals for this rebuild

- Preserving or importing existing application data
- A compatibility period for old database tables or numeric project URLs
- Multiple authors, roles, or editorial approval workflows
- Native comments or arbitrary third-party embeds
- Queues or a dedicated search service; Redis is limited to optional caching
- A generic block CMS
- Scheduled publishing in the first blog release
- Server-generated PDFs in the first resume release
- Complex resume filters, animated graphs, or user-built resume variants
