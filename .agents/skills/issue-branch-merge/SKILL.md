---
name: issue-branch-merge
description: Use for every unit of work: create the issue, branch from the up-to-date default branch, implement, commit in small pieces, push, open the PR with `Closes #N`, verify, and merge when mergeable.
---

1. `gh issue create` — clear title, acceptance criteria; note the issue number.
2. `git checkout -b type/<issue#>-short-name` from the up-to-date default branch (`git pull --ff-only` first).
3. Implement; make small commits (small-commits skill).
4. `git push` the branch.
5. `gh pr create` — the PR body must contain the closing keyword, e.g. `Closes #<issue>`.
6. Check: `gh pr view --json mergeable,mergeStateStatus` and `gh pr checks`.
7. If mergeable and checks pass: merge with the repo's default merge style (`gh pr merge --merge`; if unsure, ask once and record my answer in USER_RULES.md); delete the branch (`gh pr merge --delete-branch`, then `git branch -d` if still local).
8. If not mergeable or checks fail: do not force anything. Make one fix on the same branch; retry once. If still blocked after one fix attempt, stop and report.
9. Never push to the default branch. Never force-push without my approval. Never bypass checks or hooks.
