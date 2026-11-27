// src/search/search.ts
// Cross-workspace search across all workspaces & subworkspaces plus account-wide reminders.
// Clicking a result switches into the item's workspace (when needed) and navigates directly to it.

import { readWorkspaceTablesForSearch } from "../data/db";
import { formatReminderSummaryWhen, listReminders } from "../data/reminders";
import {
  formatWorkspaceLabel,
  getActiveWorkspaceId,
  listWorkspaces,
} from "../data/workspaceState";

export type SearchResultType = "folder" | "file" | "taskList";

export interface SearchResult {
  type: SearchResultType;
  key: string;
  title: string;
  subtitle: string;
  workspaceId: string;
  workspaceName: string;
  skipWorkspaceSwitch?: boolean;
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

  const allWorkspaces = listWorkspaces();
  const activeWsId = getActiveWorkspaceId();
  // Search active workspace first so its hits appear at the top.
  const orderedWorkspaces = [
    ...allWorkspaces.filter((w) => w.id === activeWsId),
    ...allWorkspaces.filter((w) => w.id !== activeWsId),
  ];

  const [workspaceDatasets, reminders] = await Promise.all([
    Promise.all(
      orderedWorkspaces.map(async (w) => ({
        workspace: w,
        label: formatWorkspaceLabel(w, allWorkspaces),
        data: await readWorkspaceTablesForSearch(w.id),
      }))
    ),
    listReminders(),
  ]);

  const results: SearchResult[] = [];

  for (const { workspace, label, data } of workspaceDatasets) {
    const wsId = workspace.id;
    for (const f of data.noteFolders) {
      if (matches(q, f.title)) {
        results.push({
          type: "folder",
          key: `ws-${wsId}-folder-note-${f.id}`,
          title: f.title,
          subtitle: "Note folder",
          workspaceId: wsId,
          workspaceName: label,
          route: `/home?tab=Notes&folder=${f.id}`,
        });
      }
    }
    for (const f of data.linkFolders) {
      if (matches(q, f.title)) {
        results.push({
          type: "folder",
          key: `ws-${wsId}-folder-link-${f.id}`,
          title: f.title,
          subtitle: "Link folder",
          workspaceId: wsId,
          workspaceName: label,
          route: `/home?tab=Links&folder=${f.id}`,
        });
      }
    }
    for (const f of data.taskListFolders) {
      if (matches(q, f.title)) {
        results.push({
          type: "folder",
          key: `ws-${wsId}-folder-tasklist-${f.id}`,
          title: f.title,
          subtitle: "Task list folder",
          workspaceId: wsId,
          workspaceName: label,
          route: `/home?tab=Task lists&folder=${f.id}`,
        });
      }
    }

    for (const tl of data.taskLists) {
      if (matches(q, tl.title, tl.description)) {
        results.push({
          type: "taskList",
          key: `ws-${wsId}-taskList-${tl.id}`,
          title: tl.title,
          subtitle: "Task list",
          workspaceId: wsId,
          workspaceName: label,
          route: `/home?tab=Task lists&list=${tl.id}`,
        });
      }
    }

    for (const t of data.tasks) {
      if (matches(q, t.title, t.notes, t.tags)) {
        results.push({
          type: "file",
          key: `ws-${wsId}-task-${t.id}`,
          title: t.title,
          subtitle: t.completed ? "Completed task" : "Task",
          workspaceId: wsId,
          workspaceName: label,
          route: t.listId ? `/home?tab=Task lists&list=${t.listId}` : "/home?tab=Task lists",
        });
      }
    }

    for (const n of data.notes) {
      if (matches(q, n.title, n.body, n.tags)) {
        const folderParam = n.folderId ? `&folder=${n.folderId}` : "";
        results.push({
          type: "file",
          key: `ws-${wsId}-note-${n.id}`,
          title: n.title,
          subtitle: "Note",
          workspaceId: wsId,
          workspaceName: label,
          route: `/home?tab=Notes${folderParam}&note=${n.id}`,
        });
      }
    }

    for (const l of data.links) {
      if (matches(q, l.title, l.url, l.notes, l.tags)) {
        results.push({
          type: "file",
          key: `ws-${wsId}-link-${l.id}`,
          title: l.title,
          subtitle: l.url,
          workspaceId: wsId,
          workspaceName: label,
          route: l.folderId ? `/home?tab=Links&folder=${l.folderId}` : "/home?tab=Links",
        });
      }
    }

    for (const th of data.thoughts) {
      if (matches(q, th.text)) {
        results.push({
          type: "file",
          key: `ws-${wsId}-thought-${th.id}`,
          title: th.text.slice(0, 80),
          subtitle: "Train of thought",
          workspaceId: wsId,
          workspaceName: label,
          route: "/home",
        });
      }
    }

    for (const c of data.clips) {
      if (matches(q, c.title, c.body)) {
        results.push({
          type: "file",
          key: `ws-${wsId}-clip-${c.id}`,
          title: c.title,
          subtitle: "Clipboard item",
          workspaceId: wsId,
          workspaceName: label,
          route: "/home?tab=Clipboard",
        });
      }
    }

    for (const m of data.mediaItems) {
      if (matches(q, m.title, m.fileName, m.driveRoute, m.notes, m.tags)) {
        results.push({
          type: "file",
          key: `ws-${wsId}-media-${m.id}`,
          title: m.title || m.fileName,
          subtitle: `${m.kind === "audio" ? "Audio" : "Image"} · ${m.driveRoute}`,
          workspaceId: wsId,
          workspaceName: label,
          route: `/home?tab=Media&media=${m.id}`,
        });
      }
    }
  }

  for (const r of reminders) {
    if (matches(q, r.message, r.location, r.notes)) {
      results.push({
        type: "file",
        key: `reminder-${r.id}`,
        title: r.message,
        subtitle: `Reminder (${formatReminderSummaryWhen(r)})`,
        workspaceId: activeWsId,
        workspaceName: "Account · Reminders",
        skipWorkspaceSwitch: true,
        route: r.folderId ? `/home?tab=Reminders&folder=${r.folderId}` : "/home?tab=Reminders",
      });
    }
  }

  return results.slice(0, 40);
}
