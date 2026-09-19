import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSearchableEntities,
  useLiveQuery,
  type SearchableEntityType,
} from "../data";
import { rebuildSearchIndex, searchEntities } from "../search";

const typeLabels: Record<SearchableEntityType, string> = {
  project: "Projects",
  task: "Tasks",
  resource: "Resources",
  doc: "Documentation",
  goal: "Goals",
  issue: "Issues",
  contact: "Contacts",
  reminder: "Reminders",
};

const typeOrder: SearchableEntityType[] = [
  "project",
  "task",
  "resource",
  "doc",
  "goal",
  "issue",
  "contact",
  "reminder",
];

type SearchOverlayProps = {
  onClose: () => void;
};

export default function SearchOverlay({ onClose }: SearchOverlayProps) {
  const navigate = useNavigate();
  const entities = useLiveQuery(() => getSearchableEntities(), [], []);
  const [query, setQuery] = useState("");

  useEffect(() => {
    void rebuildSearchIndex();
  }, []);

  useEffect(() => {
    void rebuildSearchIndex();
  }, [entities]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const results = useMemo(() => searchEntities(query), [query]);
  const groupedResults = useMemo(() => {
    const groups = new Map<SearchableEntityType, typeof results>();
    for (const result of results) {
      const current = groups.get(result.type) ?? [];
      current.push(result);
      groups.set(result.type, current);
    }
    return groups;
  }, [results]);

  return (
    <div className="overlay-backdrop" onMouseDown={onClose}>
      <section aria-labelledby="search-title" aria-modal="true" className="search-overlay" role="dialog" onMouseDown={(event) => event.stopPropagation()}>
        <header className="search-header">
          <h2 id="search-title">Search Panga</h2>
          <button aria-label="Close search" className="icon-btn" onClick={onClose} type="button">
            ×
          </button>
        </header>
        <input
          autoFocus
          aria-label="Search all projects and resources"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search tasks, resources, docs, goals, people…"
          type="search"
          value={query}
        />
        <div className="search-results">
          {query.trim() && results.length === 0 ? (
            <p className="search-empty">No results for “{query.trim()}”.</p>
          ) : null}
          {!query.trim() ? (
            <p className="search-hint">Start typing to search every project, task, resource, document, goal, issue, contact, and reminder.</p>
          ) : null}
          {typeOrder.map((type) => {
            const items = groupedResults.get(type);
            if (!items?.length) return null;
            return (
              <section className="search-group" key={type}>
                <h3>{typeLabels[type]}</h3>
                {items.map((item) => (
                  <button
                    className="search-result"
                    key={`${type}-${item.id}`}
                    onClick={() => {
                      onClose();
                      navigate(item.path);
                    }}
                    type="button"
                  >
                    <span className={`result-icon ${type}${item.category ? ` ${item.category}` : ""}`}>{type.slice(0, 1).toUpperCase()}</span>
                    <span className="result-copy">
                      <strong>{item.title}</strong>
                      <small>{item.projectId ?? (type === "contact" ? "Global contact" : "Global")}</small>
                    </span>
                    <span className="result-category">{item.category?.replaceAll("_", " ")}</span>
                  </button>
                ))}
              </section>
            );
          })}
        </div>
      </section>
    </div>
  );
}
