// src/data/reminderFolders.ts
import { db, type ReminderFolder } from "./db";
import { newId, now } from "./utils";
import { logActivity } from "./activity";

export type { ReminderFolder };

export async function listReminderFolders(): Promise<ReminderFolder[]> {
  if (!db.isOpen()) await db.open();
  return db.reminderFolders.orderBy("order").toArray();
}

export async function getReminderFolder(id: string): Promise<ReminderFolder | undefined> {
  if (!db.isOpen()) await db.open();
  return db.reminderFolders.get(id);
}

export async function createReminderFolder(input: {
  title: string;
  order?: number;
  parentFolderId?: string | null;
}): Promise<ReminderFolder> {
  if (!db.isOpen()) await db.open();
  const t = now();
  const folders = await db.reminderFolders.toArray();
  const order = input.order ?? (folders.length ? Math.max(...folders.map((f) => f.order)) + 1 : 0);
  const folder: ReminderFolder = {
    id: newId(),
    parentFolderId: input.parentFolderId ?? null,
    title: input.title.trim(),
    order,
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.reminderFolders.add(folder);
  void logActivity({ entityType: "reminderFolder", entityId: folder.id, action: "created", description: `Created reminder folder "${folder.title}"` });
  return folder;
}

export async function updateReminderFolder(
  id: string,
  changes: Partial<Pick<ReminderFolder, "title" | "order" | "parentFolderId">>
): Promise<void> {
  if (!db.isOpen()) await db.open();
  const updatedAt = now();
  await db.reminderFolders.update(id, { ...changes, updatedAt, syncStatus: "pending" });
}

export async function renameReminderFolder(id: string, title: string): Promise<void> {
  await updateReminderFolder(id, { title: title.trim() });
}

export async function reorderReminderFolders(orderedIds: string[]): Promise<void> {
  if (!db.isOpen()) await db.open();
  await db.transaction("rw", db.reminderFolders, async () => {
    for (const [index, id] of orderedIds.entries()) {
      await db.reminderFolders.update(id, { order: index, updatedAt: now(), syncStatus: "pending" });
    }
  });
}

/** Delete a folder, reparenting subfolders and reminders to its parent (or root). */
export async function deleteReminderFolder(id: string): Promise<void> {
  if (!db.isOpen()) await db.open();
  const folder = await db.reminderFolders.get(id);
  const parentId = folder?.parentFolderId ?? null;
  const subfolders = await db.reminderFolders.where("parentFolderId").equals(id).toArray();
  const reminders = await db.reminders.where("folderId").equals(id).toArray();
  await db.transaction("rw", [db.reminders, db.reminderFolders], async () => {
    for (const sf of subfolders) {
      await db.reminderFolders.update(sf.id, { parentFolderId: parentId, updatedAt: now(), syncStatus: "pending" });
    }
    for (const r of reminders) {
      await db.reminders.update(r.id, { folderId: parentId, updatedAt: now(), syncStatus: "pending" });
    }
    await db.reminderFolders.delete(id);
  });
  void logActivity({ entityType: "reminderFolder", entityId: id, action: "deleted", description: "Reminder folder deleted" });
}
