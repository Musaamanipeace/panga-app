import { useEffect, useState, useCallback } from "react";
import {
  getAIProvider,
  setAIProvider,
  getAIApiKey,
  setAIApiKey,
  getAIModel,
  setAIModel,
  type AIProviderId,
} from "../data/settings";
import VoiceSettings from "../voice/VoiceSettings";
import InstallSettings from "../components/InstallSettings";
import {
  AI_PROVIDERS,
  fetchAvailableModels,
  filterFreeModels,
  type AIModelInfo,
} from "../ai/providers";
import AccountPanel from "../components/AccountPanel";
import ReadAloudSettings from "../speech/ReadAloudSettings";

const AI_PROVIDER_OPTIONS: { id: AIProviderId; label: string; hint: string }[] = [
  { id: "openrouter", label: "OpenRouter", hint: "Best free + paid (live model list)" },
  { id: "gemini", label: "Google Gemini", hint: "Free tier available" },
  { id: "openai", label: "OpenAI", hint: "GPT models (paid)" },
  { id: "anthropic", label: "Anthropic Claude", hint: "Claude models (paid)" },
  { id: "xai", label: "xAI Grok", hint: "Grok models (paid)" },
  { id: "groq", label: "Groq", hint: "Fast free tier" },
];

export default function Settings() {
  const [aiProvider, setAiProviderState] = useState<AIProviderId>("openrouter");
  const [aiApiKey, setAiApiKeyState] = useState("");
  const [aiModel, setAiModelState] = useState("");
  const [aiModels, setAiModels] = useState<AIModelInfo[]>([]);
  const [aiModelsLoading, setAiModelsLoading] = useState(false);
  const [aiModelsError, setAiModelsError] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [showFreeOnly, setShowFreeOnly] = useState(true);

  const loadSettings = useCallback(async () => {
    const prov = await getAIProvider();
    setAiProviderState(prov);
    const key = (await getAIApiKey(prov)) ?? "";
    setAiApiKeyState(key);
    const model = (await getAIModel(prov)) ?? "";
    setAiModelState(model);
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (!aiApiKey.trim()) {
      setAiModels([]);
      setAiModelsError(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setAiModelsLoading(true);
      setAiModelsError(null);
      try {
        const list = await fetchAvailableModels(aiProvider, aiApiKey.trim());
        if (!cancelled) setAiModels(list);
      } catch (e) {
        if (!cancelled) {
          setAiModels([]);
          setAiModelsError(e instanceof Error ? e.message : "Failed to load models");
        }
      } finally {
        if (!cancelled) setAiModelsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [aiProvider, aiApiKey]);

  async function handleSaveAi(e: React.FormEvent) {
    e.preventDefault();
    setAiStatus("saving");
    await setAIProvider(aiProvider);
    await setAIApiKey(aiProvider, aiApiKey.trim());
    if (aiModel.trim()) await setAIModel(aiProvider, aiModel.trim());
    setAiStatus("saved");
    setTimeout(() => setAiStatus("idle"), 2500);
  }

  async function handleProviderChange(id: AIProviderId) {
    setAiProviderState(id);
    const key = (await getAIApiKey(id)) ?? "";
    setAiApiKeyState(key);
    const model = (await getAIModel(id)) ?? "";
    setAiModelState(model);
    setShowFreeOnly(id === "openrouter" || id === "groq" || id === "gemini");
  }

  const displayedModels =
    showFreeOnly && (aiProvider === "openrouter" || aiProvider === "groq")
      ? filterFreeModels(aiModels)
      : aiModels;

  return (
    <div className="settings-page" style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 28 }}>
      <h1 style={{ margin: 0, fontSize: 24 }}>Settings</h1>

      <section className="settings-section" style={{ border: "1px solid var(--color-border)", borderRadius: 12, padding: 20 }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>AI assistant</h2>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--color-text-muted)" }}>
          Choose a provider and API key. Free models are loaded live from the provider — nothing is hard-coded.
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
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <label style={{ fontSize: 13, fontWeight: 600, flex: 1, minWidth: 200 }}>
              Model
              <select
                value={aiModel}
                onChange={(e) => setAiModelState(e.target.value)}
                disabled={aiModelsLoading || displayedModels.length === 0}
                style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px" }}
              >
                <option value="">
                  {aiModelsLoading
                    ? "Loading models…"
                    : displayedModels.length === 0
                      ? aiApiKey
                        ? "No models found — paste a valid key"
                        : "Enter API key to load models"
                      : "Select a model"}
                </option>
                {displayedModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name || m.id}
                    {m.isFree ? " (free)" : ""}
                    {m.contextLength ? ` · ${Math.round(m.contextLength / 1000)}k` : ""}
                  </option>
                ))}
              </select>
            </label>
            {(aiProvider === "openrouter" || aiProvider === "groq") && (
              <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6, marginTop: 18 }}>
                <input type="checkbox" checked={showFreeOnly} onChange={(e) => setShowFreeOnly(e.target.checked)} />
                Free only
              </label>
            )}
          </div>
          {aiModelsError && (
            <p style={{ margin: 0, fontSize: 12, color: "var(--color-accent-issue, #b91c1c)" }}>{aiModelsError}</p>
          )}
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
