import { useVoiceInput } from "./useVoiceInput";

interface Props {
  onResult: (text: string) => void;
}

export default function MicButton({ onResult }: Props) {
  const { listening, start, stop, supported } = useVoiceInput(onResult);
  if (!supported) return null; // hide entirely on unsupported browsers, don't show a broken button

  return (
    <button
      type="button"
      className={`mic-btn ${listening ? "mic-btn-active" : ""}`}
      onClick={listening ? stop : start}
      aria-label={listening ? "Stop recording" : "Start voice input"}
      title={listening ? "Listening... click to stop" : "Click to speak"}
    >
      {listening ? "🔴" : "🎤"}
    </button>
  );
}