import { useEffect, useRef, useState, useCallback } from "react";
import {
  getAIProvider,
  setAIProvider,
  getAllAIApiKeys,
  setAIApiKey,
  type AIProviderId,
} from "../data/settings";
import VoiceSettings from "../voice/VoiceSettings";
import InstallSettings from "../components/InstallSettings";
import AccountPanel from "../components/AccountPanel";
import ReadAloudSettings from "../speech/ReadAloudSettings";

import { ensureDefaultWorkspaceTemplates } from "../data/workspaceTemplates";
import { showToast } from "../components/ui";
import NotificationSetup from "../components/settings/NotificationSetup";

const AI_PROVIDER_OPTIONS: { id: AIProviderId; label: string; hint: string }[] = [
  { id: "openrouter", label: "OpenRouter", hint: "Best free + paid" },
  { id: "gemini", label: "Google Gemini", hint: "Free tier available" },
  { id: "openai", label: "OpenAI", hint: "GPT models (paid)" },
  { id: "anthropic", label: "Anthropic Claude", hint: "Claude models (paid)" },
  { id: "xai", label: "xAI Grok", hint: "Grok models (paid)" },
  { id: "groq", label: "Groq", hint: "Fast free tier" },
];

const EMPTY_KEYS: Record<AIProviderId, string> = {
  openrouter: "",
  gemini: "",
  openai: "",
  anthropic: "",
  xai: "",
  groq: "",
};

export default function Settings() {
  const [activeProvider, setActiveProvider] = useState<AIProviderId>("openrouter");
  const [savedKeys, setSavedKeys] = useState<Record<AIProviderId, string>>(EMPTY_KEYS);
  const [draftKeys, setDraftKeys] = useState<Record<AIProviderId, string>>(EMPTY_KEYS);
  const [savingMap, setSavingMap] = useState<Partial<Record<AIProviderId, boolean>>>({});
  const [revealed, setRevealed] = useState<Partial<Record<AIProviderId, boolean>>>({});
  const [unlocked, setUnlocked] = useState<Partial<Record<AIProviderId, boolean>>>({});
  const timersRef = useRef<Partial<Record<AIProviderId, number>>>({});
  const revealTimersRef = useRef<Partial<Record<AIProviderId, number>>>({});
  const savedKeysRef = useRef(savedKeys);
  const activeProviderRef = useRef(activeProvider);

  useEffect(() => {
    savedKeysRef.current = savedKeys;
  }, [savedKeys]);

  useEffect(() => {
    activeProviderRef.current = activeProvider;
  }, [activeProvider]);

  const loadSettings = useCallback(async () => {
    const [prov, allKeys] = await Promise.all([getAIProvider(), getAllAIApiKeys()]);
    setActiveProvider(prov);
    setSavedKeys(allKeys);
    setDraftKeys(allKeys);
  }, []);

  useEffect(() => {
    void loadSettings();
    const onUpdated = () => void loadSettings();
    window.addEventListener("panga-data-updated", onUpdated);
    return () => {
      window.removeEventListener("panga-data-updated", onUpdated);
      for (const id of Object.keys(timersRef.current) as AIProviderId[]) {
        const t = timersRef.current[id];
        if (t !== undefined) window.clearTimeout(t);
      }
      for (const id of Object.keys(revealTimersRef.current) as AIProviderId[]) {
        const rt = revealTimersRef.current[id];
        if (rt !== undefined) window.clearTimeout(rt);
      }
    };
  }, [loadSettings]);

  const persistProviderKey = useCallback(async (id: AIProviderId, rawValue: string) => {
    const pendingTimer = timersRef.current[id];
    if (pendingTimer !== undefined) {
      window.clearTimeout(pendingTimer);
      delete timersRef.current[id];
    }

    const clean = rawValue.trim();
    setSavingMap((prev) => ({ ...prev, [id]: true }));
    try {
      await setAIApiKey(id, clean);
      savedKeysRef.current = { ...savedKeysRef.current, [id]: clean };
      setSavedKeys((prev) => ({ ...prev, [id]: clean }));
      setDraftKeys((prev) => ({ ...prev, [id]: clean }));

      const currentActive = activeProviderRef.current;
      const currentActiveKey = savedKeysRef.current[currentActive];
      if (clean && !currentActiveKey) {
        await setAIProvider(id);
        activeProviderRef.current = id;
        setActiveProvider(id);
      }
    } finally {
      setSavingMap((prev) => ({ ...prev, [id]: false }));
    }
  }, []);

  function handleDraftChange(id: AIProviderId, nextValue: string) {
    setDraftKeys((prev) => ({ ...prev, [id]: nextValue }));
    const existing = timersRef.current[id];
    if (existing !== undefined) window.clearTimeout(existing);

    const trimmed = nextValue.trim();
    if (trimmed) {
      timersRef.current[id] = window.setTimeout(() => {
        void persistProviderKey(id, nextValue);
      }, 250);
    }
  }

  function handlePeekKey(id: AIProviderId) {
    const existing = revealTimersRef.current[id];
    if (existing !== undefined) {
      window.clearTimeout(existing);
      delete revealTimersRef.current[id];
    }

    if (revealed[id]) {
      setRevealed((prev) => ({ ...prev, [id]: false }));
      return;
    }

    setRevealed((prev) => ({ ...prev, [id]: true }));
    revealTimersRef.current[id] = window.setTimeout(() => {
      delete revealTimersRef.current[id];
      setRevealed((prev) => ({ ...prev, [id]: false }));
    }, 4000);
  }

  async function handleSelectActive(id: AIProviderId) {
    activeProviderRef.current = id;
    setActiveProvider(id);
    await setAIProvider(id);
  }

  async function handleClearKey(id: AIProviderId) {
    const rt = revealTimersRef.current[id];
    if (rt !== undefined) {
      window.clearTimeout(rt);
      delete revealTimersRef.current[id];
    }
    setRevealed((prev) => ({ ...prev, [id]: false }));
    await persistProviderKey(id, "");
  }

  return (
    <div className="settings-page" style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 96px", display: "flex", flexDirection: "column", gap: 28 }}>
      <h1 style={{ margin: 0, fontSize: 24 }}>Settings</h1>

      <section className="settings-section" style={{ border: "1px solid var(--color-border)", borderRadius: 12, padding: 20 }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>AI assistant</h2>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--color-text-muted)" }}>
          Enter an API key for any provider below. Entered keys save automatically on this device and are included in your JSON backup.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {AI_PROVIDER_OPTIONS.map((p) => {
            const saved = savedKeys[p.id];
            const draft = draftKeys[p.id];
            const isSaving = Boolean(savingMap[p.id]);
            const isActive = activeProvider === p.id;
            const hasSaved = Boolean(saved);
            const isDirty = draft.trim() !== saved;
            const isRevealed = Boolean(revealed[p.id]);
            const isUnlocked = Boolean(unlocked[p.id]);

            const statusLabel = isSaving
              ? "Saving…"
              : hasSaved && !isDirty
                ? "Saved"
                : isDirty && draft.trim()
                  ? "Unsaved"
                  : "Not saved";

            const statusColor = isSaving
              ? "var(--color-text-muted)"
              : hasSaved && !isDirty
                ? "#15803d"
                : isDirty && draft.trim()
                  ? "#b45309"
                  : "var(--color-text-muted)";

            return (
              <form
                key={p.id}
                data-provider={p.id}
                autoComplete="off"
                onSubmit={(e) => {
                  e.preventDefault();
                  void persistProviderKey(p.id, draft);
                }}
                style={{
                  border: `1px solid ${isActive ? "var(--color-accent-primary)" : "var(--color-border)"}`,
                  borderRadius: 10,
                  padding: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="active-ai-provider"
                      checked={isActive}
                      onChange={() => void handleSelectActive(p.id)}
                    />
                    <span>{p.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 400, color: "var(--color-text-muted)" }}>— {p.hint}</span>
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {isActive && (
                      <span className="chip-small" style={{ fontSize: 11, fontWeight: 600 }}>
                        Active
                      </span>
                    )}
                    <span
                      data-testid={`ai-status-${p.id}`}
                      style={{ fontSize: 12, fontWeight: 600, color: statusColor }}
                    >
                      {statusLabel}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <input
                    type={draft.length === 0 || isRevealed ? "text" : "password"}
                    name={`panga_ai_token_${p.id}`}
                    aria-label={`${p.label} API key`}
                    value={draft}
                    readOnly={!isUnlocked}
                    onPointerDown={() => {
                      if (!isUnlocked) setUnlocked((prev) => ({ ...prev, [p.id]: true }));
                    }}
                    onFocus={() => {
                      if (!isUnlocked) setUnlocked((prev) => ({ ...prev, [p.id]: true }));
                    }}
                    onChange={(e) => handleDraftChange(p.id, e.target.value)}
                    onBlur={() => {
                      if (draft.trim() && draft.trim() !== saved) {
                        void persistProviderKey(p.id, draft);
                      }
                    }}
                    placeholder={`${p.label} API key`}
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-bwignore="true"
                    data-form-type="other"
                    spellCheck={false}
                    style={{ flex: "1 1 240px", padding: "8px 10px" }}
                  />
                  {draft.trim() && (
                    <button
                      type="button"
                      className="btn-secondary btn-small clickable"
                      aria-label={isRevealed ? `Hide ${p.label} API key` : `View ${p.label} API key`}
                      aria-pressed={isRevealed}
                      data-tip={isRevealed ? "Visible briefly (auto-hides)" : "View key (auto-hides)"}
                      onClick={() => handlePeekKey(p.id)}
                      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 38, padding: "6px 10px" }}
                    >
                      {isRevealed ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                          <path d="m1 1 22 22" />
                          <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  )}
                  <button
                    type="submit"
                    className="btn-primary btn-small clickable"
                    disabled={isSaving || (!isDirty && hasSaved)}
                  >
                    {hasSaved && !isDirty ? "Saved" : "Save"}
                  </button>
                  {hasSaved && (
                    <button
                      type="button"
                      className="btn-secondary btn-small clickable"
                      disabled={isSaving}
                      onClick={() => void handleClearKey(p.id)}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </form>
            );
          })}
        </div>
      </section>

      <section className="settings-section" style={{ border: "1px solid var(--color-border)", borderRadius: 12, padding: 20 }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>Workspace templates</h2>
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--color-text-muted)" }}>
          Restore deleted default starter workspaces (Developer, Daily routine, Social events) without overwriting any existing workspaces.
        </p>
        <button
          type="button"
          className="btn-secondary btn-small clickable"
          onClick={() => {
            void ensureDefaultWorkspaceTemplates({ forceRestore: true }).then(({ restored }) => {
              showToast(
                restored.length > 0
                  ? `Restored templates: ${restored.join(", ")}`
                  : "All starter templates are already present.",
                "info"
              );
            });
          }}
        >
          Restore default templates
        </button>
      </section>

      <AccountPanel />
      <NotificationSetup />
      <ReadAloudSettings />
      <VoiceSettings />
      <InstallSettings />
    </div>
  );
}
