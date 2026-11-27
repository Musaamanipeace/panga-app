// src/data/notes.ts
import { db, notifyLocalDataMutated, type Note } from "./db";
import { emitGlobalItemPrompt } from "./workspaceMove";
import { newId, now } from "./utils";
import { logActivity } from "./activity";

export type { Note };

export async function listNotes(folderId: string | null = null): Promise<Note[]> {
  if (!db.isOpen()) await db.open();
  if (folderId === null) {
    return db.notes.filter((n) => n.folderId === null).toArray();
  }
  return db.notes.where("folderId").equals(folderId).toArray();
}

export async function listAllNotes(): Promise<Note[]> {
  if (!db.isOpen()) await db.open();
  return db.notes.orderBy("updatedAt").reverse().toArray();
}

export async function getNote(id: string): Promise<Note | undefined> {
  if (!db.isOpen()) await db.open();
  return db.notes.get(id);
}

export async function createNote(input: {
  folderId: string | null;
  title: string;
  body: string;
  tags?: string[];
}): Promise<Note> {
  if (!db.isOpen()) await db.open();
  const t = now();
  const note: Note = {
    id: newId(),
    folderId: input.folderId,
    title: input.title.trim(),
    body: input.body,
    tags: input.tags ?? [],
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.notes.add(note);
  notifyLocalDataMutated();
  emitGlobalItemPrompt({ kind: "note", id: note.id, title: note.title || "Untitled note" });
  void logActivity({ entityType: "note", entityId: note.id, action: "created", description: `Created note "${note.title}"` });
  return note;
}

export async function updateNote(
  id: string,
  changes: Partial<Pick<Note, "title" | "body" | "tags" | "folderId">>
): Promise<void> {
  if (!db.isOpen()) await db.open();
  const updatedAt = now();
  await db.notes.update(id, { ...changes, updatedAt, syncStatus: "pending" });
  notifyLocalDataMutated();
}

export async function deleteNote(id: string): Promise<void> {
  if (!db.isOpen()) await db.open();
  await db.notes.delete(id);
  notifyLocalDataMutated();
  void logActivity({ entityType: "note", entityId: id, action: "deleted", description: "Note deleted" });
}

export async function searchNotes(query: string): Promise<Note[]> {
  if (!db.isOpen()) await db.open();
  const q = query.trim().toLowerCase();
  if (!q) return listAllNotes();
  const all = await db.notes.toArray();
  return all.filter(
    (n) =>
      n.title.toLowerCase().includes(q) ||
      n.body.toLowerCase().includes(q) ||
      n.tags.some((tag) => tag.toLowerCase().includes(q))
  );
}
