import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  archiveProject,
  createProject,
  deleteProject,
  listProjects,
  listTasks,
  updateProject,
  useLiveQuery,
  type Project,
} from "../data";
import Modal from "../components/Modal";
import ProgressBar from "../components/ProgressBar";

type ProjectFormState = {
  name: string;
  description: string;
};

const emptyForm: ProjectFormState = { name: "", description: "" };

function projectProgress(projectId: string, tasks: ProjectTaskCount[]) {
  const projectTasks = tasks.find((task) => task.projectId === projectId);
  if (!projectTasks || projectTasks.total === 0) return 0;
  return (projectTasks.completed / projectTasks.total) * 100;
}

type ProjectTaskCount = {
  projectId: string;
  total: number;
  completed: number;
  active: number;
};

export default function Dashboard() {
  const projects = useLiveQuery(() => listProjects(), [], []);
  const tasks = useLiveQuery(() => listTasks(), [], []);
  const [filter, setFilter] = useState<"active" | "archived" | "all">("active");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<ProjectFormState>(emptyForm);

  const taskCounts = useMemo<ProjectTaskCount[]>(() => {
    const counts = new Map<string, ProjectTaskCount>();
    for (const task of tasks) {
      const current = counts.get(task.projectId) ?? {
        projectId: task.projectId,
        total: 0,
        completed: 0,
        active: 0,
      };
      current.total += 1;
      current.completed += task.status === "completed" ? 1 : 0;
      current.active += task.status === "active" ? 1 : 0;
      counts.set(task.projectId, current);
    }
    return [...counts.values()];
  }, [tasks]);

  const visibleProjects = projects.filter((project) =>
    filter === "all" ? true : project.status === filter,
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditing(project);
    setForm({ name: project.name, description: project.description });
    setModalOpen(true);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim()) return;

    if (editing) {
      await updateProject(editing.id, form);
    } else {
      await createProject(form);
    }
    setModalOpen(false);
  };

  const removeProject = async (project: Project) => {
    if (!window.confirm(`Delete “${project.name}” and all of its local data?`)) return;
    await deleteProject(project.id);
  };

  return (
    <div className="page dashboard-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>Projects</h1>
          <p className="page-subtitle">Plan boldly. Keep every detail close at hand.</p>
        </div>
        <button className="btn-primary" onClick={openCreate} type="button">
          + New project
        </button>
      </header>

      <div className="segmented-control" aria-label="Project status filter">
        <button className={filter === "active" ? "selected" : ""} onClick={() => setFilter("active")} type="button">
          Active
        </button>
        <button className={filter === "archived" ? "selected" : ""} onClick={() => setFilter("archived")} type="button">
          Archived
        </button>
        <button className={filter === "all" ? "selected" : ""} onClick={() => setFilter("all")} type="button">
          All
        </button>
      </div>

      {visibleProjects.length ? (
        <div className="project-grid">
          {visibleProjects.map((project) => {
            const counts = taskCounts.find((task) => task.projectId === project.id);
            const progress = projectProgress(project.id, taskCounts);
            return (
              <article className="project-card" key={project.id}>
                <div className="project-card-top">
                  <div>
                    <p className="entity-kicker">Project</p>
                    <h2>
                      <Link to={`/project/${project.id}`}>{project.name}</Link>
                    </h2>
                  </div>
                  <span className={`status-pill ${project.status}`}>{project.status}</span>
                </div>
                <p className="project-description">{project.description || "No description yet."}</p>
                <ProgressBar value={progress} />
                <div className="project-meta">
                  <span>{counts?.total ?? 0} tasks</span>
                  <span>{counts?.active ?? 0} active</span>
                </div>
                <div className="card-actions">
                  <Link className="text-link" to={`/project/${project.id}`}>
                    Open project
                  </Link>
                  <div>
                    <button className="text-button" onClick={() => openEdit(project)} type="button">
                      Edit
                    </button>
                    {project.status === "active" ? (
                      <button className="text-button" onClick={() => archiveProject(project.id)} type="button">
                        Archive
                      </button>
                    ) : (
                      <button className="text-button" onClick={() => updateProject(project.id, { status: "active" })} type="button">
                        Restore
                      </button>
                    )}
                    <button className="text-button danger" onClick={() => removeProject(project)} type="button">
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-panel">
          <h2>{projects.length ? "No projects in this view" : "Your next project starts here"}</h2>
          <p>{projects.length ? "Change the status filter to see more projects." : "Create a project to organize tasks, resources, documentation, goals, and issues."}</p>
          <button className="btn-primary" onClick={openCreate} type="button">
            + New project
          </button>
        </div>
      )}

      {modalOpen ? (
        <Modal onClose={() => setModalOpen(false)} title={editing ? "Edit project" : "Create project"}>
          <form className="stacked-form" onSubmit={submit}>
            <label>
              Project name
              <input
                autoFocus
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="e.g. Launch community studio"
                required
                value={form.name}
              />
            </label>
            <label>
              Description
              <textarea
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="What is this project about?"
                rows={4}
                value={form.description}
              />
            </label>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setModalOpen(false)} type="button">
                Cancel
              </button>
              <button className="btn-primary" type="submit">
                {editing ? "Save changes" : "Create project"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
