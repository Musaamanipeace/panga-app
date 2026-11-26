// src/search/search.ts
// Header search across the current model: folders, task lists, tasks, notes, links, reminders, and clipboard clips.
// Clicking a result takes the user straight to the saved item.

import { listNoteFolders } from "../data/noteFolders";
import { listLinkFolders } from "../data/linkFolders";
import { listTaskListFolders } from "../data/taskListFolders";
import { listReminderFolders } from "../data/reminderFolders";
import { listTaskLists } from "../data/taskLists";
import { listAllNotes } from "../data/notes";
import { listAllLinks } from "../data/links";
import { listAllTasks } from "../data/tasks";
import { formatReminderSummaryWhen, listReminders } from "../data/reminders";
import { listClips } from "../data/clips";

export type SearchResultType = "folder" | "file" | "taskList";

export interface SearchResult {
  type: SearchResultType;
  key: string;
  title: string;
  subtitle: string;
  /** Route to navigate to when the result is clicked. */
  route: string;
}

function matches(q: string, ...fields: (string | string[] | undefined | null)[]): boolean {
  return fields.some((f) =>
    Array.isArray(f)
      ? f.some((x) => x.toLowerCase().includes(q))
      : f?.toLowerCase().includes(q)
  );
}

export async function globalSearch(rawQuery: string): Promise<SearchResult[]> {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return [];

  const [
    noteFolders,
    linkFolders,
    taskListFolders,
    reminderFolders,
    taskLists,
    notes,
    links,
    tasks,
    reminders,
    clips,
  ] = await Promise.all([
    listNoteFolders(),
    listLinkFolders(),
    listTaskListFolders(),
    listReminderFolders(),
    listTaskLists(),
    listAllNotes(),
    listAllLinks(),
    listAllTasks(),
    listReminders(),
    listClips(),
  ]);

  const results: SearchResult[] = [];

  for (const f of noteFolders) {
    if (matches(q, f.title)) {
      results.push({
        type: "folder",
        key: `folder-note-${f.id}`,
        title: f.title,
        subtitle: "Note folder",
        route: `/home?tab=Notes&folder=${f.id}`,
      });
    }
  }
  for (const f of linkFolders) {
    if (matches(q, f.title)) {
      results.push({
        type: "folder",
        key: `folder-link-${f.id}`,
        title: f.title,
        subtitle: "Link folder",
        route: `/home?tab=Links&folder=${f.id}`,
      });
    }
  }
  for (const f of taskListFolders) {
    if (matches(q, f.title)) {
      results.push({
        type: "folder",
        key: `folder-tasklist-${f.id}`,
        title: f.title,
        subtitle: "Task list folder",
        route: `/home?tab=Task lists&folder=${f.id}`,
      });
    }
  }
  for (const f of reminderFolders) {
    if (matches(q, f.title)) {
      results.push({
        type: "folder",
        key: `folder-reminder-${f.id}`,
        title: f.title,
        subtitle: "Reminder folder",
        route: `/home?tab=Reminders&folder=${f.id}`,
      });
    }
  }

  for (const tl of taskLists) {
    if (matches(q, tl.title)) {
      results.push({
        type: "taskList",
        key: `taskList-${tl.id}`,
        title: tl.title,
        subtitle: "Task list",
        route: `/home?tab=Task lists&list=${tl.id}`,
      });
    }
  }

  for (const t of tasks) {
    if (matches(q, t.title, t.notes, t.tags)) {
      results.push({
        type: "file",
        key: `task-${t.id}`,
        title: t.title,
        subtitle: t.completed ? "Completed task" : "Task",
        route: t.listId ? `/home?tab=Task lists&list=${t.listId}` : "/home?tab=Task lists",
      });
    }
  }

  for (const n of notes) {
    if (matches(q, n.title, n.body, n.tags)) {
      results.push({
        type: "file",
        key: `note-${n.id}`,
        title: n.title,
        subtitle: "Note",
        route: n.folderId ? `/home?tab=Notes&folder=${n.folderId}` : "/home?tab=Notes",
      });
    }
  }

  for (const l of links) {
    if (matches(q, l.title, l.url, l.notes, l.tags)) {
      results.push({
        type: "file",
        key: `link-${l.id}`,
        title: l.title,
        subtitle: l.url,
        route: l.folderId ? `/home?tab=Links&folder=${l.folderId}` : "/home?tab=Links",
      });
    }
  }

  for (const r of reminders) {
    if (matches(q, r.message)) {
      results.push({
        type: "file",
        key: `reminder-${r.id}`,
        title: r.message,
        subtitle: `Reminder (${formatReminderSummaryWhen(r)})`,
        route: r.folderId ? `/home?tab=Reminders&folder=${r.folderId}` : "/home?tab=Reminders",
      });
    }
  }

  for (const c of clips) {
    if (matches(q, c.title, c.body)) {
      results.push({
        type: "file",
        key: `clip-${c.id}`,
        title: c.title,
        subtitle: "Clipboard item",
        route: "/home?tab=Clipboard",
      });
    }
  }

  return results.slice(0, 30);
}
