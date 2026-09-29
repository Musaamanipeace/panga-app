import { useState } from "react";
import { sendOtp, verifyOtp, getStoredEmailJsConfig, saveStoredEmailJsConfig, type EmailJsConfig } from "../auth/otp";
import { setSession } from "../auth/session";

type Step = "email" | "otp";

export default function Landing() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [pressed, setPressed] = useState(false);
  const [sending, setSending] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [authMode, setAuthMode] = useState<"dev" | "real">(() => {
    return (localStorage.getItem("panga_auth_mode") as "dev" | "real") || "dev";
  });

  const [emailJsConfig, setEmailJsConfig] = useState<EmailJsConfig>(() => getStoredEmailJsConfig());
  const [showConfig, setShowConfig] = useState(false);

  function handleModeChange(mode: "dev" | "real") {
    setAuthMode(mode);
    localStorage.setItem("panga_auth_mode", mode);
    setError(null);
    setSuccessNotice(null);
  }

  function handleConfigChange(field: keyof EmailJsConfig, value: string) {
    const updated = { ...emailJsConfig, [field]: value };
    setEmailJsConfig(updated);
    saveStoredEmailJsConfig(updated);
  }

  async function handleLoginClick(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setPressed(true);
    setTimeout(() => setPressed(false), 80);
    setError(null);
    setSuccessNotice(null);
    setSending(true);

    const result = await sendOtp(email.trim(), {
      mode: authMode,
      customConfig: emailJsConfig,
    });

    setSending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.devCode) {
      setDevCode(result.devCode);
    } else {
      setDevCode(null);
      setSuccessNotice(result.successMessage || `Code sent to ${email.trim()}`);
    }

    setStep("otp");
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!otp.trim()) return;
    if (!verifyOtp(email.trim(), otp.trim())) {
      setError("That code didn't match (or expired). Try again.");
      return;
    }
    setSession(email.trim());
    // Reload so the IndexedDB database is recreated for the new user
    window.location.assign("/dashboard");
  }

  return (
    <div className="page landing">
      <div className="landing-mark" data-tip="Panga">P</div>
      <h1>Panga</h1>
      <p>Project &amp; resource planner.</p>

      {/* Auth mode toggle */}
      <div
        className="auth-mode-container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          margin: "16px 0 20px 0",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            type="button"
            className={`chip ${authMode === "dev" ? "chip-active" : ""}`}
            onClick={() => handleModeChange("dev")}
            data-tip="Instant test code, no external email service needed"
          >
            ⚡ Dev Mode (Instant code)
          </button>
          <button
            type="button"
            className={`chip ${authMode === "real" ? "chip-active" : ""}`}
            onClick={() => handleModeChange("real")}
            data-tip="Sends a real 6-digit OTP code to your inbox using EmailJS"
          >
            ✉️ Real Auth (EmailJS)
          </button>
        </div>

        {authMode === "real" && (
          <div
            style={{
              width: "100%",
              maxWidth: "420px",
              padding: "10px 14px",
              background: "white",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius)",
              fontSize: "12px",
              marginTop: "4px",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 600, color: "var(--color-text)" }}>
                EmailJS Credentials
              </span>
              <button
                type="button"
                className="btn-secondary btn-small"
                onClick={() => setShowConfig(!showConfig)}
              >
                {showConfig ? "Hide" : "Edit / Check keys"}
              </button>
            </div>

            {showConfig ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                    Service ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. service_xxxxxxx"
                    value={emailJsConfig.serviceId}
                    onChange={(e) => handleConfigChange("serviceId", e.target.value)}
                    style={{ width: "100%", padding: "6px 8px", fontSize: "12px", borderRadius: "4px", border: "1px solid var(--color-border)" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                    Template ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. template_xxxxxxx"
                    value={emailJsConfig.templateId}
                    onChange={(e) => handleConfigChange("templateId", e.target.value)}
                    style={{ width: "100%", padding: "6px 8px", fontSize: "12px", borderRadius: "4px", border: "1px solid var(--color-border)" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                    Public Key
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. user_xxxxxxx / xxxxxxx"
                    value={emailJsConfig.publicKey}
                    onChange={(e) => handleConfigChange("publicKey", e.target.value)}
                    style={{ width: "100%", padding: "6px 8px", fontSize: "12px", borderRadius: "4px", border: "1px solid var(--color-border)" }}
                  />
                </div>
                <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                  Template parameters sent: <code>to_email</code>, <code>passcode</code>, <code>app_name</code>
                </span>
              </div>
            ) : (
              <div style={{ marginTop: "4px", color: "var(--color-text-muted)", fontSize: "11px" }}>
                {emailJsConfig.serviceId && emailJsConfig.templateId && emailJsConfig.publicKey ? (
                  <span style={{ color: "green" }}>✓ Credentials configured. Ready to send real OTP.</span>
                ) : (
                  <span>Using default env keys or click "Edit / Check keys" to set them.</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {step === "email" ? (
        <form className="otp-overlay" onSubmit={handleLoginClick}>
          <label htmlFor="email-input">
            {authMode === "real" ? "Enter your email to receive a real OTP" : "Sign in to continue (Dev Mode)"}
          </label>
          <input
            id="email-input"
            autoFocus
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            className={`btn-primary btn-login blade-glint clickable ${pressed ? "btn-pressed" : ""}`}
            data-tip={authMode === "real" ? "Send real email via EmailJS" : "Send instant OTP in Dev Mode"}
            disabled={sending}
          >
            {sending ? "Sending code..." : authMode === "real" ? "Send real OTP email" : "Login"}
          </button>
          {error && <p className="otp-error" style={{ marginTop: "12px" }}>{error}</p>}
        </form>
      ) : (
        <form className="otp-overlay" onSubmit={handleOtpSubmit}>
          <label htmlFor="otp-input">Enter the one-time code sent to {email}</label>

          {devCode && (
            <p className="otp-dev-hint">
              Dev mode active: your code is <strong>{devCode}</strong>
            </p>
          )}

          {successNotice && (
            <p className="otp-dev-hint" style={{ background: "#ecfdf5", borderColor: "#a7f3d0", color: "#065f46" }}>
              ✓ {successNotice}
            </p>
          )}

          <div className="inline-form" style={{ marginBottom: 0 }}>
            <input
              id="otp-input"
              autoFocus
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button type="submit" className="btn-primary clickable">Verify &amp; enter</button>
          </div>
          {error && <p className="otp-error">{error}</p>}
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "12px" }}>
            <button
              type="button"
              className="btn-secondary btn-small clickable landing-cancel"
              onClick={() => { setStep("email"); setOtp(""); setError(null); setSuccessNotice(null); }}
            >
              Use a different email
            </button>
            {authMode === "real" && (
              <button
                type="button"
                className="btn-secondary btn-small clickable"
                onClick={() => {
                  handleModeChange("dev");
                  setStep("email");
                  setOtp("");
                  setError(null);
                  setSuccessNotice(null);
                }}
              >
                Switch to Dev Mode
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
