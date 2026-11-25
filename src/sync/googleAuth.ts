// src/sync/googleAuth.ts
// Client-side Google sign-in using Google Identity Services (GIS) - no Firebase, no backend.
// GIS hands the browser a short-lived OAuth access token scoped to drive.file, which is then
// used to call the Drive REST API directly. Access tokens are kept strictly in memory.
// Only the (non-secret) account hint - uid, email, display name - is remembered in localStorage
// so the UI can show "reconnect" after a reload instead of looking signed out.

export const SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/drive.file",
];

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const GIS_SCRIPT_URL = "https://accounts.google.com/gsi/client";
const USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
const ACCOUNT_HINT_KEY = "panga_google_account";
// Refresh a little before Google's real expiry so we never send a token that dies mid-request.
const EXPIRY_SAFETY_MS = 60 * 1000;

export interface GoogleAuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface GoogleAuthState {
  ready: boolean;
  user: GoogleAuthUser | null;
  hasAccessToken: boolean;
  needsAuth: boolean;
  signingIn: boolean;
  error: string | null;
}

type Listener = (state: GoogleAuthState) => void;

// ---- Minimal typings for the parts of Google Identity Services we use ----
interface GisTokenResponse {
  access_token?: string;
  expires_in?: number | string;
  scope?: string;
  error?: string;
  error_description?: string;
}
interface GisErrorResponse {
  type?: string;
  message?: string;
}
interface GisTokenClient {
  requestAccessToken(overrides?: { prompt?: string; hint?: string }): void;
}
interface GisOAuth2 {
  initTokenClient(config: {
    client_id: string;
    scope: string;
    callback: (response: GisTokenResponse) => void;
    error_callback?: (error: GisErrorResponse) => void;
  }): GisTokenClient;
  hasGrantedAllScopes?(response: GisTokenResponse, ...scopes: string[]): boolean;
}
declare global {
  interface Window {
    google?: { accounts?: { oauth2?: GisOAuth2 } };
  }
}

// ---- State ----
let cachedAccessToken: string | null = null;
let cachedTokenExpiresAt = 0;
let authInitialized = false;
let gisLoadPromise: Promise<GisOAuth2> | null = null;
let signInInFlight: Promise<{ user: GoogleAuthUser; accessToken: string }> | null = null;

let currentState: GoogleAuthState = {
  ready: false,
  user: null,
  hasAccessToken: false,
  needsAuth: false,
  signingIn: false,
  error: null,
};

const listeners = new Set<Listener>();

function emit(patch?: Partial<GoogleAuthState>): void {
  if (patch) {
    currentState = { ...currentState, ...patch };
  }
  for (const listener of listeners) {
    listener(currentState);
  }
}

function getClientId(): string {
  const id = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  return typeof id === "string" ? id.trim() : "";
}

function hasLiveToken(): boolean {
  return Boolean(cachedAccessToken && Date.now() < cachedTokenExpiresAt);
}

function clearToken(): void {
  cachedAccessToken = null;
  cachedTokenExpiresAt = 0;
}

// ---- Remembered account (not a secret; no tokens) ----
function readAccountHint(): GoogleAuthUser | null {
  try {
    const raw = window.localStorage.getItem(ACCOUNT_HINT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GoogleAuthUser>;
    if (!parsed || typeof parsed.uid !== "string") return null;
    return {
      uid: parsed.uid,
      email: typeof parsed.email === "string" ? parsed.email : null,
      displayName: typeof parsed.displayName === "string" ? parsed.displayName : null,
    };
  } catch {
    return null;
  }
}

function writeAccountHint(user: GoogleAuthUser | null): void {
  try {
    if (user) {
      window.localStorage.setItem(ACCOUNT_HINT_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(ACCOUNT_HINT_KEY);
    }
  } catch {
    // Storage may be unavailable (private mode); sign-in still works for this session.
  }
}

// ---- Google Identity Services script loader ----
function loadGis(): Promise<GisOAuth2> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google sign-in is only available in the browser."));
  }
  const ready = window.google?.accounts?.oauth2;
  if (ready) return Promise.resolve(ready);
  if (gisLoadPromise) return gisLoadPromise;

  gisLoadPromise = new Promise<GisOAuth2>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GIS_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const oauth2 = window.google?.accounts?.oauth2;
      if (oauth2) {
        resolve(oauth2);
      } else {
        gisLoadPromise = null;
        reject(new Error("Google sign-in loaded but is unavailable."));
      }
    };
    script.onerror = () => {
      gisLoadPromise = null;
      script.remove();
      reject(new Error("Could not load Google sign-in. Check your connection and try again."));
    };
    document.head.appendChild(script);
  });
  return gisLoadPromise;
}

function friendlyGisError(error: GisErrorResponse): string {
  switch (error.type) {
    case "popup_closed":
      return "Google sign-in popup was closed before completing.";
    case "popup_failed_to_open":
      return "Popup was blocked by your browser. Allow popups for this site and try again.";
    default:
      return error.message || "Google sign-in failed.";
  }
}

function friendlyTokenError(response: GisTokenResponse): string {
  if (response.error === "access_denied") {
    return "Google access was denied. Panga needs permission to save its own backup file in your Drive.";
  }
  return response.error_description || response.error || "Google sign-in failed.";
}

function requestToken(oauth2: GisOAuth2, opts: { prompt: string; hint?: string }): Promise<GisTokenResponse> {
  return new Promise<GisTokenResponse>((resolve, reject) => {
    const client = oauth2.initTokenClient({
      client_id: getClientId(),
      scope: SCOPES.join(" "),
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(friendlyTokenError(response)));
          return;
        }
        if (oauth2.hasGrantedAllScopes && !oauth2.hasGrantedAllScopes(response, DRIVE_SCOPE)) {
          reject(new Error("Google Drive permission was not granted. Tick the Drive checkbox and try again."));
          return;
        }
        resolve(response);
      },
      error_callback: (error) => reject(new Error(friendlyGisError(error))),
    });
    client.requestAccessToken({ prompt: opts.prompt, ...(opts.hint ? { hint: opts.hint } : {}) });
  });
}

async function fetchUserProfile(accessToken: string): Promise<GoogleAuthUser> {
  const res = await fetch(USERINFO_URL, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) {
    throw new Error(`Could not read your Google profile (${res.status}).`);
  }
  const info = (await res.json()) as { sub?: string; email?: string; name?: string };
  if (!info.sub) {
    throw new Error("Signed in, but the Google profile is unavailable.");
  }
  return {
    uid: info.sub,
    email: info.email ?? null,
    displayName: info.name ?? null,
  };
}

// ---- Public API (unchanged shape so the UI and sync hook keep working) ----
export function getGoogleAuthState(): GoogleAuthState {
  return currentState;
}

export function subscribeGoogleAuth(listener: Listener): () => void {
  listeners.add(listener);
  listener(currentState);
  return () => {
    listeners.delete(listener);
  };
}

export function initGoogleAuth(): () => void {
  if (typeof window === "undefined") return () => {};
  if (authInitialized) return () => {};
  authInitialized = true;

  const remembered = readAccountHint();
  emit({
    ready: true,
    user: remembered,
    hasAccessToken: false,
    // A remembered account has no token after a reload: the UI shows "Reconnect".
    needsAuth: Boolean(remembered),
    error: null,
  });

  // Preload the GIS script now so the later click handler can open the popup synchronously
  // (browsers block popups that are opened after an await).
  if (getClientId()) {
    void loadGis().catch(() => {});
  }

  return () => {
    authInitialized = false;
  };
}

export function googleSignIn(): Promise<{ user: GoogleAuthUser; accessToken: string }> {
  if (signInInFlight) return signInInFlight;

  const run = async (): Promise<{ user: GoogleAuthUser; accessToken: string }> => {
    if (!getClientId()) {
      throw new Error("Google sign-in is not configured. Set VITE_GOOGLE_CLIENT_ID (see SETUP.md).");
    }
    const oauth2 = await loadGis();
    const remembered = currentState.user ?? readAccountHint();
    const response = await requestToken(oauth2, {
      prompt: remembered ? "" : "select_account",
      hint: remembered?.email ?? undefined,
    });

    const accessToken = response.access_token as string;
    const lifetimeMs = (Number(response.expires_in) || 3600) * 1000;
    cachedAccessToken = accessToken;
    cachedTokenExpiresAt = Date.now() + lifetimeMs - EXPIRY_SAFETY_MS;

    const user = await fetchUserProfile(accessToken);
    writeAccountHint(user);
    emit({
      ready: true,
      user,
      hasAccessToken: true,
      needsAuth: false,
      signingIn: false,
      error: null,
    });
    return { user, accessToken };
  };

  emit({ signingIn: true, error: null });
  signInInFlight = run()
    .catch((err: unknown) => {
      const msg = err instanceof Error && err.message ? err.message : "Google sign-in failed.";
      clearToken();
      emit({
        signingIn: false,
        hasAccessToken: false,
        needsAuth: Boolean(currentState.user),
        error: msg,
      });
      throw new Error(msg);
    })
    .finally(() => {
      signInInFlight = null;
    });
  return signInInFlight;
}

export async function getDriveAccessToken(): Promise<string | null> {
  if (hasLiveToken()) return cachedAccessToken;
  clearToken();
  if (currentState.user && (!currentState.needsAuth || currentState.hasAccessToken)) {
    emit({ hasAccessToken: false, needsAuth: true });
  }
  return null;
}

export function invalidateDriveAccessToken(): void {
  clearToken();
  emit({
    hasAccessToken: false,
    needsAuth: Boolean(currentState.user),
  });
}

export async function googleSignOut(): Promise<void> {
  clearToken();
  writeAccountHint(null);
  emit({
    ready: true,
    user: null,
    hasAccessToken: false,
    needsAuth: false,
    signingIn: false,
    error: null,
  });
}
