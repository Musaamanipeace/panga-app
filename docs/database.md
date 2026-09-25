# Database Schema

Local-first storage via [Dexie](https://dexie.org) (IndexedDB). Schema lives entirely in `src/data/db.ts` — **the only file allowed to import Dexie**; every other module goes through the typed functions exported from `src/data/*.ts`.

## Tables

| Table | Key Fields | Notes |
| --- | --- | --- |
| `projects` | `name`, `description`, `status` (active/archived) | Deleting cascades to every table below. |
| `tasks` | `projectId`, `title`, `status` (active/inactive/completed), `dueDate`, `estimatedMinutes`, `tags` | Drives dashboard progress %. |
| `resources` | `projectId`, `category`, `title`, `tags`, category-specific fields | `category` is a fixed enum (see below). |
| `docEntries` | `projectId`, `type` (outline/phase), `title`, `content`, `order` | Project documentation/outline. |
| `milestones` | `projectId`, `title`, `targetDate`, `status` (in_progress/achieved/missed), `blockingTaskIds[]` | Auto-flips to achieved once every blocking task completes. |
| `issues` | `projectId`, `title`, `description`, `severity` (low/medium/high), `status` (open/resolved) | |
| `reminders` | `projectId`, `message`, `triggerAt`, `status` (pending/fired/dismissed) | |
| `calendarEvents` | `projectId`, `title`, `description`, `startAt`, `endAt`, `source` (local/google), `hangoutLink` | Google Calendar sync + local events. |
| `scheduleItems` | `projectId`, `title`, `description`, `scheduledAt`, `durationMinutes`, `sourceTaskId` | Scheduler tab entries. |
| `settings` | `key` → `value` | Bootstrap values: `appInitialized`, `geminiApiKey`, `googleCalendarClientId`, `googleCalendarToken`, `secretsVault`. |

Every record also carries `id`, `createdAt`, `updatedAt`, and `syncStatus: "pending" | "synced"` (used by an eventual sync layer).

## Fixed Resource Categories

The `resources` table uses a fixed `category` enum (Supabase-shaped: category column + typed fields mapping to JSONB `meta`). Categories are no longer user-editable — each has a known set of fields:

| Category | Title Field | Category-Specific Fields |
| --- | --- | --- |
| `notes` | `title` | `body` (text), `files[]` (doc/pdf/spreadsheet attachments) |
| `scripts` | `title` | `body` (plain text) |
| `prompts` | `title` | `body` (plain text) |
| `ai_chat_links` | `title` | `url`, `provider` (gemini/claude/gpt/other) |
| `reports_memos` | `title` | `body` (text) |
| `links` | `title` | `url` |
| `contacts` | `title` (person/org name) | `contactType` (email/phone/social), `value` |
| `secrets` | `title` | `value` (encrypted) |
| `images` | `title` | `images[]` (uploaded images) |

## Changing the Schema

Bump `db.version(n)` in `db.ts` and add a `.stores({...})` block for the new version (Dexie handles the migration). Keep primary keys first in each index string; prefix array fields with `*` for multi-entry indexing (used by `tags` and `blockingTaskIds`).