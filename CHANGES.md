# Panga pivot: what changed

Panga is now a quick capture tool: **thoughts -> tasks -> calendar**, plus notes, a clipboard history and PDFs.
The old project/resource screens were kept and moved to **Workspaces** (`/workspaces`, header link) so nothing was lost.

## New home (`/home`)
| Area | What it does | Files |
|---|---|---|
| Capture | One box, Enter to save, mic on every text box (existing offline voice). "-> task" ticks a thought into a task. App shortcut "Quick capture" (long-press the icon) opens straight to it. Header "Thoughts" panel still works from any page. | `components/home/ThoughtStream.tsx`, `pages/PangaHome.tsx`, `vite.config.ts` |
| Tasks | Active / Inactive (parked) / Done, short or long term, per-task date, double-click to edit. No project needed. | `components/home/TasksPanel.tsx`, `data/tasks.ts` (`horizon` field, optional) |
| Calendar | Month grid with counts, pick a day, add an existing task to it or create one for that day. | `components/home/CalendarPanel.tsx` |
| Notes | Categorised notes (category = a `cat:` tag on a `notes` resource), copy, read aloud, edit, delete. | `components/home/NotesPanel.tsx` |
| Clipboard | Default note category `clipboard`. "Paste" button (header and home) reads the clipboard in one tap; Ctrl/Cmd+V on the tab, or paste into the fallback box. Anything copied inside Panga is added. Old Stash items migrate once. Local only, never synced. | `data/clips.ts`, `components/home/ClipboardPanel.tsx`, `components/quickPaste.ts` |
| Copy icon | Highlight text anywhere and a copy icon appears. | `components/SelectionCopy.tsx` |
| Read aloud | Browser speech synthesis, sentence-chunked, prefers offline voices. Buttons on notes and PDF pages. | `speech/tts.ts`, `components/ReadAloudButton.tsx` |
| PDFs | Add a PDF (stored on this device), read page text, search, read aloud, save a page as a note. pdf.js loads only when used. No OCR for scanned files. | `components/home/PdfReader.tsx`, `data/pdfs.ts`, Dexie v10 |
| AI commands | Speak or type; your own key (Settings -> AI) proposes create/tick/update/delete task actions; you approve each. Deletes are never bulk-approved and can be undone. | `ai/commands.ts`, `components/home/CommandBox.tsx` |
| Account + sync | Username + password via Supabase, sync of tasks, thoughts and notes (last-write-wins, deletes tracked). | `sync/supabaseSync.ts`, `sync/tombstones.ts`, `components/AccountPanel.tsx` (Settings), `supabase/panga_sync.sql` |

## Removed
Puter (SDK files, `/puter`, types), the Stash panel (migrated into Clipboard), `panga-pwa-voice-docker.patch`.
Kept: Express server and Docker (optional, not needed for static hosting), Drive/Gist backups, JSON export.

## Set up Supabase sync (free tier)
1. Create a Supabase project. SQL editor: run `supabase/panga_sync.sql`.
2. Authentication -> Providers -> Email: turn **Confirm email OFF** (usernames become `name@panga.invalid`, no email is sent).
3. Put the project URL and anon key in the app (Settings -> Supabase) or `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
4. Settings -> Account & sync: Create account, then Sign in on other devices.
5. Optional: add repo secrets `SUPABASE_URL` and `SUPABASE_ANON_KEY` so `.github/workflows/supabase-keepalive.yml` stops the free project pausing after inactivity.

If Supabase rejects the generated address, open **Advanced** in the account box and change the domain, or sign up with a real email as the username.

## Deploy free
`npm run build` produces a static `dist/` (Cloudflare Pages, Vercel, Netlify or GitHub Pages). No server routes are needed: AI calls go from the browser with the user's own key.

## Known limits
- Browsers cannot watch the system clipboard. Clips come from Panga copies and the Paste button.
- iOS and Firefox show a system "Paste" prompt on every Paste tap.
- Not tested against a live Supabase project or on a physical phone (no access here). Do a two-browser sync check first.
- The first offline voice use downloads a Whisper model (40-260 MB, cached). Read-aloud quality depends on the device's installed voices.
- Scanned PDFs need OCR, which is not included.

## Checks run
`npx tsc -b`, `npm test` (66 tests incl. a jsdom smoke test of the new home), `npm run build` all pass.
