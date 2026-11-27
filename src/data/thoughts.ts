import { db, notifyLocalDataMutated, type ThoughtEntry } from "./db";
import { emitGlobalItemPrompt } from "./workspaceMove";
import { newId } from "./utils";

export type { ThoughtEntry };

export async function listThoughts(limit = 80): Promise<ThoughtEntry[]> {
  if (!db.isOpen()) await db.open();
  return db.trainOfThought.orderBy("createdAt").reverse().limit(limit).toArray();
}

export async function countThoughts(): Promise<number> {
  if (!db.isOpen()) await db.open();
  return db.trainOfThought.count();
}

export async function addThought(text: string, projectContext: string | null = null): Promise<ThoughtEntry> {
  if (!db.isOpen()) await db.open();
  const t = Date.now();
  const entry: ThoughtEntry = {
    id: newId(),
    text: text.trim(),
    projectContext,
    createdAt: t,
    updatedAt: t,
  };
  await db.trainOfThought.add(entry);
  notifyLocalDataMutated();
  emitGlobalItemPrompt({ kind: "thought", id: entry.id, title: entry.text.slice(0, 60) || "Thought" });
  window.dispatchEvent(new CustomEvent("panga-data-updated"));
  return entry;
}

export async function deleteThought(id: string): Promise<void> {
  if (!db.isOpen()) await db.open();
  await db.trainOfThought.delete(id);
  notifyLocalDataMutated();
  window.dispatchEvent(new CustomEvent("panga-data-updated"));
}

export async function clearThoughts(): Promise<void> {
  if (!db.isOpen()) await db.open();
  await db.trainOfThought.clear();
  notifyLocalDataMutated();
  window.dispatchEvent(new CustomEvent("panga-data-updated"));
}

export async function updateThought(id: string, changes: Partial<Pick<ThoughtEntry, "text" | "taskId" | "noteId">>): Promise<void> {
  if (!db.isOpen()) await db.open();
  await db.trainOfThought.update(id, { ...changes, updatedAt: Date.now() });
  notifyLocalDataMutated();
  window.dispatchEvent(new CustomEvent("panga-data-updated"));
}
