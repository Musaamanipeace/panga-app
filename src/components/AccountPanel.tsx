// Settings section: JSON account username + Download JSON / Upload JSON backup.
import { useEffect, useRef, useState } from "react";
import {
  downloadSnapshot,
  getJsonAccountUsername,
  importSnapshot,
  readSnapshotFile,
  setJsonAccountUsername,
} from "../sync/snapshot";

export default function AccountPanel() {
  const [username, setUsername] = useState("");
  const [userStatus, setUserStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [backupStatus, setBackupStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const [backupLoading, setBackupLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void getJsonAccountUsername().then(setUsername);
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

  return (
    <section id="account" className="settings-section" style={{ border: "1px solid var(--color-border)", borderRadius: 12, padding: 20 }}>
      <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>JSON account &amp; backup</h2>
      <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--color-text-muted)" }}>
        Save your JSON backup regularly — browser storage can be cleared at any time and there is no cloud copy.
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
    </section>
  );
}
