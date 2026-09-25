import { useEffect, useState, useCallback } from "react";
import { getGeminiApiKey, setGeminiApiKey } from "../data/settings";
import { getSessionKey, lockVault } from "../data/secrets";
import SecretsVault from "../components/SecretsVault";
import { syncGoogleCalendarEvents, connectGoogleCalendar, disconnectGoogleCalendar, isGoogleCalendarConnected } from "../sync/googleCalendar";

export default function Settings() {
  const [geminiKey, setGeminiKey] = useState("");
  const [geminiStatus, setGeminiStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [googleClientId, setGoogleClientId] = useState("");
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleImported, setGoogleImported] = useState<number | null>(null);

  const loadSettings = useCallback(async () => {
    const key = await getGeminiApiKey();
    setGeminiKey(key ?? "");
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
    setTimeout(() => setGeminiStatus("idle"), 2000);
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
    } catch (err: { message?: string; toString: () => string }) {
      setGoogleError(err.message ?? err.toString());
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

      {/* §3 — Gemini API key */}
      <section className="settings-section">
        <h2>Gemini API Key (Scheduler AI)</h2>
        <p className="settings-help">
          Used by the Scheduler's AI Plan mode to interpret natural-language scheduling
          requests. Get a free key from{" "}
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">
            Google AI Studio
          </a>
          . Stored client-side only.
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
            {geminiStatus === "saving" ? "Saving..." : geminiStatus === "saved" ? "Saved" : "Save"}
          </button>
        </form>
      </section>

      {/* §4 — Google Calendar OAuth */}
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

      {/* §5 — Secrets vault */}
      <section className="settings-section">
        <h2>Secrets Vault</h2>
        <p className="settings-help">
          Your secrets are encrypted client-side with AES-GCM using a passphrase-derived
          key (PBKDF2). The passphrase is never stored — only a verification hash.
          {getSessionKey() && (
            <button
              className="btn-secondary btn-small clickable"
              style={{ marginLeft: 8 }}
              data-tip="Lock the vault now"
              onClick={lockVault}
            >
              Lock now
            </button>
          )}
        </p>
        <SecretsVault />
      </section>
    </div>
  );
}
