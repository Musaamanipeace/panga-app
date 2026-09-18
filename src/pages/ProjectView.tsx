import { useParams } from "react-router-dom";

const TABS = [
  "Documentation",
  "Tasks",
  "Resources",
  "Goals",
  "Issues",
  "Reminders",
] as const;

export default function ProjectView() {
  const { projectId } = useParams();

  return (
    <div className="page project-view">
      <header className="page-header">
        <h1>Project: {projectId}</h1>
      </header>
      <nav className="tab-bar">
        {TABS.map((tab) => (
          <button key={tab} className="tab-btn">
            {tab}
          </button>
        ))}
      </nav>
      <p className="empty-state">
        Tab content wires up to real data starting Stage 2 (Tasks) and
        Stage 4 (Resources, Docs, Goals, Issues).
      </p>
    </div>
  );
}
