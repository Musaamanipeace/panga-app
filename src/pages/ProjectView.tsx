import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProject, getProjectProgress } from "../data/projects";
import { listTasksForProject, createTask, setTaskStatus, deleteTask } from "../data/tasks";
import {
  listResourcesForProject,
  createResource,
  deleteResource,
} from "../data/resources";
import { listDocEntries, createDocEntry, updateDocEntry } from "../data/docs";
import { listGoals, createGoal, setGoalStatus, deleteGoal } from "../data/goals";
import { listIssues, createIssue, setIssueStatus, deleteIssue } from "../data/issues";
import { listReminders, createReminder, dismissReminder, deleteReminder } from "../data/reminders";
import type {
  Project,
  Task,
  TaskStatus,
  Resource,
  ResourceCategory,
  DocEntry,
  Goal,
  Issue,
  IssueSeverity,
  Reminder,
} from "../data/db";
import ProgressBar from "../components/ProgressBar";
import MicButton from "../components/MicButton";

const TABS = ["Documentation", "Tasks", "Resources", "Goals", "Issues", "Reminders"] as const;
type Tab = (typeof TABS)[number];

const RESOURCE_CATEGORIES: { value: ResourceCategory; label: string; icon: string }[] = [
  { value: "link", label: "Link", icon: "🔗" },
  { value: "script", label: "Script", icon: "📜" },
  { value: "location", label: "Location", icon: "📍" },
  { value: "name", label: "Name of thing", icon: "🏷" },
  { value: "reminder", label: "Reminder note", icon: "⏰" },
  { value: "contact", label: "Contact", icon: "👤" },
  { value: "schedule", label: "Task schedule", icon: "🗓" },
  { value: "bookmark_group", label: "Bookmark group", icon: "📑" },
  { value: "file", label: "File / local path", icon: "📁" },
];

export default function ProjectView() {
  const { projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>("Documentation");

  async function refreshProject() {
    if (!projectId) return;
    setProject((await getProject(projectId)) ?? null);
    setProgress(await getProjectProgress(projectId));
  }

  useEffect(() => {
    refreshProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  if (!project || !projectId) {
    return (
      <div className="page project-view">
        <p className="empty-state">Loading project...</p>
      </div>
    );
  }

  return (
    <div className="page project-view">
      <header className="page-header">
        <div>
          <h1>{project.name}</h1>
          {project.description && <p>{project.description}</p>}
        </div>
      </header>

      <ProgressBar percent={progress} />
      <span className="progress-label">{progress}% complete</span>

      <nav className="tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "tab-btn-active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className="tab-panel">
        {activeTab === "Documentation" && <DocumentationTab projectId={projectId} />}
        {activeTab === "Tasks" && <TasksTab projectId={projectId} onChange={refreshProject} />}
        {activeTab === "Resources" && <ResourcesTab projectId={projectId} />}
        {activeTab === "Goals" && <GoalsTab projectId={projectId} />}
        {activeTab === "Issues" && <IssuesTab projectId={projectId} />}
        {activeTab === "Reminders" && <RemindersTab projectId={projectId} />}
      </div>
    </div>
  );
}

// ---------- Documentation ----------
function DocumentationTab({ projectId }: { projectId: string }) {
  const [entries, setEntries] = useState<DocEntry[]>([]);
  const [newTitle, setNewTitle] = useState("");

  async function refresh() {
    setEntries(await listDocEntries(projectId));
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function addOutline(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await createDocEntry({ projectId, type: "outline", title: newTitle.trim() });
    setNewTitle("");
    refresh();
  }

  async function onContentChange(id: string, content: string) {
    await updateDocEntry(id, { content });
  }

  return (
    <div>
      <form className="inline-form" onSubmit={addOutline}>
        <input
          type="text"
          placeholder="New doc section title (e.g. 'Overview', 'Phase 1')..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <MicButton onResult={(text) => setNewTitle(text)} />
        <button type="submit" className="btn-primary">+ Add section</button>
      </form>

      {entries.length === 0 ? (
        <p className="empty-state">
          No documentation yet. Add a section above — this is your project outline &
          phased plan, filled in as you go (or by the assistant, once connected).
        </p>
      ) : (
        <div className="doc-list">
          {entries.map((entry) => (
            <div key={entry.id} className="doc-entry">
              <h3>{entry.title}</h3>
              <textarea
                defaultValue={entry.content}
                placeholder="Write here..."
                rows={5}
                onBlur={(e) => onContentChange(entry.id, e.target.value)}
              />
              <MicButton onResult={(text) => onContentChange(entry.id, entry.content + " " + text)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Tasks ----------
function TasksTab({ projectId, onChange }: { projectId: string; onChange: () => void }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState("");

  async function refresh() {
    setTasks(await listTasksForProject(projectId));
    onChange();
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await createTask({ projectId, title: newTitle.trim() });
    setNewTitle("");
    refresh();
  }

  async function cycleStatus(task: Task) {
    const next: Record<TaskStatus, TaskStatus> = {
      active: "completed",
      completed: "inactive",
      inactive: "active",
    };
    await setTaskStatus(task.id, next[task.status]);
    refresh();
  }

  return (
    <div>
      <form className="inline-form" onSubmit={addTask}>
        <input
          type="text"
          placeholder="New task..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <MicButton onResult={(text) => setNewTitle(text)} />
        <button type="submit" className="btn-primary">+ Add task</button>
      </form>

      {tasks.length === 0 ? (
        <p className="empty-state">No tasks yet. Add one above.</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id} className={`task-item task-${task.status}`}>
              <button className="task-status-btn" onClick={() => cycleStatus(task)}>
                {task.status === "completed" ? "✓" : task.status === "inactive" ? "–" : "○"}
              </button>
              <span className="task-title">{task.title}</span>
              <span className="task-status-label">{task.status}</span>
              <button className="task-delete-btn" onClick={async () => { await deleteTask(task.id); refresh(); }}>✕</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------- Resources ----------
function ResourcesTab({ projectId }: { projectId: string }) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [category, setCategory] = useState<ResourceCategory>("link");
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [filter, setFilter] = useState<ResourceCategory | "all">("all");

  async function refresh() {
    setResources(await listResourcesForProject(projectId));
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function addResource(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !value.trim()) return;
    await createResource({ projectId, category, title: title.trim(), value: value.trim() });
    setTitle("");
    setValue("");
    refresh();
  }

  const filtered = filter === "all" ? resources : resources.filter((r) => r.category === filter);
  const catMeta = (c: ResourceCategory) => RESOURCE_CATEGORIES.find((x) => x.value === c)!;

  return (
    <div>
      <form className="resource-form" onSubmit={addResource}>
        <select value={category} onChange={(e) => setCategory(e.target.value as ResourceCategory)}>
          {RESOURCE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
          ))}
        </select>
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <MicButton onResult={(text) => setTitle(text)} />
        <input
          type="text"
          placeholder={category === "link" ? "https://..." : "Value / URL / path / detail..."}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <MicButton onResult={(text) => setValue(text)} />
        <button type="submit" className="btn-primary">+ Add resource</button>
      </form>

      <div className="chip-row">
        <button className={`chip ${filter === "all" ? "chip-active" : ""}`} onClick={() => setFilter("all")}>All</button>
        {RESOURCE_CATEGORIES.map((c) => (
          <button
            key={c.value}
            className={`chip ${filter === c.value ? "chip-active" : ""}`}
            onClick={() => setFilter(c.value)}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="empty-state">No resources in this category yet.</p>
      ) : (
        <ul className="resource-list">
          {filtered.map((r) => (
            <li key={r.id} className="resource-item">
              <span className="resource-icon">{catMeta(r.category).icon}</span>
              <span className="resource-text">
                <span className="resource-title">{r.title}</span>
                {r.category === "link" || r.category === "location" ? (
                  <a href={r.value} target="_blank" rel="noreferrer" className="resource-value-link">{r.value}</a>
                ) : (
                  <span className="resource-value">{r.value}</span>
                )}
              </span>
              <button className="task-delete-btn" onClick={async () => { await deleteResource(r.id); refresh(); }}>✕</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------- Goals ----------
function GoalsTab({ projectId }: { projectId: string }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState("");

  async function refresh() {
    setGoals(await listGoals(projectId));
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function addGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await createGoal({ projectId, title: title.trim() });
    setTitle("");
    refresh();
  }

  return (
    <div>
      <form className="inline-form" onSubmit={addGoal}>
        <input type="text" placeholder="New goal..." value={title} onChange={(e) => setTitle(e.target.value)} />
        <MicButton onResult={(text) => setTitle(text)} />
        <button type="submit" className="btn-primary">+ Add goal</button>
      </form>
      {goals.length === 0 ? (
        <p className="empty-state">No goals yet.</p>
      ) : (
        <ul className="task-list">
          {goals.map((g) => (
            <li key={g.id} className={`task-item goal-${g.status}`}>
              <span className="task-title">{g.title}</span>
              <select
                value={g.status}
                onChange={async (e) => { await setGoalStatus(g.id, e.target.value as Goal["status"]); refresh(); }}
              >
                <option value="in_progress">In progress</option>
                <option value="achieved">Achieved</option>
                <option value="missed">Missed</option>
              </select>
              <button className="task-delete-btn" onClick={async () => { await deleteGoal(g.id); refresh(); }}>✕</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------- Issues ----------
function IssuesTab({ projectId }: { projectId: string }) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState<IssueSeverity>("medium");

  async function refresh() {
    setIssues(await listIssues(projectId));
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function addIssue(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await createIssue({ projectId, title: title.trim(), severity });
    setTitle("");
    refresh();
  }

  return (
    <div>
      <form className="resource-form" onSubmit={addIssue}>
        <input type="text" placeholder="New issue / setback..." value={title} onChange={(e) => setTitle(e.target.value)} />
        <MicButton onResult={(text) => setTitle(text)} />
        <select value={severity} onChange={(e) => setSeverity(e.target.value as IssueSeverity)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button type="submit" className="btn-primary">+ Log issue</button>
      </form>
      {issues.length === 0 ? (
        <p className="empty-state">No issues logged. Good sign.</p>
      ) : (
        <ul className="task-list">
          {issues.map((i) => (
            <li key={i.id} className={`task-item issue-${i.severity}`}>
              <span className="task-title">{i.title}</span>
              <span className="task-status-label">{i.severity} · {i.status}</span>
              {i.status === "open" && (
                <button className="btn-secondary" onClick={async () => { await setIssueStatus(i.id, "resolved"); refresh(); }}>
                  Resolve
                </button>
              )}
              <button className="task-delete-btn" onClick={async () => { await deleteIssue(i.id); refresh(); }}>✕</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------- Reminders ----------
function RemindersTab({ projectId }: { projectId: string }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [message, setMessage] = useState("");
  const [when, setWhen] = useState("");

  async function refresh() {
    setReminders(await listReminders(projectId));
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function addReminder(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || !when) return;
    await createReminder({ projectId, message: message.trim(), triggerAt: new Date(when).getTime() });
    setMessage("");
    setWhen("");
    refresh();
  }

  return (
    <div>
      <form className="resource-form" onSubmit={addReminder}>
        <input type="text" placeholder="Reminder message..." value={message} onChange={(e) => setMessage(e.target.value)} />
        <MicButton onResult={(text) => setMessage(text)} />
        <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
        <button type="submit" className="btn-primary">+ Set reminder</button>
      </form>
      {reminders.length === 0 ? (
        <p className="empty-state">No reminders set for this project.</p>
      ) : (
        <ul className="task-list">
          {reminders.map((r) => (
            <li key={r.id} className={`task-item reminder-${r.status}`}>
              <span className="task-title">{r.message}</span>
              <span className="task-status-label">{new Date(r.triggerAt).toLocaleString()}</span>
              {r.status === "pending" && (
                <button className="btn-secondary" onClick={async () => { await dismissReminder(r.id); refresh(); }}>
                  Dismiss
                </button>
              )}
              <button className="task-delete-btn" onClick={async () => { await deleteReminder(r.id); refresh(); }}>✕</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
