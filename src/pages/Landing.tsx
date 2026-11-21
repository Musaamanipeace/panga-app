import { useState, useCallback, useEffect } from "react";
import InstallButton from "../components/InstallButton";
import { useNavigate } from "react-router-dom";
import { setGuestMode, canUseApp, restoreSessionFromSnapshot, getSessionUserId } from "../auth/session";
import { hasLocalData, importDbState, clearAllLocalData } from "../data/db";
import { signIn, signUp } from "../sync/supabaseSync";

export default function Landing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const fileInputRef = useCallback((el: HTMLInputElement | null) => {
    if (el) el.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement | null;
      const f = target?.files?.[0];
      if (f && (f.name.endsWith(".json") || f.type === "application/json")) {
        void handleJsonImport(f);
      }
    });
  }, []);

  useEffect(() => {
    // If already signed in, go straight home
    if (getSessionUserId() || canUseApp()) {
      // still allow guest if no session
      void navigate("/home");
    }
  }, [navigate]);

  function reset() {
    setError(null);
    setSuccessNotice(null);
  }

  async function handleSignIn(kind: "in" | "up") {
    reset();
    setLoading(true);
    try {
      const res = kind === "in" ? await signIn(login.trim(), password) : await signUp(login.trim(), password);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccessNotice(kind === "up" ? "Account created. You're signed in." : "Signed in.");
        setTimeout(() => navigate("/home"), 600);
      }
    } catch (e: any) {
      setError(e?.message || "Authentication failed.");
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
      const data = parsed.data ?? parsed;
      if (!data || typeof data !== "object") {
        throw new Error("Invalid snapshot: expected an object with table arrays.");
      }
      await importDbState(data);
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

  async function handleContinueAsGuest() {
    reset();
    setLoading(true);
    try {
      const has = await hasLocalData();
      if (has) {
        await clearAllLocalData();
      }
      setGuestMode();
      navigate("/home");
    } catch (e: any) {
      setError(e?.message || "Could not start guest workspace.");
    } finally {
      setLoading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
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
        Capture thoughts, tick off tasks, keep links and notes — all offline-first.
      </p>
      <p className="landing-sub">
        Sign in to sync across devices, import a JSON backup, or continue as a guest.
        Nothing is forced — your data stays on this device by default.
      </p>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <InstallButton variant="large" />
      </div>

      <div className="landing-actions" style={{ maxWidth: 460, margin: "0 auto" }}>
        {/* Sign in */}
        <section className="landing-panel" style={{ marginBottom: 14 }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700 }}>Sign in</h2>
          <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--color-text-muted)" }}>
            Username + password. Synced to Supabase when you log in.
          </p>
          <form onSubmit={(e) => { e.preventDefault(); void handleSignIn("in"); }} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              autoFocus
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Username"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              style={{ padding: "8px 10px", fontSize: "13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", width: "100%" }}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (8+ characters)"
              autoComplete="current-password"
              spellCheck={false}
              style={{ padding: "8px 10px", fontSize: "13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", width: "100%" }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" className="btn-primary" disabled={loading || !login.trim() || !password}>
                {loading ? "Signing in…" : "Sign in"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                disabled={loading || !login.trim() || !password}
                onClick={() => void handleSignIn("up")}
              >
                Create account
              </button>
            </div>
          </form>
          {error && <p className="otp-error" style={{ marginTop: 8 }}>{error}</p>}
          {successNotice && <p className="otp-success" style={{ marginTop: 8 }}>{successNotice}</p>}
        </section>

        {/* Upload JSON */}
        <section className="landing-panel" style={{ marginBottom: 14 }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700 }}>Import JSON backup</h2>
          <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--color-text-muted)" }}>
            Restore a previously exported Panga snapshot.
          </p>
          <div
            className={`dropzone ${loading ? "dropzone-active" : ""}`}
            onDragOver={(e) => { e.preventDefault(); }}
            onDragLeave={() => {}}
            onDrop={onDrop}
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = ".json,application/json";
              input.onchange = (e: any) => {
                const f = e.target.files?.[0];
                if (f) void handleJsonImport(f);
              };
              input.click();
            }}
            role="button"
            tabIndex={0}
            style={{ border: "2px dashed var(--color-border)", borderRadius: "var(--radius)", padding: "20px 16px", textAlign: "center", cursor: "pointer", background: "var(--color-bg-subtle)" }}
          >
            <strong>Drop a .json snapshot here or click to choose a file</strong>
            <input ref={fileInputRef as any} type="file" accept=".json,application/json" style={{ display: "none" }} />
          </div>
          {error && <p className="otp-error" style={{ marginTop: 8 }}>{error}</p>}
          {successNotice && <p className="otp-success" style={{ marginTop: 8 }}>{successNotice}</p>}
        </section>

        {/* Continue as guest */}
        <section className="landing-panel">
          <h2 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700 }}>Continue as guest</h2>
          <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--color-text-muted)" }}>
            Work offline without an account. Data stays on this device only.
          </p>
          <button
            type="button"
            className="btn-primary btn-large clickable"
            disabled={loading}
            onClick={() => void handleContinueAsGuest()}
            style={{ width: "100%" }}
          >
            {loading ? "Starting…" : "Continue as guest"}
          </button>
        </section>
      </div>

      <footer className="landing-footer" style={{ marginTop: 20, fontSize: 12, color: "var(--color-text-muted)" }}>
        <span>Data stays on your device by default.</span>
        <span>Signed-in users sync to Supabase.</span>
      </footer>
    </div>
  );
}
