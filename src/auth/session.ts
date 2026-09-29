// src/auth/session.ts
// Manages the user session and local accounts.

const SESSION_EMAIL_KEY = "panga_session_email";
const SESSION_USER_ID_KEY = "panga_session_user_id";
const USERS_STORE_KEY = "panga_users_registry";

export interface AuthResult {
  error?: string;
  successMessage?: string;
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
  return !!getSessionEmail();
}

export function setSession(email: string, userId: string): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  localStorage.setItem(SESSION_EMAIL_KEY, email);
  localStorage.setItem(SESSION_USER_ID_KEY, userId);
}

export function clearSession(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  localStorage.removeItem(SESSION_EMAIL_KEY);
  localStorage.removeItem(SESSION_USER_ID_KEY);
}

function generateUserId(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = (hash << 5) - hash + email.charCodeAt(i);
    hash |= 0;
  }
  return "usr_" + Math.abs(hash).toString(36) + "_" + Date.now().toString(36);
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return { error: "Email is required." };
  if (!password) return { error: "Password is required." };

  try {
    const raw = localStorage.getItem(USERS_STORE_KEY);
    const users: Record<string, { id: string; passwordHash?: string }> = raw ? JSON.parse(raw) : {};

    if (users[cleanEmail]) {
      const user = users[cleanEmail];
      if (user.passwordHash && user.passwordHash !== password) {
        return { error: "Invalid password for this account." };
      }
      setSession(cleanEmail, user.id);
      return {};
    }

    const id = generateUserId(cleanEmail);
    users[cleanEmail] = { id, passwordHash: password };
    localStorage.setItem(USERS_STORE_KEY, JSON.stringify(users));
    setSession(cleanEmail, id);
    return {};
  } catch (err: any) {
    return { error: err?.message || "Failed to sign in." };
  }
}

export async function signUp(email: string, password: string): Promise<AuthResult> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return { error: "Email is required." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  try {
    const raw = localStorage.getItem(USERS_STORE_KEY);
    const users: Record<string, { id: string; passwordHash?: string }> = raw ? JSON.parse(raw) : {};

    const id = users[cleanEmail]?.id || generateUserId(cleanEmail);
    users[cleanEmail] = { id, passwordHash: password };
    localStorage.setItem(USERS_STORE_KEY, JSON.stringify(users));
    setSession(cleanEmail, id);
    return {
      successMessage: `Account created successfully!`,
    };
  } catch (err: any) {
    return { error: err?.message || "Failed to create account." };
  }
}

export async function signOut(): Promise<void> {
  clearSession();
  window.location.assign("/");
}

export async function restoreSession(): Promise<void> {
  // Session is maintained in localStorage
}
