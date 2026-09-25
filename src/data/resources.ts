// src/data/resources.ts
import { db, type Resource, type ResourceCategory, type ResourceImage, type ResourceFile } from "./db";
import { newId, now } from "./utils";

export async function listResourcesForProject(projectId: string): Promise<Resource[]> {
  return db.resources.where("projectId").equals(projectId).sortBy("updatedAt");
}

export async function listResourcesByCategory(projectId: string, category: ResourceCategory): Promise<Resource[]> {
  return db.resources
    .where("projectId")
    .equals(projectId)
    .and((r) => r.category === category)
    .sortBy("updatedAt");
}

export async function getResource(id: string): Promise<Resource | undefined> {
  return db.resources.get(id);
}

export interface CreateResourceInput {
  projectId: string;
  category: ResourceCategory;
  title: string;
  tags?: string[];
  url?: string | null;
  provider?: string | null;
  contactType?: string | null;
  value?: string | null;
  body?: string | null;
  images?: ResourceImage[];
  files?: ResourceFile[];
}

export async function createResource(input: CreateResourceInput): Promise<Resource> {
  const t = now();
  const resource: Resource = {
    id: newId(),
    projectId: input.projectId,
    category: input.category,
    title: input.title,
    tags: input.tags ?? [],
    url: input.url ?? null,
    provider: input.provider ?? null,
    contactType: input.contactType ?? null,
    value: input.value ?? null,
    body: input.body ?? null,
    images: input.images ?? [],
    files: input.files ?? [],
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.resources.add(resource);
  return resource;
}

export async function updateResource(
  id: string,
  changes: Partial<
    Pick<
      Resource,
      "title" | "tags" | "url" | "provider" | "contactType" | "value" | "body" | "images" | "files" | "category"
    >
  >
): Promise<void> {
  await db.resources.update(id, { ...changes, updatedAt: now(), syncStatus: "pending" });
}

export async function deleteResource(id: string): Promise<void> {
  await db.resources.delete(id);
}

export async function deleteResourcesForProject(projectId: string): Promise<void> {
  await db.resources.where("projectId").equals(projectId).delete();
}
