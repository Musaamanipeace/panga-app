// src/data/resources.ts
import { db, type Resource, type ResourceCategory } from "./db";
import { newId, now } from "./utils";

export async function listResourcesForProject(projectId: string): Promise<Resource[]> {
  return db.resources.where("projectId").equals(projectId).sortBy("updatedAt");
}

export async function createResource(input: {
  projectId: string;
  category: ResourceCategory;
  title: string;
  value: string;
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
  changes: Partial<Pick<Resource, "title" | "value" | "notes" | "tags" | "category">>
): Promise<void> {
  await db.resources.update(id, { ...changes, updatedAt: now(), syncStatus: "pending" });
}

export async function deleteResource(id: string): Promise<void> {
  await db.resources.delete(id);
}
