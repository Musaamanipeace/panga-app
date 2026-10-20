// src/auth/session.ts
// Manages the user session with cloud backend authentication and offline fallback.

const SESSION_EMAIL_KEY = "panga_session_email";
const SESSION_USER_ID_KEY = "panga_session_user_id";
const SESSION_TOKEN_KEY = "panga_session_token";
const USERS_STORE_KEY = "panga_users_registry";

async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const derived = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: enc.encode(salt), iterations: 100000, hash: "SHA-256" }, key, 512);
  const bytes = new Uint8Array(derived);
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const salt = storedHash.slice(0, 32);
  const expected = storedHash.slice(32);
  const calculated = await hashPassword(password, salt);
  return calculated === expected;
}

async function generateUserEntry(password: string): Promise<{ id: string; passwordHash: string }> {
  const salt = Math.random().toString(36).slice(2, 34);
  const hash = await hashPassword(password, salt);
  return { id: "", passwordHash: salt + hash };
}

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

/** Guest / unlogged mode: app usable offline with local IndexedDB only. */
export function isGuest(): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;
  return localStorage.getItem("panga_guest") === "1";
}

export function setGuestMode(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  localStorage.setItem("panga_guest", "1");
  // Ensure a stable local user id for data ownership without email
  if (!getSessionUserId()) {
    const id = "guest_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
    localStorage.setItem(SESSION_USER_ID_KEY, id);
    localStorage.setItem(SESSION_EMAIL_KEY, "guest@local");
  }
}

/** Resets any existing session and creates a fresh guest session ID for starting afresh. */
export function resetGuestSession(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  localStorage.removeItem(SESSION_EMAIL_KEY);
  localStorage.removeItem(SESSION_USER_ID_KEY);
  localStorage.setItem("panga_guest", "1");
  const id = "guest_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  localStorage.setItem(SESSION_USER_ID_KEY, id);
  localStorage.setItem(SESSION_EMAIL_KEY, "guest@local");
}


export function clearGuestMode(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  localStorage.removeItem("panga_guest");
}

/** True if the user can use the app (logged in or guest). */
export function canUseApp(): boolean {
  return isLoggedIn() || isGuest();
}

export function setSession(email: string, userId: string, token?: string): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  localStorage.setItem(SESSION_EMAIL_KEY, email);
  localStorage.setItem(SESSION_USER_ID_KEY, userId);
  if (token) {
    localStorage.setItem(SESSION_TOKEN_KEY, token);
  }
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
       setSession(data.user.email, data.user.id, data.token);
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
       if (user.passwordHash) {
         const valid = await verifyPassword(password, user.passwordHash);
         if (!valid) {
           return { error: "Invalid password for this account." };
         }
       }
       setSession(cleanEmail, user.id);
       return { user: { id: user.id, email: cleanEmail } };
     }

     const id = generateUserId(cleanEmail);
     const entry = await generateUserEntry(password);
     users[cleanEmail] = { id, passwordHash: entry.passwordHash };
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
       setSession(data.user.email, data.user.id, data.token);
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
     const entry = await generateUserEntry(password);
     users[cleanEmail] = { id, passwordHash: entry.passwordHash };
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
  clearGuestMode();
  window.location.assign("/");
}

export async function restoreSession(): Promise<void> {
  // Session is maintained in localStorage
}
