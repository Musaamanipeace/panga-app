// Username + password sign-in and cloud sync through Supabase.
// Local IndexedDB stays the source of truth; this only mirrors tasks, thoughts and notes.
// Clipboard clips and PDFs are never uploaded.
import { getSupabase, getSupabaseConfig, resetSupabaseClient } from "../data/supabase";
import { db } from "../data/db";
import {
  clearSupabaseAuthStorage,
  getSessionUserId,
  getUserScopedKey,
  logoutAndStartGuest,
  restoreSession,
  setSession,
} from "../auth/session";
import { listTombstones, clearTombstones, type SyncKind } from "./tombstones";

const DOMAIN_KEY = "panga_login_domain";
export const DEFAULT_LOGIN_DOMAIN = "panga.invalid";

export function getLoginDomain(): string {
  try {
    return localStorage.getItem(DOMAIN_KEY) || DEFAULT_LOGIN_DOMAIN;
  } catch {
    return DEFAULT_LOGIN_DOMAIN;
  }
}

export function setLoginDomain(domain: string): void {
  try {
    localStorage.setItem(DOMAIN_KEY, domain.trim().toLowerCase() || DEFAULT_LOGIN_DOMAIN);
  } catch {
    /* ignore */
  }
}

/** Supabase Auth wants an email, so a plain username becomes username@domain. A real email is used as typed. */
export function usernameToEmail(login: string, domain = getLoginDomain()): string {
  const clean = login.trim().toLowerCase();
  if (clean.includes("@")) return clean;
  return `${clean.replace(/[^a-z0-9._-]/g, "")}@${domain}`;
}

export function validateCredentials(login: string, password: string): string | null {
  const name = login.trim();
  if (name.length < 3) return "Username must be at least 3 characters.";
  if (!name.includes("@") && /[^a-zA-Z0-9._-]/.test(name)) return "Usernames can use letters, numbers, dot, dash and underscore.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  return null;
}

const NEEDS_SETUP = "Add your Supabase URL and anon key in Settings first. Choose “Continue as guest” to reach Settings, then sign up.";

export async function signUp(login: string, password: string): Promise<{ error?: string; needsConfirm?: boolean; switched?: boolean }> {
  const bad = validateCredentials(login, password);
  if (bad) return { error: bad };
  const sb = await getSupabase();
  if (!sb) return { error: NEEDS_SETUP };
  const email = usernameToEmail(login);
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) return { error: friendly(error.message) };
  if (!data.session) return { needsConfirm: true };
  await setSession(data.session.user.id, email);
  return { switched: true };
}

export async function signIn(login: string, password: string): Promise<{ error?: string; switched?: boolean }> {
  const bad = validateCredentials(login, password);
  if (bad) return { error: bad };
  const sb = await getSupabase();
  if (!sb) return { error: NEEDS_SETUP };
  const email = usernameToEmail(login);
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return { error: friendly(error.message) };
  if (!data.session) return { error: "Sign-in did not return a session. Try again." };
  await setSession(data.session.user.id, email);
  return { switched: true };
}

export async function signOut(): Promise<void> {
  const sb = await getSupabase();
  await sb?.auth.signOut();
  await logoutAndStartGuest();
}

/** Reconcile the local session with a persisted Supabase session on app start. */
export async function restoreAppSession(): Promise<void> {
  const account = await getAccount();
  if (account && getSessionUserId() !== account.id) {
    await setSession(account.id, account.login);
    return;
  }
  await restoreSession();
}

/** Serialised Supabase auth session for a JSON snapshot (includes the refresh token). */
export async function getSupabaseSessionSnapshot(): Promise<unknown | null> {
  const sb = await getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session ?? null;
}

/** Restore a snapshot's Supabase session before the client is created. */
export async function restoreSupabaseSession(session: unknown, url?: string): Promise<void> {
  if (!session) return;
  const projectUrl = url ?? (await getSupabaseConfig())?.url;
  if (!projectUrl) return;
  clearSupabaseAuthStorage();
  const ref = new URL(projectUrl).hostname.split(".")[0] || "supabase";
  try {
    localStorage.setItem(`sb-${ref}-auth-token`, JSON.stringify(session));
  } catch {
    /* storage unavailable */
  }
  resetSupabaseClient();
}

export async function getAccount(): Promise<{ id: string; login: string } | null> {
  const sb = await getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  const u = data.session?.user;
  if (!u?.email) return null;
  const suffix = `@${getLoginDomain()}`;
  return { id: u.id, login: u.email.endsWith(suffix) ? u.email.slice(0, -suffix.length) : u.email };
}

function friendly(msg: string): string {
  if (/invalid login/i.test(msg)) return "Wrong username or password.";
  if (/already registered/i.test(msg)) return "That username is taken.";
  if (/email.*invalid|invalid.*email/i.test(msg))
    return "Supabase rejected the generated address. Change the login domain below (use one you own) or sign up with a real email.";
  return msg;
}

// ---------- sync ----------

interface RemoteRow {
  kind: SyncKind;
  id: string;
  data: any;
  updated_at: number;
  deleted: boolean;
}

export type SyncState = { phase: "off" | "idle" | "syncing" | "ok" | "error"; at: number | null; message: string };
let state: SyncState = { phase: "off", at: null, message: "" };
const listeners = new Set<(s: SyncState) => void>();

export function subscribeSupabaseSync(fn: (s: SyncState) => void): () => void {
  listeners.add(fn);
  fn(state);
  return () => {
    listeners.delete(fn);
  };
}

function setState(next: SyncState) {
  state = next;
  listeners.forEach((l) => l(state));
}

function cursorKey(uid: string, which: "push" | "pull") {
  return getUserScopedKey(`panga_sb_${uid}_${which}`);
}

function readCursor(uid: string, which: "push" | "pull"): number {
  try {
    return Number(localStorage.getItem(cursorKey(uid, which)) || 0);
  } catch {
    return 0;
  }
}

function writeCursor(uid: string, which: "push" | "pull", v: number) {
  try {
    localStorage.setItem(cursorKey(uid, which), String(v));
  } catch {
    /* ignore */
  }
}

/** Last-write-wins merge decision. Exported for tests. */
export function shouldApplyRemote(localUpdatedAt: number | undefined, remoteUpdatedAt: number): boolean {
  return localUpdatedAt === undefined || localUpdatedAt < remoteUpdatedAt;
}

function tableFor(kind: SyncKind) {
  switch (kind) {
    case "task": return db.tasks;
    case "taskList": return db.taskLists;
    case "thought": return db.trainOfThought;
    case "note": return db.notes;
    case "noteFolder": return db.noteFolders;
    case "link": return db.links;
    case "linkFolder": return db.linkFolders;
    case "reminder": return db.reminders;
    case "taskListFolder": return db.taskListFolders;
    case "reminderFolder": return db.reminderFolders;
  }
}

async function collectLocalChanges(since: number): Promise<{ kind: SyncKind; id: string; data: any; updated_at: number }[]> {
  const out: { kind: SyncKind; id: string; data: any; updated_at: number }[] = [];
  for (const t of await db.tasks.where("updatedAt").above(since).toArray()) out.push({ kind: "task", id: t.id, data: t, updated_at: t.updatedAt });
  for (const t of await db.taskLists.where("updatedAt").above(since).toArray()) out.push({ kind: "taskList", id: t.id, data: t, updated_at: t.updatedAt });
  for (const t of await db.trainOfThought.where("createdAt").above(0).toArray()) {
    if (t.updatedAt > since) out.push({ kind: "thought", id: t.id, data: t, updated_at: t.updatedAt });
  }
  for (const n of await db.notes.where("updatedAt").above(since).toArray()) out.push({ kind: "note", id: n.id, data: n, updated_at: n.updatedAt });
  for (const f of await db.noteFolders.where("updatedAt").above(since).toArray()) out.push({ kind: "noteFolder", id: f.id, data: f, updated_at: f.updatedAt });
  for (const l of await db.links.where("updatedAt").above(since).toArray()) out.push({ kind: "link", id: l.id, data: l, updated_at: l.updatedAt });
  for (const f of await db.linkFolders.where("updatedAt").above(since).toArray()) out.push({ kind: "linkFolder", id: f.id, data: f, updated_at: f.updatedAt });
  for (const r of await db.reminders.where("updatedAt").above(since).toArray()) out.push({ kind: "reminder", id: r.id, data: r, updated_at: r.updatedAt });
  for (const f of await db.taskListFolders.where("updatedAt").above(since).toArray()) out.push({ kind: "taskListFolder", id: f.id, data: f, updated_at: f.updatedAt });
  for (const f of await db.reminderFolders.where("updatedAt").above(since).toArray()) out.push({ kind: "reminderFolder", id: f.id, data: f, updated_at: f.updatedAt });
  return out;
}

let running = false;

export async function syncNow(): Promise<SyncState> {
  if (running) return state;
  const sb = await getSupabase();
  if (!sb) {
    setState({ phase: "off", at: null, message: "Supabase not configured" });
    return state;
  }
  const { data: sess } = await sb.auth.getSession();
  const uid = sess.session?.user.id;
  if (!uid) {
    setState({ phase: "off", at: null, message: "Not signed in" });
    return state;
  }
  running = true;
  setState({ phase: "syncing", at: state.at, message: "Syncing…" });
  try {
    if (!db.isOpen()) await db.open();
    const startedAt = Date.now();

    // 1) Pull remote changes newer than our cursor.
    const pulled = new Set<string>();
    let changedLocal = false;
    // Re-read a 5 minute overlap so a record written by a device with a slightly
    // slow clock is not missed. Re-applying an identical record is a no-op.
    const savedCursor = readCursor(uid, "pull");
    let cursor = Math.max(0, savedCursor - 300_000);
    let maxSeen = savedCursor;
    for (;;) {
      const { data, error } = await sb
        .from("panga_records")
        .select("kind,id,data,updated_at,deleted")
        .gt("updated_at", cursor)
        .order("updated_at", { ascending: true })
        .limit(500);
      if (error) throw new Error(error.message);
      const rows = (data ?? []) as RemoteRow[];
      for (const row of rows) {
        const table: any = tableFor(row.kind);
        const local = await table.get(row.id);
        if (row.deleted) {
          if (local && shouldApplyRemote(local.updatedAt, row.updated_at)) {
            await table.delete(row.id);
            changedLocal = true;
          }
        } else if (row.data && shouldApplyRemote(local?.updatedAt, row.updated_at)) {
          await table.put({ ...row.data, ...(row.kind === "thought" ? {} : { syncStatus: "synced" }) });
          changedLocal = true;
        }
        pulled.add(`${row.kind}:${row.id}`);
        maxSeen = Math.max(maxSeen, row.updated_at);
      }
      if (rows.length < 500) break;
      cursor = maxSeen;
    }
    writeCursor(uid, "pull", maxSeen);

    // 2) Push local changes (and deletions) since our last push.
    const lastPush = readCursor(uid, "push");
    const changes = (await collectLocalChanges(lastPush)).filter((c) => !pulled.has(`${c.kind}:${c.id}`));
    const tombs = listTombstones();
    const rows = [
      ...changes.map((c) => ({ user_id: uid, kind: c.kind, id: c.id, data: c.data, updated_at: c.updated_at, deleted: false })),
      ...tombs.map((t) => ({ user_id: uid, kind: t.kind, id: t.id, data: null, updated_at: t.at, deleted: true })),
    ];
    for (let i = 0; i < rows.length; i += 200) {
      const { error } = await sb.from("panga_records").upsert(rows.slice(i, i + 200), { onConflict: "user_id,kind,id" });
      if (error) throw new Error(error.message);
    }
    writeCursor(uid, "push", startedAt);
    if (tombs.length) clearTombstones(Math.max(...tombs.map((t) => t.at)));

    if (changedLocal) window.dispatchEvent(new CustomEvent("panga-data-updated"));
    setState({ phase: "ok", at: Date.now(), message: `Synced ${rows.length} change${rows.length === 1 ? "" : "s"} up, ${pulled.size} down` });
  } catch (e) {
    setState({ phase: "error", at: state.at, message: e instanceof Error ? e.message : "Sync failed" });
  } finally {
    running = false;
  }
  return state;
}

let timer: number | undefined;
let started = false;

/** Sync on start, on focus, every 2 minutes, and shortly after local edits. Safe to call more than once. */
export function startSupabaseSync(): void {
  if (started) return;
  started = true;
  const kick = () => void syncNow();
  let debounce: number | undefined;
  window.addEventListener("focus", kick);
  window.addEventListener("online", kick);
  window.addEventListener("panga-data-updated", () => {
    window.clearTimeout(debounce);
    debounce = window.setTimeout(kick, 4000);
  });
  timer = window.setInterval(kick, 120_000);
  kick();
  void timer;
}
