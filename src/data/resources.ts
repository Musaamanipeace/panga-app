// src/data/resources.ts
// Minimal helpers backing local clipboard clips stored in db.resources.
import { db, type Resource, type ResourceCategory } from "./db";
import { newId, now } from "./utils";

export type { Resource, ResourceCategory };

export interface CreateResourceInput {
  category: ResourceCategory;
  title: string;
  tags?: string[];
  url?: string | null;
  body?: string | null;
}

export async function createResource(input: CreateResourceInput): Promise<Resource> {
  if (!db.isOpen()) await db.open();
  const t = now();
  const resource: Resource = {
    id: newId(),
    projectId: null,
    category: input.category,
    title: input.title,
    tags: input.tags ?? [],
    url: input.url ?? null,
    provider: null,
    body: input.body ?? null,
    listItems: [],
    customFields: {},
    images: [],
    files: [],
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.resources.add(resource);
  return resource;
}

export async function deleteResource(id: string): Promise<void> {
  if (!db.isOpen()) await db.open();
  await db.resources.delete(id);
}
