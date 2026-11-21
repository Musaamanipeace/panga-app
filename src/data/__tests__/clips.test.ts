import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { addClip, clearClips, clipTitle, listClips } from "../clips";

describe("clipboard history", () => {
  beforeEach(async () => {
    await clearClips();
  });
  it("saves text, skips empty text and skips an immediate duplicate", async () => {
    expect(await addClip("   ")).toBe("empty");
    expect(await addClip("hello world")).toBe("saved");
    expect(await addClip("hello world")).toBe("duplicate");
    expect(await addClip("second")).toBe("saved");
    const clips = await listClips();
    expect(clips.map((c) => c.body)).toEqual(["second", "hello world"]);
    expect(clips.every((c) => c.category === "clipboard")).toBe(true);
  });
  it("makes short titles from the first line", () => {
    expect(clipTitle("line one\nline two")).toBe("line one");
    expect(clipTitle("x".repeat(100)).length).toBe(58);
  });
});
