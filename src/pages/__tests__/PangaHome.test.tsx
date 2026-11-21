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
});
