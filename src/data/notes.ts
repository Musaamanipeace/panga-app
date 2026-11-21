// src/data/notes.ts
import { db, type Note } from "./db";
import { newId, now } from "./utils";
import { syncPushRecord, syncDeleteRecord } from "../sync/sync";
import { logActivity } from "./activity";

export type { Note };

export async function listNotes(): Promise<Note[]> {
  if (!db.isOpen()) await db.open();
  return db.notes.orderBy("updatedAt").reverse().toArray();
}

export async function getNote(id: string): Promise<Note | undefined> {
  if (!db.isOpen()) await db.open();
  return db.notes.get(id);
}

export async function createNote(input: {
  title: string;
  body: string;
  tags?: string[];
}): Promise<Note> {
  if (!db.isOpen()) await db.open();
  const t = now();
  const note: Note = {
    id: newId(),
    title: input.title.trim(),
    body: input.body,
    tags: input.tags ?? [],
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.notes.add(note);
  void syncPushRecord("notes", note);
  void logActivity({ entityType: "note", entityId: note.id, action: "created", description: `Created note "${note.title}"` });
  return note;
}

export async function updateNote(
  id: string,
  changes: Partial<Pick<Note, "title" | "body" | "tags">>
): Promise<void> {
  if (!db.isOpen()) await db.open();
  const updatedAt = now();
  await db.notes.update(id, { ...changes, updatedAt, syncStatus: "pending" });
  const updated = await db.notes.get(id);
  if (updated) void syncPushRecord("notes", updated);
}

export async function deleteNote(id: string): Promise<void> {
  if (!db.isOpen()) await db.open();
  await db.notes.delete(id);
  void syncDeleteRecord("notes", id);
  recordTombstone("note", id);
  void logActivity({ entityType: "note", entityId: id, action: "deleted", description: "Note deleted" });
}

export async function searchNotes(query: string): Promise<Note[]> {
  if (!db.isOpen()) await db.open();
  const q = query.trim().toLowerCase();
  if (!q) return listNotes();
  const all = await db.notes.toArray();
  return all.filter(
    (n) =>
      n.title.toLowerCase().includes(q) ||
      n.body.toLowerCase().includes(q) ||
      n.tags.some((tag) => tag.toLowerCase().includes(q))
  );
}
