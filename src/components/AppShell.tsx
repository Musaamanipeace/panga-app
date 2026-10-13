import { Link, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import GlobalSearch from "./GlobalSearch";
import AssistantPanel from "./AssistantPanel";
import ThoughtTrain from "./ThoughtTrain";
import { ToastContainer, ConfirmDialogHost } from "./ui";
import { SyncMenu, AutoSyncIndicator } from "./SyncMenu";
import { subscribeAutoSync, startAutoSync, type AutoSyncState } from "../sync/autoSync";
import StashPanel from "./Stash";
import { getSessionEmail, isGuest } from "../auth/session";
import { signOut } from "../sync/sync";

export default function AppShell() {
  const email = getSessionEmail();
  const guest = isGuest();
  const [thoughtsOpen, setThoughtsOpen] = useState(false);
  const [autoState, setAutoState] = useState<AutoSyncState>({ phase: "off", provider: null, at: null, message: "" });

  useEffect(() => {
    startAutoSync();
    return subscribeAutoSync(setAutoState);
  }, []);

  async function handleLogout() {
    await signOut();
  }

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
        <SyncMenu />
        <AutoSyncIndicator state={autoState} />
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
      <ConfirmDialogHost />
      <StashPanel />
    </div>
  );
}
