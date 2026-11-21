import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createNote,
  deleteNote,
  listNotes,
  searchNotes,
  updateNote,
  type Note,
} from "../../data/notes";
import { clipTitle } from "../../data/clips";
import { confirmDelete, copyToClipboard } from "../ui";
import ReadAloudButton from "../ReadAloudButton";

export default function NotesPanel() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filter, setFilter] = useState<string>("__all");
  const [searchQuery, setSearchQuery] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [edit, setEdit] = useState<{ id: string; title: string; body: string; tags: string } | null>(null);

  const tagsList = useMemo(() => [...new Set(notes.flatMap((n) => n.tags))].sort(), [notes]);

  const reload = useCallback(async () => {
    const all = searchQuery.trim() ? await searchNotes(searchQuery) : await listNotes();
    setNotes(all);
  }, [searchQuery]);

  useEffect(() => {
    void reload();
    const h = () => void reload();
    window.addEventListener("panga-data-updated", h);
    return () => window.removeEventListener("panga-data-updated", h);
  }, [reload]);

  const shown = useMemo(() => {
    const cat = (n: Note) => {
      const t = n.tags.find((tag) => tag.startsWith("cat:"));
      return t ? t.slice("cat:".length) : "";
    };
    return notes.filter((n) => {
      if (filter === "__all") return true;
      if (filter === "__none") return !cat(n);
      return cat(n) === filter;
    });
  }, [notes, filter]);

  const categories = useMemo(() => [...new Set(shown.map((n) => { const t = n.tags.find((tag) => tag.startsWith("cat:")); return t ? t.slice("cat:".length) : ""; }).filter(Boolean))].sort(), [shown]);

  async function save() {
    const b = body.trim();
    if (!b && !title.trim()) return;
    const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
    await createNote({ title: title.trim() || clipTitle(b), body: b, tags: tagList });
    setTitle("");
    setBody("");
    setTags("");
    await reload();
  }

  async function saveEdit() {
    if (!edit) return;
    const tagList = edit.tags.split(",").map((t) => t.trim()).filter(Boolean);
    await updateNote(edit.id, { title: edit.title.trim() || clipTitle(edit.body), body: edit.body, tags: tagList });
    setEdit(null);
    await reload();
  }

  async function handleDelete(id: string, title: string) {
    if (!(await confirmDelete({ kind: "note", name: title }))) return;
    await deleteNote(id);
    await reload();
  }

  return (
    <div>
      <div className="pg-note-form">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          spellCheck
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Write a note…"
          spellCheck
          lang="en"
        />
        <div className="pg-capture-row">
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            list="pg-note-cats"
            placeholder="Category (type a new one or pick) & tags"
            spellCheck
          />
          <datalist id="pg-note-cats">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
            {tagsList.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
          <button type="button" className="btn-primary" disabled={!body.trim() && !title.trim()} onClick={() => void save()}>
            Save note
          </button>
        </div>
      </div>

      <div className="pg-chips">
        {[
          ["__all", "All"],
          ...categories.map((c) => [c, c]),
          ["__none", "Uncategorised"],
        ].map(([id, label]) => (
          <button key={id} type="button" className={`chip ${filter === id ? "chip-active" : ""}`} onClick={() => setFilter(id)}>
            {label}
          </button>
        ))}
        <input
          type="search"
          placeholder="Search notes…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginLeft: 10, padding: "4px 8px", fontSize: "13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}
          spellCheck
        />
      </div>

      {shown.length === 0 ? (
        <p className="pg-muted">No notes here yet.</p>
      ) : (
        <ul className="pg-list">
          {shown.map((n) => (
            edit?.id === n.id ? (
              <li key={n.id} className="pg-note-form">
                <input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} spellCheck />
                <textarea value={edit.body} onChange={(e) => setEdit({ ...edit, body: e.target.value })} rows={5} spellCheck lang="en" />
                <input value={edit.tags} onChange={(e) => setEdit({ ...edit, tags: e.target.value })} list="pg-note-cats" placeholder="Category & tags" spellCheck />
                <div className="pg-actions">
                  <button type="button" className="btn-primary btn-small" onClick={() => void saveEdit()}>
                    Save
                  </button>
                  <button type="button" className="btn-secondary btn-small" onClick={() => setEdit(null)}>
                    Cancel
                  </button>
                </div>
              </li>
            ) : (
              <li key={n.id} className="pg-note">
                <div className="pg-row">
                  <strong className="pg-grow">{n.title}</strong>
                  {n.tags.map((tag) => (
                    <span key={tag} className="chip-small">
                      #{tag}
                    </span>
                  ))}
                </div>
                {n.body && <p className="pg-body">{n.body}</p>}
                <div className="pg-actions">
                  <button type="button" className="btn-secondary btn-small" onClick={() => void copyToClipboard(n.body ?? n.title)}>
                    Copy
                  </button>
                  <ReadAloudButton text={() => `${n.title}. ${n.body ?? ""}`} label="Read" />
                  <button type="button" className="btn-secondary btn-small" onClick={() => setEdit({ id: n.id, title: n.title, body: n.body ?? "", tags: (n.tags ?? []).join(", ") })}>
                    Edit
                  </button>
                  <button type="button" className="btn-secondary btn-small" onClick={() => handleDelete(n.id, n.title)}>
                    Delete
                  </button>
                </div>
              </li>
            )
          ))}
        </ul>
      )}
    </div>
  );
}
