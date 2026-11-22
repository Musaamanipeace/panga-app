// src/auth/session.ts
// Manages the local session. Every identity — guest or signed-in user — gets
// its own IndexedDB database, so switching session switches the data store.

import { switchUserAccount } from "../data/db";

const SESSION_EMAIL_KEY = "panga_session_email";
const SESSION_USER_ID_KEY = "panga_session_user_id";
const SESSION_TOKEN_KEY = "panga_session_token";
const GUEST_KEY = "panga_guest";

/** Prefixes a localStorage key with the current user ID so data doesn't bleed between accounts. */
export function getUserScopedKey(key: string): string {
  const userId = getSessionUserId();
  if (!userId) return `${key}_guest`;
  return `${key}_${userId}`;
}

export function getSessionEmail(): string | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  return localStorage.getItem(SESSION_EMAIL_KEY);
}

export function getSessionUserId(): string | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  return localStorage.getItem(SESSION_USER_ID_KEY);
}

export function isLoggedIn(): boolean {
  return !!getSessionUserId() && !isGuest();
}

/** Guest / unlogged mode: app usable offline with local IndexedDB only. */
export function isGuest(): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;
  return localStorage.getItem(GUEST_KEY) === "1";
}

function newGuestId(): string {
  return "guest_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

/** Removes supabase-js auth sessions so no previous user's session can be reused. */
export function clearSupabaseAuthStorage(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && /^sb-.*-auth-token$/.test(key)) keys.push(key);
    }
    keys.forEach((key) => localStorage.removeItem(key));
  } catch {
    /* storage unavailable */
  }
}

export async function setGuestMode(): Promise<void> {
  if (typeof window === "undefined" || !window.localStorage) return;
  localStorage.setItem(GUEST_KEY, "1");
  if (!getSessionUserId()) {
    localStorage.setItem(SESSION_USER_ID_KEY, newGuestId());
    localStorage.setItem(SESSION_EMAIL_KEY, "guest@local");
  }
  await switchUserAccount();
}

/** Resets any existing session and creates a fresh guest session ID for starting afresh. */
export async function resetGuestSession(): Promise<void> {
  if (typeof window === "undefined" || !window.localStorage) return;
  clearSession();
  clearSupabaseAuthStorage();
  localStorage.setItem(GUEST_KEY, "1");
  localStorage.setItem(SESSION_USER_ID_KEY, newGuestId());
  localStorage.setItem(SESSION_EMAIL_KEY, "guest@local");
  await switchUserAccount();
}

export function clearGuestMode(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  localStorage.removeItem(GUEST_KEY);
}

/** True if the user can use the app (has a session or is a guest). */
export function canUseApp(): boolean {
  return isLoggedIn() || isGuest();
}

/** Adopt a signed-in identity and point IndexedDB at that user's isolated store. */
export async function setSession(userId: string, email: string): Promise<void> {
  if (typeof window === "undefined" || !window.localStorage) return;
  clearGuestMode();
  localStorage.setItem(SESSION_EMAIL_KEY, email);
  localStorage.setItem(SESSION_USER_ID_KEY, userId);
  await switchUserAccount();
}

export function getSessionToken(): string | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  return localStorage.getItem(SESSION_TOKEN_KEY);
}

export function clearSession(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  localStorage.removeItem(SESSION_EMAIL_KEY);
  localStorage.removeItem(SESSION_USER_ID_KEY);
  localStorage.removeItem(SESSION_TOKEN_KEY);
}

/**
 * Exit the current session and start a brand-new, empty guest workspace.
 * The previous user's database is left on disk but is unreachable without
 * their session ID, and any Supabase auth session is removed.
 */
export async function logoutAndStartGuest(): Promise<void> {
  clearSession();
  clearSupabaseAuthStorage();
  localStorage.setItem(GUEST_KEY, "1");
  localStorage.setItem(SESSION_USER_ID_KEY, newGuestId());
  localStorage.setItem(SESSION_EMAIL_KEY, "guest@local");
  await switchUserAccount();
  window.location.assign("/");
}

/** On app start, make sure the DB matches the persisted session. */
export async function restoreSession(): Promise<void> {
  if (getSessionUserId()) await switchUserAccount();
  else await setGuestMode();
}
