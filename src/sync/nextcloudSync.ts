// src/sync/nextcloudSync.ts
// Client-side Nextcloud (WebDAV) backup and sync service.
// Uses standard WebDAV HTTP requests over HTTPS with Basic Authentication.

import {
  getNextcloudConfig,
  setNextcloudConfig,
  type NextcloudConfig,
} from "../data/settings";
import { exportSnapshot, validateSnapshot, importSnapshot, type Snapshot } from "./snapshot";
import { syncAll } from "./sync";

export const NEXTCLOUD_BACKUP_FILENAME = "data.json";

export interface NextcloudSyncResult {
  ok: boolean;
  message: string;
  url?: string;
  timestamp?: string;
  data?: Snapshot;
}

/**
 * Builds the standard Nextcloud WebDAV URL for a user's file.
 * Handles trailing slashes and user-provided paths cleanly.
 */
export function buildNextcloudUrl(serverUrl: string, username: string, filename = NEXTCLOUD_BACKUP_FILENAME): string {
  let base = serverUrl.trim().replace(/\/+$/, "");
  // If the user already provided the full /remote.php/dav/files/user path
  if (base.includes("/remote.php/dav/files/")) {
    return base.endsWith(".json") ? base : `${base}/${filename}`;
  }
  return `${base}/remote.php/dav/files/${encodeURIComponent(username.trim())}/${filename}`;
}

/**
 * Generates the standard HTTP Basic Auth header value.
 */
function getBasicAuthHeader(username: string, password: string): string {
  const credentials = `${username.trim()}:${password.trim()}`;
  return `Basic ${btoa(unescape(encodeURIComponent(credentials)))}`;
}

/**
 * Test connectivity and authentication to the Nextcloud server.
 */
export async function testNextcloudConnection(config: NextcloudConfig): Promise<NextcloudSyncResult> {
  const { serverUrl, username, password } = config;
  if (!serverUrl || !username || !password) {
    return { ok: false, message: "Please enter Server URL, Username, and App Password." };
  }

  try {
    const fileUrl = buildNextcloudUrl(serverUrl, username);
    const authHeader = getBasicAuthHeader(username, password);

    // Try HEAD or GET on data.json, or PROPFIND on the user folder
    const userFolderUrl = `${serverUrl.trim().replace(/\/+$/, "")}/remote.php/dav/files/${encodeURIComponent(username.trim())}/`;
    const res = await fetch(userFolderUrl, {
      method: "PROPFIND",
      headers: {
        Authorization: authHeader,
        Depth: "0",
      },
    });

    if (res.status === 401) {
      return { ok: false, message: "Authentication failed. Check your username and App Password." };
    }

    if (res.status === 404) {
      // Some servers block PROPFIND on folder; try HEAD on file instead
      const headRes = await fetch(fileUrl, {
        method: "HEAD",
        headers: { Authorization: authHeader },
      });
      if (headRes.status === 401) {
        return { ok: false, message: "Authentication failed. Check your username and App Password." };
      }
      if (headRes.ok || headRes.status === 404) {
        return { ok: true, message: "Connection verified! Nextcloud endpoint is reachable." };
      }
    }

    if (res.ok || res.status === 207) {
      return { ok: true, message: "Connection verified! Nextcloud credentials are valid." };
    }

    return {
      ok: false,
      message: `Nextcloud server returned HTTP ${res.status}: ${res.statusText}`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `Failed to connect to Nextcloud: ${msg}` };
  }
}

/**
 * Uploads local database snapshot to Nextcloud via WebDAV PUT request.
 */
export async function syncNowToNextcloud(customConfig?: NextcloudConfig): Promise<NextcloudSyncResult> {
  const config = customConfig || (await getNextcloudConfig());
  if (!config?.serverUrl || !config?.username || !config?.password) {
    return {
      ok: false,
      message: "Nextcloud configuration incomplete. Please provide Server URL, Username, and App Password.",
    };
  }

  try {
    const targetUrl = buildNextcloudUrl(config.serverUrl, config.username);
    const authHeader = getBasicAuthHeader(config.username, config.password);

    const snapshot = await exportSnapshot();
    const jsonContent = JSON.stringify(snapshot, null, 2);

    const res = await fetch(targetUrl, {
      method: "PUT",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: jsonContent,
    });

    if (res.status === 401) {
      return {
        ok: false,
        message: "Nextcloud authentication failed: invalid username or App Password.",
      };
    }

    if (!res.ok && res.status !== 201 && res.status !== 204 && res.status !== 200) {
      const errText = await res.text();
      return {
        ok: false,
        message: `Nextcloud upload failed (HTTP ${res.status}): ${errText.slice(0, 150)}`,
      };
    }

    // Save verified config if customConfig was supplied
    if (customConfig) {
      await setNextcloudConfig(customConfig);
    }

    return {
      ok: true,
      message: `Database uploaded to Nextcloud successfully!`,
      url: targetUrl,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `Nextcloud sync failed: ${msg}` };
  }
}

/**
 * Downloads data.json from Nextcloud via WebDAV GET request for restore.
 */
export async function fetchNextcloudForRestore(customConfig?: NextcloudConfig): Promise<NextcloudSyncResult> {
  const config = customConfig || (await getNextcloudConfig());
  if (!config?.serverUrl || !config?.username || !config?.password) {
    return {
      ok: false,
      message: "Nextcloud credentials missing. Please configure Server URL, Username, and App Password.",
    };
  }

  try {
    const targetUrl = buildNextcloudUrl(config.serverUrl, config.username);
    const authHeader = getBasicAuthHeader(config.username, config.password);

    const res = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
    });

    if (res.status === 401) {
      return {
        ok: false,
        message: "Nextcloud authentication failed: invalid username or App Password.",
      };
    }

    if (res.status === 404) {
      return {
        ok: false,
        message: `No existing backup file (data.json) was found at ${targetUrl}. Please upload a backup first.`,
      };
    }

    if (!res.ok) {
      const errText = await res.text();
      return {
        ok: false,
        message: `Failed to download from Nextcloud (HTTP ${res.status}): ${errText.slice(0, 150)}`,
      };
    }

    const text = await res.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return { ok: false, message: "Downloaded file from Nextcloud is not valid JSON." };
    }

    const snapshot = validateSnapshot(parsed);
    if (!snapshot) {
      return { ok: false, message: "Downloaded file is not a valid Panga database snapshot schema." };
    }

    return {
      ok: true,
      message: `Backup downloaded from Nextcloud (${new Date(snapshot.metadata.exportedAt).toLocaleString()})`,
      url: targetUrl,
      timestamp: snapshot.metadata.exportedAt,
      data: snapshot,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `Nextcloud download failed: ${msg}` };
  }
}

/**
 * Applies a restored snapshot from Nextcloud directly into IndexedDB.
 */
export async function applyNextcloudSnapshot(snapshot: Snapshot): Promise<void> {
  await importSnapshot(snapshot);
  await syncAll();
}
