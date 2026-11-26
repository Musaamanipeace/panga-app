// src/data/reminders.ts
import { accountDb, ensureAccountDbReady } from "./accountDb";
import type { Reminder } from "./db";
import { newId, now } from "./utils";
import { getActiveWorkspaceId } from "./workspaceState";

export type { Reminder };
export type ReminderBucket = "overdue" | "due" | "upcoming";

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

/** Play a short beep tone for the given toneId using Web Audio (no external assets required). */
export function playTone(toneId: string | null): void {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    const duration = 0.5;
    switch (toneId) {
      case "chime":
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        break;
      case "soft":
        osc.type = "triangle";
        osc.frequency.setValueAtTime(520, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        break;
      case "urgent":
        osc.type = "square";
        osc.frequency.setValueAtTime(960, now);
        osc.frequency.setValueAtTime(960, now + 0.12);
        osc.frequency.setValueAtTime(760, now + 0.24);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        break;
      default:
        osc.type = "sine";
        osc.frequency.setValueAtTime(700, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    }
    osc.start(now);
    osc.stop(now + duration);
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

/** Show a system notification for a fired reminder. */
export function showReminderNotification(reminder: Reminder): void {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  new Notification(`Panga: ${reminder.message}`, {
    body: new Date(reminder.triggerAt).toLocaleString(),
    tag: `reminder-${reminder.id}`,
  });
  playTone(reminder.toneId ?? null);
}

let reminderSchedulerStarted = false;
let reminderTimer: number | undefined;

/** Poll due reminders while the app is open and fire notifications. Call once. */
export function startReminderScheduler(): void {
  if (reminderSchedulerStarted) return;
  reminderSchedulerStarted = true;
  const tick = async () => {
    try {
      await ensureAccountDbReady();
      const due = await accountDb.reminders.where("status").equals("pending").and((r) => r.triggerAt <= Date.now()).toArray();
      for (const r of due) {
        showReminderNotification(r);
        await updateReminder(r.id, { status: "fired" });
      }
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
}

export async function listReminders(): Promise<Reminder[]> {
  await ensureAccountDbReady();
  return accountDb.reminders.toArray().then((rows) => rows.sort((a, b) => a.triggerAt - b.triggerAt));
}

export async function listPendingReminders(): Promise<Reminder[]> {
  await ensureAccountDbReady();
  return accountDb.reminders.where("status").equals("pending").toArray().then((rows) => rows.sort((a, b) => a.triggerAt - b.triggerAt));
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

export async function createReminder(input: {
  message: string;
  triggerAt: number;
  toneId?: string;
  linkedEntityType: "task" | "note" | null;
  linkedEntityId: string | null;
  folderId?: string | null;
  workspaceId?: string;
}): Promise<Reminder> {
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
    status: "pending",
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await accountDb.reminders.add(reminder);
  return reminder;
}

export async function updateReminder(
  id: string,
  changes: Partial<Pick<Reminder, "message" | "triggerAt" | "toneId" | "linkedEntityType" | "linkedEntityId" | "status" | "folderId">>
): Promise<void> {
  await ensureAccountDbReady();
  await accountDb.reminders.update(id, { ...changes, updatedAt: now(), syncStatus: "pending" });
}

export async function dismissReminder(id: string): Promise<void> {
  await ensureAccountDbReady();
  await accountDb.reminders.update(id, { status: "dismissed", updatedAt: now(), syncStatus: "pending" });
}

export async function deleteReminder(id: string): Promise<void> {
  await ensureAccountDbReady();
  await accountDb.reminders.delete(id);
}
