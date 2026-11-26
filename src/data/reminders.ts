// src/data/reminders.ts
import { accountDb, ensureAccountDbReady } from "./accountDb";
import type { Reminder } from "./db";
import { isReminderOpen, isTimedReminder, nextAfterComplete } from "./recurrence";
import { newId, now } from "./utils";
import { getActiveWorkspaceId } from "./workspaceState";

export type { Reminder };
export type ReminderBucket = "overdue" | "due" | "upcoming";
export type NotificationPermissionState = "granted" | "denied" | "default" | "unsupported";

export const TONE_PRESETS: { id: string; label: string }[] = [
  { id: "default", label: "Default" },
  { id: "chime", label: "Chime" },
  { id: "soft", label: "Soft" },
  { id: "urgent", label: "Urgent" },
];

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return audioCtx;
}

function notifyDataChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("panga-data-updated"));
  }
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

export function getNotificationPermissionState(): NotificationPermissionState {
  if (typeof Notification === "undefined") return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return "default";
}

/** Request notification permission. Returns true if granted. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof Notification === "undefined") return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const perm = await Notification.requestPermission();
  return perm === "granted";
}

async function showViaServiceWorker(title: string, options: NotificationOptions): Promise<boolean> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return false;
  try {
    const reg =
      (await navigator.serviceWorker.getRegistration?.()) ??
      (await navigator.serviceWorker.ready);
    if (reg && typeof reg.showNotification === "function") {
      await reg.showNotification(title, options);
      return true;
    }
  } catch {
    // ignore SW notification failure
  }
  return false;
}

/**
 * Show a system notification for a fired reminder.
 * Uses ServiceWorkerRegistration.showNotification when `new Notification(...)`
 * is disallowed (such as Chrome on Android).
 */
export function showReminderNotification(reminder: Reminder): void {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") {
    playTone(reminder.toneId ?? null);
    return;
  }
  const title = `Panga: ${reminder.message}`;
  const options: NotificationOptions = {
    body: new Date(reminder.triggerAt).toLocaleString(),
    tag: `reminder-${reminder.id}`,
  };
  try {
    new Notification(title, options);
  } catch {
    void showViaServiceWorker(title, options);
  }
  playTone(reminder.toneId ?? null);
}

// ---- In-app alert banner queue (app-open alerts) ----
const activeAlerts: Reminder[] = [];
const alertListeners = new Set<(alerts: Reminder[]) => void>();

function emitAlerts(): void {
  const snapshot = activeAlerts.slice();
  for (const listener of alertListeners) {
    listener(snapshot);
  }
}

export function pushReminderAlert(reminder: Reminder): void {
  const idx = activeAlerts.findIndex((a) => a.id === reminder.id);
  if (idx >= 0) {
    activeAlerts[idx] = reminder;
  } else {
    activeAlerts.push(reminder);
  }
  emitAlerts();
}

export function dismissReminderAlert(id: string): void {
  const idx = activeAlerts.findIndex((a) => a.id === id);
  if (idx >= 0) {
    activeAlerts.splice(idx, 1);
    emitAlerts();
  }
}

export function clearReminderAlerts(): void {
  if (activeAlerts.length === 0) return;
  activeAlerts.length = 0;
  emitAlerts();
}

export function getActiveReminderAlerts(): Reminder[] {
  return activeAlerts.slice();
}

export function subscribeReminderAlerts(listener: (alerts: Reminder[]) => void): () => void {
  alertListeners.add(listener);
  listener(activeAlerts.slice());
  return () => {
    alertListeners.delete(listener);
  };
}

let reminderSchedulerStarted = false;
let reminderTimer: number | undefined;

/** Poll due timed reminders while the app is open and fire notifications + in-app banners. Call once. */
export function startReminderScheduler(): void {
  if (reminderSchedulerStarted) return;
  reminderSchedulerStarted = true;
  const tick = async () => {
    try {
      await ensureAccountDbReady();
      const nowMs = Date.now();
      const due = await accountDb.reminders
        .where("status")
        .equals("pending")
        .and((r) => isTimedReminder(r) && r.triggerAt <= nowMs)
        .toArray();
      if (due.length === 0) return;
      for (const r of due) {
        showReminderNotification(r);
        await accountDb.reminders.update(r.id, {
          status: "fired",
          updatedAt: now(),
          syncStatus: "pending",
        });
        pushReminderAlert({ ...r, status: "fired" });
      }
      notifyDataChanged();
    } catch {
      /* ignore scheduler errors */
    }
  };
  void tick();
  reminderTimer = window.setInterval(tick, 60_000);
}

export function stopReminderScheduler(): void {
  if (reminderTimer !== undefined) {
    window.clearInterval(reminderTimer);
    reminderTimer = undefined;
  }
  reminderSchedulerStarted = false;
  clearReminderAlerts();
}

export async function listReminders(): Promise<Reminder[]> {
  await ensureAccountDbReady();
  return accountDb.reminders.toArray().then((rows) => rows.sort((a, b) => a.triggerAt - b.triggerAt));
}

export async function listOpenReminders(): Promise<Reminder[]> {
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

export async function getReminder(id: string): Promise<Reminder | undefined> {
  await ensureAccountDbReady();
  return accountDb.reminders.get(id);
}

export async function putReminder(reminder: Reminder): Promise<void> {
  await ensureAccountDbReady();
  await accountDb.reminders.put(reminder);
}

export function bucketReminders(reminders: Reminder[]): Record<ReminderBucket, Reminder[]> {
  const nowMs = Date.now();
  const todayStart = new Date(nowMs);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  return {
    overdue: reminders.filter((r) => r.triggerAt < nowMs),
    due: reminders.filter((r) => r.triggerAt >= nowMs && r.triggerAt < todayEnd.getTime()),
    upcoming: reminders.filter((r) => r.triggerAt >= todayEnd.getTime()),
  };
}

export type CreateReminderInput = {
  message: string;
  triggerAt: number;
  timed?: boolean;
  toneId?: string;
  endAt?: number;
  allDay?: boolean;
  location?: string;
  notes?: string;
  source?: "manual" | "ics";
  externalUid?: string;
  recurrence?: Reminder["recurrence"];
  rrule?: string;
  simplifiedRecurrence?: boolean;
  linkedEntityType: "task" | "note" | null;
  linkedEntityId: string | null;
  folderId?: string | null;
  workspaceId?: string;
};

export async function createReminder(input: CreateReminderInput): Promise<Reminder> {
  await ensureAccountDbReady();
  const t = now();
  const reminder: Reminder = {
    id: newId(),
    folderId: input.folderId ?? null,
    workspaceId: input.workspaceId ?? getActiveWorkspaceId(),
    toneId: input.toneId,
    linkedEntityType: input.linkedEntityType,
    linkedEntityId: input.linkedEntityId,
    message: input.message,
    triggerAt: input.triggerAt,
    ...(input.timed !== undefined ? { timed: input.timed } : {}),
    ...(input.endAt !== undefined ? { endAt: input.endAt } : {}),
    ...(input.allDay !== undefined ? { allDay: input.allDay } : {}),
    ...(input.location ? { location: input.location } : {}),
    ...(input.notes ? { notes: input.notes } : {}),
    ...(input.source ? { source: input.source } : {}),
    ...(input.externalUid ? { externalUid: input.externalUid } : {}),
    ...(input.recurrence ? { recurrence: input.recurrence } : {}),
    ...(input.rrule ? { rrule: input.rrule } : {}),
    ...(input.simplifiedRecurrence !== undefined ? { simplifiedRecurrence: input.simplifiedRecurrence } : {}),
    status: "pending",
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await accountDb.reminders.add(reminder);
  notifyDataChanged();
  return reminder;
}

export type UpdateReminderChanges = Partial<
  Pick<
    Reminder,
    | "message"
    | "triggerAt"
    | "timed"
    | "toneId"
    | "endAt"
    | "allDay"
    | "location"
    | "notes"
    | "source"
    | "externalUid"
    | "recurrence"
    | "rrule"
    | "simplifiedRecurrence"
    | "linkedEntityType"
    | "linkedEntityId"
    | "status"
    | "folderId"
  >
>;

export async function updateReminder(id: string, changes: UpdateReminderChanges): Promise<void> {
  await ensureAccountDbReady();
  await accountDb.reminders.update(id, { ...changes, updatedAt: now(), syncStatus: "pending" });
  notifyDataChanged();
}

export async function dismissReminder(id: string): Promise<void> {
  await ensureAccountDbReady();
  await accountDb.reminders.update(id, { status: "dismissed", updatedAt: now(), syncStatus: "pending" });
  dismissReminderAlert(id);
  notifyDataChanged();
}

export async function deleteReminder(id: string): Promise<void> {
  await ensureAccountDbReady();
  await accountDb.reminders.delete(id);
  dismissReminderAlert(id);
  notifyDataChanged();
}

export type CompleteReminderResult =
  | { kind: "deleted"; previous: Reminder }
  | { kind: "advanced"; previous: Reminder; nextTriggerAt: number }
  | null;

/**
 * Tick off a reminder:
 * - One-time (or ended repeating series): deletes the reminder immediately.
 * - Repeating: moves the reminder to its next scheduled occurrence (`pending`).
 */
export async function completeReminder(id: string, nowMs = Date.now()): Promise<CompleteReminderResult> {
  await ensureAccountDbReady();
  const previous = await accountDb.reminders.get(id);
  if (!previous) return null;

  const next = nextAfterComplete(previous, nowMs);
  dismissReminderAlert(id);

  if (!next) {
    await accountDb.reminders.delete(id);
    notifyDataChanged();
    return { kind: "deleted", previous };
  }

  const nextRecurrence = previous.recurrence
    ? {
        ...previous.recurrence,
        ...(next.remaining !== undefined && previous.recurrence.end?.type === "count"
          ? { end: { type: "count" as const, remaining: next.remaining } }
          : {}),
      }
    : undefined;

  await accountDb.reminders.update(id, {
    triggerAt: next.nextTriggerAt,
    status: "pending",
    ...(nextRecurrence ? { recurrence: nextRecurrence } : {}),
    updatedAt: now(),
    syncStatus: "pending",
  });
  notifyDataChanged();
  return { kind: "advanced", previous, nextTriggerAt: next.nextTriggerAt };
}

export async function restoreReminderRecord(previous: Reminder): Promise<void> {
  await ensureAccountDbReady();
  await accountDb.reminders.put(previous);
  notifyDataChanged();
}
