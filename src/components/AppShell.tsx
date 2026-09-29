import { Link, Outlet } from "react-router-dom";
import GlobalSearch from "./GlobalSearch";
import AssistantPanel from "./AssistantPanel";
import { clearSession, getSessionEmail } from "../auth/session";

export default function AppShell() {
  const email = getSessionEmail();

  function handleLogout() {
    clearSession();
    // Reload so the IndexedDB database switches back to anonymous mode
    window.location.assign("/");
  }

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
