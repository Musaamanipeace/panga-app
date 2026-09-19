import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import SearchOverlay from "./SearchOverlay";

const navClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? "nav-link active" : "nav-link";

export default function AppHeader() {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="app-header">
        <Link className="brand" to="/">
          <span className="brand-mark">P</span>
          <span>Panga</span>
        </Link>
        <nav aria-label="Primary navigation">
          <Link className={navClass({ isActive: location.pathname === "/dashboard" })} to="/dashboard">
            Dashboard
          </Link>
          <Link className={navClass({ isActive: location.pathname === "/contacts" })} to="/contacts">
            Contacts
          </Link>
          <Link className={navClass({ isActive: location.pathname === "/reminders" })} to="/reminders">
            Reminders
          </Link>
          <Link className={navClass({ isActive: location.pathname === "/planner" })} to="/planner">
            AI Planner
          </Link>
          <Link className={navClass({ isActive: location.pathname === "/settings" })} to="/settings">
            Settings
          </Link>
        </nav>
        <button className="search-trigger" onClick={() => setSearchOpen(true)} type="button">
          Search <kbd>Ctrl K</kbd>
        </button>
      </header>
      {searchOpen ? (
        <SearchOverlay onClose={() => setSearchOpen(false)} />
      ) : null}
    </>
  );
}
