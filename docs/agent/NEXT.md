# NEXT.md — next phase

## Goal
The solo-developer agent workflow from the task is live: every unit of work = issue → `docs/<issue#>-...` branch → small commits → PR with `Closes #N` → merge when mergeable + checks pass. Future agent sessions start from the session-start checklist and run this workflow.

## Steps (done for this bootstrap)
- [x] AGENTS.md + skill index + non-negotiable rules + session checklists
- [x] 10 skills in `.agents/skills/`
- [x] docs/agent: USER_RULES.md, DECISIONS.md, NEXT.md, PROGRESS.md
- [x] .github: ISSUE_TEMPLATE/{bug,feature,task}.md, pull_request_template.md, workflows/require-linked-issue.yml
- [x] CONTRIBUTING.md
- [x] Issue #1 created; branch `docs/1-bootstrap-agent-workflow`; PR with `Closes #1`; merged; branch deleted
- [x] Final PROGRESS/NEXT update on `main` after merge

## Open questions (future phases)
- TODO(user): Enable branch protection or rulesets if desired — requires my approval (approval-for-locks).
- TODO(user): Create the suggested extra skills when you approve: secrets-and-safety, pre-merge-checklist, release-and-changelog.
- TODO(user): Add a real CODE_OF_CONDUCT file if desired (none exists; CONTRIBUTING.md points to README.md instead).

## Blockers
- None after this task.
