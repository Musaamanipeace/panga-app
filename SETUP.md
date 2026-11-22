# Panga — setup after this package

## 1. Install & run

```bash
cp .env.example .env   # fill values below
npm install
npm run dev
```

## 2. Environment variables (only what you need)

| Variable | Required? | Purpose |
|----------|-----------|---------|
| `GEMINI_API_KEY` | Optional | Server proxy only; prefer keys in **Settings → AI** |

Supabase URL/key and **all AI keys** are entered in the app Settings UI (stored in IndexedDB). No environment variable can supply a Supabase project.

## 3. Supabase (bring your own)

1. Create a project at https://supabase.com  
2. SQL Editor → paste and run `supabase/schema.sql` then `supabase/panga_sync.sql`
   - `schema.sql` creates `task_lists`, `tasks`, `link_folders`, `links`, `notes`, `reminders` (+ legacy tables) with `user_id` and RLS policies.
   - `panga_sync.sql` creates `public.panga_records` (kind check extended to task/taskList/thought/note/link/linkFolder/reminder) with RLS.
3. Authentication → Providers → Email: turn **Confirm email OFF** (usernames become `name@panga.invalid`, so no email is sent).
4. Project Settings → API → copy URL + anon key into **Settings → Bring your own Supabase project**. This is required before creating an account or syncing; there is no default instance.

Local Dexie remains primary; Supabase is the multi-device sync + auth backend.

## 4. AI (recommended)

1. Open **Settings → AI assistant**  
2. Prefer **OpenRouter** (one key, free + paid models, live list)  
3. Paste key → models load from the provider (no hard-coded free model names)  
4. Optional: Gemini, OpenAI, Claude, Grok, Groq  

## Removed in this package

- Workspaces / projects from the primary UX (legacy tables kept readable for one release)
- Puter (SDK, auth, sync, UI)
- Email backup (Resend/SendGrid)

## Kept

- Offline-first Dexie
- Local JSON snapshot download/upload
- Supabase Auth + sync (task lists, nested tasks, link folders, links, notes, reminders)
