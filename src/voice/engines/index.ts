import type { EngineId, VoiceEngine } from "../types";
import { createBrowserSpeechEngine, isBrowserSpeechSupported } from "./browserSpeech";
import { createLocalWhisperEngine, isLocalWhisperSupported } from "./localWhisper";
import { createServerWhisperEngine, isServerEngineSupported } from "./serverWhisper";

export { probeServerEngine } from "./serverWhisper";

export function isEngineSupported(id: EngineId): boolean {
  if (id === "local") return isLocalWhisperSupported();
  if (id === "browser") return isBrowserSpeechSupported();
  return isServerEngineSupported();
}

export function createEngine(id: EngineId): VoiceEngine {
  if (id === "local") return createLocalWhisperEngine();
  if (id === "browser") return createBrowserSpeechEngine();
  return createServerWhisperEngine();
}

/**
 * The engine to use: the user's choice if this device supports it, otherwise
 * the first one that works (offline first, then browser, then server).
 */
export function resolveEngineId(preferred: EngineId): EngineId | null {
  if (isEngineSupported(preferred)) return preferred;
  const order: EngineId[] = ["local", "browser", "server"];
  return order.find((id) => id !== preferred && isEngineSupported(id)) ?? null;
}
