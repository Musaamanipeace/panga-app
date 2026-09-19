import { db, type Project, type ProjectStatus } from "./db";
import { newId, now } from "./utils";

export type CreateProjectInput = {
  name: string;
  description: string;
  status?: ProjectStatus;
};

export type UpdateProjectInput = Partial<Omit<Project, "id" | "createdAt">>;

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const timestamp = now();
  const project: Project = {
    id: newId(),
    name: input.name.trim(),
    description: input.description.trim(),
    status: input.status ?? "active",
    createdAt: timestamp,
    updatedAt: timestamp,
    syncStatus: "pending",
  };

  await db.projects.add(project);
  return project;
}

export async function listProjects(): Promise<Project[]> {
  return db.projects.orderBy("updatedAt").reverse().toArray();
}

export async function getProject(projectId: string): Promise<Project | undefined> {
  return db.projects.get(projectId);
}

export async function updateProject(
  projectId: string,
  input: UpdateProjectInput,
): Promise<void> {
  await db.projects.update(projectId, {
    ...input,
    name: input.name?.trim(),
    description: input.description?.trim(),
    updatedAt: now(),
    syncStatus: "pending" as const,
  });
}

export async function archiveProject(projectId: string): Promise<void> {
  await db.projects.update(projectId, {
    status: "archived",
    updatedAt: now(),
    syncStatus: "pending",
  });
}

export async function deleteProject(projectId: string): Promise<void> {
  await db.transaction("rw", db.projects, db.tasks, async () => {
    await db.projects.delete(projectId);
    await db.tasks.where("projectId").equals(projectId).delete();
  });
  await db.resources.where("projectId").equals(projectId).delete();
  await db.docEntries.where("projectId").equals(projectId).delete();
  await db.goals.where("projectId").equals(projectId).delete();
  await db.issues.where("projectId").equals(projectId).delete();
  await db.reminders.where("projectId").equals(projectId).delete();
}
