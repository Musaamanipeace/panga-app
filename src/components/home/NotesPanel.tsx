import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createNote,
  deleteNote,
  listAllNotes,
  updateNote,
  type Note,
} from "../../data/notes";
import {
  createNoteFolder,
  deleteNoteFolder,
  listNoteFolders,
  updateNoteFolder,
  type NoteFolder,
} from "../../data/noteFolders";
import { confirmDelete, copyToClipboard } from "../ui";
import ReadAloudButton from "../ReadAloudButton";
import { ProofreadTrigger } from "../Proofread";
import FolderTree from "./FolderTree";

export default function NotesPanel({ initialFolderId }: { initialFolderId?: string | null }) {
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selType, setSelType] = useState<"folder" | "note" | null>(null);
  const [selId, setSelId] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    const [allFolders, allNotes] = await Promise.all([listNoteFolders(), listAllNotes()]);
    setFolders(allFolders);
    setNotes(allNotes);
    setSelId((prev) => {
      if (prev && (allFolders.some((f) => f.id === prev) || allNotes.some((n) => n.id === prev))) {
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
  const currentNote = useMemo(() => notes.find((n) => n.id === selId) ?? null, [notes, selId]);
  const currentNotes = useMemo(() => notes.filter((n) => n.folderId === (currentFolder?.id ?? null)), [notes, currentFolder]);

  const shown = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = currentNotes;
    if (!q) return list.slice().sort((a, b) => b.updatedAt - a.updatedAt);
    return list.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q) ||
        n.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [currentNotes, searchQuery]);

  async function handleCreateFolder(parentId: string | null, title: string) {
    await createNoteFolder({ title: title.trim(), parentFolderId: parentId });
    await reload();
  }

  async function handleRenameFolder(id: string, title: string) {
    await updateNoteFolder(id, { title: title.trim() });
    await reload();
  }

  async function handleDeleteFolder(id: string) {
    const folder = folders.find((f) => f.id === id);
    if (!(await confirmDelete({ kind: "note folder", name: folder?.title }))) return;
    await deleteNoteFolder(id);
    if (selId === id) setSelId(null);
    await reload();
  }

  async function handleSaveNote() {
    const b = body.trim();
    if (!b && !title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await updateNote(editingId, { title: title.trim() || clipTitle(b), body: b, folderId: targetFolderId ?? null });
      } else {
        await createNote({ folderId: targetFolderId ?? (selType === "folder" ? selId : null), title: title.trim() || clipTitle(b), body: b });
      }
      setShowAddForm(false);
      setEditingId(null);
      setTitle("");
      setBody("");
      setTargetFolderId(currentFolder?.id ?? null);
      await reload();
    } catch (err: any) {
      setError(err?.message || "Could not save the note.");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(note: Note) {
    setEditingId(note.id);
    setTargetFolderId(note.folderId ?? null);
    setTitle(note.title);
    setBody(note.body);
    setShowAddForm(true);
  }

  async function handleDelete(id: string, title: string) {
    if (!(await confirmDelete({ kind: "note", name: title }))) return;
    await deleteNote(id);
    await reload();
  }

  const sx: Record<string, React.CSSProperties> = {
    home: { display: "flex" as const, flex: 1, minHeight: 0 },
    sidebar: { flex: "0 0 260px" as const, borderRight: "1px solid var(--color-border)" as const, display: "flex" as const, flexDirection: "column" as const },
    sidebarHeader: { padding: 12, display: "flex" as const, justifyContent: "space-between" as const, alignItems: "center" as const },
    sidebarTitle: { margin: 0, fontSize: 16 },
    main: { flex: 1, minHeight: 0, display: "flex" as const, flexDirection: "column" as const },
    emptyState: { padding: 32, textAlign: "center", flex: 1 },
    header: { padding: "12px 16px", borderBottom: "1px solid var(--color-border)", display: "flex" as const, justifyContent: "space-between" as const, alignItems: "center" as const, flexShrink: 0 },
    headerTitle: { margin: 0, fontSize: 18 },
    mainContent: { padding: "0 16px", flex: 1, overflowY: "auto", display: "flex" as const, flexDirection: "column" as const },
    addForm: { background: "white", border: "1px solid var(--color-border)", borderRadius: "var(--radius)", padding: "16px", marginBottom: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.04)" },
    addFormHeader: { display: "flex" as const, justifyContent: "space-between" as const, alignItems: "center" as const },
    addFormH3: { margin: 0, fontSize: "16px", fontWeight: 600 },
    addFormField: { marginTop: "8px" },
    addFormInput: { width: "100%", padding: "8px 10px", fontSize: "14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" },
    addFormTextarea: { width: "100%", padding: "8px 10px", fontSize: "14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", resize: "vertical" },
    addFormActions: { display: "flex" as const, gap: "8px", justifyContent: "flex-end" as const, marginTop: "8px" },
    searchRow: { marginTop: 8, display: "flex" as const, gap: 8, alignItems: "center" as const, marginBottom: 8 },
    searchInput: { padding: "6px 10px", fontSize: "13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", flex: 1 },
    noteList: { flex: 1, overflowY: "auto", padding: 0, margin: 0, listStyle: "none" },
    noteFormItem: { padding: "12px 16px", background: "white", border: "1px solid var(--color-border)", borderRadius: "var(--radius)", margin: "12px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" },
    noteItem: { background: "white", border: "1px solid var(--color-border)", borderRadius: "var(--radius)", padding: "14px", margin: "12px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" },
    noteHeader: { display: "flex" as const, justifyContent: "space-between" as const, alignItems: "flex-start" as const, gap: 8, marginBottom: 6 },
    noteTitle: {},
    noteBody: { whiteSpace: "pre-wrap", lineHeight: 1.5, color: "var(--color-text)", margin: 0 },
    noteActions: { marginTop: 10, display: "flex" as const, gap: 8 },
    noteTitleInput: { width: "100%", padding: "6px 8px", fontSize: "14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", marginBottom: 6 },
    noteBodyTextarea: { width: "100%", padding: "6px 8px", fontSize: "14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", marginBottom: 8, resize: "vertical" },
    readAloudBtn: { padding: "2px 8px", fontSize: "12px" },
  };

  return (
    <div className="pg-notes-home" style={sx.home}>
      <aside className="note-folders-sidebar" style={sx.sidebar}>
        <div style={sx.sidebarHeader}>
          <h2 style={sx.sidebarTitle}>Note folders</h2>
          <button type="button" className="btn-secondary btn-small clickable" onClick={() => document.getElementById("new-note-folder-input")?.focus()} data-tip="New note folder">New</button>
        </div>
        <FolderTree
          foldersAsGrid
          folders={folders}
          items={notes}
          folderId={(f) => f.id}
          folderParentId={(f) => f.parentFolderId}
          folderTitle={(f) => f.title}
          itemId={(n) => n.id}
          itemFolderId={(n) => n.folderId}
          itemTitle={(n) => n.title}
          selectedId={selId}
          onSelectFolder={(id) => { setSelType("folder"); setSelId(id); }}
          onSelectItem={(id) => { const n = notes.find((x) => x.id === id); if (n) startEdit(n); setSelType("note"); setSelId(id); }}
          onCreateFolder={handleCreateFolder}
          onRenameFolder={handleRenameFolder}
          onDeleteFolder={handleDeleteFolder}
          newFolderPlaceholder={selType === "folder" ? `New folder under "${currentFolder?.title}"…` : "New folder…"}
          renderFolderMeta={(f) => {
            const n = notes.filter((x) => x.folderId === f.id).length;
            return n > 0 ? <span className="item-meta">{n}</span> : null;
          }}
        />
      </aside>

      <main className="notes-main" style={sx.main}>
        <header className="page-header" style={sx.header}>
          <div>
            <h1 style={sx.headerTitle}>{currentFolder?.title ?? currentNote?.title ?? "Notes"}</h1>
          </div>
          <button
            type="button"
            className="btn-primary clickable"
            onClick={() => { setShowAddForm(true); setEditingId(null); setTargetFolderId(selType === "folder" ? selId : null); setTitle(""); setBody(""); setError(null); }}
            data-tip="Add a note"
          >
            Add note
          </button>
        </header>

        <div style={sx.mainContent}>
          {showAddForm && (
            <form onSubmit={(e) => { e.preventDefault(); void handleSaveNote(); }} className="stack" style={sx.addForm}>
              <div style={sx.addFormHeader}>
                <h3 style={sx.addFormH3}>{editingId ? "Edit note" : "Add a note"}</h3>
              </div>
              <div style={sx.addFormField}>
                <input
                  autoFocus
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={sx.addFormInput}
                />
              </div>
              <div style={sx.addFormField}>
                <textarea
                  placeholder="Write your note…"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={5}
                  spellCheck
                  lang="en"
                  style={sx.addFormTextarea}
                />
              </div>
              {error && <p className="form-error">{error}</p>}
              <div style={sx.addFormActions}>
                <ProofreadTrigger value={body} onApply={setBody} />
                <button type="button" className="btn-secondary clickable" onClick={() => { setShowAddForm(false); setEditingId(null); setTitle(""); setBody(""); setError(null); }} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary clickable" disabled={saving}>
                  {saving ? "Saving…" : editingId ? "Save changes" : "Save note"}
                </button>
              </div>
            </form>
          )}

          <div style={sx.searchRow}>
            <input
              type="search"
              placeholder="Search notes…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={sx.searchInput}
              spellCheck
            />
          </div>

          {shown.length === 0 && !showAddForm ? (
            <div className="empty-state" style={sx.emptyState}>
              <p>No notes in {currentFolder?.title ? `“${currentFolder.title}”` : "this folder"}.</p>
              <button type="button" className="btn-primary btn-small clickable" onClick={() => { setShowAddForm(true); setEditingId(null); setTargetFolderId(selType === "folder" ? selId : null); setTitle(""); setBody(""); setError(null); }}>
                Add your first note
              </button>
            </div>
          ) : (
            <ul className="pg-list" style={sx.noteList}>
              {shown.map((n) => (
                editingId === n.id ? (
                  <li key={n.id} className="pg-note-form" style={sx.noteFormItem}>
                    <input
                      autoFocus
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      spellCheck
                      style={sx.noteTitleInput}
                    />
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={5}
                      spellCheck
                      lang="en"
                      style={sx.noteBodyTextarea}
                    />
                    <div className="pg-actions" style={sx.noteActions}>
                      <ProofreadTrigger value={body} onApply={setBody} />
                      <button type="button" className="btn-primary btn-small" onClick={() => void handleSaveNote()}>
                        Save
                      </button>
                      <button type="button" className="btn-secondary btn-small" onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                    </div>
                  </li>
                ) : (
                  <li key={n.id} className="pg-note" style={sx.noteItem}>
                    <div style={sx.noteHeader}>
                      <strong style={sx.noteTitle}>{n.title}</strong>
                    </div>
                    {n.body && <p className="pg-body" style={sx.noteBody}>{n.body}</p>}
                    <div className="pg-actions" style={sx.noteActions}>
                      <button type="button" className="btn-secondary btn-small" onClick={() => copyToClipboard(n.body ?? n.title)}>Copy</button>
                      <ReadAloudButton text={() => `${n.title}. ${n.body ?? ""}`} label="Read" />
                      <button type="button" className="btn-secondary btn-small" onClick={() => startEdit(n)}>Edit</button>
                      <button type="button" className="btn-secondary btn-small" onClick={() => handleDelete(n.id, n.title)} style={{ color: "var(--color-accent-issue)" }}>Delete</button>
                    </div>
                  </li>
                )
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );

  function clipTitle(t: string): string {
    return t.trim().slice(0, 60) || "Untitled note";
  }
}
