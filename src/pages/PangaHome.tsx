import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CAPTURE_INPUT_ID } from "../components/home/ThoughtStream";
import CommandBox from "../components/home/CommandBox";
import TaskListsHome from "../components/home/TaskListsHome";
import HomeLinksTab from "../components/home/HomeLinksTab";
import NotesPanel from "../components/home/NotesPanel";
import HomeRemindersTab from "../components/home/HomeRemindersTab";
import ClipboardPanel from "../components/home/ClipboardPanel";
import { pasteWithFeedback } from "../components/quickPaste";

const TABS = ["Task lists", "Links", "Notes", "Reminders", "Clipboard"] as const;
type Tab = (typeof TABS)[number];

export default function PangaHome() {
  const [params, setParams] = useSearchParams();
  const raw = params.get("tab");
  const tab: Tab = (TABS as readonly string[]).includes(raw ?? "") ? (raw as Tab) : "Task lists";

  // Launched from the "Quick capture" app shortcut: put the cursor in the capture box.
  useEffect(() => {
    if (params.get("capture") === "1") {
      const t = window.setTimeout(() => document.getElementById(CAPTURE_INPUT_ID)?.focus(), 150);
      return () => window.clearTimeout(t);
    }
  }, [params]);

  return (
    <div className="page pg-home">
      <header className="pg-head">
        <h1>Panga</h1>
        <div className="pg-actions">
          <button type="button" className="btn-secondary btn-small clickable" onClick={() => void pasteWithFeedback()} title="Save what is on your clipboard">
            📋 Paste
          </button>
          <button type="button" className="btn-secondary btn-small clickable" onClick={() => setParams(tab === "Task lists" ? {} : { tab: "Task lists" }, { replace: true })} title="Home">
            Home
          </button>
        </div>
      </header>

      <ThoughtStream />
      <CommandBox />

      <nav className="pg-chips" aria-label="Sections">
        {TABS.map((t) => (
          <button key={t} type="button" className={`chip ${tab === t ? "chip-active" : ""}`} onClick={() => setParams(t === "Task lists" ? {} : { tab: t }, { replace: true })}>
            {t}
          </button>
        ))}
      </nav>

      <section className="pg-card">
        {tab === "Task lists" && <TaskListsHome />}
        {tab === "Links" && <HomeLinksTab />}
        {tab === "Notes" && <NotesPanel />}
        {tab === "Reminders" && <HomeRemindersTab />}
        {tab === "Clipboard" && <ClipboardPanel />}
      </section>
    </div>
  );
}
