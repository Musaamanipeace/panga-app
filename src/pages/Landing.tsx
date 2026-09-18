import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="page landing">
      <h1>Panga</h1>
      <p>Your personal, offline-first project &amp; resource planner.</p>
      <Link to="/dashboard" className="btn-primary">
        Open Dashboard
      </Link>
    </div>
  );
}
