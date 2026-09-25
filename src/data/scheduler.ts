// src/data/scheduler.ts
import { db, type ScheduleItem } from "./db";
import { newId, now } from "./utils";

export async function listScheduleItems(projectId?: string | null): Promise<ScheduleItem[]> {
  const all = await db.scheduleItems.toArray();
  const filtered = projectId ? all.filter((s) => s.projectId === projectId) : all;
  return filtered.sort((a, b) => a.scheduledAt - b.scheduledAt);
}

export async function getScheduleItem(id: string): Promise<ScheduleItem | undefined> {
  return db.scheduleItems.get(id);
}

export async function createScheduleItem(input: {
  projectId?: string | null;
  title: string;
  description?: string;
  scheduledAt: number;
  durationMinutes?: number | null;
  sourceTaskId?: string | null;
}): Promise<ScheduleItem> {
  const t = now();
  const item: ScheduleItem = {
    id: newId(),
    projectId: input.projectId ?? null,
    title: input.title,
    description: input.description ?? null,
    scheduledAt: input.scheduledAt,
    durationMinutes: input.durationMinutes ?? null,
    sourceTaskId: input.sourceTaskId ?? null,
    createdAt: t,
    updatedAt: t,
  };
  await db.scheduleItems.add(item);
  return item;
}

export async function updateScheduleItem(
  id: string,
  changes: Partial<Pick<ScheduleItem, "title" | "description" | "scheduledAt" | "durationMinutes" | "sourceTaskId">>
): Promise<void> {
  await db.scheduleItems.update(id, { ...changes, updatedAt: now() });
}

export async function deleteScheduleItem(id: string): Promise<void> {
  await db.scheduleItems.delete(id);
}

export async function deleteScheduleItemsForProject(projectId: string): Promise<void> {
  await db.scheduleItems.where("projectId").equals(projectId).delete();
}

export async function getUpcomingScheduleItems(since: number, projectId?: string | null): Promise<ScheduleItem[]> {
  const all = await db.scheduleItems.where("scheduledAt").aboveOrEqual(since).toArray();
  const filtered = projectId ? all.filter((s) => s.projectId === projectId) : all;
  return filtered.sort((a, b) => a.scheduledAt - b.scheduledAt);
}
