import "fake-indexeddb/auto";
import Dexie from "dexie";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetGuestSession } from "../../auth/session";
import { clearAllLocalData, db, hasLocalData } from "../db";
import { accountDb, ensureAccountDbReady, WORKSPACE_REMINDERS_MOVED_KEY } from "../accountDb";
import { getAccountSetting } from "../accountSettings";
import {
  createReminder,
  listPendingReminders,
  listReminders,
  startReminderScheduler,
  stopReminderScheduler,
} from "../reminders";
import { createReminderFolder, listReminderFolders } from "../reminderFolders";
import { createWorkspace, switchWorkspace } from "../workspaces";
import { DEFAULT_WORKSPACE_ID, listWorkspaces } from "../workspaceState";
import { exportSnapshot, importSnapshot, type Snapshot } from "../../sync/snapshot";
import { computeSnapshotDigest, mergeSnapshots, summarizeSnapshot } from "../../sync/googleDriveSync";

beforeEach(async () => {
  stopReminderScheduler();
  localStorage.clear();
  await resetGuestSession();
});

afterEach(() => {
  stopReminderScheduler();
  vi.restoreAllMocks();
});

describe("Stage 1: cross-workspace account-level reminders store", () => {
  it("keeps reminders and reminder folders visible after switching workspaces and tracks workspaceId", async () => {
    const folder = await createReminderFolder({ title: "Daily" });
    const inMain = await createReminder({
      message: "Pay rent",
      triggerAt: Date.now() + 60_000,
      linkedEntityType: null,
      linkedEntityId: null,
      folderId: folder.id,
    });
    expect(inMain.workspaceId).toBe(DEFAULT_WORKSPACE_ID);

    const wsB = await createWorkspace("Research Hub");
    await switchWorkspace(wsB.id);

    const remindersInB = await listReminders();
    const foldersInB = await listReminderFolders();
    expect(remindersInB.map((r) => r.message)).toEqual(["Pay rent"]);
    expect(remindersInB[0].workspaceId).toBe(DEFAULT_WORKSPACE_ID);
    expect(foldersInB.map((f) => f.title)).toEqual(["Daily"]);

    const inB = await createReminder({
      message: "Call lab",
      triggerAt: Date.now() + 120_000,
      linkedEntityType: null,
      linkedEntityId: null,
    });
    expect(inB.workspaceId).toBe(wsB.id);

    await switchWorkspace(DEFAULT_WORKSPACE_ID);
    const backInMain = await listReminders();
    expect(backInMain.map((r) => r.message)).toEqual(["Pay rent", "Call lab"]);
  });

  it("fires a due reminder created in workspace A while workspace B is open", async () => {
    const notified: string[] = [];
    const FakeNotification = vi.fn(function FakeNotification(this: any, title: string) {
      notified.push(title);
    }) as any;
    FakeNotification.permission = "granted";
    vi.stubGlobal("Notification", FakeNotification);

    await createReminder({
      message: "Check oven",
      triggerAt: Date.now() - 1_000,
      linkedEntityType: null,
      linkedEntityId: null,
    });

    const wsB = await createWorkspace("Work");
    await switchWorkspace(wsB.id);

    startReminderScheduler();
    await new Promise((r) => setTimeout(r, 40));

    expect(notified).toContain("Panga: Check oven");
    const pending = await listPendingReminders();
    expect(pending).toHaveLength(0);
    const all = await listReminders();
    expect(all[0]?.status).toBe("fired");
  });

  it("migrates legacy per-workspace reminders once without deleting old rows and resolves duplicate ids by updatedAt", async () => {
    const uid = "guest_legacy_mig";
    localStorage.clear();
    localStorage.setItem("panga_guest", "1");
    localStorage.setItem("panga_session_user_id", uid);
    localStorage.setItem("panga_session_email", "guest@local");
    localStorage.setItem(
      `panga_workspaces_${uid}`,
      JSON.stringify([
        { id: DEFAULT_WORKSPACE_ID, name: "Main" },
        { id: "ws2", name: "Research Hub" },
      ])
    );

    const dbMainName = `panga-db-${uid}`;
    const dbWs2Name = `panga-db-${uid}__ws_ws2`;

    const legacyMain = new Dexie(dbMainName);
    legacyMain.version(14).stores({
      reminders: "id, folderId, triggerAt, status, updatedAt, syncStatus",
      reminderFolders: "id, parentFolderId, order, updatedAt, syncStatus",
      settings: "key",
    });
    await legacyMain.open();
    await legacyMain.table("reminderFolders").put({
      id: "rf1",
      parentFolderId: null,
      title: "Health",
      order: 0,
      createdAt: 10,
      updatedAt: 10,
      syncStatus: "pending",
    });
    await legacyMain.table("reminders").bulkPut([
      {
        id: "r-main",
        folderId: "rf1",
        linkedEntityType: null,
        linkedEntityId: null,
        message: "Main reminder",
        triggerAt: 100_000,
        status: "pending",
        createdAt: 10,
        updatedAt: 10,
        syncStatus: "pending",
      },
      {
        id: "r-shared",
        folderId: null,
        linkedEntityType: null,
        linkedEntityId: null,
        message: "Older copy",
        triggerAt: 200_000,
        status: "pending",
        createdAt: 10,
        updatedAt: 50,
        syncStatus: "pending",
      },
    ]);
    legacyMain.close();

    const legacyWs2 = new Dexie(dbWs2Name);
    legacyWs2.version(14).stores({
      reminders: "id, folderId, triggerAt, status, updatedAt, syncStatus",
      reminderFolders: "id, parentFolderId, order, updatedAt, syncStatus",
      settings: "key",
    });
    await legacyWs2.open();
    await legacyWs2.table("reminders").bulkPut([
      {
        id: "r-ws2",
        folderId: null,
        linkedEntityType: null,
        linkedEntityId: null,
        message: "Research reminder",
        triggerAt: 300_000,
        status: "pending",
        createdAt: 20,
        updatedAt: 20,
        syncStatus: "pending",
      },
      {
        id: "r-shared",
        folderId: null,
        linkedEntityType: null,
        linkedEntityId: null,
        message: "Newer copy",
        triggerAt: 200_000,
        status: "pending",
        createdAt: 10,
        updatedAt: 999,
        syncStatus: "pending",
      },
    ]);
    legacyWs2.close();

    const { switchAccountDb } = await import("../accountDb");
    await switchAccountDb();

    const migrated = await listReminders();
    expect(migrated.map((r) => [r.id, r.message, r.workspaceId])).toEqual([
      ["r-main", "Main reminder", DEFAULT_WORKSPACE_ID],
      ["r-shared", "Newer copy", "ws2"],
      ["r-ws2", "Research reminder", "ws2"],
    ]);
    expect((await listReminderFolders()).map((f) => f.title)).toEqual(["Health"]);
    expect(getAccountSetting("remindersMigrated_v1")).toBe(true);

    // Legacy rows remain intact, and each workspace settings table marks remindersMovedToAccount = true.
    const verifyMain = new Dexie(dbMainName);
    await verifyMain.open();
    expect(await verifyMain.table("reminders").count()).toBe(2);
    expect((await verifyMain.table("settings").get(WORKSPACE_REMINDERS_MOVED_KEY))?.value).toBe(true);
    verifyMain.close();

    const verifyWs2 = new Dexie(dbWs2Name);
    await verifyWs2.open();
    expect(await verifyWs2.table("reminders").count()).toBe(2);
    expect((await verifyWs2.table("settings").get(WORKSPACE_REMINDERS_MOVED_KEY))?.value).toBe(true);
    verifyWs2.close();
  });

  it("exports accountData outside workspace data and round-trips snapshots cleanly", async () => {
    await createReminderFolder({ title: "Personal" });
    await createReminder({
      message: "Dentist",
      triggerAt: Date.now() + 50_000,
      linkedEntityType: null,
      linkedEntityId: null,
    });
    const ws = await createWorkspace("Side Project");
    await createReminder({
      message: "Deploy",
      triggerAt: Date.now() + 90_000,
      linkedEntityType: null,
      linkedEntityId: null,
    });

    const snap = await exportSnapshot();
    expect(snap.accountData?.reminders.map((r) => r.message).sort()).toEqual(["Dentist", "Deploy"]);
    expect(snap.accountData?.reminderFolders.map((f) => f.title)).toEqual(["Personal"]);
    expect(snap.data.reminders).toBeUndefined();
    expect(snap.data.reminderFolders).toBeUndefined();
    expect(snap.workspaces?.items.every((w) => w.data.reminders === undefined && w.data.reminderFolders === undefined)).toBe(true);
    expect(listWorkspaces().some((w) => w.id === ws.id)).toBe(true);

    await clearAllLocalData();
    expect(await listReminders()).toHaveLength(0);

    await importSnapshot(JSON.parse(JSON.stringify(snap)));
    expect((await listReminders()).map((r) => r.message).sort()).toEqual(["Dentist", "Deploy"]);
    expect((await listReminderFolders()).map((f) => f.title)).toEqual(["Personal"]);
  });

  it("imports old JSON snapshots containing per-workspace reminders into accountDb cleanly", async () => {
    const legacySnapshot: Snapshot = {
      metadata: {
        version: "1.0",
        exportedAt: "2026-11-20T10:00:00.000Z",
        appName: "Panga",
        dbVersion: 14,
      },
      identity: {
        userId: "usr_legacy_json",
        username: "amani",
        email: "amani@local",
        loggedIn: true,
      },
      data: {
        reminders: [
          {
            id: "old-1",
            folderId: "old-f1",
            linkedEntityType: null,
            linkedEntityId: null,
            message: "Legacy main",
            triggerAt: 100_000,
            status: "pending",
            createdAt: 10,
            updatedAt: 10,
            syncStatus: "pending",
          },
        ],
        reminderFolders: [
          {
            id: "old-f1",
            parentFolderId: null,
            title: "Legacy Folder",
            order: 0,
            createdAt: 10,
            updatedAt: 10,
            syncStatus: "pending",
          },
        ],
        settings: [],
      },
      workspaces: {
        activeId: DEFAULT_WORKSPACE_ID,
        items: [
          {
            id: DEFAULT_WORKSPACE_ID,
            name: "Main",
            data: {
              reminders: [
                {
                  id: "old-1",
                  folderId: "old-f1",
                  linkedEntityType: null,
                  linkedEntityId: null,
                  message: "Legacy main",
                  triggerAt: 100_000,
                  status: "pending",
                  createdAt: 10,
                  updatedAt: 10,
                  syncStatus: "pending",
                },
              ],
              reminderFolders: [
                {
                  id: "old-f1",
                  parentFolderId: null,
                  title: "Legacy Folder",
                  order: 0,
                  createdAt: 10,
                  updatedAt: 10,
                  syncStatus: "pending",
                },
              ],
              settings: [],
            },
          },
          {
            id: "ws-b",
            name: "Studio",
            data: {
              reminders: [
                {
                  id: "old-2",
                  folderId: null,
                  linkedEntityType: null,
                  linkedEntityId: null,
                  message: "Legacy studio",
                  triggerAt: 200_000,
                  status: "pending",
                  createdAt: 20,
                  updatedAt: 20,
                  syncStatus: "pending",
                },
              ],
              reminderFolders: [],
              settings: [],
            },
          },
        ],
      },
    };

    await importSnapshot(legacySnapshot);
    const restored = await listReminders();
    expect(restored.map((r) => [r.id, r.message, r.workspaceId])).toEqual([
      ["old-1", "Legacy main", DEFAULT_WORKSPACE_ID],
      ["old-2", "Legacy studio", "ws-b"],
    ]);
    expect((await listReminderFolders()).map((f) => f.title)).toEqual(["Legacy Folder"]);
  });

  it("clears accountDb reminders and folders in clearAllLocalData()", async () => {
    await createReminderFolder({ title: "Errands" });
    await createReminder({
      message: "Buy milk",
      triggerAt: Date.now() + 50_000,
      linkedEntityType: null,
      linkedEntityId: null,
    });
    expect(await hasLocalData()).toBe(true);

    await clearAllLocalData();
    await ensureAccountDbReady();
    expect(await accountDb.reminders.count()).toBe(0);
    expect(await accountDb.reminderFolders.count()).toBe(0);
    expect(await listReminders()).toHaveLength(0);
    // Re-checking legacy workspace tables after Start Afresh must not resurrect wiped reminders.
    expect(await db.reminders.count()).toBe(0);
  });

  it("accounts for accountData in Google Drive snapshot summary, digest, and merge", async () => {
    const baseSnap: Snapshot = {
      metadata: { version: "1.0", exportedAt: "2026-11-26T00:00:00Z", appName: "Panga", dbVersion: 14 },
      accountData: {
        reminders: [
          {
            id: "rem-1",
            folderId: null,
            workspaceId: DEFAULT_WORKSPACE_ID,
            linkedEntityType: null,
            linkedEntityId: null,
            message: "Local reminder",
            triggerAt: 500_000,
            status: "pending",
            createdAt: 100,
            updatedAt: 100,
            syncStatus: "pending",
          },
        ],
        reminderFolders: [],
      },
      data: { settings: [] },
    };

    const editedSnap: Snapshot = {
      ...baseSnap,
      accountData: {
        reminders: [
          {
            ...baseSnap.accountData!.reminders[0],
            message: "Edited remotely",
            updatedAt: 250,
          },
          {
            id: "rem-2",
            folderId: null,
            linkedEntityType: null,
            linkedEntityId: null,
            message: "Second device reminder",
            triggerAt: 600_000,
            status: "pending",
            createdAt: 200,
            updatedAt: 200,
            syncStatus: "pending",
          },
        ],
        reminderFolders: [],
      },
    };

    expect(summarizeSnapshot(baseSnap).reminders).toBe(1);
    expect(summarizeSnapshot(editedSnap).reminders).toBe(2);
    expect(computeSnapshotDigest(baseSnap)).not.toBe(computeSnapshotDigest(editedSnap));

    const merged = mergeSnapshots(baseSnap, editedSnap);
    expect(merged.accountData?.reminders.map((r) => r.message)).toEqual([
      "Edited remotely",
      "Second device reminder",
    ]);
  });
});
