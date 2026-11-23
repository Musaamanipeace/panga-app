import "fake-indexeddb/auto";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import Settings from "../Settings";
import { db } from "../../data/db";
import { getAIApiKey, getAIProvider } from "../../data/settings";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLElement | null = null;
let root: Root | null = null;

async function mountSettings() {
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () => {
    root!.render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );
  });
  await act(async () => {
    await new Promise((r) => setTimeout(r, 40));
  });
}

afterEach(async () => {
  if (root) {
    await act(async () => root!.unmount());
    root = null;
  }
  host?.remove();
  host = null;
  await db.settings.clear();
});

describe("Settings AI configuration", () => {
  it("omits model selection UI and lets users save provider and API key directly", async () => {
    await mountSettings();

    expect(host!.textContent).not.toContain("Select a model");
    expect(host!.textContent).not.toContain("Free only");

    const aiSection = host!.querySelector("section.settings-section")!;
    const selects = aiSection.querySelectorAll("select");
    expect(selects).toHaveLength(1);

    const providerSelect = selects[0] as HTMLSelectElement;
    const keyInput = aiSection.querySelector('input[type="password"]') as HTMLInputElement;
    const form = aiSection.querySelector("form") as HTMLFormElement;

    const selectSetter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value")!.set!;
    await act(async () => {
      selectSetter.call(providerSelect, "gemini");
      providerSelect.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });

    const inputSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
    await act(async () => {
      inputSetter.call(keyInput, "gemini-key-123");
      keyInput.dispatchEvent(new Event("input", { bubbles: true }));
      keyInput.dispatchEvent(new Event("change", { bubbles: true }));
    });

    await act(async () => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 40));
    });

    expect(await getAIProvider()).toBe("gemini");
    expect(await getAIApiKey("gemini")).toBe("gemini-key-123");
  });
});
