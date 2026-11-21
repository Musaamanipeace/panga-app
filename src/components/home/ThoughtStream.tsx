import { useCallback, useEffect, useState } from "react";
import { addThought, deleteThought, listThoughts, updateThought, type ThoughtEntry } from "../../data/thoughts";
import { createTask } from "../../data/tasks";
import { confirmDelete, showToast } from "../ui";

export const CAPTURE_INPUT_ID = "panga-capture-input";

export default function ThoughtStream() {
  const [thoughts, setThoughts] = useState<ThoughtEntry[]>([]);
  const [draft, setDraft] = useState("");
  const [showAll, setShowAll] = useState(false);

  const reload = useCallback(async () => setThoughts(await listThoughts(showAll ? 200 : 8)), [showAll]);

  useEffect(() => {
    void reload();
    const h = () => void reload();
    window.addEventListener("panga-data-updated", h);
    return () => window.removeEventListener("panga-data-updated", h);
  }, [reload]);

  async function submit() {
    const t = draft.trim();
    if (!t) return;
    setDraft("");
    await addThought(t);
  }

  async function toTask(th: ThoughtEntry) {
    const firstLine = th.text.split(/\r?\n/)[0].slice(0, 160);
    const task = await createTask({ title: firstLine, notes: th.text.length > firstLine.length ? th.text : "" });
    await updateThought(th.id, { taskId: task.id });
    window.dispatchEvent(new CustomEvent("panga-data-updated"));
    showToast("Added to tasks", "success");
  }

  return (
    <section className="pg-card">
      <div className="pg-capture-row">
        <textarea
          id={CAPTURE_INPUT_ID}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void submit();
            }
          }}
          rows={2}
          placeholder="What just crossed your mind? (Enter to save, mic to speak)"
        />
        <button type="button" className="btn-primary" disabled={!draft.trim()} onClick={() => void submit()}>
          Add
        </button>
      </div>
      {thoughts.length > 0 && (
        <ul className="pg-list">
          {thoughts.map((th) => (
            <li key={th.id} className="pg-row">
              <span className="pg-grow">
                {th.text}
                <time className="pg-muted"> · {new Date(th.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</time>
              </span>
              {th.taskId ? (
                <span className="chip-small">task ✓</span>
              ) : (
                <button type="button" className="btn-secondary btn-small" onClick={() => void toTask(th)} title="Turn this into a task">
                  → task
                </button>
              )}
              <button
                type="button"
                className="btn-icon"
                aria-label="Delete thought"
                onClick={async () => {
                  if (await confirmDelete({ kind: "thought" })) await deleteThought(th.id);
                }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="pg-actions">
        <button type="button" className="btn-secondary btn-small" onClick={() => setShowAll((v) => !v)}>
          {showAll ? "Show fewer" : "Show history"}
        </button>
        <button
          type="button"
          className="btn-secondary btn-small"
          onClick={() => window.dispatchEvent(new CustomEvent("panga-ai-command", { detail: "Turn my recent thoughts that are not yet tasks into tasks." }))}
          title="Uses your own AI key"
        >
          ✨ Make tasks from thoughts
        </button>
      </div>
    </section>
  );
}
