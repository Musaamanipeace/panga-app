// src/data/contacts.ts
import { db, type Contact, type ContactType } from "./db";
import { newId, now } from "./utils";
import { syncPushRecord, syncDeleteRecord } from "../sync/supabaseSync";

export type { Contact, ContactType };

export async function listContacts(projectId?: string | null): Promise<Contact[]> {
  const all = await db.contacts.toArray();
  if (!projectId) return all.sort((a, b) => b.updatedAt - a.updatedAt);
  return all.filter((c) => c.linkedProjectIds.includes(projectId)).sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function listAllContacts(): Promise<Contact[]> {
  return db.contacts.orderBy("updatedAt").reverse().toArray();
}

export async function createContact(input: {
  name: string;
  type: ContactType;
  value: string;
  tags?: string[];
  linkedProjectIds?: string[];
}): Promise<Contact> {
  const t = now();
  const contact: Contact = {
    id: newId(),
    name: input.name,
    type: input.type,
    value: input.value,
    tags: input.tags ?? [],
    linkedProjectIds: input.linkedProjectIds ?? [],
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.contacts.add(contact);
  void syncPushRecord("contacts", contact);
  return contact;
}

export async function updateContact(
  id: string,
  changes: Partial<Pick<Contact, "name" | "type" | "value" | "tags" | "linkedProjectIds">>
): Promise<void> {
  await db.contacts.update(id, { ...changes, updatedAt: now(), syncStatus: "pending" });
  const updated = await db.contacts.get(id);
  if (updated) void syncPushRecord("contacts", updated);
}

export async function deleteContact(id: string): Promise<void> {
  await db.contacts.delete(id);
  void syncDeleteRecord("contacts", id);
}

export async function deleteContactsForProject(projectId: string): Promise<void> {
  const contacts = await db.contacts.where("linkedProjectIds").equals(projectId).toArray();
  for (const c of contacts) {
    await db.contacts.delete(c.id);
    void syncDeleteRecord("contacts", c.id);
  }
}

export async function toggleContactProject(contactId: string, projectId: string): Promise<void> {
  const contact = await db.contacts.get(contactId);
  if (!contact) return;
  const linked = contact.linkedProjectIds.includes(projectId);
  const newLinked = linked
    ? contact.linkedProjectIds.filter((id) => id !== projectId)
    : [...contact.linkedProjectIds, projectId];
  await updateContact(contactId, { linkedProjectIds: newLinked });
}

export function linkedProjectIds(contact: Contact): string[] {
  return contact.linkedProjectIds ?? [];
}

export function contactHref(contact: Contact): string | null {
  switch (contact.type) {
    case "email":
      return `mailto:${contact.value}`;
    case "phone":
      return `tel:${contact.value}`;
    case "link":
      return contact.value;
    default:
      return null;
  }
}

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  email: "Email",
  phone: "Phone",
  link: "Link",
};
