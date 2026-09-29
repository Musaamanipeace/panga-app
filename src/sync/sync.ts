// src/sync/sync.ts
// Cloud database synchronization, offline persistence, and status management.
import { db } from "../data/db";
import {
  signIn,
  signUp,
  signOut,
  restoreSession,
  getSessionUserId,
  type AuthResult,
} from "../auth/session";

export type { AuthResult };
export { signIn, signUp, signOut, restoreSession };

export type SyncStatusState = "idle" | "syncing" | "synced" | "error";

const LAST_SYNC_KEY = "panga_last_cloud_sync_time";
const PENDING_DELETIONS_KEY = "panga_pending_deletions";

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

function getPendingDeletions(): Array<{ table: string; id: string }> {
  try {
    const raw = safeGetStorage(PENDING_DELETIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePendingDeletions(list: Array<{ table: string; id: string }>) {
  safeSetStorage(PENDING_DELETIONS_KEY, JSON.stringify(list));
}

let currentStatus: SyncStatusState = "idle";
let lastSyncTimestamp: number = Number(safeGetStorage(LAST_SYNC_KEY) || 0);
let statusListeners: Array<(status: SyncStatusState, message?: string) => void> = [];

export function getSyncStatus(): SyncStatusState {
  return currentStatus;
}

export function getLastSyncTime(): number {
  return lastSyncTimestamp;
}

export function subscribeSyncStatus(fn: (status: SyncStatusState, message?: string) => void) {
  statusListeners.push(fn);
  fn(currentStatus, currentStatus === "synced" ? "Cloud synchronized" : undefined);
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

function mapDexieTableName(table: string): string {
  const map: Record<string, string> = {
    calendar_events: "calendarEvents",
    calendarEvents: "calendarEvents",
    doc_entries: "docEntries",
    docEntries: "docEntries",
    schedule_items: "scheduleItems",
    scheduleItems: "scheduleItems",
  };
  return map[table] || table;
}

/** Push a single record to the cloud database and local Dexie */
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
  const dexieTable = mapDexieTableName(tableName);
  const userId = getSessionUserId();

  if (!userId) {
    if (db.isOpen()) {
      await (db as any)[dexieTable]?.update(record.id, { syncStatus: "pending" });
    }
    return;
  }

  try {
    const res = await fetch("/api/sync/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, table: dexieTable, record }),
    });

    if (res.ok) {
      if (db.isOpen()) {
        await (db as any)[dexieTable]?.update(record.id, { syncStatus: "synced" });
      }
      lastSyncTimestamp = Date.now();
      safeSetStorage(LAST_SYNC_KEY, String(lastSyncTimestamp));
      updateStatus("synced", "Saved to cloud");
    } else {
      if (db.isOpen()) {
        await (db as any)[dexieTable]?.update(record.id, { syncStatus: "pending" });
      }
      updateStatus("error", "Failed to save to cloud");
    }
  } catch (err) {
    console.warn(`Cloud push error for ${tableName}:`, err);
    if (db.isOpen()) {
      await (db as any)[dexieTable]?.update(record.id, { syncStatus: "pending" });
    }
    updateStatus("error", "Offline — changes saved locally");
  }
}

/** Push a deletion to the cloud database */
export async function syncDeleteRecord(tableName: string, id: string) {
  const dexieTable = mapDexieTableName(tableName);
  const userId = getSessionUserId();

  const deletions = getPendingDeletions();
  deletions.push({ table: dexieTable, id });
  savePendingDeletions(deletions);

  if (!userId) return;

  try {
    const res = await fetch("/api/sync/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, table: dexieTable, id }),
    });

    if (res.ok) {
      // Remove from pending deletions
      const remaining = getPendingDeletions().filter((d) => !(d.table === dexieTable && d.id === id));
      savePendingDeletions(remaining);
      lastSyncTimestamp = Date.now();
      safeSetStorage(LAST_SYNC_KEY, String(lastSyncTimestamp));
      updateStatus("synced", "Deletion synced to cloud");
    }
  } catch (err) {
    console.warn(`Cloud deletion error for ${tableName}:`, err);
  }
}

/** Push a setting to the cloud database */
export async function syncPushSetting(key: string, value: any) {
  const userId = getSessionUserId();
  if (!userId) return;

  try {
    await fetch("/api/sync/setting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, key, value }),
    });
  } catch (err) {
    console.warn("Cloud setting push error:", err);
  }
}

/**
 * Full bi-directional synchronization with the cloud backend:
 * 1. Collects all local changes (and pending deletions) and sends them to the server.
 * 2. Fetches all remote updates since lastSyncTime and merges them into Dexie.
 */
export async function syncAll(forceFullUpload = false): Promise<{ ok: boolean; message: string }> {
  const userId = getSessionUserId();
  if (!userId) {
    return { ok: false, message: "No active user session. Please sign in to sync." };
  }

  updateStatus("syncing", "Syncing with cloud database...");

  try {
    if (!db.isOpen()) {
      await db.open();
    }

    const tables = [
      "projects",
      "tasks",
      "resources",
      "milestones",
      "issues",
      "contacts",
      "reminders",
      "calendarEvents",
      "scheduleItems",
      "docEntries",
      "insights",
    ] as const;

    const changes: Record<string, any[]> = {};
    let localPendingCount = 0;

    for (const table of tables) {
      try {
        let records: any[] = [];
        if (forceFullUpload || lastSyncTimestamp === 0) {
          records = await (db as any)[table]?.toArray();
        } else {
          // Send all records that have pending status or were updated since last sync
          records = await (db as any)[table]
            ?.where("syncStatus")
            .equals("pending")
            .toArray();
        }
        if (records && records.length > 0) {
          changes[table] = records;
          localPendingCount += records.length;
        }
      } catch (tableErr) {
        console.warn(`Error reading table ${table} for sync:`, tableErr);
      }
    }

    // Also include settings
    try {
      const allSettings = await db.settings.toArray();
      if (allSettings && allSettings.length > 0) {
        changes["settings"] = allSettings;
      }
    } catch {}

    const deletions = getPendingDeletions();

    const response = await fetch("/api/sync/sync-all", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        changes,
        deletions,
        lastSyncTime: forceFullUpload ? 0 : lastSyncTimestamp,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData.error || `Server responded with status ${response.status}`;
      updateStatus("error", msg);
      return { ok: false, message: msg };
    }

    const data = await response.json();
    let incomingCount = 0;

    // Apply remote updates from server into Dexie
    if (data.serverUpdates && typeof data.serverUpdates === "object") {
      for (const [table, records] of Object.entries(data.serverUpdates)) {
        if (!Array.isArray(records) || records.length === 0) continue;
        const dexieTable = mapDexieTableName(table);
        if ((db as any)[dexieTable]) {
          const sanitized = records.map((r) => ({
            ...r,
            syncStatus: "synced",
          }));
          await (db as any)[dexieTable].bulkPut(sanitized);
          incomingCount += sanitized.length;
        }
      }
    }

    // Apply remote deletions from server into Dexie
    if (Array.isArray(data.serverDeletions)) {
      for (const del of data.serverDeletions) {
        const dexieTable = mapDexieTableName(del.table);
        if ((db as any)[dexieTable]) {
          await (db as any)[dexieTable].delete(del.id);
        }
      }
    }

    // Mark all locally pushed records as synced in Dexie
    for (const [table, records] of Object.entries(changes)) {
      const dexieTable = mapDexieTableName(table);
      if ((db as any)[dexieTable] && Array.isArray(records)) {
        for (const r of records) {
          if (r.id) {
            await (db as any)[dexieTable].update(r.id, { syncStatus: "synced" });
          }
        }
      }
    }

    // Clear locally sent deletions
    savePendingDeletions([]);

    // Update last sync time
    lastSyncTimestamp = data.serverTime || Date.now();
    safeSetStorage(LAST_SYNC_KEY, String(lastSyncTimestamp));

    const summaryMsg =
      incomingCount > 0 || localPendingCount > 0
        ? `Cloud sync complete (${localPendingCount} uploaded, ${incomingCount} downloaded)`
        : "Cloud database up to date";

    updateStatus("synced", summaryMsg);
    return { ok: true, message: summaryMsg };
  } catch (err: any) {
    console.error("syncAll execution error:", err);
    const errorMsg = err?.message || "Network error during sync";
    updateStatus("error", errorMsg);
    return { ok: false, message: `Sync failed: ${errorMsg}` };
  }
}
