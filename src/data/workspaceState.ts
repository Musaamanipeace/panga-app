// src/data/workspaceState.ts
// Leaf module (only depends on the session id helper) that remembers which
// workspaces exist for the current account and which one is active. db.ts reads
// it at construction time to pick the IndexedDB name, so it must stay import-light.

import { getSessionUserId } from "../auth/sessionUserId";

export const DEFAULT_WORKSPACE_ID = "main";
export const DEFAULT_WORKSPACE_NAME = "Main";

export type WorkspaceTemplateId = "developer" | "daily-routine" | "social-events";

export interface WorkspaceInfo {
  id: string;
  name: string;
  parentWorkspaceId?: string | null;
  templateId?: WorkspaceTemplateId;
}

const LIST_KEY = "panga_workspaces";
const ACTIVE_KEY = "panga_active_workspace";

function scoped(key: string): string {
  return `${key}_${getSessionUserId() ?? "guest"}`;
}

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function normalizeEntry(raw: unknown): WorkspaceInfo | null {
  if (!raw || typeof raw !== "object") return null;
  const candidate = raw as Partial<WorkspaceInfo>;
  if (typeof candidate.id !== "string" || typeof candidate.name !== "string") return null;
  const out: WorkspaceInfo = { id: candidate.id, name: candidate.name };
  if (typeof candidate.parentWorkspaceId === "string" && candidate.parentWorkspaceId) {
    out.parentWorkspaceId = candidate.parentWorkspaceId;
  } else if (candidate.parentWorkspaceId === null) {
    out.parentWorkspaceId = null;
  }
  if (
    candidate.templateId === "developer" ||
    candidate.templateId === "daily-routine" ||
    candidate.templateId === "social-events"
  ) {
    out.templateId = candidate.templateId;
  }
  return out;
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
    ? (parsed as unknown[]).map(normalizeEntry).filter((w): w is WorkspaceInfo => w !== null)
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

export function addWorkspaceEntry(
  name: string,
  options?: { parentWorkspaceId?: string | null; templateId?: WorkspaceTemplateId; id?: string }
): WorkspaceInfo {
  const info: WorkspaceInfo = {
    id: options?.id ?? newWorkspaceId(),
    name: name.trim() || "Untitled workspace",
  };
  if (options?.parentWorkspaceId && options.parentWorkspaceId !== DEFAULT_WORKSPACE_ID) {
    info.parentWorkspaceId = options.parentWorkspaceId;
  }
  if (options?.templateId) {
    info.templateId = options.templateId;
  }
  writeList([...readList(), info]);
  return info;
}

export function renameWorkspaceEntry(id: string, name: string): void {
  const clean = name.trim();
  if (!clean) return;
  writeList(readList().map((w) => (w.id === id ? { ...w, name: clean } : w)));
}

export function setWorkspaceParentEntry(id: string, parentWorkspaceId: string | null): void {
  if (id === DEFAULT_WORKSPACE_ID) return;
  const items = readList();
  // Prevent cycles: walk ancestors from proposed parent
  let cursor = parentWorkspaceId;
  let guard = 0;
  while (cursor && guard++ < 25) {
    if (cursor === id) return;
    cursor = items.find((w) => w.id === cursor)?.parentWorkspaceId ?? null;
  }
  writeList(
    items.map((w) => {
      if (w.id !== id) return w;
      const next: WorkspaceInfo = { id: w.id, name: w.name, ...(w.templateId ? { templateId: w.templateId } : {}) };
      if (parentWorkspaceId && parentWorkspaceId !== DEFAULT_WORKSPACE_ID) {
        next.parentWorkspaceId = parentWorkspaceId;
      }
      return next;
    })
  );
}

export function removeWorkspaceEntry(id: string): void {
  if (id === DEFAULT_WORKSPACE_ID) return;
  const items = readList();
  const target = items.find((w) => w.id === id);
  const nextParent = target?.parentWorkspaceId ?? null;
  writeList(
    items
      .filter((w) => w.id !== id)
      .map((w) => {
        if (w.parentWorkspaceId !== id) return w;
        const updated: WorkspaceInfo = { id: w.id, name: w.name, ...(w.templateId ? { templateId: w.templateId } : {}) };
        if (nextParent) updated.parentWorkspaceId = nextParent;
        return updated;
      })
  );
}

export function getWorkspacePath(id: string, items: WorkspaceInfo[] = readList()): WorkspaceInfo[] {
  const byId = new Map(items.map((w) => [w.id, w]));
  const chain: WorkspaceInfo[] = [];
  const seen = new Set<string>();
  let cur = byId.get(id);
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id);
    chain.unshift(cur);
    cur = cur.parentWorkspaceId ? byId.get(cur.parentWorkspaceId) : undefined;
  }
  return chain;
}

export function getWorkspaceDepth(id: string, items: WorkspaceInfo[] = readList()): number {
  return Math.max(0, getWorkspacePath(id, items).length - 1);
}

export function formatWorkspaceLabel(w: WorkspaceInfo, items: WorkspaceInfo[] = readList()): string {
  if (w.id === DEFAULT_WORKSPACE_ID) return `${w.name} (Global)`;
  const path = getWorkspacePath(w.id, items);
  return path.map((x) => x.name).join(" / ") || w.name;
}

/** Replace the whole workspace list (used when restoring a snapshot). */
export function replaceWorkspaceEntries(items: WorkspaceInfo[]): void {
  writeList(items.map(normalizeEntry).filter((w): w is WorkspaceInfo => w !== null));
}

/** IndexedDB name suffix for a workspace; the default workspace keeps the legacy name. */
export function workspaceDbSuffix(id: string = getActiveWorkspaceId()): string {
  return id === DEFAULT_WORKSPACE_ID ? "" : `__ws_${id}`;
}
