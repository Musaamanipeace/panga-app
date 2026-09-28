// src/sync/google.ts
// One Google Cloud project, client-side sign-in, no backend.
//
// Calendar uses the GIS token client for OAuth. Drive uses the same access
// token plus the Google Picker, which needs its own API key. Both are loaded
// on demand and only when a client id is actually configured.

import {
  getGoogleClientId,
  getGooglePickerKey,
  getGoogleAccessToken,
  setGoogleAccessToken,
  clearGoogleAccessToken,
  SETTINGS_KEYS,
} from "../data/settings";
import { importGoogleEvents, pruneMissingGoogleEvents, type GoogleCalendarEventLike } from "../data/calendar.ts"

const GIS_SRC = "https://accounts.google.com/gsi/client";
const PICKER_SRC = "https://apis.google.com/js/picker.js";
const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.readonly";
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";

/** One token covers both APIs, so both scopes are requested together. */
const SCOPES = `${CALENDAR_SCOPE} ${DRIVE_SCOPE}`;

let tokenClient: {
  requestAccessToken: (options?: { prompt?: string }) => void;
} | null = null;
let pendingResolve: ((token: { access_token: string; expires_at: number } | null) => void) | null =
  null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Could not load ${src}.`));
    document.head.appendChild(script);
  });
}

interface TokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

export async function isGoogleConfigured(): Promise<boolean> {
  return !!(await getGoogleClientId());
}

/** Opens the Google account chooser and resolves with a usable access token. */
export async function connectGoogle(): Promise<{ access_token: string; expires_at: number } | null> {
  const clientId = await getGoogleClientId();
  if (!clientId) throw new Error("Add a Google OAuth Client ID in Settings first.");

  await loadScript(GIS_SRC);
  const google = (window as any).google;
  if (!google?.accounts?.oauth2) throw new Error("Google Identity Services did not load.");

  return new Promise((resolve) => {
    pendingResolve = resolve;
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      prompt: "consent",
      callback: async (response: TokenResponse) => {
        if (response.error || !response.access_token) {
          console.error("Google OAuth failed:", response.error, response.error_description);
          pendingResolve?.(null);
          pendingResolve = null;
          return;
        }
        const token = {
          access_token: response.access_token,
          expires_at: Date.now() + (response.expires_in ?? 3600) * 1000,
          scope: SCOPES,
        };
        await setGoogleAccessToken(token);
        pendingResolve?.(token);
        pendingResolve = null;
      },
      error_callback: () => {
        pendingResolve?.(null);
        pendingResolve = null;
      },
    });
     tokenClient!.requestAccessToken({ prompt: "consent" });
  });
}

/** Returns a live access token, reconnecting silently is not attempted. */
export async function requireAccessToken(): Promise<string | null> {
  const token = await getGoogleAccessToken();
  if (!token) return null;
  if (token.expires_at < Date.now()) {
    await clearGoogleAccessToken();
    return null;
  }
  return token.access_token;
}

export async function isGoogleConnected(): Promise<boolean> {
  return (await requireAccessToken()) !== null;
}

export async function disconnectGoogle(): Promise<void> {
  await clearGoogleAccessToken();
  tokenClient = null;
}

/* ------------------------------------------------------------------ */
/* Calendar                                                            */
/* ------------------------------------------------------------------ */

/**
 * Pulls a rolling window of events from the primary calendar. Read-only, and
 * Meet-enabled events come back with a hangoutLink that the UI turns into a
 * Join button.
 */
export async function syncGoogleCalendar(days = 60): Promise<number> {
  const token = await requireAccessToken();
  if (!token) throw new Error("Google is not connected. Connect it in Settings.");

  const timeMin = new Date(Date.now() - 7 * 86400000).toISOString();
  const timeMax = new Date(Date.now() + days * 86400000).toISOString();
  const seen = new Set<string>();
  let pageToken: string | null = null;
  let imported = 0;

  do {
    const params = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "250",
    });
    if (pageToken) params.set("pageToken", pageToken);

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) {
      throw new Error(`Calendar returned ${res.status}. Check the Calendar scope.`);
    }
    const page = (await res.json()) as {
      items?: GoogleCalendarEventLike[];
      nextPageToken?: string;
    };
    const items = page.items ?? [];
    for (const item of items) seen.add(`google_${item.id}`);
    imported += await importGoogleEvents(items);
    pageToken = page.nextPageToken ?? null;
  } while (pageToken);

  await pruneMissingGoogleEvents(seen);
  return imported;
}

/* ------------------------------------------------------------------ */
/* Drive                                                               */
/* ------------------------------------------------------------------ */

export interface PickedFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
}

export function isDriveReady(): boolean {
  return true;
}

function loadPicker(): Promise<void> {
  return loadScript(PICKER_SRC);
}

interface PickerDocument {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
}

declare global {
  interface Window {
    google?: any;
  }
}

function openPicker(token: string, apiKey: string, title: string, mimeFilter: string) {
  return new Promise<PickedFile[]>((resolve) => {
    void loadPicker().then(() => {
      const picker = (window as any).google.picker;
      const view = new picker.DocsView(picker.ViewId.DOCS)
        .setIncludeFolders(true)
        .setMimeTypes(mimeFilter);
      const builder = new picker.PickerBuilder()
        .setOAuthToken(token)
        .setDeveloperKey(apiKey)
        .addView(view)
        .setTitle(title)
        .setCallback((data: { action: string; docs?: PickerDocument[] }) => {
          if (data.action === picker.Action.PICKED && data.docs?.length) {
            resolve(
              data.docs.map((d) => ({
                id: d.id,
                name: d.name,
                mimeType: d.mimeType,
                webViewLink: d.webViewLink,
              }))
            );
          } else if (data.action === picker.Action.CANCEL) {
            resolve([]);
          }
        });
      builder.build().setVisible(true);
    });
  });
}

/** Asks the user which Drive folder to use, remembering it for the project. */
export async function pickDriveFolder(projectId: string): Promise<string | null> {
  const [token, apiKey] = await Promise.all([requireAccessToken(), getGooglePickerKey()]);
  if (!token || !apiKey) return null;
  const picked = await openPicker(token, apiKey, "Choose the Drive folder for this project", "application/vnd.google-apps.folder");
  if (!picked.length) return null;
  const { setDriveFolder } = await import("../data/settings");
  await setDriveFolder(projectId, picked[0].id);
  return picked[0].id;
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, body] = dataUrl.split(",");
  const mime = /:(.*?);/.exec(header)?.[1] ?? "application/octet-stream";
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

const FOLDER_MIME = "application/vnd.google-apps.folder";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
}

/**
 * Sends a file to Drive and returns its reference. Only the reference is
 * stored locally — the bytes never stay in the browser database.
 */
export async function uploadToDrive(
  projectId: string,
  dataUrl: string,
  name: string,
  mimeType: string
): Promise<{ fileId: string; folderId: string; webViewLink: string; name: string; mimeType: string }> {
  const [token, apiKey, settings] = await Promise.all([
    requireAccessToken(),
    getGooglePickerKey(),
    import("../data/settings"),
  ]);
  if (!token || !apiKey) throw new Error("Google Drive is not connected. Set the keys in Settings.");

  let folderId = await settings.getDriveFolder(projectId);
  if (!folderId) {
    // The folder is chosen once per project and then remembered.
    const picked = await openPicker(
      token,
      apiKey,
      `Choose the Drive folder for this project${name ? ` (for ${name})` : ""}`,
      FOLDER_MIME
    );
    if (!picked.length) throw new Error("No folder chosen, so the upload was cancelled.");
    folderId = picked[0].id;
    await settings.setDriveFolder(projectId, folderId);
  }

  const metadata: Record<string, unknown> = { name };
  if (folderId) metadata.parents = [folderId];
  const boundary = "panga-drive-upload";
  const body = new FormData();
  body.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  body.append("file", dataUrlToBlob(dataUrl));

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );
  if (!res.ok) {
    throw new Error(`Drive upload failed with ${res.status}.`);
  }
  const file = (await res.json()) as DriveFile;
  return {
    fileId: file.id,
    folderId: folderId ?? "",
    webViewLink: file.webViewLink ?? `https://drive.google.com/file/d/${file.id}/view`,
    name: file.name,
    mimeType: file.mimeType ?? mimeType,
  };
}

export { SETTINGS_KEYS };
