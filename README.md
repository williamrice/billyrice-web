# billyrice.com

This is the source code for my personal website, [billyrice.com](https://billyrice.com).
It includes my resume, projects, and occasional writing.

The site started as a simple portfolio and has been rebuilt a few times over the
years as I have grown as a developer.

It is built with Next.js, React, TypeScript, Tailwind CSS, PostgreSQL, Prisma,
and Better Auth.

## Local development

Requirements: Node.js 24, npm 11, and Docker.

```bash
cp .env.example .env
docker compose up -d
npm install
npm run dev
```

`npm run dev` applies all committed database migrations and idempotently seeds
the default application settings before starting Next.js. Existing settings are
left unchanged.

To apply the same database bootstrap without starting the app, run
`npm run db:setup`. To recreate the local database and its defaults from
scratch, run `npm run db:reset`. The reset command deletes all data in the
configured database and is intended only for local development.

test
