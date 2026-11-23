import { useCallback, useEffect, useState } from "react";
import { addClip, clearClips, clipTitle, listClips, removeClip } from "../../data/clips";
import { type Resource } from "../../data/resources";
import { createTask } from "../../data/tasks";
import { createNote } from "../../data/notes";
import { confirmAction, copyToClipboard, showToast } from "../ui";
import { ProofreadTrigger } from "../Proofread";
import { pasteWithFeedback } from "../quickPaste";

export default function ClipboardPanel() {
  const [clips, setClips] = useState<Resource[]>([]);
  const [box, setBox] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const reload = useCallback(async () => setClips(await listClips()), []);

  useEffect(() => {
    void reload();
    const h = () => void reload();
    window.addEventListener("panga-clips-updated", h);
    return () => window.removeEventListener("panga-clips-updated", h);
  }, [reload]);

  // Ctrl/Cmd+V anywhere on this screen (outside text boxes) saves the clipboard. No permission prompt needed.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const t = e.target;
      if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || (t instanceof HTMLElement && t.isContentEditable)) return;
      const text = e.clipboardData?.getData("text") ?? "";
      if (text.trim()) {
        e.preventDefault();
        void addClip(text).then((r) => r === "saved" && showToast("Saved to Clipboard", "success"));
      }
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, []);

  return (
    <div>
      <div className="pg-capture-row">
        <button type="button" className="btn-primary" onClick={() => void pasteWithFeedback()}>
          📋 Paste from clipboard
        </button>
        <span className="pg-muted pg-grow">Or press Ctrl/Cmd+V here. Clips stay on this device.</span>
      </div>
      <textarea
        className="pg-wide"
        value={box}
        rows={2}
        onChange={(e) => setBox(e.target.value)}
        onPaste={(e) => {
          const text = e.clipboardData.getData("text");
          if (text.trim()) {
            e.preventDefault();
            void addClip(text);
            setBox("");
          }
        }}
        placeholder="Fallback: long-press here and choose Paste (or type something to keep)"
      />
      {box.trim() && (
        <div className="pg-actions">
          <ProofreadTrigger value={box} onApply={setBox} />
          <button
            type="button"
            className="btn-secondary btn-small"
            onClick={() => {
              void addClip(box);
              setBox("");
            }}
          >
            Save as clip
          </button>
        </div>
      )}

      {clips.length === 0 ? (
        <p className="pg-muted">Nothing saved yet. Text you copy inside Panga also appears here.</p>
      ) : (
        <>
          <div className="pg-actions">
            <button
              type="button"
              className="btn-secondary btn-small"
              onClick={async () => {
                if (await confirmAction({ title: "Clear clipboard history?", message: "All saved clips will be removed.", confirmLabel: "Clear all", danger: true })) await clearClips();
              }}
            >
              Clear all
            </button>
          </div>
          <ul className="pg-list">
            {clips.map((c) => (
              <li key={c.id} className="pg-note">
                <p className="pg-body pg-clip" onClick={() => setOpen(open === c.id ? null : c.id)}>
                  {open === c.id ? c.body : (c.body ?? "").slice(0, 160) + ((c.body ?? "").length > 160 ? "…" : "")}
                </p>
                <div className="pg-actions">
                  <time className="pg-muted">{new Date(c.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</time>
                  <button type="button" className="btn-secondary btn-small" onClick={() => void copyToClipboard(c.body ?? "")}>
                    Copy
                  </button>
                    <button
                      type="button"
                      className="btn-secondary btn-small clickable"
                      onClick={async () => {
                        await createNote({ folderId: null, title: c.title, body: c.body ?? "" });
                        showToast("Saved as a note", "success");
                      }}
                    >
                      Save as note
                    </button>
                  <button
                    type="button"
                    className="btn-secondary btn-small clickable"
                    onClick={async () => {
                      await createTask({ listId: null, title: clipTitle(c.body ?? "") });
                      showToast("Saved as a task", "success");
                    }}
                  >
                    Save as task
                  </button>
                  <button type="button" className="btn-secondary btn-small" onClick={() => void removeClip(c.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
