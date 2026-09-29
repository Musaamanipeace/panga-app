// src/data/settings.ts
import { db, SETTINGS_KEYS } from "./db";
import { syncPushSetting, getSupabaseClient } from "../sync/supabaseSync";

export { SETTINGS_KEYS };

export async function getSetting<T = any>(key: keyof typeof SETTINGS_KEYS | string): Promise<T | undefined> {
  if (!db.isOpen()) await db.open();
  const dbKey = (SETTINGS_KEYS as any)[key] || key;
  const row = await db.settings.get(dbKey);
  if (row?.value !== undefined && row?.value !== null) {
    return row.value as T;
  }

  // Fallback to Supabase remote setting if not in Dexie
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data } = await client.from("settings").select("value").eq("key", dbKey).single();
      if (data && data.value !== undefined) {
        await db.settings.put({ key: dbKey, value: data.value });
        return data.value as T;
      }
    } catch {}
  }

  return undefined;
}

export async function setSetting(key: keyof typeof SETTINGS_KEYS | string, value: any): Promise<void> {
  if (!db.isOpen()) await db.open();
  const dbKey = (SETTINGS_KEYS as any)[key] || key;
  await db.settings.put({ key: dbKey, value });
  void syncPushSetting(dbKey, value);
}

// Google Calendar
export async function getGoogleCalendarToken(): Promise<any> {
  return await getSetting<any>("googleCalendarToken");
}

export async function setGoogleCalendarToken(token: any): Promise<void> {
  await setSetting("googleCalendarToken", token);
}

// Google Drive - use string keys for dynamic settings
export async function getGooglePickerKey(): Promise<string | null> {
  return (await getSetting<string>("googlePickerKey")) ?? null;
}

export async function setGooglePickerKey(key: string): Promise<void> {
  await setSetting("googlePickerKey", key);
}

export async function getDriveFolder(projectId: string): Promise<string | null> {
  return (await getSetting<string>(`driveFolder:${projectId}`)) ?? null;
}

export async function setDriveFolder(projectId: string, folderId: string): Promise<void> {
  await setSetting(`driveFolder:${projectId}`, folderId);
}

// Google OAuth (shared)
export async function getGoogleClientId(): Promise<string | null> {
  return (await getSetting<string>("googleCalendarClientId")) ?? null;
}

export async function setGoogleClientId(clientId: string): Promise<void> {
  await setSetting("googleCalendarClientId", clientId);
}

export async function getGoogleAccessToken(): Promise<{ access_token: string; expires_at: number } | null> {
  return (await getSetting<{ access_token: string; expires_at: number }>("googleAccessToken")) ?? null;
}

export async function setGoogleAccessToken(token: { access_token: string; expires_at: number }): Promise<void> {
  await setSetting("googleAccessToken", token);
}

export async function clearGoogleAccessToken(): Promise<void> {
  await setSetting("googleAccessToken", null);
}

// Gemini API Key (Saved locally in Dexie AND synced to Supabase database)
export async function getGeminiApiKey(): Promise<string | null> {
  return (await getSetting<string>("geminiApiKey")) ?? null;
}

export async function setGeminiApiKey(key: string): Promise<void> {
  await setSetting("geminiApiKey", key);
}
