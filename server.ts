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

// Health check endpoint
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

// Email backup route
app.post("/api/backup/email", async (req, res) => {
  try {
    const { email, snapshot, apiKey: clientApiKey, provider = "resend" } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email address is required" });
    }
    if (!snapshot) {
      return res.status(400).json({ error: "Snapshot data is required" });
    }

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `panga-backup-${timestamp}.json`;
    const jsonContent = JSON.stringify(snapshot, null, 2);

    const html = `
      <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1f2937; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 20px;">📦 Panga Backup</h1>
        </div>
        <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p>Your Panga data backup is attached as <strong>${filename}</strong>.</p>
          <p>Exported on: ${new Date().toLocaleString()}</p>
          <p style="color: #6b7280; font-size: 14px;">
            This file contains all your projects, tasks, resources, notes, milestones, reminders, and settings.
            Restore anytime in Panga Settings &rarr; <strong>Upload Snapshot</strong>.
          </p>
        </div>
      </div>
    `;

    const resendKey = clientApiKey || process.env.RESEND_API_KEY;
    const sendgridKey = clientApiKey || process.env.SENDGRID_API_KEY;

    if (provider === "resend" && resendKey) {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || "Panga <onboarding@resend.dev>",
          to: [email],
          subject: `Panga Backup - ${timestamp}`,
          html,
          attachments: [{
            filename,
            content: Buffer.from(jsonContent).toString("base64"),
          }],
        }),
      });
      if (emailRes.ok) {
        return res.json({ ok: true, message: `Backup sent successfully to ${email}` });
      }
      const errData = await emailRes.json().catch(() => ({}));
      return res.status(400).json({ error: `Resend error: ${errData.message || JSON.stringify(errData)}` });
    }

    if (provider === "sendgrid" && sendgridKey) {
      const emailRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sendgridKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email }] }],
          from: { email: process.env.SENDGRID_FROM_EMAIL || "noreply@panga.app" },
          subject: `Panga Backup - ${timestamp}`,
          content: [{ type: "text/html", value: html }],
          attachments: [{
            content: Buffer.from(jsonContent).toString("base64"),
            filename,
            type: "application/json",
            disposition: "attachment",
          }],
        }),
      });
      if (emailRes.ok) {
        return res.json({ ok: true, message: `Backup sent successfully to ${email}` });
      }
      return res.status(400).json({ error: "SendGrid rejected the email dispatch. Check your API key." });
    }

    return res.status(400).json({
      error: "No email API key found. Enter your free API key from Resend (resend.com) in Settings, or use 'Download Snapshot' for an instant local backup.",
    });
  } catch (error: any) {
    console.error("Email backup error:", error);
    res.status(500).json({ error: error?.message || "Failed to send backup email" });
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
