// src/data/workspaceMove.ts
// Helpers for the Main (Global) workspace prompt workflow: when items are created
// in Main, users can keep them general or move them straight into a target workspace.

import { notifyLocalDataMutated, switchWorkspaceDb, db } from "./db";
import {
  DEFAULT_WORKSPACE_ID,
  getActiveWorkspaceId,
  listWorkspaces,
  setActiveWorkspaceId,
} from "./workspaceState";

export type MovableItemKind = "note" | "taskList" | "link" | "thought" | "clip" | "media";

export interface GlobalPromptPayload {
  kind: MovableItemKind;
  id: string;
  title: string;
}

export function emitGlobalItemPrompt(payload: GlobalPromptPayload): void {
  if (typeof window === "undefined") return;
  if (getActiveWorkspaceId() !== DEFAULT_WORKSPACE_ID) return;
  if (listWorkspaces().length <= 1) return;
  window.dispatchEvent(new CustomEvent<GlobalPromptPayload>("panga-global-prompt", { detail: payload }));
}

/**
 * Move an entity created in sourceWorkspaceId (typically Main) into targetWorkspaceId.
 * Copies related rows (sub-tasks for taskList, cached preview blob for media) and deletes
 * the source copy cleanly before restoring the original active workspace.
 */
export async function moveItemToWorkspace(params: {
  kind: MovableItemKind;
  id: string;
  targetWorkspaceId: string;
  sourceWorkspaceId?: string;
}): Promise<boolean> {
  const sourceId = params.sourceWorkspaceId ?? getActiveWorkspaceId();
  const targetId = params.targetWorkspaceId;
  if (!targetId || targetId === sourceId) return false;
  if (!listWorkspaces().some((w) => w.id === targetId)) return false;

  const originalActive = getActiveWorkspaceId();

  let record: any = null;
  let childRows: any[] = [];
  let blobRow: any = null;

  // Step 1: Extract from source DB
  setActiveWorkspaceId(sourceId);
  await switchWorkspaceDb();
  switch (params.kind) {
    case "note":
      record = await db.notes.get(params.id);
      if (record) await db.notes.delete(params.id);
      break;
    case "link":
      record = await db.links.get(params.id);
      if (record) await db.links.delete(params.id);
      break;
    case "thought":
      record = await db.trainOfThought.get(params.id);
      if (record) await db.trainOfThought.delete(params.id);
      break;
    case "clip":
      record = await db.resources.get(params.id);
      if (record) await db.resources.delete(params.id);
      break;
    case "media":
      record = await db.mediaItems.get(params.id);
      blobRow = await db.mediaBlobs.get(params.id);
      if (record) await db.mediaItems.delete(params.id);
      if (blobRow) await db.mediaBlobs.delete(params.id);
      break;
    case "taskList":
      record = await db.taskLists.get(params.id);
      if (record) {
        childRows = await db.tasks.where("listId").equals(params.id).toArray();
        await db.tasks.where("listId").equals(params.id).delete();
        await db.taskLists.delete(params.id);
      }
      break;
  }

  if (!record) {
    setActiveWorkspaceId(originalActive);
    await switchWorkspaceDb();
    return false;
  }

  // Step 2: Insert into target DB cleanly
  try {
    setActiveWorkspaceId(targetId);
    await switchWorkspaceDb();
    const t = Date.now();
    switch (params.kind) {
      case "note":
        await db.notes.put({ ...record, folderId: null, updatedAt: t, syncStatus: "pending" });
        break;
      case "link":
        await db.links.put({ ...record, folderId: null, updatedAt: t, syncStatus: "pending" });
        break;
      case "thought":
        await db.trainOfThought.put({ ...record, updatedAt: t });
        break;
      case "clip":
        await db.resources.put({ ...record, updatedAt: t, syncStatus: "pending" });
        break;
      case "media":
        await db.mediaItems.put({ ...record, updatedAt: t, syncStatus: "pending" });
        if (blobRow) await db.mediaBlobs.put({ ...blobRow, updatedAt: t });
        break;
      case "taskList":
        await db.taskLists.put({ ...record, folderId: null, updatedAt: t, syncStatus: "pending" });
        if (childRows.length > 0) {
          await db.tasks.bulkPut(
            childRows.map((c) => ({ ...c, updatedAt: t, syncStatus: "pending" }))
          );
        }
        break;
    }
  } finally {
    setActiveWorkspaceId(originalActive);
    await switchWorkspaceDb();
  }

  if (typeof window !== "undefined") {
    notifyLocalDataMutated();
    window.dispatchEvent(new Event("panga-data-updated"));
    window.dispatchEvent(new Event("panga-clips-updated"));
  }
  return true;
}
