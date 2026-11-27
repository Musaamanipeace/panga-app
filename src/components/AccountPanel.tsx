// Settings section: JSON account username + Download JSON / Upload JSON + Google Drive sync.
import { useEffect, useRef, useState } from "react";
import {
  downloadSnapshot,
  getJsonAccountUsername,
  importSnapshot,
  readSnapshotFile,
  setJsonAccountUsername,
} from "../sync/snapshot";
import { useGoogleDriveSync } from "../sync/useGoogleDriveSync";
import { getDriveAutoSyncEnabled, setDriveAutoSyncEnabled } from "../data/accountSettings";
import GoogleSignInButton from "./GoogleSignInButton";
import DriveSyncReviewModal from "./DriveSyncReviewModal";

const DRIVE_STATUS_TEXT: Record<string, string> = {
  no_remote: "No Drive backup file yet",
  in_sync: "Up to date with Google Drive",
  local_ahead: "Local changes pending upload",
  remote_ahead: "Newer backup available on Drive",
  conflict: "Conflict: local & Drive both changed",
};

export default function AccountPanel() {
  const [username, setUsername] = useState("");
  const [userStatus, setUserStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [backupStatus, setBackupStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const [backupLoading, setBackupLoading] = useState(false);
  const [autoSync, setAutoSync] = useState<boolean>(() => getDriveAutoSyncEnabled());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const drive = useGoogleDriveSync();

  useEffect(() => {
    void getJsonAccountUsername().then(setUsername);
    const onSettings = () => setAutoSync(getDriveAutoSyncEnabled());
    window.addEventListener("panga-settings-updated", onSettings);
    return () => window.removeEventListener("panga-settings-updated", onSettings);
  }, []);

  async function handleSaveUsername(e: React.FormEvent) {
    e.preventDefault();
    setUserStatus("saving");
    const saved = await setJsonAccountUsername(username);
    setUsername(saved);
    setUserStatus("saved");
    setTimeout(() => setUserStatus("idle"), 2000);
  }

  async function handleDownloadJson() {
    setBackupLoading(true);
    setBackupStatus("saving");
    setBackupMessage(null);
    try {
      await downloadSnapshot();
      setBackupStatus("saved");
      setBackupMessage("JSON backup downloaded.");
    } catch (err: unknown) {
      setBackupStatus("error");
      setBackupMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setBackupLoading(false);
      setTimeout(() => setBackupStatus("idle"), 3000);
    }
  }

  async function handleUploadJson(file: File) {
    setBackupLoading(true);
    setBackupStatus("saving");
    setBackupMessage(null);
    try {
      const snap = await readSnapshotFile(file);
      await importSnapshot(snap);
      const restoredName = await getJsonAccountUsername();
      setUsername(restoredName);
      setBackupStatus("saved");
      setBackupMessage("JSON backup restored. Reloading...");
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: unknown) {
      setBackupStatus("error");
      setBackupMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setBackupLoading(false);
    }
  }

  const driveBusy = drive.auth.signingIn || drive.checking || drive.busy;

  return (
    <section id="account" className="settings-section" style={{ border: "1px solid var(--color-border)", borderRadius: 12, padding: 20 }}>
      <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>JSON account &amp; backup</h2>
      <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--color-text-muted)" }}>
        Save your JSON backup regularly or sync it to Google Drive — browser storage can be cleared at any time.
      </p>

      <form onSubmit={(e) => void handleSaveUsername(e)} style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 600, flex: 1, minWidth: 200 }}>
          Username (saved in your JSON file)
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your local username"
            autoComplete="username"
            style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px" }}
          />
        </label>
        <button type="submit" className="btn-primary btn-small clickable" disabled={userStatus === "saving"}>
          {userStatus === "saving" ? "Saving..." : userStatus === "saved" ? "Saved" : "Save username"}
        </button>
      </form>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <button type="button" className="btn-primary btn-small clickable" disabled={backupLoading} onClick={() => void handleDownloadJson()}>
          Download JSON
        </button>
        <button type="button" className="btn-secondary btn-small clickable" disabled={backupLoading} onClick={() => fileInputRef.current?.click()}>
          Upload JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleUploadJson(f);
            e.target.value = "";
          }}
        />
      </div>

      {backupMessage && (
        <p style={{ margin: "10px 0 0", fontSize: 13, color: backupStatus === "error" ? "#b91c1c" : "var(--color-text-muted)" }}>
          {backupMessage}
        </p>
      )}

      <div className="drive-sync-section">
        <h3 style={{ margin: 0, fontSize: 16 }}>Google Drive sync</h3>
        {!drive.auth.user ? (
          <>
            <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>
              Signed out. Sign in with Google to save, restore, and safely merge your Panga JSON backup on Google Drive.
            </p>
            <div>
              <GoogleSignInButton
                loading={drive.auth.signingIn || drive.checking}
                disabled={driveBusy}
                onClick={() => void drive.openSyncReview()}
              />
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 13, color: "var(--color-text)" }}>
              Signed in as <strong>{drive.auth.user.email || drive.auth.user.displayName || "Google account"}</strong>
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
              {drive.auth.needsAuth
                ? "Google Drive access needs re-confirmation after reload."
                : drive.report
                  ? DRIVE_STATUS_TEXT[drive.report.status]
                  : drive.baseline
                    ? `Last synced ${new Date(drive.baseline.lastSyncedAt).toLocaleString()}`
                    : "Ready to inspect Google Drive backup."}
            </div>
            <label className="rem-checkbox-label" style={{ fontSize: 13 }}>
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => {
                  const next = e.target.checked;
                  setAutoSync(next);
                  setDriveAutoSyncEnabled(next);
                }}
              />
              <span>Auto-sync quietly after edits (prompt only on conflicts)</span>
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              {drive.auth.needsAuth ? (
                <GoogleSignInButton
                  label="Reconnect Google Drive"
                  loading={drive.auth.signingIn || drive.checking}
                  disabled={driveBusy}
                  onClick={() => void drive.openSyncReview()}
                />
              ) : (
                <>
                  <button
                    type="button"
                    className="btn-primary btn-small clickable"
                    disabled={driveBusy}
                    onClick={() => void drive.openSyncReview()}
                  >
                    {drive.checking ? "Checking..." : "Sync & review Drive"}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary btn-small clickable"
                    disabled={driveBusy}
                    onClick={() => void drive.refreshInspection({ interactive: true, openReview: false })}
                  >
                    Check status
                  </button>
                </>
              )}
              {(drive.baseline?.fileId || drive.report?.remoteFile) && !drive.auth.needsAuth && (
                <button
                  type="button"
                  className="btn-secondary btn-small clickable"
                  disabled={driveBusy}
                  onClick={() => void drive.handleDeleteRemoteBackup()}
                  style={{ color: "var(--color-accent-issue)" }}
                >
                  Delete Drive backup
                </button>
              )}
              <button
                type="button"
                className="btn-secondary btn-small clickable"
                disabled={driveBusy}
                onClick={() => void drive.handleSignOut()}
              >
                Sign out
              </button>
            </div>
          </>
        )}

        {drive.error && (
          <p style={{ margin: 0, fontSize: 13, color: "var(--color-accent-issue)" }}>{drive.error}</p>
        )}
        <a href="/privacy.html" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "var(--color-text-muted)", textDecoration: "underline" }}>
          Privacy Policy
        </a>
      </div>

      <DriveSyncReviewModal
        open={drive.modalOpen}
        report={drive.report}
        busy={drive.busy}
        accountEmail={drive.auth.user?.email}
        onMerge={() => {
          void drive.handleMerge().then((ok) => {
            if (ok) void getJsonAccountUsername().then(setUsername);
          });
        }}
        onPushLocal={() => void drive.handlePushLocal()}
        onPullRemote={() => {
          void drive.handlePullRemote().then((ok) => {
            if (ok) void getJsonAccountUsername().then(setUsername);
          });
        }}
        onClose={() => drive.setModalOpen(false)}
      />
    </section>
  );
}
