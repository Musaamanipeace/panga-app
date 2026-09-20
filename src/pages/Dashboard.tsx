import { useEffect, useState } from "react";
import { listProjects, createProject, getProjectProgress } from "../data/projects";
import type { Project } from "../data/db";
import ProjectCard from "../components/ProjectCard";
import MicButton from "../components/MicButton";

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [progressById, setProgressById] = useState<Record<string, number>>({});
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const list = await listProjects("active");
    setProjects(list);
    const entries = await Promise.all(
      list.map(async (p) => [p.id, await getProjectProgress(p.id)] as const)
    );
    setProgressById(Object.fromEntries(entries));
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
    refresh();
  }

  return (
    <div className="page dashboard">
      <header className="page-header">
        <h1>Projects</h1>
        {/* Global search lands here in Stage 3 */}
      </header>

      <form className="inline-form" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="New project name..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <MicButton onResult={(text) => setNewName(text)} />
        <button type="submit" className="btn-primary">
          + Add project
        </button>
      </form>

      {loading ? (
        <p className="empty-state">Loading...</p>
      ) : projects.length === 0 ? (
        <p className="empty-state">
          No projects yet — add your first one above. Stored locally, works offline.
        </p>
      ) : (
        <div className="project-grid">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} progress={progressById[p.id] ?? 0} />
          ))}
        </div>
      )}
    </div>
  );
}
