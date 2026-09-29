import { useEffect, useState, useCallback } from "react";
import { getGeminiApiKey, setGeminiApiKey } from "../data/settings";
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  syncAll,
  getLastSyncTime,
  isSupabaseConfigured,
} from "../sync/supabaseSync";
import {
  syncGoogleCalendarEvents,
  connectGoogleCalendar,
  disconnectGoogleCalendar,
  isGoogleCalendarConnected,
} from "../sync/googleCalendar";

const SUPABASE_SCHEMA_SQL = `-- Panga Database Schema for Supabase
-- Copy and paste this script into your Supabase SQL Editor and click "RUN".

CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  created_at BIGINT,
  updated_at BIGINT,
  sync_status TEXT DEFAULT 'synced'
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  title TEXT NOT NULL,
  notes TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  executor TEXT DEFAULT 'manual',
  due_date BIGINT,
  scheduled_at BIGINT,
  estimated_minutes INTEGER,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at BIGINT,
  updated_at BIGINT,
  sync_status TEXT DEFAULT 'synced'
);

CREATE TABLE IF NOT EXISTS public.resources (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  url TEXT,
  provider TEXT,
  body TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  files JSONB DEFAULT '[]'::jsonb,
  created_at BIGINT,
  updated_at BIGINT,
  sync_status TEXT DEFAULT 'synced'
);

CREATE TABLE IF NOT EXISTS public.milestones (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  target_date BIGINT,
  blocking_task_ids JSONB DEFAULT '[]'::jsonb,
  created_at BIGINT,
  updated_at BIGINT,
  sync_status TEXT DEFAULT 'synced'
);

CREATE TABLE IF NOT EXISTS public.issues (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'open',
  severity TEXT DEFAULT 'medium',
  labels JSONB DEFAULT '[]'::jsonb,
  milestone_id TEXT,
  comments JSONB DEFAULT '[]'::jsonb,
  created_at BIGINT,
  updated_at BIGINT,
  sync_status TEXT DEFAULT 'synced'
);

CREATE TABLE IF NOT EXISTS public.contacts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'email',
  value TEXT DEFAULT '',
  tags JSONB DEFAULT '[]'::jsonb,
  linked_project_ids JSONB DEFAULT '[]'::jsonb,
  notes TEXT DEFAULT '',
  created_at BIGINT,
  updated_at BIGINT,
  sync_status TEXT DEFAULT 'synced'
);

CREATE TABLE IF NOT EXISTS public.reminders (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  message TEXT NOT NULL,
  trigger_at BIGINT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at BIGINT,
  updated_at BIGINT,
  sync_status TEXT DEFAULT 'synced'
);

CREATE TABLE IF NOT EXISTS public.calendar_events (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  source TEXT DEFAULT 'local',
  start_at BIGINT,
  end_at BIGINT,
  meet_link TEXT,
  created_at BIGINT,
  updated_at BIGINT,
  sync_status TEXT DEFAULT 'synced'
);

CREATE TABLE IF NOT EXISTS public.insights (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT DEFAULT 'note',
  link TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at BIGINT,
  updated_at BIGINT,
  sync_status TEXT DEFAULT 'synced'
);

CREATE TABLE IF NOT EXISTS public.doc_entries (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  type TEXT DEFAULT 'outline',
  "order" INTEGER DEFAULT 0,
  created_at BIGINT,
  updated_at BIGINT,
  sync_status TEXT DEFAULT 'synced'
);

CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at BIGINT
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doc_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access resources" ON public.resources FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access milestones" ON public.milestones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access issues" ON public.issues FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access contacts" ON public.contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access reminders" ON public.reminders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access calendar_events" ON public.calendar_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access insights" ON public.insights FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access doc_entries" ON public.doc_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);
`;

export default function Settings() {
  // Gemini settings
  const [geminiKey, setGeminiKey] = useState("");
  const [geminiStatus, setGeminiStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Supabase settings
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("");
  const [supabaseStatus, setSupabaseStatus] = useState<string | null>(null);
  const [supabaseTesting, setSupabaseTesting] = useState(false);
  const [syncingNow, setSyncingNow] = useState(false);
  const [lastSync, setLastSync] = useState<number>(0);
  const [showSql, setShowSql] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Google Calendar settings
  const [googleClientId, setGoogleClientId] = useState("");
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleImported, setGoogleImported] = useState<number | null>(null);

  const loadSettings = useCallback(async () => {
    const key = await getGeminiApiKey();
    setGeminiKey(key ?? "");

    const sb = getSupabaseConfig();
    setSupabaseUrl(sb.url);
    setSupabaseAnonKey(sb.anonKey);
    setLastSync(getLastSyncTime());
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

  async function handleSaveSupabase(e: React.FormEvent) {
    e.preventDefault();
    saveSupabaseConfig({ url: supabaseUrl, anonKey: supabaseAnonKey });
    setSupabaseTesting(true);
    setSupabaseStatus(null);
    const res = await testSupabaseConnection();
    setSupabaseTesting(false);
    setSupabaseStatus(res.message);
    if (res.ok) {
      void handleSyncNow();
    }
  }

  async function handleSyncNow() {
    setSyncingNow(true);
    setSupabaseStatus(null);
    const res = await syncAll();
    setSyncingNow(false);
    setSupabaseStatus(res.message);
    setLastSync(getLastSyncTime());
    // Reload Gemini key after sync in case it came from cloud
    const cloudKey = await getGeminiApiKey();
    if (cloudKey) setGeminiKey(cloudKey);
  }

  function handleCopySql() {
    navigator.clipboard?.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
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

  const isConfigured = isSupabaseConfigured();

  return (
    <div className="page settings-page">
      <header className="page-header">
        <h1>Settings</h1>
      </header>

      {/* §1 — Supabase Cloud Database & Multi-Device Sync */}
      <section className="settings-section" style={{ borderLeft: "4px solid var(--color-accent-primary)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <h2 style={{ margin: 0 }}>Supabase Database &amp; Cloud Sync</h2>
          <span
            className="chip-small"
            style={{
              background: isConfigured ? "#ecfdf5" : "#fef3c7",
              color: isConfigured ? "#065f46" : "#92400e",
              fontWeight: 600,
            }}
          >
            {isConfigured ? "✓ Cloud Sync Configured" : "⚠️ Needs Supabase Setup"}
          </span>
        </div>

        <p className="settings-help">
          Connect your <strong>Supabase</strong> project to securely save and synchronize your projects, tasks, resources, links, milestones, reminders, and settings across all your devices.
        </p>

        <form className="settings-form" onSubmit={handleSaveSupabase} style={{ flexDirection: "column", alignItems: "stretch", gap: 10 }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: 4 }}>
              Supabase Project URL
            </label>
            <input
              type="url"
              placeholder="https://your-project-id.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              data-tip="Find this in Supabase Dashboard -> Project Settings -> API"
              style={{ width: "100%" }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: 4 }}>
              Supabase Anon Key
            </label>
            <input
              type="text"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
              data-tip="Your project anon public key"
              style={{ width: "100%", fontFamily: "monospace", fontSize: "12px" }}
              required
            />
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 4 }}>
            <button type="submit" className="btn-primary clickable" disabled={supabaseTesting}>
              {supabaseTesting ? "Testing & Saving..." : "Save & Connect Database"}
            </button>

            {isConfigured && (
              <button
                type="button"
                className="btn-secondary clickable"
                onClick={handleSyncNow}
                disabled={syncingNow}
                data-tip="Manually force a full sync between cloud and local cache"
              >
                {syncingNow ? "Syncing..." : "🔄 Sync Now"}
              </button>
            )}

            <button
              type="button"
              className="btn-secondary btn-small clickable"
              onClick={() => setShowSql(!showSql)}
            >
              {showSql ? "Hide SQL Setup" : "📋 View SQL Setup Script"}
            </button>

            {lastSync > 0 && (
              <span style={{ fontSize: "11px", color: "var(--color-text-muted)", marginLeft: "auto" }}>
                Last synced: {new Date(lastSync).toLocaleTimeString()}
              </span>
            )}
          </div>

          {supabaseStatus && (
            <p
              className="progress-label"
              style={{
                marginTop: 6,
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                background: supabaseStatus.includes("error") || supabaseStatus.includes("missing") || supabaseStatus.includes("failed") ? "#fef2f2" : "#f0fdf4",
                color: supabaseStatus.includes("error") || supabaseStatus.includes("missing") || supabaseStatus.includes("failed") ? "#991b1b" : "#166534",
                border: "1px solid var(--color-border)",
              }}
            >
              {supabaseStatus}
            </p>
          )}
        </form>

        {/* SQL Schema helper box */}
        {showSql && (
          <div
            style={{
              marginTop: 14,
              padding: 12,
              background: "var(--color-bg-subtle)",
              borderRadius: "var(--radius)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: "12px", fontWeight: 600 }}>
                Supabase SQL Setup Script (creates tables with RLS)
              </span>
              <button
                type="button"
                className="btn-primary btn-small clickable"
                onClick={handleCopySql}
              >
                {copiedSql ? "✓ Copied to Clipboard!" : "Copy SQL Script"}
              </button>
            </div>
            <p style={{ fontSize: "11px", color: "var(--color-text-muted)", margin: "0 0 8px 0" }}>
              1. Open your <strong>Supabase Dashboard</strong> &rarr; <strong>SQL Editor</strong>.<br />
              2. Click <strong>New query</strong>, paste this script, and click <strong>Run</strong>.<br />
              3. All your changes and progress will be saved in your database across devices.
            </p>
            <textarea
              readOnly
              rows={8}
              value={SUPABASE_SCHEMA_SQL}
              style={{
                width: "100%",
                fontFamily: "monospace",
                fontSize: "11px",
                background: "white",
                borderRadius: "4px",
                padding: "8px",
              }}
            />
          </div>
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
          . Saved directly in your Supabase database and browser cache so you do not have to re-enter it when switching devices.
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
            {geminiStatus === "saving" ? "Saving..." : geminiStatus === "saved" ? "Saved ✓" : "Save in DB"}
          </button>
        </form>
        {geminiStatus === "saved" && (
          <p style={{ fontSize: "12px", color: "green", marginTop: 6 }}>
            ✓ Gemini API key saved in the database!
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
