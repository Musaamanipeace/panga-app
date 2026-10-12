// src/sync/googleDriveSync.ts
// Client-side Google Drive AppData sync using Google Identity Services (GIS).
// Pure client-side OAuth 2.0 flow — no backend server or secrets needed.
// Targets the hidden appDataFolder to keep application state private.

import { getGoogleClientId, setGoogleClientId } from "../data/settings";
import { exportSnapshot, validateSnapshot, importSnapshot, type Snapshot } from "./snapshot";
import { syncAll } from "./sync";

export const DRIVE_APPDATA_SCOPE = "https://www.googleapis.com/auth/drive.appdata";
export const DRIVE_DATA_FILENAME = "data.json";

const TOKEN_STORAGE_KEY = "panga_google_drive_token";

export interface StoredToken {
  access_token: string;
  expires_at: number;
}

export interface DriveFileInfo {
  id: string;
  name: string;
  modifiedTime?: string;
  size?: string;
}

export interface DriveSyncResult {
  ok: boolean;
  message: string;
  fileId?: string;
  modifiedTime?: string;
  data?: Snapshot;
}

// Global script loader for GIS
function loadGisScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && (window as any).google?.accounts?.oauth2) {
      return resolve();
    }
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      const check = setInterval(() => {
        if ((window as any).google?.accounts?.oauth2) {
          clearInterval(check);
          resolve();
        }
      }, 50);
      setTimeout(() => {
        clearInterval(check);
        resolve();
      }, 3000);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Identity Services library."));
    document.head.appendChild(script);
  });
}

/** Retrieve current token from localStorage if valid */
export function getStoredToken(): StoredToken | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredToken;
    if (!parsed?.access_token || typeof parsed.expires_at !== "number") {
      return null;
    }
    // Token considered expired if less than 30s remaining
    if (parsed.expires_at <= Date.now() + 30_000) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Save token to client storage */
export function saveStoredToken(token: StoredToken): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(token));
}

/** Clear stored token */
export function clearStoredToken(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

/** Check if Google Drive is currently connected with a valid token */
export function isGoogleDriveConnected(): boolean {
  return getStoredToken() !== null;
}

/** Disconnect Google Drive */
export async function disconnectGoogleDrive(): Promise<void> {
  const token = getStoredToken();
  clearStoredToken();
  if (token?.access_token && (window as any).google?.accounts?.oauth2?.revoke) {
    try {
      (window as any).google.accounts.oauth2.revoke(token.access_token, () => {});
    } catch {}
  }
}

/**
 * Initiates the Google Identity Services popup login.
 * Captures and persists the short-lived access token.
 */
export async function connectGoogleDrive(customClientId?: string): Promise<StoredToken> {
  const clientId = (customClientId || await getGoogleClientId() || (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || "").trim();
  if (!clientId) {
    throw new Error("Please enter your Google OAuth 2.0 Web Client ID in Settings first.");
  }

  // Remember configured client ID
  await setGoogleClientId(clientId);

  await loadGisScript();
  const google = (window as any).google;
  if (!google?.accounts?.oauth2) {
    throw new Error("Google Identity Services library is unavailable.");
  }

  return new Promise((resolve, reject) => {
    let resolved = false;

    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_APPDATA_SCOPE,
      prompt: "consent",
      callback: (response: any) => {
        if (response.error) {
          resolved = true;
          return reject(new Error(response.error_description || response.error || "Google authorization failed"));
        }
        if (!response.access_token) {
          resolved = true;
          return reject(new Error("No access token returned from Google"));
        }

        const expiresIn = Number(response.expires_in) || 3600;
        const stored: StoredToken = {
          access_token: response.access_token,
          expires_at: Date.now() + expiresIn * 1000,
        };
        saveStoredToken(stored);
        resolved = true;
        resolve(stored);
      },
      error_callback: (err: any) => {
        if (!resolved) {
          resolved = true;
          reject(new Error(err?.message || "Google login popup closed or blocked"));
        }
      },
    });

    tokenClient.requestAccessToken({ prompt: "consent" });
  });
}

/**
 * Obtain an active Bearer token.
 * If expired, triggers interactive re-auth prompt.
 */
export async function requireDriveToken(interactive = true): Promise<string> {
  const existing = getStoredToken();
  if (existing?.access_token) {
    return existing.access_token;
  }

  if (!interactive) {
    throw new Error("TOKEN_EXPIRED");
  }

  const fresh = await connectGoogleDrive();
  return fresh.access_token;
}

/**
 * Search the appDataFolder for existing data.json file
 */
export async function findDriveDataFile(token: string): Promise<DriveFileInfo | null> {
  const query = encodeURIComponent(`name = '${DRIVE_DATA_FILENAME}' and trashed = false`);
  const url = `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${query}&fields=files(id,name,modifiedTime,size)&pageSize=1`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (res.status === 401) {
    clearStoredToken();
    throw new Error("TOKEN_EXPIRED");
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to query Google Drive (HTTP ${res.status}): ${errText}`);
  }

  const data = await res.json();
  const file = data?.files?.[0];
  if (!file?.id) return null;

  return {
    id: file.id,
    name: file.name,
    modifiedTime: file.modifiedTime,
    size: file.size,
  };
}

/**
 * Upload JSON payload to Google Drive AppData folder using multipart upload.
 * If data.json already exists, updates it via PATCH; otherwise creates via POST.
 */
export async function uploadJsonToDrive(
  token: string,
  jsonString: string
): Promise<{ ok: boolean; fileId: string; modifiedTime: string }> {
  const existing = await findDriveDataFile(token);
  const boundary = "panga_drive_sync_multipart_boundary";

  const metadata: Record<string, any> = {
    name: DRIVE_DATA_FILENAME,
    description: "Panga offline-first personal data backup",
    mimeType: "application/json",
  };

  let url: string;
  let method: string;

  if (existing?.id) {
    // Update existing file in-place
    url = `https://www.googleapis.com/upload/drive/v3/files/${existing.id}?uploadType=multipart&fields=id,name,modifiedTime`;
    method = "PATCH";
  } else {
    // Create new file inside appDataFolder
    metadata.parents = ["appDataFolder"];
    url = `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime`;
    method = "POST";
  }

  const multipartBody =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: application/json\r\n\r\n` +
    `${jsonString}\r\n` +
    `--${boundary}--`;

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body: multipartBody,
  });

  if (res.status === 401) {
    clearStoredToken();
    throw new Error("TOKEN_EXPIRED");
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Drive upload failed (HTTP ${res.status}): ${errText}`);
  }

  const result = await res.json();
  return {
    ok: true,
    fileId: result.id,
    modifiedTime: result.modifiedTime || new Date().toISOString(),
  };
}

/**
 * Download JSON backup from Google Drive AppData folder.
 */
export async function downloadJsonFromDrive(
  token: string
): Promise<{ ok: boolean; data: Snapshot; modifiedTime: string; fileId: string }> {
  const file = await findDriveDataFile(token);
  if (!file?.id) {
    throw new Error("No existing backup file (data.json) was found in your Google Drive AppData folder. Please upload a backup first.");
  }

  const url = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    clearStoredToken();
    throw new Error("TOKEN_EXPIRED");
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to download backup from Google Drive (HTTP ${res.status}): ${errText}`);
  }

  const text = await res.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Downloaded data from Google Drive is not valid JSON.");
  }

  const validated = validateSnapshot(parsed);
  if (!validated) {
    throw new Error("Downloaded backup is not a valid Panga snapshot schema.");
  }

  return {
    ok: true,
    data: validated,
    modifiedTime: file.modifiedTime || new Date().toISOString(),
    fileId: file.id,
  };
}

/**
 * High-level Sync Now (Upload):
 * Exports full IndexedDB database into a JSON snapshot,
 * connects/requires Google token, and uploads to appDataFolder/data.json.
 */
export async function syncNowToGoogleDrive(): Promise<DriveSyncResult> {
  let token: string;
  try {
    token = await requireDriveToken(true);
  } catch (err: any) {
    return { ok: false, message: `Authentication required: ${err?.message || "Please connect Google Drive"}` };
  }

  try {
    const snapshot = await exportSnapshot();
    const jsonString = JSON.stringify(snapshot, null, 2);
    const result = await uploadJsonToDrive(token, jsonString);

    return {
      ok: true,
      message: `Database synced to Google Drive AppData folder!`,
      fileId: result.fileId,
      modifiedTime: result.modifiedTime,
    };
  } catch (err: any) {
    if (err?.message === "TOKEN_EXPIRED") {
      // Retry once after re-authenticating
      try {
        const freshToken = await requireDriveToken(true);
        const snapshot = await exportSnapshot();
        const jsonString = JSON.stringify(snapshot, null, 2);
        const result = await uploadJsonToDrive(freshToken, jsonString);
        return {
          ok: true,
          message: `Database synced to Google Drive AppData folder!`,
          fileId: result.fileId,
          modifiedTime: result.modifiedTime,
        };
      } catch (retryErr: any) {
        return { ok: false, message: `Sync error: ${retryErr?.message || "Token expired"}` };
      }
    }
    return { ok: false, message: `Google Drive sync failed: ${err?.message || String(err)}` };
  }
}

/**
 * High-level Restore from Google Drive:
 * Downloads data.json from appDataFolder.
 */
export async function fetchDriveBackupForRestore(): Promise<DriveSyncResult> {
  let token: string;
  try {
    token = await requireDriveToken(true);
  } catch (err: any) {
    return { ok: false, message: `Authentication required: ${err?.message || "Please connect Google Drive"}` };
  }

  try {
    const result = await downloadJsonFromDrive(token);
    return {
      ok: true,
      message: `Backup found in Google Drive (modified ${new Date(result.modifiedTime).toLocaleString()})`,
      fileId: result.fileId,
      modifiedTime: result.modifiedTime,
      data: result.data,
    };
  } catch (err: any) {
    if (err?.message === "TOKEN_EXPIRED") {
      try {
        const freshToken = await requireDriveToken(true);
        const result = await downloadJsonFromDrive(freshToken);
        return {
          ok: true,
          message: `Backup found in Google Drive (modified ${new Date(result.modifiedTime).toLocaleString()})`,
          fileId: result.fileId,
          modifiedTime: result.modifiedTime,
          data: result.data,
        };
      } catch (retryErr: any) {
        return { ok: false, message: `Download error: ${retryErr?.message || "Token expired"}` };
      }
    }
    return { ok: false, message: err?.message || String(err) };
  }
}

/**
 * Apply a downloaded snapshot directly into IndexedDB.
 */
export async function applyDriveSnapshot(snapshot: Snapshot): Promise<void> {
  await importSnapshot(snapshot);
  await syncAll();
}
