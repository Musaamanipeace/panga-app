# DECISIONS.md

Decisions made + why (short): what, why, alternatives rejected.

## 2026-11-22 — Detect stack and commands from the repo, not assumed
- Detected from `package.json`: React 19 / TypeScript / Vite / Express app, Node >= 22; `npm test` → `vitest run`; `npm run lint` → `oxlint`; `npm run build` → `tsc -b && vite build`. CI (`.github/workflows/ci.yml`) runs the same three on push/PR.
- Why: task rule — don't assume; CONTRIBUTING and docs use the detected commands.
- Alternatives rejected: hard-coding guessed commands; trusting CI only.

## 2026-11-22 — CLAUDE.md not created
- Why: this harness is OpenCode, not Claude Code; the task allows tool-pointer files only when asked.
- Alternative rejected: adding other tool pointers without asking.

## 2026-11-22 — Branch name `docs/1-bootstrap-agent-workflow`
- Pattern from issue-branch-merge: `type/<issue#>-short-name`; type `docs` fits (most changes are docs + CI config).

## 2026-11-22 — Repo default merge style: MERGE
- From `gh repo view --json viewerDefaultMergeMethod` → "MERGE" (merge commit); all of merge/rebase/squash are allowed, user's default is MERGE.
- Why: issue-branch-merge says to use the repo's default merge style; merge with `gh pr merge --merge`.

## 2026-11-22 — All 10 skills of the task created; extras only suggested
- Created: follow-the-plan, no-guessing-no-mocks, blocked-commands, issue-branch-merge, small-commits, documentation-handoff, approval-for-locks, ui-no-redundancy, completion-report, contribution-review.
- Not created (suggestions, needs approval): secrets-and-safety, pre-merge-checklist, release-and-changelog.
- Why: "Do not invent rules I haven't given"; the task lists §4 items as suggestions.

## 2026-11-22 — Issue #1 created for this task
- The task itself runs through the issue workflow: issue "Bootstrap agent workflow" (#1), PR contains `Closes #1`, merged after checks passed.

## 2026-11-22 — BYOK Supabase replaces Google as the cloud option
- Google Drive sync, Google Drive file upload and Google Calendar OAuth are all removed; only local IndexedDB, bring-your-own Supabase and JSON snapshots remain.
- Why: user chose "Every Google/Drive reference" when asked about scope. Local calendar UI and its `calendarEvents` data stay; `.ics` import stays local and is relabelled neutrally.
- Rejected: keeping Google Calendar sync or Google Drive share-link wording.

## 2026-11-22 — Header Sync dropdown becomes a status indicator only
- Why: user chose "Keep a status indicator". JSON download/upload remains in Settings → Local snapshot; detailed Supabase sync status remains in AccountPanel.
- Rejected: removing the indicator entirely, or repurposing the dropdown as a JSON export/import menu.

## 2026-11-22 — JSON snapshot includes identity, session and secrets
- Snapshot carries all data, username, login status, Supabase URL/anon key + auth session, and API keys. Import sets the app session before loading data so it is equivalent to logging in.
- Why: user said sign-in is "not a security measure, just so that I can access my data from the cloud" and chose to include API keys. Full login parity was chosen over keeping credentials out of the file.
- Rejected: guest-only import, excluding secrets, and attempting to recreate a Supabase session without storing it.

## 2026-11-22 — Five ordered units of work
- Step 1 remove Google/Drive (issue #4), step 2 auth + isolation + JSON identity, step 3 empty key fields + Supabase messaging, step 4 voice transcription speed, step 5 Read Aloud coverage.
- Why: matches the user's recommended implementation order and CONTRIBUTING.md's "one focused change per PR". Never reorder or merge steps.

## 2026-11-25 — Workspaces are one IndexedDB each; BYOK is account-level
- Each workspace has its own DB (`panga-db-<user>` for the default one so existing data stays put, `panga-db-<user>__ws_<id>` for others). Switching closes and reopens the DB via `switchUserAccount()`.
- `aiApiKey_*`, `geminiApiKey`, `aiProvider`, `aiModel_*` are stored per account in localStorage and mirrored into the open DB so JSON snapshots still carry them.
- Why: keeps every existing data module untouched and gives clean isolation; BYOK must not change when switching workspaces.
- Rejected: a `workspaceId` column on every table (touches every query and migration).

## 2026-11-25 — Notes formatting stays plain text
- Toolbar inserts markdown-style markers (bold, italic, heading, bullets, numbered, checklist, quote); no HTML storage, so search, copy, read-aloud and PDF are unchanged. Underline and alignment are not offered for that reason.

## 2026-11-25 — Task lists are flat
- Folders are gone from the Task lists UI; the v14 migration prefixes a list's old folder path onto its title (the default "Inbox" folder adds no prefix). The `taskListFolders` table is left in place, unused.

## 2026-11-24 — Quick links vs header Shortcuts & layered z-index scale
- Renamed the pinned home card (`ShortcutsBar.tsx`) to `Quick links` while keeping the header keyboard-shortcut dialog (`AppShell.tsx`) as `Shortcuts` to eliminate duplicate/ambiguous terminology (`ui-no-redundancy`).
- Separated sticky chrome layers (`--z-chrome: 20` for bottom tab bar / workspace bar / AI FAB, `--z-workspace-open: 25` for open workspace menu, `--z-header: 30` for sticky top bar) and kept floating editor helpers (`.voice-fab`, `.pg-copy-fab`) at `--z-floating: 70` above drawers/modals (`--z-overlay: 60`) and below toasts/confirmations (`--z-toast: 80`).

## 2026-11-25 — Client-side Google Drive sync with digest conflict guardrails
- Uses client-side Google Identity Services (token flow, `https://www.googleapis.com/auth/drive.file`; no Firebase, no backend) with strictly in-memory access token caching and the Drive REST API. The backup is `panga-backup.json` inside a `panga` folder that the app creates in the user's Drive. Needs `VITE_GOOGLE_CLIENT_ID`.
- Never silently mutates Drive or local DB: read-only preflight compares deterministic snapshot digests against the last synced baseline (`no_remote`, `in_sync`, `local_ahead`, `remote_ahead`, `conflict`), then presents `DriveSyncReviewModal` with record-level `Merge both & sync`, `Overwrite Drive with local`, `Restore Drive to device`, or `Cancel`.
- API key boxes in `Settings.tsx` start `readOnly` until user focus with `autoComplete="new-password"` so browser password managers cannot preload/auto-save dots across providers.

## 2026-11-26 — Account-level reminders store (Stage 1 of Reminders & .ics import plan)
- Reminders and `reminderFolders` live in a dedicated account-level Dexie DB (`panga-account-<userId|guest>`) shared across all workspaces; legacy per-workspace `reminders` tables remain intact (never deleted) with `remindersMovedToAccount = true` marked on migrated workspace `settings`.
- Used stated brief defaults (`DECISION PENDING` owner confirmation): `D1` imported events go to Reminders; `D3` app-open notifications; `D4` option A account-level reminders; `D2` (`fflate` zip import), `D5` (skip past events), `D6` (10 min lead), and `D7` (09:00 local all-day) pending before Stages 3 & 5.
- `.ics` calendar import remains strictly file-based with zero Google Calendar API scripts or OAuth, while preserving the existing Google Drive JSON backup feature.

## 2026-11-26 — Reminders dated checklist, plain/timed split & recurrence (Stage 2, brief v2 D1–D11)
- Revised plan to v2 per owner vision: dropped server, Web Push, background scheduling, snooze, advance-notice offsets, and catch-up missed-alerts lists (`D3` settled). Approved `fflate` for Stage 5 `.zip` import (`D2` settled) and tick-to-delete/advance with brief Undo (`D5` settled).
- Defaulted Stage 2 semantics (`D6–D11`): one open item per missed repeating series in Overdue (`D6`); fixed-anchor schedule via `nextAfterComplete` strictly after completed occurrence and on/after today's local midnight (`D7`); reminder folders preserved in "More options" and list `Folder` filter (`D10`); legacy `status: "dismissed"` kept in DB and hidden everywhere while `pending`/`fired` show as open and legacy `timed === undefined` behaves as timed (`D11`).
- Account DB upgraded to v2 adding `externalUid` index on `reminders` (`src/data/accountDb.ts`) and `importedDone` account-settings tracking (`src/data/accountSettings.ts`) ready for Stage 5.


