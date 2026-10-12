import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { setGuestMode, canUseApp, restoreSessionFromSnapshot, resetGuestSession } from "../auth/session";
import { hasLocalData, importDbState, clearAllLocalData } from "../data/db";
import { signIn, signUp } from "../sync/sync";

type Mode = "choose" | "login" | "signup" | "import";

export default function Landing() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("choose");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [confirmStartAfresh, setConfirmStartAfresh] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setError(null);
    setSuccessNotice(null);
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
      // Generate a brand new clean guest session ID
      resetGuestSession();
      // Clear local UI cached states
      try {
        localStorage.removeItem("panga_home_expanded");
        localStorage.removeItem("panga_last_sync_info");
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
      setGuestMode(); // keep guest flag cleared by restore? ensure usable
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

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    if (mode === "signup" && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    reset();
    if (mode === "signup") {
      const result = await signUp(email.trim(), password);
      setLoading(false);
      if (result.error) {
        setError(result.error);
        return;
      }
      navigate("/home");
      return;
    }
    const result = await signIn(email.trim(), password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    navigate("/home");
  }

  return (
    <div className="page landing">
      <div className="landing-mark" data-tip="Panga">P</div>
      <h1>Panga</h1>
      <p className="landing-tagline">
        Local-first project &amp; resource planner for focused work in distracting places.
      </p>
      <p className="landing-sub">
        Save progress on this device. Optionally sync with Google Drive or GitHub Gist.
        No forced account — start offline and log in later.
      </p>

      {mode === "choose" && (
        <div className="landing-actions">
          {/* Section: Continue Offline (Title, not a button) */}
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

          <p className="landing-or">or connect later in Settings → Backup &amp; Sync</p>

          <div className="landing-secondary-row">
            <button
              type="button"
              className="chip clickable"
              onClick={() => {
                setMode("login");
                reset();
              }}
            >
              Optional email login
            </button>
            <button
              type="button"
              className="chip clickable"
              onClick={() => {
                setMode("signup");
                reset();
              }}
            >
              Create local account
            </button>
          </div>
        </div>
      )}

      {(mode === "login" || mode === "signup") && (
        <div className="auth-panel">
          <button
            type="button"
            className="btn-text clickable"
            onClick={() => {
              setMode("choose");
              reset();
            }}
          >
            ← Back
          </button>
          <form className="otp-overlay" onSubmit={handleEmailSubmit}>
            <label htmlFor="email-input">
              {mode === "signup" ? "Create a local account" : "Sign in (local or cloud if available)"}
            </label>
            <input
              id="email-input"
              autoFocus
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              id="password-input"
              type="password"
              required
              minLength={6}
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ marginTop: "8px" }}
            />
            <button
              type="submit"
              className="btn-primary btn-login blade-glint clickable"
              disabled={loading}
            >
              {loading ? "Working…" : mode === "signup" ? "Create Account" : "Login"}
            </button>
          </form>
        </div>
      )}

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
        <span>Cloud sync uses your own Google Drive or GitHub Gist account.</span>
      </footer>
    </div>
  );
}
