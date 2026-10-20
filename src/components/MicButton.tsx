import { useRef, useEffect, useLayoutEffect } from "react";
import { useVoiceInput } from "./useVoiceInput";

interface Props {
  onResult: (newValue: string) => void;
  targetRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  className?: string;
  dataTip?: string;
  lang?: string;
}

type InputEl = HTMLInputElement | HTMLTextAreaElement | null;

export default function MicButton({ onResult, targetRef, className = "", dataTip, lang = "en-US" }: Props) {
  const lastActiveElementRef = useRef<InputEl>(null);
  const cursorPositionRef = useRef<{ start: number; end: number } | null>(null);
  const pendingCursorRef = useRef<{ el: InputEl; pos: number } | null>(null);

  function getTarget(): InputEl {
    return targetRef?.current || lastActiveElementRef.current;
  }

  function captureCursor() {
    const active = (targetRef?.current || document.activeElement) as InputEl;
    if (
      active &&
      (active.tagName === "INPUT" || active.tagName === "TEXTAREA") &&
      typeof active.selectionStart === "number"
    ) {
      lastActiveElementRef.current = active;
      cursorPositionRef.current = {
        start: active.selectionStart ?? active.value.length,
        end: active.selectionEnd ?? active.value.length,
      };
    }
  }

  useEffect(() => {
    const handleSelectionChange = () => {
      const active = document.activeElement as InputEl;
      if (
        active &&
        (active.tagName === "INPUT" || active.tagName === "TEXTAREA") &&
        typeof active.selectionStart === "number"
      ) {
        lastActiveElementRef.current = active;
        cursorPositionRef.current = {
          start: active.selectionStart ?? active.value.length,
          end: active.selectionEnd ?? active.value.length,
        };
      }
    };
    const handleFocusIn = () => captureCursor();

    document.addEventListener("selectionchange", handleSelectionChange);
    document.addEventListener("focusin", handleFocusIn);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("focusin", handleFocusIn);
    };
  }, []);

  function handleVoiceResult(text: string) {
    const input = getTarget();
    const cursor = cursorPositionRef.current;

    if (input && cursor && typeof input.selectionStart === "number") {
      const original = input.value || "";
      const before = original.slice(0, cursor.start);
      const after = original.slice(cursor.end);

      const needsLeadingSpace = before.length > 0 && !before.endsWith(" ") && !before.endsWith("\n");
      const needsTrailingSpace = after.length > 0 && !after.startsWith(" ") && !after.startsWith("\n");
      const formattedInsert = (needsLeadingSpace ? " " : "") + text + (needsTrailingSpace ? " " : "");
      const newValue = before + formattedInsert + after;
      const newCursorPos = cursor.start + formattedInsert.length;

      pendingCursorRef.current = { el: input, pos: newCursorPos };
      onResult(newValue);
    } else {
      const newValue = text;
      pendingCursorRef.current = { el: input, pos: newValue.length };
      onResult(newValue);
    }
  }

  useLayoutEffect(() => {
    const pending = pendingCursorRef.current;
    if (!pending) return;
    pendingCursorRef.current = null;

    const { el, pos } = pending;
    if (el && typeof el.selectionStart === "number") {
      try {
        el.focus();
        el.setSelectionRange(pos, pos);
      } catch {}
    }
  });

  const { listening, start, stop, supported } = useVoiceInput(handleVoiceResult, { lang, continuous: true });
  if (!supported) return null;

  return (
    <button
      type="button"
      className={`mic-btn ${listening ? "mic-btn-active" : ""} ${className}`.trim()}
      onMouseDown={(e) => {
        captureCursor();
        e.preventDefault();
      }}
      onClick={(e) => {
        e.preventDefault();
        captureCursor();
        if (listening) {
          stop();
        } else {
          start();
        }
      }}
      aria-label={listening ? "Stop recording" : "Start voice input"}
      title={listening ? "Listening... click to stop" : "Click to speak (inserts at cursor)"}
      data-tip={dataTip || (listening ? "Listening... click to stop" : "Speak to insert at cursor")}
    >
      {listening ? "● REC" : "MIC"}
    </button>
  );
}
