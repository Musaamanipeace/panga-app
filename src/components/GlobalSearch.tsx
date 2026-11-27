import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { globalSearch, type SearchResult } from "../search/search";
import { getActiveWorkspaceId, switchWorkspace } from "../data/workspaces";
import { notifyWorkspaceUpdated } from "../ai/agent";

const TYPE_LABEL: Record<SearchResult["type"], string> = {
  folder: "Folder",
  file: "Item",
  taskList: "Task list",
};

interface Props {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function GlobalSearch({ open: controlledOpen, onOpenChange }: Props = {}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = (next: boolean) => {
    if (onOpenChange) onOpenChange(next);
    else setUncontrolledOpen(next);
  };

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (controlledOpen === undefined && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setUncontrolledOpen((o) => !o);
      }
      if (e.key === "Escape" && open) {
        if (onOpenChange) onOpenChange(false);
        else setUncontrolledOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    const onAssistantSearch = (e: Event) => {
      const q = (e as CustomEvent<{ query?: string }>).detail?.query;
      if (typeof q === "string") setQuery(q);
      if (controlledOpen === undefined) setUncontrolledOpen(true);
    };
    window.addEventListener("panga-open-search", onAssistantSearch);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("panga-open-search", onAssistantSearch);
    };
  }, [controlledOpen, onOpenChange, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void globalSearch(query).then((r) => {
      if (!cancelled) setResults(r);
    });
    return () => {
      cancelled = true;
    };
  }, [query, open]);

  async function goTo(result: SearchResult) {
    if (!result.skipWorkspaceSwitch && result.workspaceId !== getActiveWorkspaceId()) {
      await switchWorkspace(result.workspaceId);
      notifyWorkspaceUpdated();
    }
    setOpen(false);
    setQuery("");
    navigate(result.route);
  }

  return (
    <>
      <button
        type="button"
        className="global-search-trigger clickable"
        data-tip="Search across all workspaces"
        data-tip-pos="bottom"
        onClick={() => setOpen(true)}
      >
        <span>Search</span>
        <kbd>Ctrl+K</kbd>
      </button>

      {open && (
        <div
          className="search-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Global cross-workspace search"
          onClick={() => setOpen(false)}
        >
          <div className="search-panel search-panel-open" onClick={(e) => e.stopPropagation()}>
            <div className="search-head-row">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search across all workspaces…"
                aria-label="Search across all workspaces"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="button"
                className="modal-close-x clickable"
                aria-label="Close search"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="search-results">
              {query.trim() === "" ? (
                <p className="empty-state">Start typing to search notes, tasks, links, media, and folders across all workspaces.</p>
              ) : results.length === 0 ? (
                <p className="empty-state">No matches across any workspace.</p>
              ) : (
                results.map((r) => (
                  <button key={r.key} type="button" className="search-card clickable" onClick={() => void goTo(r)}>
                    <span className="search-card-icon">{TYPE_LABEL[r.type]}</span>
                    <span className="search-card-body">
                      <span className="search-card-title">{r.title}</span>
                      <span className="search-card-sub">
                        <span className="search-card-ws">{r.workspaceName}</span>
                        {" · "}
                        {r.subtitle}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
            <div className="panel-foot-row">
              <button type="button" className="btn-secondary btn-small clickable" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
