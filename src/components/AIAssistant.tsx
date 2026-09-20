import { useState } from "react";
import MicButton from "./MicButton";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const PLACEHOLDER_REPLY =
  "I'm not connected to a real AI model yet — that wiring happens in a later stage. " +
  "Once connected, I'll be able to see this project's docs, tasks and resources and answer " +
  "with real context, help schedule your day, and pull up the links you need.";

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text };
    const replyMsg: Message = { id: crypto.randomUUID(), role: "assistant", text: PLACEHOLDER_REPLY };
    setMessages((m) => [...m, userMsg, replyMsg]);
    setInput("");
  }

  return (
    <>
      <button className="ai-fab" onClick={() => setOpen((o) => !o)} aria-label="AI Assistant">
        🤖
      </button>

      {open && (
        <div className="ai-panel">
          <header className="ai-panel-header">
            <span>Assistant</span>
            <button onClick={() => setOpen(false)} aria-label="Close">✕</button>
          </header>

          <div className="ai-panel-messages">
            {messages.length === 0 ? (
              <p className="empty-state">
                Ask about anything in this project — docs, tasks, resources, or your schedule.
              </p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`ai-msg ai-msg-${m.role}`}>
                  {m.text}
                </div>
              ))
            )}
          </div>

          <form className="ai-panel-input" onSubmit={send}>
            <input
              type="text"
              placeholder="Ask the assistant..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <MicButton onResult={(text) => setInput(text)} />
            <button type="submit" className="btn-primary">Send</button>
          </form>
        </div>
      )}
    </>
  );
}
