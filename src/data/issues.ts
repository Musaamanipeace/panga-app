// src/data/issues.ts
import { db, type Issue, type IssueSeverity, type IssueStatus, type IssueComment } from "./db";
import { newId, now } from "./utils";

export type { Issue, IssueSeverity, IssueStatus, IssueComment };

export async function listIssues(projectId: string): Promise<Issue[]> {
  const list = await db.issues.where("projectId").equals(projectId).toArray();
  return list.sort((a, b) => a.createdAt - b.createdAt);
}

export async function createIssue(input: {
  projectId: string;
  title: string;
  description?: string;
  severity?: IssueSeverity;
  milestoneId?: string | null;
}): Promise<Issue> {
  const t = now();
  const issue: Issue = {
    id: newId(),
    projectId: input.projectId,
    title: input.title,
    description: input.description ?? "",
    severity: input.severity ?? "medium",
    status: "open",
    labels: [],
    comments: [],
    milestoneId: input.milestoneId ?? null,
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.issues.add(issue);
  return issue;
}

export async function updateIssue(
  id: string,
  changes: Partial<Pick<Issue, "title" | "description" | "severity" | "labels" | "milestoneId">>
): Promise<void> {
  await db.issues.update(id, { ...changes, updatedAt: now(), syncStatus: "pending" });
}

export async function setIssueStatus(id: string, status: IssueStatus): Promise<void> {
  await db.issues.update(id, { status, updatedAt: now(), syncStatus: "pending" });
}

export async function addIssueComment(issueId: string, text: string): Promise<IssueComment> {
  const t = now();
  const comment: IssueComment = {
    id: newId(),
    issueId,
    text,
    createdAt: t,
    updatedAt: t,
  };
  const issue = await db.issues.get(issueId);
  if (issue) {
    const comments = [...(issue.comments ?? []), comment];
    await db.issues.update(issueId, { comments, updatedAt: now(), syncStatus: "pending" });
  }
  return comment;
}

export async function deleteIssueComment(issueId: string, commentId: string): Promise<void> {
  const issue = await db.issues.get(issueId);
  if (issue) {
    const comments = (issue.comments ?? []).filter((c) => c.id !== commentId);
    await db.issues.update(issueId, { comments, updatedAt: now(), syncStatus: "pending" });
  }
}

export async function updateIssueComment(issueId: string, commentId: string, text: string): Promise<void> {
  const issue = await db.issues.get(issueId);
  if (issue) {
    const comments = (issue.comments ?? []).map((c) =>
      c.id === commentId ? { ...c, text, updatedAt: now() } : c
    );
    await db.issues.update(issueId, { comments, updatedAt: now(), syncStatus: "pending" });
  }
}

export async function setIssueLabels(id: string, labels: string[]): Promise<void> {
  await db.issues.update(id, { labels, updatedAt: now(), syncStatus: "pending" });
}

export async function setIssueMilestone(id: string, milestoneId: string | null): Promise<void> {
  await db.issues.update(id, { milestoneId, updatedAt: now(), syncStatus: "pending" });
}

export async function deleteIssue(id: string): Promise<void> {
  await db.issues.delete(id);
}
