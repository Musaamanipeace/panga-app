import { describe, expect, it } from "vitest";
import { HOME_TABS, homeTabRoute, matchShortcut, SHORTCUT_ENTRIES } from "../shortcuts";

function ev(overrides: Partial<Parameters<typeof matchShortcut>[0]>) {
  return {
    code: "",
    key: "",
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    target: null,
    ...overrides,
  };
}

describe("shortcuts registry", () => {
  it("matches every home tab by e.code even if Mac Option key alters e.key", () => {
    const macAltChars: Record<string, string> = {
      KeyT: "†",
      KeyL: "¬",
      KeyN: "˜",
      KeyR: "®",
      KeyC: "ç",
      KeyP: "π",
    };

    for (const tab of HOME_TABS) {
      const m = matchShortcut(ev({ altKey: true, code: tab.code, key: macAltChars[tab.code] }));
      expect(m).toEqual({ type: "tab", tabId: tab.id });
    }
    expect(homeTabRoute("Task lists")).toBe("/home");
    expect(homeTabRoute("Proofread")).toBe("/home?tab=Proofread");
  });

  it("matches Ctrl/Cmd+K and Alt+S for search", () => {
    expect(matchShortcut(ev({ ctrlKey: true, code: "KeyK", key: "k" }))).toEqual({ type: "search" });
    expect(matchShortcut(ev({ metaKey: true, code: "KeyK", key: "k" }))).toEqual({ type: "search" });
    expect(matchShortcut(ev({ altKey: true, code: "KeyS", key: "ß" }))).toEqual({ type: "search" });
  });

  it("matches ? for shortcuts only outside editable inputs", () => {
    expect(matchShortcut(ev({ key: "?", shiftKey: true, code: "Slash", target: { tagName: "BODY" } as unknown as EventTarget }))).toEqual({
      type: "shortcuts",
    });
    expect(matchShortcut(ev({ key: "?", shiftKey: true, code: "Slash", target: { tagName: "TEXTAREA" } as unknown as EventTarget }))).toBeNull();
    expect(matchShortcut(ev({ key: "?", shiftKey: true, code: "Slash", target: { tagName: "INPUT" } as unknown as EventTarget }))).toBeNull();
  });

  it("includes Voice dictation and all tabs in SHORTCUT_ENTRIES", () => {
    const keys = SHORTCUT_ENTRIES.map((s) => s.keys);
    expect(keys).toContain("Alt+T");
    expect(keys).toContain("Alt+P");
    expect(keys).toContain("Alt+S");
    expect(keys).toContain("Ctrl/Cmd+K");
    expect(keys).toContain("Alt+Shift+M");
    expect(keys).toContain("?");
  });
});
