import InstallButton from "./InstallButton";
import { useInstallState } from "../pwa/install";

export default function InstallSettings() {
  const state = useInstallState();
  return (
    <section className="settings-section">
      <h2>Install &amp; Offline</h2>
      <p className="settings-help">
        Install Panga to get its own window, a home-screen or taskbar icon, and full offline use. Your data stays on this
        device either way.
      </p>
      {state.installed ? (
        <p style={{ margin: 0, color: "green", fontSize: 14 }}>✓ Panga is installed on this device.</p>
      ) : (
        <InstallButton variant="large" />
      )}
    </section>
  );
}
