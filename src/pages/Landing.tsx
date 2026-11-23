import { useState, useCallback, useEffect, useRef } from "react";
import InstallButton from "../components/InstallButton";
import { useNavigate } from "react-router-dom";
import { canUseApp, resetGuestSession, setGuestMode } from "../auth/session";
import { clearAllLocalData } from "../data/db";
import { importSnapshot, readSnapshotFile } from "../sync/snapshot";
import { confirmAction } from "../components/ui";

export default function Landing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (canUseApp()) {
      void navigate("/home");
    }
  }, [navigate]);

  const handleJsonImport = useCallback(
    async (file: File) => {
      setLoading(true);
      setError(null);
      setSuccessNotice(null);
      try {
        const snapshot = await readSnapshotFile(file);
        await importSnapshot(snapshot);
        setSuccessNotice("Backup restored. Opening workspace...");
        setTimeout(() => navigate("/home"), 400);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to import JSON. Check the file format.");
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  async function handleStartAfresh() {
    setError(null);
    const confirmed = await confirmAction({
      title: "Start afresh?",
      message: "This will wipe all existing local tasks, notes, links, reminders, and settings on this device.",
      confirmLabel: "Start afresh",
      cancelLabel: "Cancel",
      danger: true,
    });
    if (!confirmed) return;

    setLoading(true);
    try {
      await clearAllLocalData();
      await resetGuestSession();
      navigate("/home");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not start fresh workspace.");
    } finally {
      setLoading(false);
    }
  }

  async function handleContinueLocal() {
    setError(null);
    setLoading(true);
    try {
      await setGuestMode();
      navigate("/home");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not open local workspace.");
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
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <InstallButton variant="large" />
      </div>

      <div className="landing-actions" style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
        <section className="landing-panel">
          <h2 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700 }}>Continue local</h2>
          <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--color-text-muted)" }}>
            Keep your existing local data on this device.
          </p>
          <button
            type="button"
            className="btn-primary btn-large clickable"
            disabled={loading}
            onClick={() => void handleContinueLocal()}
            style={{ width: "100%" }}
          >
            {loading ? "Opening..." : "Continue local"}
          </button>
        </section>

        <section className="landing-panel">
          <h2 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700 }}>Start afresh</h2>
          <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--color-text-muted)" }}>
            Wipe local data after confirmation and start a clean workspace.
          </p>
          <button
            type="button"
            className="btn-secondary btn-large clickable"
            disabled={loading}
            onClick={() => void handleStartAfresh()}
            style={{ width: "100%" }}
          >
            Start afresh
          </button>
        </section>

        <section className="landing-panel">
          <h2 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700 }}>Upload JSON</h2>
          <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--color-text-muted)" }}>
            Restore a previously exported Panga JSON backup.
          </p>
          <div
            className={`dropzone ${loading ? "dropzone-active" : ""}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            style={{
              border: "2px dashed var(--color-border)",
              borderRadius: "var(--radius)",
              padding: "16px",
              textAlign: "center",
              cursor: "pointer",
              background: "var(--color-bg-subtle)",
            }}
          >
            <strong>Drop a .json file here or click to Upload JSON</strong>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleJsonImport(f);
                e.target.value = "";
              }}
            />
          </div>
        </section>

        {error && <p className="otp-error" style={{ margin: 0 }}>{error}</p>}
        {successNotice && <p className="otp-success" style={{ margin: 0 }}>{successNotice}</p>}
      </div>
    </div>
  );
}
