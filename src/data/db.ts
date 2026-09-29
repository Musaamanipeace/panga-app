// src/data/db.ts
// This is the ONLY file in the app allowed to talk to IndexedDB directly.
// Every other module (UI, sync, search) goes through the functions exported
// from this /data folder — never imports Dexie itself.

import Dexie, { type Table } from "dexie";

export type TaskStatus = "active" | "inactive" | "completed";
export type ProjectStatus = "active" | "archived";
export type IssueSeverity = "low" | "medium" | "high";
export type IssueStatus = "open" | "resolved";
export type MilestoneStatus = "in_progress" | "achieved" | "missed";
export type SyncStatus = "pending" | "synced";
export type CalendarEventSource = "local" | "google";
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
  | (string & {});

export interface ResourceImage {
  link: string;
  name: string;
  alt: string;
  dataUrl?: string; // legacy support for existing base64 images
}

export interface ResourceFile {
  name: string;
  link?: string; // for PDFs: Drive link
  text?: string; // for notes: parsed text content
  dataUrl?: string; // legacy support for existing base64 files
  type?: string; // legacy
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  notes: string;
  status: TaskStatus;
  executor: "ai" | "manual";
  dueDate: number | null;
  scheduledAt: number | null;
  estimatedMinutes: number | null;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
}

// Resource: a single unified entity with a fixed `category` enum.
// Category-specific fields live as explicit columns (locally) and map to a
// JSONB `meta` column in a future Supabase schema. Only fields relevant to
// a given category are populated; the rest are null / empty arrays.
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
  images: ResourceImage[]; // images
  files: ResourceFile[]; // notes (attached doc/pdf/spreadsheet), pdfs (Drive file info)
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
  projectId: string | null;
  linkedEntityType: "task" | "milestone" | null;
  linkedEntityId: string | null;
  message: string;
  triggerAt: number;
  status: "pending" | "fired" | "dismissed";
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
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
  googleCalendarClientId: "googleCalendarClientId",
  googleCalendarToken: "googleCalendarToken",
  googlePickerKey: "googlePickerKey",
  googleAccessToken: "googleAccessToken",
  driveFolderPrefix: "driveFolder:",
} as const;

class PangaDB extends Dexie {
  projects!: Table<Project, string>;
  tasks!: Table<Task, string>;
  resources!: Table<Resource, string>;
  docEntries!: Table<DocEntry, string>;
  milestones!: Table<Milestone, string>;
  issues!: Table<Issue, string>;
  contacts!: Table<Contact, string>;
  reminders!: Table<Reminder, string>;
  calendarEvents!: Table<CalendarEvent, string>;
  scheduleItems!: Table<ScheduleItem, string>;
  conversations!: Table<Conversation, string>;
  messages!: Table<Message, string>;
  insights!: Table<Insight, string>;
  settings!: Table<{ key: string; value: any }, string>;

  constructor() {
    super("panga-db");
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
  }
}

export const db = new PangaDB();

export async function ensureSeedData() {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    const initialized = await db.settings.get(SETTINGS_KEYS.appInitialized);
    if (!initialized) {
      await db.settings.put({ key: SETTINGS_KEYS.appInitialized, value: true });
    }
  } catch (e) {
    console.error("ensureSeedData error:", e);
  }
}
