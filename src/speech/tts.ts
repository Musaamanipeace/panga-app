// Read-aloud using the browser's built-in speech synthesis.
// Pause stops speech and remembers the current sentence; Resume restarts from
// that sentence because native speechSynthesis.pause() is unreliable on Android Chrome.

export interface TtsPrefs {
  voiceURI: string | null;
  rate: number;
}

const PREF_KEY = "panga_tts_prefs";
const NOTICE_DISMISSED_KEY = "panga_tts_notice_dismissed";

export function loadTtsPrefs(): TtsPrefs {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (raw) return { voiceURI: null, rate: 1, ...(JSON.parse(raw) as Partial<TtsPrefs>) };
  } catch {
    /* ignore */
  }
  return { voiceURI: null, rate: 1 };
}

export function saveTtsPrefs(p: TtsPrefs): void {
  try {
    localStorage.setItem(PREF_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function isReadAloudNoticeDismissed(): boolean {
  try {
    return localStorage.getItem(NOTICE_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissReadAloudNotice(): void {
  try {
    localStorage.setItem(NOTICE_DISMISSED_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function isTtsSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window
  );
}

/**
 * Split text into sentence-sized chunks. Chrome silently stops long utterances
 * (around 15 seconds), so we feed it one short piece at a time.
 */
export function splitIntoChunks(text: string, max = 220): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const sentences = clean.match(/[^.!?…]+[.!?…]+["')\]]*|[^.!?…]+$/g) ?? [clean];
  const chunks: string[] = [];
  let cur = "";
  const push = () => {
    if (cur.trim()) chunks.push(cur.trim());
    cur = "";
  };
  for (const raw of sentences) {
    const s = raw.trim();
    if (!s) continue;
    if (s.length > max) {
      // Very long sentence: break on commas, then on words.
      push();
      let piece = "";
      for (const word of s.split(/(?<=,)\s+|\s+/)) {
        if ((piece + " " + word).trim().length > max) {
          if (piece.trim()) chunks.push(piece.trim());
          piece = word;
        } else {
          piece = (piece + " " + word).trim();
        }
      }
      if (piece.trim()) chunks.push(piece.trim());
      continue;
    }
    if ((cur + " " + s).trim().length > max) push();
    cur = (cur + " " + s).trim();
  }
  push();
  return chunks;
}

export function getVoices(waitIfEmpty = true): Promise<SpeechSynthesisVoice[]> {
  if (!isTtsSupported()) return Promise.resolve([]);
  const synth = window.speechSynthesis;
  const now = synth.getVoices();
  if (now.length || !waitIfEmpty) return Promise.resolve(now);
  return new Promise((resolve) => {
    const done = () => resolve(synth.getVoices());
    synth.addEventListener("voiceschanged", done, { once: true });
    setTimeout(done, 1200); // some browsers never fire the event
  });
}

/** Local (offline-capable) voices first, then the rest. */
export function sortVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  return [...voices].sort(
    (a, b) => Number(b.localService) - Number(a.localService) || a.name.localeCompare(b.name),
  );
}

export type VoiceStatusKind = "ready" | "online-only" | "no-voices" | "not-supported";

export interface VoiceStatus {
  kind: VoiceStatusKind;
  label: string;
  voice: SpeechSynthesisVoice | null;
  otherLanguageOnly: boolean;
  userLang: string;
  totalVoices: number;
  localVoices: number;
}

function baseLang(lang: string): string {
  return lang.trim().split(/[-_]/)[0].toLowerCase();
}

export function analyzeVoiceStatus(
  voices: SpeechSynthesisVoice[],
  opts: {
    supported?: boolean;
    userLang?: string;
    preferredVoiceURI?: string | null;
  } = {},
): VoiceStatus {
  const supported = opts.supported ?? isTtsSupported();
  const userLang = opts.userLang ?? (typeof navigator !== "undefined" ? navigator.language || "en" : "en");

  if (!supported) {
    return {
      kind: "not-supported",
      label: "Not supported",
      voice: null,
      otherLanguageOnly: false,
      userLang,
      totalVoices: 0,
      localVoices: 0,
    };
  }

  if (voices.length === 0) {
    return {
      kind: "no-voices",
      label: "No voices found",
      voice: null,
      otherLanguageOnly: false,
      userLang,
      totalVoices: 0,
      localVoices: 0,
    };
  }

  const localVoices = sortVoices(voices.filter((v) => v.localService));
  if (localVoices.length === 0) {
    return {
      kind: "online-only",
      label: "Online voices only",
      voice: null,
      otherLanguageOnly: false,
      userLang,
      totalVoices: voices.length,
      localVoices: 0,
    };
  }

  const userBase = baseLang(userLang || "en");
  const matchingLocal = localVoices.filter((v) => baseLang(v.lang) === userBase);
  const otherLanguageOnly = matchingLocal.length === 0;
  const preferredLocal = opts.preferredVoiceURI
    ? localVoices.find((v) => v.voiceURI === opts.preferredVoiceURI)
    : undefined;
  const voice = preferredLocal ?? matchingLocal[0] ?? localVoices[0];

  return {
    kind: "ready",
    label: `Ready offline (${voice.name})`,
    voice,
    otherLanguageOnly,
    userLang,
    totalVoices: voices.length,
    localVoices: localVoices.length,
  };
}

export async function getVoiceStatus(waitIfEmpty = true): Promise<{
  status: VoiceStatus;
  voices: SpeechSynthesisVoice[];
}> {
  if (!isTtsSupported()) {
    return { status: analyzeVoiceStatus([], { supported: false }), voices: [] };
  }
  const voices = sortVoices(await getVoices(waitIfEmpty));
  const prefs = loadTtsPrefs();
  return {
    status: analyzeVoiceStatus(voices, {
      supported: true,
      preferredVoiceURI: prefs.voiceURI,
    }),
    voices,
  };
}

export type DeviceOs = "android" | "iphone" | "windows" | "mac";

export function detectDeviceOs(
  ua = typeof navigator !== "undefined" ? navigator.userAgent : "",
): DeviceOs {
  const s = ua.toLowerCase();
  if (/android/.test(s)) return "android";
  if (/iphone|ipad|ipod/.test(s)) return "iphone";
  if (/win/.test(s)) return "windows";
  return "mac";
}

export type PlaybackStatus = "idle" | "speaking" | "paused";

export interface TtsPlaybackSnapshot {
  ownerId: string | null;
  status: PlaybackStatus;
}

export interface SpeakOptions {
  ownerId?: string;
  onEnd?: () => void;
  onError?: (message: string) => void;
  onNoLocalVoice?: (status: VoiceStatus) => void;
}

interface ActivePlayback {
  ownerId: string;
  chunks: string[];
  index: number;
  voice: SpeechSynthesisVoice | null;
  rate: number;
  paused: boolean;
  opts: SpeakOptions;
}

let session = 0;
let active: ActivePlayback | null = null;
const playbackListeners = new Set<(snap: TtsPlaybackSnapshot) => void>();

export const TTS_STOPPED_EVENT = "panga-tts-stopped";

export function getTtsPlayback(): TtsPlaybackSnapshot {
  if (!active) return { ownerId: null, status: "idle" };
  return {
    ownerId: active.ownerId,
    status: active.paused ? "paused" : "speaking",
  };
}

export function subscribeTtsPlayback(
  listener: (snap: TtsPlaybackSnapshot) => void,
): () => void {
  playbackListeners.add(listener);
  return () => {
    playbackListeners.delete(listener);
  };
}

function emitPlayback(): void {
  const snap = getTtsPlayback();
  playbackListeners.forEach((l) => l(snap));
}

function playCurrentChunk(mine: number): void {
  if (mine !== session || !active || active.paused) return;
  if (active.index >= active.chunks.length) {
    const onEnd = active.opts.onEnd;
    active = null;
    emitPlayback();
    if (typeof window !== "undefined") window.dispatchEvent(new Event(TTS_STOPPED_EVENT));
    onEnd?.();
    return;
  }
  const synth = window.speechSynthesis;
  const u = new SpeechSynthesisUtterance(active.chunks[active.index]);
  if (active.voice) {
    u.voice = active.voice;
    u.lang = active.voice.lang;
  }
  u.rate = active.rate;
  u.onend = () => {
    if (mine !== session || !active || active.paused) return;
    active.index += 1;
    playCurrentChunk(mine);
  };
  u.onerror = (e) => {
    if (mine !== session || !active || active.paused) return;
    if (e.error === "canceled" || e.error === "interrupted") return;
    const onError = active.opts.onError;
    const onEnd = active.opts.onEnd;
    active = null;
    emitPlayback();
    if (typeof window !== "undefined") window.dispatchEvent(new Event(TTS_STOPPED_EVENT));
    onError?.(`Read-aloud failed (${e.error}).`);
    onEnd?.();
  };
  synth.speak(u);
}

export function stopSpeaking(): void {
  session++;
  active = null;
  if (isTtsSupported()) window.speechSynthesis.cancel();
  emitPlayback();
  if (typeof window !== "undefined") window.dispatchEvent(new Event(TTS_STOPPED_EVENT));
}

export function pauseSpeaking(): void {
  if (!active || active.paused) return;
  session++;
  active.paused = true;
  if (isTtsSupported()) window.speechSynthesis.cancel();
  emitPlayback();
}

export function resumeSpeaking(): void {
  if (!active || !active.paused || !isTtsSupported()) return;
  active.paused = false;
  const mine = ++session;
  emitPlayback();
  playCurrentChunk(mine);
}

export async function speak(text: string, opts: SpeakOptions = {}): Promise<void> {
  if (!isTtsSupported()) {
    opts.onError?.("Read-aloud is not supported in this browser.");
    return;
  }
  stopSpeaking();
  const chunks = splitIntoChunks(text);
  if (chunks.length === 0) {
    opts.onEnd?.();
    return;
  }
  const ownerId = opts.ownerId ?? "__default__";
  const mine = session;
  const prefs = loadTtsPrefs();

  active = {
    ownerId,
    chunks,
    index: 0,
    voice: null,
    rate: prefs.rate,
    paused: false,
    opts,
  };
  emitPlayback();

  const voices = sortVoices(await getVoices());
  if (mine !== session || !active) return;

  const status = analyzeVoiceStatus(voices, { preferredVoiceURI: prefs.voiceURI });
  if (status.kind === "online-only" || status.kind === "no-voices") {
    opts.onNoLocalVoice?.(status);
  }
  if (status.kind === "no-voices") {
    active = null;
    emitPlayback();
    if (typeof window !== "undefined") window.dispatchEvent(new Event(TTS_STOPPED_EVENT));
    opts.onEnd?.();
    return;
  }

  const voice =
    voices.find((v) => v.voiceURI === prefs.voiceURI) ??
    status.voice ??
    voices[0] ??
    null;

  active.voice = voice;
  active.rate = prefs.rate;
  playCurrentChunk(mine);
}
