// Warms the selected local Whisper model on app start so the first dictation
// does not wait for a download plus worker initialisation.

import { getVoicePrefs } from "./prefs";
import { resolveEngineId } from "./engines";
import { preloadWhisperModel } from "./engines/localWhisper";
import type { WhisperModelKey } from "./models";

export interface WarmupState {
  phase: "idle" | "warming" | "ready" | "error";
  model: WhisperModelKey | null;
  progress: number | null;
  device: string | null;
  message: string;
}

let state: WarmupState = { phase: "idle", model: null, progress: null, device: null, message: "" };
const listeners = new Set<(s: WarmupState) => void>();

export function getWarmupState(): WarmupState {
  return state;
}

export function subscribeWarmup(fn: (s: WarmupState) => void): () => void {
  listeners.add(fn);
  fn(state);
  return () => listeners.delete(fn);
}

function set(next: WarmupState) {
  state = next;
  listeners.forEach((l) => l(state));
}

/** Call once at app start. Safe to call repeatedly; a cached model is instant. */
export function warmupVoiceModel(): void {
  if (typeof window === "undefined") return;
  const prefs = getVoicePrefs();
  if (resolveEngineId(prefs.engine) !== "local") return;

  const run = () => {
    const model = getVoicePrefs().model;
    set({ phase: "warming", model, progress: null, device: null, message: "Warming up speech model…" });
    void preloadWhisperModel(model, (progress) => {
      set({ phase: "warming", model, progress, device: null, message: "Warming up speech model…" });
    })
      .then(() => set({ phase: "ready", model, progress: null, device: null, message: "Speech model ready" }))
      .catch((err: unknown) =>
        set({
          phase: "error",
          model,
          progress: null,
          device: null,
          message: err instanceof Error ? err.message : "Speech model failed to load",
        })
      );
  };

  // Keep the first render quick: warm up once the browser is otherwise idle.
  const w = window as unknown as {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  };
  if (w.requestIdleCallback) w.requestIdleCallback(run, { timeout: 3000 });
  else window.setTimeout(run, 1200);
}
