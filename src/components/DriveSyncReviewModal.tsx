// src/components/DriveSyncReviewModal.tsx
// Explicit user confirmation & conflict-resolution modal for Google Drive sync.

import type { DriveSyncReport, SnapshotSummary } from "../sync/googleDriveSync";

interface DriveSyncReviewModalProps {
  open: boolean;
  report: DriveSyncReport | null;
  busy: boolean;
  accountEmail?: string | null;
  onMerge: () => void;
  onPushLocal: () => void;
  onPullRemote: () => void;
  onClose: () => void;
}

function formatWhen(isoOrMs: string | number | null | undefined): string {
  if (!isoOrMs) return "None";
  const d = typeof isoOrMs === "number" ? new Date(isoOrMs) : new Date(isoOrMs);
  if (Number.isNaN(d.getTime())) return "Unknown";
  return d.toLocaleString();
}

function SummaryStats({ summary }: { summary: SnapshotSummary }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "4px 10px", fontSize: 12 }}>
      <span>Workspaces: {summary.workspaces}</span>
      <span>Task lists: {summary.taskLists}</span>
      <span>Tasks: {summary.tasks}</span>
      <span>Notes: {summary.notes}</span>
      <span>Links: {summary.links}</span>
      <span>Reminders: {summary.reminders}</span>
      <span>Clipboard: {summary.clips}</span>
      <span>Thoughts: {summary.thoughts}</span>
    </div>
  );
}

const STATUS_META: Record<DriveSyncReport["status"], { heading: string; explanation: string; isConflict?: boolean }> = {
  no_remote: {
    heading: "Create Google Drive backup?",
    explanation: "No Panga backup file exists in Google Drive yet. Confirm below to save a copy of your workspace.",
  },
  in_sync: {
    heading: "Google Drive is up to date",
    explanation: "Your local data already matches the backup stored in Google Drive. You can still confirm a manual overwrite or restore below.",
  },
  local_ahead: {
    heading: "Upload local changes to Google Drive?",
    explanation: "This device has changes that are not in your Google Drive backup yet. Confirm below to update Google Drive.",
  },
  remote_ahead: {
    heading: "Restore newer Google Drive backup?",
    explanation: "Your Google Drive backup has newer data than this device. Choose whether to restore it or keep this device's data.",
  },
  conflict: {
    heading: "Resolve conflict between local and Google Drive",
    explanation:
      "Both this device and your Google Drive backup changed independently. Merge keeps unique items and the latest edits from both; or choose one side explicitly.",
    isConflict: true,
  },
};

export default function DriveSyncReviewModal({
  open,
  report,
  busy,
  accountEmail,
  onMerge,
  onPushLocal,
  onPullRemote,
  onClose,
}: DriveSyncReviewModalProps) {
  if (!open || !report) return null;

  const meta = STATUS_META[report.status];
  const hasRemote = Boolean(report.remoteFile && report.remoteSnapshot && report.remoteSummary);
  const canMerge = hasRemote && report.status !== "in_sync";

  return (
    <div
      className="confirm-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={meta.heading}
        className="confirm-dialog drive-review-dialog"
      >
        <h3 style={{ margin: "0 0 6px", fontSize: 17 }}>{meta.heading}</h3>
        {accountEmail && (
          <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--color-text-muted)" }}>
            Google account: <strong>{accountEmail}</strong>
          </p>
        )}
        <p
          style={{
            margin: "0 0 14px",
            fontSize: 13,
            lineHeight: 1.5,
            color: meta.isConflict ? "var(--color-accent-milestone)" : "var(--color-text-muted)",
          }}
        >
          {meta.explanation}
        </p>

        <div className="drive-compare-grid">
          <div className="drive-compare-card">
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>This device (local)</div>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 8 }}>
              Latest edit: {formatWhen(report.localSummary.latestRecordAt || report.localSummary.exportedAt)}
            </div>
            <SummaryStats summary={report.localSummary} />
          </div>

          <div className="drive-compare-card">
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
              Google Drive ({report.remoteFile?.name ?? "panga-backup.json"})
            </div>
            {report.remoteSummary ? (
              <>
                <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 8 }}>
                  Modified: {formatWhen(report.remoteFile?.modifiedTime || report.remoteSummary.exportedAt)}
                </div>
                <SummaryStats summary={report.remoteSummary} />
              </>
            ) : (
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>No backup file found on Drive yet.</div>
            )}
          </div>
        </div>

        <div className="confirm-dialog-actions" style={{ marginTop: 16 }}>
          {canMerge && (
            <button
              type="button"
              className="btn-primary btn-small clickable"
              disabled={busy}
              onClick={onMerge}
            >
              {busy ? "Syncing…" : "Merge both & sync"}
            </button>
          )}
          <button
            type="button"
            className={report.status === "local_ahead" || report.status === "no_remote" ? "btn-primary btn-small clickable" : "btn-secondary btn-small clickable"}
            disabled={busy}
            onClick={onPushLocal}
          >
            {hasRemote ? "Overwrite Drive with local" : "Save backup to Drive"}
          </button>
          {hasRemote && (
            <button
              type="button"
              className={report.status === "remote_ahead" ? "btn-primary btn-small clickable" : "btn-secondary btn-small clickable"}
              disabled={busy}
              onClick={onPullRemote}
            >
              Restore Drive to device
            </button>
          )}
          <button
            type="button"
            className="btn-secondary btn-small clickable"
            disabled={busy}
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
