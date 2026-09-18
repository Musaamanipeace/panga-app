# Panga

Personal, offline-first, cross-platform project & resource planner.
Full architecture and reasoning: [`docs/IMPLEMENTATION-PLAN.md`](docs/IMPLEMENTATION-PLAN.md)

---

## Current status: **Stage 1 — Scaffold**

What exists right now:
- Vite + React + TypeScript project, builds cleanly
- PWA support wired in (installable, service worker generates on build)
- Dexie (local database) schema for every entity in the plan — no CRUD functions yet, that's Stage 2
- Firebase SDK initialization file, waiting on your project's config values
- Basic routing: Landing → Dashboard → Project view (placeholder content — no real data yet)
- Design tokens (colors, borders) matching the plan's design language

Nothing is wired to Firebase yet, and there's no real data in the app yet — that starts Stage 2.

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

## Firebase project setup (needed before Stage 6, but fine to do now)

1. Go to https://console.firebase.google.com/ and click **Add project**.
2. Name it (e.g. `panga-app`), you can disable Google Analytics for it — not needed.
3. Once created, click the **web icon (`</>`)** on the project overview page to register a web app. Name it anything (e.g. `panga-web`).
4. Firebase will show you a config object like:
   ```js
   const firebaseConfig = {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   };
   ```
5. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
6. Paste each value from step 4 into the matching `VITE_FIREBASE_...` line in `.env.local`.
7. In the Firebase console sidebar: **Build → Firestore Database → Create database** → start in **production mode** → pick any region close to you.
8. In the Firebase console sidebar: **Build → Authentication → Get started** → enable **Google** sign-in provider (simplest option for a single-user app).
9. **Do not upgrade to the Blaze plan.** Everything in this project is designed to stay on the free Spark plan (see the plan doc, §2).

You don't need to complete this yet — the app doesn't touch Firebase until Stage 6. It's here so you can do it whenever convenient.

---

## Push to GitHub

```bash
cd panga-app
git init
git add .
git commit -m "Stage 1: scaffold, PWA config, Dexie schema, Firebase config placeholder"
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
├─ sync/       # Firestore + sync engine — only files touching Firestore. Firebase init done, sync logic in Stage 6.
├─ search/     # FlexSearch index — built in Stage 7.
├─ ai/         # AI planner request handling — built in Stage 9.
├─ features/   # One folder per feature area (projects, tasks, resources, etc.)
├─ components/ # Shared UI pieces
└─ pages/      # Landing, Dashboard, ProjectView
api/            # Vercel serverless function(s), added in Stage 9 (AI planner)
docs/           # IMPLEMENTATION-PLAN.md — the full architecture doc
```

## Next stage

**Stage 2: Local data layer** — Dexie CRUD functions for Projects and Tasks, wired into the Dashboard and Project view so the app is genuinely usable offline, with no cloud involved yet.
