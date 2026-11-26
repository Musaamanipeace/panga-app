import { useEffect, useMemo, useRef, useState } from "react";
import { ProofreadTrigger } from "../Proofread";
import {
  createReminder,
  deleteReminder,
  getNotificationPermissionState,
  listOpenReminders,
  requestNotificationPermission,
  startReminderScheduler,
  TONE_PRESETS,
  updateReminder,
  type NotificationPermissionState,
  type Reminder,
} from "../../data/reminders";
import {
  createReminderFolder,
  deleteReminderFolder,
  listReminderFolders,
  updateReminderFolder,
  type ReminderFolder,
} from "../../data/reminderFolders";
import type { RecurrenceUnit, ReminderRecurrence, ReminderRecurrenceEnd } from "../../data/db";
import {
  combineLocalDateTime,
  formatDayHeading,
  formatLocalTime,
  formatOverdueMeta,
  formatRecurrence,
  isTimedReminder,
  localDateInputValue,
  localTimeInputValue,
  sortOverdueReminders,
  sortTodayReminders,
  sortUpcomingReminders,
  viewOf,
  type ReminderView,
} from "../../data/recurrence";
import { hasCompletedIcsImport } from "../../data/importEvents";
import { listWorkspaces } from "../../data/workspaces";
import {
  confirmAction,
  confirmDelete,
  ErrorNote,
  Loading,
  useAsync,
} from "../../components/ui";
import { tickReminderWithUndo } from "../reminderToast";
import FolderTree from "./FolderTree";
import ImportEventsCard from "./ImportEventsCard";

type ActiveTabView = ReminderView | "all";
type RepeatPreset =
  | "none"
  | "daily"
  | "every2days"
  | "every3days"
  | "weekly"
  | "monthly"
  | "yearly"
  | "custom";
type RepeatEndMode = "never" | "until" | "count";

const WEEKDAY_CHIPS: Array<{ dow: number; label: string }> = [
  { dow: 1, label: "Mon" },
  { dow: 2, label: "Tue" },
  { dow: 3, label: "Wed" },
  { dow: 4, label: "Thu" },
  { dow: 5, label: "Fri" },
  { dow: 6, label: "Sat" },
  { dow: 0, label: "Sun" },
];

const UNFILED_FILTER = "__unfiled__";

/** datetime-local inputs need a local-time string, not an ISO UTC one. */
export function toLocalInput(ts: number): string {
  return `${localDateInputValue(ts)}T${localTimeInputValue(ts)}`;
}

function dateWeekday(dateStr: string): number {
  const ts = combineLocalDateTime(dateStr, null);
  return new Date(ts).getDay();
}

function presetFromRecurrence(rec?: ReminderRecurrence): {
  preset: RepeatPreset;
  intervalStr: string;
  unit: RecurrenceUnit;
  weekdays: number[];
  endMode: RepeatEndMode;
  untilDate: string;
  countStr: string;
} {
  const todayStr = localDateInputValue(Date.now());
  if (!rec) {
    return {
      preset: "none",
      intervalStr: "1",
      unit: "day",
      weekdays: [new Date().getDay()],
      endMode: "never",
      untilDate: todayStr,
      countStr: "5",
    };
  }

  let preset: RepeatPreset = "custom";
  if (rec.unit === "day" && rec.interval === 1) preset = "daily";
  else if (rec.unit === "day" && rec.interval === 2) preset = "every2days";
  else if (rec.unit === "day" && rec.interval === 3) preset = "every3days";
  else if (rec.unit === "week" && rec.interval === 1 && (!rec.weekdays || rec.weekdays.length <= 1)) {
    preset = "weekly";
  } else if (rec.unit === "month" && rec.interval === 1) preset = "monthly";
  else if (rec.unit === "year" && rec.interval === 1) preset = "yearly";

  const endMode: RepeatEndMode =
    rec.end?.type === "until" ? "until" : rec.end?.type === "count" ? "count" : "never";

  return {
    preset,
    intervalStr: String(rec.interval),
    unit: rec.unit,
    weekdays: rec.weekdays?.length ? rec.weekdays : [new Date(rec.anchorAt).getDay()],
    endMode,
    untilDate: rec.end?.type === "until" ? localDateInputValue(rec.end.untilAt) : todayStr,
    countStr: rec.end?.type === "count" ? String(rec.end.remaining) : "5",
  };
}

interface ReminderRowProps {
  reminder: Reminder;
  isOverdue: boolean;
  workspaceName?: string;
  onTick: (r: Reminder) => void;
  onEdit: (r: Reminder) => void;
  onDelete: (r: Reminder) => void;
}

function ReminderRow({
  reminder,
  isOverdue,
  workspaceName,
  onTick,
  onEdit,
  onDelete,
}: ReminderRowProps) {
  const timed = isTimedReminder(reminder);
  const repeatText = formatRecurrence(reminder.recurrence);

  return (
    <li className="item item-row-wrap rem-row">
      <div className="rem-row-left">
        <input
          type="checkbox"
          className="rem-tick clickable"
          checked={false}
          aria-label={`Tick off ${reminder.message}`}
          onChange={() => onTick(reminder)}
        />
        <div className="rem-row-content">
          <div className="rem-row-title-line">
            <span className="item-title">{reminder.message}</span>
            {timed && <span className="rem-time-chip">{formatLocalTime(reminder.triggerAt)}</span>}
          </div>
          {(isOverdue || repeatText || reminder.location || reminder.source === "ics" || workspaceName || reminder.notes) && (
            <div className="rem-row-meta">
              {isOverdue && (
                <span className="rem-overdue-text">{formatOverdueMeta(reminder.triggerAt)}</span>
              )}
              {repeatText && <span className="rem-muted-meta">{repeatText}</span>}
              {reminder.location && <span className="rem-muted-meta">{reminder.location}</span>}
              {reminder.source === "ics" && <span className="chip-small">Imported</span>}
              {workspaceName && <span className="chip-small">Created in {workspaceName}</span>}
              {reminder.notes && (
                <span className="rem-notes-preview">
                  {reminder.notes.length > 140 ? `${reminder.notes.slice(0, 140)}…` : reminder.notes}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="item-actions">
        <button
          type="button"
          className="btn-secondary btn-small clickable"
          onClick={() => onEdit(reminder)}
        >
          Edit
        </button>
        <button
          type="button"
          className="btn-secondary btn-small clickable tl-danger"
          onClick={() => onDelete(reminder)}
        >
          Delete
        </button>
      </div>
    </li>
  );
}

export default function HomeRemindersTab({
  initialFolderId,
  initialReminderId,
}: {
  initialFolderId?: string | null;
  initialReminderId?: string | null;
}) {
  const { data, error, loading, reload } = useAsync(async () => {
    const [reminders, folders] = await Promise.all([listOpenReminders(), listReminderFolders()]);
    return { reminders, folders };
  }, []);

  useEffect(() => {
    const onUpdate = () => void reload();
    window.addEventListener("panga-data-updated", onUpdate);
    return () => window.removeEventListener("panga-data-updated", onUpdate);
  }, [reload]);

  const [permState, setPermState] = useState<NotificationPermissionState>(() =>
    getNotificationPermissionState()
  );
  const [requestingPerm, setRequestingPerm] = useState(false);

  const [activeView, setActiveView] = useState<ActiveTabView>("today");
  const [folderFilter, setFolderFilter] = useState<string>(""); // "" = all folders
  const [importCardOpen, setImportCardOpen] = useState<boolean>(() => !hasCompletedIcsImport());

  // Add / edit form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [dateStr, setDateStr] = useState(() => localDateInputValue(Date.now()));
  const [addTime, setAddTime] = useState(false);
  const [timeStr, setTimeStr] = useState("09:00");
  const [toneId, setToneId] = useState("default");
  const [repeatPreset, setRepeatPreset] = useState<RepeatPreset>("none");
  const [customInterval, setCustomInterval] = useState("1");
  const [customUnit, setCustomUnit] = useState<RecurrenceUnit>("day");
  const [customWeekdays, setCustomWeekdays] = useState<number[]>(() => [new Date().getDay()]);
  const [endMode, setEndMode] = useState<RepeatEndMode>("never");
  const [untilDate, setUntilDate] = useState(() => localDateInputValue(Date.now()));
  const [countStr, setCountStr] = useState("5");
  const [folderId, setFolderId] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const [selFolderId, setSelFolderId] = useState<string | null>(null);

  const folders: ReminderFolder[] = data?.folders ?? [];
  const allOpen: Reminder[] = data?.reminders ?? [];

  const workspaceMap = useMemo(() => {
    const workspaces = listWorkspaces();
    return workspaces.length > 1 ? new Map(workspaces.map((w) => [w.id, w.name])) : null;
  }, [allOpen]);

  const handledInitialReminderIdRef = useRef<string | null>(null);

  // Sync URL query parameters (search / quick links)
  useEffect(() => {
    if (initialReminderId && handledInitialReminderIdRef.current !== initialReminderId) {
      const target = allOpen.find((r) => r.id === initialReminderId);
      if (target) {
        handledInitialReminderIdRef.current = initialReminderId;
        setActiveView(viewOf(target));
        beginEdit(target);
        return;
      }
    }
    if (initialFolderId && folders.some((f) => f.id === initialFolderId)) {
      setFolderFilter(initialFolderId);
      setSelFolderId(initialFolderId);
    }
  }, [initialFolderId, initialReminderId, folders, allOpen]);

  useEffect(() => {
    void startReminderScheduler();
    setPermState(getNotificationPermissionState());
  }, []);

  const scopedReminders = useMemo(() => {
    if (!folderFilter) return allOpen;
    if (folderFilter === UNFILED_FILTER) return allOpen.filter((r) => !r.folderId);
    return allOpen.filter((r) => r.folderId === folderFilter);
  }, [allOpen, folderFilter]);

  const viewBuckets = useMemo(() => {
    const overdueRaw: Reminder[] = [];
    const todayRaw: Reminder[] = [];
    const upcomingRaw: Reminder[] = [];

    for (const r of scopedReminders) {
      const v = viewOf(r);
      if (v === "overdue") overdueRaw.push(r);
      else if (v === "today") todayRaw.push(r);
      else upcomingRaw.push(r);
    }

    return {
      overdue: sortOverdueReminders(overdueRaw),
      today: sortTodayReminders(todayRaw),
      upcoming: sortUpcomingReminders(upcomingRaw),
    };
  }, [scopedReminders]);

  const upcomingGroups = useMemo(() => {
    const groups: Array<{ dayKey: string; heading: string; items: Reminder[] }> = [];
    for (const r of viewBuckets.upcoming) {
      const key = localDateInputValue(r.triggerAt);
      const last = groups[groups.length - 1];
      if (last && last.dayKey === key) {
        last.items.push(r);
      } else {
        groups.push({
          dayKey: key,
          heading: formatDayHeading(r.triggerAt),
          items: [r],
        });
      }
    }
    return groups;
  }, [viewBuckets.upcoming]);

  function resetForm() {
    const today = localDateInputValue(Date.now());
    setEditingId(null);
    setExpanded(false);
    setMessage("");
    setDateStr(today);
    setAddTime(false);
    setTimeStr("09:00");
    setToneId("default");
    setRepeatPreset("none");
    setCustomInterval("1");
    setCustomUnit("day");
    setCustomWeekdays([new Date().getDay()]);
    setEndMode("never");
    setUntilDate(today);
    setCountStr("5");
    setFolderId(folderFilter && folderFilter !== UNFILED_FILTER ? folderFilter : null);
    setLocation("");
    setNotes("");
    setFormError(null);
  }

  function beginEdit(r: Reminder) {
    const timed = isTimedReminder(r);
    const recFields = presetFromRecurrence(r.recurrence);
    setEditingId(r.id);
    setExpanded(true);
    setMessage(r.message);
    setDateStr(localDateInputValue(r.triggerAt));
    setAddTime(timed);
    setTimeStr(timed ? localTimeInputValue(r.triggerAt) : "09:00");
    setToneId(r.toneId ?? "default");
    setRepeatPreset(recFields.preset);
    setCustomInterval(recFields.intervalStr);
    setCustomUnit(recFields.unit);
    setCustomWeekdays(recFields.weekdays);
    setEndMode(recFields.endMode);
    setUntilDate(recFields.untilDate);
    setCountStr(recFields.countStr);
    setFolderId(r.folderId ?? null);
    setLocation(r.location ?? "");
    setNotes(r.notes ?? "");
    setFormError(null);
  }

  async function ensurePermission() {
    if (requestingPerm) return;
    setRequestingPerm(true);
    await requestNotificationPermission();
    setPermState(getNotificationPermissionState());
    setRequestingPerm(false);
  }

  function buildRecurrenceFromForm(triggerAt: number, existingAnchorAt?: number, dateChanged?: boolean): { recurrence?: ReminderRecurrence; error?: string } {
    if (repeatPreset === "none") return {};

    let interval = 1;
    let unit: RecurrenceUnit = "day";
    let weekdays: number[] | undefined;

    switch (repeatPreset) {
      case "daily":
        interval = 1;
        unit = "day";
        break;
      case "every2days":
        interval = 2;
        unit = "day";
        break;
      case "every3days":
        interval = 3;
        unit = "day";
        break;
      case "weekly":
        interval = 1;
        unit = "week";
        weekdays = [dateWeekday(dateStr)];
        break;
      case "monthly":
        interval = 1;
        unit = "month";
        break;
      case "yearly":
        interval = 1;
        unit = "year";
        break;
      case "custom": {
        const parsed = Number(customInterval);
        if (!Number.isInteger(parsed) || parsed < 1) {
          return { error: "Enter a number of 1 or more." };
        }
        interval = parsed;
        unit = customUnit;
        if (unit === "week") {
          if (customWeekdays.length === 0) {
            return { error: "Choose at least one weekday." };
          }
          weekdays = customWeekdays.slice();
        }
        break;
      }
    }

    let end: ReminderRecurrenceEnd = { type: "never" };
    if (endMode === "until") {
      end = { type: "until", untilAt: combineLocalDateTime(untilDate, null) };
    } else if (endMode === "count") {
      const parsedCount = Number(countStr);
      if (!Number.isInteger(parsedCount) || parsedCount < 1) {
        return { error: "Enter a number of 1 or more." };
      }
      end = { type: "count", remaining: parsedCount };
    }

    const anchorAt =
      existingAnchorAt !== undefined && !dateChanged ? existingAnchorAt : triggerAt;

    return {
      recurrence: {
        interval,
        unit,
        ...(weekdays ? { weekdays } : {}),
        end,
        anchorAt,
      },
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;
    setFormError(null);

    const triggerAt = combineLocalDateTime(dateStr, addTime ? timeStr : null);
    const existing = editingId ? allOpen.find((r) => r.id === editingId) : undefined;
    const dateChanged = existing
      ? localDateInputValue(existing.triggerAt) !== dateStr
      : true;

    const { recurrence, error: recError } = buildRecurrenceFromForm(
      triggerAt,
      existing?.recurrence?.anchorAt,
      dateChanged
    );
    if (recError) {
      setFormError(recError);
      return;
    }

    const trimmedLocation = location.trim();
    const trimmedNotes = notes.trim().slice(0, 2000);

    if (editingId) {
      await updateReminder(editingId, {
        message: trimmed,
        triggerAt,
        timed: addTime,
        allDay: !addTime,
        toneId: addTime ? toneId : undefined,
        folderId: folderId ?? null,
        location: trimmedLocation || undefined,
        notes: trimmedNotes || undefined,
        recurrence,
        status: "pending",
      });
      resetForm();
      await reload();
      return;
    }

    await createReminder({
      message: trimmed,
      triggerAt,
      timed: addTime,
      allDay: !addTime,
      toneId: addTime ? toneId : undefined,
      folderId: folderId ?? null,
      location: trimmedLocation || undefined,
      notes: trimmedNotes || undefined,
      source: "manual",
      recurrence,
      linkedEntityType: null,
      linkedEntityId: null,
    });

    resetForm();
    await reload();
  }

  async function handleDelete(r: Reminder) {
    if (r.recurrence) {
      const ok = await confirmAction({
        title: "Delete repeating reminder?",
        message: "This reminder repeats. Delete it and all future repeats?",
        confirmLabel: "Delete all",
        cancelLabel: "Cancel",
        danger: true,
      });
      if (!ok) return;
    } else {
      const ok = await confirmDelete({ kind: "reminder", name: r.message });
      if (!ok) return;
    }
    if (editingId === r.id) resetForm();
    await deleteReminder(r.id);
    await reload();
  }

  function handleTick(r: Reminder) {
    if (editingId === r.id) resetForm();
    void tickReminderWithUndo(r, reload);
  }

  function toggleWeekday(dow: number) {
    setCustomWeekdays((prev) =>
      prev.includes(dow) ? prev.filter((d) => d !== dow) : [...prev, dow]
    );
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
    const count = allOpen.filter((r) => r.folderId === id).length;
    if (
      count > 0 &&
      !(await confirmDelete({
        kind: "reminder folder",
        name: `${folder?.title} (contains ${count} reminders — contents will be reparented)`,
      }))
    ) {
      return;
    }
    if (!count && !(await confirmDelete({ kind: "reminder folder", name: folder?.title }))) return;
    await deleteReminderFolder(id);
    if (selFolderId === id) setSelFolderId(null);
    if (folderFilter === id) setFolderFilter("");
    await reload();
  }

  if (error) return <ErrorNote error={error} onRetry={reload} />;
  if (loading) return <Loading label="Loading reminders..." />;

  const counts = {
    today: viewBuckets.today.length,
    overdue: viewBuckets.overdue.length,
    upcoming: viewBuckets.upcoming.length,
    all: scopedReminders.length,
  };

  const currentSidebarFolder = folders.find((f) => f.id === selFolderId) ?? null;

  function renderReminderRow(r: Reminder, isOverdue: boolean) {
    const wsName =
      workspaceMap && r.workspaceId ? workspaceMap.get(r.workspaceId) : undefined;
    return (
      <ReminderRow
        key={r.id}
        reminder={r}
        isOverdue={isOverdue}
        workspaceName={wsName}
        onTick={handleTick}
        onEdit={beginEdit}
        onDelete={(rem) => void handleDelete(rem)}
      />
    );
  }

  return (
    <div className="split-pane">
      <aside className="split-sidebar">
        <div
          style={{
            padding: "0 0 12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 16 }}>Reminder folders</h2>
          <div style={{ display: "flex", gap: 6 }}>
            {folderFilter && (
              <button
                type="button"
                className="btn-secondary btn-small clickable"
                onClick={() => {
                  setFolderFilter("");
                  setSelFolderId(null);
                }}
              >
                All folders
              </button>
            )}
            <button
              type="button"
              className="btn-secondary btn-small clickable"
              onClick={() => document.getElementById("new-reminder-folder-input")?.focus()}
              data-tip="New reminder folder"
              data-tip-align="right"
            >
              New
            </button>
          </div>
        </div>
        <FolderTree
          foldersAsGrid
          rootInputId="new-reminder-folder-input"
          folders={folders}
          items={allOpen}
          folderId={(f) => f.id}
          folderParentId={(f) => f.parentFolderId}
          folderTitle={(f) => f.title}
          itemId={(r) => r.id}
          itemFolderId={(r) => r.folderId}
          itemTitle={(r) => r.message}
          selectedId={selFolderId}
          onSelectFolder={(id) => {
            setSelFolderId(id);
            setFolderFilter(id ?? "");
          }}
          onSelectItem={(id) => {
            const found = allOpen.find((r) => r.id === id);
            if (found) {
              setActiveView(viewOf(found));
              beginEdit(found);
            }
          }}
          onCreateFolder={handleCreateFolder}
          onRenameFolder={handleRenameFolder}
          onDeleteFolder={handleDeleteFolder}
          newFolderPlaceholder={
            currentSidebarFolder ? `New folder under "${currentSidebarFolder.title}"…` : "New folder…"
          }
          renderItemTitle={(r) => (
            <span style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>{r.message}</span>
          )}
          renderFolderMeta={(f) => {
            const n = allOpen.filter((r) => r.folderId === f.id).length;
            return n > 0 ? <span className="item-meta">{n}</span> : null;
          }}
        />
      </aside>

      <main className="split-main">
        {permState !== "granted" && (
          <div className="rem-notif-strip" role="status">
            {permState === "default" && (
              <>
                <span>
                  Notifications are off. Turn on notifications so timed reminders can alert you while Panga is open.
                </span>
                <button
                  type="button"
                  className="btn-secondary btn-small clickable"
                  disabled={requestingPerm}
                  onClick={() => void ensurePermission()}
                >
                  {requestingPerm ? "Requesting…" : "Enable notifications"}
                </button>
              </>
            )}
            {permState === "denied" && (
              <span>
                Notifications are blocked in your browser. Allow notifications for this site in your browser settings to receive system alerts.
              </span>
            )}
            {permState === "unsupported" && (
              <span>
                System notifications are not supported in this browser. Timed reminders still alert inside Panga while open.
              </span>
            )}
          </div>
        )}

        <div className="rem-toolbar">
          <div className="rem-views" role="tablist" aria-label="Reminder views">
            <button
              type="button"
              role="tab"
              aria-selected={activeView === "today"}
              className={`rem-view-btn clickable${activeView === "today" ? " rem-view-btn-active" : ""}`}
              onClick={() => setActiveView("today")}
            >
              Today ({counts.today})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === "overdue"}
              className={`rem-view-btn clickable${activeView === "overdue" ? " rem-view-btn-active" : ""}${counts.overdue > 0 ? " rem-view-btn-overdue" : ""}`}
              onClick={() => setActiveView("overdue")}
            >
              Overdue ({counts.overdue})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === "upcoming"}
              className={`rem-view-btn clickable${activeView === "upcoming" ? " rem-view-btn-active" : ""}`}
              onClick={() => setActiveView("upcoming")}
            >
              Upcoming ({counts.upcoming})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === "all"}
              className={`rem-view-btn clickable${activeView === "all" ? " rem-view-btn-active" : ""}`}
              onClick={() => setActiveView("all")}
            >
              All ({counts.all})
            </button>
          </div>

          <div className="rem-toolbar-right">
            {folders.length > 0 && (
              <label className="rem-folder-filter">
                <span className="sr-only">Folder</span>
                <select
                  aria-label="Filter by folder"
                  value={folderFilter}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFolderFilter(val);
                    setSelFolderId(val && val !== UNFILED_FILTER ? val : null);
                  }}
                >
                  <option value="">All folders</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.title}
                    </option>
                  ))}
                  <option value={UNFILED_FILTER}>Unfiled</option>
                </select>
              </label>
            )}
            {!importCardOpen && (
              <button
                type="button"
                className="btn-secondary btn-small clickable"
                onClick={() => setImportCardOpen(true)}
              >
                Import events
              </button>
            )}
          </div>
        </div>

        <section className="dashboard-section rem-form-section">
          <form onSubmit={(e) => void handleSubmit(e)}>
            <div className="rem-quick-row">
              <input
                type="text"
                className="rem-message-input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a reminder"
                aria-label="Add a reminder"
                required
              />
              <ProofreadTrigger value={message} onApply={setMessage} />
              <button
                type="button"
                className="btn-secondary btn-small clickable"
                aria-expanded={expanded}
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? "Fewer options" : "More options"}
              </button>
              <button type="submit" className="btn-primary clickable">
                {editingId ? "Save" : "Add"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn-secondary btn-small clickable"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>

            {expanded && (
              <div className="rem-more-options">
                <div className="rem-options-grid">
                  <label className="rem-field">
                    <span>Date</span>
                    <input
                      type="date"
                      value={dateStr}
                      onChange={(e) => {
                        const next = e.target.value;
                        setDateStr(next);
                        if (next && repeatPreset === "custom" && customUnit === "week" && customWeekdays.length === 0) {
                          setCustomWeekdays([dateWeekday(next)]);
                        }
                      }}
                      required
                    />
                  </label>

                  <div className="rem-field rem-time-group">
                    <label className="rem-checkbox-inline">
                      <input
                        type="checkbox"
                        checked={addTime}
                        onChange={(e) => setAddTime(e.target.checked)}
                      />
                      Add a time
                    </label>
                    {addTime && (
                      <div className="rem-time-controls">
                        <input
                          type="time"
                          aria-label="Time"
                          value={timeStr}
                          onChange={(e) => setTimeStr(e.target.value)}
                          required
                        />
                        <select
                          aria-label="Notification tone"
                          value={toneId}
                          onChange={(e) => setToneId(e.target.value)}
                        >
                          {TONE_PRESETS.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <label className="rem-field">
                    <span>Repeat</span>
                    <select
                      value={repeatPreset}
                      onChange={(e) => {
                        const next = e.target.value as RepeatPreset;
                        setRepeatPreset(next);
                        if (next === "custom") {
                          setCustomWeekdays([dateWeekday(dateStr)]);
                        }
                        setFormError(null);
                      }}
                    >
                      <option value="none">Does not repeat</option>
                      <option value="daily">Every day</option>
                      <option value="every2days">Every 2 days</option>
                      <option value="every3days">Every 3 days</option>
                      <option value="weekly">Every week</option>
                      <option value="monthly">Every month</option>
                      <option value="yearly">Every year</option>
                      <option value="custom">Custom…</option>
                    </select>
                  </label>
                </div>

                {repeatPreset === "custom" && (
                  <div className="rem-custom-repeat">
                    <div className="rem-custom-row">
                      <span>Every</span>
                      <input
                        type="number"
                        min={1}
                        aria-label="Repeat interval"
                        value={customInterval}
                        onChange={(e) => setCustomInterval(e.target.value)}
                        style={{ width: 76 }}
                      />
                      <select
                        aria-label="Repeat unit"
                        value={customUnit}
                        onChange={(e) => {
                          const next = e.target.value as RecurrenceUnit;
                          setCustomUnit(next);
                          if (next === "week" && customWeekdays.length === 0) {
                            setCustomWeekdays([dateWeekday(dateStr)]);
                          }
                        }}
                      >
                        <option value="day">days</option>
                        <option value="week">weeks</option>
                        <option value="month">months</option>
                        <option value="year">years</option>
                      </select>
                    </div>

                    {customUnit === "week" && (
                      <div className="rem-weekday-chips" role="group" aria-label="Repeat on weekdays">
                        {WEEKDAY_CHIPS.map((w) => {
                          const active = customWeekdays.includes(w.dow);
                          return (
                            <button
                              key={w.dow}
                              type="button"
                              aria-pressed={active}
                              className={`chip clickable${active ? " chip-active" : ""}`}
                              onClick={() => toggleWeekday(w.dow)}
                            >
                              {w.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {repeatPreset !== "none" && (
                  <div className="rem-end-row">
                    <label className="rem-field">
                      <span>Ends</span>
                      <select
                        value={endMode}
                        onChange={(e) => setEndMode(e.target.value as RepeatEndMode)}
                      >
                        <option value="never">Never</option>
                        <option value="until">On date</option>
                        <option value="count">After N times</option>
                      </select>
                    </label>
                    {endMode === "until" && (
                      <label className="rem-field">
                        <span>End date</span>
                        <input
                          type="date"
                          value={untilDate}
                          onChange={(e) => setUntilDate(e.target.value)}
                          required
                        />
                      </label>
                    )}
                    {endMode === "count" && (
                      <label className="rem-field">
                        <span>Occurrences</span>
                        <input
                          type="number"
                          min={1}
                          value={countStr}
                          onChange={(e) => setCountStr(e.target.value)}
                          style={{ width: 90 }}
                          required
                        />
                      </label>
                    )}
                  </div>
                )}

                <div className="rem-options-grid">
                  <label className="rem-field">
                    <span>Folder</span>
                    <select
                      value={folderId ?? ""}
                      onChange={(e) => setFolderId(e.target.value || null)}
                    >
                      <option value="">None (unfiled)</option>
                      {folders.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="rem-field">
                    <span>Location</span>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Optional location"
                    />
                  </label>
                </div>

                <div className="rem-field">
                  <div className="rem-notes-head">
                    <label htmlFor="reminder-notes-input">Notes</label>
                    <ProofreadTrigger value={notes} onApply={setNotes} />
                  </div>
                  <textarea
                    id="reminder-notes-input"
                    rows={3}
                    maxLength={2000}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional notes"
                  />
                </div>
              </div>
            )}

            {formError && (
              <p className="pg-error" role="alert" style={{ marginTop: 8 }}>
                {formError}
              </p>
            )}
          </form>
        </section>

        {activeView === "today" && (
          <section className="dashboard-section">
            {viewBuckets.today.length === 0 ? (
              <p className="empty-state">Nothing on for today.</p>
            ) : (
              <ul className="item-list">
                {viewBuckets.today.map((r) => renderReminderRow(r, false))}
              </ul>
            )}
          </section>
        )}

        {activeView === "overdue" && (
          <section className="dashboard-section">
            {viewBuckets.overdue.length === 0 ? (
              <p className="empty-state">Nothing left over from earlier days.</p>
            ) : (
              <ul className="item-list">
                {viewBuckets.overdue.map((r) => renderReminderRow(r, true))}
              </ul>
            )}
          </section>
        )}

        {activeView === "upcoming" && (
          <section className="dashboard-section">
            {upcomingGroups.length === 0 ? (
              <p className="empty-state">Nothing coming up.</p>
            ) : (
              <div className="rem-upcoming-groups">
                {upcomingGroups.map((group) => (
                  <div key={group.dayKey} className="rem-day-group">
                    <h3 className="rem-day-heading">{group.heading}</h3>
                    <ul className="item-list">
                      {group.items.map((r) => renderReminderRow(r, false))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeView === "all" && (
          <div className="rem-all-groups">
            {scopedReminders.length === 0 ? (
              <p className="empty-state">Nothing on for today.</p>
            ) : (
              <>
                {viewBuckets.overdue.length > 0 && (
                  <section className="dashboard-section">
                    <h3 className="section-heading">Overdue</h3>
                    <ul className="item-list">
                      {viewBuckets.overdue.map((r) => renderReminderRow(r, true))}
                    </ul>
                  </section>
                )}
                {viewBuckets.today.length > 0 && (
                  <section className="dashboard-section">
                    <h3 className="section-heading">Today</h3>
                    <ul className="item-list">
                      {viewBuckets.today.map((r) => renderReminderRow(r, false))}
                    </ul>
                  </section>
                )}
                {upcomingGroups.length > 0 && (
                  <section className="dashboard-section">
                    <h3 className="section-heading">Upcoming</h3>
                    <div className="rem-upcoming-groups">
                      {upcomingGroups.map((group) => (
                        <div key={group.dayKey} className="rem-day-group">
                          <h4 className="rem-day-heading">{group.heading}</h4>
                          <ul className="item-list">
                            {group.items.map((r) => renderReminderRow(r, false))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        )}

        {importCardOpen && (
          <ImportEventsCard
            onImported={reload}
            onViewTarget={(v) => setActiveView(v)}
            onClose={() => setImportCardOpen(false)}
          />
        )}
      </main>
    </div>
  );
}
