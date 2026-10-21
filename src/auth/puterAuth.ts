// src/auth/puterAuth.ts
// Thin wrapper around the Puter.js SDK (global `puter` object).
// Loaded via <script src="https://js.puter.com/v2/"> in index.html.

const PUTER_USER_KEY = "panga_puter_user";

// ---------------------------------------------------------------------------
// SDK detection
// ---------------------------------------------------------------------------

/** True only when the Puter.js script has finished loading and `window.puter` exists. */
export function isPuterAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.puter !== "undefined" && window.puter != null;
}

/**
 * Wait for the Puter.js SDK to finish loading. Polls `window.puter` every 100ms.
 * Resolves true if the SDK becomes available within `timeoutMs`, false otherwise.
 */
export async function waitForPuter(timeoutMs: number = 3000): Promise<boolean> {
  if (isPuterAvailable()) return true;
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (isPuterAvailable()) return true;
    await new Promise((r) => setTimeout(r, 100));
  }
  return isPuterAvailable();
}

/**
 * Is the user currently signed in to Puter *right now*?
 *
 * `puter.auth.isSignedIn()` is a cheap, synchronous check — it does NOT
 * open a popup. We use it to avoid ever calling `puter.kv.*` when there is
 * no authenticated user, which would otherwise trigger an auto sign-in popup.
 */
export function isPuterSignedIn(): boolean {
  if (!isPuterAvailable()) return false;
  try {
    return typeof window.puter.auth.isSignedIn === "function"
      ? !!window.puter.auth.isSignedIn()
      : false;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// User info (cached in localStorage so the UI can show sign-in state instantly)
// ---------------------------------------------------------------------------

export interface PuterUserInfo {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar: string | null;
}

function cachePuterUser(user: PuterUserInfo | null) {
  try {
    if (user) localStorage.setItem(PUTER_USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(PUTER_USER_KEY);
  } catch {}
}

export function getCachedPuterUser(): PuterUserInfo | null {
  try {
    const raw = localStorage.getItem(PUTER_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PuterUserInfo;
  } catch {
    return null;
  }
}

/**
 * Fetch the *current* Puter user. Rejects if the SDK is not loaded or the
 * user is not signed in.
 */
export async function fetchPuterUser(): Promise<PuterUserInfo | null> {
  if (!isPuterAvailable()) return null;
  try {
    const user = await window.puter.auth.getUser();
    if (!user) return null;
    return {
      id: user.id,
      username: user.username || user.name || "user",
      name: user.name || user.username || "User",
      email: user.email || "",
      avatar: user.avatar || null,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Sign-in / sign-out
// ---------------------------------------------------------------------------

/**
 * Open the Puter sign-in popup and return the signed-in user, or null if
 * the user dismissed the popup.
 *
 * We pass `request_auth: false` so a *temp* (anonymous) user is not created
 * silently — the user must actively choose an account.
 */
export async function signInWithPuter(): Promise<PuterUserInfo | null> {
  if (!isPuterAvailable()) {
    throw new Error("Puter SDK not loaded. Check your internet connection.");
  }

  try {
    const user = await window.puter.auth.signIn({
      attempt_temp_user_creation: false,
      request_auth: false,
    });
    if (!user) return null;

    const info: PuterUserInfo = {
      id: user.id,
      username: user.username || user.name || "user",
      name: user.name || user.username || "User",
      email: user.email || "",
      avatar: user.avatar || null,
    };
    cachePuterUser(info);
    return info;
  } catch (err: any) {
    // User closed the popup → null. Anything else → re-throw.
    if (err?.message?.includes("cancelled") || err?.message?.includes("closed")) return null;
    throw err;
  }
}

/** Sign out of Puter. The user's cloud data is NOT deleted. */
export async function signOutOfPuter(): Promise<void> {
  cachePuterUser(null);
  if (isPuterAvailable()) {
    try {
      await window.puter.auth.signOut();
    } catch {
      /* already signed out */
    }
  }
}

// ---------------------------------------------------------------------------
// Puter KV wrapper (with a hard timeout so a stalled call never blocks the UI)
// ---------------------------------------------------------------------------

const KV_TIMEOUT_MS = 6_000;

function withTimeout<T>(p: Promise<T>): Promise<T | undefined> {
  let t: ReturnType<typeof setTimeout>;
  const timeout = new Promise<T | undefined>((resolve) => {
    t = setTimeout(() => resolve(undefined), KV_TIMEOUT_MS);
  });
  return Promise.race([
    p.then((v) => {
      clearTimeout(t);
      return v;
    }),
    timeout,
  ]);
}

export const KV_KEY = "panga:v1";

/** Read the full app snapshot from Puter KV. Returns null on miss/timeout/error. */
export async function puterKVGet(): Promise<unknown | null> {
  if (!isPuterSignedIn()) return null;
  try {
    return await withTimeout(window.puter.kv.get(KV_KEY));
  } catch {
    return null;
  }
}

/** Write the full app snapshot to Puter KV. Returns false on error/timeout. */
export async function puterKVSet(data: unknown): Promise<boolean> {
  if (!isPuterSignedIn()) return false;
  try {
    const result = await withTimeout(window.puter.kv.set(KV_KEY, data));
    return result !== undefined;
  } catch {
    return false;
  }
}

/** Delete the app snapshot from Puter KV. */
export async function puterKVDelete(): Promise<boolean> {
  if (!isPuterSignedIn()) return true;
  try {
    const result = await withTimeout(window.puter.kv.del(KV_KEY));
    return result !== undefined;
  } catch {
    return false;
  }
}
