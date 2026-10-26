import { LANGUAGES } from "../models";
import type { EngineEvents, EngineOptions, VoiceEngine } from "../types";

function getCtor(): any {
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition;
}

export function isBrowserSpeechSupported(): boolean {
  return typeof window !== "undefined" && !!getCtor();
}

function browserLang(code: string): string {
  if (code === "en" && typeof navigator !== "undefined" && /^en/i.test(navigator.language)) {
    return navigator.language;
  }
  return LANGUAGES.find((l) => l.code === code)?.browser ?? "en-US";
}

/**
 * The browser's built-in recognizer. Gives live words as you speak, but the
 * browser (Chrome/Edge/Safari) sends audio to its vendor's servers, so it needs
 * an internet connection and is not private.
 */
export function createBrowserSpeechEngine(): VoiceEngine {
  let recognition: any = null;
  let active = false;

  return {
    id: "browser",

    async start(ev: EngineEvents, options: EngineOptions) {
      const Ctor = getCtor();
      if (!Ctor) throw new Error("This browser has no built-in speech recognition.");
      active = true;
      const rec = new Ctor();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = browserLang(options.lang);

      rec.onstart = () => ev.onStatus({ kind: "listening" });
      rec.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const r = event.results[i];
          const text: string = r[0].transcript;
          if (r.isFinal) {
            const t = text.trim();
            if (t) ev.onFinal(t);
            interim = "";
          } else {
            interim += text;
          }
        }
        ev.onInterim(interim.trim());
      };
      rec.onerror = (event: any) => {
        const code: string = event.error;
        if (code === "no-speech" || code === "aborted") return;
        active = false;
        if (code === "not-allowed" || code === "service-not-allowed") {
          ev.onError("Microphone access was blocked. Allow it in your browser's site settings.");
        } else if (code === "network") {
          ev.onError("Browser speech recognition needs an internet connection. Switch to offline mode in Settings.");
        } else {
          ev.onError(`Speech recognition error: ${code}`);
        }
      };
      rec.onend = () => {
        if (active) {
          // Browsers end a session after a pause; keep dictation going.
          setTimeout(() => {
            if (!active) return;
            try {
              rec.start();
            } catch {
              active = false;
              ev.onStatus({ kind: "idle" });
            }
          }, 150);
        } else {
          ev.onStatus({ kind: "idle" });
        }
      };

      recognition = rec;
      rec.start();
    },

    async stop() {
      active = false;
      try {
        recognition?.stop();
      } catch {
        /* not running */
      }
      recognition = null;
    },
  };
}
