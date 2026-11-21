// Speak or type a command; your own AI key proposes task actions; you approve each one.
import { useEffect, useRef, useState } from "react";
import { executeCommand, proposeCommands, type Command, type ExecResult } from "../../ai/commands";

type Status = "pending" | "done" | "failed" | "discarded";
interface Card {
  id: number;
  cmd: Command;
  status: Status;
  note?: string;
}

let seq = 0;

export default function CommandBox() {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [undo, setUndo] = useState<{ label: string; run: () => Promise<void> } | null>(null);
  const undoTimer = useRef<number | undefined>(undefined);

  async function run(prompt: string) {
    const p = prompt.trim();
    if (!p || busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    setCards([]);
    try {
      const res = await proposeCommands(p);
      setMessage(res.message);
      setCards(res.actions.map((cmd) => ({ id: ++seq, cmd, status: "pending" as Status })));
      if (res.actions.length === 0 && !res.message) setMessage("No action proposed.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    const h = (e: Event) => {
      const prompt = (e as CustomEvent<string>).detail;
      setText(prompt);
      void run(prompt);
    };
    window.addEventListener("panga-ai-command", h);
    return () => window.removeEventListener("panga-ai-command", h);
  });

  function patch(id: number, status: Status, note?: string) {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, status, note } : c)));
  }

  async function approve(card: Card) {
    try {
      const res: ExecResult = await executeCommand(card.cmd);
      patch(card.id, "done", res.summary);
      window.dispatchEvent(new CustomEvent("panga-data-updated"));
      if (res.undo) {
        const fn = res.undo;
        window.clearTimeout(undoTimer.current);
        setUndo({
          label: res.summary,
          run: async () => {
            await fn();
            window.dispatchEvent(new CustomEvent("panga-data-updated"));
            setUndo(null);
          },
        });
        undoTimer.current = window.setTimeout(() => setUndo(null), 12000);
      }
    } catch (e) {
      patch(card.id, "failed", e instanceof Error ? e.message : "Failed");
    }
  }

  const safePending = cards.filter((c) => c.status === "pending" && c.cmd.type !== "delete_task");

  return (
    <section className="pg-card">
      <div className="pg-capture-row">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void run(text);
            }
          }}
          rows={2}
          placeholder='✨ Tell Panga what to do: "add call Sam tomorrow, tick the invoice task, delete the dentist one"'
        />
        <button type="button" className="btn-primary" disabled={busy || !text.trim()} onClick={() => void run(text)}>
          {busy ? "…" : "Run"}
        </button>
      </div>
      {error && <p className="pg-error">{error}</p>}
      {message && <p className="pg-muted">{message}</p>}
      {cards.length > 0 && (
        <ul className="pg-list">
          {cards.map((c) => (
            <li key={c.id} className={`pg-row ${c.cmd.type === "delete_task" ? "pg-danger" : ""}`}>
              <span className="pg-grow">
                {c.cmd.description}
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
              for (const c of safePending) await approve(c);
            }}
          >
            Approve all (not deletes)
          </button>
        </div>
      )}
      {undo && (
        <p className="pg-muted">
          {undo.label}.{" "}
          <button type="button" className="btn-secondary btn-small" onClick={() => void undo.run()}>
            Undo
          </button>
        </p>
      )}
    </section>
  );
}
