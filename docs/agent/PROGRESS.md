# PROGRESS.md — what has been done, by phase, newest first

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
