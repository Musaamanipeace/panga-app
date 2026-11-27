import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { resetGuestSession } from "../../auth/session";
import { db, notifyLocalDataMutated, switchWorkspaceDb } from "../../data/db";
import * as googleAuth from "../googleAuth";
import * as driveSync from "../googleDriveSync";
import { useGoogleDriveSync } from "../useGoogleDriveSync";
import type { Snapshot } from "../snapshot";
import { setDriveAutoSyncEnabled } from "../../data/accountSettings";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

function makeSnapshot(tasks: any[] = []): Snapshot {
  return {
    metadata: {
      version: "1.0",
      exportedAt: "2026-11-26T10:00:00.000Z",
      appName: "Panga",
      dbVersion: 15,
    },
    data: {
      tasks,
      taskLists: [],
      notes: [],
      links: [],
      reminders: [],
      clips: [],
      thoughts: [],
      settings: [],
      mediaItems: [],
    },
  };
}

function makeSummary(tasksCount: number): driveSync.SnapshotSummary {
  return {
    exportedAt: "2026-11-26T10:00:00.000Z",
    latestRecordAt: 100,
    workspaces: 1,
    tasks: tasksCount,
    taskLists: 0,
    notes: 0,
    links: 0,
    reminders: 0,
    clips: 0,
    thoughts: 0,
    media: 0,
  };
}

let latestHook: ReturnType<typeof useGoogleDriveSync> | null = null;
function HookHarness({ enableAutoSync = true }: { enableAutoSync?: boolean }) {
  latestHook = useGoogleDriveSync({ enableAutoSync });
  return <div data-modal={String(latestHook.modalOpen)} />;
}

let root: Root | null = null;
let host: HTMLElement | null = null;

describe("Quiet Google Drive auto-sync coordinator", () => {
  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await resetGuestSession();
    await switchWorkspaceDb();
    await db.open();
    setDriveAutoSyncEnabled(true);
    latestHook = null;

    vi.spyOn(googleAuth, "initGoogleAuth").mockImplementation(() => () => {});
    vi.spyOn(googleAuth, "subscribeGoogleAuth").mockImplementation(() => () => {});
    vi.spyOn(googleAuth, "getGoogleAuthState").mockReturnValue({
      ready: true,
      user: { uid: "u-auto", email: "user@example.com", displayName: "User" },
      hasAccessToken: true,
      needsAuth: false,
      signingIn: false,
      error: null,
    });
    vi.spyOn(googleAuth, "getDriveAccessToken").mockResolvedValue("token-auto");
  });

  afterEach(async () => {
    vi.useRealTimers();
    if (root) {
      await act(async () => root!.unmount());
    }
    host?.remove();
    root = null;
    host = null;
    vi.restoreAllMocks();
  });

  async function mountHarness() {
    vi.useFakeTimers();
    host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);
    await act(async () => {
      root!.render(<HookHarness enableAutoSync />);
    });
  }

  it("quietly pushes local_ahead edits after debounce without opening a modal", async () => {
    const localSnap = makeSnapshot([{ id: "t1", title: "Edited offline", updatedAt: 100 }]);
    vi.spyOn(driveSync, "inspectDriveSync").mockResolvedValue({
      status: "local_ahead",
      remoteFile: { id: "rf-1", name: "panga-backup.json", modifiedTime: "2026-11-26T09:00:00Z", size: 200 },
      localSnapshot: localSnap,
      localSummary: makeSummary(1),
      localDigest: "d-local",
      remoteSnapshot: makeSnapshot(),
      remoteSummary: makeSummary(0),
      remoteDigest: "d-remote",
      baseline: null,
      checkedAt: "2026-11-26T10:00:00Z",
    });
    const pushSpy = vi.spyOn(driveSync, "pushSnapshotToDrive").mockResolvedValue({
      uid: "u-auto",
      fileId: "rf-1",
      fileName: "panga-backup.json",
      remoteModifiedTime: "2026-11-26T10:05:00Z",
      lastSyncedAt: "2026-11-26T10:05:00Z",
      lastSyncedDigest: "d1",
    });

    await mountHarness();
    notifyLocalDataMutated();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2400);
    });

    expect(pushSpy).toHaveBeenCalled();
    expect(latestHook?.modalOpen).toBe(false);
  });

  it("quietly pulls remote_ahead snapshots without opening a modal", async () => {
    const remoteSnap = makeSnapshot([{ id: "t2", title: "Phone edit", updatedAt: 200 }]);
    const remoteFile = { id: "rf-2", name: "panga-backup.json", modifiedTime: "2026-11-26T10:10:00Z", size: 220 };
    vi.spyOn(driveSync, "inspectDriveSync").mockResolvedValue({
      status: "remote_ahead",
      remoteFile,
      localSnapshot: makeSnapshot(),
      localSummary: makeSummary(0),
      localDigest: "d-local",
      remoteSnapshot: remoteSnap,
      remoteSummary: makeSummary(1),
      remoteDigest: "d-remote",
      baseline: null,
      checkedAt: "2026-11-26T10:10:00Z",
    });
    const pullSpy = vi.spyOn(driveSync, "pullSnapshotFromDrive").mockResolvedValue({
      uid: "u-auto",
      fileId: "rf-2",
      fileName: "panga-backup.json",
      remoteModifiedTime: "2026-11-26T10:10:00Z",
      lastSyncedAt: "2026-11-26T10:11:00Z",
      lastSyncedDigest: "d2",
    });

    await mountHarness();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(pullSpy).toHaveBeenCalledTimes(1);
    expect(latestHook?.modalOpen).toBe(false);
  });

  it("prompts the conflict modal instead of overwriting on genuine two-way conflict", async () => {
    vi.spyOn(driveSync, "inspectDriveSync").mockResolvedValue({
      status: "conflict",
      remoteFile: { id: "rf-3", name: "panga-backup.json", modifiedTime: "2026-11-26T10:20:00Z", size: 300 },
      localSnapshot: makeSnapshot([{ id: "a", title: "Local", updatedAt: 100 }]),
      localSummary: makeSummary(1),
      localDigest: "d-local",
      remoteSnapshot: makeSnapshot([{ id: "b", title: "Remote", updatedAt: 110 }]),
      remoteSummary: makeSummary(1),
      remoteDigest: "d-remote",
      baseline: null,
      checkedAt: "2026-11-26T10:20:00Z",
    });
    const pushSpy = vi.spyOn(driveSync, "pushSnapshotToDrive");
    const pullSpy = vi.spyOn(driveSync, "pullSnapshotFromDrive");

    await mountHarness();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(pushSpy).not.toHaveBeenCalled();
    expect(pullSpy).not.toHaveBeenCalled();
    expect(latestHook?.modalOpen).toBe(true);
  });
});
