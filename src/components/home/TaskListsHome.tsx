import { useEffect, useMemo, useState } from "react";import {
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
import { confirmDelete, useAsync } from "../ui";

export default function TaskListsHome() {
  const { data, error, loading, reload } = useAsync(async () => {
    const [lists, tasks] = await Promise.all([listTaskLists(), listAllTasks()]);
    return { lists, tasks };
  }, []);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newListTitle, setNewListTitle] = useState("");
  const [editingList, setEditingList] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (data?.lists.length && !selectedId) setSelectedId(data.lists[0].id);
  }, [data, selectedId]);

  const lists: TaskList[] = data?.lists ?? [];
  const allTasks: Task[] = data?.tasks ?? [];
  const counts = useMemo(() => {
    const map: Record<string, { active: number; completed: number }> = {};
    for (const t of allTasks) {
      if (!map[t.listId ?? ""]) map[t.listId ?? ""] = { active: 0, completed: 0 };
      map[t.listId ?? ""][t.completed ? "completed" : "active"]++;
    }
    return map;
  }, [allTasks]);

  const list = lists.find((l) => l.id === selectedId) ?? null;

  async function handleAddList(e: React.FormEvent) {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    await createTaskList({ title: newListTitle.trim() });
    setNewListTitle("");
    await reload();
  }

  async function handleRenameList(id: string, title: string) {
    setEditingList(null);
    await renameTaskList(id, title.trim());
    await reload();
  }

  async function handleDeleteList(id: string) {
    if (!(await confirmDelete({ kind: "task list", name: list?.title }))) return;
    await deleteTaskList(id);
    setSelectedId(lists.find((l) => l.id !== id)?.id ?? null);
    await reload();
  }

  if (error) return <div className="error-banner" role="alert">{String(error)}</div>;
  if (loading) return <div className="empty-state">Loading task lists…</div>;

  return (
    <div className="task-lists-home">
      <aside className="task-lists-sidebar">
        <h2>Task lists</h2>
        <form className="quick-add-bar" onSubmit={handleAddList}>
          <input
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
            placeholder="New task list…"
            autoFocus
          />
          <button type="submit" className="btn-primary clickable" disabled={!newListTitle.trim()}>
            +
          </button>
          <button type="button" className="btn-secondary btn-small" onClick={() => setNewListTitle("")}>
            ✕
          </button>
        </form>
        <ul className="item-list">
          {lists.length === 0 ? (
            <p className="empty-state">No task lists yet. Create one above.</p>
          ) : (
            lists.map((l) => {
              const c = counts[l.id] ?? { active: 0, completed: 0 };
              const active = selectedId === l.id;
              return (
                <li key={l.id} className={`item ${active ? "item-active" : ""}`}>
                  <button
                    type="button"
                    className="clickable"
                    onClick={() => setSelectedId(l.id)}
                    style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", background: "none", border: "none", padding: 6, cursor: "pointer" }}
                  >
                    {editingList?.id === l.id ? (
                      <input
                        autoFocus
                        value={editingList.title}
                        onChange={(e) => setEditingList({ ...editingList, title: e.target.value })}
                        onBlur={() => handleRenameList(l.id, editingList.title)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRenameList(l.id, editingList.title);
                          if (e.key === "Escape") setEditingList(null);
                        }}
                      />
                    ) : (
                      <>
                        <span className="item-title">{l.title}</span>
                        <span className="item-meta">{c.active} active{c.completed > 0 ? ` · ${c.completed} done` : ""}</span>
                      </>
                    )}
                    <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                      <button type="button" className="btn-icon clickable" onClick={(e) => { e.stopPropagation(); setEditingList({ id: l.id, title: l.title }); }} data-tip="Rename list">✎</button>
                      <button type="button" className="btn-icon clickable" onClick={(e) => { e.stopPropagation(); void handleDeleteList(l.id); }} data-tip="Delete list" style={{ color: "var(--color-accent-issue)" }}>×</button>
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </aside>

      <main className="task-list-main">
        {!list ? (
          <p className="empty-state">Select a task list to see its tasks.</p>
        ) : (
          <>
            <header className="page-header">
              <div>
                <h1>{list.title}</h1>
                {list.description && <p className="home-subtitle">{list.description}</p>}
              </div>
              <div className="header-actions">
                <NewTaskForm listId={list.id} reload={reload} />
              </div>
            </header>
            <TaskTree listId={list.id} reload={reload} />
          </>
        )}
      </main>
    </div>
  );
}

function NewTaskForm({ listId, reload }: { listId: string; reload: () => void }) {
  const [title, setTitle] = useState("");
  return (
    <form className="quick-add-bar" onSubmit={async (e) => {
      e.preventDefault();
      if (!title.trim()) return;
      await createTask({ listId, title: title.trim() });
      setTitle("");
      await reload();
    }}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a task…" autoFocus />
      <button type="submit" className="btn-action clickable" disabled={!title.trim()}>+</button>
    </form>
  );
}

function TaskTree({ listId, reload }: { listId: string; reload: () => void }) {
  const { data, error, loading } = useAsync(async () => getTaskTree(listId), [listId]);
  const [newSubtask, setNewSubtask] = useState<{ parentId: string; title: string } | null>(null);

  if (error) return <div className="error-banner" role="alert">{String(error)}</div>;
  if (loading) return <div className="empty-state">Loading tasks…</div>;

  const roots: TaskNode[] = data ?? [];

  async function addSubtask(parentId: string) {
    if (!newSubtask || newSubtask.parentId !== parentId) {
      setNewSubtask({ parentId, title: "" });
      return;
    }
    await dataAddSubtask(parentId, newSubtask.title.trim());
    setNewSubtask(null);
    await reload();
  }

  return (
    <div>
      {newSubtask ? (
        <form className="quick-add-bar" onSubmit={async (e) => {
          e.preventDefault();
          if (!newSubtask) return;
          await addSubtask(newSubtask.parentId);
        }}>
          <input value={newSubtask.title} onChange={(e) => setNewSubtask({ ...newSubtask!, title: e.target.value })} placeholder="Subtask title…" autoFocus />
          <button type="submit" className="btn-action clickable" disabled={!newSubtask.title.trim()}>+</button>
          <button type="button" className="btn-secondary btn-small" onClick={() => setNewSubtask(null)}>✕</button>
        </form>
      ) : (
        <NewTaskForm listId={listId} reload={reload} />
      )}
      {roots.length === 0 && !newSubtask ? (
        <p className="empty-state">No tasks yet. Add one above.</p>
      ) : (
        <ul className="item-list">
          {roots.map((node) => (
            <TaskTreeNode key={node.task.id} node={node} onToggle={toggleTask} onEdit={editTitle} onDelete={deleteTaskWithConfirm} onAddSubtask={addSubtask} />
          ))}
        </ul>
      )}
    </div>
  );

  async function toggleTask(task: Task) {
    await toggleTaskCompleted(task.id);
    await reload();
  }

  async function editTitle(task: Task, next: string) {
    await updateTask(task.id, { title: next.trim() });
    await reload();
  }

  async function deleteTaskWithConfirm(task: Task) {
    if (!(await confirmDelete({ kind: "task", name: task.title }))) return;
    await deleteTask(task.id);
    await reload();
  }
}

function TaskTreeNode({
  node,
  depth = 0,
  onToggle,
  onEdit,
  onDelete,
  onAddSubtask,
}: {
  node: TaskNode;
  depth?: number;
  onToggle: (task: Task) => void;
  onEdit: (task: Task, next: string) => void;
  onDelete: (task: Task) => void;
  onAddSubtask: (parentId: string) => void;
}) {
  const task = node.task;
  const [open, setOpen] = useState(node.children.length > 0);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);

  return (
    <li key={task.id} className="item" style={{ paddingLeft: depth * 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {node.children.length > 0 && (
          <button type="button" className="btn-icon clickable" onClick={() => setOpen((v) => !v)} data-tip={open ? "Collapse" : "Expand"}>
            {open ? "▾" : "▸"}
          </button>
        )}
        <input type="checkbox" checked={task.completed} onChange={() => onToggle(task)} aria-label="Tick off" />
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => commitEdit()}
            onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") { setDraft(task.title); setEditing(false); } }}
          />
        ) : (
          <span className={task.completed ? "pg-done" : ""} style={{ flex: 1, minWidth: 0 }} onDoubleClick={() => setEditing(true)} title="Double-click to edit">
            {task.title}
          </span>
        )}
        {task.dueDate && <span className="text-tiny">{new Date(task.dueDate).toLocaleDateString()}</span>}
        <span style={{ marginLeft: "auto" }}>
          <button type="button" className="btn-icon clickable" onClick={() => onAddSubtask(task.id)} data-tip="Add subtask">+</button>
          <button type="button" className="btn-icon clickable" onClick={() => onDelete(task)} data-tip="Delete task">×</button>
        </span>
      </div>
      {open && node.children.length > 0 && (
        <ul className="item-list" style={{ paddingLeft: 22, marginTop: 4 }}>
          {node.children.map((child) => (
            <TaskTreeNode key={child.task.id} node={child} depth={depth + 1} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} onAddSubtask={onAddSubtask} />
          ))}
        </ul>
      )}
    </li>
  );

  function commitEdit() {
    setEditing(false);
    const next = draft.trim();
    if (next && next !== task.title) void onEdit(task, next);
  }
}
