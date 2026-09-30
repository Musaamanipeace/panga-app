import { useEffect, useState } from "react";
import {
  getRecentActivity,
  getActivityForProject,
  type ActivityLog,
  type ActivityEntityType,
} from "../../data/activity";
import { listAllProjects } from "../../data/projects";
import type { Project } from "../../data/db";
import { Loading, ErrorNote, StatusLabel } from "../../components/ui";
import { useAsync } from "../../components/ui";

type Filter = ActivityEntityType | "all";

const ENTITY_LABELS: Record<ActivityEntityType, string> = {
  project: "Projects",
  task: "Tasks",
  resource: "Resources",
  docEntry: "Documentation",
  milestone: "Milestones",
  issue: "Issues",
  contact: "Contacts",
  reminder: "Reminders",
  insight: "Insights",
  calendarEvent: "Calendar",
};

export default function HomeActivityTab() {
  const { data, error, loading, reload } = useAsync(async () => {
    const [activities, projects] = await Promise.all([
      getRecentActivity(100),
      listAllProjects(),
    ]);
    return { activities, projects };
  }, []);

  const [filter, setFilter] = useState<Filter>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");

  const activities: ActivityLog[] = data?.activities ?? [];
  const projects: Project[] = data?.projects ?? [];

  const projectNameMap = new Map<string, string>(
    projects.map((p) => [p.id, p.name])
  );

  const filtered = activities.filter((a) => {
    if (filter !== "all" && a.entityType !== filter) return false;
    if (projectFilter !== "all" && a.projectId !== projectFilter) return false;
    return true;
  });

  if (error) return <ErrorNote error={error} onRetry={reload} />;
  if (loading) return <Loading label="Loading activity..." />;

  return (
    <div>
      <div className="chip-row" style={{ marginBottom: 12 }}>
        <button
          type="button"
          className={`chip ${filter === "all" ? "chip-active" : ""}`}
          onClick={() => setFilter("all")}
          data-tip="Show all activity"
        >
          All Activity
        </button>
        {(Object.keys(ENTITY_LABELS) as ActivityEntityType[]).map((et) => (
          <button
            key={et}
            type="button"
            className={`chip ${filter === et ? "chip-active" : ""}`}
            onClick={() => setFilter(et)}
            data-tip={`Show only ${ENTITY_LABELS[et].toLowerCase()}`}
            aria-pressed={filter === et}
          >
            {ENTITY_LABELS[et]}
            <span className="tab-btn-count">
              {activities.filter((a) => a.entityType === et).length}
            </span>
          </button>
        ))}
      </div>

      {projectFilter !== "all" && (
        <div className="inline-form" style={{ marginBottom: 12 }}>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            data-tip="Filter activity by project"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn-secondary btn-small clickable"
            onClick={() => setProjectFilter("all")}
            data-tip="Clear project filter"
          >
            ×
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="empty-state">
          No activity yet. Actions you take across projects will appear here.
        </p>
      ) : (
        <ul className="activity-list">
          {filtered.map((a) => (
            <li key={a.id} className="activity-item">
              <span
                className="activity-dot"
                style={{
                  backgroundColor:
                    a.action === "created"
                      ? "#22c55e"
                      : a.action === "updated"
                        ? "#3b82f6"
                        : a.action === "deleted"
                          ? "#ef4444"
                          : "#f59e0b",
                }}
                aria-hidden="true"
              />
              <span className="activity-body">
                <span className="activity-title">{a.description}</span>
                <span className="activity-meta">
                  <StatusLabel status={a.action} />
                  <span className="text-tiny">
                    {a.entityType && (
                      <>
                        <span className="text-tiny-dim">• {ENTITY_LABELS[a.entityType as ActivityEntityType] ?? a.entityType}</span>
                      </>
                    )}
                    {a.projectId && projectNameMap.has(a.projectId) && (
                      <span className="text-tiny-dim">• {projectNameMap.get(a.projectId)}</span>
                    )}
                    <span className="text-tiny-dim">{new Date(a.timestamp).toLocaleString()}</span>
                </span>
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
