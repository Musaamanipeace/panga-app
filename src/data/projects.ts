// src/data/projects.ts
import { db, type Project, type ProjectStatus } from "./db";
import { newId, now } from "./utils";
import { syncPushRecord, syncDeleteRecord } from "../sync/sync";
import { logActivity } from "./activity";

export type { Project, ProjectStatus };

export async function listProjects(
  status: ProjectStatus = "active"
): Promise<Project[]> {
  if (!db.isOpen()) await db.open();
  return db.projects
    .where("status")
    .equals(status)
    .reverse()
    .sortBy("updatedAt");
}

export async function listAllProjects(): Promise<Project[]> {
  if (!db.isOpen()) await db.open();
  return db.projects.orderBy("updatedAt").reverse().toArray();
}

export async function getProject(id: string): Promise<Project | undefined> {
  if (!db.isOpen()) await db.open();
  return db.projects.get(id);
}

export async function createProject(input: {
  name: string;
  description?: string;
}): Promise<Project> {
  if (!db.isOpen()) await db.open();
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
  void syncPushRecord("projects", project);
  void logActivity({ entityType: "project", entityId: project.id, action: "created", description: `Created project "${project.name}"` });
  return project;
}

export async function updateProject(
  id: string,
  changes: Partial<Pick<Project, "name" | "description" | "status">>
): Promise<void> {
  if (!db.isOpen()) await db.open();
  const updatedAt = now();
  await db.projects.update(id, { ...changes, updatedAt, syncStatus: "pending" });
  const updated = await db.projects.get(id);
  if (updated)   void syncPushRecord("projects", updated);
  if (changes.status === "archived") {
    void logActivity({ entityType: "project", entityId: id, action: "updated", description: "Project archived" });
  }
}

export async function archiveProject(id: string): Promise<void> {
  await updateProject(id, { status: "archived" });
}

export async function deleteProject(id: string): Promise<void> {
  if (!db.isOpen()) await db.open();

  // Collect child ids before local cascade so we can delete them remotely.
  const [taskIds, resourceIds, docIds, milestoneIds, issueIds, reminderIds, eventIds, insightIds] =
    await Promise.all([
      db.tasks.where("projectId").equals(id).primaryKeys(),
      db.resources.where("projectId").equals(id).primaryKeys(),
      db.docEntries.where("projectId").equals(id).primaryKeys(),
      db.milestones.where("projectId").equals(id).primaryKeys(),
      db.issues.where("projectId").equals(id).primaryKeys(),
      db.reminders.where("projectId").equals(id).primaryKeys(),
      db.calendarEvents.where("projectId").equals(id).primaryKeys(),
      db.insights.where("projectId").equals(id).primaryKeys(),
    ]);

  await db.transaction(
    "rw",
    [
      db.projects,
      db.tasks,
      db.resources,
      db.docEntries,
      db.milestones,
      db.issues,
      db.reminders,
      db.calendarEvents,
      db.scheduleItems,
      db.insights,
    ],
    async () => {
      await db.tasks.where("projectId").equals(id).delete();
      await db.resources.where("projectId").equals(id).delete();
      await db.docEntries.where("projectId").equals(id).delete();
      await db.milestones.where("projectId").equals(id).delete();
      await db.issues.where("projectId").equals(id).delete();
      await db.reminders.where("projectId").equals(id).delete();
      await db.calendarEvents.where("projectId").equals(id).delete();
      await db.scheduleItems.where("projectId").equals(id).delete();
      await db.insights.where("projectId").equals(id).delete();
      await db.projects.delete(id);
    }
  );

  // Remote cascade deletes
  void syncDeleteRecord("projects", id);
  for (const tid of taskIds) void syncDeleteRecord("tasks", String(tid));
  for (const rid of resourceIds) void syncDeleteRecord("resources", String(rid));
  for (const did of docIds) void syncDeleteRecord("doc_entries", String(did));
  for (const mid of milestoneIds) void syncDeleteRecord("milestones", String(mid));
  for (const iid of issueIds) void syncDeleteRecord("issues", String(iid));
  for (const rid of reminderIds) void syncDeleteRecord("reminders", String(rid));
  for (const eid of eventIds) void syncDeleteRecord("calendar_events", String(eid));
  for (const iid of insightIds) void syncDeleteRecord("insights", String(iid));
}

/** Derived progress (§7 of the plan): completed / total non-archived tasks. */
export async function getProjectProgress(projectId: string): Promise<number> {
  const tasks = await db.tasks.where("projectId").equals(projectId).toArray();
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.status === "completed").length;
  return Math.round((completed / tasks.length) * 100);
}

/** Task counts used to power the milestone hover hint (completion % + pending count). */
export async function getProjectTaskStats(
  projectId: string
): Promise<{ total: number; completed: number; pending: number; percent: number }> {
  const tasks = await db.tasks.where("projectId").equals(projectId).toArray();
  const completed = tasks.filter((t) => t.status === "completed").length;
  const pending = tasks.filter((t) => t.status !== "completed").length;
  const percent = tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);
  return { total: tasks.length, completed, pending, percent };
}
