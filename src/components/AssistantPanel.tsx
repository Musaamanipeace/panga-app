import { useEffect, useRef, useState } from "react";
import {
  listConversations,
  createConversation,
  listMessages,
  addMessage,
  deleteConversation,
  pruneExpiredConversations,
} from "../data/conversations.ts"
import { getGeminiApiKey } from "../data/settings.ts"
import MicButton from "../components/MicButton.tsx"
import { useAsync } from "../components/ui.tsx"

const SYSTEM_PROMPT = `You are Panga's assistant. You help with planning, scheduling, editing and research within this personal project manager. You do NOT answer general questions, write code for other purposes, or design new algorithms. You have tools to read and write tasks, resources, milestones, issues and documentation — you always ask for approval before writing. Keep responses concise.`;

export default function AssistantPanel() {
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [composing, setComposing] = useState(false);
  const [clarifying, setClarifying] = useState<{ question: string; options: string[] } | null>(null);
  const [approvals, setApprovals] = useState<
    { id: string; description: string; action: () => Promise<void> }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  const conversations = useAsync(listConversations, []);
  const messages = useAsync(
    () => (conversationId ? listMessages(conversationId) : Promise.resolve([] as import("../data/conversations.ts").Message[])),
    [conversationId]
  );

  useEffect(() => {
    pruneExpiredConversations();
  }, []);

  async function startNew() {
    const c = await createConversation("New conversation");
    setConversationId(c.id);
    setOpen(true);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    if (!conversationId) return;

    setError(null);
    setComposing(true);
    await addMessage(conversationId, "user", text);
    setText("");
    messages.reload();

    try {
      const apiKey = await getGeminiApiKey();
      if (!apiKey) {
        setError("No Gemini API key in Settings. Add one to use the assistant.");
        setComposing(false);
        return;
      }

      const all = await listMessages(conversationId);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
              ...all.map((m) => ({
                role: m.role === "user" ? "user" : "model",
                parts: [{ text: m.text }],
              })),
            ],
          }),
        }
      );

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      if (!reply) throw new Error("Empty response from the model.");

      // If the model asks for clarification, show the box.
      if (reply.startsWith("CLARIFY:")) {
        const parts = reply.replace("CLARIFY:", "").split("||");
        setClarifying({
          question: parts[0].trim(),
          options: parts.slice(1).map((p: string) => p.trim()).filter(Boolean),
        });
        setComposing(false);
        return;
      }

      await addMessage(conversationId, "assistant", reply);
      messages.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Assistant error.");
    } finally {
      setComposing(false);
    }
  }

  function resolveClarify(option: string) {
    if (!conversationId) return;
    setClarifying(null);
    // Re-send with the chosen option appended.
    setText(`${text} [clarification: ${option}]`);
    setComposing(true);
    void handleSend({ preventDefault: () => {}, currentTarget: null } as unknown as React.FormEvent);
  }

  function dismissClarify() {
    setClarifying(null);
  }

  async function approve(id: string) {
    const item = approvals.find((a) => a.id === id);
    if (!item) return;
    setApprovals((prev) => prev.filter((a) => a.id !== id));
    try {
      await item.action();
      messages.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approval failed.");
    }
  }

  function dismissApproval(id: string) {
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  }

  const fabRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={fabRef}
        type="button"
        className="assistant-fab"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="assistant-panel"
        data-tip="Open the assistant. Ctrl Shift A"
      >
        AI
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
              <h2>Assistant</h2>
              <div className="btn-row">
                <button
                  type="button"
                  className="btn-icon"
                  onClick={startNew}
                  data-tip="Start a new conversation"
                >
                  +
                </button>
                <button
                  type="button"
                  className="btn-icon"
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
                data-tip="Conversations"
              >
                History
              </button>
            </div>

            <div className="drawer-body" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              {conversationId === null ? (
                <ConversationList
                  conversations={conversations.data ?? []}
                  onSelect={setConversationId}
                  onDelete={async (id) => {
                    await deleteConversation(id);
                    conversations.reload();
                  }}
                />
              ) : (
                <>
                  {error && (
                    <div className="error-banner" style={{ marginBottom: 8 }}>
                      <p>{error}</p>
                      <button type="button" className="btn-secondary btn-small" onClick={() => setError(null)} data-tip="Dismiss">
                        Dismiss
                      </button>
                    </div>
                  )}
                  <div className="assistant-log" role="log" aria-live="polite">
                    {(messages.data ?? []).map((m) => (
                      <div
                        key={m.id}
                        className={`assistant-message ${
                          m.role === "user" ? "assistant-message-user" : "assistant-message-assistant"
                        }`}
                      >
                        {m.text}
                      </div>
                    ))}
                  </div>
                  {clarifying && (
                    <div className="clarify-box" role="alertdialog" aria-label="Clarification needed">
                      <p className="clarify-prompt">{clarifying.question}</p>
                      <div className="clarify-options">
                        {clarifying.options.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            className="btn-secondary btn-small"
                            onClick={() => resolveClarify(opt)}
                            data-tip="Answer with this option"
                          >
                            {opt}
                          </button>
                        ))}
                        <button
                          type="button"
                          className="btn-secondary btn-small"
                          onClick={dismissClarify}
                          data-tip="Dismiss the question"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  )}
                  <form className="assistant-composer" onSubmit={handleSend}>
                    <div className="inline-form" style={{ flex: 1, marginBottom: 0 }}>
                      <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Ask about your tasks, schedule, resources..."
                        disabled={composing}
                        aria-label="Your message"
                      />
                      <MicButton onResult={setText} />
                    </div>
                    <button type="submit" className="btn-primary" disabled={composing || !text.trim()}>
                      {composing ? "Thinking..." : "Send"}
                    </button>
                  </form>
                </>
              )}
            </div>

            {approvals.length > 0 && (
              <div className="approval-box" role="alertdialog" aria-label="Waiting for approval">
                <h3>Waiting for your approval</h3>
                <div className="approval-list">
                  {approvals.map((a) => (
                    <div key={a.id} className="approval-item">
                      <span>{a.description}</span>
                      <div className="btn-row">
                        <button
                          type="button"
                          className="btn-primary btn-small"
                          onClick={() => approve(a.id)}
                          data-tip="Run this action"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="btn-secondary btn-small"
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
        No conversations yet. Click + to start one.
      </div>
    );
  }
  return (
    <ul className="activity-list" style={{ flex: 1, overflow: "auto" }}>
      {conversations.map((c) => (
        <li key={c.id} className="activity-item" style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <button
            type="button"
            className="editable-view"
            style={{ flex: 1, textAlign: "left", padding: 4 }}
            onClick={() => onSelect(c.id)}
          >
            <div className="activity-title">{c.title}</div>
            <div className="activity-time">{new Date(c.updatedAt).toLocaleString()}</div>
          </button>
          <button
            type="button"
            className="btn-icon btn-icon-danger"
            onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
            data-tip="Delete this conversation"
            data-tip-edge="left"
          >
            Del
          </button>
        </li>
      ))}
    </ul>
  );
}