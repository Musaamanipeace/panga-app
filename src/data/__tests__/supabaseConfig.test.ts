import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../db";
import { getSupabaseConfig, setSupabaseConfig } from "../supabase";

beforeEach(async () => {
  vi.unstubAllEnvs();
  await db.settings.clear();
});

describe("bring-your-own Supabase config", () => {
  it("ignores environment variables and only uses values saved in Settings", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://env-only.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "env-only-anon-key");

    expect(await getSupabaseConfig()).toBeNull();

    await setSupabaseConfig("https://my-project.supabase.co", "my-anon-key");
    expect(await getSupabaseConfig()).toEqual({
      url: "https://my-project.supabase.co",
      anonKey: "my-anon-key",
    });
  });
});
