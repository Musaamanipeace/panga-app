import { useEffect, useRef, useState } from "react";
import { isTtsSupported, speak, stopSpeaking } from "../speech/tts";
import { showToast } from "./ui";

interface Props {
  /** Text to read, or a function that returns it when pressed. */
  text: string | (() => string);
  label?: string;
  className?: string;
}

export default function ReadAloudButton({ text, label, className = "btn-secondary btn-small" }: Props) {
  const [speaking, setSpeaking] = useState(false);
  const mine = useRef(false);

  useEffect(
    () => () => {
      if (mine.current) stopSpeaking();
    },
    []
  );

  if (!isTtsSupported()) return null;

  async function toggle() {
    if (speaking) {
      stopSpeaking();
      mine.current = false;
      setSpeaking(false);
      return;
    }
    const value = typeof text === "function" ? text() : text;
    if (!value.trim()) {
      showToast("Nothing to read.", "info");
      return;
    }
    mine.current = true;
    setSpeaking(true);
    await speak(value, {
      onEnd: () => {
        mine.current = false;
        setSpeaking(false);
      },
      onError: (m) => showToast(m, "error"),
    });
  }

  return (
    <button type="button" className={`${className} clickable`} onClick={() => void toggle()} title={speaking ? "Stop reading" : "Read aloud"}>
      {speaking ? "■ Stop" : `🔊${label ? ` ${label}` : ""}`}
    </button>
  );
}
