// src/data/tasks.ts
import { db, type Task, type TaskStatus } from "./db";
import { newId, now } from "./utils";
import { syncPushRecord, syncDeleteRecord } from "../sync/sync";
import { logActivity } from "./activity";

export type { Task, TaskStatus };

export async function listTasksForProject(projectId: string): Promise<Task[]> {
  if (!db.isOpen()) await db.open();
  const list = await db.tasks.where("projectId").equals(projectId).toArray();
  return list.sort((a, b) => a.createdAt - b.createdAt);
}

export async function listAllTasks(): Promise<Task[]> {
  if (!db.isOpen()) await db.open();
  const all = await db.tasks.toArray();
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function listScheduledTasks(): Promise<Task[]> {
  if (!db.isOpen()) await db.open();
  return db.tasks.where("scheduledAt").above(0).sortBy("scheduledAt");
}

export async function listAllActiveTasks(): Promise<Task[]> {
  if (!db.isOpen()) await db.open();
  // Used by the AI planner (Stage 9) across all projects.
  return db.tasks.where("status").equals("active").toArray();
}

export function isOverdue(task: Task): boolean {
  return task.status === "active" && task.dueDate !== null && task.dueDate < Date.now();
}

export async function createTask(input: {
  projectId?: string | null;
  title: string;
  notes?: string;
  executor?: "ai" | "manual";
  dueDate?: number | null;
  scheduledAt?: number | null;
  estimatedMinutes?: number | null;
  tags?: string[];
}): Promise<Task> {
  if (!db.isOpen()) await db.open();
  const t = now();
  const task: Task = {
    id: newId(),
    projectId: input.projectId ?? null,
    title: input.title,
    notes: input.notes ?? "",
    status: "active",
    executor: input.executor ?? "manual",
    dueDate: input.dueDate ?? null,
    scheduledAt: input.scheduledAt ?? null,
    estimatedMinutes: input.estimatedMinutes ?? null,
    tags: input.tags ?? [],
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.tasks.add(task);
  void syncPushRecord("tasks", task);
  void logActivity({ entityType: "task", entityId: task.id, projectId: task.projectId, action: "created", description: `Created task "${task.title}"` });
  return task;
}

export async function updateTask(
  id: string,
  changes: Partial<
    Pick<Task, "title" | "notes" | "status" | "executor" | "dueDate" | "scheduledAt" | "estimatedMinutes" | "tags">
  >
): Promise<void> {
  if (!db.isOpen()) await db.open();
  const updatedAt = now();
  await db.tasks.update(id, { ...changes, updatedAt, syncStatus: "pending" });
  const updated = await db.tasks.get(id);
  if (updated) void syncPushRecord("tasks", updated);
}

export async function setTaskStatus(id: string, status: TaskStatus): Promise<void> {
  if (!db.isOpen()) await db.open();
  await updateTask(id, { status });
}

export async function deleteTask(id: string): Promise<void> {
  if (!db.isOpen()) await db.open();
  await db.tasks.delete(id);
  void syncDeleteRecord("tasks", id);
  void logActivity({ entityType: "task", entityId: id, action: "deleted", description: "Task deleted" });
}
