import { useRef, useState, useCallback } from "react";

export interface VoiceInputOptions {
  lang?: string;
  continuous?: boolean;
}

export function isVoiceInputSupported(): boolean {
  return typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
}

export function useVoiceInput(onResult: (text: string) => void, options?: VoiceInputOptions) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const lang = options?.lang ?? "en-US";
  const continuous = options?.continuous ?? true;

  const start = useCallback(() => {
    if (!isVoiceInputSupported()) return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = false;
    recognition.lang = lang;

    let active = true;

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript.trim();
          if (transcript) onResult(transcript);
        }
      }
    };

    recognition.onend = () => {
      setListening(false);
      if (active && continuous) {
        try {
          recognition.start();
        } catch {
          setListening(false);
        }
      }
    };

    recognition.onerror = () => {
      active = false;
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [onResult, lang, continuous]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return { listening, start, stop, supported: isVoiceInputSupported() };
}
