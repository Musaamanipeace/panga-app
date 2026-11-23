import { useCallback, useEffect, useMemo, useState } from "react";
import { createTask, deleteTask, listAllTasks, setTaskStatus, updateTask, type Task, type TaskHorizon, type TaskStatus } from "../../data/tasks";
import { confirmDelete } from "../ui";
import { fromYmd, toYmd } from "./dateUtils";

const FILTERS: { id: TaskStatus; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
  { id: "completed", label: "Done" },
];

export default function TasksPanel() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [status, setStatus] = useState<TaskStatus>("active");
  const [horizon, setHorizon] = useState<"all" | TaskHorizon>("all");
  const [title, setTitle] = useState("");
  const [newHorizon, setNewHorizon] = useState<TaskHorizon>("short");
  const [editing, setEditing] = useState<{ id: string; title: string } | null>(null);

  const reload = useCallback(async () => setTasks(await listAllTasks()), []);

  useEffect(() => {
    void reload();
    const h = () => void reload();
    window.addEventListener("panga-data-updated", h);
    return () => window.removeEventListener("panga-data-updated", h);
  }, [reload]);

  const counts = useMemo(() => {
    const c: Record<TaskStatus, number> = { active: 0, inactive: 0, completed: 0 };
    for (const t of tasks) c[t.status]++;
    return c;
  }, [tasks]);

  const shown = tasks
    .filter((t) => t.status === status && (horizon === "all" || (t.horizon ?? "short") === horizon))
    .sort((a, b) => (a.scheduledAt ?? Infinity) - (b.scheduledAt ?? Infinity) || b.createdAt - a.createdAt);

  async function add() {
    const t = title.trim();
    if (!t) return;
    setTitle("");
    await createTask({ title: t, horizon: newHorizon });
    setStatus("active");
    await reload();
  }

  async function act(fn: () => Promise<void>) {
    await fn();
    await reload();
  }

  return (
    <div>
      <div className="pg-capture-row">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void add()}
          placeholder="New task…"
        />
        <select value={newHorizon} onChange={(e) => setNewHorizon(e.target.value as TaskHorizon)} aria-label="Short or long term">
          <option value="short">Short term</option>
          <option value="long">Long term</option>
        </select>
        <button type="button" className="btn-primary" disabled={!title.trim()} onClick={() => void add()}>
          Add
        </button>
      </div>

      <div className="pg-chips">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" className={`chip ${status === f.id ? "chip-active" : ""}`} onClick={() => setStatus(f.id)}>
            {f.label} {counts[f.id]}
          </button>
        ))}
        <span className="pg-sep" />
        {(["all", "short", "long"] as const).map((h) => (
          <button key={h} type="button" className={`chip ${horizon === h ? "chip-active" : ""}`} onClick={() => setHorizon(h)}>
            {h === "all" ? "Any term" : h === "short" ? "Short" : "Long"}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="pg-muted">Nothing here.</p>
      ) : (
        <ul className="pg-list">
          {shown.map((t) => (
            <li key={t.id} className="pg-row">
              <input
                type="checkbox"
                checked={t.status === "completed"}
                aria-label="Tick off"
                onChange={() => void act(() => setTaskStatus(t.id, t.status === "completed" ? "active" : "completed"))}
              />
              <span className="pg-grow">
                {editing?.id === t.id ? (
                  <input
                    autoFocus
                    value={editing.title}
                    onChange={(e) => setEditing({ id: t.id, title: e.target.value })}
                    onBlur={() => setEditing(null)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setEditing(null);
                      if (e.key === "Enter" && editing.title.trim()) {
                        const next = editing.title.trim();
                        setEditing(null);
                        void act(() => updateTask(t.id, { title: next }));
                      }
                    }}
                  />
                ) : (
                  <span className={t.status === "completed" ? "pg-done" : ""} onDoubleClick={() => setEditing({ id: t.id, title: t.title })} title="Double-click to edit">
                    {t.title}
                  </span>
                )}
              </span>
              <input
                type="date"
                value={toYmd(t.scheduledAt)}
                aria-label="Scheduled day"
                onChange={(e) => void act(() => updateTask(t.id, { scheduledAt: fromYmd(e.target.value, t.scheduledAt) }))}
              />
              <button
                type="button"
                className="chip"
                title="Switch short/long term"
                onClick={() => void act(() => updateTask(t.id, { horizon: (t.horizon ?? "short") === "short" ? "long" : "short" }))}
              >
                {(t.horizon ?? "short") === "short" ? "short" : "long"}
              </button>
              {t.status !== "completed" && (
                <button
                  type="button"
                  className="btn-secondary btn-small clickable"
                  title={t.status === "active" ? "Park (make inactive)" : "Make active"}
                  onClick={() => void act(() => setTaskStatus(t.id, t.status === "active" ? "inactive" : "active"))}
                >
                  {t.status === "active" ? "Park" : "Activate"}
                </button>
              )}
              <button
                type="button"
                className="btn-secondary btn-small clickable"
                aria-label="Delete task"
                onClick={async () => {
                  if (await confirmDelete({ kind: "task", name: t.title })) await act(() => deleteTask(t.id));
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
