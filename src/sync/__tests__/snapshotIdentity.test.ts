import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "../../data/db";
import { getSessionUserId, isGuest, resetGuestSession, setSession } from "../../auth/session";
import { setSetting } from "../../data/settings";
import { exportSnapshot, importSnapshot, type Snapshot } from "../snapshot";

function noteSnapshot(id: string, loggedIn: boolean, userId: string): Snapshot {
  return {
    metadata: { version: "1.0", exportedAt: new Date().toISOString(), appName: "Panga", dbVersion: 13 },
    identity: {
      userId,
      username: "person",
      email: "person@panga.invalid",
      loggedIn,
      supabase: null,
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
  it("exports the current identity and keeps credentials in the file", async () => {
    await setSetting("geminiApiKey", "a-test-key");
    const snapshot = await exportSnapshot();

    expect(snapshot.identity?.loggedIn).toBe(false);
    expect(snapshot.identity?.email).toBe("guest@local");
    const storedKey = snapshot.data.settings.find((r: any) => r.key === "geminiApiKey");
    expect(storedKey?.value).toBe("a-test-key");
  });

  it("restores a signed-in identity before loading its data", async () => {
    await importSnapshot(noteSnapshot("signed-note", true, "usr_person_1"));

    expect(isGuest()).toBe(false);
    expect(getSessionUserId()).toBe("usr_person_1");
    expect(await db.notes.get("signed-note")).toBeDefined();
  });

  it("restores a guest snapshot into a fresh guest store", async () => {
    await importSnapshot(noteSnapshot("guest-note", false, "usr_someone_else"));

    expect(isGuest()).toBe(true);
    expect(getSessionUserId()?.startsWith("guest_")).toBe(true);
    expect(await db.notes.get("guest-note")).toBeDefined();
  });

  it("isolates data between two signed-in accounts", async () => {
    await setSession("usr_a", "a@panga.invalid");
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

    await setSession("usr_b", "b@panga.invalid");
    expect(await db.notes.get("note-a")).toBeUndefined();
  });
});
