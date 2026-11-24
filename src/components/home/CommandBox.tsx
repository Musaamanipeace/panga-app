// Speak or type any workspace command; your own AI key proposes actions; every write asks approval first and supports Undo.
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  executeAgentAction,
  isDestructiveAction,
  notifyWorkspaceUpdated,
  runAgentTurn,
  type AgentAction,
} from "../../ai/agent";
import type { ChatMessage } from "../../ai/chat";

type Status = "pending" | "done" | "failed" | "discarded";

interface Card {
  id: number;
  action: AgentAction;
  destructive: boolean;
  status: Status;
  note?: string;
}

interface UndoEntry {
  id: number;
  label: string;
  undo: () => Promise<void>;
}

let seq = 0;

export default function CommandBox() {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [clarify, setClarify] = useState<{ question: string; options: string[] } | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [undoEntries, setUndoEntries] = useState<UndoEntry[]>([]);
  const historyRef = useRef<ChatMessage[]>([]);
  const runRef = useRef<(prompt: string, resetHistory?: boolean) => Promise<void>>(async () => {});

  const navigate = useNavigate();
  const location = useLocation();

  async function run(prompt: string, resetHistory = true) {
    const p = prompt.trim();
    if (!p || busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    setClarify(null);
    setCards([]);

    const baseHistory: ChatMessage[] = resetHistory ? [] : historyRef.current;
    const nextMessages: ChatMessage[] = [...baseHistory, { role: "user", content: p }];

    try {
      const currentRoute = `${location.pathname}${location.search}`;
      const res = await runAgentTurn(nextMessages, currentRoute, navigate);

      if (res.clarify) {
        historyRef.current = nextMessages;
        setClarify(res.clarify);
        return;
      }

      const display = [res.cleanText, res.uiSummaries.length ? `(${res.uiSummaries.join(" · ")})` : ""]
        .filter(Boolean)
        .join("\n\n");

      historyRef.current = display
        ? [...nextMessages, { role: "assistant", content: display }]
        : nextMessages;

      setMessage(display);
      setCards(
        res.actions.map((action) => ({
          id: ++seq,
          action,
          destructive: isDestructiveAction(action.type),
          status: "pending" as Status,
        }))
      );

      if (res.actions.length === 0 && !display) {
        setMessage("No action proposed.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    runRef.current = run;
  });

  useEffect(() => {
    const h = (e: Event) => {
      const prompt = (e as CustomEvent<string>).detail;
      setText(prompt);
      void runRef.current(prompt, true);
    };
    window.addEventListener("panga-ai-command", h);
    return () => window.removeEventListener("panga-ai-command", h);
  }, []);

  function patch(id: number, status: Status, note?: string) {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, status, note } : c)));
  }

  async function approve(card: Card): Promise<boolean> {
    try {
      const exec = await executeAgentAction(card.action);
      patch(card.id, "done", exec.summary);
      notifyWorkspaceUpdated();
      if (exec.undo) {
        const undoFn = exec.undo;
        setUndoEntries((prev) => [{ id: ++seq, label: exec.summary, undo: undoFn }, ...prev].slice(0, 6));
      }
      return true;
    } catch (e) {
      patch(card.id, "failed", e instanceof Error ? e.message : "Failed");
      return false;
    }
  }

  async function runUndo(entry: UndoEntry) {
    try {
      await entry.undo();
      notifyWorkspaceUpdated();
      setUndoEntries((prev) => prev.filter((u) => u.id !== entry.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not undo that action.");
    }
  }

  const safePending = cards.filter((c) => c.status === "pending" && !c.destructive);

  return (
    <section className="pg-card">
      <div className="pg-capture-row">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void run(text, true);
            }
          }}
          rows={2}
          placeholder='✨ Tell Panga what to do: "create a task list folder clean, add list compound, and add tasks sweep, mop, dig"'
        />
        <button type="button" className="btn-primary" disabled={busy || !text.trim()} onClick={() => void run(text, true)}>
          {busy ? "…" : "Run"}
        </button>
      </div>
      {error && <p className="pg-error">{error}</p>}
      {message && <p className="pg-muted" style={{ whiteSpace: "pre-wrap" }}>{message}</p>}
      {clarify && (
        <div className="clarify-box" role="alertdialog" aria-label="Clarification needed">
          <p className="clarify-prompt">{clarify.question}</p>
          <div className="clarify-options">
            {clarify.options.map((opt) => (
              <button
                key={opt}
                type="button"
                className="btn-secondary btn-small clickable"
                onClick={() => void run(`[Selected: ${opt}]`, false)}
              >
                {opt}
              </button>
            ))}
            <button
              type="button"
              className="btn-secondary btn-small clickable"
              onClick={() => setClarify(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      {cards.length > 0 && (
        <ul className="pg-list">
          {cards.map((c) => (
            <li key={c.id} className={`pg-row ${c.destructive ? "pg-danger" : ""}`}>
              <span className="pg-grow">
                {c.action.description}
                {c.note && <span className={c.status === "failed" ? "pg-error" : "pg-muted"}> · {c.note}</span>}
              </span>
              {c.status === "pending" ? (
                <>
                  <button type="button" className="btn-primary btn-small" onClick={() => void approve(c)}>
                    Approve
                  </button>
                  <button type="button" className="btn-secondary btn-small" onClick={() => patch(c.id, "discarded")}>
                    Discard
                  </button>
                </>
              ) : (
                <span className="chip-small">{c.status}</span>
              )}
            </li>
          ))}
        </ul>
      )}
      {safePending.length > 1 && (
        <div className="pg-actions">
          <button
            type="button"
            className="btn-secondary btn-small"
            onClick={async () => {
              for (const c of safePending) {
                const ok = await approve(c);
                if (!ok) break;
              }
            }}
          >
            Approve all ({safePending.length})
          </button>
        </div>
      )}
      {undoEntries.length > 0 && (
        <ul className="pg-list" style={{ marginTop: 8 }}>
          {undoEntries.slice(0, 3).map((u) => (
            <li key={u.id} className="pg-row">
              <span className="pg-muted pg-grow">{u.label}</span>
              <button type="button" className="btn-secondary btn-small" onClick={() => void runUndo(u)}>
                Undo
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
