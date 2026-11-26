// src/data/importEvents.ts
// Reads .ics and .zip calendar exports (via fflate), classifies events against
// existing accountDb reminders by externalUid, and imports selected events.

import { strFromU8, unzipSync } from "fflate";
import { accountDb, ensureAccountDbReady } from "./accountDb";
import { getAccountSetting, setAccountSetting } from "./accountSettings";
import type { Reminder } from "./db";
import { parseIcs, type ParsedIcsEvent, type UnreadableIcsEvent } from "./ics";
import {
  isTimedReminder,
  nextAfterComplete,
  startOfLocalDay,
  viewOf,
  type ReminderView,
} from "./recurrence";
import { newId, now } from "./utils";
import { getActiveWorkspaceId } from "./workspaceState";

export const ICS_IMPORTED_ONCE_KEY = "icsImportedOnce";

export type ImportCandidateStatus = "new" | "changed" | "duplicate";

export interface ImportCandidate {
  key: string;
  event: ParsedIcsEvent;
  status: ImportCandidateStatus;
  existingId?: string;
  isPast: boolean;
  fileName: string;
}

export interface ReadCalendarResult {
  events: Array<{ event: ParsedIcsEvent; fileName: string }>;
  unreadable: UnreadableIcsEvent[];
  cancelledCount: number;
}

export interface ImportApplyResult {
  added: number;
  updated: number;
  skipped: number;
  addedTimedCount: number;
  primaryView: ReminderView;
}

export function hasCompletedIcsImport(): boolean {
  return Boolean(getAccountSetting<boolean>(ICS_IMPORTED_ONCE_KEY));
}

export function markIcsImportCompleted(): void {
  setAccountSetting(ICS_IMPORTED_ONCE_KEY, true);
}

/**
 * For a repeating ICS event whose DTSTART is in the past, advance along its
 * fixed schedule to the first occurrence on or after today (preserving anchorAt).
 */
export function normalizeParsedEventOccurrence(
  ev: ParsedIcsEvent,
  nowMs = Date.now()
): ParsedIcsEvent {
  if (!ev.recurrence) return ev;
  const todayDay = startOfLocalDay(nowMs);
  if (startOfLocalDay(ev.triggerAt) >= todayDay) return ev;

  let probe: Reminder = {
    id: "probe",
    folderId: null,
    linkedEntityType: null,
    linkedEntityId: null,
    message: ev.summary,
    triggerAt: ev.triggerAt,
    timed: ev.timed,
    allDay: ev.allDay,
    recurrence: ev.recurrence,
    status: "pending",
    createdAt: nowMs,
    updatedAt: nowMs,
    syncStatus: "pending",
  };

  const duration = ev.endAt !== undefined ? Math.max(0, ev.endAt - ev.triggerAt) : undefined;
  const next = nextAfterComplete(probe, nowMs);
  if (!next) {
    // Series ended in the past — keep original triggerAt so it classifies as past.
    return ev;
  }

  return {
    ...ev,
    triggerAt: next.nextTriggerAt,
    ...(duration !== undefined ? { endAt: next.nextTriggerAt + duration } : {}),
    recurrence: {
      ...ev.recurrence,
      ...(next.remaining !== undefined && ev.recurrence.end?.type === "count"
        ? { end: { type: "count", remaining: next.remaining } }
        : {}),
    },
  };
}

export async function readCalendarFiles(
  files: File[],
  options: { signal?: AbortSignal } = {}
): Promise<ReadCalendarResult> {
  const events: Array<{ event: ParsedIcsEvent; fileName: string }> = [];
  const unreadable: UnreadableIcsEvent[] = [];
  let cancelledCount = 0;

  for (const file of files) {
    if (options.signal?.aborted) {
      throw new DOMException("Reading cancelled", "AbortError");
    }

    const lower = file.name.toLowerCase();
    const looksZip =
      lower.endsWith(".zip") ||
      file.type === "application/zip" ||
      file.type === "application/x-zip-compressed";

    if (looksZip) {
      try {
        const buf = new Uint8Array(await file.arrayBuffer());
        const entries = unzipSync(buf);
        const icsNames = Object.keys(entries).filter(
          (name) =>
            !name.startsWith("__MACOSX/") &&
            !name.endsWith("/") &&
            name.toLowerCase().endsWith(".ics")
        );
        if (icsNames.length === 0) {
          unreadable.push({
            fileName: file.name,
            reason: "Zip archive did not contain any .ics calendar files.",
          });
          continue;
        }
        for (const entryName of icsNames) {
          if (options.signal?.aborted) {
            throw new DOMException("Reading cancelled", "AbortError");
          }
          try {
            const text = strFromU8(entries[entryName]);
            const parsed = parseIcs(text, entryName);
            cancelledCount += parsed.cancelledCount;
            unreadable.push(...parsed.unreadable);
            for (const ev of parsed.events) {
              events.push({ event: ev, fileName: entryName });
            }
          } catch {
            unreadable.push({
              fileName: entryName,
              reason: "Could not decode calendar entry from zip.",
            });
          }
        }
      } catch (err) {
        if ((err as Error)?.name === "AbortError") throw err;
        unreadable.push({
          fileName: file.name,
          reason: "Could not read zip file (it may be damaged or not a zip archive).",
        });
      }
      continue;
    }

    if (!lower.endsWith(".ics") && file.type !== "text/calendar") {
      unreadable.push({
        fileName: file.name,
        reason: "Unsupported file type (choose .ics or .zip files).",
      });
      continue;
    }

    try {
      const text = await file.text();
      const parsed = parseIcs(text, file.name);
      cancelledCount += parsed.cancelledCount;
      unreadable.push(...parsed.unreadable);
      for (const ev of parsed.events) {
        events.push({ event: ev, fileName: file.name });
      }
    } catch (err) {
      if ((err as Error)?.name === "AbortError") throw err;
      unreadable.push({
        fileName: file.name,
        reason: "Could not read .ics file.",
      });
    }
  }

  return { events, unreadable, cancelledCount };
}

function isSameImportedEvent(existing: Reminder, ev: ParsedIcsEvent): boolean {
  if (existing.message !== ev.summary) return false;
  if ((existing.location ?? "") !== (ev.location ?? "")) return false;
  if ((existing.notes ?? "") !== (ev.notes ?? "")) return false;
  if (Boolean(existing.allDay) !== ev.allDay) return false;
  if (isTimedReminder(existing) !== ev.timed) return false;
  if ((existing.rrule ?? "") !== (ev.rrule ?? "")) return false;

  // For repeating events that share the same RRULE and details, keep user's
  // current occurrence date if they've already ticked earlier occurrences off.
  if (existing.recurrence && ev.recurrence) {
    return true;
  }

  return existing.triggerAt === ev.triggerAt && existing.endAt === ev.endAt;
}

export async function buildImportCandidates(
  rawEvents: Array<{ event: ParsedIcsEvent; fileName: string }>,
  nowMs = Date.now()
): Promise<ImportCandidate[]> {
  await ensureAccountDbReady();
  const existingRows = await accountDb.reminders.toArray();
  const byExternalUid = new Map<string, Reminder>();
  for (const r of existingRows) {
    if (r.externalUid) {
      byExternalUid.set(r.externalUid, r);
    }
  }

  const todayDay = startOfLocalDay(nowMs);
  const seenUids = new Set<string>();
  const candidates: ImportCandidate[] = [];

  for (let i = 0; i < rawEvents.length; i++) {
    const { event: rawEvent, fileName } = rawEvents[i];
    const event = normalizeParsedEventOccurrence(rawEvent, nowMs);
    // Dedupe within the same batch if multiple files contain the same UID
    if (seenUids.has(event.externalUid)) continue;
    seenUids.add(event.externalUid);

    const existing = byExternalUid.get(event.externalUid);
    let status: ImportCandidateStatus = "new";
    if (existing) {
      status = isSameImportedEvent(existing, event) ? "duplicate" : "changed";
    }

    const isPast = startOfLocalDay(event.triggerAt) < todayDay;

    candidates.push({
      key: `${event.externalUid}__${i}`,
      event,
      status,
      existingId: existing?.id,
      isPast,
      fileName,
    });
  }

  return candidates.sort((a, b) => a.event.triggerAt - b.event.triggerAt);
}

export async function applyEventImport(
  selected: ImportCandidate[],
  totalVisibleCount: number,
  onProgress?: (done: number, total: number) => void,
  nowMs = Date.now()
): Promise<ImportApplyResult> {
  await ensureAccountDbReady();
  const workspaceId = getActiveWorkspaceId();

  let added = 0;
  let updated = 0;
  let addedTimedCount = 0;
  let hasToday = false;
  let hasUpcoming = false;

  const total = selected.length;
  for (let i = 0; i < selected.length; i++) {
    const item = selected[i];
    const ev = item.event;
    const t = now();

    const v = viewOf({ triggerAt: ev.triggerAt }, nowMs);
    if (v === "today") hasToday = true;
    else if (v === "upcoming") hasUpcoming = true;

    if (item.status === "changed" && item.existingId) {
      await accountDb.reminders.update(item.existingId, {
        message: ev.summary,
        triggerAt: ev.triggerAt,
        timed: ev.timed,
        endAt: ev.endAt,
        allDay: ev.allDay,
        location: ev.location,
        notes: ev.notes,
        rrule: ev.rrule,
        recurrence: ev.recurrence,
        simplifiedRecurrence: ev.simplifiedRecurrence,
        source: "ics",
        externalUid: ev.externalUid,
        status: "pending",
        updatedAt: t,
        syncStatus: "pending",
      });
      updated++;
      if (ev.timed) addedTimedCount++;
    } else if (item.status === "new") {
      const reminder: Reminder = {
        id: newId(),
        folderId: null,
        workspaceId,
        linkedEntityType: null,
        linkedEntityId: null,
        message: ev.summary,
        triggerAt: ev.triggerAt,
        timed: ev.timed,
        ...(ev.endAt !== undefined ? { endAt: ev.endAt } : {}),
        allDay: ev.allDay,
        ...(ev.location ? { location: ev.location } : {}),
        ...(ev.notes ? { notes: ev.notes } : {}),
        source: "ics",
        externalUid: ev.externalUid,
        ...(ev.recurrence ? { recurrence: ev.recurrence } : {}),
        ...(ev.rrule ? { rrule: ev.rrule } : {}),
        ...(ev.simplifiedRecurrence ? { simplifiedRecurrence: true } : {}),
        status: "pending",
        createdAt: t,
        updatedAt: t,
        syncStatus: "pending",
      };
      await accountDb.reminders.add(reminder);
      added++;
      if (ev.timed) addedTimedCount++;
    }

    onProgress?.(i + 1, total);
  }

  if (added > 0 || updated > 0) {
    markIcsImportCompleted();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("panga-data-updated"));
    }
  }

  return {
    added,
    updated,
    skipped: Math.max(0, totalVisibleCount - added - updated),
    addedTimedCount,
    primaryView: hasToday ? "today" : hasUpcoming ? "upcoming" : "overdue",
  };
}
