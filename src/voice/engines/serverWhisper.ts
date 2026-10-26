import { startSegmentedCapture, isCaptureSupported, type CaptureHandle } from "../audio";
import { cleanTranscript } from "../transcript";
import { encodeWav } from "../wav";
import type { EngineEvents, EngineOptions, VoiceEngine } from "../types";

let serverKnown: boolean | null = null;

/** Asks the Panga server whether a transcription backend is configured. */
export async function probeServerEngine(): Promise<boolean> {
  try {
    const res = await fetch("/api/voice/config", { headers: { Accept: "application/json" } });
    if (!res.ok || !(res.headers.get("content-type") || "").includes("application/json")) {
      serverKnown = false;
    } else {
      const data = await res.json();
      serverKnown = data?.serverTranscription === true;
    }
  } catch {
    serverKnown = false;
  }
  return serverKnown;
}

export function isServerEngineSupported(): boolean {
  return serverKnown === true && isCaptureSupported();
}

export function createServerWhisperEngine(): VoiceEngine {
  let capture: CaptureHandle | null = null;
  let queue: Promise<void> = Promise.resolve();
  let inflight = 0;
  let events: EngineEvents | null = null;
  let stopped = true;

  return {
    id: "server",

    async start(ev: EngineEvents, options: EngineOptions) {
      events = ev;
      stopped = false;
      capture = await startSegmentedCapture({
        onSegment(pcm) {
          inflight++;
          events?.onStatus({ kind: "transcribing" });
          queue = queue.then(async () => {
            try {
              const res = await fetch(`/api/transcribe?language=${encodeURIComponent(options.lang)}`, {
                method: "POST",
                headers: { "Content-Type": "audio/wav" },
                body: encodeWav(pcm),
              });
              const data = await res.json().catch(() => ({}));
              if (!res.ok) throw new Error(data?.error || `Transcription server error (${res.status})`);
              const text = cleanTranscript(String(data.text ?? ""));
              if (text) events?.onFinal(text);
            } catch (err) {
              events?.onError(err instanceof Error ? err.message : "Transcription failed");
            } finally {
              inflight--;
              if (inflight === 0) events?.onStatus(stopped ? { kind: "idle" } : { kind: "listening" });
            }
          });
        },
      });
      if (stopped) {
        capture.stop();
        capture = null;
        return;
      }
      ev.onStatus({ kind: "listening" });
    },

    async stop() {
      stopped = true;
      capture?.stop();
      capture = null;
      await queue;
      events?.onStatus({ kind: "idle" });
    },
  };
}
