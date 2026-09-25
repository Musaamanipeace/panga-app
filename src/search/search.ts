// src/search/search.ts
// This is the ONLY file that queries across multiple entity types for
// search purposes. Simple substring matching for now — swappable for
// FlexSearch's indexed engine later without touching any UI code,
// since the UI only ever calls globalSearch().

import { db } from "../data/db";

export type SearchResultType =
  | "project"
  | "task"
  | "resource"
  | "milestone"
  | "issue"
  | "docEntry"
  | "setting"
  | "savedFile";

export interface SearchResult {
  type: SearchResultType;
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  subtitle?: string;
  // For deep-linking results
  action?: "navigate" | "openSettings";
  target?: string; // route path or settings section
}

export async function globalSearch(rawQuery: string): Promise<SearchResult[]> {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return [];

  const [projects, tasks, resources, milestones, issues, docEntries] = await Promise.all([
    db.projects.toArray(),
    db.tasks.toArray(),
    db.resources.toArray(),
    db.milestones.toArray(),
    db.issues.toArray(),
    db.docEntries.toArray(),
  ]);

  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? "";
  const matches = (...fields: (string | string[] | undefined)[]) =>
    fields.some((f) =>
      Array.isArray(f) ? f.some((x) => x.toLowerCase().includes(q)) : f?.toLowerCase().includes(q)
    );

  const results: SearchResult[] = [];

  for (const p of projects) {
    if (matches(p.name, p.description)) {
      results.push({
        type: "project",
        id: p.id,
        projectId: p.id,
        projectName: p.name,
        title: p.name,
        subtitle: "Project",
        action: "navigate",
        target: `/project/${p.id}`,
      });
    }
  }
  for (const t of tasks) {
    if (matches(t.title, t.notes, t.tags)) {
      results.push({
        type: "task",
        id: t.id,
        projectId: t.projectId,
        projectName: projectName(t.projectId),
        title: t.title,
        subtitle: `Task · ${t.status}`,
        action: "navigate",
        target: `/project/${t.projectId}?tab=Tasks`,
      });
    }
  }
  for (const r of resources) {
    const imageNames = (r.images ?? []).map((i) => i.name + (i.alt ? " " + i.alt : ""));
    const fileNames = (r.files ?? []).map((f) => f.name);
    if (matches(r.title, r.url, r.body, r.value, r.tags, imageNames, fileNames)) {
      results.push({
        type: "resource",
        id: r.id,
        projectId: r.projectId,
        projectName: projectName(r.projectId),
        title: r.title,
        subtitle: `Resource · ${r.category}`,
        action: "navigate",
        target: `/project/${r.projectId}?tab=Resources`,
      });
    }
  }
  for (const m of milestones) {
    if (matches(m.title)) {
      results.push({
        type: "milestone",
        id: m.id,
        projectId: m.projectId,
        projectName: projectName(m.projectId),
        title: m.title,
        subtitle: `Milestone · ${m.status}`,
        action: "navigate",
        target: `/project/${m.projectId}?tab=Milestones`,
      });
    }
  }
  for (const i of issues) {
    if (matches(i.title, i.description)) {
      results.push({
        type: "issue",
        id: i.id,
        projectId: i.projectId,
        projectName: projectName(i.projectId),
        title: i.title,
        subtitle: `Issue · ${i.severity}`,
        action: "navigate",
        target: `/project/${i.projectId}?tab=Issues`,
      });
    }
  }
  for (const d of docEntries) {
    if (matches(d.title, d.content)) {
      results.push({
        type: "docEntry",
        id: d.id,
        projectId: d.projectId,
        projectName: projectName(d.projectId),
        title: d.title,
        subtitle: "Documentation",
        action: "navigate",
        target: `/project/${d.projectId}?tab=Documentation`,
      });
    }
  }

  // §6 — Settings results
  const settingEntries: { id: string; title: string; subtitle: string; target: string }[] = [
    { id: "gemini-key", title: "Gemini API Key", subtitle: "API key for Scheduler AI Plan mode", target: "gemini" },
    { id: "google-calendar", title: "Google Calendar", subtitle: "OAuth connection for Calendar sync", target: "calendar" },
    { id: "secrets-vault", title: "Secrets Vault", subtitle: "Encrypted secret storage (PBKDF2 + AES-GCM)", target: "secrets" },
  ];
  for (const s of settingEntries) {
    if (matches(s.title, s.subtitle)) {
      results.push({
        type: "setting",
        id: s.id,
        projectId: "",
        projectName: "",
        title: s.title,
        subtitle: s.subtitle,
        action: "openSettings",
        target: s.target,
      });
    }
  }

  // §6 — Saved files results (uploaded note/image attachments by filename)
  const allResources = resources.filter((r) => r.files?.length > 0 || r.images?.length > 0);
  for (const r of allResources) {
    for (const f of (r.files ?? [])) {
      if (f.name.toLowerCase().includes(q)) {
        results.push({
          type: "savedFile",
          id: `file-${r.id}-${f.name}`,
          projectId: r.projectId,
          projectName: projectName(r.projectId),
          title: f.name,
          subtitle: "File attachment",
          action: "navigate",
          target: `/project/${r.projectId}?tab=Resources`,
        });
      }
    }
    for (const img of (r.images ?? [])) {
      if (img.name.toLowerCase().includes(q)) {
        results.push({
          type: "savedFile",
          id: `img-${r.id}-${img.name}`,
          projectId: r.projectId,
          projectName: projectName(r.projectId),
          title: img.name,
          subtitle: "Image attachment",
          action: "navigate",
          target: `/project/${r.projectId}?tab=Resources`,
        });
      }
    }
  }

  return results.slice(0, 30);
}
