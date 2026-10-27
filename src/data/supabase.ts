/**
 * Supabase client (Postgres + Auth).
 * Local Dexie remains the offline-first source of truth.
 * This module is used for cloud sync / multi-device when the user configures
 * SUPABASE_URL + SUPABASE_ANON_KEY (or stores them in settings).
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSetting, setSetting } from "./settings";

const SETTINGS_URL = "supabaseUrl";
const SETTINGS_ANON = "supabaseAnonKey";

let client: SupabaseClient | null = null;

export async function getSupabaseConfig(): Promise<{ url: string; anonKey: string } | null> {
  // Prefer env (Vite) then settings
  const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (envUrl && envKey) return { url: envUrl, anonKey: envKey };

  const url = (await getSetting<string>(SETTINGS_URL)) ?? null;
  const anonKey = (await getSetting<string>(SETTINGS_ANON)) ?? null;
  if (url && anonKey) return { url, anonKey };
  return null;
}

export async function setSupabaseConfig(url: string, anonKey: string): Promise<void> {
  await setSetting(SETTINGS_URL, url.trim());
  await setSetting(SETTINGS_ANON, anonKey.trim());
  client = null; // force re-init
}

export async function getSupabase(): Promise<SupabaseClient | null> {
  if (client) return client;
  const cfg = await getSupabaseConfig();
  if (!cfg) return null;
  client = createClient(cfg.url, cfg.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return client;
}

export async function isSupabaseConfigured(): Promise<boolean> {
  return (await getSupabaseConfig()) !== null;
}
