import { useCallback, useEffect, useMemo, useState } from "react";
import { createTask, listAllTasks, setTaskStatus, updateTask, type Task } from "../../data/tasks";
import { fromYmd, monthCells, sameDay, toYmd } from "./dateUtils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarPanel() {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<Date>(today);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [pick, setPick] = useState("");

  const reload = useCallback(async () => setTasks(await listAllTasks()), []);

  useEffect(() => {
    void reload();
    const h = () => void reload();
    window.addEventListener("panga-data-updated", h);
    return () => window.removeEventListener("panga-data-updated", h);
  }, [reload]);

  const cells = useMemo(() => monthCells(cursor.getFullYear(), cursor.getMonth()), [cursor]);
  const dayTasks = tasks.filter((t) => t.scheduledAt && sameDay(t.scheduledAt, selected));
  const unscheduled = tasks.filter((t) => t.status === "active" && !t.scheduledAt);
  const countFor = (d: Date) => tasks.filter((t) => t.scheduledAt && t.status !== "completed" && sameDay(t.scheduledAt, d)).length;

  async function act(fn: () => Promise<unknown>) {
    await fn();
    await reload();
  }

  const ymd = toYmd(selected.getTime());

  return (
    <div>
      <div className="pg-cal-head">
        <button type="button" className="btn-secondary btn-small clickable" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
          Prev
        </button>
        <strong>{cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</strong>
        <button type="button" className="btn-secondary btn-small clickable" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
          Next
        </button>
        <button
          type="button"
          className="btn-secondary btn-small"
          onClick={() => {
            setCursor(new Date(today.getFullYear(), today.getMonth(), 1));
            setSelected(new Date());
          }}
        >
          Today
        </button>
      </div>
      <div className="pg-cal-grid">
        {WEEKDAYS.map((w) => (
          <div key={w} className="pg-cal-dow">
            {w}
          </div>
        ))}
        {cells.map((d, i) =>
          d ? (
            <button
              key={i}
              type="button"
              className={`pg-cal-day ${sameDay(d, selected) ? "pg-cal-sel" : ""} ${sameDay(d, today) ? "pg-cal-today" : ""}`}
              onClick={() => setSelected(d)}
            >
              {d.getDate()}
              {countFor(d) > 0 && <span className="pg-cal-dot">{countFor(d)}</span>}
            </button>
          ) : (
            <div key={i} />
          )
        )}
      </div>

      <h3 className="pg-h3">{selected.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</h3>
      {dayTasks.length === 0 ? (
        <p className="pg-muted">No tasks on this day.</p>
      ) : (
        <ul className="pg-list">
          {dayTasks.map((t) => (
            <li key={t.id} className="pg-row">
              <input
                type="checkbox"
                checked={t.status === "completed"}
                aria-label="Tick off"
                onChange={() => void act(() => setTaskStatus(t.id, t.status === "completed" ? "active" : "completed"))}
              />
              <span className={`pg-grow ${t.status === "completed" ? "pg-done" : ""}`}>{t.title}</span>
              <button type="button" className="btn-secondary btn-small" onClick={() => void act(() => updateTask(t.id, { scheduledAt: null }))} title="Remove from this day">
                unschedule
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="pg-capture-row">
        <select value={pick} onChange={(e) => setPick(e.target.value)} aria-label="Pick an existing task">
          <option value="">Pick an existing task…</option>
          {unscheduled.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn-secondary"
          disabled={!pick}
          onClick={() => {
            const id = pick;
            setPick("");
            void act(() => updateTask(id, { scheduledAt: fromYmd(ymd) }));
          }}
        >
          Add to day
        </button>
      </div>
      <div className="pg-capture-row">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New task for this day…" onKeyDown={(e) => e.key === "Enter" && title.trim() && document.getElementById("pg-add-day")?.click()} />
        <button
          id="pg-add-day"
          type="button"
          className="btn-primary"
          disabled={!title.trim()}
          onClick={() => {
            const t = title.trim();
            setTitle("");
            void act(() => createTask({ title: t, scheduledAt: fromYmd(ymd) }));
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}
