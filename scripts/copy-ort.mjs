// Copies the ONNX Runtime WebAssembly files that the in-browser speech model
// needs into public/ort so they are served from our own origin instead of a
// public CDN (keeps the CSP tight and lets the service worker cache them for
// offline use). Runs automatically before `dev` and `build`.
import { copyFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = resolve(root, "node_modules/onnxruntime-web/dist");
const dest = resolve(root, "public/ort");

// "asyncify" is what transformers.js picks by default; the plain build is the
// fallback it uses on Safari < 26 without WebGPU.
const files = [
  "ort-wasm-simd-threaded.asyncify.mjs",
  "ort-wasm-simd-threaded.asyncify.wasm",
  "ort-wasm-simd-threaded.mjs",
  "ort-wasm-simd-threaded.wasm",
];

if (!existsSync(src)) {
  console.error(`[copy-ort] ${src} not found. Run "npm install" first.`);
  process.exit(1);
}
mkdirSync(dest, { recursive: true });
for (const f of files) {
  const from = resolve(src, f);
  const to = resolve(dest, f);
  if (!existsSync(from)) {
    console.error(`[copy-ort] missing ${f} in onnxruntime-web (version changed?)`);
    process.exit(1);
  }
  if (existsSync(to) && statSync(to).size === statSync(from).size) continue;
  copyFileSync(from, to);
}
console.log(`[copy-ort] ONNX runtime files ready in public/ort`);
