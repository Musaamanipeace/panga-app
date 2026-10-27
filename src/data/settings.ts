// src/data/settings.ts
import { db, SETTINGS_KEYS } from "./db";
import { syncPushSetting } from "../sync/sync";

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
  void syncPushSetting(dbKey, value);
}

// Google Calendar
export async function getGoogleCalendarToken(): Promise<any> {
  return await getSetting<any>("googleCalendarToken");
}

export async function setGoogleCalendarToken(token: any): Promise<void> {
  await setSetting("googleCalendarToken", token);
}

export async function getGoogleCalendarClientId(): Promise<string | null> {
  return (await getSetting<string>("googleCalendarClientId")) ?? null;
}

export const getGoogleClientId = getGoogleCalendarClientId;

export async function setGoogleCalendarClientId(clientId: string): Promise<void> {
  await setSetting("googleCalendarClientId", clientId);
}

export const setGoogleClientId = setGoogleCalendarClientId;

export async function getGooglePickerKey(): Promise<string | null> {
  return (await getSetting<string>("googlePickerKey")) ?? null;
}

export async function setGooglePickerKey(key: string): Promise<void> {
  await setSetting("googlePickerKey", key);
}

export async function getDriveFolderId(projectId: string): Promise<string | null> {
  return (await getSetting<string>(`${SETTINGS_KEYS.driveFolderPrefix}${projectId}`)) ?? null;
}

export const getDriveFolder = getDriveFolderId;

export async function setDriveFolderId(projectId: string, folderId: string): Promise<void> {
  await setSetting(`${SETTINGS_KEYS.driveFolderPrefix}${projectId}`, folderId);
}

export const setDriveFolder = setDriveFolderId;

export async function clearDriveFolderId(projectId: string): Promise<void> {
  if (!db.isOpen()) await db.open();
  await db.settings.delete(`${SETTINGS_KEYS.driveFolderPrefix}${projectId}`);
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

// Multi-cloud Sync Provider Settings
export type CloudSyncProvider = "google_drive";

export async function getActiveSyncProvider(): Promise<CloudSyncProvider> {
  return (await getSetting<CloudSyncProvider>("activeSyncProvider")) ?? "google_drive";
}

export async function setActiveSyncProvider(provider: CloudSyncProvider): Promise<void> {
  await setSetting("activeSyncProvider", provider);
}

// Last Cloud Sync Metadata
export interface LastSyncInfo {
  provider: CloudSyncProvider;
  timestamp: number;
  message?: string;
}

export async function getLastSyncInfo(): Promise<LastSyncInfo | null> {
  return (await getSetting<LastSyncInfo>("lastCloudSyncInfo")) ?? null;
}

export async function setLastSyncInfo(info: LastSyncInfo): Promise<void> {
  await setSetting("lastCloudSyncInfo", info);
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
