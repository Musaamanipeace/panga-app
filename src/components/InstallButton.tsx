import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { showToast } from "./ui";
import { installInstructions, promptInstall, useInstallState } from "../pwa/install";

function InstallHelp({ onClose }: { onClose: () => void }) {
  const state = useInstallState();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 9500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Install Panga"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--color-bg)",
          color: "var(--color-text)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius)",
          padding: 20,
          maxWidth: 380,
          width: "100%",
          textAlign: "left",
        }}
      >
        <h2 style={{ margin: "0 0 8px 0", fontSize: 18 }}>Install Panga</h2>
        {!state.secure && (
          <p style={{ color: "#b45309", fontSize: 13 }}>
            Installing needs a secure (HTTPS) connection, and this page isn't served over one.
          </p>
        )}
        <ol style={{ margin: "0 0 14px 0", paddingLeft: 20, lineHeight: 1.5, fontSize: 14 }}>
          {installInstructions(state.platform).map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", margin: "0 0 14px 0" }}>
          Your browser offers its own install button only when it decides the app is installable, so this may not always
          appear on its own.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="button" className="btn-primary btn-small clickable" onClick={onClose} autoFocus>
            Got it
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/**
 * "Install app" button. Triggers the browser's install prompt when it is
 * available; otherwise opens step-by-step instructions for the user's browser.
 * Hidden once Panga is running as an installed app.
 */
export default function InstallButton({ variant = "compact" }: { variant?: "compact" | "large" }) {
  const state = useInstallState();
  const [helpOpen, setHelpOpen] = useState(false);

  if (state.installed) return null;

  async function onClick() {
    if (!state.canPrompt) {
      setHelpOpen(true);
      return;
    }
    const outcome = await promptInstall();
    if (outcome === "accepted") showToast("Installing Panga…", "success");
  }

  return (
    <>
      <button
        type="button"
        className={`btn-secondary ${variant === "large" ? "btn-large" : "btn-small"} clickable`}
        onClick={() => void onClick()}
        data-tip="Install Panga as an app on this device"
        data-tip-pos="bottom"
      >
        <span aria-hidden="true">⬇ </span>Install app
      </button>
      {helpOpen && <InstallHelp onClose={() => setHelpOpen(false)} />}
    </>
  );
}
