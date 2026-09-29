import { useState } from "react";
import {
  signIn,
  signUp,
  resendConfirmationEmail,
  isSupabaseConfigured,
  getSupabaseConfig,
} from "../sync/supabaseSync";

type Mode = "login" | "signup";

export default function Landing() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pressed, setPressed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isSupabaseConfigured()) {
    return (
      <div className="page landing">
        <div className="landing-mark" data-tip="Panga">P</div>
        <h1>Panga</h1>
        <p>Project &amp; resource planner.</p>
        <div className="otp-overlay">
          <p style={{ color: "var(--color-text-muted)", textAlign: "center" }}>
            Supabase is not configured. Please set <code>VITE_SUPABASE_URL</code> and
            <code> VITE_SUPABASE_ANON_KEY</code> in your <code>.env</code> file.
          </p>
        </div>
      </div>
    );
  }

  function resetMode() {
    setError(null);
    setSuccessNotice(null);
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    if (mode === "signup" && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setPressed(true);
    setTimeout(() => setPressed(false), 80);
    setError(null);
    setSuccessNotice(null);
    setLoading(true);

    if (mode === "signup") {
      const result = await signUp(email.trim(), password);
      setLoading(false);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccessNotice(result.successMessage || `Confirmation email sent to ${email.trim()}.`);
      setMode("login");
      setPassword("");
      return;
    }

    // Login
    const result = await signIn(email.trim(), password);
    setLoading(false);
    if (result.error) {
      // Provide a helpful resend option for unconfirmed emails
      if (result.error.toLowerCase().includes("not confirmed")) {
        setError(
          "Your email is not confirmed yet. " +
            'Please check your inbox (and spam folder) for the confirmation email, ' +
            "then click the link to verify your account."
        );
      } else {
        setError(result.error);
      }
      return;
    }
    // signIn stores the session; navigate to dashboard
    window.location.assign("/dashboard");
  }

  async function handleResend() {
    if (!email.trim()) return;
    setLoading(true);
    const result = await resendConfirmationEmail(email.trim());
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccessNotice(result.successMessage || `Confirmation email resent to ${email.trim()}.`);
    }
  }

  return (
    <div className="page landing">
      <div className="landing-mark" data-tip="Panga">P</div>
      <h1>Panga</h1>
      <p>Project &amp; resource planner.</p>

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
            className={`chip ${mode === "login" ? "chip-active" : ""}`}
            onClick={() => { setMode("login"); resetMode(); }}
          >
            Login
          </button>
          <button
            type="button"
            className={`chip ${mode === "signup" ? "chip-active" : ""}`}
            onClick={() => { setMode("signup"); resetMode(); }}
          >
            Sign Up
          </button>
        </div>

        {/* Supabase config quick-check */}
        <div style={{ marginTop: "4px", color: "var(--color-text-muted)", fontSize: "11px" }}>
          {(() => {
            const cfg = getSupabaseConfig();
            const ok =
              cfg.url &&
              cfg.anonKey &&
              !cfg.url.includes("placeholder") &&
              !cfg.anonKey.includes("placeholder");
            return ok
              ? "✓ Supabase configured"
              : "⚠ Supabase not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env";
          })()}
        </div>
      </div>

      <form className="otp-overlay" onSubmit={handleEmailSubmit}>
        <label htmlFor="email-input">
          {mode === "signup" ? "Create an account" : "Welcome back — sign in"}
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

        <input
          id="password-input"
          type="password"
          required
          minLength={6}
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginTop: "8px" }}
        />

        <button
          type="submit"
          className={`btn-primary btn-login blade-glint clickable ${pressed ? "btn-pressed" : ""}`}
          disabled={loading}
        >
          {loading
            ? "Working..."
            : mode === "signup"
              ? "Sign Up & Send Confirmation Email"
              : "Login"}
        </button>

        {error && (
          <div style={{ marginTop: "12px" }}>
            <p className="otp-error">{error}</p>
            {error.toLowerCase().includes("not confirmed") && email && (
              <button
                type="button"
                className="btn-secondary btn-small clickable"
                style={{ marginTop: "8px" }}
                onClick={handleResend}
                disabled={loading}
              >
                {loading ? "Sending..." : "Resend confirmation email"}
              </button>
            )}
          </div>
        )}

        {successNotice && (
          <p
            className="otp-error"
            style={{
              marginTop: "12px",
              color: "#065f46",
              background: "#ecfdf5",
              borderColor: "#a7f3d0",
              padding: "8px 12px",
              borderRadius: "var(--radius)",
            }}
          >
            ✓ {successNotice}
          </p>
        )}
      </form>

      {/* Hint for signup */}
      {mode === "signup" && (
        <p style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "12px" }}>
          A confirmation email will be sent to verify your address. After confirming,
          you can log in with the same email and password.
        </p>
      )}
    </div>
  );
}
