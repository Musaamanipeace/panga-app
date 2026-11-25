// src/sync/googleDriveSync.ts
// Google Drive backup & conflict-guarded sync for Panga JSON snapshots.
// All mutating Drive or local restore actions must be explicitly confirmed by the user.

import {
  exportSnapshot,
  importSnapshot,
  validateSnapshot,
  SNAPSHOT_VERSION,
  type Snapshot,
  type SnapshotWorkspaces,
} from "./snapshot";
import { invalidateDriveAccessToken } from "./googleAuth";
import { DEFAULT_WORKSPACE_ID, DEFAULT_WORKSPACE_NAME } from "../data/workspaceState";

export const DRIVE_BACKUP_FILENAME = "panga-backup.json";

const DRIVE_FILES_API = "https://www.googleapis.com/drive/v3/files";
const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3/files";
const BASELINE_STORAGE_KEY = "panga_drive_sync_baseline";
const LOCAL_MUTATION_STORAGE_KEY = "panga_drive_local_mutation_at";

export interface DriveFileMeta {
  id: string;
  name: string;
  modifiedTime: string | null;
  size: number | null;
}

export interface SnapshotSummary {
  exportedAt: string | null;
  latestRecordAt: number;
  workspaces: number;
  tasks: number;
  taskLists: number;
  notes: number;
  links: number;
  reminders: number;
  clips: number;
  thoughts: number;
}

export type DriveSyncStatus =
  | "no_remote"
  | "in_sync"
  | "local_ahead"
  | "remote_ahead"
  | "conflict";

export interface DriveSyncBaseline {
  uid: string;
  fileId: string;
  fileName: string;
  remoteModifiedTime: string | null;
  lastSyncedAt: string;
  lastSyncedDigest: string;
}

export interface DriveSyncReport {
  status: DriveSyncStatus;
  localSnapshot: Snapshot;
  localSummary: SnapshotSummary;
  localDigest: string;
  remoteFile: DriveFileMeta | null;
  remoteSnapshot: Snapshot | null;
  remoteSummary: SnapshotSummary | null;
  remoteDigest: string | null;
  baseline: DriveSyncBaseline | null;
  checkedAt: string;
}

export class DriveAuthExpiredError extends Error {
  constructor(message = "Your Google Drive session expired. Please reconnect Google Drive.") {
    super(message);
    this.name = "DriveAuthExpiredError";
  }
}

function baselineKey(uid?: string | null): string {
  return `${BASELINE_STORAGE_KEY}_${uid || "default"}`;
}

export function getDriveSyncBaseline(uid?: string | null): DriveSyncBaseline | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const raw = localStorage.getItem(baselineKey(uid));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DriveSyncBaseline;
    return parsed && typeof parsed.fileId === "string" ? parsed : null;
  } catch {
    return null;
  }
}

export function saveDriveSyncBaseline(baseline: DriveSyncBaseline): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  localStorage.setItem(baselineKey(baseline.uid), JSON.stringify(baseline));
}

export function clearDriveSyncBaseline(uid?: string | null): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  localStorage.removeItem(baselineKey(uid));
}

export function markLocalMutation(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  localStorage.setItem(LOCAL_MUTATION_STORAGE_KEY, String(Date.now()));
}

export function getLastLocalMutationAt(): number {
  if (typeof window === "undefined" || !window.localStorage) return 0;
  const raw = Number(localStorage.getItem(LOCAL_MUTATION_STORAGE_KEY) || "0");
  return Number.isFinite(raw) ? raw : 0;
}

function collectWorkspaceData(snap: Snapshot): Array<Record<string, any[]>> {
  if (snap.workspaces?.items && snap.workspaces.items.length > 0) {
    return snap.workspaces.items.map((w) => w.data || {});
  }
  return [snap.data || {}];
}

export function summarizeSnapshot(snap: Snapshot): SnapshotSummary {
  const datasets = collectWorkspaceData(snap);
  let latestRecordAt = 0;
  let tasks = 0;
  let taskLists = 0;
  let notes = 0;
  let links = 0;
  let reminders = 0;
  let clips = 0;
  let thoughts = 0;

  for (const data of datasets) {
    tasks += Array.isArray(data.tasks) ? data.tasks.length : 0;
    taskLists += Array.isArray(data.taskLists) ? data.taskLists.length : 0;
    notes += Array.isArray(data.notes) ? data.notes.length : 0;
    links += Array.isArray(data.links) ? data.links.length : 0;
    reminders += Array.isArray(data.reminders) ? data.reminders.length : 0;
    clips += Array.isArray(data.clips) ? data.clips.length : 0;
    thoughts += Array.isArray(data.thoughts) ? data.thoughts.length : 0;

    for (const rows of Object.values(data)) {
      if (!Array.isArray(rows)) continue;
      for (const row of rows) {
        if (!row || typeof row !== "object") continue;
        const ts = Math.max(
          typeof row.updatedAt === "number" ? row.updatedAt : 0,
          typeof row.createdAt === "number" ? row.createdAt : 0
        );
        if (ts > latestRecordAt) latestRecordAt = ts;
      }
    }
  }

  return {
    exportedAt: snap.metadata?.exportedAt ?? null,
    latestRecordAt,
    workspaces: datasets.length,
    tasks,
    taskLists,
    notes,
    links,
    reminders,
    clips,
    thoughts,
  };
}

function hasMeaningfulContent(summary: SnapshotSummary): boolean {
  return (
    summary.tasks > 0 ||
    summary.notes > 0 ||
    summary.links > 0 ||
    summary.reminders > 0 ||
    summary.clips > 0 ||
    summary.thoughts > 0 ||
    summary.workspaces > 1
  );
}

/** Deterministic content digest ignoring volatile metadata timestamps so identical DBs match cleanly. */
export function computeSnapshotDigest(snap: Snapshot): string {
  const stable = {
    version: snap.metadata?.version ?? SNAPSHOT_VERSION,
    username: snap.identity?.username ?? "",
    data: sortTablesForDigest(snap.data || {}),
    workspaces: snap.workspaces
      ? {
          activeId: snap.workspaces.activeId,
          items: [...snap.workspaces.items]
            .sort((a, b) => a.id.localeCompare(b.id))
            .map((w) => ({ id: w.id, name: w.name, data: sortTablesForDigest(w.data || {}) })),
        }
      : null,
  };
  const json = JSON.stringify(stable);
  // FNV-1a 32-bit hash encoded as base36 with byte length for fast collision-resistant comparison.
  let hash = 0x811c9dc5;
  for (let i = 0; i < json.length; i++) {
    hash ^= json.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return `${(hash >>> 0).toString(36)}_${json.length}`;
}

function sortTablesForDigest(data: Record<string, any[]>): Record<string, any[]> {
  const out: Record<string, any[]> = {};
  for (const key of Object.keys(data).sort()) {
    const rows = Array.isArray(data[key]) ? data[key] : [];
    out[key] = [...rows].sort((a, b) => {
      const ka = String(a?.id ?? a?.key ?? "");
      const kb = String(b?.id ?? b?.key ?? "");
      return ka.localeCompare(kb);
    });
  }
  return out;
}

export function classifyDriveSync(params: {
  localSnapshot: Snapshot;
  remoteFile: DriveFileMeta | null;
  remoteSnapshot: Snapshot | null;
  baseline: DriveSyncBaseline | null;
}): {
  status: DriveSyncStatus;
  localDigest: string;
  remoteDigest: string | null;
  localSummary: SnapshotSummary;
  remoteSummary: SnapshotSummary | null;
} {
  const { localSnapshot, remoteFile, remoteSnapshot, baseline } = params;
  const localDigest = computeSnapshotDigest(localSnapshot);
  const localSummary = summarizeSnapshot(localSnapshot);

  if (!remoteFile || !remoteSnapshot) {
    return {
      status: "no_remote",
      localDigest,
      remoteDigest: null,
      localSummary,
      remoteSummary: null,
    };
  }

  const remoteDigest = computeSnapshotDigest(remoteSnapshot);
  const remoteSummary = summarizeSnapshot(remoteSnapshot);

  if (localDigest === remoteDigest) {
    return {
      status: "in_sync",
      localDigest,
      remoteDigest,
      localSummary,
      remoteSummary,
    };
  }

  if (baseline && baseline.fileId === remoteFile.id) {
    const localChanged = localDigest !== baseline.lastSyncedDigest;
    const remoteChanged =
      remoteDigest !== baseline.lastSyncedDigest ||
      (Boolean(remoteFile.modifiedTime) &&
        Boolean(baseline.remoteModifiedTime) &&
        remoteFile.modifiedTime !== baseline.remoteModifiedTime);

    if (localChanged && remoteChanged) {
      return { status: "conflict", localDigest, remoteDigest, localSummary, remoteSummary };
    }
    if (remoteChanged && !localChanged) {
      return { status: "remote_ahead", localDigest, remoteDigest, localSummary, remoteSummary };
    }
    if (localChanged && !remoteChanged) {
      return { status: "local_ahead", localDigest, remoteDigest, localSummary, remoteSummary };
    }
    return { status: "conflict", localDigest, remoteDigest, localSummary, remoteSummary };
  }

  const localHasData = hasMeaningfulContent(localSummary);
  const remoteHasData = hasMeaningfulContent(remoteSummary);

  if (!localHasData && remoteHasData) {
    return { status: "remote_ahead", localDigest, remoteDigest, localSummary, remoteSummary };
  }
  if (localHasData && !remoteHasData) {
    return { status: "local_ahead", localDigest, remoteDigest, localSummary, remoteSummary };
  }
  return { status: "conflict", localDigest, remoteDigest, localSummary, remoteSummary };
}

function rowTimestamp(row: any): number {
  if (!row || typeof row !== "object") return 0;
  return Math.max(
    typeof row.updatedAt === "number" ? row.updatedAt : 0,
    typeof row.createdAt === "number" ? row.createdAt : 0
  );
}

function mergeTableRows(tableName: string, localRows: any[], remoteRows: any[], remoteNewer: boolean): any[] {
  if (tableName === "settings") {
    const map = new Map<string, any>();
    for (const row of localRows) {
      if (row && typeof row.key === "string") map.set(row.key, row);
    }
    for (const row of remoteRows) {
      if (!row || typeof row.key !== "string") continue;
      const existing = map.get(row.key);
      if (!existing || (remoteNewer && row.value !== undefined && row.value !== "")) {
        map.set(row.key, row);
      }
    }
    return [...map.values()];
  }

  const byId = new Map<string, any>();
  const extras: any[] = [];
  for (const row of localRows) {
    if (row && typeof row.id === "string") {
      byId.set(row.id, row);
    } else if (row) {
      extras.push(row);
    }
  }
  for (const row of remoteRows) {
    if (!row || typeof row.id !== "string") {
      if (row) extras.push(row);
      continue;
    }
    const existing = byId.get(row.id);
    if (!existing) {
      byId.set(row.id, row);
      continue;
    }
    const localTs = rowTimestamp(existing);
    const remoteTs = rowTimestamp(row);
    if (remoteTs > localTs) {
      byId.set(row.id, row);
    }
  }
  return [...byId.values(), ...extras];
}

function mergeTableMaps(
  localData: Record<string, any[]>,
  remoteData: Record<string, any[]>,
  remoteNewer: boolean
): Record<string, any[]> {
  const keys = new Set([...Object.keys(localData || {}), ...Object.keys(remoteData || {})]);
  const merged: Record<string, any[]> = {};
  for (const key of keys) {
    const a = Array.isArray(localData?.[key]) ? localData[key] : [];
    const b = Array.isArray(remoteData?.[key]) ? remoteData[key] : [];
    merged[key] = mergeTableRows(key, a, b, remoteNewer);
  }
  return merged;
}

/** Non-destructive record-level merge keeping unique items and newer edits by timestamp. */
export function mergeSnapshots(localSnap: Snapshot, remoteSnap: Snapshot): Snapshot {
  const localExported = Date.parse(localSnap.metadata?.exportedAt || "") || 0;
  const remoteExported = Date.parse(remoteSnap.metadata?.exportedAt || "") || 0;
  const remoteNewer = remoteExported > localExported;

  const toWorkspaceMap = (snap: Snapshot): Map<string, { id: string; name: string; data: Record<string, any[]> }> => {
    const map = new Map<string, { id: string; name: string; data: Record<string, any[]> }>();
    if (snap.workspaces?.items && snap.workspaces.items.length > 0) {
      for (const item of snap.workspaces.items) {
        map.set(item.id, { id: item.id, name: item.name || DEFAULT_WORKSPACE_NAME, data: item.data || {} });
      }
    } else {
      map.set(DEFAULT_WORKSPACE_ID, {
        id: DEFAULT_WORKSPACE_ID,
        name: DEFAULT_WORKSPACE_NAME,
        data: snap.data || {},
      });
    }
    return map;
  };

  const localWs = toWorkspaceMap(localSnap);
  const remoteWs = toWorkspaceMap(remoteSnap);
  const allWsIds = new Set([...localWs.keys(), ...remoteWs.keys()]);
  const mergedItems: SnapshotWorkspaces["items"] = [];

  for (const id of allWsIds) {
    const a = localWs.get(id);
    const b = remoteWs.get(id);
    if (a && b) {
      mergedItems.push({
        id,
        name: a.name || b.name || DEFAULT_WORKSPACE_NAME,
        data: mergeTableMaps(a.data, b.data, remoteNewer),
      });
    } else if (a) {
      mergedItems.push(a);
    } else if (b) {
      mergedItems.push(b);
    }
  }

  const activeId =
    localSnap.workspaces?.activeId && mergedItems.some((w) => w.id === localSnap.workspaces!.activeId)
      ? localSnap.workspaces.activeId
      : DEFAULT_WORKSPACE_ID;
  const activeData =
    mergedItems.find((w) => w.id === activeId)?.data ??
    mergedItems[0]?.data ??
    mergeTableMaps(localSnap.data || {}, remoteSnap.data || {}, remoteNewer);

  const localIdentity = localSnap.identity;
  const remoteIdentity = remoteSnap.identity;
  const identity = localIdentity?.loggedIn
    ? localIdentity
    : remoteIdentity?.loggedIn
      ? remoteIdentity
      : localIdentity ?? remoteIdentity;

  return {
    metadata: {
      version: SNAPSHOT_VERSION,
      exportedAt: new Date().toISOString(),
      appName: "Panga",
      dbVersion: Math.max(localSnap.metadata?.dbVersion ?? 1, remoteSnap.metadata?.dbVersion ?? 1),
    },
    ...(identity ? { identity } : {}),
    data: activeData,
    ...(mergedItems.length > 1 ? { workspaces: { activeId, items: mergedItems } } : {}),
  };
}

async function driveFetch(url: string, token: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });
  if (res.status === 401) {
    invalidateDriveAccessToken();
    throw new DriveAuthExpiredError();
  }
  return res;
}

export async function findDriveBackupFile(token: string): Promise<DriveFileMeta | null> {
  const params = new URLSearchParams({
    q: `name = '${DRIVE_BACKUP_FILENAME}' and trashed = false`,
    spaces: "drive",
    orderBy: "modifiedTime desc",
    pageSize: "5",
    fields: "files(id,name,modifiedTime,size)",
  });
  const res = await driveFetch(`${DRIVE_FILES_API}?${params.toString()}`, token);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Could not check Google Drive (${res.status}): ${text || res.statusText}`);
  }
  const json = (await res.json()) as {
    files?: Array<{ id: string; name: string; modifiedTime?: string; size?: string }>;
  };
  const first = json.files?.[0];
  if (!first) return null;
  return {
    id: first.id,
    name: first.name,
    modifiedTime: first.modifiedTime ?? null,
    size: first.size ? Number(first.size) : null,
  };
}

export async function downloadDriveBackup(token: string, fileId: string): Promise<Snapshot> {
  const res = await driveFetch(`${DRIVE_FILES_API}/${encodeURIComponent(fileId)}?alt=media`, token);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Could not download Google Drive backup (${res.status}): ${text || res.statusText}`);
  }
  let parsed: unknown;
  try {
    parsed = await res.json();
  } catch {
    throw new Error("The Google Drive backup file is not valid JSON.");
  }
  const snap = validateSnapshot(parsed);
  if (!snap) {
    throw new Error("The Google Drive backup file is missing required Panga snapshot fields.");
  }
  return snap;
}

/** Read-only preflight check comparing local IndexedDB snapshot vs Google Drive backup. */
export async function inspectDriveSync(token: string, uid?: string | null): Promise<DriveSyncReport> {
  const [localSnapshot, remoteFile] = await Promise.all([
    exportSnapshot(),
    findDriveBackupFile(token),
  ]);
  const remoteSnapshot = remoteFile ? await downloadDriveBackup(token, remoteFile.id) : null;
  const baseline = getDriveSyncBaseline(uid);
  const classified = classifyDriveSync({
    localSnapshot,
    remoteFile,
    remoteSnapshot,
    baseline,
  });

  if (classified.status === "in_sync" && remoteFile) {
    const synced: DriveSyncBaseline = {
      uid: uid || "default",
      fileId: remoteFile.id,
      fileName: remoteFile.name,
      remoteModifiedTime: remoteFile.modifiedTime,
      lastSyncedAt: new Date().toISOString(),
      lastSyncedDigest: classified.localDigest,
    };
    saveDriveSyncBaseline(synced);
  }

  return {
    ...classified,
    localSnapshot,
    remoteFile,
    remoteSnapshot,
    baseline,
    checkedAt: new Date().toISOString(),
  };
}

function buildMultipartBody(metadata: Record<string, unknown>, contentJson: string, boundary: string): string {
  return [
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    JSON.stringify(metadata),
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    contentJson,
    `--${boundary}--`,
  ].join("\r\n");
}

/** Uploads a snapshot to Google Drive (creating or updating panga-backup.json). Call only after user confirmation. */
export async function pushSnapshotToDrive(
  token: string,
  options: { uid?: string | null; fileId?: string | null; snapshot?: Snapshot }
): Promise<DriveSyncBaseline> {
  const snapshot = options.snapshot ?? (await exportSnapshot());
  const contentJson = JSON.stringify(snapshot, null, 2);
  const boundary = `panga_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

  const metadata = options.fileId
    ? { name: DRIVE_BACKUP_FILENAME, mimeType: "application/json" }
    : { name: DRIVE_BACKUP_FILENAME, mimeType: "application/json" };

  const url = options.fileId
    ? `${DRIVE_UPLOAD_API}/${encodeURIComponent(options.fileId)}?uploadType=multipart&fields=id,name,modifiedTime`
    : `${DRIVE_UPLOAD_API}?uploadType=multipart&fields=id,name,modifiedTime`;

  const res = await driveFetch(url, token, {
    method: options.fileId ? "PATCH" : "POST",
    headers: {
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body: buildMultipartBody(metadata, contentJson, boundary),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Could not save backup to Google Drive (${res.status}): ${text || res.statusText}`);
  }

  const uploaded = (await res.json()) as { id: string; name: string; modifiedTime?: string };
  const baseline: DriveSyncBaseline = {
    uid: options.uid || "default",
    fileId: uploaded.id,
    fileName: uploaded.name || DRIVE_BACKUP_FILENAME,
    remoteModifiedTime: uploaded.modifiedTime ?? null,
    lastSyncedAt: new Date().toISOString(),
    lastSyncedDigest: computeSnapshotDigest(snapshot),
  };
  saveDriveSyncBaseline(baseline);
  return baseline;
}

/** Replaces local IndexedDB with the remote Drive snapshot. Call only after user confirmation. */
export async function pullSnapshotFromDrive(options: {
  uid?: string | null;
  remoteFile: DriveFileMeta;
  remoteSnapshot: Snapshot;
}): Promise<DriveSyncBaseline> {
  await importSnapshot(options.remoteSnapshot);
  const digest = computeSnapshotDigest(options.remoteSnapshot);
  const baseline: DriveSyncBaseline = {
    uid: options.uid || "default",
    fileId: options.remoteFile.id,
    fileName: options.remoteFile.name,
    remoteModifiedTime: options.remoteFile.modifiedTime,
    lastSyncedAt: new Date().toISOString(),
    lastSyncedDigest: digest,
  };
  saveDriveSyncBaseline(baseline);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("panga-data-updated"));
  }
  return baseline;
}

/** Merges local & Drive snapshots, updates local DB, and saves merged result to Drive. Call only after user confirmation. */
export async function mergeAndSyncDrive(
  token: string,
  options: { uid?: string | null; report: DriveSyncReport }
): Promise<DriveSyncBaseline> {
  const { report, uid } = options;
  if (!report.remoteSnapshot) {
    return pushSnapshotToDrive(token, {
      uid,
      fileId: report.remoteFile?.id ?? null,
      snapshot: report.localSnapshot,
    });
  }
  const merged = mergeSnapshots(report.localSnapshot, report.remoteSnapshot);
  await importSnapshot(merged);
  const baseline = await pushSnapshotToDrive(token, {
    uid,
    fileId: report.remoteFile?.id ?? null,
    snapshot: merged,
  });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("panga-data-updated"));
  }
  return baseline;
}

/** Deletes the remote panga-backup.json file from Google Drive. Call only after user confirmation. */
export async function deleteDriveBackup(
  token: string,
  options: { uid?: string | null; fileId: string }
): Promise<void> {
  const res = await driveFetch(`${DRIVE_FILES_API}/${encodeURIComponent(options.fileId)}`, token, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 404) {
    const text = await res.text().catch(() => "");
    throw new Error(`Could not delete Google Drive backup (${res.status}): ${text || res.statusText}`);
  }
  clearDriveSyncBaseline(options.uid);
}
