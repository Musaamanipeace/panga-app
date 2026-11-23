import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import AppShell from "../AppShell";
import { isGuest } from "../../auth/session";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let host: HTMLElement;
let latestLocation = "";

function LocationTracker() {
  const loc = useLocation();
  latestLocation = `${loc.pathname}${loc.search}`;
  return <div data-testid="route">{latestLocation}</div>;
}

async function mount(initial = "/home") {
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () => {
    root!.render(
      <MemoryRouter initialEntries={[initial]}>
        <Routes>
          <Route path="/" element={<LocationTracker />} />
          <Route element={<AppShell />}>
            <Route path="/home" element={<LocationTracker />} />
            <Route path="/settings" element={<LocationTracker />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
  });
  await settle();
}

async function settle(ms = 30) {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
}

async function click(el: Element | null | undefined) {
  if (!el) throw new Error("element not found");
  await act(async () => {
    (el as HTMLElement).click();
  });
  await settle();
}

function buttonByText(text: string): HTMLButtonElement | undefined {
  return [...host.querySelectorAll("button")].find((b) => b.textContent?.trim().includes(text));
}

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("panga_guest", "1");
  latestLocation = "";
});

afterEach(async () => {
  await act(async () => root?.unmount());
  host?.remove();
  root = null;
});

describe("AppShell header, menus and shortcuts", () => {
  it("renders slim header with Shortcuts and Menu and hides old Exit/Settings/Guest/Local only text", async () => {
    await mount("/home");
    const header = host.querySelector("header.app-header")!;
    expect(header.textContent).toContain("Panga");
    expect(header.textContent).toContain("Search");
    expect(header.textContent).toContain("💭 Thoughts");
    expect(header.textContent).toContain("📋 Paste");
    expect(header.textContent).toContain("Shortcuts");
    expect(header.textContent).toContain("Menu");
    expect(header.textContent).not.toContain("Settings");
    expect(header.textContent).not.toContain("Exit");
    expect(header.textContent).not.toContain("Guest");
    expect(header.textContent).not.toContain("Local only");
  });

  it("opens Shortcuts popover listing tabs, Search, Voice dictation and ?", async () => {
    await mount("/home");
    await click(buttonByText("Shortcuts"));
    const dialog = host.querySelector('[role="dialog"][aria-label="Keyboard shortcuts"]');
    expect(dialog).not.toBeNull();
    expect(dialog!.textContent).toContain("Alt+T");
    expect(dialog!.textContent).toContain("Alt+L");
    expect(dialog!.textContent).toContain("Alt+N");
    expect(dialog!.textContent).toContain("Alt+R");
    expect(dialog!.textContent).toContain("Alt+C");
    expect(dialog!.textContent).toContain("Alt+P");
    expect(dialog!.textContent).toContain("Ctrl/Cmd+K");
    expect(dialog!.textContent).toContain("Alt+S");
    expect(dialog!.textContent).toContain("Alt+Shift+M");
    expect(dialog!.textContent).toContain("?");
  });

  it("opens Menu with Settings link, Online/Offline status and Exit to /", async () => {
    await mount("/home");
    await click(buttonByText("Menu"));
    const menu = host.querySelector('[role="menu"][aria-label="App menu"]');
    expect(menu).not.toBeNull();
    expect(menu!.textContent).toContain("Settings");
    expect(menu!.textContent).toMatch(/Online|Offline/);
    const exitBtn = [...menu!.querySelectorAll("button")].find((b) => b.textContent?.trim() === "Exit");
    expect(exitBtn).toBeDefined();

    await click(exitBtn);
    expect(latestLocation).toBe("/");
    expect(isGuest()).toBe(false);
  });

  it("navigates via Alt+tab shortcuts, toggles search via Ctrl+K, toggles shortcuts via ?, and closes on Escape", async () => {
    await mount("/home");

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { altKey: true, code: "KeyP", key: "π", bubbles: true }));
    });
    expect(latestLocation).toBe("/home?tab=Proofread");

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { altKey: true, code: "KeyN", key: "n", bubbles: true }));
    });
    expect(latestLocation).toBe("/home?tab=Notes");

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { ctrlKey: true, code: "KeyK", key: "k", bubbles: true }));
    });
    expect(host.querySelector(".search-overlay")).not.toBeNull();

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true }));
    });
    expect(host.querySelector(".search-overlay")).toBeNull();

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "?", shiftKey: true, code: "Slash", bubbles: true }));
    });
    expect(host.querySelector('[role="dialog"][aria-label="Keyboard shortcuts"]')).not.toBeNull();

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true }));
    });
    expect(host.querySelector('[role="dialog"][aria-label="Keyboard shortcuts"]')).toBeNull();

    // ? inside an input does not trigger the popover
    const input = document.createElement("input");
    host.appendChild(input);
    await act(async () => {
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "?", shiftKey: true, code: "Slash", bubbles: true }));
    });
    expect(host.querySelector('[role="dialog"][aria-label="Keyboard shortcuts"]')).toBeNull();
  });
});
