import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { confirmAction, showToast } from "./ui";
import {
  PROVIDER_LONG,
  applyImport,
  exportNow,
  fetchRemoteSnapshot,
  getPreferredProvider,
  localDataIsEmpty,
  retryNow,
  type AutoSyncState,
} from "../sync/autoSync";
import {
  getActiveSyncProvider,
  setActiveSyncProvider,
  type CloudSyncProvider,
} from "../data/settings";

const ALL_PROVIDERS: CloudSyncProvider[] = ["google_drive"];

/** Header "Sync" dropdown: pick a method (preferred one first), then Export or Import. */
export function SyncMenu() {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [preferred, setPreferred] = useState<CloudSyncProvider>("google_drive");
  const [expanded, setExpanded] = useState<CloudSyncProvider | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void getPreferredProvider().then((p) => {
      setPreferred(p);
      setExpanded(p);
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Preferred method is listed first.
  const ordered = [preferred, ...ALL_PROVIDERS.filter((p) => p !== preferred)];

  async function choose(p: CloudSyncProvider) {
    setPreferred(p);
    setExpanded(expanded === p ? null : p);
    await setActiveSyncProvider(p);
  }

  async function ensureCredentials(_p: CloudSyncProvider): Promise<boolean> {
    return true;
  }

  async function handleExport(p: CloudSyncProvider) {
    setOpen(false);
    if (!(await ensureCredentials(p))) return;

    if (await localDataIsEmpty()) {
      const ok = await confirmAction({
        title: "Export an empty workspace?",
        message: `This device has no projects or data. Exporting will overwrite the copy in ${PROVIDER_LONG[p]} with an empty workspace. If you meant to load your saved data, use Import instead.`,
        confirmLabel: "Export anyway",
        danger: true,
      });
      if (!ok) return;
    }

    setBusy(true);
    const res = await exportNow(p);
    setBusy(false);
    showToast(
      res.ok ? `Exported to ${PROVIDER_LONG[p]}. Auto-sync is on.` : res.message,
      res.ok ? "success" : "error",
      res.ok ? 3000 : 5000
    );
  }

  async function handleImport(p: CloudSyncProvider) {
    setOpen(false);
    if (!(await ensureCredentials(p))) return;

    setBusy(true);
    const res = await fetchRemoteSnapshot(p);
    setBusy(false);
    if (!res.ok || !res.data) {
      showToast(res.message || `Could not import from ${PROVIDER_LONG[p]}`, "error", 5000);
      return;
    }

    const when = new Date(res.data.metadata.exportedAt).toLocaleString();
    const ok = await confirmAction({
      title: `Import from ${PROVIDER_LONG[p]}?`,
      message: `This replaces everything on this device with the copy exported ${when}. Changes here that were never exported will be lost.`,
      confirmLabel: "Replace local data",
      danger: true,
    });
    if (!ok) return;

    setBusy(true);
    try {
      await applyImport(p, res.data);
      showToast("Import complete. Reloading…", "success", 1500);
      setTimeout(() => window.location.reload(), 900);
    } catch (err) {
      setBusy(false);
      showToast(`Import failed: ${err instanceof Error ? err.message : String(err)}`, "error", 5000);
    }
  }

  return (
    <div className="sync-menu" ref={rootRef}>
      <button
        type="button"
        className="btn-secondary btn-small clickable"
        onClick={() => setOpen((o) => !o)}
        disabled={busy}
        aria-haspopup="menu"
        aria-expanded={open}
        data-tip="Choose where to sync: export to or import from the cloud"
        data-tip-pos="bottom"
      >
        {busy ? "⟳ Working…" : "⇅ Sync ▾"}
      </button>

      {open && (
        <div className="sync-menu-panel" role="menu">
          {ordered.map((p) => (
            <div key={p} className="sync-menu-group">
              <button
                type="button"
                role="menuitem"
                className="sync-menu-provider clickable"
                onClick={() => void choose(p)}
              >
                <span>{PROVIDER_LONG[p]}</span>
                {p === preferred && <span className="sync-menu-pref">preferred</span>}
                <span className="sync-menu-caret">{expanded === p ? "▾" : "▸"}</span>
              </button>
              {expanded === p && (
                <div className="sync-menu-actions">
                  <button type="button" role="menuitem" className="sync-menu-action clickable" onClick={() => void handleExport(p)}>
                    ⬆ Export
                    <small>Push this device to {PROVIDER_LONG[p]} and keep it synced automatically</small>
                  </button>
                  <button type="button" role="menuitem" className="sync-menu-action clickable" onClick={() => void handleImport(p)}>
                    ⬇ Import
                    <small>Replace this device's data with the copy in {PROVIDER_LONG[p]}</small>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Header indicator that replaces the old "saved" status. */
export function AutoSyncIndicator({ state }: { state: AutoSyncState }) {
  const where = state.provider === "google_drive" ? "Drive" : "";
  let text = "";
  let color = "var(--color-text-muted)";
  let clickable = false;

  switch (state.phase) {
    case "synced":
      text = `✓ synced to ${where}`;
      color = "#10b981";
      break;
    case "idle":
      text = `● auto-sync · ${where}`;
      color = "#10b981";
      break;
    case "pending":
      text = `● syncing soon`;
      color = "#f59e0b";
      break;
    case "syncing":
      text = `⟳ syncing to ${where}…`;
      color = "#f59e0b";
      break;
    case "error":
      text = `✗ sync failed · retry`;
      color = "#ef4444";
      clickable = true;
      break;
    default:
      text = "○ local only";
  }

  const tip =
    state.phase === "synced" && state.at
      ? `${state.message} at ${new Date(state.at).toLocaleTimeString()}`
      : state.phase === "off"
        ? "Not syncing to the cloud. Use Sync → Export to turn on auto-sync."
        : state.message;

  return (
    <span
      className="sync-status"
      style={{ color, cursor: clickable ? "pointer" : "default" }}
      title={tip}
      role={clickable ? "button" : undefined}
      onClick={clickable ? () => retryNow() : undefined}
    >
      {text}
    </span>
  );
}
