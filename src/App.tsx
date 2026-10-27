import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import ProjectView from "./pages/ProjectView";
import Settings from "./pages/Settings";
import AppShell from "./components/AppShell";
import VoiceProvider from "./voice/VoiceProvider";
import { ensureSeedData } from "./data/db";
import { syncAll } from "./sync/sync";
import { restoreSession, canUseApp } from "./auth/session";
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
        try {
          await syncAll();
        } catch (e) {
          console.warn("Initial sync error:", e);
        }
      }
      setReady(true);
    });

    const handleFocus = () => {
      if (canUseApp()) {
        void syncAll();
      }
    };

    window.addEventListener("focus", handleFocus);
    // Periodically save/sync every 2 minutes if active
    const interval = setInterval(() => {
      if (canUseApp()) {
        void syncAll();
      }
    }, 120_000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, []);

  if (!ready) {
    return (
      <div className="page landing">
        <div className="landing-mark" data-tip="Panga">P</div>
        <h1>Panga</h1>
        <p>Project &amp; resource planner.</p>
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
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/project/:projectId" element={<ProjectView />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </VoiceProvider>
  );
}

export default App;
