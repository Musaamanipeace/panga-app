import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { listProjects, createProject } from "../data/projects.ts"
import {
  getDashboardAlerts,
  getDashboardSummary,
  summaryCards,
  type Alert,
  type DashboardSummary,
} from "../data/dashboard.ts"
import type { Project } from "../data/db.ts"
import ProjectCard from "../components/ProjectCard.tsx"
import MicButton from "../components/MicButton.tsx"
import { Drawer, ErrorNote, Loading, Slide, useAsync } from "../components/ui.tsx"
import HomeTasksTab from "../components/home/HomeTasksTab.tsx"
import HomeContactsTab from "../components/home/HomeContactsTab.tsx"
import HomeScheduleTab from "../components/home/HomeScheduleTab.tsx"
import HomeRemindersTab from "../components/home/HomeRemindersTab.tsx"

const TABS = ["Tasks", "Contacts", "Schedule", "Reminders"] as const;
type Tab = (typeof TABS)[number];

const TAB_HINTS: Record<Tab, string> = {
  Tasks: "Every task across every project, with a status filter",
  Contacts: "Every contact, with links to reach them",
  Schedule: "Tasks with a date and time, plus calendar events and Meet links",
  Reminders: "Reminders grouped into overdue, due and upcoming",
};

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") as Tab | null;
  const activeTab = TABS.includes(tabParam as Tab) ? (tabParam as Tab) : "Tasks";
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, error, loading, reload } = useAsync(async () => {
    const [projects, alerts, summary] = await Promise.all([
      listProjects("active"),
      getDashboardAlerts(),
      getDashboardSummary(),
    ]);
    return { projects, alerts, summary };
  }, []);

  const projects: Project[] = data?.projects ?? [];
  const alerts: Alert[] = data?.alerts ?? [];
  const summary: DashboardSummary | null = data?.summary ?? null;

  function setTab(tab: Tab) {
    setSearchParams(tab === "Tasks" ? {} : { tab }, { replace: true });
  }

  const cards = useMemo(() => (summary ? summaryCards(summary) : []), [summary]);

  if (error) {
    return (
      <div className="page page-wide">
        <ErrorNote error={error} onRetry={reload} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page page-wide">
        <Loading label="Loading home..." />
      </div>
    );
  }

  return (
    <div className="page page-wide home">
      <header className="page-header">
        <h1>Home</h1>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setDrawerOpen(true)}
          data-tip="Create a project — its own tasks, resources, docs and schedule"
        >
          + Add project
        </button>
      </header>

      {/* Alerts — computed on read, never stored. */}
      {alerts.length > 0 && (
        <section className="dashboard-section">
          <h2 className="section-heading">Alerts</h2>
          <ul className="alert-list">
            {alerts.map((a) => (
              <li key={a.id} className={`alert-item alert-${a.type}`}>
                <span className="alert-dot" aria-hidden="true" />
                <span className="alert-text">
                  <span className="alert-title">{a.title}</span>
                  <span className="alert-subtitle">{a.subtitle}</span>
                </span>
                {a.routerLink && (
                  <Link
                    to={a.routerLink}
                    className="alert-link"
                    data-tip={`Open: ${a.title}`}
                    data-tip-edge="left"
                  >
                    Open
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Summary row — each card deep-links to where that number lives. */}
      {summary && (
        <section className="dashboard-section">
          <h2 className="section-heading">Summary</h2>
          <div className="summary-row">
            {cards.map((card) =>
              card.tab ? (
                <Link
                  key={card.key}
                  to={`/home${card.tab === "Tasks" ? "" : `?tab=${card.tab}`}`}
                  className="summary-card"
                  data-tip={card.hint}
                >
                  <span className="summary-card-num">{card.value}</span>
                  <span className="summary-card-label">{card.label}</span>
                </Link>
              ) : (
                <div
                  key={card.key}
                  className="summary-card"
                  data-tip={card.hint}
                  role="group"
                  aria-label={card.label}
                >
                  <span className="summary-card-num">{card.value}</span>
                  <span className="summary-card-label">{card.label}</span>
                </div>
              )
            )}
          </div>
        </section>
      )}

      {/* Project grid. */}
      <section className="dashboard-section">
        <h2 className="section-heading">Projects</h2>
        {projects.length === 0 ? (
          <p className="empty-state">
            No projects yet. Add one above and it becomes the container for tasks,
            resources, documentation, milestones and issues.
          </p>
        ) : (
          <div className="project-grid">
             {projects.map((p) => (
              <ProjectCard key={p.id} project={p} progress={0} onChange={reload} />
            ))}
          </div>
        )}
      </section>

      {/* Cross-project tabs. */}
      <section className="dashboard-section">
        <h2 className="section-heading">Everything</h2>
        <nav className="tab-bar" aria-label="Cross-project views">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`tab-btn ${activeTab === tab ? "tab-btn-active" : ""}`}
              onClick={() => setTab(tab)}
              data-tip={TAB_HINTS[tab]}
              aria-current={activeTab === tab}
            >
              {tab}
            </button>
          ))}
        </nav>
        <Slide
          slideKey={activeTab}
          order={TABS.indexOf(activeTab)}
          previousOrder={0}
        >
          {activeTab === "Tasks" && <HomeTasksTab />}
          {activeTab === "Contacts" && <HomeContactsTab />}
          {activeTab === "Schedule" && <HomeScheduleTab />}
          {activeTab === "Reminders" && <HomeRemindersTab />}
        </Slide>
      </section>

      <AddProjectDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onCreated={reload} />
    </div>
  );
}

function AddProjectDrawer({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Give the project a name.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createProject({ name: trimmed, description: description.trim() });
      setName("");
      setDescription("");
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the project.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="New project"
      edge="right"
      closeTip="Discard this project"
      footer={
        <button
          type="submit"
          form="add-project-form"
          className="btn-primary"
          disabled={saving}
          data-tip="Create the project and open it"
        >
          {saving ? "Creating..." : "Create project"}
        </button>
      }
    >
      <form id="add-project-form" onSubmit={handleCreate} className="stack">
        <div>
          <label htmlFor="new-project-name">Project name</label>
          <div className="inline-form" style={{ marginBottom: 0 }}>
            <input
              id="new-project-name"
              autoFocus
              type="text"
              placeholder="e.g. Album release"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <MicButton onResult={setName} />
          </div>
        </div>
        <div>
          <label htmlFor="new-project-description">
            Description <span className="faint">(optional)</span>
          </label>
          <input
            id="new-project-description"
            type="text"
            placeholder="One line on what this is for"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        {error && <p className="form-error">{error}</p>}
        <p className="form-note">
          The project starts empty. Everything is added from its own workspace tabs.
        </p>
      </form>
    </Drawer>
  );
}
