import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listProjects, createProject, getProjectTaskStats } from "../data/projects";
import { getDashboardAlerts, getDashboardSummary, type Alert, type DashboardSummary } from "../data/dashboard";
import type { Project } from "../data/db";
import ProjectCard from "../components/ProjectCard";
import MicButton from "../components/MicButton";

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [progressById, setProgressById] = useState<Record<string, number>>({});
  const [pendingById, setPendingById] = useState<Record<string, number>>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
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
    const [alertData, summaryData] = await Promise.all([getDashboardAlerts(), getDashboardSummary()]);
    setAlerts(alertData);
    setSummary(summaryData);
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
      ) : (
        <>
          {/* §2 — Alerts (computed, not stored) */}
          {alerts.length > 0 && (
            <section className="dashboard-section">
              <h2 className="section-heading">Alerts</h2>
              <ul className="alert-list">
                {alerts.map((a) => (
                  <li key={a.id} className="alert-item">
                    <span className="alert-dot" />
                    <div className="alert-text">
                      <span className="alert-title">{a.title}</span>
                      <span className="alert-subtitle">{a.subtitle}</span>
                    </div>
                    {a.routerLink && (
                      <Link to={a.routerLink} className="alert-link clickable" data-tip="Go to item">
                        Go
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* §2 — Summary row (clickable cards, deep-link) */}
          {summary && (
            <section className="dashboard-section">
              <h2 className="section-heading">Summary</h2>
              <div className="summary-row">
                <Link
                  to="/dashboard?filter=tasks"
                  className="summary-card clickable"
                  data-tip={`${summary.activeTaskCount} active task(s). Click to view all tasks.`}
                >
                  <span className="summary-card-num">{summary.activeTaskCount}</span>
                  <span className="summary-card-label">Active tasks</span>
                </Link>
                <Link
                  to="/dashboard?filter=remaining"
                  className="summary-card clickable"
                  data-tip={`${summary.remainingTaskCount} total task(s) across ${summary.projectCount} project(s).`}
                >
                  <span className="summary-card-num">{summary.remainingTaskCount}</span>
                  <span className="summary-card-label">Tasks (total)</span>
                </Link>
                <Link
                  to="/dashboard?filter=milestones"
                  className="summary-card clickable"
                  data-tip={`${summary.milestoneAchieved} of ${summary.milestoneTotal} milestones achieved (${summary.milestoneProgressPercent}%).`}
                >
                  <span className="summary-card-num">{summary.milestoneProgressPercent}%</span>
                  <span className="summary-card-label">Milestones</span>
                </Link>
                <Link
                  to="/dashboard?filter=projects"
                  className="summary-card clickable"
                  data-tip={`${summary.projectCount} project(s). Click to see all.`}
                >
                  <span className="summary-card-num">{summary.projectCount}</span>
                  <span className="summary-card-label">Projects</span>
                </Link>
              </div>
            </section>
          )}

          {/* §2 — Project grid */}
          <section className="dashboard-section">
            <h2 className="section-heading">Projects</h2>
            {projects.length === 0 ? (
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
          </section>
        </>
      )}

      {/* Add project drawer */}
      {drawerOpen && (
        <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h2>New project</h2>
              <button
                className="btn-icon clickable"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close"
                data-tip="Close"
              >
                ×
              </button>
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
