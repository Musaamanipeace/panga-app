import { Link } from "react-router-dom";
import type { Project } from "../data/db";
import ProgressBar from "./ProgressBar";

interface Props {
  project: Project;
  progress: number;
}

export default function ProjectCard({ project, progress }: Props) {
  return (
    <Link to={`/project/${project.id}`} className="project-card">
      <h3>{project.name}</h3>
      {project.description && <p>{project.description}</p>}
      <ProgressBar percent={progress} />
      <span className="progress-label">{progress}% complete</span>
    </Link>
  );
}
