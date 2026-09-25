# Build Phases

## Done

1. **Scaffold** — Vite + React + TypeScript, PWA config, design tokens.
2. **Local data layer** — Dexie schema + full CRUD for every entity (projects, tasks, resources, doc entries, milestones, issues, reminders, calendar events, schedule items, secrets). Every entity supports create, edit/rename, and delete from the UI.
3. **Core UI** — Dashboard (alerts, summary row, project grid), project view with 8 tabs, global search, voice input, AI assistant panel scaffold.
4. **UX/UI pass** — Motion system (machete-cut route transitions, hover tooltips, micro-interactions), dark login screen, sliding drawers, de-emoji pass. See [`ui.md`](./ui.md).
5. **Authentication** — Email + OTP login (EmailJS, free tier, with a no-config dev-mode fallback), session-gated routes, logout. See [`backend-features.md`](./backend-features.md#authentication).
6. **Scheduler** — Manual + AI mode (Gemini API, Google AI Studio free tier). Prompt box slides up. Clarifying follow-up when ambiguous.
7. **Calendar** — Google Calendar OAuth (client-side, Google Identity Services), import events with Meet links, local events. Join Meet button.
8. **Secrets vault** — PBKDF2 + AES-GCM via Web Crypto, passphrase never stored, encrypted at rest in IndexedDB.
9. **Settings** — Gemini API key, Google Calendar OAuth Client ID, Secrets vault management.
10. **Global search extension** — Settings panels and saved files (attachments by filename) as new result types.

## Next

11. **Supabase sync** — Push/pull records with `syncStatus: "pending"`, resolve conflicts, enable Google sign-in as an alternative to OTP.
12. **FlexSearch index** — Swap the current in-memory substring search for FlexSearch (or similar) without changing any calling code — everything already goes through `globalSearch()`.
13. **AI Assistant wiring** — Connect `components/AIAssistant.tsx` to a real model for project-aware Q&A.
14. **Remaining design-doc polish** — Task-card horizontal slide-to-complete gesture, secrets mask/flash-copy, scripts copy success badge, calendar sync background refresh, contacts category tab sliding filter.

## Local Setup

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build + PWA service worker
npm run preview   # serve the production build locally
npm run lint
```

See the README for environment variable setup (EmailJS, Supabase, both optional — the app runs fully offline/local without either).

## Required External Keys (Self-Service)

Both are free and must be created by you (I cannot create Google-side resources):

### 1. Gemini API Key (Scheduler AI)
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
8. Click **Connect** — you'll be prompted to sign in and grant Calendar read access

Without these keys, the Scheduler AI mode and Calendar sync will show configuration prompts but the rest of the app works fully.