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
- add wetter API that add the current weather details for the journal entry
- add change of name entries (people, companies,...)
- FIX: delete projects didn't work
- show Markdown possibility in jounal entries