import { unzipSync, strFromU8 } from "fflate";
import { accountDb, ensureAccountDbReady } from "./accountDb";
import { hasImportedDone, importedDoneKey } from "./accountSettings";
import {
  emitReminderAlertResolved,
  startOfLocalDay,
} from "./reminders";
import { notifyLocalDataMutated, type Reminder, type ReminderRecurrence, type ReminderRepeatFreq } from "./db";
import { newId, now } from "./utils";
import { getActiveWorkspaceId } from "./workspaceState";

export interface ParsedIcsProperty {
  name: string;
  params: Record<string, string>;
  value: string;
}

export interface ParsedIcsEvent {
  uid: string;
  summary: string;
  triggerAt: number;
  timed: boolean;
  endAt?: number;
  location?: string;
  notes?: string;
  recurrence: ReminderRecurrence | null;
  rruleRaw: string | null;
  externalInstance: string | null;
  externalSequence?: number;
  externalModified?: number;
}

export interface IcsImportResult {
  imported: number;
  updated: number;
  skippedDone: number;
  skippedDuplicate: number;
  skippedPast: number;
  filesProcessed: number;
  errors: string[];
}

export interface ImportIcsOptions {
  folderId?: string | null;
  workspaceId?: string;
  /** If set, one-time (non-repeating) events with triggerAt < skipPastBeforeMs are skipped. */
  skipPastBeforeMs?: number | null;
}

interface VTimezoneOffsetInfo {
  standardOffsetMin: number;
  daylightOffsetMin?: number;
}

const WEEKDAY_CODE_MAP: Record<string, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};

const FREQ_MAP: Record<string, ReminderRepeatFreq> = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  YEARLY: "yearly",
};

/** Unfold RFC 5545 folded lines (CRLF/LF followed by a single space or horizontal tab). */
export function unfoldIcsLines(raw: string): string[] {
  const normalized = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const physicalLines = normalized.split("\n");
  const unfolded: string[] = [];
  for (const line of physicalLines) {
    if ((line.startsWith(" ") || line.startsWith("\t")) && unfolded.length > 0) {
      unfolded[unfolded.length - 1] += line.slice(1);
    } else {
      unfolded.push(line);
    }
  }
  return unfolded;
}

/** Unescape RFC 5545 TEXT values (\n, \N, \,, \;, \\). */
export function unescapeIcsText(value: string): string {
  let out = "";
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (ch === "\\" && i + 1 < value.length) {
      const next = value[i + 1];
      if (next === "n" || next === "N") {
        out += "\n";
        i++;
        continue;
      }
      if (next === "," || next === ";" || next === "\\") {
        out += next;
        i++;
        continue;
      }
    }
    out += ch;
  }
  return out;
}

/** Split an unfolded property line into { name, params, value }, honoring quoted parameter values. */
export function parseIcsPropertyLine(line: string): ParsedIcsProperty | null {
  if (!line || !line.trim()) return null;
  let inQuotes = false;
  let colonIdx = -1;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ":" && !inQuotes) {
      colonIdx = i;
      break;
    }
  }
  if (colonIdx <= 0) return null;

  const left = line.slice(0, colonIdx);
  const value = line.slice(colonIdx + 1);

  const segments: string[] = [];
  let cur = "";
  inQuotes = false;
  for (let i = 0; i < left.length; i++) {
    const c = left[i];
    if (c === '"') {
      inQuotes = !inQuotes;
      cur += c;
    } else if (c === ";" && !inQuotes) {
      segments.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  segments.push(cur);

  const name = segments[0].trim().toUpperCase();
  if (!name) return null;

  const params: Record<string, string> = {};
  for (let i = 1; i < segments.length; i++) {
    const seg = segments[i];
    const eq = seg.indexOf("=");
    if (eq <= 0) continue;
    const pName = seg.slice(0, eq).trim().toUpperCase();
    let pVal = seg.slice(eq + 1).trim();
    if (pVal.startsWith('"') && pVal.endsWith('"') && pVal.length >= 2) {
      pVal = pVal.slice(1, -1);
    }
    params[pName] = pVal;
  }

  return { name, params, value };
}

function parseUtcOffsetMinutes(raw: string): number | null {
  const m = /^([+-])(\d{2})(\d{2})(?:\d{2})?$/.exec(raw.trim());
  if (!m) return null;
  const sign = m[1] === "-" ? -1 : 1;
  return sign * (Number(m[2]) * 60 + Number(m[3]));
}

function wallInIanaZoneToEpoch(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timeZone: string
): number | null {
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    const partsAt = (ts: number) => {
      const map: Record<string, number> = {};
      for (const p of fmt.formatToParts(new Date(ts))) {
        if (p.type !== "literal") map[p.type] = Number(p.value);
      }
      return Date.UTC(
        map.year,
        map.month - 1,
        map.day,
        map.hour === 24 ? 0 : map.hour,
        map.minute,
        map.second,
        0
      );
    };
    const guess = Date.UTC(year, month - 1, day, hour, minute, second, 0);
    const off1 = partsAt(guess) - guess;
    const t1 = guess - off1;
    const off2 = partsAt(t1) - t1;
    return guess - off2;
  } catch {
    return null;
  }
}

export function parseIcsDateTime(
  rawValue: string,
  params: Record<string, string>,
  vtimezones: Map<string, VTimezoneOffsetInfo>
): { epochMs: number; timed: boolean } | null {
  const clean = rawValue.trim();
  const valueType = (params.VALUE ?? "").toUpperCase();

  // All-day DATE value: YYYYMMDD
  const dateOnly = /^(\d{4})(\d{2})(\d{2})$/.exec(clean);
  if (valueType === "DATE" || dateOnly) {
    const m = dateOnly ?? /^(\d{4})(\d{2})(\d{2})/.exec(clean);
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    return {
      epochMs: new Date(y, mo - 1, d, 0, 0, 0, 0).getTime(),
      timed: false,
    };
  }

  // DateTime: YYYYMMDDTHHMMSS(Z)?
  const dt = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/i.exec(clean);
  if (!dt) return null;
  const y = Number(dt[1]);
  const mo = Number(dt[2]);
  const d = Number(dt[3]);
  const hh = Number(dt[4]);
  const mm = Number(dt[5]);
  const ss = Number(dt[6]);
  const isUtc = Boolean(dt[7]);

  if (isUtc) {
    return {
      epochMs: Date.UTC(y, mo - 1, d, hh, mm, ss, 0),
      timed: true,
    };
  }

  const tzid = params.TZID?.trim();
  if (tzid) {
    const ianaResolved = wallInIanaZoneToEpoch(y, mo, d, hh, mm, ss, tzid);
    if (ianaResolved !== null) {
      return { epochMs: ianaResolved, timed: true };
    }
    const vtz = vtimezones.get(tzid);
    if (vtz) {
      const offsetMin = vtz.standardOffsetMin;
      return {
        epochMs: Date.UTC(y, mo - 1, d, hh, mm, ss, 0) - offsetMin * 60_000,
        timed: true,
      };
    }
  }

  // Floating local time
  return {
    epochMs: new Date(y, mo - 1, d, hh, mm, ss, 0).getTime(),
    timed: true,
  };
}

function parseRruleString(
  rruleRaw: string,
  anchorAt: number,
  exdates: number[],
  vtimezones: Map<string, VTimezoneOffsetInfo>
): ReminderRecurrence | null {
  const parts = rruleRaw.split(";");
  const kv = new Map<string, string>();
  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq <= 0) continue;
    kv.set(part.slice(0, eq).trim().toUpperCase(), part.slice(eq + 1).trim());
  }

  const freqStr = kv.get("FREQ")?.toUpperCase();
  if (!freqStr || !FREQ_MAP[freqStr]) return null;
  const freq = FREQ_MAP[freqStr];

  const rawInt = Number(kv.get("INTERVAL") ?? "1");
  const interval = Number.isInteger(rawInt) && rawInt >= 1 ? rawInt : 1;

  let byWeekday: number[] | undefined;
  const byDayRaw = kv.get("BYDAY");
  if (byDayRaw && freq === "weekly") {
    const parsedDays: number[] = [];
    for (const token of byDayRaw.split(",")) {
      const code = token.trim().toUpperCase().replace(/^[+-]?\d+/, "");
      const wd = WEEKDAY_CODE_MAP[code];
      if (wd !== undefined && !parsedDays.includes(wd)) {
        parsedDays.push(wd);
      }
    }
    if (parsedDays.length > 0) byWeekday = parsedDays;
  }

  let byMonthDay: number | undefined;
  const byMdRaw = kv.get("BYMONTHDAY");
  if (byMdRaw && freq === "monthly") {
    const firstMd = Number(byMdRaw.split(",")[0]);
    if (Number.isInteger(firstMd) && firstMd >= 1 && firstMd <= 31) {
      byMonthDay = firstMd;
    }
  }

  let count: number | undefined;
  const countRaw = kv.get("COUNT");
  if (countRaw) {
    const parsedCount = Number(countRaw);
    if (Number.isInteger(parsedCount) && parsedCount >= 1) {
      count = parsedCount;
    }
  }

  let until: number | undefined;
  const untilRaw = kv.get("UNTIL");
  if (untilRaw) {
    const parsedUntil = parseIcsDateTime(untilRaw, {}, vtimezones);
    if (parsedUntil) {
      until = parsedUntil.timed
        ? parsedUntil.epochMs
        : parsedUntil.epochMs + 86_400_000 - 1;
    }
  }

  return {
    freq,
    interval,
    anchorAt,
    ...(byWeekday ? { byWeekday } : {}),
    ...(freq === "monthly" ? { byMonthDay: byMonthDay ?? new Date(anchorAt).getDate() } : {}),
    ...(until !== undefined ? { until } : {}),
    ...(count !== undefined ? { count } : {}),
    ...(exdates.length > 0 ? { exdates: [...new Set(exdates)].sort((a, b) => a - b) } : {}),
  };
}

/** Parse all non-cancelled VEVENT entries inside an RFC 5545 `.ics` document. */
export function parseIcsEvents(raw: string): ParsedIcsEvent[] {
  const lines = unfoldIcsLines(raw);
  const vtimezones = new Map<string, VTimezoneOffsetInfo>();

  // Pass 1: collect VTIMEZONE offsets (fallback if TZID is not an IANA zone).
  let tzDepth = 0;
  let tzSub: "STANDARD" | "DAYLIGHT" | null = null;
  let currentTzId: string | null = null;
  let currentTzInfo: VTimezoneOffsetInfo | null = null;

  for (const line of lines) {
    const prop = parseIcsPropertyLine(line);
    if (!prop) continue;
    if (prop.name === "BEGIN" && prop.value.toUpperCase() === "VTIMEZONE") {
      tzDepth = 1;
      currentTzId = null;
      currentTzInfo = { standardOffsetMin: 0 };
      tzSub = null;
      continue;
    }
    if (prop.name === "END" && prop.value.toUpperCase() === "VTIMEZONE") {
      if (currentTzId && currentTzInfo) {
        vtimezones.set(currentTzId, currentTzInfo);
      }
      tzDepth = 0;
      tzSub = null;
      currentTzId = null;
      currentTzInfo = null;
      continue;
    }
    if (tzDepth === 0) continue;
    if (prop.name === "BEGIN") {
      const sub = prop.value.toUpperCase();
      if (sub === "STANDARD" || sub === "DAYLIGHT") tzSub = sub;
    } else if (prop.name === "END") {
      tzSub = null;
    } else if (prop.name === "TZID" && !tzSub) {
      currentTzId = prop.value.trim();
    } else if (prop.name === "TZOFFSETTO" && tzSub && currentTzInfo) {
      const mins = parseUtcOffsetMinutes(prop.value);
      if (mins !== null) {
        if (tzSub === "STANDARD") currentTzInfo.standardOffsetMin = mins;
        else currentTzInfo.daylightOffsetMin = mins;
      }
    }
  }

  // Pass 2: collect VEVENT blocks (ignoring nested VALARM subcomponents).
  const events: ParsedIcsEvent[] = [];
  let inEvent = false;
  let nestedDepth = 0;
  let props: ParsedIcsProperty[] = [];

  const finalizeEvent = (evProps: ParsedIcsProperty[]) => {
    const getOne = (name: string) => evProps.find((p) => p.name === name);
    const statusProp = getOne("STATUS");
    if (statusProp && statusProp.value.trim().toUpperCase() === "CANCELLED") {
      return;
    }

    const dtStartProp = getOne("DTSTART");
    if (!dtStartProp) return;
    const parsedStart = parseIcsDateTime(dtStartProp.value, dtStartProp.params, vtimezones);
    if (!parsedStart) return;

    const dtEndProp = getOne("DTEND");
    const parsedEnd = dtEndProp
      ? parseIcsDateTime(dtEndProp.value, dtEndProp.params, vtimezones)
      : null;

    const summaryProp = getOne("SUMMARY");
    const summary = summaryProp ? unescapeIcsText(summaryProp.value).trim() || "Untitled event" : "Untitled event";

    const descProp = getOne("DESCRIPTION");
    const urlProp = getOne("URL");
    let notes = descProp ? unescapeIcsText(descProp.value).trim() : "";
    const urlVal = urlProp?.value.trim() ?? "";
    if (urlVal && !notes.includes(urlVal)) {
      notes = notes ? `${notes}\n\n${urlVal}` : urlVal;
    }
    const cleanNotes = notes ? notes.slice(0, 2000) : undefined;

    const locProp = getOne("LOCATION");
    const location = locProp ? unescapeIcsText(locProp.value).trim() || undefined : undefined;

    const exdates: number[] = [];
    for (const p of evProps) {
      if (p.name !== "EXDATE") continue;
      for (const token of p.value.split(",")) {
        const parsedEx = parseIcsDateTime(token, p.params, vtimezones);
        if (parsedEx) exdates.push(parsedEx.epochMs);
      }
    }

    const rruleProp = getOne("RRULE");
    const rruleRaw = rruleProp ? rruleProp.value.trim() : null;
    const recurrence = rruleRaw
      ? parseRruleString(rruleRaw, parsedStart.epochMs, exdates, vtimezones)
      : null;

    const uidProp = getOne("UID");
    const uid =
      uidProp?.value.trim() ||
      `ics-anon-${parsedStart.epochMs}-${summary.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 32)}`;

    const recIdProp = getOne("RECURRENCE-ID");
    const externalInstance = recIdProp ? recIdProp.value.trim() || null : null;

    const seqProp = getOne("SEQUENCE");
    const parsedSeq = seqProp ? Number(seqProp.value.trim()) : undefined;
    const externalSequence =
      parsedSeq !== undefined && Number.isFinite(parsedSeq) ? parsedSeq : undefined;

    const lastModProp = getOne("LAST-MODIFIED");
    const parsedLastMod = lastModProp
      ? parseIcsDateTime(lastModProp.value, lastModProp.params, vtimezones)
      : null;

    events.push({
      uid,
      summary,
      triggerAt: parsedStart.epochMs,
      timed: parsedStart.timed,
      ...(parsedEnd ? { endAt: parsedEnd.epochMs } : {}),
      ...(location ? { location } : {}),
      ...(cleanNotes ? { notes: cleanNotes } : {}),
      recurrence,
      rruleRaw,
      externalInstance,
      ...(externalSequence !== undefined ? { externalSequence } : {}),
      ...(parsedLastMod ? { externalModified: parsedLastMod.epochMs } : {}),
    });
  };

  for (const line of lines) {
    const prop = parseIcsPropertyLine(line);
    if (!prop) continue;

    if (!inEvent) {
      if (prop.name === "BEGIN" && prop.value.toUpperCase() === "VEVENT") {
        inEvent = true;
        nestedDepth = 0;
        props = [];
      }
      continue;
    }

    if (prop.name === "BEGIN") {
      nestedDepth++;
      continue;
    }
    if (prop.name === "END") {
      if (nestedDepth > 0) {
        nestedDepth--;
        continue;
      }
      if (prop.value.toUpperCase() === "VEVENT") {
        finalizeEvent(props);
        inEvent = false;
        props = [];
      }
      continue;
    }

    if (nestedDepth === 0) {
      props.push(prop);
    }
  }

  return events;
}

/** Import parsed `.ics` text into accountDb.reminders with UID/RECURRENCE-ID deduplication. */
export async function importIcsEvents(
  raw: string,
  options: ImportIcsOptions = {}
): Promise<IcsImportResult> {
  await ensureAccountDbReady();
  const parsed = parseIcsEvents(raw);
  const res: IcsImportResult = {
    imported: 0,
    updated: 0,
    skippedDone: 0,
    skippedDuplicate: 0,
    skippedPast: 0,
    filesProcessed: 1,
    errors: [],
  };

  if (parsed.length === 0) return res;

  const existingRows = await accountDb.reminders.toArray();
  const byExternalKey = new Map<string, Reminder>();
  for (const r of existingRows) {
    if (r.externalUid) {
      byExternalKey.set(importedDoneKey(r.externalUid, r.externalInstance ?? null), r);
    }
  }

  const wsId = options.workspaceId ?? getActiveWorkspaceId();
  const folderId = options.folderId ?? null;
  const skipCutoff =
    options.skipPastBeforeMs !== undefined && options.skipPastBeforeMs !== null
      ? options.skipPastBeforeMs
      : null;

  const t = now();
  const toPut: Reminder[] = [];

  for (const ev of parsed) {
    if (hasImportedDone(ev.uid, ev.externalInstance)) {
      res.skippedDone++;
      continue;
    }

    if (skipCutoff !== null && !ev.recurrence && ev.triggerAt < skipCutoff) {
      res.skippedPast++;
      continue;
    }

    const key = importedDoneKey(ev.uid, ev.externalInstance);
    const existing = byExternalKey.get(key);
    const normalizedTrigger = ev.timed ? ev.triggerAt : startOfLocalDay(ev.triggerAt);

    if (existing) {
      const seqNewer = (ev.externalSequence ?? 0) > (existing.externalSequence ?? 0);
      const modNewer = (ev.externalModified ?? 0) > (existing.externalModified ?? 0);
      if (!seqNewer && !modNewer) {
        res.skippedDuplicate++;
        continue;
      }

      const timeChanged = normalizedTrigger !== existing.triggerAt || ev.timed !== existing.timed;
      const updatedReminder: Reminder = {
        ...existing,
        message: ev.summary,
        triggerAt: normalizedTrigger,
        timed: ev.timed,
        toneId: ev.timed ? existing.toneId ?? "default" : undefined,
        endAt: ev.endAt,
        location: ev.location,
        notes: ev.notes,
        recurrence: ev.recurrence,
        rruleRaw: ev.rruleRaw,
        externalSequence: ev.externalSequence,
        externalModified: ev.externalModified,
        ...(timeChanged ? { lastAlertedAt: null, status: "pending" as const } : {}),
        updatedAt: t,
        syncStatus: "pending",
      };
      toPut.push(updatedReminder);
      byExternalKey.set(key, updatedReminder);
      res.updated++;
      if (timeChanged) {
        emitReminderAlertResolved(existing.id);
      }
      continue;
    }

    const fresh: Reminder = {
      id: newId(),
      folderId,
      workspaceId: wsId,
      toneId: ev.timed ? "default" : undefined,
      linkedEntityType: null,
      linkedEntityId: null,
      message: ev.summary,
      triggerAt: normalizedTrigger,
      timed: ev.timed,
      status: "pending",
      ...(ev.endAt !== undefined ? { endAt: ev.endAt } : {}),
      ...(ev.location !== undefined ? { location: ev.location } : {}),
      ...(ev.notes !== undefined ? { notes: ev.notes } : {}),
      ...(ev.recurrence ? { recurrence: ev.recurrence, occurrencesDone: 0 } : {}),
      source: "ics",
      externalUid: ev.uid,
      externalInstance: ev.externalInstance,
      ...(ev.externalSequence !== undefined ? { externalSequence: ev.externalSequence } : {}),
      ...(ev.externalModified !== undefined ? { externalModified: ev.externalModified } : {}),
      rruleRaw: ev.rruleRaw,
      createdAt: t,
      updatedAt: t,
      syncStatus: "pending",
    };
    toPut.push(fresh);
    byExternalKey.set(key, fresh);
    res.imported++;
  }

  if (toPut.length > 0) {
    await accountDb.reminders.bulkPut(toPut);
    notifyLocalDataMutated();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("panga-data-updated"));
    }
  }

  return res;
}

/** Read and import one or more `.ics` or Google Calendar export `.zip` files. */
export async function importCalendarFiles(
  files: File[] | FileList,
  options: ImportIcsOptions = {}
): Promise<IcsImportResult> {
  const list = Array.from(files);
  const aggregate: IcsImportResult = {
    imported: 0,
    updated: 0,
    skippedDone: 0,
    skippedDuplicate: 0,
    skippedPast: 0,
    filesProcessed: 0,
    errors: [],
  };

  const merge = (r: IcsImportResult) => {
    aggregate.imported += r.imported;
    aggregate.updated += r.updated;
    aggregate.skippedDone += r.skippedDone;
    aggregate.skippedDuplicate += r.skippedDuplicate;
    aggregate.skippedPast += r.skippedPast;
    aggregate.filesProcessed += r.filesProcessed;
    aggregate.errors.push(...r.errors);
  };

  for (const file of list) {
    const lower = file.name.toLowerCase();
    try {
      if (lower.endsWith(".zip") || file.type.includes("zip")) {
        const buf = new Uint8Array(await file.arrayBuffer());
        const entries = unzipSync(buf);
        const icsKeys = Object.keys(entries).filter(
          (k) => !k.startsWith("__MACOSX/") && k.toLowerCase().endsWith(".ics")
        );
        if (icsKeys.length === 0) {
          aggregate.errors.push(`${file.name}: no .ics calendar files found inside archive.`);
          continue;
        }
        for (const k of icsKeys) {
          const text = strFromU8(entries[k]);
          merge(await importIcsEvents(text, options));
        }
      } else {
        const text = await file.text();
        merge(await importIcsEvents(text, options));
      }
    } catch (err: unknown) {
      aggregate.errors.push(
        `${file.name}: ${err instanceof Error ? err.message : "could not read calendar file"}`
      );
    }
  }

  return aggregate;
}
