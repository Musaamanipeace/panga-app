import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { chatCompletion, type ChatMessage } from "../ai/chat";
import {
  buildProofreadSystemPrompt,
  parseProofreadReply,
  type ProofreadMode,
} from "../proofread/prompt";
import { copyToClipboard } from "./ui";

interface Props {
  initialText?: string;
  onApply?: (correctedText: string) => void;
  onClose?: () => void;
}

interface ClarifyState {
  question: string;
  options: string[];
  originalText: string;
  mode: ProofreadMode;
  history: ChatMessage[];
}

export default function Proofread({ initialText = "", onApply, onClose }: Props) {
  const [text, setText] = useState(initialText);
  const [locked, setLocked] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [copied, setCopied] = useState(false);
  const [busyMode, setBusyMode] = useState<ProofreadMode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clarify, setClarify] = useState<ClarifyState | null>(null);
  const [customAnswer, setCustomAnswer] = useState("");

  async function runProofread(mode: ProofreadMode) {
    if (!text.trim() || busyMode) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setError("You are offline. Proofread needs an internet connection and your AI key in Settings.");
      return;
    }

    setBusyMode(mode);
    setError(null);
    setClarify(null);

    const originalText = text;
    const messages: ChatMessage[] = [{ role: "user", content: originalText }];

    try {
      const res = await chatCompletion(messages, {
        system: buildProofreadSystemPrompt(mode),
      });
      if (!res.text.trim()) {
        throw new Error("Empty response returned by the AI model.");
      }
      const parsed = parseProofreadReply(res.text);
      if (parsed.kind === "clarify") {
        setClarify({
          question: parsed.question,
          options: parsed.options,
          originalText,
          mode,
          history: [...messages, { role: "assistant", content: res.text }],
        });
      } else {
        setText(parsed.text);
        setLocked(true);
        setHasResult(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not proofread this text.");
    } finally {
      setBusyMode(null);
    }
  }

  async function submitClarification(answer: string) {
    const clean = answer.trim();
    if (!clean || !clarify || busyMode) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setError("You are offline. Proofread needs an internet connection and your AI key in Settings.");
      return;
    }

    setBusyMode(clarify.mode);
    setError(null);

    const messages: ChatMessage[] = [
      ...clarify.history,
      { role: "user", content: `Original text:\n${clarify.originalText}\n\nClarification: ${clean}` },
    ];

    try {
      const res = await chatCompletion(messages, {
        system: buildProofreadSystemPrompt(clarify.mode),
      });
      if (!res.text.trim()) {
        throw new Error("Empty response returned by the AI model.");
      }
      const parsed = parseProofreadReply(res.text);
      if (parsed.kind === "clarify") {
        setClarify({
          question: parsed.question,
          options: parsed.options,
          originalText: clarify.originalText,
          mode: clarify.mode,
          history: [...messages, { role: "assistant", content: res.text }],
        });
        setCustomAnswer("");
      } else {
        setText(parsed.text);
        setLocked(true);
        setHasResult(true);
        setClarify(null);
        setCustomAnswer("");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not complete proofreading.");
    } finally {
      setBusyMode(null);
    }
  }

  async function handleCopy() {
    if (!text) return;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  const missingKey = error && /API key|model selected/i.test(error);

  return (
    <form
      className="proofread-tool"
      onSubmit={(e) => {
        e.preventDefault();
        if (!locked) void runProofread("grammar");
      }}
      style={{ display: "flex", flexDirection: "column", gap: 10 }}
    >
      <textarea
        className="pg-wide"
        rows={8}
        value={text}
        readOnly={locked}
        aria-label="Text to proofread"
        placeholder="Paste or type text to check grammar and spelling…"
        onChange={(e) => {
          setText(e.target.value);
          if (hasResult) setHasResult(false);
        }}
        style={{
          margin: 0,
          padding: "10px 12px",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--color-border)",
          background: locked ? "var(--color-bg-subtle)" : "var(--color-bg)",
          fontFamily: "inherit",
          fontSize: 14,
          lineHeight: 1.55,
          resize: "vertical",
        }}
      />

      {error && (
        <p className="pg-error" role="alert" style={{ margin: 0 }}>
          {error}{" "}
          {missingKey && (
            <Link to="/settings" style={{ color: "var(--color-accent-primary)" }} onClick={onClose}>
              Open Settings
            </Link>
          )}
        </p>
      )}

      {clarify && (
        <div
          role="region"
          aria-label="Clarification needed"
          style={{
            padding: 12,
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--color-accent-milestone)",
            background: "#fffbeb",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "pre-wrap" }}>
            {clarify.question}
          </div>
          {clarify.options.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {clarify.options.map((opt, idx) => (
                <button
                  key={`${idx}-${opt}`}
                  type="button"
                  className="btn-secondary btn-small clickable"
                  disabled={busyMode !== null}
                  onClick={() => void submitClarification(opt)}
                >
                  {idx + 1}. {opt}
                </button>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="text"
              value={customAnswer}
              onChange={(e) => setCustomAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void submitClarification(customAnswer);
                }
              }}
              placeholder="Or type your own spelling or answer…"
              aria-label="Custom clarification"
              disabled={busyMode !== null}
              style={{
                flex: "1 1 200px",
                padding: "6px 10px",
                fontSize: 13,
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border)",
              }}
            />
            <button
              type="button"
              className="btn-primary btn-small clickable"
              disabled={busyMode !== null || !customAnswer.trim()}
              onClick={() => void submitClarification(customAnswer)}
            >
              Send answer
            </button>
          </div>
        </div>
      )}

      <div className="pg-actions" style={{ margin: 0 }}>
        <button
          type="submit"
          className="btn-primary clickable"
          disabled={busyMode !== null || !text.trim() || locked}
        >
          {busyMode === "grammar" ? "Checking…" : "Grammar & spelling"}
        </button>
        <button
          type="button"
          className="btn-secondary clickable"
          disabled={busyMode !== null || !text.trim() || locked}
          onClick={() => void runProofread("formatting")}
        >
          {busyMode === "formatting" ? "Formatting…" : "Formatting"}
        </button>

        {hasResult && locked && (
          <>
            <button
              type="button"
              className="btn-secondary clickable"
              onClick={() => void handleCopy()}
            >
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              type="button"
              className="btn-secondary clickable"
              onClick={() => setLocked(false)}
            >
              Edit
            </button>
          </>
        )}

        {onApply && (
          <button
            type="button"
            className="btn-primary clickable"
            disabled={!text.trim() || busyMode !== null}
            onClick={() => onApply(text)}
            style={{ marginLeft: "auto" }}
          >
            Use text
          </button>
        )}
      </div>
    </form>
  );
}

export function ProofreadTrigger({
  value,
  onApply,
  className = "btn-secondary btn-small clickable",
}: {
  value: string;
  onApply: (next: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => setOpen(true)}
        data-tip="Check grammar, spelling, or formatting"
      >
        Proofread
      </button>
      {open &&
        createPortal(
          <div
            className="modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label="Proofread"
            onClick={() => setOpen(false)}
            style={{ zIndex: 9600 }}
          >
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <header className="modal-header">
                <span>Proofread</span>
                <button
                  type="button"
                  className="btn-secondary btn-small clickable"
                  onClick={() => setOpen(false)}
                >
                  Close
                </button>
              </header>
              <div className="modal-body">
                <Proofread
                  initialText={value}
                  onApply={(next) => {
                    onApply(next);
                    setOpen(false);
                  }}
                  onClose={() => setOpen(false)}
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
