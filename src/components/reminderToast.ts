// src/components/reminderToast.ts
// Shared tick-off helper that completes or advances a reminder and offers a
// 6-second Undo toast restoring the exact previous record.

import type { Reminder } from "../data/db";
import { formatDayHeading } from "../data/recurrence";
import { completeReminder, restoreReminderRecord } from "../data/reminders";
import { showToast } from "./ui";

export async function tickReminderWithUndo(
  reminder: Reminder,
  onChanged?: () => void | Promise<void>
): Promise<void> {
  const result = await completeReminder(reminder.id);
  if (!result) return;

  await onChanged?.();

  const message =
    result.kind === "advanced"
      ? `Done: ${result.previous.message}. Next: ${formatDayHeading(result.nextTriggerAt)}`
      : `Done: ${result.previous.message}`;

  showToast(message, "success", 6000, {
    label: "Undo",
    onClick: () => {
      void restoreReminderRecord(result.previous).then(() => onChanged?.());
    },
  });
}
