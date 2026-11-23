import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { globalSearch, type SearchResult } from "../search/search";

const TYPE_ICON: Record<SearchResult["type"], string> = {
  folder: "[",
  file: "\u00f6", // file glyph
  taskList: "*",
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

  // Clicking a result takes you directly to the saved item.
  function goTo(result: SearchResult) {
    setOpen(false);
    setQuery("");
    navigate(result.route);
  }

  return (
    <>
      <button
        className="global-search-trigger clickable"
        data-tip="Search folders, files and task lists"
        data-tip-pos="bottom"
        onClick={() => setOpen(true)}
      >
        <span>[ Search ]</span>
        <kbd>Ctrl K</kbd>
      </button>

      {open && (
        <div className="search-overlay" onClick={() => setOpen(false)}>
          <div className="search-panel search-panel-open" onClick={(e) => e.stopPropagation()}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search folders, files, task lists…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="search-results">
              {query.trim() === "" ? (
                <p className="empty-state">Start typing to search folders, files and task lists.</p>
              ) : results.length === 0 ? (
                <p className="empty-state">No matches.</p>
              ) : (
                results.map((r) => (
                  <button key={r.key} className="search-card clickable" onClick={() => goTo(r)}>
                    <span className="search-card-icon">{TYPE_ICON[r.type]}</span>
                    <span className="search-card-body">
                      <span className="search-card-title">{r.title}</span>
                      <span className="search-card-sub">{r.subtitle}</span>
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
