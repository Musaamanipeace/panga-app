import { describe, expect, it } from "vitest";
import { fromYmd, monthCells, sameDay, toYmd } from "../dateUtils";

describe("dateUtils", () => {
  it("round-trips a local date and defaults to 09:00", () => {
    const ts = fromYmd("2026-11-22") as number;
    expect(toYmd(ts)).toBe("2026-11-22");
    expect(new Date(ts).getHours()).toBe(9);
  });
  it("keeps the time of day of an existing timestamp", () => {
    const existing = new Date(2026, 10, 20, 15, 30).getTime();
    const moved = new Date(fromYmd("2026-11-25", existing) as number);
    expect([moved.getDate(), moved.getHours(), moved.getMinutes()]).toEqual([25, 15, 30]);
  });
  it("rejects bad input", () => {
    expect(fromYmd("")).toBeNull();
    expect(toYmd(null)).toBe("");
  });
  it("builds Monday-first month grids that are whole weeks", () => {
    const cells = monthCells(2026, 10); // November 2026 starts on a Sunday
    expect(cells.length % 7).toBe(0);
    expect(cells.slice(0, 6).every((c) => c === null)).toBe(true);
    expect(cells[6]?.getDate()).toBe(1);
    expect(cells.filter(Boolean)).toHaveLength(30);
  });
  it("compares days regardless of time", () => {
    expect(sameDay(new Date(2026, 0, 1, 1), new Date(2026, 0, 1, 23))).toBe(true);
    expect(sameDay(new Date(2026, 0, 1), new Date(2026, 0, 2))).toBe(false);
  });
});
