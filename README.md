# billyrice.com

This is the source code for my personal website, [billyrice.com](https://billyrice.com).
It includes my resume, projects, and occasional writing.

The site started as a simple portfolio and has been rebuilt a few times over the
years as I have grown as a developer.

It is built with Next.js, React, TypeScript, Tailwind CSS, PostgreSQL, Prisma,
and Better Auth.

Project roadmaps, research, and architectural decisions are collected in the
[`docs/`](docs/) directory.

## Browser tools

`/tools/mermaid` is a public Mermaid workbench. Diagram rendering and SVG
exports happen in the browser with Mermaid's strict security mode. A locally
bundled Monaco editor provides highlighting, diagnostics, and completion
snippets. The allowlisted owner can save diagrams, private notes, sharing
settings, and immutable revisions from `/admin/tools/mermaid`.

## Local development

Requirements: Node.js 24, npm 11, and Docker.

```bash
cp .env.example .env
docker compose up -d
npm install
npm run dev
```

`npm run dev` applies all committed database migrations and idempotently seeds
the default application settings before starting Next.js. It also regenerates
Prisma Client before Next.js starts so schema additions are available at
runtime. Existing settings are left unchanged. Restart the dev server after
changing the Prisma schema; hot reload cannot replace an existing Prisma client
singleton. Development, installation, and production builds also copy Monaco's
versioned editor worker to an application-owned public path.

To apply the same database bootstrap without starting the app, run
`npm run db:setup`. To recreate the local database and its defaults from
scratch, run `npm run db:reset`. The reset command deletes all data in the
configured database and is intended only for local development.

## Vercel deployment

The production application uses the Node.js 24 Vercel runtime and a Neon
database connected through the Vercel Marketplace. Keep these generated
connection variables available in Development, Preview, and Production:

- `POSTGRES_PRISMA_URL`: Neon's pooled URL, used by the running application.
- `POSTGRES_URL_NON_POOLING`: Neon's direct URL, used only by Prisma CLI
  commands such as migrations and introspection.

Use `vercel env pull .env.local` to sync the selected Vercel environment for
local work. Apply committed migrations with `npx prisma migrate deploy` as a
separate release or CI step; application builds only generate Prisma Client and
must not mutate the database.

Public settings, projects, resume content, and published posts use Next.js Cache
Components with tagged invalidation. Vercel serves their static or partially
prerendered output from its managed cache, while authenticated admin and API
work remains request-time. No external cache service is required.

For the lowest database latency, set the project's Vercel Function region to
the region nearest the Neon database. Keep each environment's
`BETTER_AUTH_URL` and `BETTER_AUTH_TRUSTED_ORIGINS` aligned with its deployed
domain.
