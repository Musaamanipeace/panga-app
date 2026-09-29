import { useState, useEffect, useRef, useCallback } from "react";
import { signIn, signUp } from "../sync/sync";
import { hasAnyData, importSnapshot, readSnapshotFile } from "../sync/snapshot";
import { restoreSessionFromSnapshot } from "../auth/session";

type Mode = "login" | "signup";

export default function Landing() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pressed, setPressed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dataChecked = useRef(false);

  function resetMode() {
    setError(null);
    setSuccessNotice(null);
  }

  useEffect(() => {
    if (dataChecked.current) return;
    dataChecked.current = true;
    hasAnyData().then((exists) => setHasData(exists));
  }, []);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    if (mode === "signup" && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setPressed(true);
    setTimeout(() => setPressed(false), 80);
    setError(null);
    setSuccessNotice(null);
    setLoading(true);

    if (mode === "signup") {
      const result = await signUp(email.trim(), password);
      setLoading(false);
      if (result.error) {
        setError(result.error);
        return;
      }
      window.location.assign("/dashboard");
      return;
    }

    // Login
    const result = await signIn(email.trim(), password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    // signIn stores the session; navigate to dashboard
    window.location.assign("/dashboard");
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      setError("Please select a valid .json snapshot file.");
      return;
    }

    await importSnapshotFromFile(file);
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await importSnapshotFromFile(file);
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  async function importSnapshotFromFile(file: File) {
    if (snapshotLoading) return;
    setSnapshotLoading(true);
    setError(null);
    setSuccessNotice(null);

    try {
      const snapshot = await readSnapshotFile(file);
      await importSnapshot(snapshot);

      // Set a session so the app can continue. Use the email from the form
      // if provided, otherwise use a default.
      const sessionEmail = email.trim() || "restored@local";
      const result = await restoreSessionFromSnapshot(sessionEmail);
      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccessNotice("Snapshot restored successfully! Redirecting...");
      setTimeout(() => window.location.assign("/dashboard"), 800);
    } catch (err) {
      setError(`Failed to restore snapshot: ${(err as Error).message}`);
    } finally {
      setSnapshotLoading(false);
    }
  }

  return (
    <div className="page landing">
      <div className="landing-mark" data-tip="Panga">P</div>
      <h1>Panga</h1>
      <p>Project & resource planner.</p>

      <div
        className="auth-mode-container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          margin: "16px 0 20px 0",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            type="button"
            className={`chip ${mode === "login" ? "chip-active" : ""}`}
            onClick={() => { setMode("login"); resetMode(); }}
          >
            Login
          </button>
          <button
            type="button"
            className={`chip ${mode === "signup" ? "chip-active" : ""}`}
            onClick={() => { setMode("signup"); resetMode(); }}
          >
            Sign Up
          </button>
        </div>
      </div>

      <form className="otp-overlay" onSubmit={handleEmailSubmit}>
        <label htmlFor="email-input">
          {mode === "signup" ? "Create an account" : "Welcome back — sign in"}
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
          className={`btn-primary btn-login blade-glint clickable ${pressed ? "btn-pressed" : ""}`}
          disabled={loading}
        >
          {loading
            ? "Working..."
            : mode === "signup"
              ? "Create Account"
              : "Login"}
        </button>

        {error && (
          <div style={{ marginTop: "12px" }}>
            <p className="otp-error">{error}</p>
          </div>
        )}

        {successNotice && (
          <p
            className="otp-error"
            style={{
              marginTop: "12px",
              color: "#065f46",
              background: "#ecfdf5",
              borderColor: "#a7f3d0",
              padding: "8px 12px",
              borderRadius: "var(--radius)",
            }}
          >
            ✓ {successNotice}
          </p>
        )}
      </form>

      {/* Quick Upload / Restore Snapshot */}
      {!hasData && (
        <section
          className={`snapshot-dropzone ${dragActive ? "drag-active" : ""}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          style={{
            marginTop: "24px",
            padding: "24px",
            border: "2px dashed var(--color-border)",
            borderRadius: "var(--radius)",
            background: dragActive ? "var(--color-accent-primary-light)" : "transparent",
            transition: "all 0.2s ease",
            textAlign: "center",
          }}
        >
          <p style={{ margin: "0 0 8px 0", fontWeight: 600, fontSize: "16px" }}>
            Quick Upload / Restore Snapshot
          </p>
          <p style={{ margin: "0 0 16px 0", color: "var(--color-text-muted)", fontSize: "14px" }}>
            Drag & drop a <code>.json</code> snapshot backup here, or click to browse.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            style={{ display: "none" }}
            id="snapshot-file-input"
          />

          <button
            type="button"
            className="btn-secondary clickable"
            onClick={() => fileInputRef.current?.click()}
            disabled={snapshotLoading}
            style={{ marginBottom: "12px" }}
          >
            {snapshotLoading ? "Restoring..." : "Choose Snapshot File"}
          </button>

          <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "var(--color-text-muted)" }}>
            Restores projects, tasks, resources, and settings. No account required.
          </p>
        </section>
      )}
    </div>
  );
}