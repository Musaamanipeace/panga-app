import "fake-indexeddb/auto";
import { zipSync, strToU8 } from "fflate";
import { beforeEach, describe, expect, it } from "vitest";
import { resetGuestSession } from "../../auth/session";
import { accountDb, ensureAccountDbReady } from "../accountDb";
import { completeReminder } from "../reminders";
import {
  importCalendarFiles,
  importIcsEvents,
  parseIcsEvents,
  unescapeIcsText,
  unfoldIcsLines,
} from "../icsImport";

describe("RFC 5545 .ics parser & .zip multi-calendar importer", () => {
  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await resetGuestSession();
    await ensureAccountDbReady();
    await accountDb.reminders.clear();
  });

  it("unfolds CRLF/LF space- and tab-folded lines and unescapes RFC 5545 text", () => {
    const raw =
      "BEGIN:VEVENT\r\nSUMMARY:Team sync with \r\n Alice\\, Bob\r\n\t & Carol\r\nDESCRIPTION:Agenda:\\n1\\; Review PR\\n2\\\\Check logs\r\nEND:VEVENT";
    const lines = unfoldIcsLines(raw);
    expect(lines).toEqual([
      "BEGIN:VEVENT",
      "SUMMARY:Team sync with Alice\\, Bob & Carol",
      "DESCRIPTION:Agenda:\\n1\\; Review PR\\n2\\\\Check logs",
      "END:VEVENT",
    ]);
    expect(unescapeIcsText("Alice\\, Bob\\; \\nNext\\\\Path")).toBe("Alice, Bob; \nNext\\Path");
  });

  it("parses all-day DATE, UTC Z, TZID, RRULE/BYDAY/EXDATE, RECURRENCE-ID and skips CANCELLED events", () => {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      "UID:allday-1",
      "DTSTART;VALUE=DATE:20261201",
      "SUMMARY:Project Launch Day",
      "END:VEVENT",
      "BEGIN:VEVENT",
      "UID:timed-utc-2",
      "DTSTART:20261202T153000Z",
      "DTEND:20261202T163000Z",
      "LOCATION:Room 4B",
      "URL:https://meet.example.com/sync",
      "SUMMARY:Weekly Review",
      "RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE;COUNT=6",
      "EXDATE:20261207T153000Z",
      "BEGIN:VALARM",
      "TRIGGER:-PT15M",
      "SUMMARY:Ignore VALARM",
      "END:VALARM",
      "END:VEVENT",
      "BEGIN:VEVENT",
      "UID:tzid-3",
      "DTSTART;TZID=America/New_York:20261203T090000",
      "RECURRENCE-ID:20261203T090000Z",
      "SEQUENCE:2",
      "SUMMARY:NYC Morning Standup",
      "END:VEVENT",
      "BEGIN:VEVENT",
      "UID:cancelled-4",
      "DTSTART:20261204T100000Z",
      "STATUS:CANCELLED",
      "SUMMARY:Should not appear",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const parsed = parseIcsEvents(ics);
    expect(parsed).toHaveLength(3);

    const allDay = parsed.find((e) => e.uid === "allday-1")!;
    expect(allDay.timed).toBe(false);
    expect(allDay.triggerAt).toBe(new Date(2026, 11, 1, 0, 0, 0, 0).getTime());

    const weekly = parsed.find((e) => e.uid === "timed-utc-2")!;
    expect(weekly.timed).toBe(true);
    expect(weekly.summary).toBe("Weekly Review");
    expect(weekly.location).toBe("Room 4B");
    expect(weekly.notes).toContain("https://meet.example.com/sync");
    expect(weekly.recurrence?.freq).toBe("weekly");
    expect(weekly.recurrence?.byWeekday).toEqual([1, 3]);
    expect(weekly.recurrence?.count).toBe(6);
    expect(weekly.recurrence?.exdates).toHaveLength(1);

    const nyc = parsed.find((e) => e.uid === "tzid-3")!;
    expect(nyc.timed).toBe(true);
    expect(nyc.externalInstance).toBe("20261203T090000Z");
    expect(nyc.externalSequence).toBe(2);
    expect(nyc.triggerAt).toBe(Date.UTC(2026, 11, 3, 14, 0, 0, 0));
  });

  it("deduplicates by externalUid, updates on higher SEQUENCE, and respects importedDone on re-import", async () => {
    const icsV1 = [
      "BEGIN:VCALENDAR",
      "BEGIN:VEVENT",
      "UID:evt-100",
      "SEQUENCE:1",
      "DTSTART:20261210T100000Z",
      "SUMMARY:Dentist",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const first = await importIcsEvents(icsV1);
    expect(first.imported).toBe(1);

    const dup = await importIcsEvents(icsV1);
    expect(dup.imported).toBe(0);
    expect(dup.skippedDuplicate).toBe(1);

    const icsV2 = icsV1.replace("SEQUENCE:1", "SEQUENCE:2").replace("SUMMARY:Dentist", "SUMMARY:Dentist Rescheduled");
    const upd = await importIcsEvents(icsV2);
    expect(upd.updated).toBe(1);

    const rows = await accountDb.reminders.toArray();
    expect(rows).toHaveLength(1);
    expect(rows[0].message).toBe("Dentist Rescheduled");

    // Tick it off -> marks UID in importedDone so re-importing the same ICS does not resurrect it
    await completeReminder(rows[0].id);
    const reimport = await importIcsEvents(icsV2);
    expect(reimport.skippedDone).toBe(1);
    expect(await accountDb.reminders.count()).toBe(0);
  });

  it("extracts and imports multiple .ics files from a Google Calendar export .zip via fflate", async () => {
    const calA = "BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nUID:zip-a\r\nDTSTART:20261215T080000Z\r\nSUMMARY:Personal flight\r\nEND:VEVENT\r\nEND:VCALENDAR";
    const calB = "BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nUID:zip-b\r\nDTSTART;VALUE=DATE:20261216\r\nSUMMARY:Holiday\r\nEND:VEVENT\r\nEND:VCALENDAR";

    const zipped = zipSync({
      "primary.ics": strToU8(calA),
      "holidays/us.ics": strToU8(calB),
      "__MACOSX/._primary.ics": strToU8("ignored"),
      "readme.txt": strToU8("ignored"),
    });

    const fakeZipFile = {
      name: "calendar-export.zip",
      type: "application/zip",
      arrayBuffer: async () => zipped.buffer.slice(zipped.byteOffset, zipped.byteOffset + zipped.byteLength),
    } as unknown as File;

    const result = await importCalendarFiles([fakeZipFile]);
    expect(result.filesProcessed).toBe(2);
    expect(result.imported).toBe(2);
    expect(result.errors).toHaveLength(0);

    const all = await accountDb.reminders.toArray();
    expect(all.map((r) => r.message).sort()).toEqual(["Holiday", "Personal flight"]);
  });
});
