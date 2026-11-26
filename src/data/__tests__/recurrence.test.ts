import { describe, expect, it } from "vitest";
import type { Reminder } from "../db";
import {
  formatOverdueMeta,
  formatRecurrence,
  nextAfterComplete,
  sortTodayReminders,
  viewOf,
} from "../recurrence";

function makeReminder(overrides: Partial<Reminder> = {}): Reminder {
  const ts = new Date(2026, 10, 25, 9, 0, 0, 0).getTime(); // Wed 25 Nov 2026 09:00 local
  return {
    id: "rem-1",
    folderId: null,
    linkedEntityType: null,
    linkedEntityId: null,
    message: "Test reminder",
    triggerAt: ts,
    timed: false,
    status: "pending",
    createdAt: ts,
    updatedAt: ts,
    syncStatus: "pending",
    ...overrides,
  };
}

describe("recurrence & reminder views", () => {
  it("classifies overdue, today (including earlier timed), and upcoming in local time", () => {
    const nowMs = new Date(2026, 10, 25, 14, 0, 0, 0).getTime(); // 25 Nov 14:00
    const yesterday = new Date(2026, 10, 24, 23, 0, 0, 0).getTime();
    const earlierToday = new Date(2026, 10, 25, 8, 30, 0, 0).getTime();
    const laterToday = new Date(2026, 10, 25, 19, 0, 0, 0).getTime();
    const tomorrow = new Date(2026, 10, 26, 8, 0, 0, 0).getTime();

    expect(viewOf({ triggerAt: yesterday }, nowMs)).toBe("overdue");
    expect(viewOf({ triggerAt: earlierToday }, nowMs)).toBe("today");
    expect(viewOf({ triggerAt: laterToday }, nowMs)).toBe("today");
    expect(viewOf({ triggerAt: tomorrow }, nowMs)).toBe("upcoming");
  });

  it("sorts Today with timed reminders first ordered by time, then plain reminders", () => {
    const plainEarly = makeReminder({
      id: "p1",
      timed: false,
      triggerAt: new Date(2026, 10, 25, 9, 0, 0, 0).getTime(),
      createdAt: 10,
    });
    const timedLate = makeReminder({
      id: "t2",
      timed: true,
      triggerAt: new Date(2026, 10, 25, 15, 0, 0, 0).getTime(),
      createdAt: 20,
    });
    const timedEarly = makeReminder({
      id: "t1",
      timed: true,
      triggerAt: new Date(2026, 10, 25, 8, 0, 0, 0).getTime(),
      createdAt: 30,
    });

    const sorted = sortTodayReminders([plainEarly, timedLate, timedEarly]);
    expect(sorted.map((r) => r.id)).toEqual(["t1", "t2", "p1"]);
  });

  it("advances daily, every 2 days, and every 3 days preserving fixed schedule rhythm", () => {
    const anchor = new Date(2026, 10, 20, 8, 30, 0, 0).getTime(); // Nov 20 08:30
    const nowNov25 = new Date(2026, 10, 25, 10, 0, 0, 0).getTime(); // Nov 25

    // Anchor Nov 20, every 2 days -> Nov 20, Nov 22, Nov 24, Nov 26...
    const every2 = makeReminder({
      triggerAt: anchor,
      timed: true,
      recurrence: { interval: 2, unit: "day", anchorAt: anchor },
    });
    const next2 = nextAfterComplete(every2, nowNov25);
    expect(next2).not.toBeNull();
    const d2 = new Date(next2!.nextTriggerAt);
    expect([d2.getFullYear(), d2.getMonth(), d2.getDate(), d2.getHours(), d2.getMinutes()]).toEqual([
      2026, 10, 26, 8, 30,
    ]);

    // Anchor Nov 20, every 3 days -> Nov 20, Nov 23, Nov 26...
    const every3 = makeReminder({
      triggerAt: new Date(2026, 10, 23, 9, 0, 0, 0).getTime(),
      recurrence: { interval: 3, unit: "day", anchorAt: anchor },
    });
    const next3 = nextAfterComplete(every3, nowNov25);
    const d3 = new Date(next3!.nextTriggerAt);
    expect([d3.getFullYear(), d3.getMonth(), d3.getDate()]).toEqual([2026, 10, 26]);
  });

  it("advances weekly with weekday chips on fixed schedule", () => {
    // Mon 23 Nov 2026, repeats Mon & Wed every week
    const mon = new Date(2026, 10, 23, 9, 0, 0, 0).getTime();
    const rec = makeReminder({
      triggerAt: mon,
      recurrence: { interval: 1, unit: "week", weekdays: [1, 3], anchorAt: mon },
    });
    const next1 = nextAfterComplete(rec, mon);
    const d1 = new Date(next1!.nextTriggerAt);
    expect([d1.getFullYear(), d1.getMonth(), d1.getDate()]).toEqual([2026, 10, 25]); // Wed Nov 25

    const next2 = nextAfterComplete({ ...rec, triggerAt: next1!.nextTriggerAt }, next1!.nextTriggerAt);
    const d2 = new Date(next2!.nextTriggerAt);
    expect([d2.getFullYear(), d2.getMonth(), d2.getDate()]).toEqual([2026, 10, 30]); // Mon Nov 30
  });

  it("clamps monthly anchor day (Jan 31 -> Feb 28 -> Mar 31) and handles count/until end", () => {
    const jan31 = new Date(2026, 0, 31, 9, 0, 0, 0).getTime();
    const monthly = makeReminder({
      triggerAt: jan31,
      recurrence: { interval: 1, unit: "month", anchorAt: jan31 },
    });

    const feb = nextAfterComplete(monthly, jan31);
    const dfeb = new Date(feb!.nextTriggerAt);
    expect([dfeb.getFullYear(), dfeb.getMonth(), dfeb.getDate()]).toEqual([2026, 1, 28]);

    const mar = nextAfterComplete({ ...monthly, triggerAt: feb!.nextTriggerAt }, feb!.nextTriggerAt);
    const dmar = new Date(mar!.nextTriggerAt);
    expect([dmar.getFullYear(), dmar.getMonth(), dmar.getDate()]).toEqual([2026, 2, 31]);

    // Count end
    const countOne = makeReminder({
      triggerAt: jan31,
      recurrence: { interval: 1, unit: "day", anchorAt: jan31, end: { type: "count", remaining: 1 } },
    });
    expect(nextAfterComplete(countOne, jan31)).toBeNull();

    // Until end
    const untilPast = makeReminder({
      triggerAt: jan31,
      recurrence: { interval: 1, unit: "day", anchorAt: jan31, end: { type: "until", untilAt: jan31 } },
    });
    expect(nextAfterComplete(untilPast, jan31)).toBeNull();
  });

  it("formats recurrence labels and overdue meta in plain text", () => {
    const anchor = Date.now();
    expect(formatRecurrence({ interval: 1, unit: "day", anchorAt: anchor })).toBe("Repeats every day");
    expect(formatRecurrence({ interval: 2, unit: "day", anchorAt: anchor })).toBe("Repeats every 2 days");
    expect(formatRecurrence({ interval: 1, unit: "week", weekdays: [1, 3], anchorAt: anchor })).toBe(
      "Repeats weekly on Mon, Wed"
    );

    const nowMs = new Date(2026, 10, 26, 12, 0, 0, 0).getTime();
    const twoDaysAgo = new Date(2026, 10, 24, 9, 0, 0, 0).getTime();
    expect(formatOverdueMeta(twoDaysAgo, nowMs)).toMatch(/^Due .+, 2 days ago$/);
  });
});
