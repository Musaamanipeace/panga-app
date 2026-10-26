// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { formatInsertion, insertAtCaret } from "../insertText";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function input(value: string, start: number, end = start) {
  const el = document.createElement("input");
  document.body.appendChild(el);
  el.value = value;
  el.setSelectionRange(start, end);
  return el;
}

describe("formatInsertion", () => {
  it("adds a leading space after a word and a trailing space before a word", () => {
    expect(formatInsertion("Buy", "milk", "fresh")).toBe(" fresh ");
  });
  it("does not double existing whitespace", () => {
    expect(formatInsertion("Buy ", " milk", "fresh")).toBe("fresh");
  });
  it("does not add a space before closing punctuation", () => {
    expect(formatInsertion("Hello", "", ".")).toBe(".");
    expect(formatInsertion("Hello", "", "world")).toBe(" world");
  });
  it("returns empty for blank dictation", () => {
    expect(formatInsertion("a", "b", "   ")).toBe("");
  });
});

describe("insertAtCaret", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("inserts at the caret in the middle of existing text without losing any", () => {
    const el = input("Call about the invoice", 4); // after "Call"
    insertAtCaret(el, "Sam");
    expect(el.value).toBe("Call Sam about the invoice");
    expect(el.selectionStart).toBe("Call Sam".length); // caret sits right after the inserted text
  });

  it("appends at the end", () => {
    const el = input("Buy milk", 8);
    insertAtCaret(el, "and eggs");
    expect(el.value).toBe("Buy milk and eggs");
  });

  it("works on an empty field", () => {
    const el = input("", 0);
    insertAtCaret(el, "Hello there");
    expect(el.value).toBe("Hello there");
  });

  it("never replaces a selection: dictation goes after it", () => {
    const el = input("Buy milk today", 4, 8); // "milk" selected
    insertAtCaret(el, "and eggs");
    expect(el.value).toBe("Buy milk and eggs today");
  });

  it("chains consecutive phrases at the moving caret", () => {
    const el = input("Notes: ", 7);
    insertAtCaret(el, "first point");
    insertAtCaret(el, "second point");
    expect(el.value).toBe("Notes: first point second point");
  });

  it("works in a textarea with newlines", () => {
    const ta = document.createElement("textarea");
    document.body.appendChild(ta);
    ta.value = "line one\nline three";
    ta.setSelectionRange(8, 8); // end of line one
    insertAtCaret(ta, "and a half");
    expect(ta.value).toBe("line one and a half\nline three");
  });

  it("respects maxLength", () => {
    const el = input("abc", 3);
    el.maxLength = 8;
    insertAtCaret(el, "defghijkl");
    expect(el.value.length).toBe(8);
    expect(el.value.startsWith("abc")).toBe(true);
  });

  it("refuses read-only fields", () => {
    const el = input("keep", 4);
    el.readOnly = true;
    expect(insertAtCaret(el, "nope")).toBe(false);
    expect(el.value).toBe("keep");
  });
});

describe("with a React controlled input", () => {
  let root: Root | null = null;
  afterEach(() => {
    act(() => root?.unmount());
    root = null;
    document.body.innerHTML = "";
  });

  it("updates React state through the field's own onChange, mid-text, without overwriting", () => {
    let latest = "";
    function Field() {
      const [v, setV] = useState("Meeting with Joy at noon");
      latest = v;
      return <input value={v} onChange={(e) => setV(e.target.value)} />;
    }
    const host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);
    act(() => root!.render(<Field />));

    const el = host.querySelector("input")!;
    el.setSelectionRange(12, 12); // after "Meeting with"
    act(() => {
      insertAtCaret(el, "Mr");
    });
    expect(latest).toBe("Meeting with Mr Joy at noon");
    expect(el.value).toBe(latest);

    // A second phrase continues right after the first.
    act(() => {
      insertAtCaret(el, "Otieno");
    });
    expect(latest).toBe("Meeting with Mr Otieno Joy at noon");
  });

  it("two fields stay independent (text can never land in the wrong field)", () => {
    let a = "";
    let b = "";
    function Form() {
      const [x, setX] = useState("title");
      const [y, setY] = useState("body text");
      a = x;
      b = y;
      return (
        <>
          <input id="a" value={x} onChange={(e) => setX(e.target.value)} />
          <textarea id="b" value={y} onChange={(e) => setY(e.target.value)} />
        </>
      );
    }
    const host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);
    act(() => root!.render(<Form />));

    const ta = host.querySelector("textarea")!;
    ta.setSelectionRange(4, 4);
    act(() => {
      insertAtCaret(ta, "more");
    });
    expect(a).toBe("title");
    expect(b).toBe("body more text");
  });
});
