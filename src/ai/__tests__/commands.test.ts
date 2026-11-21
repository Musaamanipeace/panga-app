import { describe, expect, it } from "vitest";
import { parseCommands, parseWhen } from "../commands";

describe("parseCommands", () => {
  it("extracts ACTION lines and keeps the message", () => {
    const reply = `Done, adding two things.
ACTION:{"type":"create_task","description":"Add 'Call Sam'","data":{"title":"Call Sam"}}
ACTION:{"type":"delete_task","description":"Delete 'x'","data":{"id":"abc"}}`;
    const out = parseCommands(reply);
    expect(out.message).toBe("Done, adding two things.");
    expect(out.actions.map((a) => a.type)).toEqual(["create_task", "delete_task"]);
  });
  it("drops unknown types and malformed JSON", () => {
    const reply = `ok
ACTION:{"type":"format_disk","description":"no","data":{}}
ACTION:{not json}
ACTION:{"type":"complete_task","description":"tick","data":{"id":"1"}}`;
    expect(parseCommands(reply).actions).toHaveLength(1);
  });
  it("returns no actions for a plain question", () => {
    expect(parseCommands("Which task do you mean?").actions).toEqual([]);
  });
});

describe("parseWhen", () => {
  it("parses ISO dates at 09:00 local", () => {
    const t = parseWhen("2026-11-22");
    expect(t).not.toBeNull();
    expect(new Date(t as number).getHours()).toBe(9);
  });
  it("passes epoch milliseconds through and rejects junk", () => {
    expect(parseWhen(1_800_000_000_000)).toBe(1_800_000_000_000);
    expect(parseWhen("not a date")).toBeNull();
    expect(parseWhen(null)).toBeNull();
  });
});
