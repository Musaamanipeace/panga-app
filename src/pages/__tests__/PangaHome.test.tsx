import "fake-indexeddb/auto";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import PangaHome from "../PangaHome";
import { ensureSeedData, db } from "../../data/db";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let host: HTMLElement;

async function mount(url = "/home") {
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () => {
    root!.render(
      <MemoryRouter initialEntries={[url]}>
        <PangaHome />
      </MemoryRouter>
    );
  });
  await settle();
}

async function settle(ms = 60) {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
}

async function type(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")!.set!;
  await act(async () => {
    setter.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

async function click(el: Element | null | undefined) {
  if (!el) throw new Error("element not found");
  await act(async () => {
    (el as HTMLElement).click();
  });
  await settle();
}

const byText = (text: string, sel = "button") => [...host.querySelectorAll(sel)].find((e) => e.textContent?.trim().startsWith(text));

beforeAll(async () => {
  localStorage.setItem("panga_guest", "1");
  await ensureSeedData();
  if (await db.noteFolders.count() === 0) {
    await db.noteFolders.add({ id: "folder_inbox", title: "Inbox", parentFolderId: null, order: 0, createdAt: Date.now(), updatedAt: Date.now(), syncStatus: "synced" });
  }
});

afterEach(async () => {
  await act(async () => root?.unmount());
  host?.remove();
  root = null;
});

describe("Panga home (smoke)", () => {
  it("saves a categorised note", async () => {
    await mount("/home?tab=Notes");
    await settle(1000);
    await click(byText("Add note"));
    await settle(50);
    const body = host.querySelector('textarea[placeholder="Write your note"]') as HTMLTextAreaElement;
    await type(body, "remember the meeting agenda");
    await click(byText("Save note"));
    await settle(100);
    // After saving, going back shows the note in the list.
    await click(byText("Back"));
    expect(host.textContent).toContain("remember the meeting agenda");
  });

  it("saves pasted text into the Clipboard tab", async () => {
    await mount("/home?tab=Clipboard");
    const box = host.querySelector("textarea.pg-wide") as HTMLTextAreaElement;
    await act(async () => {
      const ev = new Event("paste", { bubbles: true, cancelable: true }) as any;
      ev.clipboardData = { getData: () => "copied snippet 123" };
      box.dispatchEvent(ev);
    });
    await settle(120);
    expect(host.textContent).toContain("copied snippet 123");
  });

  it("shows flat task lists (no folders) and opens a list's tasks", async () => {
    const { createTaskList } = await import("../../data/taskLists");
    const { createTask } = await import("../../data/tasks");

    const list = await createTaskList({ title: "compound" });
    await createTask({ listId: list.id, title: "sweep" });
    await createTask({ listId: list.id, title: "mop" });
    await createTask({ listId: list.id, title: "dig" });

    await mount("/home?tab=Task%20lists");
    await settle(120);
    expect(host.textContent).toContain("compound");
    expect(host.querySelector(".folder-card")).toBeNull();
    expect(byText("Add folder")).toBeUndefined();

    const row = [...host.querySelectorAll(".tl-row")].find((b) => b.textContent?.includes("compound"));
    await click(row);
    await settle(80);
    expect(host.textContent).toContain("sweep");
    expect(host.textContent).toContain("mop");
    expect(host.textContent).toContain("dig");
  });

  it("no longer has a Proofread tab; Grammar & Spelling is offered inside Notes", async () => {
    await mount("/home?tab=Notes");
    await settle(300);
    expect(byText("Proofread", ".chip")).toBeUndefined();
    await click(byText("Add note"));
    expect(byText("Grammar & Spelling")).toBeDefined();
  });

  it("renders the Quick links card immediately below the AI CommandBox section", async () => {
    await mount("/home");
    const cards = [...host.querySelectorAll(".pg-home > section.pg-card")];
    const aiIdx = cards.findIndex((c) => c.querySelector('textarea[placeholder*="Tell Panga what to do"]'));
    const quickLinksIdx = cards.findIndex((c) => c.getAttribute("aria-label") === "Quick links");
    expect(aiIdx).toBeGreaterThanOrEqual(0);
    expect(quickLinksIdx).toBe(aiIdx + 1);
    expect(cards[quickLinksIdx].querySelector(".shortcuts-title")?.textContent).toBe("Quick links");
  });
});
