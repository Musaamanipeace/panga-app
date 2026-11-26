import "fake-indexeddb/auto";
import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import AssistantPanel from "../AssistantPanel";
import HomeLinksTab from "../home/HomeLinksTab";
import HomeRemindersTab from "../home/HomeRemindersTab";
import NotesPanel from "../home/NotesPanel";
import { resetGuestSession } from "../../auth/session";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let host: HTMLElement;

async function settle(ms = 40) {
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

beforeEach(async () => {
  localStorage.clear();
  await resetGuestSession();
});

afterEach(async () => {
  await act(async () => root?.unmount());
  host?.remove();
  root = null;
});

describe("Viewport, layout & z-index regressions", () => {
  it("aligns the Assistant FAB tooltip inside the right viewport edge and places Close in the bottom footer", async () => {
    await mountNode(<AssistantPanel />);
    const fab = host.querySelector(".assistant-fab") as HTMLButtonElement | null;
    expect(fab).not.toBeNull();
    expect(fab!.getAttribute("data-tip-align")).toBe("right");

    await act(async () => {
      fab!.click();
    });
    const header = host.querySelector(".assistant-panel .drawer-header");
    const footer = host.querySelector(".assistant-panel .assistant-footer");
    expect(header).not.toBeNull();
    expect(footer).not.toBeNull();
    expect(header!.textContent).not.toContain("Close");
    expect(footer!.textContent).toContain("Close");
  });

  it("renders HomeLinksTab with responsive split-pane classes and no fixed flex sidebar on outer root", async () => {
    await mountNode(<HomeLinksTab />);
    const rootEl = host.querySelector(".home-links-tab") as HTMLElement | null;
    expect(rootEl).not.toBeNull();
    expect(rootEl!.classList.contains("split-pane")).toBe(true);
    expect(rootEl!.style.flex).toBe("");
    expect(rootEl!.querySelector(".split-sidebar")).not.toBeNull();
    expect(rootEl!.querySelector(".split-main")).not.toBeNull();
  });

  it("renders HomeRemindersTab with responsive split-pane classes", async () => {
    await mountNode(<HomeRemindersTab />);
    const pane = host.querySelector(".split-pane");
    expect(pane).not.toBeNull();
    expect(pane!.querySelector(".split-sidebar")).not.toBeNull();
    expect(pane!.querySelector(".split-main")).not.toBeNull();
  });

  it("closes NotesPanel folder dropdown on outside click and Escape", async () => {
    await mountNode(<NotesPanel />);
    const trigger = host.querySelector(".notes-folders-trigger") as HTMLButtonElement | null;
    const panel = host.querySelector(".notes-folders-panel") as HTMLElement | null;
    expect(trigger).not.toBeNull();
    expect(panel).not.toBeNull();
    expect(panel!.getAttribute("data-open")).toBe("false");

    await act(async () => {
      trigger!.click();
    });
    expect(panel!.getAttribute("data-open")).toBe("true");

    await act(async () => {
      document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });
    expect(panel!.getAttribute("data-open")).toBe("false");

    await act(async () => {
      trigger!.click();
    });
    expect(panel!.getAttribute("data-open")).toBe("true");

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(panel!.getAttribute("data-open")).toBe("false");
  });

  it("enforces z-index hierarchy and narrow-viewport wrapping in panga-ui.css & index.css", () => {
    const pangaCss = fs.readFileSync(path.resolve("src/styles/panga-ui.css"), "utf8");
    const indexCss = fs.readFileSync(path.resolve("src/index.css"), "utf8");

    expect(pangaCss).toContain("--z-chrome: 20;");
    expect(pangaCss).toContain("--z-workspace-open: 25;");
    expect(pangaCss).toContain("--z-header: 30;");
    expect(pangaCss).toContain(".app-header { z-index: var(--z-header);");
    expect(pangaCss).toContain(".ai-fab, .assistant-fab { z-index: var(--z-chrome); }");
    expect(pangaCss).toContain(".voice-fab, .pg-copy-fab { z-index: var(--z-floating); }");
    expect(pangaCss).toContain("@media (max-width: 820px)");
    expect(pangaCss).toContain(".app-logo { color: #15803d; }");
    expect(pangaCss).toContain(':root[data-theme="dark"] .app-logo { color: #4ade80; }');
    expect(pangaCss).toContain(".pg-connection-status");
    expect(indexCss).toContain('[data-tip-edge="left"]::after');
    expect(indexCss).toContain(":not(.shortcuts-tile-remove)");
  });
});
