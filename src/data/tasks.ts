import { db, type Task, type TaskStatus } from "./db";
import { newId, now } from "./utils";

export type CreateTaskInput = {
  projectId: string;
  title: string;
  notes?: string;
  status?: TaskStatus;
  dueDate?: number | null;
  estimatedMinutes?: number | null;
  tags?: string[];
};

export type UpdateTaskInput = Partial<
  Omit<Task, "id" | "projectId" | "createdAt">
>;

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const timestamp = now();
  const task: Task = {
    id: newId(),
    projectId: input.projectId,
    title: input.title.trim(),
    notes: input.notes?.trim() ?? "",
    status: input.status ?? "active",
    dueDate: input.dueDate ?? null,
    estimatedMinutes: input.estimatedMinutes ?? null,
    tags: [...(input.tags ?? [])],
    createdAt: timestamp,
    updatedAt: timestamp,
    syncStatus: "pending",
  };

  await db.tasks.add(task);
  return task;
}

export async function listTasks(projectId?: string): Promise<Task[]> {
  const collection = projectId ? db.tasks.where("projectId").equals(projectId) : db.tasks;
  return collection.toArray();
}

export async function getTask(taskId: string): Promise<Task | undefined> {
  return db.tasks.get(taskId);
}

export async function updateTask(
  taskId: string,
  input: UpdateTaskInput,
): Promise<void> {
  await db.tasks.update(taskId, {
    ...input,
    title: input.title?.trim(),
    notes: input.notes?.trim(),
    tags: input.tags ? [...input.tags] : undefined,
    updatedAt: now(),
    syncStatus: "pending",
  });
}

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
): Promise<void> {
  await db.tasks.update(taskId, {
    status,
    updatedAt: now(),
    syncStatus: "pending",
  });
}

export async function deleteTask(taskId: string): Promise<void> {
  await db.tasks.delete(taskId);
}
