// src/data/calendar.ts
import { db, type CalendarEvent, type CalendarEventSource } from "./db";
import { newId, now } from "./utils";
import { syncPushRecord, syncDeleteRecord } from "../sync/sync";

export type { CalendarEvent, CalendarEventSource };

export async function listCalendarEvents(projectId?: string | null): Promise<CalendarEvent[]> {
  if (projectId) {
    return db.calendarEvents
      .where("projectId")
      .equals(projectId)
      .reverse()
      .sortBy("startAt");
  }
  return db.calendarEvents.orderBy("startAt").reverse().toArray();
}

export async function listAllCalendarEvents(): Promise<CalendarEvent[]> {
  return db.calendarEvents.orderBy("startAt").reverse().toArray();
}

export async function listUpcomingEvents(since: number, projectId?: string | null): Promise<CalendarEvent[]> {
  let query = db.calendarEvents.where("startAt").aboveOrEqual(since);
  if (projectId) query = query.and((e) => e.projectId === projectId);
  return query.sortBy("startAt");
}

export async function getCalendarEvent(id: string): Promise<CalendarEvent | undefined> {
  return db.calendarEvents.get(id);
}

export async function createLocalEvent(input: {
  projectId?: string | null;
  title: string;
  description?: string;
  startAt: number;
  endAt: number;
  hangoutLink?: string | null;
}): Promise<CalendarEvent> {
  const t = now();
  const event: CalendarEvent = {
    id: newId(),
    projectId: input.projectId ?? null,
    title: input.title,
    description: input.description ?? null,
    startAt: input.startAt,
    endAt: input.endAt,
    source: "local",
    hangoutLink: input.hangoutLink ?? null,
    syncedAt: null,
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.calendarEvents.add(event);
  void syncPushRecord("calendar_events", event);
  return event;
}

/** True for events that came from a calendar file rather than being added here. */
export function isImportedEvent(event: { source?: string }): boolean {
  // Events imported by older builds still carry the legacy "google" source.
  return event.source !== "local";
}

export async function importCalendarEvents(events: CalendarEventLike[]): Promise<number> {
  const local: CalendarEvent[] = [];
  for (const e of events) {
    const startAt = e.start?.dateTime
      ? new Date(e.start.dateTime).getTime()
      : e.start?.date
        ? new Date(e.start.date).getTime()
        : 0;
    const endAt = e.end?.dateTime
      ? new Date(e.end.dateTime).getTime()
      : e.end?.date
        ? new Date(e.end.date).getTime()
        : 0;
    local.push({
      id: `imported_${e.id}`,
      projectId: null,
      title: e.summary ?? "(no title)",
      description: e.description ?? null,
      startAt,
      endAt,
      source: "imported",
      hangoutLink: e.hangoutLink ?? null,
      syncedAt: Date.now(),
      createdAt: now(),
      updatedAt: now(),
      syncStatus: "pending",
    });
  }
  await db.calendarEvents.bulkPut(local);
  for (const ev of local) {
    void syncPushRecord("calendar_events", ev);
  }
  return local.length;
}

export async function updateCalendarEvent(
  id: string,
  changes: Partial<Pick<CalendarEvent, "title" | "description" | "startAt" | "endAt" | "hangoutLink">>
): Promise<void> {
  await db.calendarEvents.update(id, { ...changes, updatedAt: now(), syncStatus: "pending" });
  const updated = await db.calendarEvents.get(id);
  if (updated) void syncPushRecord("calendar_events", updated);
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  await db.calendarEvents.delete(id);
  void syncDeleteRecord("calendar_events", id);
}

export async function deleteEventsForProject(projectId: string): Promise<void> {
  const rows = await db.calendarEvents.where("projectId").equals(projectId).toArray();
  await db.calendarEvents.where("projectId").equals(projectId).delete();
  for (const row of rows) {
    void syncDeleteRecord("calendar_events", row.id);
  }
}

export async function pruneMissingImportedEvents(seenIds: Set<string>): Promise<void> {
  const imported = (await db.calendarEvents.toArray()).filter(isImportedEvent);
  const toDelete = imported.filter((e) => !seenIds.has(e.id)).map((e) => e.id);
  if (toDelete.length) {
    await db.calendarEvents.bulkDelete(toDelete);
    for (const id of toDelete) {
      void syncDeleteRecord("calendar_events", id);
    }
  }
}

export interface CalendarEventLike {
  id: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  hangoutLink?: string;
  htmlLink?: string;
}

export async function getCalendarAlertEvents(): Promise<CalendarEvent[]> {
  const nowMs = Date.now();
  return db.calendarEvents
    .where("startAt")
    .below(nowMs)
    .and((e) => e.source === "local")
    .sortBy("startAt");
}

export async function getEventsBetween(
  start: number,
  end: number,
  projectId?: string | null
): Promise<CalendarEvent[]> {
  let query = db.calendarEvents.where("startAt").between(start, end);
  if (projectId) query = query.and((e) => e.projectId === projectId);
  return query.sortBy("startAt");
}
