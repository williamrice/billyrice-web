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

test
