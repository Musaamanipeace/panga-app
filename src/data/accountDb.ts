// src/data/accountDb.ts
// Account-level IndexedDB store for reminders and reminder folders so reminders
// persist and fire across every workspace belonging to the active account.

import Dexie, { type Table } from "dexie";
import { getSessionUserId } from "../auth/sessionUserId";
import { showToast } from "../components/ui";
import { getAccountSetting, setAccountSetting } from "./accountSettings";
import type { Reminder, ReminderFolder } from "./db";
import { listWorkspaces, workspaceDbSuffix } from "./workspaceState";

export const REMINDERS_MIGRATED_KEY = "remindersMigrated_v1";
export const WORKSPACE_REMINDERS_MOVED_KEY = "remindersMovedToAccount";

export interface AccountDataDump {
  reminders: Reminder[];
  reminderFolders: ReminderFolder[];
}

export function getAccountDbName(): string {
  const userId = getSessionUserId();
  return `panga-account-${userId ?? "guest"}`;
}

class AccountDB extends Dexie {
  reminders!: Table<Reminder, string>;
  reminderFolders!: Table<ReminderFolder, string>;

  constructor() {
    super(getAccountDbName());
    this.version(1).stores({
      reminders: "id, folderId, triggerAt, status, updatedAt, syncStatus",
      reminderFolders: "id, parentFolderId, order, updatedAt, syncStatus",
    });
  }
}

export let accountDb: AccountDB = new AccountDB();

let migrationInFlight: { dbName: string; promise: Promise<void> } | null = null;

/**
 * Closes and recreates the account-level Dexie instance for the current session user.
 * Called on account/session switches — NOT when switching workspaces.
 */
export async function switchAccountDb(): Promise<void> {
  migrationInFlight = null;
  try {
    if (accountDb && accountDb.isOpen()) {
      await accountDb.close();
    }
  } catch (e) {
    console.warn("[reminders] switchAccountDb close error:", e);
  }
  accountDb = new AccountDB();
  try {
    await accountDb.open();
  } catch (e) {
    console.warn("[reminders] switchAccountDb open error:", e);
  }
}

function pickNewer<T extends { updatedAt?: number }>(current: T | undefined, incoming: T): T {
  if (!current) return incoming;
  return (incoming.updatedAt ?? 0) > (current.updatedAt ?? 0) ? incoming : current;
}

/**
 * One-time idempotent migration copying legacy per-workspace reminders and
 * reminder folders into the account-level DB without deleting legacy data.
 */
export async function migrateWorkspaceRemindersToAccount(): Promise<void> {
  if (getAccountSetting<boolean>(REMINDERS_MIGRATED_KEY)) return;

  try {
    if (!accountDb.isOpen()) await accountDb.open();

    const workspaces = listWorkspaces();
    const userId = getSessionUserId();
    const base = userId ? `panga-db-${userId}` : "panga-db-guest";

    const existingReminders = await accountDb.reminders.toArray();
    const existingFolders = await accountDb.reminderFolders.toArray();

    const mergedReminders = new Map<string, Reminder>(existingReminders.map((r) => [r.id, r]));
    const mergedFolders = new Map<string, ReminderFolder>(existingFolders.map((f) => [f.id, f]));

    let migratedCount = 0;

    for (const w of workspaces) {
      const wsDbName = `${base}${workspaceDbSuffix(w.id)}`;
      const exists = await Dexie.exists(wsDbName);
      if (!exists) continue;

      const tmp = new Dexie(wsDbName);
      try {
        await tmp.open();
        const tableNames = new Set(tmp.tables.map((t) => t.name));

        if (tableNames.has("reminderFolders")) {
          const rows = (await tmp.table("reminderFolders").toArray()) as ReminderFolder[];
          for (const folder of rows) {
            if (!folder || typeof folder.id !== "string") continue;
            mergedFolders.set(folder.id, pickNewer(mergedFolders.get(folder.id), folder));
            migratedCount++;
          }
        }

        if (tableNames.has("reminders")) {
          const rows = (await tmp.table("reminders").toArray()) as Reminder[];
          for (const rem of rows) {
            if (!rem || typeof rem.id !== "string") continue;
            const stamped: Reminder = rem.workspaceId ? rem : { ...rem, workspaceId: w.id };
            const prev = mergedReminders.get(stamped.id);
            const chosen = pickNewer(prev, stamped);
            mergedReminders.set(
              stamped.id,
              chosen.workspaceId ? chosen : { ...chosen, workspaceId: prev?.workspaceId ?? stamped.workspaceId }
            );
            migratedCount++;
          }
        }

        if (tableNames.has("settings")) {
          await tmp.table("settings").put({ key: WORKSPACE_REMINDERS_MOVED_KEY, value: true });
        }
      } finally {
        tmp.close();
      }
    }

    if (mergedReminders.size > 0 || mergedFolders.size > 0) {
      await accountDb.transaction("rw", [accountDb.reminders, accountDb.reminderFolders], async () => {
        if (mergedFolders.size > 0) {
          await accountDb.reminderFolders.bulkPut([...mergedFolders.values()]);
        }
        if (mergedReminders.size > 0) {
          await accountDb.reminders.bulkPut([...mergedReminders.values()]);
        }
      });
    }

    setAccountSetting(REMINDERS_MIGRATED_KEY, true);

    if (migratedCount > 0 && typeof window !== "undefined") {
      window.dispatchEvent(new Event("panga-data-updated"));
    }
  } catch (e) {
    console.warn("[reminders] migrateWorkspaceRemindersToAccount error:", e);
    showToast("Couldn't move reminders. Your existing reminders are safe.", "error");
  }
}

/** Opens accountDb if needed and ensures the one-time workspace migration has run. */
export async function ensureAccountDbReady(): Promise<void> {
  if (!accountDb.isOpen()) await accountDb.open();
  if (getAccountSetting<boolean>(REMINDERS_MIGRATED_KEY)) return;

  const targetName = accountDb.name;
  if (!migrationInFlight || migrationInFlight.dbName !== targetName) {
    const promise = migrateWorkspaceRemindersToAccount().finally(() => {
      if (migrationInFlight?.dbName === targetName) {
        migrationInFlight = null;
      }
    });
    migrationInFlight = { dbName: targetName, promise };
  }
  await migrationInFlight.promise;
}

export async function exportAccountDbState(): Promise<AccountDataDump> {
  await ensureAccountDbReady();
  const [reminders, reminderFolders] = await Promise.all([
    accountDb.reminders.toArray(),
    accountDb.reminderFolders.toArray(),
  ]);
  return { reminders, reminderFolders };
}

export async function importAccountDbState(data: Partial<AccountDataDump>): Promise<void> {
  if (!accountDb.isOpen()) await accountDb.open();
  const reminders = Array.isArray(data.reminders) ? data.reminders : [];
  const reminderFolders = Array.isArray(data.reminderFolders) ? data.reminderFolders : [];
  await accountDb.transaction("rw", [accountDb.reminders, accountDb.reminderFolders], async () => {
    await accountDb.reminders.clear();
    await accountDb.reminderFolders.clear();
    if (reminderFolders.length > 0) {
      await accountDb.reminderFolders.bulkPut(reminderFolders);
    }
    if (reminders.length > 0) {
      await accountDb.reminders.bulkPut(reminders);
    }
  });
}

export async function mergeAccountDbState(data: Partial<AccountDataDump>): Promise<void> {
  if (!accountDb.isOpen()) await accountDb.open();
  const incomingReminders = Array.isArray(data.reminders) ? data.reminders : [];
  const incomingFolders = Array.isArray(data.reminderFolders) ? data.reminderFolders : [];
  if (incomingReminders.length === 0 && incomingFolders.length === 0) return;

  await accountDb.transaction("rw", [accountDb.reminders, accountDb.reminderFolders], async () => {
    if (incomingFolders.length > 0) {
      const existingFolders = await accountDb.reminderFolders.toArray();
      const map = new Map<string, ReminderFolder>(existingFolders.map((f) => [f.id, f]));
      for (const f of incomingFolders) {
        if (!f || typeof f.id !== "string") continue;
        map.set(f.id, pickNewer(map.get(f.id), f));
      }
      await accountDb.reminderFolders.bulkPut([...map.values()]);
    }
    if (incomingReminders.length > 0) {
      const existingReminders = await accountDb.reminders.toArray();
      const map = new Map<string, Reminder>(existingReminders.map((r) => [r.id, r]));
      for (const r of incomingReminders) {
        if (!r || typeof r.id !== "string") continue;
        map.set(r.id, pickNewer(map.get(r.id), r));
      }
      await accountDb.reminders.bulkPut([...map.values()]);
    }
  });
}

export async function hasAccountData(): Promise<boolean> {
  await ensureAccountDbReady();
  const [remCount, folderCount] = await Promise.all([
    accountDb.reminders.count(),
    accountDb.reminderFolders.count(),
  ]);
  return remCount > 0 || folderCount > 0;
}

export async function clearAccountDbData(): Promise<void> {
  migrationInFlight = null;
  if (!accountDb.isOpen()) await accountDb.open();
  await accountDb.transaction("rw", [accountDb.reminders, accountDb.reminderFolders], async () => {
    await accountDb.reminders.clear();
    await accountDb.reminderFolders.clear();
  });
}
