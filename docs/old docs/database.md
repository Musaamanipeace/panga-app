# Panga — Database Schema (Dexie / IndexedDB)

All database access goes through `src/data/db.ts` — the **only** file that imports Dexie. Every other module uses the re-exported functions from `src/data/*.ts`.

## Tables

### projects
```ts
id: string (pk)
name: string
description: string
status: "active" | "archived"
createdAt: number
updatedAt: number
syncStatus: "pending" | "synced"
```
Indexes: `status`, `updatedAt`, `syncStatus`

### tasks
```ts
id: string (pk)
projectId: string
title: string
notes: string
status: "active" | "inactive" | "completed"
executor: "ai" | "manual"
dueDate: number | null
scheduledAt: number | null
estimatedMinutes: number | null
tags: string[]
createdAt: number
updatedAt: number
syncStatus: "pending" | "synced"
```
Indexes: `projectId`, `status`, `dueDate`, `scheduledAt`, `executor`, `updatedAt`, `syncStatus`, `*tags`

### resources
```ts
id: string (pk)
projectId: string
category: "notes" | "scripts" | "links" | "secrets" | "images" | "pdfs"
title: string
tags: string[]
// Category-specific fields:
url: string | null; // links
provider: "gemini" | "claude" | "gpt" | "other" | null; // links (AI chat links)
value: string | null; // secrets (encrypted value)
body: string | null; // notes, scripts, links
images: ResourceImage[]; // images
files: ResourceFile[]; // notes (attached doc/pdf/spreadsheet), pdfs (Drive file info)
createdAt: number
updatedAt: number
syncStatus: "pending" | "synced"
```
Indexes: `projectId`, `category`, `updatedAt`, `syncStatus`, `*tags`, `provider`

`ResourceImage`:
```ts
{ dataUrl: string; name: string; alt: string }
```

`ResourceFile`:
```ts
{ dataUrl: string; name: string; type: string }
```

### resourceSubcategories
```ts
id: string (pk)
category: ResourceCategory
name: string
order: number
isDefault: boolean  // true = shipped default, can be renamed & restored
createdAt: number
updatedAt: number
```
Indexes: `category`, `order`, `updatedAt`

Defaults (per plan §5.2):
- notes: ["Prompts", "Reports and Memos"]
- scripts: ["Shell", "Snippets"]
- links: ["AI Chats", "Multi-tab Bookmarks", "My Links"]
- secrets: ["Env Vars", "Tokens"]
- images: []
- pdfs: []

### contacts
```ts
id: string (pk)
name: string
type: "email" | "phone" | "link"
value: string
tags: string[]
linkedProjectIds: string[]
createdAt: number
updatedAt: number
syncStatus: "pending" | "synced"
```
Indexes: `name`, `type`, `updatedAt`, `syncStatus`, `*tags`, `*linkedProjectIds`

A contact can belong to multiple projects.

### docEntries
```ts
id: string (pk)
projectId: string
type: "outline" | "phase"
title: string
content: string
order: number
createdAt: number
updatedAt: number
syncStatus: "pending" | "synced"
```
Indexes: `projectId`, `type`, `order`, `updatedAt`, `syncStatus`

### milestones
```ts
id: string (pk)
projectId: string
title: string
targetDate: number | null
status: "in_progress" | "achieved" | "missed"
/** Task ids that must complete before this milestone can be achieved. */
blockingTaskIds: string[]
createdAt: number
updatedAt: number
syncStatus: "pending" | "synced"
```
Indexes: `projectId`, `status`, `targetDate`, `updatedAt`, `syncStatus`, `*blockingTaskIds`

Auto-complete logic (in `src/data/milestones.ts`): when all `blockingTaskIds` tasks are `completed`, milestone → `achieved`; if any reopens → `in_progress`. `missed` is manual.

### issues
```ts
id: string (pk)
projectId: string
title: string
description: string
labels: string[]
severity: "low" | "medium" | "high"
status: "open" | "closed"
comments: { id: string; body: string; createdAt: number }[]
milestoneId: string | null
createdAt: number
updatedAt: number
syncStatus: "pending" | "synced"
```
Indexes: `projectId`, `status`, `severity`, `milestoneId`, `updatedAt`, `syncStatus`, `*labels`

### reminders
```ts
id: string (pk)
projectId: string | null
linkedEntityType: "task" | "milestone" | null
linkedEntityId: string | null
message: string
triggerAt: number
status: "pending" | "fired" | "dismissed"
createdAt: number
updatedAt: number
syncStatus: "pending" | "synced"
```
Indexes: `projectId`, `triggerAt`, `status`, `updatedAt`, `syncStatus`

### calendarEvents
```ts
id: string (pk)
projectId: string | null
title: string
description: string | null
startAt: number
endAt: number
source: "local" | "google"
meetLink: string | null
syncedAt: number | null
createdAt: number
updatedAt: number
```
Indexes: `projectId`, `source`, `startAt`, `endAt`, `updatedAt`

### scheduleItems
```ts
id: string (pk)
projectId: string | null
title: string
description: string | null
scheduledAt: number
durationMinutes: number | null
sourceTaskId: string | null
createdAt: number
updatedAt: number
```
Indexes: `projectId`, `scheduledAt`, `updatedAt`

### conversations
```ts
id: string (pk)
title: string
expiresAt: number  // auto-pruned after N days (default 7)
createdAt: number
updatedAt: number
```
Indexes: `expiresAt`, `createdAt`, `updatedAt`

### messages
```ts
id: string (pk)
conversationId: string
role: "user" | "assistant"
text: string
createdAt: number
```
Indexes: `conversationId`, `createdAt`

### settings
```ts
key: string (pk)
value: any
```
Keys:
- `appInitialized` (boolean)
- `geminiApiKey` (string)
- `googleCalendarClientId` (string)
- `googleCalendarToken` (GoogleToken)
- `secretsVault` (VaultMeta)
- `assistantRetentionDays` (number)

## Migration history

| Version | Description |
|---------|-------------|
| 2 | Initial shipped schema (goals, contacts, freeform resources) |
| 3 | goals → milestones (`goals: null`) |
| 4 | Fixed resource categories, calendarEvents, scheduleItems; contacts table, task executor/scheduledAt, drop goals |

## Supabase mapping

Each table maps 1:1 to a Supabase table. The `meta` JSONB column in `resources` holds all category-specific fields. Row-Level Security policies must be created per table.

---

_Update this doc when schema changes._