/**
 * Unified chat completion across providers.
 * Uses settings (provider + key + model). Free model ids come only from live list.
 */
import {
  getAIProvider,
  getAIApiKey,
  getAIModel,
  type AIProviderId,
} from "../data/settings";
import { AI_PROVIDERS, resolveDefaultModel, shouldUseServerProxy } from "./providers";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatResult {
  text: string;
  provider: AIProviderId;
  model: string;
}

export async function chatCompletion(
  messages: ChatMessage[],
  opts?: { system?: string; model?: string }
): Promise<ChatResult> {
  const provider = await getAIProvider();
  const apiKey = (await getAIApiKey(provider))?.trim() ?? "";
  if (!apiKey) {
    throw new Error(`No API key for ${AI_PROVIDERS[provider].label}. Add one in Settings → AI assistant.`);
  }
  const model =
    opts?.model ||
    (await getAIModel(provider)) ||
    (await resolveDefaultModel(provider, apiKey));

  const cfg = AI_PROVIDERS[provider];
  const system = opts?.system;

  if (shouldUseServerProxy()) {
    const proxyRes = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, apiKey, model, messages, system }),
    });
    if (proxyRes.ok) {
      return (await proxyRes.json()) as ChatResult;
    }
    if (proxyRes.status !== 404 && proxyRes.status !== 405) {
      let detail = "";
      try {
        const errJson = (await proxyRes.json()) as { error?: string };
        detail = errJson.error || "";
      } catch {
        detail = await proxyRes.text().catch(() => "");
      }
      throw new Error(detail || `${cfg.label} error ${proxyRes.status}`);
    }
  }

  if (provider === "gemini") {
    const contents = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));
    const body: Record<string, unknown> = { contents };
    if (system) body.system_instruction = { parts: [{ text: system }] };
    const url = `${cfg.baseUrl}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Gemini error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return { text, provider, model };
  }

  if (provider === "anthropic") {
    const systemMsg = system || messages.find((m) => m.role === "system")?.content;
    const anthropicMessages = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }));
    const res = await fetch(`${cfg.baseUrl}/messages`, {
      method: "POST",
      headers: {
        ...cfg.authHeader(apiKey),
        "anthropic-dangerous-direct-browser-access": "true",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        system: systemMsg || undefined,
        messages: anthropicMessages,
      }),
    });
    if (!res.ok) throw new Error(`Anthropic error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    const text = data.content?.[0]?.text ?? "";
    return { text, provider, model };
  }

  // OpenAI-compatible: openai, xai, openrouter, groq
  const oaiMessages = [
    ...(system ? [{ role: "system" as const, content: system }] : []),
    ...messages.filter((m) => m.role !== "system"),
  ];
  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      ...cfg.authHeader(apiKey),
      "Content-Type": "application/json",
      ...(provider === "openrouter"
        ? { "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://panga.app", "X-Title": "Panga" }
        : {}),
    },
    body: JSON.stringify({ model, messages: oaiMessages }),
  });
  if (!res.ok) throw new Error(`${cfg.label} error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  return { text, provider, model };
}
