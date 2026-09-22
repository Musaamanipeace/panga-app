import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import ProjectView from "./pages/ProjectView";
import AppShell from "./components/AppShell";
import { ensureSeedData } from "./data/db";
import "./index.css";

function App() {
  if (typeof window !== "undefined") {
    void ensureSeedData();
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/project/:projectId" element={<ProjectView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
