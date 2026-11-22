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
