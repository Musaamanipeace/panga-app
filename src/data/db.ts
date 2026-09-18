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
  category: ResourceCategory;
  title: string;
  value: string; // meaning depends on category (URL, script text, address, JSON tab list, etc.)
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

class PangaDB extends Dexie {
  projects!: Table<Project, string>;
  tasks!: Table<Task, string>;
  resources!: Table<Resource, string>;
  docEntries!: Table<DocEntry, string>;
  goals!: Table<Goal, string>;
  issues!: Table<Issue, string>;
  contacts!: Table<Contact, string>;
  reminders!: Table<Reminder, string>;

  constructor() {
    super("panga-db");
    this.version(1).stores({
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
    });
  }
}

export const db = new PangaDB();
