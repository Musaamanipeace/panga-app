// src/auth/session.ts
// Manages the user session (stored in localStorage for quick access).
// The actual auth state is managed by Supabase Auth (persistSession: true).
// We mirror the essential fields here for synchronous checks throughout the app.

const SESSION_EMAIL_KEY = "panga_session_email";
const SESSION_USER_ID_KEY = "panga_session_user_id";

export function getSessionEmail(): string | null {
  return localStorage.getItem(SESSION_EMAIL_KEY);
}

export function getSessionUserId(): string | null {
  return localStorage.getItem(SESSION_USER_ID_KEY);
}

export function isLoggedIn(): boolean {
  return !!getSessionEmail();
}

export function setSession(email: string, userId: string): void {
  localStorage.setItem(SESSION_EMAIL_KEY, email);
  localStorage.setItem(SESSION_USER_ID_KEY, userId);
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_EMAIL_KEY);
  localStorage.removeItem(SESSION_USER_ID_KEY);
}
