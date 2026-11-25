import "fake-indexeddb/auto";
import Dexie from "dexie";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetGuestSession } from "../../auth/session";
import { createNote, listAllNotes } from "../notes";
import { getAIApiKey, getAIProvider, setAIApiKey, setAIProvider } from "../settings";
import {
  createWorkspace,
  deleteWorkspace,
  getActiveWorkspaceId,
  listWorkspaces,
  renameWorkspace,
  switchWorkspace,
} from "../workspaces";
import { DEFAULT_WORKSPACE_ID } from "../workspaceState";
import { exportSnapshot, importSnapshot } from "../../sync/snapshot";

beforeEach(async () => {
  localStorage.clear();
  await resetGuestSession();
});

describe("workspaces", () => {
  it("starts with one default workspace", () => {
    expect(listWorkspaces()).toEqual([{ id: DEFAULT_WORKSPACE_ID, name: "Main" }]);
    expect(getActiveWorkspaceId()).toBe(DEFAULT_WORKSPACE_ID);
  });

  it("swaps the visible dataset on switch and keeps BYOK settings shared", async () => {
    await setAIProvider("groq");
    await setAIApiKey("gemini", "gem-key-1");
    await createNote({ folderId: null, title: "Main note", body: "in main" });

    const second = await createWorkspace("Research Hub");
    expect(getActiveWorkspaceId()).toBe(second.id);
    expect(await listAllNotes()).toHaveLength(0);
    // Credentials follow the account, not the workspace.
    expect(await getAIApiKey("gemini")).toBe("gem-key-1");
    expect(await getAIProvider()).toBe("groq");

    await createNote({ folderId: null, title: "Research note", body: "in research" });
    expect((await listAllNotes()).map((n) => n.title)).toEqual(["Research note"]);

    await switchWorkspace(DEFAULT_WORKSPACE_ID);
    expect((await listAllNotes()).map((n) => n.title)).toEqual(["Main note"]);
    expect(await getAIApiKey("gemini")).toBe("gem-key-1");
  });

  it("renames and deletes a workspace, never the default", async () => {
    const ws = await createWorkspace("Drafts");
    renameWorkspace(ws.id, "Drafts 2");
    expect(listWorkspaces().find((w) => w.id === ws.id)?.name).toBe("Drafts 2");

    await deleteWorkspace(DEFAULT_WORKSPACE_ID);
    expect(listWorkspaces().some((w) => w.id === DEFAULT_WORKSPACE_ID)).toBe(true);

    await deleteWorkspace(ws.id);
    expect(listWorkspaces().some((w) => w.id === ws.id)).toBe(false);
    expect(getActiveWorkspaceId()).toBe(DEFAULT_WORKSPACE_ID);
  });

  it("exports and restores every workspace in one snapshot", async () => {
    await createNote({ folderId: null, title: "Main note", body: "a" });
    const ws = await createWorkspace("Ideas");
    await createNote({ folderId: null, title: "Idea note", body: "b" });

    const snap = await exportSnapshot();
    expect(snap.workspaces?.items.map((w) => w.name).sort()).toEqual(["Ideas", "Main"]);
    expect(getActiveWorkspaceId()).toBe(ws.id);

    localStorage.clear();
    await importSnapshot(JSON.parse(JSON.stringify(snap)));
    expect(listWorkspaces().map((w) => w.name).sort()).toEqual(["Ideas", "Main"]);
    expect((await listAllNotes()).map((n) => n.title)).toEqual(["Idea note"]);
    await switchWorkspace(DEFAULT_WORKSPACE_ID);
    expect((await listAllNotes()).map((n) => n.title)).toEqual(["Main note"]);
  });
});

describe("v14 task list flattening", () => {
  it("keeps the folder name as a title prefix when lists leave their folders", async () => {
    vi.resetModules();
    localStorage.clear();
    localStorage.setItem("panga_guest", "1");
    localStorage.setItem("panga_session_user_id", "guest_migrate_test");
    const name = "panga-db-guest_migrate_test";

    const old = new Dexie(name);
    old.version(13).stores({
      taskLists: "id, folderId, order, updatedAt, syncStatus",
      taskListFolders: "id, parentFolderId, order, updatedAt, syncStatus",
    });
    await old.open();
    await old.table("taskListFolders").bulkAdd([
      { id: "f1", title: "Inbox", parentFolderId: null, order: 0 },
      { id: "f2", title: "Home", parentFolderId: null, order: 1 },
      { id: "f3", title: "Garden", parentFolderId: "f2", order: 0 },
    ]);
    await old.table("taskLists").bulkAdd([
      { id: "l1", title: "Quick", folderId: "f1", order: 0 },
      { id: "l2", title: "Weeding", folderId: "f3", order: 1 },
      { id: "l3", title: "Loose", folderId: null, order: 2 },
    ]);
    old.close();

    const fresh = await import("../db");
    await fresh.db.open();
    const lists = await fresh.db.taskLists.orderBy("order").toArray();
    expect(lists.map((l) => [l.title, l.folderId])).toEqual([
      ["Quick", null],
      ["Home / Garden / Weeding", null],
      ["Loose", null],
    ]);
    fresh.db.close();
  });
});
