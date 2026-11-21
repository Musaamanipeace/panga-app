import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createLink,
  deleteLink,
  listAllLinks,
  updateLink,
  type Link,
} from "../../data/links";
import {
  createLinkFolder,
  deleteLinkFolder,
  listLinkFolders,
  updateLinkFolder,
  type LinkFolder,
} from "../../data/linkFolders";
import { copyToClipboard, confirmDelete } from "../../components/ui";

export default function HomeLinksTab() {
  const [folders, setFolders] = useState<LinkFolder[]>([]);
  const [linksByFolder, setLinksByFolder] = useState<Record<string, Link[]>>({});
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [unsortedFolderId, setUnsortedFolderId] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newFolderTitle, setNewFolderTitle] = useState("");

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    const [allFolders, allLinks] = await Promise.all([listLinkFolders(), listAllLinks()]);
    setFolders(allFolders);
    const byFolder: Record<string, Link[]> = {};
    for (const link of allLinks) {
      const key = link.folderId ?? null;
      if (!byFolder[key]) byFolder[key] = [];
      byFolder[key].push(link);
    }
    setLinksByFolder(byFolder);
    const unsorted = allFolders.find((f) => f.title === "Unsorted links");
    setUnsortedFolderId(unsorted?.id ?? null);
    if (!selectedFolderId || !allFolders.find((f) => f.id === selectedFolderId)) {
      setSelectedFolderId(unsorted?.id ?? allFolders[0]?.id ?? null);
    }
  }, [selectedFolderId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  function normalizeUrl(input: string): string {
    const trimmed = input.trim();
    if (!trimmed) return "";
    if (!/^https?:\/\//i.test(trimmed)) return "https://" + trimmed;
    return trimmed;
  }

  const currentFolder = useMemo(() => folders.find((f) => f.id === selectedFolderId) ?? null, [folders, selectedFolderId]);
  const currentLinks = useMemo(() => linksByFolder[selectedFolderId ?? ""] ?? [], [linksByFolder, selectedFolderId]);

  const filtered = useMemo(() => {
    const list = currentLinks;
    return list.slice().sort((a, b) => a.order - b.order || b.updatedAt - a.updatedAt);
  }, [currentLinks]);

  async function handleAddFolder(e: React.FormEvent) {
    e.preventDefault();
    if (!newFolderTitle.trim()) return;
    await createLinkFolder({ title: newFolderTitle.trim() });
    setNewFolderTitle("");
    await reload();
  }

  async function handleRenameFolder(id: string, title: string) {
    await updateLinkFolder(id, { title: title.trim() });
    await reload();
  }

  async function handleDeleteFolder(id: string) {
    const folder = folders.find((f) => f.id === id);
    if (!(await confirmDelete({ kind: "link folder", name: folder?.title }))) return;
    await deleteLinkFolder(id, { moveLinksToFolderId: unsortedFolderId ?? undefined });
    if (selectedFolderId === id) setSelectedFolderId(unsortedFolderId ?? null);
    await reload();
  }

  async function handleSaveLink(e: React.FormEvent) {
    e.preventDefault();
    const finalUrl = normalizeUrl(url);
    if (!finalUrl) {
      setError("Please enter a valid link URL.");
      return;
    }
    const finalTitle = title.trim() || new URL(finalUrl).hostname.replace(/^www\./, "");
    const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await updateLink(editingId, { title: finalTitle, url: finalUrl, notes: notes.trim() || undefined, tags: tagList, folderId: targetFolderId ?? null });
      } else {
        await createLink({ folderId: targetFolderId ?? null, title: finalTitle, url: finalUrl, notes: notes.trim() || undefined, tags: tagList });
      }
      resetForm();
      await reload();
    } catch (err: any) {
      setError(err?.message || "Could not save the link.");
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setTargetFolderId(currentFolder?.id ?? null);
    setTitle("");
    setUrl("");
    setNotes("");
    setTags("");
    setShowAddForm(false);
    setError(null);
  }

  function startEdit(link: Link) {
    setEditingId(link.id);
    setTargetFolderId(link.folderId ?? null);
    setTitle(link.title);
    setUrl(link.url);
    setNotes(link.notes ?? "");
    setTags((link.tags ?? []).join(", "));
    setShowAddForm(true);
  }

  async function handleDeleteLink(id: string, linkTitle: string) {
    if (!(await confirmDelete({ kind: "link", name: linkTitle }))) return;
    await deleteLink(id);
    await reload();
  }

  async function handleCopy(url: string) {
    await copyToClipboard(url);
  }

  return (
    <div className="home-links-tab">
      <aside className="link-folders-sidebar">
        <h2>Link folders</h2>
        <form className="quick-add-bar" onSubmit={handleAddFolder}>
          <input
            value={newFolderTitle}
            onChange={(e) => setNewFolderTitle(e.target.value)}
            placeholder="New folder…"
            autoFocus
          />
          <button type="submit" className="btn-action clickable" disabled={!newFolderTitle.trim()}>
            +
          </button>
          <button type="button" className="btn-secondary btn-small" onClick={() => setNewFolderTitle("")}>
            ✕
          </button>
        </form>
        <ul className="item-list">
          {folders.length === 0 ? (
            <p className="empty-state">No folders yet.</p>
          ) : (
            folders.map((f) => {
              const active = selectedFolderId === f.id;
              const count = (linksByFolder[f.id] ?? []).length;
              return (
                <li key={f.id} className={`item ${active ? "item-active" : ""}`}>
                  <button
                    type="button"
                    className="clickable"
                    onClick={() => setSelectedFolderId(f.id)}
                    style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", background: "none", border: "none", padding: 6, cursor: "pointer" }}
                  >
                    <span className="item-title">{f.title}</span>
                    <span className="item-meta">{count}</span>
                    <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                      <button type="button" className="btn-icon clickable" onClick={(e) => { e.stopPropagation(); handleRenameFolder(f.id, f.title); }} data-tip="Rename folder">✎</button>
                      <button type="button" className="btn-icon clickable" onClick={(e) => { e.stopPropagation(); void handleDeleteFolder(f.id); }} data-tip="Delete folder" style={{ color: "var(--color-accent-issue)" }}>×</button>
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </aside>

      <main className="link-list-main">
        <header className="page-header">
          <div>
            <h1>{currentFolder ? currentFolder.title : "Unsorted links"}</h1>
          </div>
          <div className="header-actions">
            <button
              type="button"
              className="btn-primary clickable"
              onClick={() => { setShowAddForm(true); setEditingId(null); resetForm(); }}
              data-tip="Add a link"
            >
              + Add link
            </button>
          </div>
        </header>

        {showAddForm && (
          <form onSubmit={handleSaveLink} className="stack" style={{ background: "white", border: "1px solid var(--color-border)", borderRadius: "var(--radius)", padding: "16px", marginBottom: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>{editingId ? "Edit link" : "Add a link"}</h3>
            </div>
            <div>
              <label htmlFor="link-folder" style={{ fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "6px" }}>Folder</label>
              <select
                id="link-folder"
                value={targetFolderId ?? ""}
                onChange={(e) => setTargetFolderId(e.target.value || null)}
                style={{ width: "100%", padding: "8px 10px", fontSize: "13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}
              >
                <option value="">Unsorted</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.title}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginTop: "10px" }}>
              <label htmlFor="link-url" style={{ fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "6px" }}>URL <span style={{ color: "var(--color-accent-issue)" }}>*</span></label>
              <input
                id="link-url"
                autoFocus
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                style={{ width: "100%", padding: "8px 10px", fontSize: "13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}
              />
            </div>
            <div style={{ marginTop: "10px" }}>
              <label htmlFor="link-title" style={{ fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "6px" }}>Title</label>
              <input
                id="link-title"
                placeholder="Link title (defaults to domain)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", fontSize: "13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}
              />
            </div>
            <div style={{ marginTop: "10px" }}>
              <label htmlFor="link-notes" style={{ fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "6px" }}>Notes</label>
              <textarea
                id="link-notes"
                rows={3}
                placeholder="Notes about this link"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", fontSize: "13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}
              />
            </div>
            <div style={{ marginTop: "10px" }}>
              <label htmlFor="link-tags" style={{ fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "6px" }}>Tags (comma-separated)</label>
              <input
                id="link-tags"
                placeholder="research, docs, tools"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", fontSize: "13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}
              />
            </div>
            {error && <p className="form-error">{error}</p>}
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "8px" }}>
              <button type="button" className="btn-secondary clickable" onClick={resetForm} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="btn-primary clickable" disabled={saving}>
                {saving ? "Saving…" : editingId ? "Save changes" : "Save link"}
              </button>
            </div>
          </form>
        )}

        {filtered.length === 0 ? (
          <div className="empty-state" style={{ textAlign: "center", padding: "32px 16px" }}>
            <p>No links in this folder.</p>
            <button type="button" className="btn-primary btn-small clickable" onClick={() => { setShowAddForm(true); setEditingId(null); resetForm(); }}>
              + Add your first link
            </button>
          </div>
        ) : (
          <ul className="item-list">
            {filtered.map((link) => {
              return (
                <li key={link.id} className="item" style={{ display: "flex", flexDirection: "column", background: "white", border: "1px solid var(--color-border)", borderRadius: "var(--radius)", padding: "14px", marginBottom: "10px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, flex: 1, minWidth: 0 }}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        style={{ fontWeight: 600, fontSize: "15px", color: "var(--color-accent-primary)", textDecoration: "none", wordBreak: "break-word" }}
                        className="clickable"
                        data-tip="Open link"
                      >
                        {link.title || link.url} ↗
                      </a>
                    </div>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <button type="button" className="btn-secondary btn-small clickable" onClick={() => handleCopy(link.url)} data-tip="Copy link URL">Copy</button>
                      <button type="button" className="btn-secondary btn-small clickable" onClick={() => startEdit(link)} data-tip="Edit link">Edit</button>
                      <button type="button" className="btn-icon clickable" onClick={() => handleDeleteLink(link.id, link.title)} data-tip="Delete link" style={{ color: "var(--color-accent-issue)" }}>×</button>
                    </div>
                  </div>
                  {link.url && (
                    <div style={{ marginTop: "2px", marginBottom: "6px" }}>
                      <a href={link.url} target="_blank" rel="noreferrer noopener" style={{ fontSize: "12px", color: "var(--color-text-muted)", textDecoration: "none", wordBreak: "break-all" }}>{link.url}</a>
                    </div>
                  )}
                  {link.notes && (
                    <div style={{ background: "var(--color-bg-subtle)", borderLeft: "3px solid var(--color-accent-primary)", padding: "8px 12px", borderRadius: "0 var(--radius-sm) var(--radius-sm) 0", fontSize: "13px", lineHeight: "1.5", color: "var(--color-text)", margin: "6px 0 8px 0", whiteSpace: "pre-wrap" }}>{link.notes}</div>
                  )}
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center", marginTop: "4px" }}>
                    {link.tags.map((tag) => (
                      <span key={tag} className="chip-small" style={{ margin: 0, background: "var(--color-bg-subtle)" }}>
                        #{tag}
                      </span>
                    ))}
                    <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--color-text-muted)" }}>{new Date(link.updatedAt).toLocaleDateString()}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
