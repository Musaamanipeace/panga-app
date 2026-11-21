// src/data/taskLists.ts
import { db, type TaskList } from "./db";
import { newId, now } from "./utils";
import { syncPushRecord, syncDeleteRecord } from "../sync/sync";
import { logActivity } from "./activity";

export type { TaskList };

export async function listTaskLists(): Promise<TaskList[]> {
  if (!db.isOpen()) await db.open();
  return db.taskLists.orderBy("order").toArray();
}

export async function getTaskList(id: string): Promise<TaskList | undefined> {
  if (!db.isOpen()) await db.open();
  return db.taskLists.get(id);
}

export async function createTaskList(input: {
  title: string;
  description?: string;
  order?: number;
}): Promise<TaskList> {
  if (!db.isOpen()) await db.open();
  const t = now();
  const lists = await db.taskLists.toArray();
  const order = input.order ?? (lists.length ? Math.max(...lists.map((l) => l.order)) + 1 : 0);
  const list: TaskList = {
    id: newId(),
    title: input.title.trim(),
    description: input.description,
    order,
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.taskLists.add(list);
  void syncPushRecord("taskLists", list);
  void logActivity({ entityType: "taskList", entityId: list.id, action: "created", description: `Created task list "${list.title}"` });
  return list;
}

export async function updateTaskList(
  id: string,
  changes: Partial<Pick<TaskList, "title" | "description" | "order">>
): Promise<void> {
  if (!db.isOpen()) await db.open();
  const updatedAt = now();
  await db.taskLists.update(id, { ...changes, updatedAt, syncStatus: "pending" });
  const updated = await db.taskLists.get(id);
  if (updated) void syncPushRecord("taskLists", updated);
}

export async function renameTaskList(id: string, title: string): Promise<void> {
  await updateTaskList(id, { title: title.trim() });
}

export async function reorderTaskLists(orderedIds: string[]): Promise<void> {
  if (!db.isOpen()) await db.open();
  await db.transaction("rw", db.taskLists, async () => {
    for (const [index, id] of orderedIds.entries()) {
      await db.taskLists.update(id, { order: index, updatedAt: now(), syncStatus: "pending" });
    }
  });
  for (const id of orderedIds) {
    const updated = await db.taskLists.get(id);
    if (updated) void syncPushRecord("taskLists", updated);
  }
}

export async function deleteTaskList(id: string, options?: { moveTasksToListId?: string }): Promise<void> {
  if (!db.isOpen()) await db.open();
  const moveTo = options?.moveTasksToListId;
  const tasks = await db.tasks.where("listId").equals(id).toArray();
  await db.transaction("rw", [db.tasks, db.taskLists], async () => {
    for (const task of tasks) {
      if (moveTo) {
        await db.tasks.update(task.id, { listId: moveTo, parentId: null, updatedAt: now(), syncStatus: "pending" });
        const updated = await db.tasks.get(task.id);
        if (updated) void syncPushRecord("tasks", updated);
      } else {
        await db.tasks.delete(task.id);
        void syncDeleteRecord("tasks", task.id);
        recordTombstone("task", task.id);
      }
    }
    await db.taskLists.delete(id);
  });
  void syncDeleteRecord("taskLists", id);
  recordTombstone("taskList", id);
  void logActivity({ entityType: "taskList", entityId: id, action: "deleted", description: "Task list deleted" });
}
