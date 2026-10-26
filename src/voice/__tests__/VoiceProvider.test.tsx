// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import VoiceProvider from "../VoiceProvider";
import type { EngineEvents, EngineOptions, VoiceEngine } from "../types";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** A scripted engine: the test decides when phrases "arrive". */
function fakeEngine() {
  let ev: EngineEvents | null = null;
  const engine: VoiceEngine & { say(t: string): void; started: number; stopped: number } = {
    id: "browser",
    started: 0,
    stopped: 0,
    async start(e: EngineEvents, _o: EngineOptions) {
      ev = e;
      engine.started++;
      e.onStatus({ kind: "listening" });
    },
    async stop() {
      engine.stopped++;
      ev?.onStatus({ kind: "idle" });
    },
    say(t) {
      ev?.onFinal(t);
    },
  };
  return engine;
}

let root: Root | null = null;
afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.innerHTML = "";
});

function mount(engine: VoiceEngine) {
  const state = { title: "", notes: "" };
  function Form() {
    const [title, setTitle] = useState("Project plan");
    const [notes, setNotes] = useState("First draft of notes");
    state.title = title;
    state.notes = notes;
    return (
      <>
        <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <input id="secret" type="password" />
        <button id="other">other</button>
      </>
    );
  }
  const host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  act(() => {
    root!.render(
      <VoiceProvider testEngine={engine}>
        <Form />
      </VoiceProvider>,
    );
  });
  return state;
}

const $ = <T extends HTMLElement>(sel: string) => document.querySelector(sel) as T;
const mic = () => document.querySelector<HTMLButtonElement>("[data-voice-ui] button");
const focus = (el: HTMLElement) => act(() => el.focus());

describe("VoiceProvider", () => {
  it("shows no mic until a text field is focused, and none for password fields", () => {
    mount(fakeEngine());
    expect(mic()).toBeNull();
    focus($("#title"));
    expect(mic()).not.toBeNull();
    focus($("#secret"));
    expect(mic()).toBeNull();
  });

  it("dictates at the caret of the focused field, without overwriting", async () => {
    const engine = fakeEngine();
    const state = mount(engine);
    const notes = $<HTMLTextAreaElement>("#notes");
    focus(notes);
    notes.setSelectionRange(5, 5); // after "First"
    await act(async () => void mic()!.click());
    expect(engine.started).toBe(1);

    act(() => engine.say("and final"));
    expect(state.notes).toBe("First and final draft of notes");
    act(() => engine.say("version"));
    expect(state.notes).toBe("First and final version draft of notes");
    expect(state.title).toBe("Project plan"); // the other field is untouched
  });

  it("follows the cursor to another field mid-dictation", async () => {
    const engine = fakeEngine();
    const state = mount(engine);
    focus($("#notes"));
    await act(async () => void mic()!.click());
    focus($("#title"));
    $<HTMLInputElement>("#title").setSelectionRange(7, 7); // after "Project"
    act(() => engine.say("Alpha"));
    expect(state.title).toBe("Project Alpha plan");
    expect(state.notes).toBe("First draft of notes");
  });

  it("stops when focus moves to something that is not a text field", async () => {
    const engine = fakeEngine();
    mount(engine);
    focus($("#title"));
    await act(async () => void mic()!.click());
    await act(async () => $("#other").focus());
    expect(engine.stopped).toBe(1);
  });

  it("Escape stops dictation", async () => {
    const engine = fakeEngine();
    mount(engine);
    focus($("#title"));
    await act(async () => void mic()!.click());
    await act(async () =>
      void document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })),
    );
    expect(engine.stopped).toBe(1);
  });

  it("keeps focus in the field when the mic is pressed (so the caret is not lost)", () => {
    mount(fakeEngine());
    focus($("#title"));
    const ev = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
    mic()!.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
  });

  it("shows an error from the engine and stops", async () => {
    const engine = fakeEngine();
    engine.start = vi.fn(async (e: EngineEvents) => {
      e.onError("Microphone access was blocked.");
    });
    mount(engine);
    focus($("#title"));
    await act(async () => void mic()!.click());
    expect(document.body.textContent).toContain("Microphone access was blocked.");
    expect(mic()!.getAttribute("aria-pressed")).toBe("false");
  });
});
