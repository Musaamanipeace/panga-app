// Lightweight text formatting for notes. Notes stay plain text; the toolbar inserts
// markdown-style markers so search, copy and read-aloud keep working unchanged.

export interface EditResult {
  value: string;
  selStart: number;
  selEnd: number;
}

/** Wrap the selection in a marker (e.g. ** for bold); unwraps if it is already wrapped. */
export function wrapSelection(value: string, start: number, end: number, marker: string): EditResult {
  const m = marker.length;
  const before = value.slice(Math.max(0, start - m), start);
  const after = value.slice(end, end + m);
  if (start !== end && before === marker && after === marker) {
    const next = value.slice(0, start - m) + value.slice(start, end) + value.slice(end + m);
    return { value: next, selStart: start - m, selEnd: end - m };
  }
  const selected = value.slice(start, end);
  const next = value.slice(0, start) + marker + selected + marker + value.slice(end);
  return { value: next, selStart: start + m, selEnd: end + m };
}

export type LineFormat = "heading" | "bullet" | "numbered" | "checklist" | "quote";

const LINE_PATTERNS: Record<LineFormat, RegExp> = {
  heading: /^#{1,3} /,
  bullet: /^- (?!\[[ x]\] )/,
  numbered: /^\d+\. /,
  checklist: /^- \[[ x]\] /,
  quote: /^> /,
};

function prefixFor(kind: LineFormat, index: number): string {
  switch (kind) {
    case "heading":
      return "# ";
    case "bullet":
      return "- ";
    case "numbered":
      return `${index + 1}. `;
    case "checklist":
      return "- [ ] ";
    case "quote":
      return "> ";
  }
}

/** Add (or, when every selected line already has it, remove) a line prefix across the selected lines. */
export function toggleLinePrefix(value: string, start: number, end: number, kind: LineFormat): EditResult {
  const lineStart = value.lastIndexOf("\n", Math.max(0, start) - 1) + 1;
  const nl = value.indexOf("\n", end);
  const lineEnd = nl === -1 ? value.length : nl;
  const lines = value.slice(lineStart, lineEnd).split("\n");
  const pattern = LINE_PATTERNS[kind];
  const content = lines.filter((l) => l.trim().length > 0);
  const allHave = content.length > 0 && content.every((l) => pattern.test(l));
  let n = 0;
  const next = lines.map((line) => {
    if (allHave) return line.replace(pattern, "");
    if (!line.trim()) return line;
    const out = prefixFor(kind, n) + line.replace(pattern, "");
    n++;
    return out;
  });
  const joined = next.join("\n");
  return {
    value: value.slice(0, lineStart) + joined + value.slice(lineEnd),
    selStart: lineStart,
    selEnd: lineStart + joined.length,
  };
}

/** Plain text for previews and read-aloud: formatting markers removed. */
export function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^- \[[ x]\]\s+/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/gs, "$1")
    .replace(/\*(.+?)\*/gs, "$1");
}
