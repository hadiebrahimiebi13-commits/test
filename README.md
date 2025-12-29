# Hierarchy Monorepo

This repo contains a small monorepo with a backend (Express + Prisma), an admin app (Next.js), a public frontend (Next.js), and shared Zod schemas.

Architecture:
- `apps/backend` - Express API server with Prisma (Postgres). Port 4000.
- `apps/admin` - Next.js admin at port 3001.
- `apps/frontend` - Next.js public frontend at port 3000.
- `packages/shared` - Zod schemas and TS types.

Quick start (Codespaces):

1. Start Postgres:

```bash
docker-compose up -d
```

2. Install dependencies:

```bash
pnpm install
```

3. Generate Prisma client, migrate and seed:

```bash
cd apps/backend
pnpm prisma:generate
pnpm prisma:migrate
pnpm seed
```

4. Start all apps (from repo root):

```bash
pnpm dev
```

Open:
- Frontend: http://localhost:3000
- Admin: http://localhost:3001 (seeded credentials: admin / admin)
- Swagger: (Not implemented in this scaffold yet) http://localhost:4000/docs

Note: The public frontend polls the `/cases` endpoint every 5s to reflect newly added cases promptly.

Tree strategy:
- This project uses a materialized path stored in the `path` column (e.g. `/home/about/team/`). Tradeoffs: easy subtree queries and moving nodes (update prefix), but path strings can be large and require careful updates; for high volume writes a closure table or nested set may be better.
# test