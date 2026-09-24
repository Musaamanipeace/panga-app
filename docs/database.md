# Database

Local-first storage via [Dexie](https://dexie.org) (IndexedDB). Schema lives
entirely in `src/data/db.ts` — **the only file allowed to import Dexie**;
every other module goes through the typed functions exported from
`src/data/*.ts`.

## Tables

| Table | Key fields | Notes |
| --- | --- | --- |
| `projects` | `name`, `description`, `status` (active/archived) | Deleting cascades to every table below. |
| `tasks` | `projectId`, `title`, `status` (active/inactive/completed), `dueDate`, `estimatedMinutes`, `tags` | Drives dashboard progress %. |
| `resources` | `projectId`, `category`, `title`, `value`, `textBody`, `images[]`, `tags` | `category` points at a `ResourceCategoryDef` id (user-editable). |
| `docEntries` | `projectId`, `type` (outline/phase), `title`, `content`, `order` | Project documentation/outline. |
| `milestones` | `projectId`, `title`, `targetDate`, `status` (in_progress/achieved/missed), `blockingTaskIds[]` | Auto-flips to achieved once every blocking task completes. |
| `issues` | `projectId`, `title`, `description`, `severity` (low/medium/high), `status` (open/resolved) | |
| `contacts` | `name`, `email`, `phone`, `discord`, `linkedProjectIds[]` | Schema defined; not yet surfaced as its own resource-independent UI. |
| `reminders` | `projectId`, `message`, `triggerAt`, `status` (pending/fired/dismissed) | |
| `settings` | `key` → `value` | Bootstrap values — currently just `resourceCategories`. |

Every record also carries `id`, `createdAt`, `updatedAt`, and
`syncStatus: "pending" | "synced"` (used by an eventual sync layer — see
[`backend-features.md`](./backend-features.md#sync-optional-not-required-to-run-the-app)).

## Resource categories

Seeded once on first run from `DEFAULT_RESOURCE_CATEGORIES` (link, script,
location, name, reminder, contact, schedule, bookmark group, file) into the
`settings` table under key `resourceCategories`. Fully user-editable at
runtime — rename, add, or delete categories from the Resources tab's
"Manage categories" modal (`data/resources.ts` →
`listResourceCategories` / `saveResourceCategories` /
`reassignResourcesToCategory`, the last of which re-homes any resources
whose category gets deleted).

## Changing the schema

Bump `db.version(n)` in `db.ts` and add a `.stores({...})` block for the new
version (Dexie handles the migration). Keep primary keys first in each
index string; prefix array fields with `*` for multi-entry indexing (used by
`tags` and `linkedProjectIds`).
