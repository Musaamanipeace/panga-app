import { useEffect, useState } from "react";
import {
  DEFAULT_WORKSPACE_ID,
  formatWorkspaceLabel,
  getActiveWorkspaceId,
  listWorkspaces,
} from "../data/workspaceState";
import {
  moveItemToWorkspace,
  type GlobalPromptPayload,
} from "../data/workspaceMove";
import { showToast } from "./ui";

const KIND_LABELS: Record<GlobalPromptPayload["kind"], string> = {
  note: "note",
  taskList: "task list",
  link: "link",
  thought: "thought",
  clip: "clip",
  media: "media file",
};

export default function GlobalWorkspacePrompt() {
  const [prompt, setPrompt] = useState<GlobalPromptPayload | null>(null);
  const [targetId, setTargetId] = useState("");
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    function onPrompt(e: Event) {
      const detail = (e as CustomEvent<GlobalPromptPayload>).detail;
      if (!detail) return;
      if (getActiveWorkspaceId() !== DEFAULT_WORKSPACE_ID) return;
      const targets = listWorkspaces().filter((w) => w.id !== DEFAULT_WORKSPACE_ID);
      if (targets.length === 0) return;
      setPrompt(detail);
      setTargetId((prev) => (targets.some((w) => w.id === prev) ? prev : targets[0].id));
    }
    function onWsSwitch() {
      if (getActiveWorkspaceId() !== DEFAULT_WORKSPACE_ID) {
        setPrompt(null);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setPrompt(null);
    }
    window.addEventListener("panga-global-prompt", onPrompt);
    window.addEventListener("panga-workspace-switched", onWsSwitch);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("panga-global-prompt", onPrompt);
      window.removeEventListener("panga-workspace-switched", onWsSwitch);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  if (!prompt) return null;

  const allWorkspaces = listWorkspaces();
  const targets = allWorkspaces.filter((w) => w.id !== DEFAULT_WORKSPACE_ID);
  if (targets.length === 0) return null;
  const resolvedTarget = targets.some((w) => w.id === targetId) ? targetId : targets[0].id;
  const targetInfo = targets.find((w) => w.id === resolvedTarget);

  async function handleMove() {
    if (!prompt || !resolvedTarget || moving) return;
    setMoving(true);
    try {
      const ok = await moveItemToWorkspace({
        kind: prompt.kind,
        id: prompt.id,
        targetWorkspaceId: resolvedTarget,
        sourceWorkspaceId: DEFAULT_WORKSPACE_ID,
      });
      if (ok) {
        showToast(
          `Moved ${KIND_LABELS[prompt.kind]} to ${targetInfo ? formatWorkspaceLabel(targetInfo, allWorkspaces) : "workspace"}.`,
          "success"
        );
      } else {
        showToast("Could not move item to that workspace.", "error");
      }
      setPrompt(null);
    } finally {
      setMoving(false);
    }
  }

  return (
    <aside
      className="global-prompt-banner sweep-on-mount"
      role="region"
      aria-label="Move item from Main workspace"
    >
      <div className="global-prompt-head">
        <span className="global-prompt-text">
          Saved {KIND_LABELS[prompt.kind]} <strong>{prompt.title}</strong> in Main (Global). File into a workspace?
        </span>
        <button
          type="button"
          className="modal-close-x clickable"
          aria-label="Keep in Main"
          onClick={() => setPrompt(null)}
        >
          ×
        </button>
      </div>
      <div className="global-prompt-actions">
        <select
          aria-label="Destination workspace"
          value={resolvedTarget}
          onChange={(e) => setTargetId(e.target.value)}
        >
          {targets.map((w) => (
            <option key={w.id} value={w.id}>
              {formatWorkspaceLabel(w, allWorkspaces)}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn-primary btn-small clickable"
          disabled={moving}
          onClick={() => void handleMove()}
        >
          {moving ? "Moving…" : "Move"}
        </button>
        <button
          type="button"
          className="btn-secondary btn-small clickable"
          onClick={() => setPrompt(null)}
        >
          Keep in Main
        </button>
      </div>
    </aside>
  );
}
