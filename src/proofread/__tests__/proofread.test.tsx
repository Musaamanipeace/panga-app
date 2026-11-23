import "fake-indexeddb/auto";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import Proofread from "../../components/Proofread";
import * as chatMod from "../../ai/chat";
import {
  buildProofreadSystemPrompt,
  parseProofreadReply,
  PROOFREAD_FORMATTING_PARAGRAPH,
  PROOFREAD_PROMPT,
  PROOFREAD_PROTOCOL_PARAGRAPH,
} from "../prompt";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLElement | null = null;
let root: Root | null = null;

async function mountProofread(initialText = "") {
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () => {
    root!.render(
      <MemoryRouter>
        <Proofread initialText={initialText} />
      </MemoryRouter>,
    );
  });
}

async function typeIntoTextarea(el: HTMLTextAreaElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!;
  await act(async () => {
    setter.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

async function typeIntoInput(el: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
  await act(async () => {
    setter.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

function getButton(label: string) {
  return [...(host?.querySelectorAll("button") ?? [])].find((b) =>
    b.textContent?.trim().includes(label),
  );
}

afterEach(async () => {
  vi.restoreAllMocks();
  if (root) {
    await act(async () => root!.unmount());
    root = null;
  }
  host?.remove();
  host = null;
});

describe("proofread prompt & parser", () => {
  it("keeps the core Appendix prompt untouched and appends protocol / formatting only", () => {
    const grammarSys = buildProofreadSystemPrompt("grammar");
    expect(grammarSys.startsWith(PROOFREAD_PROMPT)).toBe(true);
    expect(grammarSys).toContain(PROOFREAD_PROTOCOL_PARAGRAPH);
    expect(grammarSys).not.toContain(PROOFREAD_FORMATTING_PARAGRAPH);

    const fmtSys = buildProofreadSystemPrompt("formatting");
    expect(fmtSys.startsWith(PROOFREAD_PROMPT)).toBe(true);
    expect(fmtSys).toContain(PROOFREAD_FORMATTING_PARAGRAPH);
    expect(fmtSys).toContain(PROOFREAD_PROTOCOL_PARAGRAPH);
  });

  it("parses CLARIFY: replies vs plain corrected text", () => {
    const c = parseProofreadReply(
      'CLARIFY:\nWhich spelling of "panga" did you mean?\n1. Panga\n2. Pangea\n3. Type your own',
    );
    expect(c).toEqual({
      kind: "clarify",
      question: 'Which spelling of "panga" did you mean?',
      options: ["Panga", "Pangea", "Type your own"],
      raw: 'CLARIFY:\nWhich spelling of "panga" did you mean?\n1. Panga\n2. Pangea\n3. Type your own',
    });

    const ok = parseProofreadReply("How do I split screen with Super + Left?");
    expect(ok).toEqual({
      kind: "corrected",
      text: "How do I split screen with Super + Left?",
    });
  });
});

describe("Proofread component", () => {
  it("transforms text in place as read-only with Copy and Edit buttons", async () => {
    const spy = vi.spyOn(chatMod, "chatCompletion").mockResolvedValueOnce({
      text: "How do I split screen with Super + Left?",
      provider: "openrouter",
      model: "test-model",
    });

    await mountProofread("how do i split screen super key plus left");
    const box = host!.querySelector("textarea")!;
    expect(box.readOnly).toBe(false);
    expect(getButton("Copy")).toBeUndefined();
    expect(getButton("Edit")).toBeUndefined();

    await act(async () => {
      getButton("Grammar & spelling")!.click();
    });

    expect(spy).toHaveBeenCalledWith(
      [{ role: "user", content: "how do i split screen super key plus left" }],
      { system: buildProofreadSystemPrompt("grammar") },
    );
    expect(box.value).toBe("How do I split screen with Super + Left?");
    expect(box.readOnly).toBe(true);
    expect(getButton("Copy")).toBeTruthy();
    expect(getButton("Edit")).toBeTruthy();

    await act(async () => {
      getButton("Edit")!.click();
    });
    expect(box.readOnly).toBe(false);
    await typeIntoTextarea(box, "edited text");
    expect(box.value).toBe("edited text");
  });

  it("handles CLARIFY: flow with option or custom answer and sends formatting prompt", async () => {
    const spy = vi
      .spyOn(chatMod, "chatCompletion")
      .mockResolvedValueOnce({
        text: 'CLARIFY:\nWhat did you mean by "teh"?\n1. the\n2. tea',
        provider: "openrouter",
        model: "test-model",
      })
      .mockResolvedValueOnce({
        text: "Make the report today.",
        provider: "openrouter",
        model: "test-model",
      });

    await mountProofread("make teh report today");
    await act(async () => {
      getButton("Formatting")!.click();
    });

    expect(host!.textContent).toContain('What did you mean by "teh"?');
    expect(host!.textContent).not.toContain("CLARIFY:");
    expect(getButton("1. the")).toBeTruthy();

    const customInput = host!.querySelector('input[aria-label="Custom clarification"]') as HTMLInputElement;
    await typeIntoInput(customInput, "the");
    await act(async () => {
      getButton("Send answer")!.click();
    });

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][1]?.system).toContain(PROOFREAD_FORMATTING_PARAGRAPH);
    expect(spy.mock.calls[1][0][2].content).toContain("make teh report today");
    expect(spy.mock.calls[1][0][2].content).toContain("the");

    const box = host!.querySelector("textarea")!;
    expect(box.value).toBe("Make the report today.");
    expect(box.readOnly).toBe(true);
  });

  it("shows a clear message when offline or missing AI key", async () => {
    vi.spyOn(chatMod, "chatCompletion").mockRejectedValueOnce(
      new Error("No API key for OpenRouter. Add one in Settings → AI assistant."),
    );
    await mountProofread("check this");
    await act(async () => {
      getButton("Grammar & spelling")!.click();
    });
    expect(host!.textContent).toContain("No API key");
  });
});
