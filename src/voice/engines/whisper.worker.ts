// Runs the Whisper speech model off the main thread so the UI never freezes.
import { pipeline, env } from "@huggingface/transformers";

type Msg =
  | { type: "load"; repo: string }
  | { type: "transcribe"; id: number; audio: Float32Array; language?: string };

const ctx = self as unknown as {
  postMessage(message: unknown): void;
  onmessage: ((e: MessageEvent<Msg>) => void) | null;
};

// Serve the WebAssembly runtime from our own origin (see scripts/copy-ort.mjs)
// instead of a public CDN. useWasmCache=false makes the runtime load straight
// from these URLs, so the service worker (not a blob: import) caches them.
function isOldSafari(): boolean {
  const ua = navigator.userAgent;
  if (!/Safari\//.test(ua) || /Chrome|Chromium|Edg|Android|OPR/.test(ua)) return false;
  const m = /Version\/(\d+)/.exec(ua);
  return !!m && Number(m[1]) < 26 && !("gpu" in navigator);
}
const suffix = isOldSafari() ? "" : ".asyncify";
env.allowLocalModels = false;
env.useWasmCache = false;
const host = import.meta.env.VITE_MODEL_HOST as string | undefined;
if (host) env.remoteHost = host.endsWith("/") ? host : host + "/";
const onnxEnv = env.backends.onnx as unknown as { wasm: { wasmPaths: unknown } };
onnxEnv.wasm.wasmPaths = {
  mjs: `${self.location.origin}/ort/ort-wasm-simd-threaded${suffix}.mjs`,
  wasm: `${self.location.origin}/ort/ort-wasm-simd-threaded${suffix}.wasm`,
};

let transcriber: any = null;
let loadedRepo = "";

ctx.onmessage = async (e) => {
  const m = e.data;
  try {
    if (m.type === "load") {
      if (!transcriber || loadedRepo !== m.repo) {
        transcriber = null;
        transcriber = await (pipeline as any)("automatic-speech-recognition", m.repo, {
          device: "wasm",
          dtype: "q8",
          progress_callback: (p: unknown) => ctx.postMessage({ type: "progress", p }),
        });
        loadedRepo = m.repo;
      }
      ctx.postMessage({ type: "ready" });
    } else if (m.type === "transcribe") {
      if (!transcriber) throw new Error("Speech model is not loaded");
      const out = await transcriber(m.audio, {
        ...(m.language ? { language: m.language } : {}),
        task: "transcribe",
        chunk_length_s: 30,
        return_timestamps: false,
      });
      const text = Array.isArray(out) ? out.map((o: { text: string }) => o.text).join(" ") : out.text;
      ctx.postMessage({ type: "result", id: m.id, text });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    ctx.postMessage({ type: "error", id: m.type === "transcribe" ? m.id : undefined, message });
  }
};
