import { db, type Reminder } from "./db";
import { newId, now } from "./utils";

export type CreateReminderInput = {
  projectId: string | null;
  linkedEntityType?: Reminder["linkedEntityType"];
  linkedEntityId?: string | null;
  message: string;
  triggerAt: number;
  status?: Reminder["status"];
};

export type UpdateReminderInput = Partial<
  Omit<Reminder, "id" | "createdAt">
>;

export async function createReminder(
  input: CreateReminderInput,
): Promise<Reminder> {
  const timestamp = now();
  const reminder: Reminder = {
    id: newId(),
    projectId: input.projectId,
    linkedEntityType: input.linkedEntityType ?? null,
    linkedEntityId: input.linkedEntityId ?? null,
    message: input.message.trim(),
    triggerAt: input.triggerAt,
    status: input.status ?? "pending",
    createdAt: timestamp,
    updatedAt: timestamp,
    syncStatus: "pending",
  };

  await db.reminders.add(reminder);
  return reminder;
}

export async function listReminders(projectId?: string | null): Promise<Reminder[]> {
  if (projectId === null) {
    return db.reminders.filter((reminder) => reminder.projectId === null).toArray();
  }

  const collection =
    projectId === undefined
      ? db.reminders
      : db.reminders.where("projectId").equals(projectId);
  return collection.toArray();
}

export async function getReminder(reminderId: string): Promise<Reminder | undefined> {
  return db.reminders.get(reminderId);
}

export async function updateReminder(
  reminderId: string,
  input: UpdateReminderInput,
): Promise<void> {
  await db.reminders.update(reminderId, {
    ...input,
    message: input.message?.trim(),
    updatedAt: now(),
    syncStatus: "pending",
  });
}

export async function deleteReminder(reminderId: string): Promise<void> {
  await db.reminders.delete(reminderId);
}

export async function dismissReminder(reminderId: string): Promise<void> {
  await db.reminders.update(reminderId, {
    status: "dismissed",
    updatedAt: now(),
    syncStatus: "pending",
  });
}
