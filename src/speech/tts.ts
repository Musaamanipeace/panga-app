// Read-aloud using the browser's built-in speech synthesis.
// Works offline when the device has a local voice (most Android/Windows/macOS/iOS devices do).

export interface TtsPrefs {
  voiceURI: string | null;
  rate: number;
}

const PREF_KEY = "panga_tts_prefs";

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

export function isTtsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
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

export function getVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!isTtsSupported()) return Promise.resolve([]);
  const synth = window.speechSynthesis;
  const now = synth.getVoices();
  if (now.length) return Promise.resolve(now);
  return new Promise((resolve) => {
    const done = () => resolve(synth.getVoices());
    synth.addEventListener("voiceschanged", done, { once: true });
    setTimeout(done, 1200); // some browsers never fire the event
  });
}

/** Local (offline-capable) voices first, then the rest. */
export function sortVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  return [...voices].sort((a, b) => Number(b.localService) - Number(a.localService) || a.name.localeCompare(b.name));
}

let session = 0;

export const TTS_STOPPED_EVENT = "panga-tts-stopped";

export function stopSpeaking(): void {
  session++;
  if (isTtsSupported()) window.speechSynthesis.cancel();
  if (typeof window !== "undefined") window.dispatchEvent(new Event(TTS_STOPPED_EVENT));
}

export function pauseSpeaking(): void {
  if (isTtsSupported()) window.speechSynthesis.pause();
}

export function resumeSpeaking(): void {
  if (isTtsSupported()) window.speechSynthesis.resume();
}

export interface SpeakOptions {
  onEnd?: () => void;
  onError?: (message: string) => void;
}

export async function speak(text: string, opts: SpeakOptions = {}): Promise<void> {
  if (!isTtsSupported()) {
    opts.onError?.("Read-aloud is not supported in this browser.");
    return;
  }
  stopSpeaking();
  const mine = session;
  const chunks = splitIntoChunks(text);
  if (chunks.length === 0) {
    opts.onEnd?.();
    return;
  }
  const prefs = loadTtsPrefs();
  const voices = sortVoices(await getVoices());
  const voice =
    voices.find((v) => v.voiceURI === prefs.voiceURI) ??
    voices.find((v) => v.localService && v.lang.toLowerCase().startsWith((navigator.language || "en").slice(0, 2).toLowerCase())) ??
    voices.find((v) => v.localService) ??
    null;
  const synth = window.speechSynthesis;
  let i = 0;
  const next = () => {
    if (mine !== session) return; // stopped or replaced
    if (i >= chunks.length) {
      opts.onEnd?.();
      return;
    }
    const u = new SpeechSynthesisUtterance(chunks[i++]);
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang;
    }
    u.rate = prefs.rate;
    u.onend = next;
    u.onerror = (e) => {
      if (mine !== session) return;
      if (e.error === "canceled" || e.error === "interrupted") return;
      opts.onError?.(`Read-aloud failed (${e.error}).`);
      opts.onEnd?.();
    };
    synth.speak(u);
  };
  next();
}
