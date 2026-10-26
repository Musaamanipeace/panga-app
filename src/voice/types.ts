export type EngineId = "local" | "browser" | "server";

export type EngineStatus =
  | { kind: "idle" }
  | { kind: "loading"; progress: number | null }
  | { kind: "listening" }
  | { kind: "transcribing" };

export interface EngineEvents {
  /** Live, not-yet-final words (only some engines provide these). */
  onInterim(text: string): void;
  /** A finished phrase, ready to be inserted at the caret. */
  onFinal(text: string): void;
  onStatus(status: EngineStatus): void;
  onError(message: string): void;
}

export interface EngineOptions {
  /** Short language code from the user's settings, e.g. "en" or "sw". */
  lang: string;
}

export interface VoiceEngine {
  id: EngineId;
  /**
   * Begins capturing speech. Resolves once capture has started (for the local
   * engine that includes loading the model).
   */
  start(events: EngineEvents, options: EngineOptions): Promise<void>;
  /**
   * Stops capturing. Resolves after any speech already captured has been
   * transcribed and delivered through onFinal.
   */
  stop(): Promise<void>;
}
