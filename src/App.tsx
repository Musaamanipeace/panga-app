import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import ProjectView from "./pages/ProjectView";
import Settings from "./pages/Settings";
import AppShell from "./components/AppShell";
import { ensureSeedData } from "./data/db";
import { syncAll, restoreSession } from "./sync/sync";
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
        if (isLoggedIn()) {
          void syncAll();
        }
        setReady(true);
      });
    });

    const handleFocus = () => {
      if (isLoggedIn()) {
        void syncAll();
      }
    };

    window.addEventListener("focus", handleFocus);
    // Periodically save/sync every 2 minutes if active
    const interval = setInterval(() => {
      if (isLoggedIn()) {
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
