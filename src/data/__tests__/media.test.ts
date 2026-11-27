import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetGuestSession } from "../../auth/session";
import { db, exportDbState, switchWorkspaceDb } from "../db";
import { exportSnapshot } from "../../sync/snapshot";
import {
  cacheMediaBlob,
  createMediaFromFile,
  inferMediaKind,
  listMediaItems,
  loadMediaPreviewBlob,
  MAX_CACHED_MEDIA_BLOBS,
  pruneMediaBlobCache,
  uploadMediaItemToDrive,
} from "../media";

describe("media routes, Drive upload/hydration & LRU cache", () => {
  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await resetGuestSession();
    await switchWorkspaceDb();
    await db.open();
    await db.mediaItems.clear();
    await db.mediaBlobs.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("infers image and audio kinds accurately and rejects unsupported files", async () => {
    expect(inferMediaKind({ type: "image/webp", name: "photo.webp" })).toBe("image");
    expect(inferMediaKind({ type: "", name: "voice-memo.mp3" })).toBe("audio");
    expect(inferMediaKind({ type: "text/plain", name: "readme.txt" })).toBeNull();

    await expect(
      createMediaFromFile(new File(["hello"], "readme.txt", { type: "text/plain" }))
    ).rejects.toThrow("Unsupported file type");
  });

  it("stores only lightweight metadata & Drive route in JSON snapshots while caching binary preview locally", async () => {
    const file = new File([new Uint8Array([137, 80, 78, 71])], "sketch.png", { type: "image/png" });
    const item = await createMediaFromFile(file, { title: "Sketch" });

    expect(item.driveRoute).toBe("panga/media/sketch.png");
    expect(item.uploadStatus).toBe("pending");
    expect(await db.mediaBlobs.get(item.id)).toBeDefined();

    const dbExport = await exportDbState();
    expect(dbExport.mediaItems).toHaveLength(1);
    expect(dbExport.mediaItems[0].driveRoute).toBe("panga/media/sketch.png");
    expect(dbExport.mediaBlobs).toBeUndefined();

    const snap = await exportSnapshot();
    expect(snap.data.mediaItems).toHaveLength(1);
    expect(snap.data.mediaBlobs).toBeUndefined();
    const jsonString = JSON.stringify(snap);
    expect(jsonString).toContain("panga/media/sketch.png");
  });

  it("uploads media multipart to Google Drive, updates route metadata, and re-hydrates cleared preview cache from Drive", async () => {
    const file = new File([new Uint8Array([1, 2, 3, 4])], "clip.ogg", { type: "audio/ogg" });
    const created = await createMediaFromFile(file);

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.includes("files?") && url.includes("name+%3D+%27panga%27")) {
        return new Response(JSON.stringify({ files: [{ id: "root-folder-1" }] }), { status: 200 });
      }
      if (url.includes("files?") && url.includes("name+%3D+%27media%27")) {
        return new Response(JSON.stringify({ files: [{ id: "media-folder-1" }] }), { status: 200 });
      }
      if (url.includes("upload/drive/v3/files") && init?.method === "POST") {
        return new Response(
          JSON.stringify({
            id: "drive-media-99",
            name: "clip.ogg",
            webViewLink: "https://drive.google.com/file/d/drive-media-99/view",
            mimeType: "audio/ogg",
            size: "4",
          }),
          { status: 200 }
        );
      }
      if (url.includes("/files/drive-media-99?alt=media")) {
        return new Response("downloaded-audio", {
          status: 200,
          headers: { "Content-Type": "audio/ogg" },
        });
      }
      return new Response("Not found", { status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const uploaded = await uploadMediaItemToDrive(created.id, "mock-drive-token");
    expect(uploaded).not.toBeNull();
    expect(uploaded!.uploadStatus).toBe("uploaded");
    expect(uploaded!.driveFileId).toBe("drive-media-99");
    expect(uploaded!.driveUrl).toBe("https://drive.google.com/file/d/drive-media-99/view");
    expect(uploaded!.driveRoute).toBe("panga/media/clip.ogg");

    // Evict local cached preview blob, then hydrate cleanly from Drive
    await db.mediaBlobs.delete(created.id);
    const list = await listMediaItems();
    const hydrated = await loadMediaPreviewBlob(list[0], "mock-drive-token");
    expect(hydrated).not.toBeNull();
    expect(hydrated!.source).toBe("drive");
    expect(await db.mediaBlobs.get(created.id)).toBeDefined();
  });

  it("evicts oldest cached media blobs when count exceeds MAX_CACHED_MEDIA_BLOBS", async () => {
    const totalToInsert = MAX_CACHED_MEDIA_BLOBS + 5;
    for (let i = 0; i < totalToInsert; i++) {
      await cacheMediaBlob(`blob-${i}`, new Blob(["x"], { type: "image/png" }), "image/png");
    }
    await pruneMediaBlobCache();
    const count = await db.mediaBlobs.count();
    expect(count).toBe(MAX_CACHED_MEDIA_BLOBS);
  });
});
