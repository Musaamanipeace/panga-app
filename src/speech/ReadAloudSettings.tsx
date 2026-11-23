import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  analyzeVoiceStatus,
  detectDeviceOs,
  getTtsPlayback,
  getVoiceStatus,
  isTtsSupported,
  loadTtsPrefs,
  saveTtsPrefs,
  speak,
  stopSpeaking,
  subscribeTtsPlayback,
  type DeviceOs,
  type TtsPrefs,
  type VoiceStatus,
} from "./tts";
import { showToast } from "../components/ui";

const OS_STEPS: Record<DeviceOs, { label: string; steps: string[] }> = {
  android: {
    label: "Android",
    steps: [
      "Open your device Settings.",
      "Go to Accessibility -> Text-to-speech output (or General management -> Text-to-speech).",
      "Choose your preferred engine (such as Speech Recognition and Synthesis from Google) and tap its gear icon.",
      "Open Install voice data, choose your language, and download an offline voice.",
      "Come back here and press Recheck.",
    ],
  },
  iphone: {
    label: "iPhone / iPad",
    steps: [
      "Open the iPhone Settings app.",
      "Go to Accessibility -> Spoken Content -> Voices.",
      "Select your language and download a voice for offline use.",
      "Come back here and press Recheck.",
    ],
  },
  windows: {
    label: "Windows",
    steps: [
      "Open Windows Settings.",
      "Go to Time & language -> Speech.",
      "Under Manage voices, select Add voices and install your language.",
      "Restart your browser if needed, then press Recheck.",
    ],
  },
  mac: {
    label: "Mac",
    steps: [
      "Open System Settings.",
      "Go to Accessibility -> Spoken Content.",
      "Click System Voice -> Manage Voices and download an offline voice for your language.",
      "Come back here and press Recheck.",
    ],
  },
};

export default function ReadAloudSettings() {
  const location = useLocation();
  const cardRef = useRef<HTMLElement>(null);
  const testOwnerId = useId();

  const [ttsPrefs, setTtsPrefsState] = useState<TtsPrefs>(loadTtsPrefs);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>(() =>
    analyzeVoiceStatus([], { supported: isTtsSupported() }),
  );
  const [checking, setChecking] = useState(false);
  const [selectedOs, setSelectedOs] = useState<DeviceOs>(() => detectDeviceOs());
  const [testing, setTesting] = useState(false);

  const recheck = useCallback(async (waitIfEmpty = true) => {
    setChecking(true);
    try {
      const result = await getVoiceStatus(waitIfEmpty);
      setVoices(result.voices);
      setVoiceStatus(result.status);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void getVoiceStatus(true).then((result) => {
      if (cancelled) return;
      setVoices(result.voices);
      setVoiceStatus(result.status);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const sync = () => {
      const snap = getTtsPlayback();
      setTesting(snap.ownerId === testOwnerId && snap.status !== "idle");
    };
    sync();
    return subscribeTtsPlayback(sync);
  }, [testOwnerId]);

  useEffect(() => {
    if (location.hash === "#read-aloud") {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

  function setTtsPrefs(next: TtsPrefs) {
    setTtsPrefsState(next);
    saveTtsPrefs(next);
    setVoiceStatus(
      analyzeVoiceStatus(voices, {
        supported: isTtsSupported(),
        preferredVoiceURI: next.voiceURI,
      }),
    );
  }

  async function handleTestVoice() {
    if (testing) {
      stopSpeaking();
      return;
    }
    if (!isTtsSupported()) {
      showToast("Read-aloud is not supported in this browser.", "error");
      return;
    }
    await speak("Panga read-aloud is working.", {
      ownerId: testOwnerId,
      onError: (msg) => showToast(msg, "error"),
      onNoLocalVoice: (s) => {
        if (s.kind === "no-voices") {
          showToast("No voices found on this device. Follow the steps below to add one.", "info");
        }
      },
    });
  }

  const osInfo = OS_STEPS[selectedOs];
  const statusColor =
    voiceStatus.kind === "ready"
      ? "#166534"
      : voiceStatus.kind === "online-only"
        ? "#92400e"
        : "#991b1b";

  return (
    <section
      id="read-aloud"
      ref={cardRef}
      className="settings-section"
      style={{ border: "1px solid var(--color-border)", borderRadius: 12, padding: 20 }}
    >
      <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>Read aloud</h2>
      <p className="settings-help" style={{ marginTop: 0 }}>
        Read buttons on notes, thoughts, PDFs and insights use your device's built-in speech voices.
      </p>

      <div
        style={{
          padding: "10px 12px",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--color-border)",
          marginBottom: 14,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14 }}>
            <strong>Voice status:</strong>{" "}
            <span style={{ color: statusColor, fontWeight: 600 }}>{voiceStatus.label}</span>
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="btn-secondary btn-small clickable"
              onClick={() => void handleTestVoice()}
              disabled={!isTtsSupported()}
            >
              {testing ? "Stop test" : "Test voice"}
            </button>
            <button
              type="button"
              className="btn-secondary btn-small clickable"
              onClick={() => void recheck(false)}
              disabled={checking || !isTtsSupported()}
            >
              {checking ? "Checking…" : "Recheck"}
            </button>
          </div>
        </div>
        {voiceStatus.otherLanguageOnly && (
          <p style={{ margin: 0, fontSize: 13, color: "#92400e" }}>
            Your only offline voices are in another language ({voiceStatus.voice?.lang}) than your browser language ({voiceStatus.userLang}).
          </p>
        )}
        {voiceStatus.kind === "online-only" && (
          <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>
            Only online voices were found, so reading may pause or stop offline.
          </p>
        )}
        {voiceStatus.kind === "no-voices" && (
          <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>
            No speech voices were reported by this browser.
          </p>
        )}
        {voiceStatus.kind === "not-supported" && (
          <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>
            Speech synthesis is not supported in this browser.
          </p>
        )}
      </div>

      {isTtsSupported() && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 16 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, flex: 1, minWidth: 180 }}>
            Voice
            <select
              value={ttsPrefs.voiceURI ?? ""}
              onChange={(e) => setTtsPrefs({ ...ttsPrefs, voiceURI: e.target.value || null })}
            >
              <option value="">System default</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang}){v.localService ? " · local" : ""}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, minWidth: 140 }}>
            Rate ({ttsPrefs.rate.toFixed(1)}×)
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.1}
              value={ttsPrefs.rate}
              onChange={(e) => setTtsPrefs({ ...ttsPrefs, rate: Number(e.target.value) })}
            />
          </label>
        </div>
      )}

      <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 14 }}>
        <h3 style={{ margin: "0 0 6px", fontSize: 15 }}>Offline voice setup instructions</h3>
        <p className="settings-help" style={{ marginTop: 0 }}>
          A web page cannot open your device settings directly. Follow these steps on your device, then press Recheck:
        </p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          {(["android", "iphone", "windows", "mac"] as DeviceOs[]).map((os) => (
            <button
              key={os}
              type="button"
              className={`chip clickable ${selectedOs === os ? "chip-active" : ""}`}
              onClick={() => setSelectedOs(os)}
            >
              {OS_STEPS[os].label}
            </button>
          ))}
        </div>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.6 }}>
          {osInfo.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
    </section>
  );
}
