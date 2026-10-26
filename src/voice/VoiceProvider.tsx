import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { isDictatable } from "./eligibility";
import { insertAtCaret, type DictationTarget } from "./insertText";
import { createEngine, probeServerEngine, resolveEngineId } from "./engines";
import { useVoicePrefs } from "./prefs";
import { WHISPER_MODELS } from "./models";
import type { EngineEvents, EngineStatus, VoiceEngine } from "./types";

interface Props {
  children: ReactNode;
  /** Tests only: use this engine instead of the user's configured one. */
  testEngine?: VoiceEngine;
}

function friendlyError(e: unknown): string {
  const name = (e as { name?: string })?.name;
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "Microphone access was blocked. Allow it in your browser's site settings.";
  }
  if (name === "NotFoundError") return "No microphone was found.";
  return e instanceof Error && e.message ? e.message : "Voice input failed.";
}

function useAnchorRect(el: HTMLElement | null): DOMRect | null {
  const [rect, setRect] = useState<DOMRect | null>(null);
  useLayoutEffect(() => {
    if (!el) return;
    let raf = 0;
    const measure = () => setRect(el.getBoundingClientRect());
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    ro?.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      ro?.disconnect();
    };
  }, [el]);
  return el ? rect : null;
}

function MicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <line x1="12" y1="18" x2="12" y2="22" />
    </svg>
  );
}

/**
 * Adds voice dictation to every text field in the app. A small mic appears
 * next to whichever field is focused; dictated phrases are inserted at that
 * field's caret and never overwrite existing text. Mount once, near the root.
 */
export default function VoiceProvider({ children, testEngine }: Props) {
  const prefs = useVoicePrefs();
  const [serverChecked, setServerChecked] = useState(false);
  const [target, setTarget] = useState<DictationTarget | null>(null);
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState<EngineStatus>({ kind: "idle" });
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);

  const listeningRef = useRef(false);
  const engineRef = useRef<VoiceEngine | null>(null);
  const targetRef = useRef<DictationTarget | null>(null);
  const dictationTargetRef = useRef<DictationTarget | null>(null);
  targetRef.current = target;

  useEffect(() => {
    if (testEngine) return;
    void probeServerEngine().then(() => setServerChecked(true));
  }, [testEngine]);

  const engineId = useMemo(
    () => (testEngine ? testEngine.id : resolveEngineId(prefs.engine)),
    // serverChecked: re-resolve once we know whether a server engine exists.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prefs.engine, serverChecked, testEngine],
  );

  const stopDictation = useCallback(async () => {
    if (!listeningRef.current) return;
    listeningRef.current = false;
    setListening(false);
    setInterim("");
    const engine = engineRef.current;
    engineRef.current = null;
    try {
      await engine?.stop(); // waits for already-spoken phrases to be inserted
    } catch {
      /* engine already stopped */
    }
    dictationTargetRef.current = null;
    setStatus({ kind: "idle" });
  }, []);

  const startDictation = useCallback(async () => {
    const el = targetRef.current;
    if (!el || !engineId || listeningRef.current) return;
    setError(null);
    setInterim("");
    const engine = testEngine ?? createEngine(engineId);
    engineRef.current = engine;
    dictationTargetRef.current = el;
    listeningRef.current = true;
    setListening(true);

    const events: EngineEvents = {
      onInterim: (t) => {
        if (listeningRef.current) setInterim(t);
      },
      onFinal: (text) => {
        const dest = dictationTargetRef.current;
        if (dest && dest.isConnected) insertAtCaret(dest, text);
        setInterim("");
      },
      onStatus: setStatus,
      onError: (message) => {
        setError(message);
        void stopDictation();
      },
    };
    try {
      await engine.start(events, { lang: prefs.lang });
    } catch (e) {
      events.onError(friendlyError(e));
    }
  }, [engineId, testEngine, prefs.lang, stopDictation]);

  const toggle = useCallback(() => {
    if (listeningRef.current) void stopDictation();
    else void startDictation();
  }, [startDictation, stopDictation]);

  // Follow focus: the mic attaches to the focused text field, and an active
  // dictation moves with the caret when you click into another field.
  useEffect(() => {
    const inVoiceUi = (el: Element | null) => !!el?.closest?.("[data-voice-ui]");

    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as Element | null;
      if (isDictatable(t)) {
        setTarget(t);
        setError(null);
        if (listeningRef.current) dictationTargetRef.current = t;
      } else if (!inVoiceUi(t)) {
        if (listeningRef.current) void stopDictation();
        setTarget(null);
      }
    };
    const onFocusOut = (e: FocusEvent) => {
      if (listeningRef.current) return;
      const next = e.relatedTarget as Element | null;
      if (next && (isDictatable(next) || inVoiceUi(next))) return;
      setTimeout(() => {
        if (!listeningRef.current && !isDictatable(document.activeElement)) setTarget(null);
      }, 150);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && listeningRef.current) {
        void stopDictation();
      } else if (e.altKey && e.shiftKey && e.code === "KeyM" && (targetRef.current || listeningRef.current)) {
        e.preventDefault();
        toggle();
      }
    };
    const onVisibility = () => {
      if (document.hidden && listeningRef.current) void stopDictation();
    };

    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("visibilitychange", onVisibility);
    // A field may already be focused when we mount (e.g. autoFocus).
    if (isDictatable(document.activeElement)) setTarget(document.activeElement);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [stopDictation, toggle]);

  useEffect(() => () => void stopDictation(), [stopDictation]);

  const rect = useAnchorRect(target);

  let label = "";
  if (error) label = error;
  else if (status.kind === "loading") {
    const pct = status.progress === null ? "" : ` ${Math.round(status.progress * 100)}%`;
    const first = engineId === "local" && !prefs.ready[prefs.model];
    label = first
      ? `Downloading speech model (~${WHISPER_MODELS[prefs.model].approxMb} MB, one time)…${pct}`
      : `Loading speech model…${pct}`;
  } else if (status.kind === "transcribing") label = "Transcribing…";
  else if (listening && status.kind === "listening") label = interim || "Listening…";
  else if (listening) label = "Starting…";

  let overlay: ReactNode = null;
  if (engineId && target && rect && rect.bottom >= 0 && rect.top <= window.innerHeight) {
    const below = rect.top < 44;
    const top = below ? rect.bottom + 6 : rect.top - 38;
    const right = Math.max(4, window.innerWidth - rect.right);
    const prevent = (e: { preventDefault(): void }) => e.preventDefault(); // keep focus (and caret) in the field
    overlay = createPortal(
      <div data-voice-ui className="voice-fab" style={{ top, right }} role="group" aria-label="Voice dictation">
        {label && (
          <span className={`voice-fab-label${error ? " voice-fab-error" : ""}`} role="status" aria-live="polite">
            {label}
          </span>
        )}
        <button
          type="button"
          tabIndex={-1}
          className={`voice-fab-btn${listening ? " voice-fab-btn-on" : ""}`}
          aria-pressed={listening}
          aria-label={listening ? "Stop dictation" : "Start dictation"}
          title={listening ? "Stop dictation (Esc)" : "Dictate into this field (Alt+Shift+M)"}
          onPointerDown={prevent}
          onMouseDown={prevent}
          onClick={toggle}
        >
          <MicIcon />
        </button>
      </div>,
      document.body,
    );
  }

  return (
    <>
      {children}
      {overlay}
    </>
  );
}
