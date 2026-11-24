import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import ShortcutsBar from "../ShortcutsBar";
import { resetGuestSession } from "../../../auth/session";
import { createTaskList } from "../../../data/taskLists";
import { createNoteFolder } from "../../../data/noteFolders";
import { createLink } from "../../../data/links";
import { autoNameFromUrl, listShortcuts, normalizeLinkUrl } from "../../../data/shortcuts";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let host: HTMLElement;
let currentRoute = "";

function RouteSpy() {
  const loc = useLocation();
  currentRoute = `${loc.pathname}${loc.search}`;
  return null;
}

async function mount() {
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () => {
    root!.render(
      <MemoryRouter initialEntries={["/home"]}>
        <Routes>
          <Route
            path="*"
            element={
              <>
                <RouteSpy />
                <ShortcutsBar />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    );
  });
  await settle();
}

async function settle(ms = 40) {
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
  return [...host.querySelectorAll("button")].find((b) => b.textContent?.trim() === text);
}

beforeEach(async () => {
  localStorage.clear();
  await resetGuestSession();
  currentRoute = "";
});

afterEach(async () => {
  vi.restoreAllMocks();
  await act(async () => root?.unmount());
  host?.remove();
  root = null;
});

describe("ShortcutsBar & shortcuts data", () => {
  it("normalizes pasted URLs and auto-names them cleanly", () => {
    expect(normalizeLinkUrl("github.com/openai")).toBe("https://github.com/openai");
    expect(normalizeLinkUrl("localhost:3000/docs")).toBe("http://localhost:3000/docs");
    expect(normalizeLinkUrl("not a valid link")).toBeNull();

    expect(autoNameFromUrl("https://www.github.com/openai")).toBe("github.com/openai");
    expect(autoNameFromUrl("https://docs.google.com/document/d/1A2B3C4D5E6F7G8H9I0J/edit")).toBe("docs.google.com");
  });

  it("pastes a link directly via Paste link button using clipboard API and auto-names the shortcut", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        readText: vi.fn().mockResolvedValue("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
      },
      configurable: true,
    });

    await mount();
    await click(buttonByText("Paste link"));

    const tileLink = host.querySelector(".shortcuts-grid .shortcuts-tile-link") as HTMLAnchorElement;
    expect(tileLink).not.toBeNull();
    expect(tileLink.tagName).toBe("A");
    expect(tileLink.href).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(tileLink.querySelector(".shortcuts-tile-name")?.textContent).toBe("youtube.com");

    const saved = await listShortcuts();
    expect(saved).toHaveLength(1);
    expect(saved[0].name).toBe("youtube.com");
  });

  it("falls back to inline paste input when clipboard read is blocked and adds on paste event", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        readText: vi.fn().mockRejectedValue(new Error("Permission denied")),
      },
      configurable: true,
    });

    await mount();
    await click(buttonByText("Paste link"));

    const input = host.querySelector('input[aria-label="Paste shortcut link"]') as HTMLInputElement;
    expect(input).not.toBeNull();

    await act(async () => {
      const ev = new Event("paste", { bubbles: true, cancelable: true }) as any;
      ev.clipboardData = { getData: () => "https://example.org/notes" };
      input.dispatchEvent(ev);
    });
    await settle();

    const tileLink = host.querySelector(".shortcuts-grid .shortcuts-tile-link") as HTMLAnchorElement;
    expect(tileLink).not.toBeNull();
    expect(tileLink.href).toBe("https://example.org/notes");
    expect(tileLink.querySelector(".shortcuts-tile-name")?.textContent).toBe("example.org/notes");
  });

  it("adds task lists, note folders, and saved links via + Add picker, navigates on click, and removes shortcuts", async () => {
    const list = await createTaskList({ title: "Compound Chores" });
    const folder = await createNoteFolder({ title: "Field Notes" });
    await createLink({ folderId: null, title: "Docs Portal", url: "https://docs.example.com" });

    await mount();
    await click(buttonByText("+ Add"));

    const picker = host.querySelector('[role="region"][aria-label="Add shortcut picker"]');
    expect(picker).not.toBeNull();
    expect(picker!.textContent).toContain("Compound Chores");
    expect(picker!.textContent).toContain("Field Notes");
    expect(picker!.textContent).toContain("Docs Portal");

    const listBtn = [...picker!.querySelectorAll("button.shortcuts-picker-item")].find((b) =>
      b.textContent?.includes("Compound Chores")
    );
    await click(listBtn);

    await click(buttonByText("+ Add"));
    const folderBtn = [...host.querySelectorAll("button.shortcuts-picker-item")].find((b) =>
      b.textContent?.includes("Field Notes")
    );
    await click(folderBtn);

    const tiles = [...host.querySelectorAll(".shortcuts-grid .shortcuts-tile")];
    expect(tiles).toHaveLength(2);
    expect(tiles[0].querySelector(".shortcuts-tile-name")?.textContent).toBe("Compound Chores");
    expect(tiles[1].querySelector(".shortcuts-tile-name")?.textContent).toBe("Field Notes");

    await click(tiles[0].querySelector(".shortcuts-tile-link"));
    expect(currentRoute).toBe(`/home?tab=Task%20lists&list=${encodeURIComponent(list.id)}`);

    await click(tiles[1].querySelector(".shortcuts-tile-link"));
    expect(currentRoute).toBe(`/home?tab=Notes&folder=${encodeURIComponent(folder.id)}`);

    await click(tiles[0].querySelector(".shortcuts-tile-remove"));
    expect(host.querySelectorAll(".shortcuts-grid .shortcuts-tile")).toHaveLength(1);
    expect((await listShortcuts()).map((s) => s.name)).toEqual(["Field Notes"]);
  });
});
