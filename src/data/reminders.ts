// src/data/reminders.ts
import { accountDb, ensureAccountDbReady } from "./accountDb";
import {
  getOsNotificationsEnabled,
  getReminderSoundEnabled,
  recordImportedDone,
  removeImportedDone,
} from "./accountSettings";
import type { Reminder, ReminderRecurrence } from "./db";
import { notifyLocalDataMutated } from "./db";
import { nextAfterComplete } from "./recurrence";
import { newId, now } from "./utils";
import { getActiveWorkspaceId } from "./workspaceState";

export type { Reminder, ReminderRecurrence };
export type ReminderDayBucket = "today" | "overdue" | "upcoming";
export type ReminderView = ReminderDayBucket | "all";

export const TONE_PRESETS: { id: string; label: string }[] = [
  { id: "default", label: "Default" },
  { id: "chime", label: "Chime" },
  { id: "soft", label: "Soft" },
  { id: "urgent", label: "Urgent" },
];

function emitDataUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("panga-data-updated"));
  }
}

export function isReminderOpen(r: Pick<Reminder, "status">): boolean {
  // Decision D11: legacy "dismissed" rows are hidden everywhere; "pending" & "fired" stay open.
  return r.status !== "dismissed";
}

export function isReminderTimed(r: Pick<Reminder, "timed">): boolean {
  // Legacy rows have timed === undefined and MUST be treated as timed.
  return r.timed !== false;
}

export function startOfLocalDay(epochMs: number): number {
  const d = new Date(epochMs);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function viewOf(
  reminder: Pick<Reminder, "triggerAt">,
  nowMs = Date.now()
): ReminderDayBucket {
  const dueDay = startOfLocalDay(reminder.triggerAt);
  const today = startOfLocalDay(nowMs);
  if (dueDay < today) return "overdue";
  if (dueDay === today) return "today";
  return "upcoming";
}

export function formatReminderSummaryWhen(
  reminder: Pick<Reminder, "triggerAt" | "timed">
): string {
  if (!isReminderTimed(reminder)) {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(reminder.triggerAt);
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(reminder.triggerAt);
}

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return audioCtx;
}

/** Play a short beep tone for the given toneId using Web Audio (no external assets required). */
export function playTone(toneId: string | null): void {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const nowTime = ctx.currentTime;
    const duration = 0.5;
    switch (toneId) {
      case "chime":
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, nowTime);
        osc.frequency.exponentialRampToValueAtTime(1320, nowTime + 0.2);
        gain.gain.setValueAtTime(0.15, nowTime);
        gain.gain.exponentialRampToValueAtTime(0.001, nowTime + duration);
        break;
      case "soft":
        osc.type = "triangle";
        osc.frequency.setValueAtTime(520, nowTime);
        gain.gain.setValueAtTime(0.12, nowTime);
        gain.gain.exponentialRampToValueAtTime(0.001, nowTime + duration);
        break;
      case "urgent":
        osc.type = "square";
        osc.frequency.setValueAtTime(960, nowTime);
        osc.frequency.setValueAtTime(960, nowTime + 0.12);
        osc.frequency.setValueAtTime(760, nowTime + 0.24);
        gain.gain.setValueAtTime(0.25, nowTime);
        gain.gain.exponentialRampToValueAtTime(0.001, nowTime + duration);
        break;
      default:
        osc.type = "sine";
        osc.frequency.setValueAtTime(700, nowTime);
        gain.gain.setValueAtTime(0.15, nowTime);
        gain.gain.exponentialRampToValueAtTime(0.001, nowTime + duration);
    }
    osc.start(nowTime);
    osc.stop(nowTime + duration);
  } catch {
    // Audio not available (blocked/unsupported) — silently skip.
  }
}

/** Request notification permission. Returns true if granted. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof Notification === "undefined") return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const perm = await Notification.requestPermission();
  return perm === "granted";
}

function emitReminderAlert(reminder: Reminder): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent<Reminder>("panga-reminder-alert", { detail: reminder }));
  }
}

export function emitReminderAlertResolved(id: string): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<{ id: string }>("panga-reminder-alert-resolved", { detail: { id } })
    );
  }
}

/** Show a system notification for a fired reminder (when permitted & enabled). */
export function showReminderNotification(
  reminder: Reminder,
  options: { playSound?: boolean; bypassOsToggle?: boolean } = {}
): void {
  if (options.playSound !== false && getReminderSoundEnabled()) {
    playTone(reminder.toneId ?? null);
  }
  if (!options.bypassOsToggle && !getOsNotificationsEnabled()) return;
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  try {
    new Notification(`Panga: ${reminder.message}`, {
      body: [formatReminderSummaryWhen(reminder), reminder.location].filter(Boolean).join(" · "),
      tag: `reminder-${reminder.id}`,
    });
  } catch {
    /* ignore browser Notification constructor issues */
  }
}

let reminderSchedulerStarted = false;
let reminderTimer: number | undefined;
let schedulerTickInFlight = false;
let schedulerVisibilityHandler: (() => void) | null = null;
let schedulerOnlineHandler: (() => void) | null = null;

/** Run one alert check immediately (exposed cleanly for tests and scheduler triggers). */
export async function runReminderSchedulerTick(nowMs = Date.now()): Promise<Reminder[]> {
  if (schedulerTickInFlight) return [];
  schedulerTickInFlight = true;
  const alerted: Reminder[] = [];
  try {
    await ensureAccountDbReady();
    const due = await accountDb.reminders
      .filter(
        (r) =>
          isReminderOpen(r) &&
          isReminderTimed(r) &&
          r.triggerAt <= nowMs &&
          (r.lastAlertedAt ?? null) !== r.triggerAt
      )
      .toArray();

    for (const r of due) {
      const nextSnapshot: Reminder = {
        ...r,
        status: "fired",
        lastAlertedAt: r.triggerAt,
        updatedAt: now(),
        syncStatus: "pending",
      };
      await accountDb.reminders.update(r.id, {
        status: "fired",
        lastAlertedAt: r.triggerAt,
        updatedAt: nextSnapshot.updatedAt,
        syncStatus: "pending",
      });
      if (getReminderSoundEnabled()) {
        playTone(nextSnapshot.toneId ?? null);
      }
      showReminderNotification(nextSnapshot, { playSound: false });
      emitReminderAlert(nextSnapshot);
      alerted.push(nextSnapshot);
    }
    if (alerted.length > 0) {
      notifyLocalDataMutated();
      emitDataUpdated();
    }
  } catch {
    /* ignore scheduler errors */
  } finally {
    schedulerTickInFlight = false;
  }
  return alerted;
}

/** Poll due reminders while the app is open and fire in-app + optional OS alerts. Call once. */
export function startReminderScheduler(): void {
  if (reminderSchedulerStarted) return;
  reminderSchedulerStarted = true;
  const tick = () => {
    void runReminderSchedulerTick();
  };
  tick();
  reminderTimer = window.setInterval(tick, 30_000);
  if (typeof document !== "undefined") {
    schedulerVisibilityHandler = () => {
      if (!document.hidden) tick();
    };
    document.addEventListener("visibilitychange", schedulerVisibilityHandler);
  }
  if (typeof window !== "undefined") {
    schedulerOnlineHandler = () => tick();
    window.addEventListener("online", schedulerOnlineHandler);
  }
}

export function stopReminderScheduler(): void {
  if (reminderTimer !== undefined) {
    window.clearInterval(reminderTimer);
    reminderTimer = undefined;
  }
  if (schedulerVisibilityHandler && typeof document !== "undefined") {
    document.removeEventListener("visibilitychange", schedulerVisibilityHandler);
    schedulerVisibilityHandler = null;
  }
  if (schedulerOnlineHandler && typeof window !== "undefined") {
    window.removeEventListener("online", schedulerOnlineHandler);
    schedulerOnlineHandler = null;
  }
  schedulerTickInFlight = false;
  reminderSchedulerStarted = false;
}

export async function listReminders(): Promise<Reminder[]> {
  await ensureAccountDbReady();
  const rows = await accountDb.reminders.toArray();
  return rows.filter(isReminderOpen).sort((a, b) => a.triggerAt - b.triggerAt);
}

export async function listPendingReminders(): Promise<Reminder[]> {
  await ensureAccountDbReady();
  return accountDb.reminders
    .where("status")
    .equals("pending")
    .toArray()
    .then((rows) => rows.sort((a, b) => a.triggerAt - b.triggerAt));
}

export function sortRemindersForView(
  items: Reminder[],
  bucket: ReminderDayBucket
): Reminder[] {
  const copy = [...items];
  switch (bucket) {
    case "today":
      return copy.sort((a, b) => {
        const at = isReminderTimed(a) ? 0 : 1;
        const bt = isReminderTimed(b) ? 0 : 1;
        if (at !== bt) return at - bt;
        return a.triggerAt - b.triggerAt || a.createdAt - b.createdAt;
      });
    case "overdue":
      return copy.sort((a, b) => a.triggerAt - b.triggerAt || a.createdAt - b.createdAt);
    case "upcoming":
      return copy.sort((a, b) => {
        const da = startOfLocalDay(a.triggerAt);
        const dbDay = startOfLocalDay(b.triggerAt);
        if (da !== dbDay) return da - dbDay;
        const at = isReminderTimed(a) ? 0 : 1;
        const bt = isReminderTimed(b) ? 0 : 1;
        if (at !== bt) return at - bt;
        return a.triggerAt - b.triggerAt || a.createdAt - b.createdAt;
      });
  }
}

export function filterRemindersForView(
  openReminders: Reminder[],
  view: ReminderView,
  folderId?: string | null,
  nowMs = Date.now()
): Reminder[] {
  const byFolder =
    folderId === undefined || folderId === "__all__"
      ? openReminders
      : openReminders.filter((r) => r.folderId === folderId);

  if (view === "all") {
    const overdue = sortRemindersForView(
      byFolder.filter((r) => viewOf(r, nowMs) === "overdue"),
      "overdue"
    );
    const today = sortRemindersForView(
      byFolder.filter((r) => viewOf(r, nowMs) === "today"),
      "today"
    );
    const upcoming = sortRemindersForView(
      byFolder.filter((r) => viewOf(r, nowMs) === "upcoming"),
      "upcoming"
    );
    return [...overdue, ...today, ...upcoming];
  }

  return sortRemindersForView(
    byFolder.filter((r) => viewOf(r, nowMs) === view),
    view
  );
}

export async function listByView(
  view: ReminderView,
  folderId?: string | null,
  nowMs = Date.now()
): Promise<Reminder[]> {
  const open = await listReminders();
  return filterRemindersForView(open, view, folderId, nowMs);
}

export async function getReminder(id: string): Promise<Reminder | undefined> {
  await ensureAccountDbReady();
  return accountDb.reminders.get(id);
}

export async function putReminder(reminder: Reminder): Promise<void> {
  await ensureAccountDbReady();
  await accountDb.reminders.put(reminder);
  notifyLocalDataMutated();
  emitDataUpdated();
}

export async function createReminder(input: {
  message: string;
  triggerAt: number;
  timed?: boolean;
  toneId?: string;
  endAt?: number;
  location?: string;
  notes?: string;
  recurrence?: ReminderRecurrence | null;
  linkedEntityType: "task" | "note" | null;
  linkedEntityId: string | null;
  folderId?: string | null;
  workspaceId?: string;
  source?: "manual" | "ics";
}): Promise<Reminder> {
  await ensureAccountDbReady();
  const t = now();
  const timed = input.timed !== false;
  const triggerAt = timed ? input.triggerAt : startOfLocalDay(input.triggerAt);
  const recurrence = input.recurrence
    ? { ...input.recurrence, anchorAt: input.recurrence.anchorAt || triggerAt }
    : null;
  const location = input.location?.trim() ? input.location.trim() : undefined;
  const notes = input.notes?.trim() ? input.notes.trim().slice(0, 2000) : undefined;

  const reminder: Reminder = {
    id: newId(),
    folderId: input.folderId ?? null,
    workspaceId: input.workspaceId ?? getActiveWorkspaceId(),
    toneId: timed ? input.toneId : undefined,
    linkedEntityType: input.linkedEntityType,
    linkedEntityId: input.linkedEntityId,
    message: input.message,
    triggerAt,
    timed,
    status: "pending",
    ...(input.endAt !== undefined ? { endAt: input.endAt } : {}),
    ...(location !== undefined ? { location } : {}),
    ...(notes !== undefined ? { notes } : {}),
    ...(recurrence ? { recurrence, occurrencesDone: 0 } : {}),
    source: input.source ?? "manual",
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await accountDb.reminders.add(reminder);
  notifyLocalDataMutated();
  emitDataUpdated();
  return reminder;
}

export async function updateReminder(
  id: string,
  changes: Partial<
    Pick<
      Reminder,
      | "message"
      | "triggerAt"
      | "timed"
      | "toneId"
      | "endAt"
      | "location"
      | "notes"
      | "recurrence"
      | "occurrencesDone"
      | "lastAlertedAt"
      | "linkedEntityType"
      | "linkedEntityId"
      | "status"
      | "folderId"
    >
  >
): Promise<void> {
  await ensureAccountDbReady();
  const next: Record<string, unknown> = {
    ...changes,
    updatedAt: now(),
    syncStatus: "pending",
  };
  if (changes.notes !== undefined) {
    next.notes = changes.notes.trim() ? changes.notes.trim().slice(0, 2000) : undefined;
  }
  if (changes.location !== undefined) {
    next.location = changes.location.trim() ? changes.location.trim() : undefined;
  }
  if (changes.timed === false && typeof changes.triggerAt === "number") {
    next.triggerAt = startOfLocalDay(changes.triggerAt);
  }
  await accountDb.reminders.update(id, next);
  notifyLocalDataMutated();
  emitDataUpdated();
}

export async function completeReminder(
  id: string,
  nowMs = Date.now()
): Promise<{ undo: () => Promise<void>; nextAt: number | null }> {
  await ensureAccountDbReady();
  const result = await accountDb.transaction("rw", accountDb.reminders, async () => {
    const prev = await accountDb.reminders.get(id);
    if (!prev) {
      return { kind: "missing" as const, nextAt: null, prev: null };
    }

    if (prev.recurrence) {
      const nextAt = nextAfterComplete(prev.recurrence, prev.triggerAt, nowMs);
      if (nextAt !== null) {
        await accountDb.reminders.update(id, {
          triggerAt: nextAt,
          occurrencesDone: (prev.occurrencesDone ?? 0) + 1,
          lastAlertedAt: null,
          status: "pending",
          updatedAt: now(),
          syncStatus: "pending",
        });
        return { kind: "advanced" as const, nextAt, prev };
      }
    }

    await accountDb.reminders.delete(id);
    return { kind: "deleted" as const, nextAt: null, prev };
  });

  if (result.kind === "missing") {
    return { nextAt: null, undo: async () => {} };
  }

  const prev = result.prev;
  if (result.kind === "deleted" && prev.externalUid) {
    recordImportedDone(prev.externalUid, prev.externalInstance ?? null);
  }

  notifyLocalDataMutated();
  emitDataUpdated();
  emitReminderAlertResolved(id);

  return {
    nextAt: result.nextAt,
    undo: async () => {
      await ensureAccountDbReady();
      if (result.kind === "deleted" && prev.externalUid) {
        removeImportedDone(prev.externalUid, prev.externalInstance ?? null);
      }
      await accountDb.reminders.put(prev);
      notifyLocalDataMutated();
      emitDataUpdated();
    },
  };
}

export function tomorrowMorning9Epoch(nowMs = Date.now()): number {
  const d = new Date(nowMs);
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return d.getTime();
}

export async function snoozeReminder(id: string, nextTriggerAt: number): Promise<void> {
  await updateReminder(id, {
    triggerAt: nextTriggerAt,
    timed: true,
    status: "pending",
    lastAlertedAt: null,
  });
  emitReminderAlertResolved(id);
}

export async function dismissReminder(id: string): Promise<void> {
  await completeReminder(id);
}

export async function deleteReminder(id: string): Promise<void> {
  await ensureAccountDbReady();
  await accountDb.reminders.delete(id);
  notifyLocalDataMutated();
  emitDataUpdated();
  emitReminderAlertResolved(id);
}
