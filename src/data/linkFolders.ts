// src/data/linkFolders.ts
import { db, type LinkFolder } from "./db";
import { newId, now } from "./utils";
import { syncPushRecord, syncDeleteRecord } from "../sync/sync";
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
}): Promise<LinkFolder> {
  if (!db.isOpen()) await db.open();
  const t = now();
  const folders = await db.linkFolders.toArray();
  const order = input.order ?? (folders.length ? Math.max(...folders.map((f) => f.order)) + 1 : 0);
  const folder: LinkFolder = {
    id: newId(),
    title: input.title.trim(),
    order,
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.linkFolders.add(folder);
  void syncPushRecord("linkFolders", folder);
  void logActivity({ entityType: "linkFolder", entityId: folder.id, action: "created", description: `Created link folder "${folder.title}"` });
  return folder;
}

export async function updateLinkFolder(
  id: string,
  changes: Partial<Pick<LinkFolder, "title" | "order">>
): Promise<void> {
  if (!db.isOpen()) await db.open();
  const updatedAt = now();
  await db.linkFolders.update(id, { ...changes, updatedAt, syncStatus: "pending" });
  const updated = await db.linkFolders.get(id);
  if (updated) void syncPushRecord("linkFolders", updated);
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
  for (const id of orderedIds) {
    const updated = await db.linkFolders.get(id);
    if (updated) void syncPushRecord("linkFolders", updated);
  }
}

export async function deleteLinkFolder(id: string, options?: { moveLinksToFolderId?: string }): Promise<void> {
  if (!db.isOpen()) await db.open();
  const moveTo = options?.moveLinksToFolderId;
  const links = await db.links.where("folderId").equals(id).toArray();
  await db.transaction("rw", [db.links, db.linkFolders], async () => {
    for (const link of links) {
      if (moveTo) {
        await db.links.update(link.id, { folderId: moveTo, updatedAt: now(), syncStatus: "pending" });
        const updated = await db.links.get(link.id);
        if (updated) void syncPushRecord("links", updated);
      } else {
        await db.links.delete(link.id);
        void syncDeleteRecord("links", link.id);
        recordTombstone("link", link.id);
      }
    }
    await db.linkFolders.delete(id);
  });
  void syncDeleteRecord("linkFolders", id);
  recordTombstone("linkFolder", id);
  void logActivity({ entityType: "linkFolder", entityId: id, action: "deleted", description: "Link folder deleted" });
}
