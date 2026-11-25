# Panga changes summary

Panga is a local-first quick-capture organizer built around **task lists (nested checkable items), link folders, notes, reminders, clipboard history, train of thought, and proofreading**, with all data stored locally in IndexedDB and portable via unencrypted JSON snapshots.

## Current features (`/home` & `/settings`)
| Area | What it does | Files |
|---|---|---|
| Home tabs | Task lists (`Alt+T`, flat), Links (`Alt+L`), Notes (`Alt+N`, folder control + in-place editor), Reminders (`Alt+R`), Clipboard (`Alt+C`). Grammar & Spelling is available inside the tabs instead of a Proofread tab. Thought train available globally from the header. | `pages/PangaHome.tsx`, `shortcuts.ts` |
| Header & Menu | Slim header with `Panga`, `Search`, `💭 Thoughts`, `📋 Paste`, `Shortcuts` popover (`?`), and `Menu` popover (`Settings`, `Online`/`Offline`, `Install app`, `Exit`). | `components/AppShell.tsx`, `components/GlobalSearch.tsx` |
| Proofread | Standalone **Proofread** tab and modal launcher from Notes and Tasks. Supports grammar/spelling-only (`Proofread`) and `Formatting` modes, clarification prompts, and locked result view with `Copy`, `Edit`, and `Apply`. | `components/Proofread.tsx`, `proofread/prompt.ts` |
| Read aloud | Sentence-level Pause/Resume & Stop, 4-state local/online voice detection, `/home` first-arrival offline voice notice, and Settings **Read aloud** setup card. | `speech/tts.ts`, `speech/ReadAloudSettings.tsx`, `components/ReadAloudButton.tsx` |
| Landing & Backup | Three choices (`Continue local`, `Start afresh` after confirmation, `Upload JSON`); unencrypted JSON snapshot with JSON account username and backup reminder in Settings. | `pages/Landing.tsx`, `components/AccountPanel.tsx`, `sync/snapshot.ts` |
| Module stability | Resolved circular import (`db.ts` ↔ `session.ts`) via `src/auth/sessionUserId.ts` so `npm run dev` boots cleanly without a `ReferenceError`. | `src/auth/sessionUserId.ts`, `src/auth/session.ts` |

## UI refresh (Nov 2026)
- Dark and light themes; per-component diagonal light sweep on hover/focus/press and on panel state changes.
- Workspace selector at the top: one IndexedDB per workspace, BYOK keys and AI provider/model shared across workspaces, JSON snapshots carry all workspaces.
- Phone layout: consistent gutters, wrapping, z-index layers (1/20/40/60), bottom tab bar.

## Remote DB removal
- Removed all Supabase client, sync, tombstone, and credential encryption modules along with `@supabase/supabase-js` and `/supabase/*.sql`.
- Local IndexedDB (`Dexie`) + manual JSON export/import are now the only persistence mechanism.

## Pending / on hold
- **Issue 2 (Routing catch-all & legacy dead routes)**: Held pending confirmation of the exact URL produced after a click that does nothing.

## Checks run
`npx tsc -b`, `npx vitest run` (17 files, 89 tests), `npx oxlint`, and `npm run build` all pass.
