// Clipboard history = notes in the default "clipboard" category.
// Local-only by default: clips are NOT part of the cloud sync (people copy passwords).
import { db, notifyLocalDataMutated } from "./db";
import { emitGlobalItemPrompt } from "./workspaceMove";
import type { Resource } from "./db";
import { createResource, deleteResource } from "./resources";
import { getUserScopedKey } from "../auth/session";

export const CLIPBOARD_CATEGORY = "clipboard";
const MAX_CLIPS = 200;

export type AddClipResult = "saved" | "empty" | "duplicate";

export function clipTitle(text: string): string {
  const line = text.trim().split(/\r?\n/)[0] ?? "";
  return line.length > 60 ? `${line.slice(0, 57)}…` : line;
}

function notify(): void {
  window.dispatchEvent(new CustomEvent("panga-clips-updated"));
}

export async function listClips(): Promise<Resource[]> {
  if (!db.isOpen()) await db.open();
  const rows = await db.resources.where("category").equals(CLIPBOARD_CATEGORY).toArray();
  return rows.sort((a, b) => b.createdAt - a.createdAt);
}

export async function addClip(text: string): Promise<AddClipResult> {
  const clean = text.trim();
  if (!clean) return "empty";
  const existing = await listClips();
  if (existing[0]?.body === clean) return "duplicate";
  const created = await createResource({
    category: CLIPBOARD_CATEGORY,
    title: clipTitle(clean),
    body: clean,
    tags: ["clip"],
  });
  // Keep the history bounded.
  for (const old of existing.slice(MAX_CLIPS - 1)) await deleteResource(old.id);
  notifyLocalDataMutated();
  emitGlobalItemPrompt({ kind: "clip", id: created.id, title: created.title });
  notify();
  return "saved";
}

export async function removeClip(id: string): Promise<void> {
  await deleteResource(id);
  notifyLocalDataMutated();
  notify();
}

export async function clearClips(): Promise<void> {
  for (const c of await listClips()) await deleteResource(c.id);
  notifyLocalDataMutated();
  notify();
}

/**
 * One tap: read the system clipboard and save it as a clip.
 * Needs a user gesture; browsers may show a permission prompt (always on Safari/Firefox).
 * Returns null when the browser refused or does not support reading.
 */
export async function quickPaste(): Promise<AddClipResult | null> {
  try {
    if (!navigator.clipboard?.readText) return null;
    const text = await navigator.clipboard.readText();
    return await addClip(text);
  } catch {
    return null;
  }
}

/** One-time move of the old floating "Stash" items into the Clipboard category. */
export async function migrateStash(): Promise<void> {
  const flag = getUserScopedKey("panga-stash-migrated");
  try {
    if (localStorage.getItem(flag)) return;
    const key = getUserScopedKey("panga-stash");
    const raw = localStorage.getItem(key);
    if (raw) {
      const items = JSON.parse(raw) as { type: string; content: string }[];
      for (const it of items) {
        if (it.type === "text" || it.type === "link") await addClip(it.content);
      }
      localStorage.removeItem(key);
    }
    localStorage.setItem(flag, "1");
  } catch {
    /* ignore: migration is best-effort */
  }
}
