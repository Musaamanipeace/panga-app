import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetGuestSession } from "../../auth/session";
import { accountDb } from "../accountDb";
import { hasImportedDone } from "../accountSettings";
import {
  completeReminder,
  createReminder,
  getReminder,
  isReminderTimed,
  listByView,
  listReminders,
  startOfLocalDay,
  startReminderScheduler,
  stopReminderScheduler,
  viewOf,
} from "../reminders";
import { createReminderFolder } from "../reminderFolders";

beforeEach(async () => {
  stopReminderScheduler();
  localStorage.clear();
  await resetGuestSession();
});

afterEach(() => {
  stopReminderScheduler();
  vi.restoreAllMocks();
});

describe("Stage 2: reminders dated checklist data semantics", () => {
  it("classifies local day boundaries cleanly in viewOf", () => {
    const nowMs = new Date(2026, 10, 26, 14, 0, 0, 0).getTime();
    const todayLate = new Date(2026, 10, 26, 23, 59, 59, 0).getTime();
    const todayEarlier = new Date(2026, 10, 26, 8, 0, 0, 0).getTime();
    const tomorrowMidnight = new Date(2026, 10, 27, 0, 0, 0, 0).getTime();
    const yesterdayLate = new Date(2026, 10, 25, 23, 59, 59, 0).getTime();

    expect(viewOf({ triggerAt: todayLate }, nowMs)).toBe("today");
    expect(viewOf({ triggerAt: todayEarlier }, nowMs)).toBe("today");
    expect(viewOf({ triggerAt: tomorrowMidnight }, nowMs)).toBe("upcoming");
    expect(viewOf({ triggerAt: yesterdayLate }, nowMs)).toBe("overdue");
  });

  it("hides legacy dismissed reminders while keeping legacy pending/fired open and undefined timed as timed", async () => {
    const nowMs = Date.now();
    await accountDb.reminders.bulkPut([
      {
        id: "leg-pending",
        folderId: null,
        linkedEntityType: null,
        linkedEntityId: null,
        message: "Legacy pending",
        triggerAt: nowMs - 3600_000,
        status: "pending",
        createdAt: 1,
        updatedAt: 1,
        syncStatus: "pending",
      },
      {
        id: "leg-fired",
        folderId: null,
        linkedEntityType: null,
        linkedEntityId: null,
        message: "Legacy fired",
        triggerAt: nowMs - 7200_000,
        status: "fired",
        createdAt: 2,
        updatedAt: 2,
        syncStatus: "pending",
      },
      {
        id: "leg-dismissed",
        folderId: null,
        linkedEntityType: null,
        linkedEntityId: null,
        message: "Legacy dismissed",
        triggerAt: nowMs - 7200_000,
        status: "dismissed",
        createdAt: 3,
        updatedAt: 3,
        syncStatus: "pending",
      },
    ]);

    const open = await listReminders();
    expect(open.map((r) => r.id)).toEqual(["leg-fired", "leg-pending"]);
    expect(isReminderTimed(open[0])).toBe(true);
    expect(isReminderTimed({ timed: false })).toBe(false);
  });

  it("orders Today (timed first, then plain) and supports folder filters in listByView", async () => {
    const nowMs = new Date(2026, 10, 26, 12, 0, 0, 0).getTime();
    const folder = await createReminderFolder({ title: "Work" });

    await createReminder({
      message: "Plain task",
      triggerAt: new Date(2026, 10, 26, 15, 0, 0, 0).getTime(),
      timed: false,
      linkedEntityType: null,
      linkedEntityId: null,
      folderId: folder.id,
    });
    await createReminder({
      message: "Morning call",
      triggerAt: new Date(2026, 10, 26, 8, 30, 0, 0).getTime(),
      timed: true,
      linkedEntityType: null,
      linkedEntityId: null,
    });
    await createReminder({
      message: "Afternoon call",
      triggerAt: new Date(2026, 10, 26, 16, 0, 0, 0).getTime(),
      timed: true,
      linkedEntityType: null,
      linkedEntityId: null,
      folderId: folder.id,
    });
    await createReminder({
      message: "Yesterday item",
      triggerAt: startOfLocalDay(nowMs) - 86_400_000,
      timed: false,
      linkedEntityType: null,
      linkedEntityId: null,
    });
    await createReminder({
      message: "Tomorrow item",
      triggerAt: startOfLocalDay(nowMs) + 86_400_000,
      timed: false,
      linkedEntityType: null,
      linkedEntityId: null,
    });

    const todayAll = await listByView("today", undefined, nowMs);
    expect(todayAll.map((r) => r.message)).toEqual([
      "Morning call",
      "Afternoon call",
      "Plain task",
    ]);

    const todayWork = await listByView("today", folder.id, nowMs);
    expect(todayWork.map((r) => r.message)).toEqual(["Afternoon call", "Plain task"]);

    const allOrdered = await listByView("all", undefined, nowMs);
    expect(allOrdered.map((r) => r.message)).toEqual([
      "Yesterday item",
      "Morning call",
      "Afternoon call",
      "Plain task",
      "Tomorrow item",
    ]);
  });

  it("deletes one-time reminders on completeReminder and restores identically on undo", async () => {
    const r = await createReminder({
      message: "Pay bill",
      triggerAt: Date.now(),
      timed: false,
      location: "Online",
      notes: "Account #12",
      linkedEntityType: null,
      linkedEntityId: null,
    });

    const { undo, nextAt } = await completeReminder(r.id);
    expect(nextAt).toBeNull();
    expect(await getReminder(r.id)).toBeUndefined();

    await undo();
    const restored = await getReminder(r.id);
    expect(restored).toEqual(r);
  });

  it("advances repeating reminders on completeReminder, deletes at series end, and tracks importedDone", async () => {
    const today9am = new Date();
    today9am.setHours(9, 0, 0, 0);
    const anchor = today9am.getTime();
    const dayAfter = anchor + 2 * 86_400_000;

    const repeating = await createReminder({
      message: "Standup",
      triggerAt: anchor,
      timed: true,
      recurrence: { freq: "daily", interval: 1, anchorAt: anchor, count: 2 },
      linkedEntityType: null,
      linkedEntityId: null,
    });

    const first = await completeReminder(repeating.id, anchor + 60_000);
    expect(first.nextAt).not.toBeNull();
    const updated = await getReminder(repeating.id);
    expect(updated?.triggerAt).toBe(first.nextAt);
    expect(updated?.occurrencesDone).toBe(1);

    await first.undo();
    const reverted = await getReminder(repeating.id);
    expect(reverted?.triggerAt).toBe(anchor);
    expect(reverted?.occurrencesDone).toBe(0);

    // Advance then finish series on day 2
    const secondAdvance = await completeReminder(repeating.id, anchor + 60_000);
    expect(secondAdvance.nextAt).not.toBeNull();
    const finish = await completeReminder(repeating.id, dayAfter);
    expect(finish.nextAt).toBeNull();
    expect(await getReminder(repeating.id)).toBeUndefined();

    // Imported one-time reminder records and clears importedDone on complete/undo
    const importedId = "ics-1";
    await accountDb.reminders.put({
      id: importedId,
      folderId: null,
      linkedEntityType: null,
      linkedEntityId: null,
      message: "Imported event",
      triggerAt: anchor,
      timed: false,
      status: "pending",
      source: "ics",
      externalUid: "uid-99",
      externalInstance: null,
      createdAt: anchor,
      updatedAt: anchor,
      syncStatus: "pending",
    });

    const impComplete = await completeReminder(importedId);
    expect(hasImportedDone("uid-99", null)).toBe(true);
    await impComplete.undo();
    expect(hasImportedDone("uid-99", null)).toBe(false);
    expect(await getReminder(importedId)).toBeDefined();
  });

  it("never fires OS notifications for plain reminders", async () => {
    const notified: string[] = [];
    const FakeNotification = vi.fn(function FakeNotification(this: any, title: string) {
      notified.push(title);
    }) as any;
    FakeNotification.permission = "granted";
    vi.stubGlobal("Notification", FakeNotification);

    await createReminder({
      message: "Plain today item",
      triggerAt: Date.now() - 60_000,
      timed: false,
      linkedEntityType: null,
      linkedEntityId: null,
    });

    startReminderScheduler();
    await new Promise((r) => setTimeout(r, 40));
    expect(notified).toHaveLength(0);
  });
});
