import { db, type Issue, type IssueSeverity, type IssueStatus } from "./db";
import { newId, now } from "./utils";

export type CreateIssueInput = {
  projectId: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  status?: IssueStatus;
};

export type UpdateIssueInput = Partial<
  Omit<Issue, "id" | "projectId" | "createdAt">
>;

export async function createIssue(input: CreateIssueInput): Promise<Issue> {
  const timestamp = now();
  const issue: Issue = {
    id: newId(),
    projectId: input.projectId,
    title: input.title.trim(),
    description: input.description.trim(),
    severity: input.severity,
    status: input.status ?? "open",
    createdAt: timestamp,
    updatedAt: timestamp,
    syncStatus: "pending",
  };

  await db.issues.add(issue);
  return issue;
}

export async function listIssues(projectId?: string): Promise<Issue[]> {
  const collection = projectId ? db.issues.where("projectId").equals(projectId) : db.issues;
  return collection.toArray();
}

export async function getIssue(issueId: string): Promise<Issue | undefined> {
  return db.issues.get(issueId);
}

export async function updateIssue(
  issueId: string,
  input: UpdateIssueInput,
): Promise<void> {
  await db.issues.update(issueId, {
    ...input,
    title: input.title?.trim(),
    description: input.description?.trim(),
    updatedAt: now(),
    syncStatus: "pending",
  });
}

export async function deleteIssue(issueId: string): Promise<void> {
  await db.issues.delete(issueId);
}
