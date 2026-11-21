import { useEffect } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import ThoughtStream, { CAPTURE_INPUT_ID } from "../components/home/ThoughtStream";
import CommandBox from "../components/home/CommandBox";
import TasksPanel from "../components/home/TasksPanel";
import CalendarPanel from "../components/home/CalendarPanel";
import NotesPanel from "../components/home/NotesPanel";
import ClipboardPanel from "../components/home/ClipboardPanel";
import PdfReader from "../components/home/PdfReader";
import { pasteWithFeedback } from "../components/quickPaste";

const TABS = ["Tasks", "Calendar", "Notes", "Clipboard", "PDFs"] as const;
type Tab = (typeof TABS)[number];

export default function PangaHome() {
  const [params, setParams] = useSearchParams();
  const raw = params.get("tab");
  const tab: Tab = (TABS as readonly string[]).includes(raw ?? "") ? (raw as Tab) : "Tasks";

  // Launched from the "Quick capture" app shortcut: put the cursor in the capture box.
  useEffect(() => {
    if (params.get("capture") === "1") {
      const t = window.setTimeout(() => document.getElementById(CAPTURE_INPUT_ID)?.focus(), 150);
      return () => window.clearTimeout(t);
    }
  }, [params]);

  // Old links like /home?tab=Resources point at the workspace screens.
  if (raw === "Resources" || raw === "Links") return <Navigate to="/workspaces?section=Resources" replace />;

  return (
    <div className="page pg-home">
      <header className="pg-head">
        <h1>Panga</h1>
        <div className="pg-actions">
          <button type="button" className="btn-secondary btn-small clickable" onClick={() => void pasteWithFeedback()} title="Save what is on your clipboard">
            📋 Paste
          </button>
          <Link to="/workspaces" className="btn-secondary btn-small clickable">
            Workspaces
          </Link>
        </div>
      </header>

      <ThoughtStream />
      <CommandBox />

      <nav className="pg-chips" aria-label="Sections">
        {TABS.map((t) => (
          <button key={t} type="button" className={`chip ${tab === t ? "chip-active" : ""}`} onClick={() => setParams(t === "Tasks" ? {} : { tab: t }, { replace: true })}>
            {t}
          </button>
        ))}
      </nav>

      <section className="pg-card">
        {tab === "Tasks" && <TasksPanel />}
        {tab === "Calendar" && <CalendarPanel />}
        {tab === "Notes" && <NotesPanel />}
        {tab === "Clipboard" && <ClipboardPanel />}
        {tab === "PDFs" && <PdfReader />}
      </section>
    </div>
  );
}
