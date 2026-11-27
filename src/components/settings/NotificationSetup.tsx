import { useEffect, useState } from "react";
import {
  getOsNotificationsEnabled,
  getReminderSoundEnabled,
  setOsNotificationsEnabled,
  setReminderSoundEnabled,
} from "../../data/accountSettings";
import { playTone, requestNotificationPermission } from "../../data/reminders";
import { showToast } from "../ui";

type PermissionStateKind = NotificationPermission | "unsupported";

function readNotificationPermission(): PermissionStateKind {
  if (typeof Notification === "undefined") return "unsupported";
  return Notification.permission;
}

function permissionLabel(perm: PermissionStateKind): string {
  switch (perm) {
    case "granted":
      return "Granted";
    case "denied":
      return "Blocked in browser settings";
    case "default":
      return "Not enabled yet";
    case "unsupported":
      return "Not supported in this browser";
  }
}

export default function NotificationSetup() {
  const [perm, setPerm] = useState<PermissionStateKind>(() => readNotificationPermission());
  const [osEnabled, setOsEnabledState] = useState<boolean>(() => getOsNotificationsEnabled());
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => getReminderSoundEnabled());

  useEffect(() => {
    const onSettings = () => {
      setOsEnabledState(getOsNotificationsEnabled());
      setSoundEnabledState(getReminderSoundEnabled());
    };
    const onFocus = () => setPerm(readNotificationPermission());
    window.addEventListener("panga-settings-updated", onSettings);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("panga-settings-updated", onSettings);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  async function handleRequestPermission() {
    const granted = await requestNotificationPermission();
    setPerm(readNotificationPermission());
    if (granted) {
      setOsNotificationsEnabled(true);
      setOsEnabledState(true);
      showToast("Desktop notifications enabled.", "success");
    } else {
      showToast("Desktop notification permission was not granted.", "info");
    }
  }

  return (
    <section
      id="notifications"
      className="settings-section"
      style={{ border: "1px solid var(--color-border)", borderRadius: 12, padding: 20 }}
    >
      <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>Reminder alerts</h2>
      <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--color-text-muted)" }}>
        In-app alert banners and audio chimes work automatically while Panga is open. You can also mirror due timed reminders as browser notifications.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontSize: 13 }}>
          Browser permission: <strong>{permissionLabel(perm)}</strong>
        </div>

        <label className="rem-checkbox-label" style={{ fontSize: 13 }}>
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => {
              const next = e.target.checked;
              setSoundEnabledState(next);
              setReminderSoundEnabled(next);
            }}
          />
          <span>Play chime sound for timed reminders</span>
        </label>

        <label className="rem-checkbox-label" style={{ fontSize: 13 }}>
          <input
            type="checkbox"
            checked={osEnabled}
            onChange={(e) => {
              const next = e.target.checked;
              setOsEnabledState(next);
              setOsNotificationsEnabled(next);
            }}
          />
          <span>Mirror due reminders as browser desktop notifications</span>
        </label>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
          {perm === "default" && (
            <button
              type="button"
              className="btn-primary btn-small clickable"
              onClick={() => void handleRequestPermission()}
            >
              Enable desktop alerts
            </button>
          )}
          <button
            type="button"
            className="btn-secondary btn-small clickable"
            onClick={() => playTone("chime")}
          >
            Play test sound
          </button>
        </div>
      </div>
    </section>
  );
}
