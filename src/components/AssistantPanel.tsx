import { useEffect, useRef, useState } from "react";
import {
  listConversations,
  createConversation,
  listMessages,
  addMessage,
  deleteConversation,
  pruneExpiredConversations,
  type Message,
} from "../data/conversations";
import { getGeminiApiKey } from "../data/settings";
import { listAllProjects, createProject } from "../data/projects";
import { listAllTasks, createTask, updateTask, deleteTask } from "../data/tasks";
import { createMilestone } from "../data/milestones";
import { createReminder } from "../data/reminders";
import { createInsight } from "../data/insights";
import { createResource } from "../data/resources";
import { db } from "../data/db";
import { newId } from "../data/utils";
import MicButton from "../components/MicButton";
import { useAsync } from "../components/ui";

interface ActionProposal {
  type:
    | "create_task"
    | "update_task"
    | "delete_task"
    | "create_project"
    | "create_milestone"
    | "create_reminder"
    | "create_insight"
    | "create_link"
    | "add_subcategory";
  description: string;
  data: any;
}

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
    () => (conversationId ? listMessages(conversationId) : Promise.resolve([] as Message[])),
    [conversationId]
  );

  useEffect(() => {
    pruneExpiredConversations();
  }, []);

  async function startNew() {
    const c = await createConversation("New conversation");
    setConversationId(c.id);
    setOpen(true);
    conversations.reload();
  }

  async function buildSystemInstruction(): Promise<string> {
    const [projects, tasks, milestones] = await Promise.all([
      listAllProjects(),
      listAllTasks(),
      db.milestones.toArray(),
    ]);

    const projList = projects
      .map((p) => `- Project "${p.name}" (id: ${p.id}): ${p.description || "no description"} [status: ${p.status}]`)
      .join("\n");
    const taskList = tasks
      .slice(0, 50)
      .map(
        (t) =>
          `- Task "${t.title}" (id: ${t.id}, project: ${t.projectId}): [status: ${t.status}, executor: ${t.executor}${
            t.scheduledAt ? `, scheduled: ${new Date(t.scheduledAt).toLocaleString()}` : ""
          }]`
      )
      .join("\n");
    const milestoneList = milestones
      .map((m) => `- Milestone "${m.title}" (id: ${m.id}, project: ${m.projectId}): ${m.description || "no description"} [status: ${m.status}]`)
      .join("\n");

    return `You are Panga's intelligent personal assistant and agent.
Panga is a personal, offline-first project and resource planner.

Core principles & instructions:
1. Upload & storage philosophy: Panga never stores binary files, only text and cloud links. For images and PDFs, links to Google Drive (or any cloud drive) are stored. For text documents (.txt, .md), their contents are parsed into text.
2. PDF guidance: If asked about PDFs or ingesting PDF documents, explain the upload rule: recommend free, self-service tools such as ilovepdf.com/pdf_to_text to convert the PDF to plain text, and paste that text into Notes or Insights, or store the PDF in Google Drive and paste the share link.
3. Milestones: Milestones are goals with a title and a description body context. Use them to understand user goals, suggest task breakdowns, set reminders, and schedule action items.
4. Agent actions with user approval: You have the ability to read, write, edit, add subcategories, add projects, add tasks, delete tasks, check/tick off tasks, add milestones, add reminders, and save insights.
Whenever the user asks you to perform an action (or when you suggest concrete actions that should be executed), explain what you are doing in your message, and append machine-readable ACTION blocks at the very end of your response, one per action, like this:
ACTION:{"type":"create_task","description":"Add task '...' to project '...'","data":{"projectId":"...","title":"...","notes":"...","executor":"ai"|"manual","scheduledAt":null}}
ACTION:{"type":"update_task","description":"Mark task '...' as completed","data":{"id":"...","status":"completed"}}
ACTION:{"type":"delete_task","description":"Delete task '...'","data":{"id":"..."}}
ACTION:{"type":"create_project","description":"Create project '...'","data":{"name":"...","description":"..."}}
ACTION:{"type":"create_milestone","description":"Create milestone '...'","data":{"projectId":"...","title":"...","description":"..."}}
ACTION:{"type":"create_reminder","description":"Set reminder '...'","data":{"message":"...","triggerAt":1234567890,"projectId":"..."}}
ACTION:{"type":"create_insight","description":"Save insight '...'","data":{"projectId":"...","title":"...","body":"...","type":"note"}}
ACTION:{"type":"create_link","description":"Save link '...'","data":{"url":"https://...","title":"...","description":"...","projectId":null}}
ACTION:{"type":"add_subcategory","description":"Add shared subcategory '...'","data":{"category":"notes","name":"..."}}

If the user's request is ambiguous or missing a critical choice, you can instead ask a clarifying question by starting your response with:
CLARIFY: Question text || Option 1 || Option 2 || Option 3

Current application state:
Projects:
${projList || "None"}

Tasks:
${taskList || "None"}

Milestones:
${milestoneList || "None"}
`;
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const userText = text.trim();
    if (!userText) return;

    let convId = conversationId;
    if (!convId) {
      const c = await createConversation(userText.slice(0, 30));
      convId = c.id;
      setConversationId(c.id);
      conversations.reload();
    }

    setError(null);
    setComposing(true);
    await addMessage(convId, "user", userText);
    setText("");
    messages.reload();

    try {
      const clientApiKey = await getGeminiApiKey();
      const allMsgs = await listMessages(convId);
      const systemInstruction = await buildSystemInstruction();
      const needsSearch = /\b(search|research|look up|find online|latest|what is|news)\b/i.test(userText);

      const contents = allMsgs.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      }));

      // Call server-side proxy route
      let reply = "";
      try {
        const res = await fetch("/api/assistant/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            systemInstruction,
            enableSearch: needsSearch,
            clientApiKey: clientApiKey || undefined,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          reply = data.text ?? "";
        } else {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with ${res.status}`);
        }
      } catch (serverErr) {
        // Fallback to client-side direct call if client has custom API key
        if (clientApiKey) {
          const fallbackRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${clientApiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                system_instruction: { parts: [{ text: systemInstruction }] },
                contents,
              }),
            }
          );
          const fallbackData = await fallbackRes.json();
          reply = fallbackData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        } else {
          throw serverErr;
        }
      }

      if (!reply) throw new Error("Empty response received from the assistant.");

      // Check for clarification
      if (reply.startsWith("CLARIFY:")) {
        const parts = reply.replace("CLARIFY:", "").split("||");
        setClarifying({
          question: parts[0].trim(),
          options: parts.slice(1).map((p: string) => p.trim()).filter(Boolean),
        });
        setComposing(false);
        return;
      }

      // Parse ACTION: blocks
      const lines = reply.split(/\r?\n/);
      const actionProposals: ActionProposal[] = [];
      const cleanLines: string[] = [];

      for (const line of lines) {
        if (line.trim().startsWith("ACTION:")) {
          try {
            const rawJson = line.trim().slice(7).trim();
            const parsed = JSON.parse(rawJson) as ActionProposal;
            if (parsed && parsed.type) {
              actionProposals.push(parsed);
            }
          } catch (e) {
            console.warn("Failed to parse action line:", line, e);
          }
        } else {
          cleanLines.push(line);
        }
      }

      const cleanReply = cleanLines.join("\n").trim();
      if (cleanReply) {
        await addMessage(convId, "assistant", cleanReply);
        messages.reload();
      }

      // Convert parsed actions to approval items
      if (actionProposals.length > 0) {
        const newApprovals = actionProposals.map((act) => ({
          id: newId(),
          description: act.description || `Execute ${act.type}`,
          action: async () => {
            await executeAction(act);
            await addMessage(convId!, "assistant", `Approved and executed: ${act.description}`);
            window.dispatchEvent(new Event("panga-data-updated"));
            messages.reload();
          },
        }));
        setApprovals((prev) => [...prev, ...newApprovals]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Assistant error occurred.");
    } finally {
      setComposing(false);
    }
  }

  async function executeAction(act: ActionProposal): Promise<void> {
    const { type, data } = act;
    switch (type) {
      case "create_task": {
        const defaultProj = (await listAllProjects())[0];
        const projId = data.projectId || defaultProj?.id;
        if (!projId) throw new Error("No project found to attach task to.");
        await createTask({
          projectId: projId,
          title: data.title,
          notes: data.notes ?? "",
          executor: data.executor ?? "manual",
          scheduledAt: data.scheduledAt ? Number(data.scheduledAt) : null,
          dueDate: data.dueDate ? Number(data.dueDate) : null,
          tags: data.tags ?? [],
        });
        break;
      }
      case "update_task": {
        if (!data.id) throw new Error("Task id missing.");
        await updateTask(data.id, data);
        break;
      }
      case "delete_task": {
        if (!data.id) throw new Error("Task id missing.");
        await deleteTask(data.id);
        break;
      }
      case "create_project": {
        await createProject({
          name: data.name,
          description: data.description ?? "",
        });
        break;
      }
      case "create_milestone": {
        const defaultProj = (await listAllProjects())[0];
        const projId = data.projectId || defaultProj?.id;
        if (!projId) throw new Error("No project found to attach milestone to.");
        await createMilestone({
          projectId: projId,
          title: data.title,
          description: data.description ?? "",
          targetDate: data.targetDate ? Number(data.targetDate) : null,
        });
        break;
      }
      case "create_reminder": {
        const currentTime = Date.now();
        await createReminder({
          message: data.message,
          triggerAt: data.triggerAt ? Number(data.triggerAt) : currentTime + 3600000,
          projectId: data.projectId ?? null,
        });
        break;
      }
      case "create_insight": {
        const defaultProj = (await listAllProjects())[0];
        const projId = data.projectId || defaultProj?.id;
        if (!projId) throw new Error("No project found to attach insight to.");
        await createInsight({
          projectId: projId,
          title: data.title,
          body: data.body ?? null,
          type: data.type ?? "note",
          link: data.link ?? null,
          tags: data.tags ?? [],
        });
        break;
      }
      case "create_link": {
        await createResource({
          category: "links",
          title: data.title || data.url,
          url: data.url,
          body: data.description || data.body || null,
          projectId: data.projectId || null,
          tags: data.tags || [],
          provider: data.provider || "other",
        });
        break;
      }
      case "add_subcategory": {
        const cat = data.category || "notes";
        const name = (data.name || "").trim().toLowerCase().replace(/\s+/g, "_");
        if (name) {
          const stored = localStorage.getItem("panga-subcategories-global");
          const existing = stored ? JSON.parse(stored) : {};
          existing[cat] = [...(existing[cat] || []), name].filter((v, i, a) => a.indexOf(v) === i);
          localStorage.setItem("panga-subcategories-global", JSON.stringify(existing));
        }
        break;
      }
      default:
        console.warn("Unknown action type:", type);
    }
  }

  function resolveClarify(option: string) {
    if (!conversationId) return;
    setClarifying(null);
    setText(`${text} [Selected: ${option}]`);
    setComposing(true);
    void handleSend({ preventDefault: () => {} } as React.FormEvent);
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
        className="assistant-fab clickable"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="assistant-panel"
        data-tip="Open the AI Assistant agent"
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
              <h2>Assistant &amp; Agent</h2>
              <div className="btn-row">
                <button
                  type="button"
                  className="btn-icon clickable"
                  onClick={startNew}
                  data-tip="Start a new conversation"
                >
                  +
                </button>
                <button
                  type="button"
                  className="btn-icon clickable"
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
                        Ask me anything about your projects, tasks, schedule, or resources.
                        <br />
                        <span className="text-tiny" style={{ color: "var(--color-text-muted)" }}>
                          I can plan tasks, schedule your day, search the web, and guide you on converting PDFs to text.
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

                  <form className="assistant-composer" onSubmit={handleSend}>
                    <div className="inline-form" style={{ flex: 1, marginBottom: 0 }}>
                      <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Ask, plan, or command actions..."
                        disabled={composing}
                        aria-label="Your message"
                      />
                      <MicButton onResult={setText} />
                    </div>
                    <button type="submit" className="btn-primary clickable" disabled={composing || !text.trim()}>
                      {composing ? "Thinking..." : "Send"}
                    </button>
                  </form>
                </>
              )}
            </div>

            {approvals.length > 0 && (
              <div className="approval-box" role="alertdialog" aria-label="Waiting for approval">
                <h3>Agent Action Approval ({approvals.length})</h3>
                <div className="approval-list">
                  {approvals.map((a) => (
                    <div key={a.id} className="approval-item">
                      <span>{a.description}</span>
                      <div className="btn-row">
                        <button
                          type="button"
                          className="btn-primary btn-small clickable"
                          onClick={() => approve(a.id)}
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
            className="editable-view clickable"
            style={{ flex: 1, textAlign: "left", padding: 6, background: "none", border: "none" }}
            onClick={() => onSelect(c.id)}
          >
            <div className="activity-title" style={{ fontWeight: 600 }}>{c.title}</div>
            <div className="activity-time text-tiny">{new Date(c.updatedAt).toLocaleString()}</div>
          </button>
          <button
            type="button"
            className="btn-icon btn-icon-danger clickable"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(c.id);
            }}
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
