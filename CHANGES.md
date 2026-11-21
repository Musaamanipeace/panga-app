# Panga pivot: what changed

Panga is now a quick capture tool built around **task lists (nested checkable items), link folders, notes, reminders, train of thought and clipboard**, with **no workspaces**.

## New home (`/home`)
| Area | What it does | Files |
|---|---|---|
| Home tabs | Task lists, Links, Notes, Reminders, Clipboard. Thought train still available from any page via the header "Thoughts" button. | `pages/PangaHome.tsx` |
| Task lists | Top-level containers (title, description, order). Create, rename, delete, reorder. | `data/taskLists.ts`, `components/home/TaskListsHome.tsx` |
| Nested tasks | Checkable items belonging to a list or a parent task (subtasks, unlimited depth, UI soft-limited to 3 levels). Toggle complete/incomplete, optional due date, notes, tags. Expand/collapse children, inline edit, add subtask. | `data/tasks.ts`, `components/home/TaskListsHome.tsx` |
| Links + folders | Dedicated links (URL, title, notes, tags) in named link folders. Unsorted folder. Create/rename/delete/reorder folders and links; open, copy, edit, move, search. | `data/linkFolders.ts`, `data/links.ts`, `components/home/HomeLinksTab.tsx` |
| Notes | Dedicated notes (title, body, tags), native spellcheck, voice typing, read aloud, copy, edit, delete, search. | `data/notes.ts`, `components/home/NotesPanel.tsx` |
| Reminders | Message + trigger time, optional link to a task or note, selectable tone (default/chime/soft/urgent). System notification + tone when due; notification permission prompt. | `data/reminders.ts`, `components/home/HomeRemindersTab.tsx` |
| Thought train | Capture fleeting notes; promote a thought → task (with list picker) or → note. | `components/home/ThoughtStream.tsx` |
| Clipboard | Paste history; "Save as note" / "Save as task" on each clip. | `components/home/ClipboardPanel.tsx` |
| Account + sync | Username + password via Supabase, sync of task lists, tasks, link folders, links, notes, reminders (last-write-wins, deletes tracked via tombstones). Guest/local-only still allowed. | `sync/supabaseSync.ts`, `sync/tombstones.ts`, `data/reminders.ts`, `components/AccountPanel.tsx` |

## Removed from primary UX
- **Workspaces** (`/workspaces`, `/dashboard`, `/project/:id`) retired. Header "Workspaces" link removed. Projects/milestones/issues/resources tables kept readable for one release but no longer written by new screens.
- Legacy task fields (`projectId`, `executor`, `scheduledAt`, `estimatedMinutes`, `horizon`) retained as optional legacy columns but no longer written by primary UX.

## Data model changes (Dexie v11)
- New tables: `taskLists`, `linkFolders`, `links`, `notes`.
- `tasks`: `listId`, `parentId`, `completed` (was `projectId` + `status`-only).
- `reminders`: added `toneId` + `linkedEntityType`/`linkedEntityId` (task\|note); `projectId` dropped.
- Migration: on first open after v11, creates an "Inbox" list, maps existing project tasks to lists (or Inbox), migrates link/note resources to dedicated tables. Legacy rows left readable for one version.
- Sync: `panga_records` kind check extended to `task\|taskList\|thought\|note\|link\|linkFolder\|reminder`.

## Set up Supabase sync (free tier)
1. Create a Supabase project. SQL editor: run `supabase/schema.sql`, then `supabase/panga_sync.sql`.
2. Authentication → Providers → Email: turn **Confirm email OFF** (usernames become `name@panga.invalid`, no email is sent).
3. Put the project URL and anon key in the app (Settings → Supabase) or `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
4. Settings → Account & sync: Create account, then Sign in on other devices.
5. Optional: add repo secrets `SUPABASE_URL` and `SUPABASE_ANON_KEY` so `.github/workflows/supabase-keepalive.yml` stops the free project pausing.

If Supabase rejects the generated address, open **Advanced** in the account box and change the domain, or sign up with a real email as the username.

## Deploy free
`npm run build` produces a static `dist/` (Cloudflare Pages, Vercel, Netlify or GitHub Pages). No server routes are needed: AI calls go from the browser with the user's own key.

## Known limits
- Browsers cannot watch the system clipboard. Clips come from Panga copies and the Paste button.
- iOS and Firefox show a system "Paste" prompt on every Paste tap.
- Notifications only fire while a tab is open; OS may throttle when the app is fully closed. Server-side push (FCM/APNs) is a later phase.
- Not tested against a live Supabase project or on a physical phone (no access here). Do a two-browser sync check first.
- The first offline voice use downloads a Whisper model (40-260 MB, cached). Read-aloud quality depends on the device's installed voices.

## Checks run
`npx tsc -b`, `npm test`, `npm run build` all pass.
