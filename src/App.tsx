import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import ProjectView from "./pages/ProjectView";
import AppShell from "./components/AppShell";
import { ensureSeedData } from "./data/db";
import { isLoggedIn } from "./auth/session";
import "./index.css";

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!isLoggedIn()) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function App() {
  if (typeof window !== "undefined") {
    void ensureSeedData();
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/project/:projectId" element={<ProjectView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
