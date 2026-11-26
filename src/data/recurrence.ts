// src/data/recurrence.ts
// Pure local-time view classification, sorting, formatting, and fixed-schedule
// recurrence calculation for Panga reminders.

import type { Reminder, ReminderRecurrence } from "./db";

export type ReminderView = "today" | "overdue" | "upcoming";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function startOfLocalDay(ts: number): number {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).getTime();
}

export function endOfLocalDay(ts: number): number {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime();
}

export function localDateInputValue(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function localTimeInputValue(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function combineLocalDateTime(dateStr: string, timeStr?: string | null): number {
  const [yStr, mStr, dStr] = dateStr.split("-");
  const year = Number(yStr);
  const month = Number(mStr);
  const day = Number(dStr);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return Date.now();
  }
  if (timeStr && /^\d{1,2}:\d{2}/.test(timeStr)) {
    const [hStr, minStr] = timeStr.split(":");
    const hh = Number(hStr);
    const mm = Number(minStr);
    return new Date(year, month - 1, day, Number.isFinite(hh) ? hh : 9, Number.isFinite(mm) ? mm : 0, 0, 0).getTime();
  }
  // Plain (untimed) reminders use 09:00 local to avoid midnight DST boundary shifts.
  return new Date(year, month - 1, day, 9, 0, 0, 0).getTime();
}

export function isReminderOpen(r: Pick<Reminder, "status">): boolean {
  return r.status !== "dismissed";
}

export function isTimedReminder(r: Pick<Reminder, "timed">): boolean {
  return r.timed !== false;
}

export function viewOf(reminder: Pick<Reminder, "triggerAt">, nowMs = Date.now()): ReminderView {
  const dueDay = startOfLocalDay(reminder.triggerAt);
  const todayDay = startOfLocalDay(nowMs);
  if (dueDay < todayDay) return "overdue";
  if (dueDay === todayDay) return "today";
  return "upcoming";
}

export function sortTodayReminders(list: Reminder[]): Reminder[] {
  return list.slice().sort((a, b) => {
    const at = isTimedReminder(a) ? 0 : 1;
    const bt = isTimedReminder(b) ? 0 : 1;
    if (at !== bt) return at - bt;
    if (a.triggerAt !== b.triggerAt) return a.triggerAt - b.triggerAt;
    return a.createdAt - b.createdAt;
  });
}

export function sortOverdueReminders(list: Reminder[]): Reminder[] {
  return list.slice().sort((a, b) => {
    const da = startOfLocalDay(a.triggerAt);
    const db = startOfLocalDay(b.triggerAt);
    if (da !== db) return da - db;
    const at = isTimedReminder(a) ? 0 : 1;
    const bt = isTimedReminder(b) ? 0 : 1;
    if (at !== bt) return at - bt;
    return a.triggerAt - b.triggerAt;
  });
}

export function sortUpcomingReminders(list: Reminder[]): Reminder[] {
  return list.slice().sort((a, b) => {
    const da = startOfLocalDay(a.triggerAt);
    const db = startOfLocalDay(b.triggerAt);
    if (da !== db) return da - db;
    const at = isTimedReminder(a) ? 0 : 1;
    const bt = isTimedReminder(b) ? 0 : 1;
    if (at !== bt) return at - bt;
    return a.triggerAt - b.triggerAt;
  });
}

function daysBetweenLocalDays(fromTs: number, toTs: number): number {
  const a = new Date(fromTs);
  const b = new Date(toTs);
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcB - utcA) / DAY_MS);
}

function mondayWeekStartUtc(ts: number): number {
  const d = new Date(ts);
  const utc = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = (d.getDay() + 6) % 7; // Mon=0..Sun=6
  return utc - dow * DAY_MS;
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function buildLocalAt(year: number, monthIndex: number, day: number, template: Date): number {
  return new Date(
    year,
    monthIndex,
    day,
    template.getHours(),
    template.getMinutes(),
    0,
    0
  ).getTime();
}

/**
 * Computes the next fixed-schedule occurrence after completing `reminder`.
 * Returns `null` if the reminder does not repeat or its series has ended.
 *
 * Fixed schedule rule (D7): the next scheduled date strictly after the ticked
 * reminder's day AND on or after today's local day, preserving the original
 * anchor rhythm (e.g. every 2 days from anchor, weekly Mon/Wed, monthly on day D).
 */
export function nextAfterComplete(
  reminder: Reminder,
  nowMs = Date.now()
): { nextTriggerAt: number; remaining?: number } | null {
  const rec = reminder.recurrence;
  if (!rec) return null;

  let nextRemaining: number | undefined;
  if (rec.end?.type === "count") {
    if (rec.end.remaining <= 1) return null;
    nextRemaining = rec.end.remaining - 1;
  }

  const interval = Math.max(1, Math.floor(rec.interval || 1));
  const currentTemplate = new Date(reminder.triggerAt);
  const currentDay = startOfLocalDay(reminder.triggerAt);
  const todayDay = startOfLocalDay(nowMs);
  const minDay = Math.max(currentDay + DAY_MS, todayDay);
  const anchor = new Date(Number.isFinite(rec.anchorAt) ? rec.anchorAt : reminder.triggerAt);

  let candidate: number | null = null;

  if (rec.unit === "day") {
    const diffFromAnchor = Math.max(0, daysBetweenLocalDays(anchor.getTime(), minDay));
    const steps = Math.ceil(diffFromAnchor / interval);
    let targetDayOffset = steps * interval;
    let d = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + targetDayOffset);
    // Guard against minDay > currentDay rounding
    while (startOfLocalDay(d.getTime()) < minDay) {
      targetDayOffset += interval;
      d = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + targetDayOffset);
    }
    candidate = buildLocalAt(d.getFullYear(), d.getMonth(), d.getDate(), currentTemplate);
  } else if (rec.unit === "week") {
    const weekdays = (rec.weekdays && rec.weekdays.length > 0
      ? [...new Set(rec.weekdays.filter((w) => Number.isInteger(w) && w >= 0 && w <= 6))]
      : [anchor.getDay()]
    ).sort((a, b) => a - b);

    const anchorWeek = mondayWeekStartUtc(anchor.getTime());
    const minDate = new Date(minDay);
    for (let offset = 0; offset < interval * 7 * 12 + 366; offset++) {
      const probe = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate() + offset);
      const probeWeek = mondayWeekStartUtc(probe.getTime());
      const weekDiff = Math.round((probeWeek - anchorWeek) / (7 * DAY_MS));
      if (weekDiff >= 0 && weekDiff % interval === 0 && weekdays.includes(probe.getDay())) {
        candidate = buildLocalAt(probe.getFullYear(), probe.getMonth(), probe.getDate(), currentTemplate);
        break;
      }
    }
  } else if (rec.unit === "month") {
    const anchorDay = anchor.getDate();
    const minDate = new Date(minDay);
    const monthsDiff =
      (minDate.getFullYear() - anchor.getFullYear()) * 12 + (minDate.getMonth() - anchor.getMonth());
    let stepMonths = Math.max(0, Math.floor(monthsDiff / interval) * interval);
    for (let i = 0; i < 600; i++) {
      const totalMonths = anchor.getFullYear() * 12 + anchor.getMonth() + stepMonths;
      const targetYear = Math.floor(totalMonths / 12);
      const targetMonth = ((totalMonths % 12) + 12) % 12;
      const targetDay = Math.min(anchorDay, daysInMonth(targetYear, targetMonth));
      const ts = buildLocalAt(targetYear, targetMonth, targetDay, currentTemplate);
      if (startOfLocalDay(ts) >= minDay) {
        candidate = ts;
        break;
      }
      stepMonths += interval;
    }
  } else if (rec.unit === "year") {
    const anchorMonth = anchor.getMonth();
    const anchorDay = anchor.getDate();
    const minDate = new Date(minDay);
    const yearsDiff = minDate.getFullYear() - anchor.getFullYear();
    let stepYears = Math.max(0, Math.floor(yearsDiff / interval) * interval);
    for (let i = 0; i < 200; i++) {
      const targetYear = anchor.getFullYear() + stepYears;
      const targetDay = Math.min(anchorDay, daysInMonth(targetYear, anchorMonth));
      const ts = buildLocalAt(targetYear, anchorMonth, targetDay, currentTemplate);
      if (startOfLocalDay(ts) >= minDay) {
        candidate = ts;
        break;
      }
      stepYears += interval;
    }
  }

  if (candidate === null) return null;

  if (rec.end?.type === "until") {
    if (candidate > endOfLocalDay(rec.end.untilAt)) {
      return null;
    }
  }

  return nextRemaining !== undefined
    ? { nextTriggerAt: candidate, remaining: nextRemaining }
    : { nextTriggerAt: candidate };
}

export function formatRecurrence(rec?: ReminderRecurrence): string {
  if (!rec) return "";
  const interval = Math.max(1, Math.floor(rec.interval || 1));
  if (rec.unit === "day") {
    return interval === 1 ? "Repeats every day" : `Repeats every ${interval} days`;
  }
  if (rec.unit === "week") {
    const days = rec.weekdays && rec.weekdays.length > 0
      ? [...new Set(rec.weekdays)]
          .sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7))
          .map((d) => WEEKDAY_NAMES[d])
          .filter(Boolean)
      : [];
    const base = interval === 1 ? "Repeats weekly" : `Repeats every ${interval} weeks`;
    return days.length > 0 ? `${base} on ${days.join(", ")}` : base;
  }
  if (rec.unit === "month") {
    return interval === 1 ? "Repeats monthly" : `Repeats every ${interval} months`;
  }
  return interval === 1 ? "Repeats yearly" : `Repeats every ${interval} years`;
}

export function formatDayHeading(ts: number, nowMs = Date.now()): string {
  const d = new Date(ts);
  const sameYear = d.getFullYear() === new Date(nowMs).getFullYear();
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  }).format(d);
}

export function formatOverdueMeta(triggerAt: number, nowMs = Date.now()): string {
  const days = Math.max(1, daysBetweenLocalDays(triggerAt, nowMs));
  const datePart = formatDayHeading(triggerAt, nowMs);
  return `Due ${datePart}, ${days} ${days === 1 ? "day" : "days"} ago`;
}

export function formatLocalTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function formatPreviewDateTime(ts: number, allDay?: boolean): string {
  const datePart = formatDayHeading(ts);
  return allDay ? `${datePart} · All day` : `${datePart} · ${formatLocalTime(ts)}`;
}
