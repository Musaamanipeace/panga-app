/**
 * auth.js — Puter authentication for the Panga frontend.
 *
 * Instant, wall-free access:
 *  - On Puter hosting an app is already signed in as its launcher, so the
 *    workspace is available immediately and Puter KV is live.
 *  - On a regular website Puter.js auto-handles the one-time sign-in popup; once
 *    consented the session is remembered by Puter, so there is no login wall on
 *    subsequent visits.
 *  - Before/while auth resolves we keep the user productive in pure-local mode
 *    (localStorage cache) and only require a sign-in to unlock cloud sync.
 *
 * This module never blocks the first render. It merely observes auth state and
 * hydrates the cloud layer once the user is recognised.
 */

import { now, hasPuter } from "./lib.js";
import { getActiveUserId, setActiveUserId } from "./storage.js";

const AUTH_STATE_KEY = "panga:active_user";

/** @type {Array<(user: object|null) => void>} */
const authListeners = [];
/** @type {object|null} */
let currentUser = null;
let authReady = false;

/**
 * True when Puter reports the current user is signed in.
 * @returns {boolean}
 */
export function isSignedIn() {
  if (!hasPuter()) return false;
  try {
    return !!puter.auth.isSignedIn();
  } catch {
    return false;
  }
}

/**
 * Resolve the current user's profile. Returns a normalised user object or null.
 * @returns {Promise<object|null>}
 */
export async function getCurrentUser() {
  if (!hasPuter() || !isSignedIn()) return null;
  try {
    const user = await puter.auth.getUser();
    const profile = await puter.auth.getProfile().catch(() => null);
    return {
      id: user?.id,
      uuid: user?.uuid,
      username: user?.username,
      email: user?.email ?? profile?.email,
      name: user?.name ?? profile?.name,
      avatar: user?.avatar ?? profile?.avatar,
    };
  } catch (e) {
    console.warn("[panga/auth] getUser failed:", e);
    return null;
  }
}

/**
 * Ensure the user is authenticated, signing them in via the Puter popup if
 * needed. Must be called from a user gesture (button click) to satisfy popup
 * blockers. Resolves once the user object is available.
 * @param {object} [opts]
 * @returns {Promise<object|null>}
 */
export async function signIn(opts = {}) {
  if (!hasPuter()) return null;
  try {
    await puter.auth.signIn({
      attempt_temp_user_creation: opts.attempt_temp_user_creation ?? true,
      request_auth: opts.request_auth ?? false,
    });
    const user = await getCurrentUser();
    setActiveUser(user);
    return user;
  } catch (e) {
    console.error("[panga/auth] signIn failed:", e);
    return null;
  }
}

/**
 * Sign the current user out of Puter and reset the local "active user" cache.
 * @returns {Promise<void>}
 */
export async function signOut() {
  if (hasPuter()) {
    try {
      await puter.auth.signOut();
    } catch (e) {
      console.warn("[panga/auth] signOut failed:", e);
    }
  }
  setActiveUser(null);
  localStorage.removeItem(AUTH_STATE_KEY);
}

function setActiveUser(user) {
  currentUser = user ?? null;
  if (user) {
    try {
      localStorage.setItem(AUTH_STATE_KEY, user.id ?? "user");
    } catch {}
  } else {
    try {
      localStorage.removeItem(AUTH_STATE_KEY);
    } catch {}
  }
  notifyAuth(user);
}

export function getCachedUser() {
  return currentUser;
}

export function isAuthReady() {
  return authReady;
}

/** Notify all subscribers of a (possible) user change. */
function notifyAuth(user) {
  for (const l of authListeners) {
    try {
      l(user);
    } catch (e) {
      console.warn("[panga/auth] listener error:", e);
    }
  }
}

/**
 * Subscribe to auth changes. Fires immediately with the current user (may be
 * null) so callers can render synchronously.
 * @param {(user: object|null) => void} cb
 */
export function onAuthStateChanged(cb) {
  authListeners.push(cb);
  cb(currentUser);
  return () => {
    const i = authListeners.indexOf(cb);
    if (i >= 0) authListeners.splice(i, 1);
  };
}

/**
 * Probe the current session without a UI prompt. On a website this is a no-op
 * until Puter has a token; on Puter hosting it resolves the user straight away.
 * Fires the `panga:auth-ready` event when the probe completes.
 * @returns {Promise<object|null>}
 */
export async function probeAuth() {
  authReady = false;
  if (!hasPuter()) {
    authReady = true;
    window.dispatchEvent(new CustomEvent("panga:auth-ready", { detail: { user: null, cloud: false } }));
    return null;
  }

  // If not signed in we stay in local-first mode and let the user sign in later.
  if (!isSignedIn()) {
    authReady = true;
    window.dispatchEvent(new CustomEvent("panga:auth-ready", { detail: { user: null, cloud: false } }));
    return null;
  }

  const user = await getCurrentUser();
  setActiveUser(user);
  authReady = true;
  window.dispatchEvent(new CustomEvent("panga:auth-ready", { detail: { user, cloud: true } }));
  return user;
}
