// src/data/dashboard.ts
// Computed aggregates for the home screen — alerts, summary stats, progress.
import { db } from "../data/db";
import { listAllActiveTasks } from "./tasks";
import { listProjects } from "./projects";

export interface Alert {
  id: string;
  type: "overdue_task" | "due_reminder" | "overdue_reminder" | "missed_milestone";
  title: string;
  subtitle: string;
  projectId: string | null;
  routerLink?: string; // deep-link target
}

export async function getDashboardAlerts(limit = 10): Promise<Alert[]> {
  const now = Date.now();
  const alerts: Alert[] = [];

  // Overdue tasks (active but past dueDate)
  const activeTasks = await listAllActiveTasks();
  for (const t of activeTasks) {
    if (t.dueDate && t.dueDate < now) {
      alerts.push({
        id: `task-${t.id}`,
        type: "overdue_task",
        title: t.title,
        subtitle: `Overdue task in ${await projectName(t.projectId)}`,
        projectId: t.projectId,
        routerLink: `/project/${t.projectId}?tab=Tasks`,
      });
    }
  }

  // Due or overdue reminders
  const allReminders = await db.reminders.where("status").equals("pending").toArray();
  for (const r of allReminders) {
    if (r.triggerAt <= now) {
      const label = r.triggerAt < now - 60_000 ? "overdue" : "due";
      alerts.push({
        id: `reminder-${r.id}`,
        type: label === "overdue" ? "overdue_reminder" : "due_reminder",
        title: r.message,
        subtitle: `${label === "overdue" ? "Overdue" : "Due"} reminder`,
        projectId: r.projectId,
        routerLink: r.projectId
          ? `/project/${r.projectId}?tab=Reminders`
          : `/dashboard`,
      });
    }
  }

  // Missed milestones
  const allMilestones = await db.milestones.where("status").equals("missed").toArray();
  for (const m of allMilestones) {
    alerts.push({
      id: `milestone-${m.id}`,
      type: "missed_milestone",
      title: m.title,
      subtitle: `Missed milestone in ${await projectName(m.projectId)}`,
      projectId: m.projectId,
      routerLink: `/project/${m.projectId}?tab=Milestones`,
    });
  }

  // Sort by urgency: overdue reminders/tasks first, then missed milestones
  const priority = {
    overdue_task: 0,
    overdue_reminder: 1,
    due_reminder: 2,
    missed_milestone: 3,
  };
  alerts.sort((a, b) => priority[a.type] - priority[b.type]);
  return alerts.slice(0, limit);
}

export interface DashboardSummary {
  activeTaskCount: number;
  remainingTaskCount: number;
  milestoneProgressPercent: number;
  milestoneTotal: number;
  milestoneAchieved: number;
  projectCount: number;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [projects, tasks, milestones] = await Promise.all([listProjects("active"), listAllActiveTasks(), db.milestones.toArray()]);

  const active = tasks.filter((t) => t.status === "active");
  const completed = tasks.filter((t) => t.status === "completed");
  const remaining = active.length + completed.length;

  const achieved = milestones.filter((m) => m.status === "achieved").length;
  const total = milestones.length;
  const milestoneProgressPercent = total === 0 ? 0 : Math.round((achieved / total) * 100);

  return {
    activeTaskCount: active.length,
    remainingTaskCount: remaining,
    milestoneProgressPercent,
    milestoneTotal: total,
    milestoneAchieved: achieved,
    projectCount: projects.length,
  };
}

async function projectName(id: string): Promise<string> {
  return (await db.projects.get(id))?.name ?? "";
}
