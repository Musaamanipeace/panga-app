export const WHISPER_MODELS = {
  "tiny.en": {
    repo: "onnx-community/whisper-tiny.en",
    label: "Tiny (English only)",
    approxMb: 40,
    multilingual: false,
    note: "Fastest. Good for clear English.",
  },
  base: {
    repo: "onnx-community/whisper-base",
    label: "Base (multilingual)",
    approxMb: 80,
    multilingual: true,
    note: "Balanced speed and accuracy; adds Swahili and other languages.",
  },
  small: {
    repo: "onnx-community/whisper-small",
    label: "Small (multilingual)",
    approxMb: 260,
    multilingual: true,
    note: "Most accurate (best for Swahili), but slow on older phones.",
  },
} as const;

export type WhisperModelKey = keyof typeof WHISPER_MODELS;

export type WhisperQuality = "fast" | "balanced" | "accurate";

/** Explicit speed selector. Fast is the default so the first word arrives sooner. */
export const WHISPER_QUALITY_OPTIONS: { id: WhisperQuality; label: string; model: WhisperModelKey; hint: string }[] = [
  { id: "fast", label: "Fast", model: "tiny.en", hint: "Smallest model, quickest response (English only)" },
  { id: "balanced", label: "Balanced", model: "base", hint: "Multilingual with reasonable speed" },
  { id: "accurate", label: "Accurate", model: "small", hint: "Best accuracy, slower on older phones" },
];

export function modelForQuality(q: WhisperQuality): WhisperModelKey {
  return WHISPER_QUALITY_OPTIONS.find((o) => o.id === q)?.model ?? "tiny.en";
}

export function qualityForModel(model: WhisperModelKey): WhisperQuality {
  return WHISPER_QUALITY_OPTIONS.find((o) => o.model === model)?.id ?? "fast";
}

export const LANGUAGES = [
  { code: "en", label: "English", whisper: "english", browser: "en-US" },
  { code: "sw", label: "Swahili", whisper: "swahili", browser: "sw-KE" },
] as const;

export function languageLabel(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.label ?? code;
}
