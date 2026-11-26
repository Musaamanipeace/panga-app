import { describe, expect, it, vi } from "vitest";
import {
  describeRecurrence,
  nextAfterComplete,
  nextOccurrence,
  occurrencesBetween,
} from "../recurrence";
import type { ReminderRecurrence } from "../db";

describe("recurrence engine", () => {
  it("computes daily and every-3-days occurrences", () => {
    const start = new Date(2026, 10, 1, 9, 0, 0, 0).getTime();
    const daily: ReminderRecurrence = { freq: "daily", interval: 1, anchorAt: start };
    expect(nextOccurrence(daily, start, start)).toBe(
      new Date(2026, 10, 2, 9, 0, 0, 0).getTime()
    );

    const every3: ReminderRecurrence = { freq: "daily", interval: 3, anchorAt: start };
    expect(nextOccurrence(every3, start, start)).toBe(
      new Date(2026, 10, 4, 9, 0, 0, 0).getTime()
    );
    expect(
      nextOccurrence(every3, start, new Date(2026, 10, 4, 9, 0, 0, 0).getTime())
    ).toBe(new Date(2026, 10, 7, 9, 0, 0, 0).getTime());
  });

  it("computes weekly single-day and bi-weekly Mon/Wed/Fri occurrences", () => {
    // 2026-11-02 is Monday
    const mon = new Date(2026, 10, 2, 8, 30, 0, 0).getTime();
    const single: ReminderRecurrence = {
      freq: "weekly",
      interval: 1,
      anchorAt: mon,
      byWeekday: [1],
    };
    expect(nextOccurrence(single, mon, mon)).toBe(
      new Date(2026, 10, 9, 8, 30, 0, 0).getTime()
    );

    const mwfBiweekly: ReminderRecurrence = {
      freq: "weekly",
      interval: 2,
      anchorAt: mon,
      byWeekday: [1, 3, 5],
    };
    const occs = occurrencesBetween(
      mwfBiweekly,
      mon,
      mon,
      new Date(2026, 10, 25, 23, 59, 0, 0).getTime()
    );
    expect(occs.map((ts) => new Date(ts).toDateString())).toEqual([
      new Date(2026, 10, 2, 8, 30).toDateString(),
      new Date(2026, 10, 4, 8, 30).toDateString(),
      new Date(2026, 10, 6, 8, 30).toDateString(),
      new Date(2026, 10, 16, 8, 30).toDateString(),
      new Date(2026, 10, 18, 8, 30).toDateString(),
      new Date(2026, 10, 20, 8, 30).toDateString(),
    ]);
  });

  it("skips short months on monthly day 31 (does not clamp)", () => {
    const jan31 = new Date(2026, 0, 31, 10, 0, 0, 0).getTime();
    const rec: ReminderRecurrence = {
      freq: "monthly",
      interval: 1,
      anchorAt: jan31,
      byMonthDay: 31,
    };
    const afterJan = nextOccurrence(rec, jan31, jan31);
    expect(afterJan).toBe(new Date(2026, 2, 31, 10, 0, 0, 0).getTime()); // March 31, skipped Feb

    const afterMar = nextOccurrence(rec, jan31, afterJan!);
    expect(afterMar).toBe(new Date(2026, 4, 31, 10, 0, 0, 0).getTime()); // May 31, skipped Apr
  });

  it("fires yearly Feb 29 only on leap years", () => {
    const leap = new Date(2024, 1, 29, 12, 0, 0, 0).getTime();
    const rec: ReminderRecurrence = { freq: "yearly", interval: 1, anchorAt: leap };
    expect(nextOccurrence(rec, leap, leap)).toBe(
      new Date(2028, 1, 29, 12, 0, 0, 0).getTime()
    );
  });

  it("respects count exhaustion including skipped exdates", () => {
    const start = new Date(2026, 10, 1, 9, 0, 0, 0).getTime();
    const day2 = new Date(2026, 10, 2, 9, 0, 0, 0).getTime();
    const day3 = new Date(2026, 10, 3, 9, 0, 0, 0).getTime();
    const rec: ReminderRecurrence = {
      freq: "daily",
      interval: 1,
      anchorAt: start,
      count: 3, // Nov 1 (#1), Nov 2 (#2 skipped by exdate), Nov 3 (#3)
      exdates: [day2],
    };
    expect(nextOccurrence(rec, start, start - 1)).toBe(start);
    expect(nextOccurrence(rec, start, start)).toBe(day3);
    expect(nextOccurrence(rec, start, day3)).toBeNull();
  });

  it("respects inclusive until boundary", () => {
    const start = new Date(2026, 10, 1, 9, 0, 0, 0).getTime();
    const day3 = new Date(2026, 10, 3, 9, 0, 0, 0).getTime();
    const rec: ReminderRecurrence = {
      freq: "daily",
      interval: 1,
      anchorAt: start,
      until: day3,
    };
    expect(
      nextOccurrence(rec, start, new Date(2026, 10, 2, 9, 0, 0, 0).getTime())
    ).toBe(day3);
    expect(nextOccurrence(rec, start, day3)).toBeNull();
  });

  it("preserves wall-clock time across Europe/London DST transitions", () => {
    // 2026-03-28 09:00 GMT -> 2026-03-29 09:00 BST (08:00 UTC)
    const springEve = Date.UTC(2026, 2, 28, 9, 0, 0, 0);
    const recSpring: ReminderRecurrence = { freq: "daily", interval: 1, anchorAt: springEve };
    const springDay = nextOccurrence(recSpring, springEve, springEve, {
      timeZone: "Europe/London",
    });
    expect(springDay).toBe(Date.UTC(2026, 2, 29, 8, 0, 0, 0));

    // 2026-10-24 09:00 BST (08:00 UTC) -> 2026-10-25 09:00 GMT (09:00 UTC)
    const autumnEve = Date.UTC(2026, 9, 24, 8, 0, 0, 0);
    const recAutumn: ReminderRecurrence = { freq: "daily", interval: 1, anchorAt: autumnEve };
    const autumnDay = nextOccurrence(recAutumn, autumnEve, autumnEve, {
      timeZone: "Europe/London",
    });
    expect(autumnDay).toBe(Date.UTC(2026, 9, 25, 9, 0, 0, 0));
  });

  it("handles `after` far in the future quickly without hitting iteration limits", () => {
    const start = Date.UTC(2020, 0, 1, 9, 0, 0, 0);
    const farAfter = Date.UTC(2060, 5, 15, 8, 0, 0, 0);
    const rec: ReminderRecurrence = { freq: "daily", interval: 1, anchorAt: start };
    const next = nextOccurrence(rec, start, farAfter, { timeZone: "UTC" });
    expect(next).toBe(Date.UTC(2060, 5, 15, 9, 0, 0, 0));
  });

  it("caps pathological iteration counts cleanly and returns null", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const start = Date.UTC(2020, 0, 1, 9, 0, 0, 0);
    const rec: ReminderRecurrence = {
      freq: "daily",
      interval: 1,
      anchorAt: start,
      count: 25_000,
    };
    const next = nextOccurrence(rec, start, Date.UTC(2060, 0, 1, 0, 0, 0, 0), {
      timeZone: "UTC",
    });
    expect(next).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it("describes recurrence patterns in plain English", () => {
    expect(describeRecurrence({ freq: "daily", interval: 1, anchorAt: 0 })).toBe(
      "Repeats every day"
    );
    expect(describeRecurrence({ freq: "daily", interval: 2, anchorAt: 0 })).toBe(
      "Repeats every 2 days"
    );
    expect(
      describeRecurrence({ freq: "weekly", interval: 1, anchorAt: 0, byWeekday: [3, 1] })
    ).toBe("Repeats weekly on Mon, Wed");
    expect(describeRecurrence({ freq: "monthly", interval: 1, anchorAt: 0 })).toBe(
      "Repeats monthly"
    );
    expect(describeRecurrence({ freq: "yearly", interval: 2, anchorAt: 0 })).toBe(
      "Repeats every 2 years"
    );
  });

  describe("nextAfterComplete (D7 fixed schedule)", () => {
    it("moves a daily reminder missed for 3 days to today", () => {
      const nov1 = new Date(2026, 10, 1, 9, 0, 0, 0).getTime();
      const nov4afternoon = new Date(2026, 10, 4, 14, 0, 0, 0).getTime();
      const rec: ReminderRecurrence = { freq: "daily", interval: 1, anchorAt: nov1 };
      expect(nextAfterComplete(rec, nov1, nov4afternoon)).toBe(
        new Date(2026, 10, 4, 9, 0, 0, 0).getTime()
      );
    });

    it("moves today's daily occurrence to tomorrow", () => {
      const nov4 = new Date(2026, 10, 4, 9, 0, 0, 0).getTime();
      const nov4afternoon = new Date(2026, 10, 4, 14, 0, 0, 0).getTime();
      const rec: ReminderRecurrence = { freq: "daily", interval: 1, anchorAt: nov4 };
      expect(nextAfterComplete(rec, nov4, nov4afternoon)).toBe(
        new Date(2026, 10, 5, 9, 0, 0, 0).getTime()
      );
    });

    it("preserves rhythm for every-2-days reminders", () => {
      const nov1 = new Date(2026, 10, 1, 9, 0, 0, 0).getTime();
      const rec: ReminderRecurrence = { freq: "daily", interval: 2, anchorAt: nov1 };
      // Ticked late on Nov 4 -> Nov 5 (keeps Nov 1, 3, 5 rhythm instead of drifting to Nov 6)
      const nov4morning = new Date(2026, 10, 4, 8, 0, 0, 0).getTime();
      expect(nextAfterComplete(rec, nov1, nov4morning)).toBe(
        new Date(2026, 10, 5, 9, 0, 0, 0).getTime()
      );
    });

    it("keeps weekly Monday reminders on Mondays", () => {
      const mon1 = new Date(2026, 10, 2, 9, 0, 0, 0).getTime(); // Mon Nov 2
      const wed4 = new Date(2026, 10, 4, 10, 0, 0, 0).getTime(); // Wed Nov 4
      const rec: ReminderRecurrence = {
        freq: "weekly",
        interval: 1,
        anchorAt: mon1,
        byWeekday: [1],
      };
      expect(nextAfterComplete(rec, mon1, wed4)).toBe(
        new Date(2026, 10, 9, 9, 0, 0, 0).getTime()
      );
    });

    it("returns null after the final occurrence of a count/until series", () => {
      const nov1 = new Date(2026, 10, 1, 9, 0, 0, 0).getTime();
      const nov2 = new Date(2026, 10, 2, 9, 0, 0, 0).getTime();
      const countRec: ReminderRecurrence = {
        freq: "daily",
        interval: 1,
        anchorAt: nov1,
        count: 2,
      };
      expect(nextAfterComplete(countRec, nov1, nov1)).toBe(nov2);
      expect(nextAfterComplete(countRec, nov2, nov2)).toBeNull();

      const untilRec: ReminderRecurrence = {
        freq: "daily",
        interval: 1,
        anchorAt: nov1,
        until: nov2,
      };
      expect(nextAfterComplete(untilRec, nov2, nov2)).toBeNull();
    });
  });
});
