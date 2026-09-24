// src/data/issues.ts
import { db, type Issue, type IssueSeverity, type IssueStatus } from "./db";
import { newId, now } from "./utils";

export async function listIssues(projectId: string): Promise<Issue[]> {
  return db.issues.where("projectId").equals(projectId).sortBy("createdAt");
}

export async function createIssue(input: {
  projectId: string;
  title: string;
  description?: string;
  severity?: IssueSeverity;
}): Promise<Issue> {
  const t = now();
  const issue: Issue = {
    id: newId(),
    projectId: input.projectId,
    title: input.title,
    description: input.description ?? "",
    severity: input.severity ?? "medium",
    status: "open",
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.issues.add(issue);
  return issue;
}

export async function updateIssue(
  id: string,
  changes: Partial<Pick<Issue, "title" | "description" | "severity">>
): Promise<void> {
  await db.issues.update(id, { ...changes, updatedAt: now(), syncStatus: "pending" });
}

export async function setIssueStatus(id: string, status: IssueStatus): Promise<void> {
  await db.issues.update(id, { status, updatedAt: now(), syncStatus: "pending" });
}

export async function deleteIssue(id: string): Promise<void> {
  await db.issues.delete(id);
}
