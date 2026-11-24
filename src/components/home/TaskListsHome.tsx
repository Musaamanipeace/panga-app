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
import { createTaskListFolder, deleteTaskListFolder, listTaskListFolders, renameTaskListFolder, type TaskListFolder } from "../../data/taskListFolders";
import FolderTree from "./FolderTree";
import { confirmDelete, useAsync } from "../ui";

export default function TaskListsHome({
  initialFolderId,
  initialListId,
}: {
  initialFolderId?: string | null;
  initialListId?: string | null;
}) {
  const { data, error, loading, reload } = useAsync(async () => {
    const [lists, folders, tasks] = await Promise.all([listTaskLists(), listTaskListFolders(), listAllTasks()]);
    return { lists, folders, tasks };
  }, []);

  useEffect(() => {
    const onUpdate = () => void reload();
    window.addEventListener("panga-data-updated", onUpdate);
    return () => window.removeEventListener("panga-data-updated", onUpdate);
  }, [reload]);

  // Search results select the folder / task list directly.
  useEffect(() => {
    if (!data) return;
    const { lists, folders } = data;
    if (initialFolderId) {
      const target = folders.find((x) => x.id === initialFolderId);
      if (target) {
        setSelType("folder");
        setSelId(target.id);
      }
    }
    if (initialListId) {
      const target = lists.find((x) => x.id === initialListId);
      if (target) {
        setSelType("taskList");
        setSelId(target.id);
      }
    }
  }, [data, initialFolderId, initialListId]);

  const [selType, setSelType] = useState<"folder" | "taskList" | null>(null);
  const [selId, setSelId] = useState<string | null>(null);
  const [newListTitle, setNewListTitle] = useState("");
  const [editingList, setEditingList] = useState<{ id: string; title: string } | null>(null);

  const lists: TaskList[] = data?.lists ?? [];
  const folders: TaskListFolder[] = data?.folders ?? [];
  const allTasks: Task[] = data?.tasks ?? [];

  const counts = useMemo(() => {
    const map: Record<string, { active: number; completed: number }> = {};
    for (const t of allTasks) {
      if (!map[t.listId ?? ""]) map[t.listId ?? ""] = { active: 0, completed: 0 };
      map[t.listId ?? ""][t.completed ? "completed" : "active"]++;
    }
    return map;
  }, [allTasks]);

  const list = selType === "taskList" ? lists.find((l) => l.id === selId) ?? null : null;
  const folder = selType === "folder" ? folders.find((f) => f.id === selId) ?? null : null;

  async function handleAddList(e: React.FormEvent) {
    e.preventDefault();
    const title = newListTitle.trim();
    if (!title) return;
    await createTaskList({ title, folderId: selType === "folder" ? selId : null });
    setNewListTitle("");
    await reload();
  }

  async function handleRenameList(id: string, title: string) {
    setEditingList(null);
    await renameTaskList(id, title.trim());
    await reload();
  }

  async function handleDeleteList(id: string) {
    const lst = lists.find((l) => l.id === id);
    if (!(await confirmDelete({ kind: "task list", name: lst?.title }))) return;
    await deleteTaskList(id);
    if (selId === id) setSelId(null);
    await reload();
  }

  async function handleCreateFolder(parentId: string | null, title: string) {
    await createTaskListFolder({ title, parentFolderId: parentId });
    await reload();
  }

  async function handleRenameFolder(id: string, title: string) {
    await renameTaskListFolder(id, title.trim());
    await reload();
  }

  async function handleDeleteFolder(id: string) {
    const f = folders.find((x) => x.id === id);
    if (!(await confirmDelete({ kind: "task list folder", name: f?.title }))) return;
    await deleteTaskListFolder(id);
    if (selId === id) setSelId(null);
    await reload();
  }

  const sx: Record<string, React.CSSProperties> = {
    home: { display: "flex" as const, flex: 1, minHeight: 0 },
    sidebar: { flex: "0 0 260px" as const, borderRight: "1px solid var(--color-border)" as const, display: "flex" as const, flexDirection: "column" as const },
    sidebarHeader: { padding: 12, display: "flex" as const, justifyContent: "space-between" as const, alignItems: "center" as const },
    sidebarTitle: { margin: 0, fontSize: 16 },
    addListForm: { padding: "0 12px 8px", display: "flex" as const, gap: 6 },
    addListInput: { flex: 1, padding: "6px 8px", fontSize: "13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" },
    main: { flex: 1, minHeight: 0, display: "flex" as const, flexDirection: "column" as const },
    emptyState: { padding: 32, textAlign: "center", flex: 1 },
    header: { padding: "12px 16px", borderBottom: "1px solid var(--color-border)", display: "flex" as const, justifyContent: "space-between" as const, alignItems: "center" as const, flexShrink: 0 },
    headerTitle: { margin: 0, fontSize: 18 },
    headerActions: { display: "flex" as const, gap: 6 },
    addTaskForm: { display: "flex" as const, gap: 6 },
    addTaskInput: { padding: "6px 8px", fontSize: "13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" },
    taskTree: { flex: 1, overflowY: "auto" },
    subtaskForm: { padding: "8px 16px", borderBottom: "1px solid var(--color-border)", flexShrink: 0, display: "flex" as const, gap: 6 },
    subtaskInput: { flex: 1, padding: "6px 8px", fontSize: "13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" },
    rootTaskForm: { padding: "8px 16px", borderBottom: "1px solid var(--color-border)", flexShrink: 0, display: "flex" as const, gap: 6 },
    rootTaskInput: { flex: 1, padding: "6px 8px", fontSize: "13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" },
    emptyTasks: { padding: 16, textAlign: "center" },
  };

  if (error) return <div className="error-banner" role="alert">{String(error)}</div>;
  if (loading) return <div className="empty-state">Loading task lists…</div>;

  const inFolder = selType === "folder";

  return (
    <div className="task-lists-home" style={sx.home}>
      <aside className="task-lists-sidebar" style={sx.sidebar}>
        <div style={sx.sidebarHeader}>
          <h2 style={sx.sidebarTitle}>Task lists</h2>
          <button type="button" className="btn-secondary btn-small clickable" onClick={() => document.getElementById("new-list-input")?.focus()} data-tip="New task list">New</button>
        </div>
        <form id="new-list-form" onSubmit={handleAddList} style={sx.addListForm}>
          <input
            id="new-list-input"
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
            placeholder={inFolder ? `New list under "${folder?.title}"…` : "New task list…"}
            autoFocus
            style={sx.addListInput}
          />
          <button type="submit" className="btn-secondary btn-small clickable" disabled={!newListTitle.trim()}>Add</button>
        </form>
        <FolderTree
          foldersAsGrid
          showItemsInGrid
          folders={folders}
          items={lists}
          folderId={(f) => f.id}
          folderParentId={(f) => f.parentFolderId}
          folderTitle={(f) => f.title}
          itemId={(l) => l.id}
          itemFolderId={(l) => l.folderId}
          itemTitle={(l) => l.title}
          selectedId={selId}
          onSelectFolder={(id) => { setSelType("folder"); setSelId(id); }}
          onSelectItem={(id) => { setSelType("taskList"); setSelId(id); }}
          onCreateFolder={handleCreateFolder}
          onRenameFolder={handleRenameFolder}
          onDeleteFolder={handleDeleteFolder}
          onItemAction={() => {}}
          renderFolderMeta={(f) => {
            const childLists = lists.filter((l) => l.folderId === f.id).length;
            const childFolders = folders.filter((x) => x.parentFolderId === f.id).length;
            const n = childLists + childFolders;
            return n > 0 ? <span className="item-meta">{n}</span> : null;
          }}
          renderItemTitle={(l) => (
            <>
              <span className="item-title" style={{ flex: 1, minWidth: 0 }}>{l.title}</span>
              <span className="item-meta">{counts[l.id]?.active ?? 0} active{(counts[l.id]?.completed ?? 0) > 0 ? ` · ${counts[l.id]?.completed ?? 0} done` : ""}</span>
            </>
          )}
          renderItemActions={(l) => (
            <>
              <button
                type="button"
                className="btn-secondary btn-small clickable"
                onClick={(e) => { e.stopPropagation(); setEditingList({ id: l.id, title: l.title }); }}
                data-tip="Rename list"
              >
                Rename
              </button>
              <button
                type="button"
                className="btn-secondary btn-small clickable"
                onClick={(e) => { e.stopPropagation(); void handleDeleteList(l.id); }}
                style={{ color: "var(--color-accent-issue)" }}
                data-tip="Delete list"
              >
                Delete
              </button>
            </>
          )}
        />
      </aside>

      <main className="task-list-main" style={sx.main}>
        {!list ? (
          inFolder && folder ? (
            <>
              <header className="page-header" style={sx.header}>
                <div>
                  <h1 style={sx.headerTitle}>{folder.title}</h1>
                </div>
                <form onSubmit={handleAddList} style={sx.addTaskForm}>
                  <input
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    placeholder={`New list in "${folder.title}"…`}
                    style={sx.addTaskInput}
                  />
                  <button type="submit" className="btn-primary btn-small clickable" disabled={!newListTitle.trim()}>Add list</button>
                </form>
              </header>
              {(() => {
                const folderLists = lists.filter((l) => l.folderId === folder.id);
                if (folderLists.length === 0) {
                  return (
                    <div className="empty-state" style={sx.emptyState}>
                      No task lists in “{folder.title}” yet. Add one above.
                    </div>
                  );
                }
                return (
                  <ul className="pg-list" style={{ padding: 16, margin: 0 }}>
                    {folderLists.map((l) => (
                      <li key={l.id} className="pg-row">
                        <button
                          type="button"
                          className="pg-link pg-grow"
                          onClick={() => { setSelType("taskList"); setSelId(l.id); }}
                        >
                          <strong>{l.title}</strong>
                        </button>
                        <span className="pg-muted">
                          {counts[l.id]?.active ?? 0} active
                          {(counts[l.id]?.completed ?? 0) > 0 ? ` · ${counts[l.id]?.completed ?? 0} done` : ""}
                        </span>
                        <button
                          type="button"
                          className="btn-secondary btn-small clickable"
                          onClick={() => setEditingList({ id: l.id, title: l.title })}
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          className="btn-secondary btn-small clickable"
                          onClick={() => void handleDeleteList(l.id)}
                          style={{ color: "var(--color-accent-issue)" }}
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </>
          ) : (
            <div className="empty-state" style={sx.emptyState}>
              Select a task list or folder to see its tasks.
            </div>
          )
        ) : (
          <>
            <header className="page-header" style={sx.header}>
              <div>
                <h1 style={sx.headerTitle}>{list.title}</h1>
              </div>
              <div style={sx.headerActions}>
                {editingList?.id === list.id ? (
                  <input
                    autoFocus
                    value={editingList.title}
                    onChange={(e) => setEditingList({ ...editingList, title: e.target.value })}
                    onBlur={() => { if (editingList) handleRenameList(list.id, editingList.title); }}
                    onKeyDown={(e) => { if (e.key === "Enter" && editingList) handleRenameList(list.id, editingList.title); if (e.key === "Escape") setEditingList(null); }}
                    style={{ fontSize: "inherit" }}
                  />
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn-secondary btn-small clickable"
                      onClick={() => setEditingList({ id: list.id, title: list.title })}
                      data-tip="Rename list"
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      className="btn-secondary btn-small clickable"
                      onClick={() => void handleDeleteList(list.id)}
                      data-tip="Delete list"
                      style={{ color: "var(--color-accent-issue)" }}
                    >
                      Delete
                    </button>
                  </>
                )}
                <form onSubmit={handleAddTask} style={sx.addTaskForm}>
                  <input
                    name="task-title"
                    placeholder="Add a task…"
                    autoFocus
                    style={sx.addTaskInput}
                  />
                  <button type="submit" className="btn-primary btn-small clickable">Add</button>
                </form>
              </div>
            </header>
            <TaskTree listId={list.id} reloadFn={reload} />
          </>
        )}
      </main>
    </div>
  );

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!list) return;
    const input = e.currentTarget.querySelector('input[name="task-title"]') as HTMLInputElement | null;
    const title = input?.value.trim();
    if (!title || !input) return;
    await createTask({ listId: list.id, title });
    input.value = "";
    await reload();
  }

  function TaskTree({ listId, reloadFn }: { listId: string; reloadFn: () => void }) {
    const { data, error, loading, reload: reloadTree } = useAsync(async () => getTaskTree(listId), [listId]);
    const [newSubtask, setNewSubtask] = useState<{ parentId: string; title: string } | null>(null);

    useEffect(() => {
      const onUpdate = () => void reloadTree();
      window.addEventListener("panga-data-updated", onUpdate);
      return () => window.removeEventListener("panga-data-updated", onUpdate);
    }, [reloadTree]);

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
      await reloadFn();
    }

    return (
      <div style={sx.taskTree}>
        {newSubtask ? (
          <form className="quick-add-bar" onSubmit={async (e) => {
            e.preventDefault();
            if (!newSubtask) return;
            await addSubtask(newSubtask.parentId);
          }} style={sx.subtaskForm}>
            <input value={newSubtask.title} onChange={(e) => setNewSubtask({ ...newSubtask!, title: e.target.value })} placeholder="Subtask title…" autoFocus style={sx.subtaskInput} />
            <button type="submit" className="btn-primary btn-small clickable" disabled={!newSubtask.title.trim()}>Add</button>
            <button type="button" className="btn-secondary btn-small clickable" onClick={() => setNewSubtask(null)}>Cancel</button>
          </form>
        ) : (
          <form onSubmit={async (e) => {
            e.preventDefault();
            const input = e.currentTarget.querySelector('input[name="root-task-title"]') as HTMLInputElement | null;
            const title = input?.value.trim();
            if (!title || !input) return;
            await createTask({ listId, title });
            input.value = "";
            await reloadFn();
          }} style={sx.rootTaskForm}>
            <input name="root-task-title" placeholder="Add a task…" autoFocus style={sx.rootTaskInput} />
            <button type="submit" className="btn-primary btn-small clickable">Add</button>
          </form>
        )}
        {roots.length === 0 && !newSubtask ? (
          <p className="empty-state" style={sx.emptyTasks}>No tasks yet. Add one above.</p>
        ) : (
          <ul className="item-list" style={sx.taskTree}>
            {roots.map((node) => (
              <TaskTreeNode key={node.task.id} node={node} onToggle={toggleTask} onEdit={editTitle} onDelete={deleteTaskWithConfirm} onAddSubtask={addSubtask} />
            ))}
          </ul>
        )}
      </div>
    );

    async function toggleTask(task: Task) {
      await toggleTaskCompleted(task.id);
      await reloadFn();
    }

    async function editTitle(task: Task, next: string) {
      await updateTask(task.id, { title: next.trim() });
      await reloadFn();
    }

    async function deleteTaskWithConfirm(task: Task) {
      if (!(await confirmDelete({ kind: "task", name: task.title }))) return;
      await deleteTask(task.id);
      await reloadFn();
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
      <li key={task.id} className="item" style={{ ...sx.taskItem, paddingLeft: depth * 18 }}>
        <div style={sx.taskRow}>
          {node.children.length > 0 && (
            <button type="button" className="btn-secondary btn-small clickable" onClick={() => setOpen((v) => !v)} data-tip={open ? "Hide subtasks" : "Show subtasks"}>
              {open ? "Hide" : "Show"}
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
          <span style={sx.taskActions}>
            <button type="button" className="btn-secondary btn-small clickable" onClick={() => onAddSubtask(task.id)} data-tip="Add subtask">Subtask</button>
            <button type="button" className="btn-secondary btn-small clickable" onClick={() => onDelete(task)} data-tip="Delete task">Delete</button>
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
}
