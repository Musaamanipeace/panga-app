/**
 * storage.js — Persistence layer for Panga's Puter edition.
 *
 * Strategy (local-first, with cloud sync):
 *  - The in-memory state is the source of truth while the app runs.
 *  - Every change is written to localStorage immediately (instant, offline,
 *    survives tab reloads and works before/without Puter auth).
 *  - A debounced writer mirrors the full document to Puter's per-user KV store
 *    so the workspace persists across devices.
 *  - On startup the local cache is used instantly; if Puter auth is available we
 *    hydrate from the cloud and reconcile using `meta.lastWriteAt` so the newest
 *    write wins.
 */

import { hasPuter, now } from "./lib.js";

/** Puter KV key for the canonical Panga document. */
const KV_KEY = "panga:v1";
/** localStorage mirror used for instant offline boot and pre-auth work. */
const CACHE_KEY = "panga:cache";
/** localStorage flag for the last signed-in Puter account id (per origin). */
const ACTIVE_USER_KEY = "panga:active_user";

/**
 * Read the cached document from localStorage. Returns {} when nothing is
 * stored yet so the caller can boot an empty workspace instantly.
 * @returns {any}
 */
export function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("[panga/storage] cache read failed:", e);
  }
  return null;
}

/**
 * Persist the document to localStorage immediately.
 * @param {any} state
 */
export function writeCache(state) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("[panga/storage] cache write failed:", e);
  }
}

/** The active Puter user id (cached), or null. */
export function getActiveUserId() {
  try {
    return localStorage.getItem(ACTIVE_USER_KEY);
  } catch {
    return null;
  }
}

export function setActiveUserId(id) {
  try {
    localStorage.setItem(ACTIVE_USER_KEY, id || "");
  } catch {}
}

/**
 * Is the Puter KV store usable right now?
 *
 * Returns true only when BOTH:
 *  - the Puter.js SDK is present, AND
 *  - the user is actually signed in.
 *
 * This is the crux of the "no login wall" experience: before sign-in we never
 * touch the cloud, so `puter.kv.*` calls — which otherwise auto-trigger a
 * sign-in popup (and block/hang when that popup can't open) — are never
 * invoked. The app stays fully productive in pure-local mode until the user
 * opts in to sync.
 * @returns {boolean}
 */
export function isCloudAvailable() {
  if (!hasPuter() || typeof puter.kv === "undefined" || !puter.kv) return false;
  // isSignedIn() is a cheap, side-effect-free check — it does NOT open a popup.
  try {
    return typeof puter.auth.isSignedIn === "function" ? !!puter.auth.isSignedIn() : false;
  } catch {
    return false;
  }
}

/**
 * Race a cloud call against a hard timeout so a stalled auth prompt can never
 * block the UI. Resolves `undefined` on timeout.
 * @param {Promise<any>} p
 * @param {number} [ms=5000]
 */
function withTimeout(p, ms = 5000) {
  let t;
  const timeout = new Promise((resolve) => {
    t = setTimeout(() => resolve(undefined), ms);
  });
  return Promise.race([p.then((v) => (t && clearTimeout(t), v)), timeout]).finally(() =>
    clearTimeout(t)
  );
}

/**
 * Load the canonical document from Puter KV.
 * Rejects when cloud is unavailable so callers can fall back to cache.
 * @returns {Promise<any|null>}
 */
export async function readCloud() {
  if (!isCloudAvailable()) throw new Error("cloud unavailable");
  const data = await withTimeout(puter.kv.get(KV_KEY));
  // KV returns undefined for missing keys
  return data == null ? null : data;
}

/**
 * Persist the document to Puter KV.
 * @param {any} state
 */
export async function writeCloud(state) {
  if (!isCloudAvailable()) throw new Error("cloud unavailable");
  await withTimeout(puter.kv.set(KV_KEY, state));
}

/**
 * Delete the cloud document (used by "start afresh").
 */
export async function clearCloud() {
  if (!isCloudAvailable()) return false;
  try {
    await withTimeout(puter.kv.del(KV_KEY));
    return true;
  } catch {
    return false;
  }
}

/**
 * Reconcile local cache with the cloud version.
 * The document with the higher `meta.lastWriteAt` wins; if local has
 * unsynced edits newer than the cloud, the local version is pushed afterwards.
 *
 * @param {any} local
 * @returns {Promise<{ merged: any, fromCloud: boolean }>}
 */
export async function reconcileWithCloud(local) {
  let cloud = null;
  try {
    cloud = await readCloud();
  } catch (e) {
    // Offline: keep local as-is.
    return { merged: local, fromCloud: false };
  }

  if (!cloud) {
    // Cloud is empty; seed it from local if local has data.
    const hasLocal = local && Object.keys(local).length > 0;
    return { merged: local, fromCloud: false, seedCloud: hasLocal };
  }

  const localTs = (local && local.meta && local.meta.lastWriteAt) || 0;
  const cloudTs = (cloud && cloud.meta && cloud.meta.lastWriteAt) || 0;

  if (cloudTs >= localTs) {
    // Cloud (or peer) is the newest — use it and refresh the cache.
    return { merged: cloud, fromCloud: true };
  }

  // Local is newer (offline edits) — keep local; push it up on next persist.
  return { merged: local, fromCloud: false, pushLocal: true };
}

/** Subscribe to cross-tab localStorage changes so all panes stay in sync. */
export function onCacheChanged(cb) {
  window.addEventListener("storage", (e) => {
    if (e.key === CACHE_KEY && e.newValue) {
      try {
        cb(JSON.parse(e.newValue));
      } catch {}
    }
  });
}

/** Dispatch a synthetic event so UI components react to state changes. */
export function emitStateChanged() {
  window.dispatchEvent(new Event("panga:state-changed"));
}
