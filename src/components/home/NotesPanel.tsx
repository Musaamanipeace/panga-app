import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  type NoteFolder,
} from "../../data/noteFolders";
import { confirmAction, confirmDelete, copyToClipboard } from "../ui";
import ReadAloudButton from "../ReadAloudButton";
import { ProofreadTrigger } from "../Proofread";
import {
  stripMarkdown,
  toggleLinePrefix,
  wrapSelection,
  type EditResult,
  type LineFormat,
} from "./noteFormat";

const ALL = "__all__";
const UNFILED = "__unfiled__";

interface Draft {
  /** null while the note has not been saved yet. */
  id: string | null;
  title: string;
  body: string;
  folderId: string | null;
  baseTitle: string;
  baseBody: string;
}

function clipTitle(t: string): string {
  return stripMarkdown(t).trim().split("\n")[0].slice(0, 60) || "Untitled note";
}

function folderDepth(folders: NoteFolder[], f: NoteFolder): number {
  let depth = 0;
  let cur: NoteFolder | undefined = f;
  while (cur?.parentFolderId && depth < 10) {
    cur = folders.find((x) => x.id === cur!.parentFolderId);
    depth++;
  }
  return depth;
}

export default function NotesPanel({
  initialFolderId,
  initialNoteId,
}: {
  initialFolderId?: string | null;
  initialNoteId?: string | null;
}) {
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [view, setView] = useState<string>(ALL);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [folderMenuOpen, setFolderMenuOpen] = useState(false);
  const [addingFolder, setAddingFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const foldersRef = useRef<HTMLElement>(null);
  const pendingSelection = useRef<{ start: number; end: number } | null>(null);

  const reload = useCallback(async () => {
    const [allFolders, allNotes] = await Promise.all([listNoteFolders(), listAllNotes()]);
    setFolders(allFolders);
    setNotes(allNotes);
    setView((prev) => (prev === ALL || prev === UNFILED || allFolders.some((f) => f.id === prev) ? prev : ALL));
  }, []);

  useEffect(() => {
    void reload();
    const onUpdate = () => void reload();
    window.addEventListener("panga-data-updated", onUpdate);
    return () => window.removeEventListener("panga-data-updated", onUpdate);
  }, [reload]);

  // A search result or shortcut for a folder/note selects it directly.
  useEffect(() => {
    if (initialNoteId) {
      const n = notes.find((x) => x.id === initialNoteId);
      if (n) {
        openNote(n);
        return;
      }
    }
    if (initialFolderId && folders.some((f) => f.id === initialFolderId)) setView(initialFolderId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFolderId, initialNoteId, folders, notes]);

  useEffect(() => {
    if (!folderMenuOpen) return;
    function onPointerDown(e: MouseEvent | TouchEvent) {
      const target = e.target as Node | null;
      if (foldersRef.current && target && !foldersRef.current.contains(target)) {
        setFolderMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setFolderMenuOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [folderMenuOpen]);

  // Restore the caret after a toolbar edit.
  useEffect(() => {
    if (pendingSelection.current && bodyRef.current) {
      const { start, end } = pendingSelection.current;
      bodyRef.current.focus();
      bodyRef.current.setSelectionRange(start, end);
      pendingSelection.current = null;
    }
  }, [draft?.body]);

  const dirty = !!draft && (draft.title !== draft.baseTitle || draft.body !== draft.baseBody);
  const currentFolder = folders.find((f) => f.id === view) ?? null;
  const viewLabel = view === ALL ? "All notes" : view === UNFILED ? "Unfiled" : currentFolder?.title ?? "All notes";

  const shown = useMemo(() => {
    const inView = notes.filter((n) => {
      if (view === ALL) return true;
      if (view === UNFILED) return !n.folderId;
      return n.folderId === view;
    });
    const q = searchQuery.trim().toLowerCase();
    const list = q
      ? inView.filter(
          (n) =>
            n.title.toLowerCase().includes(q) ||
            n.body.toLowerCase().includes(q) ||
            n.tags.some((tag) => tag.toLowerCase().includes(q))
        )
      : inView;
    return list.slice().sort((a, b) => b.updatedAt - a.updatedAt);
  }, [notes, view, searchQuery]);

  function openNote(n: Note) {
    setError(null);
    setDraft({ id: n.id, title: n.title, body: n.body ?? "", folderId: n.folderId ?? null, baseTitle: n.title, baseBody: n.body ?? "" });
  }

  function startNew() {
    setError(null);
    setDraft({
      id: null,
      title: "",
      body: "",
      folderId: view === ALL || view === UNFILED ? null : view,
      baseTitle: "",
      baseBody: "",
    });
  }

  async function closeEditor() {
    if (dirty) {
      const discard = await confirmAction({
        title: "Discard changes?",
        message: "This note has unsaved changes.",
        confirmLabel: "Discard",
        cancelLabel: "Keep editing",
        danger: true,
      });
      if (!discard) return;
    }
    setDraft(null);
    setError(null);
  }

  async function saveNote() {
    if (!draft) return;
    const body = draft.body.trim();
    if (!body && !draft.title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const title = draft.title.trim() || clipTitle(body);
      if (draft.id) {
        await updateNote(draft.id, { title, body, folderId: draft.folderId });
        setDraft({ ...draft, title, body, baseTitle: title, baseBody: body });
      } else {
        const created = await createNote({ folderId: draft.folderId, title, body });
        setDraft({ ...draft, id: created.id, title, body, baseTitle: title, baseBody: body });
      }
      await reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not save the note.");
    } finally {
      setSaving(false);
    }
  }

  async function removeNote() {
    if (!draft?.id) {
      setDraft(null);
      return;
    }
    if (!(await confirmDelete({ kind: "note", name: draft.title }))) return;
    await deleteNote(draft.id);
    setDraft(null);
    await reload();
  }

  function applyEdit(fn: (value: string, start: number, end: number) => EditResult) {
    if (!draft) return;
    const el = bodyRef.current;
    const start = el?.selectionStart ?? draft.body.length;
    const end = el?.selectionEnd ?? draft.body.length;
    const res = fn(draft.body, start, end);
    pendingSelection.current = { start: res.selStart, end: res.selEnd };
    setDraft({ ...draft, body: res.value });
  }

  const wrap = (marker: string) => applyEdit((v, s, e) => wrapSelection(v, s, e, marker));
  const line = (kind: LineFormat) => applyEdit((v, s, e) => toggleLinePrefix(v, s, e, kind));

  async function handleAddFolder(e: React.FormEvent) {
    e.preventDefault();
    const title = folderName.trim();
    if (!title) return;
    const parent = currentFolder?.id ?? null;
    const created = await createNoteFolder({ title, parentFolderId: parent });
    setFolderName("");
    setAddingFolder(false);
    await reload();
    if (created?.id) setView(created.id);
  }

  async function handleDeleteFolder() {
    if (!currentFolder) return;
    if (!(await confirmDelete({ kind: "note folder", name: currentFolder.title, detail: "Its notes move up one level. This cannot be undone." }))) return;
    await deleteNoteFolder(currentFolder.id);
    setView(ALL);
    await reload();
  }

  function pickView(next: string) {
    setView(next);
    setFolderMenuOpen(false);
    setAddingFolder(false);
  }

  const toolbarBtn = "notes-tool clickable";

  return (
    <div className="notes-shell" data-mode={draft ? "edit" : "browse"}>
      <aside className="notes-folders" ref={foldersRef} aria-label="Folders">
        <button
          type="button"
          className="notes-folders-trigger clickable"
          aria-expanded={folderMenuOpen}
          aria-haspopup="menu"
          onClick={() => setFolderMenuOpen((o) => !o)}
        >
          <span className="notes-folders-label">Folders: <strong>{viewLabel}</strong></span>
          <span className={`workspace-caret${folderMenuOpen ? " workspace-caret-open" : ""}`} aria-hidden="true" />
        </button>
        <div className="notes-folders-panel dropdown-anim sweep-on-mount" data-open={folderMenuOpen} role="menu">
          <ul className="notes-folder-list">
            <li>
              <button type="button" role="menuitemradio" aria-checked={view === ALL} className={`notes-folder-item clickable${view === ALL ? " notes-folder-active" : ""}`} onClick={() => pickView(ALL)}>
                All notes <span className="item-meta">{notes.length}</span>
              </button>
            </li>
            {folders.map((f) => (
              <li key={f.id} style={{ paddingLeft: Math.min(folderDepth(folders, f), 4) * 12 }}>
                <button type="button" role="menuitemradio" aria-checked={view === f.id} className={`notes-folder-item clickable${view === f.id ? " notes-folder-active" : ""}`} onClick={() => pickView(f.id)}>
                  {f.title} <span className="item-meta">{notes.filter((n) => n.folderId === f.id).length}</span>
                </button>
              </li>
            ))}
            {notes.some((n) => !n.folderId) && folders.length > 0 && (
              <li>
                <button type="button" role="menuitemradio" aria-checked={view === UNFILED} className={`notes-folder-item clickable${view === UNFILED ? " notes-folder-active" : ""}`} onClick={() => pickView(UNFILED)}>
                  Unfiled <span className="item-meta">{notes.filter((n) => !n.folderId).length}</span>
                </button>
              </li>
            )}
          </ul>
          {addingFolder ? (
            <form className="notes-folder-add" onSubmit={handleAddFolder}>
              <input
                autoFocus
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder={currentFolder ? `New folder in ${currentFolder.title}` : "New folder name"}
                aria-label="New folder name"
              />
              <button type="submit" className="btn-primary btn-small clickable" disabled={!folderName.trim()}>Add</button>
            </form>
          ) : (
            <div className="notes-folder-actions">
              <button type="button" className="btn-secondary btn-small clickable" onClick={() => setAddingFolder(true)}>Add</button>
              <button type="button" className="btn-secondary btn-small clickable tl-danger" disabled={!currentFolder} onClick={() => void handleDeleteFolder()}>Delete</button>
            </div>
          )}
        </div>
      </aside>

      <section className="notes-list-pane" aria-label="Notes">
        <header className="tl-pane-head">
          <h2>{viewLabel}</h2>
          <button type="button" className="btn-primary btn-small clickable" onClick={startNew}>Add note</button>
        </header>
        <input
          type="search"
          className="notes-search"
          placeholder="Search notes"
          aria-label="Search notes"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          spellCheck
        />
        {shown.length === 0 ? (
          <div className="tl-empty">
            <p>{searchQuery.trim() ? "No notes match your search." : `No notes in ${viewLabel}.`}</p>
            {!searchQuery.trim() && (
              <button type="button" className="btn-primary btn-small clickable" onClick={startNew}>Add your first note</button>
            )}
          </div>
        ) : (
          <ul className="notes-cards">
            {shown.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  className={`notes-card clickable${draft?.id === n.id ? " notes-card-active" : ""}`}
                  onClick={() => openNote(n)}
                >
                  <strong className="notes-card-title">{n.title}</strong>
                  {n.body && <span className="notes-card-preview">{stripMarkdown(n.body).slice(0, 160)}</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="notes-editor-pane sweep-on-mount" key={draft ? `edit-${draft.id ?? "new"}` : "idle"} aria-label="Note editor">
        {!draft ? (
          <p className="tl-empty tl-empty-pane">Select a note, or add a new one, to start writing.</p>
        ) : (
          <form
            className="notes-editor"
            onSubmit={(e) => {
              e.preventDefault();
              void saveNote();
            }}
          >
            <header className="tl-pane-head">
              <button type="button" className="btn-secondary btn-small clickable tl-back" onClick={() => void closeEditor()}>Back</button>
              <input
                className="notes-title-input"
                placeholder="Title"
                aria-label="Note title"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                spellCheck
              />
            </header>

            <div className="notes-toolbar" role="toolbar" aria-label="Text formatting">
              <button type="button" className={toolbarBtn} onClick={() => wrap("**")} aria-label="Bold"><b>B</b></button>
              <button type="button" className={toolbarBtn} onClick={() => wrap("*")} aria-label="Italic"><i>I</i></button>
              <button type="button" className={toolbarBtn} onClick={() => line("heading")}>Heading</button>
              <button type="button" className={toolbarBtn} onClick={() => line("bullet")}>Bullets</button>
              <button type="button" className={toolbarBtn} onClick={() => line("numbered")}>Numbered</button>
              <button type="button" className={toolbarBtn} onClick={() => line("checklist")}>Checklist</button>
              <button type="button" className={toolbarBtn} onClick={() => line("quote")}>Quote</button>
              <ProofreadTrigger value={draft.body} onApply={(next) => setDraft((d) => (d ? { ...d, body: next } : d))} />
            </div>

            <textarea
              ref={bodyRef}
              autoFocus={!draft.id}
              className="notes-body-input"
              placeholder="Write your note"
              aria-label="Note text"
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              spellCheck
              lang="en"
            />

            {error && <p className="form-error">{error}</p>}

            <div className="notes-editor-actions">
              <button type="button" className="btn-secondary btn-small clickable" onClick={() => void copyToClipboard(draft.body || draft.title)}>Copy</button>
              <ReadAloudButton text={() => `${draft.title}. ${stripMarkdown(draft.body)}`} label="Read" />
              <button type="button" className="btn-secondary btn-small clickable tl-danger" onClick={() => void removeNote()}>
                {draft.id ? "Delete" : "Discard"}
              </button>
              <button type="submit" className="btn-primary clickable notes-save" disabled={saving || (!dirty && !!draft.id)}>
                {saving ? "Saving…" : !draft.id ? "Save note" : dirty ? "Save changes" : "Saved"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
