// src/data/noteFolders.ts
import { db, type NoteFolder } from "./db";
import { newId, now } from "./utils";
import { logActivity } from "./activity";

export type { NoteFolder };

export async function listNoteFolders(): Promise<NoteFolder[]> {
  if (!db.isOpen()) await db.open();
  return db.noteFolders.orderBy("order").toArray();
}

export async function getNoteFolder(id: string): Promise<NoteFolder | undefined> {
  if (!db.isOpen()) await db.open();
  return db.noteFolders.get(id);
}

export async function createNoteFolder(input: {
  title: string;
  order?: number;
  parentFolderId?: string | null;
}): Promise<NoteFolder> {
  if (!db.isOpen()) await db.open();
  const t = now();
  const folders = await db.noteFolders.toArray();
  const order = input.order ?? (folders.length ? Math.max(...folders.map((f) => f.order)) + 1 : 0);
  const folder: NoteFolder = {
    id: newId(),
    parentFolderId: input.parentFolderId ?? null,
    title: input.title.trim(),
    order,
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.noteFolders.add(folder);
  void logActivity({ entityType: "noteFolder", entityId: folder.id, action: "created", description: `Created note folder "${folder.title}"` });
  return folder;
}

export async function updateNoteFolder(
  id: string,
  changes: Partial<Pick<NoteFolder, "title" | "order" | "parentFolderId">>
): Promise<void> {
  if (!db.isOpen()) await db.open();
  const updatedAt = now();
  await db.noteFolders.update(id, { ...changes, updatedAt, syncStatus: "pending" });
}

export async function renameNoteFolder(id: string, title: string): Promise<void> {
  await updateNoteFolder(id, { title: title.trim() });
}

export async function reorderNoteFolders(orderedIds: string[]): Promise<void> {
  if (!db.isOpen()) await db.open();
  await db.transaction("rw", db.noteFolders, async () => {
    for (const [index, id] of orderedIds.entries()) {
      await db.noteFolders.update(id, { order: index, updatedAt: now(), syncStatus: "pending" });
    }
  });
}

/** Delete a folder, reparenting subfolders and notes to its parent (or root). */
export async function deleteNoteFolder(id: string): Promise<void> {
  if (!db.isOpen()) await db.open();
  const folder = await db.noteFolders.get(id);
  const parentId = folder?.parentFolderId ?? null;
  const subfolders = await db.noteFolders.where("parentFolderId").equals(id).toArray();
  const notes = await db.notes.where("folderId").equals(id).toArray();
  await db.transaction("rw", [db.notes, db.noteFolders], async () => {
    for (const sf of subfolders) {
      await db.noteFolders.update(sf.id, { parentFolderId: parentId, updatedAt: now(), syncStatus: "pending" });
    }
    for (const note of notes) {
      await db.notes.update(note.id, { folderId: parentId, updatedAt: now(), syncStatus: "pending" });
    }
    await db.noteFolders.delete(id);
  });
  void logActivity({ entityType: "noteFolder", entityId: id, action: "deleted", description: "Note folder deleted" });
}
