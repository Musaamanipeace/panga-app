# AGENTS.md

Operating rules for every agent in this repo. Short and imperative. Skills live in `.agents/skills/`; agent docs in `docs/agent/`.

## Session start checklist

- [ ] Read AGENTS.md, `docs/agent/USER_RULES.md`, `docs/agent/PROGRESS.md`, `docs/agent/NEXT.md` before doing anything.

## Session end checklist

- [ ] Update `docs/agent/PROGRESS.md`, `docs/agent/NEXT.md`, `docs/agent/USER_RULES.md` (if new rules were given), `docs/agent/DECISIONS.md` (if decisions were made).
- [ ] Give the completion report.

## Skill index

| Skill | Use when… | Path |
|---|---|---|
| follow-the-plan | Executing my plan or a multi-step task: state the step before starting it, mark it done after, never reorder/skip/substitute | `.agents/skills/follow-the-plan/SKILL.md` |
| no-guessing-no-mocks | Information is missing or a gap would need filling with assumptions, placeholders, or mock data | `.agents/skills/no-guessing-no-mocks/SKILL.md` |
| blocked-commands | A command fails or cannot be run (permissions, auth, network, prompts) | `.agents/skills/blocked-commands/SKILL.md` |
| issue-branch-merge | Every unit of work: issue → branch → small commits → push → PR with `Closes #N` → merge when mergeable | `.agents/skills/issue-branch-merge/SKILL.md` |
| small-commits | Committing: one commit = one small, specific change; review the diff first | `.agents/skills/small-commits/SKILL.md` |
| documentation-handoff | After each unit: update PROGRESS/NEXT; new rules → USER_RULES; decisions → DECISIONS | `.agents/skills/documentation-handoff/SKILL.md` |
| approval-for-locks | Anything restricting or freezing future development (branch protection, pinned deps, read-only settings…) | `.agents/skills/approval-for-locks/SKILL.md` |
| ui-no-redundancy | Before finalizing any UI/frontend work | `.agents/skills/ui-no-redundancy/SKILL.md` |
| completion-report | Ending any task: produce the standard completion report | `.agents/skills/completion-report/SKILL.md` |
| contribution-review | External PR arrives | `.agents/skills/contribution-review/SKILL.md` |

MUST: open and follow the matching skill BEFORE starting any task that matches its trigger. In every final report, say which skills were used.

## Non-negotiable rules

- Run the session start checklist first (follow-the-plan).
- Execute the plan step by step; never reorder, skip, or substitute (follow-the-plan).
- Never fill gaps with assumptions or placeholder logic; ask a specific question instead (no-guessing-no-mocks).
- Mock data only when explicitly requested; label it `MOCK` in code and list it in the report (no-guessing-no-mocks).
- Never skip a failed command or change scope without a working alternative; if none exists, give the exact command and ask for the output; never claim success without output (blocked-commands).
- Issue → branch `type/<issue#>-short-name` from the up-to-date default branch → small commits → push → PR with `Closes #N`; never push to the default branch; merge only when mergeable and checks pass (issue-branch-merge).
- One commit = one small, specific change; format `type(scope): imperative summary`; review `git diff --staged` before each commit (small-commits).
- After each unit: update PROGRESS/NEXT; new user rules → USER_RULES (dated, in my words); decisions → DECISIONS (documentation-handoff).
- Propose anything that restricts or freezes development; wait for my approval (approval-for-locks).
- UI/frontend: each fact shown on a screen appears once, in the best place (ui-no-redundancy).
- End every task with the completion report; state skills used (completion-report).
- External PRs: check `Closes #N`, CONTRIBUTING.md, small focused commits, no unrequested scope; summarize findings; don't merge without my approval (contribution-review).
