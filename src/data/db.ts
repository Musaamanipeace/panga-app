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
export type ContactType = "email" | "phone" | "social";

// Fixed resource categories (Supabase-shaped: category column + JSONB meta).
// No longer user-editable — each category has a known set of meta fields.
export type ResourceCategory =
  | "notes"
  | "scripts"
  | "prompts"
  | "ai_chat_links"
  | "reports_memos"
  | "links"
  | "contacts"
  | "secrets"
  | "images";

export interface ResourceImage {
  dataUrl: string;
  name: string;
  alt: string;
}

export interface ResourceFile {
  dataUrl: string;
  name: string;
  type: string;
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
  dueDate: number | null;
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
  projectId: string;
  category: ResourceCategory;
  title: string; // For contacts, this is the person/org name
  tags: string[];
  // Category-specific fields:
  url: string | null; // links, ai_chat_links
  provider: ResourceProvider | null; // ai_chat_links
  contactType: ContactType | null; // contacts
  value: string | null; // contacts (email/phone/social value), secrets (encrypted value)
  body: string | null; // notes, scripts, prompts, reports_memos
  images: ResourceImage[]; // images
  files: ResourceFile[]; // notes (attached doc/pdf/spreadsheet)
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
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
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

// Settings keys used across the app
export const SETTINGS_KEYS = {
  appInitialized: "appInitialized",
  geminiApiKey: "geminiApiKey",
  googleCalendarClientId: "googleCalendarClientId",
  googleCalendarToken: "googleCalendarToken",
  secretsVault: "secretsVault", // { verified: boolean }
} as const;

class PangaDB extends Dexie {
  projects!: Table<Project, string>;
  tasks!: Table<Task, string>;
  resources!: Table<Resource, string>;
  docEntries!: Table<DocEntry, string>;
  milestones!: Table<Milestone, string>;
  issues!: Table<Issue, string>;
  reminders!: Table<Reminder, string>;
  calendarEvents!: Table<CalendarEvent, string>;
  scheduleItems!: Table<ScheduleItem, string>;
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
    // scheduleItems, drop goals/contacts/resourceCategories settings, migrate data.
    this.version(4)
      .stores({
        projects: "id, status, updatedAt, syncStatus",
        tasks: "id, projectId, status, dueDate, updatedAt, syncStatus, *tags",
        resources: "id, projectId, category, updatedAt, syncStatus, *tags, contactType, provider",
        docEntries: "id, projectId, type, order, updatedAt, syncStatus",
        milestones: "id, projectId, status, targetDate, updatedAt, syncStatus, *blockingTaskIds",
        issues: "id, projectId, status, severity, updatedAt, syncStatus",
        reminders: "id, projectId, triggerAt, status, updatedAt, syncStatus",
        calendarEvents: "id, projectId, source, startAt, endAt, updatedAt",
        scheduleItems: "id, projectId, scheduledAt, updatedAt",
        settings: "key",
      })
      .upgrade(async (tx) => {
        // --- Migrate resources from freeform categories to fixed categories ---
        const oldResources = await tx.table("resources").toArray();
        const migrated: Record<string, unknown>[] = oldResources.map((r: any) => {
          const cat = r.category as string;
          let newCategory: ResourceCategory = "notes";
          let url: string | null = null;
          let value: string | null = null;
          let body: string | null = null;
          let contactType: ContactType | null = null;
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
            case "contact":
              newCategory = "contacts";
              if (r.email) {
                contactType = "email";
                value = r.email;
              } else if (r.phone) {
                contactType = "phone";
                value = r.phone;
              } else if (r.discord) {
                contactType = "social";
                value = r.discord;
              }
              body = r.textBody || null;
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
            contactType,
            value,
            body,
            images: r.images || [],
            files: [],
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            syncStatus: r.syncStatus,
          };
        });

        if (migrated.length) {
          await tx.table("resources").bulkUpdate(migrated);
        }

        // --- Migrate contacts table into resources ---
        const oldContacts = await tx.table("contacts").toArray();
        if (oldContacts.length) {
          const contactResources = oldContacts.map((c: any) => ({
            id: c.id,
            projectId: c.linkedProjectIds?.[0] ?? c.projectId ?? null,
            category: "contacts" as ResourceCategory,
            title: c.name,
            tags: c.tags || [],
            url: null,
            provider: null,
            contactType: c.email ? "email" as ContactType : c.phone ? "phone" : "social",
            value: c.email || c.phone || c.discord || null,
            body: null,
            images: [],
            files: [],
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            syncStatus: c.syncStatus,
          }));
          await tx.table("resources").bulkAdd(contactResources);
        }

        // --- Clean up old tables and settings ---
        await tx.table("contacts").clear();
        await tx.table("goals").clear();
        await db.settings.where("key").equals("resourceCategories").delete();
      });
  }
}

export const db = new PangaDB();

export async function ensureSeedData() {
  const initialized = await db.settings.get(SETTINGS_KEYS.appInitialized);
  if (!initialized) {
    await db.settings.put({ key: SETTINGS_KEYS.appInitialized, value: true });
  }
}
