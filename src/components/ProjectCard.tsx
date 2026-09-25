import { useState } from "react";
import { Link } from "react-router-dom";
import type { Project } from "../data/db";
import ProgressBar from "./ProgressBar";
import { updateProject, deleteProject } from "../data/projects";

interface Props {
  project: Project;
  progress: number;
  pending?: number;
  onChange: () => void;
}

export default function ProjectCard({ project, progress, pending, onChange }: Props) {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(project.name);

  async function saveRename(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    const trimmed = name.trim();
    if (trimmed && trimmed !== project.name) {
      await updateProject(project.id, { name: trimmed });
    }
    setRenaming(false);
    onChange();
  }

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${project.name}" and everything in it? This can't be undone.`)) return;
    await deleteProject(project.id);
    onChange();
  }

  if (renaming) {
    return (
      <form
        className="project-card project-card-editing"
        onSubmit={saveRename}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
        <div className="project-card-actions">
          <button type="submit" className="btn-primary btn-small clickable">Save</button>
          <button
            type="button"
            className="btn-secondary btn-small clickable"
            onClick={(e) => { e.stopPropagation(); setName(project.name); setRenaming(false); }}
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <Link to={`/project/${project.id}`} className="project-card clickable">
      <div className="project-card-top">
        <h3>{project.name}</h3>
        <div className="project-card-actions">
          <button
            type="button"
            className="btn-icon clickable"
            data-tip="Rename project"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setRenaming(true); }}
          >
            Edit
          </button>
          <button
            type="button"
            className="btn-icon clickable"
            data-tip="Delete project"
            onClick={handleDelete}
          >
            Del
          </button>
        </div>
      </div>
      {project.description && <p>{project.description}</p>}
      <ProgressBar percent={progress} pending={pending} />
      <span className="progress-label">{progress}% complete</span>
    </Link>
  );
}
