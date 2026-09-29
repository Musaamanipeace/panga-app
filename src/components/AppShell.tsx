import { Link, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import GlobalSearch from "./GlobalSearch";
import AssistantPanel from "./AssistantPanel";
import { getSessionEmail } from "../auth/session";
import { signOut, subscribeSyncStatus, syncAll } from "../sync/sync";

export default function AppShell() {
  const email = getSessionEmail();
  const [syncState, setSyncState] = useState<{ status: string; message: string; timestamp: number }>({
    status: "idle",
    message: "",
    timestamp: 0,
  });

  useEffect(() => {
    const unsubscribe = subscribeSyncStatus((status, message) => {
      setSyncState({ status, message: message || "", timestamp: Date.now() });
    });
    return unsubscribe;
  }, []);

  function handleLogout() {
    signOut();
  }

  async function handleManualSync() {
    const result = await syncAll();
    setSyncState({ status: result.ok ? "synced" : "error", message: result.message, timestamp: Date.now() });
  }

  const statusColors: Record<string, string> = {
    idle: "var(--color-text-muted)",
    syncing: "#f59e0b",
    synced: "#10b981",
    error: "#ef4444",
    unconfigured: "var(--color-text-muted)",
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/dashboard" className="app-logo clickable" data-tip="Back to your project dashboard">
          Panga
        </Link>
        <GlobalSearch />
        <Link
          to="/settings"
          className="btn-secondary btn-small clickable"
          data-tip="Settings: API keys, calendar connection, secrets vault"
        >
          Settings
        </Link>
        <span
          className="user-email"
          style={{
            fontSize: "12px",
            color: "var(--color-text-muted)",
            marginRight: "8px",
            maxWidth: "160px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={email || ""}
        >
          {email || ""}
        </span>
        <button
          className="btn-secondary btn-small clickable"
          onClick={handleManualSync}
          style={{ marginRight: "8px" }}
          data-tip="Force sync now"
        >
          ☁️ Sync
        </button>
        <span
          className="sync-status"
          style={{
            fontSize: "11px",
            color: statusColors[syncState.status] || "var(--color-text-muted)",
            marginRight: "8px",
            fontFamily: "monospace",
          }}
          title={syncState.message || "No sync yet"}
        >
          {syncState.status === "idle" 
            ? "⏸" 
            : syncState.status === "syncing" 
              ? "⟳" 
              : syncState.status === "synced" 
                ? "✓" 
                : "✗"}
        </span>
        <button
          className="btn-secondary btn-small clickable logout-btn"
          data-tip={email ? `Signed in as ${email} — click to log out` : "Log out"}
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <AssistantPanel />
    </div>
  );
}
