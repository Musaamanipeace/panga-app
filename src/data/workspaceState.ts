// src/data/workspaceState.ts
// Leaf module (only depends on the session id helper) that remembers which
// workspaces exist for the current account and which one is active. db.ts reads
// it at construction time to pick the IndexedDB name, so it must stay import-light.

import { getSessionUserId } from "../auth/sessionUserId";

export const DEFAULT_WORKSPACE_ID = "main";
export const DEFAULT_WORKSPACE_NAME = "Main";

export interface WorkspaceInfo {
  id: string;
  name: string;
}

const LIST_KEY = "panga_workspaces";
const ACTIVE_KEY = "panga_active_workspace";

function scoped(key: string): string {
  return `${key}_${getSessionUserId() ?? "guest"}`;
}

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function readList(): WorkspaceInfo[] {
  if (!hasStorage()) return [{ id: DEFAULT_WORKSPACE_ID, name: DEFAULT_WORKSPACE_NAME }];
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(localStorage.getItem(scoped(LIST_KEY)) ?? "null");
  } catch {
    parsed = null;
  }
  const items = Array.isArray(parsed)
    ? (parsed as unknown[]).filter(
        (w): w is WorkspaceInfo =>
          !!w && typeof (w as WorkspaceInfo).id === "string" && typeof (w as WorkspaceInfo).name === "string"
      )
    : [];
  if (!items.some((w) => w.id === DEFAULT_WORKSPACE_ID)) {
    items.unshift({ id: DEFAULT_WORKSPACE_ID, name: DEFAULT_WORKSPACE_NAME });
  }
  return items;
}

function writeList(items: WorkspaceInfo[]): void {
  if (!hasStorage()) return;
  localStorage.setItem(scoped(LIST_KEY), JSON.stringify(items));
}

export function listWorkspaces(): WorkspaceInfo[] {
  return readList();
}

export function getActiveWorkspaceId(): string {
  if (!hasStorage()) return DEFAULT_WORKSPACE_ID;
  const id = localStorage.getItem(scoped(ACTIVE_KEY));
  return id && readList().some((w) => w.id === id) ? id : DEFAULT_WORKSPACE_ID;
}

export function getActiveWorkspace(): WorkspaceInfo {
  const id = getActiveWorkspaceId();
  return readList().find((w) => w.id === id) ?? { id: DEFAULT_WORKSPACE_ID, name: DEFAULT_WORKSPACE_NAME };
}

export function setActiveWorkspaceId(id: string): void {
  if (!hasStorage()) return;
  localStorage.setItem(scoped(ACTIVE_KEY), id);
}

function newWorkspaceId(): string {
  return "w" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function addWorkspaceEntry(name: string): WorkspaceInfo {
  const info = { id: newWorkspaceId(), name: name.trim() || "Untitled workspace" };
  writeList([...readList(), info]);
  return info;
}

export function renameWorkspaceEntry(id: string, name: string): void {
  const clean = name.trim();
  if (!clean) return;
  writeList(readList().map((w) => (w.id === id ? { ...w, name: clean } : w)));
}

export function removeWorkspaceEntry(id: string): void {
  if (id === DEFAULT_WORKSPACE_ID) return;
  writeList(readList().filter((w) => w.id !== id));
}

/** Replace the whole workspace list (used when restoring a snapshot). */
export function replaceWorkspaceEntries(items: WorkspaceInfo[]): void {
  writeList(items);
}

/** IndexedDB name suffix for a workspace; the default workspace keeps the legacy name. */
export function workspaceDbSuffix(id: string = getActiveWorkspaceId()): string {
  return id === DEFAULT_WORKSPACE_ID ? "" : `__ws_${id}`;
}
