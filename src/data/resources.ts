// src/data/resources.ts
import { db, type Resource, type ResourceCategory, type ResourceImage, type ResourceFile, type ResourceProvider, type ResourceListItem } from "./db";
import { newId, now } from "./utils";
import { syncPushRecord, syncDeleteRecord } from "../sync/sync";

export type { Resource, ResourceCategory, ResourceImage, ResourceFile, ResourceProvider, ResourceListItem };

export type BaseResourceFormat = "note" | "checklist" | "url";

export interface ResourceCategoryMeta {
  id: string;
  label: string;
  baseFormat: BaseResourceFormat;
  description: string;
  icon: string;
  isCustom?: boolean;
}

export const PRELOADED_CATEGORIES: ResourceCategoryMeta[] = [
  { id: "documents", label: "Documents", baseFormat: "note", description: "Project documentation, specs & READMEs", icon: "📄" },
  { id: "notes", label: "Notes", baseFormat: "note", description: "Quick thoughts, memos & references", icon: "📝" },
  { id: "links", label: "Links (URLs)", baseFormat: "url", description: "Web bookmarks & URL links", icon: "🔗" },
  { id: "lists", label: "Check-Lists", baseFormat: "checklist", description: "Checklists & structured item lists", icon: "☑️" },
  { id: "tasks", label: "Tasks", baseFormat: "checklist", description: "Task lists & actionable todos", icon: "📋" },
  { id: "milestones", label: "Milestones", baseFormat: "checklist", description: "Phase checkpoints & milestones", icon: "🏁" },
  { id: "issues", label: "Issues", baseFormat: "note", description: "Bugs, setbacks & blocker logs", icon: "⚠️" },
  { id: "insights", label: "Insights", baseFormat: "note", description: "Analysis findings & research takeaways", icon: "💡" },
  { id: "prompts", label: "Prompts", baseFormat: "note", description: "AI prompts & reusable templates", icon: "✨" },
  { id: "scripts", label: "Scripts", baseFormat: "note", description: "Code scripts, SQL & CLI snippets", icon: "💻" },
];

export async function getCustomCategories(): Promise<ResourceCategoryMeta[]> {
  try {
    if (!db.isOpen()) await db.open();
    const row = await db.settings.get("custom_resource_categories");
    if (row && Array.isArray(row.value)) {
      return row.value as ResourceCategoryMeta[];
    }
  } catch {}
  return [];
}

export async function addCustomCategory(cat: { label: string; baseFormat: BaseResourceFormat; description?: string }): Promise<ResourceCategoryMeta> {
  if (!db.isOpen()) await db.open();
  const existing = await getCustomCategories();
  const id = cat.label.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-");
  const newCat: ResourceCategoryMeta = {
    id,
    label: cat.label.trim(),
    baseFormat: cat.baseFormat,
    description: cat.description || `Custom ${cat.baseFormat} resource category`,
    icon: cat.baseFormat === "checklist" ? "☑️" : cat.baseFormat === "url" ? "🔗" : "📁",
    isCustom: true,
  };
  const updated = [...existing.filter((c) => c.id !== id), newCat];
  await db.settings.put({ key: "custom_resource_categories", value: updated });
  return newCat;
}

export async function getAllCategories(): Promise<ResourceCategoryMeta[]> {
  const custom = await getCustomCategories();
  return [...PRELOADED_CATEGORIES, ...custom];
}

export async function listResourcesForProject(projectId: string): Promise<Resource[]> {
  if (!db.isOpen()) await db.open();
  const list = await db.resources.where("projectId").equals(projectId).toArray();
  return list.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function listAllResources(): Promise<Resource[]> {
  if (!db.isOpen()) await db.open();
  const all = await db.resources.toArray();
  return all.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function listAllLinks(): Promise<Resource[]> {
  if (!db.isOpen()) await db.open();
  const all = await db.resources.where("category").equals("links").toArray();
  return all.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function listResourcesByCategory(projectId: string | null, category: ResourceCategory): Promise<Resource[]> {
  if (!db.isOpen()) await db.open();
  if (projectId) {
    return db.resources
      .where("projectId")
      .equals(projectId)
      .and((r) => r.category === category)
      .sortBy("updatedAt");
  }
  return db.resources
    .where("category")
    .equals(category)
    .sortBy("updatedAt");
}

export async function getResource(id: string): Promise<Resource | undefined> {
  if (!db.isOpen()) await db.open();
  return db.resources.get(id);
}

export interface CreateResourceInput {
  projectId?: string | null;
  category: ResourceCategory;
  title: string;
  tags?: string[];
  url?: string | null;
  provider?: ResourceProvider | null;
  body?: string | null;
  listItems?: ResourceListItem[];
  customFields?: Record<string, string>;
  images?: ResourceImage[];
  files?: ResourceFile[];
}

export async function createResource(input: CreateResourceInput): Promise<Resource> {
  if (!db.isOpen()) await db.open();
  const t = now();
  const resource: Resource = {
    id: newId(),
    projectId: input.projectId ?? null,
    category: input.category,
    title: input.title,
    tags: input.tags ?? [],
    url: input.url ?? null,
    provider: input.provider ?? null,
    body: input.body ?? null,
    listItems: input.listItems ?? [],
    customFields: input.customFields ?? {},
    images: input.images ?? [],
    files: input.files ?? [],
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.resources.add(resource);
  void syncPushRecord("resources", resource);
  return resource;
}

export async function updateResource(
  id: string,
  changes: Partial<
    Pick<
      Resource,
      "title" | "tags" | "url" | "provider" | "body" | "listItems" | "customFields" | "images" | "files" | "category" | "projectId"
    >
  >
): Promise<void> {
  if (!db.isOpen()) await db.open();
  const updatedAt = now();
  await db.resources.update(id, { ...changes, updatedAt, syncStatus: "pending" });
  const updated = await db.resources.get(id);
  if (updated) void syncPushRecord("resources", updated);
}

export async function deleteResource(id: string): Promise<void> {
  if (!db.isOpen()) await db.open();
  await db.resources.delete(id);
  void syncDeleteRecord("resources", id);
}

export async function deleteResourcesForProject(projectId: string): Promise<void> {
  if (!db.isOpen()) await db.open();
  const rows = await db.resources.where("projectId").equals(projectId).toArray();
  await db.resources.where("projectId").equals(projectId).delete();
  for (const row of rows) {
    void syncDeleteRecord("resources", row.id);
  }
}

/** Formats resource as plain text */
export function formatResourceAsText(resource: Resource, projectName?: string): string {
  let output = `${resource.title.toUpperCase()}\n`;
  output += `Category: ${resource.category}\n`;
  if (projectName || resource.projectId) {
    output += `Project: ${projectName || resource.projectId || "Global"}\n`;
  }
  if (resource.tags && resource.tags.length > 0) {
    output += `Tags: ${resource.tags.join(", ")}\n`;
  }
  output += `Date: ${new Date(resource.updatedAt).toLocaleString()}\n`;
  output += `----------------------------------------\n\n`;

  if (resource.url) {
    output += `URL: ${resource.url}\n\n`;
  }
  if (resource.body) {
    output += `${resource.body}\n\n`;
  }
  if (resource.listItems && resource.listItems.length > 0) {
    output += `ITEMS / CHECKLIST:\n`;
    for (const item of resource.listItems) {
      output += `${item.checked ? "[x]" : "[ ]"} ${item.text}\n`;
    }
    output += `\n`;
  }
  return output;
}

/** Formats resource as Markdown */
export function formatResourceAsMarkdown(resource: Resource, projectName?: string): string {
  let output = `# ${resource.title}\n\n`;
  output += `> **Category:** \`${resource.category}\`  \n`;
  if (projectName || resource.projectId) {
    output += `> **Project:** ${projectName || resource.projectId || "Global"}  \n`;
  }
  if (resource.tags && resource.tags.length > 0) {
    output += `> **Tags:** ${resource.tags.map((t) => `\`#${t}\``).join(" ")}  \n`;
  }
  output += `> **Last updated:** ${new Date(resource.updatedAt).toLocaleString()}\n\n`;

  if (resource.url) {
    output += `### Link\n[${resource.url}](${resource.url})\n\n`;
  }
  if (resource.body) {
    output += `### Content\n${resource.body}\n\n`;
  }
  if (resource.listItems && resource.listItems.length > 0) {
    output += `### Checklist\n`;
    for (const item of resource.listItems) {
      output += `- [${item.checked ? "x" : " "}] ${item.text}\n`;
    }
    output += `\n`;
  }
  return output;
}

/** Formats resource as clean HTML document */
export function formatResourceAsHtml(resource: Resource, projectName?: string): string {
  const title = resource.title;
  const project = projectName || resource.projectId || "Global";
  const dateStr = new Date(resource.updatedAt).toLocaleString();

  let bodyHtml = "";
  if (resource.url) {
    bodyHtml += `<p><strong>Link:</strong> <a href="${resource.url}" target="_blank" rel="noopener">${resource.url}</a></p>`;
  }
  if (resource.body) {
    const formattedBody = resource.body
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br/>");
    bodyHtml += `<div style="background:#f8fafc;padding:16px;border-radius:6px;line-height:1.6;">${formattedBody}</div>`;
  }
  if (resource.listItems && resource.listItems.length > 0) {
    bodyHtml += `<h3>Checklist</h3><ul style="list-style:none;padding:0;">`;
    for (const item of resource.listItems) {
      bodyHtml += `<li style="padding:6px 0;display:flex;align-items:center;gap:8px;">
        <input type="checkbox" ${item.checked ? "checked" : ""} disabled />
        <span style="${item.checked ? "text-decoration:line-through;color:#64748b;" : ""}">${item.text}</span>
      </li>`;
    }
    bodyHtml += `</ul>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1e293b; }
    h1 { margin-bottom: 8px; }
    .meta { color: #64748b; font-size: 14px; margin-bottom: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; }
    .badge { display: inline-block; background: #e2e8f0; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="meta">
    <span class="badge">${resource.category}</span> &bull; 
    <span>Project: ${project}</span> &bull; 
    <span>${dateStr}</span>
  </div>
  ${bodyHtml}
</body>
</html>`;
}

/** Triggers browser file download */
export function downloadResourceFile(resource: Resource, format: "txt" | "md" | "html", projectName?: string) {
  let content = "";
  let mimeType = "text/plain";
  if (format === "txt") {
    content = formatResourceAsText(resource, projectName);
    mimeType = "text/plain";
  } else if (format === "md") {
    content = formatResourceAsMarkdown(resource, projectName);
    mimeType = "text/markdown";
  } else if (format === "html") {
    content = formatResourceAsHtml(resource, projectName);
    mimeType = "text/html";
  }

  const safeTitle = (resource.title || "resource")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const filename = `${safeTitle || "resource"}.${format}`;

  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
