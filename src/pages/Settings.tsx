import { useEffect, useState, useCallback, useRef } from "react";
import {
  getGoogleClientId,
  setGoogleClientId,
  getActiveSyncProvider,
  setActiveSyncProvider,
  getLastSyncInfo,
  setLastSyncInfo,
  getAIProvider,
  setAIProvider,
  getAIApiKey,
  setAIApiKey,
  getAIModel,
  setAIModel,
  type CloudSyncProvider,
  type LastSyncInfo,
  type AIProviderId,
} from "../data/settings";
import {
  downloadSnapshot,
  readSnapshotFile,
  importSnapshot,
  type Snapshot,
} from "../sync/snapshot";
import { syncAll } from "../sync/sync";
import VoiceSettings from "../voice/VoiceSettings";
import InstallSettings from "../components/InstallSettings";
import { enableAutoSync } from "../sync/autoSync";
import {
  connectGoogleDrive,
  disconnectGoogleDrive,
  isGoogleDriveConnected,
  getStoredToken,
  syncNowToGoogleDrive,
  fetchDriveBackupForRestore,
} from "../sync/googleDriveSync";
import {
  AI_PROVIDERS,
  fetchAvailableModels,
  filterFreeModels,
  type AIModelInfo,
} from "../ai/providers";
import {
  getSupabaseConfig,
  setSupabaseConfig,
  isSupabaseConfigured,
} from "../data/supabase";

const AI_PROVIDER_OPTIONS: { id: AIProviderId; label: string; hint: string }[] = [
  { id: "openrouter", label: "OpenRouter", hint: "Best free + paid (live model list)" },
  { id: "gemini", label: "Google Gemini", hint: "Free tier available" },
  { id: "openai", label: "OpenAI", hint: "GPT models (paid)" },
  { id: "anthropic", label: "Anthropic Claude", hint: "Claude models (paid)" },
  { id: "xai", label: "xAI Grok", hint: "Grok models (paid)" },
  { id: "groq", label: "Groq", hint: "Fast free tier" },
];

export default function Settings() {
  const [backupStatus, setBackupStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const [backupLoading, setBackupLoading] = useState(false);

  const [, setActiveProviderState] = useState<CloudSyncProvider>("google_drive");
  const [lastSync, setLastSync] = useState<LastSyncInfo | null>(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [cloudSyncMessage, setCloudSyncMessage] = useState("");

  const [googleClientId, setGoogleClientIdState] = useState("");
  const [googleClientIdSaved, setGoogleClientIdSaved] = useState(false);
  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [driveTokenExpiresAt, setDriveTokenExpiresAt] = useState<number | null>(null);

  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [restoreData, setRestoreData] = useState<Snapshot | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [aiProvider, setAiProviderState] = useState<AIProviderId>("openrouter");
  const [aiApiKey, setAiApiKeyState] = useState("");
  const [aiModel, setAiModelState] = useState("");
  const [aiModels, setAiModels] = useState<AIModelInfo[]>([]);
  const [aiModelsLoading, setAiModelsLoading] = useState(false);
  const [aiModelsError, setAiModelsError] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [showFreeOnly, setShowFreeOnly] = useState(true);

  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("");
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<"idle" | "saving" | "saved">("idle");

  const loadSettings = useCallback(async () => {
    const currentProvider = await getActiveSyncProvider();
    setActiveProviderState(currentProvider);
    const lastSyncInfo = await getLastSyncInfo();
    setLastSync(lastSyncInfo);

    const savedClientId = await getGoogleClientId();
    const envClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || "";
    setGoogleClientIdState(savedClientId || envClientId || "");

    const connected = await isGoogleDriveConnected();
    setIsDriveConnected(connected);
    const storedToken = await getStoredToken();
    if (storedToken) setDriveTokenExpiresAt(storedToken.expires_at);

    const prov = await getAIProvider();
    setAiProviderState(prov);
    const key = (await getAIApiKey(prov)) ?? "";
    setAiApiKeyState(key);
    const model = (await getAIModel(prov)) ?? "";
    setAiModelState(model);

    const cfg = await getSupabaseConfig();
    if (cfg) {
      setSupabaseUrl(cfg.url);
      setSupabaseAnonKey(cfg.anonKey);
    }
    setSupabaseConfigured(await isSupabaseConfigured());
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (!aiApiKey.trim()) {
      setAiModels([]);
      setAiModelsError(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setAiModelsLoading(true);
      setAiModelsError(null);
      try {
        const list = await fetchAvailableModels(aiProvider, aiApiKey.trim());
        if (!cancelled) setAiModels(list);
      } catch (e) {
        if (!cancelled) {
          setAiModels([]);
          setAiModelsError(e instanceof Error ? e.message : "Failed to load models");
        }
      } finally {
        if (!cancelled) setAiModelsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [aiProvider, aiApiKey]);

  async function handleSaveAi(e: React.FormEvent) {
    e.preventDefault();
    setAiStatus("saving");
    await setAIProvider(aiProvider);
    await setAIApiKey(aiProvider, aiApiKey.trim());
    if (aiModel.trim()) await setAIModel(aiProvider, aiModel.trim());
    setAiStatus("saved");
    setTimeout(() => setAiStatus("idle"), 2500);
  }

  async function handleProviderChange(id: AIProviderId) {
    setAiProviderState(id);
    const key = (await getAIApiKey(id)) ?? "";
    setAiApiKeyState(key);
    const model = (await getAIModel(id)) ?? "";
    setAiModelState(model);
    setShowFreeOnly(id === "openrouter" || id === "groq" || id === "gemini");
  }

  async function handleSaveSupabase(e: React.FormEvent) {
    e.preventDefault();
    setSupabaseStatus("saving");
    await setSupabaseConfig(supabaseUrl.trim(), supabaseAnonKey.trim());
    setSupabaseConfigured(await isSupabaseConfigured());
    setSupabaseStatus("saved");
    setTimeout(() => setSupabaseStatus("idle"), 2500);
  }

  async function handleSaveGoogleClientId(e: React.FormEvent) {
    e.preventDefault();
    await setGoogleClientId(googleClientId.trim());
    setGoogleClientIdSaved(true);
    setTimeout(() => setGoogleClientIdSaved(false), 2500);
  }

  async function handleConnectDrive() {
    setCloudSyncStatus("loading");
    setCloudSyncMessage("Connecting to Google Drive…");
    try {
      if (googleClientId.trim()) await setGoogleClientId(googleClientId.trim());
      await connectGoogleDrive(googleClientId.trim() || undefined);
      setIsDriveConnected(true);
      const token = await getStoredToken();
      if (token) setDriveTokenExpiresAt(token.expires_at);
      setCloudSyncStatus("ok");
      setCloudSyncMessage("Connected to Google Drive.");
    } catch (err: unknown) {
      setCloudSyncStatus("error");
      setCloudSyncMessage(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleDisconnectDrive() {
    await disconnectGoogleDrive();
    setIsDriveConnected(false);
    setDriveTokenExpiresAt(null);
    setCloudSyncMessage("Disconnected from Google Drive.");
    setCloudSyncStatus("idle");
  }

  async function handleCloudExport() {
    setCloudSyncStatus("loading");
    setCloudSyncMessage("Exporting to Google Drive…");
    try {
      const res = await syncNowToGoogleDrive();
      if (!res.ok) {
        setCloudSyncStatus("error");
        setCloudSyncMessage(res.message || "Export failed");
        return;
      }
      await setActiveSyncProvider("google_drive");
      setActiveProviderState("google_drive");
      const info = { provider: "google_drive" as const, timestamp: Date.now(), message: "Exported to Google Drive" };
      await setLastSyncInfo(info);
      setLastSync(info);
      enableAutoSync("google_drive");
      setIsDriveConnected(true);
      setCloudSyncStatus("ok");
      setCloudSyncMessage("Exported. Auto-sync is on.");
    } catch (err: unknown) {
      setCloudSyncStatus("error");
      setCloudSyncMessage(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleDownloadAndRestore() {
    setCloudSyncStatus("loading");
    setCloudSyncMessage("Downloading backup from Google Drive…");
    try {
      const res = await fetchDriveBackupForRestore();
      if (res.ok) setIsDriveConnected(true);
      if (!res.ok || !res.data) {
        setCloudSyncStatus("error");
        setCloudSyncMessage(res.message || "Failed to download");
        return;
      }
      setRestoreData(res.data);
      setRestoreConfirmOpen(true);
      setCloudSyncStatus("idle");
      setCloudSyncMessage("");
    } catch (err: unknown) {
      setCloudSyncStatus("error");
      setCloudSyncMessage(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleRestoreConfirm() {
    if (!restoreData) return;
    setCloudSyncStatus("loading");
    setCloudSyncMessage("Restoring snapshot…");
    setRestoreConfirmOpen(false);
    try {
      await importSnapshot(restoreData);
      await syncAll();
      enableAutoSync("google_drive");
      setCloudSyncStatus("ok");
      setCloudSyncMessage("Restored. Reloading…");
      setTimeout(() => window.location.reload(), 1200);
    } catch (err: unknown) {
      setCloudSyncStatus("error");
      setCloudSyncMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setRestoreData(null);
    }
  }

  async function handleLocalDownload() {
    setBackupLoading(true);
    setBackupStatus("saving");
    try {
      await downloadSnapshot();
      setBackupStatus("saved");
      setBackupMessage("Snapshot downloaded.");
    } catch (err: unknown) {
      setBackupStatus("error");
      setBackupMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setBackupLoading(false);
      setTimeout(() => setBackupStatus("idle"), 3000);
    }
  }

  async function handleLocalUpload(file: File) {
    setBackupLoading(true);
    setBackupStatus("saving");
    try {
      const snap = await readSnapshotFile(file);
      await importSnapshot(snap);
      setBackupStatus("saved");
      setBackupMessage("Snapshot imported. Reloading…");
      setTimeout(() => window.location.reload(), 1200);
    } catch (err: unknown) {
      setBackupStatus("error");
      setBackupMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setBackupLoading(false);
    }
  }

  const displayedModels =
    showFreeOnly && (aiProvider === "openrouter" || aiProvider === "groq")
      ? filterFreeModels(aiModels)
      : aiModels;

  return (
    <div className="settings-page" style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 28 }}>
      <h1 style={{ margin: 0, fontSize: 24 }}>Settings</h1>

      <section className="settings-section" style={{ border: "1px solid var(--color-border)", borderRadius: 12, padding: 20 }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>AI assistant</h2>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--color-text-muted)" }}>
          Choose a provider and API key. Free models are loaded live from the provider — nothing is hard-coded.
        </p>
        <form onSubmit={handleSaveAi} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 600 }}>
            Provider
            <select
              value={aiProvider}
              onChange={(e) => void handleProviderChange(e.target.value as AIProviderId)}
              style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px" }}
            >
              {AI_PROVIDER_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label} — {o.hint}
                </option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: 13, fontWeight: 600 }}>
            API key
            <input
              type="password"
              value={aiApiKey}
              onChange={(e) => setAiApiKeyState(e.target.value)}
              placeholder={`${AI_PROVIDERS[aiProvider].label} API key`}
              autoComplete="off"
              style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px" }}
            />
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <label style={{ fontSize: 13, fontWeight: 600, flex: 1, minWidth: 200 }}>
              Model
              <select
                value={aiModel}
                onChange={(e) => setAiModelState(e.target.value)}
                disabled={aiModelsLoading || displayedModels.length === 0}
                style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px" }}
              >
                <option value="">
                  {aiModelsLoading
                    ? "Loading models…"
                    : displayedModels.length === 0
                      ? aiApiKey
                        ? "No models found — paste a valid key"
                        : "Enter API key to load models"
                      : "Select a model"}
                </option>
                {displayedModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name || m.id}
                    {m.isFree ? " (free)" : ""}
                    {m.contextLength ? ` · ${Math.round(m.contextLength / 1000)}k` : ""}
                  </option>
                ))}
              </select>
            </label>
            {(aiProvider === "openrouter" || aiProvider === "groq") && (
              <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6, marginTop: 18 }}>
                <input type="checkbox" checked={showFreeOnly} onChange={(e) => setShowFreeOnly(e.target.checked)} />
                Free only
              </label>
            )}
          </div>
          {aiModelsError && (
            <p style={{ margin: 0, fontSize: 12, color: "var(--color-accent-issue, #b91c1c)" }}>{aiModelsError}</p>
          )}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button type="submit" className="btn-primary btn-small clickable" disabled={aiStatus === "saving"}>
              {aiStatus === "saving" ? "Saving…" : aiStatus === "saved" ? "Saved" : "Save AI settings"}
            </button>
            <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Stored only on this device (IndexedDB).</span>
          </div>
        </form>
      </section>

      <section className="settings-section" style={{ border: "1px solid var(--color-border)", borderRadius: 12, padding: 20 }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>Supabase (Postgres)</h2>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--color-text-muted)" }}>
          Optional remote Postgres. Run <code>supabase/schema.sql</code> in your project SQL editor, then paste URL + anon key.
          Local Dexie stays the offline source of truth.
        </p>
        <form onSubmit={handleSaveSupabase} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 600 }}>
            Project URL
            <input
              type="url"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://xxxx.supabase.co"
              style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px" }}
            />
          </label>
          <label style={{ fontSize: 13, fontWeight: 600 }}>
            Anon (public) key
            <input
              type="password"
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
              placeholder="eyJ…"
              autoComplete="off"
              style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px" }}
            />
          </label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button type="submit" className="btn-primary btn-small clickable">
              {supabaseStatus === "saving" ? "Saving…" : supabaseStatus === "saved" ? "Saved" : "Save Supabase"}
            </button>
            <span className="chip-small" style={{ background: supabaseConfigured ? "#dcfce7" : "#f3f4f6", color: supabaseConfigured ? "#166534" : "#6b7280" }}>
              {supabaseConfigured ? "Configured" : "Not configured"}
            </span>
          </div>
        </form>
      </section>

      <section className="settings-section" style={{ border: "1px solid var(--color-border)", borderRadius: 12, padding: 20 }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>Google Drive backup</h2>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--color-text-muted)" }}>
          Sync a full workspace snapshot to Drive App Data. Auto-sync runs after you export once on this device.
        </p>
        <form onSubmit={handleSaveGoogleClientId} style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600 }}>
            Google OAuth Client ID
            <input
              type="text"
              value={googleClientId}
              onChange={(e) => setGoogleClientIdState(e.target.value)}
              placeholder="xxxx.apps.googleusercontent.com"
              style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px" }}
            />
          </label>
          <button type="submit" className="btn-secondary btn-small clickable">
            {googleClientIdSaved ? "Saved" : "Save Client ID"}
          </button>
        </form>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {!isDriveConnected ? (
            <button type="button" className="btn-primary btn-small clickable" onClick={() => void handleConnectDrive()}>
              Connect Google Drive
            </button>
          ) : (
            <>
              <button type="button" className="btn-primary btn-small clickable" onClick={() => void handleCloudExport()}>
                Export / Sync now
              </button>
              <button type="button" className="btn-secondary btn-small clickable" onClick={() => void handleDownloadAndRestore()}>
                Import from Drive
              </button>
              <button type="button" className="btn-secondary btn-small clickable" onClick={() => void handleDisconnectDrive()}>
                Disconnect
              </button>
            </>
          )}
        </div>
        <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          Status: {isDriveConnected ? "Connected" : "Not connected"}
          {driveTokenExpiresAt ? ` · token expires ${new Date(driveTokenExpiresAt).toLocaleString()}` : ""}
          {lastSync ? ` · last sync ${new Date(lastSync.timestamp).toLocaleString()}` : ""}
        </div>
        {cloudSyncMessage && (
          <p style={{ margin: "8px 0 0", fontSize: 13, color: cloudSyncStatus === "error" ? "var(--color-accent-issue, #b91c1c)" : "var(--color-text-muted)" }}>
            {cloudSyncMessage}
          </p>
        )}
      </section>

      <section className="settings-section" style={{ border: "1px solid var(--color-border)", borderRadius: 12, padding: 20 }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>Local snapshot</h2>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--color-text-muted)" }}>
          Download or upload a full JSON backup (no account required).
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button type="button" className="btn-primary btn-small clickable" disabled={backupLoading} onClick={() => void handleLocalDownload()}>
            Download backup (.json)
          </button>
          <button type="button" className="btn-secondary btn-small clickable" disabled={backupLoading} onClick={() => fileInputRef.current?.click()}>
            Upload snapshot
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleLocalUpload(f);
              e.target.value = "";
            }}
          />
        </div>
        {backupMessage && (
          <p style={{ margin: "8px 0 0", fontSize: 13, color: backupStatus === "error" ? "#b91c1c" : "var(--color-text-muted)" }}>
            {backupMessage}
          </p>
        )}
      </section>

      <VoiceSettings />
      <InstallSettings />

      {restoreConfirmOpen && restoreData && (
        <div
          role="dialog"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div style={{ background: "var(--color-bg, #fff)", borderRadius: 12, padding: 24, maxWidth: 420, width: "100%" }}>
            <h3 style={{ marginTop: 0 }}>Import from Google Drive?</h3>
            <p style={{ fontSize: 14 }}>
              Snapshot from {new Date(restoreData.metadata.exportedAt).toLocaleString()}. This replaces local data on this device.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button type="button" className="btn-secondary btn-small" onClick={() => { setRestoreConfirmOpen(false); setRestoreData(null); }}>
                Cancel
              </button>
              <button type="button" className="btn-primary btn-small" onClick={() => void handleRestoreConfirm()}>
                Restore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
