// src/sync/snapshot.ts
// Local-first JSON snapshot export/import. Serializes the IndexedDB contents
// to an unencrypted, versioned JSON file for backup and restore, carrying the
// JSON account username and workspace identity.

import { db, exportDbState, importDbState, hasLocalData } from "../data/db";
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

export interface Snapshot {
  metadata: SnapshotMetadata;
  identity?: SnapshotIdentity;
  data: Record<string, any[]>;
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

/**
 * Export the whole local database plus the JSON account identity.
 * No encryption or password is applied.
 */
export async function exportSnapshot(): Promise<Snapshot> {
  const data = await exportDbState({ includeSecrets: true });
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
    data,
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

  await importDbState(snapshot.data, { includeSecrets: true });

  // Restore JSON account username from identity or settings row
  const fromIdentity = identity?.username && identity.username !== "guest" ? identity.username.trim() : "";
  const settingsRows = Array.isArray(snapshot.data.settings) ? snapshot.data.settings : [];
  const fromSettings = settingsRows.find((r: any) => r?.key === JSON_USERNAME_SETTING_KEY)?.value;
  const restoredUsername = (typeof fromSettings === "string" && fromSettings.trim()) || fromIdentity;
  if (restoredUsername) {
    await setJsonAccountUsername(restoredUsername);
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
