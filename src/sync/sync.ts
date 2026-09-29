// src/sync/sync.ts
// Local persistence, offline status, and sync management.
import { db } from "../data/db";
import { signIn, signUp, signOut, restoreSession, type AuthResult } from "../auth/session";

export type { AuthResult };
export { signIn, signUp, signOut, restoreSession };

export type SyncStatusState = "idle" | "syncing" | "synced" | "error";

const LAST_SYNC_KEY = "panga_last_sync_time";

function safeGetStorage(key: string): string | null {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetStorage(key: string, value: string | null) {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return;
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {}
}

let currentStatus: SyncStatusState = "synced";
let lastSyncTimestamp: number = Number(safeGetStorage(LAST_SYNC_KEY) || Date.now());
let statusListeners: Array<(status: SyncStatusState, message?: string) => void> = [];

export function getSyncStatus(): SyncStatusState {
  return currentStatus;
}

export function getLastSyncTime(): number {
  return lastSyncTimestamp;
}

export function subscribeSyncStatus(fn: (status: SyncStatusState, message?: string) => void) {
  statusListeners.push(fn);
  fn(currentStatus, "Local storage synchronized");
  return () => {
    statusListeners = statusListeners.filter((l) => l !== fn);
  };
}

function updateStatus(status: SyncStatusState, message?: string) {
  currentStatus = status;
  for (const listener of statusListeners) {
    try {
      listener(status, message);
    } catch {}
  }
}

/** Push of a single record when changed in UI */
export async function syncPushRecord(
  tableName:
    | "projects"
    | "tasks"
    | "resources"
    | "milestones"
    | "issues"
    | "contacts"
    | "reminders"
    | "calendar_events"
    | "insights"
    | "doc_entries",
  record: any
) {
  try {
    const dexieTable =
      tableName === "calendar_events"
        ? "calendarEvents"
        : tableName === "doc_entries"
          ? "docEntries"
          : tableName;
    if (db.isOpen()) {
      await (db as any)[dexieTable]?.update(record.id, { syncStatus: "synced" });
    }
    lastSyncTimestamp = Date.now();
    safeSetStorage(LAST_SYNC_KEY, String(lastSyncTimestamp));
    updateStatus("synced", "Changes saved locally");
  } catch (err) {
    console.warn(`Sync push error (${tableName}):`, err);
  }
}

/** Push of a deletion */
export async function syncDeleteRecord(_tableName: string, _id: string) {
  lastSyncTimestamp = Date.now();
  safeSetStorage(LAST_SYNC_KEY, String(lastSyncTimestamp));
  updateStatus("synced", "Record removed");
}

/** Push of a setting */
export async function syncPushSetting(_key: string, _value: any) {
  lastSyncTimestamp = Date.now();
  safeSetStorage(LAST_SYNC_KEY, String(lastSyncTimestamp));
  updateStatus("synced", "Settings saved");
}

/** Full local reconciliation */
export async function syncAll(): Promise<{ ok: boolean; message: string }> {
  updateStatus("syncing", "Saving changes...");
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    lastSyncTimestamp = Date.now();
    safeSetStorage(LAST_SYNC_KEY, String(lastSyncTimestamp));
    updateStatus("synced", "All data saved locally.");
    return { ok: true, message: "All data saved locally." };
  } catch (err: any) {
    updateStatus("error", err?.message || "Save error");
    return { ok: false, message: `Save error: ${err?.message || String(err)}` };
  }
}
