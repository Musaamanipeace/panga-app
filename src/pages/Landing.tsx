import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { setGuestMode, canUseApp, restoreSessionFromSnapshot, resetGuestSession, getUserScopedKey, getSessionUserId } from "../auth/session";
import { hasLocalData, importDbState, clearAllLocalData } from "../data/db";
import { openPuterSignIn } from "../sync/puterSync";
import { isPuterAvailable, getCachedPuterUser } from "../auth/puterAuth";

export default function Landing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [puterLoading, setPuterLoading] = useState(false);
  const [puterError, setPuterError] = useState<string | null>(null);
  const [puterReady, setPuterReady] = useState<boolean>(() => isPuterAvailable());
  const cachedPuterUser = getCachedPuterUser();
  const [dragOver, setDragOver] = useState(false);
  const [confirmStartAfresh, setConfirmStartAfresh] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setError(null);
    setSuccessNotice(null);
  }

  // Re-inject the Puter SDK script if it failed to load (blocked, offline, stale SW...)
  function loadPuterScript(): Promise<boolean> {
    if (isPuterAvailable()) return Promise.resolve(true);
    return new Promise((resolve) => {
      const el = document.createElement("script");
      el.src = "https://js.puter.com/v2/";
      el.onload = () => resolve(isPuterAvailable());
      el.onerror = () => resolve(false);
      document.head.appendChild(el);
    });
  }

  async function handlePuterSignIn() {
    setPuterLoading(true);
    setPuterError(null);
    try {
      if (!isPuterAvailable()) {
        const ok = await loadPuterScript();
        setPuterReady(ok);
        if (!ok) {
          setPuterError(
            "Couldn't load the Puter SDK. Check your connection, disable ad-blockers for this site, then try again."
          );
          return;
        }
      }
      const user = await openPuterSignIn();
      if (user) {
        setSuccessNotice("Signed in to Puter — syncing your workspace…");
        setTimeout(() => navigate("/home"), 800);
      }
    } catch (e: any) {
      setPuterError(e?.message || "Puter sign-in failed.");
    } finally {
      setPuterLoading(false);
    }
  }

  async function handleStartAfreshClick() {
    reset();
    try {
      const has = await hasLocalData();
      if (has) {
        setConfirmStartAfresh(true);
      } else {
        await performStartAfresh();
      }
    } catch {
      await performStartAfresh();
    }
  }

  async function performStartAfresh() {
    setLoading(true);
    reset();
    setConfirmStartAfresh(false);
    try {
      // Clear all local database tables so existing data is never resumed
      await clearAllLocalData();
      // Generate a brand new clean guest session ID and switch DB
      resetGuestSession();
      const { switchUserAccount } = await import("../data/db");
      await switchUserAccount();
      // Clear local UI cached states
      try {
        localStorage.removeItem(getUserScopedKey("panga_home_expanded"));
        localStorage.removeItem(`panga_last_sync_info_${getSessionUserId() || "guest"}`);
      } catch {}
      navigate("/home");
    } catch (e: any) {
      setError(e?.message || "Could not start fresh offline workspace.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResumeLocal() {
    setLoading(true);
    reset();
    setConfirmStartAfresh(false);
    try {
      const has = await hasLocalData();
      if (has || canUseApp()) {
        if (!canUseApp()) setGuestMode();
        // Ensure DB is bound to the current session user
        const { switchUserAccount } = await import("../data/db");
        void switchUserAccount();
        navigate("/home");
      } else {
        setError("No saved local data found on this device. Click 'Start Afresh' to begin a new workspace, or import a JSON backup.");
      }
    } finally {
      setLoading(false);
    }
  }

  const handleJsonImport = useCallback(async (file: File) => {
    setLoading(true);
    reset();
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      // Support both { metadata, data } and flat table maps
      const data = parsed.data ?? parsed;
      if (!data || typeof data !== "object") {
        throw new Error("Invalid snapshot: expected an object with table arrays.");
      }
      await importDbState(data);
      // Optional email from metadata for session
      const emailFromMeta =
        parsed.metadata?.email ||
        parsed.metadata?.userEmail ||
        "imported@local";
      await restoreSessionFromSnapshot(emailFromMeta);
      setSuccessNotice("Backup restored. Opening workspace…");
      setTimeout(() => navigate("/home"), 600);
    } catch (e: any) {
      setError(e?.message || "Failed to import JSON. Check the file format.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && (f.name.endsWith(".json") || f.type === "application/json")) {
      void handleJsonImport(f);
    } else {
      setError("Please drop a .json backup file.");
    }
  }

  return (
    <div className="page landing">
      <div className="landing-mark" data-tip="Panga">P</div>
      <h1>Panga</h1>
      <p className="landing-tagline">
        Local-first project &amp; resource planner for focused work in distracting places.
      </p>
      <p className="landing-sub">
        Save progress on this device. Optionally sync with Puter or Google Drive.
        No forced account — start offline and go.
      </p>

      <div className="landing-actions">
        {/* Section: Continue Offline */}
        <div className="landing-offline-section" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ textAlign: "center", marginBottom: 2 }}>
            <h2 style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: 700, color: "var(--color-text)" }}>
              Continue Offline
            </h2>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--color-text-muted)" }}>
              Work locally without an account. Data stays on this device.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              type="button"
              className="btn-primary btn-large blade-glint clickable"
              disabled={loading}
              onClick={() => void handleStartAfreshClick()}
              data-tip="Start with a completely blank workspace. Clears existing local data so you begin fresh."
            >
              {loading ? "Starting…" : "Start Afresh"}
            </button>

            <button
              type="button"
              className="btn-secondary btn-large clickable"
              disabled={loading}
              onClick={() => void handleResumeLocal()}
              data-tip="Continue working with the existing data saved on this browser."
            >
              {loading ? "Checking…" : "Resume Local"}
            </button>
          </div>

          {confirmStartAfresh && (
            <div
              style={{
                background: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: "var(--radius)",
                padding: "14px",
                fontSize: "13px",
                color: "#92400e",
                textAlign: "left",
                marginTop: 4,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                ⚠️ Confirm Start Afresh
              </div>
              <p style={{ margin: "0 0 10px 0", lineHeight: 1.45 }}>
                Existing local data was found on this device. Starting afresh will erase all current local projects, tasks, and notes so you begin with a blank workspace.
              </p>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="btn-secondary btn-small clickable"
                  onClick={() => setConfirmStartAfresh(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary btn-small clickable"
                  style={{ background: "#dc2626", borderColor: "#dc2626" }}
                  onClick={() => void performStartAfresh()}
                >
                  Yes, Clear &amp; Start Afresh
                </button>
              </div>
            </div>
          )}
         </div>

        {/* --- Puter Cloud Sync (always visible) --- */}
        <div
          className="landing-puter-section"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: "16px",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h2 style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: 700 }}>
              Sync with Puter
            </h2>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--color-text-muted)" }}>
              Save your workspace to your Puter cloud account and access it on any device.
            </p>
          </div>
          <button
            type="button"
            className="btn-primary btn-large blade-glint clickable"
            disabled={puterLoading}
            onClick={() => void handlePuterSignIn()}
          >
            {puterLoading
              ? "Signing in…"
              : !puterReady
              ? "Retry loading Puter"
              : cachedPuterUser
              ? `Continue as ${cachedPuterUser.name || cachedPuterUser.username}`
              : "Sign in with Puter"}
          </button>
          {!puterReady && !puterError && (
            <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0, textAlign: "center" }}>
              The Puter SDK hasn&apos;t loaded yet. Tap to retry.
            </p>
          )}
          {puterError && (
            <p style={{ fontSize: "12px", color: "var(--color-accent-issue)", margin: 0 }}>
              {puterError}
            </p>
          )}
        </div>

        <div
          className={`dropzone ${dragOver ? "dropzone-active" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
        >
          <strong>Import JSON backup</strong>
          <span>Drop a .json snapshot here or click to choose a file</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleJsonImport(f);
            }}
          />
        </div>

        <p className="landing-or">or connect later in Settings → Cloud Sync</p>
      </div>

      {error && (
        <p className="otp-error" style={{ marginTop: 16 }}>
          {error}
        </p>
      )}
      {successNotice && (
        <p className="otp-success" style={{ marginTop: 16 }}>
          ✓ {successNotice}
        </p>
      )}

      <footer className="landing-footer">
        <span>Data stays on your device by default.</span>
        <span>Cloud sync uses your own Google Drive account.</span>
      </footer>
    </div>
  );
}
