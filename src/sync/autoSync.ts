// src/sync/autoSync.ts
// Automatic background sync.
//
// Every create / update / delete on a user-data table schedules a debounced
// push of the full snapshot to the chosen provider (Google Drive).
// The user never has to press a save button; the header shows the
// current state ("Synced to Drive", "Syncing…", …).
//
// Safety rules:
//  * Auto-sync is only switched on after the user explicitly runs
//    Sync → Export or Sync → Import on THIS device. A fresh device therefore can
//    never silently overwrite the remote copy with an empty database.
//  * Table hooks ignore writes that only touch `syncStatus` (our own
//    bookkeeping) and everything done during import/clear, so there are no loops.
//  * Background pushes never open a popup. If the Google token has expired the
//    status turns to "error" and asks the user to re-run Sync → Export.

import { db, suppressChangeHooks } from "../data/db";
import {
  getActiveSyncProvider,
  setActiveSyncProvider,
  setLastSyncInfo,
  type CloudSyncProvider,
} from "../data/settings";
import { exportSnapshot, importSnapshot, type Snapshot } from "./snapshot";
import {
  requireDriveToken,
  uploadJsonToDrive,
  syncNowToGoogleDrive,
  fetchDriveBackupForRestore,
} from "./googleDriveSync";

export const DEBOUNCE_MS = 2000;
const CONFIG_KEY = "panga_autosync";

export type AutoSyncPhase = "off" | "idle" | "pending" | "syncing" | "synced" | "error";

export interface AutoSyncState {
  phase: AutoSyncPhase;
  provider: CloudSyncProvider | null;
  at: number | null;
  message: string;
}

export const PROVIDER_SHORT: Record<CloudSyncProvider, string> = {
  google_drive: "Drive",
};

export const PROVIDER_LONG: Record<CloudSyncProvider, string> = {
  google_drive: "Google Drive",
};

interface AutoSyncConfig {
  enabled: boolean;
  provider: CloudSyncProvider;
  lastSyncedAt?: number;
}

/* ----------------------------- config (per device) ----------------------------- */

function readConfig(): AutoSyncConfig | null {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as AutoSyncConfig;
    if (c && c.provider === "google_drive") return c;
  } catch {}
  return null;
}

function writeConfig(c: AutoSyncConfig | null) {
  try {
    if (c) localStorage.setItem(CONFIG_KEY, JSON.stringify(c));
    else localStorage.removeItem(CONFIG_KEY);
  } catch {}
}

export function isAutoSyncEnabled(): boolean {
  return !!readConfig()?.enabled;
}

export function getAutoSyncProvider(): CloudSyncProvider | null {
  const c = readConfig();
  return c?.enabled ? c.provider : null;
}

/** Turn auto-sync on for a provider (called after a successful Export or Import). */
export function enableAutoSync(provider: CloudSyncProvider) {
  writeConfig({ enabled: true, provider, lastSyncedAt: Date.now() });
  void setActiveSyncProvider(provider);
  setState({
    phase: "synced",
    provider,
    at: Date.now(),
    message: `Synced to ${PROVIDER_LONG[provider]}`,
  });
}

export function disableAutoSync() {
  writeConfig(null);
  clearTimer();
  setState({ phase: "off", provider: null, at: null, message: "Auto-sync is off" });
}

/* --------------------------------- status store -------------------------------- */

let state: AutoSyncState = (() => {
  const c = readConfig();
  return c?.enabled
    ? {
        phase: "idle" as AutoSyncPhase,
        provider: c.provider,
        at: c.lastSyncedAt ?? null,
        message: `Auto-sync to ${PROVIDER_LONG[c.provider]}`,
      }
    : { phase: "off" as AutoSyncPhase, provider: null, at: null, message: "Auto-sync is off" };
})();

let listeners: Array<(s: AutoSyncState) => void> = [];

export function getAutoSyncState(): AutoSyncState {
  return state;
}

export function subscribeAutoSync(fn: (s: AutoSyncState) => void): () => void {
  listeners.push(fn);
  fn(state);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

function setState(next: AutoSyncState) {
  state = next;
  for (const l of listeners) {
    try {
      l(state);
    } catch {}
  }
}

/* ------------------------------ push (export) logic ----------------------------- */

interface PushResult {
  ok: boolean;
  message: string;
}

async function pushToProvider(_provider: CloudSyncProvider, interactive: boolean): Promise<PushResult> {
  if (interactive) {
    const res = await syncNowToGoogleDrive();
    return { ok: res.ok, message: res.message };
  }

  // Background push: never open a popup.
  let token: string;
  try {
    token = await requireDriveToken(false);
  } catch {
    return {
      ok: false,
      message: "Google Drive session expired. Open Sync → Google Drive → Export to reconnect.",
    };
  }
  try {
    const snapshot = await exportSnapshot();
    await uploadJsonToDrive(token, JSON.stringify(snapshot, null, 2));
    return { ok: true, message: "Synced to Google Drive" };
  } catch (err: any) {
    if (err?.message === "TOKEN_EXPIRED") {
      return {
        ok: false,
        message: "Google Drive session expired. Open Sync → Google Drive → Export to reconnect.",
      };
    }
    return { ok: false, message: `Google Drive sync failed: ${err?.message || String(err)}` };
  }
}

let timer: ReturnType<typeof setTimeout> | null = null;
let inFlight = false;
let dirtyWhileFlying = false;

function clearTimer() {
  if (timer) clearTimeout(timer);
  timer = null;
}

async function flush() {
  clearTimer();
  const cfg = readConfig();
  if (!cfg?.enabled) return;

  if (inFlight) {
    dirtyWhileFlying = true;
    return;
  }
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    setState({
      phase: "error",
      provider: cfg.provider,
      at: state.at,
      message: "Offline — will sync when back online",
    });
    return;
  }

  inFlight = true;
  setState({
    phase: "syncing",
    provider: cfg.provider,
    at: state.at,
    message: `Syncing to ${PROVIDER_LONG[cfg.provider]}…`,
  });

  try {
    const res = await pushToProvider(cfg.provider, false);
    if (res.ok) {
      const at = Date.now();
      writeConfig({ ...cfg, lastSyncedAt: at });
      void setLastSyncInfo({ provider: cfg.provider, timestamp: at, message: res.message });
      setState({
        phase: "synced",
        provider: cfg.provider,
        at,
        message: `Synced to ${PROVIDER_LONG[cfg.provider]}`,
      });
    } else {
      setState({ phase: "error", provider: cfg.provider, at: state.at, message: res.message });
    }
  } catch (err: any) {
    setState({
      phase: "error",
      provider: cfg.provider,
      at: state.at,
      message: err?.message || String(err),
    });
  } finally {
    inFlight = false;
    if (dirtyWhileFlying) {
      dirtyWhileFlying = false;
      schedule();
    }
  }
}

/** Schedule a debounced push (resets the timer on every change). */
export function schedule() {
  const cfg = readConfig();
  if (!cfg?.enabled) return;
  clearTimer();
  setState({
    phase: "pending",
    provider: cfg.provider,
    at: state.at,
    message: `Changes waiting to sync to ${PROVIDER_LONG[cfg.provider]}`,
  });
  timer = setTimeout(() => void flush(), DEBOUNCE_MS);
}

/** Retry immediately (used after an error). */
export function retryNow() {
  void flush();
}

/* --------------------------- explicit Export / Import --------------------------- */

/** Sync → <provider> → Export. Pushes now and switches auto-sync on for that provider. */
export async function exportNow(provider: CloudSyncProvider): Promise<PushResult> {
  clearTimer();
  setState({
    phase: "syncing",
    provider,
    at: state.at,
    message: `Exporting to ${PROVIDER_LONG[provider]}…`,
  });
  const res = await pushToProvider(provider, true);
  if (res.ok) {
    enableAutoSync(provider);
    void setLastSyncInfo({ provider, timestamp: Date.now(), message: res.message });
  } else {
    const cfg = readConfig();
    setState(
      cfg?.enabled
        ? { phase: "error", provider: cfg.provider, at: state.at, message: res.message }
        : { phase: "off", provider: null, at: null, message: res.message }
    );
  }
  return res;
}

/** Sync → <provider> → Import, step 1: download and validate the remote snapshot. */
export async function fetchRemoteSnapshot(
  _provider: CloudSyncProvider
): Promise<{ ok: boolean; message: string; data?: Snapshot }> {
  return fetchDriveBackupForRestore();
}

/** Import, step 2: replace local data with the snapshot and switch auto-sync on. */
export async function applyImport(provider: CloudSyncProvider, snapshot: Snapshot): Promise<void> {
  clearTimer();
  await importSnapshot(snapshot); // suppresses change hooks internally
  enableAutoSync(provider);
}

export async function localDataIsEmpty(): Promise<boolean> {
  if (!db.isOpen()) await db.open();
  const tables = [
    "projects",
    "tasks",
    "resources",
    "docEntries",
    "milestones",
    "issues",
    "contacts",
    "reminders",
    "calendarEvents",
    "scheduleItems",
    "insights",
    "trainOfThought",
  ];
  const counts = await Promise.all(tables.map((t) => (db as any)[t].count()));
  return counts.every((c: number) => c === 0);
}

export async function getPreferredProvider(): Promise<CloudSyncProvider> {
  return getAutoSyncProvider() ?? (await getActiveSyncProvider());
}

/* ------------------------------- change detection ------------------------------- */

const WATCHED_TABLES = [
  "projects",
  "tasks",
  "resources",
  "docEntries",
  "milestones",
  "issues",
  "contacts",
  "reminders",
  "calendarEvents",
  "scheduleItems",
  "insights",
  "trainOfThought",
] as const;

let started = false;

/** Call once at app start. Safe to call repeatedly. */
export function startAutoSync() {
  if (started) return;
  started = true;

  const onChange = () => {
    if (suppressChangeHooks) return;
    schedule();
  };

  for (const name of WATCHED_TABLES) {
    const table = (db as any)[name];
    if (!table) continue;
    table.hook("creating", () => {
      onChange();
    });
    table.hook("deleting", () => {
      onChange();
    });
    table.hook("updating", (mods: Record<string, unknown>) => {
      // Ignore our own bookkeeping writes (syncStatus flips) to avoid a loop.
      const keys = Object.keys(mods || {});
      if (keys.length > 0 && keys.every((k) => k === "syncStatus")) return;
      onChange();
    });
  }

  if (typeof window !== "undefined") {
    window.addEventListener("online", () => {
      if (isAutoSyncEnabled() && state.phase === "error") retryNow();
    });
    // Best-effort flush when the tab is hidden/closed so pending edits are not lost.
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden" && timer) void flush();
    });
  }
}
