import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import GlobalSearch from "./GlobalSearch";
import AssistantPanel from "./AssistantPanel";
import ThoughtTrain from "./ThoughtTrain";
import InstallButton from "./InstallButton";
import SelectionCopy from "./SelectionCopy";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import { captureAccountSettings } from "../data/workspaces";
import { getTheme, toggleTheme, type ThemeId } from "../theme/theme";
import { pasteWithFeedback } from "./quickPaste";
import { migrateStash } from "../data/clips";
import { clearAllLocalData } from "../data/db";
import { exitToLanding, resetGuestSession } from "../auth/session";
import { importSnapshot, readSnapshotFile } from "../sync/snapshot";
import { notifyWorkspaceUpdated } from "../ai/agent";
import { confirmAction, showToast } from "./ui";
import { stopSpeaking } from "../speech/tts";
import { SHORTCUT_ENTRIES, homeTabRoute, matchShortcut } from "../shortcuts";
import DriveSyncReviewModal from "./DriveSyncReviewModal";
import { useGoogleDriveSync } from "../sync/useGoogleDriveSync";
import { ensureDefaultWorkspaceTemplates } from "../data/workspaceTemplates";
import { startReminderScheduler } from "../data/reminders";
import GlobalWorkspacePrompt from "./GlobalWorkspacePrompt";
import ReminderAlertBanner from "./alerts/ReminderAlertBanner";

export default function AppShell() {
  const [thoughtsOpen, setThoughtsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [workspaceEpoch, setWorkspaceEpoch] = useState(0);
  const [theme, setThemeState] = useState<ThemeId>(() => getTheme());
  const [online, setOnline] = useState(() => (typeof navigator !== "undefined" ? navigator.onLine : true));
  const menuRef = useRef<HTMLDivElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const drive = useGoogleDriveSync({ enableAutoSync: true });

  useEffect(() => {
    let cancelled = false;
    void migrateStash();
    void captureAccountSettings();
    void startReminderScheduler();
    void ensureDefaultWorkspaceTemplates().then(({ restored }) => {
      if (cancelled) return;
      if (restored.length > 0) {
        notifyWorkspaceUpdated();
        setWorkspaceEpoch((n) => n + 1);
      }
    });
    const onSwitched = () => {
      if (!cancelled) setWorkspaceEpoch((n) => n + 1);
    };
    window.addEventListener("panga-workspace-switched", onSwitched);
    return () => {
      cancelled = true;
      window.removeEventListener("panga-workspace-switched", onSwitched);
    };
  }, []);

  function handleWorkspaceChanged() {
    notifyWorkspaceUpdated();
    setWorkspaceEpoch((n) => n + 1);
    void migrateStash();
  }

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
    const onOpenThoughts = () => setThoughtsOpen(true);
    const onOpenSearch = () => setSearchOpen(true);
    window.addEventListener("panga-open-thoughts", onOpenThoughts);
    window.addEventListener("panga-open-search", onOpenSearch);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("panga-open-thoughts", onOpenThoughts);
      window.removeEventListener("panga-open-search", onOpenSearch);
    };
  }, [navigate]);

  // Close popovers when clicking outside them.
  useEffect(() => {
    if (!shortcutsOpen && !menuOpen) return;
    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node | null;
      if (target && menuRef.current && !menuRef.current.contains(target)) {
        setShortcutsOpen(false);
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [shortcutsOpen, menuOpen]);

  function handleExit() {
    setMenuOpen(false);
    exitToLanding();
    navigate("/", { replace: true });
  }

  async function handleMenuUploadJson(file: File) {
    try {
      const snapshot = await readSnapshotFile(file);
      await importSnapshot(snapshot);
      notifyWorkspaceUpdated();
      setWorkspaceEpoch((n) => n + 1);
      showToast("JSON backup restored.", "success");
      navigate("/home");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed to import JSON backup.", "error");
    }
  }

  async function handleMenuStartAfresh() {
    setMenuOpen(false);
    const confirmed = await confirmAction({
      title: "Start afresh?",
      message: "This will wipe all existing local tasks, notes, links, reminders, and settings on this device, in every workspace.",
      confirmLabel: "Start afresh",
      cancelLabel: "Cancel",
      danger: true,
    });
    if (!confirmed) return;

    try {
      await clearAllLocalData();
      await resetGuestSession();
      notifyWorkspaceUpdated();
      setWorkspaceEpoch((n) => n + 1);
      showToast("Started a fresh workspace.", "info");
      navigate("/home");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Could not start fresh workspace.", "error");
    }
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
              <div className="panel-head-row">
                <strong className="panel-head-title">Menu</strong>
                <button
                  type="button"
                  className="modal-close-x clickable"
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                >
                  ×
                </button>
              </div>
              <Link
                to="/settings"
                className="header-menu-item clickable"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                Settings
              </Link>
              <button
                type="button"
                className="header-menu-item clickable"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  setShortcutsOpen(true);
                }}
              >
                Shortcuts
              </button>
              <button
                type="button"
                className="header-menu-item clickable"
                role="menuitem"
                onClick={() => setThemeState(toggleTheme())}
              >
                Theme: {theme === "dark" ? "Dark" : "Light"}
              </button>
              <button
                type="button"
                className="header-menu-item clickable"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  jsonInputRef.current?.click();
                }}
              >
                Upload JSON
              </button>
              <button
                type="button"
                className="header-menu-item header-menu-danger clickable"
                role="menuitem"
                onClick={() => void handleMenuStartAfresh()}
              >
                Start afresh
              </button>
              <div className="header-menu-status" title={drive.auth.user?.email ?? undefined} aria-live="polite">
                {drive.auth.user
                  ? `Google Drive: ${drive.auth.user.email || drive.auth.user.displayName || "Signed in"}${drive.auth.needsAuth ? " (reconnect)" : ""}`
                  : "Google Drive: Signed out"}
              </div>
              {!drive.auth.user ? (
                <button
                  type="button"
                  className="header-menu-item clickable"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    void drive.openSyncReview();
                  }}
                >
                  Sign in with Google
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="header-menu-item clickable"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      void drive.openSyncReview();
                    }}
                  >
                    {drive.auth.needsAuth ? "Reconnect Google Drive" : "Sync Google Drive"}
                  </button>
                  <button
                    type="button"
                    className="header-menu-item clickable"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      void drive.handleSignOut();
                    }}
                  >
                    Sign out of Google
                  </button>
                </>
              )}
              <a
                className="header-menu-item clickable"
                role="menuitem"
                href="/privacy.html"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "block", textDecoration: "none", color: "inherit" }}
                onClick={() => setMenuOpen(false)}
              >
                Privacy Policy
              </a>
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
              <div className="panel-foot-row">
                <button type="button" className="btn-secondary btn-small clickable" onClick={() => setMenuOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          )}
          {shortcutsOpen && (
            <div className="header-popover dropdown-anim" role="dialog" aria-label="Keyboard shortcuts">
              <div className="panel-head-row">
                <span className="header-popover-title" style={{ margin: 0 }}>Keyboard shortcuts</span>
                <button
                  type="button"
                  className="modal-close-x clickable"
                  aria-label="Close shortcuts"
                  onClick={() => setShortcutsOpen(false)}
                >
                  ×
                </button>
              </div>
              <ul className="shortcut-list">
                {SHORTCUT_ENTRIES.map((entry) => (
                  <li key={`${entry.keys}-${entry.action}`} className="shortcut-row">
                    <span>{entry.action}</span>
                    <kbd>{entry.keys}</kbd>
                  </li>
                ))}
              </ul>
              <div className="panel-foot-row">
                <button type="button" className="btn-secondary btn-small clickable" onClick={() => setShortcutsOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
      <input
        ref={jsonInputRef}
        type="file"
        accept=".json,application/json"
        aria-label="Upload JSON backup"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleMenuUploadJson(f);
          e.target.value = "";
        }}
      />
      <WorkspaceSwitcher onChanged={handleWorkspaceChanged} />
      <main className="app-main">
        <Outlet key={workspaceEpoch} />
      </main>
      <AssistantPanel />
      <ThoughtTrain open={thoughtsOpen} onClose={() => setThoughtsOpen(false)} />
      <GlobalWorkspacePrompt />
      <ReminderAlertBanner />
      <SelectionCopy />
      <DriveSyncReviewModal
        open={drive.modalOpen}
        report={drive.report}
        busy={drive.busy}
        accountEmail={drive.auth.user?.email}
        onMerge={() => {
          void drive.handleMerge().then((ok) => {
            if (ok) {
              notifyWorkspaceUpdated();
              setWorkspaceEpoch((n) => n + 1);
            }
          });
        }}
        onPushLocal={() => void drive.handlePushLocal()}
        onPullRemote={() => {
          void drive.handlePullRemote().then((ok) => {
            if (ok) {
              notifyWorkspaceUpdated();
              setWorkspaceEpoch((n) => n + 1);
            }
          });
        }}
        onClose={() => drive.setModalOpen(false)}
      />
    </div>
  );
}
