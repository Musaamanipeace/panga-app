// src/search/search.ts
// Header search for the current model: folders, saved files and task lists.
// Clicking a result takes the user straight to the saved item.

import { listAllResources } from "../data/resources";
import { listNoteFolders } from "../data/noteFolders";
import { listLinkFolders } from "../data/linkFolders";
import { listTaskListFolders } from "../data/taskListFolders";
import { listReminderFolders } from "../data/reminderFolders";
import { listTaskLists } from "../data/taskLists";

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

  const [noteFolders, linkFolders, taskListFolders, reminderFolders, resources, taskLists] =
    await Promise.all([
      listNoteFolders(),
      listLinkFolders(),
      listTaskListFolders(),
      listReminderFolders(),
      listAllResources(),
      listTaskLists(),
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

  // Saved files: file attachments and images on resources.
  for (const r of resources) {
    const route = r.projectId ? `/project/${r.projectId}?tab=Resources` : "/home";
    for (const f of r.files ?? []) {
      if (f.name.toLowerCase().includes(q)) {
        results.push({
          type: "file",
          key: `file-${r.id}-${f.name}`,
          title: f.name,
          subtitle: "File attachment",
          route,
        });
      }
    }
    for (const img of r.images ?? []) {
      if (img.name.toLowerCase().includes(q)) {
        results.push({
          type: "file",
          key: `img-${r.id}-${img.name}`,
          title: img.name,
          subtitle: "Image attachment",
          route,
        });
      }
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

  return results.slice(0, 30);
}
