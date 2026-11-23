import { afterEach, describe, expect, it, vi } from "vitest";
import {
  analyzeVoiceStatus,
  detectDeviceOs,
  getTtsPlayback,
  loadTtsPrefs,
  pauseSpeaking,
  resumeSpeaking,
  saveTtsPrefs,
  speak,
  splitIntoChunks,
  stopSpeaking,
  TTS_STOPPED_EVENT,
} from "../tts";

function makeVoice(opts: { name: string; lang: string; localService: boolean; voiceURI?: string }): SpeechSynthesisVoice {
  return {
    name: opts.name,
    lang: opts.lang,
    localService: opts.localService,
    voiceURI: opts.voiceURI ?? opts.name,
    default: false,
  } as SpeechSynthesisVoice;
}

describe("splitIntoChunks", () => {
  it("returns nothing for blank text", () => {
    expect(splitIntoChunks("   \n ")).toEqual([]);
  });
  it("keeps short text in one chunk", () => {
    expect(splitIntoChunks("Hello there. How are you?")).toEqual(["Hello there. How are you?"]);
  });
  it("splits long text into chunks no longer than the limit", () => {
    const sentence = "This is a fairly ordinary sentence about nothing in particular.";
    const text = Array(20).fill(sentence).join(" ");
    const chunks = splitIntoChunks(text, 120);
    expect(chunks.length).toBeGreaterThan(5);
    for (const c of chunks) expect(c.length).toBeLessThanOrEqual(120);
    expect(chunks.join(" ").replace(/\s+/g, " ")).toBe(text);
  });
  it("breaks a single endless sentence on words", () => {
    const text = Array(100).fill("word").join(" ");
    const chunks = splitIntoChunks(text, 50);
    for (const c of chunks) expect(c.length).toBeLessThanOrEqual(50);
    expect(chunks.join(" ")).toBe(text);
  });
});

describe("read-aloud preferences", () => {
  it("round-trips the chosen voice and rate", () => {
    saveTtsPrefs({ voiceURI: "voice-1", rate: 1.4 });
    expect(loadTtsPrefs()).toEqual({ voiceURI: "voice-1", rate: 1.4 });
    saveTtsPrefs({ voiceURI: null, rate: 1 });
  });

  it("announces when reading stops so buttons can reset", () => {
    let events = 0;
    const listener = () => events++;
    window.addEventListener(TTS_STOPPED_EVENT, listener);
    stopSpeaking();
    window.removeEventListener(TTS_STOPPED_EVENT, listener);
    expect(events).toBe(1);
  });
});

describe("analyzeVoiceStatus", () => {
  it("reports Not supported when Web Speech is missing", () => {
    const res = analyzeVoiceStatus([], { supported: false, userLang: "en-US" });
    expect(res.kind).toBe("not-supported");
    expect(res.label).toBe("Not supported");
  });

  it("reports No voices found when list is empty", () => {
    const res = analyzeVoiceStatus([], { supported: true, userLang: "en-US" });
    expect(res.kind).toBe("no-voices");
    expect(res.label).toBe("No voices found");
  });

  it("reports Online voices only when no voice has localService", () => {
    const res = analyzeVoiceStatus(
      [makeVoice({ name: "Google US English", lang: "en-US", localService: false })],
      { supported: true, userLang: "en-US" },
    );
    expect(res.kind).toBe("online-only");
    expect(res.label).toBe("Online voices only");
  });

  it("reports Ready offline and names the local voice matching user language", () => {
    const res = analyzeVoiceStatus(
      [
        makeVoice({ name: "Online Voice", lang: "en-US", localService: false }),
        makeVoice({ name: "Samantha", lang: "en-US", localService: true }),
      ],
      { supported: true, userLang: "en-GB" },
    );
    expect(res.kind).toBe("ready");
    expect(res.label).toBe("Ready offline (Samantha)");
    expect(res.otherLanguageOnly).toBe(false);
  });

  it("notes when local voices are only in another language", () => {
    const res = analyzeVoiceStatus(
      [makeVoice({ name: "Amelie", lang: "fr-FR", localService: true })],
      { supported: true, userLang: "en-US" },
    );
    expect(res.kind).toBe("ready");
    expect(res.otherLanguageOnly).toBe(true);
    expect(res.voice?.name).toBe("Amelie");
  });
});

describe("detectDeviceOs", () => {
  it("detects android, iphone, windows, and mac", () => {
    expect(detectDeviceOs("Mozilla/5.0 (Linux; Android 14; Pixel 8)")).toBe("android");
    expect(detectDeviceOs("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")).toBe("iphone");
    expect(detectDeviceOs("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe("windows");
    expect(detectDeviceOs("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)")).toBe("mac");
  });
});

describe("sentence-based pause and resume", () => {
  const origSynth = Object.getOwnPropertyDescriptor(window, "speechSynthesis");
  const origUtt = Object.getOwnPropertyDescriptor(window, "SpeechSynthesisUtterance");

  afterEach(() => {
    stopSpeaking();
    if (origSynth) Object.defineProperty(window, "speechSynthesis", origSynth);
    else delete (window as unknown as Record<string, unknown>).speechSynthesis;
    if (origUtt) Object.defineProperty(window, "SpeechSynthesisUtterance", origUtt);
    else delete (window as unknown as Record<string, unknown>).SpeechSynthesisUtterance;
  });

  function installMockSpeech(voices: SpeechSynthesisVoice[]) {
    const spoken: Array<{ text: string; onend?: () => void; onerror?: (e: { error: string }) => void }> = [];
    const cancel = vi.fn(() => {
      const last = spoken[spoken.length - 1];
      last?.onerror?.({ error: "canceled" });
    });
    const pause = vi.fn();

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
        getVoices: () => voices,
        addEventListener: vi.fn(),
        speak: (u: FakeUtterance) => {
          spoken.push({
            text: u.text,
            onend: () => u.onend?.(),
            onerror: (e) => u.onerror?.(e),
          });
        },
        cancel,
        pause,
      },
    });
    return { spoken, cancel, pause };
  }

  it("stops on pause, remembers sentence, and restarts from that sentence on resume", async () => {
    const { spoken, cancel, pause } = installMockSpeech([
      makeVoice({ name: "Local EN", lang: "en-US", localService: true }),
    ]);

    const longText = `${"First sentence is long enough to sit in chunk one alone. ".repeat(4)}Second chunk begins here.`;
    let ended = false;
    await speak(longText, { ownerId: "btn-1", onEnd: () => { ended = true; } });

    expect(spoken.length).toBe(1);
    expect(getTtsPlayback()).toEqual({ ownerId: "btn-1", status: "speaking" });

    // Finish chunk 0 -> advances to chunk 1
    spoken[0].onend?.();
    expect(spoken.length).toBe(2);
    const secondChunkText = spoken[1].text;

    // Pause during chunk 1: uses cancel(), NOT native pause()
    pauseSpeaking();
    expect(pause).not.toHaveBeenCalled();
    expect(cancel).toHaveBeenCalledTimes(2); // 1 in speak() + 1 in pauseSpeaking()
    expect(getTtsPlayback()).toEqual({ ownerId: "btn-1", status: "paused" });
    expect(ended).toBe(false);

    // Resume restarts from chunk 1
    resumeSpeaking();
    expect(getTtsPlayback()).toEqual({ ownerId: "btn-1", status: "speaking" });
    expect(spoken.length).toBe(3);
    expect(spoken[2].text).toBe(secondChunkText);

    // Complete chunk 1 -> finishes
    spoken[2].onend?.();
    expect(ended).toBe(true);
    expect(getTtsPlayback()).toEqual({ ownerId: null, status: "idle" });
  });
});
