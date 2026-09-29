import express from "express";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";
import {
  authenticateUser,
  registerUser,
  reconcileSync,
  pushRecord,
  deleteRecord,
  pushSetting,
  getUserCloudData,
} from "./server/cloudDb.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

app.use(express.json({ limit: "50mb" }));

// Health check endpoint for Fly.io machine monitoring and health checks
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime(), timestamp: Date.now() });
});

// --- Cloud Authentication Routes ---
app.post("/api/auth/signup", (req, res) => {
  const { email, password } = req.body;
  const result = registerUser(email, password);
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  res.json({ ok: true, user: result.user });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const result = authenticateUser(email, password);
  if (result.error) {
    return res.status(401).json({ error: result.error });
  }
  res.json({ ok: true, user: result.user });
});

// --- Cloud Sync Routes ---
app.post("/api/sync/sync-all", (req, res) => {
  try {
    const { userId, changes, deletions, lastSyncTime } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "userId is required for sync." });
    }
    const result = reconcileSync(userId, changes || {}, deletions || [], Number(lastSyncTime) || 0);
    res.json({ ok: true, ...result });
  } catch (err: any) {
    console.error("Cloud sync-all error:", err);
    res.status(500).json({ ok: false, error: err?.message || "Sync failed" });
  }
});

app.post("/api/sync/push", (req, res) => {
  try {
    const { userId, table, record } = req.body;
    if (!userId || !table || !record) {
      return res.status(400).json({ error: "userId, table, and record are required." });
    }
    const success = pushRecord(userId, table, record);
    res.json({ ok: success });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message });
  }
});

app.post("/api/sync/delete", (req, res) => {
  try {
    const { userId, table, id } = req.body;
    if (!userId || !table || !id) {
      return res.status(400).json({ error: "userId, table, and id are required." });
    }
    const success = deleteRecord(userId, table, id);
    res.json({ ok: success });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message });
  }
});

app.post("/api/sync/setting", (req, res) => {
  try {
    const { userId, key, value } = req.body;
    if (!userId || !key) {
      return res.status(400).json({ error: "userId and key are required." });
    }
    const success = pushSetting(userId, key, value);
    res.json({ ok: success });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message });
  }
});

app.get("/api/sync/status", (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) return res.status(400).json({ error: "userId is required." });
  const data = getUserCloudData(userId);
  const summary: Record<string, number> = {};
  for (const [table, items] of Object.entries(data.tables)) {
    summary[table] = Object.keys(items || {}).length;
  }
  res.json({
    ok: true,
    userId,
    cloudUpdatedAt: data.updatedAt,
    tableCounts: summary,
  });
});

app.get("/api/sync/export", (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) return res.status(400).json({ error: "userId is required." });
  const data = getUserCloudData(userId);
  res.setHeader("Content-Disposition", `attachment; filename="panga-cloud-backup-${Date.now()}.json"`);
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(data, null, 2));
});

// Server-side Gemini API route
app.post("/api/assistant/chat", async (req, res) => {
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
    app.use(express.static(distPath));
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
