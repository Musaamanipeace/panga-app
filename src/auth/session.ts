// src/auth/session.ts
// Manages the user session — local-first offline with guest mode only.
// No email/password authentication: data stays on the user's device.

import { switchUserAccount } from "../data/db";

const SESSION_EMAIL_KEY = "panga_session_email";
const SESSION_USER_ID_KEY = "panga_session_user_id";
const SESSION_TOKEN_KEY = "panga_session_token";

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
  return !!getSessionUserId();
}

/** Guest / unlogged mode: app usable offline with local IndexedDB only. */
export function isGuest(): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;
  return localStorage.getItem("panga_guest") === "1";
}

export function setGuestMode(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  localStorage.setItem("panga_guest", "1");
  if (!getSessionUserId()) {
    const id = "guest_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
    localStorage.setItem(SESSION_USER_ID_KEY, id);
    localStorage.setItem(SESSION_EMAIL_KEY, "guest@local");
    void switchUserAccount();
  }
}

/** Resets any existing session and creates a fresh guest session ID for starting afresh. */
export function resetGuestSession(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  localStorage.removeItem(SESSION_EMAIL_KEY);
  localStorage.removeItem(SESSION_USER_ID_KEY);
  localStorage.removeItem(SESSION_TOKEN_KEY);
  localStorage.setItem("panga_guest", "1");
  const id = "guest_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  localStorage.setItem(SESSION_USER_ID_KEY, id);
  localStorage.setItem(SESSION_EMAIL_KEY, "guest@local");
  void switchUserAccount();
}

export function clearGuestMode(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  localStorage.removeItem("panga_guest");
}

/** True if the user can use the app (has a session or is a guest). */
export function canUseApp(): boolean {
  return isLoggedIn() || isGuest();
}

export function setSession(userId: string, email: string): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  localStorage.setItem(SESSION_EMAIL_KEY, email);
  localStorage.setItem(SESSION_USER_ID_KEY, userId);
  // Switch IndexedDB to this user's isolated database
  void switchUserAccount();
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

function generateUserId(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return "usr_" + Math.abs(hash).toString(36) + "_" + Date.now().toString(36);
}

/**
 * Restore a session from a snapshot import.
 * Creates/looks up a user ID for the email and sets the session
 * without password verification. Used when importing a snapshot
 * via the Quick Upload dropzone.
 */
export async function restoreSessionFromSnapshot(email: string): Promise<{ error?: string; user?: { id: string; email: string } }> {
  const cleanEmail = (email || "imported@local").trim().toLowerCase();

  try {
    const id = generateUserId(cleanEmail);
    setSession(id, cleanEmail);
    return { user: { id, email: cleanEmail } };
  } catch (err: any) {
    return { error: err?.message || "Failed to restore session." };
  }
}

/**
 * Exit the current session and return to the landing page.
 * Clears session, guest mode, and Google Drive token from localStorage.
 */
export async function logout(): Promise<void> {
  const userId = getSessionUserId();
  clearSession();
  clearGuestMode();
  // Clear this user's Google Drive token from localStorage
  if (userId) {
    try {
      localStorage.removeItem(`panga_google_drive_token_${userId}`);
    } catch {}
  }
  void switchUserAccount();
  window.location.assign("/");
}

export async function restoreSession(): Promise<void> {
  // If a session exists in localStorage, ensure the DB points to the right user database
  if (getSessionUserId()) {
    void switchUserAccount();
  }
}
