// src/data/insights.ts
import { db, type Insight, type InsightType } from "./db";
import { newId, now } from "./utils";
import { syncPushRecord, syncDeleteRecord } from "../sync/sync";

export type { Insight, InsightType };

export async function listInsights(projectId: string): Promise<Insight[]> {
  return db.insights.where("projectId").equals(projectId).reverse().sortBy("updatedAt");
}

export async function getInsight(id: string): Promise<Insight | undefined> {
  return db.insights.get(id);
}

export async function createInsight(input: {
  projectId: string;
  title: string;
  body?: string | null;
  type?: InsightType;
  link?: string | null;
  tags?: string[];
}): Promise<Insight> {
  const t = now();
  const insight: Insight = {
    id: newId(),
    projectId: input.projectId,
    title: input.title,
    body: input.body ?? null,
    type: input.type ?? "note",
    link: input.link ?? null,
    tags: input.tags ?? [],
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.insights.add(insight);
  void syncPushRecord("insights", insight);
  return insight;
}

export async function updateInsight(
  id: string,
  changes: Partial<Pick<Insight, "title" | "body" | "type" | "link" | "tags">>
): Promise<void> {
  await db.insights.update(id, { ...changes, updatedAt: now(), syncStatus: "pending" });
  const updated = await db.insights.get(id);
  if (updated) void syncPushRecord("insights", updated);
}

export async function deleteInsight(id: string): Promise<void> {
  await db.insights.delete(id);
  void syncDeleteRecord("insights", id);
}

export async function deleteInsightsForProject(projectId: string): Promise<void> {
  const rows = await db.insights.where("projectId").equals(projectId).toArray();
  await db.insights.where("projectId").equals(projectId).delete();
  for (const row of rows) {
    void syncDeleteRecord("insights", row.id);
  }
}
