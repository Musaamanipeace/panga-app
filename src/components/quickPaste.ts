import { quickPaste } from "../data/clips";
import { showToast } from "./ui";

/** Paste-to-Clipboard with friendly feedback. Returns false when the browser refused to let us read. */
export async function pasteWithFeedback(): Promise<boolean> {
  const result = await quickPaste();
  if (result === null) {
    showToast("Your browser blocked reading the clipboard. Open Clipboard and paste into the box.", "info", 4500);
    return false;
  }
  if (result === "saved") showToast("Saved to Clipboard", "success");
  else if (result === "duplicate") showToast("Already the latest clip", "info");
  else showToast("Clipboard is empty", "info");
  return true;
}
