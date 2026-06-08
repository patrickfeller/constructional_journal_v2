# CLAUDE.md — Constructional Journal V2

## Project Overview

Full-stack construction project management app. Users log journal entries, track time and expenses, manage companies/people, and collaborate on projects. Built with Next.js 15 App Router, Prisma ORM, PostgreSQL (Neon), NextAuth, and Vercel Blob.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript 5 (strict) |
| Database | PostgreSQL via Neon |
| ORM | Prisma 6 |
| Auth | NextAuth 4 (credentials + Prisma adapter) |
| Styling | Tailwind CSS 4 + Radix UI |
| File Storage | Vercel Blob |
| Package Manager | pnpm |

## Commands

```bash
pnpm dev              # Start dev server (Turbopack)
pnpm build            # Production build
pnpm lint             # ESLint check
pnpm prisma:migrate   # Apply DB migrations
pnpm prisma:generate  # Regenerate Prisma client
pnpm prisma:seed      # Seed demo data (demo@example.com / demo1234)
```

## Project Structure

```
app/
  (app)/          # Protected routes — requires session
    dashboard/
    projects/[id]/
    journal/
    time/
    expenses/
    companies/
    people/
    personal-lists/
    settings/
  (auth)/         # Public routes
    auth/
    register/
  (components)/   # Shared UI components
    ui/           # Base UI primitives (Button, Card, Dialog…)
  api/            # Route handlers
lib/
  client/         # Client-only utilities (image compression)
  hooks/          # React hooks
prisma/
  schema.prisma
  seed.ts
scripts/          # One-off utility scripts
```

## Path Aliases

```ts
"@/lib/*"        → lib/*
"@/components/*" → app/(components)/*
```

## Architecture Patterns

### Server Actions
- Place mutations in `actions.ts` co-located with the route (`app/(app)/projects/actions.ts`)
- Always mark with `"use server"`
- Validate input with Zod before any DB call
- Check session at the top of every action
- Call `revalidatePath()` after mutations

```ts
"use server"
export async function createProject(data: unknown) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")
  const parsed = ProjectSchema.parse(data)
  // ... db operation ...
  revalidatePath("/projects")
}
```

### Data Access & Permissions
- Use `getUserAccessibleProjects(userId)` to get projects the user owns or is a member of
- Always filter by `userId` OR `projectId IN [accessible]` — never expose data across users
- Use `checkProjectPermissions(projectId, userId)` before any project mutation
- Roles: `OWNER > EDITOR > VIEWER`

### API Routes
- Prefer Server Actions for mutations; use API routes only for third-party webhooks or external consumption (e.g., `/api/upload`, `/api/weather`)
- Always validate session in route handlers

### Components
- Page logic stays in `page.tsx` (server component)
- Forms and interactive parts are separate client components
- Use `"use client"` only where necessary

## Database

### Schema Highlights
- `User` → owns `Project`, `PersonalCompany`, `PersonalPerson`
- `Project` → has `JournalEntry`, `TimeEntry`, `Expense`, `Photo`, `ProjectMember`
- `ProjectMember` → links users to projects with a role (OWNER/EDITOR/VIEWER)
- `Photo` — stored via Vercel Blob; always use `photo.url` (validated), never raw paths

### Migrations
- Never edit migration files manually
- Run `pnpm prisma:migrate` to create + apply new migrations
- After schema changes always run `pnpm prisma:generate`

## Image Uploads

1. Client compresses images with `browser-image-compression` before upload
2. Files under 120 KB skip compression
3. Upload via `/api/upload` → stored in Vercel Blob
4. Store blob URL in `Photo.url`
5. Validate URL before displaying (see `lib/client/imageUtils.ts` pattern)

Environment vars controlling compression:
```
RESIZE_MAX_DIMENSION=1600
RESIZE_TARGET_BYTES=650000
RESIZE_QUALITY=75
```

## Authentication

- NextAuth credentials provider (email + bcrypt password)
- Session checked via `getServerSession(authOptions)` — always import `authOptions` from `lib/auth`
- `middleware.ts` protects all `/(app)` routes automatically
- Demo credentials: `demo@example.com` / `demo1234`

## Environment Variables

```
DATABASE_URL                  # Pooled Neon connection
DATABASE_URL_UNPOOLED         # Direct Neon connection (migrations)
NEXTAUTH_URL
NEXTAUTH_SECRET
BLOB_READ_WRITE_TOKEN         # Vercel Blob
RESIZE_MAX_DIMENSION
RESIZE_TARGET_BYTES
RESIZE_QUALITY
```

Copy `.env.example` → `.env` to get started.

## Styling Guidelines

- Use Tailwind utility classes directly — avoid custom CSS unless necessary
- Dark mode is supported via `next-themes`; use `dark:` variants
- Use `cn()` helper (from `lib/utils`) to merge class names conditionally
- Base UI components live in `app/(components)/ui` — extend them, don't duplicate

## Do's and Don'ts

**Do:**
- Validate all inputs with Zod in server actions and API routes
- Revalidate relevant paths after every mutation
- Check permissions before any write operation
- Compress images client-side before uploading
- Use `pnpm` (not npm/yarn)

**Don't:**
- Access DB directly from client components — use server actions or API routes
- Skip session checks in server actions
- Commit `.env` files
- Edit Prisma migration files manually
- Use `any` — keep TypeScript strict
