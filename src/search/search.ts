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
  | "goal"
  | "issue"
  | "docEntry";

export interface SearchResult {
  type: SearchResultType;
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  subtitle?: string;
}

export async function globalSearch(rawQuery: string): Promise<SearchResult[]> {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return [];

  const [projects, tasks, resources, goals, issues, docEntries] = await Promise.all([
    db.projects.toArray(),
    db.tasks.toArray(),
    db.resources.toArray(),
    db.goals.toArray(),
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
      results.push({ type: "project", id: p.id, projectId: p.id, projectName: p.name, title: p.name, subtitle: "Project" });
    }
  }
  for (const t of tasks) {
    if (matches(t.title, t.notes, t.tags)) {
      results.push({ type: "task", id: t.id, projectId: t.projectId, projectName: projectName(t.projectId), title: t.title, subtitle: `Task · ${t.status}` });
    }
  }
   for (const r of resources) {
    const imageNames = (r.images ?? []).map((i) => i.name + (i.alt ? " " + i.alt : ""));
    if (matches(r.title, r.value, r.textBody, r.notes, r.tags, imageNames)) {
      results.push({ type: "resource", id: r.id, projectId: r.projectId, projectName: projectName(r.projectId), title: r.title, subtitle: `Resource · ${r.category}` });
    }
  }
  for (const g of goals) {
    if (matches(g.title)) {
      results.push({ type: "goal", id: g.id, projectId: g.projectId, projectName: projectName(g.projectId), title: g.title, subtitle: `Goal · ${g.status}` });
    }
  }
  for (const i of issues) {
    if (matches(i.title, i.description)) {
      results.push({ type: "issue", id: i.id, projectId: i.projectId, projectName: projectName(i.projectId), title: i.title, subtitle: `Issue · ${i.severity}` });
    }
  }
  for (const d of docEntries) {
    if (matches(d.title, d.content)) {
      results.push({ type: "docEntry", id: d.id, projectId: d.projectId, projectName: projectName(d.projectId), title: d.title, subtitle: "Documentation" });
    }
  }

  return results.slice(0, 30);
}
