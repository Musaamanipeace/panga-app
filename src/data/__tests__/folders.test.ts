import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";
import { db } from "../db";
import {
  createLinkFolder,
  deleteLinkFolder,
  listLinkFolders,
} from "../linkFolders";
import { createLink, listAllLinks } from "../links";

async function clearTables() {
  await db.transaction("rw", [db.linkFolders, db.links], async () => {
    await db.linkFolders.clear();
    await db.links.clear();
  });
}

describe("nested link folders", () => {
  afterEach(async () => {
    await clearTables();
  });

  it("creates nested folders and reparents contents on delete", async () => {
    const parent = await createLinkFolder({ title: "Parent" });
    const child = await createLinkFolder({ title: "Child", parentFolderId: parent.id });
    const link = await createLink({ folderId: child.id, title: "A link", url: "https://example.com" });

    const allFolders = await listLinkFolders();
    expect(allFolders.map((f) => f.title).sort()).toEqual(["Child", "Parent"]);
    expect((await db.linkFolders.get(child.id))?.parentFolderId).toBe(parent.id);
    expect((await db.links.get(link.id))?.folderId).toBe(child.id);

    await deleteLinkFolder(parent.id);

    expect(await db.linkFolders.get(parent.id)).toBeUndefined();
    const reparentedChild = await db.linkFolders.get(child.id);
    expect(reparentedChild?.parentFolderId).toBeNull();
    // The link lives in the child folder; only the folder moves to root.
    const reparentedLink = await db.links.get(link.id);
    expect(reparentedLink?.folderId).toBe(child.id);

    const topLevel = await listLinkFolders();
    expect(topLevel.filter((f) => f.parentFolderId === null).map((f) => f.id)).toContain(child.id);
    const remainingLinks = await listAllLinks();
    expect(remainingLinks.find((l) => l.id === link.id)?.folderId).toBe(child.id);
  });

  it("creates a folder with parentFolderId null", async () => {
    await clearTables();
    await db.open();
    const f = await createLinkFolder({ title: "Top" });
    expect((await db.linkFolders.get(f.id))?.parentFolderId).toBeNull();
  });
});
