import { useEffect, useState, useCallback } from "react";
import {
  getAIProvider,
  setAIProvider,
  getAIApiKey,
  setAIApiKey,
  type AIProviderId,
} from "../data/settings";
import VoiceSettings from "../voice/VoiceSettings";
import InstallSettings from "../components/InstallSettings";
import { AI_PROVIDERS } from "../ai/providers";
import AccountPanel from "../components/AccountPanel";
import ReadAloudSettings from "../speech/ReadAloudSettings";

const AI_PROVIDER_OPTIONS: { id: AIProviderId; label: string; hint: string }[] = [
  { id: "openrouter", label: "OpenRouter", hint: "Best free + paid" },
  { id: "gemini", label: "Google Gemini", hint: "Free tier available" },
  { id: "openai", label: "OpenAI", hint: "GPT models (paid)" },
  { id: "anthropic", label: "Anthropic Claude", hint: "Claude models (paid)" },
  { id: "xai", label: "xAI Grok", hint: "Grok models (paid)" },
  { id: "groq", label: "Groq", hint: "Fast free tier" },
];

export default function Settings() {
  const [aiProvider, setAiProviderState] = useState<AIProviderId>("openrouter");
  const [aiApiKey, setAiApiKeyState] = useState("");
  const [aiStatus, setAiStatus] = useState<"idle" | "saving" | "saved">("idle");

  const loadSettings = useCallback(async () => {
    const prov = await getAIProvider();
    setAiProviderState(prov);
    const key = (await getAIApiKey(prov)) ?? "";
    setAiApiKeyState(key);
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  async function handleSaveAi(e: React.FormEvent) {
    e.preventDefault();
    setAiStatus("saving");
    await setAIProvider(aiProvider);
    await setAIApiKey(aiProvider, aiApiKey.trim());
    setAiStatus("saved");
    setTimeout(() => setAiStatus("idle"), 2500);
  }

  async function handleProviderChange(id: AIProviderId) {
    setAiProviderState(id);
    const key = (await getAIApiKey(id)) ?? "";
    setAiApiKeyState(key);
  }

  return (
    <div className="settings-page" style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 28 }}>
      <h1 style={{ margin: 0, fontSize: 24 }}>Settings</h1>

      <section className="settings-section" style={{ border: "1px solid var(--color-border)", borderRadius: 12, padding: 20 }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>AI assistant</h2>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--color-text-muted)" }}>
          Choose a provider and enter your API key.
        </p>
        <form onSubmit={handleSaveAi} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 600 }}>
            Provider
            <select
              value={aiProvider}
              onChange={(e) => void handleProviderChange(e.target.value as AIProviderId)}
              style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px" }}
            >
              {AI_PROVIDER_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label} — {o.hint}
                </option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: 13, fontWeight: 600 }}>
            API key
            <input
              type="password"
              value={aiApiKey}
              onChange={(e) => setAiApiKeyState(e.target.value)}
              placeholder={`${AI_PROVIDERS[aiProvider].label} API key`}
              autoComplete="off"
              style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px" }}
            />
          </label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button type="submit" className="btn-primary btn-small clickable" disabled={aiStatus === "saving"}>
              {aiStatus === "saving" ? "Saving…" : aiStatus === "saved" ? "Saved" : "Save AI settings"}
            </button>
            <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Stored only on this device (IndexedDB).</span>
          </div>
        </form>
      </section>

      <AccountPanel />
      <ReadAloudSettings />
      <VoiceSettings />
      <InstallSettings />
    </div>
  );
}
