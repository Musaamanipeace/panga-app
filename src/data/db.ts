// src/data/db.ts
// This is the ONLY file in the app allowed to talk to IndexedDB directly.
// Every other module (UI, sync, search) goes through the functions exported
// from this /data folder — never imports Dexie itself.

import Dexie, { type Table } from "dexie";

export type TaskStatus = "active" | "inactive" | "completed";
export type ProjectStatus = "active" | "archived";
export type ResourceCategory =
  | "link"
  | "script"
  | "location"
  | "name"
  | "reminder"
  | "contact"
  | "schedule"
  | "bookmark_group"
  | "file";
export type IssueSeverity = "low" | "medium" | "high";
export type IssueStatus = "open" | "resolved";
export type GoalStatus = "in_progress" | "achieved" | "missed";
export type SyncStatus = "pending" | "synced";

// A stored image on a resource. Data URLs keep everything in one place so the
// app works fully offline without a separate storage bucket.
export interface ResourceImage {
  dataUrl: string;
  name: string;
  alt: string;
}

// A configurable resource category. The built-in ones are seeded once; users
// can rename, add, or delete them freely (deleting reassigns its resources).
export interface ResourceCategoryDef {
  id: string;
  name: string;
  icon: string;
  color: string;
  supportsText: boolean;
  supportsImage: boolean;
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

export interface Resource {
  id: string;
  projectId: string;
  category: string;
  title: string;
  value: string; // meaning depends on category (URL, script text, address, JSON tab list, etc.)
  textBody: string; // long-form notes / body text specific to this resource
  images: ResourceImage[];
  notes: string;
  tags: string[];
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

export interface Goal {
  id: string;
  projectId: string;
  title: string;
  targetDate: number | null;
  status: GoalStatus;
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

export interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  discord: string | null;
  linkedProjectIds: string[];
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
}

export interface Reminder {
  id: string;
  projectId: string | null;
  linkedEntityType: "task" | "goal" | null;
  linkedEntityId: string | null;
  message: string;
  triggerAt: number;
  status: "pending" | "fired" | "dismissed";
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
}

// Default resource categories seeded on first run. `kind` decides what the
// editor shows: text-only, image-capable, or both.
export const DEFAULT_RESOURCE_CATEGORIES: ResourceCategoryDef[] = [
  { id: "link", name: "Link", icon: "🔗", color: "#3b82f6", supportsText: true, supportsImage: false },
  { id: "script", name: "Script", icon: "📜", color: "#8b5cf6", supportsText: true, supportsImage: true },
  { id: "location", name: "Location", icon: "📍", color: "#22c55e", supportsText: true, supportsImage: true },
  { id: "name", name: "Name of thing", icon: "🏷", color: "#f59e0b", supportsText: true, supportsImage: true },
  { id: "reminder", name: "Reminder note", icon: "⏰", color: "#ef4444", supportsText: true, supportsImage: false },
  { id: "contact", name: "Contact", icon: "👤", color: "#06b6d4", supportsText: true, supportsImage: true },
  { id: "schedule", name: "Task schedule", icon: "🗓", color: "#14b8a6", supportsText: true, supportsImage: false },
  { id: "bookmark_group", name: "Bookmark group", icon: "📑", color: "#f97316", supportsText: true, supportsImage: false },
  { id: "file", name: "File / local path", icon: "📁", color: "#64748b", supportsText: true, supportsImage: true },
];

class PangaDB extends Dexie {
  projects!: Table<Project, string>;
  tasks!: Table<Task, string>;
  resources!: Table<Resource, string>;
  docEntries!: Table<DocEntry, string>;
  goals!: Table<Goal, string>;
  issues!: Table<Issue, string>;
  contacts!: Table<Contact, string>;
  reminders!: Table<Reminder, string>;
  settings!: Table<{ key: string; value: any }, string>;

  constructor() {
    super("panga-db");
    this.version(2).stores({
      // Primary key first, then indexed fields. Arrays (tags) are
      // multi-entry indexed for tag-based filtering later.
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
  }
}

export const db = new PangaDB();

// One-time seed: make sure the settings table has the category list and any
// other bootstrap values the app relies on.
export async function ensureSeedData() {
  const hasCats = await db.settings.get("resourceCategories");
  if (!hasCats) {
    await db.settings.put({ key: "resourceCategories", value: DEFAULT_RESOURCE_CATEGORIES });
  }
}