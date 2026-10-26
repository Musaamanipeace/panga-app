const NON_SPEECH_TAGS = /\[(?:BLANK_AUDIO|MUSIC|NOISE|SILENCE|APPLAUSE|LAUGHTER)[^\]]*\]|\((?:music|silence|noise|applause|laughter|inaudible)[^)]*\)/gi;
// Phrases Whisper tends to invent on near-silent audio.
const HALLUCINATION = /^(?:thanks? for watching[.!]*|please subscribe[.!]*|subtitles? by .*|you[.!]*|[.\s]+)$/i;

/** Strips non-speech markers and known Whisper hallucinations. */
export function cleanTranscript(raw: string): string {
  const t = raw.replace(NON_SPEECH_TAGS, " ").replace(/\s+/g, " ").trim();
  if (!t || HALLUCINATION.test(t)) return "";
  return t;
}
