// src/data/tasks.ts
import { db, type Task, type TaskStatus } from "./db";
import { newId, now } from "./utils";

export type { Task, TaskStatus };

export async function listTasksForProject(projectId: string): Promise<Task[]> {
  return db.tasks.where("projectId").equals(projectId).sortBy("createdAt");
}

export async function listAllTasks(): Promise<Task[]> {
  return db.tasks.orderBy("createdAt").reverse().toArray();
}

export async function listScheduledTasks(): Promise<Task[]> {
  return db.tasks.where("scheduledAt").above(0).sortBy("scheduledAt");
}

export async function listAllActiveTasks(): Promise<Task[]> {
  // Used by the AI planner (Stage 9) across all projects.
  return db.tasks.where("status").equals("active").toArray();
}

export function isOverdue(task: Task): boolean {
  return task.status === "active" && task.dueDate !== null && task.dueDate < Date.now();
}

export async function createTask(input: {
  projectId: string;
  title: string;
  notes?: string;
  executor?: "ai" | "manual";
  dueDate?: number | null;
  scheduledAt?: number | null;
  estimatedMinutes?: number | null;
  tags?: string[];
}): Promise<Task> {
  const t = now();
  const task: Task = {
    id: newId(),
    projectId: input.projectId,
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
  return task;
}

export async function updateTask(
  id: string,
  changes: Partial<
    Pick<Task, "title" | "notes" | "status" | "executor" | "dueDate" | "scheduledAt" | "estimatedMinutes" | "tags">
  >
): Promise<void> {
  await db.tasks.update(id, { ...changes, updatedAt: now(), syncStatus: "pending" });
}

export async function setTaskStatus(id: string, status: TaskStatus): Promise<void> {
  await updateTask(id, { status });
}

export async function deleteTask(id: string): Promise<void> {
  await db.tasks.delete(id);
}
