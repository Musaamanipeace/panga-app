import express from "express";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";
import {
  authenticateUser,
  registerUser,
  createSessionToken,
  verifySessionToken,
} from "./server/cloudDb.ts";

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
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://accounts.google.com; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.google.com https://googleapis.com https://api.resend.com https://api.sendgrid.com; img-src 'self' data: https:; object-src 'none'; frame-ancestors 'none';"
  );
  next();
});

// Simple in-memory rate limiter (per IP)
const rateLimitStore = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;

function rateLimit(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip || "unknown";
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  if (!entry || now > entry.reset) {
    rateLimitStore.set(ip, { count: 1, reset: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }
  next();
}

// Session token verification middleware
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required." });
  }
  const token = auth.slice(7);
  const payload = verifySessionToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Invalid or expired session token." });
  }
  (req as any).session = payload;
  next();
}

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime(), timestamp: Date.now() });
});

// --- Authentication Routes ---
app.post("/api/auth/signup", rateLimit, (req, res) => {
  const { email, password } = req.body;
  const result = registerUser(email, password);
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  if (result.user) {
    const token = createSessionToken(result.user.id, result.user.email);
    return res.json({ ok: true, user: result.user, token });
  }
  return res.status(400).json({ error: "Registration failed." });
});

app.post("/api/auth/login", rateLimit, (req, res) => {
  const { email, password } = req.body;
  const result = authenticateUser(email, password);
  if (result.error) {
    return res.status(401).json({ error: result.error });
  }
  if (result.user) {
    const token = createSessionToken(result.user.id, result.user.email);
    return res.json({ ok: true, user: result.user, token });
  }
  return res.status(401).json({ error: "Authentication failed." });
});

// --- Server-side Gemini API route (requires auth) ---
app.post("/api/assistant/chat", rateLimit, requireAuth, async (req, res) => {
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

// Email backup route (requires auth + user email must match session)
app.post("/api/backup/email", rateLimit, requireAuth, async (req, res) => {
  try {
    const { email, snapshot, apiKey: clientApiKey, provider = "resend" } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email address is required" });
    }

    if (!snapshot) {
      return res.status(400).json({ error: "Snapshot data is required" });
    }

    const session = (req as any).session;
    if (email !== session.email) {
      return res.status(403).json({ error: "Email must match your authenticated session." });
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
            Restore anytime in Panga Settings → <strong>Upload Snapshot</strong>.
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
