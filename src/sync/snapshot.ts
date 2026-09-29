// src/sync/snapshot.ts
// Local-first snapshot export/import. Serializes the entire IndexedDB
// contents to a versioned JSON structure for backup, restore, and
// Google Drive sync. Never includes credentials or env vars.

import { db, exportDbState, importDbState, hasLocalData } from "../data/db";

export const SNAPSHOT_VERSION = "1.0";

export interface SnapshotMetadata {
  version: string;
  exportedAt: string; // ISO date
  appName: string;
  dbVersion: number;
}

export interface Snapshot {
  metadata: SnapshotMetadata;
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
 * Export the entire local database to a snapshot object.
 * Only table data is exported — no credentials, keys, or env vars.
 */
export async function exportSnapshot(): Promise<Snapshot> {
  const data = await exportDbState();
  return {
    metadata: {
      version: SNAPSHOT_VERSION,
      exportedAt: new Date().toISOString(),
      appName: "Panga",
      dbVersion: db.verno,
    },
    data,
  };
}

/**
 * Import (hydrate) a snapshot into IndexedDB.
 * Clears all user tables first, then bulk-loads every record.
 */
export async function importSnapshot(snapshot: Snapshot): Promise<void> {
  await importDbState(snapshot.data);
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
