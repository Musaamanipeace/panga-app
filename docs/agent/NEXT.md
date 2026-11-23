# NEXT.md — next phase

## Latest completed work (2026-11-23)
- [x] Force-pulled `origin/main` (`7b07fae`) from `Musaamanipeace/panga-app`.
- [x] Removed AI model selector from `Settings.tsx` and added automatic model resolution in `src/ai/providers.ts` / `src/ai/chat.ts` so users only need to enter API keys.

## Current plan (Panga master plan — ordered: 1, 3, 4, 5, 6, 7; Issue 2 on hold)
1. [x] Issue 1: Blank page on `npm run dev` (circular import fix via `src/auth/sessionUserId.ts`)
2. [ ] Issue 2: Routing (**ON HOLD** until author confirms the URL after a click that does nothing)
3. [x] Issue 3: Remove all remote DB logic (Supabase removal + JSON account & unencrypted snapshots)
4. [x] Issue 4: Landing page (3 choices only: Start afresh, Continue local, Upload JSON)
5. [x] Issue 5: Read-aloud (sentence Pause/Resume, 4-state voice status, Settings card, `/home` notice, toast CTA)
6. [x] Issue 6: Proofread tool (`src/proofread/prompt.ts`, `src/components/Proofread.tsx`, `/home` tab & resource modal triggers)
7. [x] Issue 7: Header, menu, shortcuts and design (`src/shortcuts.ts`, slim `AppShell` header with Shortcuts/Menu popovers, plain-word UI cleanup, CSS hover/touch polish)

## Prior completed plan (5 ordered steps, from the user on 2026-11-22)
1. [x] Remove Google Drive / every Google reference (issue #4, branch `refactor/4-remove-google-drive`)
2. [x] Harden sign-up / sign-in + per-user IndexedDB isolation + JSON identity restore (issue #6, branch `feat/6-auth-data-isolation`)
3. [x] Empty key fields by default + explicit "bring your own Supabase" messaging (issue #8, branch `fix/8-empty-secret-fields`)
4. [x] Voice transcription speed (issue #10, branch `perf/10-voice-transcription-speed`)
5. [x] Read Aloud coverage on notes / long thoughts + stop-on-navigation polish (issue #12, branch `feat/12-read-aloud-coverage`)
Do not reorder or merge steps. Each step = its own issue → branch → small commits → PR → merge.

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

## Plan status
All five steps of the 2026-11-22 BYOK plan are complete and merged. No step remains. Known trade-offs accepted by the user:
- JSON snapshots contain the Supabase session and API keys so import equals login; sign-in is for cloud access, not a security boundary.
- Google Gemini as an AI provider and Google Search grounding in the assistant are retained — the removal covered Google Drive, Google OAuth, Google Calendar integration and Drive link wording.
- Whisper WebGPU may be unsupported by some ONNX graphs; the worker falls back to WASM automatically.

## Open questions (future phases)
- TODO(user): Enable branch protection or rulesets if desired — requires my approval (approval-for-locks).
- TODO(user): Create the suggested extra skills when you approve: secrets-and-safety, pre-merge-checklist, release-and-changelog.
- TODO(user): Add a real CODE_OF_CONDUCT file if desired (none exists; CONTRIBUTING.md points to README.md instead).

## Blockers
- None after this task.
