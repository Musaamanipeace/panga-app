import { useState } from "react";
import {
  listMilestones,
  createMilestone,
  updateMilestone,
  setMilestoneStatus,
  deleteMilestone,
  MILESTONE_STATUS_LABELS,
  summariseBlockers,
} from "../../data/milestones.tsx";
import { listTasksForProject } from "../../data/tasks.tsx"
import type { Milestone } from "../../data/db.tsx"
import MicButton from "../../components/MicButton.tsx"
import { Editable, ErrorNote, Loading, useAsync } from "../../components/ui.tsx"

export default function MilestonesTab({ projectId }: { projectId: string }) {
  const milestones = useAsync(() => listMilestones(projectId), [projectId]);
  const tasks = useAsync(() => listTasksForProject(projectId), [projectId]);
  const [title, setTitle] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [blocking, setBlocking] = useState<string[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);

  async function refresh() {
    await milestones.reload();
    await tasks.reload();
  }

  const all = milestones.data ?? [];
  const taskById = new Map((tasks.data ?? []).map((t) => [t.id, t]));
  const sorted = [...all].sort(
    (a, b) => (a.targetDate ?? Infinity) - (b.targetDate ?? Infinity)
  );

  if (milestones.error) return <ErrorNote error={milestones.error} onRetry={refresh} />;

  return (
    <div>
      <form
        className="resource-form"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!title.trim()) return;
          await createMilestone({
            projectId,
            title: title.trim(),
            targetDate: targetDate ? new Date(targetDate).getTime() : null,
            blockingTaskIds: blocking,
          });
          setTitle("");
          setTargetDate("");
          setBlocking([]);
          await refresh();
        }}
      >
        <div className="field" style={{ flexBasis: "100%" }}>
          <div className="field-label">New milestone</div>
          <div className="inline-form" style={{ marginBottom: 0 }}>
            <input
              type="text"
              placeholder="Phase checkpoint, e.g. Design complete"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <MicButton onResult={setTitle} />
          </div>
        </div>
        <div className="field">
          <div className="field-label">Target date</div>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            data-tip="Optional. Milestones without blocking tasks are manual."
          />
        </div>
        <button type="submit" className="btn-primary" data-tip="Add this milestone">
          + Add milestone
        </button>
      </form>

      {tasks.data && tasks.data.length > 0 && (
        <div className="stack-tight blocker-picker">
          <div className="field-label">Blocking tasks for the next milestone</div>
          <div className="chip-row">
            {tasks.data.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`chip ${blocking.includes(t.id) ? "chip-active" : ""}`}
                onClick={() =>
                  setBlocking((prev) =>
                    prev.includes(t.id) ? prev.filter((x) => x !== t.id) : [...prev, t.id]
                  )
                }
                data-tip={t.title}
              >
                {t.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {milestones.loading ? (
        <Loading label="Loading milestones..." />
      ) : sorted.length === 0 ? (
        <p className="empty-state">
          No milestones yet. Add a phase checkpoint above and (optionally) attach the
          tasks that block it — the milestone auto-completes once they are all done.
        </p>
      ) : (
        <div className="milestone-track">
          {sorted.map((m) => (
            <MilestoneNode
              key={m.id}
              milestone={m}
              blockers={summariseBlockers(m, taskById).blockers}
              pendingCount={summariseBlockers(m, taskById).pending}
              totalCount={summariseBlockers(m, taskById).total}
              hovered={hovered === m.id}
              onHover={() => setHovered(m.id)}
              onLeave={() => setHovered((h) => (h === m.id ? null : h))}
              onChange={refresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MilestoneNode({
  milestone,
  blockers,
  pendingCount,
  totalCount,
  hovered,
  onHover,
  onLeave,
  onChange,
}: {
  milestone: Milestone;
  blockers: { id: string; title: string; status: string }[];
  pendingCount: number;
  totalCount: number;
  hovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onChange: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div
      className={`milestone-node milestone-${milestone.status}`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <span className="milestone-dot" data-tip="Hover to see blocking tasks" />
      <div className="milestone-body">
        {editing ? (
          <Editable
            className="milestone-title-input"
            value={milestone.title}
            onSave={async (title) => {
              await updateMilestone(milestone.id, { title });
              await onChange();
            }}
            label="Rename milestone"
          />
        ) : (
          <span className="milestone-title">{milestone.title}</span>
        )}
        {milestone.targetDate && (
          <span className="milestone-date">
            {new Date(milestone.targetDate).toLocaleDateString()}
          </span>
        )}
        <select
          value={milestone.status}
          onChange={async (e) => {
            await setMilestoneStatus(milestone.id, e.target.value as Milestone["status"]);
            await onChange();
          }}
          data-tip="Milestone status"
        >
          {(Object.keys(MILESTONE_STATUS_LABELS) as Milestone["status"][]).map((s) => (
            <option key={s} value={s}>
              {MILESTONE_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn-icon"
          onClick={() => setEditing((v) => !v)}
          data-tip="Rename milestone"
          data-tip-edge="left"
        >
          Edit
        </button>
        <button
          type="button"
          className="btn-icon btn-icon-danger"
          onClick={async () => {
            await deleteMilestone(milestone.id);
            await onChange();
          }}
          data-tip="Delete this milestone"
          data-tip-edge="left"
        >
          Del
        </button>
      </div>

      {hovered && (
        <div className="milestone-hover-panel">
          {blockers.length === 0 ? (
            <p className="empty-state">No blocking tasks linked.</p>
          ) : (
            <>
              <p className="milestone-hover-title">
                {pendingCount === 0
                  ? "All blocking tasks complete"
                  : `${pendingCount} of ${totalCount} blocking task(s) pending`}
              </p>
              <ul className="milestone-blocker-list">
                {blockers.map((t) => (
                  <li key={t.id} className={`task-${t.status}`}>
                    <span className="task-status-btn is-{t.status}" />
                    {t.title}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}