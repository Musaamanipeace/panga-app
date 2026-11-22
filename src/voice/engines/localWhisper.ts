import { WHISPER_MODELS, LANGUAGES, type WhisperModelKey } from "../models";
import { startSegmentedCapture, isCaptureSupported, type CaptureHandle } from "../audio";
import { cleanTranscript } from "../transcript";
import { markModelReady, getVoicePrefs } from "../prefs";
import type { EngineEvents, EngineOptions, VoiceEngine } from "../types";

const IDLE_TERMINATE_MS = 5 * 60 * 1000;

type Progress = (fraction: number | null) => void;

/** Owns the Whisper web worker: loads a model once, then transcribes phrases. */
class WhisperClient {
  private worker: Worker | null = null;
  private loadedRepo = "";
  private nextId = 1;
  private pending = new Map<number, { resolve(t: string): void; reject(e: Error): void }>();
  private loadWaiter: { resolve(): void; reject(e: Error): void } | null = null;
  private files = new Map<string, { loaded: number; total: number }>();
  private onProgress: Progress | null = null;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private runtimeDevice = "wasm";
  private notice = "";

  private ensureWorker(): Worker {
    if (this.worker) return this.worker;
    const w = new Worker(new URL("./whisper.worker.ts", import.meta.url), { type: "module" });
    w.onmessage = (e: MessageEvent) => this.onMessage(e.data);
    w.onerror = (e) => this.failAll(new Error(e.message || "Speech worker crashed"));
    this.worker = w;
    return w;
  }

  private onMessage(m: any) {
    if (m.type === "notice") {
      this.notice = m.message ?? "";
    } else if (m.type === "progress") {
      const p = m.p ?? {};
      if (p.status === "reset") {
        this.files.clear();
        this.onProgress?.(null);
      } else if (p.status === "progress" && p.file && typeof p.total === "number") {
        this.files.set(p.file, { loaded: p.loaded ?? 0, total: p.total });
        let loaded = 0;
        let total = 0;
        this.files.forEach((f) => {
          loaded += f.loaded;
          total += f.total;
        });
        this.onProgress?.(total > 0 ? Math.min(1, loaded / total) : null);
      }
    } else if (m.type === "ready") {
      this.runtimeDevice = m.device ?? "wasm";
      this.loadWaiter?.resolve();
      this.loadWaiter = null;
    } else if (m.type === "result") {
      this.pending.get(m.id)?.resolve(m.text ?? "");
      this.pending.delete(m.id);
    } else if (m.type === "error") {
      const err = new Error(m.message || "Speech recognition failed");
      if (m.id !== undefined && this.pending.has(m.id)) {
        this.pending.get(m.id)!.reject(err);
        this.pending.delete(m.id);
      } else {
        this.loadWaiter?.reject(err);
        this.loadWaiter = null;
      }
    }
  }

  private failAll(err: Error) {
    this.loadWaiter?.reject(err);
    this.loadWaiter = null;
    this.pending.forEach((p) => p.reject(err));
    this.pending.clear();
    this.dispose();
  }

  load(model: WhisperModelKey, onProgress: Progress): Promise<void> {
    const repo = WHISPER_MODELS[model].repo;
    this.touch();
    if (this.worker && this.loadedRepo === repo) return Promise.resolve();
    this.files.clear();
    this.onProgress = onProgress;
    const w = this.ensureWorker();
    return new Promise<void>((resolve, reject) => {
      this.loadWaiter = {
        resolve: () => {
          this.loadedRepo = repo;
          markModelReady(model);
          resolve();
        },
        reject,
      };
      w.postMessage({ type: "load", repo });
    });
  }

  transcribe(pcm: Float32Array, language?: string, partial = false): Promise<string> {
    this.touch();
    const w = this.ensureWorker();
    const id = this.nextId++;
    return new Promise<string>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      w.postMessage({ type: "transcribe", id, audio: pcm, language, partial }, [pcm.buffer]);
    });
  }

  /** Free the model's memory after a few idle minutes; reloading from cache is fast. */
  private touch() {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => this.dispose(), IDLE_TERMINATE_MS);
  }

  getRuntime(): { device: string; notice: string } {
    return { device: this.runtimeDevice, notice: this.notice };
  }

  dispose() {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = null;
    this.worker?.terminate();
    this.worker = null;
    this.loadedRepo = "";
  }
}

const client = new WhisperClient();

/** Downloads a model ahead of time so dictation works offline later. */
export function preloadWhisperModel(model: WhisperModelKey, onProgress: Progress): Promise<void> {
  return client.load(model, onProgress);
}

/** Runtime actually in use after the model loaded (WebGPU or WASM fallback). */
export function getWhisperRuntime(): { device: string; notice: string } {
  return client.getRuntime();
}

export function isLocalWhisperSupported(): boolean {
  return (
    typeof Worker !== "undefined" &&
    typeof WebAssembly !== "undefined" &&
    typeof indexedDB !== "undefined" &&
    isCaptureSupported()
  );
}

export function createLocalWhisperEngine(): VoiceEngine {
  let capture: CaptureHandle | null = null;
  let queue: Promise<void> = Promise.resolve();
  let partialQueue: Promise<void> = Promise.resolve();
  let inflight = 0;
  let events: EngineEvents | null = null;
  let stopped = true;
  let phraseId = 0;

  return {
    id: "local",

    async start(ev: EngineEvents, options: EngineOptions) {
      events = ev;
      stopped = false;
      const { model } = getVoicePrefs();
      const spec = WHISPER_MODELS[model];
      const language = spec.multilingual
        ? LANGUAGES.find((l) => l.code === options.lang)?.whisper
        : undefined;

      ev.onStatus({ kind: "loading", progress: null });
      await client.load(model, (p) => {
        if (!stopped) ev.onStatus({ kind: "loading", progress: p });
      });
      if (stopped) return;

      capture = await startSegmentedCapture({
        onPartial(pcm) {
          if (stopped || inflight > 0) return;
          const id = phraseId;
          partialQueue = partialQueue.then(async () => {
            if (stopped || id !== phraseId || inflight > 0) return;
            try {
              const text = cleanTranscript(await client.transcribe(pcm, language, true));
              if (text && id === phraseId && inflight === 0) events?.onInterim(text);
            } catch {
              /* partial transcription is best-effort */
            }
          });
        },
        onSegment(pcm) {
          phraseId++;
          inflight++;
          ev.onInterim("");
          events?.onStatus({ kind: "transcribing" });
          queue = queue.then(async () => {
            try {
              const text = cleanTranscript(await client.transcribe(pcm, language));
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
      capture?.stop(); // flushes the phrase in progress into the queue
      capture = null;
      await queue;
      await partialQueue;
      events?.onStatus({ kind: "idle" });
    },
  };
}
