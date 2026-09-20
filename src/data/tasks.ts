// src/data/tasks.ts
import { db, type Task, type TaskStatus } from "./db";
import { newId, now } from "./utils";

export async function listTasksForProject(projectId: string): Promise<Task[]> {
  return db.tasks.where("projectId").equals(projectId).sortBy("createdAt");
}

export async function listAllActiveTasks(): Promise<Task[]> {
  // Used by the AI planner (Stage 9) across all projects.
  return db.tasks.where("status").equals("active").toArray();
}

export async function createTask(input: {
  projectId: string;
  title: string;
  notes?: string;
  dueDate?: number | null;
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
    dueDate: input.dueDate ?? null,
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
    Pick<Task, "title" | "notes" | "status" | "dueDate" | "estimatedMinutes" | "tags">
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
