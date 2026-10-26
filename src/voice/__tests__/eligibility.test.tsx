// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { isDictatable } from "../eligibility";

function make(html: string): HTMLElement {
  document.body.innerHTML = html;
  return document.body.firstElementChild as HTMLElement;
}
afterEach(() => {
  document.body.innerHTML = "";
});

describe("isDictatable", () => {
  it("accepts text inputs, search inputs and textareas", () => {
    expect(isDictatable(make('<input type="text">'))).toBe(true);
    expect(isDictatable(make("<input>"))).toBe(true);
    expect(isDictatable(make('<input type="search">'))).toBe(true);
    expect(isDictatable(make("<textarea></textarea>"))).toBe(true);
  });
  it("rejects structured and secret fields", () => {
    for (const t of ["password", "email", "number", "date", "file", "checkbox", "url", "tel"]) {
      expect(isDictatable(make(`<input type="${t}">`))).toBe(false);
    }
    expect(isDictatable(make('<input type="text" placeholder="Gemini API key">'))).toBe(false);
    expect(isDictatable(make('<input type="text" name="clientId">'))).toBe(false);
    expect(isDictatable(make('<input type="text" placeholder="Personal access token">'))).toBe(false);
  });
  it("rejects disabled, read-only and opted-out fields", () => {
    expect(isDictatable(make("<input disabled>"))).toBe(false);
    expect(isDictatable(make("<input readonly>"))).toBe(false);
    expect(isDictatable(make("<input data-no-voice>"))).toBe(false);
    document.body.innerHTML = '<section data-no-voice><input id="x"></section>';
    expect(isDictatable(document.getElementById("x"))).toBe(false);
  });
  it("rejects non-fields", () => {
    expect(isDictatable(make("<div contenteditable></div>"))).toBe(false);
    expect(isDictatable(null)).toBe(false);
  });
});
