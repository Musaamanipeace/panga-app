import fs from "fs";
import path from "path";
import crypto from "crypto";

const DATA_DIR =
  process.env.DATA_DIR ||
  (process.env.NODE_ENV === "production" && fs.existsSync("/data")
    ? "/data"
    : path.resolve(process.cwd(), ".data"));

if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error("Failed to create data directory:", err);
  }
}

const USERS_FILE = path.join(DATA_DIR, "users.json");

interface StoredUser {
  id: string;
  email: string;
  salt: string;
  hash: string;
  createdAt: number;
}

export interface UserCloudData {
  userId: string;
  email: string;
  updatedAt: number;
  tables: {
    projects: Record<string, any>;
    tasks: Record<string, any>;
    resources: Record<string, any>;
    milestones: Record<string, any>;
    issues: Record<string, any>;
    contacts: Record<string, any>;
    reminders: Record<string, any>;
    calendarEvents: Record<string, any>;
    scheduleItems: Record<string, any>;
    docEntries: Record<string, any>;
    insights: Record<string, any>;
    settings: Record<string, any>;
    [key: string]: Record<string, any>;
  };
  deletions: Record<string, number>; // "tableName:id" -> deletedAt
}

function atomicWrite(filePath: string, data: string) {
  const tempPath = `${filePath}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
  fs.writeFileSync(tempPath, data, "utf8");
  fs.renameSync(tempPath, filePath);
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}

export function getUserIdForEmail(email: string): string {
  const clean = email.trim().toLowerCase();
  return "usr_" + crypto.createHash("sha256").update(clean).digest("hex").slice(0, 16);
}

function loadUsers(): Record<string, StoredUser> {
  if (!fs.existsSync(USERS_FILE)) return {};
  try {
    const raw = fs.readFileSync(USERS_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading users file:", err);
    return {};
  }
}

function saveUsers(users: Record<string, StoredUser>) {
  atomicWrite(USERS_FILE, JSON.stringify(users, null, 2));
}

export function registerUser(email: string, password: string): { user?: { id: string; email: string }; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return { error: "Email is required." };
  if (!password || password.length < 6) return { error: "Password must be at least 6 characters." };

  const users = loadUsers();
  if (users[cleanEmail]) {
    return { error: "An account with this email already exists." };
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const hash = hashPassword(password, salt);
  const id = getUserIdForEmail(cleanEmail);

  const newUser: StoredUser = {
    id,
    email: cleanEmail,
    salt,
    hash,
    createdAt: Date.now(),
  };

  users[cleanEmail] = newUser;
  saveUsers(users);

  // Initialize cloud database for user
  getUserCloudData(id, cleanEmail);

  return { user: { id, email: cleanEmail } };
}

export function authenticateUser(email: string, password: string): { user?: { id: string; email: string }; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return { error: "Email is required." };
  if (!password) return { error: "Password is required." };

  const users = loadUsers();
  const user = users[cleanEmail];
  if (!user) {
    return { error: "No account found with this email. Please create an account first." };
  }

  const calculatedHash = hashPassword(password, user.salt);
  if (calculatedHash !== user.hash) {
    return { error: "Invalid password for this account." };
  }

  // Ensure user ID is the canonical deterministic ID
  const canonicalId = getUserIdForEmail(cleanEmail);
  if (user.id !== canonicalId) {
    user.id = canonicalId;
    users[cleanEmail] = user;
    saveUsers(users);
  }

  return { user: { id: user.id, email: user.email } };
}

function getUserFilePath(userId: string): string {
  // Sanitize userId to prevent path traversal
  const safeId = userId.replace(/[^a-zA-Z0-9_-]/g, "");
  return path.join(DATA_DIR, `user_${safeId}.json`);
}

export function getUserCloudData(userId: string, email = ""): UserCloudData {
  const filePath = getUserFilePath(userId);
  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(raw);
      if (!parsed.tables) parsed.tables = {};
      if (!parsed.deletions) parsed.deletions = {};
      return parsed;
    } catch (err) {
      console.error(`Error reading cloud data for user ${userId}:`, err);
    }
  }

  // Initial structure
  const initial: UserCloudData = {
    userId,
    email,
    updatedAt: Date.now(),
    tables: {
      projects: {},
      tasks: {},
      resources: {},
      milestones: {},
      issues: {},
      contacts: {},
      reminders: {},
      calendarEvents: {},
      scheduleItems: {},
      docEntries: {},
      insights: {},
      settings: {},
    },
    deletions: {},
  };
  saveUserCloudData(initial);
  return initial;
}

export function saveUserCloudData(data: UserCloudData) {
  const filePath = getUserFilePath(data.userId);
  atomicWrite(filePath, JSON.stringify(data, null, 2));
}

export function normalizeTableName(table: string): string {
  const map: Record<string, string> = {
    calendar_events: "calendarEvents",
    calendarEvents: "calendarEvents",
    doc_entries: "docEntries",
    docEntries: "docEntries",
    schedule_items: "scheduleItems",
    scheduleItems: "scheduleItems",
  };
  return map[table] || table;
}

export function pushRecord(userId: string, rawTable: string, record: any): boolean {
  if (!userId || !record || !record.id) return false;
  const table = normalizeTableName(rawTable);
  const data = getUserCloudData(userId);

  if (!data.tables[table]) {
    data.tables[table] = {};
  }

  const existing = data.tables[table][record.id];
  const incomingTime = record.updatedAt || Date.now();
  const existingTime = existing?.updatedAt || 0;

  if (incomingTime >= existingTime) {
    data.tables[table][record.id] = {
      ...record,
      updatedAt: incomingTime,
      syncStatus: "synced",
    };
    // Remove from deletions if it was previously deleted
    delete data.deletions[`${table}:${record.id}`];
    data.updatedAt = Date.now();
    saveUserCloudData(data);
  }
  return true;
}

export function deleteRecord(userId: string, rawTable: string, id: string): boolean {
  if (!userId || !id) return false;
  const table = normalizeTableName(rawTable);
  const data = getUserCloudData(userId);

  if (data.tables[table]) {
    delete data.tables[table][id];
  }
  data.deletions[`${table}:${id}`] = Date.now();
  data.updatedAt = Date.now();
  saveUserCloudData(data);
  return true;
}

export function pushSetting(userId: string, key: string, value: any): boolean {
  if (!userId || !key) return false;
  const data = getUserCloudData(userId);
  if (!data.tables.settings) data.tables.settings = {};

  data.tables.settings[key] = {
    key,
    value,
    updatedAt: Date.now(),
  };
  data.updatedAt = Date.now();
  saveUserCloudData(data);
  return true;
}

export function reconcileSync(
  userId: string,
  clientChanges: Record<string, any[]>,
  clientDeletions: Array<{ table: string; id: string }>,
  lastSyncTime = 0
): {
  serverTime: number;
  serverUpdates: Record<string, any[]>;
  serverDeletions: Array<{ table: string; id: string }>;
} {
  const data = getUserCloudData(userId);
  const now = Date.now();

  // 1. Apply client deletions
  if (Array.isArray(clientDeletions)) {
    for (const del of clientDeletions) {
      if (del.table && del.id) {
        const table = normalizeTableName(del.table);
        if (data.tables[table]) {
          delete data.tables[table][del.id];
        }
        data.deletions[`${table}:${del.id}`] = now;
      }
    }
  }

  // 2. Apply client changes
  if (clientChanges && typeof clientChanges === "object") {
    for (const [rawTable, records] of Object.entries(clientChanges)) {
      if (!Array.isArray(records)) continue;
      const table = normalizeTableName(rawTable);
      if (!data.tables[table]) data.tables[table] = {};

      for (const rec of records) {
        if (!rec || !rec.id) continue;
        const delTime = data.deletions[`${table}:${rec.id}`] || 0;
        const clientTime = rec.updatedAt || now;

        // If deleted more recently on server, don't resurrect
        if (delTime >= clientTime) continue;

        const serverRec = data.tables[table][rec.id];
        const serverTime = serverRec?.updatedAt || 0;

        if (clientTime >= serverTime) {
          data.tables[table][rec.id] = {
            ...rec,
            updatedAt: clientTime,
            syncStatus: "synced",
          };
          delete data.deletions[`${table}:${rec.id}`];
        }
      }
    }
  }

  data.updatedAt = now;
  saveUserCloudData(data);

  // 3. Collect updates to send back to client (records updated since client's last sync time)
  const serverUpdates: Record<string, any[]> = {};
  for (const [table, recordsObj] of Object.entries(data.tables)) {
    serverUpdates[table] = [];
    for (const item of Object.values(recordsObj)) {
      if (!lastSyncTime || !item.updatedAt || item.updatedAt > lastSyncTime) {
        serverUpdates[table].push(item);
      }
    }
  }

  // 4. Collect deletions occurred since lastSyncTime
  const serverDeletions: Array<{ table: string; id: string }> = [];
  if (lastSyncTime > 0) {
    for (const [key, deletedAt] of Object.entries(data.deletions)) {
      if (deletedAt > lastSyncTime) {
        const [table, id] = key.split(":");
        if (table && id) {
          serverDeletions.push({ table, id });
        }
      }
    }
  }

  return {
    serverTime: now,
    serverUpdates,
    serverDeletions,
  };
}

// Migrate any legacy user files to deterministic ID structure
function migrateLegacyUserFiles() {
  try {
    const users = loadUsers();
    let updatedUsers = false;

    // Check users in users.json
    for (const [email, user] of Object.entries(users)) {
      const canonicalId = getUserIdForEmail(email);
      if (user.id !== canonicalId) {
        // Move data from old user file if it exists
        const oldFile = path.join(DATA_DIR, `user_${user.id}.json`);
        const canonicalFile = path.join(DATA_DIR, `user_${canonicalId}.json`);

        const canonicalData = getUserCloudData(canonicalId, email);

        if (fs.existsSync(oldFile)) {
          try {
            const raw = fs.readFileSync(oldFile, "utf8");
            const parsed = JSON.parse(raw);
            if (parsed.tables) {
              for (const [tbl, records] of Object.entries(parsed.tables)) {
                if (!canonicalData.tables[tbl]) canonicalData.tables[tbl] = {};
                Object.assign(canonicalData.tables[tbl], records as Record<string, any>);
              }
            }
          } catch {}
        }

        saveUserCloudData(canonicalData);
        user.id = canonicalId;
        updatedUsers = true;
      }
    }

    // Check any orphan user files in DATA_DIR (e.g. user_usr_2gvo7k_mun7k5qr.json)
    if (fs.existsSync(DATA_DIR)) {
      const files = fs.readdirSync(DATA_DIR);
      for (const file of files) {
        if (!file.startsWith("user_") || !file.endsWith(".json")) continue;
        if (file.includes("2gvo7k")) {
          // This was amanimosespeace@gmail.com
          const canonicalId = getUserIdForEmail("amanimosespeace@gmail.com");
          const canonicalData = getUserCloudData(canonicalId, "amanimosespeace@gmail.com");
          try {
            const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf8");
            const parsed = JSON.parse(raw);
            if (parsed.tables) {
              for (const [tbl, records] of Object.entries(parsed.tables)) {
                if (!canonicalData.tables[tbl]) canonicalData.tables[tbl] = {};
                Object.assign(canonicalData.tables[tbl], records as Record<string, any>);
              }
            }
            saveUserCloudData(canonicalData);
            console.log(`Migrated ${file} to canonical user_${canonicalId}.json`);
          } catch {}
        }
      }
    }

    if (updatedUsers) {
      saveUsers(users);
    }
  } catch (err) {
    console.error("Migration error:", err);
  }
}

migrateLegacyUserFiles();
