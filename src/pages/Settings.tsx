import { useEffect, useState, useCallback } from "react";
import { getGeminiApiKey, setGeminiApiKey } from "../data/settings";
import {
  syncAll,
  getLastSyncTime,
} from "../sync/sync";
import { getSessionEmail, getSessionUserId } from "../auth/session";
import {
  syncGoogleCalendarEvents,
  connectGoogleCalendar,
  disconnectGoogleCalendar,
  isGoogleCalendarConnected,
} from "../sync/googleCalendar";

export default function Settings() {
  const email = getSessionEmail();
  const userId = getSessionUserId();

  // Gemini settings
  const [geminiKey, setGeminiKey] = useState("");
  const [geminiStatus, setGeminiStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Cloud Sync status
  const [cloudConnected, setCloudConnected] = useState<boolean | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [syncingNow, setSyncingNow] = useState(false);
  const [lastSync, setLastSync] = useState<number>(0);

  // Google Calendar settings
  const [googleClientId, setGoogleClientId] = useState("");
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleImported, setGoogleImported] = useState<number | null>(null);

  const loadSettings = useCallback(async () => {
    const key = await getGeminiApiKey();
    setGeminiKey(key ?? "");
    setLastSync(getLastSyncTime());

    // Check cloud server connectivity
    try {
      const res = await fetch("/health");
      setCloudConnected(res.ok);
    } catch {
      setCloudConnected(false);
    }
  }, []);

  const checkGoogle = useCallback(async () => {
    setGoogleConnected(await isGoogleCalendarConnected());
  }, []);

  useEffect(() => {
    void loadSettings();
    void checkGoogle();
  }, [loadSettings, checkGoogle]);

  async function saveGeminiKey(e: React.FormEvent) {
    e.preventDefault();
    setGeminiStatus("saving");
    await setGeminiApiKey(geminiKey.trim());
    setGeminiStatus("saved");
    setTimeout(() => setGeminiStatus("idle"), 2500);
  }

  async function handleSyncNow(forceFull = false) {
    setSyncingNow(true);
    setSyncStatus(null);
    const res = await syncAll(forceFull);
    setSyncingNow(false);
    setSyncStatus(res.message);
    setLastSync(getLastSyncTime());
  }

  function handleExportCloudBackup() {
    if (!userId) return;
    window.open(`/api/sync/export?userId=${encodeURIComponent(userId)}`, "_blank");
  }

  async function handleGoogleConnect(e: React.FormEvent) {
    e.preventDefault();
    if (!googleClientId.trim()) {
      setGoogleError("Client ID is required.");
      return;
    }
    setGoogleLoading(true);
    setGoogleError(null);
    try {
      await connectGoogleCalendar(googleClientId.trim());
      const connected = await isGoogleCalendarConnected();
      setGoogleConnected(connected);
      if (connected) {
        const result = await syncGoogleCalendarEvents();
        setGoogleImported(result.imported);
        if (result.error) setGoogleError(result.error);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setGoogleError(message);
    }
    setGoogleLoading(false);
  }

  async function handleGoogleDisconnect() {
    await disconnectGoogleCalendar();
    setGoogleConnected(false);
    setGoogleImported(null);
  }

  return (
    <div className="page settings-page">
      <header className="page-header">
        <h1>Settings</h1>
      </header>

      {/* §1 — Cloud Database Sync & Persistence */}
      <section className="settings-section" style={{ borderLeft: "4px solid var(--color-accent-primary)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <h2 style={{ margin: 0 }}>Cloud Database &amp; Multi-Device Sync</h2>
          <span
            className="chip-small"
            style={{
              background: cloudConnected ? "#ecfdf5" : "#fef3c7",
              color: cloudConnected ? "#065f46" : "#92400e",
              fontWeight: 600,
            }}
          >
            {cloudConnected ? "✓ Cloud Server Connected" : "⚠️ Cloud Server Unreachable"}
          </span>
        </div>

        <p className="settings-help">
          Your projects, tasks, resources, notes, milestones, reminders, and settings are backed up and synchronized to your private cloud storage on Fly.io, with full offline browser caching via IndexedDB.
        </p>

        {email && (
          <div style={{ margin: "8px 0 14px 0", fontSize: "13px", color: "var(--color-text-muted)" }}>
            Signed in as: <strong style={{ color: "var(--color-text-normal)" }}>{email}</strong>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 12 }}>
          <button
            type="button"
            className="btn-primary clickable"
            onClick={() => handleSyncNow(false)}
            disabled={syncingNow}
            data-tip="Synchronize changes bi-directionally with the cloud"
          >
            {syncingNow ? "Syncing..." : "☁️ Sync with Cloud Now"}
          </button>

          <button
            type="button"
            className="btn-secondary clickable"
            onClick={() => handleSyncNow(true)}
            disabled={syncingNow}
            data-tip="Upload all local records into cloud database"
          >
            ⬆️ Force Full Upload
          </button>

          <button
            type="button"
            className="btn-secondary btn-small clickable"
            onClick={handleExportCloudBackup}
            disabled={!userId}
            data-tip="Download a complete JSON export of your cloud database"
          >
            📥 Download Cloud Backup
          </button>

          {lastSync > 0 && (
            <span style={{ fontSize: "12px", color: "var(--color-text-muted)", marginLeft: "auto" }}>
              Last synced: {new Date(lastSync).toLocaleTimeString()}
            </span>
          )}
        </div>

        {syncStatus && (
          <p
            className="progress-label"
            style={{
              marginTop: 12,
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              background: syncStatus.includes("failed") || syncStatus.includes("error") ? "#fef2f2" : "#f0fdf4",
              color: syncStatus.includes("failed") || syncStatus.includes("error") ? "#991b1b" : "#166534",
              border: "1px solid var(--color-border)",
            }}
          >
            {syncStatus}
          </p>
        )}
      </section>

      {/* §2 — Gemini API key */}
      <section className="settings-section">
        <h2>Gemini API Key (AI Assistant &amp; Scheduler)</h2>
        <p className="settings-help">
          Used by the AI Assistant chat and natural language planning. Get a free key from{" "}
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">
            Google AI Studio
          </a>
          .
        </p>
        <form className="settings-form" onSubmit={saveGeminiKey}>
          <input
            type="text"
            placeholder="AIza..."
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
            data-tip="Your Gemini API key from Google AI Studio"
          />
          <button type="submit" className="btn-primary clickable" disabled={geminiStatus === "saving"}>
            {geminiStatus === "saving" ? "Saving..." : geminiStatus === "saved" ? "Saved ✓" : "Save Key"}
          </button>
        </form>
        {geminiStatus === "saved" && (
          <p style={{ fontSize: "12px", color: "green", marginTop: 6 }}>
            ✓ Gemini API key saved!
          </p>
        )}
      </section>

      {/* §3 — Google Calendar OAuth */}
      <section className="settings-section">
        <h2>Google Calendar</h2>
        <p className="settings-help">
          Connect your Google Calendar to import events (including Meet links) into the
          Calendar tab. Requires a Google Cloud OAuth 2.0 Client ID with the Calendar API
          enabled. See{" "}
          <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer">
            Google Cloud Console
          </a>
          .
        </p>

        {!googleConnected ? (
          <form className="settings-form" onSubmit={handleGoogleConnect}>
            <input
              type="text"
              placeholder="OAuth 2.0 Client ID (Web application)"
              value={googleClientId}
              onChange={(e) => setGoogleClientId(e.target.value)}
              data-tip="Paste your Google OAuth Client ID here"
            />
            <button
              type="submit"
              className="btn-primary clickable"
              disabled={googleLoading}
              data-tip="Connect Google Calendar"
            >
              {googleLoading ? "Connecting..." : "Connect"}
            </button>
            {googleError && <p className="otp-error">{googleError}</p>}
          </form>
        ) : (
          <div>
            <p className="progress-label">Connected to Google Calendar.</p>
            {googleImported !== null && (
              <p className="progress-label">{googleImported} event(s) imported.</p>
            )}
            <button
              className="btn-secondary clickable"
              data-tip="Disconnect Google Calendar"
              onClick={handleGoogleDisconnect}
            >
              Disconnect
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
