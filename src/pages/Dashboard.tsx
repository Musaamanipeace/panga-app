export default function Dashboard() {
  return (
    <div className="page dashboard">
      <header className="page-header">
        <h1>Projects</h1>
        {/* Global search + add-project action land here in Stage 3 */}
      </header>
      <p className="empty-state">
        No projects yet — the Projects module (Dexie-backed) arrives in
        Stage 2.
      </p>
    </div>
  );
}
