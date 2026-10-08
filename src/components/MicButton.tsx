import { useRef, useEffect } from "react";
import { useVoiceInput } from "./useVoiceInput";

interface Props {
  onResult: (text: string) => void;
  targetRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  className?: string;
  dataTip?: string;
}

export default function MicButton({ onResult, targetRef, className = "", dataTip }: Props) {
  const lastActiveElementRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const cursorPositionRef = useRef<{ start: number; end: number } | null>(null);

  // Capture focused input/textarea before microphone button triggers
  function captureCursor() {
    const active = (targetRef?.current || document.activeElement) as
      | HTMLInputElement
      | HTMLTextAreaElement
      | null;

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

  function handleVoiceResult(text: string) {
    const input = targetRef?.current || lastActiveElementRef.current;
    const cursor = cursorPositionRef.current;

    if (input && cursor && typeof input.selectionStart === "number") {
      const original = input.value || "";
      const before = original.slice(0, cursor.start);
      const after = original.slice(cursor.end);

      // Add appropriate spacing
      const needsLeadingSpace = before.length > 0 && !before.endsWith(" ") && !before.endsWith("\n");
      const needsTrailingSpace = after.length > 0 && !after.startsWith(" ") && !after.startsWith("\n");
      const formattedInsert = (needsLeadingSpace ? " " : "") + text + (needsTrailingSpace ? " " : "");
      const updatedValue = before + formattedInsert + after;

      // Update native value and trigger synthetic React input event
      const proto = input.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
      if (setter) {
        setter.call(input, updatedValue);
      } else {
        input.value = updatedValue;
      }
      input.dispatchEvent(new Event("input", { bubbles: true }));

      // Reposition cursor right after inserted text
      const newPos = cursor.start + formattedInsert.length;
      try {
        input.focus();
        input.setSelectionRange(newPos, newPos);
      } catch {}

      onResult(text);
    } else {
      // Fallback: callback
      onResult(text);
    }
  }

  const { listening, start, stop, supported } = useVoiceInput(handleVoiceResult);
  if (!supported) return null;

  return (
    <button
      type="button"
      className={`mic-btn ${listening ? "mic-btn-active" : ""} ${className}`.trim()}
      onMouseDown={(e) => {
        // Prevent button from stealing focus and losing cursor position in the input
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
