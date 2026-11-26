// src/data/recurrence.ts
// Pure, DOM-free, Dexie-free recurrence engine for reminders.
import type { ReminderRecurrence } from "./db";

const DAY_MS = 86_400_000;
const MAX_ITERATIONS = 10_000;
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MONDAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

let loggedCapWarning = false;

interface WallParts {
  year: number;
  month: number; // 1..12
  day: number;   // 1..31
  hour: number;
  minute: number;
  second: number;
  ms: number;
  weekday: number; // 0..6 (Sun..Sat)
}

const dtfCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timeZone: string): Intl.DateTimeFormat {
  let fmt = dtfCache.get(timeZone);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    dtfCache.set(timeZone, fmt);
  }
  return fmt;
}

function getWallParts(epochMs: number, timeZone?: string): WallParts {
  if (!timeZone) {
    const d = new Date(epochMs);
    return {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      hour: d.getHours(),
      minute: d.getMinutes(),
      second: d.getSeconds(),
      ms: d.getMilliseconds(),
      weekday: d.getDay(),
    };
  }
  const parts = getFormatter(timeZone).formatToParts(new Date(epochMs));
  const map: Record<string, number> = {};
  for (const p of parts) {
    if (p.type !== "literal") map[p.type] = Number(p.value);
  }
  const year = map.year;
  const month = map.month;
  const day = map.day;
  const hour = map.hour === 24 ? 0 : map.hour;
  const minute = map.minute;
  const second = map.second;
  const ms = ((epochMs % 1000) + 1000) % 1000;
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return { year, month, day, hour, minute, second, ms, weekday };
}

function wallToEpochMs(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  ms: number,
  timeZone?: string
): number {
  if (!timeZone) {
    return new Date(year, month - 1, day, hour, minute, second, ms).getTime();
  }
  const guess = Date.UTC(year, month - 1, day, hour, minute, second, ms);
  const p1 = getWallParts(guess, timeZone);
  const off1 = Date.UTC(p1.year, p1.month - 1, p1.day, p1.hour, p1.minute, p1.second, ms) - guess;
  const t1 = guess - off1;
  const p2 = getWallParts(t1, timeZone);
  const off2 = Date.UTC(p2.year, p2.month - 1, p2.day, p2.hour, p2.minute, p2.second, ms) - t1;
  return guess - off2;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysInMonth(year: number, month: number): number {
  switch (month) {
    case 2:
      return isLeapYear(year) ? 29 : 28;
    case 4:
    case 6:
    case 9:
    case 11:
      return 30;
    default:
      return 31;
  }
}

function epochDayFromYmd(year: number, month: number, day: number): number {
  return Math.floor(Date.UTC(year, month - 1, day) / DAY_MS);
}

function ymdFromEpochDay(epochDay: number): { year: number; month: number; day: number } {
  const d = new Date(epochDay * DAY_MS);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  };
}

/** 0 = Monday-start week containing 1970-01-05 (Unix epoch day 4 was Monday). */
function mondayWeekIndex(epochDay: number): number {
  return Math.floor((epochDay - 4) / 7);
}

function sortWeekdaysMondayFirst(days: number[]): number[] {
  const unique = new Set(days.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6));
  return MONDAY_ORDER.filter((d) => unique.has(d));
}

function checkCap(iterations: number): boolean {
  if (iterations <= MAX_ITERATIONS) return false;
  if (!loggedCapWarning) {
    loggedCapWarning = true;
    console.warn("[reminders] Recurrence calculation exceeded iteration safety cap.");
  }
  return true;
}

/**
 * Returns the first scheduled occurrence strictly after `after` (respecting
 * `exdates`, `until`, `count`, and DST wall-clock preservation), or `null` if
 * no further occurrence exists.
 */
export function nextOccurrence(
  rec: ReminderRecurrence,
  firstStart: number,
  after: number,
  opts?: { timeZone?: string }
): number | null {
  const tz = opts?.timeZone;
  const interval = Math.floor(rec.interval);
  if (!Number.isFinite(interval) || interval < 1) return null;
  if (rec.until !== undefined && after >= rec.until) return null;

  const anchor = Number.isFinite(firstStart) ? firstStart : rec.anchorAt;
  if (!Number.isFinite(anchor)) return null;

  const sp = getWallParts(anchor, tz);
  const startDay = epochDayFromYmd(sp.year, sp.month, sp.day);
  const exSet = rec.exdates?.length ? new Set(rec.exdates) : null;
  const hasCount = typeof rec.count === "number";
  const maxCount = hasCount ? Math.floor(rec.count!) : Infinity;
  if (hasCount && maxCount < 1) return null;

  const afterParts = after > anchor ? getWallParts(after, tz) : sp;
  const afterDay = epochDayFromYmd(afterParts.year, afterParts.month, afterParts.day);

  const acceptCandidate = (
    ts: number,
    generatedCount: number
  ): { done: boolean; value: number | null; nextCount: number } => {
    if (ts < anchor) return { done: false, value: null, nextCount: generatedCount };
    if (rec.until !== undefined && ts > rec.until) {
      return { done: true, value: null, nextCount: generatedCount };
    }
    const nextCount = generatedCount + 1;
    if (hasCount && nextCount > maxCount) {
      return { done: true, value: null, nextCount: generatedCount };
    }
    if (exSet?.has(ts)) {
      if (hasCount && nextCount >= maxCount) {
        return { done: true, value: null, nextCount };
      }
      return { done: false, value: null, nextCount };
    }
    if (ts > after) {
      return { done: true, value: ts, nextCount };
    }
    if (hasCount && nextCount >= maxCount) {
      return { done: true, value: null, nextCount };
    }
    return { done: false, value: null, nextCount };
  };

  let iterations = 0;
  let generatedCount = 0;

  switch (rec.freq) {
    case "daily": {
      const startStep = hasCount
        ? 0
        : Math.max(0, Math.floor((afterDay - startDay) / interval) - 1);
      for (let step = startStep; ; step++) {
        if (checkCap(++iterations)) return null;
        const { year, month, day } = ymdFromEpochDay(startDay + step * interval);
        const ts = wallToEpochMs(year, month, day, sp.hour, sp.minute, sp.second, sp.ms, tz);
        const res = acceptCandidate(ts, generatedCount);
        generatedCount = res.nextCount;
        if (res.done) return res.value;
      }
    }

    case "weekly": {
      const rawDays = rec.byWeekday?.length ? rec.byWeekday : [sp.weekday];
      const days = sortWeekdaysMondayFirst(rawDays);
      if (days.length === 0) return null;
      const anchorWeek = mondayWeekIndex(startDay);
      const afterWeek = mondayWeekIndex(afterDay);
      const startWeekStep = hasCount
        ? 0
        : Math.max(0, Math.floor((afterWeek - anchorWeek) / interval) - 1);

      for (let wStep = startWeekStep; ; wStep++) {
        const weekMondayDay = (anchorWeek + wStep * interval) * 7 + 4;
        for (const wd of days) {
          if (checkCap(++iterations)) return null;
          const offsetFromMonday = (wd + 6) % 7;
          const { year, month, day } = ymdFromEpochDay(weekMondayDay + offsetFromMonday);
          const ts = wallToEpochMs(year, month, day, sp.hour, sp.minute, sp.second, sp.ms, tz);
          const res = acceptCandidate(ts, generatedCount);
          generatedCount = res.nextCount;
          if (res.done) return res.value;
        }
      }
    }

    case "monthly": {
      const targetDay = Math.floor(rec.byMonthDay ?? sp.day);
      if (!Number.isFinite(targetDay) || targetDay < 1 || targetDay > 31) return null;
      const startMonths = sp.year * 12 + (sp.month - 1);
      const afterMonths = afterParts.year * 12 + (afterParts.month - 1);
      const startStep = hasCount
        ? 0
        : Math.max(0, Math.floor((afterMonths - startMonths) / interval) - 1);

      for (let mStep = startStep; ; mStep++) {
        if (checkCap(++iterations)) return null;
        const total = startMonths + mStep * interval;
        const year = Math.floor(total / 12);
        const month = (total % 12) + 1;
        if (targetDay > daysInMonth(year, month)) {
          // Wait to catch `until` bound so impossible patterns don't spin unnecessarily past `until`
          if (rec.until !== undefined) {
            const monthStart = wallToEpochMs(year, month, 1, 0, 0, 0, 0, tz);
            if (monthStart > rec.until) return null;
          }
          continue;
        }
        const ts = wallToEpochMs(year, month, targetDay, sp.hour, sp.minute, sp.second, sp.ms, tz);
        const res = acceptCandidate(ts, generatedCount);
        generatedCount = res.nextCount;
        if (res.done) return res.value;
      }
    }

    case "yearly": {
      const startStep = hasCount
        ? 0
        : Math.max(0, Math.floor((afterParts.year - sp.year) / interval) - 1);

      for (let yStep = startStep; ; yStep++) {
        if (checkCap(++iterations)) return null;
        const year = sp.year + yStep * interval;
        if (sp.month === 2 && sp.day === 29 && !isLeapYear(year)) {
          if (rec.until !== undefined) {
            const yearStart = wallToEpochMs(year, 1, 1, 0, 0, 0, 0, tz);
            if (yearStart > rec.until) return null;
          }
          continue;
        }
        const ts = wallToEpochMs(year, sp.month, sp.day, sp.hour, sp.minute, sp.second, sp.ms, tz);
        const res = acceptCandidate(ts, generatedCount);
        generatedCount = res.nextCount;
        if (res.done) return res.value;
      }
    }
  }
}

/**
 * Decision D7: first scheduled occurrence strictly after `completedAt` AND on or
 * after local midnight of `now`; returns `null` if the series has ended.
 */
export function nextAfterComplete(
  rec: ReminderRecurrence,
  completedAt: number,
  now: number,
  opts?: { timeZone?: string }
): number | null {
  const tz = opts?.timeZone;
  const np = getWallParts(now, tz);
  const todayMidnight = wallToEpochMs(np.year, np.month, np.day, 0, 0, 0, 0, tz);
  const after = Math.max(completedAt, todayMidnight - 1);
  return nextOccurrence(rec, rec.anchorAt || completedAt, after, opts);
}

/**
 * Human-readable repeat summary, e.g. "Repeats every 2 days" or
 * "Repeats weekly on Mon, Wed".
 */
export function describeRecurrence(rec: ReminderRecurrence): string {
  const interval = Math.max(1, Math.floor(rec.interval || 1));
  switch (rec.freq) {
    case "daily":
      return interval === 1 ? "Repeats every day" : `Repeats every ${interval} days`;
    case "weekly": {
      const days = rec.byWeekday?.length ? sortWeekdaysMondayFirst(rec.byWeekday) : [];
      const dayText = days.length ? ` on ${days.map((d) => WEEKDAY_LABELS[d]).join(", ")}` : "";
      return interval === 1
        ? `Repeats weekly${dayText}`
        : `Repeats every ${interval} weeks${dayText}`;
    }
    case "monthly":
      return interval === 1 ? "Repeats monthly" : `Repeats every ${interval} months`;
    case "yearly":
      return interval === 1 ? "Repeats yearly" : `Repeats every ${interval} years`;
  }
}

/**
 * Returns up to `cap` occurrences (default 500) within `[from, to]` inclusive.
 */
export function occurrencesBetween(
  rec: ReminderRecurrence,
  firstStart: number,
  from: number,
  to: number,
  cap = 500,
  opts?: { timeZone?: string }
): number[] {
  if (to < from || cap <= 0) return [];
  const results: number[] = [];
  let cursor = from - 1;
  while (results.length < cap) {
    const next = nextOccurrence(rec, firstStart, cursor, opts);
    if (next === null || next > to) break;
    results.push(next);
    cursor = next;
  }
  return results;
}
