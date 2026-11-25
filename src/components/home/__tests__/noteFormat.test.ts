import { describe, expect, it } from "vitest";
import { stripMarkdown, toggleLinePrefix, wrapSelection } from "../noteFormat";

describe("note formatting helpers", () => {
  it("wraps a selection in bold markers and unwraps it again", () => {
    const wrapped = wrapSelection("make this bold", 5, 9, "**");
    expect(wrapped.value).toBe("make **this** bold");
    expect(wrapped.value.slice(wrapped.selStart, wrapped.selEnd)).toBe("this");
    const unwrapped = wrapSelection(wrapped.value, wrapped.selStart, wrapped.selEnd, "**");
    expect(unwrapped.value).toBe("make this bold");
  });

  it("inserts a marker pair with the caret between when nothing is selected", () => {
    const r = wrapSelection("abc", 3, 3, "*");
    expect(r.value).toBe("abc**");
    expect(r.selStart).toBe(4);
    expect(r.selEnd).toBe(4);
  });

  it("adds, numbers and removes line prefixes across selected lines", () => {
    const text = "one\ntwo\nthree";
    const bullets = toggleLinePrefix(text, 0, text.length, "bullet");
    expect(bullets.value).toBe("- one\n- two\n- three");
    expect(toggleLinePrefix(bullets.value, 0, bullets.value.length, "bullet").value).toBe(text);

    const numbered = toggleLinePrefix(text, 0, text.length, "numbered");
    expect(numbered.value).toBe("1. one\n2. two\n3. three");

    const checklist = toggleLinePrefix("task", 0, 4, "checklist");
    expect(checklist.value).toBe("- [ ] task");
  });

  it("only touches the lines inside the selection", () => {
    const text = "keep\nchange me\nkeep too";
    const start = text.indexOf("change");
    const r = toggleLinePrefix(text, start, start + 2, "quote");
    expect(r.value).toBe("keep\n> change me\nkeep too");
  });

  it("strips markers for previews and read-aloud", () => {
    expect(stripMarkdown("# Title\n**bold** and *italic*\n- [ ] todo\n1. first\n> quoted")).toBe(
      "Title\nbold and italic\ntodo\nfirst\nquoted"
    );
  });
});
