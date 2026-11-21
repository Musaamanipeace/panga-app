import { describe, expect, it } from "vitest";
import { splitIntoChunks } from "../tts";

describe("splitIntoChunks", () => {
  it("returns nothing for blank text", () => {
    expect(splitIntoChunks("   \n ")).toEqual([]);
  });
  it("keeps short text in one chunk", () => {
    expect(splitIntoChunks("Hello there. How are you?")).toEqual(["Hello there. How are you?"]);
  });
  it("splits long text into chunks no longer than the limit", () => {
    const sentence = "This is a fairly ordinary sentence about nothing in particular.";
    const text = Array(20).fill(sentence).join(" ");
    const chunks = splitIntoChunks(text, 120);
    expect(chunks.length).toBeGreaterThan(5);
    for (const c of chunks) expect(c.length).toBeLessThanOrEqual(120);
    expect(chunks.join(" ").replace(/\s+/g, " ")).toBe(text);
  });
  it("breaks a single endless sentence on words", () => {
    const text = Array(100).fill("word").join(" ");
    const chunks = splitIntoChunks(text, 50);
    for (const c of chunks) expect(c.length).toBeLessThanOrEqual(50);
    expect(chunks.join(" ")).toBe(text);
  });
});
