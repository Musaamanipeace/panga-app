// src/auth/sessionUserId.ts
// Leaf module with zero imports so db.ts can read the active session ID at
// module evaluation time without creating a circular import with session.ts.

export const SESSION_USER_ID_KEY = "panga_session_user_id";

export function getSessionUserId(): string | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  return localStorage.getItem(SESSION_USER_ID_KEY);
}
