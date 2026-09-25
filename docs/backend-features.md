# Backend & Features

Panga is **offline-first**: all reads/writes go straight to IndexedDB (via Dexie), so the app works with zero network. Supabase is an optional sync layer on top, not a requirement.

## Authentication

Email + OTP, no password, no third-party auth provider required.

1. User enters an email on the landing page.
2. `src/auth/otp.ts` generates a 6-digit code, stores it (with a 10-minute expiry) in `sessionStorage`, and emails it via [EmailJS](https://www.emailjs.com) — a free-tier (200 emails/month), client-side email API that needs no backend server.
3. If EmailJS isn't configured yet (no `VITE_EMAILJS_*` env vars), the call falls back to **dev mode**: the code is returned to the UI and shown on-screen instead of emailed, so login is fully testable out of the box.
4. On successful verification, `src/auth/session.ts` stores the email in `localStorage` and the app treats the user as logged in.
5. `/dashboard`, `/project/:id`, and `/settings` are guarded in `App.tsx` (`RequireAuth`) and redirect to `/` if there's no session. `Logout` clears the session.

See the README for how to fill in the three `VITE_EMAILJS_*` values.

## Core Modules

Each entity has its own module under `src/data/` exposing `list…`, `create…`, `update…`, and `delete…` functions — the UI never touches Dexie directly. All of them support full CRUD (create, rename/edit, delete) from the UI.

- **Projects** (`data/projects.ts`) — name/description, status (active/archived), derived progress (`getProjectTaskStats`: percent complete + pending count, used for the milestone hover hint).
- **Tasks** (`data/tasks.ts`) — status cycles active → completed → inactive.
- **Resources** (`data/resources.ts`) — typed by fixed category (notes, scripts, prompts, ai_chat_links, reports_memos, links, contacts, secrets, images). Each category has its own set of typed fields.
- **Documentation** (`data/docs.ts`) — outline/phase sections with a title and free-text body.
- **Milestones** (`data/milestones.ts`) — phase checkpoints with a target date and an optional list of "blocking" task ids. Hovering a milestone node shows which of its blocking tasks are still pending. A milestone auto-flips to `achieved` once every blocking task it's linked to is completed (`reconcileMilestoneStatuses`, called whenever a task's status changes), and back to `in_progress` if one gets reopened. Milestones with no linked tasks are purely manual (in_progress/achieved/missed).
- **Issues** (`data/issues.ts`) — severity (low/medium/high) + open/resolved.
- **Reminders** (`data/reminders.ts`) — message + trigger time, editable in place.
- **Scheduler** (`data/scheduler.ts`) — schedule items with scheduledAt, duration, optional sourceTaskId. Two modes:
  - **Manual**: add a schedule entry with date/time directly.
  - **AI**: free-text prompt → calls Gemini API (Google AI Studio, free tier for Flash models) → returns structured schedule data written straight into the scheduler. Model is instructed to ask a clarifying follow-up when the request is ambiguous.
- **Calendar** (`data/calendar.ts`) — local events + Google Calendar import. Events with a `hangoutLink` render a "Join Meet" button that opens the Meet link directly.
- **Secrets** (`data/secrets.ts`) — encrypted vault using PBKDF2 (200,000 iterations, SHA-256) → AES-GCM via Web Crypto API. Passphrase never stored — only a verification hash. Secrets stored as `resources` with `category: "secrets"`.

## Global Search

`src/search/search.ts` does a simple in-memory substring match across projects, tasks, resources, milestones, issues, doc entries, **settings** (API keys, calendar connection, secrets vault), and **saved files** (uploaded note/image attachments by filename). Swappable later for an indexed engine (e.g. FlexSearch) without touching any UI code, since components only ever call `globalSearch()`.

Access: persistent search affordance in the top nav **plus** `Cmd/Ctrl+K` keyboard shortcut that opens a command-palette-style overlay from anywhere in the app.

Results grouped by entity type, each showing its parent project as a subtitle for context.

## Voice Input

`components/MicButton.tsx` wraps the browser's `SpeechRecognition` API so any text field can be filled by voice.

## AI Assistant

`components/AIAssistant.tsx` is a floating panel scaffold for a future prompt-driven assistant (smart scheduling, clarifying questions, etc. — see the UI doc's motion table for the planned interaction). Not yet wired to a model.

## Sync (optional, not required to run the app)

`src/sync/supabase.ts` initializes a Supabase client from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` if you want to add cross-device sync later. The app runs fully offline without it — every local record already carries a `syncStatus: "pending" | "synced"` field ready for a future sync engine to consume.

## PWA

Vite's PWA plugin generates a service worker + manifest on build, so the app is installable and works offline once cached.