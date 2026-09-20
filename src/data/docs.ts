// src/data/docs.ts
import { db, type DocEntry } from "./db";
import { newId, now } from "./utils";

export async function listDocEntries(projectId: string): Promise<DocEntry[]> {
  return db.docEntries.where("projectId").equals(projectId).sortBy("order");
}

export async function createDocEntry(input: {
  projectId: string;
  type: "outline" | "phase";
  title: string;
  content?: string;
}): Promise<DocEntry> {
  const t = now();
  const existing = await listDocEntries(input.projectId);
  const entry: DocEntry = {
    id: newId(),
    projectId: input.projectId,
    type: input.type,
    title: input.title,
    content: input.content ?? "",
    order: existing.length,
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.docEntries.add(entry);
  return entry;
}

export async function updateDocEntry(
  id: string,
  changes: Partial<Pick<DocEntry, "title" | "content">>
): Promise<void> {
  await db.docEntries.update(id, { ...changes, updatedAt: now(), syncStatus: "pending" });
}

export async function deleteDocEntry(id: string): Promise<void> {
  await db.docEntries.delete(id);
}
