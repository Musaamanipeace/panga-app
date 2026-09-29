import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import ProjectView from "./pages/ProjectView";
import Settings from "./pages/Settings";
import AppShell from "./components/AppShell";
import { ensureSeedData } from "./data/db";
import { syncAll, isSupabaseConfigured, restoreSession } from "./sync/supabaseSync";
import { isLoggedIn } from "./auth/session";
import "./index.css";

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!isLoggedIn()) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void restoreSession().then(() => {
      void ensureSeedData().then(() => {
        if (isLoggedIn() && isSupabaseConfigured()) {
          void syncAll().then((result) => {
            if (!result.ok) console.warn("Supabase Sync warning:", result.message);
          });
        }
        setReady(true);
      });
    });

    const handleFocus = () => {
      if (isSupabaseConfigured() && isLoggedIn()) {
        void syncAll();
      }
    };

    window.addEventListener("focus", handleFocus);
    // Periodically sync every 2 minutes if active
    const interval = setInterval(() => {
      if (isSupabaseConfigured() && isLoggedIn()) {
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
  );
}

export default App;
