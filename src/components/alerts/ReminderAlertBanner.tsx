import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  completeReminder,
  formatReminderSummaryWhen,
  snoozeReminder,
  tomorrowMorning9Epoch,
  type Reminder,
} from "../../data/reminders";
import { showToast } from "../ui";

const MAX_VISIBLE_ALERTS = 3;

export default function ReminderAlertBanner() {
  const [alerts, setAlerts] = useState<Reminder[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const onAlert = (e: Event) => {
      const rem = (e as CustomEvent<Reminder>).detail;
      if (!rem || typeof rem.id !== "string") return;
      setAlerts((prev) => {
        const filtered = prev.filter((item) => item.id !== rem.id);
        return [rem, ...filtered].slice(0, MAX_VISIBLE_ALERTS);
      });
    };

    const onResolved = (e: Event) => {
      const id = (e as CustomEvent<{ id?: string }>).detail?.id;
      if (!id) return;
      setAlerts((prev) => prev.filter((item) => item.id !== id));
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAlerts((prev) => (prev.length > 0 ? prev.slice(1) : prev));
      }
    };

    window.addEventListener("panga-reminder-alert", onAlert);
    window.addEventListener("panga-reminder-alert-resolved", onResolved);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("panga-reminder-alert", onAlert);
      window.removeEventListener("panga-reminder-alert-resolved", onResolved);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  if (alerts.length === 0) return null;

  function dismissBannerOnly(id: string) {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleDone(r: Reminder) {
    const { undo, nextAt } = await completeReminder(r.id);
    dismissBannerOnly(r.id);
    showToast(
      nextAt !== null
        ? `Done: ${r.message}. Next scheduled.`
        : `Done: ${r.message}`,
      "success",
      6000,
      {
        label: "Undo",
        onClick: () => {
          void undo();
        },
      }
    );
  }

  async function handleSnooze(r: Reminder, nextAt: number, label: string) {
    await snoozeReminder(r.id, nextAt);
    dismissBannerOnly(r.id);
    showToast(`Snoozed "${r.message}" for ${label}.`, "info");
  }

  return (
    <div className="rem-alert-stack" role="region" aria-label="Due reminder alerts">
      {alerts.map((r) => (
        <div key={r.id} className="rem-alert-banner sweep-on-mount" role="alert" aria-live="assertive">
          <div className="rem-alert-head">
            <div className="rem-alert-text">
              <strong className="rem-alert-title">{r.message}</strong>
              <div className="rem-alert-meta">
                <span>{formatReminderSummaryWhen(r)}</span>
                {r.location && <span> · {r.location}</span>}
              </div>
              {r.notes && <div className="rem-alert-notes">{r.notes}</div>}
            </div>
            <button
              type="button"
              className="modal-close-x clickable"
              aria-label={`Dismiss alert for ${r.message}`}
              onClick={() => dismissBannerOnly(r.id)}
            >
              ×
            </button>
          </div>

          <div className="rem-alert-actions">
            <button
              type="button"
              className="btn-primary btn-small clickable"
              onClick={() => void handleDone(r)}
            >
              Done
            </button>
            <button
              type="button"
              className="btn-secondary btn-small clickable"
              onClick={() => void handleSnooze(r, Date.now() + 10 * 60_000, "10 min")}
            >
              10m
            </button>
            <button
              type="button"
              className="btn-secondary btn-small clickable"
              onClick={() => void handleSnooze(r, Date.now() + 60 * 60_000, "1 hour")}
            >
              1h
            </button>
            <button
              type="button"
              className="btn-secondary btn-small clickable"
              onClick={() => void handleSnooze(r, tomorrowMorning9Epoch(), "tomorrow morning")}
            >
              Tomorrow 9 AM
            </button>
            <button
              type="button"
              className="btn-secondary btn-small clickable"
              onClick={() => {
                dismissBannerOnly(r.id);
                navigate(`/home?tab=Reminders&reminder=${encodeURIComponent(r.id)}`);
              }}
            >
              Open
            </button>
            <button
              type="button"
              className="btn-secondary btn-small clickable"
              onClick={() => dismissBannerOnly(r.id)}
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
