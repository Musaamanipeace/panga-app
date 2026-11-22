// src/data/db.ts
// This is the ONLY file in the app allowed to talk to IndexedDB directly.
// Every other module (UI, sync, search) goes through the functions exported
// from this /data folder — never imports Dexie itself.

import Dexie, { type Table } from "dexie";
import { getSessionUserId } from "../auth/session";
import { newId } from "./utils";

export type TaskStatus = "active" | "inactive" | "completed";
export type TaskHorizon = "short" | "long";
export type ProjectStatus = "active" | "archived";
export type IssueSeverity = "low" | "medium" | "high";
export type IssueStatus = "open" | "resolved";
export type MilestoneStatus = "in_progress" | "achieved" | "missed";
export type SyncStatus = "pending" | "synced";
export type CalendarEventSource = "local" | "imported";
export type ResourceProvider = "gemini" | "claude" | "gpt" | "other";
export type ContactType = "email" | "phone" | "link";

export interface Contact {
  id: string;
  name: string;
  type: ContactType;
  value: string;
  tags: string[];
  linkedProjectIds: string[];
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
}

// Fixed and user-added resource categories.
export type ResourceCategory =
  | "notes"
  | "scripts"
  | "links"
  | "images"
  | "pdfs"
  | "lists"
  | "checklists"
  | "preset-list"
  | (string & {});

export interface ResourceImage {
  link: string;
  name: string;
  alt: string;
  dataUrl?: string; // legacy support for existing base64 images
}

export interface ResourceFile {
  name: string;
  link?: string; // for PDFs: link to the document
  text?: string; // for notes: parsed text content
  dataUrl?: string; // legacy support for existing base64 files
  type?: string; // legacy
}

export interface ResourceListItem {
  id: string;
  /** Optional label that names/orders the item (e.g. "Production DB URL"). */
  title?: string;
  /** The actual element — this is what the Copy button copies. */
  text: string;
  checked: boolean;
  tags: string[];
}

/** Workspace kinds: project | activity | idea share the same table. */
export type WorkspaceKind = "project" | "activity" | "idea";

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  /** project (default), activity (events/chores/etc), or idea (not yet evolved). */
  kind?: WorkspaceKind;
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
}

export interface Task {
  id: string;
  listId: string | null;      // top-level tasks belong to a list; null = unsorted/inbox
  parentId: string | null;    // subtasks point at a parent task; null = root of a list
  title: string;
  notes: string;
  status: "active" | "completed" | "inactive";
  completed: boolean;         // primary check state
  dueDate: number | null;
  order: number;              // sibling order under same parent / list
  tags: string[];
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
  userId?: string; // when logged in
  // Legacy project-model fields retained for backward compatibility during the
  // transition. The primary UX no longer writes them.
  projectId?: string | null;
  executor?: "ai" | "manual";
  scheduledAt?: number | null;
  estimatedMinutes?: number | null;
  horizon?: TaskHorizon;
}

// Task lists — top-level containers for tasks.
export interface TaskList {
  id: string;
  folderId: string | null;    // null = unfiled (shows at root)
  title: string;
  description?: string;
  order: number;
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
  userId?: string; // when logged in
}

// Task list folders — named folders that can contain task lists and subfolders.
export interface TaskListFolder {
  id: string;
  parentFolderId: string | null; // null = root folder
  title: string;
  order: number;
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
  userId?: string; // when logged in
}

// Link folders — named folders that contain links.
export interface LinkFolder {
  id: string;
  parentFolderId: string | null; // null = root folder
  title: string;
  order: number;
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
  userId?: string; // when logged in
}

// Note folders — named folders that contain notes. Folder acts as the note's
// categorisation, so notes have no separate category field.
export interface NoteFolder {
  id: string;
  parentFolderId: string | null; // null = root folder
  title: string;
  order: number;
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
  userId?: string; // when logged in
}

// Links — dedicated bookmarks (replaces overloading resources with category "links").
export interface Link {
  id: string;
  folderId: string | null;    // null = unsorted
  title: string;
  url: string;
  notes?: string;
  tags: string[];
  order: number;
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
  userId?: string; // when logged in
}

// Notes — dedicated notes table (replaces overloading resources with category "notes").
export interface Note {
  id: string;
  folderId: string | null;    // null = unsorted/inbox note folder
  title: string;
  body: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
  userId?: string; // when logged in
}

// Resource: a single unified entity with a fixed `category` enum.
// Category-specific fields live as explicit columns locally.
// Only fields relevant to a given category are populated; the rest are null / empty arrays.
export interface Resource {
  id: string;
  projectId: string | null;
  category: ResourceCategory;
  title: string;
  tags: string[];
  // Category-specific fields:
   url: string | null; // links
  provider: ResourceProvider | null; // links (AI chat links)
  body: string | null; // notes, scripts, links
  listItems: ResourceListItem[]; // preset-list: structured checklist items
  customFields: Record<string, string>; // custom resource types: user-defined key-value metadata
  images: ResourceImage[]; // images
  files: ResourceFile[]; // notes (attached doc/pdf/spreadsheet), pdfs (file info)
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
}

export interface DocEntry {
  id: string;
  projectId: string;
  type: "outline" | "phase";
  title: string;
  content: string;
  order: number;
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  targetDate: number | null;
  status: MilestoneStatus;
  /** Task ids that must complete before this milestone can be achieved. */
  blockingTaskIds: string[];
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
}

export interface Issue {
  id: string;
  projectId: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  status: IssueStatus;
  labels: string[];
  comments: IssueComment[];
  milestoneId: string | null;
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
}

export interface IssueComment {
  id: string;
  issueId: string;
  text: string;
  createdAt: number;
  updatedAt: number;
}

export interface Reminder {
  id: string;
  folderId: string | null;    // null = unfiled (shows at root)
  toneId?: string;            // e.g. "default" | "chime" | "soft" | "urgent"
  linkedEntityType: "task" | "note" | null;
  linkedEntityId: string | null;
  message: string;
  triggerAt: number;
  status: "pending" | "fired" | "dismissed";
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
  userId?: string; // when logged in
}

// Reminder folders — named folders that can contain reminders and subfolders.
export interface ReminderFolder {
  id: string;
  parentFolderId: string | null; // null = root folder
  title: string;
  order: number;
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
  userId?: string; // when logged in
}

export type InsightType = "note" | "link" | "image" | "pdf";

export interface Insight {
  id: string;
  projectId: string;
  title: string;
  body: string | null;
  type: InsightType;
  link: string | null;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
}

export interface CalendarEvent {
  id: string;
  projectId: string | null;
  title: string;
  description: string | null;
  startAt: number;
  endAt: number;
  source: CalendarEventSource;
  hangoutLink: string | null;
  syncedAt: number | null;
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
}

export interface ScheduleItem {
  id: string;
  projectId: string | null;
  title: string;
  description: string | null;
  scheduledAt: number;
  durationMinutes: number | null;
  sourceTaskId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Conversation {
  id: string;
  title: string;
  expiresAt: number;
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  text: string;
  createdAt: number;
}

// Settings keys used across the app
export const SETTINGS_KEYS = {
  appInitialized: "appInitialized",
  geminiApiKey: "geminiApiKey",
} as const;

// Derive a stable, per-user database name from the logged-in user ID.
// This ensures each user gets their own isolated IndexedDB database.
export function getUserDbName(): string {
  const userId = getSessionUserId();
  if (!userId) return "panga-db-guest";
  return `panga-db-${userId}`;
}

export interface Draft {
  id: string;
  entityType: string;
  entityId: string | null;
  content: string;
  title: string | null;
  updatedAt: number;
}

export interface ActivityLog {
  id: string;
  entityType: string;
  entityId: string | null;
  projectId: string | null;
  action: string;
  description: string;
  timestamp: number;
  userId: string | null;
}

/** A PDF stored on this device (never uploaded to the cloud). */
export interface PdfDoc {
  id: string;
  name: string;
  size: number;
  blob: Blob;
  createdAt: number;
  updatedAt: number;
}

export interface ThoughtEntry {
  id: string;
  text: string;
  /** Set once the thought has been turned into a task. */
  taskId?: string | null;
  /** Set once the thought has been turned into a note. */
  noteId?: string | null;
  projectContext: string | null;
  createdAt: number;
  updatedAt: number;
}

class PangaDB extends Dexie {
  projects!: Table<Project, string>;
  tasks!: Table<Task, string>;
  taskLists!: Table<TaskList, string>;
  taskListFolders!: Table<TaskListFolder, string>;
  resources!: Table<Resource, string>;
  links!: Table<Link, string>;
  linkFolders!: Table<LinkFolder, string>;
  noteFolders!: Table<NoteFolder, string>;
  notes!: Table<Note, string>;
  docEntries!: Table<DocEntry, string>;
  milestones!: Table<Milestone, string>;
  issues!: Table<Issue, string>;
  contacts!: Table<Contact, string>;
  reminders!: Table<Reminder, string>;
  reminderFolders!: Table<ReminderFolder, string>;
  calendarEvents!: Table<CalendarEvent, string>;
  scheduleItems!: Table<ScheduleItem, string>;
  conversations!: Table<Conversation, string>;
  messages!: Table<Message, string>;
  insights!: Table<Insight, string>;
  settings!: Table<{ key: string; value: any }, string>;
  drafts!: Table<Draft, string>;
  activityLog!: Table<ActivityLog, string>;
  trainOfThought!: Table<ThoughtEntry, string>;
  pdfDocs!: Table<PdfDoc, string>;

  constructor() {
    super(getUserDbName());
    this.version(2).stores({
      projects: "id, status, updatedAt, syncStatus",
      tasks: "id, projectId, status, dueDate, updatedAt, syncStatus, *tags",
      resources: "id, projectId, category, updatedAt, syncStatus, *tags",
      docEntries: "id, projectId, type, order, updatedAt, syncStatus",
      goals: "id, projectId, status, targetDate, updatedAt, syncStatus",
      issues: "id, projectId, status, severity, updatedAt, syncStatus",
      contacts: "id, name, updatedAt, syncStatus, *linkedProjectIds",
      reminders: "id, projectId, triggerAt, status, updatedAt, syncStatus",
      settings: "key",
    });
    this.version(3)
      .stores({
        projects: "id, status, updatedAt, syncStatus",
        tasks: "id, projectId, status, dueDate, updatedAt, syncStatus, *tags",
        resources: "id, projectId, category, updatedAt, syncStatus, *tags",
        docEntries: "id, projectId, type, order, updatedAt, syncStatus",
        goals: null,
        milestones: "id, projectId, status, targetDate, updatedAt, syncStatus, *blockingTaskIds",
        issues: "id, projectId, status, severity, updatedAt, syncStatus",
        contacts: "id, name, updatedAt, syncStatus, *linkedProjectIds",
        reminders: "id, projectId, triggerAt, status, updatedAt, syncStatus",
        settings: "key",
      })
      .upgrade(async (tx) => {
        const oldGoals = await tx.table("goals").toArray();
        if (oldGoals.length) {
          await tx.table("milestones").bulkAdd(
            oldGoals.map((g: Record<string, unknown>) => ({ ...g, blockingTaskIds: [] }))
          );
        }
      });

    // v4: fixed resource categories + category-specific fields, calendarEvents,
    // scheduleItems, contacts table, drop goals/resourceCategories settings, migrate data.
    this.version(4)
      .stores({
        projects: "id, status, updatedAt, syncStatus",
        tasks: "id, projectId, status, dueDate, scheduledAt, executor, updatedAt, syncStatus, *tags",
        resources: "id, projectId, category, updatedAt, syncStatus, *tags, provider",
        docEntries: "id, projectId, type, order, updatedAt, syncStatus",
        milestones: "id, projectId, status, targetDate, updatedAt, syncStatus, *blockingTaskIds",
        issues: "id, projectId, status, severity, updatedAt, syncStatus",
        contacts: "id, name, type, value, updatedAt, syncStatus, *tags, *linkedProjectIds",
        reminders: "id, projectId, triggerAt, status, updatedAt, syncStatus",
        calendarEvents: "id, projectId, source, startAt, endAt, updatedAt",
        scheduleItems: "id, projectId, scheduledAt, updatedAt",
        conversations: "id, expiresAt, createdAt, updatedAt",
        messages: "id, conversationId, createdAt",
        settings: "key",
      })
      .upgrade(async (tx) => {
        try {
          // --- Migrate resources from freeform categories to fixed categories ---
          const oldResources = await tx.table("resources").toArray();
          const migrated: Record<string, unknown>[] = oldResources.map((r: any) => {
            const cat = r.category as string;
            let newCategory: ResourceCategory = "notes";
            let url: string | null = null;
            let body: string | null = null;
            let provider: ResourceProvider | null = null;

            switch (cat) {
              case "link":
                newCategory = "links";
                url = r.value || null;
                body = r.textBody || r.notes || null;
                break;
              case "script":
                newCategory = "scripts";
                body = r.textBody || r.value || r.notes || null;
                break;
              case "prompts":
                newCategory = "notes";
                body = r.textBody || r.value || r.notes || null;
                break;
              case "ai_chat_links":
                newCategory = "links";
                url = r.value || null;
                provider = r.provider || null;
                body = r.textBody || r.notes || null;
                break;
              case "reports_memos":
                newCategory = "notes";
                body = r.textBody || r.value || r.notes || null;
                break;
              case "location":
                newCategory = "notes";
                body = r.textBody || r.value || r.notes || null;
                break;
              case "name":
                newCategory = "notes";
                body = r.textBody || r.value || r.notes || null;
                break;
              case "reminder":
                newCategory = "notes";
                body = r.textBody || r.value || r.notes || null;
                break;
              case "schedule":
                newCategory = "notes";
                body = r.textBody || r.value || r.notes || null;
                break;
              case "bookmark_group":
                newCategory = "links";
                body = r.textBody || r.value || r.notes || null;
                break;
              case "file":
                newCategory = "notes";
                body = r.textBody || r.notes || null;
                break;
              case "images":
                newCategory = "images";
                break;
              case "pdfs":
                newCategory = "pdfs";
                break;
              default:
                newCategory = "notes";
                body = r.textBody || r.value || r.notes || null;
            }

            return {
              id: r.id,
              projectId: r.projectId,
              category: newCategory,
              title: r.title,
              tags: r.tags || [],
              url,
              provider,
              body,
              images: r.images || [],
              files: [],
              createdAt: r.createdAt,
              updatedAt: r.updatedAt,
              syncStatus: r.syncStatus,
            };
          });

          if (migrated.length) {
            await tx.table("resources").bulkPut(migrated);
          }
        } catch (e) {
          console.warn("Resources upgrade error:", e);
        }

        // Clean up old settings without accessing db directly
        try {
          await tx.table("settings").delete("resourceCategories");
        } catch {}
      });

    // v5: add insights table + milestone description
    this.version(5)
      .stores({
        milestones: "id, projectId, status, targetDate, updatedAt, syncStatus, *blockingTaskIds",
        insights: "id, projectId, type, updatedAt, syncStatus, *tags",
      })
      .upgrade(async (tx) => {
        try {
          // Backfill description for existing milestones
          const ms = await tx.table("milestones").toArray();
          for (const m of ms) {
            if ((m as any).description === undefined || (m as any).description === null) {
              await tx.table("milestones").where("id").equals(m.id).modify({ description: "" });
            }
          }
        } catch (e) {
          console.warn("Milestones upgrade error:", e);
        }
      });

    // v6: index createdAt on tasks and issues for sorting
    this.version(6).stores({
      tasks: "id, projectId, status, dueDate, scheduledAt, executor, createdAt, updatedAt, syncStatus, *tags",
      issues: "id, projectId, status, severity, createdAt, updatedAt, syncStatus",
    });

    // v7: syncStatus on calendarEvents for multi-device sync
    this.version(7)
      .stores({
        calendarEvents: "id, projectId, source, startAt, endAt, updatedAt, syncStatus",
      })
      .upgrade(async (tx) => {
        try {
          const events = await tx.table("calendarEvents").toArray();
          for (const e of events) {
            if ((e as any).syncStatus === undefined) {
              await tx
                .table("calendarEvents")
                .where("id")
                .equals(e.id)
                .modify({ syncStatus: "pending" });
            }
          }
        } catch (err) {
          console.warn("calendarEvents upgrade error:", err);
        }
      });

    // v8: add listItems/customFields to resources, add drafts table
    this.version(8).stores({
      resources: "id, projectId, category, updatedAt, syncStatus, *tags, provider",
      drafts: "id, entityType, entityId, updatedAt",
    }).upgrade(async (tx) => {
      try {
        const resources = await tx.table("resources").toArray();
        for (const r of resources) {
          if ((r as any).listItems === undefined) {
            await tx.table("resources").where("id").equals(r.id).modify({ listItems: [] });
          }
          if ((r as any).customFields === undefined) {
            await tx.table("resources").where("id").equals(r.id).modify({ customFields: {} });
          }
        }
      } catch (e) {
        console.warn("Resources v8 upgrade error:", e);
      }
    });

    // v9: add activityLog, trainOfThought tables
    this.version(9).stores({
      activityLog: "id, entityType, entityId, projectId, timestamp",
      trainOfThought: "id, createdAt, projectContext",
    });

    // v10: PDFs kept on-device for the reader
    this.version(10).stores({
      pdfDocs: "id, createdAt",
    });

    // v11: Panga reshape — task lists, hierarchical tasks, link folders, links,
    // dedicated notes, reminder tones. Old project/resource tables are kept
    // readable for one release but no longer written by the primary UX.
    this.version(11).stores({
      taskLists: "id, order, updatedAt, syncStatus",
      tasks: "id, listId, parentId, projectId, scheduledAt, status, dueDate, completed, order, updatedAt, syncStatus, *tags",
      linkFolders: "id, order, updatedAt, syncStatus",
      links: "id, folderId, updatedAt, syncStatus, *tags",
      notes: "id, updatedAt, syncStatus, *tags",
      // legacy tables retained for read-only access during the transition
      projects: "id, status, updatedAt, syncStatus",
      resources: "id, projectId, category, updatedAt, syncStatus, *tags, provider",
      reminders: "id, triggerAt, status, updatedAt, syncStatus",
    }).upgrade(async (tx) => {
      const nowMs = Date.now();
      const INBOX_TITLE = "Inbox";

      try {
        // --- Ensure a default Inbox task list exists ---
        const existingInbox = await tx.table("taskLists").toArray();
        let inboxId: string;
        if (existingInbox.length === 0) {
          inboxId = newId();
          await tx.table("taskLists").add({
            id: inboxId,
            title: INBOX_TITLE,
            description: "Default task list created during the Panga reshape.",
            order: 0,
            createdAt: nowMs,
            updatedAt: nowMs,
            syncStatus: "pending",
          });
        } else {
          inboxId = existingInbox.sort((a, b) => a.order - b.order)[0].id;
        }

        // --- Map existing tasks to task lists ---
        const oldTasks = await tx.table("tasks").toArray();
        const listForProject = new Map<string, string>();
        const listsToCreate: Record<string, unknown>[] = [];
        let listOrder = existingInbox.length;

        for (const t of oldTasks as any[]) {
          let listId: string | null = inboxId;
          if (t.projectId) {
            if (!listForProject.has(t.projectId)) {
              const listId_ = newId();
              listForProject.set(t.projectId, listId_);
              listsToCreate.push({
                id: listId_,
                title: `Imported from ${t.projectId}`,
                description: "Tasks imported from a project during the Panga reshape.",
                order: listOrder++,
                createdAt: nowMs,
                updatedAt: nowMs,
                syncStatus: "pending",
              });
            }
            listId = listForProject.get(t.projectId) ?? null;
          }
          await tx.table("tasks").where("id").equals(t.id).modify({
            listId,
            parentId: null,
            completed: t.status === "completed",
            order: t.order ?? 0,
            // Keep legacy fields readable but stop populating them.
            projectId: t.projectId,
          });
        }
        if (listsToCreate.length) {
          await tx.table("taskLists").bulkAdd(listsToCreate);
        }

        // --- Migrate link resources (category "links") to dedicated links table ---
        const linkResources = await tx.table("resources").where("category").equals("links").toArray();
        let folderOrder = 0;
        const unsortedFolderId = newId();
        await tx.table("linkFolders").add({
          id: unsortedFolderId,
          title: "Unsorted links",
          order: folderOrder++,
          createdAt: nowMs,
          updatedAt: nowMs,
          syncStatus: "pending",
        });
        const linksToAdd: Record<string, unknown>[] = linkResources.map((r: any) => ({
          id: r.id,
          folderId: unsortedFolderId,
          title: r.title || r.url || "Untitled link",
          url: r.url || "",
          notes: r.body ?? null,
          tags: r.tags || [],
          order: r.order ?? 0,
          createdAt: r.createdAt ?? nowMs,
          updatedAt: r.updatedAt ?? nowMs,
          syncStatus: r.syncStatus ?? "pending",
        }));
        if (linksToAdd.length) {
          await tx.table("links").bulkAdd(linksToAdd);
        }

        // --- Migrate note resources (category "notes") to dedicated notes table ---
        const noteResources = await tx.table("resources").where("category").equals("notes").toArray();
        const notesToAdd: Record<string, unknown>[] = noteResources.map((r: any) => ({
          id: r.id,
          title: r.title || "Untitled note",
          body: r.body ?? "",
          tags: r.tags || [],
          createdAt: r.createdAt ?? nowMs,
          updatedAt: r.updatedAt ?? nowMs,
          syncStatus: r.syncStatus ?? "pending",
        }));
        if (notesToAdd.length) {
          await tx.table("notes").bulkAdd(notesToAdd);
        }
      } catch (e) {
        console.warn("v11 migration error:", e);
      }
    });

    // v12: note folders — notes live inside folders; the folder is the note's
    // categorisation, so notes have no separate category field.
    this.version(12).stores({
      noteFolders: "id, order, updatedAt, syncStatus",
      notes: "id, folderId, updatedAt, syncStatus, *tags",
    }).upgrade(async (tx) => {
      const nowMs = Date.now();
      try {
        // Ensure a default Inbox note folder exists
        const existingFolders = await tx.table("noteFolders").toArray();
        let inboxFolderId: string;
        if (existingFolders.length === 0) {
          inboxFolderId = newId();
          await tx.table("noteFolders").add({
            id: inboxFolderId,
            title: "Inbox",
            order: 0,
            createdAt: nowMs,
            updatedAt: nowMs,
            syncStatus: "pending",
          });
        } else {
          inboxFolderId = existingFolders.sort((a, b) => a.order - b.order)[0].id;
        }
        // Migrate existing notes into the Inbox folder
        const notes = await tx.table("notes").toArray();
        for (const n of notes as any[]) {
          if (n.folderId === undefined || n.folderId === null) {
            await tx.table("notes").where("id").equals(n.id).modify({ folderId: inboxFolderId });
          }
        }
        } catch (e) {
          console.warn("v12 migration error:", e);
        }
      });

    // v13: nested folders — parentFolderId on link/note folders, folderId on
    // task lists and reminders, plus new taskListFolders and reminderFolders tables.
    this.version(13).stores({
      taskLists: "id, folderId, order, updatedAt, syncStatus",
      taskListFolders: "id, parentFolderId, order, updatedAt, syncStatus",
      linkFolders: "id, parentFolderId, order, updatedAt, syncStatus",
      noteFolders: "id, parentFolderId, order, updatedAt, syncStatus",
      reminders: "id, folderId, triggerAt, status, updatedAt, syncStatus",
      reminderFolders: "id, parentFolderId, order, updatedAt, syncStatus",
    }).upgrade(async (tx) => {
      const nowMs = Date.now();
      try {
        // Seed a default root folder for domains that now have folders.
        const existingTLF = await tx.table("taskListFolders").toArray();
        if (existingTLF.length === 0) {
          await tx.table("taskListFolders").add({
            id: newId(),
            title: "Inbox",
            parentFolderId: null,
            order: 0,
            createdAt: nowMs,
            updatedAt: nowMs,
            syncStatus: "pending",
          });
        }
        const existingRF = await tx.table("reminderFolders").toArray();
        if (existingRF.length === 0) {
          await tx.table("reminderFolders").add({
            id: newId(),
            title: "Inbox",
            parentFolderId: null,
            order: 0,
            createdAt: nowMs,
            updatedAt: nowMs,
            syncStatus: "pending",
          });
        }
        // Backfill parentFolderId = null on existing link/note folders.
        for (const table of ["linkFolders", "noteFolders"]) {
          const rows = await tx.table(table).toArray();
          for (const f of rows as any[]) {
            if (f.parentFolderId === undefined) {
              await tx.table(table).where("id").equals(f.id).modify({ parentFolderId: null });
            }
          }
        }
      } catch (e) {
        console.warn("v13 migration error:", e);
      }
    });
  }
}

// Initialize the DB instance. The name is derived from the current session user ID.
// Use switchUserAccount() to switch between user databases after sign-in.
export let db: PangaDB = new PangaDB();

/**
 * Closes the current Dexie connection and creates a fresh instance with the
 * correct per-user database name. Called after setSession() to switch DB
 * between accounts.
 */
export async function switchUserAccount(): Promise<void> {
  try {
    if (db && db.isOpen()) {
      await db.close();
    }
  } catch (e) {
    console.warn("switchUserAccount close error:", e);
  }
  db = new PangaDB();
  try {
    await db.open();
  } catch (e) {
    console.warn("switchUserAccount open error:", e);
  }
}

/**
 * While true, table change hooks (used by auto-sync) are ignored. Set during
 * bulk restore/clear so an import never triggers an upload of half-loaded data.
 */
export let suppressChangeHooks = false;
export function setSuppressChangeHooks(v: boolean) {
  suppressChangeHooks = v;
}

const LEGACY_SEED_PURGED_KEY = "legacySeedPurged";

/**
 * Opens the DB and marks the app as initialised. It NEVER creates projects or
 * resources: anything the user deletes must stay deleted across reloads.
 *
 * One-time cleanup: earlier builds seeded a hard-coded "Main Project" plus
 * starter list/checklist resources (and re-created them whenever they were
 * missing). Those test records are purged once here, then never touched again.
 */
export async function ensureSeedData() {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    const initialized = await db.settings.get(SETTINGS_KEYS.appInitialized);
    if (!initialized) {
      await db.settings.put({ key: SETTINGS_KEYS.appInitialized, value: true });
    }

    const purged = await db.settings.get(LEGACY_SEED_PURGED_KEY);
    if (!purged) {
      const legacyProjectId = "project_default";
      const legacyResourceIds = new Set(["res_default_list", "res_default_checklist"]);
      const isLegacyResource = (r: Resource) =>
        legacyResourceIds.has(r.id) ||
        ((r.id.startsWith("res_list_") || r.id.startsWith("res_chk_")) &&
          (r.tags || []).includes("default"));

      await db.transaction(
        "rw",
        [
          db.projects,
          db.tasks,
          db.resources,
          db.docEntries,
          db.milestones,
          db.issues,
          db.reminders,
          db.calendarEvents,
          db.scheduleItems,
          db.insights,
          db.settings,
        ],
        async () => {
          const resources = await db.resources.toArray();
          const doomed = resources.filter(
            (r) => r.projectId === legacyProjectId || isLegacyResource(r)
          );
          if (doomed.length) await db.resources.bulkDelete(doomed.map((r) => r.id));

          if (await db.projects.get(legacyProjectId)) {
            await db.tasks.where("projectId").equals(legacyProjectId).delete();
            await db.docEntries.where("projectId").equals(legacyProjectId).delete();
            await db.milestones.where("projectId").equals(legacyProjectId).delete();
            await db.issues.where("projectId").equals(legacyProjectId).delete();
            await db.reminders.where("projectId").equals(legacyProjectId).delete();
            await db.calendarEvents.where("projectId").equals(legacyProjectId).delete();
            await db.scheduleItems.where("projectId").equals(legacyProjectId).delete();
            await db.insights.where("projectId").equals(legacyProjectId).delete();
            await db.projects.delete(legacyProjectId);
          }
          await db.settings.put({ key: LEGACY_SEED_PURGED_KEY, value: true });
        }
      );
    }
  } catch (e) {
    console.error("ensureSeedData error:", e);
  }
}

export const SENSITIVE_SETTING_KEYS = new Set(["geminiApiKey"]);

export function isSensitiveSettingKey(key: string): boolean {
  if (!key) return false;
  if (SENSITIVE_SETTING_KEYS.has(key)) return true;
  const lower = key.toLowerCase();
  return (
    lower.includes("token") ||
    lower.includes("password") ||
    lower.includes("secret") ||
    lower.includes("apikey") ||
    lower.includes("api_key")
  );
}

/**
 * Export the entire local database state as a plain serializable object.
 * Used by the snapshot/backup system. Strictly excludes all tokens, passwords,
 * and API keys to prevent secret exposure (e.g. GitHub PAT revocation).
 */
export async function exportDbState(options: { includeSecrets?: boolean } = {}): Promise<Record<string, any[]>> {
  if (!db.isOpen()) await db.open();
  const includeSecrets = options.includeSecrets === true;

  const tables = [
    "projects",
    "taskLists",
    "taskListFolders",
    "tasks",
    "linkFolders",
    "noteFolders",
    "links",
    "notes",
    "resources",
    "docEntries",
    "milestones",
    "issues",
    "contacts",
    "reminders",
    "reminderFolders",
    "calendarEvents",
    "scheduleItems",
    "conversations",
    "messages",
    "insights",
    "settings",
    "drafts",
    "activityLog",
    "trainOfThought",
  ];

  const data: Record<string, any[]> = {};
  for (const name of tables) {
    try {
      if (name === "settings") {
        // Secret tokens/passwords are only included for a full snapshot restore.
        const rows = await db.settings.toArray();
        data[name] = includeSecrets ? rows : rows.filter((r) => !isSensitiveSettingKey(r.key));
      } else {
        data[name] = await (db as any)[name].toArray();
      }
    } catch {
      data[name] = [];
    }
  }
  return data;
}

/**
 * Replace all user-table contents with the provided data.
 * Clears each table first, then bulk-loads. Call within a write transaction
 * for atomicity.
 * Preserves the user's existing local credentials (tokens, API keys, passwords)
 * so restoring data never erases or breaks cloud sync authentication.
 */
export async function importDbState(data: Record<string, any[]>, options: { includeSecrets?: boolean } = {}): Promise<void> {
  if (!db.isOpen()) await db.open();
  const includeSecrets = options.includeSecrets === true;

  const tables = [
    "projects",
    "taskLists",
    "taskListFolders",
    "tasks",
    "linkFolders",
    "noteFolders",
    "links",
    "notes",
    "resources",
    "docEntries",
    "milestones",
    "issues",
    "contacts",
    "reminders",
    "reminderFolders",
    "calendarEvents",
    "scheduleItems",
    "conversations",
    "messages",
    "insights",
    "settings",
    "drafts",
    "activityLog",
    "trainOfThought",
  ];

  // Capture existing local credentials to preserve them
  let localCredentialsToKeep: any[] = [];
  try {
    const currentSettings = await db.settings.toArray();
    localCredentialsToKeep = currentSettings.filter((r) => isSensitiveSettingKey(r.key));
  } catch {}

  // Use the array form of transaction to avoid argument limit
  suppressChangeHooks = true;
  try {
  await db.transaction("rw", tables, async () => {
    for (const name of tables) {
      const tableData = data[name] ?? [];
      const table = (db as any)[name];
      if (table) {
        if (name === "settings") {
          await table.clear();
          // A full snapshot restore keeps its credentials; ordinary imports do not.
          const safeIncoming = includeSecrets ? tableData : tableData.filter((r: any) => !isSensitiveSettingKey(r.key));
          if (safeIncoming.length > 0) {
            await table.bulkAdd(safeIncoming);
          }
          // Keep local credentials unless the snapshot supplied its own value.
          for (const cred of localCredentialsToKeep) {
            if (!safeIncoming.some((r: any) => r.key === cred.key)) await table.put(cred);
          }
        } else {
          await table.clear();
          if (tableData.length > 0) {
            await table.bulkAdd(tableData);
          }
        }
      }
    }
  });
  } finally {
    suppressChangeHooks = false;
  }
}

/**
 * Merge data into the current user's store without clearing it. Used when a
 * guest upgrades to an account and wants to bring their local data along.
 */
export async function mergeDbState(data: Record<string, any[]>): Promise<void> {
  if (!db.isOpen()) await db.open();
  const tables = [
    "projects", "taskLists", "taskListFolders", "tasks", "linkFolders",
    "noteFolders", "links", "notes", "resources", "docEntries", "milestones",
    "issues", "contacts", "reminders", "reminderFolders", "calendarEvents",
    "scheduleItems", "conversations", "messages", "insights", "drafts",
    "activityLog", "trainOfThought",
  ];
  suppressChangeHooks = true;
  try {
    await db.transaction("rw", tables, async () => {
      for (const name of tables) {
        const rows = data[name] ?? [];
        if (!rows.length) continue;
        const table = (db as any)[name];
        if (table) await table.bulkPut(rows);
      }
    });
  } finally {
    suppressChangeHooks = false;
  }
}

/** Quick check: does any user data exist in the local database? */
export async function hasLocalData(): Promise<boolean> {
  if (!db.isOpen()) await db.open();
  const tables = [
    "projects",
    "taskLists",
    "taskListFolders",
    "tasks",
    "linkFolders",
    "noteFolders",
    "links",
    "notes",
    "resources",
    "docEntries",
    "milestones",
    "issues",
    "contacts",
    "reminders",
    "reminderFolders",
    "calendarEvents",
    "scheduleItems",
    "conversations",
    "messages",
    "insights",
    "drafts",
    "activityLog",
    "trainOfThought",
  ];
  const counts = await Promise.all(
    tables.map((t) => (db as any)[t]?.count().catch(() => 0))
  );
  return counts.some((c: number) => c > 0);
}

/**
 * Permanently clears all local database tables.
 * Used when a user chooses to "Start Afresh" so no previous local data is resumed.
 */
export async function clearAllLocalData(): Promise<void> {
  if (!db.isOpen()) await db.open();
  const tables = [
    "projects",
    "taskLists",
    "taskListFolders",
    "tasks",
    "linkFolders",
    "noteFolders",
    "links",
    "notes",
    "resources",
    "docEntries",
    "milestones",
    "issues",
    "contacts",
    "reminders",
    "reminderFolders",
    "calendarEvents",
    "scheduleItems",
    "conversations",
    "messages",
    "insights",
    "settings",
    "drafts",
    "activityLog",
    "trainOfThought",
  ];

  suppressChangeHooks = true;
  try {
    await db.transaction("rw", tables, async () => {
      for (const name of tables) {
        const table = (db as any)[name];
        if (table) {
          await table.clear();
        }
      }
    });
  } finally {
    suppressChangeHooks = false;
  }

  // Re-create only the essential initial settings (no sample data)
  await ensureSeedData();
}

