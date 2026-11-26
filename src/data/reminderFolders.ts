// src/data/reminderFolders.ts
import { accountDb, ensureAccountDbReady } from "./accountDb";
import type { ReminderFolder } from "./db";
import { newId, now } from "./utils";
import { logActivity } from "./activity";

export type { ReminderFolder };

export async function listReminderFolders(): Promise<ReminderFolder[]> {
  await ensureAccountDbReady();
  return accountDb.reminderFolders.orderBy("order").toArray();
}

export async function getReminderFolder(id: string): Promise<ReminderFolder | undefined> {
  await ensureAccountDbReady();
  return accountDb.reminderFolders.get(id);
}

export async function putReminderFolder(folder: ReminderFolder): Promise<void> {
  await ensureAccountDbReady();
  await accountDb.reminderFolders.put(folder);
}

export async function createReminderFolder(input: {
  title: string;
  order?: number;
  parentFolderId?: string | null;
}): Promise<ReminderFolder> {
  await ensureAccountDbReady();
  const t = now();
  const folders = await accountDb.reminderFolders.toArray();
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
  await accountDb.reminderFolders.add(folder);
  void logActivity({ entityType: "reminderFolder", entityId: folder.id, action: "created", description: `Created reminder folder "${folder.title}"` });
  return folder;
}

export async function updateReminderFolder(
  id: string,
  changes: Partial<Pick<ReminderFolder, "title" | "order" | "parentFolderId">>
): Promise<void> {
  await ensureAccountDbReady();
  const updatedAt = now();
  await accountDb.reminderFolders.update(id, { ...changes, updatedAt, syncStatus: "pending" });
}

export async function renameReminderFolder(id: string, title: string): Promise<void> {
  await updateReminderFolder(id, { title: title.trim() });
}

export async function reorderReminderFolders(orderedIds: string[]): Promise<void> {
  await ensureAccountDbReady();
  await accountDb.transaction("rw", accountDb.reminderFolders, async () => {
    for (const [index, id] of orderedIds.entries()) {
      await accountDb.reminderFolders.update(id, { order: index, updatedAt: now(), syncStatus: "pending" });
    }
  });
}

/** Delete a folder, reparenting subfolders and reminders to its parent (or root). */
export async function deleteReminderFolder(id: string): Promise<void> {
  await ensureAccountDbReady();
  const folder = await accountDb.reminderFolders.get(id);
  const parentId = folder?.parentFolderId ?? null;
  const subfolders = await accountDb.reminderFolders.where("parentFolderId").equals(id).toArray();
  const reminders = await accountDb.reminders.where("folderId").equals(id).toArray();
  await accountDb.transaction("rw", [accountDb.reminders, accountDb.reminderFolders], async () => {
    for (const sf of subfolders) {
      await accountDb.reminderFolders.update(sf.id, { parentFolderId: parentId, updatedAt: now(), syncStatus: "pending" });
    }
    for (const r of reminders) {
      await accountDb.reminders.update(r.id, { folderId: parentId, updatedAt: now(), syncStatus: "pending" });
    }
    await accountDb.reminderFolders.delete(id);
  });
  void logActivity({ entityType: "reminderFolder", entityId: id, action: "deleted", description: "Reminder folder deleted" });
}
