// src/data/milestones.ts
import { db, type Milestone, type MilestoneStatus } from "./db";
import { newId, now } from "./utils";

export async function listMilestones(projectId: string): Promise<Milestone[]> {
  return db.milestones.where("projectId").equals(projectId).sortBy("targetDate");
}

export async function createMilestone(input: {
  projectId: string;
  title: string;
  targetDate?: number | null;
  blockingTaskIds?: string[];
}): Promise<Milestone> {
  const t = now();
  const milestone: Milestone = {
    id: newId(),
    projectId: input.projectId,
    title: input.title,
    targetDate: input.targetDate ?? null,
    status: "in_progress",
    blockingTaskIds: input.blockingTaskIds ?? [],
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.milestones.add(milestone);
  return milestone;
}

export async function updateMilestone(
  id: string,
  changes: Partial<Pick<Milestone, "title" | "targetDate" | "blockingTaskIds">>
): Promise<void> {
  await db.milestones.update(id, { ...changes, updatedAt: now(), syncStatus: "pending" });
}

export async function setMilestoneStatus(id: string, status: MilestoneStatus): Promise<void> {
  await db.milestones.update(id, { status, updatedAt: now(), syncStatus: "pending" });
}

export async function deleteMilestone(id: string): Promise<void> {
  await db.milestones.delete(id);
}

/**
 * A milestone auto-completes once every task it's blocked on is completed
 * (if it has any linked tasks at all — manual status still wins otherwise).
 * Call after any task status change so milestones stay in sync.
 */
export async function reconcileMilestoneStatuses(projectId: string): Promise<void> {
  const [milestones, tasks] = await Promise.all([
    listMilestones(projectId),
    db.tasks.where("projectId").equals(projectId).toArray(),
  ]);
  const taskById = new Map(tasks.map((t) => [t.id, t]));
  for (const m of milestones) {
    if (m.blockingTaskIds.length === 0 || m.status === "missed") continue;
    const allDone = m.blockingTaskIds.every((id) => taskById.get(id)?.status === "completed");
    if (allDone && m.status !== "achieved") {
      await setMilestoneStatus(m.id, "achieved");
    } else if (!allDone && m.status === "achieved") {
      await setMilestoneStatus(m.id, "in_progress");
    }
  }
}
