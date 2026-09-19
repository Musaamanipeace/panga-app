import { db } from "./db";

export type SearchableEntityType =
  | "project"
  | "task"
  | "resource"
  | "doc"
  | "goal"
  | "issue"
  | "contact"
  | "reminder";

export type SearchableEntity = {
  id: string;
  type: SearchableEntityType;
  title: string;
  text: string;
  tags: string[];
  projectId: string | null;
  path: string;
  category?: string;
};

export async function getSearchableEntities(): Promise<SearchableEntity[]> {
  const [projects, tasks, resources, docs, goals, issues, contacts, reminders] =
    await Promise.all([
      db.projects.toArray(),
      db.tasks.toArray(),
      db.resources.toArray(),
      db.docEntries.toArray(),
      db.goals.toArray(),
      db.issues.toArray(),
      db.contacts.toArray(),
      db.reminders.toArray(),
    ]);

  return [
    ...projects.map((project) => ({
      id: project.id,
      type: "project" as const,
      title: project.name,
      text: `${project.name} ${project.description}`,
      tags: [],
      projectId: null,
      path: `/project/${project.id}`,
    })),
    ...tasks.map((task) => ({
      id: task.id,
      type: "task" as const,
      title: task.title,
      text: `${task.title} ${task.notes}`,
      tags: task.tags,
      projectId: task.projectId,
      path: `/project/${task.projectId}`,
    })),
    ...resources.map((resource) => ({
      id: resource.id,
      type: "resource" as const,
      title: resource.title,
      text: `${resource.title} ${resource.value} ${resource.notes}`,
      tags: resource.tags,
      projectId: resource.projectId,
      path: `/project/${resource.projectId}`,
      category: resource.category,
    })),
    ...docs.map((entry) => ({
      id: entry.id,
      type: "doc" as const,
      title: entry.title,
      text: `${entry.title} ${entry.content}`,
      tags: [],
      projectId: entry.projectId,
      path: `/project/${entry.projectId}`,
    })),
    ...goals.map((goal) => ({
      id: goal.id,
      type: "goal" as const,
      title: goal.title,
      text: goal.title,
      tags: [],
      projectId: goal.projectId,
      path: `/project/${goal.projectId}`,
    })),
    ...issues.map((issue) => ({
      id: issue.id,
      type: "issue" as const,
      title: issue.title,
      text: `${issue.title} ${issue.description}`,
      tags: [],
      projectId: issue.projectId,
      path: `/project/${issue.projectId}`,
    })),
    ...contacts.map((contact) => ({
      id: contact.id,
      type: "contact" as const,
      title: contact.name,
      text: [contact.name, contact.email, contact.phone, contact.discord]
        .filter(Boolean)
        .join(" "),
      tags: [],
      projectId: null,
      path: "/contacts",
    })),
    ...reminders.map((reminder) => ({
      id: reminder.id,
      type: "reminder" as const,
      title: reminder.message,
      text: reminder.message,
      tags: [],
      projectId: reminder.projectId,
      path: reminder.projectId ? `/project/${reminder.projectId}` : "/reminders",
    })),
  ];
}
