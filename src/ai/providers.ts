/**
 * Multi-provider AI layer.
 * - Paid / first-party: Gemini, OpenAI, Anthropic (Claude), xAI (Grok)
 * - Aggregator for free + many paid: OpenRouter (recommended for free models)
 * - Free models are ALWAYS fetched live from the provider — never hard-coded.
 */

export type AIProviderId =
  | "gemini"
  | "openai"
  | "anthropic"
  | "xai"
  | "openrouter"
  | "groq";

export interface AIModelInfo {
  id: string;
  name: string;
  contextLength?: number;
  isFree?: boolean;
  provider: AIProviderId;
}

export interface AIProviderConfig {
  id: AIProviderId;
  label: string;
  /** Base URL for chat completions (OpenAI-compatible where possible) */
  baseUrl: string;
  /** Endpoint or method to list models dynamically (for free/paid discovery) */
  listModelsUrl?: string;
  /** Whether this provider exposes free models that must be fetched live */
  supportsFreeModels: boolean;
  /** Header / auth style */
  authHeader: (apiKey: string) => Record<string, string>;
  /** Whether the provider uses OpenAI-compatible chat/completions */
  openaiCompatible: boolean;
}

export const AI_PROVIDERS: Record<AIProviderId, AIProviderConfig> = {
  gemini: {
    id: "gemini",
    label: "Google Gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    listModelsUrl: "https://generativelanguage.googleapis.com/v1beta/models",
    supportsFreeModels: true, // free tier models appear in the list
    authHeader: (key) => ({}), // key is query param for Gemini
    openaiCompatible: false,
  },
  openai: {
    id: "openai",
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    listModelsUrl: "https://api.openai.com/v1/models",
    supportsFreeModels: false,
    authHeader: (key) => ({ Authorization: `Bearer ${key}` }),
    openaiCompatible: true,
  },
  anthropic: {
    id: "anthropic",
    label: "Anthropic Claude",
    baseUrl: "https://api.anthropic.com/v1",
    // Anthropic does not have a public free model list endpoint; models are known
    supportsFreeModels: false,
    authHeader: (key) => ({
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    }),
    openaiCompatible: false,
  },
  xai: {
    id: "xai",
    label: "xAI Grok",
    baseUrl: "https://api.x.ai/v1",
    listModelsUrl: "https://api.x.ai/v1/models",
    supportsFreeModels: false,
    authHeader: (key) => ({ Authorization: `Bearer ${key}` }),
    openaiCompatible: true,
  },
  openrouter: {
    id: "openrouter",
    label: "OpenRouter (many free + paid)",
    baseUrl: "https://openrouter.ai/api/v1",
    listModelsUrl: "https://openrouter.ai/api/v1/models",
    supportsFreeModels: true,
    authHeader: (key) => ({ Authorization: `Bearer ${key}` }),
    openaiCompatible: true,
  },
  groq: {
    id: "groq",
    label: "Groq (fast free tier)",
    baseUrl: "https://api.groq.com/openai/v1",
    listModelsUrl: "https://api.groq.com/openai/v1/models",
    supportsFreeModels: true,
    authHeader: (key) => ({ Authorization: `Bearer ${key}` }),
    openaiCompatible: true,
  },
};

/** Fetch live model list from a provider. Never hard-code free model names. */
export async function fetchAvailableModels(
  providerId: AIProviderId,
  apiKey: string
): Promise<AIModelInfo[]> {
  const cfg = AI_PROVIDERS[providerId];
  if (!cfg.listModelsUrl) {
    // Anthropic: return a small known set of current paid models only as fallback
    if (providerId === "anthropic") {
      return [
        { id: "claude-sonnet-4-5", name: "Claude Sonnet 4.5", provider: "anthropic" },
        { id: "claude-haiku-4-5", name: "Claude Haiku 4.5", provider: "anthropic" },
        { id: "claude-opus-4-5", name: "Claude Opus 4.5", provider: "anthropic" },
      ];
    }
    return [];
  }

  try {
    let url = cfg.listModelsUrl;
    const headers: Record<string, string> = {
      ...cfg.authHeader(apiKey),
      "Content-Type": "application/json",
    };

    if (providerId === "gemini") {
      url = `${cfg.listModelsUrl}?key=${encodeURIComponent(apiKey)}`;
    }

    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error(`Failed to list models: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();

    if (providerId === "gemini") {
      const models = (data.models || []) as Array<{ name: string; displayName?: string; supportedGenerationMethods?: string[] }>;
      return models
        .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
        .map((m) => ({
          id: m.name.replace(/^models\//, ""),
          name: m.displayName || m.name,
          provider: "gemini" as const,
          isFree: true, // Gemini free tier is the common path for client keys
        }));
    }

    // OpenAI-compatible shape (OpenAI, xAI, Groq, OpenRouter)
    const list = (data.data || data) as Array<{
      id: string;
      name?: string;
      context_length?: number;
      pricing?: { prompt?: string; completion?: string };
    }>;

    return list.map((m) => {
      const isFree =
        providerId === "openrouter"
          ? m.id.endsWith(":free") || (m.pricing?.prompt === "0" && m.pricing?.completion === "0")
          : providerId === "groq";
      return {
        id: m.id,
        name: m.name || m.id,
        contextLength: m.context_length,
        isFree,
        provider: providerId,
      };
    });
  } catch (err) {
    console.warn(`[ai] fetchAvailableModels(${providerId}) failed`, err);
    return [];
  }
}

/** Filter to free models only (for OpenRouter / Groq / Gemini free tier). */
export function filterFreeModels(models: AIModelInfo[]): AIModelInfo[] {
  return models.filter((m) => m.isFree === true || m.id.includes(":free"));
}
