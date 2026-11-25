# PROGRESS.md — what has been done, by phase, newest first

## 2026-11-25 — Google Drive OAuth sync, conflict guardrails & API key eye peek
- **Google Drive auth & sync (`googleAuth.ts`, `googleDriveSync.ts`, `useGoogleDriveSync.ts`)**: Added client-side Firebase Google Auth (`https://www.googleapis.com/auth/drive.file`, in-memory access token only), read-only Drive preflight (`inspectDriveSync`), digest-based classification (`no_remote`, `in_sync`, `local_ahead`, `remote_ahead`, `conflict`), record-level snapshot merge (`mergeSnapshots`), and explicit confirmation/conflict modal (`DriveSyncReviewModal.tsx`) across Landing (`Landing.tsx`), Settings (`AccountPanel.tsx`), and Menu (`AppShell.tsx`). Updated CSP in `server.ts` & `vercel.json`.
- **Settings AI key inputs (`Settings.tsx`)**: Prevented browser password autofill from pre-populating all 6 inputs (`autoComplete="new-password"`, `readOnly` until focus, ignore hints) and replaced `Show`/`Hide` text with a 1-click Eye icon that auto-hides after 4 seconds without requiring a second click; masked dots and `Saved` status only show for human-entered/saved keys.
- **Tests**: Added `src/sync/__tests__/googleDriveSync.test.tsx` (7 tests) and expanded `src/pages/__tests__/Settings.test.tsx`.

## 2026-11-24 — Quick links rename & viewport/stacking/layout fixes
- **Quick links rename (`ShortcutsBar.tsx`)**: Renamed the home bar heading, `aria-label` attributes, picker labels, empty state copy, and toast messages from `Shortcuts` to `Quick links` (leaving keyboard `Shortcuts` button in `AppShell.tsx` distinct).
- **Stacking & dropdown layers (`panga-ui.css`, `index.css`)**: Separated `--z-header` (`30`) above `--z-chrome` (`20`) and `--z-workspace-open` (`25`) so open header menus and header hover tooltips always paint cleanly over the Workspace bar; raised `.notes-folders` (`15`) above `.notes-list-pane`; moved `.voice-fab` and `.pg-copy-fab` to `--z-floating` (`70`) above overlays; fixed `.assistant-fab` selector mismatch, mobile bottom clearance above `nav.pg-chips`, and z-index hover exclusions.
- **Viewport wrapping & responsive layouts**: Expanded header flex wrapping to `<= 820px` (resolving 641–820px horizontal overflow clipping), anchored mobile `.header-popover` safely inside gutters, fixed `HomeLinksTab.tsx` outer `split-pane` + `HomeRemindersTab.tsx` responsive stacking (plus guarded `typeof Notification === "undefined"` before reading `.permission`), added Notes folder outside-click/Escape dismissal and ellipsis truncation, capped `FolderTree.tsx` indent, added `min-width: 0` + `overflow-wrap: anywhere` + wrapping across controls/grids, added `data-tip-edge="left"` / `data-tip-align="right"` edge guards, exempted small corner/FAB buttons from coarse 44px blowout, clamped `VoiceProvider` mic coords below `.app-header`, and fixed dark-mode contrast in `Proofread.tsx` & `ui.tsx`.
- **Tests**: Updated `ShortcutsBar.test.tsx` and `PangaHome.test.tsx`, added `src/components/__tests__/layoutRegression.test.tsx`; `npx tsc -b` and `npx vitest run` pass (23 files, 121 tests).

## 2026-11-23 — Force pull repo & API-key-only AI settings
- **Force pull from upstream**: Connected git remote `https://github.com/Musaamanipeace/panga-app.git` and hard-reset `main` to `origin/main` (`7b07fae chore: remove remaining Supabase sync UI and schema leftovers`), discarding the previous unrequested CSS/z-index edits and removing stale `.github/workflows/supabase-keepalive.yml`.
- **Remove model selector (`Settings.tsx`, `src/ai/providers.ts`, `src/ai/chat.ts`)**: Removed the `Model` dropdown, `"Free only"` checkbox, and Settings model-fetch state/effect so users only choose a provider and enter their API key. Added cached `resolveDefaultModel()` in `src/ai/providers.ts` and wired `chatCompletion()` in `src/ai/chat.ts` to resolve a model automatically when no model is explicitly selected.
- **Tests & checks**: Added `src/ai/__tests__/chat.test.ts` and `src/pages/__tests__/Settings.test.tsx`; `npx tsc -b`, `npx vitest run` (19 files / 93 tests), `npm run build` (`compile_applet`), and `oxlint` (`lint_applet`, 0 errors) all pass.

## 2026-11-23 — Panga master plan (Issues 1, 3, 4, 5, 6, 7 completed; Issue 2 on hold)
- **Issue 1 (Blank page on `npm run dev`)**: Extracted `src/auth/sessionUserId.ts` (zero imports) to break the `db.ts` ↔ `session.ts` circular import; re-exported from `session.ts`.
- **Issue 3 (Remove all remote DB logic)**: Deleted Supabase sync/tombstones/crypto modules, `SyncStatusIndicator`, `/supabase/*.sql`, and `@supabase/supabase-js`. Stripped sync hooks across data modules and UI. Kept unencrypted `snapshot.ts` with JSON account `username` save/restore, Download/Upload JSON, and local storage backup reminder in `AccountPanel` (`Settings.tsx`).
- **Issue 4 (Landing page)**: Simplified `Landing.tsx` to three choices only (`Continue local`, `Start afresh` with `confirmAction()`, `Upload JSON`); moved `ToastContainer` and `ConfirmDialogHost` to `App.tsx` root.
- **Issue 5 (Read-aloud)**:
  - Implemented sentence-level Pause/Resume (`tts.ts`) stopping speech and restarting from the remembered sentence (`Read` -> `Pause` + `Stop` -> `Resume` + `Stop`).
  - Added 4-state voice status detection (`Ready offline (name)`, `Online voices only`, `No voices found`, `Not supported`) plus other-language local voice warning.
  - Added dedicated `Read aloud` card (`ReadAloudSettings.tsx`) in `Settings.tsx` with status, Android/iPhone/Windows/Mac setup steps, `Test voice`, `Recheck`, voice/rate controls (removed duplicate controls from `VoiceSettings.tsx`).
  - Added one-time dismissible notice on `/home` when not `Ready offline`, and actionable `"Set up offline voice"` toast when pressing `Read` with no local voice.
- **Issue 6 (Proofread tool)**:
  - Added verbatim system prompt and clarification parser (`src/proofread/prompt.ts`).
  - Built `src/components/Proofread.tsx` (`Proofread` grammar/spelling mode, `Formatting` mode, inline clarification cards, locked result textarea with `Copy`, `Edit`, and modal `Apply` / `Close`).
  - Wired Proofread as the 6th home tab (`PangaHome.tsx`) and global modal trigger in `NotesPanel.tsx`, `HomeTasksTab.tsx`, and `TaskListsHome.tsx`.
- **Issue 7 (Header, menu, shortcuts and design)**:
  - Added centralized shortcut registry (`src/shortcuts.ts`) mapping `Alt+T/L/N/R/C/P` via `e.code`, `Ctrl/Cmd+K` / `Alt+S` for search, and `?` for the shortcuts popover.
  - Replaced `AppShell.tsx` header controls with `Panga`, `<GlobalSearch>` (`"Search"` + `Ctrl+K`), `💭 Thoughts`, `📋 Paste`, `Shortcuts` popover, and `Menu` popover (`Settings`, `Online`/`Offline`, `<InstallButton />`, `Exit` to `/`).
  - Removed emojis and symbol-only icon buttons in favor of plain words across components and category seeds, keeping only `💭 Thoughts`, `📋 Paste`, and AI `✨` icons; eliminated duplicate header Paste and duplicate Notes Edit buttons per `ui-no-redundancy`.
  - Updated `src/index.css` for larger clickable controls, darker hover states, 44px touch targets on coarse pointers, and clean responsive header wrapping.
- **Checks**: `npx tsc -b` passes; `npx vitest run` passes (17 files / 89 tests, including `src/__tests__/shortcuts.test.ts` and `src/components/__tests__/AppShell.test.tsx`); `npx oxlint` 0 errors (0 warnings on touched files); `npm run build` passes.

## 2026-11-22 — Final state of the 5-step BYOK plan
- All five steps implemented, reviewed by CI and merged to `main`:
  1. #4 / PR #5 — remove every Google/Drive integration and reference (local calendar kept).
  2. #6 / PR #7 — BYOK auth, per-user IndexedDB isolation, JSON identity/session restore, guest upgrade prompt.
  3. #8 / PR #9 — empty secret fields, env fallback removed, BYOK Supabase messaging.
  4. #10 / PR #11 — Fast/Balanced/Accurate selector, app-start warmup, faster VAD/chunks, WebGPU→WASM, partial results.
  5. #12 / PR #13 — Read Aloud on thoughts/insights, voice/rate controls, stop on navigation.
- Final verification on `main`: `npm test` 15 files / 74 tests pass; `npm run lint` exit 0 (pre-existing warnings only); `npm run build` succeeds.
- All GitHub checks passed on every PR (web, image, require-linked-issue, Vercel).

## 2026-11-22 — Step 5: Read Aloud coverage and polish (issue #12, branch feat/12-read-aloud-coverage)
- [x] Read Aloud added to long thoughts (ThoughtStream + ThoughtTrain) and note-type insights; each appears once per item
- [x] Voice + rate controls added to Voice Settings, using existing TTS preferences
- [x] Reading stops on route change; a stop event resets every Read Aloud button when any reading stops
- [x] ui-no-redundancy reviewed: notes/PDF keep their existing single button, no duplicated controls
- [x] Checks: `npm test` 15 files / 74 tests pass; `npm run lint` exit 0 (pre-existing warnings); `npm run build` succeeds

## 2026-11-22 — Step 4: voice transcription speed (issue #10, branch perf/10-voice-transcription-speed)
- [x] Fast / Balanced / Accurate selector defaulting to Fast (tiny.en → base → small)
- [x] Faster VAD: silence 700→450 ms, max segment 25→15 s, min speech 250→180 ms, pre-roll 300→250 ms, partial every 2 s
- [x] Whisper worker tries WebGPU (fp16) then falls back to WASM (q8); transcribe jobs serialised; chunks 30→15 s (10 s for partials)
- [x] Partial/interim results for local Whisper; browser engine keeps its live interim results
- [x] Selected model warms on app start (idle callback) with progress/ready/error status shown in Voice Settings
- [x] Voice Settings notes lowest-latency engine and the active runtime
- [x] Checks: `npm test` 15 files / 72 tests pass; `npm run lint` exit 0 (pre-existing warnings); `npm run build` succeeds

## 2026-11-22 — Step 3: empty secret fields + BYOK Supabase (issue #8, branch fix/8-empty-secret-fields)
- [x] Supabase config no longer falls back to `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`; only user-saved settings count
- [x] Settings Supabase section renamed "Bring your own Supabase project" with required-for-sign-up-and-sync wording
- [x] Secret inputs remain empty until a real saved value is loaded (placeholders only)
- [x] README/SETUP updated to remove env-based Supabase configuration
- [x] Added a test proving env vars are ignored
- Checks: `npm test` 14 files / 70 tests pass; `npm run lint` exit 0 (pre-existing warnings); `npm run build` succeeds

## 2026-11-22 — Step 2: BYOK auth, isolation and JSON identity (issue #6, branch feat/6-auth-data-isolation)
- [x] Issue #6 created; branch from up-to-date `main` (after PR #5 merged)
- [x] `session.ts`: awaitable DB switching, guest flag cleared on sign-in, fresh guest id + Supabase auth storage cleanup on sign-out
- [x] `supabaseSync.ts`: sign-up/sign-in adopt the Supabase user id and switch IndexedDB; sign-out clears Supabase session; app-start session reconciliation; snapshot session helpers
- [x] `snapshot.ts`: export carries identity, login status, Supabase URL/anon key + auth session and all settings/API keys; import restores identity before loading data into the right isolated DB
- [x] Landing imports via `importSnapshot` (no more ad-hoc email restore); Settings upload uses the same path
- [x] Guest who saves Supabase keys gets an upgrade prompt: sign in / create account / not now, with an opt-in to move guest data into the account (`mergeDbState`)
- [x] Added 4 regression tests for identity restore and account isolation
- [x] Checks: `npm test` 13 files / 69 tests pass; `npm run lint` exit 0 (pre-existing warnings); `npm run build` succeeds
- Commits: 7e0a911 (session binding), 1a50cfc (snapshot identity), 9922f89 (guest prompt), f4ac94c (tests)

## 2026-11-22 — Step 1: remove every Google/Drive reference (issue #4, branch refactor/4-remove-google-drive)
- [x] Issue #4 created; branch from up-to-date `main`
- [x] Deleted `googleDriveSync.ts`, `autoSync.ts`, `google.ts`, `googleCalendar.ts` (1,270 lines)
- [x] Removed Google/Drive settings keys, tokens, sync-provider types and logout token cleanup
- [x] Replaced header `SyncMenu` + `AutoSyncIndicator` with a single `SyncStatusIndicator` badge ("Local only" / "Supabase sync")
- [x] Removed Drive section and client-id form from Settings
- [x] Rewrote Google Drive share-link and Google Calendar wording; local calendar + .ics import kept (`source: "imported"`, legacy `google` values still read as imported)
- [x] Removed Google Identity Services script, Google CSP entries, and stale docs references
- [x] Recorded new user rules/decisions in USER_RULES.md + DECISIONS.md
- [x] Checks: `npm test` 12 files / 65 tests pass; `npm run lint` (warnings only, pre-existing); `npm run build` succeeds
- Commits: 3ca9000 (rules), 9dc823f (delete modules), 71b38a6 (settings), 317a7a0 (UI), 4d0d5d2 (wording), 91ddc69 (config/docs)

## 2026-11-22 — Bootstrap agent workflow (issue #1, branch docs/1-bootstrap-agent-workflow)
- [x] Create issue "Bootstrap agent workflow" — issue #1
- [x] Create branch `docs/1-bootstrap-agent-workflow` from up-to-date `main`
- [x] AGENTS.md: skill index, non-negotiable rules, session start/end checklists
- [x] 10 skills in `.agents/skills/`
- [x] docs/agent: USER_RULES.md, DECISIONS.md, NEXT.md, PROGRESS.md
- [x] .github: ISSUE_TEMPLATE/{bug,feature,task}.md, pull_request_template.md, workflows/require-linked-issue.yml
- [x] CONTRIBUTING.md

## 2026-11-25 — UI/UX refresh (workspaces, flat task lists, notes editor, themes)
- [x] Dark + light themes (Menu > Theme), tokens in `src/styles/panga-ui.css`; hardcoded colours in `index.css` moved to tokens
- [x] Per-component diagonal light sweep (hover, focus-visible, press, and on mount of panels/containers)
- [x] Mobile spacing/stacking: 14px gutters, `min-width: 0` + wrapping, z-index layers 1/20/40/60, section chips become the bottom tab bar on phones
- [x] Workspace selector (Create new / Manage / switch); one IndexedDB per workspace (default keeps the legacy DB name); BYOK keys and AI provider/model moved to an account-level store; JSON snapshot carries every workspace
- [x] Flat task lists (Dexie v14 prefixes former folder names onto list titles)
- [x] Proofread tab and Alt+P removed; Grammar & Spelling trigger now in Notes, Links, Thoughts, Clipboard, Reminders and the task input
- [x] Notes: Folders control (Add/Delete), container switches to an editor with formatting toolbar + Grammar & Spelling; three panes on desktop
- [x] Checks: `npx tsc -b`, `npx vitest run` (22 files, 116 tests), `npx vite build` pass
