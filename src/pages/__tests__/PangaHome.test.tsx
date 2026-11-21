import "fake-indexeddb/auto";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import PangaHome from "../PangaHome";

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

beforeAll(() => {
  localStorage.setItem("panga_guest", "1");
});

afterEach(async () => {
  await act(async () => root?.unmount());
  host?.remove();
  root = null;
});

describe("Panga home (smoke)", () => {
  it("captures a thought, turns it into a task and ticks it off", async () => {
    await mount();
    const box = host.querySelector("#panga-capture-input") as HTMLTextAreaElement;
    expect(box).toBeTruthy();
    await type(box, "call the plumber about the tap");
    await click(byText("Add"));
    expect(host.textContent).toContain("call the plumber about the tap");

    await click(byText("→ task"));
    expect(host.textContent).toContain("task ✓");
    // The new task is in the Active list on the Tasks tab.
    expect(host.querySelectorAll('input[type="checkbox"]').length).toBeGreaterThan(0);

    const tick = host.querySelector('input[type="checkbox"][aria-label="Tick off"]') as HTMLInputElement;
    await click(tick);
    await click(byText("Done"));
    expect(host.textContent).toContain("call the plumber about the tap");
  });

  it("adds a task with the quick form and parks it (inactive)", async () => {
    await mount();
    const input = host.querySelector('input[placeholder="New task…"]') as HTMLInputElement;
    await type(input, "write report");
    await click([...host.querySelectorAll("button")].filter((b) => b.textContent === "Add").pop());
    await click(host.querySelector('button[title="Park (make inactive)"]'));
    await click(byText("Inactive"));
    expect(host.textContent).toContain("write report");
  });

  it("saves a categorised note", async () => {
    await mount("/home?tab=Notes");
    const body = host.querySelector('textarea[placeholder="Write a note…"]') as HTMLTextAreaElement;
    await type(body, "remember the meeting agenda");
    await type(host.querySelector('input[placeholder^="Category"]') as HTMLInputElement, "Work");
    await click(byText("Save note"));
    expect(host.textContent).toContain("remember the meeting agenda");
    expect(byText("Work")).toBeTruthy();
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

  it("renders the calendar and the PDF tab", async () => {
    await mount("/home?tab=Calendar");
    expect(host.textContent).toContain("Pick an existing task");
    await click(byText("PDFs"));
    expect(host.textContent).toContain("Add PDF");
  });
});
