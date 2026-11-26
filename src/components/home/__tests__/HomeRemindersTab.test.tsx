import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import HomeRemindersTab from "../HomeRemindersTab";
import { ConfirmDialogHost, ToastContainer } from "../../ui";
import { resetGuestSession } from "../../../auth/session";
import { accountDb } from "../../../data/accountDb";
import { createReminder, listReminders, stopReminderScheduler } from "../../../data/reminders";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let host: HTMLElement;

async function settle(ms = 50) {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
}

async function mountTab() {
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () => {
    root!.render(
      <>
        <HomeRemindersTab />
        <ToastContainer />
        <ConfirmDialogHost />
      </>
    );
  });
  await settle();
}

async function type(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto =
    el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")!.set!;
  await act(async () => {
    setter.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await settle(20);
}

async function click(el: Element | null | undefined) {
  if (!el) throw new Error("element not found");
  await act(async () => {
    (el as HTMLElement).click();
  });
  await settle();
}

beforeEach(async () => {
  stopReminderScheduler();
  localStorage.clear();
  await resetGuestSession();
});

afterEach(async () => {
  stopReminderScheduler();
  await act(async () => root?.unmount());
  host?.remove();
  root = null;
  vi.restoreAllMocks();
});

describe("HomeRemindersTab (Stage 2 dated checklist)", () => {
  it("renders view tabs with accurate counts, Today default, and exact empty states", async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(9, 0, 0, 0);

    await createReminder({
      message: "Yesterday call",
      triggerAt: yesterday.getTime(),
      timed: true,
      linkedEntityType: null,
      linkedEntityId: null,
    });

    await mountTab();

    const tabs = [...host.querySelectorAll('[role="tab"]')].map((b) =>
      b.textContent?.replace(/\s+/g, " ").trim()
    );
    expect(tabs).toEqual(["Today (0)", "Overdue (1)", "Upcoming (0)", "All (1)"]);
    expect(host.textContent).toContain("Nothing on for today.");

    const overdueTab = host.querySelectorAll('[role="tab"]')[1];
    expect(overdueTab.classList.contains("rem-view-tab-overdue")).toBe(true);
    await click(overdueTab);
    expect(host.textContent).toContain("Yesterday call");
    expect(host.textContent).toContain("1 day ago");

    const upcomingTab = host.querySelectorAll('[role="tab"]')[2];
    await click(upcomingTab);
    expect(host.textContent).toContain("Nothing coming up.");
  });

  it("quick-adds a plain reminder for today, supports ticking off with Undo, and hides legacy dismissed rows", async () => {
    await accountDb.reminders.put({
      id: "old-dismissed",
      folderId: null,
      linkedEntityType: null,
      linkedEntityId: null,
      message: "Already dismissed old",
      triggerAt: Date.now() - 86_400_000,
      status: "dismissed",
      createdAt: 1,
      updatedAt: 1,
      syncStatus: "pending",
    });

    await mountTab();
    expect(host.textContent).not.toContain("Already dismissed old");

    const input = host.querySelector('input[placeholder="Add a reminder"]') as HTMLInputElement;
    await type(input, "Buy coffee");
    const addBtn = host.querySelector('.rem-form-section button[type="submit"]');
    await click(addBtn);

    expect(host.textContent).toContain("Buy coffee");
    expect(host.textContent).toContain("Today (1)");
    const saved = await listReminders();
    expect(saved[0].timed).toBe(false);

    // Tick the checkbox -> deletes immediately and offers Undo toast
    const tick = host.querySelector(".rem-tick") as HTMLInputElement;
    await click(tick);
    expect(host.textContent).toContain("Nothing on for today.");
    expect(host.textContent).toContain("Done: Buy coffee");

    const undoBtn = [...host.querySelectorAll("button")].find((b) => b.textContent?.trim() === "Undo");
    await click(undoBtn);
    expect(host.textContent).toContain("Buy coffee");
    expect(host.textContent).toContain("Today (1)");
  });

  it("validates custom weekly repeats inline and edits repeating reminders", async () => {
    await mountTab();

    const input = host.querySelector('input[placeholder="Add a reminder"]') as HTMLInputElement;
    await type(input, "Water plants");

    const moreBtn = [...host.querySelectorAll("button")].find(
      (b) => b.textContent?.trim() === "More options"
    );
    await click(moreBtn);

    const repeatSel = host.querySelector("#rem-repeat") as HTMLSelectElement;
    await act(async () => {
      repeatSel.value = "custom";
      repeatSel.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await settle();

    // Set invalid interval 0 -> inline error
    const intervalInput = host.querySelector('input[aria-label="Repeat interval"]') as HTMLInputElement;
    await type(intervalInput, "0");
    const addBtn = host.querySelector('.rem-form-section button[type="submit"]');
    await click(addBtn);
    expect(host.textContent).toContain("Enter a number of 1 or more.");

    // Fix interval to 1, switch to weeks, clear active weekday chip -> Choose at least one weekday
    await type(intervalInput, "1");
    const unitSel = host.querySelector('select[aria-label="Repeat unit"]') as HTMLSelectElement;
    await act(async () => {
      unitSel.value = "weekly";
      unitSel.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await settle();

    const activeChip = host.querySelector('.rem-weekday-chips .chip-active') as HTMLButtonElement;
    await click(activeChip);
    await click(addBtn);
    expect(host.textContent).toContain("Choose at least one weekday.");

    // Select Mon and Wed, save, and verify repeat summary
    const monChip = [...host.querySelectorAll(".rem-weekday-chips .chip")].find(
      (b) => b.textContent?.trim() === "Mon"
    );
    const wedChip = [...host.querySelectorAll(".rem-weekday-chips .chip")].find(
      (b) => b.textContent?.trim() === "Wed"
    );
    await click(monChip);
    await click(wedChip);
    await click(addBtn);

    expect(host.textContent).toContain("Water plants");
    expect(host.textContent).toContain("Repeats weekly on Mon, Wed");

    // Edit the repeating reminder date and verify anchorAt re-anchors
    const editBtn = [...host.querySelectorAll("button")].find((b) => b.textContent?.trim() === "Edit");
    await click(editBtn);

    const dateInput = host.querySelector("#rem-date") as HTMLInputElement;
    const future = new Date();
    future.setDate(future.getDate() + 3);
    const pad = (n: number) => String(n).padStart(2, "0");
    const futureStr = `${future.getFullYear()}-${pad(future.getMonth() + 1)}-${pad(future.getDate())}`;
    await type(dateInput, futureStr);

    const saveBtn = [...host.querySelectorAll("button")].find((b) => b.textContent?.trim() === "Save");
    await click(saveBtn);

    const all = await listReminders();
    expect(all).toHaveLength(1);
    expect(all[0].recurrence?.anchorAt).toBe(all[0].triggerAt);
  });

  it("advances a missed daily reminder to today on tick and warns when deleting a series", async () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    threeDaysAgo.setHours(9, 0, 0, 0);
    const anchor = threeDaysAgo.getTime();

    await createReminder({
      message: "Daily stretch",
      triggerAt: anchor,
      timed: true,
      recurrence: { freq: "daily", interval: 1, anchorAt: anchor },
      linkedEntityType: null,
      linkedEntityId: null,
    });

    await mountTab();

    // Appears once in Overdue (3 days ago)
    expect(host.textContent).toContain("Today (0)");
    expect(host.textContent).toContain("Overdue (1)");
    await click(host.querySelectorAll('[role="tab"]')[1]);
    expect(host.textContent).toContain("Daily stretch");
    expect(host.textContent).toContain("3 days ago");

    // Ticking advances to Today
    const tick = host.querySelector(".rem-tick") as HTMLInputElement;
    await click(tick);
    expect(host.textContent).toContain("Done: Daily stretch. Next:");
    expect(host.textContent).toContain("Today (1)");
    expect(host.textContent).toContain("Overdue (0)");

    // Switch to Today and test Delete series warning
    await click(host.querySelectorAll('[role="tab"]')[0]);
    const delBtn = [...host.querySelectorAll("button")].find((b) => b.textContent?.trim() === "Delete");
    await click(delBtn);
    expect(host.textContent).toContain("This reminder repeats. Delete it and all future repeats?");

    const confirmBtn = [...host.querySelectorAll("button")].find(
      (b) => b.textContent?.trim() === "Yes, Delete"
    );
    await click(confirmBtn);
    expect(host.textContent).toContain("Nothing on for today.");
    expect(await listReminders()).toHaveLength(0);
  });
});
