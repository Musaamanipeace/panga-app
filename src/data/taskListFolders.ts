// src/data/taskListFolders.ts
import { db, type TaskListFolder } from "./db";
import { newId, now } from "./utils";
import { syncPushRecord, syncDeleteRecord } from "../sync/sync";
import { recordTombstone } from "../sync/tombstones";
import { logActivity } from "./activity";

export type { TaskListFolder };

export async function listTaskListFolders(): Promise<TaskListFolder[]> {
  if (!db.isOpen()) await db.open();
  return db.taskListFolders.orderBy("order").toArray();
}

export async function getTaskListFolder(id: string): Promise<TaskListFolder | undefined> {
  if (!db.isOpen()) await db.open();
  return db.taskListFolders.get(id);
}

export async function createTaskListFolder(input: {
  title: string;
  order?: number;
  parentFolderId?: string | null;
}): Promise<TaskListFolder> {
  if (!db.isOpen()) await db.open();
  const t = now();
  const folders = await db.taskListFolders.toArray();
  const order = input.order ?? (folders.length ? Math.max(...folders.map((f) => f.order)) + 1 : 0);
  const folder: TaskListFolder = {
    id: newId(),
    parentFolderId: input.parentFolderId ?? null,
    title: input.title.trim(),
    order,
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.taskListFolders.add(folder);
  void syncPushRecord("taskListFolders", folder);
  void logActivity({ entityType: "taskListFolder", entityId: folder.id, action: "created", description: `Created task list folder "${folder.title}"` });
  return folder;
}

export async function updateTaskListFolder(
  id: string,
  changes: Partial<Pick<TaskListFolder, "title" | "order" | "parentFolderId">>
): Promise<void> {
  if (!db.isOpen()) await db.open();
  const updatedAt = now();
  await db.taskListFolders.update(id, { ...changes, updatedAt, syncStatus: "pending" });
  const updated = await db.taskListFolders.get(id);
  if (updated) void syncPushRecord("taskListFolders", updated);
}

export async function renameTaskListFolder(id: string, title: string): Promise<void> {
  await updateTaskListFolder(id, { title: title.trim() });
}

export async function reorderTaskListFolders(orderedIds: string[]): Promise<void> {
  if (!db.isOpen()) await db.open();
  await db.transaction("rw", db.taskListFolders, async () => {
    for (const [index, id] of orderedIds.entries()) {
      await db.taskListFolders.update(id, { order: index, updatedAt: now(), syncStatus: "pending" });
    }
  });
  for (const id of orderedIds) {
    const updated = await db.taskListFolders.get(id);
    if (updated) void syncPushRecord("taskListFolders", updated);
  }
}

/** Delete a folder, reparenting subfolders and task lists to its parent (or root). */
export async function deleteTaskListFolder(id: string): Promise<void> {
  if (!db.isOpen()) await db.open();
  const folder = await db.taskListFolders.get(id);
  const parentId = folder?.parentFolderId ?? null;
  const subfolders = await db.taskListFolders.where("parentFolderId").equals(id).toArray();
  const lists = await db.taskLists.where("folderId").equals(id).toArray();
  await db.transaction("rw", [db.taskLists, db.taskListFolders], async () => {
    for (const sf of subfolders) {
      await db.taskListFolders.update(sf.id, { parentFolderId: parentId, updatedAt: now(), syncStatus: "pending" });
      const updated = await db.taskListFolders.get(sf.id);
      if (updated) void syncPushRecord("taskListFolders", updated);
    }
    for (const list of lists) {
      await db.taskLists.update(list.id, { folderId: parentId, updatedAt: now(), syncStatus: "pending" });
      const updated = await db.taskLists.get(list.id);
      if (updated) void syncPushRecord("taskLists", updated);
    }
    await db.taskListFolders.delete(id);
  });
  void syncDeleteRecord("taskListFolders", id);
  recordTombstone("taskListFolder", id);
  void logActivity({ entityType: "taskListFolder", entityId: id, action: "deleted", description: "Task list folder deleted" });
}
