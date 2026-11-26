import { useMemo, useRef, useState } from "react";
import {
  applyEventImport,
  buildImportCandidates,
  readCalendarFiles,
  type ImportApplyResult,
  type ImportCandidate,
} from "../../data/importEvents";
import type { UnreadableIcsEvent } from "../../data/ics";
import {
  formatPreviewDateTime,
  formatRecurrence,
  type ReminderView,
} from "../../data/recurrence";
import {
  getNotificationPermissionState,
  requestNotificationPermission,
  type NotificationPermissionState,
} from "../../data/reminders";
import { copyToClipboard } from "../ui";

type ImportStep = "idle" | "reading" | "preview" | "importing" | "done" | "error";
type PreviewFilter = "all" | "new" | "changed";

const PAGE_SIZE = 50;

export default function ImportEventsCard({
  onImported,
  onViewTarget,
  onClose,
}: {
  onImported: () => void | Promise<void>;
  onViewTarget: (view: ReminderView) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<ImportStep>("idle");
  const [dragOver, setDragOver] = useState(false);
  const [fileCount, setFileCount] = useState(0);
  const [candidates, setCandidates] = useState<ImportCandidate[]>([]);
  const [unreadable, setUnreadable] = useState<UnreadableIcsEvent[]>([]);
  const [includePast, setIncludePast] = useState(false);
  const [showFilter, setShowFilter] = useState<PreviewFilter>("all");
  const [checkedKeys, setCheckedKeys] = useState<Set<string>>(new Set());
  const [pageCount, setPageCount] = useState(1);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [doneResult, setDoneResult] = useState<ImportApplyResult | null>(null);
  const [showUnreadable, setShowUnreadable] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [permState, setPermState] = useState<NotificationPermissionState>(() =>
    getNotificationPermissionState()
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  function resetToIdle() {
    abortRef.current?.abort();
    abortRef.current = null;
    setStep("idle");
    setCandidates([]);
    setUnreadable([]);
    setIncludePast(false);
    setShowFilter("all");
    setCheckedKeys(new Set());
    setPageCount(1);
    setProgress({ done: 0, total: 0 });
    setDoneResult(null);
    setShowUnreadable(false);
    setErrorMsg("");
  }

  async function handleFiles(fileList: FileList | File[] | null) {
    const files = fileList ? Array.from(fileList) : [];
    if (files.length === 0) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setFileCount(files.length);
    setStep("reading");
    setErrorMsg("");

    try {
      const readRes = await readCalendarFiles(files, { signal: controller.signal });
      if (controller.signal.aborted) return;

      const built = await buildImportCandidates(readRes.events);
      if (controller.signal.aborted) return;

      const initialChecked = new Set<string>();
      for (const c of built) {
        if (c.status !== "duplicate") {
          initialChecked.add(c.key);
        }
      }

      setCandidates(built);
      setUnreadable(readRes.unreadable);
      setCheckedKeys(initialChecked);
      setIncludePast(false);
      setShowFilter("all");
      setPageCount(1);

      if (built.length === 0 && readRes.unreadable.length > 0) {
        setErrorMsg(readRes.unreadable[0].reason || "No readable events found in the selected files.");
        setStep("error");
        return;
      }
      setStep("preview");
    } catch (err) {
      if ((err as Error)?.name === "AbortError") {
        resetToIdle();
        return;
      }
      setErrorMsg(err instanceof Error && err.message ? err.message : "Could not read calendar files.");
      setStep("error");
    }
  }

  const pastFiltered = useMemo(() => {
    return includePast ? candidates : candidates.filter((c) => !c.isPast);
  }, [candidates, includePast]);

  const counts = useMemo(() => {
    let newCount = 0;
    let dupCount = 0;
    let changedCount = 0;
    for (const c of pastFiltered) {
      if (c.status === "new") newCount++;
      else if (c.status === "duplicate") dupCount++;
      else if (c.status === "changed") changedCount++;
    }
    return {
      total: pastFiltered.length,
      newCount,
      dupCount,
      changedCount,
    };
  }, [pastFiltered]);

  const visibleCandidates = useMemo(() => {
    if (showFilter === "new") return pastFiltered.filter((c) => c.status === "new");
    if (showFilter === "changed") return pastFiltered.filter((c) => c.status === "changed");
    return pastFiltered;
  }, [pastFiltered, showFilter]);

  const pagedCandidates = useMemo(() => {
    return visibleCandidates.slice(0, pageCount * PAGE_SIZE);
  }, [visibleCandidates, pageCount]);

  const selectedToImport = useMemo(() => {
    return pastFiltered.filter((c) => c.status !== "duplicate" && checkedKeys.has(c.key));
  }, [pastFiltered, checkedKeys]);

  const summaryLine = useMemo(() => {
    const parts: string[] = [];
    if (counts.newCount > 0) parts.push(`${counts.newCount} new`);
    if (counts.dupCount > 0) parts.push(`${counts.dupCount} already in Panga`);
    if (counts.changedCount > 0) parts.push(`${counts.changedCount} changed since last import`);
    const head = `${counts.total} ${counts.total === 1 ? "event" : "events"} found`;
    return parts.length > 0 ? `${head}: ${parts.join(", ")}.` : `${head}.`;
  }, [counts]);

  async function handleConfirmImport() {
    if (selectedToImport.length === 0) return;
    setStep("importing");
    setProgress({ done: 0, total: selectedToImport.length });
    try {
      const res = await applyEventImport(
        selectedToImport,
        pastFiltered.length,
        (done, total) => setProgress({ done, total })
      );
      setDoneResult(res);
      setPermState(getNotificationPermissionState());
      setStep("done");
      await onImported();
    } catch (err) {
      setErrorMsg(err instanceof Error && err.message ? err.message : "Could not import events.");
      setStep("error");
    }
  }

  async function handleEnableNotifications() {
    await requestNotificationPermission();
    setPermState(getNotificationPermissionState());
  }

  function toggleRow(key: string) {
    setCheckedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function selectAllVisible() {
    setCheckedKeys((prev) => {
      const next = new Set(prev);
      for (const c of visibleCandidates) {
        if (c.status !== "duplicate") next.add(c.key);
      }
      return next;
    });
  }

  function selectNoneVisible() {
    setCheckedKeys((prev) => {
      const next = new Set(prev);
      for (const c of visibleCandidates) {
        next.delete(c.key);
      }
      return next;
    });
  }

  const unreadableDetailsText = unreadable
    .map((u) => `${u.fileName}${u.title ? ` (${u.title})` : ""}: ${u.reason}`)
    .join("\n");

  const viewLinkLabel =
    doneResult?.primaryView === "today"
      ? "View in Today"
      : doneResult?.primaryView === "upcoming"
        ? "View in Upcoming"
        : "View in Overdue";

  return (
    <section
      className="import-card"
      data-dragover={dragOver ? "true" : "false"}
      aria-label="Import events from Google Calendar"
      onDragOver={(e) => {
        if (step !== "idle") return;
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        if (step !== "idle") return;
        e.preventDefault();
        setDragOver(false);
        void handleFiles(e.dataTransfer.files);
      }}
    >
      <div className="import-card-head">
        <h3 className="section-heading" style={{ margin: 0 }}>
          Import events from Google Calendar
        </h3>
        {step === "idle" && (
          <button
            type="button"
            className="btn-secondary btn-small clickable"
            onClick={onClose}
          >
            Close
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".ics,.zip,text/calendar,application/zip"
        multiple
        aria-label="Choose .ics or .zip files"
        style={{ display: "none" }}
        onChange={(e) => {
          void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {step === "idle" && (
        <div className="import-card-body">
          <ol className="import-guide">
            <li>On a computer, open Google Calendar (calendar.google.com).</li>
            <li>Click the gear icon, then Settings.</li>
            <li>Choose Import &amp; export, then Export.</li>
            <li>
              Google downloads a zip file. You can add it here as it is, or unzip it and add the .ics files inside.
            </li>
          </ol>
          <p className="import-note">
            Google Calendar's export is only available on the website, not in the phone app. If an event reached you by email, open its .ics attachment and add that file here instead.
          </p>
          <div className="import-actions-row">
            <button
              type="button"
              className="btn-primary btn-small clickable"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose files
            </button>
            <span className="import-drop-hint">or drop .ics / .zip files here</span>
          </div>
        </div>
      )}

      {step === "reading" && (
        <div className="import-card-body">
          <p className="import-status-line">
            Reading files… ({fileCount} {fileCount === 1 ? "file" : "files"})
          </p>
          <button type="button" className="btn-secondary btn-small clickable" onClick={resetToIdle}>
            Cancel
          </button>
        </div>
      )}

      {step === "preview" && (
        <div className="import-card-body">
          <p className="import-summary">{summaryLine}</p>

          <div className="import-filters">
            <label className="import-checkbox-label">
              <input
                type="checkbox"
                checked={includePast}
                onChange={(e) => {
                  setIncludePast(e.target.checked);
                  setPageCount(1);
                }}
              />
              Include past events
            </label>
            <label className="import-select-label">
              Show
              <select
                value={showFilter}
                onChange={(e) => {
                  setShowFilter(e.target.value as PreviewFilter);
                  setPageCount(1);
                }}
              >
                <option value="all">All</option>
                <option value="new">New only</option>
                <option value="changed">Changed only</option>
              </select>
            </label>
          </div>

          {visibleCandidates.length === 0 ? (
            <p className="empty-state">No events match the current filter.</p>
          ) : (
            <ul className="import-preview-list">
              {pagedCandidates.map((c) => {
                const disabled = c.status === "duplicate";
                const checked = !disabled && checkedKeys.has(c.key);
                const repeatText = formatRecurrence(c.event.recurrence);
                return (
                  <li key={c.key} className="import-preview-row">
                    <label className="import-preview-check">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => toggleRow(c.key)}
                      />
                      <span className="import-preview-main">
                        <strong className="import-preview-title">{c.event.summary}</strong>
                        <span className="import-preview-meta">
                          <span>{formatPreviewDateTime(c.event.triggerAt, c.event.allDay)}</span>
                          {repeatText && <span> · {repeatText}</span>}
                          {c.event.location && <span> · {c.event.location}</span>}
                        </span>
                        <span className="import-preview-badges">
                          {c.event.simplifiedRecurrence && (
                            <span className="import-badge import-badge-warn">
                              Repeat pattern simplified (RRULE not fully supported; imports next occurrence only)
                            </span>
                          )}
                          {c.event.unknownTimeZone && (
                            <span className="import-badge import-badge-warn">
                              Time zone assumed (unknown TZID; used device time zone)
                            </span>
                          )}
                          {c.status === "changed" && (
                            <span className="import-badge import-badge-info">
                              Changed (existing reminder will be updated)
                            </span>
                          )}
                          {c.status === "duplicate" && (
                            <span className="import-badge">
                              Already in Panga (unchanged duplicate)
                            </span>
                          )}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}

          {pagedCandidates.length < visibleCandidates.length && (
            <button
              type="button"
              className="btn-secondary btn-small clickable"
              onClick={() => setPageCount((p) => p + 1)}
            >
              Show more
            </button>
          )}

          <div className="import-footer">
            <div className="import-footer-group">
              <button type="button" className="btn-secondary btn-small clickable" onClick={selectAllVisible}>
                Select all
              </button>
              <button type="button" className="btn-secondary btn-small clickable" onClick={selectNoneVisible}>
                Select none
              </button>
            </div>
            <div className="import-footer-group">
              <button type="button" className="btn-secondary btn-small clickable" onClick={resetToIdle}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary btn-small clickable"
                disabled={selectedToImport.length === 0}
                onClick={() => void handleConfirmImport()}
              >
                Add {selectedToImport.length} {selectedToImport.length === 1 ? "event" : "events"}
              </button>
            </div>
          </div>
        </div>
      )}

      {step === "importing" && (
        <div className="import-card-body">
          <p className="import-status-line">
            Adding {progress.done} of {progress.total}…
          </p>
          <div className="import-footer">
            <button type="button" className="btn-primary btn-small" disabled>
              Adding…
            </button>
          </div>
        </div>
      )}

      {step === "done" && doneResult && (
        <div className="import-card-body">
          <p className="import-summary">
            Added {doneResult.added}, updated {doneResult.updated}, skipped {doneResult.skipped}.
            {unreadable.length > 0 && (
              <>
                {" "}
                {unreadable.length} {unreadable.length === 1 ? "event" : "events"} could not be read.
              </>
            )}
          </p>

          {unreadable.length > 0 && (
            <div className="import-unreadable-wrap">
              <div className="import-footer-group">
                <button
                  type="button"
                  className="btn-secondary btn-small clickable"
                  onClick={() => setShowUnreadable((s) => !s)}
                >
                  {showUnreadable ? "Hide details" : "Show unreadable details"}
                </button>
                <button
                  type="button"
                  className="btn-secondary btn-small clickable"
                  onClick={() => void copyToClipboard(unreadableDetailsText)}
                >
                  Copy details
                </button>
              </div>
              {showUnreadable && (
                <ul className="import-unreadable-list">
                  {unreadable.map((u, idx) => (
                    <li key={`${u.fileName}-${idx}`}>
                      <strong>{u.fileName}</strong>
                      {u.title ? ` (${u.title})` : ""}: {u.reason}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {doneResult.addedTimedCount > 0 && permState !== "granted" && (
            <div className="import-notif-prompt" role="status">
              <span>Turn on notifications so these events can alert you while Panga is open.</span>
              {permState === "default" && (
                <button
                  type="button"
                  className="btn-primary btn-small clickable"
                  onClick={() => void handleEnableNotifications()}
                >
                  Enable notifications
                </button>
              )}
              {permState === "denied" && (
                <span className="import-note">
                  Notifications are blocked in your browser. Allow them in site settings.
                </span>
              )}
            </div>
          )}

          <div className="import-footer">
            {(doneResult.added > 0 || doneResult.updated > 0) && (
              <button
                type="button"
                className="btn-secondary btn-small clickable"
                onClick={() => {
                  onViewTarget(doneResult.primaryView);
                  onClose();
                }}
              >
                {viewLinkLabel}
              </button>
            )}
            <div className="import-footer-group">
              <button
                type="button"
                className="btn-secondary btn-small clickable"
                onClick={resetToIdle}
              >
                Import more
              </button>
              <button
                type="button"
                className="btn-primary btn-small clickable"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {step === "error" && (
        <div className="import-card-body">
          <p className="pg-error" role="alert">
            {errorMsg || "Could not read the selected calendar files."}
          </p>
          <div className="import-footer">
            <button type="button" className="btn-secondary btn-small clickable" onClick={resetToIdle}>
              Try again
            </button>
            <button type="button" className="btn-secondary btn-small clickable" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
