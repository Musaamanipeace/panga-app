import { useSyncExternalStore } from "react";
import { showToast } from "../components/ui";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type InstallPlatform = "ios" | "safari" | "firefox" | "android-firefox" | "chromium" | "other";

export interface InstallState {
  /** The browser has offered a one-tap install prompt we can trigger. */
  canPrompt: boolean;
  /** Running as an installed app right now, or installed during this session. */
  installed: boolean;
  platform: InstallPlatform;
  /** Installing requires HTTPS (localhost counts as secure). */
  secure: boolean;
}

export function detectPlatform(ua: string, maxTouchPoints = 0): InstallPlatform {
  if (/iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && maxTouchPoints > 1)) return "ios";
  if (/Firefox/.test(ua)) return /Android/.test(ua) ? "android-firefox" : "firefox";
  if (/Chrome|Chromium|CriOS|Edg|OPR|SamsungBrowser/.test(ua)) return "chromium";
  if (/Safari/.test(ua)) return "safari";
  return "other";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches === true ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

let deferred: BeforeInstallPromptEvent | null = null;
let installedThisSession = false;
const listeners = new Set<() => void>();

function compute(): InstallState {
  return {
    canPrompt: deferred !== null,
    installed: installedThisSession || isStandalone(),
    platform: typeof navigator === "undefined" ? "other" : detectPlatform(navigator.userAgent, navigator.maxTouchPoints),
    secure: typeof window === "undefined" ? true : window.isSecureContext,
  };
}

let snapshot = compute();
function emit() {
  snapshot = compute();
  listeners.forEach((l) => l());
}

// Registered at module load (imported first in main.tsx) so we never miss the
// browser's one-time install event by waiting for a component to mount.
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // suppress the mini-infobar; we show our own button
    deferred = e as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    installedThisSession = true;
    emit();
    showToast("Panga installed! Find it in your apps, or pin it to your taskbar or home screen.", "success", 5000);
  });
  window.matchMedia?.("(display-mode: standalone)").addEventListener?.("change", emit);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useInstallState(): InstallState {
  return useSyncExternalStore(subscribe, () => snapshot, () => snapshot);
}

/** Shows the browser's install dialog. Returns the user's choice. */
export async function promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  const evt = deferred;
  if (!evt) return "unavailable";
  deferred = null; // the event can only be used once
  emit();
  await evt.prompt();
  const { outcome } = await evt.userChoice;
  return outcome;
}

export function installInstructions(platform: InstallPlatform): string[] {
  switch (platform) {
    case "ios":
      return [
        "Tap the Share button (the square with an arrow) in your browser's toolbar.",
        "Scroll down and tap “Add to Home Screen”.",
        "Tap “Add”. Panga now opens like a normal app.",
      ];
    case "safari":
      return ["In the menu bar, choose File → Add to Dock.", "Panga opens in its own window from your Dock."];
    case "firefox":
      return [
        "Desktop Firefox can't install web apps.",
        "Open Panga in Chrome or Edge to install it, or bookmark this page to come back quickly.",
      ];
    case "android-firefox":
      return ["Open the ⋮ menu.", "Tap “Install” (or “Add to Home screen”)."];
    case "chromium":
      return [
        "Open the browser menu (⋮ or …).",
        "Chrome: choose “Install Panga” (or Cast, save and share → Install page as app). Edge: Apps → Install this site as an app.",
        "On Android, choose “Install app” or “Add to Home screen”.",
      ];
    default:
      return ["Open your browser's menu and look for “Install”, “Add to Home screen” or “Add to Dock”."];
  }
}
