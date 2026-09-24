import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProject, getProjectTaskStats } from "../data/projects";
import { listTasksForProject, createTask, updateTask, setTaskStatus, deleteTask } from "../data/tasks";
import {
  listResourcesForProject,
  createResource,
  updateResource,
  deleteResource,
  reassignResourcesToCategory,
  listResourceCategories,
  saveResourceCategories,
} from "../data/resources";
import { listDocEntries, createDocEntry, updateDocEntry, deleteDocEntry } from "../data/docs";
import {
  listMilestones,
  createMilestone,
  updateMilestone,
  setMilestoneStatus,
  deleteMilestone,
  reconcileMilestoneStatuses,
} from "../data/milestones";
import { listIssues, createIssue, updateIssue, setIssueStatus, deleteIssue } from "../data/issues";
import { listReminders, createReminder, updateReminder, dismissReminder, deleteReminder } from "../data/reminders";
import type {
  Project,
  Task,
  TaskStatus,
  Resource,
  ResourceImage,
  ResourceCategoryDef,
  DocEntry,
  Milestone,
  Issue,
  IssueSeverity,
  Reminder,
} from "../data/db";
import ProgressBar from "../components/ProgressBar";
import MicButton from "../components/MicButton";

const TABS = ["Documentation", "Tasks", "Resources", "Milestones", "Issues", "Reminders"] as const;
type Tab = (typeof TABS)[number];

const TAB_HINTS: Record<Tab, string> = {
  Documentation: "Upload or view project README, wireframes, and structural specs",
  Tasks: "Track active, scheduled, and remaining tasks",
  Resources: "Notes, scripts, links, contacts, secrets, calendar, and images",
  Milestones: "Phase checkpoints — hover a milestone to see its blocking tasks",
  Issues: "Log setbacks and blockers with a severity rating",
  Reminders: "Schedule follow-up nudges for this project",
};

export default function ProjectView() {
  const { projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [progress, setProgress] = useState(0);
  const [pending, setPending] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>("Documentation");

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
                  ✕
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
                ✎
              </button>
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
  const [categories, setCategories] = useState<ResourceCategoryDef[]>([]);
  const [category, setCategory] = useState<string>("");
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [textBody, setTextBody] = useState("");
  const [images, setImages] = useState<ResourceImage[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Resource | null>(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [editingCat, setEditingCat] = useState<ResourceCategoryDef | null>(null);

  const catMeta = (id: string) => categories.find((c) => c.id === id);

  async function loadCategories() {
    const cats = await listResourceCategories();
    setCategories(cats);
    if (cats.length > 0 && !cats.some((c) => c.id === category)) {
      setCategory(cats[0].id);
    }
  }

  async function refresh() {
    const [res, cats] = await Promise.all([
      listResourcesForProject(projectId),
      listResourceCategories(),
    ]);
    setResources(res);
    setCategories(cats);
    if (cats.length > 0 && !cats.some((c) => c.id === category)) {
      setCategory(cats[0].id);
    }
  }
  useEffect(() => {
    loadCategories();
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  function fileToDataUrl(file: File): Promise<{ dataUrl: string; name: string; alt: string }> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () =>
        resolve({ dataUrl: reader.result as string, name: file.name, alt: file.name });
      reader.readAsDataURL(file);
    });
  }

  async function addResource(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim()) {
      await createResource({
        projectId,
        category,
        title: title.trim(),
        value: value.trim(),
        textBody: textBody.trim(),
        images,
        notes: value.trim(),
      });
    }
    setTitle("");
    setValue("");
    setTextBody("");
    setImages([]);
    if (catMeta(category)?.supportsText === false) setCategory(categories[0]?.id ?? "");
    refresh();
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    await updateResource(editing.id, {
      category,
      title: title.trim(),
      value: value.trim(),
      textBody: textBody.trim(),
      images,
    });
    setEditing(null);
    refresh();
  }

  function openEdit(r: Resource) {
    setEditing(r);
    setCategory(r.category);
    setTitle(r.title);
    setValue(r.value);
    setTextBody(r.textBody ?? "");
    setImages(r.images ?? []);
  }

  function openNew() {
    setEditing(null);
    setTitle("");
    setValue("");
    setTextBody("");
    setImages([]);
    const def = categories.find((c) => c.supportsText) ?? categories[0];
    setCategory(def?.id ?? "");
  }

  async function saveCategory() {
    const cats = [...categories];
    if (editingCat) {
      const i = cats.findIndex((c) => c.id === editingCat.id);
      cats[i] = { ...editingCat, name: newCatName.trim() || editingCat.name };
      // Reassign any resource using the deleted id (handled by delete)
    } else {
      const id = newCatName.toLowerCase().replace(/\W+/g, "_").replace(/^_+|_+$/g, "") || `cat_${Date.now()}`;
      cats.push({
        id,
        name: newCatName.trim(),
        icon: "🔹",
        color: "#64748b",
        supportsText: true,
        supportsImage: true,
      });
    }
    await saveResourceCategories(cats);
    setCategories(cats);
    setEditingCat(null);
    setNewCatName("");
    refresh();
  }

  async function deleteCategory(id: string) {
    const fallback = categories.find((c) => c.id !== id && c.supportsText)?.id ?? categories[0]?.id ?? "";
    await reassignResourcesToCategory(id, fallback);
    const cats = categories.filter((c) => c.id !== id);
    await saveResourceCategories(cats);
    setCategories(cats);
    refresh();
  }

  const filtered = filter === "all" ? resources : resources.filter((r) => r.category === filter);

  return (
    <div>
      <form className="resource-form" onSubmit={editing ? saveEdit : addResource}>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
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
        {catMeta(category)?.supportsText && (
          <>
            <textarea
              placeholder="Text body (notes, details, description)..."
              value={textBody}
              onChange={(e) => setTextBody(e.target.value)}
              rows={2}
            />
            <MicButton onResult={(text) => setTextBody((prev) => prev + " " + text)} />
          </>
        )}
        {catMeta(category)?.supportsImage && (
          <>
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
            />
            {images.length > 0 && (
              <div className="image-preview-row">
                {images.map((img, i) => (
                  <div key={i} className="image-thumb">
                    <img src={img.dataUrl} alt={img.alt} title={img.name} />
                    <button
                      type="button"
                      className="thumb-remove"
                      onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                      aria-label="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        <button type="submit" className="btn-primary">{editing ? "Save" : "+ Add resource"}</button>
        {editing && (
          <button type="button" className="btn-secondary" onClick={() => { setEditing(null); openNew(); }}>
            Cancel
          </button>
        )}
        <button type="button" className="btn-secondary" onClick={() => setShowCategoryManager(true)}>
          Manage categories
        </button>
      </form>

      <div className="chip-row">
        <button className={`chip ${filter === "all" ? "chip-active" : ""}`} onClick={() => setFilter("all")}>All</button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`chip ${filter === c.id ? "chip-active" : ""}`}
            onClick={() => setFilter(c.id)}
          >
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="empty-state">No resources in this category yet.</p>
      ) : (
        <ul className="resource-list">
          {filtered.map((r) => {
            const c = catMeta(r.category);
            return (
              <li key={r.id} className="resource-item">
                <span className="resource-icon">{c?.icon ?? "🔗"}</span>
                <span className="resource-text">
                  <span className="resource-title">{r.title}</span>
                  {r.category === "link" || r.category === "location" ? (
                    <a href={r.value} target="_blank" rel="noreferrer" className="resource-value-link">{r.value}</a>
                  ) : (
                    <span className="resource-value">{r.value}</span>
                  )}
                  {r.textBody && <p className="resource-notes">{r.textBody}</p>}
                  {r.images.length > 0 && (
                    <div className="resource-image-row">
                      {r.images.map((img, i) => (
                        <img key={i} src={img.dataUrl} alt={img.alt} className="resource-image-thumb" />
                      ))}
                    </div>
                  )}
                  <span className="chip-small">{c?.name ?? r.category}</span>
                </span>
                <button className="task-delete-btn" onClick={async () => { await deleteResource(r.id); refresh(); }}>✕</button>
                <button className="btn-secondary btn-small" onClick={() => openEdit(r)}>Edit</button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Category manager modal */}
      {showCategoryManager && (
        <div className="modal-backdrop" onClick={() => setShowCategoryManager(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h2>Manage resource categories</h2>
              <button className="btn-icon" onClick={() => setShowCategoryManager(false)} aria-label="Close">✕</button>
            </header>
            <div className="modal-body">
              {categories.map((c) => (
                <div key={c.id} className="category-row">
                  <span>{c.icon} {c.name}</span>
                  <div>
                    <button className="btn-secondary btn-small" onClick={() => { setEditingCat(c); setNewCatName(c.name); }}>Rename</button>
                    <button className="btn-secondary btn-small" onClick={() => deleteCategory(c.id)}>Delete</button>
                  </div>
                </div>
              ))}
              {editingCat ? (
                <>
                  <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
                  <button className="btn-primary btn-small" onClick={saveCategory}>Save</button>
                  <button className="btn-secondary btn-small" onClick={() => { setEditingCat(null); setNewCatName(""); }}>Cancel</button>
                </>
              ) : (
                <>
                  <input
                    placeholder="New category name"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                  />
                  <button className="btn-primary btn-small" onClick={saveCategory}>Add</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
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
        <button type="submit" className="btn-primary">+ Add milestone</button>
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
                    ✎
                  </button>
                  <button className="task-delete-btn" onClick={async () => { await deleteMilestone(m.id); refresh(); }}>✕</button>
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
                              {t.status === "completed" ? "✓" : "○"} {t.title}
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
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <span className="task-status-label">{i.status}</span>
              {i.status === "open" && (
                <button className="btn-secondary" onClick={async () => { await setIssueStatus(i.id, "resolved"); refresh(); }}>
                  Resolve
                </button>
              )}
              <button
                className="btn-icon clickable"
                data-tip="Rename issue"
                onClick={() => { setEditingId(i.id); setEditValue(i.title); }}
              >
                ✎
              </button>
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
        <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
        <button type="submit" className="btn-primary">+ Set reminder</button>
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
              />
              {r.status === "pending" && (
                <button className="btn-secondary" onClick={async () => { await dismissReminder(r.id); refresh(); }}>
                  Dismiss
                </button>
              )}
              <button
                className="btn-icon clickable"
                data-tip="Rename reminder"
                onClick={() => { setEditingId(r.id); setEditValue(r.message); }}
              >
                ✎
              </button>
              <button className="task-delete-btn" onClick={async () => { await deleteReminder(r.id); refresh(); }}>✕</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
