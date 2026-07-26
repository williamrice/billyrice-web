# billyrice.com

Personal portfolio, professional resume, owner admin, and publishing application
for [billyrice.com](https://billyrice.com).

The application is a Next.js modular monolith backed by PostgreSQL and Prisma.
See `CLEANUP_PLAN.md` for the rebuild roadmap and `AGENTS.md` for repository
working conventions.

The UI system is current shadcn on Base UI with Tailwind CSS 4. Lucide handles
interface icons, Font Awesome Brands supplies authentic company marks, Sonner
handles notifications, and `tw-animate-css` supplies shared animations.

## Requirements

- Node.js 24.18 (the current production LTS line)
- npm 11.11 or newer
- PostgreSQL 17

Use the pinned Node version when your version manager supports `.nvmrc`:

```bash
nvm use
```

## Local setup

1. Install dependencies.

   ```bash
   npm ci
   ```

2. Copy `.env.example` to `.env` and replace the placeholders. Never commit
   `.env`.

3. Start PostgreSQL.

   ```bash
   docker compose up -d postgres redis
   ```

4. Apply the clean initial database migration.

   ```bash
   npx prisma migrate deploy
   ```

   Existing pre-rebuild development databases should be reset once instead:

   ```bash
   npx prisma migrate reset
   ```

   This intentionally discards legacy resume, project, and application content.

5. Start the application.

   ```bash
   npm run dev
   ```

The local site is available at `http://localhost:3000`.

PostgreSQL is the source of truth for application settings. Redis provides a
short-lived settings cache and can be omitted by leaving `REDIS_URL` empty; the
application falls back to PostgreSQL when Redis is unavailable.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Vitest watch mode is available through `npm run test:watch`. Browser end-to-end
tests will be added before Phase 1 is considered complete.

## Health endpoints

- `GET /api/health` checks whether the application process can respond.
- `GET /api/ready` checks whether the application can query PostgreSQL.

Both endpoints are dynamic and return `Cache-Control: no-store`.

## Authentication

The admin is owner-only. Google sign-in is accepted only when the account:

- has `isAdmin` set; and
- appears in the comma-separated `ALLOWED_AUTH_EMAILS` configuration.

Both conditions are enforced through the shared server guard.

`BETTER_AUTH_TRUSTED_ORIGINS` contains the comma-separated exact origins that
may initiate authentication. Add any Tailscale development origin explicitly;
do not use a broad wildcard in production.

## Dependency policy

Direct dependencies are kept on their newest compatible stable releases.
Production uses the latest LTS Node line, not the short-lived Current line.

Two deliberate compatibility bridges exist:

- TypeScript 7 is the project compiler. The TypeScript 6 API is installed under
  the `typescript` alias for `typescript-eslint`, following the official
  TypeScript 7 side-by-side guidance.
- ESLint 10 uses the official Next.js plugin directly because the current
  aggregate `eslint-config-next` still includes React and accessibility plugins
  whose peer ranges stop at ESLint 9.

These holds should be rechecked during routine dependency updates.

## Deployment

The target is one Next.js application plus PostgreSQL and Redis in Coolify. The
production release step will run committed Prisma migrations exactly once
before new application traffic. Nixpacks currently provides the application
build; the final release and readiness configuration is part of Phase 1.
