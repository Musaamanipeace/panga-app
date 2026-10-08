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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  async function handleConfirmDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDeleting(true);
    try {
      await deleteProject(project.id);
      onChange();
    } catch (err) {
      console.error("Failed to delete project:", err);
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  if (confirmDelete) {
    return (
      <div
        className="project-card project-card-editing"
        style={{ borderColor: "var(--color-danger, #ef4444)", background: "rgba(239, 68, 68, 0.05)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ marginBottom: 8 }}>
          <strong style={{ color: "var(--color-danger, #ef4444)" }}>Delete project?</strong>
          <p style={{ margin: "4px 0", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
            "{project.name}" and all tasks, documents, and resources in it will be removed.
          </p>
        </div>
        <div className="project-card-actions" style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className="btn-danger btn-small clickable"
            disabled={deleting}
            onClick={handleConfirmDelete}
            style={{ background: "#dc2626", color: "#fff", border: "none", padding: "4px 10px", borderRadius: "4px" }}
          >
            {deleting ? "Deleting…" : "Yes, Delete"}
          </button>
          <button
            type="button"
            className="btn-secondary btn-small clickable"
            disabled={deleting}
            onClick={(e) => {
              e.stopPropagation();
              setConfirmDelete(false);
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setConfirmDelete(true);
            }}
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
