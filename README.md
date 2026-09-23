# Panga

Personal, offline-first, cross-platform project & resource planner.
Full architecture and reasoning: [`docs/IMPLEMENTATION-PLAN.md`](docs/IMPLEMENTATION-PLAN.md)

---

## Current status: **Stage 1 — Scaffold**

What exists right now:
- Vite + React + TypeScript project, builds cleanly
- PWA support wired in (installable, service worker generates on build)
- Dexie (local database) schema for every entity in the plan — no CRUD functions yet, that's Stage 2
- Supabase client initialization file, waiting on your project's config values
- Basic routing: Landing → Dashboard → Project view (placeholder content — no real data yet)
- Design tokens (colors, borders) matching the plan's design language

Nothing is wired to Supabase yet, and there's no real data in the app yet — that starts Stage 2.

---

## Run it locally

```bash
npm install
npm run dev
```
Then open the URL it prints (usually `http://localhost:5173`).

To confirm the production/PWA build works:
```bash
npm run build
npm run preview
```

---

## Supabase project setup (needed before Stage 4, but fine to do now)

1. Go to https://supabase.com/ and click **Start your project** (or **Sign in** if you already have an account).
2. Click **New project**. Name it (e.g. `panga-app`), set a database password, and pick a region close to you. Click **Create new project**.
3. Once the project is ready, go to **Project Settings → API**.
4. Under **Project URL** copy the URL, and under **Project API keys** copy the **`anon`** (public) key.
5. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
6. Paste each value from step 4 into the matching `VITE_SUPABASE_...` line in `.env.local`.
7. In the Supabase dashboard **SQL editor**, create tables for each entity (or run `supabase db push` with a migration). Tables needed: `projects`, `tasks`, `resources`, `docEntries`, `goals`, `issues`, `contacts`, `reminders`.
8. In the Supabase dashboard **Authentication → Providers**, enable **Google** sign-in provider (you'll need a Google OAuth client ID/secret).

You don't need to complete this yet — the app doesn't touch Supabase until Stage 4. It's here so you can do it whenever convenient.

---

## Push to GitHub

```bash
cd panga-app
git init
git add .
git commit -m "Stage 1: scaffold, PWA config, Dexie schema, Supabase config placeholder"
git branch -M main
git remote add origin <your-empty-github-repo-url>
git push -u origin main
```
(`.env.local` is already git-ignored — your Firebase keys won't get committed.)

---

## Project structure

```
src/
├─ data/       # Dexie (local DB) — only files touching IndexedDB. Schema done, CRUD in Stage 2.
├─ sync/       # Supabase client + sync engine — only files touching Supabase. Client init done, sync logic in Stage 4.
├─ search/     # FlexSearch index — built in Stage 7.
├─ ai/         # AI planner request handling — built in Stage 9.
├─ features/   # One folder per feature area (projects, tasks, resources, etc.)
├─ components/ # Shared UI pieces
└─ pages/      # Landing, Dashboard, ProjectView
api/            # Vercel serverless function(s), added in Stage 9 (AI planner)
docs/           # IMPLEMENTATION-PLAN.md — the full architecture doc
```

## Next stage

**Stage 3 onward:** see [`docs/NEXT-IMPLEMENTATION-INSTRUCTIONS.md`](docs/NEXT-IMPLEMENTATION-INSTRUCTIONS.md) — concrete, decided, copy-paste-ready instructions (voice-to-text, Supabase sync, Contacts, AI planner), including the exact commit message and git commands to run after each stage.
