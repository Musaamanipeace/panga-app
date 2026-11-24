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
import {
  createReminderFolder,
  deleteReminderFolder,
  listReminderFolders,
  updateReminderFolder,
  type ReminderFolder,
} from "../../data/reminderFolders";
import { ErrorNote, Loading, StatusLabel, useAsync, Editable, confirmDelete } from "../../components/ui";
import FolderTree from "./FolderTree";

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
  folderId,
  setFolderId,
  folders,
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
  folderId: string | null;
  setFolderId: (v: string | null) => void;
  folders: ReminderFolder[];
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
          <select
            value={folderId ?? ""}
            onChange={(e) => setFolderId(e.target.value || null)}
            style={{ padding: "8px 10px", fontSize: "13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}
          >
            <option value="">None (unfiled)</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.title}
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

export default function HomeRemindersTab({
  initialFolderId,
  initialReminderId,
}: {
  initialFolderId?: string | null;
  initialReminderId?: string | null;
}) {
  const { data, error, loading, reload } = useAsync(async () => {
    const [reminders, folders] = await Promise.all([listPendingReminders(), listReminderFolders()]);
    return { reminders, folders };
  }, []);

  useEffect(() => {
    const onUpdate = () => void reload();
    window.addEventListener("panga-data-updated", onUpdate);
    return () => window.removeEventListener("panga-data-updated", onUpdate);
  }, [reload]);

  const [requestingPerm, setRequestingPerm] = useState(false);
  const [permGranted, setPermGranted] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const [when, setWhen] = useState("");
  const [toneId, setToneId] = useState("default");
  const [folderId, setFolderId] = useState<string | null>(null);

  const [selType, setSelType] = useState<"folder" | "reminder" | null>(null);
  const [selId, setSelId] = useState<string | null>(null);

  const folders: ReminderFolder[] = data?.folders ?? [];
  const allReminders: Reminder[] = data?.reminders ?? [];

  const currentFolder = useMemo(() => folders.find((f) => f.id === selId) ?? null, [folders, selId]);
  const currentReminder = useMemo(() => allReminders.find((r) => r.id === selId) ?? null, [allReminders, selId]);

  const folderReminders = useMemo(() => allReminders.filter((r) => r.folderId === (currentFolder?.id ?? null)), [allReminders, currentFolder]);
  const buckets = useMemo(() => bucketReminders(folderReminders), [folderReminders]);

  // A search result or shortcut for a folder/reminder selects it directly.
  useEffect(() => {
    if (initialReminderId) {
      const targetReminder = allReminders.find((r) => r.id === initialReminderId);
      if (targetReminder) {
        setSelType("reminder");
        setSelId(targetReminder.id);
        return;
      }
    }
    if (!initialFolderId) return;
    const target = folders.find((f) => f.id === initialFolderId);
    if (target) {
      setSelType("folder");
      setSelId(target.id);
    }
  }, [initialFolderId, initialReminderId, folders, allReminders]);

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

  async function handleCreate() {
    if (!message.trim() || !when) return;
    const triggerAt = new Date(when).getTime();
    await createReminder({ message: message.trim(), triggerAt, toneId: toneId || undefined, linkedEntityType: null, linkedEntityId: null, folderId: folderId ?? null });
    if (permGranted !== true) {
      void ensurePermission();
    }
    setMessage("");
    setWhen("");
    setFolderId(null);
    await reload();
  }

  async function refresh() {
    await reload();
  }

  async function handleCreateFolder(parentId: string | null, title: string) {
    await createReminderFolder({ title: title.trim(), parentFolderId: parentId });
    await reload();
  }

  async function handleRenameFolder(id: string, title: string) {
    await updateReminderFolder(id, { title: title.trim() });
    await reload();
  }

  async function handleDeleteFolder(id: string) {
    const folder = folders.find((f) => f.id === id);
    const has = allReminders.some((r) => r.folderId === id);
    if (has && !(await confirmDelete({ kind: "reminder folder", name: `${folder?.title} (contains ${has} reminders — contents will be reparented)` }))) return;
    if (!has && !(await confirmDelete({ kind: "reminder folder", name: folder?.title }))) return;
    await deleteReminderFolder(id);
    if (selId === id) setSelId(null);
    await reload();
  }

  if (error) return <ErrorNote error={error} onRetry={reload} />;
  if (loading) return <Loading label="Loading reminders..." />;

  return (
    <div className="stack" style={{ display: "flex", flex: 1, minHeight: 0 }}>
      <aside style={{ flex: "0 0 240px", borderRight: "1px solid var(--color-border)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 16 }}>Reminder folders</h2>
          <button type="button" className="btn-secondary btn-small clickable" onClick={() => document.getElementById("new-reminder-folder-input")?.focus()} data-tip="New reminder folder">New</button>
        </div>
        <FolderTree
          foldersAsGrid
          folders={folders}
          items={allReminders}
          folderId={(f) => f.id}
          folderParentId={(f) => f.parentFolderId}
          folderTitle={(f) => f.title}
          itemId={(r) => r.id}
          itemFolderId={(r) => r.folderId}
          itemTitle={(r) => r.message}
          selectedId={selId}
          onSelectFolder={(id) => { setSelType("folder"); setSelId(id); }}
          onSelectItem={(id) => { setSelType("reminder"); setSelId(id); }}
          onCreateFolder={handleCreateFolder}
          onRenameFolder={handleRenameFolder}
          onDeleteFolder={handleDeleteFolder}
          newFolderPlaceholder={selType === "folder" ? `New folder under "${currentFolder?.title}"…` : "New folder…"}
          renderItemTitle={(r) => (
            <span style={{ flex: 1, minWidth: 0 }}>{r.message}</span>
          )}
          renderFolderMeta={(f) => {
            const n = allReminders.filter((r) => r.folderId === f.id).length;
            return n > 0 ? <span className="item-meta">{n}</span> : null;
          }}
        />
      </aside>

      <main style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <ReminderForm
          message={message}
          setMessage={setMessage}
          when={when}
          setWhen={setWhen}
          toneId={toneId}
          setToneId={setToneId}
          folderId={folderId}
          setFolderId={setFolderId}
          folders={folders}
          permGranted={permGranted}
          setPermGranted={setPermGranted}
          requestingPerm={requestingPerm}
          setRequestingPerm={setRequestingPerm}
          onCreate={handleCreate}
        />

        {currentReminder && selType === "reminder" ? (
          <section className="dashboard-section" style={{ padding: "12px 16px" }}>
            <h3 className="section-heading">Reminder</h3>
            <Editable
              className="item-title"
              value={currentReminder.message}
              onSave={async (message) => {
                await updateReminder(currentReminder.id, { message });
                await refresh();
              }}
              label="Edit reminder text"
            />
            <div style={{ marginTop: 8, display: "flex", gap: 10, alignItems: "center" }}>
              <input
                type="datetime-local"
                className="reminder-time-input"
                defaultValue={toLocalInput(currentReminder.triggerAt)}
                aria-label="Reminder time"
                onChange={async (e) => {
                  if (!e.target.value) return;
                  await updateReminder(currentReminder.id, { triggerAt: new Date(e.target.value).getTime() });
                  await refresh();
                }}
              />
              <select
                value={currentReminder.toneId ?? "default"}
                onChange={async (e) => {
                  await updateReminder(currentReminder.id, { toneId: e.target.value || undefined });
                  await refresh();
                }}
                style={{ fontSize: "12px", padding: "2px 6px", borderRadius: "var(--radius-sm)" }}
              >
                {TONE_PRESETS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn-secondary btn-small clickable"
                onClick={async () => {
                  await dismissReminder(currentReminder.id);
                  await refresh();
                }}
                data-tip="Dismiss this reminder"
              >
                Done
              </button>
              <button
                type="button"
                className="btn-secondary btn-small clickable"
                style={{ color: "var(--color-accent-issue)" }}
                onClick={async () => {
                  if (!(await confirmDelete({ kind: "reminder", name: currentReminder.message }))) return;
                  await deleteReminder(currentReminder.id);
                  await refresh();
                }}
                data-tip="Delete this reminder"
              >
                Delete
              </button>
            </div>
          </section>
        ) : (
          <>
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
                              className="btn-secondary btn-small clickable"
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
                              className="btn-secondary btn-small clickable"
                              style={{ color: "var(--color-accent-issue)" }}
                              onClick={async () => {
                                if (!(await confirmDelete({ kind: "reminder", name: reminder.message }))) return;
                                await deleteReminder(reminder.id);
                                await refresh();
                              }}
                              data-tip="Delete this reminder"
                              data-tip-edge="left"
                            >
                              Delete
                            </button>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </>
        )}
      </main>
    </div>
  );
}
