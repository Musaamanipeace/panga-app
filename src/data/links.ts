// src/data/links.ts
import { db, type Link } from "./db";
import { newId, now } from "./utils";
import { syncPushRecord, syncDeleteRecord } from "../sync/sync";
import { logActivity } from "./activity";

export type { Link };

export async function listLinks(folderId: string | null): Promise<Link[]> {
  if (!db.isOpen()) await db.open();
  return db.links.where("folderId").equals(folderId).toArray();
}

export async function listAllLinks(): Promise<Link[]> {
  if (!db.isOpen()) await db.open();
  return db.links.toArray();
}

export async function getLink(id: string): Promise<Link | undefined> {
  if (!db.isOpen()) await db.open();
  return db.links.get(id);
}

export async function createLink(input: {
  folderId: string | null;
  title: string;
  url: string;
  notes?: string;
  tags?: string[];
  order?: number;
}): Promise<Link> {
  if (!db.isOpen()) await db.open();
  const t = now();
  const siblings = await db.links.where("folderId").equals(input.folderId).toArray();
  const order = input.order ?? (siblings.length ? Math.max(...siblings.map((l) => l.order)) + 1 : 0);
  const link: Link = {
    id: newId(),
    folderId: input.folderId ?? null,
    title: input.title.trim(),
    url: input.url.trim(),
    notes: input.notes ?? null,
    tags: input.tags ?? [],
    order,
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.links.add(link);
  void syncPushRecord("links", link);
  void logActivity({ entityType: "link", entityId: link.id, folderId: link.folderId, action: "created", description: `Created link "${link.title}"` });
  return link;
}

export async function updateLink(
  id: string,
  changes: Partial<Pick<Link, "title" | "url" | "notes" | "tags" | "folderId">>
): Promise<void> {
  if (!db.isOpen()) await db.open();
  const updatedAt = now();
  await db.links.update(id, { ...changes, updatedAt, syncStatus: "pending" });
  const updated = await db.links.get(id);
  if (updated) void syncPushRecord("links", updated);
}

export async function deleteLink(id: string): Promise<void> {
  if (!db.isOpen()) await db.open();
  await db.links.delete(id);
  void syncDeleteRecord("links", id);
  recordTombstone("link", id);
  void logActivity({ entityType: "link", entityId: id, action: "deleted", description: "Link deleted" });
}

export async function reorderLinks(folderId: string | null, orderedIds: string[]): Promise<void> {
  if (!db.isOpen()) await db.open();
  await db.transaction("rw", db.links, async () => {
    for (const [index, id] of orderedIds.entries()) {
      await db.links.update(id, { order: index, updatedAt: now(), syncStatus: "pending" });
    }
  });
  for (const id of orderedIds) {
    const updated = await db.links.get(id);
    if (updated) void syncPushRecord("links", updated);
  }
}
