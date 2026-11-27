import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { resetGuestSession } from "../../auth/session";
import { accountDb, ensureAccountDbReady } from "../accountDb";
import {
  createReminder,
  runReminderSchedulerTick,
  snoozeReminder,
} from "../reminders";
import ReminderAlertBanner from "../../components/alerts/ReminderAlertBanner";
import { ToastContainer } from "../../components/ui";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let host: HTMLElement | null = null;

async function renderBanner() {
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () => {
    root!.render(
      <MemoryRouter>
        <ReminderAlertBanner />
        <ToastContainer />
      </MemoryRouter>
    );
  });
}

describe("Timed reminder alert scheduler & ReminderAlertBanner", () => {
  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await resetGuestSession();
    await ensureAccountDbReady();
    await accountDb.reminders.clear();
  });

  afterEach(async () => {
    if (root) {
      await act(async () => root!.unmount());
    }
    host?.remove();
    root = null;
    host = null;
    vi.restoreAllMocks();
  });

  it("alerts timed due reminders once per triggerAt, skips plain reminders, and re-arms after snooze", async () => {
    const baseMs = new Date(2026, 10, 26, 10, 0, 0, 0).getTime();

    const plain = await createReminder({
      message: "Plain checklist item",
      triggerAt: baseMs - 60_000,
      timed: false,
      linkedEntityType: null,
      linkedEntityId: null,
    });
    const timed = await createReminder({
      message: "Call pharmacist",
      triggerAt: baseMs - 30_000,
      timed: true,
      linkedEntityType: null,
      linkedEntityId: null,
    });

    const events: any[] = [];
    const listener = (e: Event) => events.push((e as CustomEvent).detail);
    window.addEventListener("panga-reminder-alert", listener);

    try {
      const firstTick = await runReminderSchedulerTick(baseMs);
      expect(firstTick).toHaveLength(1);
      expect(firstTick[0].id).toBe(timed.id);
      expect(events).toHaveLength(1);

      const savedTimed = await accountDb.reminders.get(timed.id);
      expect(savedTimed?.status).toBe("fired");
      expect(savedTimed?.lastAlertedAt).toBe(timed.triggerAt);
      const savedPlain = await accountDb.reminders.get(plain.id);
      expect(savedPlain?.status).toBe("pending");

      // Second tick at the same timestamp must not alert again
      const secondTick = await runReminderSchedulerTick(baseMs + 5_000);
      expect(secondTick).toHaveLength(0);
      expect(events).toHaveLength(1);

      // Snooze pushes triggerAt forward and resets lastAlertedAt
      const snoozedAt = baseMs + 600_000;
      await snoozeReminder(timed.id, snoozedAt);
      const afterSnooze = await accountDb.reminders.get(timed.id);
      expect(afterSnooze?.status).toBe("pending");
      expect(afterSnooze?.lastAlertedAt).toBeNull();
      expect(afterSnooze?.triggerAt).toBe(snoozedAt);

      const thirdTick = await runReminderSchedulerTick(snoozedAt + 1_000);
      expect(thirdTick).toHaveLength(1);
      expect(events).toHaveLength(2);
    } finally {
      window.removeEventListener("panga-reminder-alert", listener);
    }
  });

  it("renders banner alerts with Done, 10m snooze, and non-destructive Dismiss", async () => {
    await renderBanner();

    const rem = await createReminder({
      message: "Take medication",
      triggerAt: Date.now() - 1_000,
      timed: true,
      linkedEntityType: null,
      linkedEntityId: null,
    });

    await act(async () => {
      window.dispatchEvent(new CustomEvent("panga-reminder-alert", { detail: rem }));
    });

    expect(host!.textContent).toContain("Take medication");
    const buttons = [...host!.querySelectorAll("button")];
    const dismissBtn = buttons.find((b) => b.textContent?.trim() === "Dismiss");
    expect(dismissBtn).toBeDefined();

    // Dismiss closes the banner UI ONLY while keeping the reminder row intact in IndexedDB
    await act(async () => {
      dismissBtn!.click();
    });
    expect(host!.textContent).not.toContain("Take medication");
    expect(await accountDb.reminders.get(rem.id)).toBeDefined();

    // Re-trigger alert and click Done -> removes one-time reminder from IndexedDB
    await act(async () => {
      window.dispatchEvent(new CustomEvent("panga-reminder-alert", { detail: rem }));
    });
    const doneBtn = [...host!.querySelectorAll("button")].find((b) => b.textContent?.trim() === "Done");
    expect(doneBtn).toBeDefined();
    await act(async () => {
      doneBtn!.click();
    });
    expect(await accountDb.reminders.get(rem.id)).toBeUndefined();
  });
});
