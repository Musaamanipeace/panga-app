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
