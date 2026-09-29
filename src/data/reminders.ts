// src/data/reminders.ts
import { db, type Reminder } from "./db";
import { newId, now } from "./utils";
import { syncPushRecord, syncDeleteRecord } from "../sync/supabaseSync";

export type { Reminder };
export type ReminderBucket = "overdue" | "due" | "upcoming";

export async function listReminders(projectId: string): Promise<Reminder[]> {
  return db.reminders.where("projectId").equals(projectId).sortBy("triggerAt");
}

export async function listPendingReminders(): Promise<Reminder[]> {
  return db.reminders.where("status").equals("pending").sortBy("triggerAt");
}

export function bucketReminders(reminders: Reminder[]): Record<ReminderBucket, Reminder[]> {
  const nowMs = Date.now();
  const todayStart = new Date(nowMs);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  return {
    overdue: reminders.filter((r) => r.triggerAt < nowMs),
    due: reminders.filter((r) => r.triggerAt >= nowMs && r.triggerAt < todayEnd.getTime()),
    upcoming: reminders.filter((r) => r.triggerAt >= todayEnd.getTime()),
  };
}

export async function createReminder(input: {
  projectId: string;
  message: string;
  triggerAt: number;
}): Promise<Reminder> {
  const t = now();
  const reminder: Reminder = {
    id: newId(),
    projectId: input.projectId,
    linkedEntityType: null,
    linkedEntityId: null,
    message: input.message,
    triggerAt: input.triggerAt,
    status: "pending",
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.reminders.add(reminder);
  void syncPushRecord("reminders", reminder);
  return reminder;
}

export async function updateReminder(
  id: string,
  changes: Partial<Pick<Reminder, "message" | "triggerAt">>
): Promise<void> {
  await db.reminders.update(id, { ...changes, updatedAt: now(), syncStatus: "pending" });
  const updated = await db.reminders.get(id);
  if (updated) void syncPushRecord("reminders", updated);
}

export async function dismissReminder(id: string): Promise<void> {
  await db.reminders.update(id, { status: "dismissed", updatedAt: now(), syncStatus: "pending" });
  const updated = await db.reminders.get(id);
  if (updated) void syncPushRecord("reminders", updated);
}

export async function deleteReminder(id: string): Promise<void> {
  await db.reminders.delete(id);
  void syncDeleteRecord("reminders", id);
}
