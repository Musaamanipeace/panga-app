// src/data/tasks.ts
import { db, notifyLocalDataMutated, type Task, type TaskStatus, type SyncStatus } from "./db";
import { newId, now } from "./utils";
import { logActivity } from "./activity";

export type { Task, TaskStatus };

export interface TaskNode {
  task: Task;
  children: TaskNode[];
}

export async function listTasksForList(listId: string): Promise<Task[]> {
  if (!db.isOpen()) await db.open();
  return db.tasks.where("listId").equals(listId).toArray();
}

export async function listSubtasks(parentId: string): Promise<Task[]> {
  if (!db.isOpen()) await db.open();
  return db.tasks.where("parentId").equals(parentId).toArray();
}

export async function listRootTasks(): Promise<Task[]> {
  if (!db.isOpen()) await db.open();
  return db.tasks.filter((t) => t.parentId === null).toArray();
}

export async function getTask(id: string): Promise<Task | undefined> {
  if (!db.isOpen()) await db.open();
  return db.tasks.get(id);
}

export async function createTask(input: {
  listId?: string | null;
  parentId?: string | null;
  title: string;
  notes?: string;
  dueDate?: number | null;
  tags?: string[];
  order?: number;
}): Promise<Task> {
  if (!db.isOpen()) await db.open();
  const t = now();
  const siblings = input.parentId
    ? await db.tasks.where("parentId").equals(input.parentId).toArray()
    : input.listId
      ? await db.tasks.where("listId").equals(input.listId).and((task) => task.parentId === null).toArray()
      : await db.tasks.filter((task) => task.listId === null && task.parentId === null).toArray();
  const order = input.order ?? (siblings.length ? Math.max(...siblings.map((s) => s.order)) + 1 : 0);
  const task: Task = {
    id: newId(),
    listId: input.listId ?? null,
    parentId: input.parentId ?? null,
    title: input.title.trim(),
    notes: input.notes ?? "",
    status: "active",
    completed: false,
    dueDate: input.dueDate ?? null,
    order,
    tags: input.tags ?? [],
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.tasks.add(task);
  notifyLocalDataMutated();
  void logActivity({ entityType: "task", entityId: task.id, action: "created", description: `Created task "${task.title}"` });
  return task;
}

export async function addSubtask(parentId: string, title: string): Promise<Task> {
  const parent = await getTask(parentId);
  if (!parent) throw new Error(`Parent task ${parentId} not found`);
  return createTask({ listId: parent.listId, parentId, title });
}

export async function updateTask(
  id: string,
  changes: Partial<Pick<Task, "title" | "notes" | "status" | "completed" | "dueDate" | "tags">>
): Promise<void> {
  if (!db.isOpen()) await db.open();
  const updatedAt = now();
  const next: Partial<Task> & { updatedAt: number; syncStatus: SyncStatus } = { ...changes, updatedAt, syncStatus: "pending" };
  if (changes.status !== undefined) next.completed = changes.status === "completed";
  if (changes.completed !== undefined) next.status = changes.completed ? "completed" : "active";
  await db.tasks.update(id, next);
  notifyLocalDataMutated();
}

export async function toggleTaskCompleted(id: string): Promise<void> {
  if (!db.isOpen()) await db.open();
  const task = await db.tasks.get(id);
  if (!task) return;
  const completed = !task.completed;
  await updateTask(id, { completed, status: completed ? "completed" : "active" });
}

export async function deleteTask(id: string): Promise<void> {
  if (!db.isOpen()) await db.open();
  // Collect the whole subtask subtree so everything is deleted in one transaction.
  const toDelete: string[] = [];
  const queue = [id];
  while (queue.length) {
    const current = queue.shift()!;
    toDelete.push(current);
    const children = await db.tasks.where("parentId").equals(current).toArray();
    for (const child of children) queue.push(child.id);
  }
  await db.transaction("rw", db.tasks, async () => {
    for (const taskId of toDelete) await db.tasks.delete(taskId);
  });
  notifyLocalDataMutated();
  void logActivity({ entityType: "task", entityId: id, action: "deleted", description: "Task deleted" });
}

export async function moveTask(taskId: string, changes: { listId?: string | null; parentId?: string | null }): Promise<void> {
  if (!db.isOpen()) await db.open();
  const updates: Partial<Task> = { updatedAt: now(), syncStatus: "pending" };
  if (changes.listId !== undefined) updates.listId = changes.listId;
  if (changes.parentId !== undefined) updates.parentId = changes.parentId;
  await db.tasks.update(taskId, updates);
  notifyLocalDataMutated();
}

export async function reorderTasks(orderedIds: string[]): Promise<void> {
  if (!db.isOpen()) await db.open();
  await db.transaction("rw", db.tasks, async () => {
    for (const [index, id] of orderedIds.entries()) {
      await db.tasks.update(id, { order: index, updatedAt: now(), syncStatus: "pending" });
    }
  });
  notifyLocalDataMutated();
}

/** Build a nested task tree for a task list (roots = parentId === null). */
export async function getTaskTree(listId: string): Promise<TaskNode[]> {
  if (!db.isOpen()) await db.open();
  const all = await db.tasks.where("listId").equals(listId).toArray();
  const byId = new Map<string, TaskNode>();
  const roots: TaskNode[] = [];
  for (const task of all) {
    byId.set(task.id, { task, children: [] });
  }
  for (const task of all) {
    const node = byId.get(task.id)!;
    if (task.parentId && byId.has(task.parentId)) {
      byId.get(task.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  const sort = (nodes: TaskNode[]) => {
    nodes.sort((a, b) => a.task.order - b.task.order || a.task.createdAt - b.task.createdAt);
    for (const n of nodes) sort(n.children);
  };
  sort(roots);
  return roots;
}

export async function listAllTasks(): Promise<Task[]> {
  if (!db.isOpen()) await db.open();
  return db.tasks.toArray();
}

export async function listAllActiveTasks(): Promise<Task[]> {
  if (!db.isOpen()) await db.open();
  return db.tasks.filter((t) => !t.completed).toArray();
}

export async function restoreTask(task: Task): Promise<void> {
  if (!db.isOpen()) await db.open();
  await db.tasks.put({ ...task, updatedAt: now(), syncStatus: "pending" });
  notifyLocalDataMutated();
}
