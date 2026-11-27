// src/sync/useGoogleDriveSync.ts
// Shared React hook coordinating Google Auth state, read-only Drive preflight checks,
// quiet debounced background auto-sync (prompting only on conflict), and user-confirmed actions.

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getDriveAccessToken,
  getGoogleAuthState,
  googleSignIn,
  googleSignOut,
  initGoogleAuth,
  subscribeGoogleAuth,
  type GoogleAuthState,
} from "./googleAuth";
import {
  deleteDriveBackup,
  DriveAuthExpiredError,
  getDriveSyncBaseline,
  inspectDriveSync,
  markLocalMutation,
  mergeAndSyncDrive,
  pullSnapshotFromDrive,
  pushSnapshotToDrive,
  type DriveSyncBaseline,
  type DriveSyncReport,
} from "./googleDriveSync";
import { getDriveAutoSyncEnabled } from "../data/accountSettings";
import { uploadPendingMediaToDrive } from "../data/media";
import { confirmAction, showToast } from "../components/ui";

const AUTO_SYNC_DEBOUNCE_MS = 2200;

let sharedAutoSyncInFlight: Promise<void> | null = null;
let sharedAutoSyncPendingAgain = false;

export interface UseGoogleDriveSyncOptions {
  /** Only AppShell should pass true so background listeners run once app-wide. */
  enableAutoSync?: boolean;
}

export function useGoogleDriveSync(options?: UseGoogleDriveSyncOptions) {
  const enableAutoSync = Boolean(options?.enableAutoSync);
  const [auth, setAuth] = useState<GoogleAuthState>(() => getGoogleAuthState());
  const [report, setReport] = useState<DriveSyncReport | null>(null);
  const [baseline, setBaseline] = useState<DriveSyncBaseline | null>(() =>
    getDriveSyncBaseline(getGoogleAuthState().user?.uid)
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalOpenRef = useRef(modalOpen);
  const busyRef = useRef(busy);
  modalOpenRef.current = modalOpen;
  busyRef.current = busy;

  const notifySyncStateUpdated = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("panga-drive-sync-updated"));
    }
  };

  useEffect(() => {
    initGoogleAuth();
    const unsub = subscribeGoogleAuth((next) => {
      setAuth(next);
      setBaseline(getDriveSyncBaseline(next.user?.uid));
    });
    const onSyncUpdate = () => {
      setBaseline(getDriveSyncBaseline(getGoogleAuthState().user?.uid));
    };
    window.addEventListener("panga-drive-sync-updated", onSyncUpdate);
    return () => {
      unsub();
      window.removeEventListener("panga-drive-sync-updated", onSyncUpdate);
    };
  }, []);

  const ensureTokenInteractive = useCallback(async (): Promise<{ token: string; uid: string; email: string | null } | null> => {
    const existingToken = await getDriveAccessToken();
    const curUser = getGoogleAuthState().user;
    if (existingToken && curUser) {
      return { token: existingToken, uid: curUser.uid, email: curUser.email };
    }
    const res = await googleSignIn();
    return { token: res.accessToken, uid: res.user.uid, email: res.user.email };
  }, []);

  const refreshInspection = useCallback(
    async (opts?: { interactive?: boolean; openReview?: boolean }): Promise<DriveSyncReport | null> => {
      setError(null);
      setChecking(true);
      try {
        let token = await getDriveAccessToken();
        let uid = getGoogleAuthState().user?.uid ?? null;
        if (!token) {
          if (!opts?.interactive) {
            return null;
          }
          const signedIn = await googleSignIn();
          token = signedIn.accessToken;
          uid = signedIn.user.uid;
        }
        const nextReport = await inspectDriveSync(token, uid);
        setReport(nextReport);
        setBaseline(getDriveSyncBaseline(uid));
        if (opts?.openReview) {
          setModalOpen(true);
        }
        return nextReport;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Could not check Google Drive.";
        setError(msg);
        if (err instanceof DriveAuthExpiredError) {
          showToast(msg, "error");
        } else if (opts?.interactive || opts?.openReview) {
          showToast(msg, "error");
        }
        return null;
      } finally {
        setChecking(false);
      }
    },
    []
  );

  const runQuietAutoSync = useCallback(async () => {
    if (!getDriveAutoSyncEnabled()) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) return;
    if (modalOpenRef.current || busyRef.current) return;

    const token = await getDriveAccessToken();
    const uid = getGoogleAuthState().user?.uid ?? null;
    if (!token || !uid) return;

    if (sharedAutoSyncInFlight) {
      sharedAutoSyncPendingAgain = true;
      return sharedAutoSyncInFlight;
    }

    const execute = async () => {
      try {
        // Upload any cached local media blobs first so exported snapshots include their Drive routes.
        await uploadPendingMediaToDrive(token).catch(() => {});

        const rep = await inspectDriveSync(token, uid);
        setReport(rep);
        setBaseline(getDriveSyncBaseline(uid));

        if (rep.status === "no_remote" || rep.status === "local_ahead") {
          const next = await pushSnapshotToDrive(token, {
            uid,
            fileId: rep.remoteFile?.id ?? null,
            snapshot: rep.localSnapshot,
          });
          setBaseline(next);
          notifySyncStateUpdated();
        } else if (rep.status === "remote_ahead" && rep.remoteFile && rep.remoteSnapshot) {
          const next = await pullSnapshotFromDrive({
            uid,
            remoteFile: rep.remoteFile,
            remoteSnapshot: rep.remoteSnapshot,
          });
          setBaseline(next);
          notifySyncStateUpdated();
        } else if (rep.status === "conflict") {
          // Prompt only when a genuine two-way conflict occurs — never silently overwrite.
          setModalOpen(true);
        }
      } catch (err: unknown) {
        if (err instanceof DriveAuthExpiredError) {
          setError(err.message);
        }
        // Keep background errors non-intrusive; next edit or reconnect retries cleanly.
      }
    };

    sharedAutoSyncInFlight = execute().finally(() => {
      sharedAutoSyncInFlight = null;
      if (sharedAutoSyncPendingAgain) {
        sharedAutoSyncPendingAgain = false;
        void runQuietAutoSync();
      }
    });
    return sharedAutoSyncInFlight;
  }, []);

  // Quiet background auto-sync coordinator (active in AppShell).
  useEffect(() => {
    if (!enableAutoSync) return;
    let debounceTimer: number | undefined;

    function scheduleSync(delayMs = AUTO_SYNC_DEBOUNCE_MS) {
      if (!getDriveAutoSyncEnabled()) return;
      if (debounceTimer !== undefined) window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(() => {
        debounceTimer = undefined;
        void runQuietAutoSync();
      }, delayMs);
    }

    function onLocalMutated() {
      markLocalMutation();
      scheduleSync(AUTO_SYNC_DEBOUNCE_MS);
    }

    function onOnline() {
      scheduleSync(400);
    }

    window.addEventListener("panga-local-mutated", onLocalMutated);
    window.addEventListener("online", onOnline);
    return () => {
      if (debounceTimer !== undefined) window.clearTimeout(debounceTimer);
      window.removeEventListener("panga-local-mutated", onLocalMutated);
      window.removeEventListener("online", onOnline);
    };
  }, [enableAutoSync, runQuietAutoSync]);

  // Trigger a gentle initial quiet sync whenever an active Drive access token becomes available.
  useEffect(() => {
    if (!enableAutoSync) return;
    if (!auth.user || !auth.hasAccessToken) return;
    const t = window.setTimeout(() => {
      void runQuietAutoSync();
    }, 350);
    return () => window.clearTimeout(t);
  }, [enableAutoSync, auth.user, auth.hasAccessToken, runQuietAutoSync]);

  const handleSignInOnly = useCallback(async () => {
    setError(null);
    try {
      const signed = await googleSignIn();
      setBaseline(getDriveSyncBaseline(signed.user.uid));
      showToast(`Signed in as ${signed.user.email || "Google user"}.`, "success");
      return signed;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed.";
      setError(msg);
      showToast(msg, "error");
      return null;
    }
  }, []);

  const openSyncReview = useCallback(async () => {
    return refreshInspection({ interactive: true, openReview: true });
  }, [refreshInspection]);

  const handleMerge = useCallback(async (): Promise<boolean> => {
    if (!report) return false;
    setBusy(true);
    setError(null);
    try {
      const session = await ensureTokenInteractive();
      if (!session) return false;
      const next = await mergeAndSyncDrive(session.token, { uid: session.uid, report });
      setBaseline(next);
      setModalOpen(false);
      notifySyncStateUpdated();
      showToast("Merged local and Google Drive backups.", "success");
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to merge and sync with Google Drive.";
      setError(msg);
      showToast(msg, "error");
      return false;
    } finally {
      setBusy(false);
    }
  }, [report, ensureTokenInteractive]);

  const handlePushLocal = useCallback(async (): Promise<boolean> => {
    if (!report) return false;
    setBusy(true);
    setError(null);
    try {
      const session = await ensureTokenInteractive();
      if (!session) return false;
      const next = await pushSnapshotToDrive(session.token, {
        uid: session.uid,
        fileId: report.remoteFile?.id ?? null,
        snapshot: report.localSnapshot,
      });
      setBaseline(next);
      setModalOpen(false);
      notifySyncStateUpdated();
      showToast("Saved backup to Google Drive.", "success");
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save backup to Google Drive.";
      setError(msg);
      showToast(msg, "error");
      return false;
    } finally {
      setBusy(false);
    }
  }, [report, ensureTokenInteractive]);

  const handlePullRemote = useCallback(async (): Promise<boolean> => {
    if (!report?.remoteFile || !report.remoteSnapshot) return false;
    setBusy(true);
    setError(null);
    try {
      const uid = getGoogleAuthState().user?.uid ?? null;
      const next = await pullSnapshotFromDrive({
        uid,
        remoteFile: report.remoteFile,
        remoteSnapshot: report.remoteSnapshot,
      });
      setBaseline(next);
      setModalOpen(false);
      notifySyncStateUpdated();
      showToast("Restored backup from Google Drive.", "success");
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to restore backup from Google Drive.";
      setError(msg);
      showToast(msg, "error");
      return false;
    } finally {
      setBusy(false);
    }
  }, [report]);

  const handleDeleteRemoteBackup = useCallback(async (): Promise<boolean> => {
    setError(null);
    setBusy(true);
    try {
      const session = await ensureTokenInteractive();
      if (!session) return false;
      const current = await inspectDriveSync(session.token, session.uid);
      if (!current.remoteFile) {
        showToast("No Google Drive backup file was found to delete.", "info");
        return false;
      }
      const confirmed = await confirmAction({
        title: "Delete Google Drive backup?",
        message: `This will permanently delete "${current.remoteFile.name}" from your Google Drive. Local data on this device will stay intact.`,
        confirmLabel: "Delete backup",
        cancelLabel: "Cancel",
        danger: true,
      });
      if (!confirmed) return false;
      await deleteDriveBackup(session.token, { uid: session.uid, fileId: current.remoteFile.id });
      setBaseline(null);
      setReport(null);
      notifySyncStateUpdated();
      showToast("Deleted Google Drive backup.", "info");
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete Google Drive backup.";
      setError(msg);
      showToast(msg, "error");
      return false;
    } finally {
      setBusy(false);
    }
  }, [ensureTokenInteractive]);

  const handleSignOut = useCallback(async () => {
    await googleSignOut();
    setReport(null);
    setModalOpen(false);
    setError(null);
    notifySyncStateUpdated();
    showToast("Signed out of Google.", "info");
  }, []);

  return {
    auth,
    report,
    baseline,
    modalOpen,
    checking,
    busy,
    error,
    setModalOpen,
    handleSignInOnly,
    refreshInspection,
    runQuietAutoSync,
    openSyncReview,
    handleMerge,
    handlePushLocal,
    handlePullRemote,
    handleDeleteRemoteBackup,
    handleSignOut,
  };
}
