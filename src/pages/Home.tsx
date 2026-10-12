import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  listProjects,
  createProject,
  getProjectTaskStats,
  listWorkspacesByKind,
  type WorkspaceKind,
} from "../data/projects";
import {
  getDashboardAlerts,
  getDashboardSummary,
  summaryCards,
  type Alert,
  type DashboardSummary,
} from "../data/dashboard";
import type { Project } from "../data/db";
import ProjectCard from "../components/ProjectCard";
import QuickAddResourceModal from "../components/QuickAddResourceModal";
import { Drawer, ErrorNote, Loading, useAsync } from "../components/ui";
import HomeTasksTab from "../components/home/HomeTasksTab";
import HomeResourcesTab from "../components/home/HomeResourcesTab";
import HomeLinksTab from "../components/home/HomeLinksTab";
import HomeContactsTab from "../components/home/HomeContactsTab";
import HomeCalendarTab from "../components/home/HomeCalendarTab";
import HomeScheduleTab from "../components/home/HomeScheduleTab";
import HomeRemindersTab from "../components/home/HomeRemindersTab";
import HomeActivityTab from "../components/home/HomeActivityTab";

const SECTIONS = [
  "Overview",
  "Projects",
  "Activities",
  "Schedule",
  "Ideas",
  "Reminders",
  "Resources",
  "Alerts",
] as const;
type Section = (typeof SECTIONS)[number];

const SECTION_HINTS: Record<Section, string> = {
  Overview: "Expandable cards for everything on one scrollable page",
  Projects: "Business, research, charity, science, social, personal workspaces",
  Activities: "Events, chores, errands, vacations, learning, hobbies",
  Schedule: "Daily timetable — tasks and calendar blocks",
  Ideas: "New ideas not yet evolved into a project or activity",
  Reminders: "Time-based reminders",
  Resources: "Notes, docs, checklists, links, contacts — global or project-bound",
  Alerts: "Deadlines, overdue items, AI insights",
};

type ExpandedMap = Record<string, boolean>;

function loadExpanded(): ExpandedMap {
  try {
    const raw = localStorage.getItem("panga_home_expanded");
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    Alerts: true,
    Projects: true,
    Activities: false,
    Schedule: false,
    Ideas: false,
    Reminders: false,
    Resources: false,
  };
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sectionParam = searchParams.get("section") as Section | null;
  const activeSection: Section = SECTIONS.includes(sectionParam as Section)
    ? (sectionParam as Section)
    : "Overview";

  const [expanded, setExpanded] = useState<ExpandedMap>(loadExpanded);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerKind, setDrawerKind] = useState<WorkspaceKind>("project");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  function setSection(s: Section) {
    setSearchParams(s === "Overview" ? {} : { section: s }, { replace: true });
  }

  function toggleExpand(key: string) {
    setExpanded((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem("panga_home_expanded", JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  const { data, error, loading, reload } = useAsync(async () => {
    const [allProjects, alerts, summary, projects, activities, ideas] = await Promise.all([
      listProjects("active"),
      getDashboardAlerts(),
      getDashboardSummary(),
      listWorkspacesByKind("project"),
      listWorkspacesByKind("activity"),
      listWorkspacesByKind("idea"),
    ]);
    const statsEntries = await Promise.all(
      allProjects.map(async (p) => [p.id, await getProjectTaskStats(p.id)] as const)
    );
    return {
      allProjects,
      alerts,
      summary,
      projects,
      activities,
      ideas,
      statsMap: Object.fromEntries(statsEntries),
    };
  }, []);

  useEffect(() => {
    const handleUpdate = () => reload();
    window.addEventListener("panga-data-updated", handleUpdate);
    return () => window.removeEventListener("panga-data-updated", handleUpdate);
  }, [reload]);

  const alerts: Alert[] = data?.alerts ?? [];
  const summary: DashboardSummary | null = data?.summary ?? null;
  const projects: Project[] = data?.projects ?? [];
  const activities: Project[] = data?.activities ?? [];
  const ideas: Project[] = data?.ideas ?? [];
  const statsMap = data?.statsMap ?? {};
  const cards = useMemo(() => (summary ? summaryCards(summary) : []), [summary]);

  async function handleCreateWorkspace(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    await createProject({
      name: newName.trim(),
      description: newDesc.trim(),
      kind: drawerKind,
    });
    setNewName("");
    setNewDesc("");
    setDrawerOpen(false);
    reload();
  }

  function openCreate(kind: WorkspaceKind) {
    setDrawerKind(kind);
    setDrawerOpen(true);
  }

  function WorkspaceGrid({
    list,
    emptyLabel,
  }: {
    list: Project[];
    emptyLabel: string;
  }) {
    if (list.length === 0) {
      return <p className="empty-state">{emptyLabel}</p>;
    }
    return (
      <div className="project-grid">
        {list.map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            progress={statsMap[p.id]?.percent ?? 0}
            pending={statsMap[p.id]?.pending ?? 0}
            onChange={reload}
          />
        ))}
      </div>
    );
  }

  function ExpandableSection({
    id,
    title,
    count,
    actions,
    children,
    defaultOpen,
  }: {
    id: string;
    title: string;
    count?: number;
    actions?: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
  }) {
    const isOpen = expanded[id] ?? defaultOpen ?? false;
    return (
      <section className={`home-section ${isOpen ? "home-section-open" : ""}`}>
        <header className="home-section-header">
          <button
            type="button"
            className="home-section-toggle"
            onClick={() => toggleExpand(id)}
            aria-expanded={isOpen}
          >
            <span className="home-section-chevron">{isOpen ? "▼" : "▶"}</span>
            <h2>
              {title}
              {typeof count === "number" && (
                <span className="home-section-count">{count}</span>
              )}
            </h2>
          </button>
          {actions && <div className="home-section-actions">{actions}</div>}
        </header>
        {isOpen && <div className="home-section-body slide-enter">{children}</div>}
      </section>
    );
  }

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
        <Loading label="Loading home…" />
      </div>
    );
  }

  const overview = activeSection === "Overview";

  return (
    <div className="page page-wide home">
      <header className="page-header home-page-header">
        <div>
          <h1>Home</h1>
          <p className="home-subtitle">
            Workspaces, schedule, resources &amp; focus tools for a distractive workplace.
          </p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn-primary clickable"
            onClick={() => setQuickAddOpen(true)}
            data-tip="Quickly save a note, link, list, or resource"
            data-tip-pos="bottom"
          >
            ⚡ Quick add
          </button>
          <button
            type="button"
            className="btn-secondary btn-small clickable"
            onClick={() => openCreate("project")}
            data-tip="Create a new project workspace"
            data-tip-pos="bottom"
          >
            + Project
          </button>
          <button
            type="button"
            className="btn-secondary btn-small clickable"
            onClick={() => openCreate("activity")}
            data-tip="Start a focused activity session"
            data-tip-pos="bottom"
          >
            + Activity
          </button>
          <button
            type="button"
            className="btn-secondary btn-small clickable"
            onClick={() => openCreate("idea")}
            data-tip="Capture a quick spark or idea"
            data-tip-pos="bottom"
          >
            + Idea
          </button>
        </div>
      </header>

      {/* Section nav */}
      <nav className="home-section-nav" aria-label="Home sections">
        {SECTIONS.map((s) => (
          <button
            key={s}
            type="button"
            className={`chip ${activeSection === s ? "chip-active" : ""}`}
            onClick={() => setSection(s)}
            data-tip={SECTION_HINTS[s]}
          >
            {s}
          </button>
        ))}
      </nav>

      {(overview || activeSection === "Alerts") && alerts.length > 0 && (
        <ExpandableSection id="Alerts" title="Alerts" count={alerts.length} defaultOpen>
          <ul className="alert-list">
            {alerts.map((a) => (
              <li key={a.id} className={`alert-item alert-${a.type}`}>
                <span className="alert-dot" aria-hidden="true" />
                <span className="alert-text">
                  <span className="alert-title">{a.title}</span>
                  <span className="alert-subtitle">{a.subtitle}</span>
                </span>
                {a.routerLink && (
                  <Link to={a.routerLink} className="alert-link">
                    Open
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </ExpandableSection>
      )}

      {overview && summary && (
        <section className="dashboard-section home-summary">
          <div className="summary-row">
            {cards.map(
              (card: {
                key: string;
                label: string;
                value: string | number;
                hint?: string;
                tab?: string;
              }) => (
                <div key={card.key} className="summary-card" data-tip={card.hint}>
                  <span className="summary-card-num">{card.value}</span>
                  <span className="summary-card-label">{card.label}</span>
                </div>
              )
            )}
          </div>
        </section>
      )}

      {(overview || activeSection === "Projects") && (
        <ExpandableSection
          id="Projects"
          title="Projects"
          count={projects.length}
          defaultOpen
          actions={
            <button
              type="button"
              className="btn-secondary btn-small clickable"
              onClick={() => openCreate("project")}
            >
              + Add
            </button>
          }
        >
          <p className="section-hint">
            Business, research, charity, science, social, personal — each expands into contacts,
            lists, links, documents, notes, locations, scripts, prompts, insights, milestones.
          </p>
          <WorkspaceGrid list={projects} emptyLabel="No projects yet — create one above." />
        </ExpandableSection>
      )}

      {(overview || activeSection === "Activities") && (
        <ExpandableSection
          id="Activities"
          title="Activities"
          count={activities.length}
          actions={
            <button type="button" className="btn-secondary btn-small" onClick={() => openCreate("activity")}>
              + Add
            </button>
          }
        >
          <p className="section-hint">
            Events, chores, errands, vacations, learning programs, hobbies.
          </p>
          <WorkspaceGrid list={activities} emptyLabel="No activities yet." />
          {!overview && (
            <div className="tab-panel" style={{ marginTop: 16 }}>
              <HomeActivityTab />
            </div>
          )}
        </ExpandableSection>
      )}

      {(overview || activeSection === "Schedule") && (
        <ExpandableSection id="Schedule" title="Daily schedule">
          <p className="section-hint">Timetable of scheduled tasks and calendar blocks.</p>
          <HomeScheduleTab />
          {!overview && (
            <div style={{ marginTop: 16 }}>
              <HomeCalendarTab />
            </div>
          )}
        </ExpandableSection>
      )}

      {(overview || activeSection === "Ideas") && (
        <ExpandableSection
          id="Ideas"
          title="New ideas"
          count={ideas.length}
          actions={
            <button type="button" className="btn-secondary btn-small" onClick={() => openCreate("idea")}>
              + Idea
            </button>
          }
        >
          <p className="section-hint">
            Capture ideas before they become projects or activities. Promote later by editing kind
            in the workspace.
          </p>
          <WorkspaceGrid list={ideas} emptyLabel="No ideas yet — jot one down." />
        </ExpandableSection>
      )}

      {(overview || activeSection === "Reminders") && (
        <ExpandableSection id="Reminders" title="Reminders">
          <HomeRemindersTab />
        </ExpandableSection>
      )}

      {(overview || activeSection === "Resources") && (
        <ExpandableSection id="Resources" title="Resources" defaultOpen={activeSection === "Resources"}>
          <p className="section-hint">
            Notes, documents, checklists, URLs, map pins, contacts. Resources can be global or
            bound to a project; sub-resources supported. Copy, edit, and delete on each item.
          </p>
          <div className="resources-subtabs">
            <HomeResourcesTab />
          </div>
          {!overview && (
            <>
              <h3 className="section-heading" style={{ marginTop: 20 }}>
                Links
              </h3>
              <HomeLinksTab />
              <h3 className="section-heading" style={{ marginTop: 20 }}>
                Contacts
              </h3>
              <HomeContactsTab />
            </>
          )}
        </ExpandableSection>
      )}

      {/* Focused non-overview: tasks shortcut */}
      {!overview && activeSection === "Projects" && (
        <section className="dashboard-section">
          <h2 className="section-heading">All tasks</h2>
          <HomeTasksTab />
        </section>
      )}

      <p className="home-ai-hint">
        Use the <strong>AI assistant</strong> (bottom-right) for command chat: create tasks,
        projects, reminders, insights, text rewrites (grammar, tone, translation). Approve or
        reject each proposed action.
      </p>

      <QuickAddResourceModal open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={`New ${drawerKind}`}>
        <form onSubmit={handleCreateWorkspace} className="drawer-form">
          <label>
            Name
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              autoFocus
              placeholder={
                drawerKind === "idea"
                  ? "Idea title"
                  : drawerKind === "activity"
                    ? "Activity name"
                    : "Project name"
              }
            />
          </label>
          <label>
            Description
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={3}
              placeholder="Optional details"
            />
          </label>
          <button type="submit" className="btn-primary">
            Create {drawerKind}
          </button>
        </form>
      </Drawer>
    </div>
  );
}
