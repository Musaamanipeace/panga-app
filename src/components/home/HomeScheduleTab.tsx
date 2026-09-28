import { useMemo } from "react";
import { Link } from "react-router-dom";
import { listScheduledTasks, type Task } from "../../data/tasks.tsx"
import { listAllProjects } from "../../data/projects.tsx"
import { listAllCalendarEvents } from "../../data/calendar.tsx"
import type { CalendarEvent } from "../../data/db.tsx"
import { ErrorNote, Loading, StatusLabel, useAsync } from "../../components/ui.tsx"

const DAY = 24 * 60 * 60 * 1000;

export default function HomeScheduleTab() {
  const { data, error, loading, reload } = useAsync(async () => {
    const [tasks, projects, events] = await Promise.all([
      listScheduledTasks(),
      listAllProjects(),
      listAllCalendarEvents(),
    ]);
    return { tasks, projects, events };
  }, []);

  const projectName = useMemo(
    () => new Map((data?.projects ?? []).map((p) => [p.id, p.name])),
    [data]
  );

  const { tasksByDay, eventsByDay } = useMemo(() => groupByDay(data), [data]);

  if (error) return <ErrorNote error={error} onRetry={reload} />;
  if (loading) return <Loading label="Loading schedule..." />;

  const days = [...new Set([...tasksByDay.keys(), ...eventsByDay.keys()])].sort();

  if (days.length === 0) {
    return (
      <p className="empty-state">
        Nothing scheduled. Give a task a date and time in a project's Tasks tab, or
        connect Google Calendar in Settings to import events.
      </p>
    );
  }

  return (
    <div className="stack">
      {days.map((day) => (
        <section key={day} className="schedule-day">
          <h3 className="section-heading">{formatDay(day)}</h3>
          <ul className="item-list">
            {(tasksByDay.get(day) ?? []).map((task) => (
              <ScheduleRow
                key={task.id}
                kind="task"
                title={task.title}
                time={task.scheduledAt!}
                meta={`${projectName.get(task.projectId) ?? "Unknown project"} · ${
                  task.executor === "ai" ? "AI" : "Manual"
                }`}
                to={`/project/${task.projectId}?tab=Tasks`}
                openTip="Open this task in its project"
              />
            ))}
            {(eventsByDay.get(day) ?? []).map((event) => (
              <ScheduleRow
                key={event.id}
                kind="event"
                title={event.title}
                time={event.startAt}
                endTime={event.endAt}
                meta={event.source === "google" ? "Google Calendar" : "Local event"}
                meetLink={event.meetLink}
                to={event.projectId ? `/project/${event.projectId}?tab=Tasks` : undefined}
                openTip="Open the project this event belongs to"
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function ScheduleRow({
  kind,
  title,
  time,
  endTime,
  meta,
  meetLink,
  to,
  openTip,
}: {
  kind: "task" | "event";
  title: string;
  time: number;
  endTime?: number;
  meta: string;
  meetLink?: string | null;
  to?: string;
  openTip: string;
}) {
  return (
    <li className="item">
      <span className="schedule-time">{formatTime(time)}</span>
      <span className="item-body">
        <span className="item-title">{title}</span>
        <span className="item-meta">
          <StatusLabel status={kind === "task" ? "task" : "event"} />
          <span className="text-tiny">{meta}</span>
          {endTime && endTime > time && (
            <span className="text-tiny">until {formatTime(endTime)}</span>
          )}
        </span>
      </span>
      <span className="item-actions">
        {meetLink && (
          <a
            href={meetLink}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary btn-small"
            data-tip="Join the Google Meet for this event"
            data-tip-edge="left"
          >
            Join Meet
          </a>
        )}
        {to && (
          <Link to={to} className="btn-icon" data-tip={openTip} data-tip-edge="left">
            Open
          </Link>
        )}
      </span>
    </li>
  );
}

function groupByDay(
  data: { tasks: Task[]; events: CalendarEvent[] } | null
): { tasksByDay: Map<number, Task[]>; eventsByDay: Map<number, CalendarEvent[]> } {
  const tasksByDay = new Map<number, Task[]>();
  const eventsByDay = new Map<number, CalendarEvent[]>();
  for (const task of data?.tasks ?? []) {
    if (!task.scheduledAt) continue;
    push(tasksByDay, startOfDay(task.scheduledAt), task);
  }
  for (const event of data?.events ?? []) {
    if (event.startAt < Date.now() - DAY) continue;
    push(eventsByDay, startOfDay(event.startAt), event);
  }
  return { tasksByDay, eventsByDay };
}

function push<T>(map: Map<number, T[]>, key: number, value: T) {
  const list = map.get(key) ?? [];
  list.push(value);
  map.set(key, list);
}

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function formatDay(ts: number): string {
  const d = new Date(ts);
  const today = startOfDay(Date.now());
  if (ts === today) return "Today";
  if (ts === today + DAY) return "Tomorrow";
  if (ts === today - DAY) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short" });
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}
