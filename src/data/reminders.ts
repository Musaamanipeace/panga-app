// src/data/reminders.ts
import { db, type Reminder } from "./db";
import { newId, now } from "./utils";

export async function listReminders(projectId: string): Promise<Reminder[]> {
  return db.reminders.where("projectId").equals(projectId).sortBy("triggerAt");
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
  return reminder;
}

export async function updateReminder(
  id: string,
  changes: Partial<Pick<Reminder, "message" | "triggerAt">>
): Promise<void> {
  await db.reminders.update(id, { ...changes, updatedAt: now(), syncStatus: "pending" });
}

export async function dismissReminder(id: string): Promise<void> {
  await db.reminders.update(id, { status: "dismissed", updatedAt: now(), syncStatus: "pending" });
}

export async function deleteReminder(id: string): Promise<void> {
  await db.reminders.delete(id);
}
