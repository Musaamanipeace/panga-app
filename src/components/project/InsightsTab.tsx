import { useAsync } from "../../components/ui.tsx"
import { getProjectInsights } from "../../data/insights.tsx"
import { ErrorNote, Loading, StatusLabel } from "../../components/ui.tsx"

export default function InsightsTab({ projectId }: { projectId: string }) {
  const insights = useAsync(() => getProjectInsights(projectId), [projectId]);
  if (insights.error) return <ErrorNote error={insights.error} onRetry={insights.reload} />;
  if (insights.loading) return <Loading label="Loading insights..." />;

  const d = insights.data!;
  return (
    <div>
      <div className="stat-grid">
        <StatCard label="Tasks" num={d.totalTasks} />
        <StatCard label="Done" num={d.completedTasks} hint={`${d.completionRate}%`} />
        <StatCard label="Active" num={d.activeTasks} />
        <StatCard label="Inactive" num={d.inactiveTasks} />
        <StatCard label="Open issues" num={d.openIssues} />
        <StatCard label="Closed issues" num={d.closedIssues} />
        <StatCard label="Overdue" num={d.overdueTasks} />
        <StatCard
          label="Milestones"
          num={`${d.milestoneProgress}%`}
          hint={`${d.milestonesAchieved} of ${d.milestonesTotal}`}
        />
      </div>

      <section className="dashboard-section">
        <h2 className="section-heading">Weekly completion</h2>
        <div className="bar-chart">
          {d.weeklyCompletion.map((day) => (
            <div key={day.day} className="bar-chart-col">
              <div
                className="bar-chart-bar"
                style={{
                  height: `${d.weeklyCompletion.length === 0
                    ? 0
                    : Math.max(
                        2,
                        (day.count / Math.max(...d.weeklyCompletion.map((x) => x.count), 1)) *
                          100
                      )}%`,
                }}
                data-tip={`${day.count} task(s) completed on ${day.day}`}
              />
              <span className="bar-chart-label">{day.day}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="section-heading">Issue resolution</h2>
        <div className="split-bar">
          {d.openIssues + d.closedIssues > 0 ? (
            <>
              <div
                className="split-bar-open"
                style={{
                  width: `${(d.openIssues / (d.openIssues + d.closedIssues)) * 100}%`,
                }}
                data-tip={`${d.openIssues} open`}
              />
              <div
                className="split-bar-closed"
                style={{
                  width: `${(d.closedIssues / (d.openIssues + d.closedIssues)) * 100}%`,
                }}
                data-tip={`${d.closedIssues} closed`}
              />
            </>
          ) : (
            <div className="split-bar-closed" style={{ width: "100%" }} data-tip="No issues" />
          )}
        </div>
        <div className="row" style={{ marginTop: 6 }}>
          <StatusLabel status={`Open: ${d.openIssues}`} className="chip-overdue" />
          <StatusLabel status={`Closed: ${d.closedIssues}`} className="chip-good" />
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="section-heading">Recent activity</h2>
        {d.recentActivity.length === 0 ? (
          <p className="empty-state">No activity yet.</p>
        ) : (
          <div className="activity-list">
            {d.recentActivity.map((a) => (
              <div key={a.id} className="activity-item">
                <span className="activity-title">{a.text}</span>
                <span className="activity-time">{new Date(a.at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, num, hint }: { label: string; num: string | number; hint?: string }) {
  return (
    <div className="stat-card">
      <div className="stat-num">{num}</div>
      <div className="stat-label">{label}</div>
      {hint && <div className="text-tiny faint">{hint}</div>}
    </div>
  );
}