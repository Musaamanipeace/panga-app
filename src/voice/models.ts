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

export const LANGUAGES = [
  { code: "en", label: "English", whisper: "english", browser: "en-US" },
  { code: "sw", label: "Swahili", whisper: "swahili", browser: "sw-KE" },
] as const;

export function languageLabel(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.label ?? code;
}
