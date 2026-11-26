import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Reminder } from "../data/db";
import { dismissReminderAlert, subscribeReminderAlerts } from "../data/reminders";
import { tickReminderWithUndo } from "./reminderToast";

export default function ReminderAlertBanner() {
  const [alerts, setAlerts] = useState<Reminder[]>([]);

  useEffect(() => {
    return subscribeReminderAlerts(setAlerts);
  }, []);

  if (alerts.length === 0) return null;

  const shown = alerts.slice(0, 3);
  const overflow = alerts.length - shown.length;

  return (
    <div className="reminder-alert-stack" role="region" aria-label="Due reminder alerts" aria-live="polite">
      {shown.map((r) => (
        <div key={r.id} className="reminder-alert-banner">
          <span className="reminder-alert-text">
            <strong>Reminder:</strong> {r.message}
          </span>
          <div className="reminder-alert-actions">
            <button
              type="button"
              className="btn-primary btn-small clickable"
              onClick={() => void tickReminderWithUndo(r)}
            >
              Tick off
            </button>
            <button
              type="button"
              className="btn-secondary btn-small clickable"
              onClick={() => dismissReminderAlert(r.id)}
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
      {overflow > 0 && (
        <div className="reminder-alert-more">
          <Link to="/home?tab=Reminders">+{overflow} more</Link>
        </div>
      )}
    </div>
  );
}
