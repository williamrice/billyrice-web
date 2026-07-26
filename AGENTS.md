# Repository Working Agreement

## Mission

Rebuild billyrice.com as a small, maintainable personal website and owner-only
publishing application. Keep the useful platform foundation—Next.js, React,
TypeScript, PostgreSQL, Prisma, Better Auth, Tailwind, and the App Router—but
replace legacy content and data subsystems when that produces a simpler result.

`CLEANUP_PLAN.md` is the implementation roadmap. `analysis.md` is supporting
research, not an instruction to preserve the current design.

## Clean-start policy

- Existing resume, project, user-setting, and other application content may be
  discarded.
- Do not build data migrations, importers, compatibility adapters, dual-write
  paths, backup jobs, or rollback paths for the legacy content.
- It is acceptable to replace the current Prisma application schema with a fresh
  initial migration.
- Preserve Better Auth's required tables and behavior unless intentionally
  replacing the authentication library.
- Remove `public/resume.json`, `prisma/schema.prisma.gen`, obsolete API routes,
  unused components, and unused dependencies once their replacements work.
- Do not preserve a feature merely because it exists. Keep it only when it serves
  the target site described in `CLEANUP_PLAN.md`.
- Never expose or copy values from `.env`. Add or update `.env.example` using
  placeholder values when configuration changes.

## Product boundaries

- The application is a modular monolith: one Next.js deployment and one
  PostgreSQL database.
- The admin remains under `/admin` and is for one allowlisted owner.
- Public content is server-rendered by default. Client components are reserved
  for interactions that require browser state.
- The resume is a professional narrative built from organizations, positions,
  accomplishments, projects, skills, education, and curated resume profiles.
- Projects are canonical records shared by the portfolio and resume; do not
  create a second resume-project model.
- Blog posts use Markdown stored in PostgreSQL. Raw HTML and executable MDX are
  out of scope.
- Uploaded media uses a single hardened media boundary and a shared
  `MediaAsset` record.
- Use `https://billyrice.com` as the canonical origin unless the owner changes
  that decision.

## Architecture and code conventions

- Organize new code by domain under `features/`:
  `identity`, `resume`, `portfolio`, `publishing`, `media`, and `operations`.
- A domain may contain `schemas`, `queries`, `commands`, `components`, and
  `types`. Keep route files thin and delegate domain work to these modules.
- Server components may call server-only queries directly. Do not add an
  internal HTTP request just to read data from the same application.
- Mark server-only modules with `import "server-only"` where appropriate.
- Validate all mutation and external-input boundaries with Zod on the server.
  Do not spread request bodies directly into Prisma calls.
- Use explicit DTOs/view models between Prisma and UI code; do not make client
  components depend on generated Prisma types.
- Use stable slugs for public content and stable IDs for editing.
- Use explicit ordering fields for ordered content. A nullable end date means an
  ongoing position.
- Keep published reads separate from draft/admin reads. Cache only published
  projections and invalidate them after a successful publication transaction.
- Prefer server actions for admin mutations initiated by forms. Add route
  handlers only for real HTTP interfaces such as feeds, public JSON, previews,
  authentication, and health checks.
- Use one owner authorization helper for every admin page, action, and handler.
  Authorization requires both `isAdmin` and an allowlisted email.
- Use current shadcn/ui components backed by `@base-ui/react` and styled with
  Tailwind CSS 4. Do not introduce another UI framework or use Radix primitives,
  Headless UI, or MUI alongside it.
- Use `lucide-react` for interface icons and Font Awesome Brands only for real
  company/social marks that Lucide intentionally does not provide.
- Use Sonner for notifications and `tw-animate-css` for shared UI animations.
- Use Sonner to report admin action success and failure. Prefer toasts over
  persistent page banners for transient mutation feedback; keep inline messages
  for field validation and states that require ongoing attention.
- Keep files focused. Split a component or module before it becomes a
  page-sized collection of unrelated forms and behaviors.

## Security and accessibility

- Escape user-supplied contact content and send both plain-text and HTML email.
- Validate upload size, MIME type, magic bytes, and image dimensions. Generate
  object keys on the server; never trust a client-supplied path or filename.
- Do not log credentials, tokens, CAPTCHA responses, private resume data, or
  complete request bodies.
- Disallow raw HTML in Markdown and sanitize rendered output with an allowlist.
- Use semantic HTML, associated labels, keyboard-operable controls, visible
  focus, useful alt text, and reduced-motion support.
- Every file input must have a visible associated label and nearby helper text
  stating what to upload, whether it is required, accepted file types, size and
  count limits, and replacement behavior when editing. Do not use placeholder
  text or screen-reader-only labels as the sole upload instruction.
- Robots directives are not authorization.

## Database rules

- Commit every Prisma schema change with its migration.
- Because this is a clean start, establish one new initial application migration
  rather than preserving the legacy application tables through data migrations.
- Use transactions for multi-record writes.
- Define useful uniqueness constraints, foreign-key deletion behavior, indexes,
  timestamps, and publication states in the schema.
- Use normalized join tables for domain relationships. PostgreSQL arrays are
  acceptable only for bounded scalar presentation data that will not be queried
  relationally.
- Do not edit generated Prisma client files.

## Verification

Use the repository scripts as they become available:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

- Run the smallest relevant checks while iterating and the full required suite
  before completing a phase.
- Every bug fix should add a regression test when practical.
- Test authorization failures as well as successful admin flows.
- Test public pages for empty states; a fresh database is a supported state.
- Do not declare a phase complete with failing lint, typecheck, tests, or build.

## Change discipline

- Work in the phase order in `CLEANUP_PLAN.md`; finish a vertical slice before
  starting another large subsystem.
- Keep unrelated user changes intact.
- Prefer deleting superseded code over retaining commented-out or duplicate
  implementations.
- Update `README.md`, `.env.example`, and `CLEANUP_PLAN.md` when commands,
  configuration, architecture, or phase status changes.
- Record a short architectural decision in `docs/decisions/` when introducing a
  new service, data-store pattern, rendering strategy, or major dependency.
- Do not add Redis, a worker, a separate admin deployment, a search service,
  native comments, arbitrary embeds, or a general-purpose CMS without an
  explicit product requirement.
