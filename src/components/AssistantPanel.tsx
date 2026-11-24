import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  listConversations,
  createConversation,
  listMessages,
  addMessage,
  deleteConversation,
  pruneExpiredConversations,
  type Message,
} from "../data/conversations";
import { type ChatMessage } from "../ai/chat";
import {
  executeAgentAction,
  isDestructiveAction,
  notifyWorkspaceUpdated,
  runAgentTurn,
  type AgentAction,
} from "../ai/agent";
import { newId } from "../data/utils";
import { showToast, useAsync } from "../components/ui";

interface PendingApproval {
  id: string;
  action: AgentAction;
  destructive: boolean;
}

interface UndoEntry {
  id: string;
  summary: string;
  undo: () => Promise<void>;
}

export default function AssistantPanel() {
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [composing, setComposing] = useState(false);
  const [clarifying, setClarifying] = useState<{ question: string; options: string[] } | null>(null);
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [undoEntries, setUndoEntries] = useState<UndoEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const conversations = useAsync(listConversations, []);
  const messages = useAsync(
    () => (conversationId ? listMessages(conversationId) : Promise.resolve([] as Message[])),
    [conversationId]
  );

  useEffect(() => {
    pruneExpiredConversations();
  }, []);

  async function startNew() {
    const c = await createConversation("New conversation");
    setConversationId(c.id);
    setApprovals([]);
    setClarifying(null);
    setError(null);
    setOpen(true);
    conversations.reload();
  }

  async function runUndo(entry: UndoEntry) {
    try {
      await entry.undo();
      notifyWorkspaceUpdated();
      setUndoEntries((prev) => prev.filter((u) => u.id !== entry.id));
      if (conversationId) {
        await addMessage(conversationId, "assistant", `Undid: ${entry.summary}`);
        messages.reload();
      }
      showToast(`Undid: ${entry.summary}`, "info");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not undo that action.");
    }
  }

  async function sendMessage(rawText: string) {
    const userText = rawText.trim();
    if (!userText || composing) return;

    let convId = conversationId;
    if (!convId) {
      const c = await createConversation(userText.slice(0, 30));
      convId = c.id;
      setConversationId(c.id);
      conversations.reload();
    }

    setError(null);
    setClarifying(null);
    setComposing(true);
    await addMessage(convId, "user", userText);
    setText("");
    messages.reload();

    try {
      const allMsgs = await listMessages(convId);
      const currentRoute = `${location.pathname}${location.search}`;
      const workingMessages: ChatMessage[] = allMsgs.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text,
      }));

      const turn = await runAgentTurn(workingMessages, currentRoute, navigate);

      if (turn.clarify) {
        setClarifying(turn.clarify);
        return;
      }

      const displayReply = [turn.cleanText, turn.uiSummaries.length ? `(${turn.uiSummaries.join(" · ")})` : ""]
        .filter(Boolean)
        .join("\n\n");

      if (displayReply) {
        await addMessage(convId, "assistant", displayReply);
        messages.reload();
      }

      if (turn.actions.length > 0) {
        const queued: PendingApproval[] = turn.actions.map((act) => ({
          id: newId(),
          action: act,
          destructive: isDestructiveAction(act.type),
        }));
        setApprovals((prev) => [...prev, ...queued]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Assistant error occurred.");
    } finally {
      setComposing(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void sendMessage(text);
  }

  function resolveClarify(option: string) {
    setClarifying(null);
    void sendMessage(`[Selected: ${option}]`);
  }

  function dismissClarify() {
    setClarifying(null);
  }

  async function approveOne(id: string): Promise<boolean> {
    const item = approvals.find((a) => a.id === id);
    if (!item) return false;
    try {
      const exec = await executeAgentAction(item.action);
      setApprovals((prev) => prev.filter((a) => a.id !== id));
      if (conversationId) {
        await addMessage(conversationId, "assistant", `Approved: ${exec.summary}`);
        messages.reload();
      }
      if (exec.undo) {
        const entry: UndoEntry = { id: newId(), summary: exec.summary, undo: exec.undo };
        setUndoEntries((prev) => [entry, ...prev].slice(0, 6));
        showToast(exec.summary, "success", 6000, {
          label: "Undo",
          onClick: () => void runUndo(entry),
        });
      } else {
        showToast(exec.summary, "success");
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
      return false;
    }
  }

  async function approveAllNonDestructive() {
    const safe = approvals.filter((a) => !a.destructive);
    for (const item of safe) {
      const ok = await approveOne(item.id);
      if (!ok) break;
    }
  }

  function dismissApproval(id: string) {
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  }

  const safePendingCount = approvals.filter((a) => !a.destructive).length;
  const fabRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={fabRef}
        type="button"
        className="assistant-fab clickable"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="assistant-panel"
        data-tip="Open the AI Assistant agent"
      >
        ✨ AI
      </button>

      {open && (
        <div
          id="assistant-panel"
          className="drawer-backdrop drawer-backdrop-right"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Assistant"
        >
          <div className="drawer-panel assistant-panel" onClick={(e) => e.stopPropagation()}>
            <header className="drawer-header">
              <h2>Assistant &amp; Agent</h2>
              <div className="btn-row">
                <button
                  type="button"
                  className="btn-secondary btn-small clickable"
                  onClick={startNew}
                  data-tip="Start a new conversation"
                >
                  New
                </button>
                <button
                  type="button"
                  className="btn-secondary btn-small clickable"
                  onClick={() => setOpen(false)}
                  data-tip="Close the assistant"
                >
                  Close
                </button>
              </div>
            </header>

            <div className="assistant-tabs">
              <button
                type="button"
                className={`tab-btn clickable ${conversationId === null ? "tab-btn-active" : ""}`}
                onClick={() => {
                  setConversationId(null);
                  setError(null);
                }}
                data-tip="View conversation history"
              >
                History
              </button>
            </div>

            <div className="drawer-body" style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
              {conversationId === null ? (
                <ConversationList
                  conversations={conversations.data ?? []}
                  onSelect={(id) => {
                    setConversationId(id);
                    setError(null);
                  }}
                  onDelete={async (id) => {
                    await deleteConversation(id);
                    conversations.reload();
                  }}
                />
              ) : (
                <>
                  {error && (
                    <div className="error-banner" style={{ margin: "8px 12px", padding: 8 }}>
                      <p style={{ margin: 0, fontSize: 13 }}>{error}</p>
                      <button
                        type="button"
                        className="btn-secondary btn-small clickable"
                        style={{ marginTop: 6 }}
                        onClick={() => setError(null)}
                        data-tip="Dismiss error"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}

                  <div className="assistant-log" role="log" aria-live="polite">
                    {(messages.data ?? []).length === 0 ? (
                      <p className="empty-state" style={{ margin: "auto", textAlign: "center" }}>
                        Ask me to search, write, edit, copy, paste, organize folders, set reminders, or navigate Panga.
                        <br />
                        <span className="text-tiny" style={{ color: "var(--color-text-muted)" }}>
                          Every write asks for your approval first and supports Undo.
                        </span>
                      </p>
                    ) : (
                      (messages.data ?? []).map((m) => (
                        <div
                          key={m.id}
                          className={`assistant-message ${
                            m.role === "user" ? "assistant-message-user" : "assistant-message-assistant"
                          }`}
                        >
                          {m.text}
                        </div>
                      ))
                    )}
                  </div>

                  {undoEntries.length > 0 && (
                    <div
                      style={{
                        padding: "6px 12px",
                        borderTop: "1px solid var(--color-border)",
                        background: "var(--color-bg-subtle)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      {undoEntries.slice(0, 3).map((u) => (
                        <div
                          key={u.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 8,
                            fontSize: 12,
                          }}
                        >
                          <span style={{ color: "var(--color-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {u.summary}
                          </span>
                          <button
                            type="button"
                            className="btn-secondary btn-small clickable"
                            onClick={() => void runUndo(u)}
                          >
                            Undo
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {clarifying && (
                    <div className="clarify-box" role="alertdialog" aria-label="Clarification needed">
                      <p className="clarify-prompt">{clarifying.question}</p>
                      <div className="clarify-options">
                        {clarifying.options.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            className="btn-secondary btn-small clickable"
                            onClick={() => resolveClarify(opt)}
                            data-tip="Answer with this option"
                          >
                            {opt}
                          </button>
                        ))}
                        <button
                          type="button"
                          className="btn-secondary btn-small clickable"
                          onClick={dismissClarify}
                          data-tip="Dismiss the question"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  )}

                  <form className="assistant-composer" onSubmit={handleSubmit}>
                    <div className="inline-form" style={{ flex: 1, marginBottom: 0 }}>
                      <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Search, write, edit, copy, paste, navigate…"
                        disabled={composing}
                        aria-label="Your message"
                      />
                    </div>
                    <button type="submit" className="btn-primary clickable" disabled={composing || !text.trim()}>
                      {composing ? "Working…" : "Send"}
                    </button>
                  </form>
                </>
              )}
            </div>

            {approvals.length > 0 && (
              <div className="approval-box" role="alertdialog" aria-label="Waiting for approval">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <h3 style={{ margin: 0 }}>Confirm Action ({approvals.length})</h3>
                  {safePendingCount > 1 && (
                    <button
                      type="button"
                      className="btn-secondary btn-small clickable"
                      onClick={() => void approveAllNonDestructive()}
                    >
                      Approve all ({safePendingCount})
                    </button>
                  )}
                </div>
                <div className="approval-list">
                  {approvals.map((a) => (
                    <div
                      key={a.id}
                      className="approval-item"
                      style={a.destructive ? { borderColor: "var(--color-accent-issue)" } : undefined}
                    >
                      <span>{a.action.description}</span>
                      <div className="btn-row">
                        <button
                          type="button"
                          className="btn-primary btn-small clickable"
                          style={
                            a.destructive
                              ? { background: "var(--color-accent-issue)", borderColor: "var(--color-accent-issue)" }
                              : undefined
                          }
                          onClick={() => void approveOne(a.id)}
                          data-tip="Approve and execute this action"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="btn-secondary btn-small clickable"
                          onClick={() => dismissApproval(a.id)}
                          data-tip="Discard this action"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function ConversationList({
  conversations,
  onSelect,
  onDelete,
}: {
  conversations: { id: string; title: string; updatedAt: number }[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (conversations.length === 0) {
    return (
      <div className="empty-state" style={{ textAlign: "center", padding: 24 }}>
        No conversations yet. Click New to start one.
      </div>
    );
  }
  return (
    <ul className="activity-list" style={{ flex: 1, overflow: "auto" }}>
      {conversations.map((c) => (
        <li key={c.id} className="activity-item" style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <button
            type="button"
            className="editable-view clickable"
            style={{ flex: 1, textAlign: "left", padding: 6, background: "none", border: "none" }}
            onClick={() => onSelect(c.id)}
          >
            <div className="activity-title" style={{ fontWeight: 600 }}>{c.title}</div>
            <div className="activity-time text-tiny">{new Date(c.updatedAt).toLocaleString()}</div>
          </button>
          <button
            type="button"
            className="btn-secondary btn-small clickable"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(c.id);
            }}
            data-tip="Delete this conversation"
            data-tip-edge="left"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
