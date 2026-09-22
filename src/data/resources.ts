// src/data/resources.ts
import { db, type Resource, type ResourceImage, type ResourceCategoryDef } from "./db";
import { newId, now } from "./utils";

export async function listResourceCategories(): Promise<ResourceCategoryDef[]> {
  const stored = await db.settings.get("resourceCategories");
  return (stored?.value as ResourceCategoryDef[]) ?? [];
}

export async function saveResourceCategories(cats: ResourceCategoryDef[]) {
  await db.settings.put({ key: "resourceCategories", value: cats });
}

export async function listResourcesForProject(projectId: string): Promise<Resource[]> {
  return db.resources.where("projectId").equals(projectId).sortBy("updatedAt");
}

export async function createResource(input: {
  projectId: string;
  category: string;
  title: string;
  value: string;
  textBody?: string;
  images?: ResourceImage[];
  notes?: string;
  tags?: string[];
}): Promise<Resource> {
  const t = now();
  const resource: Resource = {
    id: newId(),
    projectId: input.projectId,
    category: input.category,
    title: input.title,
    value: input.value,
    textBody: input.textBody ?? "",
    images: input.images ?? [],
    notes: input.notes ?? "",
    tags: input.tags ?? [],
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.resources.add(resource);
  return resource;
}

export async function updateResource(
  id: string,
  changes: Partial<Pick<Resource, "title" | "value" | "textBody" | "images" | "notes" | "tags" | "category">>
): Promise<void> {
  await db.resources.update(id, { ...changes, updatedAt: now(), syncStatus: "pending" });
}

export async function deleteResource(id: string): Promise<void> {
  await db.resources.delete(id);
}

export async function reassignResourcesToCategory(
  fromCategoryId: string,
  toCategoryId: string
): Promise<number> {
  if (fromCategoryId === toCategoryId) return 0;
  return db.resources.where("category").equals(fromCategoryId).modify({ category: toCategoryId });
}