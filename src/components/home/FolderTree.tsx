// src/components/home/FolderTree.tsx
// Reusable recursive folder tree shared by the task list, link, note and
// reminder home views. Renders nestable folders plus the items that belong to
// each folder (unfiled items appear at root). The parent supplies data,
// accessors, callbacks and domain-specific title/action rendering.
// With `foldersAsGrid`, folders display as a scrollable grid of cards instead
// of a list; items still render as list rows.
import { useCallback, useMemo, useState, type ReactNode } from "react";

export interface FolderTreeProps<F, I> {
  folders: F[];
  items: I[];
  folderId: (f: F) => string;
  folderParentId: (f: F) => string | null;
  folderTitle: (f: F) => string;
  itemId: (i: I) => string;
  itemFolderId: (i: I) => string | null;
  itemTitle: (i: I) => string;
  selectedId: string | null;
  onSelectFolder: (id: string) => void;
  onSelectItem: (id: string) => void;
  onCreateFolder: (parentId: string | null, title: string) => void;
  onRenameFolder: (id: string, title: string) => void;
  onDeleteFolder: (id: string) => void;
  onItemAction?: (item: I) => void;
  renderFolderTitle?: (f: F, selected: boolean) => ReactNode;
  renderFolderMeta?: (f: F, selected: boolean) => ReactNode;
  renderFolderActions?: (f: F, selected: boolean) => ReactNode;
  renderItemTitle?: (i: I, selected: boolean) => ReactNode;
  renderItemActions?: (i: I, selected: boolean) => ReactNode;
  newFolderPlaceholder?: string;
  foldersAsGrid?: boolean;
}

export default function FolderTree<F, I>(props: FolderTreeProps<F, I>) {
  const {
    folders,
    items,
    folderId,
    folderParentId,
    folderTitle,
    itemId,
    itemFolderId,
    itemTitle,
    selectedId,
    onSelectFolder,
    onSelectItem,
    onCreateFolder,
    onRenameFolder,
    onDeleteFolder,
    onItemAction,
    renderFolderTitle,
    renderFolderMeta,
    renderFolderActions,
    renderItemTitle,
    renderItemActions,
    newFolderPlaceholder = "New folder…",
    foldersAsGrid = false,
  } = props;

  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [creatingUnder, setCreatingUnder] = useState<string | null>(null);
  const [subTitle, setSubTitle] = useState("");
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const childrenByParent = useMemo(() => {
    const map = new Map<string | null, F[]>();
    for (const f of folders) {
      const pid = folderParentId(f);
      const arr = map.get(pid) ?? [];
      arr.push(f);
      map.set(pid, arr);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => (a as any).order - (b as any).order || folderTitle(a).localeCompare(folderTitle(b)));
    }
    return map;
  }, [folders, folderParentId, folderTitle]);

  const itemsByFolder = useMemo(() => {
    const map = new Map<string | null, I[]>();
    for (const it of items) {
      const fid = itemFolderId(it);
      const arr = map.get(fid) ?? [];
      arr.push(it);
      map.set(fid, arr);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => itemTitle(a).localeCompare(itemTitle(b)));
    }
    return map;
  }, [items, itemFolderId, itemTitle]);

  const rootFolders = useMemo(() => childrenByParent.get(null) ?? [], [childrenByParent]);

  const toggleFolder = useCallback((id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleCreateRootFolder = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const title = newTitle.trim();
      if (!title) return;
      onCreateFolder(null, title);
      setNewTitle("");
    },
    [newTitle, onCreateFolder]
  );

  const handleCreateSubFolder = useCallback(
    (e: React.FormEvent, parentId: string) => {
      e.preventDefault();
      const title = subTitle.trim();
      if (!title) return;
      onCreateFolder(parentId, title);
      setSubTitle("");
      setCreatingUnder(null);
    },
    [subTitle, onCreateFolder]
  );

  const commitRename = useCallback(
    (id: string) => {
      const next = draft.trim();
      setEditingId(null);
      const f = folders.find((x) => folderId(x) === id);
      if (f && next && next !== folderTitle(f)) void onRenameFolder(id, next);
    },
    [draft, folders, folderId, folderTitle, onRenameFolder]
  );

  const renderItemRow = (it: I): ReactNode => {
    const itId = itemId(it);
    const itSelected = selectedId === itId;
    return (
      <li key={itId} style={{ paddingLeft: 22, marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onSelectItem(itId); }}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              textAlign: "left",
              fontSize: "13px",
              color: itSelected ? "var(--color-accent-primary)" : "inherit",
              cursor: "pointer",
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {renderItemTitle ? renderItemTitle(it, itSelected) : <span style={{ flex: 1, minWidth: 0 }}>{itemTitle(it)}</span>}
          </button>
          {renderItemActions ? renderItemActions(it, itSelected) : null}
          {onItemAction && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onItemAction(it); }}
              style={{ background: "none", border: "none", padding: 2, fontSize: "14px", cursor: "pointer", marginLeft: "auto" }}
              data-tip="Open item"
            >
              →
            </button>
          )}
        </div>
      </li>
    );
  };

  const renderUnfiledItems = (): ReactNode => {
    const unfiled = itemsByFolder.get(null) ?? [];
    if (unfiled.length === 0) return null;
    return (
      <>
        <p style={{ padding: "0 12px", fontSize: "12px", color: "var(--color-text-muted)" }}>Unfiled</p>
        <ul style={{ paddingLeft: 22, marginTop: 4, listStyle: "none", padding: 0 }}>
          {unfiled.map((it) => renderItemRow(it))}
        </ul>
      </>
    );
  };

  const renderFolder = (f: F, depth: number): ReactNode => {
    const id = folderId(f);
    const isOpen = openIds.has(id);
    const kids = childrenByParent.get(id) ?? [];
    const folderItems = itemsByFolder.get(id) ?? [];
    const selected = selectedId === id;
    const editing = editingId === id;

    const hasKids = kids.length > 0;
    return (
      <li key={id} style={{ paddingLeft: depth * 18, marginBottom: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {hasKids && (
            <button
              type="button"
              onClick={() => toggleFolder(id)}
              style={{ background: "none", border: "none", padding: 0, fontSize: "12px", cursor: "pointer" }}
              data-tip={isOpen ? "Collapse" : "Expand"}
            >
              {isOpen ? "▾" : "▸"}
            </button>
          )}
          <button
            type="button"
            onClick={() => onSelectFolder(id)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              textAlign: "left",
              fontSize: "13px",
              color: "inherit",
              cursor: "pointer",
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {editing ? (
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => commitRename(id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename(id);
                  if (e.key === "Escape") { setDraft(folderTitle(f)); setEditingId(null); }
                }}
                style={{ fontSize: "inherit" }}
              />
            ) : (
              renderFolderTitle ? renderFolderTitle(f, selected) : (
                <>
                  <span style={{ flex: 1, minWidth: 0 }}>{folderTitle(f)}</span>
                  {renderFolderMeta && renderFolderMeta(f, selected)}
                </>
              )
            )}
          </button>
          <span style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            {renderFolderActions ? renderFolderActions(f, selected) : null}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setEditingId(id); setDraft(folderTitle(f)); }}
              style={{ background: "none", border: "none", padding: 2, fontSize: "14px", cursor: "pointer" }}
              data-tip="Rename folder"
            >
              ✎
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); void onDeleteFolder(id); }}
              style={{ background: "none", border: "none", padding: 2, fontSize: "14px", cursor: "pointer", color: "var(--color-accent-issue, #ef4444)" }}
              data-tip="Delete folder"
            >
              ×
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setCreatingUnder(id); setSubTitle(""); }}
              style={{ background: "none", border: "none", padding: 2, fontSize: "14px", cursor: "pointer" }}
              data-tip="Add subfolder"
            >
              +
            </button>
          </span>
        </div>
        {creatingUnder === id && (
          <form onSubmit={(e) => handleCreateSubFolder(e, id)} style={{ marginLeft: depth * 18 + 24, marginTop: 4, display: "flex", gap: 4 }}>
            <input
              autoFocus
              value={subTitle}
              onChange={(e) => setSubTitle(e.target.value)}
              placeholder={newFolderPlaceholder}
              style={{ padding: "2px 6px", fontSize: "12px", borderRadius: "var(--radius-sm, 4px)", border: "1px solid var(--color-border)", flex: 1, minWidth: 0 }}
            />
            <button type="submit" style={{ padding: "2px 8px", fontSize: "12px", cursor: "pointer" }} disabled={!subTitle.trim()}>
              +
            </button>
            <button type="button" onClick={() => setCreatingUnder(null)} style={{ padding: "2px 8px", fontSize: "12px", cursor: "pointer" }}>✕</button>
          </form>
        )}
        {isOpen && hasKids && (
          <ul style={{ paddingLeft: 22, marginTop: 4, listStyle: "none", padding: 0 }}>
            {kids.map((child) => renderFolder(child, depth + 1))}
          </ul>
        )}
        {isOpen && folderItems.length > 0 && (
          <ul style={{ paddingLeft: 22, marginTop: 6, listStyle: "none", padding: 0 }}>
            {folderItems.map((it) => renderItemRow(it))}
          </ul>
        )}
      </li>
    );
  };

  const renderFolderGrid = (f: F, depth: number): ReactNode => {
    const id = folderId(f);
    const isOpen = openIds.has(id);
    const kids = childrenByParent.get(id) ?? [];
    const selected = selectedId === id;
    const editing = editingId === id;

    return (
      <div key={id} className="folder-grid-item" style={{ marginBottom: 8 }}>
        <div
          className={`folder-card${selected ? " folder-card-selected" : ""}`}
          style={{ paddingLeft: depth * 18 }}
          onClick={() => onSelectFolder(id)}
        >
          {editing ? (
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => commitRename(id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename(id);
                if (e.key === "Escape") { setDraft(folderTitle(f)); setEditingId(null); }
              }}
              style={{ fontSize: "inherit" }}
            />
          ) : (
            <>
              <span className="folder-card-title">{folderTitle(f)}</span>
              {renderFolderMeta && renderFolderMeta(f, selected)}
            </>
          )}
          <span className="folder-card-actions">
            {kids.length > 0 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggleFolder(id); }}
                data-tip={isOpen ? "Collapse" : "Expand"}
              >
                {isOpen ? "▾" : "▸"}
              </button>
            )}
            {renderFolderActions ? renderFolderActions(f, selected) : null}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setEditingId(id); setDraft(folderTitle(f)); }}
              data-tip="Rename folder"
            >
              ✎
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); void onDeleteFolder(id); }}
              style={{ color: "var(--color-accent-issue, #ef4444)" }}
              data-tip="Delete folder"
            >
              ×
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setCreatingUnder(id); setSubTitle(""); }}
              data-tip="Add subfolder"
            >
              +
            </button>
          </span>
        </div>
        {creatingUnder === id && (
          <form onSubmit={(e) => handleCreateSubFolder(e, id)} style={{ marginLeft: depth * 18 + 24, marginTop: 4, display: "flex", gap: 4 }}>
            <input
              autoFocus
              value={subTitle}
              onChange={(e) => setSubTitle(e.target.value)}
              placeholder={newFolderPlaceholder}
              style={{ padding: "2px 6px", fontSize: "12px", borderRadius: "var(--radius-sm, 4px)", border: "1px solid var(--color-border)", flex: 1, minWidth: 0 }}
            />
            <button type="submit" style={{ padding: "2px 8px", fontSize: "12px", cursor: "pointer" }} disabled={!subTitle.trim()}>
              +
            </button>
            <button type="button" onClick={() => setCreatingUnder(null)} style={{ padding: "2px 8px", fontSize: "12px", cursor: "pointer" }}>✕</button>
          </form>
        )}
        {isOpen && kids.length > 0 && (
          <div className="folder-grid" style={{ marginTop: 6 }}>
            {kids.map((k) => renderFolderGrid(k, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (foldersAsGrid) {
    return (
      <>
        <form onSubmit={handleCreateRootFolder} style={{ display: "flex", gap: 6, padding: "0 12px 8px" }}>
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={newFolderPlaceholder}
            style={{ flex: 1, padding: "6px 8px", fontSize: "13px", borderRadius: "var(--radius-sm, 4px)", border: "1px solid var(--color-border)" }}
          />
          <button type="submit" disabled={!newTitle.trim()} style={{ padding: "6px 10px", fontSize: "13px", cursor: "pointer" }}>
            +
          </button>
        </form>
        {rootFolders.length === 0 && (
          <p style={{ padding: "0 12px", fontSize: "13px", color: "var(--color-text-muted)" }}>
            No folders yet. Add one above.
          </p>
        )}
        <div className="folder-grid">{rootFolders.map((f) => renderFolderGrid(f, 0))}</div>
        {renderUnfiledItems()}
      </>
    );
  }

  return (
    <ul className="item-list" style={{ padding: 0, margin: 0, listStyle: "none" }}>
      <form onSubmit={handleCreateRootFolder} style={{ display: "flex", gap: 6, padding: "0 12px 8px" }}>
        <input
          autoFocus
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder={newFolderPlaceholder}
          style={{ flex: 1, padding: "6px 8px", fontSize: "13px", borderRadius: "var(--radius-sm, 4px)", border: "1px solid var(--color-border)" }}
        />
        <button type="submit" disabled={!newTitle.trim()} style={{ padding: "6px 10px", fontSize: "13px", cursor: "pointer" }}>
          +
        </button>
      </form>
      {rootFolders.length === 0 && (
        <p style={{ padding: "0 12px", fontSize: "13px", color: "var(--color-text-muted)" }}>
          No folders yet. Add one above.
        </p>
      )}
      {rootFolders.map((f) => renderFolder(f, 0))}
      {/* Unfiled items at root */}
      {renderUnfiledItems()}
    </ul>
  );
}
