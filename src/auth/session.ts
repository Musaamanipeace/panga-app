// src/auth/session.ts
// Manages the user session with cloud backend authentication and offline fallback.

const SESSION_EMAIL_KEY = "panga_session_email";
const SESSION_USER_ID_KEY = "panga_session_user_id";
const USERS_STORE_KEY = "panga_users_registry";

export interface AuthResult {
  error?: string;
  successMessage?: string;
  user?: { id: string; email: string };
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
  return !!getSessionEmail() && !!getSessionUserId();
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

  // Try backend cloud authentication first
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, password }),
    });
    const data = await res.json();
    if (res.ok && data.user) {
      setSession(data.user.email, data.user.id);
      return { user: data.user };
    } else if (res.status === 401 || res.status === 400) {
      return { error: data.error || "Invalid email or password." };
    }
  } catch (netErr) {
    console.warn("Backend login network error, falling back to local session:", netErr);
  }

  // Offline fallback
  try {
    const raw = localStorage.getItem(USERS_STORE_KEY);
    const users: Record<string, { id: string; passwordHash?: string }> = raw ? JSON.parse(raw) : {};

    if (users[cleanEmail]) {
      const user = users[cleanEmail];
      if (user.passwordHash && user.passwordHash !== password) {
        return { error: "Invalid password for this account." };
      }
      setSession(cleanEmail, user.id);
      return { user: { id: user.id, email: cleanEmail } };
    }

    const id = generateUserId(cleanEmail);
    users[cleanEmail] = { id, passwordHash: password };
    localStorage.setItem(USERS_STORE_KEY, JSON.stringify(users));
    setSession(cleanEmail, id);
    return { user: { id, email: cleanEmail } };
  } catch (err: any) {
    return { error: err?.message || "Failed to sign in." };
  }
}

/**
 * Restore a session from a snapshot import.
 * Creates/looks up a user ID for the email and sets the session
 * without password verification. Used when importing a snapshot
 * via the Quick Upload dropzone.
 */
export async function restoreSessionFromSnapshot(email: string): Promise<AuthResult> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return { error: "Email is required." };

  try {
    const raw = localStorage.getItem(USERS_STORE_KEY);
    const users: Record<string, { id: string; passwordHash?: string }> = raw ? JSON.parse(raw) : {};

    let id = users[cleanEmail]?.id;
    if (!id) {
      id = generateUserId(cleanEmail);
      users[cleanEmail] = { id, passwordHash: "" }; // no password for snapshot restore
      localStorage.setItem(USERS_STORE_KEY, JSON.stringify(users));
    }
    setSession(cleanEmail, id);
    return { user: { id, email: cleanEmail } };
  } catch (err: any) {
    return { error: err?.message || "Failed to restore session." };
  }
}

export async function signUp(email: string, password: string): Promise<AuthResult> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return { error: "Email is required." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  // Try backend cloud registration first
  try {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, password }),
    });
    const data = await res.json();
    if (res.ok && data.user) {
      setSession(data.user.email, data.user.id);
      return {
        user: data.user,
        successMessage: "Account created and connected to cloud!",
      };
    } else if (res.status === 400) {
      return { error: data.error || "Registration failed." };
    }
  } catch (netErr) {
    console.warn("Backend signup network error, falling back to local:", netErr);
  }

  // Offline fallback
  try {
    const raw = localStorage.getItem(USERS_STORE_KEY);
    const users: Record<string, { id: string; passwordHash?: string }> = raw ? JSON.parse(raw) : {};

    const id = users[cleanEmail]?.id || generateUserId(cleanEmail);
    users[cleanEmail] = { id, passwordHash: password };
    localStorage.setItem(USERS_STORE_KEY, JSON.stringify(users));
    setSession(cleanEmail, id);
    return {
      user: { id, email: cleanEmail },
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
