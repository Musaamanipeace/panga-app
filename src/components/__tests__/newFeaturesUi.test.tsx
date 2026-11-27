import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { resetGuestSession } from "../../auth/session";
import { db, switchWorkspaceDb } from "../../data/db";
import { addThought } from "../../data/thoughts";
import { createNote } from "../../data/notes";
import { createWorkspace, switchWorkspace } from "../../data/workspaces";
import { DEFAULT_WORKSPACE_ID, replaceWorkspaceEntries } from "../../data/workspaceState";
import NotesPanel from "../home/NotesPanel";
import ThoughtStream from "../home/ThoughtStream";
import GlobalSearch from "../GlobalSearch";
import WorkspaceSwitcher from "../WorkspaceSwitcher";
import { ConfirmDialogHost, ToastContainer } from "../ui";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let host: HTMLElement | null = null;

async function renderNode(node: React.ReactNode) {
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () => {
    root!.render(node);
  });
  await act(async () => {
    await new Promise((r) => setTimeout(r, 40));
  });
}

describe("Notes editor persistence, 5-item Thought history & copy, cross-workspace Search, and Add workspace controls", () => {
  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await resetGuestSession();
    replaceWorkspaceEntries([{ id: DEFAULT_WORKSPACE_ID, name: "Main" }]);
    await switchWorkspace(DEFAULT_WORKSPACE_ID);
    await switchWorkspaceDb();
    await db.open();
    await Promise.all([db.notes.clear(), db.noteFolders.clear(), db.trainOfThought.clear(), db.drafts.clear()]);
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

  it("defaults NotesPanel to an open editor and restores unsaved draft state across unmount/remount", async () => {
    await renderNode(
      <MemoryRouter>
        <NotesPanel />
        <ConfirmDialogHost />
      </MemoryRouter>
    );

    const titleInput = host!.querySelector<HTMLInputElement>('input[aria-label="Note title"]');
    const bodyInput = host!.querySelector<HTMLTextAreaElement>('textarea[aria-label="Note text"]');
    expect(titleInput).not.toBeNull();
    expect(bodyInput).not.toBeNull();

    // Update note title and body via React synthetic change
    const setNativeValue = (el: HTMLInputElement | HTMLTextAreaElement, val: string) => {
      const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, "value")!.set!;
      setter.call(el, val);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    };

    await act(async () => {
      setNativeValue(titleInput!, "Draft across reload");
      setNativeValue(bodyInput!, "Still here after unmount");
    });

    // Wait past the 200ms debounce, then unmount and remount
    await act(async () => {
      await new Promise((r) => setTimeout(r, 250));
      root!.unmount();
    });
    host!.remove();
    root = null;

    await renderNode(
      <MemoryRouter>
        <NotesPanel />
        <ConfirmDialogHost />
      </MemoryRouter>
    );

    expect(host!.querySelector<HTMLInputElement>('input[aria-label="Note title"]')?.value).toBe("Draft across reload");
    expect(host!.querySelector<HTMLTextAreaElement>('textarea[aria-label="Note text"]')?.value).toBe("Still here after unmount");
  });

  it("caps ThoughtStream at 5 items before 'Show history (6)' -> 'Show fewer' and includes a Copy button per thought", async () => {
    for (let i = 1; i <= 6; i++) {
      await addThought(`Thought number ${i}`);
      await new Promise((r) => setTimeout(r, 5));
    }

    await renderNode(
      <MemoryRouter>
        <ThoughtStream />
        <ToastContainer />
        <ConfirmDialogHost />
      </MemoryRouter>
    );

    expect(host!.querySelectorAll("li.pg-row")).toHaveLength(5);
    const historyBtn = [...host!.querySelectorAll("button")].find((b) =>
      b.textContent?.includes("Show history (6)")
    );
    expect(historyBtn).toBeDefined();

    // Verify per-item Copy button exists
    const copyBtns = [...host!.querySelectorAll('button[aria-label="Copy"], button')].filter(
      (b) => b.textContent?.trim() === "Copy" || b.getAttribute("aria-label") === "Copy"
    );
    expect(copyBtns.length).toBeGreaterThanOrEqual(5);

    await act(async () => {
      historyBtn!.click();
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 40));
    });

    expect(host!.querySelectorAll("li.pg-row")).toHaveLength(6);
    expect(host!.textContent).toContain("Show fewer");
  });

  it("searches across other workspaces in GlobalSearch, labels the workspace, and switches on click", async () => {
    const dev = await createWorkspace("Backend Lab");
    await createNote({ folderId: null, title: "Postgres connection pool", body: "Max connections 20" });
    await switchWorkspace(DEFAULT_WORKSPACE_ID);

    await renderNode(
      <MemoryRouter>
        <GlobalSearch />
      </MemoryRouter>
    );

    const trigger = host!.querySelector<HTMLButtonElement>("button.global-search-trigger")!;
    await act(async () => {
      trigger.click();
    });

    const input = host!.querySelector<HTMLInputElement>('input[aria-label="Search across all workspaces"]')!;
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
      setter.call(input, "Postgres");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 60));
    });

    const card = host!.querySelector<HTMLButtonElement>("button.search-card");
    expect(card).not.toBeNull();
    expect(card!.querySelector(".search-card-ws")?.textContent).toBe("Backend Lab");

    await act(async () => {
      card!.click();
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    const { getActiveWorkspaceId } = await import("../../data/workspaceState");
    expect(getActiveWorkspaceId()).toBe(dev.id);
  });

  it("renders separate '+ Add workspace' button, opens dialog with top-right x and bottom Cancel, and closes on Escape", async () => {
    await renderNode(
      <>
        <WorkspaceSwitcher onChanged={() => {}} />
        <ConfirmDialogHost />
      </>
    );

    const addBtn = host!.querySelector<HTMLButtonElement>("button.workspace-add-btn");
    expect(addBtn).not.toBeNull();
    expect(addBtn!.textContent).toContain("+ Add workspace");

    await act(async () => {
      addBtn!.click();
    });

    const dialog = host!.querySelector('[role="dialog"][aria-label="Add workspace"]');
    expect(dialog).not.toBeNull();
    expect(dialog!.querySelector("button.modal-close-x")).not.toBeNull();
    expect([...dialog!.querySelectorAll("button")].some((b) => b.textContent?.trim() === "Cancel")).toBe(true);

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(host!.querySelector('[role="dialog"][aria-label="Add workspace"]')).toBeNull();
  });
});
