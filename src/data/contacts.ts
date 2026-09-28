// src/data/contacts.ts
// Contacts are Resources with category: "contacts".
import { db, type Resource, type ContactType } from "./db.ts"
import { listResourcesByCategory } from "./resources.ts"
import { newId, now } from "./utils.ts"

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  email: "Email",
  phone: "Phone",
  social: "Social",
};

export type Contact = Resource;

export async function listAllContacts(): Promise<Contact[]> {
  return listResourcesByCategory("", "contacts");
}

export async function listContactsForProject(projectId: string): Promise<Contact[]> {
  const all = await listResourcesByCategory(projectId, "contacts");
  return all.sort((a, b) => a.title.localeCompare(b.title));
}

export async function getContact(id: string): Promise<Contact | undefined> {
  return db.resources.get(id);
}

export interface CreateContactInput {
  projectId?: string | null;
  name: string;
  type: ContactType;
  value: string;
  tags?: string[];
  linkedProjectIds?: string[];
}

export async function createContact(input: CreateContactInput): Promise<Contact> {
  const t = now();
  const projectId = input.linkedProjectIds?.[0] ?? input.projectId ?? null;
  const contact: Contact = {
    id: newId(),
    projectId: projectId ?? "",
    category: "contacts",
    title: input.name.trim(),
    tags: input.tags ?? [],
    url: null,
    provider: null,
    contactType: input.type,
    value: input.value.trim(),
    body: null,
    images: [],
    files: [],
    subcategory: null,
    meta: { linkedProjectIds: input.linkedProjectIds ?? [] },
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.resources.add(contact);
  return contact;
}

export async function updateContact(
  id: string,
  changes: Partial<Pick<Contact, "title" | "contactType" | "value" | "tags" | "projectId">>
): Promise<void> {
  await db.resources.update(id, { ...changes, updatedAt: now(), syncStatus: "pending" });
}

export async function toggleContactProject(id: string, projectId: string): Promise<void> {
  const contact = await db.resources.get(id);
  if (!contact || contact.category !== "contacts") return;
  const ids: string[] = (contact.meta?.linkedProjectIds as string[] | undefined) ?? [];
  const linked = ids.includes(projectId)
    ? ids.filter((p) => p !== projectId)
    : [...ids, projectId];
  await db.resources.update(id, { meta: { ...contact.meta, linkedProjectIds: linked }, updatedAt: now(), syncStatus: "pending" });
}

export async function deleteContact(id: string): Promise<void> {
  await db.resources.delete(id);
}

export function contactHref(contact: Contact): string | null {
  if (contact.contactType === "email") return `mailto:${contact.value ?? ""}`;
  if (contact.contactType === "social") return contact.value ?? null;
  return null;
}

export function linkedProjectIds(contact: Contact): string[] {
  return (contact.meta?.linkedProjectIds as string[] | undefined) ?? [];
}
