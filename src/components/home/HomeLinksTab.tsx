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
import { ProofreadTrigger } from "../../components/Proofread";
import FolderTree from "./FolderTree";

export default function HomeLinksTab({ initialFolderId }: { initialFolderId?: string | null }) {
  const [folders, setFolders] = useState<LinkFolder[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [selType, setSelType] = useState<"folder" | "link" | null>(null);
  const [selId, setSelId] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    const [allFolders, allLinks] = await Promise.all([listLinkFolders(), listAllLinks()]);
    setFolders(allFolders);
    setLinks(allLinks);
    setSelId((prev) => {
      if (prev && (allFolders.some((f) => f.id === prev) || allLinks.some((l) => l.id === prev))) {
        return prev;
      }
      return allFolders[0]?.id ?? null;
    });
  }, []);

  useEffect(() => {
    void reload();
    const onUpdate = () => void reload();
    window.addEventListener("panga-data-updated", onUpdate);
    return () => window.removeEventListener("panga-data-updated", onUpdate);
  }, [reload]);

  useEffect(() => {
    if (!showAddForm) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowAddForm(false);
        setEditingId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showAddForm]);

  // A search result for a folder selects it directly.
  useEffect(() => {
    if (!initialFolderId) return;
    const target = folders.find((f) => f.id === initialFolderId);
    if (target) {
      setSelType("folder");
      setSelId(target.id);
    }
  }, [initialFolderId, folders]);

  const currentFolder = useMemo(() => folders.find((f) => f.id === selId) ?? null, [folders, selId]);
  const currentLink = useMemo(() => links.find((l) => l.id === selId) ?? null, [links, selId]);
  const currentLinks = useMemo(() => links.filter((l) => l.folderId === (currentFolder?.id ?? null)), [links, currentFolder]);

  const filtered = useMemo(() => currentLinks.slice().sort((a, b) => a.order - b.order || b.updatedAt - a.updatedAt), [currentLinks]);

  function normalizeUrl(input: string): string {
    const trimmed = input.trim();
    if (!trimmed) return "";
    if (!/^https?:\/\//i.test(trimmed)) return "https://" + trimmed;
    return trimmed;
  }

  async function handleCreateFolder(parentId: string | null, title: string) {
    await createLinkFolder({ title: title.trim(), parentFolderId: parentId });
    await reload();
  }

  async function handleRenameFolder(id: string, title: string) {
    await updateLinkFolder(id, { title: title.trim() });
    await reload();
  }

  async function handleDeleteFolder(id: string) {
    const folder = folders.find((f) => f.id === id);
    if (!(await confirmDelete({ kind: "link folder", name: folder?.title }))) return;
    await deleteLinkFolder(id);
    if (selId === id) setSelId(null);
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
        await createLink({ folderId: targetFolderId ?? (selType === "folder" ? selId : null), title: finalTitle, url: finalUrl, notes: notes.trim() || undefined, tags: tagList });
      }
      setShowAddForm(false);
      setEditingId(null);
      setTitle("");
      setUrl("");
      setNotes("");
      setTags("");
      setTargetFolderId(currentFolder?.id ?? null);
      await reload();
    } catch (err: any) {
      setError(err?.message || "Could not save the link.");
    } finally {
      setSaving(false);
    }
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

  const sx: Record<string, React.CSSProperties> = {
    sidebarHeader: { padding: "0 0 12px", display: "flex" as const, justifyContent: "space-between" as const, alignItems: "center" as const, gap: 8, flexWrap: "wrap" as const },
    sidebarTitle: { margin: 0, fontSize: 16, minWidth: 0, overflowWrap: "anywhere" as const },
    emptyState: { padding: 32, textAlign: "center", flex: 1 },
    header: { padding: "12px 16px", borderBottom: "1px solid var(--color-border)", display: "flex" as const, justifyContent: "space-between" as const, alignItems: "center" as const, flexWrap: "wrap" as const, gap: 8, flexShrink: 0, minWidth: 0 },
    headerTitle: { margin: 0, fontSize: 18, minWidth: 0, overflowWrap: "anywhere" as const },
    addForm: { background: "var(--color-surface)", color: "var(--color-text)", border: "1px solid var(--color-border)", borderRadius: "var(--radius)", padding: "16px", margin: "12px 0", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" },
    addFormHeader: { display: "flex" as const, justifyContent: "space-between" as const, alignItems: "center" as const },
    addFormH3: { margin: 0, fontSize: "16px", fontWeight: 600 },
    addFormField: { marginTop: "10px" },
    addFormLabel: { fontSize: "13px", fontWeight: 600, display: "block" as const, marginBottom: "6px" },
    addFormInput: { width: "100%", padding: "8px 10px", fontSize: "13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" },
    addFormActions: { display: "flex" as const, gap: "8px", justifyContent: "flex-end" as const, flexWrap: "wrap" as const, marginTop: "8px" },
    emptyLinks: { textAlign: "center", padding: "32px 16px", flex: 1 },
    linkList: { flex: 1, overflowY: "auto", padding: 0, margin: 0, listStyle: "none" },
    linkItem: { display: "flex" as const, flexDirection: "column" as const, background: "var(--color-surface)", color: "var(--color-text)", border: "1px solid var(--color-border)", borderRadius: "var(--radius)", padding: "14px", margin: "12px 0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", minWidth: 0 },
    linkHeader: { display: "flex" as const, justifyContent: "space-between" as const, alignItems: "flex-start" as const, flexWrap: "wrap" as const, gap: 8, minWidth: 0 },
    linkTitleWrap: { display: "flex" as const, alignItems: "baseline" as const, gap: 8, flex: "1 1 180px", minWidth: 0 },
    linkActions: { display: "flex" as const, gap: "6px", alignItems: "center", flexWrap: "wrap" as const },
    linkUrl: { marginTop: "2px", marginBottom: "6px", minWidth: 0 },
    linkNotes: { background: "var(--color-bg-subtle)", borderLeft: "3px solid var(--color-accent-primary)", padding: "8px 12px", borderRadius: "0 var(--radius-sm) var(--radius-sm) 0", fontSize: "13px", lineHeight: "1.5", color: "var(--color-text)", margin: "6px 0 8px 0", whiteSpace: "pre-wrap", overflowWrap: "anywhere" as const },
    linkTags: { display: "flex" as const, gap: "6px", flexWrap: "wrap", alignItems: "center", marginTop: "4px" },
    tagChip: { margin: 0, background: "var(--color-bg-subtle)" },
    tagDate: { marginLeft: "auto", fontSize: "11px", color: "var(--color-text-muted)" },
    linkAnchor: { fontWeight: 600, fontSize: "15px", color: "var(--color-accent-primary)", textDecoration: "none", overflowWrap: "anywhere" as const },
    linkUrlAnchor: { fontSize: "12px", color: "var(--color-text-muted)", textDecoration: "none", wordBreak: "break-all" },
  };

  return (
    <div className="home-links-tab split-pane">
      <aside className="link-folders-sidebar split-sidebar">
        <div style={sx.sidebarHeader}>
          <h2 style={sx.sidebarTitle}>Link folders</h2>
          <button type="button" className="btn-secondary btn-small clickable" onClick={() => document.getElementById("new-folder-input")?.focus()} data-tip="New link folder" data-tip-align="right">New</button>
        </div>
        <FolderTree
          foldersAsGrid
          rootInputId="new-folder-input"
          folders={folders}
          items={links}
          folderId={(f) => f.id}
          folderParentId={(f) => f.parentFolderId}
          folderTitle={(f) => f.title}
          itemId={(l) => l.id}
          itemFolderId={(l) => l.folderId}
          itemTitle={(l) => l.title}
          selectedId={selId}
          onSelectFolder={(id) => { setSelType("folder"); setSelId(id); }}
          onSelectItem={(id) => { const l = links.find((x) => x.id === id); if (l) startEdit(l); setSelType("link"); setSelId(id); }}
          onCreateFolder={handleCreateFolder}
          onRenameFolder={handleRenameFolder}
          onDeleteFolder={handleDeleteFolder}
          newFolderPlaceholder={selType === "folder" ? `New folder under "${currentFolder?.title}"…` : "New folder…"}
          renderFolderMeta={(f) => {
            const n = links.filter((l) => l.folderId === f.id).length;
            return n > 0 ? <span className="item-meta">{n}</span> : null;
          }}
        />
      </aside>

      <main className="link-list-main split-main">
        <header className="page-header" style={sx.header}>
          <div style={{ minWidth: 0, flex: "1 1 auto" }}>
            <h1 style={sx.headerTitle}>{currentFolder?.title ?? currentLink?.title ?? "Links"}</h1>
          </div>
          <button
            type="button"
            className="btn-primary clickable"
            onClick={() => { setShowAddForm(true); setEditingId(null); setTargetFolderId(selType === "folder" ? selId : null); setTitle(""); setUrl(""); setNotes(""); setTags(""); setError(null); }}
            data-tip="Add a link"
            data-tip-align="right"
          >
            Add link
          </button>
        </header>

        {showAddForm && (
          <form onSubmit={handleSaveLink} className="stack" style={sx.addForm}>
            <div style={sx.addFormHeader}>
              <h3 style={sx.addFormH3}>{editingId ? "Edit link" : "Add a link"}</h3>
              <button
                type="button"
                className="modal-close-x clickable"
                aria-label="Close link form"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingId(null);
                  setError(null);
                }}
              >
                ×
              </button>
            </div>
            <div style={sx.addFormField}>
              <label htmlFor="link-url" style={sx.addFormLabel}>URL <span style={{ color: "var(--color-accent-issue)" }}>*</span></label>
              <input
                id="link-url"
                autoFocus
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                style={sx.addFormInput}
              />
            </div>
            <div style={sx.addFormField}>
              <label htmlFor="link-title" style={sx.addFormLabel}>Title</label>
              <input
                id="link-title"
                placeholder="Link title (defaults to domain)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={sx.addFormInput}
              />
            </div>
            <div style={sx.addFormField}>
              <label htmlFor="link-notes" style={sx.addFormLabel}>Notes</label>
              <textarea
                id="link-notes"
                rows={3}
                placeholder="Notes about this link"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={sx.addFormInput}
              />
            </div>
            <div style={sx.addFormField}>
              <label htmlFor="link-tags" style={sx.addFormLabel}>Tags (comma-separated)</label>
              <input
                id="link-tags"
                placeholder="research, docs, tools"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                style={sx.addFormInput}
              />
            </div>
            {error && <p className="form-error">{error}</p>}
            <div style={sx.addFormActions}>
              <ProofreadTrigger value={notes} onApply={setNotes} />
              <button type="button" className="btn-secondary clickable" onClick={() => { setShowAddForm(false); setEditingId(null); setTitle(""); setUrl(""); setNotes(""); setTags(""); setError(null); }} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="btn-primary clickable" disabled={saving}>
                {saving ? "Saving…" : editingId ? "Save changes" : "Save link"}
              </button>
            </div>
          </form>
        )}

        {filtered.length === 0 && !showAddForm ? (
          <div className="empty-state" style={sx.emptyLinks}>
            <p>No links in {currentFolder?.title ? `“${currentFolder.title}”` : "this folder"}.</p>
            <button type="button" className="btn-primary btn-small clickable" onClick={() => { setShowAddForm(true); setEditingId(null); setTargetFolderId(selType === "folder" ? selId : null); setTitle(""); setUrl(""); setNotes(""); setTags(""); setError(null); }}>
              Add your first link
            </button>
          </div>
        ) : (
          <ul className="item-list" style={sx.linkList}>
            {filtered.map((link) => (
              <li key={link.id} className="item" style={sx.linkItem}>
                <div style={sx.linkHeader}>
                  <div style={sx.linkTitleWrap}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      style={sx.linkAnchor}
                      className="clickable"
                      data-tip="Open link"
                    >
                      {link.title || link.url}
                    </a>
                  </div>
                  <div style={sx.linkActions}>
                    <button type="button" className="btn-secondary btn-small clickable" onClick={() => copyToClipboard(link.url)} data-tip="Copy link URL">Copy</button>
                    <button type="button" className="btn-secondary btn-small clickable" onClick={() => startEdit(link)} data-tip="Edit link">Edit</button>
                    <button type="button" className="btn-secondary btn-small clickable" onClick={() => handleDeleteLink(link.id, link.title)} data-tip="Delete link" data-tip-align="right" style={{ color: "var(--color-accent-issue)" }}>Delete</button>
                  </div>
                </div>
                {link.url && (
                  <div style={sx.linkUrl}>
                    <a href={link.url} target="_blank" rel="noreferrer noopener" style={sx.linkUrlAnchor}>{link.url}</a>
                  </div>
                )}
                {link.notes && (
                  <div style={sx.linkNotes}>{link.notes}</div>
                )}
                <div style={sx.linkTags}>
                  {link.tags.map((tag) => (
                    <span key={tag} className="chip-small" style={sx.tagChip}>#{tag}</span>
                  ))}
                  <span style={sx.tagDate}>{new Date(link.updatedAt).toLocaleDateString()}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
