// src/sync/supabaseSync.ts
// Handles cloud persistence, multi-device sync, and auth with Supabase.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { db } from "../data/db";
import { getSessionUserId, setSession, clearSession } from "../auth/session";

const SUPABASE_URL_KEY = "panga_supabase_url";
const SUPABASE_KEY_KEY = "panga_supabase_anon_key";
const LAST_SYNC_KEY = "panga_last_sync_time";

/** Returns the current user's Supabase UUID to use as user_id in queries. */
function getCurrentUserId(): string {
  return getSessionUserId() || "anonymous";
}

function safeGetStorage(key: string): string | null {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetStorage(key: string, value: string | null) {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return;
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {}
}

export type SyncStatusState = "idle" | "syncing" | "synced" | "error" | "unconfigured";

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

let cachedClient: SupabaseClient | null = null;
let cachedConfigKey = "";
let currentStatus: SyncStatusState = "idle";
let lastSyncTimestamp: number = Number(safeGetStorage(LAST_SYNC_KEY) || 0);
let statusListeners: Array<(status: SyncStatusState, message?: string) => void> = [];

export function getSupabaseConfig(): SupabaseConfig {
  const localUrl = safeGetStorage(SUPABASE_URL_KEY);
  const localKey = safeGetStorage(SUPABASE_KEY_KEY);
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "";
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";

  return {
    url: (localUrl || envUrl || "").trim(),
    anonKey: (localKey || envKey || "").trim(),
  };
}

export function saveSupabaseConfig(config: SupabaseConfig) {
  safeSetStorage(SUPABASE_URL_KEY, config.url ? config.url.trim() : null);
  safeSetStorage(SUPABASE_KEY_KEY, config.anonKey ? config.anonKey.trim() : null);

  cachedClient = null;
  cachedConfigKey = "";
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(
    url &&
    anonKey &&
    !url.includes("placeholder-project") &&
    !anonKey.includes("placeholder")
  );
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { url, anonKey } = getSupabaseConfig();
  const configKey = `${url}:${anonKey}`;

  if (cachedClient && cachedConfigKey === configKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: { persistSession: true },
    });
    cachedConfigKey = configKey;
    return cachedClient;
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
    return null;
  }
}

export function subscribeSyncStatus(fn: (status: SyncStatusState, message?: string) => void) {
  statusListeners.push(fn);
  fn(currentStatus);
  return () => {
    statusListeners = statusListeners.filter((l) => l !== fn);
  };
}

function updateStatus(status: SyncStatusState, message?: string) {
  currentStatus = status;
  for (const listener of statusListeners) {
    try {
      listener(status, message);
    } catch {}
  }
}

export function getLastSyncTime(): number {
  return lastSyncTimestamp;
}

/** Test if the credentials can reach Supabase and query tables */
export async function testSupabaseConnection(): Promise<{ ok: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { ok: false, message: "Supabase URL and Anon Key are not configured." };
  }

  try {
    const { error } = await client.from("projects").select("id").limit(1);
    if (error) {
      if (error.code === "PGRST205" || error.message.includes("does not exist") || error.code === "42P01") {
        return {
          ok: false,
          message: "Connected to Supabase, but tables are missing. Please run 'supabase_schema.sql' in your Supabase SQL Editor.",
        };
      }
      return { ok: false, message: `Supabase error: ${error.message}` };
    }
    return { ok: true, message: "Connected to Supabase successfully! Tables are ready." };
  } catch (err: any) {
    return { ok: false, message: `Connection failed: ${err.message || String(err)}` };
  }
}

export function toSnakeCase(obj: Record<string, any>): Record<string, any> {
  const snakeObj: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    snakeObj[snakeKey] = val;
  }
  return snakeObj;
}

// Data Mappers: Dexie CamelCase <-> Supabase snake_case

function projectToRemote(p: any) {
  return {
    id: p.id,
    user_id: getCurrentUserId(),
    name: p.name,
    description: p.description ?? "",
    status: p.status ?? "active",
    created_at: p.createdAt,
    updated_at: p.updatedAt,
    sync_status: "synced",
  };
}

function projectFromRemote(r: any) {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? "",
    status: r.status ?? "active",
    createdAt: Number(r.created_at || r.createdAt || Date.now()),
    updatedAt: Number(r.updated_at || r.updatedAt || Date.now()),
    syncStatus: "synced" as const,
  };
}

function taskToRemote(t: any) {
  return {
    id: t.id,
    user_id: getCurrentUserId(),
    project_id: t.projectId ?? null,
    title: t.title,
    notes: t.notes ?? "",
    status: t.status ?? "active",
    executor: t.executor ?? "manual",
    due_date: t.dueDate ?? null,
    scheduled_at: t.scheduledAt ?? null,
    estimated_minutes: t.estimatedMinutes ?? null,
    tags: t.tags ?? [],
    created_at: t.createdAt,
    updated_at: t.updatedAt,
    sync_status: "synced",
  };
}

function taskFromRemote(r: any) {
  return {
    id: r.id,
    projectId: r.project_id ?? r.projectId ?? null,
    title: r.title,
    notes: r.notes ?? "",
    status: r.status ?? "active",
    executor: r.executor ?? "manual",
    dueDate: r.due_date ? Number(r.due_date) : null,
    scheduledAt: r.scheduled_at ? Number(r.scheduled_at) : null,
    estimatedMinutes: r.estimated_minutes ? Number(r.estimated_minutes) : null,
    tags: r.tags ?? [],
    createdAt: Number(r.created_at || r.createdAt || Date.now()),
    updatedAt: Number(r.updated_at || r.updatedAt || Date.now()),
    syncStatus: "synced" as const,
  };
}

function resourceToRemote(r: any) {
  return {
    id: r.id,
    user_id: getCurrentUserId(),
    project_id: r.projectId ?? null,
    category: r.category,
    title: r.title,
    tags: r.tags ?? [],
    url: r.url ?? null,
    provider: r.provider ?? null,
    body: r.body ?? null,
    images: r.images ?? [],
    files: r.files ?? [],
    created_at: r.createdAt,
    updated_at: r.updatedAt,
    sync_status: "synced",
  };
}

function resourceFromRemote(r: any) {
  return {
    id: r.id,
    projectId: r.project_id ?? r.projectId ?? null,
    category: r.category,
    title: r.title,
    tags: r.tags ?? [],
    url: r.url ?? null,
    provider: r.provider ?? null,
    body: r.body ?? null,
    images: r.images ?? [],
    files: r.files ?? [],
    createdAt: Number(r.created_at || r.createdAt || Date.now()),
    updatedAt: Number(r.updated_at || r.updatedAt || Date.now()),
    syncStatus: "synced" as const,
  };
}

function milestoneToRemote(m: any) {
  return {
    id: m.id,
    user_id: getCurrentUserId(),
    project_id: m.projectId ?? null,
    title: m.title,
    description: m.description ?? "",
    status: m.status ?? "pending",
    target_date: m.targetDate ?? null,
    blocking_task_ids: m.blockingTaskIds ?? [],
    created_at: m.createdAt,
    updated_at: m.updatedAt,
    sync_status: "synced",
  };
}

function milestoneFromRemote(r: any) {
  return {
    id: r.id,
    projectId: r.project_id ?? r.projectId ?? null,
    title: r.title,
    description: r.description ?? "",
    status: r.status ?? "pending",
    targetDate: r.target_date ? Number(r.target_date) : null,
    blockingTaskIds: r.blocking_task_ids ?? [],
    createdAt: Number(r.created_at || r.createdAt || Date.now()),
    updatedAt: Number(r.updated_at || r.updatedAt || Date.now()),
    syncStatus: "synced" as const,
  };
}

function issueToRemote(i: any) {
  return {
    id: i.id,
    user_id: getCurrentUserId(),
    project_id: i.projectId ?? null,
    title: i.title,
    description: i.description ?? "",
    status: i.status ?? "open",
    severity: i.severity ?? "medium",
    labels: i.labels ?? [],
    milestone_id: i.milestoneId ?? null,
    comments: i.comments ?? [],
    created_at: i.createdAt,
    updated_at: i.updatedAt,
    sync_status: "synced",
  };
}

function issueFromRemote(r: any) {
  return {
    id: r.id,
    projectId: r.project_id ?? r.projectId ?? null,
    title: r.title,
    description: r.description ?? "",
    status: r.status ?? "open",
    severity: r.severity ?? "medium",
    labels: r.labels ?? [],
    milestoneId: r.milestone_id ?? r.milestoneId ?? null,
    comments: r.comments ?? [],
    createdAt: Number(r.created_at || r.createdAt || Date.now()),
    updatedAt: Number(r.updated_at || r.updatedAt || Date.now()),
    syncStatus: "synced" as const,
  };
}

function contactToRemote(c: any) {
  return {
    id: c.id,
    user_id: getCurrentUserId(),
    name: c.name,
    type: c.type ?? "email",
    value: c.value ?? "",
    tags: c.tags ?? [],
    linked_project_ids: c.linkedProjectIds ?? [],
    notes: c.notes ?? "",
    created_at: c.createdAt,
    updated_at: c.updatedAt,
    sync_status: "synced",
  };
}

function contactFromRemote(r: any) {
  return {
    id: r.id,
    name: r.name,
    type: r.type ?? "email",
    value: r.value ?? "",
    tags: r.tags ?? [],
    linkedProjectIds: r.linked_project_ids ?? [],
    notes: r.notes ?? "",
    createdAt: Number(r.created_at || r.createdAt || Date.now()),
    updatedAt: Number(r.updated_at || r.updatedAt || Date.now()),
    syncStatus: "synced" as const,
  };
}

function reminderToRemote(rem: any) {
  return {
    id: rem.id,
    user_id: getCurrentUserId(),
    project_id: rem.projectId ?? null,
    message: rem.message,
    trigger_at: rem.triggerAt,
    status: rem.status ?? "pending",
    created_at: rem.createdAt,
    updated_at: rem.updatedAt,
    sync_status: "synced",
  };
}

function reminderFromRemote(r: any) {
  return {
    id: r.id,
    projectId: r.project_id ?? r.projectId ?? null,
    message: r.message,
    triggerAt: Number(r.trigger_at || r.triggerAt),
    status: r.status ?? "pending",
    linkedEntityType: r.linked_entity_type ?? r.linkedEntityType ?? null,
    linkedEntityId: r.linked_entity_id ?? r.linkedEntityId ?? null,
    createdAt: Number(r.created_at || r.createdAt || Date.now()),
    updatedAt: Number(r.updated_at || r.updatedAt || Date.now()),
    syncStatus: "synced" as const,
  };
}

function calendarEventToRemote(e: any) {
  return {
    id: e.id,
    user_id: getCurrentUserId(),
    project_id: e.projectId ?? null,
    title: e.title,
    description: e.description ?? "",
    source: e.source ?? "local",
    start_at: e.startAt,
    end_at: e.endAt,
    meet_link: e.hangoutLink ?? e.meetLink ?? null,
    created_at: e.createdAt,
    updated_at: e.updatedAt,
    sync_status: "synced",
  };
}

function calendarEventFromRemote(r: any) {
  return {
    id: r.id,
    projectId: r.project_id ?? r.projectId ?? null,
    title: r.title,
    description: r.description ?? "",
    source: r.source ?? "local",
    startAt: Number(r.start_at || r.startAt),
    endAt: Number(r.end_at || r.endAt),
    hangoutLink: r.meet_link ?? r.hangout_link ?? r.hangoutLink ?? r.meetLink ?? null,
    syncedAt: r.synced_at ?? r.syncedAt ?? null,
    createdAt: Number(r.created_at || r.createdAt || Date.now()),
    updatedAt: Number(r.updated_at || r.updatedAt || Date.now()),
    syncStatus: "synced" as const,
  };
}

function insightToRemote(ins: any) {
  return {
    id: ins.id,
    user_id: getCurrentUserId(),
    project_id: ins.projectId ?? null,
    title: ins.title,
    body: ins.body ?? null,
    type: ins.type ?? "note",
    link: ins.link ?? null,
    tags: ins.tags ?? [],
    created_at: ins.createdAt,
    updated_at: ins.updatedAt,
    sync_status: "synced",
  };
}

function insightFromRemote(r: any) {
  return {
    id: r.id,
    projectId: r.project_id ?? r.projectId ?? null,
    title: r.title,
    body: r.body ?? null,
    type: r.type ?? "note",
    link: r.link ?? null,
    tags: r.tags ?? [],
    createdAt: Number(r.created_at || r.createdAt || Date.now()),
    updatedAt: Number(r.updated_at || r.updatedAt || Date.now()),
    syncStatus: "synced" as const,
  };
}

function docEntryToRemote(d: any) {
  return {
    id: d.id,
    user_id: getCurrentUserId(),
    project_id: d.projectId ?? null,
    title: d.title,
    content: d.content ?? "",
    type: d.type ?? "outline",
    order: d.order ?? 0,
    created_at: d.createdAt,
    updated_at: d.updatedAt,
    sync_status: "synced",
  };
}

function docEntryFromRemote(r: any) {
  return {
    id: r.id,
    projectId: r.project_id ?? r.projectId ?? null,
    title: r.title,
    content: r.content ?? "",
    type: r.type ?? "outline",
    order: Number(r.order ?? 0),
    createdAt: Number(r.created_at || r.createdAt || Date.now()),
    updatedAt: Number(r.updated_at || r.updatedAt || Date.now()),
    syncStatus: "synced" as const,
  };
}

/** Immediate push of a single record when changed in UI */
export async function syncPushRecord(
  tableName:
    | "projects"
    | "tasks"
    | "resources"
    | "milestones"
    | "issues"
    | "contacts"
    | "reminders"
    | "calendar_events"
    | "insights"
    | "doc_entries",
  record: any
) {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    let payload: any = null;
    switch (tableName) {
      case "projects": payload = projectToRemote(record); break;
      case "tasks": payload = taskToRemote(record); break;
      case "resources": payload = resourceToRemote(record); break;
      case "milestones": payload = milestoneToRemote(record); break;
      case "issues": payload = issueToRemote(record); break;
      case "contacts": payload = contactToRemote(record); break;
      case "reminders": payload = reminderToRemote(record); break;
      case "calendar_events": payload = calendarEventToRemote(record); break;
      case "insights": payload = insightToRemote(record); break;
      case "doc_entries": payload = docEntryToRemote(record); break;
    }

    if (payload) {
      let result = await client.from(tableName).upsert(payload, { onConflict: "id,user_id" });
      // Fallback for databases without user_id column
      if (result.error?.message?.includes("user_id")) {
        const { user_id, ...fallback } = payload;
        result = await client.from(tableName).upsert(fallback, { onConflict: "id" });
      }
      const { error } = result;
      if (!error) {
        const dexieTable =
          tableName === "calendar_events"
            ? "calendarEvents"
            : tableName === "doc_entries"
              ? "docEntries"
              : tableName;
        await (db as any)[dexieTable]?.update(record.id, { syncStatus: "synced" });
      } else {
        console.warn(`Supabase upsert warning for ${tableName}:`, error.message);
        updateStatus("error", `${tableName}: ${error.message}`);
      }
    }
  } catch (err) {
    console.warn(`Sync push error (${tableName}):`, err);
    updateStatus("error", `Push failed (${tableName})`);
  }
}

/** Immediate push of a deletion to Supabase */
export async function syncDeleteRecord(tableName: string, id: string) {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from(tableName).delete().eq("id", id);
  } catch (err) {
    console.warn(`Sync delete error (${tableName}):`, err);
  }
}

/** Immediate push of a setting (e.g. Gemini API Key) to Supabase */
export async function syncPushSetting(key: string, value: any) {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    let result = await client.from("settings").upsert(
      {
        user_id: getCurrentUserId(),
        key,
        value,
        updated_at: Date.now(),
      },
      { onConflict: "user_id,key" }
    );
    // Fallback for databases without user_id column
    if (result.error?.message?.includes("user_id")) {
      result = await client.from("settings").upsert(
        { key, value, updated_at: Date.now() },
        { onConflict: "key" }
      );
    }
    if (result.error) {
      console.warn("Sync push setting error:", result.error.message);
    }
  } catch (err) {
    console.warn("Sync push setting error:", err);
  }
}

/** Full 2-way sync: pulls cloud data into Dexie, pushes pending local data */
export async function syncAll(): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured()) {
    updateStatus("unconfigured", "Supabase is not configured.");
    return { ok: false, message: "Supabase is not configured." };
  }

  const client = getSupabaseClient();
  if (!client) {
    updateStatus("error", "Supabase client not initialized.");
    return { ok: false, message: "Supabase client not initialized." };
  }

  if (!db.isOpen()) {
    await db.open();
  }

  updateStatus("syncing", "Syncing with Supabase database...");

  try {
    // 1. PULL REMOTE DATA FROM SUPABASE INTO DEXIE (filtered by user_id)
    //    Uses a fallback strategy: try with user_id filter first, then without
    //    for databases that haven't been migrated yet.
    const userId = getCurrentUserId();

    /** Fetch a table, preferring user_id filter; falls back if column missing. */
    async function fetchTable(table: string) {
      try {
        const q = client!.from(table).select("*").eq("user_id", userId);
        const res = await q;
        if (res.error?.message?.includes("user_id")) {
          // Column doesn't exist yet — fall back to unfiltered query
          return await client!.from(table).select("*");
        }
        return res;
      } catch (e) {
        // Return a result-like object with error for consistent handling
        return { data: [] as any[], error: e as any };
      }
    }

    /** Safely merge a table's remote data into local Dexie, skipping on error. */
    async function mergeTable(
      res: { data?: any[] | null; error?: any } | undefined,
      dexieTable: "projects" | "tasks" | "resources" | "milestones" | "issues" | "contacts" | "reminders" | "calendarEvents" | "insights" | "docEntries",
      mapper: (r: any) => any
    ) {
      if (!res) return;
      if (res.error) {
        console.warn(`Supabase fetch warning for ${dexieTable}:`, res.error?.message || String(res.error));
        return;
      }
      if (res.data && res.data.length > 0) {
        await (db as any)[dexieTable].bulkPut(res.data.map(mapper));
      }
    }

    const [
      projRes,
      tasksRes,
      resourcesRes,
      milestonesRes,
      issuesRes,
      contactsRes,
      remindersRes,
      calendarRes,
      insightsRes,
      docsRes,
      settingsRes,
    ] = await Promise.all([
      fetchTable("projects"),
      fetchTable("tasks"),
      fetchTable("resources"),
      fetchTable("milestones"),
      fetchTable("issues"),
      fetchTable("contacts"),
      fetchTable("reminders"),
      fetchTable("calendar_events"),
      fetchTable("insights"),
      fetchTable("doc_entries"),
      fetchTable("settings"),
    ]);

    // Merge into local Dexie — individual table failures are logged, not fatal
    await mergeTable(projRes, "projects", projectFromRemote);
    await mergeTable(tasksRes, "tasks", taskFromRemote);
    await mergeTable(resourcesRes, "resources", resourceFromRemote);
    await mergeTable(milestonesRes, "milestones", milestoneFromRemote);
    await mergeTable(issuesRes, "issues", issueFromRemote);
    await mergeTable(contactsRes, "contacts", contactFromRemote);
    await mergeTable(remindersRes, "reminders", reminderFromRemote);
    await mergeTable(calendarRes, "calendarEvents", calendarEventFromRemote);
    await mergeTable(insightsRes, "insights", insightFromRemote);
    await mergeTable(docsRes, "docEntries", docEntryFromRemote);

    // Settings (including Gemini API Key and Global Subcategories)
    if (settingsRes.data && settingsRes.data.length > 0) {
      for (const row of settingsRes.data) {
        if (row.key && row.value !== undefined) {
          await db.settings.put({ key: row.key, value: row.value });
          if (row.key === "panga-subcategories-global" && typeof row.value === "object") {
            try {
              localStorage.setItem("panga-subcategories-global", JSON.stringify(row.value));
            } catch {}
          }
          if (row.key === "panga-categories-global" && Array.isArray(row.value)) {
            try {
              localStorage.setItem("panga-categories-global", JSON.stringify(row.value));
            } catch {}
          }
        }
      }
    }

    // 2. PUSH ANY LOCAL PENDING RECORDS TO SUPABASE
    async function pushPending(
      dexieTable: string,
      remoteTable: string,
      mapper: (r: any) => any
    ) {
      try {
        const pending = await (db as any)[dexieTable].where("syncStatus").equals("pending").toArray();
        if (pending.length === 0) return;
        const mapped = pending.map(mapper);
        let result = await client!.from(remoteTable).upsert(mapped, { onConflict: "id,user_id" });
        // Fallback for databases without user_id column
        if (result.error?.message?.includes("user_id")) {
          const fallback = mapped.map((({ user_id: _uid, ...rest }: Record<string, any>) => rest));
          result = await client!.from(remoteTable).upsert(fallback, { onConflict: "id" });
        }
        const { error } = result;
        if (error) {
          console.warn(`Pending push warning (${remoteTable}):`, error.message);
          return;
        }
        await (db as any)[dexieTable].bulkPut(
          pending.map((r: any) => ({ ...r, syncStatus: "synced" as const }))
        );
      } catch (err) {
        console.warn(`Sync push error (${remoteTable}):`, err);
      }
    }

    await pushPending("projects", "projects", projectToRemote);
    await pushPending("tasks", "tasks", taskToRemote);
    await pushPending("resources", "resources", resourceToRemote);
    await pushPending("milestones", "milestones", milestoneToRemote);
    await pushPending("issues", "issues", issueToRemote);
    await pushPending("contacts", "contacts", contactToRemote);
    await pushPending("reminders", "reminders", reminderToRemote);
    await pushPending("insights", "insights", insightToRemote);
    await pushPending("calendarEvents", "calendar_events", calendarEventToRemote);
    await pushPending("docEntries", "doc_entries", docEntryToRemote);

    // Push local Gemini API key to Supabase settings if present locally
    const localGeminiKey = (await db.settings.get("geminiApiKey"))?.value;
    if (localGeminiKey) {
      try {
        let result = await client!.from("settings").upsert(
          { user_id: getCurrentUserId(), key: "geminiApiKey", value: localGeminiKey, updated_at: Date.now() },
          { onConflict: "user_id,key" }
        );
        // Fallback for databases without user_id column
        if (result.error?.message?.includes("user_id")) {
          result = await client!.from("settings").upsert(
            { key: "geminiApiKey", value: localGeminiKey, updated_at: Date.now() },
            { onConflict: "key" }
          );
        }
      } catch (err) {
        console.warn("Failed to push Gemini key:", err);
      }
    }

    lastSyncTimestamp = Date.now();
    safeSetStorage(LAST_SYNC_KEY, String(lastSyncTimestamp));
    updateStatus("synced", "All changes synced with Supabase.");
    return { ok: true, message: "Sync complete! All changes saved to Supabase." };
  } catch (err: any) {
    console.error("Supabase sync error:", err);
    updateStatus("error", err?.message || "Sync failed");
    return { ok: false, message: `Sync error: ${err?.message || String(err)}` };
  }
}

// ─── Auth helpers ─────────────────────────────────────────────

export interface AuthResult {
  error?: string;
  successMessage?: string;
}

/** Sign up with email + password. Supabase sends a confirmation email. */
export async function signUp(email: string, password: string): Promise<AuthResult> {
  const client = getSupabaseClient();
  if (!client) return { error: "Supabase is not configured." };

  const { error } = await client.auth.signUp({ email, password });
  if (error) return { error: error.message };

  return {
    successMessage: `Confirmation email sent to ${email}. Please check your inbox and click the link to verify your account before logging in.`,
  };
}

/** Resend the confirmation email for an unconfirmed account. */
export async function resendConfirmationEmail(email: string): Promise<AuthResult> {
  const client = getSupabaseClient();
  if (!client) return { error: "Supabase is not configured." };

  const { error } = await client.auth.resend({ type: "signup", email });
  if (error) return { error: error.message };
  return { successMessage: `Confirmation email resent to ${email}.` };
}

/** Sign in with email + password. */
export async function signIn(email: string, password: string): Promise<AuthResult> {
  const client = getSupabaseClient();
  if (!client) return { error: "Supabase is not configured." };

  const { data: { user }, error } = await client.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  if (!user) return { error: "Authentication failed. Please try again." };
  // Store session so db.ts and other modules can use the user ID immediately
  setSession(user.email || email, user.id);
  return {};
}

/** Sign out and clear local session. */
export async function signOut(): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    await client.auth.signOut();
  }
  clearSession();
  // Force page reload so the db singleton is recreated for the anonymous user
  window.location.assign("/");
}

/** Restore session from Supabase on app load (called on mount). */
export async function restoreSession(): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const { data: { session } } = await client.auth.getSession();
  if (session?.user) {
    setSession(session.user.email || "", session.user.id);
  } else {
    clearSession();
  }
}
