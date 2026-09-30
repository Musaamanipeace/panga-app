// src/components/Stash.tsx
// Global drag-and-drop storage box — a floating panel for temporarily holding snippets, links, files, or text.
import { useEffect, useState, useRef } from "react";
import { useToasts } from "./ui";

export interface StashItem {
  id: string;
  type: "text" | "link" | "file";
  content: string;
  label: string;
  createdAt: number;
}

const STORAGE_KEY = "panga-stash";

export function loadStash(): StashItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StashItem[];
  } catch {}
  return [];
}

export function saveStash(items: StashItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function useStash() {
  const [items, setItems] = useState<StashItem[]>([]);
  const { showToast } = useToasts();

  useEffect(() => {
    setItems(loadStash());
  }, []);

  useEffect(() => {
    saveStash(items);
  }, [items]);

  function addItem(item: Omit<StashItem, "id" | "createdAt">): void {
    const newItem: StashItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setItems((prev) => [...prev, newItem]);
    showToast({ type: "success", message: `Added to Stash: ${item.label}` });
  }

  function removeItem(id: string): void {
    setItems((prev) => prev.filter((i) => i !== id));
    showToast({ type: "info", message: "Removed from Stash" });
  }

  function clearStash(): void {
    setItems([]);
    showToast({ type: "info", message: "Stash cleared" });
  }

  function copyItem(id: string): void {
    const item = items.find((i) => i.id === id);
    if (item) {
      navigator.clipboard.writeText(item.content);
      showToast({ type: "success", message: "Copied to clipboard" });
    }
  }

  return { items, addItem, removeItem, clearStash, copyItem, setItems };
}

export function StashDropZone({ onStash }: { onStash: (content: string) => void }) {
  const { showToast } = useToasts();

  return (
    <div
      className="stash-drop-zone"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const text = e.dataTransfer.getData("text/plain");
        if (text) {
          onStash(text);
        } else {
          showToast({ type: "error", message: "Drop content not recognized" });
        }
      }}
      data-tip="Drag any text or link here to stash it"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="16" y2="17" />
      </svg>
      Stash
    </div>
  );
}

export default function StashPanel() {
  const { items, removeItem, clearStash, copyItem, setItems } = useStash();
  const [expanded, setExpanded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const text = e.dataTransfer.getData("text/plain");
    if (text) {
      setItems((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: text.startsWith("http") ? "link" : "text",
          content: text,
          label: text.length > 40 ? text.slice(0, 40) + "..." : text,
          createdAt: Date.now(),
        },
      ]);
    }
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) && expanded) {
        setExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [expanded]);

  return (
    <div
      ref={panelRef}
      className={`stash-panel ${expanded ? "stash-expanded" : "stash-collapsed"}`}
      data-tip="Global storage box for snippets and links"
    >
      <button
        type="button"
        className="stash-toggle"
        onClick={() => setExpanded(!expanded)}
        aria-label={expanded ? "Collapse stash" : "Expand stash"}
      >
        {expanded ? "▲ Stash" : "▼ Stash"}
      </button>

      {expanded && (
        <div className="stash-content">
          <div
            className="stash-drop-target"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            data-tip="Drop text or links here"
          >
            Drop text or links here
          </div>

          {items.length === 0 ? (
            <p className="stash-empty">Stash is empty</p>
          ) : (
            <ul className="stash-list">
              {items.map((item) => (
                <li key={item.id} className="stash-item">
                  <div className="stash-item-content">
                    <span className={`stash-item-type stash-type-${item.type}`}>{item.type}</span>
                    <span className="stash-item-label" title={item.content}>
                      {item.label}
                    </span>
                  </div>
                  <div className="stash-item-actions">
                    <button
                      type="button"
                      className="btn-icon btn-small"
                      onClick={() => copyItem(item.id)}
                      data-tip="Copy content"
                      aria-label="Copy"
                    >
                      📋
                    </button>
                    <button
                      type="button"
                      className="btn-icon btn-small"
                      onClick={() => removeItem(item.id)}
                      data-tip="Remove"
                      aria-label="Remove"
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {items.length > 0 && (
            <button
              type="button"
              className="btn-secondary btn-small stash-clear"
              onClick={clearStash}
            >
              Clear All
            </button>
          )}
        </div>
      )}
    </div>
  );
}
