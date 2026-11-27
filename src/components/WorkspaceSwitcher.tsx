import { useEffect, useMemo, useRef, useState } from "react";
import {
  createWorkspace,
  deleteWorkspace,
  formatWorkspaceLabel,
  getActiveWorkspace,
  listWorkspaces,
  renameWorkspace,
  setWorkspaceParent,
  switchWorkspace,
  type WorkspaceInfo,
  type WorkspaceTemplateId,
} from "../data/workspaces";
import { DEFAULT_WORKSPACE_ID } from "../data/workspaceState";
import { DEFAULT_TEMPLATE_DEFS, ensureDefaultWorkspaceTemplates } from "../data/workspaceTemplates";
import { confirmDelete, showToast } from "./ui";

interface TreeRow {
  workspace: WorkspaceInfo;
  depth: number;
}

function buildWorkspaceTreeRows(items: WorkspaceInfo[]): TreeRow[] {
  const byId = new Map(items.map((w) => [w.id, w]));
  const childrenMap = new Map<string, WorkspaceInfo[]>();
  const roots: WorkspaceInfo[] = [];

  for (const w of items) {
    const pid = w.parentWorkspaceId && byId.has(w.parentWorkspaceId) && w.parentWorkspaceId !== w.id ? w.parentWorkspaceId : null;
    if (!pid) {
      roots.push(w);
    } else {
      const list = childrenMap.get(pid) ?? [];
      list.push(w);
      childrenMap.set(pid, list);
    }
  }

  const rows: TreeRow[] = [];
  const visited = new Set<string>();
  const visit = (ws: WorkspaceInfo, depth: number) => {
    if (visited.has(ws.id)) return;
    visited.add(ws.id);
    rows.push({ workspace: ws, depth });
    for (const child of childrenMap.get(ws.id) ?? []) {
      visit(child, depth + 1);
    }
  };
  for (const r of roots) visit(r, 0);
  for (const w of items) {
    if (!visited.has(w.id)) visit(w, 0);
  }
  return rows;
}

function isDescendantOf(candidateParentId: string, nodeId: string, items: WorkspaceInfo[]): boolean {
  let cursor: string | null | undefined = candidateParentId;
  let guard = 0;
  while (cursor && guard++ < 25) {
    if (cursor === nodeId) return true;
    cursor = items.find((w) => w.id === cursor)?.parentWorkspaceId ?? null;
  }
  return false;
}

/** Top-level workspace bar: switcher tree button ("workspace dive") + dedicated Add workspace button. */
export default function WorkspaceSwitcher({ onChanged }: { onChanged: () => void }) {
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [managing, setManaging] = useState(false);
  const [newName, setNewName] = useState("");
  const [newParentId, setNewParentId] = useState("");
  const [newTemplateId, setNewTemplateId] = useState<"" | WorkspaceTemplateId>("");
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const [, bump] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const workspaces = listWorkspaces();
  const active = getActiveWorkspace();

  const treeRows = useMemo(() => buildWorkspaceTreeRows(workspaces), [workspaces]);

  const q = query.trim().toLowerCase();
  const filtered: TreeRow[] = q
    ? treeRows
        .filter(({ workspace }) =>
          workspace.name.toLowerCase().includes(q) ||
          formatWorkspaceLabel(workspace, workspaces).toLowerCase().includes(q)
        )
        .sort(
          (a, b) =>
            Number(b.workspace.name.toLowerCase().startsWith(q)) -
            Number(a.workspace.name.toLowerCase().startsWith(q))
        )
    : treeRows;
  const activeHighlight = Math.min(highlight, Math.max(filtered.length - 1, 0));

  function closeAll() {
    setSwitcherOpen(false);
    setAddOpen(false);
    setManaging(false);
    setNewName("");
    setNewParentId("");
    setNewTemplateId("");
    setQuery("");
    setHighlight(0);
  }

  useEffect(() => {
    const refresh = () => bump((n) => n + 1);
    window.addEventListener("panga-data-updated", refresh);
    window.addEventListener("panga-workspace-switched", refresh);
    return () => {
      window.removeEventListener("panga-data-updated", refresh);
      window.removeEventListener("panga-workspace-switched", refresh);
    };
  }, []);

  useEffect(() => {
    if (!switcherOpen && !addOpen) return;
    function onPointerDown(e: MouseEvent | TouchEvent) {
      const target = e.target as Node | null;
      if (wrapRef.current && target && !wrapRef.current.contains(target)) closeAll();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeAll();
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [switcherOpen, addOpen]);

  async function handleSwitch(id: string) {
    if (id !== active.id) {
      try {
        await switchWorkspace(id);
        onChanged();
      } catch (e) {
        showToast(e instanceof Error ? e.message : "Could not switch workspace.", "error");
      }
    }
    closeAll();
  }

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = newName.trim();
    if (!clean || creating) return;
    setCreating(true);
    try {
      await createWorkspace(clean, {
        parentWorkspaceId: newParentId || null,
        templateId: newTemplateId || null,
      });
      onChanged();
      closeAll();
      showToast(`Created workspace "${clean}".`, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not create workspace.", "error");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (
      !(await confirmDelete({
        kind: "workspace",
        name,
        detail: "All of its tasks, notes, links, media links, and clips are removed. Your reminders and AI keys are not affected.",
      }))
    ) {
      return;
    }
    const wasActive = id === active.id;
    await deleteWorkspace(id);
    if (wasActive) onChanged();
    bump((n) => n + 1);
  }

  async function handleRestoreTemplates() {
    if (restoring) return;
    setRestoring(true);
    try {
      const { restored } = await ensureDefaultWorkspaceTemplates({ forceRestore: true });
      bump((n) => n + 1);
      onChanged();
      showToast(
        restored.length > 0
          ? `Restored templates: ${restored.join(", ")}`
          : "All starter templates are already present.",
        "info"
      );
    } finally {
      setRestoring(false);
    }
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
      if (target) void handleSwitch(target.workspace.id);
    }
  }

  function handleRename(id: string, name: string) {
    renameWorkspace(id, name);
    bump((n) => n + 1);
    if (id === active.id) onChanged();
  }

  function handleParentChange(id: string, parentId: string) {
    setWorkspaceParent(id, parentId || null);
    bump((n) => n + 1);
    onChanged();
  }

  const nonMainWorkspaces = workspaces.filter((w) => w.id !== DEFAULT_WORKSPACE_ID);

  return (
    <div className="workspace-bar" ref={wrapRef}>
      <div className="workspace-bar-controls">
        <button
          type="button"
          className="workspace-trigger clickable"
          aria-haspopup="menu"
          aria-expanded={switcherOpen}
          onClick={() => {
            setAddOpen(false);
            setSwitcherOpen((o) => !o);
          }}
        >
          <span className="workspace-trigger-label">
            Workspace: <strong>{formatWorkspaceLabel(active, workspaces)}</strong>
          </span>
          <span className={`workspace-caret${switcherOpen ? " workspace-caret-open" : ""}`} aria-hidden="true" />
        </button>

        <button
          type="button"
          className="btn-secondary workspace-add-btn clickable"
          aria-haspopup="dialog"
          aria-expanded={addOpen}
          onClick={() => {
            setSwitcherOpen(false);
            setManaging(false);
            setNewParentId(active.id !== DEFAULT_WORKSPACE_ID ? active.id : "");
            setAddOpen((o) => !o);
          }}
        >
          + Add workspace
        </button>
      </div>

      {switcherOpen && (
        <div className="workspace-menu dropdown-anim sweep-on-mount" role="menu" aria-label="Workspaces">
          <div className="panel-head-row">
            <strong className="panel-head-title">Workspaces</strong>
            <button
              type="button"
              className="modal-close-x clickable"
              aria-label="Close workspace switcher"
              onClick={closeAll}
            >
              ×
            </button>
          </div>
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
            placeholder="Filter workspaces…"
            aria-label="Filter workspaces by name"
            autoComplete="off"
            spellCheck={false}
          />
          <div className="workspace-actions">
            <button
              type="button"
              className={`workspace-item clickable${managing ? " workspace-item-on" : ""}`}
              role="menuitem"
              aria-pressed={managing}
              onClick={() => setManaging((m) => !m)}
            >
              {managing ? "Done managing" : "Manage workspaces"}
            </button>
            {managing && (
              <button
                type="button"
                className="workspace-item clickable"
                role="menuitem"
                disabled={restoring}
                onClick={() => void handleRestoreTemplates()}
              >
                {restoring ? "Restoring…" : "Restore default templates"}
              </button>
            )}
          </div>
          <ul className="workspace-list">
            {filtered.length === 0 && (
              <li className="workspace-empty">
                <p className="tl-empty">
                  No workspace named “{query.trim()}”. Use + Add workspace to create one.
                </p>
              </li>
            )}
            {filtered.map(({ workspace: w, depth }, i) => (
              <li key={w.id} className="workspace-row" data-depth={depth}>
                {managing ? (
                  <div className="workspace-manage-item">
                    <div className="workspace-manage-top">
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
                    </div>
                    {w.id !== DEFAULT_WORKSPACE_ID && (
                      <label className="workspace-parent-label">
                        <span>Parent</span>
                        <select
                          aria-label={`Parent workspace for ${w.name}`}
                          value={w.parentWorkspaceId ?? ""}
                          onChange={(e) => handleParentChange(w.id, e.target.value)}
                        >
                          <option value="">None (top level)</option>
                          {nonMainWorkspaces
                            .filter((cand) => cand.id !== w.id && !isDescendantOf(cand.id, w.id, workspaces))
                            .map((cand) => (
                              <option key={cand.id} value={cand.id}>
                                {formatWorkspaceLabel(cand, workspaces)}
                              </option>
                            ))}
                        </select>
                      </label>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    className={`workspace-item workspace-depth-${Math.min(depth, 4)} clickable${w.id === active.id ? " workspace-item-active" : ""}${q && i === activeHighlight ? " workspace-item-hl" : ""}`}
                    role="menuitemradio"
                    aria-checked={w.id === active.id}
                    onClick={() => void handleSwitch(w.id)}
                  >
                    {w.id === DEFAULT_WORKSPACE_ID ? `${w.name} (Global)` : depth > 0 ? `↳ ${w.name}` : w.name}
                  </button>
                )}
              </li>
            ))}
          </ul>
          <div className="panel-foot-row">
            <button type="button" className="btn-secondary btn-small clickable" onClick={closeAll}>
              Close
            </button>
          </div>
        </div>
      )}

      {addOpen && (
        <div className="workspace-menu workspace-add-dialog dropdown-anim sweep-on-mount" role="dialog" aria-label="Add workspace">
          <div className="panel-head-row">
            <strong className="panel-head-title">Add workspace</strong>
            <button
              type="button"
              className="modal-close-x clickable"
              aria-label="Close add workspace"
              onClick={closeAll}
            >
              ×
            </button>
          </div>
          <form className="workspace-add-form" onSubmit={(e) => void handleCreateSubmit(e)}>
            <label className="workspace-field">
              <span>Name</span>
              <input
                autoFocus
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Client app, Fitness, Study"
                aria-label="New workspace name"
                maxLength={60}
              />
            </label>
            <label className="workspace-field">
              <span>Parent workspace (optional)</span>
              <select
                aria-label="Parent workspace"
                value={newParentId}
                onChange={(e) => setNewParentId(e.target.value)}
              >
                <option value="">Top-level workspace</option>
                {nonMainWorkspaces.map((w) => (
                  <option key={w.id} value={w.id}>
                    {formatWorkspaceLabel(w, workspaces)}
                  </option>
                ))}
              </select>
            </label>
            <label className="workspace-field">
              <span>Starter template</span>
              <select
                aria-label="Starter template"
                value={newTemplateId}
                onChange={(e) => setNewTemplateId(e.target.value as "" | WorkspaceTemplateId)}
              >
                <option value="">Blank workspace</option>
                {DEFAULT_TEMPLATE_DEFS.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name} — {tpl.description}
                  </option>
                ))}
              </select>
            </label>
            <div className="panel-foot-row">
              <button type="button" className="btn-secondary btn-small clickable" onClick={closeAll}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary btn-small clickable"
                disabled={!newName.trim() || creating}
              >
                {creating ? "Creating…" : "Create workspace"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
