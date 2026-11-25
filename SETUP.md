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

## Google sign-in & Drive backup (no Firebase)
Panga signs in with Google Identity Services in the browser and saves `panga-backup.json` in a `panga` folder in your Drive. There is no backend.
1. Google Cloud Console -> APIs & Services -> enable **Google Drive API**.
2. OAuth consent screen: add yourself as a test user (or publish the app).
3. Credentials -> Create credentials -> **OAuth client ID** -> type **Web application**.
4. Under **Authorized JavaScript origins** add `http://localhost:3000` and your deployed origin (e.g. `https://your-app.vercel.app`). No redirect URIs are needed.
5. Put the client ID in `.env` as `VITE_GOOGLE_CLIENT_ID=...` and in Vercel -> Project -> Environment Variables, then redeploy.
Only the `drive.file` scope is used, so Panga can see only files and folders it created itself.

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
