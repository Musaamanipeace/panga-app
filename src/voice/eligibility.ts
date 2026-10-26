import type { DictationTarget } from "./insertText";

const DICTATABLE_INPUT_TYPES = new Set(["text", "search"]);

// Fields that hold secrets or structured values: never dictate into these.
const SENSITIVE_HINT =
  /pass(word|wd)\b|token|secret|api[-_ ]?key|client[-_ ]?id|\botp\b|one-time|credit[-_ ]?card|\bcvv\b|\biban\b|\bssn\b/i;

/**
 * True when voice dictation should be offered for this element: plain text
 * inputs and textareas only. Opt a field out with data-no-voice (on the field
 * or any ancestor).
 */
export function isDictatable(el: EventTarget | Element | null): el is DictationTarget {
  if (!el) return false;
  const isTextarea = el instanceof HTMLTextAreaElement;
  if (!isTextarea) {
    if (!(el instanceof HTMLInputElement)) return false;
    const type = (el.getAttribute("type") || "text").toLowerCase();
    if (!DICTATABLE_INPUT_TYPES.has(type)) return false;
  }
  const field = el as DictationTarget;
  if (field.disabled || field.readOnly) return false;
  if (field.closest("[data-no-voice]")) return false;
  const hint = [field.name, field.id, field.getAttribute("autocomplete"), field.getAttribute("aria-label"), field.placeholder]
    .filter(Boolean)
    .join(" ");
  return !SENSITIVE_HINT.test(hint);
}
