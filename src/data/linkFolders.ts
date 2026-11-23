// src/data/linkFolders.ts
import { db, type LinkFolder } from "./db";
import { newId, now } from "./utils";
import { logActivity } from "./activity";

export type { LinkFolder };

export async function listLinkFolders(): Promise<LinkFolder[]> {
  if (!db.isOpen()) await db.open();
  return db.linkFolders.orderBy("order").toArray();
}

export async function getLinkFolder(id: string): Promise<LinkFolder | undefined> {
  if (!db.isOpen()) await db.open();
  return db.linkFolders.get(id);
}

export async function createLinkFolder(input: {
  title: string;
  order?: number;
  parentFolderId?: string | null;
}): Promise<LinkFolder> {
  if (!db.isOpen()) await db.open();
  const t = now();
  const folders = await db.linkFolders.toArray();
  const order = input.order ?? (folders.length ? Math.max(...folders.map((f) => f.order)) + 1 : 0);
  const folder: LinkFolder = {
    id: newId(),
    parentFolderId: input.parentFolderId ?? null,
    title: input.title.trim(),
    order,
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.linkFolders.add(folder);
  void logActivity({ entityType: "linkFolder", entityId: folder.id, action: "created", description: `Created link folder "${folder.title}"` });
  return folder;
}

export async function updateLinkFolder(
  id: string,
  changes: Partial<Pick<LinkFolder, "title" | "order" | "parentFolderId">>
): Promise<void> {
  if (!db.isOpen()) await db.open();
  const updatedAt = now();
  await db.linkFolders.update(id, { ...changes, updatedAt, syncStatus: "pending" });
}

export async function renameLinkFolder(id: string, title: string): Promise<void> {
  await updateLinkFolder(id, { title: title.trim() });
}

export async function reorderLinkFolders(orderedIds: string[]): Promise<void> {
  if (!db.isOpen()) await db.open();
  await db.transaction("rw", db.linkFolders, async () => {
    for (const [index, id] of orderedIds.entries()) {
      await db.linkFolders.update(id, { order: index, updatedAt: now(), syncStatus: "pending" });
    }
  });
}

/** Delete a folder, reparenting subfolders and links to its parent (or root). */
export async function deleteLinkFolder(id: string): Promise<void> {
  if (!db.isOpen()) await db.open();
  const folder = await db.linkFolders.get(id);
  const parentId = folder?.parentFolderId ?? null;
  const subfolders = await db.linkFolders.where("parentFolderId").equals(id).toArray();
  const links = await db.links.where("folderId").equals(id).toArray();
  await db.transaction("rw", [db.links, db.linkFolders], async () => {
    for (const sf of subfolders) {
      await db.linkFolders.update(sf.id, { parentFolderId: parentId, updatedAt: now(), syncStatus: "pending" });
    }
    for (const link of links) {
      await db.links.update(link.id, { folderId: parentId, updatedAt: now(), syncStatus: "pending" });
    }
    await db.linkFolders.delete(id);
  });
  void logActivity({ entityType: "linkFolder", entityId: id, action: "deleted", description: "Link folder deleted" });
}
