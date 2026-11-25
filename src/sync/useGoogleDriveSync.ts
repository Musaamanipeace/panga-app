// src/sync/useGoogleDriveSync.ts
// Shared React hook coordinating Google Auth state, read-only Drive preflight checks,
// online/offline conflict alerts, and user-confirmed Drive backup mutations.

import { useCallback, useEffect, useState } from "react";
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
  mergeAndSyncDrive,
  pullSnapshotFromDrive,
  pushSnapshotToDrive,
  type DriveSyncBaseline,
  type DriveSyncReport,
} from "./googleDriveSync";
import { confirmAction, showToast } from "../components/ui";

export function useGoogleDriveSync() {
  const [auth, setAuth] = useState<GoogleAuthState>(() => getGoogleAuthState());
  const [report, setReport] = useState<DriveSyncReport | null>(null);
  const [baseline, setBaseline] = useState<DriveSyncBaseline | null>(() =>
    getDriveSyncBaseline(getGoogleAuthState().user?.uid)
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initGoogleAuth();
    return subscribeGoogleAuth((next) => {
      setAuth(next);
      setBaseline(getDriveSyncBaseline(next.user?.uid));
    });
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

  // Read-only background preflight when coming back online with an active Drive token.
  useEffect(() => {
    function onOnline() {
      if (!auth.user || !auth.hasAccessToken) return;
      void refreshInspection({ interactive: false, openReview: false }).then((rep) => {
        if (!rep) return;
        if (rep.status === "conflict") {
          showToast("Google Drive conflict detected — review sync in Settings.", "error");
        } else if (rep.status === "remote_ahead") {
          showToast("Google Drive has a newer backup — review restore in Settings.", "info");
        }
      });
    }
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [auth.user, auth.hasAccessToken, refreshInspection]);

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
    openSyncReview,
    handleMerge,
    handlePushLocal,
    handlePullRemote,
    handleDeleteRemoteBackup,
    handleSignOut,
  };
}
