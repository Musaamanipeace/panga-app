export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function sameDay(a: number | Date, b: number | Date): boolean {
  const x = new Date(a);
  const y = new Date(b);
  return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate();
}

export function toYmd(ts: number | null | undefined): string {
  if (!ts) return "";
  const d = new Date(ts);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Local yyyy-mm-dd -> timestamp. Keeps the time of day of `existing` (default 09:00). */
export function fromYmd(ymd: string, existing?: number | null): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
  const [y, m, d] = ymd.split("-").map(Number);
  const base = existing ? new Date(existing) : null;
  return new Date(y, m - 1, d, base ? base.getHours() : 9, base ? base.getMinutes() : 0).getTime();
}

/** Cells for a month grid starting on Monday. `null` = padding. */
export function monthCells(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array(lead).fill(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
