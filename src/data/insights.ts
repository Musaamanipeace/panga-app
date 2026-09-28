// src/data/insights.ts
// Per-project metrics for the Insights tab. Everything is computed on read.
import { db } from "./db.ts"
import { now } from "./utils.ts"

const DAY = 24 * 60 * 60 * 1000;

export interface ProjectInsights {
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  inactiveTasks: number;
  /** Share of tasks that are completed, as a percentage. */
  completionRate: number;
  /** Tasks completed per day over the trailing week. */
  weeklyCompletion: { day: string; count: number }[];
  openIssues: number;
  closedIssues: number;
  overdueTasks: number;
  milestonesTotal: number;
  milestonesAchieved: number;
  milestoneProgress: number;
  recentActivity: { id: string; text: string; at: number; kind: string }[];
}

export async function getProjectInsights(projectId: string): Promise<ProjectInsights> {
  const [tasks, issues, milestones, docs, resources] = await Promise.all([
    db.tasks.where("projectId").equals(projectId).toArray(),
    db.issues.where("projectId").equals(projectId).toArray(),
    db.milestones.where("projectId").equals(projectId).toArray(),
    db.docEntries.where("projectId").equals(projectId).toArray(),
    db.resources.where("projectId").equals(projectId).toArray(),
  ]);

  const t = now();
  const completedTasks = tasks.filter((x) => x.status === "completed").length;
  const activeTasks = tasks.filter((x) => x.status === "active").length;
  const inactiveTasks = tasks.filter((x) => x.status === "inactive").length;
  const achieved = milestones.filter((m) => m.status === "achieved").length;

  const overdueTasks = tasks.filter((x) => x.status === "active" && (x.dueDate ?? 0) < t).length;

  // Completion rate over a trailing seven-day window, so the chart reacts to
  // recent work rather than all-time history.
  const weeklyCompletion: { day: string; count: number }[] = [];
  for (let back = 6; back >= 0; back--) {
    const dayStart = startOfDay(t - back * DAY);
    const dayEnd = dayStart + DAY;
    weeklyCompletion.push({
      day: new Date(dayStart).toLocaleDateString(undefined, { weekday: "short" }),
      count: tasks.filter(
        (x) => x.status === "completed" && x.updatedAt >= dayStart && x.updatedAt < dayEnd
      ).length,
    });
  }

  const recentActivity: ProjectInsights["recentActivity"] = [
    ...tasks.map((x) => ({
      id: x.id,
      text:
        x.status === "completed"
          ? `Completed task: ${x.title}`
          : `Updated task: ${x.title}`,
      at: x.updatedAt,
      kind: "task",
    })),
    ...issues.map((i) => ({
      id: i.id,
      text: `${i.status === "open" ? "Logged" : "Closed"} issue: ${i.title}`,
      at: i.updatedAt,
      kind: "issue",
    })),
    ...docs.map((d) => ({
      id: d.id,
      text: `Edited documentation: ${d.title}`,
      at: d.updatedAt,
      kind: "doc",
    })),
    ...resources.map((r) => ({
      id: r.id,
      text: `Updated ${r.category}: ${r.title}`,
      at: r.updatedAt,
      kind: "resource",
    })),
  ]
    .sort((a, b) => b.at - a.at)
    .slice(0, 8);

  return {
    totalTasks: tasks.length,
    completedTasks,
    activeTasks,
    inactiveTasks,
    completionRate: tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100),
    weeklyCompletion,
    openIssues: issues.filter((i) => i.status === "open").length,
    closedIssues: issues.filter((i) => i.status === "resolved").length,
    overdueTasks,
    milestonesTotal: milestones.length,
    milestonesAchieved: achieved,
    milestoneProgress:
      milestones.length === 0 ? 0 : Math.round((achieved / milestones.length) * 100),
    recentActivity,
  };
}

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
