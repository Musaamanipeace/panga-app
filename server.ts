import express from "express";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

app.use(express.json({ limit: "10mb" }));

// Basic security headers
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://accounts.google.com ; style-src 'self' 'unsafe-inline' https://accounts.google.com; connect-src 'self' https://accounts.google.com https://www.googleapis.com https://huggingface.co https://*.huggingface.co https://*.hf.co https://*.supabase.co wss://*.supabase.co https://openrouter.ai https://api.openai.com https://api.anthropic.com https://api.x.ai https://generativelanguage.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' data: https:; object-src 'none'; frame-ancestors 'none'; frame-src https://accounts.google.com; worker-src 'self'; manifest-src 'self';"
  );
  next();
});

// Simple in-memory rate limiter (per IP)
const RATE_LIMIT_WINDOW_MS = 60_000;

function makeRateLimiter(max: number) {
  const store = new Map<string, { count: number; reset: number }>();
  return function rateLimit(req: express.Request, res: express.Response, next: express.NextFunction) {
    const ip = req.ip || "unknown";
    const now = Date.now();
    const entry = store.get(ip);
    if (!entry || now > entry.reset) {
      store.set(ip, { count: 1, reset: now + RATE_LIMIT_WINDOW_MS });
      return next();
    }
    entry.count++;
    if (entry.count > max) {
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }
    next();
  };
}

const rateLimit = makeRateLimiter(20);
// Dictation sends one short request per spoken phrase, so it needs more headroom.
const transcribeRateLimit = makeRateLimiter(120);

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime(), timestamp: Date.now() });
});

// --- Optional self-hosted speech-to-text (voice input "Panga server" engine) ---
// Point WHISPER_SERVER_URL at any OpenAI-compatible transcription server
// (e.g. faster-whisper-server, whisper.cpp server, LocalAI). Leave it unset to
// disable; the app then offers only on-device and browser dictation.
const WHISPER_SERVER_URL = (process.env.WHISPER_SERVER_URL || "").replace(/\/+$/, "");
const WHISPER_SERVER_MODEL = process.env.WHISPER_SERVER_MODEL || "whisper-1";

app.get("/api/voice/config", (_req, res) => {
  res.json({ serverTranscription: WHISPER_SERVER_URL !== "" });
});

app.post(
  "/api/transcribe",
  transcribeRateLimit,
  express.raw({ type: ["audio/wav", "audio/x-wav"], limit: "10mb" }),
  async (req, res) => {
    if (!WHISPER_SERVER_URL) {
      return res.status(501).json({ error: "Server transcription is not configured (set WHISPER_SERVER_URL)." });
    }
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      return res.status(400).json({ error: "Send the audio as a WAV body with Content-Type: audio/wav." });
    }
    try {
      const form = new FormData();
      form.append("file", new Blob([new Uint8Array(req.body)], { type: "audio/wav" }), "speech.wav");
      form.append("model", WHISPER_SERVER_MODEL);
      const language = typeof req.query.language === "string" ? req.query.language : "";
      if (/^[a-z]{2,3}$/i.test(language)) form.append("language", language.toLowerCase());
      form.append("response_format", "json");

      const upstream = await fetch(`${WHISPER_SERVER_URL}/v1/audio/transcriptions`, {
        method: "POST",
        body: form,
        signal: AbortSignal.timeout(60_000),
      });
      if (!upstream.ok) {
        console.error("Whisper server error:", upstream.status);
        return res.status(502).json({ error: `Transcription server returned ${upstream.status}.` });
      }
      const data = (await upstream.json()) as { text?: string };
      res.json({ text: typeof data.text === "string" ? data.text : "" });
    } catch (error: any) {
      console.error("Transcription error:", error);
      res.status(502).json({ error: "Could not reach the transcription server." });
    }
  },
);

// --- Server-side Gemini API route ---
app.post("/api/assistant/chat", rateLimit, async (req, res) => {
  try {
    const { contents, systemInstruction, enableSearch, clientApiKey } = req.body;
    const apiKey = process.env.GEMINI_API_KEY || clientApiKey;

    if (!apiKey) {
      return res.status(400).json({
        error: "No Gemini API key found. Please configure your key in Settings or environment.",
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const tools: any[] = [];
    if (enableSearch) {
      tools.push({ googleSearch: {} });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction,
        tools: tools.length > 0 ? tools : undefined,
      },
    });

    res.json({
      text: response.text ?? "",
      functionCalls: response.functionCalls,
    });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.status(500).json({
      error: error?.message || "Failed to generate AI response.",
    });
  }
});

async function start() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, host: HOST, port: PORT, allowedHosts: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(
      express.static(distPath, {
        setHeaders(res, filePath) {
          const rel = path.relative(distPath, filePath).split(path.sep).join("/");
          if (rel.startsWith("assets/") || rel.startsWith("ort/") || rel.startsWith("icons/")) {
            // Content-hashed (or versioned) files never change in place.
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          } else if (rel === "sw.js" || rel === "index.html" || rel === "manifest.webmanifest" || rel.startsWith("workbox-")) {
            // The service worker and app shell must be re-checked on every load
            // so new releases reach installed apps.
            res.setHeader("Cache-Control", "no-cache");
          }
        },
      }),
    );
    app.use((req, res, next) => {
      if (req.method === "GET" && !req.path.startsWith("/api")) {
        res.sendFile(path.resolve(distPath, "index.html"));
      } else {
        next();
      }
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT} [NODE_ENV=${process.env.NODE_ENV || "development"}]`);
  });
}

start();