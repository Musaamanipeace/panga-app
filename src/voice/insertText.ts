export type DictationTarget = HTMLInputElement | HTMLTextAreaElement;

const CLOSING_PUNCT = /^[.,!?;:)\]}%…'"”’]/;
const OPENING_CHAR = /[([{“‘"'\s]$/;

/**
 * Adds just enough spacing around dictated text so it neither glues onto the
 * neighbouring words nor doubles up existing spaces.
 */
export function formatInsertion(before: string, after: string, text: string): string {
  const t = text.trim();
  if (!t) return "";
  const lead = before.length > 0 && !OPENING_CHAR.test(before) && !CLOSING_PUNCT.test(t) ? " " : "";
  const trail = after.length > 0 && !/^\s/.test(after) && !CLOSING_PUNCT.test(after) ? " " : "";
  return lead + t + trail;
}

function setNativeValue(el: DictationTarget, value: string) {
  // Going through the prototype setter (not el.value = ...) keeps React's
  // internal value tracker unaware of the change, so the "input" event we
  // dispatch next is seen as a real edit and fires the field's own onChange.
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  if (setter) setter.call(el, value);
  else el.value = value;
}

/**
 * Inserts dictated text at the caret. It NEVER replaces existing text: if some
 * text is selected, the dictation goes right after the selection and the
 * selection is left behind it. The caret ends up after the inserted text, so
 * consecutive phrases chain naturally.
 *
 * Returns false when nothing was inserted.
 */
export function insertAtCaret(el: DictationTarget, text: string): boolean {
  if (el.disabled || el.readOnly) return false;

  const value = el.value;
  const caret = typeof el.selectionEnd === "number" ? el.selectionEnd : value.length;
  const before = value.slice(0, caret);
  const after = value.slice(caret);

  let insert = formatInsertion(before, after, text);
  if (!insert) return false;

  if (el.maxLength > 0) {
    const room = el.maxLength - value.length;
    if (room <= 0) return false;
    if (insert.length > room) insert = insert.slice(0, room);
  }

  setNativeValue(el, before + insert + after);
  const pos = caret + insert.length;
  try {
    el.setSelectionRange(pos, pos);
  } catch {
    /* some input types do not support selection; value is still updated */
  }
  if (el instanceof HTMLTextAreaElement && pos === el.value.length) {
    el.scrollTop = el.scrollHeight;
  }

  let evt: Event;
  try {
    evt = new InputEvent("input", { bubbles: true, inputType: "insertText", data: insert });
  } catch {
    evt = new Event("input", { bubbles: true });
  }
  el.dispatchEvent(evt);
  return true;
}
