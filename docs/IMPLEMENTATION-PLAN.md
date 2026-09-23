# Panga — Developer Implementation Plan

*A personal, offline-first, cross-platform project & resource planner. No monetization, no investors — built for one user, architected like a real product.*

---

## 1. Guiding Principles (read this before anything else)

- **Local-first.** Every write happens to the device first. The cloud is a sync target, never a dependency for viewing or editing.
- **Modular, not monolithic.** Data layer, sync engine, search index, and AI layer are separate modules with clean boundaries. Any one of them should be replaceable without touching the others.
- **Free forever, for one user.** Every service chosen sits comfortably inside a free tier with no card requirement (Supabase free tier is used for this reason).
- **Fewest clicks to anything.** Global search + consistent naming/positioning across every screen is a design constraint, not a feature — it shapes the schema and the navigation both.

---

## 2. Final Stack

| Layer | Tool | Cost |
|---|---|---|
| Frontend | React + Vite | Free |
| PWA/offline shell | vite-plugin-pwa (Workbox) | Free |
| Local database | Dexie.js (IndexedDB wrapper) | Free |
| Cloud database | Supabase (free tier) | Free |
| Auth | Supabase Auth | Free |
| Hosting | Supabase Hosting or Vercel | Free |
| Search | FlexSearch (client-side, indexes local Dexie data) | Free |
| AI planner | Gemini API (free tier), called from a Vercel serverless function | Free |
| Source control | GitHub | Free |

**Why not Cloud Functions:** not needed — Supabase handles server-side logic through Postgres rules, functions, and the built-in realtime listener. Any server-side logic that can't run in the database (the AI planner call) goes through a Vercel function instead.

---

## 3. Information Architecture (your spec, formalized)

```
Home
 └─ Projects (grid/list of project cards)
     └─ Project [name]
         ├─ Documentation      (outline, phased plans)
         ├─ Tasks               (active / inactive / completed)
         ├─ Resources
         │    ├─ Links
         │    ├─ Scripts
         │    ├─ Locations (text or pinned map links)
         │    ├─ Names of things
         │    ├─ Reminders
         │    ├─ Contact lists
         │    └─ Task schedule
         ├─ Reminders & Notifications
         ├─ Progress bar(s)
         ├─ Goals
         └─ Issues (setbacks)

Global (reachable from anywhere): 
 └─ Search (Cmd/Ctrl+K)
 └─ Contacts (cross-project address book)
 └─ AI Planner (dial in hours → get a schedule)
 └─ Settings (sync mode, tags manager, theme)
```

Note on **Resources**: everything under it — links, scripts, locations, names of things, reminders, contacts, schedule — is really **one entity type ("Resource") with a `category` field**. This keeps the schema, the search index, and the UI component all singular, while still letting the interface *present* each category differently (a "Location" resource shows a map-pin icon and opens a maps link; a "Script" resource shows a code icon and opens a code viewer, etc.).

---

## 4. Data Schema

### 4.1 Core entity: `Project`
```
Project {
  id: string (uuid)
  name: string
  description: string
  status: "active" | "archived"
  createdAt, updatedAt: timestamp
  progress: number (0-100, derived from tasks — see §7)
}
```

### 4.2 `Task`
```
Task {
  id: string
  projectId: string (FK)
  title: string
  notes: string
  status: "active" | "inactive" | "completed"
  dueDate: timestamp | null
  estimatedMinutes: number | null   // used by AI planner
  tags: string[]
  createdAt, updatedAt: timestamp
}
```

### 4.3 `Resource` (the unified entity described above)
```
Resource {
  id: string
  projectId: string (FK)
  category: "link" | "script" | "location" | "name" | "reminder" | "contact" | "schedule" | "bookmark_group" | "file"
  title: string
  value: string        // URL, script text, coordinates/address, plain text, etc. — meaning depends on category
  notes: string
  tags: string[]
  createdAt, updatedAt: timestamp
}
```
A **bookmark group** (your "group of bookmarked tabs") is stored as a Resource with `category: "bookmark_group"` and `value` = a JSON array of `{title, url}` pairs — opening it loops through and opens each tab.

### 4.4 `Documentation` (per project)
```
DocEntry {
  id: string
  projectId: string (FK)
  type: "outline" | "phase"
  title: string
  content: string (markdown)
  order: number
  createdAt, updatedAt: timestamp
}
```

### 4.5 `Goal`
```
Goal {
  id, projectId: string
  title: string
  targetDate: timestamp | null
  status: "in_progress" | "achieved" | "missed"
}
```

### 4.6 `Issue` (setback log)
```
Issue {
  id, projectId: string
  title: string
  description: string
  severity: "low" | "medium" | "high"
  status: "open" | "resolved"
  createdAt: timestamp
}
```

### 4.7 `Contact` (global, not project-bound — but linkable)
```
Contact {
  id: string
  name: string
  email, phone, discord: string (optional)
  linkedProjectIds: string[]
}
```

### 4.8 `Reminder` (cross-cutting — can belong to a Task, Goal, or stand alone)
```
Reminder {
  id: string
  projectId: string | null
  linkedEntityType: "task" | "goal" | null
  linkedEntityId: string | null
  message: string
  triggerAt: timestamp
  status: "pending" | "fired" | "dismissed"
}
```

### 4.9 `Tag` (implicit — just strings, deduplicated at index time for the search/tag-filter UI)

This schema is identical in shape in both **Dexie (local)** and **Supabase (cloud)** — same field names, same types — which is what makes the sync engine simple: it's moving matching records, not transforming shapes.

---

## 5. Offline-First & Sync Architecture

**Rule: the UI never talks to Firestore directly.** It only ever talks to Dexie. A separate sync module talks to Firestore in the background.

```
User action → write to Dexie (instant, always works)
                     │
                     ▼
            Sync Engine (separate module)
                     │
        ┌────────────┴────────────┐
        ▼                          ▼
  Online: push to Supabase   Offline: queue the change
        │                          │
        └──────── reconnect ───────┘
                     │
                     ▼
         Supabase change listener
        pulls remote changes back into Dexie
```

- **Conflict handling:** last-write-wins by `updatedAt` timestamp, per-record. Simple, and appropriate for a single-user app (you're never really conflicting with yourself, just with a stale cache from another device).
- **Automatic vs manual sync (your requirement):** a `syncMode` setting (`"auto" | "manual"`) lives in local settings. In auto mode, the sync engine runs continuously in the background. In manual mode, changes queue locally and only push when you tap "Sync now." Default: automatic.
- **The one-time nudge:** first time the app is used for 7 days straight in automatic mode, show a single dismissible tooltip: *"Syncing automatically. You can switch to manual in Settings anytime."* Never shown again after dismissal.
- **Sync status indicator:** small, unobtrusive dot/icon in the header — grey (offline, queued changes), green (synced), spinning (syncing now). No banners, no interruptions.

---

## 6. Global Search

- **Index:** FlexSearch, built and held in memory client-side, indexing `title`, `notes/content`, `value` (for resources), and `tags` across Projects, Tasks, Resources, Docs, Goals, Issues, and Contacts.
- **Rebuild trigger:** on app load (from Dexie) and incrementally on every local write — never requires network.
- **Access:** a persistent, always-visible search affordance in the top nav (not hidden in a menu) **plus** a `Cmd/Ctrl+K` keyboard shortcut that opens a command-palette-style overlay from anywhere in the app.
- **Result presentation:** grouped by entity type (Projects / Tasks / Resources / Docs / Goals / Contacts), each result showing its parent project as a subtitle so you always have context, and a category icon for Resources.
- **Naming-convention discipline:** because search relevance depends on it, every entity's `title` field is the single canonical name shown everywhere in the UI — no situation where a project is called one thing in the dashboard and another in search results.

---

## 7. Progress Bars

Per project, `progress` is **derived, not manually set**:
```
progress = (completed tasks / total non-archived tasks) * 100
```
Recomputed locally on every task status change — cheap, and always accurate without you maintaining it by hand.

---

## 8. AI Planner

**Input (from you):** available hours for the day (e.g. "9am–1pm, 2pm–5pm").
**Input (from data):** all `active` tasks across all projects, each with `estimatedMinutes`, `dueDate`, and `projectId`.
**Process:**
1. Client bundles the task list + hours into a request.
2. Sent to a small Vercel serverless function (keeps your Gemini API key off the client).
3. Function calls Gemini with a structured prompt: *"Given these tasks (with estimates and due dates) and these available time blocks, produce an ordered schedule that prioritizes near-due tasks and fits within the blocks."*
4. Gemini returns structured JSON (task order + assigned time slot).
5. Client renders it as your working schedule for the day; you work through it top to bottom until done.
**Fallback if a task has no `estimatedMinutes`:** planner defaults to a configurable value (e.g. 30 min) so the feature never blocks on missing data.

---

## 9. Notifications & Reminders

Two tiers, both free, both work offline-first with cloud backup:
- **Local notifications** (via the Notifications API / service worker) for anything already known on-device — due tasks, reminders whose `triggerAt` has passed. Works even offline, fires the moment the device's clock hits the time, as long as the PWA/browser is allowed background notification permission.
- **Cross-device awareness:** because `Reminder` records sync through Supabase like everything else, a reminder created on your phone shows up (and will fire) on your PC too, next time each device syncs.

*(No AI email-reading — removed from scope per your decision.)*

---

## 10. Project Folder Structure (the "modular" part)

```
panga-app/
├─ src/
│  ├─ data/              # Dexie schema + local CRUD functions — the ONLY layer touching IndexedDB
│  ├─ sync/               # Sync engine — the ONLY layer touching Supabase directly
│  ├─ search/             # FlexSearch index build/query — the ONLY layer touching the search lib
│  ├─ ai/                 # Planner request/response handling — the ONLY layer touching the Vercel function
│  ├─ features/
│  │   ├─ projects/
│  │   ├─ tasks/
│  │   ├─ resources/
│  │   ├─ documentation/
│  │   ├─ goals/
│  │   ├─ issues/
│  │   ├─ contacts/
│  │   └─ reminders/
│  ├─ components/         # shared UI (buttons, cards, tag pills, search overlay)
│  ├─ pages/               # Landing, Dashboard, ProjectView, Settings
│  └─ App.tsx
├─ api/                    # Vercel serverless functions (AI planner endpoint)
├─ public/
│  └─ manifest.json        # PWA manifest
└─ vite.config.ts
```
Every feature folder only imports from `data/`, `sync/`, and `search/` through their exported functions — never reaching into Dexie or Supabase directly. The modular boundary is what makes it easy to swap the cloud backend later if needed.

---

## 11. Design Language (per your brief)

- **Minimalist but well-bordered:** generous whitespace, but every card/section has a visible 1px border (not just shadow) so boundaries between projects/resources/tasks are always unambiguous at a glance.
- **Visible, friendly color system:** one accent color per entity type (e.g. Tasks = blue accent, Resources = green accent, Goals = amber, Issues = red) used consistently as a small left-border stripe or icon tint — this alone makes scanning a mixed search-result list fast.
- **Consistent positioning:** search bar always top-center or top-right, same position on every screen; the "back to project" and "back to dashboard" breadcrumb always top-left; primary "add new" action always bottom-right (thumb-reachable on mobile too).
- **Category icons:** each Resource category gets one fixed icon used everywhere (link, script, pin, tag, bell, address book, calendar) — reinforces naming-convention consistency you asked for.

---

## 12. Build Order (how we'll actually do this, step by step)

We'll build in this sequence, and I'll hand you a zip of the working repo after each stage:

1. **Scaffold** — Vite + React + PWA plugin, basic routing, Supabase project setup instructions (with exact copy-paste commands).
2. **Local data layer** — Dexie schema + CRUD for Projects and Tasks only. App fully usable offline at this point, no cloud yet.
3. **Core UI** — Dashboard, Project view, Task list, with the design language above.
4. **Resources module** — unified Resource entity + category-specific rendering.
5. **Documentation, Goals, Issues, Progress bars.**
6. **Supabase Auth + sync engine** — this is where offline-first cloud sync comes alive.
7. **Global search** — FlexSearch index + Cmd/K overlay.
8. **Contacts + Reminders/Notifications.**
9. **AI Planner** — Vercel function + Gemini integration.
10. **PWA polish + hosting deploy** — installable, offline-tested, live URL.

Each stage is a complete, working increment — never a half-broken app in between.

---

## 13. Open Items for Later (not blocking, just noted)

- Exact Gemini free-tier request limits should be re-checked at implementation time (rate limits shift).
- Whether "Locations" resources should render an embedded map preview or stay link-only — cosmetic decision, can defer to stage 4.
- Tag manager UI (rename/merge tags globally) — nice-to-have, not core.

---

*Ready to begin Stage 1 whenever you give the word.*
