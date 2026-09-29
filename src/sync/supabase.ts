// src/sync/supabase.ts
// Supabase client and sync exports.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig, getSupabaseClient } from "./supabaseSync";

export {
  getSupabaseConfig,
  saveSupabaseConfig,
  isSupabaseConfigured,
  getSupabaseClient,
  testSupabaseConnection,
  syncAll,
  syncPushRecord,
  syncDeleteRecord,
  syncPushSetting,
  subscribeSyncStatus,
  getLastSyncTime,
} from "./supabaseSync";

// Default client instance for backward compatibility
const config = getSupabaseConfig();
export const supabase: SupabaseClient =
  getSupabaseClient() ||
  createClient(
    config.url || "https://placeholder-project.supabase.co",
    config.anonKey || "placeholder-anon-key",
    { auth: { persistSession: false } }
  );

