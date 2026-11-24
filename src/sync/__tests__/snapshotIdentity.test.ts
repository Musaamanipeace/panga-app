import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "../../data/db";
import { getSessionUserId, getSessionUsername, isGuest, resetGuestSession, setSession } from "../../auth/session";
import { getAIApiKey, getAIProvider, setAIApiKey, setAIProvider, setSetting } from "../../data/settings";
import {
  exportSnapshot,
  getJsonAccountUsername,
  importSnapshot,
  setJsonAccountUsername,
  type Snapshot,
} from "../snapshot";

function noteSnapshot(id: string, loggedIn: boolean, userId: string, username = "person"): Snapshot {
  return {
    metadata: { version: "1.0", exportedAt: new Date().toISOString(), appName: "Panga", dbVersion: 13 },
    identity: {
      userId,
      username,
      email: `${username}@local`,
      loggedIn,
    },
    data: {
      notes: [
        {
          id,
          folderId: null,
          title: "Restored note",
          body: "Body",
          tags: [],
          createdAt: 1,
          updatedAt: 1,
          syncStatus: "pending",
        },
      ],
      settings: [],
    },
  };
}

beforeEach(async () => {
  localStorage.clear();
  await resetGuestSession();
});

describe("snapshot identity", () => {
  it("exports and restores the JSON account username and all provider API keys", async () => {
    await setJsonAccountUsername("amani");
    await setAIProvider("groq");
    await setAIApiKey("gemini", "gem-key-1");
    await setAIApiKey("openrouter", "or-key-2");
    await setAIApiKey("groq", "groq-key-3");
    await setSetting("geminiApiKey", "gem-key-1");
    const snapshot = await exportSnapshot();

    expect(snapshot.identity?.loggedIn).toBe(false);
    expect(snapshot.identity?.username).toBe("amani");
    expect(snapshot.data.settings.find((r: any) => r.key === "aiApiKey_gemini")?.value).toBe("gem-key-1");
    expect(snapshot.data.settings.find((r: any) => r.key === "aiApiKey_openrouter")?.value).toBe("or-key-2");
    expect(snapshot.data.settings.find((r: any) => r.key === "aiApiKey_groq")?.value).toBe("groq-key-3");
    expect(snapshot.data.settings.find((r: any) => r.key === "aiProvider")?.value).toBe("groq");

    // Clear DB and restore from JSON snapshot
    await db.settings.clear();
    await importSnapshot(JSON.parse(JSON.stringify(snapshot)));
    expect(await getAIProvider()).toBe("groq");
    expect(await getAIApiKey("gemini")).toBe("gem-key-1");
    expect(await getAIApiKey("openrouter")).toBe("or-key-2");
    expect(await getAIApiKey("groq")).toBe("groq-key-3");
  });

  it("restores a named JSON account identity and username before loading its data", async () => {
    await importSnapshot(noteSnapshot("signed-note", true, "usr_person_1", "amani"));

    expect(isGuest()).toBe(false);
    expect(getSessionUserId()).toBe("usr_person_1");
    expect(getSessionUsername()).toBe("amani");
    expect(await getJsonAccountUsername()).toBe("amani");
    expect(await db.notes.get("signed-note")).toBeDefined();
  });

  it("restores a guest snapshot and preserves its JSON username", async () => {
    await importSnapshot(noteSnapshot("guest-note", false, "usr_someone_else", "mira"));

    expect(isGuest()).toBe(true);
    expect(getSessionUserId()?.startsWith("guest_")).toBe(true);
    expect(await getJsonAccountUsername()).toBe("mira");
    expect(await db.notes.get("guest-note")).toBeDefined();
  });

  it("isolates data between two local account stores", async () => {
    await setSession("usr_a", "a@local");
    await db.notes.put({
      id: "note-a",
      folderId: null,
      title: "A",
      body: "",
      tags: [],
      createdAt: 1,
      updatedAt: 1,
      syncStatus: "pending",
    });

    await setSession("usr_b", "b@local");
    expect(await db.notes.get("note-a")).toBeUndefined();
  });
});
