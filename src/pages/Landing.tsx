import { useState } from "react";
import { signIn, signUp } from "../sync/sync";

type Mode = "login" | "signup";

export default function Landing() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pressed, setPressed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

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
      setSuccessNotice(result.successMessage || `Account created successfully.`);
      setMode("login");
      setPassword("");
      return;
    }

    // Login
    const result = await signIn(email.trim(), password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    // signIn stores the session; navigate to dashboard
    window.location.assign("/dashboard");
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
              ? "Create Account"
              : "Login"}
        </button>

        {error && (
          <div style={{ marginTop: "12px" }}>
            <p className="otp-error">{error}</p>
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
    </div>
  );
}
