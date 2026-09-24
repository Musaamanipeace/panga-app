import { useEffect, useState } from "react";
import { listProjects, createProject, getProjectTaskStats } from "../data/projects";
import type { Project } from "../data/db";
import ProjectCard from "../components/ProjectCard";
import MicButton from "../components/MicButton";

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [progressById, setProgressById] = useState<Record<string, number>>({});
  const [pendingById, setPendingById] = useState<Record<string, number>>({});
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function refresh() {
    const list = await listProjects("active");
    setProjects(list);
    const entries = await Promise.all(
      list.map(async (p) => [p.id, await getProjectTaskStats(p.id)] as const)
    );
    setProgressById(Object.fromEntries(entries.map(([id, s]) => [id, s.percent])));
    setPendingById(Object.fromEntries(entries.map(([id, s]) => [id, s.pending])));
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    await createProject({ name });
    setNewName("");
    setDrawerOpen(false);
    refresh();
  }

  return (
    <div className="page dashboard">
      <header className="page-header">
        <h1>Projects</h1>
        <button
          type="button"
          className="btn-primary clickable"
          data-tip="Create a new project container with dedicated resources and tasks"
          onClick={() => setDrawerOpen(true)}
        >
          + Add project
        </button>
      </header>

      {loading ? (
        <p className="empty-state">Loading...</p>
        ) : projects.length === 0 ? (
        <p className="empty-state">
          No projects yet — add your first one above.
        </p>
      ) : (
        <div className="project-grid">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              progress={progressById[p.id] ?? 0}
              pending={pendingById[p.id] ?? 0}
              onChange={refresh}
            />
          ))}
        </div>
      )}

      {drawerOpen && (
        <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h2>New project</h2>
              <button className="btn-icon clickable" onClick={() => setDrawerOpen(false)} aria-label="Close">✕</button>
            </header>
            <form className="modal-body" onSubmit={handleCreate}>
              <div className="inline-form" style={{ marginBottom: 0 }}>
                <input
                  autoFocus
                  type="text"
                  placeholder="New project name..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <MicButton onResult={(text) => setNewName(text)} />
              </div>
              <button type="submit" className="btn-primary clickable">+ Add project</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
