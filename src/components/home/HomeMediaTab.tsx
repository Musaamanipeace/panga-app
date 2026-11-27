import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createMediaFromFile,
  deleteMediaItem,
  formatBytes,
  listMediaItems,
  loadMediaPreviewBlob,
  updateMediaItem,
  uploadMediaItemToDrive,
  uploadPendingMediaToDrive,
  type MediaItem,
  type MediaKind,
} from "../../data/media";
import { getDriveAccessToken, googleSignIn, subscribeGoogleAuth, type GoogleAuthState } from "../../sync/googleAuth";
import { CopyButton, confirmDelete, showToast } from "../ui";

function formatDuration(sec?: number | null): string {
  if (!sec || !Number.isFinite(sec)) return "";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function HomeMediaTab({ initialMediaId }: { initialMediaId?: string | null }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [filter, setFilter] = useState<"all" | MediaKind>("all");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [auth, setAuth] = useState<GoogleAuthState | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlsRef = useRef<Record<string, string>>({});

  useEffect(() => {
    return subscribeGoogleAuth(setAuth);
  }, []);

  const reload = useCallback(async () => {
    const all = await listMediaItems();
    setItems(all);
  }, []);

  useEffect(() => {
    void reload();
    const onUpdate = () => void reload();
    window.addEventListener("panga-data-updated", onUpdate);
    return () => window.removeEventListener("panga-data-updated", onUpdate);
  }, [reload]);

  // Resolve cached / Drive preview object URLs for visible media items.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const token = await getDriveAccessToken();
      for (const item of items) {
        if (cancelled) return;
        if (urlsRef.current[item.id]) continue;
        try {
          const loaded = await loadMediaPreviewBlob(item, token);
          if (cancelled || !loaded) continue;
          const url = URL.createObjectURL(loaded.blob);
          urlsRef.current[item.id] = url;
          setPreviewUrls((prev) => ({ ...prev, [item.id]: url }));
        } catch {
          /* preview unavailable offline until Drive token/connection is live */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [items, auth?.hasAccessToken]);

  useEffect(() => {
    return () => {
      for (const url of Object.values(urlsRef.current)) {
        URL.revokeObjectURL(url);
      }
      urlsRef.current = {};
    };
  }, []);

  useEffect(() => {
    if (!lightboxItem) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxItem(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxItem]);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    let savedCount = 0;
    let uploadedCount = 0;
    try {
      const token = await getDriveAccessToken();
      for (const file of Array.from(fileList)) {
        try {
          const item = await createMediaFromFile(file, { token });
          savedCount++;
          if (item.uploadStatus === "uploaded") uploadedCount++;
        } catch (err: unknown) {
          showToast(err instanceof Error ? err.message : `Could not add ${file.name}`, "error");
        }
      }
      await reload();
      if (savedCount > 0) {
        if (uploadedCount === savedCount) {
          showToast(`Saved ${savedCount} media file${savedCount > 1 ? "s" : ""} to Google Drive.`, "success");
        } else if (uploadedCount > 0) {
          showToast(`Uploaded ${uploadedCount} to Drive; ${savedCount - uploadedCount} queued locally.`, "info");
        } else {
          showToast(
            `Cached ${savedCount} media file${savedCount > 1 ? "s" : ""} locally. Connect Google Drive to upload.`,
            "info"
          );
        }
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleUploadPending() {
    setUploading(true);
    try {
      let token = await getDriveAccessToken();
      if (!token) {
        const res = await googleSignIn();
        token = res.accessToken;
      }
      const { uploaded, failed } = await uploadPendingMediaToDrive(token);
      await reload();
      if (uploaded > 0) showToast(`Uploaded ${uploaded} media file${uploaded > 1 ? "s" : ""} to Drive.`, "success");
      else if (failed > 0) showToast(`${failed} upload(s) failed — please try again.`, "error");
      else showToast("All media files are already on Google Drive.", "info");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not connect Google Drive.", "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleRetryOne(item: MediaItem) {
    setUploading(true);
    try {
      let token = await getDriveAccessToken();
      if (!token) {
        const res = await googleSignIn();
        token = res.accessToken;
      }
      await uploadMediaItemToDrive(item.id, token);
      await reload();
      showToast(`Uploaded "${item.title}" to Google Drive.`, "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Drive upload failed.", "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleSaveEdit(e: React.FormEvent, id: string) {
    e.preventDefault();
    if (!editTitle.trim()) return;
    await updateMediaItem(id, { title: editTitle.trim(), notes: editNotes.trim() || undefined });
    setEditingId(null);
    await reload();
  }

  async function handleDelete(item: MediaItem) {
    if (
      !(await confirmDelete({
        kind: "media item",
        name: item.title,
        detail: "Removes the saved Drive route and local preview cache from this workspace.",
      }))
    ) {
      return;
    }
    if (urlsRef.current[item.id]) {
      URL.revokeObjectURL(urlsRef.current[item.id]);
      delete urlsRef.current[item.id];
      setPreviewUrls((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
    }
    await deleteMediaItem(item.id);
    if (lightboxItem?.id === item.id) setLightboxItem(null);
    await reload();
  }

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((m) => m.kind === filter)),
    [items, filter]
  );
  const pendingCount = useMemo(
    () => items.filter((m) => m.uploadStatus !== "uploaded").length,
    [items]
  );

  return (
    <div className="media-tab">
      <header className="tl-pane-head">
        <div>
          <h2>Media</h2>
          <p className="tl-empty" style={{ margin: "4px 0 0" }}>
            Save images &amp; audio to Google Drive (<code>panga/media</code>). JSON backups store routes only while recent previews cache locally.
          </p>
        </div>
        <div className="tl-head-actions">
          {pendingCount > 0 && (
            <button
              type="button"
              className="btn-secondary btn-small clickable"
              disabled={uploading}
              onClick={() => void handleUploadPending()}
            >
              {auth?.hasAccessToken ? `Upload pending (${pendingCount})` : `Connect Drive & upload (${pendingCount})`}
            </button>
          )}
          <button
            type="button"
            className="btn-primary btn-small clickable"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? "Uploading…" : "+ Add image / sound"}
          </button>
        </div>
      </header>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,audio/*"
        multiple
        aria-label="Add image or sound files"
        style={{ display: "none" }}
        onChange={(e) => {
          void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div
        className={`media-dropzone${dragActive ? " media-dropzone-active" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          void handleFiles(e.dataTransfer.files);
        }}
      >
        <span>Drop image or audio files here, or click <strong>+ Add image / sound</strong>.</span>
        <span className="media-drive-state">
          {auth?.hasAccessToken
            ? "Google Drive connected"
            : auth?.needsAuth
              ? "Reconnect Google Drive to upload directly"
              : "Previews cache offline until Drive is connected"}
        </span>
      </div>

      <div className="rem-toolbar" style={{ marginTop: 12 }}>
        <div className="rem-view-tabs" role="tablist" aria-label="Filter media">
          <button
            type="button"
            role="tab"
            aria-selected={filter === "all"}
            className={`rem-view-tab${filter === "all" ? " rem-view-tab-active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({items.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === "image"}
            className={`rem-view-tab${filter === "image" ? " rem-view-tab-active" : ""}`}
            onClick={() => setFilter("image")}
          >
            Images ({items.filter((m) => m.kind === "image").length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === "audio"}
            className={`rem-view-tab${filter === "audio" ? " rem-view-tab-active" : ""}`}
            onClick={() => setFilter("audio")}
          >
            Audio ({items.filter((m) => m.kind === "audio").length})
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="tl-empty tl-empty-pane">
          {items.length === 0
            ? "No media files yet. Add an image or sound recording to save its route here and upload to Drive."
            : `No ${filter} files in this workspace.`}
        </p>
      ) : (
        <ul className="media-grid">
          {filtered.map((item) => {
            const url = previewUrls[item.id];
            const isHighlighted = initialMediaId === item.id;
            const isEditing = editingId === item.id;
            return (
              <li
                key={item.id}
                className={`media-card${isHighlighted ? " media-card-highlight" : ""}`}
              >
                {item.kind === "image" ? (
                  <div className="media-thumb-wrap">
                    {url ? (
                      <button
                        type="button"
                        className="media-thumb-btn clickable"
                        onClick={() => setLightboxItem(item)}
                        aria-label={`Preview ${item.title}`}
                      >
                        <img src={url} alt={item.title} className="media-thumb" />
                      </button>
                    ) : (
                      <div className="media-placeholder">
                        {item.driveFileId
                          ? auth?.hasAccessToken
                            ? "Loading preview…"
                            : "Connect Drive to load image"
                          : "Preview unavailable offline"}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="media-audio-wrap">
                    {url ? (
                      <audio controls preload="metadata" src={url} className="media-audio-player" />
                    ) : (
                      <div className="media-placeholder">
                        {item.driveFileId
                          ? auth?.hasAccessToken
                            ? "Loading audio…"
                            : "Connect Drive to play audio"
                          : "Audio cached pending"}
                      </div>
                    )}
                  </div>
                )}

                {isEditing ? (
                  <form className="stack" onSubmit={(e) => void handleSaveEdit(e, item.id)}>
                    <input
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      aria-label="Media title"
                    />
                    <input
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Notes (optional)"
                      aria-label="Media notes"
                    />
                    <div className="btn-row">
                      <button type="submit" className="btn-primary btn-small clickable">Save</button>
                      <button type="button" className="btn-secondary btn-small clickable" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div className="media-card-body">
                    <div className="media-card-title">{item.title}</div>
                    <div className="media-card-meta">
                      <span>{item.kind === "audio" ? "Audio" : "Image"}</span>
                      <span>· {formatBytes(item.size)}</span>
                      {item.durationSeconds ? <span>· {formatDuration(item.durationSeconds)}</span> : null}
                      <span>
                        ·{" "}
                        {item.uploadStatus === "uploaded"
                          ? "On Google Drive"
                          : item.uploadStatus === "error"
                            ? "Upload failed"
                            : "Cached locally"}
                      </span>
                    </div>
                    <div className="media-card-route" title={item.driveRoute}>
                      {item.driveUrl ? (
                        <a href={item.driveUrl} target="_blank" rel="noopener noreferrer" className="pg-link">
                          {item.driveRoute}
                        </a>
                      ) : (
                        <span>{item.driveRoute}</span>
                      )}
                    </div>
                    {item.uploadError && item.uploadStatus === "error" && (
                      <p className="rem-form-error">{item.uploadError}</p>
                    )}
                    {item.notes && <p className="media-card-notes">{item.notes}</p>}
                  </div>
                )}

                <div className="media-card-actions">
                  <CopyButton text={item.driveUrl || item.driveRoute} label="Copy route" />
                  {item.uploadStatus !== "uploaded" && (
                    <button
                      type="button"
                      className="btn-secondary btn-small clickable"
                      disabled={uploading}
                      onClick={() => void handleRetryOne(item)}
                    >
                      Upload
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-secondary btn-small clickable"
                    onClick={() => {
                      setEditingId(item.id);
                      setEditTitle(item.title);
                      setEditNotes(item.notes ?? "");
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-secondary btn-small clickable tl-danger"
                    onClick={() => void handleDelete(item)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {lightboxItem && (
        <div
          className="confirm-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={lightboxItem.title}
          onClick={() => setLightboxItem(null)}
        >
          <div className="confirm-dialog media-lightbox" onClick={(e) => e.stopPropagation()}>
            <div className="panel-head-row">
              <strong className="panel-head-title">{lightboxItem.title}</strong>
              <button
                type="button"
                className="modal-close-x clickable"
                aria-label="Close preview"
                onClick={() => setLightboxItem(null)}
              >
                ×
              </button>
            </div>
            {previewUrls[lightboxItem.id] && (
              <img src={previewUrls[lightboxItem.id]} alt={lightboxItem.title} className="media-lightbox-img" />
            )}
            <div className="panel-foot-row">
              <button type="button" className="btn-secondary btn-small clickable" onClick={() => setLightboxItem(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
