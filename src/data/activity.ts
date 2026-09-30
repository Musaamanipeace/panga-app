// src/data/activity.ts
// Activity log for tracking CRUD actions across projects, tasks, resources, and docs.
import { db, type ActivityLog } from "./db";
import { newId } from "./utils";
import { getSessionUserId } from "../auth/session";

export type { ActivityLog };

export type ActivityEntityType =
  | "project"
  | "task"
  | "resource"
  | "docEntry"
  | "milestone"
  | "issue"
  | "contact"
  | "reminder"
  | "insight"
  | "calendarEvent";

export type ActivityAction = "created" | "updated" | "deleted" | "status_changed";

export async function logActivity(input: {
  entityType: ActivityEntityType;
  entityId?: string | null;
  projectId?: string | null;
  action: ActivityAction;
  description: string;
}): Promise<ActivityLog> {
  try {
    if (!db.isOpen()) await db.open();
    const entry: ActivityLog = {
      id: newId(),
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      projectId: input.projectId ?? null,
      action: input.action,
      description: input.description,
      timestamp: Date.now(),
      userId: getSessionUserId(),
    };
    await db.activityLog.add(entry);
    return entry;
  } catch (e) {
    console.warn("logActivity error:", e);
    return {
      id: newId(),
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      projectId: input.projectId ?? null,
      action: input.action,
      description: input.description,
      timestamp: Date.now(),
      userId: getSessionUserId(),
    };
  }
}

export async function getRecentActivity(limit = 50): Promise<ActivityLog[]> {
  if (!db.isOpen()) await db.open();
  return db.activityLog.orderBy("timestamp").reverse().limit(limit).toArray();
}

export async function getActivityForProject(projectId: string, limit = 30): Promise<ActivityLog[]> {
  if (!db.isOpen()) await db.open();
  return db.activityLog
    .where("projectId")
    .equals(projectId)
    .reverse()
    .sortBy("timestamp")
    .then((list) => list.slice(0, limit));
}

export async function getActivityByEntityType(
  entityType: ActivityEntityType,
  limit = 30
): Promise<ActivityLog[]> {
  if (!db.isOpen()) await db.open();
  return db.activityLog
    .where("entityType")
    .equals(entityType)
    .reverse()
    .sortBy("timestamp")
    .then((list) => list.slice(0, limit));
}

export async function clearActivityLog(): Promise<void> {
  if (!db.isOpen()) await db.open();
  await db.activityLog.clear();
}

/** Convenience: log activity and emit a data-updated event */
export async function logActivityAndRefresh(input: {
  entityType: ActivityEntityType;
  entityId?: string | null;
  projectId?: string | null;
  action: ActivityAction;
  description: string;
}): Promise<void> {
  await logActivity(input);
  window.dispatchEvent(new Event("panga-data-updated"));
}
