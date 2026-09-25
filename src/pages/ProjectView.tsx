import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getProject, getProjectTaskStats } from "../data/projects";
import { listTasksForProject, listAllActiveTasks, createTask, updateTask, setTaskStatus, deleteTask, type Task, type TaskStatus } from "../data/tasks";
import { listResourcesForProject, createResource, updateResource, deleteResource, type Resource, type ResourceCategory } from "../data/resources";
import { listDocEntries, createDocEntry, updateDocEntry, deleteDocEntry, type DocEntry } from "../data/docs";
import { listMilestones, createMilestone, updateMilestone, setMilestoneStatus, deleteMilestone, reconcileMilestoneStatuses, type Milestone } from "../data/milestones";
import { listIssues, createIssue, updateIssue, setIssueStatus, deleteIssue, type Issue, type IssueSeverity } from "../data/issues";
import { listReminders, createReminder, updateReminder, dismissReminder, deleteReminder, type Reminder } from "../data/reminders";
import {
  listScheduleItems,
  createScheduleItem,
  deleteScheduleItem,
  type ScheduleItem,
} from "../data/scheduler";
import {
  listCalendarEvents,
  createLocalEvent,
  deleteCalendarEvent,
  type CalendarEvent,
} from "../data/calendar";
import { getGeminiApiKey } from "../data/settings";
import type { Project } from "../data/db";
import ProgressBar from "../components/ProgressBar";
import MicButton from "../components/MicButton";
import { SecretViewer } from "../components/SecretsVault";

const TABS = ["Documentation", "Tasks", "Scheduler", "Resources", "Milestones", "Calendar", "Issues", "Reminders"] as const;
type Tab = (typeof TABS)[number];

const TAB_HINTS: Record<Tab, string> = {
  Documentation: "Project README, wireframes, and structural specs",
  Tasks: "Track active, scheduled, and remaining tasks",
  Scheduler: "Schedule tasks by time — manually or with AI planning",
  Resources: "Notes, scripts, prompts, links, contacts, secrets, images",
  Milestones: "Phase checkpoints — hover to see blocking tasks",
  Calendar: "Google Calendar sync and local events — Join Meet buttons",
  Issues: "Log setbacks and blockers with a severity rating",
  Reminders: "Schedule follow-up nudges for this project",
};

// Map query ?tab= to a tab name
const TAB_QUERY: Record<string, Tab> = {
  Documentation: "Documentation",
  Tasks: "Tasks",
  Scheduler: "Scheduler",
  Resources: "Resources",
  Milestones: "Milestones",
  Calendar: "Calendar",
  Issues: "Issues",
  Reminders: "Reminders",
};

export default function ProjectView() {
  const { projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [project, setProject] = useState<Project | null>(null);
  const [progress, setProgress] = useState(0);
  const [pending, setPending] = useState(0);
  const activeTab = (TAB_QUERY[searchParams.get("tab") ?? ""] as Tab) ?? "Documentation";

  function setActiveTab(tab: Tab) {
    setSearchParams({ tab });
  }

  async function refreshProject() {
    if (!projectId) return;
    setProject((await getProject(projectId)) ?? null);
    const stats = await getProjectTaskStats(projectId);
    setProgress(stats.percent);
    setPending(stats.pending);
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

      <ProgressBar percent={progress} pending={pending} />
      <span className="progress-label">{progress}% complete</span>

      <nav className="tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`tab-btn clickable ${activeTab === tab ? "tab-btn-active" : ""}`}
            data-tip={TAB_HINTS[tab]}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className="tab-panel">
        {activeTab === "Documentation" && <DocumentationTab projectId={projectId} />}
        {activeTab === "Tasks" && <TasksTab projectId={projectId} onChange={refreshProject} />}
        {activeTab === "Scheduler" && <SchedulerTab projectId={projectId} />}
        {activeTab === "Resources" && <ResourcesTab projectId={projectId} />}
        {activeTab === "Milestones" && <MilestonesTab projectId={projectId} />}
        {activeTab === "Calendar" && <CalendarTab projectId={projectId} />}
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

  async function onTitleChange(id: string, title: string) {
    if (!title.trim()) return;
    await updateDocEntry(id, { title: title.trim() });
    refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this section?")) return;
    await deleteDocEntry(id);
    refresh();
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
        <button type="submit" className="btn-primary clickable">+ Add section</button>
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
              <div className="doc-entry-header">
                <input
                  className="doc-entry-title-input"
                  defaultValue={entry.title}
                  onBlur={(e) => onTitleChange(entry.id, e.target.value)}
                />
                <button
                  className="task-delete-btn clickable"
                  data-tip="Delete section"
                  onClick={() => onDelete(entry.id)}
                >
                  ×
                </button>
              </div>
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

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
    await reconcileMilestoneStatuses(projectId);
    refresh();
  }

  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditValue(task.title);
  }

  async function saveEdit(id: string) {
    if (editValue.trim()) {
      await updateTask(id, { title: editValue.trim() });
    }
    setEditingId(null);
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
        <button type="submit" className="btn-primary clickable">+ Add task</button>
      </form>

      {tasks.length === 0 ? (
        <p className="empty-state">No tasks yet. Add one above.</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id} className={`task-item task-${task.status}`}>
              <button className="task-status-btn" onClick={() => cycleStatus(task)} data-tip="Cycle status">
                {task.status === "completed" ? "Done" : task.status === "inactive" ? "—" : "o"}
              </button>
              {editingId === task.id ? (
                <input
                  className="task-title-input"
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => saveEdit(task.id)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit(task.id)}
                />
              ) : (
                <span className="task-title">{task.title}</span>
              )}
              <span className="task-status-label">{task.status}</span>
              <button
                className="btn-icon clickable"
                data-tip="Rename task"
                onClick={() => startEdit(task)}
              >
                Edit
              </button>
              <button
                className="task-delete-btn"
                data-tip="Delete task"
                onClick={async () => { await deleteTask(task.id); refresh(); }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------- Scheduler (§3) ----------
function SchedulerTab({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [mode, setMode] = useState<"manual" | "ai">("manual");
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState("");
  const [duration, setDuration] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<string | null>(null);

  async function refresh() {
    setItems(await listScheduleItems(projectId));
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function addManual(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !when) return;
    await createScheduleItem({
      projectId,
      title: title.trim(),
      scheduledAt: new Date(when).getTime(),
      durationMinutes: duration ? parseInt(duration, 10) : null,
    });
    setTitle("");
    setWhen("");
    setDuration("");
    refresh();
  }

  async function runAiPlanning(e: React.FormEvent) {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiStatus("Planning...");
    try {
      const apiKey = await getGeminiApiKey();
      if (!apiKey) {
        setAiStatus("No Gemini API key configured. Add one in Settings.");
        setAiLoading(false);
        return;
      }

      const tasks = await listAllActiveTasks();
      const existingItems = await listScheduleItems(projectId);

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a scheduling assistant. Given the following tasks and existing schedule items, ` +
                      `interpret the user's natural-language scheduling request and return ONLY a JSON array ` +
                      `of objects with fields: {title, scheduledAt (ISO), durationMinutes, description}. ` +
                      `If the request is ambiguous, ask a clarifying question instead as a single string starting with "CLARIFY:".\n\n` +
                      `Tasks (active, across all projects):\n${JSON.stringify(tasks.map((t) => ({ id: t.id, title: t.title, projectId: t.projectId, dueDate: t.dueDate, estimatedMinutes: t.estimatedMinutes, tags: t.tags })))}\n\n` +
                      `Existing scheduled items:\n${JSON.stringify(existingItems)}\n\n` +
                      `User request: "${aiPrompt}"`,
              }],
            }],
          }),
        }
      );

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      const trimmed = text.trim();

      if (trimmed.startsWith("CLARIFY:")) {
        setAiStatus(trimmed);
        setAiLoading(false);
        return;
      }

      const items = JSON.parse(trimmed.replace(/```json\s*/, "").replace(/```\s*/, "")) as Array<{
        title: string;
        scheduledAt: string;
        durationMinutes: number;
        description?: string;
      }>;

      for (const item of items) {
        await createScheduleItem({
          projectId,
          title: item.title,
          description: item.description ?? null,
          scheduledAt: new Date(item.scheduledAt).getTime(),
          durationMinutes: item.durationMinutes ?? null,
        });
      }
      setAiStatus(`Added ${items.length} item(s) to your schedule.`);
      setAiPrompt("");
    } catch (err: any) {
      setAiStatus(`Error: ${err.message ?? "Failed to plan schedule"}`);
    }
    setAiLoading(false);
    refresh();
  }

  async function deleteItem(id: string) {
    await deleteScheduleItem(id);
    refresh();
  }

  return (
    <div>
      {/* Mode toggle */}
      <div className="scheduler-mode-toggle">
        <button
          className={`tab-btn clickable ${mode === "manual" ? "tab-btn-active" : ""}`}
          data-tip="Add a schedule entry manually"
          onClick={() => setMode("manual")}
        >
          Manual
        </button>
        <button
          className={`tab-btn clickable ${mode === "ai" ? "tab-btn-active" : ""}`}
          data-tip="Plan with AI — describe what you want to schedule"
          onClick={() => setMode("ai")}
        >
          AI Plan
        </button>
      </div>

      {/* Manual mode form */}
      {mode === "manual" && (
        <form className="resource-form" onSubmit={addManual}>
          <input
            type="text"
            placeholder="What needs scheduling?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <MicButton onResult={(text) => setTitle(text)} />
          <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
          <input
            type="number"
            placeholder="Minutes"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min="1"
          />
          <button type="submit" className="btn-primary clickable">+ Schedule</button>
        </form>
      )}

      {/* AI mode form */}
      {mode === "ai" && (
        <div>
          <form className="sliding-prompt-box" onSubmit={runAiPlanning}>
            <textarea
              placeholder="e.g. 'Schedule the API design review tomorrow at 2pm for 90 minutes, then block 3-4pm for the presentation.'"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={2}
              disabled={aiLoading}
            />
            <button type="submit" className="btn-primary clickable" disabled={aiLoading}>
              {aiLoading ? "Planning..." : "Plan with AI"}
            </button>
          </form>
          {aiStatus && <p className={`scheduler-status ${aiLoading ? "loading" : "done"}`}>{aiStatus}</p>}
        </div>
      )}

      {/* Schedule list */}
      {items.length === 0 ? (
        <p className="empty-state">
          No scheduled items yet. Use manual mode for a quick entry or AI Plan to let
          the assistant organize your tasks by time.
        </p>
      ) : (
        <ul className="task-list">
          {items.map((item) => (
            <li key={item.id} className="task-item" style={{ borderLeftColor: "var(--color-accent-milestone)" }}>
              <span className="task-title">{item.title}</span>
              <span className="task-status-label">
                {new Date(item.scheduledAt).toLocaleString()}
                {item.durationMinutes && ` · ${item.durationMinutes} min`}
              </span>
              <button
                className="btn-icon clickable"
                data-tip="Delete schedule item"
                onClick={() => deleteItem(item.id)}
              >
                ×
              </button>
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
  const [filter, setFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Resource | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [contactType, setContactType] = useState<"email" | "phone" | "social">("email");
  const [value, setValue] = useState("");
  const [provider, setProvider] = useState<"gemini" | "claude" | "gpt" | "other">("other");
  const [images, setImages] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);

  const CATEGORY_LABELS: Record<ResourceCategory, string> = {
    notes: "Notes",
    scripts: "Scripts",
    prompts: "Prompts",
    ai_chat_links: "AI Chat Links",
    reports_memos: "Reports & Memos",
    links: "Links",
    contacts: "Contacts",
    secrets: "Secrets",
    images: "Images",
  };

  async function refresh() {
    setResources(await listResourcesForProject(projectId));
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  function fileToDataUrl(file: File): Promise<any> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () =>
        resolve({ dataUrl: reader.result as string, name: file.name, alt: file.name, type: file.type });
      reader.readAsDataURL(file);
    });
  }

  function resetForm() {
    setTitle("");
    setBody("");
    setUrl("");
    setValue("");
    setContactType("email");
    setProvider("other");
    setImages([]);
    setFiles([]);
    setEditing(null);
  }

  async function addResource(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const cat = editing?.category ?? "notes";
    const input: any = {
      projectId,
      category: cat,
      title: title.trim(),
      tags: [],
    };
    if (cat === "links" || cat === "ai_chat_links") {
      input.url = url.trim() || null;
      input.provider = cat === "ai_chat_links" ? provider : null;
      input.body = body.trim() || null;
    } else if (cat === "contacts") {
      input.contactType = contactType;
      input.value = value.trim() || null;
      input.body = body.trim() || null;
    } else if (cat === "secrets") {
      // Secrets require the vault — create through the secrets module
      if (!editing) {
        await createSecret({ projectId, title: title.trim(), value: value.trim() });
      } else {
        await updateResource(editing.id, { title: title.trim(), value: value.trim(), tags: [] });
      }
      resetForm();
      refresh();
      return;
    } else if (cat === "images") {
      input.images = images;
    } else if (cat === "notes") {
      input.body = body.trim() || null;
      input.files = files;
    } else {
      input.body = body.trim() || null;
    }
    if (editing) {
      await updateResource(editing.id, input);
    } else {
      await createResource(input);
    }
    resetForm();
    refresh();
  }

  function openEdit(r: Resource) {
    setEditing(r);
    setTitle(r.title || "");
    setBody(r.body ?? "");
    setUrl(r.url ?? "");
    setValue(r.value ?? "");
    setContactType((r.contactType as any) ?? "email");
    setProvider((r.provider as any) ?? "other");
    setImages(r.images ?? []);
    setFiles(r.files ?? []);
  }

  const filtered = filter === "all" ? resources : resources.filter((r) => r.category === filter);

  return (
    <div>
      <form className="resource-form" onSubmit={addResource}>
        {editing ? (
          <span className="resource-category-badge">{CATEGORY_LABELS[editing.category] || editing.category}</span>
        ) : (
          <select
            value={editing?.category ?? filter === "all" ? "notes" : (filter as ResourceCategory)}
            onChange={(e) => {
              if (!editing) {
                setFilter(e.target.value);
              }
            }}
            data-tip="Filter resources by category"
          >
            <option value="all">All categories</option>
            {Object.entries(CATEGORY_LABELS).map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
        )}

        <input
          type="text"
          placeholder={editing?.category === "contacts" ? "Name" : "Title"}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          data-tip={editing?.category === "contacts" ? "Contact person or organization" : "Resource title"}
        />
        <MicButton onResult={(text) => setTitle(text)} />

        {/* Category-specific fields */}
        {!editing && (filter === "links" || filter === "ai_chat_links") && (
          <>
            <input
              type="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              data-tip="URL to open"
            />
          </>
        )}
        {editing && (editing.category === "links" || editing.category === "ai_chat_links") && (
          <input
            type="url"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            data-tip="URL to open"
          />
        )}

        {!editing && filter === "ai_chat_links" && (
          <select value={provider} onChange={(e) => setProvider(e.target.value as any)} data-tip="AI provider for this chat link">
            <option value="gemini">Gemini</option>
            <option value="claude">Claude</option>
            <option value="gpt">GPT</option>
            <option value="other">Other</option>
          </select>
        )}
        {editing && editing.category === "ai_chat_links" && (
          <select value={provider} onChange={(e) => setProvider(e.target.value as any)} data-tip="AI provider for this chat link">
            <option value="gemini">Gemini</option>
            <option value="claude">Claude</option>
            <option value="gpt">GPT</option>
            <option value="other">Other</option>
          </select>
        )}

        {!editing && filter === "contacts" && (
          <>
            <select value={contactType} onChange={(e) => setContactType(e.target.value as any)} data-tip="Contact method type">
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="social">Social</option>
            </select>
            <input
              type="text"
              placeholder="Contact value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              data-tip="The email address, phone number, or social handle"
            />
          </>
        )}
        {editing && editing.category === "contacts" && (
          <>
            <select value={contactType} onChange={(e) => setContactType(e.target.value as any)} data-tip="Contact method type">
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="social">Social</option>
            </select>
            <input
              type="text"
              placeholder="Contact value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              data-tip="The email address, phone number, or social handle"
            />
          </>
        )}

        {!editing && filter === "secrets" && (
          <input
            type="password"
            placeholder="Secret value (encrypted at rest)"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            data-tip="Secrets are encrypted with your passphrase via AES-GCM"
          />
        )}
        {editing && editing.category === "secrets" && (
          <input
            type="password"
            placeholder="Secret value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            data-tip="Update the secret value"
          />
        )}

        {/* Body / text for notes, scripts, prompts, reports, links, ai_chat_links */}
        {(!editing || ["notes", "scripts", "prompts", "reports_memos", "links", "ai_chat_links"].includes(editing.category)) &&
         ["notes", "scripts", "prompts", "reports_memos", "links", "ai_chat_links"].includes(editing?.category ?? filter === "all" ? "" : filter) && (
          <textarea
            placeholder="Notes, description, details..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            data-tip="Optional description or notes"
          />
        )}

        {/* File upload for notes */}
        {!editing && filter === "notes" && (
          <input
            type="file"
            accept=".doc,.docx,.pdf,.xls,.xlsx,.csv,.txt"
            multiple
            onChange={async (e) => {
              const files = Array.from(e.target.files ?? []);
              const parsed = await Promise.all(files.map(fileToDataUrl));
              setFiles((prev) => [...prev, ...parsed]);
              e.target.value = "";
            }}
            data-tip="Attach documents, spreadsheets, or text files"
          />
        )}

        {/* Image upload for images category */}
        {(!editing && filter === "images") || (editing && editing.category === "images") ? (
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={async (e) => {
              const files = Array.from(e.target.files ?? []);
              const urls = await Promise.all(files.map(fileToDataUrl));
              setImages((prev) => [...prev, ...urls]);
              e.target.value = "";
            }}
            data-tip="Upload image resources"
          />
        ) : null}

        {/* Image previews */}
        {images.length > 0 && (
          <div className="image-preview-row">
            {images.map((img, i) => (
              <div key={i} className="image-thumb">
                <img src={img.dataUrl} alt={img.alt} title={img.name} />
                <button
                  type="button"
                  className="thumb-remove"
                  data-tip="Remove image"
                  onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* File previews for notes */}
        {files.length > 0 && (
          <div className="image-preview-row">
            {files.map((f, i) => (
              <div key={i} className="image-thumb">
                <div className="file-preview">
                  <span className="file-preview-name">{f.name}</span>
                </div>
                <button
                  type="button"
                  className="thumb-remove"
                  data-tip="Remove file"
                  onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <button type="submit" className="btn-primary clickable">
          {editing ? "Save" : "+ Add resource"}
        </button>
        {editing && (
          <button
            type="button"
            className="btn-secondary clickable"
            data-tip="Cancel edit"
            onClick={() => resetForm()}
          >
            Cancel
          </button>
        )}
      </form>

      <div className="chip-row">
        <button
          className={`chip ${filter === "all" ? "chip-active" : ""}`}
          data-tip="Show all resources"
          onClick={() => setFilter("all")}
        >
          All
        </button>
        {Object.entries({
          notes: "Notes",
          scripts: "Scripts",
          prompts: "Prompts",
          ai_chat_links: "AI Chat",
          reports_memos: "Reports",
          links: "Links",
          contacts: "Contacts",
          secrets: "Secrets",
          images: "Images",
        }).map(([id, label]) => (
          <button
            key={id}
            className={`chip ${filter === id ? "chip-active" : ""}`}
            data-tip={`Show only ${label.toLowerCase()}`}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="empty-state">No resources in this category yet.</p>
      ) : (
        <ul className="resource-list">
          {filtered.map((r) => {
            let label = "Resource";
            if (r.category === "links") label = "Link";
            else if (r.category === "ai_chat_links") label = "AI Chat";
            else if (r.category === "contacts") label = "Contact";
            else if (r.category === "secrets") label = "Secret";
            else if (r.category === "scripts") label = "Script";
            else if (r.category === "prompts") label = "Prompt";
            else if (r.category === "reports_memos") label = "Report";
            else if (r.category === "images") label = "Image";
            else label = "Note";

            return (
              <li key={r.id} className="resource-item">
                <span className="resource-category-dot" style={{ backgroundColor: getCategoryColor(r.category) }} />
                <span className="resource-text">
                  <span className="resource-title">{r.title || "(untitled)"}</span>
                  {r.category === "links" || r.category === "ai_chat_links" ? (
                    <a href={r.url ?? ""} target="_blank" rel="noreferrer" className="resource-value-link" data-tip="Open link">
                      {r.url}
                    </a>
                  ) : null}
                  {r.category === "contacts" && r.value ? (
                    <span className="resource-value">{r.contactType}: {r.value}</span>
                  ) : null}
                  {r.body && <p className="resource-notes">{r.body}</p>}
                  {r.category === "secrets" && r.value ? (
                    <SecretViewer resource={r} />
                  ) : null}
                  {r.images.length > 0 && (
                    <div className="resource-image-row">
                      {r.images.map((img, i) => (
                        <img key={i} src={img.dataUrl} alt={img.alt} className="resource-image-thumb" title={img.name} />
                      ))}
                    </div>
                  )}
                  {r.files.length > 0 && (
                    <div className="resource-image-row">
                      {r.files.map((f, i) => (
                        <a key={i} href={f.dataUrl} download={f.name} className="file-attachment" data-tip={`Download ${f.name}`}>
                          {f.name}
                        </a>
                      ))}
                    </div>
                  )}
                  <span className="chip-small">{label}</span>
                </span>
                <button
                  className="btn-icon clickable"
                  data-tip="Edit resource"
                  onClick={() => openEdit(r)}
                >
                  Edit
                </button>
                <button
                  className="task-delete-btn"
                  data-tip="Delete resource"
                  onClick={async () => { await deleteResource(r.id); refresh(); }}
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function getCategoryColor(cat: ResourceCategory): string {
  const colors: Record<ResourceCategory, string> = {
    notes: "#3b82f6",
    scripts: "#8b5cf6",
    prompts: "#06b6d4",
    ai_chat_links: "#ec4899",
    reports_memos: "#f59e0b",
    links: "#22c55e",
    contacts: "#14b8a6",
    secrets: "#ef4444",
    images: "#a855f7",
  };
  return colors[cat] ?? "#6b7280";
}

// ---------- Milestones ----------
function MilestonesTab({ projectId }: { projectId: string }) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [blockingTaskIds, setBlockingTaskIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  async function refresh() {
    await reconcileMilestoneStatuses(projectId);
    const [m, t] = await Promise.all([listMilestones(projectId), listTasksForProject(projectId)]);
    setMilestones(m);
    setTasks(t);
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const taskById = (id: string) => tasks.find((t) => t.id === id);

  async function addMilestone(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await createMilestone({
      projectId,
      title: title.trim(),
      targetDate: targetDate ? new Date(targetDate).getTime() : null,
      blockingTaskIds,
    });
    setTitle("");
    setTargetDate("");
    setBlockingTaskIds([]);
    refresh();
  }

  async function saveEdit(id: string) {
    if (editValue.trim()) await updateMilestone(id, { title: editValue.trim() });
    setEditingId(null);
    refresh();
  }

  function toggleBlocker(id: string) {
    setBlockingTaskIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const sorted = [...milestones].sort((a, b) => (a.targetDate ?? Infinity) - (b.targetDate ?? Infinity));

  return (
    <div>
      <form className="resource-form" onSubmit={addMilestone}>
        <input
          type="text"
          placeholder="New milestone (phase checkpoint)..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <MicButton onResult={(text) => setTitle(text)} />
        <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        <button type="submit" className="btn-primary clickable">+ Add milestone</button>
      </form>

      {tasks.length > 0 && (
        <div className="blocker-picker">
          <span className="blocker-picker-label">Blocking tasks for the new milestone:</span>
          <div className="chip-row">
            {tasks.map((t) => (
              <button
                type="button"
                key={t.id}
                className={`chip ${blockingTaskIds.includes(t.id) ? "chip-active" : ""}`}
                data-tip={t.title}
                onClick={() => toggleBlocker(t.id)}
              >
                {t.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <p className="empty-state">
          No milestones yet. Add a phase checkpoint above and (optionally) attach the
          tasks that block it — the milestone auto-completes once they're all done.
        </p>
      ) : (
        <div className="milestone-track">
          {sorted.map((m) => {
            const blockers = m.blockingTaskIds.map(taskById).filter(Boolean) as Task[];
            const pendingBlockers = blockers.filter((t) => t.status !== "completed");
            return (
              <div
                key={m.id}
                className={`milestone-node milestone-${m.status}`}
                onMouseEnter={() => setHoveredId(m.id)}
                onMouseLeave={() => setHoveredId((cur) => (cur === m.id ? null : cur))}
              >
                <div className="milestone-dot" data-tip="Hover to see blocking tasks" />
                <div className="milestone-body">
                  {editingId === m.id ? (
                    <input
                      className="task-title-input"
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveEdit(m.id)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit(m.id)}
                    />
                  ) : (
                    <span className="milestone-title">{m.title}</span>
                  )}
                  {m.targetDate && (
                    <span className="milestone-date">{new Date(m.targetDate).toLocaleDateString()}</span>
                  )}
                  <select
                    value={m.status}
                    onChange={async (e) => { await setMilestoneStatus(m.id, e.target.value as Milestone["status"]); refresh(); }}
                    data-tip="Milestone status"
                  >
                    <option value="in_progress">In progress</option>
                    <option value="achieved">Achieved</option>
                    <option value="missed">Missed</option>
                  </select>
<button
                className="btn-icon clickable"
                data-tip="Rename milestone"
                onClick={() => { setEditingId(m.id); setEditValue(m.title); }}
              >
                Edit
              </button>
                  <button
                    className="task-delete-btn"
                    data-tip="Delete milestone"
                    onClick={async () => { await deleteMilestone(m.id); refresh(); }}
                  >
                    ×
                  </button>
                </div>

                {hoveredId === m.id && (
                  <div className="milestone-hover-panel dropdown-anim">
                    {blockers.length === 0 ? (
                      <p className="empty-state">No blocking tasks linked.</p>
                    ) : (
                      <>
                        <p className="milestone-hover-title">
                          {pendingBlockers.length === 0
                            ? "All blocking tasks complete"
                            : `${pendingBlockers.length} of ${blockers.length} blocking task(s) pending`}
                        </p>
                        <ul className="milestone-blocker-list">
                          {blockers.map((t) => (
                            <li key={t.id} className={`task-${t.status}`}>
                              {t.status === "completed" ? "Done" : "o"} {t.title}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- Calendar (§4) ----------
function CalendarTab({ projectId }: { projectId: string }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      setEvents(await listCalendarEvents(projectId));
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function addLocalEvent(e: React.FormEvent) {
    e.preventDefault();
    const title = (e.target.elements.title as HTMLInputElement).value.trim();
    const start = (e.target.elements.start as HTMLInputElement).value;
    const end = (e.target.elements.end as HTMLInputElement).value;
    if (!title || !start) return;
    await createLocalEvent({
      projectId,
      title,
      startAt: new Date(start).getTime(),
      endAt: end ? new Date(end).getTime() : new Date(start).getTime() + 60 * 60 * 1000,
    });
    (e.target as HTMLFormElement).reset();
    refresh();
  }

  async function deleteEvent(id: string) {
    await deleteCalendarEvent(id);
    refresh();
  }

  if (loading) {
    return <p className="empty-state">Loading calendar...</p>;
  }

  return (
    <div>
      <form className="resource-form" onSubmit={addLocalEvent}>
        <input type="text" name="title" placeholder="Event title..." data-tip="Local calendar event title" />
        <MicButton onResult={(text) => { (document.querySelector('input[name="title"]') as HTMLInputElement).value = text; }} />
        <input type="datetime-local" name="start" data-tip="Start time" />
        <input type="datetime-local" name="end" data-tip="End time" />
        <button type="submit" className="btn-primary clickable">+ Add local event</button>
      </form>

      {error && <p className="otp-error">{error}</p>}

      {events.length === 0 ? (
        <p className="empty-state">
          No calendar events for this project. Add a local event above, or connect
          Google Calendar in Settings to import events (including Meet links).
        </p>
      ) : (
        <ul className="task-list">
          {events.map((e) => (
            <li key={e.id} className="task-item" style={{ borderLeft: "4px solid var(--color-accent-milestone)" }}>
              <span className="task-title">{e.title}</span>
              <span className="task-status-label">
                {new Date(e.startAt).toLocaleString()}
                {e.endAt && ` – ${new Date(e.endAt).toLocaleTimeString()}`}
              </span>
              {e.hangoutLink && (
                <a
                  href={e.hangoutLink}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary btn-small clickable"
                  data-tip="Join Google Meet"
                >
                  Join Meet
                </a>
              )}
              <span className={`chip-small ${e.source === "google" ? "" : "chip-active"}`}>
                {e.source === "google" ? "Google" : "Local"}
              </span>
              <button
                className="task-delete-btn"
                data-tip="Delete event"
                onClick={() => deleteEvent(e.id)}
              >
                ×
              </button>
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

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

  async function saveEdit(id: string) {
    if (editValue.trim()) await updateIssue(id, { title: editValue.trim() });
    setEditingId(null);
    refresh();
  }

  return (
    <div>
      <form className="resource-form" onSubmit={addIssue}>
        <input type="text" placeholder="New issue / setback..." value={title} onChange={(e) => setTitle(e.target.value)} />
        <MicButton onResult={(text) => setTitle(text)} />
        <select value={severity} onChange={(e) => setSeverity(e.target.value as IssueSeverity)} data-tip="Issue severity">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button type="submit" className="btn-primary clickable">+ Log issue</button>
      </form>
      {issues.length === 0 ? (
        <p className="empty-state">No issues logged. Good sign.</p>
      ) : (
        <ul className="task-list">
          {issues.map((i) => (
            <li key={i.id} className={`task-item issue-${i.severity}`}>
              {editingId === i.id ? (
                <input
                  className="task-title-input"
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => saveEdit(i.id)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit(i.id)}
                />
              ) : (
                <span className="task-title">{i.title}</span>
              )}
              <select
                value={i.severity}
                onChange={async (e) => { await updateIssue(i.id, { severity: e.target.value as IssueSeverity }); refresh(); }}
                data-tip="Change severity"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <span className="task-status-label">{i.status}</span>
              {i.status === "open" && (
                <button
                  className="btn-secondary clickable"
                  data-tip="Resolve this issue"
                  onClick={async () => { await setIssueStatus(i.id, "resolved"); refresh(); }}
                >
                  Resolve
                </button>
              )}
              <button
                className="btn-icon clickable"
                data-tip="Rename issue"
                onClick={() => { setEditingId(i.id); setEditValue(i.title); }}
              >
                Edit
              </button>
              <button
                className="task-delete-btn"
                data-tip="Delete issue"
                onClick={async () => { await deleteIssue(i.id); refresh(); }}
              >
                ×
              </button>
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

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

  async function saveEdit(id: string) {
    if (editValue.trim()) await updateReminder(id, { message: editValue.trim() });
    setEditingId(null);
    refresh();
  }

  return (
    <div>
      <form className="resource-form" onSubmit={addReminder}>
        <input type="text" placeholder="Reminder message..." value={message} onChange={(e) => setMessage(e.target.value)} />
        <MicButton onResult={(text) => setMessage(text)} />
        <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} data-tip="When this reminder should fire" />
        <button type="submit" className="btn-primary clickable">+ Set reminder</button>
      </form>
      {reminders.length === 0 ? (
        <p className="empty-state">No reminders set for this project.</p>
      ) : (
        <ul className="task-list">
          {reminders.map((r) => (
            <li key={r.id} className={`task-item reminder-${r.status}`}>
              {editingId === r.id ? (
                <input
                  className="task-title-input"
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => saveEdit(r.id)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit(r.id)}
                />
              ) : (
                <span className="task-title">{r.message}</span>
              )}
              <input
                type="datetime-local"
                className="reminder-time-input"
                defaultValue={new Date(r.triggerAt - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                onChange={async (e) => {
                  if (!e.target.value) return;
                  await updateReminder(r.id, { triggerAt: new Date(e.target.value).getTime() });
                  refresh();
                }}
                data-tip="Change reminder time"
              />
              {r.status === "pending" && (
                <button
                  className="btn-secondary clickable"
                  data-tip="Dismiss this reminder"
                  onClick={async () => { await dismissReminder(r.id); refresh(); }}
                >
                  Dismiss
                </button>
              )}
              <button
                className="btn-icon clickable"
                data-tip="Rename reminder"
                onClick={() => { setEditingId(r.id); setEditValue(r.message); }}
              >
                Edit
              </button>
              <button
                className="task-delete-btn"
                data-tip="Delete reminder"
                onClick={async () => { await deleteReminder(r.id); refresh(); }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
