// src/data/activity.ts
// Activity log for tracking CRUD actions across task lists, tasks, links, notes, and reminders.
import { db, type ActivityLog } from "./db";
import { newId } from "./utils";
import { getSessionUserId } from "../auth/session";

export type { ActivityLog };

export type ActivityEntityType =
  | "task"
  | "taskList"
  | "taskListFolder"
  | "link"
  | "linkFolder"
  | "note"
  | "noteFolder"
  | "reminder"
  | "reminderFolder";

export type ActivityAction = "created" | "updated" | "deleted" | "status_changed";

export async function logActivity(input: {
  entityType: ActivityEntityType;
  entityId?: string | null;
  action: ActivityAction;
  description: string;
}): Promise<ActivityLog> {
  try {
    if (!db.isOpen()) await db.open();
    const entry: ActivityLog = {
      id: newId(),
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      projectId: null,
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
      projectId: null,
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
  action: ActivityAction;
  description: string;
}): Promise<void> {
  await logActivity(input);
  window.dispatchEvent(new Event("panga-data-updated"));
}
