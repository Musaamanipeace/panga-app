import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listAllTasks, isOverdue, setTaskStatus, createTask, type Task, type TaskStatus } from "../../data/tasks";
import { listAllProjects } from "../../data/projects";
import { reconcileMilestoneStatuses } from "../../data/milestones";
import { copyToClipboard, ErrorNote, Loading, StatusLabel, useAsync, useToasts } from "../../components/ui";

type Filter = "all" | "active" | "inactive" | "completed" | "overdue" | "ai" | "scheduled";

const FILTERS: { id: Filter; label: string; hint: string }[] = [
  { id: "all", label: "All", hint: "Every task in every project" },
  { id: "active", label: "Active", hint: "Tasks still to do" },
  { id: "inactive", label: "Inactive", hint: "Tasks parked for now" },
  { id: "overdue", label: "Overdue", hint: "Active tasks past their due date" },
  { id: "scheduled", label: "Scheduled", hint: "Tasks with a date and time set" },
  { id: "ai", label: "AI", hint: "Tasks labelled for the assistant to do" },
  { id: "completed", label: "Done", hint: "Completed tasks" },
];

export default function HomeTasksTab() {
  const [filter, setFilter] = useState<Filter>("active");
  const { showToast } = useToasts();
  const [quickAdd, setQuickAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const { data, error, loading, reload } = useAsync(async () => {
    const [tasks, projects] = await Promise.all([listAllTasks(), listAllProjects()]);
    return { tasks, projects };
  }, []);

  async function handleToggleStatus(task: Task) {
    const next: Record<TaskStatus, TaskStatus> = {
      active: "completed",
      completed: "inactive",
      inactive: "active",
    };
    await setTaskStatus(task.id, next[task.status]);
    if (task.projectId) {
      await reconcileMilestoneStatuses(task.projectId);
    }
    reload();
  }

  const projectName = useMemo(
    () => new Map<string, string>((data?.projects ?? []).map((p: any) => [p.id, p.name])),
    [data]
  );

  const counts = useMemo(() => {
    const tasks = data?.tasks ?? [];
    return {
      all: tasks.length,
      active: tasks.filter((t: Task) => t.status === "active").length,
      inactive: tasks.filter((t: Task) => t.status === "inactive").length,
      completed: tasks.filter((t: Task) => t.status === "completed").length,
      overdue: tasks.filter((t: Task) => isOverdue(t)).length,
      ai: tasks.filter((t: Task) => t.executor === "ai" && t.status !== "completed").length,
      scheduled: tasks.filter((t: Task) => t.scheduledAt && t.status !== "completed").length,
    } as Record<Filter, number>;
  }, [data]);

  const filtered = useMemo(() => {
    const tasks = data?.tasks ?? [];
    const list = tasks.filter((t: Task) => {
      switch (filter) {
        case "all":
          return true;
        case "active":
          return t.status === "active";
        case "inactive":
          return t.status === "inactive";
        case "completed":
          return t.status === "completed";
        case "overdue":
          return isOverdue(t);
        case "ai":
          return t.executor === "ai" && t.status !== "completed";
        case "scheduled":
          return t.scheduledAt !== null && t.status !== "completed";
      }
    });
    return list.sort((a: Task, b: Task) => {
      const at = a.scheduledAt ?? a.dueDate ?? Infinity;
      const bt = b.scheduledAt ?? b.dueDate ?? Infinity;
      return at - bt;
    });
  }, [data, filter]);

  async function handleQuickAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await createTask({
        title: title.trim(),
        status: "active",
        projectId: projectId || undefined,
      });
      showToast({ type: "success", message: "Task added" });
      setTitle("");
      setProjectId("");
      setQuickAdd(false);
      reload();
    } catch (err) {
      showToast({ type: "error", message: "Failed to add task" });
    }
  }

  if (error) return <ErrorNote error={error} onRetry={reload} />;
  if (loading) return <Loading label="Loading tasks..." />;

  return (
    <div>
      <div className="chip-row">
        <button
          type="button"
          className={`chip ${!quickAdd ? "chip-active" : ""}`}
          onClick={() => setQuickAdd(false)}
          data-tip="Show all tasks"
        >
          All Tasks
        </button>
        <button
          type="button"
          className={`chip ${quickAdd ? "chip-active" : ""}`}
          onClick={() => setQuickAdd(true)}
          data-tip="Quick add a new task from here"
        >
          + Add
        </button>
        {quickAdd ? (
          <form className="quick-add-bar" onSubmit={handleQuickAdd}>
            <input
              type="text"
              placeholder="Task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              data-tip="Enter task title"
            />
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              data-tip="Link this task to a project (optional)"
            >
              <option value="">Standalone (no project)</option>
              {(data?.projects ?? []).map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button type="submit" className="btn-action clickable" data-tip="Add task">
              +
            </button>
            <button
              type="button"
              className="btn-secondary btn-small"
              onClick={() => setQuickAdd(false)}
              data-tip="Cancel"
            >
              ✕
            </button>
          </form>
        ) : (
          FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`chip ${filter === f.id ? "chip-active" : ""}`}
              onClick={() => setFilter(f.id)}
              data-tip={`${f.hint}. ${counts[f.id]} shown.`}
              aria-pressed={filter === f.id}
            >
              {f.label}
              <span className="tab-btn-count">{counts[f.id]}</span>
            </button>
          ))
        )}
      </div>

      {!quickAdd && (
        <>
          {filtered.length === 0 ? (
            <p className="empty-state">
              Nothing matches this filter. Click + Add to create a task from here.
            </p>
          ) : (
            <ul className="item-list">
              {filtered.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  projectName={projectName.get(task.projectId) ?? ""}
                  onToggle={handleToggleStatus}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function TaskRow({
  task,
  projectName,
  onToggle,
}: {
  task: Task;
  projectName: string;
  onToggle: (task: Task) => void;
}) {
  return (
    <li className="item">
      <button
        type="button"
        className={`task-status-btn is-${task.status} clickable`}
        aria-label={`Cycle status: currently ${task.status}`}
        data-tip={`Status: ${task.status}. Click to cycle (active → completed → inactive).`}
        onClick={() => onToggle(task)}
      >
        {task.status === "completed" ? "✓ Done" : task.status === "inactive" ? "— Parked" : "○ Active"}
      </button>
      <span className="item-body">
        <span className="item-title">{task.title}</span>
        <span className="item-meta">
          <Link to={`/project/${task.projectId}?tab=Tasks`} data-tip="Open this project">
            {projectName || "Unknown project"}
          </Link>
          <StatusLabel status={task.status} />
          {task.executor === "ai" && <StatusLabel status="AI" className="chip-ai" />}
          {task.scheduledAt && (
            <span className="text-tiny" data-tip="Scheduled time">
              {new Date(task.scheduledAt).toLocaleString()}
            </span>
          )}
          {isOverdue(task) && (
            <StatusLabel status="overdue" className="chip-overdue" />
          )}
        </span>
      </span>
      <span className="item-actions">
        <Link
          to={`/project/${task.projectId}?tab=Tasks`}
          className="btn-icon"
          data-tip="Open this task in its project"
          data-tip-edge="left"
        >
          Open
        </Link>
        <button
          type="button"
          className="btn-icon clickable"
          data-tip="Copy task title to clipboard"
          onClick={async () => { await copyToClipboard(task.title); }}
        >
          📋
        </button>
      </span>
    </li>
  );
}
