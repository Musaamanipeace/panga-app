import { useEffect, useState, useCallback, useRef } from "react";
import { getGeminiApiKey, setGeminiApiKey, getWebdavConfig, setWebdavConfig, clearWebdavConfig, DEFAULT_BACKUP_PATH } from "../data/settings";
import { syncAll } from "../sync/sync";
import {
  downloadSnapshot,
  readSnapshotFile,
  importSnapshot,
  exportSnapshot,
  validateSnapshot,
  type Snapshot,
} from "../sync/snapshot";
import {
  webdavTestConnection,
  webdavUploadBackup,
  webdavDownloadBackup,
  type WebdavConfig,
  type WebdavTestResult,
} from "../sync/webdav";

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

  // WebDAV cloud backup config
  const [webdavEndpoint, setWebdavEndpoint] = useState("");
  const [webdavUsername, setWebdavUsername] = useState("");
  const [webdavPassword, setWebdavPassword] = useState("");
  const [webdavBackupPath, setWebdavBackupPath] = useState(DEFAULT_BACKUP_PATH);

  // WebDAV status
  const [webdavTestStatus, setWebdavTestStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [webdavTestMessage, setWebdavTestMessage] = useState("");
  const [webdavUploadStatus, setWebdavUploadStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [webdavUploadMessage, setWebdavUploadMessage] = useState("");

  // Restore confirmation modal
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [restoreData, setRestoreData] = useState<Snapshot | null>(null);

  // File input ref for snapshot upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadSettings = useCallback(async () => {
    const key = await getGeminiApiKey();
    setGeminiKey(key ?? "");
    const webdav = await getWebdavConfig();
    if (webdav) {
      setWebdavEndpoint(webdav.endpoint);
      setWebdavUsername(webdav.username);
      setWebdavBackupPath(webdav.backupPath || DEFAULT_BACKUP_PATH);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  async function saveGeminiKey(e: React.FormEvent) {
    e.preventDefault();
    setGeminiStatus("saving");
    await setGeminiApiKey(geminiKey.trim());
    setGeminiStatus("saved");
    setTimeout(() => setGeminiStatus("idle"), 2500);
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

      // Send to API
      const response = await fetch('/api/backup/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailBackupEmail.trim(),
          snapshot,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
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

  // --- WebDAV handlers ---

  async function handleWebdavTestConnection() {
    const endpoint = webdavEndpoint.trim();
    const username = webdavUsername.trim();
    if (!endpoint || !username || !webdavPassword) {
      setWebdavTestStatus("error");
      setWebdavTestMessage("Please fill in all WebDAV fields.");
      return;
    }

    setWebdavTestStatus("loading");
    setWebdavTestMessage("Testing connection...");

    const config: WebdavConfig = {
      endpoint,
      username,
      password: webdavPassword,
      backupPath: webdavBackupPath || DEFAULT_BACKUP_PATH,
    };

    try {
      const result: WebdavTestResult = await webdavTestConnection(config);
      setWebdavTestStatus(result.ok ? "ok" : "error");
      setWebdavTestMessage(result.message);
      if (result.ok) {
        // Persist the verified config (password encrypted in IndexedDB)
        await setWebdavConfig({
          endpoint,
          username,
          password: webdavPassword,
          backupPath: webdavBackupPath || DEFAULT_BACKUP_PATH,
        });
        // Clear the plaintext password from state
        setWebdavPassword("");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setWebdavTestStatus("error");
      setWebdavTestMessage(`Test failed: ${message}`);
    }
  }

  async function handleWebdavUpload() {
    const config = await getWebdavConfig();
    if (!config) {
      setWebdavUploadStatus("error");
      setWebdavUploadMessage("Please test and save your WebDAV connection first.");
      return;
    }

    setWebdavUploadStatus("loading");
    setWebdavUploadMessage("Exporting and uploading backup...");

    try {
      const snapshot = await exportSnapshot();
      const jsonContent = JSON.stringify(snapshot, null, 2);
      const result = await webdavUploadBackup(
        { ...config, backupPath: webdavBackupPath || DEFAULT_BACKUP_PATH },
        jsonContent
      );
      setWebdavUploadStatus(result.ok ? "ok" : "error");
      setWebdavUploadMessage(result.message);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setWebdavUploadStatus("error");
      setWebdavUploadMessage(`Upload failed: ${message}`);
    }
  }

  async function handleWebdavDownload() {
    const config = await getWebdavConfig();
    if (!config) {
      setWebdavUploadStatus("error");
      setWebdavUploadMessage("Please test and save your WebDAV connection first.");
      return;
    }

    setWebdavUploadStatus("loading");
    setWebdavUploadMessage("Downloading backup from WebDAV...");

    try {
      const result = await webdavDownloadBackup(
        { ...config, backupPath: webdavBackupPath || DEFAULT_BACKUP_PATH }
      );
      if (!result.ok) {
        setWebdavUploadStatus("error");
        setWebdavUploadMessage(result.message);
        return;
      }

      // Validate the downloaded data against the snapshot schema
      const snapshot = validateSnapshot(result.data);
      if (!snapshot) {
        setWebdavUploadStatus("error");
        setWebdavUploadMessage(
          "Downloaded file is not a valid Panga snapshot. Check the backup path."
        );
        return;
      }

      // Show confirmation modal with backup details
      setRestoreData(snapshot);
      setRestoreConfirmOpen(true);
      setWebdavUploadStatus("idle");
      setWebdavUploadMessage("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setWebdavUploadStatus("error");
      setWebdavUploadMessage(`Download failed: ${message}`);
    }
  }

  async function handleRestoreConfirm() {
    if (!restoreData) return;

    setWebdavUploadStatus("loading");
    setWebdavUploadMessage("Restoring snapshot into local database...");
    setRestoreConfirmOpen(false);

    try {
      await importSnapshot(restoreData);
      await syncAll();
      setWebdavUploadStatus("ok");
      setWebdavUploadMessage("Backup restored successfully. The page will reload to refresh data.");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setWebdavUploadStatus("error");
      setWebdavUploadMessage(`Restore failed: ${message}`);
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: "14px" }}>📧 Email Backup</h3>
          <p className="settings-help" style={{ marginBottom: 12 }}>
            Send a complete backup of your data to any email address as a JSON attachment.
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

      {/* §3 — WebDAV Cloud Backup & Sync */}
      <section
        className="settings-section"
        style={{ borderLeft: "4px solid var(--color-accent-primary)" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Cloud Backup &amp; Sync (WebDAV)</h2>
          {webdavEndpoint && (
            <button
              type="button"
              className="btn-secondary btn-small clickable"
              onClick={async () => {
                await clearWebdavConfig();
                setWebdavEndpoint("");
                setWebdavUsername("");
                setWebdavPassword("");
                setWebdavBackupPath(DEFAULT_BACKUP_PATH);
                setWebdavTestStatus("idle");
                setWebdavTestMessage("");
                setWebdavUploadStatus("idle");
                setWebdavUploadMessage("");
              }}
              data-tip="Remove saved WebDAV configuration"
            >
              Clear Config
            </button>
          )}
        </div>

        <p className="settings-help">
          Back up and restore your entire Panga database to any standard WebDAV-compatible
          cloud provider. Credentials are encrypted locally and never sent to any third party
          except your own WebDAV endpoint.
        </p>

        <p className="settings-help">
          Need free cloud storage? Sign up at{" "}
          <a
            href="https://www.infiniclouds.com/"
            target="_blank"
            rel="noreferrer"
          >
            InfiniCLOUD (20GB Free)
          </a>
          {" "}→ Go to Account Settings → Enable "Apps Connection" to get your WebDAV URL
          and App Password.
        </p>

        {/* WebDAV form inputs */}
        <div className="webdav-form-row">
          <label htmlFor="webdav-endpoint">Endpoint URL</label>
          <input
            id="webdav-endpoint"
            type="url"
            placeholder="https://your-id.teracloud.jp/dav/ or https://your-nextcloud.com/remote.php/dav/files/user/"
            value={webdavEndpoint}
            onChange={(e) => setWebdavEndpoint(e.target.value)}
            data-tip="Full WebDAV endpoint URL (usually ends with a trailing slash)"
          />
        </div>

        <div className="webdav-form-row">
          <label htmlFor="webdav-username">User ID / Username</label>
          <input
            id="webdav-username"
            type="text"
            placeholder="e.g. your-email@example.com or user-id"
            value={webdavUsername}
            onChange={(e) => setWebdavUsername(e.target.value)}
            data-tip="Your WebDAV username or user ID"
          />
        </div>

        <div className="webdav-form-row">
          <label htmlFor="webdav-password">App Password</label>
          <input
            id="webdav-password"
            type="password"
            placeholder="App-specific password (not your regular login password)"
            value={webdavPassword}
            onChange={(e) => setWebdavPassword(e.target.value)}
            data-tip="Generate an app password in your cloud provider's settings"
          />
        </div>

        <div className="webdav-form-row">
          <label htmlFor="webdav-backup-path">
            Backup File Path <span className="faint">(custom folder)</span>
          </label>
          <input
            id="webdav-backup-path"
            type="text"
            placeholder="app_backup.json"
            value={webdavBackupPath}
            onChange={(e) => setWebdavBackupPath(e.target.value || DEFAULT_BACKUP_PATH)}
            data-tip="Path on the WebDAV server where the backup file is stored. Use a folder prefix like backups/my-backup.json"
          />
        </div>

        {/* Test Connection */}
        <div style={{ marginTop: 12 }}>
          <button
            type="button"
            className="btn-secondary btn-small clickable"
            onClick={handleWebdavTestConnection}
            disabled={webdavTestStatus === "loading"}
            data-tip="Verify WebDAV credentials and endpoint"
          >
            {webdavTestStatus === "loading" ? "Testing…" : "Test Connection"}
          </button>
          {webdavTestStatus !== "idle" && webdavTestMessage && (
            <span
              className="chip-small"
              style={{
                marginLeft: 8,
                fontSize: "12px",
                background:
                  webdavTestStatus === "ok" ? "#ecfdf5" : "#fef2f2",
                color:
                  webdavTestStatus === "ok" ? "#065f46" : "#991b1b",
                border:
                  webdavTestStatus === "ok"
                    ? "1px solid #bbf7d0"
                    : "1px solid #fecaca",
              }}
            >
              {webdavTestStatus === "ok" ? "✓" : "✗"} {webdavTestMessage}
            </span>
          )}
        </div>

        {/* Export / Import actions */}
        {webdavTestStatus === "ok" && (
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
              marginTop: 16,
              paddingTop: 16,
              borderTop: "1px solid var(--color-border)",
            }}
          >
            <button
              type="button"
              className="btn-primary btn-small clickable"
              onClick={handleWebdavUpload}
              disabled={webdavUploadStatus === "loading"}
              data-tip="Export your full database to JSON and upload to WebDAV"
            >
              {webdavUploadStatus === "loading" && webdavUploadMessage.includes("Upload")
                ? "Uploading…"
                : "⬆ Upload Backup"}
            </button>
            <button
              type="button"
              className="btn-secondary btn-small clickable"
              onClick={handleWebdavDownload}
              disabled={webdavUploadStatus === "loading"}
              data-tip="Download backup from WebDAV and restore"
            >
              {webdavUploadStatus === "loading" && webdavUploadMessage.includes("Download")
                ? "Downloading…"
                : "⬇ Download Backup"}
            </button>
          </div>
        )}

        {webdavUploadMessage && (
          <p
            className="progress-label"
            style={{
              marginTop: 10,
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              background:
                webdavUploadStatus === "error"
                  ? "#fef2f2"
                  : webdavUploadStatus === "ok"
                    ? "#f0fdf4"
                    : "#eff6ff",
              color:
                webdavUploadStatus === "error"
                  ? "#991b1b"
                  : webdavUploadStatus === "ok"
                    ? "#166534"
                    : "#1e40af",
              border: "1px solid var(--color-border)",
            }}
          >
            {webdavUploadMessage}
          </p>
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