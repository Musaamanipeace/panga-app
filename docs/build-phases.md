# Build Phases

## Done

1. **Scaffold** — Vite + React + TypeScript, PWA config, design tokens.
2. **Local data layer** — Dexie schema + full CRUD for every entity
   (projects, tasks, resources, doc entries, milestones, issues, reminders,
   resource categories). Every entity supports create, edit/rename, and
   delete from the UI.
3. **Core UI** — Dashboard, project view with tabs, global search, voice
   input, AI assistant panel scaffold.
4. **UX/UI pass** — motion system (machete-cut route transitions, hover
   tooltips, micro-interactions), dark login screen, sliding drawers. See
   [`ui.md`](./ui.md).
5. **Authentication** — email + OTP login (EmailJS, free tier, with a
   no-config dev-mode fallback), session-gated routes, logout. See
   [`backend-features.md`](./backend-features.md#authentication).

## Next

6. **Supabase sync** — push/pull records with `syncStatus: "pending"`,
   resolve conflicts, enable Google sign-in as an alternative to OTP.
7. **Contacts as first-class UI** — the `contacts` table exists; needs its
   own tab/module instead of being reachable only through the "Contact"
   resource category.
8. **Indexed search** — swap the current in-memory substring search for
   FlexSearch (or similar) without changing any calling code — everything
   already goes through `globalSearch()`.
9. **AI planner** — wire `components/AIAssistant.tsx` to a real model:
   prompt-driven task scheduling, clarifying questions when input is
   ambiguous, and the AI-Chat-Link resource sub-type's slide-out preview.
10. **Remaining design-doc polish** — task-card horizontal slide-to-complete
    gesture, secrets mask/flash-copy, scripts copy success badge, calendar
    sync module, contacts category tab sliding filter.

## Local setup

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build + PWA service worker
npm run preview   # serve the production build locally
npm run lint
```

See the README for environment variable setup (Supabase + EmailJS, both
optional — the app runs fully offline/local without either).
