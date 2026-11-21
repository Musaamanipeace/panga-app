import { useCallback, useEffect, useMemo, useState } from "react";
import { createResource, deleteResource, listAllResources, updateResource, type Resource } from "../../data/resources";
import { clipTitle } from "../../data/clips";
import { confirmDelete, copyToClipboard } from "../ui";
import ReadAloudButton from "../ReadAloudButton";

const PREFIX = "cat:";
const catOf = (r: Resource): string => (r.tags.find((t) => t.startsWith(PREFIX)) ?? "").slice(PREFIX.length);

export default function NotesPanel() {
  const [notes, setNotes] = useState<Resource[]>([]);
  const [filter, setFilter] = useState<string>("__all");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [cat, setCat] = useState("");
  const [edit, setEdit] = useState<{ id: string; title: string; body: string; cat: string } | null>(null);

  const reload = useCallback(async () => {
    const all = await listAllResources();
    setNotes(all.filter((r) => r.category === "notes").sort((a, b) => b.updatedAt - a.updatedAt));
  }, []);

  useEffect(() => {
    void reload();
    const h = () => void reload();
    window.addEventListener("panga-data-updated", h);
    return () => window.removeEventListener("panga-data-updated", h);
  }, [reload]);

  const categories = useMemo(() => [...new Set(notes.map(catOf).filter(Boolean))].sort(), [notes]);
  const shown = notes.filter((n) => filter === "__all" || (filter === "__none" ? !catOf(n) : catOf(n) === filter));

  async function save() {
    const b = body.trim();
    if (!b && !title.trim()) return;
    const c = cat.trim();
    await createResource({ category: "notes", title: title.trim() || clipTitle(b), body: b, tags: c ? [PREFIX + c] : [] });
    setTitle("");
    setBody("");
    await reload();
  }

  async function saveEdit() {
    if (!edit) return;
    const n = notes.find((x) => x.id === edit.id);
    if (!n) return;
    const other = n.tags.filter((t) => !t.startsWith(PREFIX));
    const c = edit.cat.trim();
    await updateResource(edit.id, { title: edit.title.trim() || clipTitle(edit.body), body: edit.body, tags: c ? [...other, PREFIX + c] : other });
    setEdit(null);
    await reload();
  }

  return (
    <div>
      <div className="pg-note-form">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Write a note…" />
        <div className="pg-capture-row">
          <input value={cat} onChange={(e) => setCat(e.target.value)} list="pg-note-cats" placeholder="Category (type a new one or pick)" />
          <datalist id="pg-note-cats">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <button type="button" className="btn-primary" disabled={!body.trim() && !title.trim()} onClick={() => void save()}>
            Save note
          </button>
        </div>
      </div>

      <div className="pg-chips">
        {[["__all", "All"], ...categories.map((c) => [c, c]), ["__none", "Uncategorised"]].map(([id, label]) => (
          <button key={id} type="button" className={`chip ${filter === id ? "chip-active" : ""}`} onClick={() => setFilter(id)}>
            {label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="pg-muted">No notes here yet.</p>
      ) : (
        <ul className="pg-list">
          {shown.map((n) =>
            edit?.id === n.id ? (
              <li key={n.id} className="pg-note-form">
                <input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
                <textarea value={edit.body} onChange={(e) => setEdit({ ...edit, body: e.target.value })} rows={5} />
                <input value={edit.cat} onChange={(e) => setEdit({ ...edit, cat: e.target.value })} list="pg-note-cats" placeholder="Category" />
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
                  {catOf(n) && <span className="chip-small">{catOf(n)}</span>}
                </div>
                {n.body && <p className="pg-body">{n.body}</p>}
                <div className="pg-actions">
                  <button type="button" className="btn-secondary btn-small" onClick={() => void copyToClipboard(n.body ?? n.title)}>
                    Copy
                  </button>
                  <ReadAloudButton text={() => `${n.title}. ${n.body ?? ""}`} label="Read" />
                  <button type="button" className="btn-secondary btn-small" onClick={() => setEdit({ id: n.id, title: n.title, body: n.body ?? "", cat: catOf(n) })}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-secondary btn-small"
                    onClick={async () => {
                      if (await confirmDelete({ kind: "note", name: n.title })) {
                        await deleteResource(n.id);
                        await reload();
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}
