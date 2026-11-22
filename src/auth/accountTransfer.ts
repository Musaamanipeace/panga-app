// Helpers for moving a guest workspace into a Supabase account.

import { isGuest } from "./session";
import { exportDbState, hasLocalData, mergeDbState } from "../data/db";

/** Copy the guest database before signing in (signing in switches the DB). */
export async function captureGuestData(): Promise<Record<string, any[]> | null> {
  if (!isGuest()) return null;
  if (!(await hasLocalData())) return null;
  return exportDbState({ includeSecrets: true });
}

/** Merge the captured guest records into the freshly selected account store. */
export async function mergeCapturedGuestData(data: Record<string, any[]>): Promise<void> {
  await mergeDbState(data);
}
