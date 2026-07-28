# Architectural and Product Assessment

## 1. Executive summary

Recommendation: **retain the foundation but replace major subsystems**.

The repository already has a viable foundation:

- A compact TypeScript/Next.js modular monolith
- PostgreSQL with Prisma
- A working production build
- Server-side project rendering
- Better Auth with Google authentication and an email allowlist
- An integrated admin route
- Basic SEO, sitemap, structured data, responsive styling, and print support
- Existing Coolify/Nixpacks deployment assumptions

A full rewrite is not justified. The primary problems are concentrated in replaceable subsystems:

- The resume model is a lightly relational copy of JSON Resume, not a professional-content domain.
- Resume presentation is client-only, uncached, and constrained to three work records.
- Resume administration is a 1,132-line form that deletes and recreates all child records.
- No migration history is committed.
- Blog/publishing infrastructure is absent.
- Project/resume concepts are duplicated and disconnected.
- Deployment, health checks, backup procedures, media safety, tests, and observability are incomplete.
- Some security and configuration defects need correction before expanding the admin.

The best future state is still one Next.js application, one PostgreSQL database, and one domain-specific admin area. Preserve the current language, framework, authentication foundation, visual assets worth keeping, and public routes. Redesign the resume schema and workflow, add proper migrations and operational controls, then introduce a separate blog domain.

No application files were changed during the assessment.

## 2. Current-state scorecard

| Area | Score | Evidence |
|---|---:|---|
| Architecture | 6/10 | Coherent monolith and App Router structure, but public data, admin APIs, server actions, and client fetching have inconsistent boundaries. |
| Data model | 4/10 | PostgreSQL/Prisma is appropriate, but resume organization, positions, accomplishments, projects, and skills are flattened or stored as arrays. No migration directory exists. |
| Resume experience | 4/10 | Printable and responsive, but client-only, uncached, list-oriented, and arbitrarily limited to three roles. |
| Blog readiness | 2/10 | Metadata and sitemap foundations exist; there are no post models, rendering utilities, drafts, feeds, or publishing workflows. |
| Admin experience | 4/10 | Authentication and CRUD exist, but resume editing is a single 1,132-line form with wholesale replacement and weak recovery/revision support. |
| Performance | 5/10 | Build is fast and many pages are static; resume incurs hydration and an extra database request. Devicon emits over 11 MB across SVG/font formats. |
| Security | 5/10 | Admin mutations use a strong server guard, but route-layout authorization is incorrect, uploads are weakly constrained, contact HTML is interpolated unsafely, and configuration has drift. |
| Accessibility | 6/10 | Skip link, semantic sections, labels, focus styles, and responsive layout are present. Heavy motion and some bespoke controls need formal testing. |
| SEO | 6/10 | Metadata, canonical helper, robots, sitemap, and JSON-LD exist. Domain identity is inconsistent and resume content is unavailable in initial HTML. |
| Testing | 1/10 | No test files, runner, test scripts, or CI evidence. |
| Developer experience | 4/10 | TypeScript is strict and the build works, but README is nearly empty, lint is broken, generated code is ignored, and migration/deployment procedures are undocumented. |
| Deployment readiness | 4/10 | Nixpacks and local PostgreSQL Compose exist, but there is no application container definition, health check, migration release step, restore procedure, or rollback documentation. |
| Maintainability | 5/10 | Small enough for one engineer, but large forms, duplicate upload/project paths, arrays instead of relationships, and absent tests/migrations increase change risk. |

## 3. Repository and technology inventory

### Technology

- Language: TypeScript/TSX
- Runtime/application framework: Next.js 16 App Router, React 19
- Styling: Tailwind CSS 4 plus Radix-derived UI components
- Database: PostgreSQL
- ORM/migrations: Prisma 7 with the PostgreSQL driver adapter
- Authentication: Better Auth with Google OAuth
- Validation/forms: Zod and React Hook Form
- Media: AWS S3 SDK
- Email: Resend
- Abuse prevention: reCAPTCHA Enterprise integration
- Package manager: npm with `package-lock.json`
- Deployment: Nixpacks configuration and PostgreSQL-only Compose
- Analytics: Google Analytics
- Printing: browser print through `react-to-print`

The principal dependencies and scripts are in `package.json`. There is no pinned runtime in the repository itself beyond an environment variable and a pinned Nixpacks archive.

### Directory roles

- `app/`: public pages, admin pages, API routes, metadata routes
- `actions/`: project/media server actions
- `components/`: public UI, admin forms, and a large local UI-component collection
- `lib/`: authentication, Prisma, email, CAPTCHA, metadata, and utilities
- `prisma/`: schema plus checked-out auxiliary generated schema, but no migrations
- `public/`: static images and the legacy/source resume JSON
- `.next/`: ignored build/cache output already present locally

### Legacy, duplication, and abandoned elements

- `public/resume.json` remains a seed/source alongside database resume records.
- `prisma/schema.prisma.gen` overlaps the active schema and is not used by the Prisma configuration.
- Prisma client output is generated locally but ignored by Git.
- `Project` and `ResumeProject` independently describe overlapping concepts.
- Upload logic exists in both `actions/upload.ts` and `app/api/upload/route.ts`.
- Project creation exists as both a server action and API route.
- Admin dashboard/settings are placeholders.
- Account settings and general-user APIs have little product relevance because authentication is deliberately restricted to the administrator.
- Several large UI dependencies coexist: MUI, Headless UI, Radix components, Heroicons, Lucide, React Icons, and Framer Motion.
- No current blog implementation was found.

## 4. Current architecture

```text
Browser
  ├── Static/Server-rendered public Next.js pages
  │     ├── Project server actions ── Prisma ── PostgreSQL
  │     └── External images/static assets
  │
  ├── /resume client component
  │     └── GET /api/admin/resume ── Prisma ── PostgreSQL
  │
  ├── /admin
  │     ├── Better Auth / Google OAuth
  │     ├── Resume form ── protected PUT/seed routes ── Prisma
  │     ├── Project forms ── protected actions/routes ── Prisma
  │     └── Upload route/action ── AWS S3
  │
  └── Contact form
        ├── reCAPTCHA Enterprise
        └── Resend
```

Next.js is the frontend, backend, API layer, and administration host. This is an appropriate modular-monolith deployment shape.

Project list/detail pages query PostgreSQL from server components/actions. The resume differs: its page is statically emitted as a client shell, then fetches dynamic data after hydration through an API path named as if it were administrative.

There is no explicit application cache. The resume endpoint forces dynamic rendering and sends `no-store`; project pages rely on Next.js rendering behavior and `revalidatePath` after writes. Logging is primarily `console.error`, with one CAPTCHA diagnostic logging the verification response.

## 5. Resume implementation assessment

### End-to-end flow

1. Seed content originates in `public/resume.json`.
2. An authenticated seed route converts date strings and creates resume children.
3. Prisma stores one hard-coded resume with ID `"1"`.
4. Public and admin clients call `GET /api/admin/resume`.
5. The admin form converts dates between strings and `Date`.
6. A `PUT` replaces every child collection with `deleteMany` plus `create`.
7. The public client sorts sections in memory and prints the DOM.

Relevant entities are defined in `prisma/schema.prisma`, public rendering in `app/resume/page.tsx`, and administration in `app/admin/resume/page.tsx`.

The seed contains 4 work entries, 1 education entry, 8 certificates, 3 skill groups, 4 resume projects, 2 volunteer entries, 3 interests, and 2 profiles.

### Important findings

#### Finding: the resume is not modeled as a career domain

- **Evidence:** `WorkExperience` combines organization and position; accomplishments are `String[]`; skills use `keywords String[]`; resume projects are isolated records.
- **Impact:** Promotions, concurrent roles, measurable outcomes, skill-to-project evidence, case studies, targeted profiles, stable citations, and selective reuse are difficult.
- **Recommendation:** Introduce Organization, Position, Accomplishment, canonical Project, Skill, and ResumeProfile selection entities.
- **Priority:** High
- **Confidence:** High
- **Relevant files:** `prisma/schema.prisma`

#### Finding: updates destroy record identity

- **Evidence:** All eight child collections are deleted and recreated during each save.
- **Impact:** IDs change, relationships cannot safely be added, audit trails become misleading, concurrent edits can overwrite one another, and revision diffs are unavailable.
- **Recommendation:** Use entity-level CRUD, stable identifiers, explicit ordering, transactions, and optimistic concurrency.
- **Priority:** High
- **Confidence:** High
- **Relevant files:** `app/api/admin/resume/update/route.ts`

#### Finding: the public resume has unnecessary hydration and latency

- **Evidence:** The page is a client component and fetches a forced-dynamic, no-store API after mount.
- **Impact:** Visitors see a loader, crawlers receive little resume content in initial HTML, and every visit incurs a database round trip.
- **Recommendation:** Render published resume data in a server component with tagged caching and invalidate it after publishing.
- **Priority:** High
- **Confidence:** High
- **Relevant files:** `app/resume/page.tsx`, `app/api/admin/resume/route.ts`

#### Finding: ordering and completeness are inconsistent

- **Evidence:** Only education has `menuOrder`; work is fetched by ID, then sorted in place by end date and truncated with `.slice(0, 3)`.
- **Impact:** One of the four seed roles is silently hidden, promotion/concurrency order is not expressive, and database-created order leaks into the result.
- **Recommendation:** Store explicit position and profile-entry order; distinguish featured/public/archived rather than slicing.
- **Priority:** High
- **Confidence:** High
- **Relevant files:** `app/resume/page.tsx`

### Other resume observations

- Ongoing employment is correctly representable with nullable `endDate`.
- `DateTime` is excessive for month/date-only career facts and creates timezone conversion risk.
- Presentation is tightly bound to generated Prisma model types.
- Browser printing is useful, but it is not deterministic server-side PDF generation.
- The resume has no draft/published boundary, snapshot, version, visibility, slug, or revision model.
- Contact data is embedded directly in the central resume row, complicating public/private variants.

Recommendation: migrate the existing data, but replace the schema and UI rather than extending the current resume tables.

## 6. Blog and publishing assessment

No post model, Markdown/MDX content, renderer, syntax highlighter, RSS/Atom feed, draft status, taxonomy, revision, redirect, or editorial workflow exists. Reusable foundations are limited to:

- Next.js metadata conventions
- Canonical helper
- Dynamic sitemap generation
- PostgreSQL/Prisma
- Authentication/admin shell
- S3 integration, after hardening
- Project detail-page patterns

### Recommended content strategy

Store authoring source as **Markdown in PostgreSQL**, with structured metadata in columns.

This is preferable to:

- MDX: executable component capability is unnecessary and increases security/build coupling.
- Files only: incompatible with the desired admin authoring and prompt publication without deployment.
- JSON blocks: more editor complexity and vendor-like schema maintenance.
- Raw HTML: higher sanitization risk and poor portability.
- External CMS: adds backup, dependency, authentication, and operational complexity.

At publish time:

1. Validate Markdown and metadata.
2. Render with a fixed Markdown pipeline.
3. Sanitize generated HTML with a strict allowlist.
4. Store or cache rendered HTML plus a renderer-version/content hash.
5. Invalidate the post, index, feeds, sitemap, and related topic pages.

### Essential for first blog release

- Posts, drafts, publication/update dates, slugs, excerpts
- Markdown editor and preview
- Cover images with alt text
- One category and multiple tags
- Code blocks with build/server-side syntax highlighting
- Table of contents and reading time
- SEO, Open Graph, canonical URL, JSON-LD
- RSS feed, sitemap entries, pagination/archive
- Revision history
- Redirects after slug changes
- Draft preview using short-lived signed tokens
- Import/export
- Featured and unlisted status

### Valuable later

- Scheduling
- Series
- Search
- Related posts
- Generated social images
- Link validation
- Atom in addition to RSS
- Topic pages joining posts/projects/skills
- Private posts
- External discussion links
- Email subscription integration
- Privacy-conscious analytics

### Unnecessary initially

- Multiple real authors
- Native comments
- Arbitrary embeds
- General-purpose block CMS
- Newsletter delivery infrastructure
- Elasticsearch/Meilisearch
- Full workflow/approval roles
- Real-time collaborative editing

## 7. PostgreSQL and data-model assessment

### Current strengths

- Appropriate PostgreSQL primary database
- Primary keys and core foreign keys exist
- Auth tables have useful token/email uniqueness and user/session indexes
- Timestamps exist on principal auth/project/resume rows
- PostgreSQL arrays are used legitimately at a storage level, though poorly for domain relationships
- Prisma schema validation passes

### Current weaknesses

- No `prisma/migrations` directory or committed migration history
- Few uniqueness/check constraints outside authentication
- No slug fields
- No explicit publication states
- Resume children lack audit timestamps and ordering
- No cascades on most resume children or gallery images
- `Project.technologies`, highlights, keywords, and interests are unqueryable arrays
- `WorkExperience.name` repeats organization text
- `ResumeProject` duplicates `Project`
- No transaction coordinates S3 deletion with database deletion
- Asynchronous S3 deletion uses `forEach(async ...)`, so failures are not awaited
- No connection-pool limits or deployment policy are documented
- No backup/restore assumptions are documented
- `findFirst()` is used for a singleton resume even though ID `"1"` is assumed elsewhere
- Client input is spread into Prisma update/create operations in several routes, increasing mass-assignment risk

### Resume model option 1: pragmatic relational model — recommended

Canonical entities:

- `Organization`
- `Position`
- `Accomplishment`
- `Project`
- `Skill`
- `Education`
- `Credential` for certifications/awards
- `Publication`
- `SpeakingEngagement`
- `ResumeProfile`
- Join/selection tables

This supports reliable relationships without becoming a generic CMS.

### Resume model option 2: flexible content model

- `ContentItem`
- Typed JSON payload
- Generic relations
- Generic section/entry tables
- Generic visibility and ordering metadata

Advantages: arbitrary future blocks and fast schema-less experimentation.

Disadvantages: weak database constraints, JSON validation burden, complicated queries, opaque migrations, generic admin forms, and harder long-term maintenance.

Recommendation: reject option 2 as the primary model. Permit small JSON fields only for bounded presentation configuration or immutable snapshots.

### Sharing strategy

Use separate domain tables in one PostgreSQL schema:

- Resume/professional domain tables
- Blog domain tables
- Shared `MediaAsset`
- Shared `Tag` only if cross-domain topic pages are an explicit requirement
- Shared canonical `Project` and `Skill`
- Separate blog and resume publication-state columns/enums
- Separate revisions because their semantics differ
- No generic `Content` superclass/table

## 8. Admin-area assessment

Keep the admin as a **separately routed area in the same application**.

A separate deployment would duplicate authentication, configuration, release coordination, and monitoring. A framework-generated admin would be fast initially but would not provide the resume-profile selection and narrative workflows required. A custom domain-specific admin is justified.

### Finding: layout authorization uses the wrong Boolean condition

- **Evidence:** It rejects only when the user is both non-admin **and** not allowlisted. The mutation guard correctly requires both admin status and allowlisting.
- **Impact:** An allowlisted non-admin or non-allowlisted admin could render the admin shell/read pages, although protected mutations remain guarded.
- **Recommendation:** Use `getAllowedAdminSession()` consistently in the layout and every admin loader/action.
- **Priority:** High
- **Confidence:** High
- **Relevant files:** `app/admin/layout.tsx`, `lib/auth-guards.ts`

### Finding: uploads lack critical constraints

- **Evidence:** User-controlled directory and filename form the S3 key; the whole file is buffered; no size, extension, MIME-signature, dimension, or collision checks are present.
- **Impact:** Overwrite, unexpected file publication, memory pressure, stored active content, and storage abuse if administrator credentials are compromised.
- **Recommendation:** Use server-generated keys, strict image types, magic-byte checks, size/dimension caps, safe metadata, private bucket or constrained public assets, and image processing.
- **Priority:** High
- **Confidence:** High
- **Relevant files:** `app/api/upload/route.ts`

### Finding: contact content is inserted into HTML email without escaping

- **Evidence:** Name, email, and message are directly interpolated into `html`.
- **Impact:** HTML injection in the administrator's mail client and malformed content.
- **Recommendation:** Validate request size/shape, escape HTML, and supply a plain-text alternative.
- **Priority:** High
- **Confidence:** High
- **Relevant files:** `lib/resend.ts`

### Finding: contact configuration has drifted

- **Evidence:** Code expects `GCLOUD_API_KEY`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `FROM_EMAIL`, and `TO_EMAIL`; those keys were not present in the local environment-key inventory, while differently named CAPTCHA variables were present. No values were read or disclosed.
- **Impact:** The contact workflow is likely broken in the inspected local environment.
- **Recommendation:** Add typed startup-time environment validation and one canonical key set.
- **Priority:** High
- **Confidence:** Medium—the production environment was not inspected.
- **Relevant files:** `lib/googleCaptcha.ts`, `lib/resend.ts`

### Right-sized future admin

- Google OAuth restricted to a configured identity
- Server-side admin guard on the entire route group
- One `owner` role initially; no generic RBAC UI
- Entity-specific editors with server-side Zod validation
- Autosaved drafts only after revision support exists
- Optimistic concurrency using `updatedAt` or a version number
- Audit events for publication, deletion, restore, login, and media changes
- Explicit destructive confirmations
- Mobile-capable navigation and forms
- Resume profile preview, print preview, and diff
- Blog Markdown editor, preview, revisions, redirects, and metadata validation

Better Auth likely provides session and anti-CSRF protections through its framework integration, but cookie attributes and provider-level behavior were not runtime-inspected. They should be covered by integration tests rather than assumed.

## 9. Frontend and UX assessment

### Strengths

- Clear top-level navigation
- Responsive Tailwind layouts
- Skip link and focus styles
- Semantic resume sections
- Canonical metadata helper
- Open Graph metadata, sitemap, robots, and homepage JSON-LD
- Project pages already resemble case studies
- Existing print affordance

### Weaknesses

- Identity/canonical domains conflict: root metadata uses `billyrice.com`, while homepage JSON-LD, canonical helper, sitemap, and robots use `williamarice.com`.
- Resume content is not in initial HTML.
- Resume is a long document rather than a narrative.
- Accomplishments appear as pills, reducing readability and perceived substance.
- Skills are broad static lists on the homepage and unrelated grouped keywords in the resume.
- Motion is widespread, with no observed reduced-motion handling.
- Navbar interaction and broad client-component usage increase JavaScript.
- Project URLs use numeric IDs instead of stable slugs.
- Static sitemap routes use the current time on every generation, implying false modification dates.
- Missing content-specific metadata for dynamic project pages was observed.

### Recommended resume experience

Use progressive disclosure, not an “interactive resume app.”

- A concise narrative introduction
- Featured measurable outcomes
- Career timeline grouped by organization
- Multiple positions nested under an organization
- Concurrent-role dates rendered accurately
- Expandable detail for secondary accomplishments
- Links from accomplishments to projects/case studies/writing
- Evidence-based skills pages or chips linked to roles/projects
- Profile switcher only for a small number of curated variants
- Dedicated print route with deterministic ordering
- Optional server-generated PDF from the print route
- JSON Resume-compatible export derived from canonical data
- Person/ProfilePage/Occupation structured data where appropriate

Useful: timeline, role view, featured outcomes, case studies, print variants.

Potential novelty to avoid in release one: animated career maps, client-side filtering over small datasets, elaborate skill graphs, and many audience modes.

## 10. Performance assessment

### Measured findings

- Production compilation: 2.8 seconds
- TypeScript build phase: 3.9 seconds
- 28 routes generated
- Standalone `tsc --noEmit --incremental false`: passed
- Prisma schema validation: passed
- Public/static route generation succeeded
- Largest emitted asset: Devicon SVG, approximately 6.7 MB
- Devicon also emitted EOT/WOFF/TTF files of approximately 1.5 MB each
- 44 files declare `use client`
- A local `.next` directory occupied roughly 1.1 GB, but this includes development/build caches and is not a deployable-image measurement

The initial sandboxed build failed because Turbopack could not bind an internal helper port; the same build succeeded outside that restriction. This is an execution-environment limitation, not an application defect.

### Inferred risks

- Resume hydration and no-store fetch harm LCP and perceived speed.
- Devicon's full icon package is excessive for a handful of technology icons.
- Framer Motion, multiple icon families, MUI, Radix, Headless UI, SWR, and carousel libraries may produce avoidable client weight.
- Unbounded `findMany()` will eventually affect project/blog list routes.
- Full resume graph retrieval is acceptable at this size, but should be a server-side cached projection.
- S3 upload buffering can spike application memory.
- Google Analytics and reCAPTCHA add third-party execution/network cost.
- No explicit compression/static-cache policy is present in application configuration; Coolify's proxy may supply some of it, but that was not verified.

### Recommended strategy

- Server-render published content.
- Cache public database projections with tagged/on-demand invalidation.
- Keep editing/admin dynamic and uncached.
- Replace Devicon package delivery with selected local SVGs or lightweight existing icons.
- Minimize client components to interactive islands.
- Use `next/image` with explicit dimensions and responsive sizes.
- Add pagination to blog indexes.
- Use PostgreSQL full-text search only if content volume justifies search.
- Do not add Redis.

## 11. Security assessment

No tracked `.env` file or secret was found, and secret values were not displayed.

Additional findings:

- CSP exists, but allows `'unsafe-inline'` and `'unsafe-eval'`; this materially weakens XSS mitigation.
- CSP permits all HTTPS images rather than a narrow list.
- CAPTCHA responses are logged in `lib/googleCaptcha.ts`.
- User/settings GET accepts an email from a GET request body without authentication, potentially exposing preferences and behaving inconsistently across proxies.
- POST settings does not return a deliberate unauthorized response before nullable database operations.
- Several API routes trust request objects without server-side schemas.
- `Project` API creation spreads request data into Prisma.
- S3/database deletion is not transactional and asynchronous deletion is not awaited.
- No application-level rate limiting is visible for contact or authentication.
- No audit log is present.
- No malware/image validation or media lifecycle policy exists.
- Robots exclusions do not secure admin routes; authentication does, but route consistency must be fixed.
- No dependency-vulnerability scan was performed because it would require current network data; repository code alone cannot establish dependency safety.

For future Markdown:

- Disallow raw HTML initially.
- Sanitize even rendered Markdown.
- Allow only enumerated URL schemes.
- Render code as escaped text.
- Use an allowlist of embed providers, preferably none initially.
- Give previews short-lived, single-purpose signed tokens and `noindex`.
- Never accept arbitrary React/MDX execution from admin content.

## 12. Code-quality and maintainability assessment

Genuine engineering issues:

- No tests
- Broken lint script: `next lint` is no longer a valid lint command in this setup
- No migration history
- Minimal README
- 1,132-line resume admin form
- 465-line project edit form and 358-line add form with duplication
- Duplicate API/server-action paths
- Prisma types cross directly into client presentation
- `any` and `@ts-ignore` in resume seeding
- No typed environment configuration
- Weak error taxonomy and recovery
- No observable domain/service boundaries
- Dependency/UI-system overlap
- No CI configuration found

Positive evidence:

- Strict TypeScript configuration
- Successful typecheck and production build
- Small repository with understandable routing
- Reusable auth guard
- Server-side authorization for important mutations
- Prisma's schema is valid
- Server components are already used for projects
- The modular monolith is an appropriate scale

## 13. Coolify deployment assessment

The current project is plausibly deployable through Coolify using Nixpacks, but it is not operationally complete.

Current evidence:

- PostgreSQL 17 local Compose service with persistent volume
- Nixpacks archive pin
- Standard `build` and `start` scripts
- Next.js default port assumptions
- Environment-driven PostgreSQL and external-service configuration

Missing:

- Application Dockerfile or full production Compose
- Explicit runtime version in version control
- Application health/readiness endpoint
- Database health check
- Migration deployment command
- Restart/readiness policy for application
- Backup schedule and retention
- Restore rehearsal
- Media backup policy
- Resource limits
- Connection limits/pooling policy
- Rollback documentation
- Deployment-time migration locking
- Background/scheduled-job strategy

### Recommended Coolify topology

```text
Coolify reverse proxy/TLS
    |
    +-- Next.js application container
    |     - web + admin + API
    |     - health endpoint
    |     - read/write PostgreSQL user
    |
    +-- PostgreSQL service
          - persistent volume
          - automated encrypted backups
          - restricted network
```

Media options:

1. Prefer an S3-compatible bucket with versioning and lifecycle protection if existing S3 usage is acceptable.
2. A Coolify-mounted volume is simpler but complicates rolling replacement and off-host backup.

Service decisions:

- Redis: no
- Worker: no initially
- Object storage: yes for uploaded media, unless a rigorously backed-up single volume is preferred
- Separate admin service: no
- Search service: no
- CDN: optional later; not required
- Scheduled-job service: no initially; run a small authenticated/locked scheduled endpoint or Coolify cron for publication checks
- PDF service: no dedicated service; use server-side headless Chromium only if browser print is insufficient

Migrations should run once as a release command before the new application takes traffic—not independently on every replica startup.

## 14. Rebuild-versus-refactor analysis

### Option A: incrementally improve everything in place

Keep Next.js, Prisma, PostgreSQL, auth, routes, and existing resume tables; add columns and gradually split forms.

- Relative effort: medium
- Risk: medium-high
- Migration complexity: deceptively high
- Resume outcome: constrained by the current JSON Resume shape
- Blog outcome: possible but would create a cleaner new domain beside a weak resume domain
- Long-term maintainability: moderate

This minimizes initial change but preserves the wrong resume boundaries.

### Option B: retain foundation, replace major subsystems — recommended

Preserve:

- Next.js/React/TypeScript
- PostgreSQL/Prisma
- Better Auth concept and Google provider
- Coolify/Nixpacks or move to a straightforward Dockerfile
- Public project content and reusable visual components
- Metadata/sitemap concepts
- S3-compatible media capability after hardening

Replace:

- Resume schema, API, public rendering, and admin form
- Project technology arrays with relationships where valuable
- Upload boundary
- Configuration validation
- Deployment/migration/backup procedures
- Ad hoc logging
- Broken lint/test foundation

Relative effort is medium-high, but the migration can be rehearsed alongside the current tables. It creates clean resume and blog domains without rebuilding working infrastructure.

### Option C: start over

A new Next.js/TypeScript/PostgreSQL/Prisma application would likely recreate most of the present foundation. Rewrite risks include content loss, URL/SEO regressions, auth mistakes, prolonged dual maintenance, and rebuilding functional project/contact/metadata behavior.

A rewrite would only be justified if a separate product decision rejected TypeScript/Next.js or if hidden production constraints differ substantially from the repository. Current evidence does not support it.

## 15. Recommended target architecture

- Frontend: current Next.js App Router and React, primarily server components
- Backend: Next.js route handlers/server actions organized by domain
- API: internal typed commands/queries; public JSON endpoints only where product value exists
- Database: PostgreSQL with Prisma and committed migrations
- Authentication: Better Auth Google OAuth, exact identity allowlist, short sessions, secure cookies
- Authorization: single owner/admin policy enforced in one server guard
- Admin: `/admin` in the same deployment, domain-specific forms
- Validation: shared Zod command schemas, always enforced server-side
- Domain structure: `resume`, `portfolio`, `publishing`, `media`, `identity`, `operations`
- Caching: Next.js tagged cache for published projections; direct uncached admin queries
- Observability: structured JSON logs, request correlation, error tracking, health/readiness endpoints
- Testing: domain unit tests, PostgreSQL integration tests, route authorization tests, Playwright critical flows
- Migrations: Prisma migrations plus tested data backfills
- Background work: none initially
- PDF: print route first; server-generated snapshot PDF later if fidelity/download requirements justify it
- Blog authoring: Markdown in PostgreSQL
- Blog rendering: server-side sanitized HTML with cache invalidation
- Media: shared `MediaAsset` metadata table backed by S3-compatible storage
- Containers: one application image plus PostgreSQL
- Recovery: scheduled database dumps/PITR as available, off-host media protection, quarterly restore rehearsal

## 16. Recommended resume data model

### Core entities

- `Organization`: name, slug, URL, location, logo media
- `Position`: organization, title, employment type, location, start/end dates, summary, display order, visibility
- `Accomplishment`: position or project owner, statement, metric/value/unit, sort order, featured flag, visibility
- `Project`: canonical portfolio project, slug, summary, narrative, status, dates, links
- `Skill`: canonical name, slug, category, description
- `PositionSkill` and `ProjectSkill`: relationship plus optional proficiency/context/order
- `PositionProject`: associates work with canonical projects
- `Education`: institution organization or plain institution name, credential, field, dates, order
- `Credential`: certification or award, issuer, issue/expiry dates, URL
- `Publication`: professional publication metadata only, not blog posts
- `SpeakingEngagement`: event, title, date, URL
- `ResumeProfile`: name, slug, audience, summary override, status
- `ResumeProfilePosition`, `ResumeProfileProject`, `ResumeProfileAccomplishment`, etc.: inclusion, order, optional display override
- `ResumeSnapshot`: immutable rendered-data JSON, created/published timestamps, optional PDF media
- Shared `MediaAsset`

Avoid separate generic `Experience`, `ResumeSection`, and `ResumeEntry` tables initially. The selection tables already express profiles without discarding domain meaning.

### Rules

- Use `date` or year/month precision fields rather than timezone-bearing timestamps for career dates.
- Nullable end date means current.
- Add a constraint preventing end before start.
- Give ordered child/list records an integer or fractional sort key.
- Use enums for visibility/status but keep them domain-specific.
- Add `createdAt`, `updatedAt`, and optionally `archivedAt`.
- Stable slugs on public standalone entities.
- Public/private/featured/archived states belong on canonical records; profile inclusion adds audience-specific selection.
- Keep personally sensitive contact fields separate from public biography.
- Generate JSON Resume output through a mapping layer.
- Generate PDF from an immutable snapshot/profile so downloads remain reproducible.

## 17. Recommended blog data model

- `Post`: ID, author ID, current title/slug/excerpt, Markdown, status, publication timestamps, category, series/order, cover media, SEO/social metadata, visibility, content hash
- `PostRevision`: post ID, revision number, source Markdown, metadata snapshot, editor, created timestamp
- `Category`: unique normalized name and slug
- `Tag`: unique normalized name and slug
- `PostTag`: composite unique post/tag join
- `Series`: title, slug, description
- `Author`: initially linked to the owner user/profile
- `MediaAsset`: shared with resume/projects
- `Redirect`: unique source path, destination path, status code, timestamps
- `PostProject`, `PostSkill`, and optionally `PostAccomplishment`: explicit cross-domain joins

### Constraints and indexes

- Case-insensitive unique active slug, preferably normalized in application and enforced in PostgreSQL
- Index `(status, publishedAt DESC)`
- Index category and series foreign keys
- Composite primary/unique key for `PostTag`
- Unique `(postId, revisionNumber)`
- Unique redirect source path
- GIN full-text index only when search is introduced
- Check scheduled posts have a future `publishedAt`
- Check public posts have required title, excerpt, slug, and metadata

Draft previews should resolve draft content server-side after validating a short-lived signed token. Scheduling can be evaluated at request time and promoted by a Coolify cron under a PostgreSQL advisory lock; no worker is needed.

Exports should contain Markdown plus portable JSON/YAML metadata and media references.

## 18. Recommended resume experience

First release:

- Narrative overview
- Featured outcomes
- Organization-grouped timeline
- Nested promotions/positions
- Clear concurrent role presentation
- Selected projects and case-study links
- Evidence-linked skills
- Print route
- One default resume plus one optional targeted profile
- JSON endpoint
- Person/ProfilePage structured data

Later:

- Additional targeted profiles
- Immutable downloadable snapshots
- Server-generated PDF
- Topic pages
- Leadership/technical-depth curated views

Reject initially:

- Complex filtering over a small career dataset
- Animated skill graphs
- User-customizable resume builders
- Dozens of presentation variants

## 19. Recommended blog and publishing experience

The admin editor should provide:

- Markdown source and rendered preview
- Required-metadata validation
- Draft/published/unlisted status
- Revision list and restore-as-new-revision
- Category/tag selection
- Cover-media selection
- SEO/social preview
- Redirect confirmation on slug change
- Link checks as an explicit action
- Scheduled publication later

The public site should use server-rendered, cached pages with minimal JavaScript. Syntax highlighting should occur during rendering, not in the browser. RSS, sitemap, archive pages, and metadata should query the same published projection.

Resume integration should remain explicit: posts may link to projects, skills, or accomplishments through join tables, but neither domain should own the other.

## 20. Proposed new features

| Feature | User/owner value | Complexity | Performance/maintenance/security | Decision |
|---|---|---:|---|---|
| Professional timeline | Clear career narrative; reusable admin data | Medium | Low runtime cost | Release 1 |
| Featured measurable outcomes | Immediate credibility; editorial control | Low | Negligible; validate numbers/text | Release 1 |
| Project case studies | Strong evidence of work | Medium | Cacheable; media safety required | Release 1 |
| Resume profiles | Audience-specific resumes | Medium | Cache each profile; guard private profiles | Release 1, limit profiles |
| Print/PDF | Recruiter convenience | Medium | Print cheap; server PDF operationally heavier | Print first, PDF later |
| Public JSON resume | Machine-readable portability | Low | Cacheable; avoid private fields | Release 1 |
| Structured data | Search context | Low | Negligible; avoid unsupported claims | Release 1 |
| Skills linked to evidence | Makes skills credible | Medium | Join/query cost is minor | Release 1 |
| Resume snapshots/history | Reproducibility and rollback | Medium | Storage growth; protect private snapshots | Later |
| Technical blog/RSS | Demonstrates expertise | Medium | Highly cacheable | Blog phase |
| Draft previews/revisions | Safe authoring | Medium | Token leakage and stored-XSS controls | Blog phase |
| Topic pages | Joins writing and experience | Medium | Cached queries | Later |
| Search | Discoverability after content volume grows | Medium | PostgreSQL FTS sufficient | Later |
| Social preview generation | Better sharing | Medium | Rendering/storage upkeep | Later |
| Privacy analytics | Product insight | Low-medium | Privacy/configuration burden | Later |
| Newsletter integration | Audience retention | Medium-high | Third-party/privacy burden | Later |
| Native comments | Limited value for personal site | High | Abuse/moderation risk | Reject |
| Knowledge base | Dilutes professional focus | High | Ongoing editorial burden | Reject initially |
| Now/uses page | Modest personality/context | Low | Low maintenance if updated | Optional later |
| Changelog | Low visitor value | Low | Becomes stale | Reject |
| Private posts | Limited external value | Medium | Authorization complexity | Later only if needed |

## 21. Migration and implementation roadmap

### Phase 0: decisions and safety

- **Goals:** Remove uncertainty and establish rollback.
- **Deliverables:** Architecture decision record, production data inventory, database/media exports, baseline URLs/performance, content ownership map, acceptance criteria, restore rehearsal, current-site rollback plan.
- **Dependencies:** Production access and backup destination.
- **Risks:** Unknown schema drift because migrations are absent.
- **Exit criteria:** Restorable backup, verified content counts, and signed-off target model.

### Phase 1: foundation

- **Goals:** Make change safe and deployable.
- **Deliverables:** Domain folder structure, baseline Prisma migration, environment validation, unified auth guard, admin shell, health/readiness endpoints, structured logging, Coolify release command, backup procedure, media decision, CI with lint/typecheck/tests/build.
- **Dependencies:** Phase 0 backup and schema reconciliation.
- **Risks:** Baseline migration not matching production.
- **Exit criteria:** Clean deployment to staging, migration rehearsal succeeds, and restore test passes.

### Phase 2: resume domain

- **Goals:** Replace the resume subsystem without breaking the public site.
- **Deliverables:** New schema, import adapter, entity editors, profile composer, server-rendered public resume, print view, JSON output, structured data, optional PDF spike.
- **Dependencies:** Canonical organization/project/skill decisions.
- **Risks:** Data loss, profile-selection mistakes, URL/SEO regression.
- **Exit criteria:** Content parity verified record-by-record; public and print acceptance tests pass; old tables remain available for rollback.

### Phase 3: portfolio and supporting content

- **Goals:** Unify evidence and professional narrative.
- **Deliverables:** Canonical projects, accomplishments, skill relationships, case studies, professional publications/speaking if needed, topic-ready joins.
- **Dependencies:** Resume canonical entities.
- **Risks:** Over-modeling low-volume content.
- **Exit criteria:** No duplicate project sources and all featured claims link to evidence where appropriate.

### Phase 4: blog and publishing

- **Goals:** Add durable publishing without deployment-driven edits.
- **Deliverables:** Blog schema, Markdown editor, sanitized renderer, drafts/previews, revisions, tags/category, media, redirects, RSS, sitemap, SEO, pagination, code highlighting.
- **Dependencies:** Media, auth, revisions, public cache invalidation.
- **Risks:** Stored XSS, preview leakage, slug/redirect errors.
- **Exit criteria:** Draft-to-publish and rollback flows pass integration/E2E tests; feed and metadata validate.

### Phase 5: hardening

- **Goals:** Production confidence.
- **Deliverables:** Bundle reduction, accessibility audit, authorization matrix tests, upload abuse tests, security headers, PostgreSQL index review, monitoring/alerts, backup restore validation, SEO crawl, migration cleanup.
- **Dependencies:** Stable feature set.
- **Risks:** Late discovery of accessibility or migration defects.
- **Exit criteria:** Defined performance budgets pass, critical accessibility/security issues are closed, restore time objective is met, and rollback is rehearsed.

## 22. Risks and mitigations

- **Missing migration history:** Baseline against an actual production schema and archive a schema-only dump.
- **Dual resume sources:** Declare PostgreSQL canonical only after reconciliation; retain export snapshots.
- **Destructive current writes:** Migrate into new tables and use read-only comparison before cutover.
- **Rewrite creep:** Preserve Next.js/PostgreSQL/auth and replace bounded domains.
- **Stored content XSS:** Prohibit raw HTML, sanitize output, and test malicious fixtures.
- **Media loss:** Use versioned object storage, database references, and off-site inventory/export.
- **OAuth lockout:** Retain a documented emergency administrative recovery procedure.
- **Cache staleness:** Invalidate tags only after committed publication transactions.
- **PDF complexity:** Ship a print view first and add server PDF only against explicit acceptance criteria.
- **Scheduling concurrency:** Use a PostgreSQL advisory lock plus an idempotent publication command.
- **Domain over-modeling:** Implement only entities represented by real content or near-term publishing requirements.

## 23. Open questions

1. Which hostname is canonical: `williamarice.com` or `billyrice.com`?
2. Is the local seed JSON identical to production resume data?
3. Does production have schema changes not represented in Git?
4. Must historical public resume PDFs remain byte-for-byte stable?
5. How many resume profiles are genuinely needed in the first release?
6. Should phone/address be public, profile-specific, or omitted?
7. Is AWS S3 intended to remain, or should Coolify-hosted S3-compatible storage be considered?
8. What backup retention and recovery-time objectives are acceptable?
9. Is deterministic server-generated PDF required, or is browser print sufficient initially?
10. Is scheduled blog publication required for the first blog release?
11. Should tags be cross-domain from day one, or introduced only with topic pages?
12. Are publications and speaking engagements current real content needs or future possibilities?
13. Should Google Analytics remain given the privacy/performance tradeoff?
14. Is the secret-message integration still an intentional part of the site?

## 24. Final recommendation

Choose **retain the foundation but replace major subsystems**.

The recommended target stack is:

- Next.js App Router and React
- TypeScript
- PostgreSQL
- Prisma with committed migrations
- Better Auth with a unified owner-only guard
- Zod at server command boundaries
- Markdown stored in PostgreSQL for blog content
- S3-compatible media storage
- One application container plus PostgreSQL in Coolify
- Tagged server-side caching with on-demand invalidation
- Structured logs, health checks, tested backups, and restore procedures

The five highest-priority changes are:

1. Establish migrations, backups, restore rehearsal, environment validation, and a repeatable Coolify release path.
2. Correct authorization/configuration/upload/contact security defects.
3. Replace the resume tables with organization/position/accomplishment/project/skill/profile relationships.
4. Replace client-only resume fetching with cached server rendering and a deterministic print view.
5. Add tests, working linting, observability, and performance budgets before introducing the blog.

**Resume direction:** a pragmatic relational professional-content domain with stable canonical entities and profile selection tables. Do not extend the current JSON Resume-shaped tables as the long-term system.

**Blog direction:** separate PostgreSQL domain tables, Markdown source, sanitized server rendering, revisions, redirects, cached publication, and explicit optional relationships to projects and skills.

**Recommended first implementation milestone:** Phase 0 plus Phase 1, ending with a staging deployment that has a baseline migration, unified authentication guard, health checks, CI, structured logs, and verified backup/restore. Do not begin resume migration until that safety foundation passes.

**Most important technical risk:** introducing a new schema without a trustworthy migration baseline.

**Most important migration risk:** losing or misordering professional content because the current database, seed JSON, public display, and wholesale update process may not represent the same canonical state.

Decisions required before implementation:

- Canonical domain
- Canonical production resume source
- Initial resume profiles
- Public contact-data policy
- PDF requirement
- Media-storage choice
- Backup/RTO expectations
- Cross-domain taxonomy policy
- First blog-release scheduling/search scope
- Analytics policy
- Whether publications, speaking, awards, and private content are real first-phase requirements or deferred concepts
