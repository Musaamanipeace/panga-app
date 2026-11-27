import { useEffect, useMemo, useRef, useState } from "react";
import { ProofreadTrigger } from "../Proofread";
import {
  completeReminder,
  createReminder,
  deleteReminder,
  filterRemindersForView,
  isReminderTimed,
  listReminders,
  startOfLocalDay,
  startReminderScheduler,
  TONE_PRESETS,
  updateReminder,
  viewOf,
  type Reminder,
  type ReminderDayBucket,
  type ReminderRecurrence,
  type ReminderView,
} from "../../data/reminders";
import type { ReminderRepeatFreq } from "../../data/db";
import { describeRecurrence } from "../../data/recurrence";
import {
  createReminderFolder,
  deleteReminderFolder,
  listReminderFolders,
  updateReminderFolder,
  type ReminderFolder,
} from "../../data/reminderFolders";
import { listWorkspaces } from "../../data/workspaces";
import {
  confirmAction,
  confirmDelete,
  ErrorNote,
  Loading,
  showToast,
  useAsync,
} from "../../components/ui";
import { importCalendarFiles } from "../../data/icsImport";
import FolderTree from "./FolderTree";

const DAY_MS = 86_400_000;

const VIEW_TABS: { id: ReminderView; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "overdue", label: "Overdue" },
  { id: "upcoming", label: "Upcoming" },
  { id: "all", label: "All" },
];

const WEEKDAY_CHIPS: { day: number; label: string }[] = [
  { day: 1, label: "Mon" },
  { day: 2, label: "Tue" },
  { day: 3, label: "Wed" },
  { day: 4, label: "Thu" },
  { day: 5, label: "Fri" },
  { day: 6, label: "Sat" },
  { day: 0, label: "Sun" },
];

type RepeatPreset =
  | "none"
  | "daily_1"
  | "daily_2"
  | "daily_3"
  | "weekly_1"
  | "monthly_1"
  | "yearly_1"
  | "custom";

type EndMode = "never" | "until" | "count";

function toLocalDateInput(epochMs: number): string {
  const d = new Date(epochMs);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toLocalTimeInput(epochMs: number): string {
  const d = new Date(epochMs);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** datetime-local helper preserved for callers/tests that import it. */
export function toLocalInput(ts: number): string {
  return `${toLocalDateInput(ts)}T${toLocalTimeInput(ts)}`;
}

function parseLocalDate(dateStr: string): { year: number; month: number; day: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const probe = new Date(year, month - 1, day);
  if (
    probe.getFullYear() !== year ||
    probe.getMonth() !== month - 1 ||
    probe.getDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

function parseLocalDateTime(dateStr: string, timeStr: string | null): number | null {
  const parsedDate = parseLocalDate(dateStr);
  if (!parsedDate) return null;
  if (!timeStr) {
    return new Date(parsedDate.year, parsedDate.month - 1, parsedDate.day, 0, 0, 0, 0).getTime();
  }
  const tm = /^(\d{2}):(\d{2})$/.exec(timeStr.trim());
  if (!tm) return null;
  const hour = Number(tm[1]);
  const minute = Number(tm[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return new Date(parsedDate.year, parsedDate.month - 1, parsedDate.day, hour, minute, 0, 0).getTime();
}

function formatDayHeading(epochMs: number): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(epochMs);
}

function formatTimeOnly(epochMs: number): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(epochMs);
}

function formatDueOverdue(triggerAt: number, nowMs: number): string {
  const diffDays = Math.max(
    1,
    Math.round((startOfLocalDay(nowMs) - startOfLocalDay(triggerAt)) / DAY_MS)
  );
  return `Due ${formatDayHeading(triggerAt)}, ${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
}

function formatNextDate(epochMs: number): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(epochMs);
}

function presetFromRecurrence(rec: ReminderRecurrence | null | undefined): {
  preset: RepeatPreset;
  freq: ReminderRepeatFreq;
  interval: string;
  weekdays: number[];
  endMode: EndMode;
  endDate: string;
  endCount: string;
} {
  if (!rec) {
    return {
      preset: "none",
      freq: "daily",
      interval: "2",
      weekdays: [],
      endMode: "never",
      endDate: "",
      endCount: "5",
    };
  }

  let preset: RepeatPreset = "custom";
  if (rec.freq === "daily" && rec.interval === 1) preset = "daily_1";
  else if (rec.freq === "daily" && rec.interval === 2) preset = "daily_2";
  else if (rec.freq === "daily" && rec.interval === 3) preset = "daily_3";
  else if (rec.freq === "weekly" && rec.interval === 1) {
    const anchorDay = new Date(rec.anchorAt).getDay();
    const wds = rec.byWeekday ?? [];
    if (wds.length === 0 || (wds.length === 1 && wds[0] === anchorDay)) {
      preset = "weekly_1";
    }
  } else if (rec.freq === "monthly" && rec.interval === 1) preset = "monthly_1";
  else if (rec.freq === "yearly" && rec.interval === 1) preset = "yearly_1";

  let endMode: EndMode = "never";
  let endDate = "";
  let endCount = "5";
  if (typeof rec.until === "number") {
    endMode = "until";
    endDate = toLocalDateInput(rec.until);
  } else if (typeof rec.count === "number") {
    endMode = "count";
    endCount = String(rec.count);
  }

  return {
    preset,
    freq: rec.freq,
    interval: String(rec.interval || 1),
    weekdays: rec.byWeekday?.length ? [...rec.byWeekday] : [new Date(rec.anchorAt).getDay()],
    endMode,
    endDate,
    endCount,
  };
}

function emptyStateText(view: ReminderView): string {
  switch (view) {
    case "today":
      return "Nothing on for today.";
    case "overdue":
      return "Nothing left over from earlier days.";
    case "upcoming":
      return "Nothing coming up.";
    case "all":
      return "Nothing scheduled.";
  }
}

export default function HomeRemindersTab({
  initialFolderId,
  initialReminderId,
}: {
  initialFolderId?: string | null;
  initialReminderId?: string | null;
}) {
  const { data, error, loading, reload } = useAsync(async () => {
    const [reminders, folders] = await Promise.all([listReminders(), listReminderFolders()]);
    return { reminders, folders };
  }, []);

  useEffect(() => {
    void startReminderScheduler();
    const onUpdate = () => void reload();
    window.addEventListener("panga-data-updated", onUpdate);
    return () => window.removeEventListener("panga-data-updated", onUpdate);
  }, [reload]);

  const [view, setView] = useState<ReminderView>("today");
  const [folderFilter, setFolderFilter] = useState<string>("__all__");
  const [selFolderId, setSelFolderId] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Add / Edit form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [message, setMessage] = useState("");
  const [dateStr, setDateStr] = useState(() => toLocalDateInput(Date.now()));
  const [timed, setTimed] = useState(false);
  const [timeStr, setTimeStr] = useState("09:00");
  const [toneId, setToneId] = useState("default");
  const [repeatPreset, setRepeatPreset] = useState<RepeatPreset>("none");
  const [customFreq, setCustomFreq] = useState<ReminderRepeatFreq>("daily");
  const [customInterval, setCustomInterval] = useState("2");
  const [customWeekdays, setCustomWeekdays] = useState<number[]>(() => [new Date().getDay()]);
  const [endMode, setEndMode] = useState<EndMode>("never");
  const [endDateStr, setEndDateStr] = useState("");
  const [endCountStr, setEndCountStr] = useState("5");
  const [formFolderId, setFormFolderId] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [importingIcs, setImportingIcs] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const icsInputRef = useRef<HTMLInputElement>(null);

  const folders: ReminderFolder[] = useMemo(() => data?.folders ?? [], [data]);
  const openReminders: Reminder[] = useMemo(() => data?.reminders ?? [], [data]);

  const workspaces = listWorkspaces();
  const workspaceNames = {
    count: workspaces.length,
    map: new Map(workspaces.map((w) => [w.id, w.name])),
  };

  // Deep link from header Search or Quick links
  useEffect(() => {
    if (initialReminderId) {
      const target = openReminders.find((r) => r.id === initialReminderId);
      if (target) {
        setView(viewOf(target));
        setFolderFilter("__all__");
        setSelFolderId(target.folderId);
        setHighlightedId(target.id);
        return;
      }
    }
    if (initialFolderId) {
      const targetFolder = folders.find((f) => f.id === initialFolderId);
      if (targetFolder) {
        setFolderFilter(targetFolder.id);
        setSelFolderId(targetFolder.id);
        setView("all");
      }
    }
  }, [initialFolderId, initialReminderId, folders, openReminders]);

  const resolvedFolderArg =
    folderFilter === "__all__"
      ? "__all__"
      : folderFilter === "__unfiled__"
        ? null
        : folderFilter;

  const counts = useMemo(() => {
    const t = Date.now();
    const today = filterRemindersForView(openReminders, "today", resolvedFolderArg, t);
    const overdue = filterRemindersForView(openReminders, "overdue", resolvedFolderArg, t);
    const upcoming = filterRemindersForView(openReminders, "upcoming", resolvedFolderArg, t);
    return {
      today: today.length,
      overdue: overdue.length,
      upcoming: upcoming.length,
      all: today.length + overdue.length + upcoming.length,
    };
  }, [openReminders, resolvedFolderArg]);

  const visibleItems = useMemo(
    () => filterRemindersForView(openReminders, view, resolvedFolderArg, Date.now()),
    [openReminders, view, resolvedFolderArg]
  );

  const upcomingGroups = useMemo(() => {
    if (view !== "upcoming" && view !== "all") return [];
    const t = Date.now();
    const list =
      view === "upcoming"
        ? visibleItems
        : visibleItems.filter((r) => viewOf(r, t) === "upcoming");
    const groups: { dayKey: number; heading: string; items: Reminder[] }[] = [];
    for (const r of list) {
      const dayKey = startOfLocalDay(r.triggerAt);
      const last = groups[groups.length - 1];
      if (!last || last.dayKey !== dayKey) {
        groups.push({ dayKey, heading: formatDayHeading(r.triggerAt), items: [r] });
      } else {
        last.items.push(r);
      }
    }
    return groups;
  }, [view, visibleItems]);

  const selectedFolderObj = useMemo(
    () => folders.find((f) => f.id === selFolderId) ?? null,
    [folders, selFolderId]
  );

  const nowMs = Date.now();

  function resetForm(collapse = true) {
    setEditingId(null);
    setMessage("");
    setDateStr(toLocalDateInput(Date.now()));
    setTimed(false);
    setTimeStr("09:00");
    setToneId("default");
    setRepeatPreset("none");
    setCustomFreq("daily");
    setCustomInterval("2");
    setCustomWeekdays([new Date().getDay()]);
    setEndMode("never");
    setEndDateStr("");
    setEndCountStr("5");
    setFormFolderId(
      folderFilter !== "__all__" && folderFilter !== "__unfiled__" ? folderFilter : null
    );
    setLocation("");
    setNotes("");
    setFormError(null);
    if (collapse) setShowMore(false);
  }

  function startEdit(r: Reminder) {
    const rTimed = isReminderTimed(r);
    const parsed = presetFromRecurrence(r.recurrence);
    setEditingId(r.id);
    setShowMore(true);
    setMessage(r.message);
    setDateStr(toLocalDateInput(r.triggerAt));
    setTimed(rTimed);
    setTimeStr(rTimed ? toLocalTimeInput(r.triggerAt) : "09:00");
    setToneId(r.toneId ?? "default");
    setRepeatPreset(parsed.preset);
    setCustomFreq(parsed.freq);
    setCustomInterval(parsed.interval);
    setCustomWeekdays(parsed.weekdays);
    setEndMode(parsed.endMode);
    setEndDateStr(parsed.endDate);
    setEndCountStr(parsed.endCount);
    setFormFolderId(r.folderId ?? null);
    setLocation(r.location ?? "");
    setNotes(r.notes ?? "");
    setFormError(null);
    inputRef.current?.focus();
  }

  function handlePresetChange(nextPreset: RepeatPreset) {
    setRepeatPreset(nextPreset);
    setFormError(null);
    if (nextPreset === "custom") {
      const parsedDate = parseLocalDate(dateStr);
      const fallbackDay = parsedDate
        ? new Date(parsedDate.year, parsedDate.month - 1, parsedDate.day).getDay()
        : new Date().getDay();
      if (customWeekdays.length === 0) {
        setCustomWeekdays([fallbackDay]);
      }
    }
    if (nextPreset === "none") {
      setEndMode("never");
    }
  }

  function handleCustomFreqChange(nextFreq: ReminderRepeatFreq) {
    setCustomFreq(nextFreq);
    setFormError(null);
    if (nextFreq === "weekly" && customWeekdays.length === 0) {
      const parsedDate = parseLocalDate(dateStr);
      const fallbackDay = parsedDate
        ? new Date(parsedDate.year, parsedDate.month - 1, parsedDate.day).getDay()
        : new Date().getDay();
      setCustomWeekdays([fallbackDay]);
    }
  }

  function toggleWeekday(day: number) {
    setFormError(null);
    setCustomWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function buildRecurrence(anchorAt: number, existing?: ReminderRecurrence | null): ReminderRecurrence | null | "error" {
    if (repeatPreset === "none") return null;

    let freq: ReminderRepeatFreq = "daily";
    let interval = 1;
    let byWeekday: number[] | undefined;

    switch (repeatPreset) {
      case "daily_1":
        freq = "daily";
        interval = 1;
        break;
      case "daily_2":
        freq = "daily";
        interval = 2;
        break;
      case "daily_3":
        freq = "daily";
        interval = 3;
        break;
      case "weekly_1":
        freq = "weekly";
        interval = 1;
        byWeekday = [new Date(anchorAt).getDay()];
        break;
      case "monthly_1":
        freq = "monthly";
        interval = 1;
        break;
      case "yearly_1":
        freq = "yearly";
        interval = 1;
        break;
      case "custom": {
        freq = customFreq;
        const parsedInt = Number(customInterval);
        if (!Number.isInteger(parsedInt) || parsedInt < 1) {
          setFormError("Enter a number of 1 or more.");
          return "error";
        }
        interval = parsedInt;
        if (freq === "weekly") {
          if (customWeekdays.length === 0) {
            setFormError("Choose at least one weekday.");
            return "error";
          }
          byWeekday = [...customWeekdays];
        }
        break;
      }
    }

    let until: number | undefined;
    let count: number | undefined;
    if (endMode === "until") {
      const parsedEnd = parseLocalDate(endDateStr);
      if (!parsedEnd) {
        setFormError("Choose an end date.");
        return "error";
      }
      until = new Date(parsedEnd.year, parsedEnd.month - 1, parsedEnd.day, 23, 59, 59, 999).getTime();
    } else if (endMode === "count") {
      const parsedCount = Number(endCountStr);
      if (!Number.isInteger(parsedCount) || parsedCount < 1) {
        setFormError("Enter a number of 1 or more.");
        return "error";
      }
      count = parsedCount;
    }

    return {
      freq,
      interval,
      anchorAt,
      ...(byWeekday ? { byWeekday } : {}),
      ...(freq === "monthly" ? { byMonthDay: new Date(anchorAt).getDate() } : {}),
      ...(until !== undefined ? { until } : {}),
      ...(count !== undefined ? { count } : {}),
      ...(existing?.exdates?.length ? { exdates: existing.exdates } : {}),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      setFormError("Enter a reminder.");
      return;
    }

    // Collapsed quick-add creates a plain reminder for today with no repeat.
    if (!showMore && !editingId) {
      const todayTrigger = startOfLocalDay(Date.now());
      const defaultFolder =
        folderFilter !== "__all__" && folderFilter !== "__unfiled__" ? folderFilter : null;
      await createReminder({
        message: trimmed,
        triggerAt: todayTrigger,
        timed: false,
        linkedEntityType: null,
        linkedEntityId: null,
        folderId: defaultFolder,
      });
      resetForm(false);
      await reload();
      return;
    }

    const parsedTrigger = parseLocalDateTime(dateStr, timed ? timeStr : null);
    if (parsedTrigger === null) {
      setFormError(timed ? "Choose a valid date and time." : "Choose a valid date.");
      return;
    }

    if (editingId) {
      const existing = openReminders.find((r) => r.id === editingId);
      if (!existing) {
        resetForm(true);
        return;
      }
      const dateOrTimeChanged =
        parsedTrigger !== existing.triggerAt || timed !== isReminderTimed(existing);
      const baseAnchor =
        dateOrTimeChanged || !existing.recurrence
          ? parsedTrigger
          : existing.recurrence.anchorAt || parsedTrigger;
      const rec = buildRecurrence(baseAnchor, existing.recurrence);
      if (rec === "error") return;

      const recurrenceChanged =
        JSON.stringify(rec ?? null) !== JSON.stringify(existing.recurrence ?? null);
      const finalRec =
        rec && (dateOrTimeChanged || recurrenceChanged)
          ? { ...rec, anchorAt: parsedTrigger }
          : rec;

      await updateReminder(editingId, {
        message: trimmed,
        triggerAt: parsedTrigger,
        timed,
        toneId: timed ? toneId : undefined,
        folderId: formFolderId ?? null,
        location,
        notes,
        recurrence: finalRec,
        ...(dateOrTimeChanged ? { lastAlertedAt: null } : {}),
      });
      resetForm(true);
      await reload();
      return;
    }

    const rec = buildRecurrence(parsedTrigger);
    if (rec === "error") return;

    await createReminder({
      message: trimmed,
      triggerAt: parsedTrigger,
      timed,
      toneId: timed ? toneId : undefined,
      folderId: formFolderId ?? null,
      location,
      notes,
      recurrence: rec,
      linkedEntityType: null,
      linkedEntityId: null,
    });
    resetForm(true);
    await reload();
  }

  async function handleTick(r: Reminder) {
    const { undo, nextAt } = await completeReminder(r.id);
    if (nextAt !== null) {
      showToast(
        `Done: ${r.message}. Next: ${formatNextDate(nextAt)}`,
        "success",
        6000,
        {
          label: "Undo",
          onClick: () => {
            void undo();
          },
        }
      );
    } else {
      showToast(`Done: ${r.message}`, "success", 6000, {
        label: "Undo",
        onClick: () => {
          void undo();
        },
      });
    }
    if (editingId === r.id) {
      resetForm(true);
    }
    await reload();
  }

  async function handleDelete(r: Reminder) {
    if (r.recurrence) {
      const ok = await confirmAction({
        title: "Delete repeating reminder?",
        message: "This reminder repeats. Delete it and all future repeats?",
        confirmLabel: "Yes, Delete",
        danger: true,
      });
      if (!ok) return;
    } else {
      if (!(await confirmDelete({ kind: "reminder", name: r.message }))) return;
    }
    await deleteReminder(r.id);
    if (editingId === r.id) resetForm(true);
    await reload();
  }

  async function handleIcsImport(files: FileList) {
    if (files.length === 0) return;
    setImportingIcs(true);
    try {
      const targetFolder =
        folderFilter !== "__all__" && folderFilter !== "__unfiled__" ? folderFilter : null;
      const result = await importCalendarFiles(files, { folderId: targetFolder });
      await reload();
      const parts: string[] = [];
      if (result.imported > 0) parts.push(`${result.imported} imported`);
      if (result.updated > 0) parts.push(`${result.updated} updated`);
      const skipped = result.skippedDone + result.skippedDuplicate + result.skippedPast;
      if (skipped > 0) parts.push(`${skipped} skipped`);
      if (result.errors.length > 0) {
        showToast(result.errors[0], "error");
      } else {
        showToast(
          parts.length > 0 ? `Calendar import: ${parts.join(", ")}.` : "No events found to import.",
          result.imported > 0 || result.updated > 0 ? "success" : "info"
        );
      }
    } finally {
      setImportingIcs(false);
    }
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
    const countInFolder = openReminders.filter((r) => r.folderId === id).length;
    if (
      countInFolder > 0 &&
      !(await confirmDelete({
        kind: "reminder folder",
        name: `${folder?.title} (contains ${countInFolder} reminders — contents will be reparented)`,
      }))
    ) {
      return;
    }
    if (countInFolder === 0 && !(await confirmDelete({ kind: "reminder folder", name: folder?.title }))) {
      return;
    }
    await deleteReminderFolder(id);
    if (selFolderId === id) setSelFolderId(null);
    if (folderFilter === id) setFolderFilter("__all__");
    await reload();
  }

  function renderReminderRow(r: Reminder, bucket: ReminderDayBucket) {
    const rTimed = isReminderTimed(r);
    const metaParts: string[] = [];
    if (rTimed) {
      metaParts.push(formatTimeOnly(r.triggerAt));
    }
    if (bucket === "overdue") {
      metaParts.push(formatDueOverdue(r.triggerAt, nowMs));
    }
    if (r.recurrence) {
      metaParts.push(describeRecurrence(r.recurrence));
    }
    if (r.location) {
      metaParts.push(r.location);
    }
    if (r.source === "ics") {
      metaParts.push("Imported");
    }
    if (workspaceNames.count > 1 && r.workspaceId) {
      const wsName = workspaceNames.map.get(r.workspaceId);
      if (wsName) metaParts.push(`Created in ${wsName}`);
    }

    return (
      <li
        key={r.id}
        className={`item rem-row${highlightedId === r.id ? " rem-row-highlight" : ""}`}
      >
        <label className="rem-tick-wrap">
          <input
            type="checkbox"
            className="rem-tick"
            checked={false}
            aria-label={`Tick off "${r.message}"`}
            onChange={() => void handleTick(r)}
          />
        </label>
        <div className="rem-row-body">
          <div className="rem-row-title">{r.message}</div>
          {metaParts.length > 0 && (
            <div className="rem-row-meta">
              {metaParts.map((part, idx) => (
                <span key={idx}>
                  {idx > 0 && <span aria-hidden="true"> · </span>}
                  <span>{part}</span>
                </span>
              ))}
            </div>
          )}
          {r.notes && <div className="rem-row-notes">{r.notes}</div>}
        </div>
        <div className="rem-row-actions">
          <button
            type="button"
            className="btn-secondary btn-small clickable"
            onClick={() => startEdit(r)}
          >
            Edit
          </button>
          <button
            type="button"
            className="btn-secondary btn-small clickable tl-danger"
            onClick={() => void handleDelete(r)}
          >
            Delete
          </button>
        </div>
      </li>
    );
  }

  if (error) return <ErrorNote error={error} onRetry={reload} />;
  if (loading) return <Loading label="Loading reminders..." />;

  const expanded = showMore || editingId !== null;
  const overdueItems = view === "all" ? visibleItems.filter((r) => viewOf(r, nowMs) === "overdue") : [];
  const todayItems = view === "all" ? visibleItems.filter((r) => viewOf(r, nowMs) === "today") : [];

  return (
    <div className="split-pane rem-split-pane">
      <aside className="split-sidebar rem-folders-sidebar">
        <div className="rem-folders-head">
          <h2>Reminder folders</h2>
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
        <FolderTree
          foldersAsGrid
          rootInputId="new-reminder-folder-input"
          folders={folders}
          items={openReminders}
          folderId={(f) => f.id}
          folderParentId={(f) => f.parentFolderId}
          folderTitle={(f) => f.title}
          itemId={(r) => r.id}
          itemFolderId={(r) => r.folderId}
          itemTitle={(r) => r.message}
          selectedId={selFolderId}
          onSelectFolder={(id) => {
            if (folderFilter === id) {
              setFolderFilter("__all__");
              setSelFolderId(null);
            } else {
              setFolderFilter(id);
              setSelFolderId(id);
            }
          }}
          onSelectItem={(id) => {
            const target = openReminders.find((r) => r.id === id);
            if (target) {
              setView(viewOf(target, nowMs));
              setHighlightedId(target.id);
            }
          }}
          onCreateFolder={handleCreateFolder}
          onRenameFolder={handleRenameFolder}
          onDeleteFolder={handleDeleteFolder}
          newFolderPlaceholder={
            selectedFolderObj ? `New folder under "${selectedFolderObj.title}"…` : "New folder…"
          }
          renderItemTitle={(r) => (
            <span style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>{r.message}</span>
          )}
          renderFolderMeta={(f) => {
            const n = openReminders.filter((r) => r.folderId === f.id).length;
            return n > 0 ? <span className="item-meta">{n}</span> : null;
          }}
        />
      </aside>

      <main className="split-main rem-main">
        {/* 2. View switcher & Folder filter */}
        <div className="rem-toolbar">
          <div className="rem-view-tabs" role="tablist" aria-label="Reminder views">
            {VIEW_TABS.map((t) => {
              const c = counts[t.id];
              const isOverdueNonEmpty = t.id === "overdue" && c > 0;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={view === t.id}
                  className={`rem-view-tab${view === t.id ? " rem-view-tab-active" : ""}${
                    isOverdueNonEmpty ? " rem-view-tab-overdue" : ""
                  }`}
                  onClick={() => setView(t.id)}
                >
                  {t.label} <span className="rem-view-count">({c})</span>
                </button>
              );
            })}
          </div>
          <div className="rem-filter-wrap">
            <label htmlFor="rem-folder-filter" className="rem-filter-label">
              Folder
            </label>
            <select
              id="rem-folder-filter"
              aria-label="Folder"
              value={folderFilter}
              onChange={(e) => {
                const val = e.target.value;
                setFolderFilter(val);
                setSelFolderId(val !== "__all__" && val !== "__unfiled__" ? val : null);
              }}
            >
              <option value="__all__">All folders</option>
              <option value="__unfiled__">Unfiled</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn-secondary btn-small clickable"
              disabled={importingIcs}
              onClick={() => icsInputRef.current?.click()}
            >
              {importingIcs ? "Importing…" : "Import .ics / .zip"}
            </button>
            <input
              ref={icsInputRef}
              type="file"
              accept=".ics,.zip,text/calendar,application/zip"
              multiple
              aria-label="Import calendar .ics or .zip file"
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files?.length) void handleIcsImport(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
        </div>

        {/* 3. Add / edit reminder form */}
        <section className="dashboard-section rem-form-section">
          {editingId && <h3 className="section-heading">Edit reminder</h3>}
          <form onSubmit={(e) => void handleSubmit(e)} noValidate>
            <div className="rem-form-top">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (formError) setFormError(null);
                }}
                placeholder="Add a reminder"
                aria-label="Add a reminder"
                maxLength={300}
                className="rem-message-input"
              />
              {message.trim() && <ProofreadTrigger value={message} onApply={setMessage} />}
              {!expanded && (
                <button type="submit" className="btn-primary clickable">
                  Add
                </button>
              )}
              {!editingId && (
                <button
                  type="button"
                  className="btn-secondary clickable"
                  aria-expanded={showMore}
                  onClick={() => {
                    setShowMore((v) => !v);
                    setFormError(null);
                  }}
                >
                  {showMore ? "Fewer options" : "More options"}
                </button>
              )}
            </div>

            {expanded && (
              <div className="rem-options">
                <div className="rem-option-row">
                  <div className="rem-field">
                    <label htmlFor="rem-date">Date</label>
                    <input
                      id="rem-date"
                      type="date"
                      value={dateStr}
                      onChange={(e) => {
                        setDateStr(e.target.value);
                        setFormError(null);
                      }}
                    />
                  </div>

                  <div className="rem-field rem-field-check">
                    <label className="rem-checkbox-label">
                      <input
                        type="checkbox"
                        checked={timed}
                        onChange={(e) => {
                          setTimed(e.target.checked);
                          setFormError(null);
                        }}
                      />
                      <span>Add a time</span>
                    </label>
                  </div>

                  {timed && (
                    <>
                      <div className="rem-field">
                        <label htmlFor="rem-time">Time</label>
                        <input
                          id="rem-time"
                          type="time"
                          value={timeStr}
                          onChange={(e) => {
                            setTimeStr(e.target.value);
                            setFormError(null);
                          }}
                        />
                      </div>
                      <div className="rem-field">
                        <label htmlFor="rem-tone">Tone</label>
                        <select
                          id="rem-tone"
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
                    </>
                  )}
                </div>

                <div className="rem-option-row">
                  <div className="rem-field">
                    <label htmlFor="rem-repeat">Repeat</label>
                    <select
                      id="rem-repeat"
                      value={repeatPreset}
                      onChange={(e) => handlePresetChange(e.target.value as RepeatPreset)}
                    >
                      <option value="none">Does not repeat</option>
                      <option value="daily_1">Every day</option>
                      <option value="daily_2">Every 2 days</option>
                      <option value="daily_3">Every 3 days</option>
                      <option value="weekly_1">Every week</option>
                      <option value="monthly_1">Every month</option>
                      <option value="yearly_1">Every year</option>
                      <option value="custom">Custom…</option>
                    </select>
                  </div>

                  {repeatPreset === "custom" && (
                    <div className="rem-custom-repeat">
                      <span>Every</span>
                      <input
                        type="number"
                        min={1}
                        step={1}
                        aria-label="Repeat interval"
                        value={customInterval}
                        onChange={(e) => {
                          setCustomInterval(e.target.value);
                          setFormError(null);
                        }}
                        className="rem-number-input"
                      />
                      <select
                        aria-label="Repeat unit"
                        value={customFreq}
                        onChange={(e) => handleCustomFreqChange(e.target.value as ReminderRepeatFreq)}
                      >
                        <option value="daily">days</option>
                        <option value="weekly">weeks</option>
                        <option value="monthly">months</option>
                        <option value="yearly">years</option>
                      </select>
                    </div>
                  )}

                  {repeatPreset !== "none" && (
                    <div className="rem-ends-row">
                      <div className="rem-field">
                        <label htmlFor="rem-ends">Ends</label>
                        <select
                          id="rem-ends"
                          value={endMode}
                          onChange={(e) => {
                            setEndMode(e.target.value as EndMode);
                            setFormError(null);
                          }}
                        >
                          <option value="never">Never</option>
                          <option value="until">On date</option>
                          <option value="count">After N times</option>
                        </select>
                      </div>
                      {endMode === "until" && (
                        <div className="rem-field">
                          <label htmlFor="rem-end-date">End date</label>
                          <input
                            id="rem-end-date"
                            type="date"
                            value={endDateStr}
                            onChange={(e) => {
                              setEndDateStr(e.target.value);
                              setFormError(null);
                            }}
                          />
                        </div>
                      )}
                      {endMode === "count" && (
                        <div className="rem-field">
                          <label htmlFor="rem-end-count">Times</label>
                          <input
                            id="rem-end-count"
                            type="number"
                            min={1}
                            step={1}
                            value={endCountStr}
                            onChange={(e) => {
                              setEndCountStr(e.target.value);
                              setFormError(null);
                            }}
                            className="rem-number-input"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {repeatPreset === "custom" && customFreq === "weekly" && (
                  <div className="rem-weekday-chips" role="group" aria-label="Repeat weekdays">
                    {WEEKDAY_CHIPS.map((w) => {
                      const active = customWeekdays.includes(w.day);
                      return (
                        <button
                          key={w.day}
                          type="button"
                          aria-pressed={active}
                          className={`chip${active ? " chip-active" : ""}`}
                          onClick={() => toggleWeekday(w.day)}
                        >
                          {w.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="rem-option-row">
                  <div className="rem-field">
                    <label htmlFor="rem-folder">Folder</label>
                    <select
                      id="rem-folder"
                      value={formFolderId ?? ""}
                      onChange={(e) => setFormFolderId(e.target.value || null)}
                    >
                      <option value="">None (unfiled)</option>
                      {folders.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="rem-field rem-field-grow">
                    <label htmlFor="rem-location">Location</label>
                    <input
                      id="rem-location"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="rem-field">
                  <div className="rem-notes-label-row">
                    <label htmlFor="rem-notes">Notes</label>
                    {notes.trim() && <ProofreadTrigger value={notes} onApply={setNotes} />}
                  </div>
                  <textarea
                    id="rem-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={2000}
                    rows={3}
                    placeholder="Optional notes (up to 2000 characters)"
                  />
                </div>

                <div className="rem-form-actions">
                  <button type="submit" className="btn-primary clickable">
                    {editingId ? "Save" : "Add"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      className="btn-secondary clickable"
                      onClick={() => resetForm(true)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )}

            {formError && (
              <p className="rem-form-error" role="alert">
                {formError}
              </p>
            )}
          </form>
        </section>

        {/* 4. List for selected view */}
        <section className="dashboard-section rem-list-section" aria-live="polite">
          {visibleItems.length === 0 ? (
            <p className="empty-state">{emptyStateText(view)}</p>
          ) : view === "today" ? (
            <ul className="item-list">
              {visibleItems.map((r) => renderReminderRow(r, "today"))}
            </ul>
          ) : view === "overdue" ? (
            <ul className="item-list">
              {visibleItems.map((r) => renderReminderRow(r, "overdue"))}
            </ul>
          ) : view === "upcoming" ? (
            <div className="rem-groups">
              {upcomingGroups.map((g) => (
                <div key={g.dayKey} className="rem-day-group">
                  <h3 className="section-heading">{g.heading}</h3>
                  <ul className="item-list">
                    {g.items.map((r) => renderReminderRow(r, "upcoming"))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="rem-groups">
              {overdueItems.length > 0 && (
                <div className="rem-day-group">
                  <h3 className="section-heading">Overdue</h3>
                  <ul className="item-list">
                    {overdueItems.map((r) => renderReminderRow(r, "overdue"))}
                  </ul>
                </div>
              )}
              {todayItems.length > 0 && (
                <div className="rem-day-group">
                  <h3 className="section-heading">Today</h3>
                  <ul className="item-list">
                    {todayItems.map((r) => renderReminderRow(r, "today"))}
                  </ul>
                </div>
              )}
              {upcomingGroups.length > 0 && (
                <div className="rem-day-group">
                  <h3 className="section-heading">Upcoming</h3>
                  {upcomingGroups.map((g) => (
                    <div key={g.dayKey} className="rem-sub-day-group">
                      <h4 className="rem-day-subheading">{g.heading}</h4>
                      <ul className="item-list">
                        {g.items.map((r) => renderReminderRow(r, "upcoming"))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
