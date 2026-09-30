import { useEffect, useState, useCallback, useRef } from "react";
import { getGeminiApiKey, setGeminiApiKey } from "../data/settings";
import {
  downloadSnapshot,
  readSnapshotFile,
  importSnapshot,
  exportSnapshot,
} from "../sync/snapshot";

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

  // File input ref for snapshot upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadSettings = useCallback(async () => {
    const key = await getGeminiApiKey();
    setGeminiKey(key ?? "");
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
    </div>
  );
}