import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { setGuestMode, canUseApp, restoreSessionFromSnapshot } from "../auth/session";
import { hasLocalData, importDbState } from "../data/db";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setError(null);
    setSuccessNotice(null);
  }

  async function startGuest() {
    setLoading(true);
    reset();
    try {
      setGuestMode();
      // If no local data, seed will run on next load
      navigate("/home");
    } catch (e: any) {
      setError(e?.message || "Could not start offline mode.");
    } finally {
      setLoading(false);
    }
  }

  async function continueIfLocal() {
    setLoading(true);
    try {
      const has = await hasLocalData();
      if (has || canUseApp()) {
        if (!canUseApp()) setGuestMode();
        navigate("/home");
      } else {
        setError("No local data found. Start fresh or import a JSON backup.");
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
        Save progress on this device. Optionally sync with Google Drive, GitHub Gist, or Nextcloud.
        No forced account — start offline and log in later.
      </p>

      {mode === "choose" && (
        <div className="landing-actions">
          <button
            type="button"
            className="btn-primary btn-large blade-glint clickable"
            disabled={loading}
            onClick={() => void startGuest()}
            data-tip="Use the app offline. Data stays on this device until you export or connect cloud."
          >
            {loading ? "Starting…" : "Continue offline / Start fresh"}
          </button>

          <button
            type="button"
            className="btn-secondary btn-large clickable"
            disabled={loading}
            onClick={() => void continueIfLocal()}
          >
            Resume local data (if any)
          </button>

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
        <span>Cloud sync uses your own Google Drive, GitHub Gist, or Nextcloud account.</span>
      </footer>
    </div>
  );
}
