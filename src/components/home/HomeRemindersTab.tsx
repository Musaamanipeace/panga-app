import { useEffect, useMemo, useState } from "react";
import {
  bucketReminders,
  createReminder,
  deleteReminder,
  dismissReminder,
  listPendingReminders,
  startReminderScheduler,
  updateReminder,
  type Reminder,
  type ReminderBucket,
  TONE_PRESETS,
  requestNotificationPermission,
} from "../../data/reminders";
import { ErrorNote, Loading, StatusLabel, useAsync, Editable, confirmDelete } from "../../components/ui";

const BUCKET_ORDER: { id: ReminderBucket; label: string; hint: string }[] = [
  { id: "overdue", label: "Overdue", hint: "Reminders whose time has passed" },
  { id: "due", label: "Due today", hint: "Reminders due later today" },
  { id: "upcoming", label: "Upcoming", hint: "Reminders still in the future" },
];

function ReminderForm({
  message,
  setMessage,
  when,
  setWhen,
  toneId,
  setToneId,
  permGranted,
  setPermGranted,
  requestingPerm,
  setRequestingPerm,
  onCreate,
}: {
  message: string;
  setMessage: (v: string) => void;
  when: string;
  setWhen: (v: string) => void;
  toneId: string;
  setToneId: (v: string) => void;
  permGranted: boolean | null;
  setPermGranted: (v: boolean | null) => void;
  requestingPerm: boolean;
  setRequestingPerm: (v: boolean) => void;
  onCreate: () => void;
}) {
  async function ensurePermission() {
    if (requestingPerm) return;
    setRequestingPerm(true);
    const granted = await requestNotificationPermission();
    setPermGranted(granted);
    setRequestingPerm(false);
  }

  return (
    <section className="dashboard-section">
      <h3 className="section-heading">New reminder</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onCreate();
        }}
      >
        <div style={{ display: "flex", gap: "8px", alignItems: "flex-end", flexWrap: "wrap" }}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Reminder message"
            required
            style={{ padding: "8px 10px", fontSize: "13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", flex: 1, minWidth: 0 }}
          />
          <input
            type="datetime-local"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            required
            style={{ padding: "8px 10px", fontSize: "13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}
          />
          <select
            value={toneId}
            onChange={(e) => setToneId(e.target.value)}
            style={{ padding: "8px 10px", fontSize: "13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}
          >
            {TONE_PRESETS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-primary clickable">
            Create
          </button>
        </div>
        {permGranted === false && !requestingPerm && (
          <button type="button" className="btn-secondary btn-small clickable" onClick={() => void ensurePermission()} style={{ marginTop: "6px" }}>
            Enable notifications
          </button>
        )}
        {requestingPerm && <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Requesting permission…</span>}
      </form>
    </section>
  );
}

/** datetime-local inputs need a local-time string, not an ISO UTC one. */
export function toLocalInput(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function HomeRemindersTab() {
  const { data, error, loading, reload } = useAsync(async () => {
    const reminders = await listPendingReminders();
    return { reminders };
  }, []);

  const [requestingPerm, setRequestingPerm] = useState(false);
  const [permGranted, setPermGranted] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const [when, setWhen] = useState("");
  const [toneId, setToneId] = useState("default");

  useEffect(() => {
    void startReminderScheduler();
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      setPermGranted(null);
    } else {
      setPermGranted(Notification.permission === "granted");
    }
  }, []);

  async function ensurePermission() {
    if (requestingPerm) return;
    setRequestingPerm(true);
    const granted = await requestNotificationPermission();
    setPermGranted(granted);
    setRequestingPerm(false);
  }

  const buckets = useMemo(() => bucketReminders(data?.reminders ?? []), [data]);

  async function handleCreate() {
    if (!message.trim() || !when) return;
    const triggerAt = new Date(when).getTime();
    await createReminder({ message: message.trim(), triggerAt, toneId: toneId || undefined, linkedEntityType: null, linkedEntityId: null });
    if (permGranted !== true) {
      void ensurePermission();
    }
    setMessage("");
    setWhen("");
    await reload();
  }

  async function refresh() {
    await reload();
  }

  if (error) return <ErrorNote error={error} onRetry={reload} />;
  if (loading) return <Loading label="Loading reminders..." />;

  return (
    <div className="stack">
      <ReminderForm
        message={message}
        setMessage={setMessage}
        when={when}
        setWhen={setWhen}
        toneId={toneId}
        setToneId={setToneId}
        permGranted={permGranted}
        setPermGranted={setPermGranted}
        requestingPerm={requestingPerm}
        setRequestingPerm={setRequestingPerm}
        onCreate={handleCreate}
      />
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
                {items.map((reminder: Reminder) => (
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
                        {reminder.toneId && <span className="chip-small">{reminder.toneId}</span>}
                        {id === "overdue" && <StatusLabel status="overdue" className="chip-overdue" />}
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
                          await updateReminder(reminder.id, { triggerAt: new Date(e.target.value).getTime() });
                          await refresh();
                        }}
                        data-tip="Move this reminder to a different time"
                        data-tip-edge="left"
                      />
                      <select
                        value={reminder.toneId ?? "default"}
                        onChange={async (e) => {
                          await updateReminder(reminder.id, { toneId: e.target.value || undefined });
                          await refresh();
                        }}
                        style={{ fontSize: "12px", padding: "2px 6px", borderRadius: "var(--radius-sm)" }}
                        data-tip="Notification tone"
                      >
                        {TONE_PRESETS.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.label}
                          </option>
                        ))}
                      </select>
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
                          if (!(await confirmDelete({ kind: "reminder", name: reminder.message }))) return;
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
