import { db, type ThoughtEntry } from "./db";
import { newId } from "./utils";

export type { ThoughtEntry };

export async function listThoughts(limit = 80): Promise<ThoughtEntry[]> {
  if (!db.isOpen()) await db.open();
  return db.trainOfThought.orderBy("createdAt").reverse().limit(limit).toArray();
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
  window.dispatchEvent(new CustomEvent("panga-data-updated"));
  return entry;
}

export async function deleteThought(id: string): Promise<void> {
  if (!db.isOpen()) await db.open();
  await db.trainOfThought.delete(id);
  window.dispatchEvent(new CustomEvent("panga-data-updated"));
}

export async function clearThoughts(): Promise<void> {
  if (!db.isOpen()) await db.open();
  await db.trainOfThought.clear();
  window.dispatchEvent(new CustomEvent("panga-data-updated"));
}
