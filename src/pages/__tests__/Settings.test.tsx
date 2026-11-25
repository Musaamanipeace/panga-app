import "fake-indexeddb/auto";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import Settings from "../Settings";
import { db } from "../../data/db";
import { AI_PROVIDER_IDS, getAIApiKey, getAIProvider } from "../../data/settings";

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

async function unmountSettings() {
  if (root) {
    await act(async () => root!.unmount());
    root = null;
  }
  host?.remove();
  host = null;
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(async () => {
  await unmountSettings();
  await db.settings.clear();
  localStorage.clear();
});

describe("Settings AI configuration", () => {
  it("renders all providers with individual text boxes and persistent Saved state without a dropdown", async () => {
    await mountSettings();

    expect(host!.textContent).not.toContain("Select a model");
    expect(host!.textContent).not.toContain("Free only");

    const aiSection = host!.querySelector("section.settings-section")!;
    expect(aiSection.querySelectorAll("select")).toHaveLength(0);

    for (const id of AI_PROVIDER_IDS) {
      expect(aiSection.querySelector(`form[data-provider="${id}"]`)).not.toBeNull();
      expect(aiSection.querySelector(`[data-testid="ai-status-${id}"]`)?.textContent).toBe("Not saved");
    }

    const inputSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;

    // Type a Gemini key and let auto-save persist it (even without clicking Save)
    const geminiForm = aiSection.querySelector('form[data-provider="gemini"]')!;
    const geminiInput = geminiForm.querySelector('input[type="password"]') as HTMLInputElement;

    await act(async () => {
      inputSetter.call(geminiInput, "gemini-key-123");
      geminiInput.dispatchEvent(new Event("input", { bubbles: true }));
      geminiInput.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 320));
    });

    expect(await getAIApiKey("gemini")).toBe("gemini-key-123");
    expect(await getAIProvider()).toBe("gemini");
    expect(aiSection.querySelector('[data-testid="ai-status-gemini"]')?.textContent).toBe("Saved");

    // Save an OpenAI key too and switch active provider
    const openaiForm = aiSection.querySelector('form[data-provider="openai"]')!;
    const openaiInput = openaiForm.querySelector('input[type="password"]') as HTMLInputElement;
    await act(async () => {
      inputSetter.call(openaiInput, "openai-key-456");
      openaiInput.dispatchEvent(new Event("input", { bubbles: true }));
      openaiInput.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await act(async () => {
      openaiForm.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 40));
    });

    expect(await getAIApiKey("openai")).toBe("openai-key-456");
    expect(aiSection.querySelector('[data-testid="ai-status-openai"]')?.textContent).toBe("Saved");

    // Remount Settings and confirm both keys stay Saved persistently
    await unmountSettings();
    await mountSettings();

    const reloadedSection = host!.querySelector("section.settings-section")!;
    expect(reloadedSection.querySelector('[data-testid="ai-status-gemini"]')?.textContent).toBe("Saved");
    expect(reloadedSection.querySelector('[data-testid="ai-status-openai"]')?.textContent).toBe("Saved");
    expect(reloadedSection.querySelector('[data-testid="ai-status-groq"]')?.textContent).toBe("Not saved");

    // Clear OpenAI key and verify state returns to Not saved
    const reloadedOpenAiForm = reloadedSection.querySelector('form[data-provider="openai"]')!;
    const clearBtn = [...reloadedOpenAiForm.querySelectorAll("button")].find((b) => b.textContent?.trim() === "Clear");
    await act(async () => {
      clearBtn?.click();
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 40));
    });

    expect(await getAIApiKey("openai")).toBeNull();
    expect(reloadedSection.querySelector('[data-testid="ai-status-openai"]')?.textContent).toBe("Not saved");
    expect(reloadedSection.querySelector('[data-testid="ai-status-gemini"]')?.textContent).toBe("Saved");
  });

  it("starts inputs empty without autofill and reveals saved keys via 1-click eye toggle that auto-hides", async () => {
    await mountSettings();

    const aiSection = host!.querySelector("section.settings-section")!;
    for (const id of AI_PROVIDER_IDS) {
      const form = aiSection.querySelector(`form[data-provider="${id}"]`)!;
      const input = form.querySelector("input[type='password']") as HTMLInputElement;
      expect(input.value).toBe("");
      expect(input.getAttribute("autocomplete")).toBe("new-password");
      expect(input.readOnly).toBe(true);
      expect(form.querySelector(`button[aria-label^="View "]`)).toBeNull();
    }

    const geminiForm = aiSection.querySelector('form[data-provider="gemini"]')!;
    const geminiInput = geminiForm.querySelector("input[type='password']") as HTMLInputElement;

    await act(async () => {
      geminiInput.focus();
    });
    expect(geminiInput.readOnly).toBe(false);

    const inputSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
    await act(async () => {
      inputSetter.call(geminiInput, "AIza-human-key");
      geminiInput.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () => {
      geminiForm.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 40));
    });

    expect(aiSection.querySelector('[data-testid="ai-status-gemini"]')?.textContent).toBe("Saved");
    const viewBtn = geminiForm.querySelector('button[aria-label="View Google Gemini API key"]') as HTMLButtonElement;
    expect(viewBtn).not.toBeNull();

    await act(async () => {
      viewBtn.click();
    });
    expect(geminiInput.type).toBe("text");

    await act(async () => {
      await new Promise((r) => setTimeout(r, 4150));
    });
    expect(geminiInput.type).toBe("password");
  }, 10000);
});
