import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  listPendingReminders,
  bucketReminders,
  dismissReminder,
  deleteReminder,
  updateReminder,
  type ReminderBucket,
} from "../../data/reminders";
import { listAllProjects } from "../../data/projects";
import { ErrorNote, Loading, StatusLabel, useAsync, Editable } from "../../components/ui";

const BUCKET_ORDER: { id: ReminderBucket; label: string; hint: string }[] = [
  { id: "overdue", label: "Overdue", hint: "Reminders whose time has passed" },
  { id: "due", label: "Due today", hint: "Reminders due later today" },
  { id: "upcoming", label: "Upcoming", hint: "Reminders still in the future" },
];

export default function HomeRemindersTab() {
  const { data, error, loading, reload, setData } = useAsync(async () => {
    const [reminders, projects] = await Promise.all([
      listPendingReminders(),
      listAllProjects(),
    ]);
    return { reminders, projects };
  }, []);

  const projectName = useMemo(
    () => new Map((data?.projects ?? []).map((p) => [p.id, p.name])),
    [data]
  );

  const buckets = useMemo(() => bucketReminders(data?.reminders ?? []), [data]);

  if (error) return <ErrorNote error={error} onRetry={reload} />;
  if (loading) return <Loading label="Loading reminders..." />;

  const total = (data?.reminders ?? []).length;
  if (total === 0) {
    return (
      <p className="empty-state">
        No pending reminders. Create one from a project's Tasks tab, or ask the
        assistant to remind you about something.
      </p>
    );
  }

  async function refresh() {
    setData({
      reminders: await listPendingReminders(),
      projects: await listAllProjects(),
    });
  }

  return (
    <div className="stack">
      {BUCKET_ORDER.map(({ id, label, hint }) => {
        const items = buckets[id];
        return (
          <section key={id} className="dashboard-section">
            <h3 className="section-heading" data-tip={hint}>
              {label} <span className="tab-btn-count">{items.length}</span>
            </h3>
            {items.length === 0 ? (
              <p className="empty-state">Nothing here.</p>
            ) : (
              <ul className="item-list">
                {items.map((reminder) => (
                  <li key={reminder.id} className="item item-row-wrap">
                    <span className="item-body">
                      <Editable
                        className="item-title"
                        value={reminder.message}
                        onSave={async (message) => {
                          await updateReminder(reminder.id, { message });
                          await refresh();
                        }}
                        label="Edit reminder text"
                      />
                      <span className="item-meta">
                        <StatusLabel status={new Date(reminder.triggerAt).toLocaleString()} />
                        {reminder.projectId && (
                          <Link
                            to={`/project/${reminder.projectId}?tab=Tasks`}
                            data-tip="Open the project this reminder belongs to"
                          >
                            {projectName.get(reminder.projectId) ?? "Unknown project"}
                          </Link>
                        )}
                        {id === "overdue" && (
                          <StatusLabel status="overdue" className="chip-overdue" />
                        )}
                      </span>
                    </span>
                    <span className="item-actions">
                      <input
                        type="datetime-local"
                        className="reminder-time-input"
                        defaultValue={toLocalInput(reminder.triggerAt)}
                        aria-label="Reminder time"
                        onChange={async (e) => {
                          if (!e.target.value) return;
                          await updateReminder(reminder.id, {
                            triggerAt: new Date(e.target.value).getTime(),
                          });
                          await refresh();
                        }}
                        data-tip="Move this reminder to a different time"
                        data-tip-edge="left"
                      />
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={async () => {
                          await dismissReminder(reminder.id);
                          await refresh();
                        }}
                        data-tip="Dismiss this reminder"
                        data-tip-edge="left"
                      >
                        Done
                      </button>
                      <button
                        type="button"
                        className="btn-icon btn-icon-danger"
                        onClick={async () => {
                          await deleteReminder(reminder.id);
                          await refresh();
                        }}
                        data-tip="Delete this reminder"
                        data-tip-edge="left"
                      >
                        Del
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

/** datetime-local inputs need a local-time string, not an ISO UTC one. */
export function toLocalInput(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}
