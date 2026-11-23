// Highlight text anywhere in the app and a small copy icon appears next to it.
// Copies also land in the Clipboard note category (local only).
import { useEffect, useState } from "react";
import { copyToClipboard } from "./ui";
import { addClip } from "../data/clips";

function readSelection(): { text: string; rect: DOMRect } | null {
  const el = document.activeElement;
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
    if (el instanceof HTMLInputElement && (el.type === "password" || el.type === "file")) return null;
    try {
      const a = el.selectionStart;
      const b = el.selectionEnd;
      if (a !== null && b !== null && a !== b) return { text: el.value.slice(a, b), rect: el.getBoundingClientRect() };
    } catch {
      /* some input types do not expose selection */
    }
  }
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null;
  const rect = sel.getRangeAt(0).getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return null;
  return { text: sel.toString(), rect };
}

export default function SelectionCopy() {
  const [view, setView] = useState<{ x: number; y: number; text: string } | null>(null);

  useEffect(() => {
    let timer: number | undefined;
    const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
    const update = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const s = readSelection();
        if (!s || s.text.trim().length < 2) {
          setView(null);
          return;
        }
        // On touch screens the system menu sits just above the selection, so go higher.
        const above = coarse ? 72 : 40;
        let y = s.rect.top - above;
        if (y < 8) y = Math.min(window.innerHeight - 44, s.rect.bottom + (coarse ? 48 : 10));
        const x = Math.min(Math.max(8, s.rect.right - 16), window.innerWidth - 44);
        setView({ x, y, text: s.text });
      }, 120);
    };
    const hide = () => setView(null);
    // Ctrl+C / long-press Copy inside Panga also lands in the clipboard history.
    const onCopy = () => {
      const s = readSelection();
      if (s) void addClip(s.text);
    };
    document.addEventListener("selectionchange", update);
    document.addEventListener("copy", onCopy);
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("selectionchange", update);
      document.removeEventListener("copy", onCopy);
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
    };
  }, []);

  if (!view) return null;
  return (
    <button
      type="button"
      className="pg-copy-fab"
      style={{ left: view.x, top: view.y }}
      aria-label="Copy selected text"
      title="Copy"
      // Keep the selection alive while the button is pressed.
      onMouseDown={(e) => e.preventDefault()}
      onTouchStart={(e) => e.preventDefault()}
      onClick={async () => {
        await copyToClipboard(view.text);
        void addClip(view.text);
        setView(null);
      }}
    >
      Copy
    </button>
  );
}
