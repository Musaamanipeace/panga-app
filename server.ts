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
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://apis.google.com; style-src 'self' 'unsafe-inline'; connect-src 'self' https://huggingface.co https://*.huggingface.co https://*.hf.co https://openrouter.ai https://api.openai.com https://api.anthropic.com https://api.x.ai https://api.groq.com https://generativelanguage.googleapis.com https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://apis.google.com; img-src 'self' data: blob: https:; font-src 'self' data: https:; frame-src 'self' https://*.firebaseapp.com https://accounts.google.com; object-src 'none'; worker-src 'self' blob:; manifest-src 'self';"
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

const rateLimit = makeRateLimiter(60);
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

// --- Multi-provider AI proxy routes (avoids browser CORS/CSP issues for BYOK) ---
type AIProviderId = "gemini" | "openai" | "anthropic" | "xai" | "openrouter" | "groq";

const AI_UPSTREAMS: Record<
  AIProviderId,
  { label: string; baseUrl: string; listModelsUrl?: string }
> = {
  gemini: {
    label: "Google Gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    listModelsUrl: "https://generativelanguage.googleapis.com/v1beta/models",
  },
  openai: {
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    listModelsUrl: "https://api.openai.com/v1/models",
  },
  anthropic: {
    label: "Anthropic Claude",
    baseUrl: "https://api.anthropic.com/v1",
  },
  xai: {
    label: "xAI Grok",
    baseUrl: "https://api.x.ai/v1",
    listModelsUrl: "https://api.x.ai/v1/models",
  },
  openrouter: {
    label: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    listModelsUrl: "https://openrouter.ai/api/v1/models",
  },
  groq: {
    label: "Groq",
    baseUrl: "https://api.groq.com/openai/v1",
    listModelsUrl: "https://api.groq.com/openai/v1/models",
  },
};

function isAIProviderId(v: unknown): v is AIProviderId {
  return typeof v === "string" && v in AI_UPSTREAMS;
}

app.post("/api/ai/models", rateLimit, async (req, res) => {
  const { provider, apiKey } = req.body ?? {};
  if (!isAIProviderId(provider)) {
    return res.status(400).json({ error: "Unsupported AI provider." });
  }
  const key =
    (typeof apiKey === "string" ? apiKey.trim() : "") ||
    (provider === "gemini" ? process.env.GEMINI_API_KEY || "" : "");

  if (provider === "anthropic") {
    return res.json({
      models: [
        { id: "claude-sonnet-4-5", name: "Claude Sonnet 4.5", provider: "anthropic" },
        { id: "claude-haiku-4-5", name: "Claude Haiku 4.5", provider: "anthropic" },
        { id: "claude-opus-4-5", name: "Claude Opus 4.5", provider: "anthropic" },
      ],
    });
  }

  const cfg = AI_UPSTREAMS[provider];
  if (!cfg.listModelsUrl) {
    return res.json({ models: [] });
  }
  if (!key) {
    return res.status(400).json({ error: `No API key provided for ${cfg.label}.` });
  }

  try {
    const url =
      provider === "gemini"
        ? `${cfg.listModelsUrl}?key=${encodeURIComponent(key)}`
        : cfg.listModelsUrl;
    const headers: Record<string, string> =
      provider === "gemini" ? {} : { Authorization: `Bearer ${key}` };

    const upstream = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(20_000),
    });
    if (!upstream.ok) {
      const detail = await upstream.text();
      return res.status(upstream.status).json({
        error: `Failed to list ${cfg.label} models (${upstream.status}): ${detail}`,
      });
    }
    const data = await upstream.json();

    if (provider === "gemini") {
      const models = ((data.models || []) as Array<{
        name: string;
        displayName?: string;
        supportedGenerationMethods?: string[];
      }>)
        .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
        .map((m) => ({
          id: m.name.replace(/^models\//, ""),
          name: m.displayName || m.name,
          provider: "gemini" as const,
          isFree: true,
        }));
      return res.json({ models });
    }

    const list = (data.data || data) as Array<{
      id: string;
      name?: string;
      context_length?: number;
      pricing?: { prompt?: string; completion?: string };
    }>;
    const models = list.map((m) => {
      const isFree =
        provider === "openrouter"
          ? m.id.endsWith(":free") || (m.pricing?.prompt === "0" && m.pricing?.completion === "0")
          : provider === "groq";
      return {
        id: m.id,
        name: m.name || m.id,
        contextLength: m.context_length,
        isFree,
        provider,
      };
    });
    return res.json({ models });
  } catch (error: any) {
    console.error(`[ai/models] ${provider} error:`, error);
    return res.status(502).json({
      error: `Could not reach ${cfg.label}: ${error?.message || "network error"}`,
    });
  }
});

app.post("/api/ai/chat", rateLimit, async (req, res) => {
  const { provider, apiKey, model, messages, system } = req.body ?? {};
  if (!isAIProviderId(provider)) {
    return res.status(400).json({ error: "Unsupported AI provider." });
  }
  const cfg = AI_UPSTREAMS[provider];
  const key =
    (typeof apiKey === "string" ? apiKey.trim() : "") ||
    (provider === "gemini" ? process.env.GEMINI_API_KEY || "" : "");

  if (!key) {
    return res.status(400).json({
      error: `No API key for ${cfg.label}. Add one in Settings → AI assistant.`,
    });
  }
  if (!Array.isArray(messages) || typeof model !== "string" || !model.trim()) {
    return res.status(400).json({ error: "Missing model or messages." });
  }

  try {
    if (provider === "gemini") {
      const contents = messages
        .filter((m: any) => m.role !== "system")
        .map((m: any) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: String(m.content ?? "") }],
        }));
      const body: Record<string, unknown> = { contents };
      if (system) body.system_instruction = { parts: [{ text: String(system) }] };
      const url = `${cfg.baseUrl}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
      const upstream = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(60_000),
      });
      if (!upstream.ok) {
        const detail = await upstream.text();
        return res.status(upstream.status).json({ error: `Gemini error ${upstream.status}: ${detail}` });
      }
      const data = await upstream.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      return res.json({ text, provider, model });
    }

    if (provider === "anthropic") {
      const systemMsg = system || messages.find((m: any) => m.role === "system")?.content;
      const anthropicMessages = messages
        .filter((m: any) => m.role !== "system")
        .map((m: any) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: String(m.content ?? ""),
        }));
      const upstream = await fetch(`${cfg.baseUrl}/messages`, {
        method: "POST",
        headers: {
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          max_tokens: 4096,
          system: systemMsg || undefined,
          messages: anthropicMessages,
        }),
        signal: AbortSignal.timeout(60_000),
      });
      if (!upstream.ok) {
        const detail = await upstream.text();
        return res.status(upstream.status).json({ error: `Anthropic error ${upstream.status}: ${detail}` });
      }
      const data = await upstream.json();
      const text = data.content?.[0]?.text ?? "";
      return res.json({ text, provider, model });
    }

    // OpenAI-compatible: openai, xai, openrouter, groq
    const oaiMessages = [
      ...(system ? [{ role: "system", content: String(system) }] : []),
      ...messages
        .filter((m: any) => m.role !== "system")
        .map((m: any) => ({ role: m.role, content: String(m.content ?? "") })),
    ];
    const originHeader = req.get("origin") || `${req.protocol}://${req.get("host") || "panga.app"}`;
    const upstream = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        ...(provider === "openrouter"
          ? { "HTTP-Referer": originHeader, "X-Title": "Panga" }
          : {}),
      },
      body: JSON.stringify({ model, messages: oaiMessages }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!upstream.ok) {
      const detail = await upstream.text();
      return res.status(upstream.status).json({ error: `${cfg.label} error ${upstream.status}: ${detail}` });
    }
    const data = await upstream.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    return res.json({ text, provider, model });
  } catch (error: any) {
    console.error(`[ai/chat] ${provider} error:`, error);
    return res.status(502).json({
      error: `Could not reach ${cfg.label}: ${error?.message || "network error"}`,
    });
  }
});

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
      model: "gemini-2.5-flash",
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