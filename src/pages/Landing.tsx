import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { playMacheteCut } from "../components/MacheteTransition";
import { sendOtp, verifyOtp } from "../auth/otp";
import { setSession } from "../auth/session";

type Step = "email" | "otp";

export default function Landing() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [pressed, setPressed] = useState(false);
  const [sending, setSending] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleLoginClick(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setPressed(true);
    setTimeout(() => setPressed(false), 80);
    setError(null);
    setSending(true);
    const { devCode } = await sendOtp(email.trim());
    setSending(false);
    setDevCode(devCode ?? null);
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
    await playMacheteCut();
    navigate("/dashboard");
  }

  return (
<div className="page landing">
        <div className="landing-mark" data-tip="Panga">P</div>
        <h1>Panga</h1>
      <p>Project &amp; resource planner.</p>

      {step === "email" ? (
        <form className="otp-overlay" onSubmit={handleLoginClick}>
          <label htmlFor="email-input">Sign in to continue</label>
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
            data-tip="Send instant OTP to your email or phone"
            disabled={sending}
          >
            {sending ? "Sending code..." : "Login"}
          </button>
        </form>
      ) : (
        <form className="otp-overlay" onSubmit={handleOtpSubmit}>
          <label htmlFor="otp-input">Enter the one-time code sent to {email}</label>
          {devCode && (
            <p className="otp-dev-hint">
              Dev mode (no email service configured yet): your code is <strong>{devCode}</strong>
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
          <button
            type="button"
            className="btn-secondary btn-small clickable landing-cancel"
            onClick={() => { setStep("email"); setOtp(""); setError(null); }}
          >
            Use a different email
          </button>
        </form>
      )}
    </div>
  );
}
