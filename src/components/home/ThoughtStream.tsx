import { useCallback, useEffect, useState } from "react";
import { addThought, deleteThought, listThoughts, updateThought, type ThoughtEntry } from "../../data/thoughts";
import { createTask } from "../../data/tasks";
import { listTaskLists, type TaskList } from "../../data/taskLists";
import { confirmDelete, showToast } from "../ui";

export const CAPTURE_INPUT_ID = "panga-capture-input";

export default function ThoughtStream() {
  const [thoughts, setThoughts] = useState<ThoughtEntry[]>([]);
  const [draft, setDraft] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [lists, setLists] = useState<TaskList[]>([]);
  const [promoting, setPromoting] = useState<{ id: string; text: string } | null>(null);
  const [promoteListId, setPromoteListId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const [thoughtsList, allLists] = await Promise.all([listThoughts(showAll ? 200 : 8), listTaskLists()]);
    setThoughts(thoughtsList);
    setLists(allLists);
  }, [showAll]);

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
    const listId = promoteListId ?? (lists.length ? lists[0].id : null);
    const task = await createTask({ listId, title: firstLine, notes: th.text.length > firstLine.length ? th.text : "" });
    await updateThought(th.id, { taskId: task.id });
    setPromoting(null);
    setPromoteListId(null);
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
          {thoughts.map((th) => {
            const promotingThis = promoting?.id === th.id;
            return (
              <li key={th.id} className="pg-row">
                <span className="pg-grow">
                  {th.text}
                  <time className="pg-muted"> · {new Date(th.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</time>
                </span>
                {th.taskId ? (
                  <span className="chip-small">task ✓</span>
                ) : promotingThis ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <select
                      value={promoteListId ?? ""}
                      onChange={(e) => setPromoteListId(e.target.value || null)}
                      style={{ fontSize: "12px", padding: "2px 6px", borderRadius: "var(--radius-sm)" } as any}
                    >
                      <option value="">Inbox</option>
                      {lists.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.title}
                        </option>
                      ))}
                    </select>
                    <button type="button" className="btn-secondary btn-small" onClick={() => void toTask(th)}>→ task</button>
                    <button type="button" className="btn-secondary btn-small" onClick={() => setPromoting(null)}>✕</button>
                  </div>
                ) : (
                  <button type="button" className="btn-secondary btn-small" onClick={() => setPromoting({ id: th.id, text: th.text })} title="Turn this into a task">
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
            );
          })}
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
