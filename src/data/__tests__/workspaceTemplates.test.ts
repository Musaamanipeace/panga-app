import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { resetGuestSession } from "../../auth/session";
import { db, switchWorkspaceDb } from "../db";
import { createNote, listAllNotes } from "../notes";
import { createTaskList, listTaskLists } from "../taskLists";
import { createLink, listAllLinks } from "../links";
import { addThought, listThoughts } from "../thoughts";
import {
  createWorkspace,
  deleteWorkspace,
  formatWorkspaceLabel,
  getActiveWorkspaceId,
  listWorkspaces,
  setWorkspaceParent,
  switchWorkspace,
} from "../workspaces";
import { DEFAULT_WORKSPACE_ID, replaceWorkspaceEntries } from "../workspaceState";
import { ensureDefaultWorkspaceTemplates } from "../workspaceTemplates";
import { moveItemToWorkspace } from "../workspaceMove";
import { createMediaFromFile, listMediaItems } from "../media";

describe("workspaceTemplates, nested subworkspaces & Main move workflow", () => {
  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await resetGuestSession();
    replaceWorkspaceEntries([{ id: DEFAULT_WORKSPACE_ID, name: "Main" }]);
    await switchWorkspace(DEFAULT_WORKSPACE_ID);
    await switchWorkspaceDb();
    await db.open();
    await Promise.all([
      db.notes.clear(),
      db.noteFolders.clear(),
      db.taskLists.clear(),
      db.tasks.clear(),
      db.links.clear(),
      db.trainOfThought.clear(),
      db.mediaItems.clear(),
      db.mediaBlobs.clear(),
    ]);
  });

  it("supports parent/subworkspace nesting, cycle prevention, and child reparenting on deletion", async () => {
    const eng = await createWorkspace("Engineering");
    const frontend = await createWorkspace("Frontend", { parentWorkspaceId: eng.id });
    const ui = await createWorkspace("Design System", { parentWorkspaceId: frontend.id });

    // Cycle attempt: trying to set Engineering's parent to its grandchild UI should be ignored
    setWorkspaceParent(eng.id, ui.id);
    const itemsAfterCycleAttempt = listWorkspaces();
    expect(itemsAfterCycleAttempt.find((w) => w.id === eng.id)?.parentWorkspaceId).toBeUndefined();
    expect(formatWorkspaceLabel(ui, itemsAfterCycleAttempt)).toBe("Engineering / Frontend / Design System");

    // Delete middle parent -> Design System should reparent up to Engineering
    await deleteWorkspace(frontend.id);
    const afterDelete = listWorkspaces();
    const uiAfter = afterDelete.find((w) => w.id === ui.id);
    expect(uiAfter?.parentWorkspaceId).toBe(eng.id);
    expect(formatWorkspaceLabel(uiAfter!, afterDelete)).toBe("Engineering / Design System");
  });

  it("seeds Developer, clean Daily routine, and Social events templates once, allows delete & restore without clobbering edits", async () => {
    const firstRun = await ensureDefaultWorkspaceTemplates();
    expect(firstRun.restored).toEqual(["Developer", "Daily routine", "Social events"]);

    const workspaces = listWorkspaces();
    const dev = workspaces.find((w) => w.name === "Developer")!;
    const daily = workspaces.find((w) => w.name === "Daily routine")!;
    const social = workspaces.find((w) => w.name === "Social events")!;
    expect(dev).toBeDefined();
    expect(daily).toBeDefined();
    expect(social).toBeDefined();

    // Verify Developer has git commands + workspace scripts & can be added to
    await switchWorkspace(dev.id);
    const devLists = await listTaskLists();
    expect(devLists.map((l) => l.title)).toContain("Git commands");
    expect(devLists.map((l) => l.title)).toContain("Workspace scripts");
    const customNote = await createNote({ folderId: null, title: "My team git aliases", body: "git co = checkout" });

    // Verify Daily routine starts empty
    await switchWorkspace(daily.id);
    expect(await listAllNotes()).toHaveLength(0);
    expect(await listTaskLists()).toHaveLength(0);

    // Delete Social events and Daily routine, ensure non-force ensureDefaultWorkspaceTemplates doesn't respawn
    await switchWorkspace(DEFAULT_WORKSPACE_ID);
    await deleteWorkspace(social.id);
    await deleteWorkspace(daily.id);
    expect((await ensureDefaultWorkspaceTemplates()).restored).toEqual([]);

    // Restore explicitly via forceRestore
    const restored = await ensureDefaultWorkspaceTemplates({ forceRestore: true });
    expect(restored.restored).toEqual(["Daily routine", "Social events"]);

    // Existing Developer workspace + user edits must stay completely untouched
    await switchWorkspace(dev.id);
    const notes = await listAllNotes();
    expect(notes.some((n) => n.id === customNote.id && n.title === "My team git aliases")).toBe(true);
  });

  it("moves notes, taskLists, links, thoughts, and media from Main (Global) into a target workspace", async () => {
    const target = await createWorkspace("Work");
    await switchWorkspace(DEFAULT_WORKSPACE_ID);
    expect(getActiveWorkspaceId()).toBe(DEFAULT_WORKSPACE_ID);

    const note = await createNote({ folderId: null, title: "Draft spec", body: "Move me" });
    const tl = await createTaskList({ folderId: null, title: "Release tasks" });
    const lnk = await createLink({ folderId: null, title: "Docs", url: "https://example.com" });
    const th = await addThought("Remember architecture doc");
    const med = await createMediaFromFile(new File(["imgdata"], "diagram.png", { type: "image/png" }));

    expect(await moveItemToWorkspace({ kind: "note", id: note.id, targetWorkspaceId: target.id })).toBe(true);
    expect(await moveItemToWorkspace({ kind: "taskList", id: tl.id, targetWorkspaceId: target.id })).toBe(true);
    expect(await moveItemToWorkspace({ kind: "link", id: lnk.id, targetWorkspaceId: target.id })).toBe(true);
    expect(await moveItemToWorkspace({ kind: "thought", id: th.id, targetWorkspaceId: target.id })).toBe(true);
    expect(await moveItemToWorkspace({ kind: "media", id: med.id, targetWorkspaceId: target.id })).toBe(true);

    // Source (Main) should no longer have those moved items
    expect(getActiveWorkspaceId()).toBe(DEFAULT_WORKSPACE_ID);
    expect((await listAllNotes()).some((n) => n.id === note.id)).toBe(false);
    expect((await listTaskLists()).some((l) => l.id === tl.id)).toBe(false);
    expect((await listAllLinks()).some((l) => l.id === lnk.id)).toBe(false);
    expect((await listThoughts(50)).some((t) => t.id === th.id)).toBe(false);
    expect((await listMediaItems()).some((m) => m.id === med.id)).toBe(false);

    // Target workspace should own all moved items (and media cached blob)
    await switchWorkspace(target.id);
    expect((await listAllNotes()).some((n) => n.id === note.id)).toBe(true);
    expect((await listTaskLists()).some((l) => l.id === tl.id)).toBe(true);
    expect((await listAllLinks()).some((l) => l.id === lnk.id)).toBe(true);
    expect((await listThoughts(50)).some((t) => t.id === th.id)).toBe(true);
    expect((await listMediaItems()).some((m) => m.id === med.id)).toBe(true);
    expect(await db.mediaBlobs.get(med.id)).toBeDefined();
  });
});
