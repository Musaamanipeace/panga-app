// src/data/projects.ts
import { db, type Project, type ProjectStatus } from "./db";
import { newId, now } from "./utils";

export async function listProjects(
  status: ProjectStatus = "active"
): Promise<Project[]> {
  return db.projects
    .where("status")
    .equals(status)
    .reverse()
    .sortBy("updatedAt");
}

export async function getProject(id: string): Promise<Project | undefined> {
  return db.projects.get(id);
}

export async function createProject(input: {
  name: string;
  description?: string;
}): Promise<Project> {
  const t = now();
  const project: Project = {
    id: newId(),
    name: input.name,
    description: input.description ?? "",
    status: "active",
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.projects.add(project);
  return project;
}

export async function updateProject(
  id: string,
  changes: Partial<Pick<Project, "name" | "description" | "status">>
): Promise<void> {
  await db.projects.update(id, { ...changes, updatedAt: now(), syncStatus: "pending" });
}

export async function archiveProject(id: string): Promise<void> {
  await updateProject(id, { status: "archived" });
}

export async function deleteProject(id: string): Promise<void> {
  // Cascade: a project's tasks/resources/etc. go with it.
  await db.transaction(
    "rw",
    [db.projects, db.tasks, db.resources, db.docEntries, db.goals, db.issues, db.reminders],
    async () => {
      await db.tasks.where("projectId").equals(id).delete();
      await db.resources.where("projectId").equals(id).delete();
      await db.docEntries.where("projectId").equals(id).delete();
      await db.goals.where("projectId").equals(id).delete();
      await db.issues.where("projectId").equals(id).delete();
      await db.reminders.where("projectId").equals(id).delete();
      await db.projects.delete(id);
    }
  );
}

/** Derived progress (§7 of the plan): completed / total non-archived tasks. */
export async function getProjectProgress(projectId: string): Promise<number> {
  const tasks = await db.tasks.where("projectId").equals(projectId).toArray();
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.status === "completed").length;
  return Math.round((completed / tasks.length) * 100);
}
