// src/sync/googleAuth.ts
// Client-side Firebase Authentication with GoogleAuthProvider for Google Drive sync.
// Access tokens are kept strictly in memory and cleared on sign-out or expiry.

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  type Auth,
  type User,
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

export const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

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

const TOKEN_LIFETIME_MS = 55 * 60 * 1000;

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

// Strictly in-memory token cache (never persisted to localStorage/sessionStorage).
let cachedAccessToken: string | null = null;
let cachedTokenExpiresAt = 0;
let isSigningIn = false;
let authInitialized = false;
let authUnsubscribe: (() => void) | null = null;

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

function toAuthUser(user: User | null): GoogleAuthUser | null {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email ?? null,
    displayName: user.displayName ?? null,
  };
}

function hasLiveToken(): boolean {
  return Boolean(cachedAccessToken && Date.now() < cachedTokenExpiresAt);
}

function getFirebaseAuth(): Auth {
  if (!firebaseApp) {
    firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  if (!firebaseAuth) {
    firebaseAuth = getAuth(firebaseApp);
  }
  if (!googleProvider) {
    googleProvider = new GoogleAuthProvider();
    for (const scope of SCOPES) {
      googleProvider.addScope(scope);
    }
    googleProvider.setCustomParameters({ prompt: "select_account" });
  }
  return firebaseAuth;
}

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
  if (authInitialized) {
    return () => {};
  }
  authInitialized = true;

  try {
    const auth = getFirebaseAuth();
    authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const live = hasLiveToken();
        if (!live && !isSigningIn) {
          cachedAccessToken = null;
          cachedTokenExpiresAt = 0;
        }
        emit({
          ready: true,
          user: toAuthUser(user),
          hasAccessToken: live,
          needsAuth: !live,
          error: null,
        });
      } else {
        cachedAccessToken = null;
        cachedTokenExpiresAt = 0;
        emit({
          ready: true,
          user: null,
          hasAccessToken: false,
          needsAuth: false,
          error: null,
        });
      }
    });
  } catch (err: unknown) {
    emit({
      ready: true,
      user: null,
      hasAccessToken: false,
      needsAuth: false,
      error: err instanceof Error ? err.message : "Could not initialize Google sign-in.",
    });
  }

  return () => {
    authUnsubscribe?.();
    authUnsubscribe = null;
    authInitialized = false;
  };
}

function friendlyAuthError(err: unknown): string {
  const code = typeof err === "object" && err !== null && "code" in err ? String((err as { code: unknown }).code) : "";
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
    return "Google sign-in popup was closed before completing.";
  }
  if (code === "auth/popup-blocked") {
    return "Popup was blocked by your browser. Allow popups for this site and try again.";
  }
  if (code === "auth/network-request-failed") {
    return "Network error while contacting Google. Check your connection and try again.";
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return "Google sign-in failed.";
}

export async function googleSignIn(): Promise<{ user: GoogleAuthUser; accessToken: string }> {
  const auth = getFirebaseAuth();
  if (!googleProvider) {
    throw new Error("Google auth provider is not initialized.");
  }

  isSigningIn = true;
  emit({ signingIn: true, error: null });

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Google sign-in succeeded, but no Google Drive access token was granted.");
    }
    cachedAccessToken = credential.accessToken;
    cachedTokenExpiresAt = Date.now() + TOKEN_LIFETIME_MS;
    const authUser = toAuthUser(result.user);
    if (!authUser) {
      throw new Error("Signed in, but user profile is unavailable.");
    }
    emit({
      ready: true,
      user: authUser,
      hasAccessToken: true,
      needsAuth: false,
      signingIn: false,
      error: null,
    });
    return { user: authUser, accessToken: cachedAccessToken };
  } catch (err: unknown) {
    const msg = friendlyAuthError(err);
    emit({
      signingIn: false,
      hasAccessToken: hasLiveToken(),
      needsAuth: Boolean(currentState.user && !hasLiveToken()),
      error: msg,
    });
    throw new Error(msg);
  } finally {
    isSigningIn = false;
  }
}

export async function getDriveAccessToken(): Promise<string | null> {
  if (hasLiveToken()) return cachedAccessToken;
  cachedAccessToken = null;
  cachedTokenExpiresAt = 0;
  if (currentState.user && (!currentState.needsAuth || currentState.hasAccessToken)) {
    emit({ hasAccessToken: false, needsAuth: true });
  }
  return null;
}

export function invalidateDriveAccessToken(): void {
  cachedAccessToken = null;
  cachedTokenExpiresAt = 0;
  emit({
    hasAccessToken: false,
    needsAuth: Boolean(currentState.user),
  });
}

export async function googleSignOut(): Promise<void> {
  cachedAccessToken = null;
  cachedTokenExpiresAt = 0;
  try {
    const auth = getFirebaseAuth();
    await signOut(auth);
  } finally {
    emit({
      ready: true,
      user: null,
      hasAccessToken: false,
      needsAuth: false,
      signingIn: false,
      error: null,
    });
  }
}
