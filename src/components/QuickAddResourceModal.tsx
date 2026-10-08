import React, { useState, useEffect, useRef } from "react";
import { db } from "../data/db";
import { listAllProjects } from "../data/projects";
import { createResource } from "../data/resources";
import { createTask } from "../data/tasks";
import { createDocEntry } from "../data/docs";
import { createMilestone } from "../data/milestones";
import { createIssue, type IssueSeverity } from "../data/issues";
import { createLocalEvent } from "../data/calendar";
import { showToast } from "./ui";
import MicButton from "./MicButton";
import { newId } from "../data/utils";

export type SavableResourceType =
  | "note"
  | "link"
  | "list"
  | "task"
  | "milestone"
  | "issue"
  | "event"
  | "custom";

interface Props {
  open: boolean;
  onClose: () => void;
  defaultProjectId?: string | null;
  onSaved?: () => void;
}

const DRAFT_KEY = "panga_quick_add_draft_v1";

export default function QuickAddResourceModal({
  open,
  onClose,
  defaultProjectId = null,
  onSaved,
}: Props) {
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [resourceType, setResourceType] = useState<SavableResourceType>("note");
  const [projectId, setProjectId] = useState<string>(defaultProjectId || "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [customTabName, setCustomTabName] = useState("");
  const [dateVal, setDateVal] = useState("");
  const [severity, setSeverity] = useState<IssueSeverity>("medium");
  const [listItems, setListItems] = useState<{ id: string; text: string; checked: boolean }[]>([
    { id: newId(), text: "", checked: false },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Load projects
  useEffect(() => {
    if (open) {
      listAllProjects().then((pList) => {
        setProjects(pList.filter((p) => p.status === "active"));
      });
      if (defaultProjectId !== undefined) {
        setProjectId(defaultProjectId || "");
      }
    }
  }, [open, defaultProjectId]);

  // Restore draft on open
  useEffect(() => {
    if (open) {
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (raw) {
          const draft = JSON.parse(raw);
          if (draft.title && !title) setTitle(draft.title);
          if (draft.body && !body) setBody(draft.body);
          if (draft.url && !url) setUrl(draft.url);
          if (draft.resourceType) setResourceType(draft.resourceType);
          if (draft.projectId !== undefined && !projectId) setProjectId(draft.projectId);
        }
      } catch {}
    }
  }, [open]);

  // Autosave draft as user types
  useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => {
      try {
        if (title.trim() || body.trim() || url.trim()) {
          localStorage.setItem(
            DRAFT_KEY,
            JSON.stringify({
              resourceType,
              projectId,
              title,
              body,
              url,
              customTabName,
            })
          );
        }
      } catch {}
    }, 400);
    return () => clearTimeout(timeout);
  }, [open, resourceType, projectId, title, body, url, customTabName]);

  function clearDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
    setTitle("");
    setBody("");
    setUrl("");
    setCustomTabName("");
    setDateVal("");
    setListItems([{ id: newId(), text: "", checked: false }]);
  }

  function handleAddListItem() {
    setListItems((prev) => [...prev, { id: newId(), text: "", checked: false }]);
  }

  function handleUpdateListItem(id: string, text: string) {
    setListItems((prev) => prev.map((item) => (item.id === id ? { ...item, text } : item)));
  }

  function handleRemoveListItem(id: string) {
    setListItems((prev) => prev.filter((item) => item.id !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      showToast("Please enter a title or name for the resource", "error");
      return;
    }

    setSubmitting(true);
    const targetProject = projectId ? projectId : null;

    try {
      switch (resourceType) {
        case "note": {
          if (targetProject) {
            // Pegged to project doc / note
            await createDocEntry({
              projectId: targetProject,
              title: cleanTitle,
              content: body.trim(),
              type: "outline",
            });
          }
          // Also save as unified resource so it appears in Resources list
          await createResource({
            projectId: targetProject,
            category: "notes",
            title: cleanTitle,
            body: body.trim() || null,
          });
          break;
        }

        case "link": {
          await createResource({
            projectId: targetProject,
            category: "links",
            title: cleanTitle,
            url: url.trim() || null,
            body: body.trim() || null,
          });
          break;
        }

        case "list": {
          const validItems = listItems
            .filter((i) => i.text.trim().length > 0)
            .map((i) => ({
              id: i.id,
              text: i.text.trim(),
              checked: i.checked,
              tags: [],
            }));

          await createResource({
            projectId: targetProject,
            category: "preset-list",
            title: cleanTitle,
            body: body.trim() || null,
            listItems: validItems,
          });
          break;
        }

        case "task": {
          const parsedDue = dateVal ? new Date(dateVal).getTime() : null;
          await createTask({
            projectId: targetProject,
            title: cleanTitle,
            notes: body.trim(),
            dueDate: parsedDue,
          });
          break;
        }

        case "milestone": {
          const parsedTarget = dateVal ? new Date(dateVal).getTime() : null;
          await createMilestone({
            projectId: targetProject || "",
            title: cleanTitle,
            description: body.trim(),
            targetDate: parsedTarget,
          });
          break;
        }

        case "issue": {
          await createIssue({
            projectId: targetProject || "",
            title: cleanTitle,
            description: body.trim(),
            severity,
          });
          break;
        }

        case "event": {
          const eventTime = dateVal ? new Date(dateVal).getTime() : Date.now();
          await createLocalEvent({
            projectId: targetProject,
            title: cleanTitle,
            description: body.trim(),
            startAt: eventTime,
            endAt: eventTime + 3600_000,
          });
          break;
        }

        case "custom": {
          const cat = customTabName.trim() || "custom";
          await createResource({
            projectId: targetProject,
            category: cat,
            title: cleanTitle,
            body: body.trim() || null,
          });
          break;
        }
      }

      const projectLabel = targetProject
        ? projects.find((p) => p.id === targetProject)?.name ?? "Project"
        : "General / Global";

      showToast(`Saved ${resourceType} (${projectLabel})`, "success");
      clearDraft();
      window.dispatchEvent(new CustomEvent("panga-data-updated"));
      if (onSaved) onSaved();
      onClose();
    } catch (err: any) {
      console.error("Quick add failed:", err);
      showToast(`Failed to save: ${err?.message || "Unknown error"}`, "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="drawer-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="drawer-panel drawer-panel-right"
        style={{ width: "min(560px, 100vw)", display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="drawer-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.25rem" }}>⚡ Quick Add Resource</h2>
            <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
              Save any note, link, list, task, event or issue and peg it to a project
            </p>
          </div>
          <button type="button" className="btn-icon clickable" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {/* Resource Type Selector */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 8 }}>
              Resource Type
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 6 }}>
              {[
                { id: "note", label: "📝 Note", desc: "Markdown / text" },
                { id: "link", label: "🔗 Link", desc: "Web URL bookmark" },
                { id: "list", label: "☑️ List", desc: "Checklist items" },
                { id: "task", label: "📋 Task", desc: "Actionable todo" },
                { id: "event", label: "📅 Event", desc: "Calendar item" },
                { id: "milestone", label: "🎯 Milestone", desc: "Project goal" },
                { id: "issue", label: "⚠️ Issue", desc: "Bug or blocker" },
                { id: "custom", label: "✨ Custom", desc: "Custom tab" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`btn-secondary clickable ${resourceType === t.id ? "toggle-pressed" : ""}`}
                  onClick={() => setResourceType(t.id as SavableResourceType)}
                  style={{
                    padding: "8px 6px",
                    textAlign: "center",
                    border: resourceType === t.id ? "2px solid var(--color-accent-primary, #3b82f6)" : "1px solid var(--color-border)",
                    background: resourceType === t.id ? "rgba(59, 130, 246, 0.1)" : "var(--color-bg-surface)",
                    borderRadius: "6px",
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>{t.label}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Peg to Project Dropdown */}
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="quick-add-project" style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 6 }}>
              Peg to Project
            </label>
            <select
              id="quick-add-project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid var(--color-border)",
                background: "var(--color-bg-surface)",
                fontSize: "0.9rem",
              }}
            >
              <option value="">🌐 General / Global (Not tied to any project)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  📁 {p.name}
                </option>
              ))}
            </select>
            <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
              {projectId
                ? "This item will be saved directly into the selected project workspace."
                : "This item will be saved as a global standalone resource accessible from Home."}
            </p>
          </div>

          {/* Custom Tab Name if Custom Resource */}
          {resourceType === "custom" && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 6 }}>
                Custom Tab / Category Name
              </label>
              <input
                type="text"
                placeholder="e.g. Design Specs, Prompts, Client Feedback"
                value={customTabName}
                onChange={(e) => setCustomTabName(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--color-border)" }}
                required
              />
            </div>
          )}

          {/* Title Input with Voice Support */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 6 }}>
              Title / Name
            </label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                ref={titleInputRef}
                type="text"
                placeholder={
                  resourceType === "link"
                    ? "Link name or title..."
                    : resourceType === "task"
                    ? "What needs to be done?"
                    : "Resource title..."
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{ flex: 1, padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--color-border)" }}
              />
              <MicButton
                targetRef={titleInputRef}
                onResult={(text) => {
                  setTitle((prev) => (prev ? prev + " " + text : text));
                }}
              />
            </div>
          </div>

          {/* URL Input if Link */}
          {resourceType === "link" && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 6 }}>
                URL Link
              </label>
              <input
                type="url"
                placeholder="https://example.com/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--color-border)" }}
              />
            </div>
          )}

          {/* Date Picker for task / event / milestone */}
          {(resourceType === "task" || resourceType === "event" || resourceType === "milestone") && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 6 }}>
                {resourceType === "event" ? "Event Date & Time" : resourceType === "task" ? "Due Date" : "Target Date"}
              </label>
              <input
                type={resourceType === "event" ? "datetime-local" : "date"}
                value={dateVal}
                onChange={(e) => setDateVal(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--color-border)" }}
              />
            </div>
          )}

          {/* Severity for Issue */}
          {resourceType === "issue" && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 6 }}>
                Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as IssueSeverity)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--color-border)" }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          )}

          {/* Structured Items for List */}
          {resourceType === "list" && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Checklist Items</label>
                <button type="button" className="btn-secondary btn-small clickable" onClick={handleAddListItem}>
                  + Add Item
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflowY: "auto" }}>
                {listItems.map((item, index) => (
                  <div key={item.id} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", width: 18 }}>
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      placeholder={`Item ${index + 1}...`}
                      value={item.text}
                      onChange={(e) => handleUpdateListItem(item.id, e.target.value)}
                      style={{ flex: 1, padding: "6px 10px", borderRadius: "4px", border: "1px solid var(--color-border)" }}
                    />
                    {listItems.length > 1 && (
                      <button
                        type="button"
                        className="btn-icon clickable"
                        onClick={() => handleRemoveListItem(item.id)}
                        style={{ color: "#ef4444" }}
                        title="Remove"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Body / Description / Notes Textarea */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                {resourceType === "note"
                  ? "Note Body / Details"
                  : resourceType === "link"
                  ? "Notes / Description"
                  : resourceType === "list"
                  ? "List Notes"
                  : "Description"}
              </label>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Autosaved as draft</span>
            </div>
            <textarea
              ref={bodyTextareaRef}
              rows={4}
              placeholder="Write content, notes, instructions, reference..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--color-border)", resize: "vertical" }}
            />
            <div style={{ marginTop: 4, display: "flex", justifyContent: "flex-end" }}>
              <MicButton
                targetRef={bodyTextareaRef}
                onResult={(text) => {
                  setBody((prev) => (prev ? prev + " " + text : text));
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <button
              type="button"
              className="btn-secondary clickable"
              onClick={() => {
                clearDraft();
                onClose();
              }}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary clickable"
              disabled={submitting || !title.trim()}
              style={{ padding: "8px 20px" }}
            >
              {submitting ? "Saving…" : "Save Resource"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
