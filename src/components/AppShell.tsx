import { Link, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import GlobalSearch from "./GlobalSearch";
import AssistantPanel from "./AssistantPanel";
import ThoughtTrain from "./ThoughtTrain";
import { ToastContainer } from "./ui";
import StashPanel from "./Stash";
import { getSessionEmail, isGuest } from "../auth/session";
import { signOut, subscribeSyncStatus, syncAll } from "../sync/sync";

export default function AppShell() {
  const email = getSessionEmail();
  const guest = isGuest();
  const [thoughtsOpen, setThoughtsOpen] = useState(false);
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

  async function handleLogout() {
    await signOut();
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
  };

  const online = typeof navigator !== "undefined" ? navigator.onLine : true;

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/home" className="app-logo clickable" data-tip="Home" data-tip-pos="bottom" data-tip-align="left">
          Panga
        </Link>
        <GlobalSearch />
        <button
          type="button"
          className="btn-secondary btn-small clickable"
          onClick={() => setThoughtsOpen(true)}
          data-tip="Thought train — capture notes quickly"
          data-tip-pos="bottom"
        >
          💭 Thoughts
        </button>
        <Link
          to="/settings"
          className="btn-secondary btn-small clickable"
          data-tip="Settings: API keys, backup & sync (Google Drive, GitHub Gist)"
          data-tip-pos="bottom"
        >
          Settings
        </Link>
        <span
          className="user-email"
          title={guest ? "Guest (offline)" : email || ""}
        >
          {guest ? "Guest · offline" : email || "Local"}
        </span>
        <button
          className="btn-secondary btn-small clickable"
          onClick={handleManualSync}
          disabled={syncState.status === "syncing"}
          data-tip={syncState.message || "Save progress on this device"}
          data-tip-pos="bottom"
        >
          {syncState.status === "syncing" ? "⟳ Saving…" : "💾 Save"}
        </button>
        <span
          className="sync-status"
          style={{ color: statusColors[syncState.status] || "var(--color-text-muted)" }}
          title={syncState.message || "Local storage"}
        >
          {syncState.status === "synced" ? "✓ saved" : syncState.status === "syncing" ? "⟳" : syncState.status === "error" ? "✗" : "·"}
        </span>
        <span
          className="offline-badge"
          style={{ color: online ? "var(--color-accent-resource)" : "var(--color-text-muted)" }}
          title={online ? "Online — cloud sync available if configured" : "Offline — progress still saved on device"}
        >
          {online ? "● online" : "○ offline"}
        </span>
        <button
          className="btn-secondary btn-small clickable logout-btn"
          data-tip={guest ? "Exit guest mode" : "Log out"}
          data-tip-pos="bottom"
          data-tip-align="right"
          onClick={handleLogout}
        >
          {guest ? "Exit" : "Logout"}
        </button>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <AssistantPanel />
      <ThoughtTrain open={thoughtsOpen} onClose={() => setThoughtsOpen(false)} />
      <ToastContainer />
      <StashPanel />
    </div>
  );
}
