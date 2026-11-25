import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Landing from "../../pages/Landing";
import AccountPanel from "../../components/AccountPanel";
import AppShell from "../../components/AppShell";
import { ConfirmDialogHost, ToastContainer } from "../../components/ui";
import {
  classifyDriveSync,
  computeSnapshotDigest,
  mergeSnapshots,
  type DriveFileMeta,
} from "../googleDriveSync";
import type { Snapshot } from "../snapshot";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

function makeSnapshot(overrides?: Partial<Snapshot> & { tasks?: any[]; notes?: any[] }): Snapshot {
  const { tasks = [], notes = [], ...rest } = overrides ?? {};
  return {
    metadata: {
      version: "1.0",
      exportedAt: "2026-11-25T08:00:00.000Z",
      appName: "Panga",
      dbVersion: 14,
      ...(rest.metadata || {}),
    },
    data: {
      tasks,
      taskLists: [],
      notes,
      links: [],
      reminders: [],
      clips: [],
      thoughts: [],
      settings: [],
      ...(rest.data || {}),
    },
    ...(rest.identity ? { identity: rest.identity } : {}),
    ...(rest.workspaces ? { workspaces: rest.workspaces } : {}),
  };
}

let root: Root | null = null;
let host: HTMLElement | null = null;

async function renderNode(node: React.ReactNode) {
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () => {
    root!.render(node);
  });
  await act(async () => {
    await new Promise((r) => setTimeout(r, 30));
  });
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(async () => {
  if (root) {
    await act(async () => root!.unmount());
  }
  host?.remove();
  root = null;
  host = null;
  vi.restoreAllMocks();
});

describe("Google Drive sync classification & conflict merge", () => {
  const remoteMeta: DriveFileMeta = {
    id: "drive-file-1",
    name: "panga-backup.json",
    modifiedTime: "2026-11-25T09:00:00.000Z",
    size: 1024,
  };

  it("classifies no_remote and in_sync ignoring volatile exportedAt timestamps", () => {
    const localSnap = makeSnapshot({
      tasks: [{ id: "t1", title: "Buy milk", updatedAt: 100 }],
      metadata: { version: "1.0", exportedAt: "2026-11-25T08:00:00.000Z", appName: "Panga", dbVersion: 14 },
    });

    const noRemote = classifyDriveSync({
      localSnapshot: localSnap,
      remoteFile: null,
      remoteSnapshot: null,
      baseline: null,
    });
    expect(noRemote.status).toBe("no_remote");

    const remoteSameContentDiffExportTime = makeSnapshot({
      tasks: [{ id: "t1", title: "Buy milk", updatedAt: 100 }],
      metadata: { version: "1.0", exportedAt: "2026-11-25T10:30:00.000Z", appName: "Panga", dbVersion: 14 },
    });

    const inSync = classifyDriveSync({
      localSnapshot: localSnap,
      remoteFile: remoteMeta,
      remoteSnapshot: remoteSameContentDiffExportTime,
      baseline: null,
    });
    expect(inSync.status).toBe("in_sync");
  });

  it("detects local_ahead, remote_ahead, and dual conflict against baseline", () => {
    const baseSnap = makeSnapshot({ tasks: [{ id: "t1", title: "Initial", updatedAt: 100 }] });
    const baseDigest = computeSnapshotDigest(baseSnap);
    const baseline = {
      uid: "u1",
      fileId: "drive-file-1",
      fileName: "panga-backup.json",
      remoteModifiedTime: "2026-11-25T08:00:00.000Z",
      lastSyncedAt: "2026-11-25T08:00:00.000Z",
      lastSyncedDigest: baseDigest,
    };

    const localEdited = makeSnapshot({ tasks: [{ id: "t1", title: "Edited locally", updatedAt: 200 }] });
    const remoteEdited = makeSnapshot({ tasks: [{ id: "t1", title: "Edited on phone", updatedAt: 250 }] });

    expect(
      classifyDriveSync({
        localSnapshot: localEdited,
        remoteFile: { ...remoteMeta, modifiedTime: "2026-11-25T08:00:00.000Z" },
        remoteSnapshot: baseSnap,
        baseline,
      }).status
    ).toBe("local_ahead");

    expect(
      classifyDriveSync({
        localSnapshot: baseSnap,
        remoteFile: { ...remoteMeta, modifiedTime: "2026-11-25T09:00:00.000Z" },
        remoteSnapshot: remoteEdited,
        baseline,
      }).status
    ).toBe("remote_ahead");

    expect(
      classifyDriveSync({
        localSnapshot: localEdited,
        remoteFile: { ...remoteMeta, modifiedTime: "2026-11-25T09:00:00.000Z" },
        remoteSnapshot: remoteEdited,
        baseline,
      }).status
    ).toBe("conflict");
  });

  it("classifies empty local + non-empty Drive backup on fresh device as remote_ahead, and both populated as conflict", () => {
    const emptyLocal = makeSnapshot();
    const populatedRemote = makeSnapshot({ notes: [{ id: "n1", title: "Cloud note", updatedAt: 500 }] });

    expect(
      classifyDriveSync({
        localSnapshot: emptyLocal,
        remoteFile: remoteMeta,
        remoteSnapshot: populatedRemote,
        baseline: null,
      }).status
    ).toBe("remote_ahead");

    const populatedLocal = makeSnapshot({ notes: [{ id: "n2", title: "Local note", updatedAt: 400 }] });
    expect(
      classifyDriveSync({
        localSnapshot: populatedLocal,
        remoteFile: remoteMeta,
        remoteSnapshot: populatedRemote,
        baseline: null,
      }).status
    ).toBe("conflict");
  });

  it("merges unique items from both sides and picks newer updatedAt for shared record ids", () => {
    const localSnap = makeSnapshot({
      tasks: [
        { id: "shared", title: "Old local title", updatedAt: 100 },
        { id: "local-only", title: "Offline laptop task", updatedAt: 150 },
      ],
    });
    const remoteSnap = makeSnapshot({
      tasks: [
        { id: "shared", title: "Newer phone title", updatedAt: 300 },
        { id: "remote-only", title: "Offline phone task", updatedAt: 200 },
      ],
    });

    const merged = mergeSnapshots(localSnap, remoteSnap);
    const mergedTasks = merged.data.tasks as Array<{ id: string; title: string }>;
    expect(mergedTasks).toHaveLength(3);
    expect(mergedTasks.find((t) => t.id === "shared")?.title).toBe("Newer phone title");
    expect(mergedTasks.find((t) => t.id === "local-only")?.title).toBe("Offline laptop task");
    expect(mergedTasks.find((t) => t.id === "remote-only")?.title).toBe("Offline phone task");
  });
});

describe("Google Drive UI presence on Landing, Settings, and Menu", () => {
  it("renders Google Drive Sign in with Google card on Landing", async () => {
    await renderNode(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Landing />} />
        </Routes>
        <ToastContainer />
        <ConfirmDialogHost />
      </MemoryRouter>
    );
    expect(host!.textContent).toContain("Continue local");
    expect(host!.textContent).toContain("Google Drive");
    expect(host!.textContent).toContain("Sign in with Google");
    expect(host!.textContent).toContain("Start afresh");
    expect(host!.textContent).toContain("Upload JSON");
  });

  it("renders Google Drive sync section in Settings AccountPanel", async () => {
    await renderNode(
      <>
        <AccountPanel />
        <ToastContainer />
        <ConfirmDialogHost />
      </>
    );
    expect(host!.textContent).toContain("JSON account & backup");
    expect(host!.textContent).toContain("Google Drive sync");
    expect(host!.textContent).toContain("Sign in with Google");
  });

  it("renders Google Drive Signed out status and Sign in with Google action inside AppShell Menu", async () => {
    localStorage.setItem("panga_guest", "1");
    await renderNode(
      <MemoryRouter initialEntries={["/home"]}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/home" element={<div>Home</div>} />
          </Route>
        </Routes>
        <ToastContainer />
        <ConfirmDialogHost />
      </MemoryRouter>
    );

    const menuBtn = [...host!.querySelectorAll("button")].find((b) => b.textContent?.trim() === "Menu");
    expect(menuBtn).toBeDefined();
    await act(async () => {
      menuBtn!.click();
    });

    const menu = host!.querySelector('[role="menu"][aria-label="App menu"]');
    expect(menu).not.toBeNull();
    expect(menu!.textContent).toContain("Google Drive: Signed out");
    expect(menu!.textContent).toContain("Sign in with Google");
  });
});
