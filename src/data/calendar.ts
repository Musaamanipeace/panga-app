// src/data/calendar.ts
import { db, type CalendarEvent } from "./db";
import { newId, now } from "./utils";

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
  };
  await db.calendarEvents.add(event);
  return event;
}

export async function importGoogleEvents(events: GoogleCalendarEventLike[]): Promise<number> {
  const local: CalendarEvent[] = [];
  for (const e of events) {
    const startAt = e.start?.dateTime ?? (e.start?.date ? new Date(e.start.date).getTime() : 0);
    const endAt = e.end?.dateTime ?? (e.end?.date ? new Date(e.end.date).getTime() : 0);
    local.push({
      id: `google_${e.id}`,
      projectId: null,
      title: e.summary ?? "(no title)",
      description: e.description ?? null,
      startAt,
      endAt,
      source: "google",
      hangoutLink: e.hangoutLink ?? null,
      syncedAt: Date.now(),
      createdAt: now(),
      updatedAt: now(),
    });
  }
  await db.calendarEvents.bulkPut(local);
  return local.length;
}

export async function updateCalendarEvent(id: string, changes: Partial<Pick<CalendarEvent, "title" | "description" | "startAt" | "endAt" | "hangoutLink">>): Promise<void> {
  await db.calendarEvents.update(id, { ...changes, updatedAt: now() });
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  await db.calendarEvents.delete(id);
}

export async function deleteEventsForProject(projectId: string): Promise<void> {
  await db.calendarEvents.where("projectId").equals(projectId).delete();
}

export interface GoogleCalendarEventLike {
  id: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  hangoutLink?: string;
  htmlLink?: string;
}

export async function getCalendarAlertEvents(): Promise<CalendarEvent[]> {
  const now = Date.now();
  return db.calendarEvents.where("startAt").below(now).and((e) => e.source === "local").sortBy("startAt");
}

export async function getEventsBetween(start: number, end: number, projectId?: string | null): Promise<CalendarEvent[]> {
  let query = db.calendarEvents.where("startAt").between(start, end);
  if (projectId) query = query.and((e) => e.projectId === projectId);
  return query.sortBy("startAt");
}
