// src/auth/session.ts
// Manages the local session and JSON account identity.
// Each workspace identity gets its own IndexedDB database.

import { switchUserAccount } from "../data/db";
import { SESSION_USER_ID_KEY, getSessionUserId } from "./sessionUserId";

export { SESSION_USER_ID_KEY, getSessionUserId };

const SESSION_EMAIL_KEY = "panga_session_email";
const SESSION_USERNAME_KEY = "panga_session_username";
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

export function getSessionUsername(): string {
  if (typeof window === "undefined" || !window.localStorage) return "";
  return localStorage.getItem(SESSION_USERNAME_KEY) ?? "";
}

export function setSessionUsername(username: string): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  const clean = username.trim();
  if (clean) localStorage.setItem(SESSION_USERNAME_KEY, clean);
  else localStorage.removeItem(SESSION_USERNAME_KEY);
}

export function isLoggedIn(): boolean {
  return !!getSessionUserId() && !isGuest();
}

/** Local / guest mode: app usable offline with local IndexedDB only. */
export function isGuest(): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;
  return localStorage.getItem(GUEST_KEY) === "1";
}

function newGuestId(): string {
  return "guest_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
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
  localStorage.setItem(GUEST_KEY, "1");
  localStorage.setItem(SESSION_USER_ID_KEY, newGuestId());
  localStorage.setItem(SESSION_EMAIL_KEY, "guest@local");
  await switchUserAccount();
}

export function clearGuestMode(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  localStorage.removeItem(GUEST_KEY);
}

/** True if the user can use the app (has an active local session). */
export function canUseApp(): boolean {
  return isLoggedIn() || isGuest();
}

/** Adopt a local identity and point IndexedDB at that user's isolated store. */
export async function setSession(userId: string, email: string, username?: string): Promise<void> {
  if (typeof window === "undefined" || !window.localStorage) return;
  clearGuestMode();
  localStorage.setItem(SESSION_EMAIL_KEY, email);
  localStorage.setItem(SESSION_USER_ID_KEY, userId);
  if (username !== undefined) setSessionUsername(username);
  await switchUserAccount();
}

export function clearSession(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  localStorage.removeItem(SESSION_EMAIL_KEY);
  localStorage.removeItem(SESSION_USER_ID_KEY);
  localStorage.removeItem(SESSION_USERNAME_KEY);
}

/** Exit back to the landing page while preserving the local database for "Continue local". */
export function exitToLanding(): void {
  clearGuestMode();
  if (typeof window !== "undefined" && window.localStorage) {
    // If the user previously had a non-guest session id, keep it as guest-paused
    // or clear active status so RequireAuth routes back to /.
    localStorage.setItem(GUEST_KEY, "0");
  }
}

/** On app start, make sure the DB matches the persisted session without forcing entry. */
export async function restoreSession(): Promise<void> {
  if (getSessionUserId()) {
    await switchUserAccount();
  }
}
