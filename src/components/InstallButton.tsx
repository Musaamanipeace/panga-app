import { useEffect, useState } from "react";
import { showToast } from "./ui";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "rejected" }>;
  prompt(): Promise<void>;
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as any).standalone === true
  );
}

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isStandalone()) return;

    const isIOSDevice = isIOS();
    if (isIOSDevice) {
      setVisible(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const handleAppInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
      showToast("Panga installed! You can pin it to your taskbar or home screen.", "success", 5000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (!visible) return null;

  if (deferredPrompt === null) {
    return (
      <button
        type="button"
        className="btn-secondary btn-small clickable"
        onClick={() => {
          showToast("To install: tap the Share icon, then 'Add to Home Screen'.", "info", 8000);
        }}
        data-tip="Install instructions"
        data-tip-pos="bottom"
      >
        <span style={{ fontSize: "12px" }}>
          <span role="img" aria-label="iOS">📱</span> Add to Home Screen
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className="btn-secondary btn-small clickable"
      data-tip="Install Panga as a standalone app"
      data-tip-pos="bottom"
      onClick={async (e) => {
        e.preventDefault();
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          showToast("Panga is installing… you can pin it to your taskbar.", "success");
        } else {
          showToast("Install cancelled.", "info");
        }
        setDeferredPrompt(null);
      }}
    >
      <span style={{ fontSize: "12px" }}>
        <span role="img" aria-label="Install">💾</span> Install app
      </span>
    </button>
  );
}
