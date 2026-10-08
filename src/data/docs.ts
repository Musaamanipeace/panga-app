// src/data/docs.ts
import { db, type DocEntry } from "./db";
import { newId, now } from "./utils";
import { syncPushRecord, syncDeleteRecord } from "../sync/sync";
import { logActivity } from "./activity";

export type { DocEntry };

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
  void syncPushRecord("doc_entries", entry);
  void logActivity({ entityType: "docEntry", entityId: entry.id, projectId: entry.projectId, action: "created", description: `Created documentation "${entry.title}"` });
  return entry;
}

export async function updateDocEntry(
  id: string,
  changes: Partial<Pick<DocEntry, "title" | "content">>
): Promise<void> {
  await db.docEntries.update(id, { ...changes, updatedAt: now(), syncStatus: "pending" });
  const updated = await db.docEntries.get(id);
  if (updated) void syncPushRecord("doc_entries", updated);
}

export async function deleteDocEntry(id: string): Promise<void> {
  await db.docEntries.delete(id);
  void syncDeleteRecord("doc_entries", id);
  void logActivity({ entityType: "docEntry", entityId: id, action: "deleted", description: "Documentation deleted" });
}
