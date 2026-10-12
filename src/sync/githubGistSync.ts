// src/sync/githubGistSync.ts
// Client-side backup and sync to GitHub Gist using Personal Access Token (PAT).
// Pure client-side REST API calls — no backend server or secrets needed.

import {
  getGithubGistToken,
  getGithubGistId,
  setGithubGistId,
} from "../data/settings";
import { exportSnapshot, validateSnapshot, importSnapshot, type Snapshot } from "./snapshot";
import { syncAll } from "./sync";

export const GIST_FILENAME = "data.json";

export interface GistSyncResult {
  ok: boolean;
  message: string;
  gistId?: string;
  gistUrl?: string;
  updatedAt?: string;
  data?: Snapshot;
}

/**
 * Upload local database snapshot to GitHub Gist.
 * If gistId is empty, creates a new private gist containing 'data.json'
 * and automatically saves the generated gist ID to local settings.
 * If gistId is provided, updates the existing gist via PATCH.
 */
export async function syncNowToGithubGist(
  customToken?: string,
  customGistId?: string
): Promise<GistSyncResult> {
  const token = (customToken !== undefined ? customToken : (await getGithubGistToken()) ?? "").trim();
  if (!token) {
    return {
      ok: false,
      message: "Please enter your GitHub Personal Access Token (PAT) with 'gist' scope.",
    };
  }

  let gistId = (customGistId !== undefined ? customGistId : (await getGithubGistId()) ?? "").trim();

  try {
    const snapshot = await exportSnapshot();
    const jsonString = JSON.stringify(snapshot, null, 2);

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    };

    if (gistId) {
      // Update existing Gist
      const res = await fetch(`https://api.github.com/gists/${encodeURIComponent(gistId)}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          description: "Panga Personal Planner App Data Backup",
          files: {
            [GIST_FILENAME]: {
              content: jsonString,
            },
          },
        }),
      });

      if (res.status === 401) {
        return {
          ok: false,
          message: "GitHub authentication failed: invalid or expired Personal Access Token.",
        };
      }
      if (res.status === 404) {
        return {
          ok: false,
          message: `Gist ID ${gistId} not found on GitHub. Clear the Gist ID to create a new one on next sync.`,
        };
      }
      if (!res.ok) {
        const errText = await res.text();
        return {
          ok: false,
          message: `GitHub Gist update failed (HTTP ${res.status}): ${errText.slice(0, 150)}`,
        };
      }

      const data = await res.json();
      return {
        ok: true,
        message: `Synced to GitHub Gist (${gistId}) successfully!`,
        gistId: data.id,
        gistUrl: data.html_url,
        updatedAt: data.updated_at,
      };
    } else {
      // Create new private Gist
      const res = await fetch("https://api.github.com/gists", {
        method: "POST",
        headers,
        body: JSON.stringify({
          description: "Panga Personal Planner App Data Backup",
          public: false,
          files: {
            [GIST_FILENAME]: {
              content: jsonString,
            },
          },
        }),
      });

      if (res.status === 401) {
        return {
          ok: false,
          message: "GitHub authentication failed: invalid or expired Personal Access Token.",
        };
      }
      if (!res.ok) {
        const errText = await res.text();
        return {
          ok: false,
          message: `GitHub Gist creation failed (HTTP ${res.status}): ${errText.slice(0, 150)}`,
        };
      }

      const data = await res.json();
      const newGistId = data.id;
      await setGithubGistId(newGistId);

      return {
        ok: true,
        message: `Created new private Gist (${newGistId}) and synced database!`,
        gistId: newGistId,
        gistUrl: data.html_url,
        updatedAt: data.updated_at,
      };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `GitHub Gist sync failed: ${msg}` };
  }
}

/**
 * Downloads data.json from GitHub Gist for restore.
 */
export async function fetchGithubGistForRestore(
  customToken?: string,
  customGistId?: string
): Promise<GistSyncResult> {
  const token = (customToken !== undefined ? customToken : (await getGithubGistToken()) ?? "").trim();
  const gistId = (customGistId !== undefined ? customGistId : (await getGithubGistId()) ?? "").trim();

  if (!token) {
    return { ok: false, message: "Please enter your GitHub Personal Access Token." };
  }
  if (!gistId) {
    return {
      ok: false,
      message: "No Gist ID configured. Please specify a Gist ID or sync once to create one.",
    };
  }

  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    const res = await fetch(`https://api.github.com/gists/${encodeURIComponent(gistId)}`, {
      method: "GET",
      headers,
    });

    if (res.status === 401) {
      return { ok: false, message: "GitHub authentication failed: invalid or expired Personal Access Token." };
    }
    if (res.status === 404) {
      return { ok: false, message: `Gist ID ${gistId} not found on GitHub.` };
    }
    if (!res.ok) {
      const errText = await res.text();
      return { ok: false, message: `Failed to fetch Gist (HTTP ${res.status}): ${errText.slice(0, 150)}` };
    }

    const data = await res.json();
    const file = data?.files?.[GIST_FILENAME];
    if (!file) {
      return {
        ok: false,
        message: `Gist does not contain ${GIST_FILENAME}. Check that you have the correct Gist ID.`,
      };
    }

    let jsonText = file.content;
    if (file.truncated && file.raw_url) {
      const rawRes = await fetch(file.raw_url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!rawRes.ok) {
        return { ok: false, message: "Failed to download complete file content from Gist raw URL." };
      }
      jsonText = await rawRes.text();
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      return { ok: false, message: "Downloaded file content from Gist is not valid JSON." };
    }

    const snapshot = validateSnapshot(parsed);
    if (!snapshot) {
      return { ok: false, message: "Downloaded file is not a valid Panga database snapshot schema." };
    }

    return {
      ok: true,
      message: `Backup retrieved from Gist (${gistId})`,
      gistId,
      gistUrl: data.html_url,
      updatedAt: data.updated_at,
      data: snapshot,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `GitHub Gist download failed: ${msg}` };
  }
}

/**
 * Applies a restored snapshot from Gist directly into IndexedDB.
 */
export async function applyGistSnapshot(snapshot: Snapshot): Promise<void> {
  await importSnapshot(snapshot);
  await syncAll();
}
