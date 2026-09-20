// src/data/goals.ts
import { db, type Goal, type GoalStatus } from "./db";
import { newId, now } from "./utils";

export async function listGoals(projectId: string): Promise<Goal[]> {
  return db.goals.where("projectId").equals(projectId).sortBy("createdAt");
}

export async function createGoal(input: {
  projectId: string;
  title: string;
  targetDate?: number | null;
}): Promise<Goal> {
  const t = now();
  const goal: Goal = {
    id: newId(),
    projectId: input.projectId,
    title: input.title,
    targetDate: input.targetDate ?? null,
    status: "in_progress",
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.goals.add(goal);
  return goal;
}

export async function setGoalStatus(id: string, status: GoalStatus): Promise<void> {
  await db.goals.update(id, { status, updatedAt: now(), syncStatus: "pending" });
}

export async function deleteGoal(id: string): Promise<void> {
  await db.goals.delete(id);
}
