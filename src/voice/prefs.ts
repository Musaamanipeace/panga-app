import { useSyncExternalStore } from "react";
import type { EngineId } from "./types";
import type { WhisperModelKey } from "./models";

// Voice preferences are per-device (microphone, speed and storage differ by
// device), so they live in localStorage rather than the synced settings table.
export interface VoicePrefs {
  engine: EngineId;
  model: WhisperModelKey;
  lang: string;
  /** Models fully downloaded on this device (so they work offline). */
  ready: Partial<Record<WhisperModelKey, boolean>>;
}

const KEY = "panga.voice.prefs";
const DEFAULTS: VoicePrefs = { engine: "local", model: "tiny.en", lang: "en", ready: {} };

let cache: VoicePrefs | null = null;
const listeners = new Set<() => void>();

function read(): VoicePrefs {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(KEY) : null;
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    /* corrupt or unavailable storage: fall back to defaults */
  }
  return { ...DEFAULTS };
}

export function getVoicePrefs(): VoicePrefs {
  if (!cache) cache = read();
  return cache;
}

export function setVoicePrefs(patch: Partial<VoicePrefs>): void {
  cache = { ...getVoicePrefs(), ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* storage full or blocked: keep the in-memory value for this session */
  }
  listeners.forEach((l) => l());
}

export function markModelReady(model: WhisperModelKey): void {
  setVoicePrefs({ ready: { ...getVoicePrefs().ready, [model]: true } });
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useVoicePrefs(): VoicePrefs {
  return useSyncExternalStore(subscribe, getVoicePrefs, () => DEFAULTS);
}

/** Test helper. */
export function __resetVoicePrefsForTests(): void {
  cache = null;
}
