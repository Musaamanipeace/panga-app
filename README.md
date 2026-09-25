# Panga

Personal, offline-first, cross-platform project & resource planner.

Everything runs locally in IndexedDB — no account or backend required to use the app. Optional add-ons: EmailJS for real OTP emails (login works in a "dev mode" fallback without it), Supabase for cross-device sync, Gemini API for AI scheduling, Google Calendar for Meet-enabled event sync.

## Run it locally

```bash
npm install
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`). Log in with any email — since no email service is configured by default, the OTP code is shown right on screen ("dev mode").

To confirm the production/PWA build works:
```bash
npm run build
npm run preview
```

## Features

- **Projects** — Create, rename, archive, delete. Progress derived from task completion.
- **Tasks** — Active/inactive/completed, due dates, estimates, tags.
- **Scheduler** — Manual time-blocking + AI Plan mode (Gemini API, free tier). Natural-language scheduling with clarifying follow-ups.
- **Resources** — 9 fixed categories: Notes (with file attachments), Scripts, Prompts, AI Chat Links, Reports & Memos, Links, Contacts, Secrets (encrypted), Images.
- **Documentation** — Outline/phase sections with Markdown-ready content.
- **Milestones** — Phase checkpoints with blocking task dependencies. Auto-completes when blockers done.
- **Calendar** — Google Calendar read-only sync (OAuth, client-side). Meet links open directly. Local events supported.
- **Issues** — Severity-rated setback log.
- **Reminders** — Timed notifications (local, cross-device via sync).
- **Secrets Vault** — PBKDF2 → AES-GCM encryption, passphrase never stored.
- **Global Search** — `Cmd/Ctrl+K` command palette across projects, tasks, resources, milestones, issues, docs, settings, and file attachments.
- **Voice Input** — Microphone button on every text field (Web Speech API).
- **PWA** — Installable, offline-capable.

## Docs

- [`docs/ui.md`](docs/ui.md) — Pages, motion system, tooltips, edit/delete UI, glyph system
- [`docs/backend-features.md`](docs/backend-features.md) — Auth/OTP, CRUD modules, search, sync, voice, AI, PWA
- [`docs/database.md`](docs/database.md) — Dexie schema, tables, fixed resource categories
- [`docs/build-phases.md`](docs/build-phases.md) — What's done, what's next, local setup, required keys

## Optional: Real OTP Emails (EmailJS)

1. Create a free account at [emailjs.com](https://www.emailjs.com) (200 emails/month free, no backend needed).
2. Add an email service and a template with `to_email` and `passcode` variables.
3. Copy `.env.example` to `.env.local` and fill in `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY` from your EmailJS dashboard.

Without these, login still works — the code is just shown in the UI instead of emailed.

## Optional: Supabase Sync

1. Go to [supabase.com](https://supabase.com/) → **New project**.
2. Once ready, go to **Project Settings → API** and copy the **Project URL** and **anon public key**.
3. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.

Sync logic itself is a future build phase (see `docs/build-phases.md`) — the client is initialized but nothing pushes/pulls data yet.

## Required: External API Keys (Self-Service)

### 1. Gemini API Key (Scheduler AI Plan mode)
1. Go to https://aistudio.google.com/apikey
2. Create an API key (free tier includes Flash models)
3. Paste it into **Settings → Gemini API Key**

### 2. Google OAuth Client ID (Calendar Sync)
1. Go to https://console.cloud.google.com/apis/credentials
2. Create a new project (or select existing)
3. Enable **Google Calendar API** (APIs & Services → Library → Google Calendar API → Enable)
4. Create **OAuth 2.0 Client ID** → Application type: **Web application**
5. Authorized JavaScript origins: add your dev origin (e.g. `http://localhost:5173`) and your production origin
6. Copy the **Client ID**
7. Paste it into **Settings → Google Calendar → Client ID**
8. Click **Connect** — sign in and grant Calendar read access

Without these, Scheduler AI and Calendar sync show configuration prompts but the rest of the app works fully.

## Push to GitHub

```bash
git init
git add .
git commit -m "Panga: local-first planner with OTP auth, scheduler, calendar, secrets, full CRUD"
git branch -M main
git remote add origin <your-empty-github-repo-url>
git push -u origin main
```
(`.env.local` is already git-ignored — your keys won't get committed.)

## Project Structure

```
src/
├─ auth/       # OTP generation/verification + session storage
├─ data/       # Dexie (local DB) — only files touching IndexedDB
├─ sync/       # Supabase client + Google Calendar OAuth
├─ search/     # Global search across all entities + settings + files
├─ components/ # Shared UI: AppShell, GlobalSearch, AIAssistant, MacheteTransition, SecretsVault...
└─ pages/      # Landing, Dashboard, ProjectView, Settings
docs/          # ui.md, backend-features.md, database.md, build-phases.md
```