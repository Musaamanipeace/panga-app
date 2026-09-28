import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getProject, getProjectTaskStats } from "../data/projects";
import { listTasksForProject, listAllActiveTasks, createTask, updateTask, setTaskStatus, deleteTask, type Task, type TaskStatus } from "../data/tasks";
import { listResourcesForProject, createResource, updateResource, deleteResource, type Resource, type ResourceCategory } from "../data/resources";
import { listDocEntries, createDocEntry, updateDocEntry, deleteDocEntry, type DocEntry } from "../data/docs";
import { listMilestones, createMilestone, updateMilestone, setMilestoneStatus, deleteMilestone, reconcileMilestoneStatuses, type Milestone } from "../data/milestones";
import { listIssues, createIssue, updateIssue, setIssueStatus, deleteIssue, type Issue, type IssueSeverity } from "../data/issues";
import { listReminders, createReminder, updateReminder, dismissReminder, deleteReminder, type Reminder } from "../data/reminders";
import { listContacts, createContact, updateContact, deleteContact, type Contact, type ContactType } from "../data/contacts";
import { getGeminiApiKey } from "../data/settings";
import type { Project } from "../data/db";
import ProgressBar from "../components/ProgressBar";
import MicButton from "../components/MicButton";
import { SecretViewer } from "../components/SecretsVault";
import InsightsTab from "../components/project/InsightsTab";
import ContactsTab from "../components/project/ContactsTab";

const TABS = ["Documentation", "Tasks", "Resources", "Milestones", "Insights", "Issues", "Reminders", "Contacts"] as const;
type Tab = (typeof TABS)[number];

const TAB_HINTS: Record<Tab, string> = {
  Documentation: "Project README, wireframes, and structural specs",
  Tasks: "Track active, scheduled, and remaining tasks",
  Resources: "Notes, scripts, links, secrets, images, PDFs",
  Milestones: "Phase checkpoints — hover to see blocking tasks",
  Insights: "Task completion rate, milestone progress, issue stats",
  Issues: "Log setbacks and blockers with a severity rating",
  Reminders: "Schedule follow-up nudges for this project",
  Contacts: "Project contacts — emails, phones, links",
};

// Map query ?tab= to a tab name
const TAB_QUERY: Record<string, Tab> = {
  Documentation: "Documentation",
  Tasks: "Tasks",
  Resources: "Resources",
  Milestones: "Milestones",
  Insights: "Insights",
  Issues: "Issues",
  Reminders: "Reminders",
  Contacts: "Contacts",
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
        {activeTab === "Resources" && <ResourcesTab projectId={projectId} />}
        {activeTab === "Milestones" && <MilestonesTab projectId={projectId} />}
        {activeTab === "Insights" && <InsightsTab projectId={projectId} />}
        {activeTab === "Issues" && <IssuesTab projectId={projectId} />}
        {activeTab === "Reminders" && <RemindersTab projectId={projectId} />}
        {activeTab === "Contacts" && <ContactsTab projectId={projectId} />}
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

// ---------- Resources ----------
function ResourcesTab({ projectId }: { projectId: string }) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [subfilter, setSubfilter] = useState<string>("all");
  const [editing, setEditing] = useState<Resource | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [value, setValue] = useState("");
  const [provider, setProvider] = useState<"gemini" | "claude" | "gpt" | "other">("other");
  const [images, setImages] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);

  const CATEGORY_LABELS: Record<ResourceCategory, string> = {
    notes: "Notes",
    scripts: "Scripts",
    links: "Links",
    secrets: "Secrets",
    images: "Images",
    pdfs: "PDFs",
  };

  const SUBCATEGORY_LABELS: Record<string, Record<string, string>> = {
    notes: {
      all: "All",
      prompts: "Prompts",
      reports_memos: "Reports & Memos",
    },
    links: {
      all: "All",
      ai_chats: "AI Chats",
      bookmark_groups: "Multi-tab Bookmarks",
      my_links: "My Links",
    },
    scripts: {
      all: "All",
      shell: "Shell",
      snippets: "Snippets",
    },
    secrets: {
      all: "All",
      env_vars: "Env Vars",
      tokens: "Tokens",
    },
    images: { all: "All" },
    pdfs: { all: "All" },
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
    setProvider("other");
    setImages([]);
    setFiles([]);
    setEditing(null);
  }

  async function addResource(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const cat = editing?.category ?? "notes";
    const subcat = subfilter === "all" ? "" : subfilter;
    const input: any = {
      projectId,
      category: cat,
      title: title.trim(),
      tags: subcat ? [subcat] : [],
    };
    if (cat === "links") {
      input.url = url.trim() || null;
      input.provider = subcat === "ai_chats" ? provider : null;
      input.body = body.trim() || null;
    } else if (cat === "secrets") {
      // Secrets require the vault — create through the secrets module
      if (!editing) {
        await createSecret({ projectId, title: title.trim(), value: value.trim() });
      } else {
        await updateResource(editing.id, { title: title.trim(), value: value.trim(), tags: subcat ? [subcat] : [] });
      }
      resetForm();
      refresh();
      return;
    } else if (cat === "images") {
      input.images = images;
    } else if (cat === "pdfs") {
      input.files = files;
      input.body = body.trim() || null;
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
    setProvider((r.provider as any) ?? "other");
    setImages(r.images ?? []);
    setFiles(r.files ?? []);
    // Set subfilter based on first tag
    if (r.tags.length > 0 && SUBCATEGORY_LABELS[r.category]?.[r.tags[0]]) {
      setSubfilter(r.tags[0]);
    } else {
      setSubfilter("all");
    }
  }

  const filtered = filter === "all" ? resources : resources.filter((r) => r.category === filter);
  const subFiltered = subfilter === "all" ? filtered : filtered.filter((r) => r.tags.includes(subfilter));

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
                setSubfilter("all");
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

        {/* Subcategory filter for links and notes */}
        {!editing && (filter === "links" || filter === "notes") && SUBCATEGORY_LABELS[filter] && Object.keys(SUBCATEGORY_LABELS[filter]).length > 1 && (
          <select
            value={subfilter}
            onChange={(e) => setSubfilter(e.target.value)}
            data-tip="Filter by subcategory"
          >
            {Object.entries(SUBCATEGORY_LABELS[filter]).map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
        )}
        {editing && (editing.category === "links" || editing.category === "notes") && SUBCATEGORY_LABELS[editing.category] && Object.keys(SUBCATEGORY_LABELS[editing.category]).length > 1 && (
          <select
            value={subfilter}
            onChange={(e) => setSubfilter(e.target.value)}
            data-tip="Subcategory"
          >
            {Object.entries(SUBCATEGORY_LABELS[editing.category]).map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
        )}

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          data-tip="Resource title"
        />
        <MicButton onResult={(text) => setTitle(text)} />

        {/* Category-specific fields */}
        {!editing && filter === "links" && (
          <>
            <input
              type="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              data-tip="URL to open"
            />
            {subfilter === "ai_chats" && (
              <select value={provider} onChange={(e) => setProvider(e.target.value as any)} data-tip="AI provider for this chat link">
                <option value="gemini">Gemini</option>
                <option value="claude">Claude</option>
                <option value="gpt">GPT</option>
                <option value="other">Other</option>
              </select>
            )}
          </>
        )}
        {editing && editing.category === "links" && (
          <>
            <input
              type="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              data-tip="URL to open"
            />
            {subfilter === "ai_chats" && (
              <select value={provider} onChange={(e) => setProvider(e.target.value as any)} data-tip="AI provider for this chat link">
                <option value="gemini">Gemini</option>
                <option value="claude">Claude</option>
                <option value="gpt">GPT</option>
                <option value="other">Other</option>
              </select>
            )}
          </>
        )}

        {!editing && filter === "secrets" && (
          <input
            type="password"
            placeholder="Secret value (encrypted at rest)"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            data-tip="Secrets are encrypted with your passphrase via AES-GCM. For env vars, API keys, tokens."
          />
        )}
        {editing && editing.category === "secrets" && (
          <input
            type="password"
            placeholder="Secret value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            data-tip="Update the secret value (env var, API key, token)"
          />
        )}

        {/* Body / text for notes, scripts, links, pdfs */}
        {(!editing || ["notes", "scripts", "links", "pdfs"].includes(editing.category)) &&
         ["notes", "scripts", "links", "pdfs"].includes(editing?.category ?? filter === "all" ? "" : filter) && (
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

        {/* File upload for pdfs */}
        {!editing && filter === "pdfs" && (
          <input
            type="file"
            accept=".pdf"
            multiple
            onChange={async (e) => {
              const files = Array.from(e.target.files ?? []);
              const parsed = await Promise.all(files.map(fileToDataUrl));
              setFiles((prev) => [...prev, ...parsed]);
              e.target.value = "";
            }}
            data-tip="Attach PDF files (stored as Drive links)"
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
            data-tip="Upload image resources (stored as Drive links)"
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

        {/* File previews for notes and pdfs */}
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
          onClick={() => { setFilter("all"); setSubfilter("all"); }}
        >
          All
        </button>
        {Object.entries(CATEGORY_LABELS).map(([id, label]) => (
          <button
            key={id}
            className={`chip ${filter === id ? "chip-active" : ""}`}
            data-tip={`Show only ${label.toLowerCase()}`}
            onClick={() => { setFilter(id); setSubfilter("all"); }}
          >
            {label}
          </button>
        ))}
      </div>

      {subFiltered.length === 0 ? (
        <p className="empty-state">No resources in this category yet.</p>
      ) : (
        <ul className="resource-list">
          {subFiltered.map((r) => {
            let label = "Resource";
            if (r.category === "links") label = "Link";
            else if (r.category === "secrets") label = "Secret";
            else if (r.category === "scripts") label = "Script";
            else if (r.category === "images") label = "Image";
            else if (r.category === "pdfs") label = "PDF";
            else label = "Note";

            // Show subcategory tag
            const subTag = r.tags[0] && SUBCATEGORY_LABELS[r.category]?.[r.tags[0]] ? SUBCATEGORY_LABELS[r.category][r.tags[0]] : "";

            return (
              <li key={r.id} className="resource-item">
                <span className="resource-category-dot" style={{ backgroundColor: getCategoryColor(r.category) }} />
                <span className="resource-text">
                  <span className="resource-title">{r.title || "(untitled)"}</span>
                  {r.category === "links" && r.url ? (
                    <a href={r.url} target="_blank" rel="noreferrer" className="resource-value-link" data-tip="Open link">
                      {r.url}
                    </a>
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
                  <span className="chip-small">{label}{subTag ? ` · ${subTag}` : ""}</span>
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
    links: "#22c55e",
    secrets: "#ef4444",
    images: "#a855f7",
    pdfs: "#f59e0b",
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
