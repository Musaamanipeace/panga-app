// src/sync/supabase.ts
// This is the ONLY file that initializes the Supabase client.
// The rest of the sync module (built in a later stage) will import
// `supabase` from here — never call `createClient()` anywhere else.

import { createClient } from "@supabase/supabase-js";

// These values come from your Supabase project settings.
// See README.md -> "Supabase project setup" for exact steps.
// The URL and anon key are safe to expose in client code (Supabase
// access is controlled by Row-Level Security policies, which we set
// up in a later stage).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
