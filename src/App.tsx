import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import PangaHome from "./pages/PangaHome";
import Settings from "./pages/Settings";
import AppShell from "./components/AppShell";
import VoiceProvider from "./voice/VoiceProvider";
import { warmupVoiceModel } from "./voice/warmup";
import { ensureSeedData } from "./data/db";
import { startReminderScheduler } from "./data/reminders";
import { canUseApp, restoreSession } from "./auth/session";
import { ToastContainer, ConfirmDialogHost } from "./components/ui";
import "./index.css";

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!canUseApp()) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void restoreSession().then(async () => {
      await ensureSeedData();
      if (canUseApp()) {
        void startReminderScheduler();
      }
      setReady(true);
      warmupVoiceModel();
    });
  }, []);

  if (!ready) {
    return (
      <div className="page landing">
        <div className="landing-mark" data-tip="Panga">P</div>
        <h1>Panga</h1>
        <p>Catch your thoughts. Tick off tasks.</p>
        <p style={{ color: "var(--color-text-muted)" }}>Loading…</p>
      </div>
    );
  }

  return (
    <VoiceProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            element={
              <RequireAuth>
                <AppShell />
              </RequireAuth>
            }
          >
            <Route path="/home" element={<PangaHome />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to={canUseApp() ? "/home" : "/"} replace />} />
        </Routes>
        <ToastContainer />
        <ConfirmDialogHost />
      </BrowserRouter>
    </VoiceProvider>
  );
}

export default App;
