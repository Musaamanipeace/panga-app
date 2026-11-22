# CONTRIBUTING

Thank you for contributing! This repo uses a solo-developer workflow: one focused change per PR, small commits, and an automated check that every PR closes an issue.

## How to start (branch naming)

1. Find an existing issue, or open one first (describe the goal + acceptance criteria).
2. Claim an issue by commenting on it; open a new one and wait for a go-ahead before starting large work.
3. Branch: `type/<issue#>-short-name`, e.g. `fix/12-login-crash`.
4. Make small, focused commits — one commit = one small, specific change:
   `type(scope): imperative summary` (feat, fix, docs, refactor, test, chore).

## Setup locally

```bash
npm install
npm run dev
```

Stack (detected from `package.json`): React 19 + TypeScript + Vite frontend, Express server on Node >= 22.
Full setup/env details: `SETUP.md`.

## How to test

```bash
npm test        # vitest run (unit tests)
npm run lint    # oxlint
npm run build   # tsc -b && vite build
```

CI (`.github/workflows/ci.yml`) runs the same three on every push/PR.

## Code style

Keep changes consistent with surrounding code (TypeScript + Vite + oxlint style). No unrequested refactors or new dependencies.

## Pull requests

- Body must contain a closing keyword + issue number: `Closes #N` (the `require-linked-issue` CI check fails without it).
- Summarize what changed and how it was tested.
- Never push to the default branch (`main`).

## Review

- CI gates merges (lint, test, build).
- One focused change per PR; small PRs are preferred over large ones.

## Code of conduct

- Be kind and respectful toward everyone. (The repo has no dedicated CODE_OF_CONDUCT file yet — TODO(user): add one if desired.)
