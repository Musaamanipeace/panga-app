import { useEffect, useState } from "react";
import { subscribeSupabaseSync, type SyncState } from "../sync/supabaseSync";

/**
 * Header badge that answers one question: where is this workspace stored?
 * Detailed sync progress lives in Settings → Account & sync, so this stays a
 * single, quiet label.
 */
export function SyncStatusIndicator() {
  const [sync, setSync] = useState<SyncState>({ phase: "off", at: null, message: "" });

  useEffect(() => subscribeSupabaseSync(setSync), []);

  const cloud = sync.phase !== "off";
  const error = sync.phase === "error";
  const label = cloud ? "Supabase sync" : "Local only";
  const title = cloud
    ? `Synced with your Supabase project${sync.message ? ` — ${sync.message}` : ""}`
    : "Stored on this device only. Add Supabase in Settings to sync.";

  return (
    <span
      className={`sync-status${error ? " sync-status-error" : ""}`}
      style={{ color: error ? "#ef4444" : cloud ? "#10b981" : "var(--color-text-muted)" }}
      title={title}
      aria-label={label}
    >
      {cloud ? "☁" : "○"} {label}
    </span>
  );
}
