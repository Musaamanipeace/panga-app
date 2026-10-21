// src/sync/puterSync.ts
// Puter KV cloud sync — local-first with auto-sync to the user's Puter cloud.
//
// Flow:
//  1. User clicks "Sign in with Puter" → openPuterSignIn()
//  2. After sign-in, importPuterCloud() checks KV for saved data → imports if found
//  3. startPuterAutoSync() hooks into DB changes → debounced save to KV
//  4. On sign-out, the KV data stays in the cloud (user can sign back in and resume)

import { db, setSuppressChangeHooks } from "../data/db";
import { exportDbState, importDbState } from "../data/db";
import {
  isPuterAvailable,
  isPuterSignedIn,
  signInWithPuter,
  signOutOfPuter,
  fetchPuterUser,
  puterKVGet,
  puterKVSet,
  type PuterUserInfo,
} from "../auth/puterAuth";
import { setSession } from "../auth/session";

// ---------------------------------------------------------------------------
// Status store (React-friendly)
// Status store (React-friendly)
// ---------------------------------------------------------------------------

export type PuterSyncPhase = "unavailable" | "signed-out" | "signed-in" | "syncing" | "synced" | "error";

export interface PuterSyncState {
  phase: PuterSyncPhase;
  user: PuterUserInfo | null;
  lastSyncedAt: number | null;
  message: string;
}

let state: PuterSyncState = {
  phase: isPuterAvailable() ? "signed-out" : "unavailable",
  user: null,
  lastSyncedAt: null,
  message: isPuterAvailable() ? "Click Sign in to sync with Puter" : "Puter SDK not loaded",
};

let listeners: Array<(s: PuterSyncState) => void> = [];

export function getPuterSyncState(): PuterSyncState {
  return state;
}

export function subscribePuterSync(fn: (s: PuterSyncState) => void): () => void {
  listeners.push(fn);
  fn(state);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

function setState(next: Partial<PuterSyncState>) {
  state = { ...state, ...next };
  for (const l of listeners) {
    try {
      l(state);
    } catch {}
  }
}

// ---------------------------------------------------------------------------
// Sign-in flow (called from Landing page)
// ---------------------------------------------------------------------------

const LAST_SYNC_KEY = "panga_puter_last_sync";

function getLastSyncTime(): number | null {
  try {
    const raw = localStorage.getItem(LAST_SYNC_KEY);
    return raw ? Number(raw) : null;
  } catch {
    return null;
  }
}

function setLastSyncTime(ts: number) {
  try {
    localStorage.setItem(LAST_SYNC_KEY, String(ts));
  } catch {}
}

/**
 * Full sign-in flow:
 *  1. Open Puter auth popup
 *  2. Set the session (so IndexedDB uses the Puter user's DB)
 *  3. Import data from Puter KV if it exists
 *  4. Start auto-sync hooks
 */
export async function openPuterSignIn(): Promise<PuterUserInfo | null> {
  if (!isPuterAvailable()) {
    setState({ phase: "unavailable", message: "Puter SDK not loaded" });
    throw new Error("Puter SDK not loaded. Check your internet connection.");
  }

  setState({ phase: "syncing", message: "Opening Puter sign-in…" });

  let user: PuterUserInfo | null = null;
  try {
    user = await signInWithPuter();
  } catch (err: any) {
    setState({ phase: "signed-out", message: err?.message || "Sign-in failed" });
    throw err;
  }

  if (!user) {
    setState({ phase: "signed-out", message: "Sign-in cancelled" });
    return null;
  }

  // Set the session so the app uses this user's IndexedDB
  setSession(user.id, user.email || "puter-local");

  // Check for existing cloud data
  setState({ phase: "syncing", user, message: "Checking for cloud data…" });

  // Small delay to let the SDK settle
  await new Promise((r) => setTimeout(r, 300));

  let imported = false;
  try {
    imported = await importPuterCloud();
  } catch (err: any) {
    console.warn("[puterSync] import failed:", err);
  }

  // Start watching DB changes for auto-sync
  startPuterAutoSync();

  setLastSyncTime(Date.now());
  setState({
    phase: "synced",
    user,
    lastSyncedAt: Date.now(),
    message: imported ? "Data synced from Puter cloud" : "Signed in to Puter",
  });

  return user;
}

/**
 * Import data from Puter KV into the local IndexedDB.
 * Returns true if data was imported (cloud won), false if local is newer/empty.
 */
export async function importPuterCloud(): Promise<boolean> {
  const cloudRaw = await puterKVGet();
  if (!cloudRaw || typeof cloudRaw !== "object") return false;

  const cloud = cloudRaw as { data?: Record<string, any[]>; ts?: number; userId?: string };
  if (!cloud.data) return false;

  const localTs = await getLocalLastWriteAt();
  const cloudTs = cloud.ts ?? 0;

  if (cloudTs > localTs) {
    // Cloud is newer → adopt cloud data
    setSuppressChangeHooks(true);
    try {
      await importDbState(cloud.data);
    } finally {
      setSuppressChangeHooks(false);
    }
    setLastSyncTime(cloudTs);
    return true;
  }

  // Local is same or newer → keep local (push up during next auto-sync)
  return false;
}

/**
 * Export the entire local DB to Puter KV.
 * Called by the auto-sync hook after debounced changes.
 */
export async function exportPuterCloud(): Promise<boolean> {
  if (!isPuterSignedIn()) return false;

  const data = await exportDbState();
  const ts = Date.now();
  const user = getCachedPuterUserLocal();
  const payload = { data, ts, userId: user?.id, app: "panga", version: 1 };

  const ok = await puterKVSet(payload);
  if (ok) {
    setLastSyncTime(ts);
    setState({ phase: "synced", lastSyncedAt: ts, message: "Synced to Puter cloud" });
  } else {
    setState({ phase: "error", message: "Cloud sync failed (timeout or offline)" });
  }
  return ok;
}

/** Sign out of Puter. Data stays in the cloud. */
export async function openPuterSignOut(): Promise<void> {
  await signOutOfPuter();
  stopPuterAutoSync();
  setState({
    phase: "signed-out",
    user: null,
    lastSyncedAt: null,
    message: "Signed out — data stays in Puter cloud",
  });
}

// ---------------------------------------------------------------------------
// Local timestamp helper
// ---------------------------------------------------------------------------

/** Best-effort "last write" timestamp from IndexedDB settings table. */
async function getLocalLastWriteAt(): Promise<number> {
  try {
    if (!db.isOpen()) await db.open();
    const row = await db.settings.where("key").equals("last_write_at").first();
    return row ? Number(row.value) : 0;
  } catch {
    return 0;
  }
}

// ---------------------------------------------------------------------------
// Cached user helper (local to this module)
// ---------------------------------------------------------------------------

function getCachedPuterUserLocal(): PuterUserInfo | null {
  try {
    const raw = localStorage.getItem("panga_puter_user");
    if (!raw) return null;
    return JSON.parse(raw) as PuterUserInfo;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Auto-sync: debounced save on DB changes
// ---------------------------------------------------------------------------

const DEBOUNCE_MS = 1500;
let syncTimer: ReturnType<typeof setTimeout> | null = null;
let hooksAttached = false;

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
  "activityLog",
  "settings",
  "drafts",
  "conversations",
  "messages",
] as const;

/**
 * Attach Dexie hooks that schedule a debounced cloud save on any user-data
 * change. Safe to call multiple times — hooks are only attached once.
 */
export function startPuterAutoSync() {
  if (!isPuterSignedIn() || hooksAttached) return;
  hooksAttached = true;

  const schedule = () => {
    if (!isPuterSignedIn()) return;
    if (syncTimer) clearTimeout(syncTimer);
    setState({ phase: "syncing", message: "Saving to Puter cloud…" });
    syncTimer = setTimeout(() => {
      syncTimer = null;
      void flushPuterSync();
    }, DEBOUNCE_MS);
  };

  for (const name of WATCHED_TABLES) {
    const table = (db as any)[name];
    if (!table) continue;

    table.hook("creating", () => schedule());
    table.hook("updating", () => schedule());
    table.hook("deleting", () => schedule());
  }
}

export function stopPuterAutoSync() {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = null;
  hooksAttached = false;
}

async function flushPuterSync() {
  if (!isPuterSignedIn()) return;
  setState({ phase: "syncing", message: "Syncing to Puter cloud…" });
  const ok = await exportPuterCloud();
  if (!ok) {
    // Retry once after a short delay
    setTimeout(() => {
      if (isPuterSignedIn()) void exportPuterCloud();
    }, 5000);
  }
}

/**
 * Poll for Puter sign-in state. Call this from a top-level component's
 * useEffect to keep the sync state fresh across tabs.
 */
export function pollPuterAuth(intervalMs = 30_000): () => void {
  const tick = async () => {
    const wasSignedIn = state.phase !== "unavailable" && state.phase !== "signed-out";
    const nowSignedIn = isPuterSignedIn();

    if (nowSignedIn && !wasSignedIn) {
      // User signed in on another tab — refresh user info
      const user = await fetchPuterUser();
      if (user) {
        setState({ phase: "signed-in", user, lastSyncedAt: getLastSyncTime(), message: "Signed in to Puter" });
        startPuterAutoSync();
      }
    } else if (!nowSignedIn && wasSignedIn) {
      // User signed out on another tab
      setState({ phase: "signed-out", user: null, lastSyncedAt: null, message: "Signed out" });
      stopPuterAutoSync();
    }
  };

  const id = setInterval(tick, intervalMs);
  void tick(); // run once immediately
  return () => clearInterval(id);
}

// ---------------------------------------------------------------------------
// Module init
// ---------------------------------------------------------------------------

/**
 * Call once at app start. Detects existing Puter sign-in and sets up sync.
 */
export async function initPuterSync() {
  if (!isPuterAvailable()) {
    setState({ phase: "unavailable", message: "Puter SDK not loaded" });
    return;
  }

  const user = await fetchPuterUser();
  if (user) {
    // User was already signed in — restore session and sync state
    setSession(user.id, user.email || "puter-local");

    // Check for cloud data and merge
    const imported = await importPuterCloud();

    // Start auto-sync hooks
    startPuterAutoSync();

    setState({
      phase: "synced",
      user,
      lastSyncedAt: getLastSyncTime(),
      message: imported ? "Data loaded from Puter cloud" : "Signed in to Puter",
    });
  } else {
    setState({ phase: "signed-out", user: null, lastSyncedAt: getLastSyncTime(), message: "Not signed in" });
  }
}
