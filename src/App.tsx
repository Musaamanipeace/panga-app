import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import ProjectView from "./pages/ProjectView";
import Settings from "./pages/Settings";
import AppShell from "./components/AppShell";
import { ensureSeedData } from "./data/db";
import { syncAll, isSupabaseConfigured } from "./sync/supabaseSync";
import { isLoggedIn } from "./auth/session";
import "./index.css";

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!isLoggedIn()) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function App() {
  useEffect(() => {
    void ensureSeedData().then(() => {
      if (isLoggedIn() && isSupabaseConfigured()) {
        void syncAll().then((result) => {
          if (!result.ok) console.warn("Supabase Sync warning:", result.message);
        });
      }
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
