import { useEffect, useState } from "react";
import { useVoicePrefs, setVoicePrefs } from "./prefs";
import { WHISPER_MODELS, LANGUAGES, type WhisperModelKey } from "./models";
import { isEngineSupported, probeServerEngine } from "./engines";
import { preloadWhisperModel } from "./engines/localWhisper";
import type { EngineId } from "./types";

const ENGINE_INFO: Record<EngineId, { title: string; detail: string }> = {
  local: {
    title: "On this device (offline, private)",
    detail:
      "Runs a speech model inside your browser. After a one-time download it works with no internet, and your voice never leaves this device. Text appears when you pause.",
  },
  browser: {
    title: "Browser speech recognition (needs internet)",
    detail:
      "Shows words as you speak. Your browser sends the audio to its maker's servers (Google for Chrome, Microsoft for Edge, Apple for Safari).",
  },
  server: {
    title: "Panga server",
    detail: "Sends audio to the Whisper server configured for this Panga deployment. Needs a connection to that server.",
  },
};

export default function VoiceSettings() {
  const prefs = useVoicePrefs();
  const [serverOk, setServerOk] = useState(false);
  const [dl, setDl] = useState<{ busy: boolean; progress: number | null; error: string | null }>({
    busy: false,
    progress: null,
    error: null,
  });

  useEffect(() => {
    void probeServerEngine().then(setServerOk);
  }, []);

  const engines: EngineId[] = serverOk ? ["local", "browser", "server"] : ["local", "browser"];
  const model = WHISPER_MODELS[prefs.model];
  const needsMultilingual = prefs.lang !== "en" && !model.multilingual;

  async function download(key: WhisperModelKey) {
    setDl({ busy: true, progress: null, error: null });
    try {
      await preloadWhisperModel(key, (p) => setDl({ busy: true, progress: p, error: null }));
      setDl({ busy: false, progress: null, error: null });
    } catch (e) {
      setDl({ busy: false, progress: null, error: e instanceof Error ? e.message : "Download failed" });
    }
  }

  return (
    <section className="settings-section">
      <h2>Voice Input</h2>
      <p className="settings-help">
        Click into any text box and press the mic that appears (or Alt+Shift+M) to dictate. Speech is inserted at your cursor
        and never replaces what you've already written.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {engines.map((id) => {
          const supported = isEngineSupported(id);
          return (
            <label
              key={id}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                padding: "10px 12px",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius)",
                opacity: supported ? 1 : 0.55,
                cursor: supported ? "pointer" : "not-allowed",
              }}
            >
              <input
                type="radio"
                name="voice-engine"
                checked={prefs.engine === id}
                disabled={!supported}
                onChange={() => setVoicePrefs({ engine: id })}
                style={{ marginTop: 3 }}
              />
              <span>
                <strong>{ENGINE_INFO[id].title}</strong>
                {!supported && <em style={{ marginLeft: 6, fontSize: 12 }}>(not supported in this browser)</em>}
                <span style={{ display: "block", fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 2 }}>
                  {ENGINE_INFO[id].detail}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 10 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
          Language
          <select value={prefs.lang} onChange={(e) => setVoicePrefs({ lang: e.target.value })}>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </label>

        {prefs.engine === "local" && (
          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
            Offline model
            <select
              value={prefs.model}
              onChange={(e) => setVoicePrefs({ model: e.target.value as WhisperModelKey })}
            >
              {(Object.keys(WHISPER_MODELS) as WhisperModelKey[]).map((k) => (
                <option key={k} value={k}>
                  {WHISPER_MODELS[k].label} · ~{WHISPER_MODELS[k].approxMb} MB
                  {prefs.ready[k] ? " · downloaded" : ""}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {prefs.engine === "local" && (
        <>
          <p className="settings-help" style={{ marginTop: 0 }}>
            {model.note}
            {needsMultilingual && (
              <strong style={{ color: "#b45309" }}>
                {" "}
                This model only understands English. Choose Base or Small for this language.
              </strong>
            )}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn-secondary clickable"
              disabled={dl.busy || !isEngineSupported("local")}
              onClick={() => void download(prefs.model)}
            >
              {dl.busy
                ? `Downloading… ${dl.progress === null ? "" : Math.round(dl.progress * 100) + "%"}`
                : prefs.ready[prefs.model]
                  ? "Re-check offline model"
                  : `Download for offline use (~${model.approxMb} MB)`}
            </button>
            {prefs.ready[prefs.model] && !dl.busy && (
              <span style={{ fontSize: 13, color: "green" }}>✓ Ready for offline use on this device</span>
            )}
            {dl.error && <span style={{ fontSize: 13, color: "#b91c1c" }}>{dl.error}</span>}
          </div>
          <p className="settings-help" style={{ marginBottom: 0 }}>
            Without this step the model downloads automatically the first time you dictate, so that first use needs internet.
          </p>
        </>
      )}

      <div style={{ marginTop: 14 }}>
        <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Try it here</label>
        <textarea
          rows={3}
          placeholder="Click here, press the mic that appears, and speak."
          style={{ width: "100%", boxSizing: "border-box" }}
        />
      </div>
    </section>
  );
}
