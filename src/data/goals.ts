import { db, type Goal, type GoalStatus } from "./db";
import { newId, now } from "./utils";

export type CreateGoalInput = {
  projectId: string;
  title: string;
  targetDate?: number | null;
  status?: GoalStatus;
};

export type UpdateGoalInput = Partial<
  Omit<Goal, "id" | "projectId" | "createdAt">
>;

export async function createGoal(input: CreateGoalInput): Promise<Goal> {
  const timestamp = now();
  const goal: Goal = {
    id: newId(),
    projectId: input.projectId,
    title: input.title.trim(),
    targetDate: input.targetDate ?? null,
    status: input.status ?? "in_progress",
    createdAt: timestamp,
    updatedAt: timestamp,
    syncStatus: "pending",
  };

  await db.goals.add(goal);
  return goal;
}

export async function listGoals(projectId?: string): Promise<Goal[]> {
  const collection = projectId ? db.goals.where("projectId").equals(projectId) : db.goals;
  return collection.toArray();
}

export async function getGoal(goalId: string): Promise<Goal | undefined> {
  return db.goals.get(goalId);
}

export async function updateGoal(
  goalId: string,
  input: UpdateGoalInput,
): Promise<void> {
  await db.goals.update(goalId, {
    ...input,
    title: input.title?.trim(),
    updatedAt: now(),
    syncStatus: "pending",
  });
}

export async function deleteGoal(goalId: string): Promise<void> {
  await db.goals.delete(goalId);
}
