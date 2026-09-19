import { db, type DocEntry } from "./db";
import { newId, now } from "./utils";

export type CreateDocEntryInput = {
  projectId: string;
  type: DocEntry["type"];
  title: string;
  content: string;
  order?: number;
};

export type UpdateDocEntryInput = Partial<
  Omit<DocEntry, "id" | "projectId" | "createdAt">
>;

export async function createDocEntry(
  input: CreateDocEntryInput,
): Promise<DocEntry> {
  const timestamp = now();
  const entry: DocEntry = {
    id: newId(),
    projectId: input.projectId,
    type: input.type,
    title: input.title.trim(),
    content: input.content,
    order: input.order ?? 0,
    createdAt: timestamp,
    updatedAt: timestamp,
    syncStatus: "pending",
  };

  await db.docEntries.add(entry);
  return entry;
}

export async function listDocEntries(projectId?: string): Promise<DocEntry[]> {
  const collection = projectId
    ? db.docEntries.where("projectId").equals(projectId)
    : db.docEntries;
  return collection.toArray();
}

export async function getDocEntry(entryId: string): Promise<DocEntry | undefined> {
  return db.docEntries.get(entryId);
}

export async function updateDocEntry(
  entryId: string,
  input: UpdateDocEntryInput,
): Promise<void> {
  await db.docEntries.update(entryId, {
    ...input,
    title: input.title?.trim(),
    updatedAt: now(),
    syncStatus: "pending",
  });
}

export async function deleteDocEntry(entryId: string): Promise<void> {
  await db.docEntries.delete(entryId);
}
