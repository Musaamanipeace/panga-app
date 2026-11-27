// Centralized shortcut registry driving both keyboard handling and the Shortcuts menu.
// Matches physical key positions via KeyboardEvent.code so Alt shortcuts work on Mac too.

export interface HomeTabDef {
  id: string;
  code: string;
  shortcut: string;
  description: string;
}

export const HOME_TABS: readonly HomeTabDef[] = [
  { id: "Task lists", code: "KeyT", shortcut: "Alt+T", description: "Task lists" },
  { id: "Links", code: "KeyL", shortcut: "Alt+L", description: "Links" },
  { id: "Notes", code: "KeyN", shortcut: "Alt+N", description: "Notes" },
  { id: "Reminders", code: "KeyR", shortcut: "Alt+R", description: "Reminders" },
  { id: "Clipboard", code: "KeyC", shortcut: "Alt+C", description: "Clipboard" },
  { id: "Media", code: "KeyM", shortcut: "Alt+M", description: "Media" },
];

export type HomeTabId = (typeof HOME_TABS)[number]["id"];

export interface ShortcutEntry {
  keys: string;
  action: string;
}

export const SHORTCUT_ENTRIES: readonly ShortcutEntry[] = [
  ...HOME_TABS.map((t) => ({ keys: t.shortcut, action: `${t.description} tab` })),
  { keys: "Ctrl/Cmd+K", action: "Search" },
  { keys: "Alt+S", action: "Search" },
  { keys: "Alt+Shift+M", action: "Voice dictation" },
  { keys: "?", action: "Show shortcuts" },
];

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || typeof target !== "object") return false;
  const el = target as { tagName?: string; isContentEditable?: boolean };
  const tag = el.tagName?.toUpperCase();
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return Boolean(el.isContentEditable);
}

export type ShortcutMatch =
  | { type: "tab"; tabId: string }
  | { type: "search" }
  | { type: "shortcuts" };

export function matchShortcut(e: {
  code: string;
  key: string;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  target: EventTarget | null;
}): ShortcutMatch | null {
  // Ctrl/Cmd+K -> Search
  if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.code === "KeyK") {
    return { type: "search" };
  }

  // Alt+<letter> (without Ctrl/Meta/Shift)
  if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
    if (e.code === "KeyS") {
      return { type: "search" };
    }
    const tab = HOME_TABS.find((t) => t.code === e.code);
    if (tab) {
      return { type: "tab", tabId: tab.id };
    }
  }

  // ? -> Shortcuts popover (when not typing in a text field)
  if (
    !e.ctrlKey &&
    !e.metaKey &&
    !e.altKey &&
    (e.key === "?" || (e.shiftKey && e.code === "Slash")) &&
    !isEditableTarget(e.target)
  ) {
    return { type: "shortcuts" };
  }

  return null;
}

export function homeTabRoute(tabId: string): string {
  return tabId === "Task lists" ? "/home" : `/home?tab=${encodeURIComponent(tabId)}`;
}
