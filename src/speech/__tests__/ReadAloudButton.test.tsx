import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import ReadAloudButton from "../../components/ReadAloudButton";
import { ToastContainer } from "../../components/ui";
import { stopSpeaking } from "../tts";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("ReadAloudButton", () => {
  const origSynth = Object.getOwnPropertyDescriptor(window, "speechSynthesis");
  const origUtt = Object.getOwnPropertyDescriptor(window, "SpeechSynthesisUtterance");

  afterEach(() => {
    stopSpeaking();
    if (origSynth) Object.defineProperty(window, "speechSynthesis", origSynth);
    else delete (window as unknown as Record<string, unknown>).speechSynthesis;
    if (origUtt) Object.defineProperty(window, "SpeechSynthesisUtterance", origUtt);
    else delete (window as unknown as Record<string, unknown>).SpeechSynthesisUtterance;
  });

  it("switches Read -> Pause + Stop -> Resume + Stop and shows Set up offline voice toast", async () => {
    class FakeUtterance {
      text: string;
      voice: SpeechSynthesisVoice | null = null;
      lang = "";
      rate = 1;
      onend: (() => void) | null = null;
      onerror: ((e: { error: string }) => void) | null = null;
      constructor(t: string) {
        this.text = t;
      }
    }

    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      configurable: true,
      value: FakeUtterance,
    });
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        getVoices: () => [
          {
            name: "Cloud Voice",
            lang: "en-US",
            localService: false,
            voiceURI: "Cloud Voice",
            default: false,
          } as SpeechSynthesisVoice,
        ],
        addEventListener: vi.fn(),
        speak: vi.fn(),
        cancel: vi.fn(),
      },
    });

    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={["/home"]}>
          <Routes>
            <Route
              path="/home"
              element={
                <>
                  <ReadAloudButton text="Hello world." />
                  <ToastContainer />
                </>
              }
            />
            <Route path="/settings" element={<div>Settings Page</div>} />
          </Routes>
        </MemoryRouter>,
      );
    });

    const getBtn = (label: string) =>
      [...host.querySelectorAll("button")].find((b) => b.textContent?.trim() === label);

    expect(getBtn("Read")).toBeTruthy();

    await act(async () => {
      getBtn("Read")!.click();
      await new Promise((r) => setTimeout(r, 20));
    });

    expect(getBtn("Pause")).toBeTruthy();
    expect(getBtn("Stop")).toBeTruthy();
    expect(getBtn("Set up offline voice")).toBeTruthy();

    await act(async () => {
      getBtn("Pause")!.click();
    });
    expect(getBtn("Resume")).toBeTruthy();
    expect(getBtn("Stop")).toBeTruthy();

    await act(async () => {
      getBtn("Stop")!.click();
    });
    expect(getBtn("Read")).toBeTruthy();

    await act(async () => {
      getBtn("Set up offline voice")!.click();
    });
    expect(host.textContent).toContain("Settings Page");

    await act(async () => root.unmount());
    host.remove();
  });
});
