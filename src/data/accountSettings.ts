// src/data/accountSettings.ts
// Account-level settings (BYOK keys and the AI provider/model choice). They live
// outside the per-workspace IndexedDB so switching workspaces never touches them.

import { getSessionUserId } from "../auth/sessionUserId";

const STORE_KEY = "panga_account_settings";

export function isAccountSettingKey(key: string): boolean {
  return (
    key === "geminiApiKey" ||
    key === "aiProvider" ||
    key.startsWith("aiApiKey_") ||
    key.startsWith("aiModel_")
  );
}

function storeKey(): string {
  return `${STORE_KEY}_${getSessionUserId() ?? "guest"}`;
}

function readAll(): Record<string, unknown> {
  if (typeof window === "undefined" || !window.localStorage) return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(storeKey()) ?? "{}");
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export function getAccountSetting<T = unknown>(key: string): T | undefined {
  const v = readAll()[key];
  return v === undefined || v === null ? undefined : (v as T);
}

export function setAccountSetting(key: string, value: unknown): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  const all = readAll();
  all[key] = value;
  localStorage.setItem(storeKey(), JSON.stringify(all));
}

export function clearAccountSettings(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  localStorage.removeItem(storeKey());
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(`${STORE_KEY}_`)) keysToRemove.push(k);
  }
  for (const k of keysToRemove) {
    localStorage.removeItem(k);
  }
}

export function getAllAccountSettings(): Record<string, unknown> {
  return readAll();
}
