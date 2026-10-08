// src/sync/webdav.ts
// Nextcloud & WebDAV sync client.
// Supports Nextcloud (via /remote.php/dav/files/<user>/) and generic WebDAV servers.
// Uses server-side proxy when available to prevent browser CORS blocks, with direct fallback.
// Credentials are encrypted before persistence (see src/sync/crypto.ts).

export interface WebdavConfig {
  provider?: "nextcloud" | "webdav";
  endpoint: string;      // Nextcloud server URL or full WebDAV endpoint
  username: string;      // User ID / Username
  password: string;      // App Password (decrypted by caller)
  backupPath: string;    // e.g. Panga/panga_backup.json or app_backup.json
  autoSync?: boolean;
}

export interface WebdavResult {
  ok: boolean;
  message: string;
}

export interface WebdavTestResult extends WebdavResult {
  davHeader?: string;
  serverType?: string;
}

export interface DownloadedBackup extends WebdavResult {
  data?: unknown;
}

/**
 * Normalise Nextcloud or WebDAV endpoint:
 * If the user provides a Nextcloud server (e.g. https://cloud.example.com),
 * and it does not contain remote.php/dav/files/ or remote.php/webdav/,
 * append the standard Nextcloud WebDAV path for that user.
 */
export function normalizeWebdavEndpoint(endpoint: string, username: string, isNextcloud = true): string {
  let u = endpoint.trim();
  if (!u.startsWith("http://") && !u.startsWith("https://")) {
    u = "https://" + u;
  }
  u = u.replace(/\/+$/, "");

  if (isNextcloud) {
    if (!u.includes("/remote.php/")) {
      const cleanUser = encodeURIComponent(username.trim());
      u = `${u}/remote.php/dav/files/${cleanUser}`;
    }
  }

  return u;
}

/** Build full target WebDAV URL for file operations. */
export function buildWebdavUrl(config: WebdavConfig): string {
  const isNextcloud = config.provider !== "webdav";
  const base = normalizeWebdavEndpoint(config.endpoint, config.username, isNextcloud);
  const path = config.backupPath
    ? "/" + config.backupPath.replace(/^\/+/, "")
    : "/Panga/panga_backup.json";
  return base + path;
}

/** Create Basic Auth header value from credentials. */
function basicAuth(username: string, password: string): string {
  return "Basic " + btoa(`${username}:${password}`);
}

/**
 * Universal WebDAV fetch:
 * Attempts to use backend proxy /api/sync/webdav/proxy to avoid CORS restrictions,
 * falling back to direct browser fetch.
 */
async function webdavFetch(
  url: string,
  init: {
    method: string;
    headers?: Record<string, string>;
    body?: string;
  }
): Promise<{
  ok: boolean;
  status: number;
  statusText: string;
  headers: { get: (name: string) => string | null };
  text: () => Promise<string>;
}> {
  try {
    const proxyRes = await fetch("/api/sync/webdav/proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        method: init.method,
        headers: init.headers || {},
        body: init.body,
      }),
    });

    if (proxyRes.ok) {
      const data = await proxyRes.json();
      if (data && typeof data.status === "number") {
        return {
          ok: data.ok,
          status: data.status,
          statusText: data.statusText || "",
          headers: {
            get: (name: string) => {
              const lower = name.toLowerCase();
              for (const [k, v] of Object.entries(data.headers || {})) {
                if (k.toLowerCase() === lower) return v as string;
              }
              return null;
            },
          },
          text: async () => data.body || "",
        };
      }
    }
  } catch {
    // Proxy request failed, proceed to direct fetch
  }

  // Direct fetch fallback
  const direct = await fetch(url, {
    method: init.method,
    headers: init.headers,
    body: init.body,
  });

  return {
    ok: direct.ok,
    status: direct.status,
    statusText: direct.statusText,
    headers: {
      get: (name: string) => direct.headers.get(name),
    },
    text: () => direct.text(),
  };
}

/**
 * Recursively create directory collections (MKCOL) if uploading to a nested path.
 */
async function ensureDirectoryCollection(fullFileUrl: string, authHeader: string): Promise<void> {
  const urlObj = new URL(fullFileUrl);
  const pathParts = urlObj.pathname.split("/").filter(Boolean);
  // Remove the file name at the end
  pathParts.pop();

  if (pathParts.length === 0) return;

  // Build progressive parent directory URLs
  let currentPath = "";
  for (const part of pathParts) {
    currentPath += "/" + part;
    const dirUrl = `${urlObj.origin}${currentPath}/`;
    try {
      await webdavFetch(dirUrl, {
        method: "MKCOL",
        headers: {
          Authorization: authHeader,
          "User-Agent": "Panga/1.0 (Nextcloud Sync)",
        },
      });
      // 201 Created or 405 Method Not Allowed (already exists) are expected
    } catch {
      // Ignore directory creation warnings and proceed
    }
  }
}

/**
 * Test a Nextcloud or WebDAV connection.
 * Issues a PROPFIND or OPTIONS request.
 */
export async function webdavTestConnection(config: WebdavConfig): Promise<WebdavTestResult> {
  const isNextcloud = config.provider !== "webdav";
  const url = normalizeWebdavEndpoint(config.endpoint, config.username, isNextcloud);
  const auth = basicAuth(config.username, config.password);

  try {
    const res = await webdavFetch(url, {
      method: "PROPFIND",
      headers: {
        Authorization: auth,
        Depth: "0",
        "Content-Type": "application/xml",
        "User-Agent": "Panga/1.0 (Nextcloud Sync)",
      },
      body: '<?xml version="1.0" encoding="utf-8"?><D:propfind xmlns:D="DAV:"><D:prop><D:resourcetype/></D:prop></D:propfind>',
    });

    if (res.status === 401) {
      return {
        ok: false,
        message: isNextcloud
          ? "Unauthorized — check your Nextcloud username and App Password."
          : "Unauthorized — verify your WebDAV username and password.",
      };
    }
    if (res.status === 403) {
      return {
        ok: false,
        message: "Forbidden — your account may not have WebDAV access permissions.",
      };
    }
    if (res.status === 404) {
      return {
        ok: false,
        message: isNextcloud
          ? "Nextcloud WebDAV endpoint not found. Verify your server URL."
          : "Not Found — verify the WebDAV endpoint URL.",
      };
    }
    if (res.status === 405 || !res.ok) {
      // Try OPTIONS
      const optRes = await webdavFetch(url, {
        method: "OPTIONS",
        headers: {
          Authorization: auth,
          "User-Agent": "Panga/1.0 (Nextcloud Sync)",
        },
      });
      if (optRes.ok) {
        return {
          ok: true,
          message: isNextcloud
            ? "Connected to Nextcloud successfully! Credentials verified."
            : "Connected to WebDAV successfully! Credentials verified.",
          davHeader: optRes.headers.get("DAV") ?? undefined,
          serverType: isNextcloud ? "Nextcloud" : "WebDAV",
        };
      }
      if (optRes.status === 401) {
        return {
          ok: false,
          message: "Unauthorized — check your username and App Password.",
        };
      }
      return {
        ok: false,
        message: `Connection returned HTTP ${optRes.status} ${optRes.statusText}`,
      };
    }

    return {
      ok: true,
      message: isNextcloud
        ? "Connected to Nextcloud successfully! Credentials verified."
        : "Connected to WebDAV successfully! Credentials verified.",
      davHeader: res.headers.get("DAV") ?? undefined,
      serverType: isNextcloud ? "Nextcloud" : "WebDAV",
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `Connection error: ${msg}` };
  }
}

/**
 * Upload the JSON backup payload to Nextcloud / WebDAV.
 * Auto-creates parent folder if needed.
 */
export async function webdavUploadBackup(
  config: WebdavConfig,
  jsonContent: string
): Promise<WebdavResult> {
  const url = buildWebdavUrl(config);
  const auth = basicAuth(config.username, config.password);

  try {
    // Pre-create parent directory (e.g. /Panga/)
    await ensureDirectoryCollection(url, auth);

    const res = await webdavFetch(url, {
      method: "PUT",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
        "User-Agent": "Panga/1.0 (Nextcloud Sync)",
      },
      body: jsonContent,
    });

    if (res.status === 401) {
      return { ok: false, message: "Unauthorized — check your credentials." };
    }
    if (res.status === 403) {
      return { ok: false, message: "Forbidden — insufficient permissions to write." };
    }
    if (res.status === 409 || res.status === 404) {
      // Retry after ensuring directory
      await ensureDirectoryCollection(url, auth);
      const retryRes = await webdavFetch(url, {
        method: "PUT",
        headers: {
          Authorization: auth,
          "Content-Type": "application/json",
          "User-Agent": "Panga/1.0 (Nextcloud Sync)",
        },
        body: jsonContent,
      });
      if (retryRes.ok || retryRes.status === 201 || retryRes.status === 204) {
        return { ok: true, message: "Backup uploaded to Nextcloud successfully." };
      }
      return {
        ok: false,
        message: `Upload failed: ${retryRes.status} ${retryRes.statusText}`,
      };
    }
    if (!res.ok && res.status !== 201 && res.status !== 204) {
      return {
        ok: false,
        message: `Upload failed: ${res.status} ${res.statusText}`,
      };
    }

    return { ok: true, message: "Backup uploaded to Nextcloud successfully." };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `Upload error: ${msg}` };
  }
}

/**
 * Download the JSON backup from Nextcloud / WebDAV.
 */
export async function webdavDownloadBackup(
  config: WebdavConfig
): Promise<DownloadedBackup> {
  const url = buildWebdavUrl(config);
  const auth = basicAuth(config.username, config.password);

  try {
    const res = await webdavFetch(url, {
      method: "GET",
      headers: {
        Authorization: auth,
        Depth: "0",
        "User-Agent": "Panga/1.0 (Nextcloud Sync)",
      },
    });

    if (res.status === 401) {
      return { ok: false, message: "Unauthorized — check your credentials." };
    }
    if (res.status === 404) {
      return {
        ok: false,
        message: "Not Found — no backup file exists at the configured path yet. Try uploading first.",
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

    return { ok: true, message: "Backup downloaded from Nextcloud.", data };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `Download error: ${msg}` };
  }
}
