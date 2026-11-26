import { useEffect, useRef, useState } from "react";
import {
  createWorkspace,
  deleteWorkspace,
  getActiveWorkspace,
  listWorkspaces,
  renameWorkspace,
  switchWorkspace,
} from "../data/workspaces";
import { DEFAULT_WORKSPACE_ID } from "../data/workspaceState";
import { confirmDelete, showToast } from "./ui";

/** Top-level workspace button + menu. Switching swaps the visible dataset; BYOK keys are account-level and untouched. */
export default function WorkspaceSwitcher({ onChanged }: { onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [managing, setManaging] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const [, bump] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const workspaces = listWorkspaces();
  const active = getActiveWorkspace();

  // Type-to-find: names starting with the query come first, then names containing it.
  const q = query.trim().toLowerCase();
  const filtered = q
    ? workspaces
        .filter((w) => w.name.toLowerCase().includes(q))
        .sort((a, b) => Number(b.name.toLowerCase().startsWith(q)) - Number(a.name.toLowerCase().startsWith(q)))
    : workspaces;
  const activeHighlight = Math.min(highlight, Math.max(filtered.length - 1, 0));

  function close() {
    setOpen(false);
    setManaging(false);
    setCreating(false);
    setNewName("");
    setQuery("");
    setHighlight(0);
  }

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent | TouchEvent) {
      const target = e.target as Node | null;
      if (wrapRef.current && target && !wrapRef.current.contains(target)) close();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function handleSwitch(id: string) {
    if (id !== active.id) {
      try {
        await switchWorkspace(id);
        onChanged();
      } catch (e) {
        showToast(e instanceof Error ? e.message : "Could not switch workspace.", "error");
      }
    }
    close();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await createByName(newName);
  }

  async function createByName(raw: string) {
    const name = raw.trim();
    if (!name) return;
    try {
      await createWorkspace(name);
      onChanged();
      close();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not create workspace.", "error");
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!(await confirmDelete({ kind: "workspace", name, detail: "All of its tasks, notes, links and clips are removed. Your reminders and AI keys are not affected." }))) return;
    const wasActive = id === active.id;
    await deleteWorkspace(id);
    if (wasActive) onChanged();
    bump((n) => n + 1);
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (filtered.length) setHighlight((activeHighlight + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (filtered.length) setHighlight((activeHighlight - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (managing) return;
      const target = filtered[activeHighlight];
      if (target) void handleSwitch(target.id);
      else void createByName(query);
    }
  }

  function handleRename(id: string, name: string) {
    renameWorkspace(id, name);
    bump((n) => n + 1);
    if (id === active.id) onChanged();
  }

  return (
    <div className="workspace-bar" ref={wrapRef}>
      <button
        type="button"
        className="workspace-trigger clickable"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <span className="workspace-trigger-label">
          Workspace: <strong>{active.name}</strong>
        </span>
        <span className={`workspace-caret${open ? " workspace-caret-open" : ""}`} aria-hidden="true" />
      </button>

      {open && (
        <div className="workspace-menu dropdown-anim sweep-on-mount" role="menu" aria-label="Workspaces">
          <input
            autoFocus
            type="text"
            className="workspace-search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlight(0);
            }}
            onKeyDown={handleSearchKeyDown}
            placeholder="Type a workspace name…"
            aria-label="Find a workspace by name"
            autoComplete="off"
            spellCheck={false}
          />
          <div className="workspace-actions">
            {creating ? (
              <form className="workspace-create" onSubmit={handleCreate}>
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Workspace name"
                  aria-label="New workspace name"
                  maxLength={60}
                />
                <button type="submit" className="btn-primary btn-small clickable" disabled={!newName.trim()}>
                  Create
                </button>
              </form>
            ) : (
              <button type="button" className="workspace-item clickable" role="menuitem" onClick={() => setCreating(true)}>
                Create new
              </button>
            )}
            <button
              type="button"
              className={`workspace-item clickable${managing ? " workspace-item-on" : ""}`}
              role="menuitem"
              aria-pressed={managing}
              onClick={() => setManaging((m) => !m)}
            >
              {managing ? "Done managing" : "Manage"}
            </button>
          </div>
          <ul className="workspace-list">
            {filtered.length === 0 && (
              <li className="workspace-row workspace-empty">
                <button
                  type="button"
                  className="workspace-item clickable"
                  role="menuitem"
                  onClick={() => void createByName(query)}
                >
                  No match. Create “{query.trim()}”
                </button>
              </li>
            )}
            {filtered.map((w, i) => (
              <li key={w.id} className="workspace-row">
                {managing ? (
                  <>
                    <input
                      className="workspace-rename"
                      defaultValue={w.name}
                      aria-label={`Rename ${w.name}`}
                      maxLength={60}
                      onBlur={(e) => {
                        const next = e.target.value.trim();
                        if (next && next !== w.name) handleRename(w.id, next);
                        else e.target.value = w.name;
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                      }}
                    />
                    {w.id !== DEFAULT_WORKSPACE_ID && (
                      <button
                        type="button"
                        className="btn-secondary btn-small clickable workspace-delete"
                        onClick={() => void handleDelete(w.id, w.name)}
                      >
                        Delete
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    className={`workspace-item clickable${w.id === active.id ? " workspace-item-active" : ""}${q && i === activeHighlight ? " workspace-item-hl" : ""}`}
                    role="menuitemradio"
                    aria-checked={w.id === active.id}
                    onClick={() => void handleSwitch(w.id)}
                  >
                    {w.name}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
