import "fake-indexeddb/auto";
import { zipSync, strToU8 } from "fflate";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { resetGuestSession } from "../../auth/session";
import { accountDb } from "../accountDb";
import {
  applyEventImport,
  buildImportCandidates,
  hasCompletedIcsImport,
  readCalendarFiles,
} from "../importEvents";
import {
  completeReminder,
  createReminder,
  getActiveReminderAlerts,
  listOpenReminders,
  pushReminderAlert,
  restoreReminderRecord,
  showReminderNotification,
  startReminderScheduler,
  stopReminderScheduler,
  type Reminder,
} from "../reminders";
import HomeRemindersTab from "../../components/home/HomeRemindersTab";
import ReminderAlertBanner from "../../components/ReminderAlertBanner";
import { ToastContainer } from "../../components/ui";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let host: HTMLElement | null = null;

async function settle(ms = 60) {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
}

async function mountNode(node: React.ReactNode) {
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () => {
    root!.render(<MemoryRouter>{node}</MemoryRouter>);
  });
  await settle();
}

async function click(el: Element | null | undefined) {
  if (!el) throw new Error("element not found");
  await act(async () => {
    (el as HTMLElement).click();
  });
  await settle();
}

async function type(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")!.set!;
  await act(async () => {
    setter.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

beforeEach(async () => {
  stopReminderScheduler();
  localStorage.clear();
  await resetGuestSession();
});

afterEach(async () => {
  stopReminderScheduler();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (root) {
    await act(async () => root?.unmount());
    root = null;
  }
  if (host) {
    host.remove();
    host = null;
  }
});

describe("Reminders upgrade: plain/timed, SW fallback, Undo tick, and .ics/.zip import", () => {
  it("falls back to ServiceWorkerRegistration.showNotification when Notification constructor throws (Android Chrome)", async () => {
    const swShown: string[] = [];
    const ThrowingNotification = vi.fn(function ThrowingNotification() {
      throw new TypeError("Illegal constructor");
    }) as any;
    ThrowingNotification.permission = "granted";
    vi.stubGlobal("Notification", ThrowingNotification);

    const mockReg = {
      showNotification: vi.fn(async (title: string) => {
        swShown.push(title);
      }),
    };
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        getRegistration: vi.fn(async () => mockReg),
        ready: Promise.resolve(mockReg),
      },
    });

    const rem = await createReminder({
      message: "Take pills",
      triggerAt: Date.now() - 1000,
      timed: true,
      linkedEntityType: null,
      linkedEntityId: null,
    });

    showReminderNotification(rem);
    await new Promise((r) => setTimeout(r, 20));
    expect(swShown).toEqual(["Panga: Take pills"]);
  });

  it("never alerts for plain reminders while timed reminders trigger banner + notification", async () => {
    const notified: string[] = [];
    const FakeNotification = vi.fn(function FakeNotification(this: any, title: string) {
      notified.push(title);
    }) as any;
    FakeNotification.permission = "granted";
    vi.stubGlobal("Notification", FakeNotification);

    await createReminder({
      message: "Plain task today",
      triggerAt: Date.now() - 5000,
      timed: false,
      linkedEntityType: null,
      linkedEntityId: null,
    });
    await createReminder({
      message: "Timed call",
      triggerAt: Date.now() - 5000,
      timed: true,
      linkedEntityType: null,
      linkedEntityId: null,
    });

    startReminderScheduler();
    await vi.waitFor(
      () => {
        expect(notified).toEqual(["Panga: Timed call"]);
        expect(getActiveReminderAlerts().map((a) => a.message)).toEqual(["Timed call"]);
      },
      { timeout: 1500 }
    );
  });

  it("completes one-time (delete + undo) and repeating reminders (advance + undo)", async () => {
    const oneTime = await createReminder({
      message: "Buy stamps",
      triggerAt: new Date(2026, 10, 25, 9, 0, 0, 0).getTime(),
      timed: false,
      linkedEntityType: null,
      linkedEntityId: null,
    });

    const delRes = await completeReminder(oneTime.id);
    expect(delRes?.kind).toBe("deleted");
    expect(await listOpenReminders()).toHaveLength(0);

    await restoreReminderRecord(delRes!.previous);
    expect((await listOpenReminders()).map((r) => r.id)).toEqual([oneTime.id]);

    const nov25 = new Date(2026, 10, 25, 9, 0, 0, 0).getTime();
    const repeating = await createReminder({
      message: "Water plants",
      triggerAt: nov25,
      timed: false,
      recurrence: { interval: 2, unit: "day", anchorAt: nov25 },
      linkedEntityType: null,
      linkedEntityId: null,
    });

    const advRes = await completeReminder(repeating.id, nov25);
    expect(advRes?.kind).toBe("advanced");
    const updated = await accountDb.reminders.get(repeating.id);
    expect(new Date(updated!.triggerAt).getDate()).toBe(27);

    await restoreReminderRecord(advRes!.previous);
    const restored = await accountDb.reminders.get(repeating.id);
    expect(new Date(restored!.triggerAt).getDate()).toBe(25);
  });

  it("reads .zip archives via fflate and dedupes / updates on re-import", async () => {
    const future = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    const ymd = `${future.getUTCFullYear()}${pad(future.getUTCMonth() + 1)}${pad(future.getUTCDate())}`;

    const icsV1 = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      "UID:zip-ev-1",
      `DTSTART:${ymd}T100000Z`,
      "SUMMARY:Dentist",
      "END:VEVENT",
      "BEGIN:VEVENT",
      "UID:zip-past-2",
      "DTSTART:20200101T100000Z",
      "SUMMARY:Old event",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const zipBytes = zipSync({ "my-calendar.ics": strToU8(icsV1) });
    const zipFile = new File([zipBytes as unknown as BlobPart], "export.zip", { type: "application/zip" });

    const read1 = await readCalendarFiles([zipFile]);
    expect(read1.events).toHaveLength(2);

    const cands1 = await buildImportCandidates(read1.events);
    expect(cands1.find((c) => c.event.externalUid === "zip-past-2")?.isPast).toBe(true);

    const nonPast = cands1.filter((c) => !c.isPast);
    const res1 = await applyEventImport(nonPast, nonPast.length);
    expect(res1.added).toBe(1);
    expect(hasCompletedIcsImport()).toBe(true);

    // Re-importing same zip marks as duplicate
    const candsDup = await buildImportCandidates(read1.events);
    expect(candsDup.find((c) => c.event.externalUid === "zip-ev-1")?.status).toBe("duplicate");

    // Re-importing edited summary marks as changed and updates in place
    const icsV2 = icsV1.replace("SUMMARY:Dentist", "SUMMARY:Dentist (updated)");
    const icsFileV2 = new File([icsV2], "updated.ics", { type: "text/calendar" });
    const read2 = await readCalendarFiles([icsFileV2]);
    const cands2 = await buildImportCandidates(read2.events);
    const changed = cands2.filter((c) => c.status === "changed");
    expect(changed).toHaveLength(1);

    const res2 = await applyEventImport(changed, changed.length);
    expect(res2.updated).toBe(1);
    const open = await listOpenReminders();
    expect(open.map((r) => r.message)).toEqual(["Dentist (updated)"]);
  });

  it("renders Today/Overdue/Upcoming/All views, quick-adds plain reminder, ticks with Undo, and shows Import card", async () => {
    await mountNode(
      <>
        <ReminderAlertBanner />
        <HomeRemindersTab />
        <ToastContainer />
      </>
    );

    expect(host!.textContent).toContain("Today (0)");
    expect(host!.textContent).toContain("Overdue (0)");
    expect(host!.textContent).toContain("Upcoming (0)");
    expect(host!.textContent).toContain("Nothing on for today.");
    expect(host!.textContent).toContain("Import events from Google Calendar");

    const input = host!.querySelector('input[placeholder="Add a reminder"]') as HTMLInputElement;
    await type(input, "Check mailbox");
    const addBtn = host!.querySelector('.rem-form-section button[type="submit"]') as HTMLButtonElement;
    await click(addBtn);

    expect(host!.textContent).toContain("Today (1)");
    expect(host!.textContent).toContain("Check mailbox");

    const tick = host!.querySelector('input[aria-label="Tick off Check mailbox"]') as HTMLInputElement;
    await click(tick);
    expect(host!.textContent).toContain("Today (0)");
    expect(host!.textContent).toContain("Done: Check mailbox");

    const undoBtn = [...host!.querySelectorAll("button")].find((b) => b.textContent?.trim() === "Undo");
    await click(undoBtn);
    expect(host!.textContent).toContain("Today (1)");
    expect(host!.textContent).toContain("Check mailbox");
  });

  it("edits a reminder from plain to timed with custom weekly chips and updates the row", async () => {
    const todayTs = Date.now();
    await createReminder({
      message: "Water garden",
      triggerAt: todayTs,
      timed: false,
      linkedEntityType: null,
      linkedEntityId: null,
    });

    await mountNode(<HomeRemindersTab />);
    expect(host!.textContent).toContain("Water garden");

    const editBtn = [...host!.querySelectorAll("button")].find((b) => b.textContent?.trim() === "Edit");
    await click(editBtn);

    const addTimeCheck = [...host!.querySelectorAll("label")].find((l) =>
      l.textContent?.includes("Add a time")
    )?.querySelector("input[type='checkbox']") as HTMLInputElement;
    await click(addTimeCheck);

    const timeInput = host!.querySelector('input[aria-label="Time"]') as HTMLInputElement;
    await type(timeInput, "14:30");

    const repeatSelect = [...host!.querySelectorAll("select")].find((s) =>
      [...s.options].some((o) => o.value === "custom")
    ) as HTMLSelectElement;
    await act(async () => {
      repeatSelect.value = "custom";
      repeatSelect.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await settle();

    const unitSelect = host!.querySelector('select[aria-label="Repeat unit"]') as HTMLSelectElement;
    await act(async () => {
      unitSelect.value = "week";
      unitSelect.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await settle();

    const friChip = [...host!.querySelectorAll('button')].find((b) => b.textContent?.trim() === "Fri");
    await click(friChip);

    const saveBtn = host!.querySelector('.rem-form-section button[type="submit"]') as HTMLButtonElement;
    await click(saveBtn);

    const open = await listOpenReminders();
    expect(open).toHaveLength(1);
    expect(open[0].timed).toBe(true);
    expect(open[0].recurrence?.unit).toBe("week");
    expect(open[0].recurrence?.weekdays).toContain(5);
  });

  it("runs the UI .ics import flow in HomeRemindersTab and collapses behind Import events button", async () => {
    await mountNode(<HomeRemindersTab />);

    const fileInput = host!.querySelector('input[aria-label="Choose .ics or .zip files"]') as HTMLInputElement;
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    const ymd = `${future.getUTCFullYear()}${pad(future.getUTCMonth() + 1)}${pad(future.getUTCDate())}`;
    const icsText = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      "UID:ui-import-1",
      `DTSTART:${ymd}T150000Z`,
      "SUMMARY:Team sync",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const file = new File([icsText], "invite.ics", { type: "text/calendar" });
    await act(async () => {
      Object.defineProperty(fileInput, "files", { configurable: true, value: [file] });
      fileInput.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await settle(100);

    expect(host!.textContent).toContain("1 event found: 1 new.");
    expect(host!.textContent).toContain("Team sync");

    const confirmBtn = [...host!.querySelectorAll("button")].find((b) =>
      b.textContent?.includes("Add 1 event")
    );
    await click(confirmBtn);

    expect(host!.textContent).toContain("Added 1, updated 0, skipped 0.");
    expect(host!.textContent).toContain("Upcoming (1)");

    const closeBtn = [...host!.querySelectorAll(".import-card button")].find(
      (b) => b.textContent?.trim() === "Close"
    );
    await click(closeBtn);
    expect(host!.textContent).toContain("Import events");
    expect(host!.textContent).not.toContain("Import events from Google Calendar");
  });

  it("renders up to 3 ReminderAlertBanner rows with +N more, Dismiss, and Tick off", async () => {
    const baseTs = Date.now() - 10_000;
    const created: Reminder[] = [];
    for (let i = 1; i <= 4; i++) {
      created.push(
        await createReminder({
          message: `Alert ${i}`,
          triggerAt: baseTs + i * 100,
          timed: true,
          linkedEntityType: null,
          linkedEntityId: null,
        })
      );
    }

    await mountNode(
      <>
        <ReminderAlertBanner />
        <ToastContainer />
      </>
    );

    await act(async () => {
      for (const r of created) pushReminderAlert(r);
    });
    await settle();

    expect(host!.textContent).toContain("Alert 1");
    expect(host!.textContent).toContain("Alert 3");
    expect(host!.textContent).not.toContain("Alert 4");
    expect(host!.textContent).toContain("+1 more");

    const dismissBtns = [...host!.querySelectorAll(".reminder-alert-banner button")].filter(
      (b) => b.textContent?.trim() === "Dismiss"
    );
    await click(dismissBtns[0]);
    expect(host!.textContent).toContain("Alert 4");
    expect(host!.textContent).not.toContain("+1 more");

    const tickBtns = [...host!.querySelectorAll(".reminder-alert-banner button")].filter(
      (b) => b.textContent?.trim() === "Tick off"
    );
    await click(tickBtns[0]);
    await settle(100);
    expect(host!.textContent).toContain("Done: Alert 2");
  });
});
