import { Link, Outlet } from "react-router-dom";
import GlobalSearch from "./GlobalSearch";
import AIAssistant from "./AIAssistant";

export default function AppShell() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/dashboard" className="app-logo">Panga</Link>
        <GlobalSearch />
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <AIAssistant />
    </div>
  );
}
