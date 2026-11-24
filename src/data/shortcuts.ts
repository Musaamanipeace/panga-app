// src/data/shortcuts.ts
// Quick-access home shortcuts pinned below the AI command box.
// Persisted in IndexedDB settings (`quickShortcuts`) so they follow JSON backup/restore
// and isolate cleanly per local workspace account.

import { getSetting, setSetting } from "./settings";
import { newId, now } from "./utils";
import { listTaskLists } from "./taskLists";
import { listTaskListFolders } from "./taskListFolders";
import { listNoteFolders } from "./noteFolders";
import { listAllNotes } from "./notes";
import { listLinkFolders } from "./linkFolders";
import { listAllLinks } from "./links";
import { listReminderFolders } from "./reminderFolders";
import { listReminders } from "./reminders";

export const QUICK_SHORTCUTS_KEY = "quickShortcuts";

export type ShortcutTargetKind =
  | "url"
  | "link"
  | "taskList"
  | "taskListFolder"
  | "noteFolder"
  | "note"
  | "linkFolder"
  | "reminderFolder"
  | "reminder"
  | "tab";

export interface QuickShortcut {
  id: string;
  kind: ShortcutTargetKind;
  name: string;
  targetId?: string;
  route?: string;
  url?: string;
  createdAt: number;
}

export interface ShortcutTargetOption {
  kind: ShortcutTargetKind;
  targetId: string;
  name: string;
  categoryLabel: string;
  subtitle: string;
  route?: string;
  url?: string;
}

/**
 * Normalize a pasted/typed string into an http(s) URL if valid, else return null.
 * Handles pasted text containing whitespace around a URL, or bare domains like
 * `github.com/org/repo` and `localhost:3000`.
 */
export function normalizeLinkUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || /\s/.test(trimmed)) {
    // Try extracting the first http(s) URL if user pasted a snippet containing text + URL
    const match = trimmed.match(/https?:\/\/[^\s]+/i);
    if (!match) return null;
    return normalizeLinkUrl(match[0]);
  }

  let candidate = trimmed;
  if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(candidate)) {
    // Reject obvious non-URLs (no dot and not localhost)
    if (!/^(localhost(:\d+)?(\/|$)|[^/]+\.[a-zA-Z]{2,}(:\d+)?(\/|\?|#|$))/.test(candidate)) {
      return null;
    }
    const isLocal = /^localhost(:\d+)?(\/|$)/i.test(candidate);
    candidate = `${isLocal ? "http" : "https"}://${candidate}`;
  }

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    if (!parsed.hostname) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

/** Auto-generate a concise, readable shortcut name from a normalized URL. */
export function autoNameFromUrl(urlStr: string): string {
  try {
    const u = new URL(urlStr);
    const host = u.hostname.replace(/^www\./i, "") + (u.port ? `:${u.port}` : "");
    const segments = u.pathname.split("/").filter(Boolean);
    const generic = new Set(["watch", "index", "index.html", "search", "view", "edit", "home"]);
    if (segments.length === 1 && !u.search) {
      const seg = decodeURIComponent(segments[0]);
      const isOpaque = /^[0-9a-f_-]{12,}$/i.test(seg) || /^\d+$/.test(seg) || generic.has(seg.toLowerCase());
      if (!isOpaque && seg.length <= 16 && `${host}/${seg}`.length <= 26) {
        return `${host}/${seg}`;
      }
    }
    return host;
  } catch {
    return urlStr.slice(0, 24);
  }
}

function autoShortcutName(input: { kind: ShortcutTargetKind; name?: string; url?: string }): string {
  const clean = input.name?.trim();
  if (clean) return clean;
  if (input.url) return autoNameFromUrl(input.url);
  switch (input.kind) {
    case "taskList":
      return "Task list";
    case "taskListFolder":
    case "noteFolder":
    case "linkFolder":
    case "reminderFolder":
      return "Folder";
    case "note":
      return "Untitled note";
    case "reminder":
      return "Reminder";
    case "link":
    case "url":
      return "Link";
    case "tab":
      return "Section";
  }
}

export async function listShortcuts(): Promise<QuickShortcut[]> {
  const raw = await getSetting<QuickShortcut[]>(QUICK_SHORTCUTS_KEY);
  if (!Array.isArray(raw)) return [];
  return raw.filter((item) => item && typeof item.id === "string" && typeof item.name === "string");
}

async function saveShortcuts(items: QuickShortcut[]): Promise<void> {
  await setSetting(QUICK_SHORTCUTS_KEY, items);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("panga-shortcuts-updated"));
  }
}

export async function addShortcut(input: {
  kind: ShortcutTargetKind;
  name?: string;
  targetId?: string;
  route?: string;
  url?: string;
}): Promise<{ shortcut: QuickShortcut; duplicate: boolean }> {
  const existing = await listShortcuts();
  const normalizedUrl = input.url ? normalizeLinkUrl(input.url) ?? input.url.trim() : undefined;

  const found = existing.find((s) => {
    if (input.kind === "url" && normalizedUrl) {
      return s.kind === "url" && s.url === normalizedUrl;
    }
    if (input.targetId) {
      return s.kind === input.kind && s.targetId === input.targetId;
    }
    if (input.route) {
      return s.kind === input.kind && s.route === input.route;
    }
    return false;
  });

  if (found) {
    return { shortcut: found, duplicate: true };
  }

  const shortcut: QuickShortcut = {
    id: newId(),
    kind: input.kind,
    name: autoShortcutName({ kind: input.kind, name: input.name, url: normalizedUrl }),
    ...(input.targetId ? { targetId: input.targetId } : {}),
    ...(input.route ? { route: input.route } : {}),
    ...(normalizedUrl ? { url: normalizedUrl } : {}),
    createdAt: now(),
  };

  await saveShortcuts([...existing, shortcut]);
  return { shortcut, duplicate: false };
}

export async function addUrlShortcut(rawText: string): Promise<{ shortcut: QuickShortcut; duplicate: boolean } | null> {
  const url = normalizeLinkUrl(rawText);
  if (!url) return null;
  return addShortcut({
    kind: "url",
    url,
    name: autoNameFromUrl(url),
  });
}

export async function removeShortcut(id: string): Promise<void> {
  const existing = await listShortcuts();
  const next = existing.filter((s) => s.id !== id);
  if (next.length !== existing.length) {
    await saveShortcuts(next);
  }
}

export async function listAvailableShortcutTargets(): Promise<ShortcutTargetOption[]> {
  const [
    taskLists,
    taskListFolders,
    noteFolders,
    notes,
    linkFolders,
    links,
    reminderFolders,
    reminders,
  ] = await Promise.all([
    listTaskLists(),
    listTaskListFolders(),
    listNoteFolders(),
    listAllNotes(),
    listLinkFolders(),
    listAllLinks(),
    listReminderFolders(),
    listReminders(),
  ]);

  const options: ShortcutTargetOption[] = [];

  for (const tl of taskLists) {
    options.push({
      kind: "taskList",
      targetId: tl.id,
      name: tl.title.trim() || "Task list",
      categoryLabel: "Task list",
      subtitle: "Task lists",
      route: `/home?tab=${encodeURIComponent("Task lists")}&list=${encodeURIComponent(tl.id)}`,
    });
  }

  for (const f of taskListFolders) {
    options.push({
      kind: "taskListFolder",
      targetId: f.id,
      name: f.title.trim() || "Task list folder",
      categoryLabel: "Task folder",
      subtitle: "Task lists folder",
      route: `/home?tab=${encodeURIComponent("Task lists")}&folder=${encodeURIComponent(f.id)}`,
    });
  }

  for (const f of noteFolders) {
    options.push({
      kind: "noteFolder",
      targetId: f.id,
      name: f.title.trim() || "Note folder",
      categoryLabel: "Note folder",
      subtitle: "Notes folder",
      route: `/home?tab=Notes&folder=${encodeURIComponent(f.id)}`,
    });
  }

  for (const n of notes) {
    const firstLine = n.body.trim().split(/\r?\n/)[0] ?? "";
    const autoName = n.title.trim() || firstLine.slice(0, 32) || "Untitled note";
    options.push({
      kind: "note",
      targetId: n.id,
      name: autoName,
      categoryLabel: "Note",
      subtitle: "Note",
      route: `/home?tab=Notes&note=${encodeURIComponent(n.id)}`,
    });
  }

  for (const l of links) {
    const autoName = l.title.trim() || autoNameFromUrl(l.url);
    options.push({
      kind: "link",
      targetId: l.id,
      name: autoName,
      categoryLabel: "Link",
      subtitle: l.url,
      url: l.url,
      route: l.folderId ? `/home?tab=Links&folder=${encodeURIComponent(l.folderId)}` : "/home?tab=Links",
    });
  }

  for (const f of linkFolders) {
    options.push({
      kind: "linkFolder",
      targetId: f.id,
      name: f.title.trim() || "Link folder",
      categoryLabel: "Link folder",
      subtitle: "Links folder",
      route: `/home?tab=Links&folder=${encodeURIComponent(f.id)}`,
    });
  }

  for (const f of reminderFolders) {
    options.push({
      kind: "reminderFolder",
      targetId: f.id,
      name: f.title.trim() || "Reminder folder",
      categoryLabel: "Reminder folder",
      subtitle: "Reminders folder",
      route: `/home?tab=Reminders&folder=${encodeURIComponent(f.id)}`,
    });
  }

  for (const r of reminders) {
    options.push({
      kind: "reminder",
      targetId: r.id,
      name: r.message.trim() || "Reminder",
      categoryLabel: "Reminder",
      subtitle: new Date(r.triggerAt).toLocaleString(),
      route: `/home?tab=Reminders&reminder=${encodeURIComponent(r.id)}`,
    });
  }

  const tabs: Array<{ id: string; label: string; route: string }> = [
    { id: "tab:Task lists", label: "Task lists", route: "/home" },
    { id: "tab:Links", label: "Links", route: "/home?tab=Links" },
    { id: "tab:Notes", label: "Notes", route: "/home?tab=Notes" },
    { id: "tab:Reminders", label: "Reminders", route: "/home?tab=Reminders" },
    { id: "tab:Clipboard", label: "Clipboard", route: "/home?tab=Clipboard" },
    { id: "tab:Proofread", label: "Proofread", route: "/home?tab=Proofread" },
    { id: "tab:Settings", label: "Settings", route: "/settings" },
  ];

  for (const t of tabs) {
    options.push({
      kind: "tab",
      targetId: t.id,
      name: t.label,
      categoryLabel: "Section",
      subtitle: "Workspace section",
      route: t.route,
    });
  }

  return options;
}
