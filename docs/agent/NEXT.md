# NEXT.md — next phase

## Reminders upgrade & Google Calendar (.ics) import plan (6 sequential stages, brief v2)
- [x] Stage 1: Account-level cross-workspace reminders store (`src/data/accountDb.ts`, data layer, migration, snapshots, tests)
- [x] Stage 2: Views, plain/timed reminders, tick-to-delete/advance and repeats (`src/data/recurrence.ts`, `accountDb.ts` v2, `reminders.ts`, `HomeRemindersTab.tsx`, tests)
- [x] Stage 3: In-app timed alert banner, scheduler & notification settings (`src/data/reminders.ts`, `src/components/alerts/ReminderAlertBanner.tsx`, `src/components/settings/NotificationSetup.tsx`, `AppShell`, `Settings`)
- [x] Stage 4 & Stage 5: Pure RFC 5545 `.ics` parser & `.ics`/`.zip` multi-file import (`src/data/icsImport.ts` via `fflate`, `HomeRemindersTab.tsx`)
- [x] Stage 6: Workspace templates, parent/subworkspaces, `Main (Global)` move prompt, Notes default open editor + draft persistence, 5-item Thought history + copy, global cross-workspace search, Media tab (Drive routes + local LRU cache), quiet Drive auto-sync, tests & agent docs

## Latest completed work (2026-11-27)
- [x] Implemented full multi-stage plan covering nested parent/subworkspaces + starter templates (`Developer`, `Daily routine`, `Social events`), `Main (Global)` move prompt, Notes open-editor draft persistence, Thought Stream 5-item threshold + copy buttons, global cross-workspace search, Add Media tab (`panga/media` + local LRU cache), quiet Google Drive auto-sync, timed reminder alert banners + `NotificationSetup`, and RFC 5545 `.ics`/`.zip` import.

## Blockers
- `/app/applet` contains no `.git` metadata directory in this sandbox, so `git pull`, branching, commits, and PR creation could not run here (`TODO(user)` run in git clone).

