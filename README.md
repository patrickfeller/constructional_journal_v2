Construction Journal — Next.js 14 + Prisma + NextAuth

## Getting Started

1) Install deps
```bash
pnpm install
```

2) Setup environment
```bash
cp .env.example .env
```

3) Prisma
```bash
pnpm prisma:migrate
pnpm prisma:seed
```

4) Start
```bash
pnpm dev
```

## Scripts
- dev: start dev server
- build/start: production build & run
- prisma:migrate: apply migrations
- prisma:generate: generate client
- prisma:seed: seed demo data

## ToDos:
- share project with other user to be able to add entries in a shared project of multible users
- FIX: Dark and light mode