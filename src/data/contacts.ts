import { db, type Contact } from "./db";
import { newId, now } from "./utils";

export type CreateContactInput = {
  name: string;
  email?: string | null;
  phone?: string | null;
  discord?: string | null;
  linkedProjectIds?: string[];
};

export type UpdateContactInput = Partial<
  Omit<Contact, "id" | "createdAt">
>;

export async function createContact(input: CreateContactInput): Promise<Contact> {
  const timestamp = now();
  const contact: Contact = {
    id: newId(),
    name: input.name.trim(),
    email: input.email?.trim() || null,
    phone: input.phone?.trim() || null,
    discord: input.discord?.trim() || null,
    linkedProjectIds: [...(input.linkedProjectIds ?? [])],
    createdAt: timestamp,
    updatedAt: timestamp,
    syncStatus: "pending",
  };

  await db.contacts.add(contact);
  return contact;
}

export async function listContacts(): Promise<Contact[]> {
  return db.contacts.orderBy("name").toArray();
}

export async function getContact(contactId: string): Promise<Contact | undefined> {
  return db.contacts.get(contactId);
}

export async function updateContact(
  contactId: string,
  input: UpdateContactInput,
): Promise<void> {
  await db.contacts.update(contactId, {
    ...input,
    name: input.name?.trim(),
    email: input.email?.trim() || null,
    phone: input.phone?.trim() || null,
    discord: input.discord?.trim() || null,
    linkedProjectIds: input.linkedProjectIds
      ? [...input.linkedProjectIds]
      : undefined,
    updatedAt: now(),
    syncStatus: "pending",
  });
}

export async function deleteContact(contactId: string): Promise<void> {
  await db.contacts.delete(contactId);
}
