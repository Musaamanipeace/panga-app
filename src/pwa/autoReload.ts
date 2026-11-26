// src/pwa/autoReload.ts
// Ensures browsers running an older deployment pick up new deploys cleanly:
// - Reloads once when a new Service Worker takes over an already-controlled page
// - Defers reload while the user is actively typing in an input/textarea/select
// - Polls registration.update() on tab focus, reconnect, and periodic intervals
// - Recovers once from Vite chunk preload failures after a redeploy

const RELOAD_GUARD_KEY = "panga_sw_reload_at";
const RELOAD_COOLDOWN_MS = 10_000;
const UPDATE_THROTTLE_MS = 30_000;
const PERIODIC_UPDATE_MS = 30 * 60_000;

export function isUserTyping(doc: Document = document): boolean {
  const el = doc.activeElement;
  if (!el) return false;
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
    return !el.disabled && !(el instanceof HTMLTextAreaElement && el.readOnly);
  }
  if (el instanceof HTMLInputElement) {
    if (el.disabled || el.readOnly) return false;
    const nonTextTypes = new Set([
      "button",
      "checkbox",
      "file",
      "hidden",
      "image",
      "radio",
      "reset",
      "submit",
    ]);
    return !nonTextTypes.has(el.type);
  }
  return (el as HTMLElement).isContentEditable === true;
}

export interface AutoReloadOptions {
  reload?: () => void;
  now?: () => number;
}

export function createAutoReloadController(options: AutoReloadOptions = {}) {
  const doReload = options.reload ?? (() => window.location.reload());
  const now = options.now ?? (() => Date.now());

  let reloading = false;
  let pendingReload = false;
  let blurAttached = false;

  function withinCooldown(ts: number): boolean {
    try {
      const raw = window.sessionStorage.getItem(RELOAD_GUARD_KEY);
      if (!raw) return false;
      const prev = Number(raw);
      return Number.isFinite(prev) && ts - prev < RELOAD_COOLDOWN_MS;
    } catch {
      return false;
    }
  }

  function markReloaded(ts: number): void {
    try {
      window.sessionStorage.setItem(RELOAD_GUARD_KEY, String(ts));
    } catch {
      // sessionStorage unavailable (private browsing / restricted storage)
    }
  }

  function attemptReload(): boolean {
    if (reloading) return false;
    const ts = now();
    if (withinCooldown(ts)) return false;

    if (isUserTyping()) {
      pendingReload = true;
      if (!blurAttached) {
        blurAttached = true;
        const onResume = () => {
          if (!pendingReload || isUserTyping()) return;
          document.removeEventListener("focusout", onResume, true);
          document.removeEventListener("visibilitychange", onResume);
          blurAttached = false;
          attemptReload();
        };
        document.addEventListener("focusout", onResume, true);
        document.addEventListener("visibilitychange", onResume);
      }
      return false;
    }

    pendingReload = false;
    reloading = true;
    markReloaded(ts);
    doReload();
    return true;
  }

  return {
    scheduleReload: attemptReload,
    isPending: () => pendingReload,
  };
}

export interface RegisterSWOptionsLike {
  immediate?: boolean;
  onRegisteredSW?: (swUrl: string, registration: ServiceWorkerRegistration | undefined) => void;
  onOfflineReady?: () => void;
  onRegisterError?: (error: unknown) => void;
}

export type RegisterSWLoader = () => Promise<{
  registerSW: (options?: RegisterSWOptionsLike) => (reloadPage?: boolean) => Promise<void>;
}>;

let initialized = false;

export function setupAutoUpdateReload(loadRegisterSW?: RegisterSWLoader): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  const controller = createAutoReloadController();

  window.addEventListener("vite:preloadError", (event) => {
    event.preventDefault();
    controller.scheduleReload();
  });

  if (!("serviceWorker" in navigator)) return;

  // Only reload when replacing an *existing* controlling service worker so a
  // first-time visitor's initial SW claim does not trigger an extra reload.
  let hadController = Boolean(navigator.serviceWorker.controller);

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController) {
      hadController = true;
      return;
    }
    controller.scheduleReload();
  });

  if (!loadRegisterSW) return;

  const registerOnLoad = () => {
    loadRegisterSW()
      .then(({ registerSW }) => {
        let lastCheckAt = Date.now();
        registerSW({
          immediate: true,
          onRegisteredSW(_swUrl, registration) {
            if (!registration) return;

            const checkForUpdate = () => {
              const ts = Date.now();
              if (ts - lastCheckAt < UPDATE_THROTTLE_MS) return;
              lastCheckAt = ts;
              void registration.update().catch(() => {
                /* offline or aborted update check */
              });
            };

            document.addEventListener("visibilitychange", () => {
              if (document.visibilityState === "visible") {
                checkForUpdate();
              }
            });
            window.addEventListener("online", checkForUpdate);
            window.setInterval(checkForUpdate, PERIODIC_UPDATE_MS);
          },
          onOfflineReady() {
            console.log("App ready for offline use");
          },
          onRegisterError(err) {
            console.warn("PWA registration error:", err);
          },
        });
      })
      .catch((err) => console.warn("PWA register import error:", err));
  };

  if (document.readyState === "complete") {
    registerOnLoad();
  } else {
    window.addEventListener("load", registerOnLoad, { once: true });
  }
}
