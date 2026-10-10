# Working in billyrice-web

These instructions apply throughout the repository. Keep this file tracked and
update it when the actual workflow or architecture changes. Use it for durable
engineering agreements, not task history or release notes.

## Project and layout

This is billyrice.com: a personal portfolio, resume, Markdown blog, browser tools,
and owner-only administration. It is one Next.js App Router application deployed
to Vercel, with PostgreSQL on Neon, Prisma, Better Auth, S3 uploads, and Resend.
Local development uses Docker PostgreSQL.

- `app/`: route pages, layouts, metadata, and HTTP handlers. Keep new routes thin;
  call domain functions directly rather than fetching this app's own APIs.
- `features/`: domain schemas, types, queries, commands, services, and components.
  Existing domains include resume, publishing, settings, projects, Mermaid, and
  operations. Extend the relevant domain before adding general abstractions.
- `components/`: shared presentation; `components/ui/` holds application-owned
  shadcn components backed by Base UI.
- `lib/`: shared infrastructure, authentication, environment validation, Prisma,
  and focused utilities. `actions/` contains older project/upload actions; avoid
  spreading new domain behavior across both locations.
- `prisma/`: canonical schema, committed migrations, and idempotent seed SQL.
- `tests/unit/`: Vitest checks for schemas, helpers, rendering boundaries, and
  readiness. `.github/workflows/ci.yml` defines CI verification.

## How we make changes

- Inspect the existing implementation and Git diff first. Preserve unrelated
  owner changes; keep changes focused on the requested outcome.
- Prefer supported APIs and proper code changes. Do not patch `node_modules`,
  disable checks, weaken types, add fallback credentials, or change configuration
  merely to hide an error. Explain environmental blockers and their real fix.
- Use TypeScript, the `@/` root alias, and the surrounding file's formatting.
  Keep public pages server-first; use client components for browser interaction.
  Keep server infrastructure out of client imports and mark new server-only
  modules with `server-only` where appropriate.
- Validate untrusted inputs with the domain's Zod schemas at the server boundary.
  Client validation is supplementary. Keep dates, URLs, and form conversion in
  the existing focused helpers when they fit.
- Reuse the current architecture. Adding services, infrastructure, overlapping UI
  frameworks, compatibility layers, or dependencies needs a concrete task need.
- Report findings and upgrade highlights in conversation. Do not create `docs/`,
  ADRs, plans, audit reports, or upgrade diaries unless explicitly requested.
  Temporary persistent notes belong in ignored `.local-notes/`. Keep setup and
  operational instructions in `README.md`; keep reusable agent rules here.

## Setup and commands

Use Node.js 24 and npm 11, as specified by `.nvmrc` and `package.json`. Use npm
and maintain `package-lock.json`; do not introduce another package manager.
Copy `.env.example` to `.env` only when `.env` does not already exist, and fill
in the required values without overwriting existing secrets.

| Command | Purpose and side effects |
| --- | --- |
| `docker compose up -d` | Start the local PostgreSQL 17 container on port 5432. |
| `npm ci` | Install the lockfile; postinstall generates Prisma Client and copies the Monaco worker. |
| `npm run dev` | Copy the worker, generate the client, apply migrations, seed settings, then start Next.js. **Writes to the configured database.** |
| `npm run build` | Copy the worker and build production output; reads application data but does not migrate or seed. |
| `npm run lint` | Run ESLint. |
| `npm run typecheck` | Check TypeScript without emitting files. |
| `npm test` | Run Vitest; `npm run test:watch` runs it in watch mode. |
| `npm run db:generate` | Generate the Prisma client from the schema. |
| `npm run db:setup` | Generate, deploy committed migrations, and seed. **Writes to the configured database.** |
| `npm run db:seed` | Run the configured idempotent SQL seed. |
| `npm run db:reset` | **Delete database data**, recreate from migrations, and seed; only for an explicitly authorized local reset. |

## Database and environment boundaries

- `lib/prisma.ts` uses `POSTGRES_PRISMA_URL` with `@prisma/adapter-pg` for runtime
  queries. `prisma.config.ts` uses `POSTGRES_URL_NON_POOLING` for CLI operations
  and loads `.env` through `dotenv/config`. Next.js can also load `.env.local`,
  but do not assume the standalone Prisma CLI loads it.
- Locally, both URLs can point to the same Docker database:
  `postgresql://postgres:postgres@localhost:5432/billyricecom`, with the actual
  local credentials. On Neon, use the pooled endpoint for application traffic
  and the direct endpoint for migrations. Both must target the same branch and
  database within an environment.
- Confirm the intended database before running `dev`, migrations, seed, reset,
  or schema writes. Prefer Docker for routine local development. For testing
  against Neon data, use an isolated test branch; never silently target production.
- PostgreSQL Docker initialization variables do not change passwords in an
  existing data volume. Diagnose credential mismatches without deleting volumes.
- Change schema through committed migrations. Do not edit applied migrations.
  Generate the client after schema changes; restart the dev server because the
  cached Prisma singleton is not replaced by hot reload.
- CI uses an ephemeral PostgreSQL database and `prisma db push`. This does not
  authorize `db push` against persistent local or Neon databases.
- Keep Prisma CLI/client/adapter versions aligned. Check release status before
  upgrades: a registry's `latest` tag can be a prerelease. Do not infer approval
  for a prerelease or major database workflow migration from a routine update.
- Use `lib/env.ts` for application environment validation. Keep `.env.example`
  current when variables change. Never commit or print secrets, connection URLs,
  tokens, or `.env` contents. Compare configuration with redacted diagnostics.

## Authentication and content integrity

- Owner authorization uses `lib/auth-guards.ts`: a valid session must have
  `isAdmin` and an email in `ALLOWED_AUTH_EMAILS`. Protect each privileged server
  action and HTTP handler; an admin layout or hidden control is not sufficient.
- Keep ownership checks in database queries for saved diagrams. Public queries
  must filter out private diagrams and unpublished posts/profiles at the data
  boundary, not after returning records to a client.
- PostgreSQL is authoritative. Publishing saves current content and immutable
  revisions together in a transaction. Mermaid saves also preserve revision
  history, former-slug redirects, and optimistic `expectedRevision` checks.
- Resume profiles select canonical project records; do not duplicate project
  content or reintroduce the old JSON Resume/API model without a requested need.
- Render blog Markdown through `MarkdownContent` with raw HTML disabled. Do not
  enable executable MDX or arbitrary HTML for stored content.
- Keep secrets and sensitive content out of responses and logs. Use structured
  operational logging with safe context. `/api/health` is liveness;
  `/api/ready` checks the application settings table and returns 503 on failure.

## Caching, UI, and browser tools

- Public data uses Next.js Cache Components with bounded `cacheLife` and explicit
  tags. Invalidate affected tags and paths after successful writes using the
  existing helpers. Account for old and new URLs when slugs change. Do not cache
  owner sessions or private content in a shared public cache.
- Reuse Base UI/shadcn, Tailwind semantic tokens in `app/globals.css`, Lucide for
  interface icons, Font Awesome Brands for brand marks, and Sonner for toasts.
  Base UI composition uses `render`, not Radix's `asChild`. Preserve responsive
  layouts, labels, keyboard navigation, visible focus, and reduced motion.
- Mermaid renders and exports in the browser. Preserve strict security, locked
  configuration, source/edge limits, and no optional interaction callbacks. Only
  sanitized renderer output belongs in the SVG preview. Preserve XML-safe SVG
  serialization and browser rasterization for exports.
- Monaco is bundled locally and loaded only for the editor routes. Keep worker
  copying in `scripts/copy-monaco-worker.mjs`; do not replace it with CDN loading.
  Mermaid's parser is the syntax authority; local completions are not an LSP.
  Preserve versioned, validated local storage and mobile stacked editor/preview.

## Dependencies and verification

- Check current registry versions and official migration notes when upgrading.
  Update manifest and lockfile together. Evaluate each override individually:
  retain security/compatibility fixes still needed by upstream dependencies,
  remove redundant ones, and scope overrides where npm resolves them correctly.
  Do not use `--force`, `--legacy-peer-deps`, or audit-driven downgrades to hide
  incompatibilities. Explain remaining audit findings and upstream blockers.
- Preserve the intentional TypeScript side-by-side aliases unless tool support
  justifies changing them: the native compiler and JavaScript API compatibility
  package serve different consumers.
- For code changes, run lint and type checking plus relevant existing tests.
  Add focused regression tests for behavioral or security fixes, not tests that
  merely mirror trivial edits. Run the production build for dependency changes,
  schema changes, and changes affecting bundling or server/client boundaries.
- The owner performs end-to-end testing unless they request otherwise. Identify
  affected flows for the owner; do not claim automated checks prove browser
  behavior. Mermaid/Monaco changes need particular attention to malicious input,
  worker loading, diagnostics, rendering, and exports.
- Documentation-only changes need diff/link/command checks, not another full
  application test run. Do not rerun unchanged successful checks without reason.
- Before handing off, inspect `git diff --check` and the final diff for accidental
  files, secrets, generated artifacts, and scope creep. Do not hand-edit or commit
  `.next/`, generated Prisma output, the copied Monaco worker, or local notes.
  Report what changed, checks passed, blockers, and any owner testing still needed.
