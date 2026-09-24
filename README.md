# Panga

Personal, offline-first, cross-platform project & resource planner.

Everything runs locally in IndexedDB — no account or backend required to
use the app. Optional add-ons: EmailJS for real OTP emails (login works in
a "dev mode" fallback without it) and Supabase for cross-device sync.

## Run it locally

```bash
npm install
npm run dev
```
Open the URL it prints (usually `http://localhost:5173`). Log in with any
email — since no email service is configured by default, the OTP code is
shown right on screen ("dev mode").

To confirm the production/PWA build works:
```bash
npm run build
npm run preview
```

## Docs

- [`docs/ui.md`](docs/ui.md) — pages, motion system, tooltips, edit/delete UI
- [`docs/backend-features.md`](docs/backend-features.md) — auth/OTP, CRUD modules, search, sync
- [`docs/database.md`](docs/database.md) — Dexie schema, tables, resource categories
- [`docs/build-phases.md`](docs/build-phases.md) — what's done, what's next

## Optional: real OTP emails (EmailJS)

1. Create a free account at [emailjs.com](https://www.emailjs.com) (200
   emails/month free, no backend needed).
2. Add an email service and a template with `to_email` and `passcode`
   variables.
3. Copy `.env.example` to `.env.local` and fill in
   `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`,
   `VITE_EMAILJS_PUBLIC_KEY` from your EmailJS dashboard.

Without these, login still works — the code is just shown in the UI
instead of emailed.

## Optional: Supabase sync

1. Go to [supabase.com](https://supabase.com/) → **New project**.
2. Once ready, go to **Project Settings → API** and copy the **Project
   URL** and **anon public key**.
3. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` /
   `VITE_SUPABASE_ANON_KEY`.

Sync logic itself is a future build phase (see `docs/build-phases.md`) —
the client is initialized but nothing pushes/pulls data yet.

## Push to GitHub

```bash
git init
git add .
git commit -m "Panga: local-first planner with OTP auth and full CRUD"
git branch -M main
git remote add origin <your-empty-github-repo-url>
git push -u origin main
```
(`.env.local` is already git-ignored — your keys won't get committed.)

## Project structure

```
src/
├─ auth/       # OTP generation/verification + session storage
├─ data/       # Dexie (local DB) — only files touching IndexedDB
├─ sync/       # Supabase client (optional, not yet wired to sync logic)
├─ search/     # Global search across all entities
├─ components/ # Shared UI: AppShell, GlobalSearch, AIAssistant, MacheteTransition...
└─ pages/      # Landing, Dashboard, ProjectView
docs/          # ui.md, backend-features.md, database.md, build-phases.md
```
