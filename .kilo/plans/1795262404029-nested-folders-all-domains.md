# Plan: Nested Folders (Subfolders) for TaskLists, Links, Notes, Reminders

## Goal
Add folder-within-folder nesting (like a file/library app) across all four domains: tasklists, links, notes, reminders. Each domain gets folders that can contain other folders plus its items. Landing-page username/password sign-up/sign-in is already implemented (verify only).

## Current State (verified via exploration)
- **Landing auth**: `Landing.tsx` already has sign-in + sign-up forms calling `signIn`/`signUp` from `supabaseSync.ts` with username+password. ✅ Done — no changes needed.
- **TaskLists**: `TaskList` has no `folderId`; no `TaskListFolder` table. Flat list only.
- **LinkFolders**: `LinkFolder` has no `parentFolderId`. Flat folders only. `Link` already has `folderId`.
- **NoteFolders**: `NoteFolder` has no `parentFolderId`. Flat folders only. `Note` already has `folderId`.
- **Reminders**: No folder concept at all. `Reminder` has no `folderId`. Bucketed by time (overdue/due/upcoming).
- **Supabase**: `task_lists`, `link_folders`, `notes`, `reminders` tables have no `parent_folder_id`/`folder_id` columns for nesting. `panga_records` sync table stores everything as JSONB (kind-based).
- **Only existing hierarchy**: Task subtasks via `Task.parentId`.

## Design Decisions

### 1. Data model — separate folder table per domain (consistent with existing codebase pattern)

| Domain | Folder interface/table | Has `parentFolderId`? | Items have `folderId`? |
|--------|----------------------|----------------------|----------------------|
| TaskLists | **new** `TaskListFolder` | yes | add `folderId` to `TaskList` |
| Links | `LinkFolder` (existing) | add `parentFolderId` | yes (already) |
| Notes | `NoteFolder` (existing) | add `parentFolderId` | yes (already) |
| Reminders | **new** `ReminderFolder` | yes | add `folderId` to `Reminder` |

### 2. Folder delete behavior (cascade)
When a folder is deleted:
- Subfolders are reparented to the deleted folder's parent (or root if none).
- Items in the folder are reparented to the deleted folder's parent (or root if none).
- This avoids data loss; user can always move items again.

### 3. UI — tree view per domain
Replace flat folder sidebar lists with expandable/collapsible tree:
- Folder nodes: expand/collapse, rename, delete, new subfolder, new item.
- Item nodes: shown under their parent folder; click to open/edit.
- Root level shows top-level folders + unfiled items (folderId = null).
- "New folder" creates at root or under selected folder.

### 4. Sync / tombstones
- Add `taskListFolder` and `reminderFolder` to `SyncKind` and `ActivityEntityType` unions.
- Add `parent_folder_id` / `folder_id` columns to Supabase schema tables.
- `panga_records` stores folder data as JSONB under new kinds — no schema change needed there beyond kind list.

## Affected Files

### Data layer (`src/data/`)
1. `db.ts` — add `TaskListFolder`, `ReminderFolder` interfaces; add `parentFolderId` to `LinkFolder`, `NoteFolder`; add `folderId` to `TaskList`, `Reminder`; add Dexie tables + migrations + seed default folders.
2. `taskLists.ts` — add `folderId` to create/update; add folder CRUD (`taskListFolders.ts` or inline).
3. `linkFolders.ts` — add `parentFolderId` to create/update.
4. `notes.ts` — no item change; `noteFolders.ts` — add `parentFolderId` to create/update.
5. `reminders.ts` — add `folderId` to create/update; new `reminderFolders.ts` CRUD.
6. `activity.ts` — add `taskListFolder`, `reminderFolder` to `ActivityEntityType`.
7. `sync/tombstones.ts` — add `taskListFolder`, `reminderFolder` to `SyncKind`.
8. `sync/supabaseSync.ts` — add folder table mapping + collectLocalChanges for new folder kinds.
9. `sync/sync.ts` — add folder table names to `syncPushRecord` union.

### Supabase layer
10. `supabase/schema.sql` — add `parent_folder_id` to `link_folders`, `note_folders`; create `task_list_folders`, `reminder_folders` tables; add `folder_id` to `reminders`, `task_lists`; add `parent_folder_id` to new folder tables.
11. `supabase/panga_sync.sql` — extend kind check for new folder kinds.

### UI layer (`src/components/home/`)
12. `TaskListsHome.tsx` — replace flat list with folder tree; add "new folder"/"new tasklist" actions.
13. `HomeLinksTab.tsx` — replace flat folder list with tree; nesting UI.
14. `NotesPanel.tsx` — replace flat folder list with tree; nesting UI.
15. `HomeRemindersTab.tsx` — add folder sidebar (tree) + bucket view; folder picker when creating reminder.

### Tests
16. Update/add tests for nested folder behavior.

## Validation Plan
- `npx tsc -b` passes
- `npm run lint` exit 0
- `npm run build` succeeds
- `npx vitest run` all tests pass
- Manual: create folder → create subfolder → move item between folders → delete folder (items reparent) → create reminder in folder

## Open Questions (mark as decided or out of scope)
- [ ] Should folders support drag-and-drop reordering, or just menu-based move? **Recommended: menu-based move (simpler, no DND library needed).**
- [ ] Max nest depth? **Recommended: unlimited in data, UI shows all levels (no artificial cap).**
- [ ] When deleting a folder with contents, reparent to parent vs recursive delete? **Recommended: reparent to parent (safer).**

## Plan File
`/home/mamani/Documents/panga-app/.kilo/plans/1795262404029-nested-folders-all-domains.md`
