# PROGRESS.md — what has been done, by phase, newest first

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
