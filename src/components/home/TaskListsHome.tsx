import { useEffect, useMemo, useState } from "react";
import {
  createTask,
  deleteTask,
  getTaskTree,
  listAllTasks,
  toggleTaskCompleted,
  updateTask,
  addSubtask as dataAddSubtask,
  type Task,
  type TaskNode,
} from "../../data/tasks";
import {
  createTaskList,
  deleteTaskList,
  listTaskLists,
  renameTaskList,
  type TaskList,
} from "../../data/taskLists";
import { ProofreadTrigger } from "../Proofread";
import { confirmDelete, useAsync } from "../ui";

/** Flat task lists: lists and their checklist items, no folder tree. */
export default function TaskListsHome({
  initialListId,
}: {
  /** Legacy search deep links may still pass a folder id; folders no longer exist here. */
  initialFolderId?: string | null;
  initialListId?: string | null;
}) {
  const { data, error, loading, reload } = useAsync(async () => {
    const [lists, tasks] = await Promise.all([listTaskLists(), listAllTasks()]);
    return { lists, tasks };
  }, []);

  useEffect(() => {
    const onUpdate = () => void reload();
    window.addEventListener("panga-data-updated", onUpdate);
    return () => window.removeEventListener("panga-data-updated", onUpdate);
  }, [reload]);

  const [selId, setSelId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");

  // Search results select a list directly.
  useEffect(() => {
    if (!data || !initialListId) return;
    if (data.lists.some((l) => l.id === initialListId)) setSelId(initialListId);
  }, [data, initialListId]);

  const lists: TaskList[] = data?.lists ?? [];
  const allTasks: Task[] = data?.tasks ?? [];

  const counts = useMemo(() => {
    const map: Record<string, { active: number; completed: number }> = {};
    for (const t of allTasks) {
      const key = t.listId ?? "";
      if (!map[key]) map[key] = { active: 0, completed: 0 };
      map[key][t.completed ? "completed" : "active"]++;
    }
    return map;
  }, [allTasks]);

  const list = lists.find((l) => l.id === selId) ?? null;

  async function handleAddList(e: React.FormEvent) {
    e.preventDefault();
    const title = newListTitle.trim();
    if (!title) return;
    const created = await createTaskList({ title });
    setNewListTitle("");
    setAdding(false);
    await reload();
    if (created?.id) setSelId(created.id);
  }

  async function commitRename(id: string) {
    const next = renameDraft.trim();
    setRenaming(null);
    if (!next) return;
    await renameTaskList(id, next);
    await reload();
  }

  async function handleDeleteList(id: string) {
    const lst = lists.find((l) => l.id === id);
    if (!(await confirmDelete({ kind: "task list", name: lst?.title }))) return;
    await deleteTaskList(id);
    if (selId === id) setSelId(null);
    await reload();
  }

  if (error) return <div className="error-banner" role="alert">{String(error)}</div>;
  if (loading && !data) return <div className="empty-state">Loading task lists…</div>;

  return (
    <div className="tl-home" data-view={list ? "tasks" : "lists"}>
      <section className="tl-lists-pane" aria-label="Task lists">
        <header className="tl-pane-head">
          <h2>Task lists</h2>
          <button
            type="button"
            className="btn-secondary btn-small clickable"
            onClick={() => setAdding((a) => !a)}
            aria-expanded={adding}
          >
            {adding ? "Cancel" : "New"}
          </button>
        </header>

        {adding && (
          <form className="tl-add-form" onSubmit={handleAddList}>
            <input
              autoFocus
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              placeholder="New task list name"
              aria-label="New task list name"
            />
            <button type="submit" className="btn-primary btn-small clickable" disabled={!newListTitle.trim()}>
              Add
            </button>
          </form>
        )}

        {lists.length === 0 ? (
          <p className="tl-empty">No task lists yet. Use New to create one.</p>
        ) : (
          <ul className="tl-list">
            {lists.map((l) => {
              const c = counts[l.id] ?? { active: 0, completed: 0 };
              const done = c.active === 0 && c.completed > 0;
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    className={`tl-row clickable${l.id === selId ? " tl-row-active" : ""}`}
                    aria-current={l.id === selId ? "true" : undefined}
                    onClick={() => setSelId(l.id)}
                  >
                    <span className={`tl-box${done ? " tl-box-done" : ""}`} aria-hidden="true" />
                    <span className="tl-row-title">{l.title}</span>
                    <span className="tl-row-meta">
                      {c.active} active{c.completed > 0 ? ` · ${c.completed} done` : ""}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="tl-tasks-pane sweep-on-mount" key={list?.id ?? "none"} aria-label="Tasks">
        {!list ? (
          <p className="tl-empty tl-empty-pane">Select a task list to see its tasks.</p>
        ) : (
          <>
            <header className="tl-pane-head">
              <button type="button" className="btn-secondary btn-small clickable tl-back" onClick={() => setSelId(null)}>
                Back
              </button>
              {renaming === list.id ? (
                <input
                  autoFocus
                  className="tl-rename"
                  value={renameDraft}
                  aria-label="List name"
                  onChange={(e) => setRenameDraft(e.target.value)}
                  onBlur={() => void commitRename(list.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void commitRename(list.id);
                    if (e.key === "Escape") setRenaming(null);
                  }}
                />
              ) : (
                <h2 className="tl-title">{list.title}</h2>
              )}
              <div className="tl-head-actions">
                <button
                  type="button"
                  className="btn-secondary btn-small clickable"
                  onClick={() => {
                    setRenameDraft(list.title);
                    setRenaming(list.id);
                  }}
                >
                  Rename
                </button>
                <button
                  type="button"
                  className="btn-secondary btn-small clickable tl-danger"
                  onClick={() => void handleDeleteList(list.id)}
                >
                  Delete
                </button>
              </div>
            </header>
            <TaskTree listId={list.id} onChanged={reload} />
          </>
        )}
      </section>
    </div>
  );
}

function TaskTree({ listId, onChanged }: { listId: string; onChanged: () => void | Promise<unknown> }) {
  const { data, error, loading, reload } = useAsync(async () => getTaskTree(listId), [listId]);
  const [subtask, setSubtask] = useState<{ parentId: string; title: string } | null>(null);
  const [rootTitle, setRootTitle] = useState("");

  useEffect(() => {
    const onUpdate = () => void reload();
    window.addEventListener("panga-data-updated", onUpdate);
    return () => window.removeEventListener("panga-data-updated", onUpdate);
  }, [reload]);

  async function refresh() {
    await Promise.all([reload(), onChanged()]);
  }

  if (error) return <div className="error-banner" role="alert">{String(error)}</div>;
  if (loading && !data) return <div className="empty-state">Loading tasks…</div>;

  const roots: TaskNode[] = data ?? [];

  async function addRoot(e: React.FormEvent) {
    e.preventDefault();
    const title = rootTitle.trim();
    if (!title) return;
    await createTask({ listId, title });
    setRootTitle("");
    await refresh();
  }

  async function addSubtask(e: React.FormEvent) {
    e.preventDefault();
    if (!subtask || !subtask.title.trim()) return;
    await dataAddSubtask(subtask.parentId, subtask.title.trim());
    setSubtask(null);
    await refresh();
  }

  return (
    <div className="tl-tree">
      {subtask ? (
        <form className="tl-add-form" onSubmit={addSubtask}>
          <input
            autoFocus
            value={subtask.title}
            onChange={(e) => setSubtask({ ...subtask, title: e.target.value })}
            placeholder="Subtask title"
            aria-label="Subtask title"
          />
          <button type="submit" className="btn-primary btn-small clickable" disabled={!subtask.title.trim()}>
            Add
          </button>
          <button type="button" className="btn-secondary btn-small clickable" onClick={() => setSubtask(null)}>
            Cancel
          </button>
        </form>
      ) : (
        <form className="tl-add-form" onSubmit={addRoot}>
          <input
            value={rootTitle}
            onChange={(e) => setRootTitle(e.target.value)}
            placeholder="Add a task"
            aria-label="Add a task"
          />
          {rootTitle.trim() && <ProofreadTrigger value={rootTitle} onApply={setRootTitle} />}
          <button type="submit" className="btn-primary btn-small clickable" disabled={!rootTitle.trim()}>
            Add
          </button>
        </form>
      )}

      {roots.length === 0 ? (
        <p className="tl-empty">No tasks yet. Add one above.</p>
      ) : (
        <ul className="tl-tasks">
          {roots.map((node) => (
            <TaskTreeNode
              key={node.task.id}
              node={node}
              onToggle={async (t) => {
                await toggleTaskCompleted(t.id);
                await refresh();
              }}
              onEdit={async (t, next) => {
                await updateTask(t.id, { title: next.trim() });
                await refresh();
              }}
              onDelete={async (t) => {
                if (!(await confirmDelete({ kind: "task", name: t.title }))) return;
                await deleteTask(t.id);
                await refresh();
              }}
              onAddSubtask={(parentId) => setSubtask({ parentId, title: "" })}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function TaskTreeNode({
  node,
  onToggle,
  onEdit,
  onDelete,
  onAddSubtask,
}: {
  node: TaskNode;
  onToggle: (task: Task) => void | Promise<void>;
  onEdit: (task: Task, next: string) => void | Promise<void>;
  onDelete: (task: Task) => void | Promise<void>;
  onAddSubtask: (parentId: string) => void;
}) {
  const task = node.task;
  const [open, setOpen] = useState(node.children.length > 0);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);

  function commitEdit() {
    setEditing(false);
    const next = draft.trim();
    if (next && next !== task.title) void onEdit(task, next);
    else setDraft(task.title);
  }

  return (
    <li className="tl-task">
      <div className="tl-task-row">
        <input
          type="checkbox"
          className="tl-check"
          checked={task.completed}
          onChange={() => void onToggle(task)}
          aria-label={`Tick off ${task.title}`}
        />
        {editing ? (
          <input
            autoFocus
            className="tl-task-edit"
            value={draft}
            aria-label="Task title"
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitEdit();
              if (e.key === "Escape") {
                setDraft(task.title);
                setEditing(false);
              }
            }}
          />
        ) : (
          <span
            className={`tl-task-title${task.completed ? " pg-done" : ""}`}
            onDoubleClick={() => setEditing(true)}
            title="Double-click to edit"
          >
            {task.title}
          </span>
        )}
        {task.dueDate && <span className="tl-task-due">{new Date(task.dueDate).toLocaleDateString()}</span>}
        <span className="tl-task-actions">
          {node.children.length > 0 && (
            <button type="button" className="btn-secondary btn-small clickable" onClick={() => setOpen((v) => !v)}>
              {open ? "Hide" : "Show"}
            </button>
          )}
          <button type="button" className="btn-secondary btn-small clickable" onClick={() => setEditing(true)}>
            Edit
          </button>
          <button type="button" className="btn-secondary btn-small clickable" onClick={() => onAddSubtask(task.id)}>
            Subtask
          </button>
          <button type="button" className="btn-secondary btn-small clickable tl-danger" onClick={() => void onDelete(task)}>
            Delete
          </button>
        </span>
      </div>
      {open && node.children.length > 0 && (
        <ul className="tl-tasks tl-subtasks">
          {node.children.map((child) => (
            <TaskTreeNode
              key={child.task.id}
              node={child}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddSubtask={onAddSubtask}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
