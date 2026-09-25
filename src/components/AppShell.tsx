import { Link, Outlet, useNavigate } from "react-router-dom";
import GlobalSearch from "./GlobalSearch";
import AIAssistant from "./AIAssistant";
import MacheteTransition from "./MacheteTransition";
import { clearSession, getSessionEmail } from "../auth/session";

export default function AppShell() {
  const navigate = useNavigate();
  const email = getSessionEmail();

  function handleLogout() {
    clearSession();
    navigate("/");
  }

  return (
    <div className="app-shell">
      <MacheteTransition />
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
      <AIAssistant />
    </div>
  );
}
