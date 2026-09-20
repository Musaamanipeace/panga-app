import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { globalSearch, type SearchResult } from "../search/search";

const TYPE_ICON: Record<SearchResult["type"], string> = {
  project: "📁",
  task: "☐",
  resource: "🔗",
  goal: "🎯",
  issue: "⚠",
  docEntry: "📄",
};

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  useEffect(() => {
    let cancelled = false;
    globalSearch(query).then((r) => {
      if (!cancelled) setResults(r);
    });
    return () => {
      cancelled = true;
    };
  }, [query]);

  function goTo(result: SearchResult) {
    setOpen(false);
    setQuery("");
    navigate(`/project/${result.projectId}`);
  }

  return (
    <>
      <button className="global-search-trigger" onClick={() => setOpen(true)}>
        <span>🔍 Search everything...</span>
        <kbd>Ctrl K</kbd>
      </button>

      {open && (
        <div className="search-overlay" onClick={() => setOpen(false)}>
          <div className="search-panel" onClick={(e) => e.stopPropagation()}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search projects, tasks, resources, goals, issues, docs..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="search-results">
              {query.trim() === "" ? (
                <p className="empty-state">Start typing to search across everything.</p>
              ) : results.length === 0 ? (
                <p className="empty-state">No matches.</p>
              ) : (
                results.map((r) => (
                  <button key={`${r.type}-${r.id}`} className="search-result-row" onClick={() => goTo(r)}>
                    <span className="search-result-icon">{TYPE_ICON[r.type]}</span>
                    <span className="search-result-text">
                      <span className="search-result-title">{r.title}</span>
                      <span className="search-result-subtitle">
                        {r.subtitle} · {r.projectName}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
