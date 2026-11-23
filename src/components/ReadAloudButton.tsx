import { useEffect, useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getTtsPlayback,
  isTtsSupported,
  pauseSpeaking,
  resumeSpeaking,
  speak,
  stopSpeaking,
  subscribeTtsPlayback,
  type PlaybackStatus,
} from "../speech/tts";
import { showToast } from "./ui";

interface Props {
  /** Text to read, or a function that returns it when pressed. */
  text: string | (() => string);
  label?: string;
  className?: string;
}

export default function ReadAloudButton({
  text,
  label = "Read",
  className = "btn-secondary btn-small",
}: Props) {
  const ownerId = useId();
  const navigate = useNavigate();
  const [status, setStatus] = useState<PlaybackStatus>(() => {
    const snap = getTtsPlayback();
    return snap.ownerId === ownerId ? snap.status : "idle";
  });

  useEffect(() => {
    const sync = () => {
      const snap = getTtsPlayback();
      setStatus(snap.ownerId === ownerId ? snap.status : "idle");
    };
    sync();
    const unsub = subscribeTtsPlayback(sync);
    return () => {
      unsub();
      if (getTtsPlayback().ownerId === ownerId) {
        stopSpeaking();
      }
    };
  }, [ownerId]);

  if (!isTtsSupported()) return null;

  async function start() {
    const value = typeof text === "function" ? text() : text;
    if (!value.trim()) {
      showToast("Nothing to read.", "info");
      return;
    }
    await speak(value, {
      ownerId,
      onError: (m) => showToast(m, "error"),
      onNoLocalVoice: (voiceStatus) => {
        const msg =
          voiceStatus.kind === "no-voices"
            ? "No voices found on this device."
            : "No offline voice on this device.";
        showToast(msg, "info", 6000, {
          label: "Set up offline voice",
          onClick: () => navigate("/settings#read-aloud"),
        });
      },
    });
  }

  if (status === "speaking") {
    return (
      <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
        <button
          type="button"
          className={`${className} clickable`}
          onClick={() => pauseSpeaking()}
          title="Pause reading"
        >
          Pause
        </button>
        <button
          type="button"
          className={`${className} clickable`}
          onClick={() => stopSpeaking()}
          title="Stop reading"
        >
          Stop
        </button>
      </span>
    );
  }

  if (status === "paused") {
    return (
      <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
        <button
          type="button"
          className={`${className} clickable`}
          onClick={() => resumeSpeaking()}
          title="Resume reading"
        >
          Resume
        </button>
        <button
          type="button"
          className={`${className} clickable`}
          onClick={() => stopSpeaking()}
          title="Stop reading"
        >
          Stop
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      className={`${className} clickable`}
      onClick={() => void start()}
      title="Read aloud"
    >
      {label}
    </button>
  );
}
