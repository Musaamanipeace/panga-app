// src/sync/webdav.ts
// Provider-agnostic WebDAV sync client.
// Supports any standard WebDAV server (InfiniCLOUD, Nextcloud, etc.)
// All operations use HTTP Basic Auth over HTTPS. Credentials must be
// encrypted before being passed to this module (see src/sync/crypto.ts).

export interface WebdavConfig {
  endpoint: string;      // e.g. https://user-id.teracloud.jp/dav/
  username: string;      // User ID / Username
  password: string;      // App Password (plaintext, decrypted by caller)
  backupPath: string;    // custom path, e.g. backups/app_backup.json
}

export interface WebdavResult {
  ok: boolean;
  message: string;
}

export interface WebdavTestResult extends WebdavResult {
  /** Human-readable server info from the DAV header, if available. */
  davHeader?: string;
}

export interface DownloadedBackup extends WebdavResult {
  data?: unknown;        // parsed JSON backup object
}

/** Normalise an endpoint URL: ensure protocol, strip trailing slash. */
function normalizeEndpoint(url: string): string {
  let u = url.trim();
  if (!u.startsWith("http://") && !u.startsWith("https://")) {
    u = "https://" + u;
  }
  if (u.endsWith("/")) {
    u = u.slice(0, -1);
  }
  return u;
}

/** Build the full WebDAV URL: endpoint + path. */
export function buildWebdavUrl(config: WebdavConfig): string {
  const base = normalizeEndpoint(config.endpoint);
  const path = config.backupPath
    ? "/" + config.backupPath.replace(/^\/+/, "")
    : "/app_backup.json";
  return base + path;
}

/** Create a Basic Auth header value from credentials. */
function basicAuth(username: string, password: string): string {
  return "Basic " + btoa(`${username}:${password}`);
}

/**
 * Test a WebDAV connection by issuing a PROPFIND request.
 * Verifies credentials and endpoint reachability.
 */
export async function webdavTestConnection(
  config: WebdavConfig
): Promise<WebdavTestResult> {
  const url = normalizeEndpoint(config.endpoint);

  try {
    const res = await fetch(url, {
      method: "PROPFIND",
      headers: {
        Authorization: basicAuth(config.username, config.password),
        Depth: "0",
        "Content-Type": "application/xml",
        "User-Agent": "Panga/1.0 (WebDAV Backup)",
      },
      body: '<?xml version="1.0" encoding="utf-8"?><D:propertyupdate xmlns:D="DAV:" />',
    });

    if (res.status === 401) {
      return {
        ok: false,
        message: "Unauthorized — verify your username and app password.",
      };
    }
    if (res.status === 403) {
      return {
        ok: false,
        message: "Forbidden — your account may not have WebDAV access enabled.",
      };
    }
    if (res.status === 404) {
      return {
        ok: false,
        message: "Not Found — the WebDAV endpoint URL may be incorrect.",
      };
    }
    if (res.status === 405) {
      // Some servers don't allow PROPFIND on the root; retry with OPTIONS
      const optRes = await fetch(url, {
        method: "OPTIONS",
        headers: {
          Authorization: basicAuth(config.username, config.password),
        },
      });
      if (optRes.ok) {
        return {
          ok: true,
          message: "Connection successful! Credentials verified.",
          davHeader: optRes.headers.get("DAV") ?? undefined,
        };
      }
      if (optRes.status === 401) {
        return {
          ok: false,
          message: "Unauthorized — verify your username and app password.",
        };
      }
      return {
        ok: false,
        message: `Connection failed: ${optRes.status} ${optRes.statusText}`,
      };
    }
    if (!res.ok) {
      return {
        ok: false,
        message: `Connection failed: ${res.status} ${res.statusText}`,
      };
    }

    return {
      ok: true,
      message: "Connection successful! WebDAV credentials verified.",
      davHeader: res.headers.get("DAV") ?? undefined,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("Failed to fetch") || msg.includes("fetch")) {
      return {
        ok: false,
        message:
          "Network error — check the endpoint URL and your internet connection.",
      };
    }
    return { ok: false, message: `Network error: ${msg}` };
  }
}

/**
 * Upload (PUT) the JSON backup payload to the WebDAV server.
 * Uses a custom path so users can organise backups in folders.
 */
export async function webdavUploadBackup(
  config: WebdavConfig,
  jsonContent: string
): Promise<WebdavResult> {
  const url = buildWebdavUrl(config);
  const bodyBytes = new TextEncoder().encode(jsonContent);

  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: basicAuth(config.username, config.password),
        "Content-Type": "application/json",
        "Content-Length": String(bodyBytes.length),
        "User-Agent": "Panga/1.0 (WebDAV Backup)",
      },
      body: jsonContent,
    });

    if (res.status === 401) {
      return { ok: false, message: "Unauthorized — verify your credentials." };
    }
    if (res.status === 403) {
      return { ok: false, message: "Forbidden — insufficient permissions to write." };
    }
    if (res.status === 409) {
      return {
        ok: false,
        message: "Conflict — a collection exists at the target path. Choose a file path.",
      };
    }
    if (!res.ok && res.status !== 201 && res.status !== 204 && res.status !== 200) {
      return {
        ok: false,
        message: `Upload failed: ${res.status} ${res.statusText}`,
      };
    }

    return { ok: true, message: "Backup uploaded to WebDAV successfully." };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `Network error: ${msg}` };
  }
}

/**
 * Download (GET) the JSON backup from the WebDAV server.
 * Returns the parsed JSON data on success.
 */
export async function webdavDownloadBackup(
  config: WebdavConfig
): Promise<DownloadedBackup> {
  const url = buildWebdavUrl(config);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: basicAuth(config.username, config.password),
        "Depth": "0",
        "User-Agent": "Panga/1.0 (WebDAV Backup)",
      },
    });

    if (res.status === 401) {
      return { ok: false, message: "Unauthorized — verify your credentials." };
    }
    if (res.status === 404) {
      return {
        ok: false,
        message: "Not Found — no backup file exists at the configured path.",
      };
    }
    if (res.status === 403) {
      return { ok: false, message: "Forbidden — insufficient permissions to read." };
    }
    if (!res.ok) {
      return {
        ok: false,
        message: `Download failed: ${res.status} ${res.statusText}`,
      };
    }

    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      return {
        ok: false,
        message: "The remote file is not valid JSON. It may not be a Panga backup.",
      };
    }

    return { ok: true, message: "Backup downloaded from WebDAV.", data };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("Failed to fetch") || msg.includes("fetch")) {
      return {
        ok: false,
        message:
          "Network error — check the endpoint URL and your internet connection.",
      };
    }
    return { ok: false, message: `Network error: ${msg}` };
  }
}
