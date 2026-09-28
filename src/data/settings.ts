// src/data/settings.ts
import { db, SETTINGS_KEYS } from "./db";

export { SETTINGS_KEYS };

export async function getSetting<T = any>(key: keyof typeof SETTINGS_KEYS): Promise<T | undefined> {
  const row = await db.settings.get(SETTINGS_KEYS[key]);
  return row?.value as T | undefined;
}

export async function setSetting(key: keyof typeof SETTINGS_KEYS, value: any): Promise<void> {
  await db.settings.put({ key: SETTINGS_KEYS[key], value });
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
  const row = await db.settings.get("googlePickerKey");
  return row?.value as string | null;
}

export async function setGooglePickerKey(key: string): Promise<void> {
  await db.settings.put({ key: "googlePickerKey", value: key });
}

export async function getDriveFolder(projectId: string): Promise<string | null> {
  const row = await db.settings.get(`driveFolder:${projectId}`);
  return row?.value as string | null;
}

export async function setDriveFolder(projectId: string, folderId: string): Promise<void> {
  await db.settings.put({ key: `driveFolder:${projectId}`, value: folderId });
}

// Google OAuth (shared)
export async function getGoogleClientId(): Promise<string | null> {
  return (await getSetting<string>("googleCalendarClientId")) ?? null;
}

export async function setGoogleClientId(clientId: string): Promise<void> {
  await setSetting("googleCalendarClientId", clientId);
}

export async function getGoogleAccessToken(): Promise<{ access_token: string; expires_at: number } | null> {
  const row = await db.settings.get("googleAccessToken");
  return row?.value as { access_token: string; expires_at: number } | null;
}

export async function setGoogleAccessToken(token: { access_token: string; expires_at: number }): Promise<void> {
  await db.settings.put({ key: "googleAccessToken", value: token });
}

export async function clearGoogleAccessToken(): Promise<void> {
  await db.settings.put({ key: "googleAccessToken", value: null });
}

// Gemini
export async function getGeminiApiKey(): Promise<string | null> {
  return (await getSetting<string>("geminiApiKey")) ?? null;
}

export async function setGeminiApiKey(key: string): Promise<void> {
  await setSetting("geminiApiKey", key);
}
