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

// Gemini API Key (Saved locally in Dexie)
export async function getGeminiApiKey(): Promise<string | null> {
  return (await getSetting<string>("geminiApiKey")) ?? null;
}

export async function setGeminiApiKey(key: string): Promise<void> {
  await setSetting("geminiApiKey", key);
}

// Email Backup API Key (Saved locally in Dexie per user)
export async function getEmailBackupApiKey(): Promise<string | null> {
  return (await getSetting<string>("emailBackupApiKey")) ?? null;
}

export async function setEmailBackupApiKey(key: string): Promise<void> {
  await setSetting("emailBackupApiKey", key);
}

export async function getEmailBackupProvider(): Promise<string> {
  return (await getSetting<string>("emailBackupProvider")) ?? "resend";
}

export async function setEmailBackupProvider(provider: string): Promise<void> {
  await setSetting("emailBackupProvider", provider);
}

// Multi-cloud Sync Provider Settings
export type CloudSyncProvider = "google_drive" | "github_gist" | "nextcloud";

export async function getActiveSyncProvider(): Promise<CloudSyncProvider> {
  return (await getSetting<CloudSyncProvider>("activeSyncProvider")) ?? "google_drive";
}

export async function setActiveSyncProvider(provider: CloudSyncProvider): Promise<void> {
  await setSetting("activeSyncProvider", provider);
}

// GitHub Gist settings
export async function getGithubGistToken(): Promise<string | null> {
  return (await getSetting<string>("githubGistToken")) ?? null;
}

export async function setGithubGistToken(token: string): Promise<void> {
  await setSetting("githubGistToken", token);
}

export async function getGithubGistId(): Promise<string | null> {
  return (await getSetting<string>("githubGistId")) ?? null;
}

export async function setGithubGistId(gistId: string): Promise<void> {
  await setSetting("githubGistId", gistId);
}

// Nextcloud (WebDAV) settings
export interface NextcloudConfig {
  serverUrl: string;
  username: string;
  password?: string;
}

export async function getNextcloudConfig(): Promise<NextcloudConfig | null> {
  return (await getSetting<NextcloudConfig>("nextcloudConfig")) ?? null;
}

export async function setNextcloudConfig(config: NextcloudConfig): Promise<void> {
  await setSetting("nextcloudConfig", config);
}

export async function clearNextcloudConfig(): Promise<void> {
  await setSetting("nextcloudConfig", null);
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

