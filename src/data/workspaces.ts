// src/data/workspaces.ts
// Workspace switching. Each workspace is its own IndexedDB under the same account;
// BYOK credentials live in the account-level store, so they are untouched by switches.

import { db, switchUserAccount } from "./db";
import {
  getAllAccountSettings,
  isAccountSettingKey,
  setAccountSetting,
} from "./accountSettings";
import {
  DEFAULT_WORKSPACE_ID,
  addWorkspaceEntry,
  getActiveWorkspaceId,
  listWorkspaces,
  removeWorkspaceEntry,
  renameWorkspaceEntry,
  setActiveWorkspaceId,
  workspaceDbSuffix,
  type WorkspaceInfo,
} from "./workspaceState";
import { getSessionUserId } from "../auth/sessionUserId";
import Dexie from "dexie";

export type { WorkspaceInfo };
export { getActiveWorkspace, getActiveWorkspaceId, listWorkspaces } from "./workspaceState";

/**
 * Copy account-level settings (BYOK keys, provider/model) that still sit in the
 * open workspace database into the account store. Never overwrites a value that
 * the account store already has.
 */
export async function captureAccountSettings(): Promise<void> {
  try {
    if (!db.isOpen()) await db.open();
    const rows = await db.settings.toArray();
    const existing = getAllAccountSettings();
    for (const row of rows) {
      if (!isAccountSettingKey(row.key)) continue;
      if (existing[row.key] === undefined || existing[row.key] === null) {
        if (row.value !== undefined && row.value !== null) setAccountSetting(row.key, row.value);
      }
    }
  } catch (e) {
    console.warn("captureAccountSettings error:", e);
  }
}

export async function switchWorkspace(id: string): Promise<void> {
  if (id === getActiveWorkspaceId()) return;
  if (!listWorkspaces().some((w) => w.id === id)) return;
  await captureAccountSettings();
  setActiveWorkspaceId(id);
  await switchUserAccount();
}

export async function createWorkspace(name: string): Promise<WorkspaceInfo> {
  const info = addWorkspaceEntry(name);
  await switchWorkspace(info.id);
  return info;
}

export function renameWorkspace(id: string, name: string): void {
  renameWorkspaceEntry(id, name);
}

/** Deletes a workspace and its data. The default workspace cannot be deleted. */
export async function deleteWorkspace(id: string): Promise<void> {
  if (id === DEFAULT_WORKSPACE_ID) return;
  if (getActiveWorkspaceId() === id) await switchWorkspace(DEFAULT_WORKSPACE_ID);
  removeWorkspaceEntry(id);
  const userId = getSessionUserId();
  const base = userId ? `panga-db-${userId}` : "panga-db-guest";
  try {
    await Dexie.delete(`${base}${workspaceDbSuffix(id)}`);
  } catch (e) {
    console.warn("deleteWorkspace error:", e);
  }
}
