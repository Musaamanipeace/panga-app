import { useState, useEffect, useCallback } from "react";
import MicButton from "./MicButton";
import { confirmDelete } from "./ui";
import { listThoughts, addThought, deleteThought, type ThoughtEntry } from "../data/thoughts";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ThoughtTrain({ open, onClose }: Props) {
  const [thoughts, setThoughts] = useState<ThoughtEntry[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    setThoughts(await listThoughts());
  }, []);

  useEffect(() => {
    if (open) void reload();
  }, [open, reload]);

  useEffect(() => {
    const h = () => void reload();
    window.addEventListener("panga-data-updated", h);
    return () => window.removeEventListener("panga-data-updated", h);
  }, [reload]);

  async function submit() {
    const t = draft.trim();
    if (!t) return;
    setLoading(true);
    try {
      await addThought(t);
      setDraft("");
      await reload();
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  }

  if (!open) return null;

  return (
    <div className="thought-panel-overlay" onClick={onClose} role="presentation">
      <aside
        className="thought-panel slide-enter"
        onClick={(e) => e.stopPropagation()}
        aria-label="Thought train"
      >
        <header className="thought-panel-header">
          <div>
            <h2>Thought train</h2>
            <p className="thought-panel-sub">
              Capture fleeting notes in a distracting workplace. Voice supported. Scroll back anytime.
            </p>
          </div>
          <button type="button" className="btn-icon clickable" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <div className="thought-input-row">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="What just crossed your mind?"
            rows={3}
            autoFocus
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <button
              type="button"
              className="btn-primary btn-small"
              onClick={() => void submit()}
              disabled={!draft.trim() || loading}
            >
              Add
            </button>
            <MicButton
              onResult={(text) => {
                setDraft((d) => (d ? d + " " + text : text));
              }}
            />
          </div>
        </div>

        <ul className="thought-list">
          {thoughts.length === 0 && (
            <li style={{ color: "var(--color-text-muted)", border: "none" }}>
              No thoughts yet — add one above.
            </li>
          )}
          {thoughts.map((th) => (
            <li key={th.id}>
              <span>{th.text}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <time dateTime={new Date(th.createdAt).toISOString()}>
                  {new Date(th.createdAt).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
                <button
                  type="button"
                  className="btn-icon"
                  style={{ width: 22, height: 22, fontSize: 11 }}
                  title="Delete"
                  onClick={async () => {
                    if (!(await confirmDelete({ kind: "thought" }))) return;
                    await deleteThought(th.id);
                    reload();
                  }}
                >
                  ×
                </button>
              </span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
