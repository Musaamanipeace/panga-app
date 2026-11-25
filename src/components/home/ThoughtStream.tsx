import { useCallback, useEffect, useState } from "react";
import { addThought, deleteThought, listThoughts, updateThought, type ThoughtEntry } from "../../data/thoughts";
import { createTask } from "../../data/tasks";
import { createNote } from "../../data/notes";
import { listTaskLists, type TaskList } from "../../data/taskLists";
import { listNoteFolders, type NoteFolder } from "../../data/noteFolders";
import { confirmDelete, showToast } from "../ui";
import ReadAloudButton from "../ReadAloudButton";
import { ProofreadTrigger } from "../Proofread";

export const CAPTURE_INPUT_ID = "panga-capture-input";

export default function ThoughtStream() {
  const [thoughts, setThoughts] = useState<ThoughtEntry[]>([]);
  const [draft, setDraft] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [lists, setLists] = useState<TaskList[]>([]);
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [promoting, setPromoting] = useState<{ id: string; text: string } | null>(null);
  const [promoteAs, setPromoteAs] = useState<"task" | "note" | null>(null);
  const [promoteListId, setPromoteListId] = useState<string | null>(null);
  const [promoteFolderId, setPromoteFolderId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const [thoughtsList, allLists, allFolders] = await Promise.all([listThoughts(showAll ? 200 : 8), listTaskLists(), listNoteFolders()]);
    setThoughts(thoughtsList);
    setLists(allLists);
    setFolders(allFolders);
  }, [showAll]);

  useEffect(() => {
    void reload();
    const h = () => void reload();
    window.addEventListener("panga-data-updated", h);
    return () => window.removeEventListener("panga-data-updated", h);
  }, [reload]);

  async function submit() {
    const t = draft.trim();
    if (!t) return;
    setDraft("");
    await addThought(t);
  }

  async function toTask(th: ThoughtEntry) {
    const firstLine = th.text.split(/\r?\n/)[0].slice(0, 160);
    const listId = promoteListId ?? (lists.length ? lists[0].id : null);
    const task = await createTask({ listId, title: firstLine, notes: th.text.length > firstLine.length ? th.text : "" });
    await updateThought(th.id, { taskId: task.id });
    setPromoting(null);
    setPromoteListId(null);
    window.dispatchEvent(new CustomEvent("panga-data-updated"));
    showToast("Added to tasks", "success");
  }

  async function toNote(th: ThoughtEntry) {
    const firstLine = th.text.split(/\r?\n/)[0].slice(0, 160);
    const folderId = promoteFolderId ?? (folders.length ? folders[0].id : null);
    const note = await createNote({ folderId, title: firstLine, body: th.text.length > firstLine.length ? th.text : "" });
    await updateThought(th.id, { noteId: note.id });
    setPromoting(null);
    setPromoteAs(null);
    setPromoteFolderId(null);
    window.dispatchEvent(new CustomEvent("panga-data-updated"));
    showToast("Added to notes", "success");
  }

  return (
    <section className="pg-card">
      <div className="pg-capture-row">
        <textarea
          id={CAPTURE_INPUT_ID}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void submit();
            }
          }}
          rows={2}
          placeholder="What just crossed your mind? (Enter to save, mic to speak)"
        />
        <button type="button" className="btn-primary" disabled={!draft.trim()} onClick={() => void submit()}>
          Add
        </button>
        {draft.trim() && <ProofreadTrigger value={draft} onApply={setDraft} />}
      </div>
      {thoughts.length > 0 && (
        <ul className="pg-list">
          {thoughts.map((th) => {
            const promotingThis = promoting?.id === th.id;
            return (
              <li key={th.id} className="pg-row">
                <span className="pg-grow">
                  {th.text}
                  <time className="pg-muted"> · {new Date(th.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</time>
                </span>
                {th.taskId ? (
                  <span className="chip-small">In tasks</span>
                ) : th.noteId ? (
                  <span className="chip-small">In notes</span>
                ) : promotingThis ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", maxWidth: "100%", minWidth: 0 }}>
                    <select
                      value={promoteAs ?? ""}
                      onChange={(e) => setPromoteAs(e.target.value as "task" | "note")}
                      style={{ fontSize: "12px", padding: "2px 6px", borderRadius: "var(--radius-sm)", maxWidth: "100%", minWidth: 0 }}
                    >
                      <option value="task">Task</option>
                      <option value="note">Note</option>
                    </select>
                    {promoteAs === "task" ? (
                      <>
                        <select
                          value={promoteListId ?? ""}
                          onChange={(e) => setPromoteListId(e.target.value || null)}
                          style={{ fontSize: "12px", padding: "2px 6px", borderRadius: "var(--radius-sm)", maxWidth: "100%", minWidth: 0 }}
                        >
                          <option value="">Inbox</option>
                          {lists.map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.title}
                            </option>
                          ))}
                        </select>
                        <button type="button" className="btn-secondary btn-small clickable" onClick={() => void toTask(th)}>Create</button>
                      </>
                    ) : (
                      <>
                        <select
                          value={promoteFolderId ?? ""}
                          onChange={(e) => setPromoteFolderId(e.target.value || null)}
                          style={{ fontSize: "12px", padding: "2px 6px", borderRadius: "var(--radius-sm)", maxWidth: "100%", minWidth: 0 }}
                        >
                          <option value="">Inbox</option>
                          {folders.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.title}
                            </option>
                          ))}
                        </select>
                        <button type="button" className="btn-secondary btn-small clickable" onClick={() => void toNote(th)}>Create</button>
                      </>
                    )}
                    <button type="button" className="btn-secondary btn-small clickable" onClick={() => { setPromoting(null); setPromoteAs(null); setPromoteListId(null); setPromoteFolderId(null); }}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <button type="button" className="btn-secondary btn-small clickable" onClick={() => { setPromoting({ id: th.id, text: th.text }); setPromoteAs("task"); }} title="Turn this into a task">
                      To task
                    </button>
                    <button type="button" className="btn-secondary btn-small clickable" onClick={() => { setPromoting({ id: th.id, text: th.text }); setPromoteAs("note"); }} title="Turn this into a note">
                      To note
                    </button>
                  </>
                )}
                <ReadAloudButton text={th.text} />
                <button
                  type="button"
                  className="btn-secondary btn-small clickable"
                  aria-label="Delete thought"
                  onClick={async () => {
                    if (await confirmDelete({ kind: "thought" })) await deleteThought(th.id);
                  }}
                >
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <div className="pg-actions">
        <button type="button" className="btn-secondary btn-small" onClick={() => setShowAll((v) => !v)}>
          {showAll ? "Show fewer" : "Show history"}
        </button>
        <button
          type="button"
          className="btn-secondary btn-small"
          onClick={() => window.dispatchEvent(new CustomEvent("panga-ai-command", { detail: "Turn my recent thoughts that are not yet tasks into tasks." }))}
          title="Uses your own AI key"
        >
          ✨ Make tasks from thoughts
        </button>
      </div>
    </section>
  );
}
