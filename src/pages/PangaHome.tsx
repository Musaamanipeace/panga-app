import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ThoughtStream from "../components/home/ThoughtStream";
import { CAPTURE_INPUT_ID } from "../components/home/ThoughtStream";
import CommandBox from "../components/home/CommandBox";
import ShortcutsBar from "../components/home/ShortcutsBar";
import TaskListsHome from "../components/home/TaskListsHome";
import HomeLinksTab from "../components/home/HomeLinksTab";
import NotesPanel from "../components/home/NotesPanel";
import HomeRemindersTab from "../components/home/HomeRemindersTab";
import ClipboardPanel from "../components/home/ClipboardPanel";
import { HOME_TABS, type HomeTabId } from "../shortcuts";
import {
  dismissReadAloudNotice,
  getVoiceStatus,
  isReadAloudNoticeDismissed,
  type VoiceStatus,
} from "../speech/tts";

export default function PangaHome() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const raw = params.get("tab");
  const tab: HomeTabId = HOME_TABS.some((t) => t.id === raw) ? (raw as HomeTabId) : "Task lists";
  // Optional folder/list/item selection from header search or quick shortcuts.
  const folderId = params.get("folder") ?? null;
  const listId = params.get("list") ?? null;
  const noteId = params.get("note") ?? null;
  const reminderId = params.get("reminder") ?? null;
  const [voiceNotice, setVoiceNotice] = useState<VoiceStatus | null>(null);
  const [online, setOnline] = useState(() => (typeof navigator !== "undefined" ? navigator.onLine : true));

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

  // Launched from the "Quick capture" app shortcut: put the cursor in the capture box.
  useEffect(() => {
    if (params.get("capture") === "1") {
      const t = window.setTimeout(() => document.getElementById(CAPTURE_INPUT_ID)?.focus(), 150);
      return () => window.clearTimeout(t);
    }
  }, [params]);

  // First arrival at /home: one-time dismissible notice when Read aloud is not Ready offline.
  useEffect(() => {
    if (isReadAloudNoticeDismissed()) return;
    let cancelled = false;
    void getVoiceStatus(true).then(({ status }) => {
      if (!cancelled && status.kind !== "ready") {
        setVoiceNotice(status);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function dismissVoiceNotice() {
    dismissReadAloudNotice();
    setVoiceNotice(null);
  }

  return (
    <div className="page pg-home">
      <header className="pg-head">
        <div
          className="pg-connection-status"
          role="status"
          aria-live="polite"
          data-online={online ? "true" : "false"}
        >
          <span className="pg-status-dot" aria-hidden="true" />
          <span>{online ? "Online" : "Offline"}</span>
        </div>
        <div className="pg-actions">
          <button
            type="button"
            className="btn-secondary btn-small clickable"
            onClick={() => setParams(tab === "Task lists" ? {} : { tab: "Task lists" }, { replace: true })}
            title="Home"
          >
            Home
          </button>
        </div>
      </header>

      {voiceNotice && (
        <section className="pg-card" role="status" aria-label="Read aloud status notice" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13 }}>
            <strong>Read aloud:</strong>{" "}
            {voiceNotice.kind === "online-only"
              ? "Only online voices found. Install a local voice for offline reading."
              : voiceNotice.kind === "no-voices"
                ? "No voices found on this device for read-aloud."
                : "Read-aloud speech synthesis is not supported in this browser."}
          </span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {voiceNotice.kind !== "not-supported" && (
              <button
                type="button"
                className="btn-secondary btn-small clickable"
                onClick={() => {
                  dismissVoiceNotice();
                  navigate("/settings#read-aloud");
                }}
              >
                Set up offline voice
              </button>
            )}
            <button type="button" className="btn-secondary btn-small clickable" onClick={dismissVoiceNotice}>
              Dismiss
            </button>
          </div>
        </section>
      )}

      <ThoughtStream />
      <CommandBox />
      <ShortcutsBar />

      <nav className="pg-chips" aria-label="Sections">
        {HOME_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`chip ${tab === t.id ? "chip-active" : ""}`}
            title={`Shortcut: ${t.shortcut}`}
            onClick={() => setParams(t.id === "Task lists" ? {} : { tab: t.id }, { replace: true })}
          >
            {t.id}
          </button>
        ))}
      </nav>

      <section className="pg-card sweep-on-mount" key={tab}>
        {tab === "Task lists" && <TaskListsHome initialFolderId={folderId} initialListId={listId} />}
        {tab === "Links" && <HomeLinksTab initialFolderId={folderId} />}
        {tab === "Notes" && <NotesPanel initialFolderId={folderId} initialNoteId={noteId} />}
        {tab === "Reminders" && <HomeRemindersTab initialFolderId={folderId} initialReminderId={reminderId} />}
        {tab === "Clipboard" && <ClipboardPanel />}
      </section>
    </div>
  );
}
