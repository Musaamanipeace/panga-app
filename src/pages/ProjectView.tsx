import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getProject, getProjectTaskStats } from "../data/projects";
import { listTasksForProject, createTask, updateTask, setTaskStatus, deleteTask, type Task, type TaskStatus } from "../data/tasks";
import { listResourcesForProject, createResource, updateResource, deleteResource, type Resource, type ResourceImage, type ResourceFile } from "../data/resources";
import { listDocEntries, createDocEntry, updateDocEntry, deleteDocEntry, type DocEntry } from "../data/docs";
import { listMilestones, createMilestone, updateMilestone, setMilestoneStatus, deleteMilestone, reconcileMilestoneStatuses, type Milestone } from "../data/milestones";
import { listIssues, createIssue, updateIssue, setIssueStatus, deleteIssue, addIssueComment, deleteIssueComment, type Issue, type IssueSeverity } from "../data/issues";
import { listCalendarEvents, createLocalEvent, deleteCalendarEvent, type CalendarEvent, type CalendarEventSource } from "../data/calendar";
import { listReminders, createReminder, updateReminder, dismissReminder, deleteReminder, type Reminder } from "../data/reminders";
import { db, type Project } from "../data/db";
import { newId, now } from "../data/utils";
import ProgressBar from "../components/ProgressBar";
import MicButton from "../components/MicButton";
import InsightsTab from "../components/project/InsightsTab";
import ContactsTab from "../components/project/ContactsTab";

const TABS = ["Documentation", "Tasks", "Resources", "Milestones", "Insights", "Issues", "Reminders", "Contacts", "Calendar"] as const;
type Tab = (typeof TABS)[number];

const TAB_HINTS: Record<Tab, string> = {
  Documentation: "Project README, wireframes, and structural specs",
  Tasks: "Track active, scheduled, and remaining tasks",
  Resources: "Notes, scripts, links, images, PDFs",
  Milestones: "Phase checkpoints — hover to see blocking tasks",
  Insights: "Your notes — notes, links, images, PDFs",
  Issues: "Log setbacks and blockers with labels, comments, milestones",
  Reminders: "Schedule follow-up nudges for this project",
  Contacts: "Project contacts — emails, phones, links",
  Calendar: "Local events with links to tasks, milestones, resources, and insights",
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
  Calendar: "Calendar",
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
        {activeTab === "Calendar" && <CalendarTab projectId={projectId} />}
      </div>
    </div>
  );
}

// ---------- Documentation ----------
function DocumentationTab({ projectId }: { projectId: string }) {
  const [entries, setEntries] = useState<DocEntry[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [uploadNote, setUploadNote] = useState<string | null>(null);

  async function refresh() {
    setEntries(await listDocEntries(projectId));
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  function fileToText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadNote(null);
    if (file.name.endsWith(".doc") || file.name.endsWith(".docx")) {
      setUploadNote("Word documents (.doc/.docx) cannot be parsed directly in the browser. Please save as .txt or .md first, or paste the content.");
      e.target.value = "";
      return;
    }
    try {
      const text = await fileToText(file);
      setNewContent(text);
      if (!newTitle.trim()) {
        const inferredTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setNewTitle(inferredTitle);
      }
      setUploadNote(`Loaded content from "${file.name}" into body.`);
    } catch {
      setUploadNote("Failed to read text from file.");
    }
    e.target.value = "";
  }

  async function addOutline(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await createDocEntry({
      projectId,
      type: "outline",
      title: newTitle.trim(),
      content: newContent.trim(),
    });
    setNewTitle("");
    setNewContent("");
    setUploadNote(null);
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
      <form className="resource-form" onSubmit={addOutline} style={{ marginBottom: 20 }}>
        <div className="field" style={{ flexBasis: "100%" }}>
          <label>Documentation Title</label>
          <div className="inline-form" style={{ marginBottom: 0 }}>
            <input
              type="text"
              placeholder="Section title (e.g. 'Overview', 'Phase 1 Specs', 'Architecture')..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
            <MicButton onResult={(text) => setNewTitle(text)} />
          </div>
        </div>

        <div className="field" style={{ flexBasis: "100%" }}>
          <label>Body / Content</label>
          <textarea
            placeholder="Write section body, documentation notes, technical specs, or outline details..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={4}
          />
          <div style={{ marginTop: 4 }}>
            <MicButton onResult={(text) => setNewContent((prev) => (prev ? prev + " " + text : text))} />
          </div>
        </div>

        <div className="field" style={{ flexBasis: "100%" }}>
          <label style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            Or upload a file instead of typing the body (.txt, .md):
          </label>
          <input
            type="file"
            accept=".txt,.md,.doc,.docx"
            onChange={handleFileUpload}
            data-tip="Upload .txt or .md file to automatically populate title and body"
          />
          {uploadNote && (
            <p className={uploadNote.includes("cannot be parsed") || uploadNote.includes("Failed") ? "otp-error" : "progress-label"} style={{ margin: "4px 0" }}>
              {uploadNote}
            </p>
          )}
        </div>

        <button type="submit" className="btn-primary clickable">
          + Add documentation section
        </button>
      </form>

      {entries.length === 0 ? (
        <p className="empty-state">
          No documentation yet. Add a section above — this is your project outline &amp;
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
              <button
                type="button"
                className={`task-status-btn is-${task.status} clickable`}
                onClick={() => cycleStatus(task)}
                data-tip="Click to cycle status (active → completed → inactive)"
                aria-label={`Cycle status: currently ${task.status}`}
              >
                {task.status === "completed" ? "✓ Done" : task.status === "inactive" ? "— Parked" : "○ Active"}
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
  const [provider, setProvider] = useState<"gemini" | "claude" | "gpt" | "other">("other");
  const [images, setImages] = useState<ResourceImage[]>([]);
  const [files, setFiles] = useState<ResourceFile[]>([]);
  const [imgLink, setImgLink] = useState("");
  const [pdfLink, setPdfLink] = useState("");

  const DEFAULT_CATEGORIES: { id: string; label: string }[] = [
    { id: "notes", label: "Notes" },
    { id: "scripts", label: "Scripts" },
    { id: "links", label: "Links" },
    { id: "images", label: "Images" },
    { id: "pdfs", label: "PDFs" },
  ];

  // Custom categories state (global addition, accessible across all projects)
  const [customCategories, setCustomCategories] = useState<{ id: string; label: string }[]>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  // Load custom categories from global storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("panga-categories-global");
      if (stored) {
        setCustomCategories(JSON.parse(stored));
      }
    } catch {}
  }, []);

  function saveCustomCategories(cats: { id: string; label: string }[]) {
    setCustomCategories(cats);
    try {
      localStorage.setItem("panga-categories-global", JSON.stringify(cats));
    } catch {}
  }

  function handleAddCategory(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const name = newCatName.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    if (!id) return;
    const exists = DEFAULT_CATEGORIES.some((c) => c.id === id) || customCategories.some((c) => c.id === id);
    if (!exists) {
      const updated = [...customCategories, { id, label: name }];
      saveCustomCategories(updated);
    }
    setFilter(id);
    setSubfilter("all");
    setNewCatName("");
    setShowAddCategory(false);
  }

  function handleRemoveCategory(catId: string) {
    if (!confirm(`Delete custom category "${CATEGORY_LABELS[catId] || catId}"? Existing items will remain.`)) return;
    const updated = customCategories.filter((c) => c.id !== catId);
    saveCustomCategories(updated);
    if (filter === catId) {
      setFilter("all");
      setSubfilter("all");
    }
  }

  const allCategories: { id: string; label: string }[] = useMemo(() => {
    return [...DEFAULT_CATEGORIES, ...customCategories];
  }, [customCategories]);

  const CATEGORY_LABELS: Record<string, string> = useMemo(() => {
    const map: Record<string, string> = {
      notes: "Notes",
      scripts: "Scripts",
      links: "Links",
      images: "Images",
      pdfs: "PDFs",
    };
    for (const c of customCategories) {
      map[c.id] = c.label;
    }
    return map;
  }, [customCategories]);

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
    images: { all: "All" },
    pdfs: { all: "All" },
  };

  // Custom subcategories state (shared across all projects)
  const [customSubcategories, setCustomSubcategories] = useState<Record<string, string[]>>({});
  const [newSubcategory, setNewSubcategory] = useState("");
  const [showSubcategoryManager, setShowSubcategoryManager] = useState(false);
  const [uploadNote, setUploadNote] = useState<string | null>(null);

  // Load custom subcategories from global storage on mount (migrating any legacy per-project ones)
  useEffect(() => {
    try {
      const globalStored = localStorage.getItem("panga-subcategories-global");
      if (globalStored) {
        setCustomSubcategories(JSON.parse(globalStored));
      } else {
        const legacyStored = localStorage.getItem(`panga-subcategories-${projectId}`);
        if (legacyStored) {
          const parsed = JSON.parse(legacyStored);
          setCustomSubcategories(parsed);
          localStorage.setItem("panga-subcategories-global", JSON.stringify(parsed));
        }
      }
    } catch {}
  }, [projectId]);

  // Save custom subcategories to global storage
  useEffect(() => {
    if (Object.keys(customSubcategories).length > 0) {
      localStorage.setItem("panga-subcategories-global", JSON.stringify(customSubcategories));
    }
  }, [customSubcategories]);

  function addSubcategory() {
    if (!newSubcategory.trim()) return;
    const key = newSubcategory.trim().toLowerCase().replace(/\s+/g, "_");
    const activeCat = filter === "all" ? "notes" : filter;
    setCustomSubcategories((prev) => ({
      ...prev,
      [activeCat]: [...(prev[activeCat] || []), key].filter((v, i, a) => a.indexOf(v) === i),
    }));
    setNewSubcategory("");
  }

  function removeSubcategory(cat: string, subcat: string) {
    setCustomSubcategories((prev) => ({
      ...prev,
      [cat]: (prev[cat] || []).filter((s) => s !== subcat),
    }));
  }

  // Merge default and custom subcategories for display
  const getAllSubcategories = (cat: string) => ({
    ...(SUBCATEGORY_LABELS[cat] || { all: "All" }),
    ...Object.fromEntries((customSubcategories[cat] || []).map((s) => [s, s.replace(/_/g, " ")])),
  });

  async function refresh() {
    setResources(await listResourcesForProject(projectId));
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  function fileToText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  function resetForm() {
    setTitle("");
    setBody("");
    setUrl("");
    setProvider("other");
    setImages([]);
    setFiles([]);
    setImgLink("");
    setPdfLink("");
    setEditing(null);
  }

  async function addResource(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const cat = editing?.category ?? (filter === "all" ? "notes" : filter);
    const subcat = subfilter === "all" ? "" : subfilter;
    const input: any = {
      projectId,
      category: cat,
      title: title.trim(),
      tags: subcat ? [subcat] : [],
      body: body.trim() || null,
      files,
      images,
      url: url.trim() || null,
      provider: cat === "links" && subcat === "ai_chats" ? provider : null,
    };
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
    setProvider((r.provider as any) ?? "other");
    setImages(r.images ?? []);
    setFiles(r.files ?? []);
    if (r.tags.length > 0 && SUBCATEGORY_LABELS[r.category]?.[r.tags[0]]) {
      setSubfilter(r.tags[0]);
    } else {
      setSubfilter("all");
    }
  }

  const activeCategory = editing ? editing.category : (filter === "all" ? "notes" : filter);
  const filtered = filter === "all" ? resources : resources.filter((r) => r.category === filter);
  const subFiltered = subfilter === "all" ? filtered : filtered.filter((r) => r.tags.includes(subfilter));

  return (
    <div>
      <form className="resource-form" onSubmit={addResource}>
        {/* Category Selector + Add Category Button */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", width: "100%", marginBottom: 6 }}>
          {editing ? (
            <span className="resource-category-badge">{CATEGORY_LABELS[editing.category] || editing.category}</span>
          ) : (
            <select
              value={filter}
              onChange={(e) => {
                if (e.target.value === "__add_new__") {
                  setShowAddCategory(true);
                } else if (!editing) {
                  setFilter(e.target.value);
                  setSubfilter("all");
                }
              }}
              data-tip="Select resource category"
            >
              <option value="all">All categories</option>
              {allCategories.map((c: { id: string; label: string }) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
              <option value="__add_new__">+ Add new category...</option>
            </select>
          )}

          {!editing && (
            <button
              type="button"
              className="btn-secondary btn-small clickable"
              onClick={() => setShowAddCategory((s) => !s)}
              data-tip="Add a custom category globally accessible across all projects"
            >
              {showAddCategory ? "Close" : "+ Add category"}
            </button>
          )}

          {/* Subcategory filter for current category */}
          {!editing && filter !== "all" && getAllSubcategories(filter) && Object.keys(getAllSubcategories(filter)).length > 1 && (
            <select
              value={subfilter}
              onChange={(e) => setSubfilter(e.target.value)}
              data-tip="Filter by subcategory / tag"
            >
              {Object.entries(getAllSubcategories(filter)).map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
          )}

          {/* Subcategory manager toggle button */}
          {!editing && filter !== "all" && (
            <button
              type="button"
              className="btn-secondary btn-small clickable"
              onClick={() => setShowSubcategoryManager((s) => !s)}
              data-tip="Manage shared custom subcategories and tags across all projects"
            >
              {showSubcategoryManager ? "Close tags" : "+ Manage tags"}
            </button>
          )}
        </div>

        {/* Global Category Manager Panel */}
        {showAddCategory && (
          <div className="subcategory-manager" style={{ marginTop: 4, marginBottom: 10, width: "100%" }}>
            <label style={{ fontWeight: 600, fontSize: 13, display: "block", marginBottom: 6 }}>
              Add Category (Global addition, accessible from any project)
            </label>
            <div className="inline-form" style={{ marginBottom: 6 }}>
              <input
                type="text"
                placeholder="Category name (e.g. Credentials, Design, Templates, Research)..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
              />
              <button type="button" className="btn-primary clickable" onClick={() => handleAddCategory()}>
                + Add Category
              </button>
              <button type="button" className="btn-secondary clickable" onClick={() => setShowAddCategory(false)}>
                Cancel
              </button>
            </div>
            {customCategories.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Custom categories:</span>
                <div className="subcategory-list">
                  {customCategories.map((c) => (
                    <span key={c.id} className="subcategory-tag">
                      {c.label}
                      <button
                        type="button"
                        className="subcategory-remove clickable"
                        onClick={() => handleRemoveCategory(c.id)}
                        data-tip={`Delete ${c.label} category`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Subcategory manager panel */}
        {!editing && filter !== "all" && showSubcategoryManager && (
          <div className="subcategory-manager" style={{ marginTop: 4, marginBottom: 10, width: "100%" }}>
            <div className="field">
              <label>Add shared tag / subcategory for {CATEGORY_LABELS[filter] || filter}</label>
              <div className="inline-form" style={{ marginBottom: 0 }}>
                <input
                  type="text"
                  placeholder="e.g. research, meeting-notes, reference, sprint-1"
                  value={newSubcategory}
                  onChange={(e) => setNewSubcategory(e.target.value)}
                  data-tip="Enter tag / subcategory name (shared across projects)"
                />
                <button
                  type="button"
                  className="btn-secondary clickable"
                  onClick={addSubcategory}
                  data-tip="Add this subcategory"
                >
                  + Add
                </button>
              </div>
            </div>
            {customSubcategories[filter] && customSubcategories[filter].length > 0 && (
              <div className="subcategory-list">
                {customSubcategories[filter].map((sc) => (
                  <span key={sc} className="subcategory-tag">
                    {sc.replace(/_/g, " ")}
                    <button
                      type="button"
                      className="subcategory-remove clickable"
                      onClick={() => removeSubcategory(filter, sc)}
                      data-tip="Remove this subcategory"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {editing && getAllSubcategories(editing.category) && Object.keys(getAllSubcategories(editing.category)).length > 1 && (
          <select
            value={subfilter}
            onChange={(e) => setSubfilter(e.target.value)}
            data-tip="Subcategory / tag"
            style={{ width: "100%", marginBottom: 8 }}
          >
            {Object.entries(getAllSubcategories(editing.category)).map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
        )}

        {/* Title Field (Clearly marked) */}
        <div className="field" style={{ flexBasis: "100%" }}>
          <label>Title</label>
          <div className="inline-form" style={{ marginBottom: 0 }}>
            <input
              type="text"
              placeholder={activeCategory === "notes" ? "Note title..." : "Resource title..."}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              data-tip="Title"
            />
            <MicButton onResult={(text) => setTitle(text)} />
          </div>
        </div>

        {/* Category-specific fields */}
        {activeCategory === "links" && (
          <div className="field" style={{ flexBasis: "100%" }}>
            <label>URL</label>
            <div className="inline-form" style={{ marginBottom: 0 }}>
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
            </div>
          </div>
        )}

        {/* Explicit Note Body / Content Area */}
        {(activeCategory === "notes" || activeCategory === "scripts" || activeCategory === "links" || activeCategory === "pdfs" || !DEFAULT_CATEGORIES.some((c) => c.id === activeCategory)) && (
          <div className="field" style={{ flexBasis: "100%" }}>
            <label>
              {activeCategory === "notes" ? "Note Body" : "Body / Description / Content"}
            </label>
            <textarea
              placeholder={activeCategory === "notes" ? "Note body, details, notes, thoughts, reference text..." : "Description or details..."}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              data-tip="Resource body and notes"
            />
            <div style={{ marginTop: 4 }}>
              <MicButton onResult={(text) => setBody((prev) => (prev ? prev + " " + text : text))} />
            </div>
          </div>
        )}

        {uploadNote && (
          <p className="otp-error" style={{ flexBasis: "100%", margin: "4px 0" }}>
            {uploadNote}
          </p>
        )}

        {/* Text file upload for notes/scripts/custom categories — parse to body, store text not files */}
        {(!editing && (activeCategory === "notes" || activeCategory === "scripts" || !DEFAULT_CATEGORIES.some((c) => c.id === activeCategory))) && (
          <div style={{ flexBasis: "100%", display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
            <span className="text-tiny" style={{ color: "var(--color-text-muted)" }}>
              Upload rule: Text documents only (.txt, .md). Contents are parsed into body — no files are stored.
            </span>
            <input
              type="file"
              accept=".txt,.md,.doc,.docx"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploadNote(null);
                if (file.name.endsWith(".doc") || file.name.endsWith(".docx")) {
                  setUploadNote("Word documents (.doc/.docx) cannot be parsed directly in the browser. Please save as .txt or .md first, or copy/paste the content.");
                  e.target.value = "";
                  return;
                }
                try {
                  const text = await fileToText(file);
                  setBody((prev) => (prev ? prev + "\n\n" + text : text));
                  if (!title.trim()) {
                    setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
                  }
                } catch {
                  setUploadNote("Failed to read text from file.");
                }
                e.target.value = "";
              }}
              data-tip="Upload .txt or .md files — contents parsed into the note body above. Word docs must be saved as .txt/.md first."
            />
          </div>
        )}

        {/* Image link input — paste a Drive/share link, never store the file */}
        {activeCategory === "images" && (
          <div className="field" style={{ flexBasis: "100%" }}>
            <label>Image link</label>
            <input
              type="url"
              placeholder="https:// (Google Drive share link)"
              value={imgLink}
              onChange={(e) => setImgLink(e.target.value)}
              data-tip="Paste a link to the image (e.g. a Google Drive share link). We store the link, not the file."
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                if (!imgLink.trim()) return;
                setImages((prev) => [...prev, { link: imgLink.trim(), name: imgLink.trim(), alt: imgLink.trim() }]);
                setImgLink("");
              }}
              data-tip="Add image link"
            >
              + Add link
            </button>
          </div>
        )}

        {/* PDF link input — paste a Drive/share link + PDF-to-text helper */}
        {activeCategory === "pdfs" && (
          <div className="field" style={{ flexBasis: "100%" }}>
            <label>PDF link</label>
            <input
              type="url"
              placeholder="https:// (Google Drive share link)"
              value={pdfLink}
              onChange={(e) => setPdfLink(e.target.value)}
              data-tip="Paste a link to the PDF (e.g. a Google Drive share link). We store the link, not the file."
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                if (!pdfLink.trim()) return;
                setFiles((prev) => [...prev, { name: pdfLink.trim(), link: pdfLink.trim() }]);
                setPdfLink("");
              }}
              data-tip="Add PDF link"
            >
              + Add link
            </button>
            <p className="form-note" style={{ marginTop: 4 }}>
              <span data-tip="Convert PDF to plain text, then paste the result into the text area above">
                Need plain text from a PDF? Use a free converter like{" "}
                <a href="https://www.ilovepdf.com/pdf_to_text" target="_blank" rel="noreferrer">
                  ilovepdf.com/pdf_to_text
                </a>
                <span data-tip="1. Upload your PDF. 2. Download the extracted text. 3. Paste it into the description below."> — upload, convert, download text, then paste as the PDF description</span>
              </span>
            </p>
          </div>
        )}

        {/* Image link previews */}
        {images.length > 0 && (
          <div className="image-preview-row">
            {images.map((img, i) => (
              <div key={i} className="image-thumb">
                {img.link ? (
                  <a href={img.link || img.dataUrl} target="_blank" rel="noreferrer" data-tip="Open image link">
                    {img.dataUrl ? <img src={img.dataUrl} alt={img.alt} title={img.name} /> : <span className="thumb-link">{img.name}</span>}
                  </a>
                ) : img.dataUrl ? (
                  <img src={img.dataUrl} alt={img.alt} title={img.name} />
                ) : null}
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

        {/* File link previews for pdfs (and legacy files) */}
        {files.length > 0 && (
          <div className="image-preview-row">
            {files.map((f, i) => (
              <div key={i} className="image-thumb">
                <div className="file-preview">
                  {f.link ? (
                    <a href={f.link} target="_blank" rel="noreferrer" className="file-attachment" data-tip="Open link">
                      {f.name}
                    </a>
                  ) : (
                    <span className="file-preview-name">{f.name}</span>
                  )}
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

        <div style={{ display: "flex", gap: 8, width: "100%", marginTop: 8 }}>
          <button type="submit" className="btn-primary clickable">
            {editing ? "Save changes" : "+ Add resource"}
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
        </div>
      </form>

      {/* Filter Chips (Default + Custom Categories) */}
      <div className="chip-row">
        <button
          className={`chip ${filter === "all" ? "chip-active" : ""}`}
          data-tip="Show all resources"
          onClick={() => { setFilter("all"); setSubfilter("all"); }}
        >
          All
        </button>
        {allCategories.map((c: { id: string; label: string }) => (
          <button
            key={c.id}
            className={`chip ${filter === c.id ? "chip-active" : ""}`}
            data-tip={`Show only ${c.label.toLowerCase()}`}
            onClick={() => { setFilter(c.id); setSubfilter("all"); }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {subFiltered.length === 0 ? (
        <p className="empty-state">No resources in this category yet.</p>
      ) : (
        <ul className="resource-list">
          {subFiltered.map((r) => {
            const label = CATEGORY_LABELS[r.category] || r.category;
            const subTag = r.tags[0] && SUBCATEGORY_LABELS[r.category]?.[r.tags[0]] ? SUBCATEGORY_LABELS[r.category][r.tags[0]] : r.tags[0] || "";

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
                  {r.body && <p className="resource-notes" style={{ whiteSpace: "pre-wrap" }}>{r.body}</p>}
                  {r.images.length > 0 && (
                    <div className="resource-image-row">
                      {r.images.map((img, i) => (
                        img.link ? (
                          <a key={i} href={img.link} target="_blank" rel="noreferrer" className="resource-image-link" data-tip="Open image link">
                            {img.dataUrl ? <img src={img.dataUrl} alt={img.alt} className="resource-image-thumb" title={img.name} /> : <span className="thumb-link">{img.name}</span>}
                          </a>
                        ) : img.dataUrl ? (
                          <img key={i} src={img.dataUrl} alt={img.alt} className="resource-image-thumb" title={img.name} />
                        ) : null
                      ))}
                    </div>
                  )}
                  {r.files.length > 0 && (
                    <div className="resource-image-row">
                      {r.files.map((f, i) => (
                        <a
                          key={i}
                          href={f.link || f.dataUrl || "#"}
                          target={f.link ? "_blank" : undefined}
                          rel={f.link ? "noreferrer" : undefined}
                          download={f.link ? undefined : f.name}
                          className="file-attachment"
                          data-tip={f.link ? "Open link" : `Download ${f.name}`}
                        >
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

function getCategoryColor(cat: string): string {
  const colors: Record<string, string> = {
    notes: "#3b82f6",
    scripts: "#8b5cf6",
    links: "#22c55e",
    images: "#a855f7",
    pdfs: "#f59e0b",
  };
  if (colors[cat]) return colors[cat];
  let hash = 0;
  for (let i = 0; i < cat.length; i++) {
    hash = cat.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 45%)`;
}

// ---------- Milestones ----------
function MilestonesTab({ projectId }: { projectId: string }) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [blockingTaskIds, setBlockingTaskIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editDescription, setEditDescription] = useState("");
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
      description: description.trim(),
      targetDate: targetDate ? new Date(targetDate).getTime() : null,
      blockingTaskIds,
    });
    setTitle("");
    setDescription("");
    setTargetDate("");
    setBlockingTaskIds([]);
    refresh();
  }

  async function saveEdit(id: string) {
    if (editValue.trim()) await updateMilestone(id, { title: editValue.trim(), description: editDescription.trim() });
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
        <div className="field" style={{ flexBasis: "100%" }}>
          <label>Title</label>
          <input
            type="text"
            placeholder="New milestone (phase checkpoint)..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <MicButton onResult={(text) => setTitle(text)} />
        </div>
        <div className="field" style={{ flexBasis: "100%" }}>
          <label>Description</label>
          <textarea
            rows={2}
            placeholder="Describe this goal — gives context to the AI for agentic actions (notifications, reminders, scheduling)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Target date</label>
          <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        </div>
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
                    <>
                      <input
                        className="task-title-input"
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => saveEdit(m.id)}
                        onKeyDown={(e) => e.key === "Enter" && saveEdit(m.id)}
                      />
                      <textarea
                        className="task-title-input"
                        rows={2}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        onBlur={() => saveEdit(m.id)}
                        placeholder="Description..."
                      />
                    </>
                  ) : (
                    <>
                      <span className="milestone-title">{m.title}</span>
                      {m.description && <span className="milestone-description">{m.description}</span>}
                    </>
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
                    onClick={() => { setEditingId(m.id); setEditValue(m.title); setEditDescription(m.description); }}
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
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<IssueSeverity>("medium");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingLabels, setEditingLabels] = useState("");
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [newComment, setNewComment] = useState("");

  async function refresh() {
    setIssues(await listIssues(projectId));
    setMilestones(await listMilestones(projectId));
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function addIssue(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await createIssue({ projectId, title: title.trim(), severity, description: description.trim() });
    setTitle("");
    setDescription("");
    refresh();
  }

  async function saveEdit(id: string) {
    if (editValue.trim()) await updateIssue(id, { title: editValue.trim(), description: editingDescription.trim(), labels: editingLabels.split(",").map(l => l.trim()).filter(Boolean), milestoneId: editingMilestoneId });
    setEditingId(null);
    refresh();
  }

  async function addComment(issueId: string) {
    if (!newComment.trim()) return;
    await addIssueComment(issueId, newComment.trim());
    setNewComment("");
    refresh();
  }

  async function deleteComment(issueId: string, commentId: string) {
    await deleteIssueComment(issueId, commentId);
    refresh();
  }

  return (
    <div>
      <form className="resource-form" onSubmit={addIssue}>
        <div className="field" style={{ flexBasis: "100%" }}>
          <label>Title</label>
          <input type="text" placeholder="New issue / setback..." value={title} onChange={(e) => setTitle(e.target.value)} />
          <MicButton onResult={(text) => setTitle(text)} />
        </div>
        <div className="field" style={{ flexBasis: "100%" }}>
          <label>Description</label>
          <textarea rows={2} placeholder="Details..." value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="field">
          <label>Severity</label>
          <select value={severity} onChange={(e) => setSeverity(e.target.value as IssueSeverity)} data-tip="Issue severity">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <button type="submit" className="btn-primary clickable">+ Log issue</button>
      </form>
      {issues.length === 0 ? (
        <p className="empty-state">No issues logged. Good sign.</p>
      ) : (
        <ul className="task-list">
          {issues.map((i) => (
            <li key={i.id} className={`task-item issue-${i.severity}`}>
              {editingId === i.id ? (
                <div className="issue-edit-form">
                  <input
                    className="task-title-input"
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => saveEdit(i.id)}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit(i.id)}
                  />
                  <textarea
                    className="task-title-input"
                    rows={2}
                    value={editingDescription}
                    onChange={(e) => setEditingDescription(e.target.value)}
                    onBlur={() => saveEdit(i.id)}
                    placeholder="Description..."
                  />
                  <div className="field">
                    <label>Labels (comma separated)</label>
                    <input
                      value={editingLabels}
                      onChange={(e) => setEditingLabels(e.target.value)}
                      placeholder="bug, urgent, documentation"
                    />
                  </div>
                  <div className="field">
                    <label>Milestone</label>
                    <select
                      value={editingMilestoneId ?? ""}
                      onChange={(e) => setEditingMilestoneId(e.target.value || null)}
                    >
                      <option value="">None</option>
                      {milestones.map((m) => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-actions">
                    <button type="button" className="btn-primary" onClick={() => saveEdit(i.id)} data-tip="Save changes">Save</button>
                    <button type="button" className="btn-secondary" onClick={() => setEditingId(null)} data-tip="Cancel">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="task-title">{i.title}</span>
                  {i.description && <p className="issue-description">{i.description}</p>}
                  {i.labels && i.labels.length > 0 && (
                    <div className="issue-labels">
                      {i.labels.map((l) => (
                        <span key={l} className="label-chip">{l}</span>
                      ))}
                    </div>
                  )}
                  {i.milestoneId && (
                    <span className="milestone-link">
                      Milestone: {milestones.find((m) => m.id === i.milestoneId)?.title ?? i.milestoneId}
                    </span>
                  )}
                </>
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
                data-tip="Edit issue"
                onClick={() => {
                  setEditingId(i.id);
                  setEditValue(i.title);
                  setEditingDescription(i.description ?? "");
                  setEditingLabels(i.labels?.join(", ") ?? "");
                  setEditingMilestoneId(i.milestoneId ?? null);
                }}
              >
                Edit
              </button>
              <button
                className="btn-icon clickable"
                data-tip={showComments[i.id] ? "Hide comments" : "Show comments"}
                onClick={() => setShowComments((prev) => ({ ...prev, [i.id]: !prev[i.id] }))}
              >
                💬 {i.comments?.length ?? 0}
              </button>
              <button
                className="btn-icon clickable"
                data-tip="Edit labels"
                onClick={() => {
                  setEditingId(i.id);
                  setEditingLabels(i.labels?.join(", ") ?? "");
                }}
              >
                Labels
              </button>
              <button
                className="btn-icon clickable"
                data-tip="Link milestone"
                onClick={() => {
                  setEditingId(i.id);
                  setEditingMilestoneId(i.milestoneId ?? null);
                }}
              >
                Milestone
              </button>
              <button
                className="task-delete-btn"
                data-tip="Delete issue"
                onClick={async () => { await deleteIssue(i.id); refresh(); }}
              >
                ×
              </button>
              {showComments[i.id] && (
                <div className="issue-comments">
                  {(i.comments ?? []).map((c) => (
                    <div key={c.id} className="comment-item">
                      <p>{c.text}</p>
                      <small>{new Date(c.createdAt).toLocaleString()}</small>
                      <button
                        className="btn-icon btn-icon-danger"
                        data-tip="Delete comment"
                        onClick={() => deleteComment(i.id, c.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <div className="comment-add">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addComment(i.id)}
                    />
                    <button type="button" className="btn-primary btn-small" onClick={() => addComment(i.id)}>Add</button>
                  </div>
                </div>
              )}
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

// ---------- Calendar ----------
function CalendarTab({ projectId }: { projectId: string }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [hangoutLink, setHangoutLink] = useState("");
  const [icsFile, setIcsFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [viewDate, setViewDate] = useState(() => new Date());

  async function refresh() {
    setEvents(await listCalendarEvents(projectId));
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function addEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !startAt || !endAt) return;
    await createLocalEvent({
      projectId,
      title: title.trim(),
      description: description.trim(),
      startAt: new Date(startAt).getTime(),
      endAt: new Date(endAt).getTime(),
      hangoutLink: hangoutLink.trim() || null,
    });
    setTitle("");
    setDescription("");
    setStartAt("");
    setEndAt("");
    setHangoutLink("");
    refresh();
  }

  async function handleIcsImport(e: React.FormEvent) {
    e.preventDefault();
    if (!icsFile) return;
    setImporting(true);
    setImportStatus(null);
    try {
      const text = await icsFile.text();
      const parsedEvents = parseIcs(text);
      if (parsedEvents.length === 0) {
        setImportStatus({ message: "No events found in the .ics file.", type: "error" });
        return;
      }
      const toImport = parsedEvents.map((ev) => ({
        id: `google_${newId()}`,
        projectId,
        title: ev.title ?? "(no title)",
        description: ev.description ?? null,
        startAt: ev.startAt,
        endAt: ev.endAt,
        source: "google" as CalendarEventSource,
        hangoutLink: ev.hangoutLink ?? null,
        syncedAt: Date.now(),
        createdAt: now(),
        updatedAt: now(),
      }));
      await db.calendarEvents.bulkPut(toImport);
      setImportStatus({ message: `Imported ${toImport.length} event(s) from .ics file.`, type: "success" });
      setIcsFile(null);
      refresh();
    } catch (err) {
      setImportStatus({
        message: "Failed to parse .ics file: " + (err instanceof Error ? err.message : String(err)),
        type: "error",
      });
    } finally {
      setImporting(false);
    }
  }

  function parseIcs(text: string) {
    const parsed: Array<{ title?: string; description?: string; startAt: number; endAt: number; hangoutLink?: string }> = [];
    const lines = text.split(/\r?\n/);
    let current: Partial<{ title?: string; description?: string; startAt: number; endAt: number; hangoutLink?: string }> | null = null;

    for (const line of lines) {
      if (line.startsWith("BEGIN:VEVENT")) {
        current = {};
      } else if (line.startsWith("END:VEVENT") && current) {
        if (current.startAt && current.endAt) parsed.push(current as any);
        current = null;
      } else if (current) {
        if (line.startsWith("SUMMARY:")) current.title = line.slice(8).trim();
        else if (line.startsWith("DESCRIPTION:")) current.description = line.slice(12).trim();
        else if (line.startsWith("DTSTART:") || line.startsWith("DTSTART;")) {
          const val = line.split(":")[1];
          current.startAt = parseIcsDate(val);
        } else if (line.startsWith("DTEND:") || line.startsWith("DTEND;")) {
          const val = line.split(":")[1];
          current.endAt = parseIcsDate(val);
        } else if (line.startsWith("X-GOOGLE-HANGOUT:") || line.startsWith("X-MICROSOFT-TEAMS:") || line.includes("hangoutLink")) {
          current.hangoutLink = line.split(":").slice(1).join(":").trim();
        }
      }
    }
    return parsed;
  }

  function parseIcsDate(val: string): number {
    if (!val) return Date.now();
    const trimmed = val.trim();
    const m = trimmed.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?/);
    if (m) {
      const [, yr, mo, da, hr, mi, se, z] = m;
      if (z) {
        return Date.UTC(+yr, +mo - 1, +da, +(hr || 0), +(mi || 0), +(se || 0));
      } else {
        return new Date(+yr, +mo - 1, +da, +(hr || 0), +(mi || 0), +(se || 0)).getTime();
      }
    }
    const date = new Date(trimmed);
    return isNaN(date.getTime()) ? Date.now() : date.getTime();
  }

  // Month grid calculations
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleString("default", { month: "long", year: "numeric" });
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  function prevMonth() {
    setViewDate(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setViewDate(new Date(year, month + 1, 1));
  }
  function gotoToday() {
    setViewDate(new Date());
  }
  function selectDay(day: number) {
    const pad = (n: number) => String(n).padStart(2, "0");
    const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
    setStartAt(`${dateStr}T09:00`);
    setEndAt(`${dateStr}T10:00`);
  }

  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div>
      {/* Import .ics section */}
      <section className="dashboard-section">
        <h3 className="section-heading">Import from Google Calendar</h3>
        <p className="form-note">
          Export your Google Calendar as an .ics file (Google Calendar → Settings → Import &amp; export → Export),
          then upload it here. The app will parse events and add them as local calendar events.
        </p>
        {importStatus && (
          <p className={importStatus.type === "error" ? "otp-error" : "progress-label"} style={{ margin: "6px 0" }}>
            {importStatus.message}
          </p>
        )}
        <form className="resource-form" onSubmit={handleIcsImport}>
          <input type="file" accept=".ics" onChange={(e) => setIcsFile(e.target.files?.[0] ?? null)} data-tip="Select an .ics file" />
          <button type="submit" className="btn-primary clickable" disabled={importing || !icsFile}>
            {importing ? "Importing..." : "Import .ics file"}
          </button>
        </form>
      </section>

      {/* Calendar Controls & View Toggle */}
      <div className="calendar-view-header">
        <div className="calendar-nav">
          <button type="button" className="btn-secondary btn-small clickable" onClick={prevMonth} data-tip="Previous month">
            &larr; Prev
          </button>
          <strong style={{ fontSize: "15px", minWidth: 140, textAlign: "center" }}>{monthName}</strong>
          <button type="button" className="btn-secondary btn-small clickable" onClick={nextMonth} data-tip="Next month">
            Next &rarr;
          </button>
          <button type="button" className="btn-secondary btn-small clickable" onClick={gotoToday} data-tip="Go to today">
            Today
          </button>
        </div>
        <div className="btn-row">
          <button
            type="button"
            className={`chip ${viewMode === "grid" ? "chip-active" : ""}`}
            onClick={() => setViewMode("grid")}
            data-tip="Month grid calendar view"
          >
            Grid view
          </button>
          <button
            type="button"
            className={`chip ${viewMode === "list" ? "chip-active" : ""}`}
            onClick={() => setViewMode("list")}
            data-tip="Chronological list view"
          >
            List view
          </button>
        </div>
      </div>

      {/* Month Grid View */}
      {viewMode === "grid" && (
        <div className="calendar-grid">
          {DAY_NAMES.map((name) => (
            <div key={name} className="calendar-day-name">
              {name}
            </div>
          ))}
          {/* Blank cells before 1st of month */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="calendar-day-cell empty" />
          ))}
          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const isToday =
              today.getFullYear() === year &&
              today.getMonth() === month &&
              today.getDate() === dayNum;

            const dayEvents = events.filter((e) => {
              const d = new Date(e.startAt);
              return d.getFullYear() === year && d.getMonth() === month && d.getDate() === dayNum;
            });

            return (
              <div
                key={`day-${dayNum}`}
                className={`calendar-day-cell ${isToday ? "today" : ""}`}
                onClick={() => selectDay(dayNum)}
                data-tip={`Click day ${dayNum} to schedule an event`}
              >
                <span className="calendar-day-num">{dayNum}</span>
                {dayEvents.map((e) => (
                  <div
                    key={e.id}
                    className={`calendar-event-pill ${e.source === "google" ? "google" : ""}`}
                    data-tip={`${new Date(e.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}: ${e.title}`}
                  >
                    {new Date(e.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} {e.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Local events form */}
      <form className="resource-form" onSubmit={addEvent}>
        <div className="field" style={{ flexBasis: "100%" }}>
          <label>Title</label>
          <input type="text" placeholder="Event title..." value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field" style={{ flexBasis: "100%" }}>
          <label>Description</label>
          <textarea rows={2} placeholder="Description, links to tasks, milestones, resources, insights..." value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="field">
          <label>Start</label>
          <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} required />
        </div>
        <div className="field">
          <label>End</label>
          <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} required />
        </div>
        <div className="field" style={{ flexBasis: "100%" }}>
          <label>Meet link (optional)</label>
          <input type="url" placeholder="https://meet.google.com/..." value={hangoutLink} onChange={(e) => setHangoutLink(e.target.value)} data-tip="Google Meet or other video call link" />
        </div>
        <button type="submit" className="btn-primary clickable">+ Add event</button>
      </form>

      {/* List View / Event List */}
      {viewMode === "list" && (
        events.length === 0 ? (
          <p className="empty-state">
            No events yet. Add a local event above or import from Google Calendar.
          </p>
        ) : (
          <ul className="resource-list">
            {events
              .sort((a, b) => a.startAt - b.startAt)
              .map((e) => (
                <li key={e.id} className="resource-item">
                  <span className="resource-category-dot" style={{ backgroundColor: e.source === "google" ? "#4285f4" : "#3b82f6" }} />
                  <span className="resource-text">
                    <span className="resource-title">{e.title}</span>
                    <p className="resource-notes">
                      {new Date(e.startAt).toLocaleString()} — {new Date(e.endAt).toLocaleTimeString()}
                      {e.hangoutLink && <a href={e.hangoutLink} target="_blank" rel="noreferrer" className="resource-value-link" data-tip="Open Meet link">📹 Meet</a>}
                      {e.description && <><br />{e.description}</>}
                    </p>
                    <span className="chip-small">{e.source === "google" ? "Google Calendar" : "Local"}</span>
                  </span>
                  <button className="btn-icon clickable" data-tip="Delete event" onClick={async () => { await deleteCalendarEvent(e.id); refresh(); }}>
                    ×
                  </button>
                </li>
              ))}
          </ul>
        )
      )}
    </div>
  );
}
