// src/sync/snapshot.ts
// Local-first JSON snapshot export/import. Serializes the IndexedDB contents
// to an unencrypted, versioned JSON file for backup and restore, carrying the
// JSON account username and workspace identity.

import {
  db,
  exportDbState,
  importDbState,
  hasLocalData,
  switchWorkspaceDb,
  type Reminder,
  type ReminderFolder,
} from "../data/db";
import {
  exportAccountDbState,
  importAccountDbState,
  REMINDERS_MIGRATED_KEY,
} from "../data/accountDb";
import { getAllAccountSettings, isAccountSettingKey, setAccountSetting } from "../data/accountSettings";
import {
  getActiveWorkspaceId,
  listWorkspaces,
  replaceWorkspaceEntries,
  setActiveWorkspaceId,
  DEFAULT_WORKSPACE_ID,
} from "../data/workspaceState";
import { getSetting, setSetting } from "../data/settings";
import {
  getSessionEmail,
  getSessionUserId,
  getSessionUsername,
  isGuest,
  resetGuestSession,
  setGuestMode,
  setSession,
  setSessionUsername,
} from "../auth/session";

export const SNAPSHOT_VERSION = "1.0";
export const JSON_USERNAME_SETTING_KEY = "jsonAccountUsername";

export interface SnapshotMetadata {
  version: string;
  exportedAt: string; // ISO date
  appName: string;
  dbVersion: number;
}

export interface SnapshotIdentity {
  userId: string;
  username: string;
  email: string;
  loggedIn: boolean;
}

export interface SnapshotWorkspaces {
  activeId: string;
  items: Array<{ id: string; name: string; data: Record<string, any[]> }>;
}

export interface SnapshotAccountData {
  reminders: Reminder[];
  reminderFolders: ReminderFolder[];
}

export interface Snapshot {
  metadata: SnapshotMetadata;
  identity?: SnapshotIdentity;
  /** Account-level reminders and reminder folders shared across workspaces. */
  accountData?: SnapshotAccountData;
  /** Data of the workspace that was active when the snapshot was taken. */
  data: Record<string, any[]>;
  /** Present when the account has more than one workspace; carries all of them. */
  workspaces?: SnapshotWorkspaces;
}

/** BYOK keys and provider/model choices are account-level; make sure the export carries the current ones. */
function withAccountSettings(data: Record<string, any[]>): Record<string, any[]> {
  const rows: any[] = Array.isArray(data.settings) ? data.settings.filter((r: any) => !isAccountSettingKey(r?.key)) : [];
  for (const [key, value] of Object.entries(getAllAccountSettings())) {
    if (isAccountSettingKey(key)) {
      rows.push({ key, value });
    }
  }
  return { ...data, settings: rows };
}

/** Validate that a parsed object looks like a Panga snapshot. */
export function validateSnapshot(obj: unknown): Snapshot | null {
  if (!obj || typeof obj !== "object") return null;
  const root = obj as any;
  if (
    typeof root.metadata !== "object" ||
    root.metadata === null ||
    typeof root.metadata.version !== "string" ||
    typeof root.metadata.exportedAt !== "string"
  ) {
    return null;
  }
  if (typeof root.data !== "object" || root.data === null) return null;
  return root as Snapshot;
}

/** Get the saved JSON account username (from settings or session). */
export async function getJsonAccountUsername(): Promise<string> {
  const fromSetting = await getSetting<string>(JSON_USERNAME_SETTING_KEY);
  if (typeof fromSetting === "string" && fromSetting.trim()) return fromSetting.trim();
  return getSessionUsername();
}

/** Save the JSON account username in both local settings and session storage. */
export async function setJsonAccountUsername(username: string): Promise<string> {
  const clean = username.trim();
  await setSetting(JSON_USERNAME_SETTING_KEY, clean);
  setSessionUsername(clean);
  return clean;
}

function collectLegacyAccountData(snapshot: Snapshot): SnapshotAccountData {
  const sources: Array<{ workspaceId: string; data: Record<string, any[]> }> =
    snapshot.workspaces?.items && snapshot.workspaces.items.length > 0
      ? snapshot.workspaces.items.map((w) => ({ workspaceId: w.id, data: w.data || {} }))
      : [{ workspaceId: DEFAULT_WORKSPACE_ID, data: snapshot.data || {} }];

  const reminders = new Map<string, Reminder>();
  const folders = new Map<string, ReminderFolder>();

  for (const src of sources) {
    const rawFolders = Array.isArray(src.data.reminderFolders) ? (src.data.reminderFolders as ReminderFolder[]) : [];
    for (const f of rawFolders) {
      if (!f || typeof f.id !== "string") continue;
      const existing = folders.get(f.id);
      if (!existing || (f.updatedAt ?? 0) > (existing.updatedAt ?? 0)) {
        folders.set(f.id, f);
      }
    }

    const rawReminders = Array.isArray(src.data.reminders) ? (src.data.reminders as Reminder[]) : [];
    for (const r of rawReminders) {
      if (!r || typeof r.id !== "string") continue;
      const stamped: Reminder = r.workspaceId ? r : { ...r, workspaceId: src.workspaceId };
      const existing = reminders.get(stamped.id);
      if (!existing || (stamped.updatedAt ?? 0) > (existing.updatedAt ?? 0)) {
        reminders.set(
          stamped.id,
          stamped.workspaceId ? stamped : { ...stamped, workspaceId: existing?.workspaceId ?? src.workspaceId }
        );
      }
    }
  }

  return {
    reminders: [...reminders.values()],
    reminderFolders: [...folders.values()],
  };
}

/**
 * Export the whole local database plus the JSON account identity.
 * No encryption or password is applied.
 */
export async function exportSnapshot(): Promise<Snapshot> {
  const activeId = getActiveWorkspaceId();
  const workspaceList = listWorkspaces();
  const [rawData, accountData] = await Promise.all([
    exportDbState({ includeSecrets: true }),
    exportAccountDbState(),
  ]);
  const data = withAccountSettings(rawData);
  let workspaces: SnapshotWorkspaces | undefined;
  if (workspaceList.length > 1) {
    const items: SnapshotWorkspaces["items"] = [];
    try {
      for (const w of workspaceList) {
        if (w.id === activeId) {
          items.push({ id: w.id, name: w.name, data });
          continue;
        }
        setActiveWorkspaceId(w.id);
        await switchWorkspaceDb();
        items.push({ id: w.id, name: w.name, data: withAccountSettings(await exportDbState({ includeSecrets: true })) });
      }
    } finally {
      setActiveWorkspaceId(activeId);
      await switchWorkspaceDb();
    }
    workspaces = { activeId, items };
  }
  const userId = getSessionUserId();
  const email = getSessionEmail() ?? "guest@local";
  const guest = isGuest();
  const savedUsername = await getJsonAccountUsername();
  const username = savedUsername || (guest ? "guest" : email.split("@")[0]);
  return {
    metadata: {
      version: SNAPSHOT_VERSION,
      exportedAt: new Date().toISOString(),
      appName: "Panga",
      dbVersion: db.verno,
    },
    identity: {
      userId: userId ?? "guest@local",
      username,
      email,
      loggedIn: !guest && !!userId,
    },
    accountData,
    data,
    ...(workspaces ? { workspaces } : {}),
  };
}

/**
 * Import a JSON snapshot. Restores the workspace identity and JSON account
 * username before loading the records into IndexedDB.
 */
export async function importSnapshot(snapshot: Snapshot): Promise<void> {
  const identity = snapshot.identity;

  if (identity?.loggedIn && identity.userId) {
    await setSession(identity.userId, identity.email || `${identity.username || "user"}@local`, identity.username || "");
  } else {
    await resetGuestSession();
    await setGuestMode();
  }

  const restoredWorkspaces = snapshot.workspaces?.items?.filter((w) => w && typeof w.id === "string" && w.data);
  if (restoredWorkspaces && restoredWorkspaces.length > 0) {
    replaceWorkspaceEntries(restoredWorkspaces.map((w) => ({ id: w.id, name: w.name || "Workspace" })));
    for (const w of restoredWorkspaces) {
      setActiveWorkspaceId(w.id);
      await switchWorkspaceDb();
      await importDbState(w.data, { includeSecrets: true });
      restoreAccountSettings(w.data);
    }
    const wanted = snapshot.workspaces?.activeId;
    setActiveWorkspaceId(restoredWorkspaces.some((w) => w.id === wanted) ? (wanted as string) : DEFAULT_WORKSPACE_ID);
    await switchWorkspaceDb();
  } else {
    await importDbState(snapshot.data, { includeSecrets: true });
    restoreAccountSettings(snapshot.data);
  }

  // Restore account-level reminders and reminder folders (supporting pre-account snapshots cleanly).
  const accountData = snapshot.accountData ? snapshot.accountData : collectLegacyAccountData(snapshot);
  await importAccountDbState(accountData);
  setAccountSetting(REMINDERS_MIGRATED_KEY, true);

  // Restore JSON account username from identity or settings row
  const fromIdentity = identity?.username && identity.username !== "guest" ? identity.username.trim() : "";
  const settingsRows = Array.isArray(snapshot.data.settings) ? snapshot.data.settings : [];
  const fromSettings = settingsRows.find((r: any) => r?.key === JSON_USERNAME_SETTING_KEY)?.value;
  const restoredUsername = (typeof fromSettings === "string" && fromSettings.trim()) || fromIdentity;
  if (restoredUsername) {
    await setJsonAccountUsername(restoredUsername);
  }
}

function restoreAccountSettings(data: Record<string, any[]>): void {
  const rows = Array.isArray(data.settings) ? data.settings : [];
  for (const row of rows) {
    if (row && typeof row.key === "string" && isAccountSettingKey(row.key) && row.value !== undefined && row.value !== null) {
      setAccountSetting(row.key, row.value);
    }
  }
}

/** Trigger a browser download of the snapshot as a .json file. */
export async function downloadSnapshot(): Promise<Blob> {
  const snapshot = await exportSnapshot();
  const json = JSON.stringify(snapshot, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `panga-snapshot-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return blob;
}

/** Read and validate a snapshot from a File object. */
export async function readSnapshotFile(file: File): Promise<Snapshot> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        const snapshot = validateSnapshot(parsed);
        if (!snapshot) {
          reject(new Error("Invalid snapshot file: missing required metadata or data fields."));
          return;
        }
        resolve(snapshot);
      } catch (e) {
        reject(new Error(`Failed to parse snapshot file: ${(e as Error).message}`));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsText(file);
  });
}

/** Quick check whether any user data exists in IndexedDB. */
export async function hasAnyData(): Promise<boolean> {
  return hasLocalData();
}
