/**
 * state.js — In-memory state store + entity CRUD for the Puter edition of Panga.
 *
 * This is the SINGLE source of truth while the app is running. UI components
 * subscribe via `subscribe()` and re-render on change. Writes are persisted
 * through the storage layer (localStorage + Puter KV) so data survives across
 * sessions and devices, and activity is logged on every mutation.
 */

import {
  readCache,
  writeCache,
  isCloudAvailable,
  writeCloud,
  reconcileWithCloud,
  clearCloud,
  emitStateChanged,
} from "./storage.js";
import { newId, now } from "./lib.js";

/** @typedef {"project" | "activity" | "idea"} WorkspaceKind */
/** @typedef {"active" | "inactive" | "completed"} TaskStatus */
/** @typedef {"active" | "archived"} ProjectStatus */
/** @typedef {"notes"|"scripts"|"links"|"images"|"pdfs"|"lists"|"checklists"|"preset-list"|string} ResourceCategory */
/** @typedef {"email"|"phone"|"link"} ContactType */

/**
 * @typedef {object} Project
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {ProjectStatus} status
 * @property {WorkspaceKind} kind
 * @property {number} createdAt
 * @property {number} updatedAt
 */

/**
 * @typedef {object} Task
 * @property {string} id
 * @property {string|null} projectId
 * @property {string} title
 * @property {string} notes
 * @property {TaskStatus} status
 * @property {"ai"|"manual"} executor
 * @property {number|null} dueDate
 * @property {number|null} scheduledAt
 * @property {number|null} estimatedMinutes
 * @property {string[]} tags
 * @property {number} createdAt
 * @property {number} updatedAt
 */

/**
 * @typedef {object} Resource
 * @property {string} id
 * @property {string|null} projectId
 * @property {ResourceCategory} category
 * @property {string} title
 * @property {string[]} tags
 * @property {string|null} url
 * @property {string|null} provider
 * @property {string|null} body
 * @property {any[]} listItems
 * @property {any[]} images
 * @property {any[]} files
 * @property {number} createdAt
 * @property {number} updatedAt
 */

/**
 * @typedef {object} Contact
 * @property {string} id
 * @property {string} name
 * @property {ContactType} type
 * @property {string} value
 * @property {string[]} tags
 * @property {string[]} linkedProjectIds
 * @property {number} createdAt
 * @property {number} updatedAt
 */

/**
 * @typedef {object} ScheduleItem
 * @property {string} id
 * @property {string|null} projectId
 * @property {string} title
 * @property {string|null} description
 * @property {number} scheduledAt
 * @property {number|null} durationMinutes
 * @property {string|null} sourceTaskId
 * @property {number} createdAt
 * @property {number} updatedAt
 */

/**
 * @typedef {object} ActivityLog
 * @property {string} id
 * @property {string} entityType
 * @property {string|null} entityId
 * @property {string|null} projectId
 * @property {string} action
 * @property {string} description
 * @property {number} timestamp
 */

/**
 * @typedef {object} PangaState
 * @property {object|null} user
 * @property {Project[]} projects
 * @property {Task[]} tasks
 * @property {Resource[]} resources
 * @property {Contact[]} contacts
 * @property {ScheduleItem[]} scheduleItems
 * @property {ActivityLog[]} activityLog
 * @property {Record<string,any>} settings
 * @property {{lastWriteAt:number, version:number, lastSyncedAt:number|undefined}} meta
 */

/** @type {PangaState} */
let state = null;
/** @type {Array<() => void>} */
const listeners = [];
/** Cloud sync debouncer timer id. */
let cloudWriteTimer = null;

const CLOUD_WRITE_DEBOUNCE_MS = 750;

/**
 * Default empty workspace document.
 * @returns {PangaState}
 */
function makeBlankState() {
  return {
    user: null,
    projects: [],
    tasks: [],
    resources: [],
    contacts: [],
    scheduleItems: [],
    activityLog: [],
    settings: {
      lastTab: "Overview",
      expanded: {
        Overview: true,
        Projects: true,
        Activities: false,
        Schedule: false,
        Resources: false,
        Contacts: false,
        Reminders: false,
      },
    },
    meta: { lastWriteAt: 0, version: 1 },
  };
}

/**
 * Reconcile the in-memory state with the Puter cloud (non-blocking).
 *
 * Merge policy (by `meta.lastWriteAt`):
 *  - Cloud newer or local empty → adopt cloud, refresh cache.
 *  - Local newer (unsynced offline edits) → keep local, push up.
 *  - Cloud empty → seed cloud from local.
 *
 * @param {object|null} [user] optionally attach a signed-in user
 */
export async function hydrateCloud(user) {
  if (!isCloudAvailable()) return;
  try {
    const { merged, seedCloud, pushLocal, fromCloud } = await reconcileWithCloud(state);
    if (merged !== state) {
      state = clone(merged);
      if (user && !state.user) state.user = user;
      touchMeta();
    }
    writeCache(state);
    if (fromCloud || merged !== state) {
      // We pulled fresh data from the cloud — reflect it on the UI.
      state.meta.lastSyncedAt = now();
      writeCache(state);
      notify();
      return;
    }
    if (seedCloud) {
      await writeCloud(state);
      state.meta.lastSyncedAt = now();
      writeCache(state);
    } else if (pushLocal) {
      await writeCloud(state);
      state.meta.lastSyncedAt = now();
      writeCache(state);
    }
    notify();
  } catch (e) {
    console.warn("[panga/state] cloud reconcile failed, staying local:", e);
  }
}

/**
 * Initialise the in-memory state.
 * Boots instantly from the localStorage cache, then (if available) reconciles
 * with the Puter cloud without blocking the first render. Safe to call again
 * after sign-in to re-hydrate under the new identity.
 * @param {object|null} [user] optionally attach a signed-in user
 * @returns {Promise<void>}
 */
export async function init_state(user) {
  if (state) {
    // Already initialised — refresh the user and re-hydrate the cloud.
    if (user) state.user = user;
    await hydrateCloud(user);
    return;
  }

  // 1. Instant local boot (no await, no cloud needed).
  const cached = readCache();
  state = cached && isValidState(cached) ? clone(cached) : makeBlankState();
  if (user) state.user = user;
  touchMeta();

  // 2. Fast synchronous notify so UI can render immediately.
  notify();

  // 3. Background reconcile with the cloud (non-blocking).
  await hydrateCloud(user);
}

// Lightweight validation for data we read from storage/cloud.
function isValidState(obj) {
  return (
    obj &&
    typeof obj === "object" &&
    Array.isArray(obj.projects) &&
    Array.isArray(obj.tasks)
  );
}

function clone(x) {
  return JSON.parse(JSON.stringify(x));
}

function touchMeta() {
  if (!state.meta) state.meta = { version: 1, lastWriteAt: 0 };
  state.meta.lastWriteAt = now();
}

function logActivity(entityType, entityId, projectId, action, description) {
  const entry = {
    id: newId(),
    entityType,
    entityId: entityId ?? null,
    projectId: projectId ?? null,
    action,
    description,
    timestamp: now(),
  };
  state.activityLog.unshift(entry);
  if (state.activityLog.length > 200) state.activityLog.pop();
}

/**
 * Persist (cache immediately + cloud debounced) and notify subscribers.
 */
function persist() {
  touchMeta();
  writeCache(state);
  if (isCloudAvailable()) {
    clearTimeout(cloudWriteTimer);
    cloudWriteTimer = setTimeout(() => {
      writeCloud(state).catch((e) =>
        console.warn("[panga/state] cloud write failed:", e)
      );
    }, CLOUD_WRITE_DEBOUNCE_MS);
  }
  notify();
}

function notify() {
  for (const l of listeners) {
    try {
      l();
    } catch (e) {
      console.warn("[panga/state] listener error:", e);
    }
  }
  emitStateChanged();
}

export function getState() {
  return state;
}

export function getSnapshot() {
  return clone(state);
}

export function subscribe(cb) {
  listeners.push(cb);
  return () => {
    const i = listeners.indexOf(cb);
    if (i >= 0) listeners.splice(i, 1);
  };
}

/** Attach / remove a user on the current in-memory state (does not persist). */
export function setUser(user) {
  if (!state) return;
  state.user = user ?? null;
  notify();
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export function listProjects(status = "active") {
  if (!state) return [];
  return [...state.projects]
    .filter((p) => (status === "all" ? true : p.status === status))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getProject(id) {
  return state?.projects.find((p) => p.id === id) ?? null;
}

export function createProject(input) {
  const t = now();
  const project = {
    id: newId(),
    name: input.name || "Untitled project",
    description: input.description || "",
    status: "active",
    kind: input.kind || "project",
    createdAt: t,
    updatedAt: t,
  };
  state.projects.unshift(project);
  logActivity("project", project.id, project.id, "created", `Created ${project.kind} "${project.name}"`);
  persist();
  return project;
}

export function updateProject(id, changes) {
  const project = state.projects.find((p) => p.id === id);
  if (!project) return false;
  Object.assign(project, changes, { updatedAt: now() });
  logActivity("project", id, id, "updated", `Updated project "${project.name}"`);
  persist();
  return true;
}

export function deleteProject(id) {
  const project = state.projects.find((p) => p.id === id);
  const taskIds = state.tasks.filter((t) => t.projectId === id).map((t) => t.id);
  deleteProjectCascade(id, taskIds);
  if (project) {
    logActivity("project", id, id, "deleted", `Deleted project "${project.name}"`);
  }
  persist();
}

function deleteProjectCascade(id, taskIds) {
  state.projects = state.projects.filter((p) => p.id !== id);
  state.tasks = state.tasks.filter((t) => t.projectId !== id);
  state.resources = state.resources.filter((r) => r.projectId !== id);
  state.scheduleItems = state.scheduleItems.filter((s) => s.projectId !== id);
  state.contacts = state.contacts.map((c) => ({
    ...c,
    linkedProjectIds: c.linkedProjectIds.filter((pid) => pid !== id),
  }));
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export function listTasksForProject(projectId) {
  return state?.tasks
    .filter((t) => t.projectId === projectId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function listAllTasks() {
  return [...(state?.tasks ?? [])].sort((a, b) => b.createdAt - a.createdAt);
}

export function listScheduledTasks() {
  return [...(state?.tasks ?? [])]
    .filter((t) => t.scheduledAt && t.status !== "completed")
    .sort((a, b) => a.scheduledAt - b.scheduledAt);
}

export function getTask(id) {
  return state?.tasks.find((t) => t.id === id) ?? null;
}

export function createTask(input) {
  const t = now();
  const task = {
    id: newId(),
    projectId: input.projectId ?? null,
    title: input.title || "",
    notes: input.notes || "",
    status: "active",
    executor: input.executor ?? "manual",
    dueDate: input.dueDate ?? null,
    scheduledAt: input.scheduledAt ?? null,
    estimatedMinutes: input.estimatedMinutes ?? null,
    tags: input.tags ?? [],
    createdAt: t,
    updatedAt: t,
  };
  state.tasks.unshift(task);
  const projName = task.projectId ? (getProject(task.projectId)?.name ?? "") : "General";
  logActivity("task", task.id, task.projectId, "created", `Created task "${task.title}" in ${projName}`);
  persist();
  return task;
}

export function updateTask(id, changes) {
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return false;
  Object.assign(task, changes, { updatedAt: now() });
  logActivity("task", id, task.projectId, "updated", `Updated task "${task.title}"`);
  persist();
  return true;
}

export function setTaskStatus(id, status) {
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return false;
  const prev = task.status;
  task.status = status;
  task.updatedAt = now();
  logActivity("task", id, task.projectId, "status_changed", `Task "${task.title}" ${prev} → ${status}`);
  persist();
  return true;
}

export function cycleTaskStatus(id) {
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return false;
  const next = { active: "completed", completed: "inactive", inactive: "active" };
  return setTaskStatus(id, next[task.status] ?? "active");
}

export function deleteTask(id) {
  const task = state.tasks.find((t) => t.id === id);
  state.tasks = state.tasks.filter((t) => t.id !== id);
  if (task) {
    logActivity("task", id, task.projectId, "deleted", `Deleted task "${task.title}"`);
  }
  persist();
  return !!task;
}

export function isOverdue(task) {
  return task.status === "active" && task.dueDate !== null && task.dueDate < Date.now();
}

// ---------------------------------------------------------------------------
// Resources
// ---------------------------------------------------------------------------

export function listAllResources() {
  return [...(state?.resources ?? [])].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function listResourcesByCategory(projectId, category) {
  return state?.resources
    .filter((r) => r.category === category && (projectId ? r.projectId === projectId : true))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getResource(id) {
  return state?.resources.find((r) => r.id === id) ?? null;
}

export function createResource(input) {
  const t = now();
  const resource = {
    id: newId(),
    projectId: input.projectId ?? null,
    category: input.category || "notes",
    title: input.title || "Untitled",
    tags: input.tags ?? [],
    url: input.url ?? null,
    provider: input.provider ?? null,
    body: input.body ?? null,
    listItems: input.listItems ?? [],
    images: input.images ?? [],
    files: input.files ?? [],
    createdAt: t,
    updatedAt: t,
  };
  state.resources.unshift(resource);
  logActivity("resource", resource.id, resource.projectId, "created", `Added resource "${resource.title}"`);
  persist();
  return resource;
}

export function updateResource(id, changes) {
  const resource = state.resources.find((r) => r.id === id);
  if (!resource) return false;
  Object.assign(resource, changes, { updatedAt: now() });
  logActivity("resource", id, resource.projectId, "updated", `Updated resource "${resource.title}"`);
  persist();
  return true;
}

export function deleteResource(id) {
  const resource = state.resources.find((r) => r.id === id);
  state.resources = state.resources.filter((r) => r.id !== id);
  if (resource) {
    logActivity("resource", id, resource.projectId, "deleted", `Deleted resource "${resource.title}"`);
  }
  persist();
  return !!resource;
}

export function toggleListItem(resourceId, itemId) {
  const resource = state.resources.find((r) => r.id === resourceId);
  if (!resource || !resource.listItems) return false;
  const item = resource.listItems.find((it) => it.id === itemId);
  if (!item) return false;
  item.checked = !item.checked;
  resource.updatedAt = now();
  persist();
  return true;
}

// ---------------------------------------------------------------------------
// Contacts
// ---------------------------------------------------------------------------

export function listAllContacts() {
  return [...(state?.contacts ?? [])].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getContact(id) {
  return state?.contacts.find((c) => c.id === id) ?? null;
}

export function createContact(input) {
  const t = now();
  const contact = {
    id: newId(),
    name: input.name || "Untitled",
    type: input.type || "email",
    value: input.value || "",
    tags: input.tags ?? [],
    linkedProjectIds: input.linkedProjectIds ?? [],
    createdAt: t,
    updatedAt: t,
  };
  state.contacts.unshift(contact);
  logActivity("contact", contact.id, contact.linkedProjectIds[0] ?? null, "created", `Added contact "${contact.name}"`);
  persist();
  return contact;
}

export function updateContact(id, changes) {
  const contact = state.contacts.find((c) => c.id === id);
  if (!contact) return false;
  Object.assign(contact, changes, { updatedAt: now() });
  logActivity("contact", id, contact.linkedProjectIds[0] ?? null, "updated", `Updated contact "${contact.name}"`);
  persist();
  return true;
}

export function deleteContact(id) {
  const contact = state.contacts.find((c) => c.id === id);
  state.contacts = state.contacts.filter((c) => c.id !== id);
  if (contact) {
    logActivity("contact", id, contact.linkedProjectIds[0] ?? null, "deleted", `Deleted contact "${contact.name}"`);
  }
  persist();
  return !!contact;
}

// ---------------------------------------------------------------------------
// Schedule
// ---------------------------------------------------------------------------

export function listScheduleItems(projectId) {
  const items = state?.scheduleItems ?? [];
  const filtered = projectId ? items.filter((s) => s.projectId === projectId) : items;
  return [...filtered].sort((a, b) => a.scheduledAt - b.scheduledAt);
}

export function createScheduleItem(input) {
  const t = now();
  const item = {
    id: newId(),
    projectId: input.projectId ?? null,
    title: input.title || "",
    description: input.description ?? null,
    scheduledAt: input.scheduledAt,
    durationMinutes: input.durationMinutes ?? null,
    sourceTaskId: input.sourceTaskId ?? null,
    createdAt: t,
    updatedAt: t,
  };
  state.scheduleItems.push(item);
  logActivity("calendarEvent", item.id, item.projectId, "created", `Scheduled "${item.title}"`);
  persist();
  return item;
}

export function updateScheduleItem(id, changes) {
  const item = state.scheduleItems.find((s) => s.id === id);
  if (!item) return false;
  Object.assign(item, changes, { updatedAt: now() });
  persist();
  return true;
}

export function deleteScheduleItem(id) {
  const item = state.scheduleItems.find((s) => s.id === id);
  state.scheduleItems = state.scheduleItems.filter((s) => s.id !== id);
  if (item) {
    logActivity("calendarEvent", id, item.projectId, "deleted", `Removed schedule "${item.title}"`);
  }
  persist();
  return !!item;
}

// ---------------------------------------------------------------------------
// Activity
// ---------------------------------------------------------------------------

export function getRecentActivity(limit = 50) {
  return [...(state?.activityLog ?? [])].slice(0, limit);
}

export function clearActivityLog() {
  state.activityLog = [];
  persist();
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export function getSettings() {
  if (!state) return {};
  return state.settings ?? {};
}

export function setSetting(key, value) {
  if (!state) return;
  if (!state.settings) state.settings = {};
  state.settings[key] = value;
  persist();
}

export function getSetting(key) {
  if (!state || !state.settings) return undefined;
  return state.settings[key];
}

// ---------------------------------------------------------------------------
// Session-level actions
// ---------------------------------------------------------------------------

/**
 * Start afresh: wipe everything, reset to a blank local workspace, and clear
 * the cloud document so no prior data is resumed across devices.
 */
export async function startAfresh() {
  state = makeBlankState();
  writeCache(state);
  if (isCloudAvailable()) {
    try {
      await clearCloud();
    } catch (e) {
      console.warn("[panga/state] cloud clear failed:", e);
    }
  }
  // Reset per-user cache key so a fresh id gets minted
  notify();
}

/** Export the full in-memory state as a portable JSON snapshot. */
export function exportSnapshot() {
  if (!state) return null;
  return {
    metadata: {
      version: "1.0",
      appName: "Panga",
      exportedAt: new Date().toISOString(),
      dbVersion: state.meta?.version ?? 1,
    },
    data: {
      projects: state.projects,
      tasks: state.tasks,
      resources: state.resources,
      contacts: state.contacts,
      scheduleItems: state.scheduleItems,
      activityLog: state.activityLog,
      settings: state.settings,
    },
  };
}

/**
 * Replace the in-memory state with imported data (merge with local settings
 * to preserve cloud tokens where applicable). Emits a full refresh.
 * @param {any} snapshot
 */
export function importSnapshot(snapshot) {
  const data = snapshot?.data ?? snapshot ?? {};
  state = {
    user: state?.user ?? null,
    projects: Array.isArray(data.projects) ? data.projects : [],
    tasks: Array.isArray(data.tasks) ? data.tasks : [],
    resources: Array.isArray(data.resources) ? data.resources : [],
    contacts: Array.isArray(data.contacts) ? data.contacts : [],
    scheduleItems: Array.isArray(data.scheduleItems) ? data.scheduleItems : [],
    activityLog: Array.isArray(data.activityLog) ? data.activityLog : [],
    settings: { ...(state?.settings ?? { lastTab: "Overview", expanded: {} }), ...(data.settings ?? {}) },
    meta: { version: 1, lastWriteAt: now() },
  };
  // Trim stale activity for fresh imports
  if (state.activityLog.length > 100) state.activityLog = state.activityLog.slice(0, 100);
  writeCache(state);
  if (isCloudAvailable()) {
    clearTimeout(cloudWriteTimer);
    cloudWriteTimer = setTimeout(() => writeCloud(state).catch(() => {}), 500);
  }
  notify();
}
