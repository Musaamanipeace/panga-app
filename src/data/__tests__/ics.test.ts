import { describe, expect, it } from "vitest";
import { parseIcs } from "../ics";

const GOOGLE_SAMPLE_ICS = [
  "BEGIN:VCALENDAR",
  "PRODID:-//Google Inc//Google Calendar 70.9054//EN",
  "VERSION:2.0",
  "BEGIN:VTIMEZONE",
  "TZID:America/New_York",
  "BEGIN:STANDARD",
  "DTSTART:19701101T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
  "TZOFFSETFROM:-0400",
  "TZOFFSETTO:-0500",
  "END:STANDARD",
  "END:VTIMEZONE",
  "BEGIN:VEVENT",
  "UID:evt-tzid-1@google.com",
  "DTSTART;TZID=America/New_York:20261201T090000",
  "DTEND;TZID=America/New_York:20261201T100000",
  "SUMMARY:Team\\, sync",
  "LOCATION:Room 4\\; Floor 2",
  "DESCRIPTION:Line one\\nLine two",
  "RRULE:FREQ=WEEKLY;BYDAY=MO,WE",
  "BEGIN:VALARM",
  "ACTION:DISPLAY",
  "DESCRIPTION:This is an alarm description that must not overwrite event notes",
  "TRIGGER:-PT10M",
  "END:VALARM",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "UID:evt-allday-2@google.com",
  "DTSTART;VALUE=DATE:20261205",
  "DTEND;VALUE=DATE:20261206",
  "SUMMARY:Holiday",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "UID:evt-utc-3@google.com",
  "DTSTART:20261210T153000Z",
  "SUMMARY:Folded very ",
  " long summary line",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "UID:evt-cancelled-4@google.com",
  "DTSTART:20261211T100000Z",
  "SUMMARY:Cancelled meeting",
  "STATUS:CANCELLED",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "UID:evt-complex-rrule-5@google.com",
  "DTSTART:20261215T120000Z",
  "SUMMARY:Second Tuesday",
  "RRULE:FREQ=MONTHLY;BYDAY=2TU",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "UID:evt-unknown-tz-6@google.com",
  "DTSTART;TZID=Mars/Olympus_Mons:20261218T080000",
  "SUMMARY:Unknown TZ",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "UID:evt-bad-7@google.com",
  "SUMMARY:No start date",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "UID:evt-tzid-1@google.com",
  "RECURRENCE-ID:20261207T140000Z",
  "DTSTART:20261207T150000Z",
  "SUMMARY:Team sync (moved)",
  "END:VEVENT",
  "END:VCALENDAR",
].join("\r\n");

describe("pure .ics parser", () => {
  it("parses Google-style VEVENTs with TZID, all-day, UTC, line unfolding, escaping, RRULE, and cancelled skipping", () => {
    const res = parseIcs(GOOGLE_SAMPLE_ICS, "personal.ics");

    expect(res.cancelledCount).toBe(1);
    expect(res.unreadable).toEqual([
      { fileName: "personal.ics", title: "No start date", reason: "Missing start date or time." },
    ]);
    expect(res.events).toHaveLength(6);

    // 1. TZID + escaped text + VALARM isolation + weekly RRULE
    const tzEvent = res.events[0];
    expect(tzEvent.externalUid).toBe("evt-tzid-1@google.com");
    expect(tzEvent.summary).toBe("Team, sync");
    expect(tzEvent.location).toBe("Room 4; Floor 2");
    expect(tzEvent.notes).toBe("Line one\nLine two");
    expect(tzEvent.timed).toBe(true);
    expect(tzEvent.allDay).toBe(false);
    // 2026-12-01 09:00 America/New_York (EST, UTC-5) = 14:00Z
    expect(tzEvent.triggerAt).toBe(Date.UTC(2026, 11, 1, 14, 0, 0));
    expect(tzEvent.endAt).toBe(Date.UTC(2026, 11, 1, 15, 0, 0));
    expect(tzEvent.simplifiedRecurrence).toBe(false);
    expect(tzEvent.recurrence?.unit).toBe("week");
    expect(tzEvent.recurrence?.weekdays).toEqual([1, 3]);

    // 2. All-day -> plain reminder
    const allDay = res.events[1];
    expect(allDay.allDay).toBe(true);
    expect(allDay.timed).toBe(false);
    const adDate = new Date(allDay.triggerAt);
    expect([adDate.getFullYear(), adDate.getMonth(), adDate.getDate()]).toEqual([2026, 11, 5]);

    // 3. UTC + unfolded line
    const utcEv = res.events[2];
    expect(utcEv.summary).toBe("Folded very long summary line");
    expect(utcEv.triggerAt).toBe(Date.UTC(2026, 11, 10, 15, 30, 0));

    // 4. Complex RRULE -> simplifiedRecurrence flag
    const complexEv = res.events[3];
    expect(complexEv.simplifiedRecurrence).toBe(true);
    expect(complexEv.recurrence).toBeUndefined();

    // 5. Unknown TZID -> unknownTimeZone flag
    const unknownTzEv = res.events[4];
    expect(unknownTzEv.unknownTimeZone).toBe(true);

    // 6. RECURRENCE-ID appended to externalUid
    const recOverride = res.events[5];
    expect(recOverride.externalUid).toBe("evt-tzid-1@google.com#20261207T140000Z");
  });
});
