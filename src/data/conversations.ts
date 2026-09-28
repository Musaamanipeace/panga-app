// src/data/conversations.ts
// Assistant history, stored locally and expired on a timer.
import { db, type Conversation, type Message } from "./db.ts"
import { newId, now } from "./utils.ts"

export type { Conversation, Message };

export const DEFAULT_RETENTION_DAYS = 7;

export async function getRetentionDays(): Promise<number> {
  const row = await db.settings.get("assistantRetentionDays");
  const value = (row?.value as number | undefined) ?? DEFAULT_RETENTION_DAYS;
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_RETENTION_DAYS;
}

export async function setRetentionDays(days: number): Promise<void> {
  await db.settings.put({ key: "assistantRetentionDays", value: days });
}

export async function createConversation(title: string): Promise<Conversation> {
  const t = now();
  const days = await getRetentionDays();
  const conversation: Conversation = {
    id: newId(),
    title: title.slice(0, 80) || "New conversation",
    expiresAt: t + days * 24 * 60 * 60 * 1000,
    createdAt: t,
    updatedAt: t,
  };
  await db.conversations.add(conversation);
  return conversation;
}

export async function listConversations(): Promise<Conversation[]> {
  const all = await db.conversations.toArray();
  return all.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getConversation(id: string): Promise<Conversation | undefined> {
  return db.conversations.get(id);
}

export async function renameConversation(id: string, title: string): Promise<void> {
  await db.conversations.update(id, { title: title.slice(0, 80), updatedAt: now() });
}

export async function deleteConversation(id: string): Promise<void> {
  await db.transaction("rw", [db.conversations, db.messages], async () => {
    await db.conversations.delete(id);
    await db.messages.where("conversationId").equals(id).delete();
  });
}

export async function listMessages(conversationId: string): Promise<Message[]> {
  const all = await db.messages.where("conversationId").equals(conversationId).toArray();
  return all.sort((a, b) => a.createdAt - b.createdAt);
}

export async function addMessage(
  conversationId: string,
  role: Message["role"],
  text: string
): Promise<Message> {
  const t = now();
  const message: Message = { id: newId(), conversationId, role, text, createdAt: t };
  await db.transaction("rw", [db.conversations, db.messages], async () => {
    await db.messages.add(message);
    await db.conversations.update(conversationId, { updatedAt: t });
  });
  return message;
}

/** Drops every conversation and message past its expiry. Safe to call often. */
export async function pruneExpiredConversations(): Promise<number> {
  const t = now();
  const expired = await db.conversations.where("expiresAt").belowOrEqual(t).toArray();
  if (!expired.length) return 0;
  await deleteConversations(expired.map((c) => c.id));
  return expired.length;
}

async function deleteConversations(ids: string[]): Promise<void> {
  await db.transaction("rw", [db.conversations, db.messages], async () => {
    for (const id of ids) {
      await db.conversations.delete(id);
      await db.messages.where("conversationId").equals(id).delete();
    }
  });
}
