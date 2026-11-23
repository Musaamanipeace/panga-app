import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import GlobalSearch from "./GlobalSearch";
import AssistantPanel from "./AssistantPanel";
import ThoughtTrain from "./ThoughtTrain";
import InstallButton from "./InstallButton";
import SelectionCopy from "./SelectionCopy";
import { pasteWithFeedback } from "./quickPaste";
import { migrateStash } from "../data/clips";
import { exitToLanding } from "../auth/session";
import { stopSpeaking } from "../speech/tts";
import { SHORTCUT_ENTRIES, homeTabRoute, matchShortcut } from "../shortcuts";

export default function AppShell() {
  const [thoughtsOpen, setThoughtsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [online, setOnline] = useState(() => (typeof navigator !== "undefined" ? navigator.onLine : true));
  const shortcutsRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    void migrateStash();
  }, []);

  // Reading belongs to the page it started on; never let it follow navigation.
  useEffect(() => {
    stopSpeaking();
  }, [location.pathname]);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Global keyboard shortcuts across tabs, search, and the shortcuts popover.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShortcutsOpen(false);
        setMenuOpen(false);
        return;
      }
      const match = matchShortcut(e);
      if (!match) return;
      e.preventDefault();
      if (match.type === "tab") {
        setShortcutsOpen(false);
        setMenuOpen(false);
        setSearchOpen(false);
        navigate(homeTabRoute(match.tabId));
      } else if (match.type === "search") {
        setShortcutsOpen(false);
        setMenuOpen(false);
        setSearchOpen((o) => !o);
      } else if (match.type === "shortcuts") {
        setMenuOpen(false);
        setSearchOpen(false);
        setShortcutsOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigate]);

  // Close popovers when clicking outside them.
  useEffect(() => {
    if (!shortcutsOpen && !menuOpen) return;
    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node | null;
      if (shortcutsOpen && shortcutsRef.current && target && !shortcutsRef.current.contains(target)) {
        setShortcutsOpen(false);
      }
      if (menuOpen && menuRef.current && target && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [shortcutsOpen, menuOpen]);

  function handleExit() {
    setMenuOpen(false);
    exitToLanding();
    navigate("/");
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/home" className="app-logo clickable" data-tip="Home" data-tip-pos="bottom" data-tip-align="left">
          Panga
        </Link>

        <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />

        <button
          type="button"
          className="btn-secondary btn-small clickable header-btn"
          onClick={() => setThoughtsOpen(true)}
          data-tip="Thought train — capture notes quickly"
          data-tip-pos="bottom"
        >
          💭 Thoughts
        </button>

        <button
          type="button"
          className="btn-secondary btn-small clickable header-btn"
          onClick={() => void pasteWithFeedback()}
          data-tip="Save what is on your clipboard"
          data-tip-pos="bottom"
        >
          📋 Paste
        </button>

        <div className="header-popover-wrap" ref={shortcutsRef}>
          <button
            type="button"
            className="btn-secondary btn-small clickable header-btn"
            aria-expanded={shortcutsOpen}
            aria-haspopup="dialog"
            onClick={() => {
              setMenuOpen(false);
              setShortcutsOpen((o) => !o);
            }}
          >
            Shortcuts
          </button>
          {shortcutsOpen && (
            <div className="header-popover dropdown-anim" role="dialog" aria-label="Keyboard shortcuts">
              <div className="header-popover-title">Keyboard shortcuts</div>
              <ul className="shortcut-list">
                {SHORTCUT_ENTRIES.map((entry) => (
                  <li key={`${entry.keys}-${entry.action}`} className="shortcut-row">
                    <span>{entry.action}</span>
                    <kbd>{entry.keys}</kbd>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="header-popover-wrap" ref={menuRef}>
          <button
            type="button"
            className="btn-secondary btn-small clickable header-btn"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={() => {
              setShortcutsOpen(false);
              setMenuOpen((o) => !o);
            }}
          >
            Menu
          </button>
          {menuOpen && (
            <div className="header-popover dropdown-anim" role="menu" aria-label="App menu">
              <Link
                to="/settings"
                className="header-menu-item clickable"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                Settings
              </Link>
              <div className="header-menu-status" aria-live="polite">
                {online ? "Online" : "Offline"}
              </div>
              <div className="header-menu-install">
                <InstallButton />
              </div>
              <button
                type="button"
                className="header-menu-item header-menu-danger clickable"
                role="menuitem"
                onClick={handleExit}
              >
                Exit
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <AssistantPanel />
      <ThoughtTrain open={thoughtsOpen} onClose={() => setThoughtsOpen(false)} />
      <SelectionCopy />
    </div>
  );
}
