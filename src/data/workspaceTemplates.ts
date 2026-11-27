// src/data/workspaceTemplates.ts
// Preloaded workspace templates (Developer, Daily routine, Social events) that users
// can delete at any time and restore on demand without touching existing workspaces.

import { db, notifyLocalDataMutated, switchWorkspaceDb } from "./db";
import { getAccountSetting, setAccountSetting } from "./accountSettings";
import {
  DEFAULT_WORKSPACE_ID,
  addWorkspaceEntry,
  getActiveWorkspaceId,
  listWorkspaces,
  setActiveWorkspaceId,
  type WorkspaceTemplateId,
} from "./workspaceState";
import { newId, now } from "./utils";

export const TEMPLATES_SEEDED_KEY = "defaultWorkspaceTemplatesSeeded";

export interface WorkspaceTemplateDef {
  id: WorkspaceTemplateId;
  name: string;
  description: string;
}

export const DEFAULT_TEMPLATE_DEFS: readonly WorkspaceTemplateDef[] = [
  {
    id: "developer",
    name: "Developer",
    description: "Git commands you can extend and general workspace scripts.",
  },
  {
    id: "daily-routine",
    name: "Daily routine",
    description: "Clean workspace ready for daily habits and routines.",
  },
  {
    id: "social-events",
    name: "Social events",
    description: "Plan gatherings, venues, invites, and event notes.",
  },
];

const GIT_COMMANDS_NOTE_BODY = `# Git commands

Add your team or repo-specific commands below.

## Daily flow
\`\`\`bash
git status -sb
git fetch origin
git pull --rebase origin main
git switch -c feat/my-change
\`\`\`

## Stage, review & commit
\`\`\`bash
git add -p
git diff --staged
git commit -m "feat(scope): short summary"
git push -u origin HEAD
\`\`\`

## Quick recovery
\`\`\`bash
git stash push -u -m "wip"
git stash pop
git log --oneline -n 15
\`\`\`
`;

const WORKSPACE_SCRIPTS_NOTE_BODY = `# Workspace scripts

Common scripts across projects (customize per repo):

- **Dev server**: \`npm run dev\`
- **Typecheck & build**: \`npm run build\`
- **Lint**: \`npm run lint\`
- **Tests**: \`npm test\`
`;

/** Seed starter data for a template into the currently open workspace Dexie instance. */
export async function seedTemplateIntoCurrentDb(templateId: WorkspaceTemplateId): Promise<void> {
  if (!db.isOpen()) await db.open();
  const t = now();

  if (templateId === "developer") {
    const folderId = newId();
    await db.noteFolders.add({
      id: folderId,
      parentFolderId: null,
      title: "Dev reference",
      order: 0,
      createdAt: t,
      updatedAt: t,
      syncStatus: "pending",
    });

    await db.notes.bulkAdd([
      {
        id: newId(),
        folderId,
        title: "Git commands",
        body: GIT_COMMANDS_NOTE_BODY,
        tags: ["git", "commands"],
        createdAt: t,
        updatedAt: t,
        syncStatus: "pending",
      },
      {
        id: newId(),
        folderId,
        title: "Workspace scripts",
        body: WORKSPACE_SCRIPTS_NOTE_BODY,
        tags: ["scripts", "dev"],
        createdAt: t + 1,
        updatedAt: t + 1,
        syncStatus: "pending",
      },
    ]);

    const gitListId = newId();
    const scriptsListId = newId();
    await db.taskLists.bulkAdd([
      {
        id: gitListId,
        folderId: null,
        title: "Git commands",
        description: "Frequently used git commands — add your own anytime.",
        order: 0,
        createdAt: t,
        updatedAt: t,
        syncStatus: "pending",
      },
      {
        id: scriptsListId,
        folderId: null,
        title: "Workspace scripts",
        description: "Build, lint, test, and setup commands.",
        order: 1,
        createdAt: t + 1,
        updatedAt: t + 1,
        syncStatus: "pending",
      },
    ]);

    const gitCommands = [
      "git status -sb",
      "git pull --rebase origin main",
      "git switch -c feat/topic",
      "git diff --staged",
      "git stash push -u -m \"wip\"",
    ];
    await db.tasks.bulkAdd(
      gitCommands.map((cmd, idx) => ({
        id: newId(),
        listId: gitListId,
        parentId: null,
        title: cmd,
        notes: "",
        status: "active" as const,
        completed: false,
        dueDate: null,
        order: idx,
        tags: ["git"],
        createdAt: t + idx,
        updatedAt: t + idx,
        syncStatus: "pending" as const,
      }))
    );

    const scriptItems = [
      "npm run dev",
      "npm run build",
      "npm run lint",
      "npm test",
    ];
    await db.tasks.bulkAdd(
      scriptItems.map((cmd, idx) => ({
        id: newId(),
        listId: scriptsListId,
        parentId: null,
        title: cmd,
        notes: "",
        status: "active" as const,
        completed: false,
        dueDate: null,
        order: idx,
        tags: ["scripts"],
        createdAt: t + 10 + idx,
        updatedAt: t + 10 + idx,
        syncStatus: "pending" as const,
      }))
    );
    return;
  }

  if (templateId === "daily-routine") {
    // Intentionally starts clean/empty per user specification.
    return;
  }

  if (templateId === "social-events") {
    await db.taskLists.add({
      id: newId(),
      folderId: null,
      title: "Upcoming events",
      description: "Guest lists, timings, and follow-ups.",
      order: 0,
      createdAt: t,
      updatedAt: t,
      syncStatus: "pending",
    });
    await db.noteFolders.add({
      id: newId(),
      parentFolderId: null,
      title: "Event plans",
      order: 0,
      createdAt: t,
      updatedAt: t,
      syncStatus: "pending",
    });
    await db.linkFolders.add({
      id: newId(),
      parentFolderId: null,
      title: "Venues & invites",
      order: 0,
      createdAt: t,
      updatedAt: t,
      syncStatus: "pending",
    });
  }
}

/**
 * Ensures the 3 default templates exist on first launch, or recreates missing ones
 * when the user explicitly clicks "Restore default templates".
 * Existing user workspaces are never overwritten.
 */
export async function ensureDefaultWorkspaceTemplates(options?: {
  forceRestore?: boolean;
}): Promise<{ restored: string[] }> {
  const alreadySeeded = getAccountSetting<boolean>(TEMPLATES_SEEDED_KEY) === true;
  if (alreadySeeded && !options?.forceRestore) {
    return { restored: [] };
  }

  const prevActive = getActiveWorkspaceId();
  const existing = listWorkspaces();
  const restored: string[] = [];

  try {
    for (const tpl of DEFAULT_TEMPLATE_DEFS) {
      const hasMatch = existing.some(
        (w) =>
          w.id !== DEFAULT_WORKSPACE_ID &&
          (w.templateId === tpl.id || w.name.trim().toLowerCase() === tpl.name.toLowerCase())
      );
      if (hasMatch) continue;

      const created = addWorkspaceEntry(tpl.name, { templateId: tpl.id });
      setActiveWorkspaceId(created.id);
      await switchWorkspaceDb();
      await seedTemplateIntoCurrentDb(tpl.id);
      restored.push(tpl.name);
    }
    setAccountSetting(TEMPLATES_SEEDED_KEY, true);
  } finally {
    if (getActiveWorkspaceId() !== prevActive) {
      setActiveWorkspaceId(prevActive);
      await switchWorkspaceDb();
    }
  }

  if (restored.length > 0 && typeof window !== "undefined") {
    notifyLocalDataMutated();
    window.dispatchEvent(new CustomEvent("panga-data-updated"));
  }
  return { restored };
}
