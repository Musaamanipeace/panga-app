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
    const body = host.querySelector('textarea[placeholder="Write your note…"]') as HTMLTextAreaElement;
    await type(body, "remember the meeting agenda");
    await click(byText("Save note"));
    await settle(100);
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

  it("displays task lists nested inside a folder and shows their tasks", async () => {
    const { createTaskListFolder } = await import("../../data/taskListFolders");
    const { createTaskList } = await import("../../data/taskLists");
    const { createTask } = await import("../../data/tasks");

    const folder = await createTaskListFolder({ title: "clean" });
    const list = await createTaskList({ title: "compound", folderId: folder.id });
    await createTask({ listId: list.id, title: "sweep" });
    await createTask({ listId: list.id, title: "mop" });
    await createTask({ listId: list.id, title: "dig" });

    await mount("/home?tab=Task%20lists");
    await settle(120);
    expect(host.textContent).toContain("clean");

    const folderCard = [...host.querySelectorAll(".folder-card")].find((el) => el.textContent?.includes("clean"));
    await click(folderCard);
    await settle(80);
    expect(host.textContent).toContain("compound");

    const showBtn = folderCard ? [...folderCard.querySelectorAll("button")].find((b) => b.textContent?.trim() === "Show") : null;
    await click(showBtn);
    await settle(60);
    expect(folderCard?.parentElement?.textContent).toContain("compound");

    const listBtn = [...host.querySelectorAll("button")].find((b) => b.textContent?.trim() === "compound");
    await click(listBtn);
    await settle(80);
    expect(host.textContent).toContain("sweep");
    expect(host.textContent).toContain("mop");
    expect(host.textContent).toContain("dig");
  });

  it("renders the Shortcuts card immediately below the AI CommandBox section", async () => {
    await mount("/home");
    const cards = [...host.querySelectorAll(".pg-home > section.pg-card")];
    const aiIdx = cards.findIndex((c) => c.querySelector('textarea[placeholder*="Tell Panga what to do"]'));
    const shortcutsIdx = cards.findIndex((c) => c.getAttribute("aria-label") === "Shortcuts");
    expect(aiIdx).toBeGreaterThanOrEqual(0);
    expect(shortcutsIdx).toBe(aiIdx + 1);
  });
});
