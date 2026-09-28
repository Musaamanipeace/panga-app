import { useState } from "react";
import {
  listTasksForProject,
  createTask,
  updateTask,
  cycleTaskStatus,
  deleteTask,
  isOverdue,
  type Task,
} from "../../data/tasks.ts";
import { reconcileMilestoneStatuses } from "../../data/milestones.ts"
import { createReminder, listReminders, deleteReminder } from "../../data/reminders.ts"
import { toLocalInput } from "../home/HomeRemindersTab.tsx"
import MicButton from "../../components/MicButton.tsx"
import { Editable, ErrorNote, Loading, StatusLabel, useAsync } from "../../components/ui.tsx"
import type { TaskStatus } from "../../data/db.ts"

const STATUS_ORDER: TaskStatus[] = ["active", "inactive", "completed"];

export default function TasksTab({
  projectId,
  onChange,
}: {
  projectId: string;
  onChange: () => void;
}) {
  const [filter, setFilter] = useState<"all" | TaskStatus | "ai">("all");
  const { data, error, loading, reload, setData } = useAsync(
    () => listTasksForProject(projectId),
    [projectId]
  );

  async function refresh() {
    await reconcileMilestoneStatuses(projectId);
    setData(await listTasksForProject(projectId));
    onChange();
  }

  if (error) return <ErrorNote error={error} onRetry={reload} />;
  if (loading) return <Loading label="Loading tasks..." />;

  const tasks = data ?? [];
  const filtered = tasks.filter((t) => {
    if (filter === "all") return true;
    if (filter === "ai") return t.executor === "ai";
    return t.status === filter;
  });

  return (
    <div>
      <AddTaskForm projectId={projectId} onCreated={refresh} />

      <div className="chip-row">
        {(["all", "active", "inactive", "completed", "ai"] as const).map((f) => (
          <button
            key={f}
            type="button"
            className={`chip ${filter === f ? "chip-active" : ""}`}
            onClick={() => setFilter(f)}
            data-tip={
              f === "all"
                ? "Every task in this project"
                : f === "ai"
                  ? "Tasks labelled for the assistant to do"
                  : `Tasks that are ${f}`
            }
            aria-pressed={filter === f}
          >
            {f === "all" ? "All" : f === "ai" ? "AI" : f}
            <span className="tab-btn-count">
              {f === "all"
                ? tasks.length
                : f === "ai"
                  ? tasks.filter((t) => t.executor === "ai").length
                  : tasks.filter((t) => t.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="empty-state">
          No tasks here. Add one above — label it AI or Manual, and give it a date and
          time if it should appear on your schedule.
        </p>
      ) : (
        <ul className="item-list">
          {filtered.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              projectId={projectId}
              onChange={refresh}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function TaskRow({
  task,
  projectId,
  onChange,
}: {
  task: Task;
  projectId: string;
  onChange: () => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [reminderFor, setReminderFor] = useState<string | null>(null);

  return (
    <li className="item item-row-wrap">
      <span className="item-body">
        <div className="row" style={{ gap: 8 }}>
          <button
            type="button"
            className={`task-status-btn is-${task.status}`}
            aria-label={`Status: ${task.status}`}
            onClick={async () => {
              await cycleTaskStatus(task);
              await onChange();
            }}
            data-tip={`Cycle status: ${STATUS_ORDER.join(" → ")}`}
          />
          <Editable
            className="item-title"
            value={task.title}
            onSave={async (title) => {
              await updateTask(task.id, { title });
              await onChange();
            }}
            label="Rename task"
          />
        </div>
        <span className="item-meta">
          <StatusLabel status={task.status} />
          <StatusLabel
            status={task.executor === "ai" ? "AI" : "Manual"}
            className={task.executor === "ai" ? "chip-ai" : ""}
          />
          {task.scheduledAt && (
            <span className="text-tiny" data-tip="Scheduled time">
              {new Date(task.scheduledAt).toLocaleString()}
            </span>
          )}
          {isOverdue(task) && <StatusLabel status="overdue" className="chip-overdue" />}
          {task.estimatedMinutes && (
            <span className="text-tiny">{task.estimatedMinutes} min</span>
          )}
        </span>
      </span>

      <span className="item-actions">
        <button
          type="button"
          className="btn-icon"
          onClick={() => setExpanded((v) => !v)}
          data-tip={expanded ? "Hide task details" : "Edit dates, notes and reminder"}
          aria-expanded={expanded}
          data-tip-edge="left"
        >
          Detail
        </button>
        <button
          type="button"
          className="btn-icon btn-icon-danger"
          onClick={async () => {
            await deleteTask(task.id);
            await onChange();
          }}
          data-tip="Delete this task"
          data-tip-edge="left"
        >
          Del
        </button>
      </span>

      {expanded && (
        <div className="item-detail">
          <TaskDetail
            task={task}
            projectId={projectId}
            reminderOpen={reminderFor === task.id}
            onToggleReminder={() => setReminderFor(reminderFor === task.id ? null : task.id)}
            onChange={onChange}
          />
        </div>
      )}
    </li>
  );
}

function TaskDetail({
  task,
  projectId,
  reminderOpen,
  onToggleReminder,
  onChange,
}: {
  task: Task;
  projectId: string;
  reminderOpen: boolean;
  onToggleReminder: () => void;
  onChange: () => Promise<void>;
}) {
  const [notes, setNotes] = useState(task.notes);

  return (
    <div className="stack-tight">
      <div className="form-grid">
        <div className="field">
          <div className="field-label">Executor</div>
          <select
            value={task.executor}
            onChange={async (e) => {
              await updateTask(task.id, { executor: e.target.value as "ai" | "manual" });
              await onChange();
            }}
            data-tip="AI tasks are the ones the assistant may act on"
          >
            <option value="manual">Manual</option>
            <option value="ai">AI</option>
          </select>
        </div>
        <div className="field">
          <div className="field-label">Scheduled</div>
          <input
            type="datetime-local"
            defaultValue={task.scheduledAt ? toLocalInput(task.scheduledAt) : ""}
            onChange={async (e) => {
              await updateTask(task.id, {
                scheduledAt: e.target.value ? new Date(e.target.value).getTime() : null,
              });
              await onChange();
            }}
            data-tip="Put this task on your schedule at this time"
          />
        </div>
        <div className="field">
          <div className="field-label">Due</div>
          <input
            type="datetime-local"
            defaultValue={task.dueDate ? toLocalInput(task.dueDate) : ""}
            onChange={async (e) => {
              await updateTask(task.id, {
                dueDate: e.target.value ? new Date(e.target.value).getTime() : null,
              });
              await onChange();
            }}
            data-tip="When this becomes overdue"
          />
        </div>
        <div className="field">
          <div className="field-label">Estimate (minutes)</div>
          <input
            type="number"
            min="1"
            defaultValue={task.estimatedMinutes ?? ""}
            onChange={async (e) => {
              await updateTask(task.id, {
                estimatedMinutes: e.target.value ? Number(e.target.value) : null,
              });
            }}
            data-tip="Rough size, used when the assistant plans your schedule"
          />
        </div>
      </div>

      <div>
        <div className="field-label">Notes</div>
        <div className="inline-form" style={{ marginBottom: 0 }}>
          <textarea
            value={notes}
            rows={3}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={async () => {
              if (notes === task.notes) return;
              await updateTask(task.id, { notes });
              await onChange();
            }}
            placeholder="Context for this task"
          />
          <MicButton append onResult={(text) => setNotes((v) => (v ? `${v} ${text}` : text))} />
        </div>
      </div>

      <div className="btn-row">
        <button
          type="button"
          className="btn-secondary btn-small"
          onClick={onToggleReminder}
          aria-expanded={reminderOpen}
          data-tip="Set a reminder for this task"
        >
          {reminderOpen ? "Hide reminder" : "Remind me"}
        </button>
      </div>

      {reminderOpen && <ReminderPicker projectId={projectId} task={task} onChange={onChange} />}
    </div>
  );
}

function ReminderPicker({
  projectId,
  task,
  onChange,
}: {
  projectId: string;
  task: Task;
  onChange: () => Promise<void>;
}) {
  const { data, setData } = useAsync(() => listReminders(projectId), [projectId]);
  const [when, setWhen] = useState(() =>
    toLocalInput(task.scheduledAt ?? task.dueDate ?? Date.now() + 3600_000)
  );

  const existing = (data ?? []).filter(
    (r) => r.linkedEntityType === "task" && r.linkedEntityId === task.id
  );

  return (
    <div className="stack-tight reminder-picker">
      <div className="inline-form" style={{ marginBottom: 0 }}>
        <input
          type="datetime-local"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          aria-label="Reminder time"
          data-tip="When the reminder should fire"
        />
        <button
          type="button"
          className="btn-primary btn-small"
          onClick={async () => {
            await createReminder({
              projectId,
              message: task.title,
              triggerAt: new Date(when).getTime(),
              linkedEntityType: "task",
              linkedEntityId: task.id,
            });
            setData(await listReminders(projectId));
            await onChange();
          }}
          data-tip="Create a reminder for this task"
        >
          + Remind
        </button>
      </div>
      {existing.length > 0 && (
        <ul className="item-list">
          {existing.map((r) => (
            <li key={r.id} className="item item-row-wrap">
              <span className="item-body">
                <span className="text-small">
                  {new Date(r.triggerAt).toLocaleString()}
                </span>
              </span>
              <span className="item-actions">
                <button
                  type="button"
                  className="btn-icon btn-icon-danger"
                  onClick={async () => {
                    await deleteReminder(r.id);
                    setData(await listReminders(projectId));
                    await onChange();
                  }}
                  data-tip="Delete this reminder"
                  data-tip-edge="left"
                >
                  Del
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AddTaskForm({ projectId, onCreated }: { projectId: string; onCreated: () => Promise<void> }) {
  const [title, setTitle] = useState("");
  const [executor, setExecutor] = useState<"ai" | "manual">("manual");
  const [when, setWhen] = useState("");

  return (
    <form
      className="resource-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        await createTask({
          projectId,
          title: title.trim(),
          executor,
          scheduledAt: when ? new Date(when).getTime() : null,
        });
        setTitle("");
        setWhen("");
        await onCreated();
      }}
    >
      <div className="field" style={{ flexBasis: "100%" }}>
        <div className="field-label">New task</div>
        <div className="inline-form" style={{ marginBottom: 0 }}>
          <input
            type="text"
            placeholder="What needs doing?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <MicButton onResult={setTitle} />
        </div>
      </div>
      <div className="field">
        <div className="field-label">Executor</div>
        <select
          value={executor}
          onChange={(e) => setExecutor(e.target.value as "ai" | "manual")}
          data-tip="AI means the assistant may act on this task"
        >
          <option value="manual">Manual</option>
          <option value="ai">AI</option>
        </select>
      </div>
      <div className="field">
        <div className="field-label">Date and time</div>
        <input
          type="datetime-local"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          data-tip="Optional. Schedules this task on your schedule."
        />
      </div>
      <button type="submit" className="btn-primary" data-tip="Add this task">
        + Add task
      </button>
    </form>
  );
}
