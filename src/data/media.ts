// src/data/media.ts
// Lightweight workspace media routes (synced in JSON backups & Google Drive) paired with
// a device-only IndexedDB preview/audio blob cache so recent uploads & views work offline.

import { db, notifyLocalDataMutated, type MediaItem, type MediaKind } from "./db";
import { newId, now } from "./utils";
import { emitGlobalItemPrompt } from "./workspaceMove";
import { getDriveAccessToken } from "../sync/googleAuth";
import {
  deleteMediaFileFromDrive,
  downloadMediaBlobFromDrive,
  uploadMediaFileToDrive,
} from "../sync/googleDriveMedia";

export type { MediaItem, MediaKind };

export const MAX_CACHED_MEDIA_BLOBS = 40;
export const MAX_CACHED_MEDIA_BYTES = 50 * 1024 * 1024; // 50 MB on-device cache ceiling

const IMAGE_EXTS = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg", "avif", "bmp", "ico"]);
const AUDIO_EXTS = new Set(["mp3", "wav", "ogg", "m4a", "aac", "flac", "webm", "opus", "weba"]);

export function inferMediaKind(file: { type?: string | null; name?: string | null }): MediaKind | null {
  const mime = (file.type || "").toLowerCase();
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("audio/")) return "audio";
  const ext = (file.name || "").split(".").pop()?.toLowerCase() ?? "";
  if (IMAGE_EXTS.has(ext)) return "image";
  if (AUDIO_EXTS.has(ext)) return "audio";
  return null;
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function readAudioDuration(blob: Blob): Promise<number | null> {
  if (typeof window === "undefined" || typeof Audio === "undefined" || typeof URL.createObjectURL !== "function") {
    return null;
  }
  return new Promise((resolve) => {
    let url = "";
    try {
      url = URL.createObjectURL(blob);
      const audio = new Audio();
      const timer = window.setTimeout(() => {
        URL.revokeObjectURL(url);
        resolve(null);
      }, 1500);
      audio.onloadedmetadata = () => {
        window.clearTimeout(timer);
        const dur = Number.isFinite(audio.duration) ? Math.round(audio.duration) : null;
        URL.revokeObjectURL(url);
        resolve(dur);
      };
      audio.onerror = () => {
        window.clearTimeout(timer);
        URL.revokeObjectURL(url);
        resolve(null);
      };
      audio.src = url;
    } catch {
      if (url) URL.revokeObjectURL(url);
      resolve(null);
    }
  });
}

export async function pruneMediaBlobCache(): Promise<void> {
  if (!db.isOpen()) await db.open();
  const entries = await db.mediaBlobs.orderBy("updatedAt").toArray(); // oldest first
  let totalBytes = entries.reduce((sum, e) => sum + (e.size || e.blob?.size || 0), 0);
  let remaining = entries.length;
  const toDelete: string[] = [];

  for (const entry of entries) {
    if (remaining <= MAX_CACHED_MEDIA_BLOBS && totalBytes <= MAX_CACHED_MEDIA_BYTES) break;
    toDelete.push(entry.id);
    remaining -= 1;
    totalBytes -= entry.size || entry.blob?.size || 0;
  }

  if (toDelete.length > 0) {
    await db.mediaBlobs.bulkDelete(toDelete);
  }
}

export async function cacheMediaBlob(id: string, blob: Blob, mimeType?: string): Promise<void> {
  if (!db.isOpen()) await db.open();
  await db.mediaBlobs.put({
    id,
    mimeType: mimeType || blob.type || "application/octet-stream",
    size: blob.size,
    blob,
    updatedAt: now(),
  });
  await pruneMediaBlobCache();
}

export async function getCachedMediaBlob(id: string): Promise<Blob | null> {
  if (!db.isOpen()) await db.open();
  const row = await db.mediaBlobs.get(id);
  if (!row?.blob) return null;
  // Touch LRU timestamp cleanly in background.
  void db.mediaBlobs.update(id, { updatedAt: now() }).catch(() => {});
  return row.blob;
}

export async function listMediaItems(): Promise<MediaItem[]> {
  if (!db.isOpen()) await db.open();
  return db.mediaItems.orderBy("createdAt").reverse().toArray();
}

export async function getMediaItem(id: string): Promise<MediaItem | undefined> {
  if (!db.isOpen()) await db.open();
  return db.mediaItems.get(id);
}

export async function uploadMediaItemToDrive(id: string, explicitToken?: string | null): Promise<MediaItem | null> {
  if (!db.isOpen()) await db.open();
  const item = await db.mediaItems.get(id);
  if (!item) return null;
  const blobRow = await db.mediaBlobs.get(id);
  if (!blobRow?.blob) {
    await db.mediaItems.update(id, {
      uploadStatus: "error",
      uploadError: "Local file preview expired before uploading to Google Drive.",
      updatedAt: now(),
    });
    return null;
  }
  const token = explicitToken ?? (await getDriveAccessToken());
  if (!token) return item;

  try {
    const uploaded = await uploadMediaFileToDrive(token, blobRow.blob, item.fileName, item.mimeType);
    const updatedAt = now();
    await db.mediaItems.update(id, {
      driveFileId: uploaded.driveFileId,
      driveUrl: uploaded.driveUrl,
      driveRoute: uploaded.driveRoute,
      mimeType: uploaded.mimeType,
      size: uploaded.size,
      uploadStatus: "uploaded",
      uploadError: null,
      updatedAt,
      syncStatus: "pending",
    });
    notifyLocalDataMutated();
    if (typeof window !== "undefined") window.dispatchEvent(new Event("panga-data-updated"));
    return (await db.mediaItems.get(id)) ?? null;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Could not upload to Google Drive.";
    await db.mediaItems.update(id, {
      uploadStatus: "error",
      uploadError: msg,
      updatedAt: now(),
    });
    if (typeof window !== "undefined") window.dispatchEvent(new Event("panga-data-updated"));
    throw err;
  }
}

export async function createMediaFromFile(
  file: File | { blob: Blob; name: string; type?: string },
  opts?: { title?: string; notes?: string; tags?: string[]; token?: string | null }
): Promise<MediaItem> {
  const kind = inferMediaKind({ type: file.type, name: file.name });
  if (!kind) {
    throw new Error("Unsupported file type. Select an image or audio file.");
  }
  if (!db.isOpen()) await db.open();

  const blob = file instanceof Blob ? file : file.blob;
  const fileName = file.name?.trim() || `${kind}-${Date.now()}`;
  const mimeType = file.type || blob.type || (kind === "image" ? "image/png" : "audio/mpeg");
  const baseTitle = fileName.replace(/\.[^/.]+$/, "");
  const title = opts?.title?.trim() || baseTitle || fileName;
  const durationSeconds = kind === "audio" ? await readAudioDuration(blob) : null;
  const t = now();

  const item: MediaItem = {
    id: newId(),
    title,
    fileName,
    mimeType,
    kind,
    size: blob.size,
    durationSeconds,
    driveFileId: null,
    driveUrl: null,
    driveRoute: `panga/media/${fileName}`,
    uploadStatus: "pending",
    uploadError: null,
    tags: opts?.tags ?? [],
    notes: opts?.notes?.trim() || undefined,
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };

  await db.mediaItems.add(item);
  await cacheMediaBlob(item.id, blob, mimeType);
  notifyLocalDataMutated();
  emitGlobalItemPrompt({ kind: "media", id: item.id, title: item.title });
  if (typeof window !== "undefined") window.dispatchEvent(new Event("panga-data-updated"));

  const canUploadOnline = typeof navigator === "undefined" || navigator.onLine !== false;
  const token = opts?.token ?? (await getDriveAccessToken());
  if (token && canUploadOnline) {
    try {
      const uploaded = await uploadMediaItemToDrive(item.id, token);
      if (uploaded) return uploaded;
    } catch {
      // Metadata & local preview are already safely saved as pending/error for retry.
    }
  }

  return (await db.mediaItems.get(item.id)) ?? item;
}

export async function uploadPendingMediaToDrive(explicitToken?: string | null): Promise<{ uploaded: number; failed: number }> {
  if (!db.isOpen()) await db.open();
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return { uploaded: 0, failed: 0 };
  }
  const token = explicitToken ?? (await getDriveAccessToken());
  if (!token) return { uploaded: 0, failed: 0 };

  const pending = await db.mediaItems.filter((m) => m.uploadStatus !== "uploaded").toArray();
  let uploaded = 0;
  let failed = 0;
  for (const item of pending) {
    const cached = await db.mediaBlobs.get(item.id);
    if (!cached?.blob) continue;
    try {
      await uploadMediaItemToDrive(item.id, token);
      uploaded++;
    } catch {
      failed++;
    }
  }
  return { uploaded, failed };
}

export async function loadMediaPreviewBlob(
  item: MediaItem,
  explicitToken?: string | null
): Promise<{ blob: Blob; source: "cache" | "drive" } | null> {
  const cached = await getCachedMediaBlob(item.id);
  if (cached) return { blob: cached, source: "cache" };

  if (!item.driveFileId) return null;
  if (typeof navigator !== "undefined" && navigator.onLine === false) return null;
  const token = explicitToken ?? (await getDriveAccessToken());
  if (!token) return null;

  const blob = await downloadMediaBlobFromDrive(token, item.driveFileId);
  await cacheMediaBlob(item.id, blob, item.mimeType);
  return { blob, source: "drive" };
}

export async function updateMediaItem(
  id: string,
  changes: Partial<Pick<MediaItem, "title" | "notes" | "tags">>
): Promise<void> {
  if (!db.isOpen()) await db.open();
  await db.mediaItems.update(id, { ...changes, updatedAt: now(), syncStatus: "pending" });
  notifyLocalDataMutated();
  if (typeof window !== "undefined") window.dispatchEvent(new Event("panga-data-updated"));
}

export async function deleteMediaItem(
  id: string,
  opts?: { deleteFromDrive?: boolean; token?: string | null }
): Promise<void> {
  if (!db.isOpen()) await db.open();
  const existing = await db.mediaItems.get(id);
  if (opts?.deleteFromDrive && existing?.driveFileId) {
    const token = opts.token ?? (await getDriveAccessToken());
    if (token) {
      await deleteMediaFileFromDrive(token, existing.driveFileId).catch(() => {});
    }
  }
  await db.mediaItems.delete(id);
  await db.mediaBlobs.delete(id);
  notifyLocalDataMutated();
  if (typeof window !== "undefined") window.dispatchEvent(new Event("panga-data-updated"));
}
