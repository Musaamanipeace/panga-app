// src/data/settings.ts
import { db, type SETTINGS_KEYS } from "./db";

export async function getSetting<T = any>(key: keyof typeof SETTINGS_KEYS): Promise<T | undefined> {
  const row = await db.settings.get(SETTINGS_KEYS[key]);
  return row?.value as T | undefined;
}

export async function setSetting(key: keyof typeof SETTINGS_KEYS, value: any): Promise<void> {
  await db.settings.put({ key: SETTINGS_KEYS[key], value });
}

export async function getGeminiApiKey(): Promise<string | null> {
  return (await getSetting<string>("geminiApiKey")) ?? null;
}

export async function setGeminiApiKey(key: string): Promise<void> {
  await setSetting("geminiApiKey", key);
}

export async function getGoogleCalendarToken(): Promise<any> {
  return await getSetting<any>("googleCalendarToken");
}

export async function setGoogleCalendarToken(token: any): Promise<void> {
  await setSetting("googleCalendarToken", token);
}
