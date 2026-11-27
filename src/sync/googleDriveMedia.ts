// src/sync/googleDriveMedia.ts
// Uploads, downloads, and deletes user image/audio files inside "panga/media" on Google Drive
// using the existing drive.file OAuth access token. Binary payloads live on Drive, never in JSON.

import { invalidateDriveAccessToken } from "./googleAuth";
import { DriveAuthExpiredError, ensureDriveFolder, findDriveFolder } from "./googleDriveSync";

export const DRIVE_MEDIA_FOLDER_NAME = "media";
const DRIVE_FOLDER_MIME = "application/vnd.google-apps.folder";
const DRIVE_FILES_API = "https://www.googleapis.com/drive/v3/files";
const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3/files";

async function driveFetch(url: string, token: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });
  if (res.status === 401) {
    invalidateDriveAccessToken();
    throw new DriveAuthExpiredError();
  }
  return res;
}

export async function findDriveMediaFolder(token: string): Promise<string | null> {
  const rootId = await findDriveFolder(token);
  if (!rootId) return null;
  const params = new URLSearchParams({
    q: `name = '${DRIVE_MEDIA_FOLDER_NAME}' and '${rootId}' in parents and mimeType = '${DRIVE_FOLDER_MIME}' and trashed = false`,
    spaces: "drive",
    orderBy: "createdTime",
    pageSize: "1",
    fields: "files(id,name)",
  });
  const res = await driveFetch(`${DRIVE_FILES_API}?${params.toString()}`, token);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Could not inspect Google Drive media folder (${res.status}): ${text || res.statusText}`);
  }
  const json = (await res.json()) as { files?: Array<{ id: string }> };
  return json.files?.[0]?.id ?? null;
}

export async function ensureDriveMediaFolder(token: string): Promise<string> {
  const rootId = await ensureDriveFolder(token);
  const existing = await findDriveMediaFolder(token);
  if (existing) return existing;

  const res = await driveFetch(`${DRIVE_FILES_API}?fields=id`, token, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify({
      name: DRIVE_MEDIA_FOLDER_NAME,
      mimeType: DRIVE_FOLDER_MIME,
      parents: [rootId],
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Could not create "panga/${DRIVE_MEDIA_FOLDER_NAME}" in Google Drive (${res.status}): ${text || res.statusText}`);
  }
  const created = (await res.json()) as { id: string };
  return created.id;
}

export interface UploadedDriveMedia {
  driveFileId: string;
  driveUrl: string;
  driveRoute: string;
  mimeType: string;
  size: number;
}

export async function uploadMediaFileToDrive(
  token: string,
  blob: Blob,
  fileName: string,
  mimeType: string
): Promise<UploadedDriveMedia> {
  const folderId = await ensureDriveMediaFolder(token);
  const boundary = `panga_media_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const safeName = fileName.trim() || `media-${Date.now()}`;
  const safeMime = mimeType || blob.type || "application/octet-stream";

  const metadataPart = JSON.stringify({
    name: safeName,
    mimeType: safeMime,
    parents: [folderId],
  });

  const bodyBlob = new Blob(
    [
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadataPart}\r\n`,
      `--${boundary}\r\nContent-Type: ${safeMime}\r\n\r\n`,
      blob,
      `\r\n--${boundary}--`,
    ],
    { type: `multipart/related; boundary=${boundary}` }
  );

  const res = await driveFetch(
    `${DRIVE_UPLOAD_API}?uploadType=multipart&fields=id,name,webViewLink,mimeType,size`,
    token,
    {
      method: "POST",
      headers: {
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: bodyBlob,
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Could not upload "${safeName}" to Google Drive (${res.status}): ${text || res.statusText}`);
  }

  const uploaded = (await res.json()) as {
    id: string;
    name?: string;
    webViewLink?: string;
    mimeType?: string;
    size?: string;
  };

  return {
    driveFileId: uploaded.id,
    driveUrl: uploaded.webViewLink || `https://drive.google.com/file/d/${encodeURIComponent(uploaded.id)}/view`,
    driveRoute: `panga/${DRIVE_MEDIA_FOLDER_NAME}/${uploaded.name || safeName}`,
    mimeType: uploaded.mimeType || safeMime,
    size: uploaded.size ? Number(uploaded.size) : blob.size,
  };
}

export async function downloadMediaBlobFromDrive(token: string, driveFileId: string): Promise<Blob> {
  const res = await driveFetch(`${DRIVE_FILES_API}/${encodeURIComponent(driveFileId)}?alt=media`, token);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Could not download media from Google Drive (${res.status}): ${text || res.statusText}`);
  }
  return res.blob();
}

export async function deleteMediaFileFromDrive(token: string, driveFileId: string): Promise<void> {
  const res = await driveFetch(`${DRIVE_FILES_API}/${encodeURIComponent(driveFileId)}`, token, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 404) {
    const text = await res.text().catch(() => "");
    throw new Error(`Could not delete media file from Google Drive (${res.status}): ${text || res.statusText}`);
  }
}
