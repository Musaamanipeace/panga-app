---
name: small-commits
description: Use when committing changes: one commit = one small, specific change; review the staged diff before each commit.
---

1. One commit covers one small, specific change — never batch unrelated changes.
2. Before each commit: `git add <files>` and review `git diff --staged`; confirm it contains only that change (unstage the rest if not).
3. Message format: `type(scope): imperative summary` (feat, fix, docs, refactor, test, chore); add a body when the why isn't obvious.
4. Reference the issue number in commits when relevant.
