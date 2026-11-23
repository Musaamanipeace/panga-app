// src/data/settings.ts
import { db, SETTINGS_KEYS } from "./db";

export { SETTINGS_KEYS };

export async function getSetting<T = any>(key: keyof typeof SETTINGS_KEYS | string): Promise<T | undefined> {
  if (!db.isOpen()) await db.open();
  const dbKey = (SETTINGS_KEYS as any)[key] || key;
  const row = await db.settings.get(dbKey);
  if (row?.value !== undefined && row?.value !== null) {
    return row.value as T;
  }
  return undefined;
}

export async function setSetting(key: keyof typeof SETTINGS_KEYS | string, value: any): Promise<void> {
  if (!db.isOpen()) await db.open();
  const dbKey = (SETTINGS_KEYS as any)[key] || key;
  await db.settings.put({ key: dbKey, value });
}

// ---------------------------------------------------------------------------
// AI multi-provider settings
// ---------------------------------------------------------------------------
export type AIProviderId = "gemini" | "openai" | "anthropic" | "xai" | "openrouter" | "groq";

export async function getAIProvider(): Promise<AIProviderId> {
  return (await getSetting<AIProviderId>("aiProvider")) ?? "openrouter";
}
export async function setAIProvider(p: AIProviderId): Promise<void> {
  await setSetting("aiProvider", p);
}

export async function getAIApiKey(provider: AIProviderId): Promise<string | null> {
  return (await getSetting<string>(`aiApiKey_${provider}`)) ?? null;
}
export async function setAIApiKey(provider: AIProviderId, key: string): Promise<void> {
  await setSetting(`aiApiKey_${provider}`, key);
}

export async function getAIModel(provider: AIProviderId): Promise<string | null> {
  return (await getSetting<string>(`aiModel_${provider}`)) ?? null;
}
export async function setAIModel(provider: AIProviderId, model: string): Promise<void> {
  await setSetting(`aiModel_${provider}`, model);
}

// Keep Gemini helpers for backward compatibility
export async function getGeminiApiKey(): Promise<string | null> {
  return (await getAIApiKey("gemini")) ?? (await getSetting<string>("geminiApiKey")) ?? null;
}
export async function setGeminiApiKey(key: string): Promise<void> {
  await setAIApiKey("gemini", key);
  await setSetting("geminiApiKey", key);
}
