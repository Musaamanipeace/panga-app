import { useEffect, useState, useCallback, useRef } from "react";
import {
  getGeminiApiKey,
  setGeminiApiKey,
  getGoogleClientId,
  setGoogleClientId,
  getEmailBackupApiKey,
  setEmailBackupApiKey,
  getEmailBackupProvider,
  setEmailBackupProvider,
  getActiveSyncProvider,
  setActiveSyncProvider,
  getLastSyncInfo,
  setLastSyncInfo,
  type CloudSyncProvider,
  type LastSyncInfo,
} from "../data/settings";
import {
  downloadSnapshot,
  readSnapshotFile,
  importSnapshot,
  exportSnapshot,
  type Snapshot,
} from "../sync/snapshot";
import { syncAll } from "../sync/sync";
import { enableAutoSync } from "../sync/autoSync";
import {
  isPuterAvailable,
} from "../auth/puterAuth";
import {
  getPuterSyncState,
  subscribePuterSync,
  openPuterSignOut,
  openPuterSignIn,
  exportPuterCloud,
  type PuterSyncState,
} from "../sync/puterSync";
import {
  connectGoogleDrive,
  disconnectGoogleDrive,
  isGoogleDriveConnected,
  getStoredToken,
  syncNowToGoogleDrive,
  fetchDriveBackupForRestore,
  } from "../sync/googleDriveSync";

const PROVIDER_NAMES: Record<CloudSyncProvider, string> = {
  google_drive: "Google Drive",
};

export default function Settings() {
  // Gemini settings
  const [geminiKey, setGeminiKey] = useState("");
  const [geminiStatus, setGeminiStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Local storage / backup status
  const [backupStatus, setBackupStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const [backupLoading, setBackupLoading] = useState(false);

  // Email backup
  const [emailBackupEmail, setEmailBackupEmail] = useState("");
  const [emailBackupStatus, setEmailBackupStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [emailBackupMessage, setEmailBackupMessage] = useState<string | null>(null);
  const [emailApiKey, setEmailApiKey] = useState("");
  const [emailProvider, setEmailProvider] = useState("resend");
  const [emailConfigSaved, setEmailConfigSaved] = useState(false);
  const [showEmailConfig, setShowEmailConfig] = useState(false);

  // Multi-Cloud Sync state
  const [activeProvider, setActiveProviderState] = useState<CloudSyncProvider>("google_drive");
  const [selectedProviderTab, setSelectedProviderTab] = useState<CloudSyncProvider>("google_drive");
  const [lastSync, setLastSync] = useState<LastSyncInfo | null>(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [cloudSyncMessage, setCloudSyncMessage] = useState("");

  // Google Drive state
  const [googleClientId, setGoogleClientIdState] = useState("");
  const [googleClientIdSaved, setGoogleClientIdSaved] = useState(false);
  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [driveTokenExpiresAt, setDriveTokenExpiresAt] = useState<number | null>(null);

  // Restore confirmation modal
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [restoreData, setRestoreData] = useState<Snapshot | null>(null);

  // File input ref for snapshot upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Puter auth state
  const [puterState, setPuterState] = useState<PuterSyncState>(getPuterSyncState());
  const [puterSigningOut, setPuterSigningOut] = useState(false);
  const [puterError, setPuterError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    const key = await getGeminiApiKey();
    setGeminiKey(key ?? "");
    const emailKey = await getEmailBackupApiKey();
    setEmailApiKey(emailKey ?? "");
    const provider = await getEmailBackupProvider();
    setEmailProvider(provider ?? "resend");

    // Multi-provider settings
    const currentProvider = await getActiveSyncProvider();
    setActiveProviderState(currentProvider);
    setSelectedProviderTab(currentProvider);
    const lastSyncInfo = await getLastSyncInfo();
    setLastSync(lastSyncInfo);

    // Google Drive state
    const savedClientId = await getGoogleClientId();
    const envClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || "";
    setGoogleClientIdState(savedClientId || envClientId || "");

    const connected = await isGoogleDriveConnected();
    setIsDriveConnected(connected);
    const storedToken = await getStoredToken();
    if (storedToken) {
      setDriveTokenExpiresAt(storedToken.expires_at);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
    return subscribePuterSync(setPuterState);
  }, [loadSettings]);

  async function saveGeminiKey(e: React.FormEvent) {
    e.preventDefault();
    setGeminiStatus("saving");
    await setGeminiApiKey(geminiKey.trim());
    setGeminiStatus("saved");
    setTimeout(() => setGeminiStatus("idle"), 2500);
  }

  async function handlePuterSignOut() {
    setPuterSigningOut(true);
    try {
      await openPuterSignOut();
      void window.location.reload();
    } finally {
      setPuterSigningOut(false);
    }
  }

  // Sync all data to Puter cloud immediately
  async function handlePuterSyncNow() {
    const ok = await exportPuterCloud();
    if (!ok) {
      setPuterError("Sync failed. Check your Puter connection.");
    }
  }

  async function handleDownloadBackup() {
    setBackupLoading(true);
    setBackupStatus("saving");

    setBackupMessage("Preparing backup...");
    try {
      await downloadSnapshot();
      setBackupStatus("saved");
      setBackupMessage("Backup downloaded successfully.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setBackupStatus("error");
      setBackupMessage(`Download failed: ${message}`);
    } finally {
      setBackupLoading(false);
    }
  }

  async function handleUploadSnapshot(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBackupLoading(true);
    setBackupStatus("saving");
    setBackupMessage("Restoring snapshot...");
    try {
      const snapshot = await readSnapshotFile(file);
      await importSnapshot(snapshot);
      setBackupStatus("saved");
      setBackupMessage("Snapshot restored from local file.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setBackupStatus("error");
      setBackupMessage(`Restore failed: ${message}`);
    } finally {
      setBackupLoading(false);
      e.target.value = "";
    }
  }

  async function handleSaveEmailConfig(e: React.FormEvent) {
    e.preventDefault();
    await setEmailBackupApiKey(emailApiKey.trim());
    await setEmailBackupProvider(emailProvider);
    setEmailConfigSaved(true);
    setTimeout(() => setEmailConfigSaved(false), 2500);
  }

  async function handleEmailBackup() {
    if (!emailBackupEmail.trim() || !emailBackupEmail.includes('@')) {
      setEmailBackupMessage("Please enter a valid email address.");
      setEmailBackupStatus("error");
      return;
    }

    setBackupLoading(true);
    setEmailBackupStatus("sending");
    setEmailBackupMessage("Generating backup and sending email...");

    try {
      // Generate snapshot
      const snapshot = await exportSnapshot();

      // Send to API with user's configured free credentials
       const response = await fetch('/api/backup/email', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           email: emailBackupEmail.trim(),
           snapshot,
           apiKey: emailApiKey.trim() || undefined,
           provider: emailProvider,
         }),
       });

      const rawText = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(
          `Server returned HTTP ${response.status}: ${rawText.slice(0, 100).replace(/<[^>]*>/g, "").trim()}`
        );
      }

      if (!response.ok) {
        throw new Error(data.error || `Failed to send email (HTTP ${response.status})`);
      }

      setEmailBackupStatus("sent");
      setEmailBackupMessage(`Backup sent to ${emailBackupEmail.trim()}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setEmailBackupStatus("error");
      setEmailBackupMessage(`Email backup failed: ${message}`);
    } finally {
      setBackupLoading(false);
    }
  }

  // --- Provider selection & config handlers ---

  async function handleSelectProvider(provider: CloudSyncProvider) {
    setSelectedProviderTab(provider);
    setActiveProviderState(provider);
    await setActiveSyncProvider(provider);
    setCloudSyncStatus("idle");
    setCloudSyncMessage("");
  }

  // Google Drive
  async function handleConnectDrive() {
    setCloudSyncStatus("loading");
    setCloudSyncMessage("Opening Google authorization popup...");
    try {
      const token = await connectGoogleDrive(googleClientId.trim());
      setIsDriveConnected(true);
      setDriveTokenExpiresAt(token.expires_at);
      setCloudSyncStatus("ok");
      setCloudSyncMessage("Connected to Google Drive! AppData folder authorized.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setCloudSyncStatus("error");
      setCloudSyncMessage(`Connection failed: ${message}`);
    }
  }

  async function handleDisconnectDrive() {
    await disconnectGoogleDrive();
    setIsDriveConnected(false);
    setDriveTokenExpiresAt(null);
    setCloudSyncStatus("idle");
    setCloudSyncMessage("Disconnected from Google Drive.");
  }

  async function handleSaveGoogleClientId(e: React.FormEvent) {
    e.preventDefault();
    await setGoogleClientId(googleClientId.trim());
    setGoogleClientIdSaved(true);
    setTimeout(() => setGoogleClientIdSaved(false), 2500);
  }

  // --- Primary Sync & Restore Pipeline ---

  async function handleSyncNow() {
    setCloudSyncStatus("loading");
    const providerName = PROVIDER_NAMES[activeProvider];
    setCloudSyncMessage(`Exporting database and syncing via ${providerName}...`);

    try {
      const res = await syncNowToGoogleDrive();
      if (res.ok) {
        setIsDriveConnected(true);
      }

      setCloudSyncStatus(res.ok ? "ok" : "error");
      setCloudSyncMessage(res.message);

      if (res?.ok) {
        const info: LastSyncInfo = {
          provider: activeProvider,
          timestamp: Date.now(),
          message: res.message,
        };
        await setLastSyncInfo(info);
        setLastSync(info);
        enableAutoSync(activeProvider);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setCloudSyncStatus("error");
      setCloudSyncMessage(`${providerName} sync failed: ${msg}`);
    }
  }

  async function handleDownloadAndRestore() {
    setCloudSyncStatus("loading");
    const providerName = PROVIDER_NAMES[activeProvider];
    setCloudSyncMessage(`Downloading backup from ${providerName}...`);

    try {
      const res = await fetchDriveBackupForRestore();
      if (res.ok) setIsDriveConnected(true);

      if (!res.ok || !res.data) {
        setCloudSyncStatus("error");
        setCloudSyncMessage(res.message || `Failed to download from ${providerName}`);
        return;
      }

      setRestoreData(res.data);
      setRestoreConfirmOpen(true);
      setCloudSyncStatus("idle");
      setCloudSyncMessage("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setCloudSyncStatus("error");
      setCloudSyncMessage(`Download failed: ${msg}`);
    }
  }

  async function handleRestoreConfirm() {
    if (!restoreData) return;

    setCloudSyncStatus("loading");
    setCloudSyncMessage("Restoring snapshot into local database...");
    setRestoreConfirmOpen(false);

    try {
      await importSnapshot(restoreData);
      await syncAll();
      enableAutoSync(activeProvider);
      setCloudSyncStatus("ok");
      setCloudSyncMessage("Backup restored successfully. The page will reload to refresh data.");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setCloudSyncStatus("error");
      setCloudSyncMessage(`Restore failed: ${message}`);
    } finally {
      setRestoreData(null);
    }
  }

  function handleRestoreCancel() {
    setRestoreConfirmOpen(false);
    setRestoreData(null);
  }

  const getStatusBadge = () => {
    const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
      idle: { bg: "#f3f4f6", color: "#6b7280", label: "Ready" },
      saving: { bg: "#fef3c7", color: "#92400e", label: "Working..." },
      sending: { bg: "#fef3c7", color: "#92400e", label: "Sending..." },
      saved: { bg: "#ecfdf5", color: "#065f46", label: "Success" },
      sent: { bg: "#ecfdf5", color: "#065f46", label: "Sent" },
      error: { bg: "#fef2f2", color: "#991b1b", label: "Error" },
    };
    const s = statusStyles[backupStatus] || statusStyles[emailBackupStatus] || statusStyles.idle;
    return (
      <span
        className="chip-small"
        style={{
          background: s.bg,
          color: s.color,
          fontWeight: 600,
        }}
      >
        {s.label}
      </span>
    );
  };

  return (
    <div className="page settings-page">
      <header className="page-header">
        <h1>Settings</h1>
      </header>

      {/* §1 — Local Storage & Backup */}
      <section className="settings-section" style={{ borderLeft: "4px solid var(--color-accent-primary)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <h2 style={{ margin: 0 }}>Data Persistence & Storage</h2>
          {getStatusBadge()}
        </div>

        <p className="settings-help">
          All your projects, tasks, resources, notes, milestones, reminders, and settings are stored safely in
          fast, offline-first IndexedDB storage in your browser. Use the buttons below to create manual backups
          or restore from a snapshot file.
        </p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 12 }}>
          <button
            type="button"
            className="btn-secondary clickable"
            onClick={handleDownloadBackup}
            disabled={backupLoading}
            data-tip="Download a complete JSON backup of your local database"
          >
            📥 Download Backup (.json)
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleUploadSnapshot}
            style={{ display: "none" }}
            id="snapshot-upload"
          />
          <button
            type="button"
            className="btn-secondary clickable"
            onClick={() => fileInputRef.current?.click()}
            disabled={backupLoading}
            data-tip="Restore from a local .json snapshot file"
          >
            📤 Upload Snapshot (.json)
          </button>
        </div>

        {/* Email Backup Section */}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--color-border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
            <h3 style={{ margin: 0, fontSize: "14px" }}>📧 Email Backup</h3>
            <button
              type="button"
              className="btn-secondary btn-small clickable"
              onClick={() => setShowEmailConfig((prev) => !prev)}
              data-tip="Configure your own free email API key"
            >
              {showEmailConfig ? "Hide Email Settings" : "⚙️ Email API Settings"}
            </button>
          </div>
          <p className="settings-help" style={{ marginBottom: 12 }}>
            Send a complete backup of your data to your inbox as a JSON attachment.
          </p>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="email"
              placeholder="recipient@example.com"
              value={emailBackupEmail}
              onChange={(e) => setEmailBackupEmail(e.target.value)}
              style={{ minWidth: "280px", flex: 1 }}
              data-tip="Email address to receive the backup"
            />
            <button
              type="button"
              className="btn-primary clickable"
              onClick={handleEmailBackup}
              disabled={backupLoading || emailBackupStatus === "sending"}
              data-tip="Generate backup and send via email"
            >
              {emailBackupStatus === "sending" ? "Sending..." : "📧 Email Backup"}
            </button>
          </div>

          {/* User-configurable email credentials */}
          {showEmailConfig && (
            <form
              onSubmit={handleSaveEmailConfig}
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: "var(--radius-sm)",
                background: "var(--color-bg-subtle, #f9fafb)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: 6 }}>
                Free Email Dispatch Credentials (Stored Locally)
              </div>
              <p className="settings-help" style={{ marginBottom: 10 }}>
                Get a completely free API key from{" "}
                <a href="https://resend.com" target="_blank" rel="noreferrer">
                  Resend.com
                </a>{" "}
                (3,000 emails/month forever, <strong>no credit card required</strong>).
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <select
                  value={emailProvider}
                  onChange={(e) => setEmailProvider(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--color-border)",
                    fontSize: "13px",
                  }}
                >
                  <option value="resend">Resend (Free, 3,000/mo)</option>
                  <option value="sendgrid">SendGrid (Free, 100/day)</option>
                </select>
                <input
                  type="password"
                  placeholder="re_123456789..."
                  value={emailApiKey}
                  onChange={(e) => setEmailApiKey(e.target.value)}
                  style={{ flex: 1, minWidth: "220px" }}
                  data-tip="Your personal free API key"
                />
                <button type="submit" className="btn-secondary clickable">
                  {emailConfigSaved ? "Saved ✓" : "Save Email Key"}
                </button>
              </div>
              {emailConfigSaved && (
                <p style={{ fontSize: "12px", color: "green", marginTop: 6, margin: "6px 0 0 0" }}>
                  ✓ Email dispatch key saved in your profile!
                </p>
              )}
            </form>
          )}
        </div>

        {(backupMessage || emailBackupMessage) && (
          <p
            className="progress-label"
            style={{
              marginTop: 10,
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              background:
                backupStatus === "error" || emailBackupStatus === "error" ? "#fef2f2"
                : backupStatus === "saving" || emailBackupStatus === "sending" ? "#fef3c7"
                : "#f0fdf4",
              color: backupStatus === "error" || emailBackupStatus === "error" ? "#991b1b"
                : backupStatus === "saving" || emailBackupStatus === "sending" ? "#92400e"
                : "#166534",
              border: "1px solid var(--color-border)",
            }}
          >
            {backupMessage || emailBackupMessage}
          </p>
        )}
      </section>

      {/* §2 — Gemini API key */}
      <section className="settings-section">
        <h2>Gemini API Key (AI Assistant & Scheduler)</h2>
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

      {/* §3 — Multi-Cloud Backup & Sync */}
      <section
        className="settings-section"
        style={{
          borderLeft: `4px solid ${
            activeProvider === "google_drive" ? "#4285f4" : "#24292f"
          }`,
        }}
      >
        {/* Header & Status */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
          <div>
            <h2 style={{ margin: 0 }}>Cloud Backup &amp; Sync</h2>
            <p className="settings-help" style={{ margin: "4px 0 0 0" }}>
              Local-first data backup across devices. Choose your preferred cloud provider.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span
              className="chip-small"
              style={{
                background: "#f0fdf4",
                color: "#166534",
                border: "1px solid #bbf7d0",
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              Active: {PROVIDER_NAMES[activeProvider]}
            </span>

            {lastSync && (
              <span
                className="faint"
                style={{ fontSize: 12 }}
                title={new Date(lastSync.timestamp).toLocaleString()}
              >
                Last synced via {PROVIDER_NAMES[lastSync.provider]} at{" "}
                {new Date(lastSync.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
        </div>

        {/* Provider Selection */}
        <div style={{ marginBottom: 16 }}>
          <div className="tab-bar-chips" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              className={`chip ${selectedProviderTab === "google_drive" ? "chip-active" : ""}`}
              onClick={() => handleSelectProvider("google_drive")}
              data-tip="Use Google Drive AppData folder (client-side OAuth)"
              style={{
                borderColor: selectedProviderTab === "google_drive" ? "#4285f4" : undefined,
                fontWeight: selectedProviderTab === "google_drive" ? 600 : 400,
              }}
            >
              📁 Google Drive {activeProvider === "google_drive" && "✓"}
            </button>
          </div>
        </div>

        {/* Primary Action Row (Executes active provider) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            padding: "12px 14px",
            background: "rgba(0,0,0,0.02)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--color-border)",
            marginBottom: 16,
          }}
        >
          <button
            type="button"
            className="btn-primary clickable"
            onClick={handleSyncNow}
            disabled={cloudSyncStatus === "loading"}
            data-tip={`Export database and sync to ${PROVIDER_NAMES[activeProvider]}`}
          >
            {cloudSyncStatus === "loading" && cloudSyncMessage.includes("syncing")
              ? "Syncing…"
              : `🔄 Sync Now (${PROVIDER_NAMES[activeProvider]})`}
          </button>

          <button
            type="button"
            className="btn-secondary clickable"
            onClick={handleDownloadAndRestore}
            disabled={cloudSyncStatus === "loading"}
            data-tip={`Download backup from ${PROVIDER_NAMES[activeProvider]} and restore`}
          >
            {cloudSyncStatus === "loading" && cloudSyncMessage.includes("Downloading")
              ? "Downloading…"
              : `⬇ Restore from ${PROVIDER_NAMES[activeProvider]}`}
          </button>

        </div>

        {/* Provider Specific Configuration Card */}
        <div style={{ marginTop: 12 }}>
          {/* TAB 1: Google Drive */}
          {selectedProviderTab === "google_drive" && (
            <div className="provider-config-pane">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                <h3 style={{ margin: 0, fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}>
                  Google Drive Settings
                  <span
                    className="chip-small"
                    style={{
                      background: isDriveConnected ? "#ecfdf5" : "#f3f4f6",
                      color: isDriveConnected ? "#065f46" : "#6b7280",
                      border: isDriveConnected ? "1px solid #bbf7d0" : "1px solid #e5e7eb",
                      fontSize: 11,
                    }}
                  >
                    {isDriveConnected ? "● Connected" : "○ Disconnected"}
                  </span>
                  {isDriveConnected && driveTokenExpiresAt && (
                    <span className="faint" style={{ fontSize: 11 }}>
                      (Token active)
                    </span>
                  )}
                </h3>

                {isDriveConnected ? (
                  <button
                    type="button"
                    className="btn-secondary btn-small clickable"
                    onClick={handleDisconnectDrive}
                    data-tip="Revoke Google Drive access token"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-primary btn-small clickable"
                    onClick={handleConnectDrive}
                    disabled={cloudSyncStatus === "loading"}
                    data-tip="Sign in to authorize private appDataFolder"
                    style={{ background: "#4285f4", borderColor: "#4285f4" }}
                  >
                    Sign in with Google
                  </button>
                )}
              </div>

              <p className="settings-help">
                Saves <code>data.json</code> directly to your private Google Drive <code>appDataFolder</code>.
                Hidden from regular Drive views for enhanced privacy.
              </p>

              <form onSubmit={handleSaveGoogleClientId} style={{ marginBottom: 12 }}>
                <div className="provider-form-row">
                  <label htmlFor="google-client-id">
                    Google OAuth Web Client ID <span className="faint">(public, stored locally)</span>
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      id="google-client-id"
                      type="text"
                      placeholder="e.g. 123456789-abcdef.apps.googleusercontent.com"
                      value={googleClientId}
                      onChange={(e) => setGoogleClientIdState(e.target.value)}
                      data-tip="Google OAuth 2.0 Web Client ID with scope drive.appdata"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="submit"
                      className="btn-secondary btn-small clickable"
                      data-tip="Save Google Client ID"
                    >
                      {googleClientIdSaved ? "Saved ✓" : "Save ID"}
                    </button>
                  </div>
                </div>
                <p className="settings-help" style={{ marginTop: 4, fontSize: 12 }}>
                  Get a free Web OAuth Client ID in{" "}
                  <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer">
                    Google Cloud Console
                  </a>
                  {" "}under Credentials. Add this site's URL to <em>Authorized JavaScript origins</em>.
                </p>
              </form>
            </div>
          )}

        </div>

        {/* Status message */}
        {cloudSyncMessage && (
          <p
            className="progress-label"
            style={{
              marginTop: 14,
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              background:
                cloudSyncStatus === "error"
                  ? "#fef2f2"
                  : cloudSyncStatus === "ok"
                    ? "#f0fdf4"
                    : "#eff6ff",
              color:
                cloudSyncStatus === "error"
                  ? "#991b1b"
                  : cloudSyncStatus === "ok"
                    ? "#166534"
                    : "#1e40af",
              border: "1px solid var(--color-border)",
            }}
          >
            {cloudSyncStatus === "ok" && "✓ "}
            {cloudSyncStatus === "error" && "✗ "}
            {cloudSyncMessage}
          </p>
        )}
      </section>

      {/* § — Puter Cloud Sync */}
      <section className="settings-section" style={{ borderLeft: "4px solid #6366f1" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
          <div>
            <h2 style={{ margin: 0 }}>Putter Cloud Sync</h2>
            <p className="settings-help" style={{ margin: "4px 0 0 0" }}>
              Save your workspace to your Puter cloud account. Access it on any device.
            </p>
          </div>
          {puterState.phase === "unavailable" && (
            <span className="chip-small" style={{ background: "#fee2e2", color: "#991b1b" }}>
              SDK not loaded
            </span>
          )}
          {puterState.phase === "signed-out" && (
            <span className="chip-small" style={{ background: "#fef9c3", color: "#854d0e" }}>
              Signed out
            </span>
          )}
          {puterState.phase === "synced" && (
            <span className="chip-small" style={{ background: "#dcfce7", color: "#166534", fontWeight: 600 }}>
              Synced ✓
            </span>
          )}
        </div>

        {puterState.phase === "unavailable" && (
          <p style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
            The Puter.js SDK could not be loaded. Check your network connection or disable ad-blockers.
          </p>
        )}

        {puterState.phase === "signed-out" && isPuterAvailable() && (
          <button
            type="button"
            className="btn-primary btn-small clickable"
            onClick={async () => {
              const user = await openPuterSignIn();
              if (user) window.location.reload();
            }}
          >
            Sign in with Puter
          </button>
        )}

        {puterState.user && puterState.phase !== "unavailable" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {puterState.user.avatar ? (
                <img src={puterState.user.avatar} alt="" width={40} height={40} style={{ borderRadius: "50%" }} />
              ) : (
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600 }}>
                  {puterState.user.username?.slice(0, 2).toUpperCase() || "U"}
                </div>
              )}
              <div>
                <div style={{ fontWeight: 600, fontSize: "14px" }}>{puterState.user.name || puterState.user.username}</div>
                <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{puterState.user.email || puterState.user.username}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                type="button"
                className="btn-secondary btn-small clickable"
                disabled={puterState.phase === "syncing" || puterSigningOut}
                onClick={() => void handlePuterSyncNow()}
              >
                {puterState.phase === "syncing" ? "Syncing…" : "Sync now"}
              </button>
              <button
                type="button"
                className="btn-secondary btn-small clickable"
                disabled={puterSigningOut}
                style={{ color: "var(--color-accent-issue)" }}
                onClick={() => void handlePuterSignOut()}
              >
                {puterSigningOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
            {puterState.lastSyncedAt && (
              <p style={{ fontSize: "11px", color: "var(--color-text-muted)", margin: 0 }}>
                Last synced: {new Date(puterState.lastSyncedAt).toLocaleString()}
              </p>
            )}
            {puterState.phase === "error" && (
              <p style={{ fontSize: "12px", color: "var(--color-accent-issue)", margin: 0 }}>{puterState.message}</p>
            )}
            {puterError && (
              <p style={{ fontSize: "12px", color: "var(--color-accent-issue)", margin: 0 }}>{puterError}</p>
            )}
          </div>
        )}
      </section>

      {/* Restore Confirmation Modal */}
      {restoreConfirmOpen && restoreData && (
        <div className="drawer-backdrop drawer-backdrop-bottom" onClick={handleRestoreCancel}>
          <div
            className="drawer-panel drawer-panel-small"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="drawer-header">
              <h2>Confirm Restore</h2>
              <button
                type="button"
                className="btn-icon clickable"
                onClick={handleRestoreCancel}
                aria-label="Close"
                data-tip="Cancel restore"
              >
                ×
              </button>
            </header>

            <div className="drawer-body">
              <p style={{ marginBottom: 12 }}>
                This backup was created on{" "}
                <strong>{new Date(restoreData.metadata.exportedAt).toLocaleString()}</strong>.
              </p>
              <p style={{ marginBottom: 12, color: "var(--color-text-muted)", fontSize: "13px" }}>
                Restoring will <strong>replace all local data</strong> with the backup contents.
                Any changes made since this backup was created will be lost.
              </p>

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "13px",
                  marginTop: 8,
                }}
              >
                <tbody>
                  {Object.entries(restoreData.data).map(([table, rows]) => (
                    <tr key={table}>
                      <td
                        style={{
                          padding: "4px 0",
                          color: "var(--color-text-muted)",
                          textTransform: "capitalize",
                        }}
                      >
                        {table}
                      </td>
                      <td
                        style={{
                          padding: "4px 0 4px 12px",
                          textAlign: "right",
                          fontFamily: "monospace",
                          fontWeight: 600,
                        }}
                      >
                        {(rows as any[]).length}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="drawer-footer">
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", width: "100%" }}>
                <button
                  type="button"
                  className="btn-secondary btn-small clickable"
                  onClick={handleRestoreCancel}
                  data-tip="Cancel without restoring"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary btn-small clickable"
                  onClick={handleRestoreConfirm}
                  data-tip="Replace all local data with this backup"
                  style={{
                    background: "var(--color-accent-issue)",
                    borderColor: "var(--color-accent-issue)",
                  }}
                >
                  Restore Anyway
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}