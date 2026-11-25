import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addShortcut,
  addUrlShortcut,
  listAvailableShortcutTargets,
  listShortcuts,
  removeShortcut,
  type QuickShortcut,
  type ShortcutTargetKind,
  type ShortcutTargetOption,
} from "../../data/shortcuts";
import { showToast } from "../ui";

const KIND_ICON: Record<ShortcutTargetKind, string> = {
  url: "🔗",
  link: "🔗",
  taskList: "☑️",
  taskListFolder: "📁",
  noteFolder: "📁",
  linkFolder: "📁",
  reminderFolder: "📁",
  note: "📝",
  reminder: "⏰",
  tab: "🧭",
};

const KIND_FILTERS: Array<{ id: string; label: string }> = [
  { id: "all", label: "All" },
  { id: "taskLists", label: "Task lists" },
  { id: "notes", label: "Notes" },
  { id: "links", label: "Links" },
  { id: "folders", label: "Folders" },
  { id: "reminders", label: "Reminders" },
  { id: "tabs", label: "Sections" },
];

function matchesFilter(kind: ShortcutTargetKind, filter: string): boolean {
  switch (filter) {
    case "taskLists":
      return kind === "taskList" || kind === "taskListFolder";
    case "notes":
      return kind === "note" || kind === "noteFolder";
    case "links":
      return kind === "link" || kind === "linkFolder";
    case "folders":
      return (
        kind === "taskListFolder" ||
        kind === "noteFolder" ||
        kind === "linkFolder" ||
        kind === "reminderFolder"
      );
    case "reminders":
      return kind === "reminder" || kind === "reminderFolder";
    case "tabs":
      return kind === "tab";
    default:
      return true;
  }
}

export default function ShortcutsBar() {
  const navigate = useNavigate();
  const [shortcuts, setShortcuts] = useState<QuickShortcut[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [targets, setTargets] = useState<ShortcutTargetOption[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [pasteBoxOpen, setPasteBoxOpen] = useState(false);
  const [pasteValue, setPasteValue] = useState("");
  const [pasteError, setPasteError] = useState<string | null>(null);
  const pasteInputRef = useRef<HTMLInputElement>(null);

  const reloadShortcuts = useCallback(async () => {
    const items = await listShortcuts();
    setShortcuts(items);
  }, []);

  const reloadTargets = useCallback(async () => {
    const opts = await listAvailableShortcutTargets();
    setTargets(opts);
  }, []);

  useEffect(() => {
    void reloadShortcuts();
    const onShortcuts = () => void reloadShortcuts();
    const onWorkspace = () => {
      void reloadShortcuts();
      if (pickerOpen) void reloadTargets();
    };
    window.addEventListener("panga-shortcuts-updated", onShortcuts);
    window.addEventListener("panga-data-updated", onWorkspace);
    return () => {
      window.removeEventListener("panga-shortcuts-updated", onShortcuts);
      window.removeEventListener("panga-data-updated", onWorkspace);
    };
  }, [pickerOpen, reloadShortcuts, reloadTargets]);

  useEffect(() => {
    if (pickerOpen) {
      void reloadTargets();
    }
  }, [pickerOpen, reloadTargets]);

  useEffect(() => {
    if (pasteBoxOpen) {
      setTimeout(() => pasteInputRef.current?.focus(), 0);
    }
  }, [pasteBoxOpen]);

  async function tryAddPastedUrl(raw: string): Promise<boolean> {
    const res = await addUrlShortcut(raw);
    if (!res) return false;
    await reloadShortcuts();
    setPasteBoxOpen(false);
    setPasteValue("");
    setPasteError(null);
    if (res.duplicate) {
      showToast(`Quick link already pinned: ${res.shortcut.name}`, "info");
    } else {
      showToast(`Added quick link: ${res.shortcut.name}`, "success");
    }
    return true;
  }

  async function handlePasteLinkClick() {
    setPasteError(null);
    try {
      if (navigator.clipboard?.readText) {
        const clipText = await navigator.clipboard.readText();
        if (clipText && clipText.trim()) {
          const added = await tryAddPastedUrl(clipText);
          if (added) return;
          setPasteValue(clipText.trim());
          setPasteError("Clipboard text is not a valid link. Edit or paste a URL below.");
          setPasteBoxOpen(true);
          return;
        }
      }
    } catch {
      // Clipboard read blocked by browser permissions — fall back to inline paste input.
    }
    setPasteBoxOpen(true);
  }

  async function handleManualPasteSubmit(e: React.FormEvent) {
    e.preventDefault();
    const added = await tryAddPastedUrl(pasteValue);
    if (!added) {
      setPasteError("Enter or paste a valid link (e.g. https://example.com).");
    }
  }

  async function handleAddTarget(option: ShortcutTargetOption) {
    const res = await addShortcut({
      kind: option.kind,
      name: option.name,
      targetId: option.targetId,
      route: option.route,
      url: option.url,
    });
    await reloadShortcuts();
    setPickerOpen(false);
    setSearch("");
    if (res.duplicate) {
      showToast(`Quick link already pinned: ${res.shortcut.name}`, "info");
    } else {
      showToast(`Added quick link: ${res.shortcut.name}`, "success");
    }
  }

  async function handleRemove(id: string) {
    await removeShortcut(id);
    await reloadShortcuts();
  }

  const existingKeys = useMemo(() => {
    const set = new Set<string>();
    for (const s of shortcuts) {
      if (s.targetId) set.add(`${s.kind}:${s.targetId}`);
      else if (s.url) set.add(`url:${s.url}`);
    }
    return set;
  }, [shortcuts]);

  const filteredTargets = useMemo(() => {
    const q = search.trim().toLowerCase();
    return targets.filter((t) => {
      if (!matchesFilter(t.kind, filter)) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.categoryLabel.toLowerCase().includes(q) ||
        t.subtitle.toLowerCase().includes(q)
      );
    });
  }, [targets, filter, search]);

  return (
    <section className="pg-card shortcuts-card" aria-label="Quick links">
      <div className="shortcuts-head">
        <span className="shortcuts-title">Quick links</span>
        <div className="shortcuts-actions">
          <button
            type="button"
            className="btn-secondary btn-small clickable"
            onClick={() => void handlePasteLinkClick()}
            title="Paste a link from clipboard as a quick link"
          >
            Paste link
          </button>
          <button
            type="button"
            className="btn-secondary btn-small clickable"
            aria-expanded={pickerOpen}
            onClick={() => {
              setPickerOpen((o) => !o);
              setPasteBoxOpen(false);
            }}
          >
            + Add
          </button>
        </div>
      </div>

      {pasteBoxOpen && (
        <form className="shortcuts-paste-row" onSubmit={(e) => void handleManualPasteSubmit(e)}>
          <input
            ref={pasteInputRef}
            type="text"
            inputMode="url"
            value={pasteValue}
            onChange={(e) => {
              setPasteValue(e.target.value);
              if (pasteError) setPasteError(null);
            }}
            onPaste={(e) => {
              const pasted = e.clipboardData?.getData("text") ?? "";
              if (pasted.trim()) {
                e.preventDefault();
                setPasteValue(pasted);
                void tryAddPastedUrl(pasted).then((ok) => {
                  if (!ok) setPasteError("Pasted text is not a valid link.");
                });
              }
            }}
            placeholder="Paste a link here (https://…)"
            aria-label="Paste quick link"
          />
          <button type="submit" className="btn-primary btn-small clickable" disabled={!pasteValue.trim()}>
            Add
          </button>
          <button
            type="button"
            className="btn-secondary btn-small clickable"
            onClick={() => {
              setPasteBoxOpen(false);
              setPasteValue("");
              setPasteError(null);
            }}
          >
            Cancel
          </button>
        </form>
      )}
      {pasteError && <p className="pg-error" style={{ margin: "0 0 8px" }}>{pasteError}</p>}

      {pickerOpen && (
        <div className="shortcuts-picker" role="region" aria-label="Add quick link picker">
          <div className="shortcuts-picker-controls">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter task lists, note folders, links…"
              aria-label="Filter quick link targets"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Filter quick link category"
            >
              {KIND_FILTERS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          {filteredTargets.length === 0 ? (
            <p className="pg-muted" style={{ margin: "6px 0 0" }}>
              No matching items found.
            </p>
          ) : (
            <ul className="shortcuts-picker-list">
              {filteredTargets.map((t) => {
                const pinned = existingKeys.has(`${t.kind}:${t.targetId}`);
                return (
                  <li key={`${t.kind}:${t.targetId}`}>
                    <button
                      type="button"
                      className="shortcuts-picker-item clickable"
                      onClick={() => void handleAddTarget(t)}
                    >
                      <span className="shortcuts-picker-badge">{t.categoryLabel}</span>
                      <span className="shortcuts-picker-name">{t.name}</span>
                      {pinned && <span className="shortcuts-picker-pinned">Pinned</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {shortcuts.length === 0 ? (
        <p className="pg-muted shortcuts-empty">
          No quick links yet — paste a link or add a task list, note folder, or link.
        </p>
      ) : (
        <div className="shortcuts-grid" role="list" aria-label="Pinned quick links">
          {shortcuts.map((s) => (
            <div key={s.id} className="shortcuts-tile" role="listitem">
              {s.url ? (
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shortcuts-tile-link clickable"
                  title={s.name}
                >
                  <span className="shortcuts-tile-icon" aria-hidden="true">
                    {KIND_ICON[s.kind]}
                  </span>
                  <span className="shortcuts-tile-name">{s.name}</span>
                </a>
              ) : (
                <button
                  type="button"
                  className="shortcuts-tile-link clickable"
                  title={s.name}
                  onClick={() => {
                    if (s.route) navigate(s.route);
                  }}
                >
                  <span className="shortcuts-tile-icon" aria-hidden="true">
                    {KIND_ICON[s.kind]}
                  </span>
                  <span className="shortcuts-tile-name">{s.name}</span>
                </button>
              )}
              <button
                type="button"
                className="shortcuts-tile-remove"
                aria-label={`Remove ${s.name}`}
                title="Remove quick link"
                onClick={() => void handleRemove(s.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
