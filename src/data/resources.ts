// src/data/resources.ts
import { db, type Resource, type ResourceCategory, type ResourceImage, type ResourceFile, type ResourceProvider } from "./db";
import { newId, now } from "./utils";
import { syncPushRecord, syncDeleteRecord } from "../sync/sync";

export type { Resource, ResourceCategory, ResourceImage, ResourceFile, ResourceProvider };

export async function listResourcesForProject(projectId: string): Promise<Resource[]> {
  if (!db.isOpen()) await db.open();
  const list = await db.resources.where("projectId").equals(projectId).toArray();
  return list.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function listAllResources(): Promise<Resource[]> {
  if (!db.isOpen()) await db.open();
  const all = await db.resources.toArray();
  return all.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function listAllLinks(): Promise<Resource[]> {
  if (!db.isOpen()) await db.open();
  const all = await db.resources.where("category").equals("links").toArray();
  return all.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function listResourcesByCategory(projectId: string, category: ResourceCategory): Promise<Resource[]> {
  if (!db.isOpen()) await db.open();
  return db.resources
    .where("projectId")
    .equals(projectId)
    .and((r) => r.category === category)
    .sortBy("updatedAt");
}

export async function getResource(id: string): Promise<Resource | undefined> {
  if (!db.isOpen()) await db.open();
  return db.resources.get(id);
}

export interface CreateResourceInput {
  projectId?: string | null;
  category: ResourceCategory;
  title: string;
  tags?: string[];
  url?: string | null;
  provider?: ResourceProvider | null;
  body?: string | null;
  images?: ResourceImage[];
  files?: ResourceFile[];
}

export async function createResource(input: CreateResourceInput): Promise<Resource> {
  if (!db.isOpen()) await db.open();
  const t = now();
  const resource: Resource = {
    id: newId(),
    projectId: input.projectId || "global",
    category: input.category,
    title: input.title,
    tags: input.tags ?? [],
    url: input.url ?? null,
    provider: input.provider ?? null,
    body: input.body ?? null,
    images: input.images ?? [],
    files: input.files ?? [],
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.resources.add(resource);
  void syncPushRecord("resources", resource);
  return resource;
}

export async function updateResource(
  id: string,
  changes: Partial<
    Pick<
      Resource,
      "title" | "tags" | "url" | "provider" | "body" | "images" | "files" | "category" | "projectId"
    >
  >
): Promise<void> {
  if (!db.isOpen()) await db.open();
  const updatedAt = now();
  await db.resources.update(id, { ...changes, updatedAt, syncStatus: "pending" });
  const updated = await db.resources.get(id);
  if (updated) void syncPushRecord("resources", updated);
}

export async function deleteResource(id: string): Promise<void> {
  if (!db.isOpen()) await db.open();
  await db.resources.delete(id);
  void syncDeleteRecord("resources", id);
}

export async function deleteResourcesForProject(projectId: string): Promise<void> {
  if (!db.isOpen()) await db.open();
  const rows = await db.resources.where("projectId").equals(projectId).toArray();
  await db.resources.where("projectId").equals(projectId).delete();
  for (const row of rows) {
    void syncDeleteRecord("resources", row.id);
  }
}
