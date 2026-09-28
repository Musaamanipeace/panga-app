// src/data/subcategories.ts
// Editable subcategory lists per resource category. Defaults carry isDefault so
// they can be renamed and restored; custom entries can be added and deleted.
import { db, DEFAULT_SUBCATEGORIES, RESOURCE_CATEGORIES, type ResourceCategory, type ResourceSubcategory } from "./db.ts"
import { newId, now } from "./utils.ts"

export function defaultSubcategoryId(category: ResourceCategory, index: number): string {
  return `sub-${category}-${index}`;
}

export async function listSubcategories(category: ResourceCategory): Promise<ResourceSubcategory[]> {
  const all = await db.resourceSubcategories.where("category").equals(category).toArray();
  return all.sort((a: ResourceSubcategory, b: ResourceSubcategory) => a.order - b.order);
}

export async function listAllSubcategories(): Promise<ResourceSubcategory[]> {
  const all = await db.resourceSubcategories.toArray();
  return all.sort((a: ResourceSubcategory, b: ResourceSubcategory) => a.order - b.order || a.name.localeCompare(b.name));
}

export async function createSubcategory(
  category: ResourceCategory,
  name: string
): Promise<ResourceSubcategory> {
  const t = now();
  const existing = await listSubcategories(category);
  const row: ResourceSubcategory = {
    id: newId(),
    category,
    name: name.trim(),
    order: existing.length,
    isDefault: false,
    createdAt: t,
    updatedAt: t,
  };
  await db.resourceSubcategories.add(row);
  return row;
}

export async function renameSubcategory(id: string, name: string): Promise<void> {
  await db.resourceSubcategories.update(id, { name: name.trim(), updatedAt: now() });
}

/**
 * Restores a default subcategory to its shipped name. If the row is gone it is
 * recreated; if it was renamed it is renamed back. Custom subcategories have
 * no shipped name, so restoring them is a no-op.
 */
export async function restoreSubcategory(id: string): Promise<void> {
  const row = await db.resourceSubcategories.get(id);
  if (!row) return;
  const names = DEFAULT_SUBCATEGORIES[row.category];
  if (!names[row.order]) return;
  await db.resourceSubcategories.update(id, { name: names[row.order], updatedAt: now() });
}

/** Restores every default subcategory of a category back to its shipped name. */
export async function restoreCategoryDefaults(category: ResourceCategory): Promise<void> {
  const t = now();
  const rows: ResourceSubcategory[] = [];
  DEFAULT_SUBCATEGORIES[category].forEach((name: string, index: number) => {
    rows.push({
      id: defaultSubcategoryId(category, index),
      category,
      name,
      order: index,
      isDefault: true,
      createdAt: t,
      updatedAt: t,
    });
  });
  if (rows.length) await db.resourceSubcategories.bulkPut(rows);
}

export async function deleteSubcategory(id: string): Promise<void> {
  await db.transaction("rw", [db.resourceSubcategories, db.resources], async () => {
    await db.resourceSubcategories.delete(id);
    // Resources survive; they fall back to the uncategorised bucket.
    await db.resources.where("subcategory").equals(id).modify({ subcategory: "" });
  });
}

export function isRenamedFromDefault(row: ResourceSubcategory): boolean {
  return row.isDefault && DEFAULT_SUBCATEGORIES[row.category][row.order] !== row.name;
}

export { RESOURCE_CATEGORIES };
