// src/sync/snapshot.ts
// Local-first snapshot export/import. Serializes the IndexedDB contents to a
// versioned JSON structure for backup and restore. A snapshot also carries
// enough identity to put the user straight back into their own workspace.

import { db, exportDbState, importDbState, hasLocalData } from "../data/db";
import { getSessionEmail, getSessionUserId, isGuest, resetGuestSession, clearSupabaseAuthStorage, setSession } from "../auth/session";
import { getSupabaseConfig } from "../data/supabase";
import { getSupabaseSessionSnapshot, restoreSupabaseSession } from "./supabaseSync";

export const SNAPSHOT_VERSION = "1.0";

export interface SnapshotMetadata {
  version: string;
  exportedAt: string; // ISO date
  appName: string;
  dbVersion: number;
}

export interface SnapshotIdentity {
  /** Supabase user id for a signed-in export, or the guest id otherwise. */
  userId: string;
  username: string;
  email: string;
  loggedIn: boolean;
  supabase?: { url: string; anonKey: string; session?: unknown } | null;
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

/**
 * Export the whole local database plus the current identity and, when signed
 * in, the Supabase session. Credentials travel with the file on purpose: the
 * snapshot is meant to be a complete restore, not a redacted data dump.
 */
export async function exportSnapshot(): Promise<Snapshot> {
  const data = await exportDbState({ includeSecrets: true });
  const userId = getSessionUserId();
  const email = getSessionEmail() ?? "guest@local";
  const guest = isGuest();
  const cfg = await getSupabaseConfig();
  const session = guest ? null : await getSupabaseSessionSnapshot();
  return {
    metadata: {
      version: SNAPSHOT_VERSION,
      exportedAt: new Date().toISOString(),
      appName: "Panga",
      dbVersion: db.verno,
    },
    identity: {
      userId: userId ?? "guest@local",
      username: guest ? "guest" : email.split("@")[0],
      email,
      loggedIn: !guest && !!userId,
      supabase: cfg ? { url: cfg.url, anonKey: cfg.anonKey, session } : null,
    },
    data,
  };
}

/**
 * Import a snapshot. Identity is restored BEFORE the data so records land in
 * the right user's isolated database. A signed-in snapshot also restores the
 * Supabase session, making the import equivalent to logging in.
 */
export async function importSnapshot(snapshot: Snapshot): Promise<void> {
  const identity = snapshot.identity;
  clearSupabaseAuthStorage();

  if (identity?.loggedIn && identity.userId) {
    await setSession(identity.userId, identity.email);
    if (identity.supabase) {
      await restoreSupabaseSession(identity.supabase.session, identity.supabase.url);
    }
  } else {
    await resetGuestSession();
    // Keep the configured Supabase project even for a guest snapshot so the
    // user can sign in without re-entering the URL and key.
    if (identity?.supabase) {
      await restoreSupabaseSession(identity.supabase.session, identity.supabase.url);
    }
  }

  await importDbState(snapshot.data, { includeSecrets: true });
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

/**
 * Quick check whether any user data exists in IndexedDB.
 * Used on the Landing page to decide whether to show the
 * "Quick Upload / Restore Snapshot" dropzone.
 */
export async function hasAnyData(): Promise<boolean> {
  return hasLocalData();
}
