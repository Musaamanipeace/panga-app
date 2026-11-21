// Remembers records deleted on this device so the Supabase sync can tell the
// cloud about them. Tiny and dependency-free so any data module can import it.
import { getUserScopedKey } from "../auth/session";

export type SyncKind = "task" | "thought" | "note";
export interface Tombstone {
  kind: SyncKind;
  id: string;
  at: number;
}

const KEY = "panga_sb_tombstones";
const MAX = 500;

export function listTombstones(): Tombstone[] {
  try {
    const raw = localStorage.getItem(getUserScopedKey(KEY));
    return raw ? (JSON.parse(raw) as Tombstone[]) : [];
  } catch {
    return [];
  }
}

function save(list: Tombstone[]): void {
  try {
    localStorage.setItem(getUserScopedKey(KEY), JSON.stringify(list.slice(-MAX)));
  } catch {
    /* storage full or unavailable: sync just skips these deletes */
  }
}

export function recordTombstone(kind: SyncKind, id: string): void {
  const list = listTombstones().filter((t) => !(t.kind === kind && t.id === id));
  list.push({ kind, id, at: Date.now() });
  save(list);
}

export function clearTombstones(upTo: number): void {
  save(listTombstones().filter((t) => t.at > upTo));
}
