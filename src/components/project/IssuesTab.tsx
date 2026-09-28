import { useState } from "react";
import {
  listIssues,
  createIssue,
  updateIssue,
  setIssueStatus,
  addIssueComment,
  deleteIssueComment,
  deleteIssue,
  toggleIssueLabel,
  SEVERITY_LABELS,
} from "../../data/issues.ts";
import { listMilestones } from "../../data/milestones.ts"
import type { Issue, IssueSeverity } from "../../data/db.ts"
import MicButton from "../../components/MicButton.tsx"
import { Editable, ErrorNote, Loading, SeverityMark, StatusLabel, useAsync } from "../../components/ui.tsx"

export default function IssuesTab({ projectId }: { projectId: string }) {
  const issues = useAsync(() => listIssues(projectId), [projectId]);
  const milestones = useAsync(() => listMilestones(projectId), [projectId]);
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("open");

  async function refresh() {
    await issues.reload();
  }

  if (issues.error) return <ErrorNote error={issues.error} onRetry={issues.reload} />;

  const all = issues.data ?? [];
  const shown = filter === "all" ? all : all.filter((i) => i.status === filter);

  return (
    <div>
      <AddIssueForm
        projectId={projectId}
        milestones={(milestones.data ?? []).map((m) => ({ id: m.id, title: m.title }))}
        onCreated={refresh}
      />

      <div className="chip-row">
        {(["open", "resolved", "all"] as const).map((f) => (
          <button
            key={f}
            type="button"
            className={`chip ${filter === f ? "chip-active" : ""}`}
            onClick={() => setFilter(f)}
            data-tip={
              f === "all"
                ? "Every issue, open and closed"
                : `Issues that are ${f}${f === "open" ? ". High severity ones also raise an alert on Home." : ""}`
            }
            aria-pressed={filter === f}
          >
            {f === "all" ? "All" : f === "resolved" ? "Resolved" : "Open"}
            <span className="tab-btn-count">
              {f === "all" ? all.length : all.filter((i) => i.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {issues.loading ? (
        <Loading label="Loading issues..." />
      ) : shown.length === 0 ? (
        <p className="empty-state">
          {filter === "open"
            ? "No open issues."
            : "Nothing here. Log a setback above with a title, a description, labels, a severity and an optional milestone."}
        </p>
      ) : (
        <ul className="item-list">
          {shown.map((issue) => (
            <IssueRow
              key={issue.id}
              issue={issue}
              milestones={(milestones.data ?? []).map((m) => ({ id: m.id, title: m.title }))}
              onChange={refresh}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function IssueRow({
  issue,
  milestones,
  onChange,
}: {
  issue: Issue;
  milestones: { id: string; title: string }[];
  onChange: () => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [label, setLabel] = useState("");
  const [comment, setComment] = useState("");

  return (
    <li className="item item-row-wrap">
      <SeverityMark severity={issue.severity} />
      <span className="item-body">
        <Editable
          className="item-title"
          value={issue.title}
          onSave={async (title) => {
            await updateIssue(issue.id, { title });
            await onChange();
          }}
          label="Rename issue"
        />
        <span className="item-meta">
          <StatusLabel status={issue.status} />
          <StatusLabel status={`${issue.severity} severity`} />
          {issue.labels.map((l) => (
            <StatusLabel key={l} status={l} />
          ))}
          {issue.milestoneId && (
            <StatusLabel
              status={milestones.find((m) => m.id === issue.milestoneId)?.title ?? "milestone"}
            />
          )}
          {issue.comments.length > 0 && (
            <span className="text-tiny">{issue.comments.length} comment(s)</span>
          )}
        </span>
        {issue.description && <p className="item-note">{issue.description}</p>}
      </span>

      <span className="item-actions">
        <button
          type="button"
          className="btn-icon"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          data-tip={expanded ? "Hide details and comments" : "Edit description, labels and comments"}
          data-tip-edge="left"
        >
          Detail
        </button>
        <button
          type="button"
          className="btn-secondary btn-small"
          onClick={async () => {
            await setIssueStatus(issue.id, issue.status === "open" ? "resolved" : "open");
            await onChange();
          }}
          data-tip={issue.status === "open" ? "Mark this issue resolved" : "Reopen this issue"}
          data-tip-edge="left"
        >
          {issue.status === "open" ? "Resolve" : "Reopen"}
        </button>
        <button
          type="button"
          className="btn-icon btn-icon-danger"
          onClick={async () => {
            await deleteIssue(issue.id);
            await onChange();
          }}
          data-tip="Delete this issue"
          data-tip-edge="left"
        >
          Del
        </button>
      </span>

      {expanded && (
        <div className="item-detail stack-tight">
          <div className="form-grid">
            <div className="field">
              <div className="field-label">Severity</div>
              <select
                value={issue.severity}
                onChange={async (e) => {
                  await updateIssue(issue.id, { severity: e.target.value as IssueSeverity });
                  await onChange();
                }}
                data-tip="High severity open issues raise an alert on the home screen"
              >
                {(Object.keys(SEVERITY_LABELS) as IssueSeverity[]).map((s) => (
                  <option key={s} value={s}>
                    {SEVERITY_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <div className="field-label">Milestone</div>
              <select
                value={issue.milestoneId ?? ""}
                onChange={async (e) => {
                  await updateIssue(issue.id, { milestoneId: e.target.value || null });
                  await onChange();
                }}
                data-tip="Tie this issue to a phase checkpoint"
              >
                <option value="">None</option>
                {milestones.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="field-label">Description</div>
            <DescriptionEditor issue={issue} onChange={onChange} />
          </div>

          <div>
            <div className="field-label">Labels</div>
            <div className="inline-form" style={{ marginBottom: 0 }}>
              <input
                type="text"
                value={label}
                placeholder="Add a label"
                onChange={(e) => setLabel(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key !== "Enter" || !label.trim()) return;
                  await toggleIssueLabel(issue.id, label);
                  setLabel("");
                  await onChange();
                }}
                data-tip="Press Enter to add. Click a label in the list above to remove it."
              />
              <button
                type="button"
                className="btn-secondary btn-small"
                onClick={async () => {
                  if (!label.trim()) return;
                  await toggleIssueLabel(issue.id, label);
                  setLabel("");
                  await onChange();
                }}
                data-tip="Toggle this label on or off"
              >
                Toggle
              </button>
            </div>
          </div>

          <div>
            <div className="field-label">Comments</div>
            {issue.comments.length === 0 ? (
              <p className="text-tiny faint">No comments yet.</p>
            ) : (
              <ul className="item-list">
                {issue.comments.map((c) => (
                  <li key={c.id} className="item item-row-wrap">
                    <span className="item-body">
                      <span className="text-small">{c.body}</span>
                      <span className="text-tiny faint">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </span>
                    <span className="item-actions">
                      <button
                        type="button"
                        className="btn-icon btn-icon-danger"
                        onClick={async () => {
                          await deleteIssueComment(issue.id, c.id);
                          await onChange();
                        }}
                        data-tip="Delete this comment"
                        data-tip-edge="left"
                      >
                        Del
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="inline-form" style={{ marginTop: 6 }}>
              <input
                type="text"
                value={comment}
                placeholder="Add a comment..."
                onChange={(e) => setComment(e.target.value)}
              />
              <MicButton onResult={setComment} />
              <button
                type="button"
                className="btn-primary btn-small"
                onClick={async () => {
                  if (!comment.trim()) return;
                  await addIssueComment(issue.id, comment);
                  setComment("");
                  await onChange();
                }}
                data-tip="Add this comment to the issue"
              >
                + Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

function DescriptionEditor({
  issue,
  onChange,
}: {
  issue: Issue;
  onChange: () => Promise<void>;
}) {
  const [value, setValue] = useState(issue.description);
  return (
    <textarea
      value={value}
      rows={3}
      onChange={(e) => setValue(e.target.value)}
      onBlur={async () => {
        if (value === issue.description) return;
        await updateIssue(issue.id, { description: value });
        await onChange();
      }}
      placeholder="What happened, and what it is blocking"
    />
  );
}

function AddIssueForm({
  projectId,
  milestones,
  onCreated,
}: {
  projectId: string;
  milestones: { id: string; title: string }[];
  onCreated: () => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<IssueSeverity>("medium");
  const [labels, setLabels] = useState("");
  const [milestoneId, setMilestoneId] = useState("");

  return (
    <form
      className="resource-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        await createIssue({
          projectId,
          title: title.trim(),
          description: description.trim(),
          severity,
          labels: labels
            .split(",")
            .map((l) => l.trim())
            .filter(Boolean),
          milestoneId: milestoneId || null,
        });
        setTitle("");
        setDescription("");
        setLabels("");
        setMilestoneId("");
        await onCreated();
      }}
    >
      <div className="field" style={{ flexBasis: "100%" }}>
        <div className="field-label">New issue</div>
        <div className="inline-form" style={{ marginBottom: 0 }}>
          <input
            type="text"
            placeholder="What is the setback?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <MicButton onResult={setTitle} />
        </div>
      </div>
      <div className="field" style={{ flexBasis: "100%" }}>
        <div className="field-label">Description</div>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="field">
        <div className="field-label">Severity</div>
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value as IssueSeverity)}
          data-tip="High severity open issues raise an alert on the home screen"
        >
          {(Object.keys(SEVERITY_LABELS) as IssueSeverity[]).map((s) => (
            <option key={s} value={s}>
              {SEVERITY_LABELS[s]}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <div className="field-label">Labels (comma separated)</div>
        <input
          type="text"
          placeholder="bug, blocked"
          value={labels}
          onChange={(e) => setLabels(e.target.value)}
        />
      </div>
      {milestones.length > 0 && (
        <div className="field">
          <div className="field-label">Milestone</div>
          <select
            value={milestoneId}
            onChange={(e) => setMilestoneId(e.target.value)}
            data-tip="Optional. Tie this issue to a phase checkpoint."
          >
            <option value="">None</option>
            {milestones.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>
      )}
      <button type="submit" className="btn-primary" data-tip="Log this issue">
        + Log issue
      </button>
    </form>
  );
}
