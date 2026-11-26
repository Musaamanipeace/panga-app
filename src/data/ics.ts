// src/data/ics.ts
// Pure RFC 5545 (.ics) VEVENT parser with line unfolding, escaped text
// handling, UTC/floating/TZID date conversion via Intl.DateTimeFormat, and
// RRULE mapping to Panga ReminderRecurrence.

import type { ReminderRecurrence, ReminderRecurrenceEnd } from "./db";

export interface ParsedIcsEvent {
  uid: string;
  externalUid: string;
  summary: string;
  triggerAt: number;
  endAt?: number;
  allDay: boolean;
  timed: boolean;
  location?: string;
  notes?: string;
  rrule?: string;
  recurrence?: ReminderRecurrence;
  simplifiedRecurrence: boolean;
  unknownTimeZone: boolean;
  tzid?: string;
}

export interface UnreadableIcsEvent {
  fileName: string;
  title?: string;
  reason: string;
}

export interface ParseIcsResult {
  events: ParsedIcsEvent[];
  unreadable: UnreadableIcsEvent[];
  cancelledCount: number;
}

const ICS_DAY_TO_JS: Record<string, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};

const WINDOWS_TZ_FALLBACK: Record<string, string> = {
  "UTC": "UTC",
  "Coordinated Universal Time": "UTC",
  "GMT Standard Time": "Europe/London",
  "Greenwich Standard Time": "Atlantic/Reykjavik",
  "W. Europe Standard Time": "Europe/Berlin",
  "Central Europe Standard Time": "Europe/Budapest",
  "Romance Standard Time": "Europe/Paris",
  "Central European Standard Time": "Europe/Warsaw",
  "E. Europe Standard Time": "Europe/Bucharest",
  "E. Africa Standard Time": "Africa/Nairobi",
  "South Africa Standard Time": "Africa/Johannesburg",
  "Eastern Standard Time": "America/New_York",
  "US Eastern Standard Time": "America/Indiana/Indianapolis",
  "Central Standard Time": "America/Chicago",
  "Mountain Standard Time": "America/Denver",
  "Pacific Standard Time": "America/Los_Angeles",
  "Alaskan Standard Time": "America/Anchorage",
  "Hawaiian Standard Time": "Pacific/Honolulu",
  "India Standard Time": "Asia/Kolkata",
  "China Standard Time": "Asia/Shanghai",
  "Tokyo Standard Time": "Asia/Tokyo",
  "Singapore Standard Time": "Asia/Singapore",
  "AUS Eastern Standard Time": "Australia/Sydney",
};

export function unfoldIcsLines(raw: string): string[] {
  const normalized = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const unfolded = normalized.replace(/\n[ \t]/g, "");
  return unfolded.split("\n");
}

export function unescapeIcsText(raw: string): string {
  return raw
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

interface ParsedProp {
  name: string;
  params: Record<string, string>;
  value: string;
}

function parsePropertyLine(line: string): ParsedProp | null {
  let inQuotes = false;
  let colonIdx = -1;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') inQuotes = !inQuotes;
    else if (ch === ":" && !inQuotes) {
      colonIdx = i;
      break;
    }
  }
  if (colonIdx <= 0) return null;

  const head = line.slice(0, colonIdx);
  const value = line.slice(colonIdx + 1);

  const parts: string[] = [];
  let start = 0;
  inQuotes = false;
  for (let i = 0; i < head.length; i++) {
    const ch = head[i];
    if (ch === '"') inQuotes = !inQuotes;
    else if (ch === ";" && !inQuotes) {
      parts.push(head.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(head.slice(start));

  const name = parts[0].trim().toUpperCase();
  if (!name) return null;

  const params: Record<string, string> = {};
  for (let i = 1; i < parts.length; i++) {
    const eq = parts[i].indexOf("=");
    if (eq <= 0) continue;
    const key = parts[i].slice(0, eq).trim().toUpperCase();
    let val = parts[i].slice(eq + 1).trim();
    if (val.startsWith('"') && val.endsWith('"') && val.length >= 2) {
      val = val.slice(1, -1);
    }
    params[key] = val;
  }

  return { name, params, value };
}

function getTzParts(ts: number, timeZone: string) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date(ts));
  const map: Record<string, number> = {};
  for (const p of parts) {
    if (p.type !== "literal") {
      map[p.type] = Number(p.value);
    }
  }
  const hour = map.hour === 24 ? 0 : map.hour;
  return {
    year: map.year,
    month: map.month,
    day: map.day,
    hour,
    minute: map.minute,
    second: map.second,
  };
}

function zonedWallTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  rawTzid: string
): { ts: number; unknownTimeZone: boolean } {
  const tzid = WINDOWS_TZ_FALLBACK[rawTzid] ?? rawTzid;
  try {
    const targetUtc = Date.UTC(year, month - 1, day, hour, minute, second);
    let guess = targetUtc;
    for (let i = 0; i < 2; i++) {
      const p = getTzParts(guess, tzid);
      const shownUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
      const diff = shownUtc - targetUtc;
      guess -= diff;
      if (diff === 0) break;
    }
    return { ts: guess, unknownTimeZone: false };
  } catch {
    return {
      ts: new Date(year, month - 1, day, hour, minute, second, 0).getTime(),
      unknownTimeZone: true,
    };
  }
}

export interface ParsedDateResult {
  ts: number;
  allDay: boolean;
  timed: boolean;
  unknownTimeZone: boolean;
  tzid?: string;
}

export function parseIcsDateTime(
  rawValue: string,
  params: Record<string, string> = {}
): ParsedDateResult | null {
  const value = rawValue.trim();
  if (!value) return null;

  const isDateOnly = params.VALUE?.toUpperCase() === "DATE" || /^\d{8}$/.test(value);
  if (isDateOnly) {
    const m = /^(\d{4})(\d{2})(\d{2})$/.exec(value);
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    return {
      ts: new Date(y, mo - 1, d, 9, 0, 0, 0).getTime(),
      allDay: true,
      timed: false,
      unknownTimeZone: false,
    };
  }

  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/i.exec(value);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const hh = Number(m[4]);
  const mm = Number(m[5]);
  const ss = Number(m[6]);
  const isUtc = Boolean(m[7]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || hh > 23 || mm > 59 || ss > 59) return null;

  if (isUtc) {
    return {
      ts: Date.UTC(y, mo - 1, d, hh, mm, ss),
      allDay: false,
      timed: true,
      unknownTimeZone: false,
    };
  }

  const tzid = params.TZID?.trim();
  if (tzid) {
    const conv = zonedWallTimeToUtc(y, mo, d, hh, mm, ss, tzid);
    return {
      ts: conv.ts,
      allDay: false,
      timed: true,
      unknownTimeZone: conv.unknownTimeZone,
      tzid,
    };
  }

  return {
    ts: new Date(y, mo - 1, d, hh, mm, ss, 0).getTime(),
    allDay: false,
    timed: true,
    unknownTimeZone: false,
  };
}

export function parseIcsRrule(
  rruleRaw: string,
  anchorAt: number
): { recurrence?: ReminderRecurrence; simplified: boolean } {
  const parts = rruleRaw
    .trim()
    .split(";")
    .map((p) => p.trim())
    .filter(Boolean);
  const kv: Record<string, string> = {};
  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq <= 0) continue;
    kv[part.slice(0, eq).toUpperCase()] = part.slice(eq + 1).toUpperCase();
  }

  const freq = kv.FREQ;
  if (!freq || !["DAILY", "WEEKLY", "MONTHLY", "YEARLY"].includes(freq)) {
    return { simplified: true };
  }

  const unsupportedKeys = ["BYSETPOS", "BYYEARDAY", "BYWEEKNO", "BYHOUR", "BYMINUTE", "BYSECOND"];
  if (unsupportedKeys.some((k) => k in kv)) {
    return { simplified: true };
  }

  const interval = kv.INTERVAL ? Number(kv.INTERVAL) : 1;
  if (!Number.isInteger(interval) || interval < 1) {
    return { simplified: true };
  }

  let end: ReminderRecurrenceEnd = { type: "never" };
  if (kv.COUNT) {
    const count = Number(kv.COUNT);
    if (!Number.isInteger(count) || count < 1) return { simplified: true };
    end = { type: "count", remaining: count };
  } else if (kv.UNTIL) {
    const parsedUntil = parseIcsDateTime(kv.UNTIL);
    if (!parsedUntil) return { simplified: true };
    end = { type: "until", untilAt: parsedUntil.ts };
  }

  if (freq === "DAILY") {
    if (kv.BYDAY || kv.BYMONTH || kv.BYMONTHDAY) {
      return { simplified: true };
    }
    return {
      recurrence: { interval, unit: "day", end, anchorAt },
      simplified: false,
    };
  }

  if (freq === "WEEKLY") {
    if (kv.BYMONTH || kv.BYMONTHDAY) {
      return { simplified: true };
    }
    let weekdays: number[] | undefined;
    if (kv.BYDAY) {
      const tokens = kv.BYDAY.split(",").map((t) => t.trim()).filter(Boolean);
      const mapped: number[] = [];
      for (const tok of tokens) {
        const dayNum = ICS_DAY_TO_JS[tok];
        if (dayNum === undefined) {
          return { simplified: true };
        }
        mapped.push(dayNum);
      }
      if (mapped.length > 0) weekdays = [...new Set(mapped)];
    }
    return {
      recurrence: {
        interval,
        unit: "week",
        ...(weekdays ? { weekdays } : {}),
        end,
        anchorAt,
      },
      simplified: false,
    };
  }

  if (freq === "MONTHLY") {
    if (kv.BYDAY || kv.BYMONTH) {
      return { simplified: true };
    }
    if (kv.BYMONTHDAY) {
      const dayNum = Number(kv.BYMONTHDAY);
      const anchorDay = new Date(anchorAt).getDate();
      if (!Number.isInteger(dayNum) || dayNum !== anchorDay) {
        return { simplified: true };
      }
    }
    return {
      recurrence: { interval, unit: "month", end, anchorAt },
      simplified: false,
    };
  }

  // YEARLY
  if (kv.BYDAY) return { simplified: true };
  if (kv.BYMONTH) {
    const m = Number(kv.BYMONTH);
    if (!Number.isInteger(m) || m !== new Date(anchorAt).getMonth() + 1) {
      return { simplified: true };
    }
  }
  if (kv.BYMONTHDAY) {
    const d = Number(kv.BYMONTHDAY);
    if (!Number.isInteger(d) || d !== new Date(anchorAt).getDate()) {
      return { simplified: true };
    }
  }
  return {
    recurrence: { interval, unit: "year", end, anchorAt },
    simplified: false,
  };
}

export function parseIcs(raw: string, fileName = "calendar.ics"): ParseIcsResult {
  const lines = unfoldIcsLines(raw);
  const events: ParsedIcsEvent[] = [];
  const unreadable: UnreadableIcsEvent[] = [];
  let cancelledCount = 0;

  const stack: string[] = [];
  let props: ParsedProp[] | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line) continue;

    const upper = line.trim().toUpperCase();
    if (upper.startsWith("BEGIN:")) {
      const block = upper.slice(6).trim();
      stack.push(block);
      if (block === "VEVENT" && stack.length === 2 && stack[0] === "VCALENDAR") {
        props = [];
      } else if (block === "VEVENT" && stack.length === 1) {
        props = [];
      }
      continue;
    }

    if (upper.startsWith("END:")) {
      const block = upper.slice(4).trim();
      const top = stack[stack.length - 1];
      if (block === "VEVENT" && props && top === "VEVENT") {
        const parsed = finalizeEvent(props, fileName);
        if (parsed.kind === "cancelled") cancelledCount++;
        else if (parsed.kind === "error") unreadable.push(parsed.error);
        else events.push(parsed.event);
        props = null;
      }
      if (top === block) stack.pop();
      continue;
    }

    if (props && stack[stack.length - 1] === "VEVENT") {
      const prop = parsePropertyLine(line);
      if (prop) props.push(prop);
    }
  }

  return { events, unreadable, cancelledCount };
}

function finalizeEvent(
  props: ParsedProp[],
  fileName: string
):
  | { kind: "ok"; event: ParsedIcsEvent }
  | { kind: "cancelled" }
  | { kind: "error"; error: UnreadableIcsEvent } {
  const get = (name: string) => props.find((p) => p.name === name);

  const summaryProp = get("SUMMARY");
  const title = summaryProp ? unescapeIcsText(summaryProp.value).trim() : "";
  const status = get("STATUS")?.value.trim().toUpperCase();

  if (status === "CANCELLED") {
    return { kind: "cancelled" };
  }

  const dtStartProp = get("DTSTART");
  if (!dtStartProp) {
    return {
      kind: "error",
      error: {
        fileName,
        ...(title ? { title } : {}),
        reason: "Missing start date or time.",
      },
    };
  }

  const start = parseIcsDateTime(dtStartProp.value, dtStartProp.params);
  if (!start) {
    return {
      kind: "error",
      error: {
        fileName,
        ...(title ? { title } : {}),
        reason: `Unrecognized start date (${dtStartProp.value}).`,
      },
    };
  }

  const dtEndProp = get("DTEND");
  const end = dtEndProp ? parseIcsDateTime(dtEndProp.value, dtEndProp.params) : null;

  const uidProp = get("UID");
  const recIdProp = get("RECURRENCE-ID");
  const baseUid = uidProp?.value.trim() || `ics-${start.ts}-${title || "event"}`;
  const recId = recIdProp?.value.trim();
  const externalUid = recId ? `${baseUid}#${recId}` : baseUid;

  const locationProp = get("LOCATION");
  const location = locationProp ? unescapeIcsText(locationProp.value).trim() : "";

  const descProp = get("DESCRIPTION");
  const notes = descProp ? unescapeIcsText(descProp.value).trim() : "";

  const rruleProp = get("RRULE");
  const rrule = rruleProp?.value.trim() || undefined;
  let recurrence: ReminderRecurrence | undefined;
  let simplifiedRecurrence = false;
  if (rrule && !recId) {
    const parsedRule = parseIcsRrule(rrule, start.ts);
    recurrence = parsedRule.recurrence;
    simplifiedRecurrence = parsedRule.simplified;
  }

  return {
    kind: "ok",
    event: {
      uid: baseUid,
      externalUid,
      summary: title || "Untitled event",
      triggerAt: start.ts,
      ...(end ? { endAt: end.ts } : {}),
      allDay: start.allDay,
      timed: start.timed,
      ...(location ? { location } : {}),
      ...(notes ? { notes } : {}),
      ...(rrule ? { rrule } : {}),
      ...(recurrence ? { recurrence } : {}),
      simplifiedRecurrence,
      unknownTimeZone: start.unknownTimeZone,
      ...(start.tzid ? { tzid: start.tzid } : {}),
    },
  };
}
