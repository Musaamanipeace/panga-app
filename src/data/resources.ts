import {
  db,
  type Resource,
  type ResourceCategory,
} from "./db";
import { newId, now } from "./utils";

export type CreateResourceInput = {
  projectId: string;
  category: ResourceCategory;
  title: string;
  value: string;
  notes?: string;
  tags?: string[];
};

export type UpdateResourceInput = Partial<
  Omit<Resource, "id" | "projectId" | "createdAt">
>;

export async function createResource(
  input: CreateResourceInput,
): Promise<Resource> {
  const timestamp = now();
  const resource: Resource = {
    id: newId(),
    projectId: input.projectId,
    category: input.category,
    title: input.title.trim(),
    value: input.value,
    notes: input.notes?.trim() ?? "",
    tags: [...(input.tags ?? [])],
    createdAt: timestamp,
    updatedAt: timestamp,
    syncStatus: "pending",
  };

  await db.resources.add(resource);
  return resource;
}

export async function listResources(projectId?: string): Promise<Resource[]> {
  const collection = projectId
    ? db.resources.where("projectId").equals(projectId)
    : db.resources;
  return collection.toArray();
}

export async function getResource(resourceId: string): Promise<Resource | undefined> {
  return db.resources.get(resourceId);
}

export async function updateResource(
  resourceId: string,
  input: UpdateResourceInput,
): Promise<void> {
  await db.resources.update(resourceId, {
    ...input,
    title: input.title?.trim(),
    notes: input.notes?.trim(),
    tags: input.tags ? [...input.tags] : undefined,
    updatedAt: now(),
    syncStatus: "pending",
  });
}

export async function deleteResource(resourceId: string): Promise<void> {
  await db.resources.delete(resourceId);
}
