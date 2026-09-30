import { useEffect, useRef, useState, type ReactNode } from "react";

/* -------------------------------------------------------------------------
   Slide — the single motion primitive.

   A `key` change on the child slides the new panel in from the direction given.
   Direction is derived from the index of the incoming value, so moving right
   through tabs always enters from the right and back always enters from the
   left, however the user arrived.
   ------------------------------------------------------------------------- */

interface SlideProps {
  /** Identity of the visible panel. Changing it animates. */
  slideKey: string;
  /** Position in the sequence, used to pick the direction. */
  order?: number;
  previousOrder?: number;
  children: ReactNode;
  className?: string;
}

export function Slide({
  slideKey,
  order = 0,
  previousOrder = 0,
  children,
  className,
}: SlideProps) {
  const [direction, setDirection] = useState<"left" | "right">("right");

  useEffect(() => {
    setDirection(order >= previousOrder ? "right" : "left");
  }, [slideKey, order, previousOrder]);

  return (
    <div className={className ? `slide-panel ${className}` : "slide-panel"}>
      <div
        key={slideKey}
        className={
          direction === "right" ? "slide-panel-enter-right" : "slide-panel-enter-left"
        }
        style={{ minWidth: 0 }}
      >
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   Drawer — panels and forms enter from the edge they belong to.
   ------------------------------------------------------------------------- */

export type DrawerEdge = "right" | "left" | "bottom";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  edge?: DrawerEdge;
  children: ReactNode;
  footer?: ReactNode;
  /** Tips for the close control; usually describes what closing discards. */
  closeTip?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  edge = "right",
  children,
  footer,
  closeTip = "Close without saving",
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={`drawer-backdrop drawer-backdrop-${edge}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <header className="drawer-header">
          <h2>{title}</h2>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            aria-label="Close"
            data-tip={closeTip}
            data-tip-edge="left"
          >
            Close
          </button>
        </header>
        <div className="drawer-body">{children}</div>
        {footer && <footer className="drawer-footer">{footer}</footer>}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   Disclosure — lists expand and collapse.
   ------------------------------------------------------------------------- */

interface DisclosureProps {
  label: string;
  count?: number;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function Disclosure({ label, count, defaultOpen = true, children }: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        type="button"
        className="disclosure"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        data-tip={open ? `Collapse ${label.toLowerCase()}` : `Expand ${label.toLowerCase()}`}
      >
        <span className="disclosure-marker" aria-hidden="true" />
        <span>
          {label}
          {count !== undefined && <span className="tab-btn-count">{count}</span>}
        </span>
      </button>
      {open && <div className="collapsible">{children}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------------
   Editable text — every saved item can be renamed in place.
   ------------------------------------------------------------------------- */

interface EditableProps {
  value: string;
  onSave: (value: string) => void | Promise<void>;
  placeholder?: string;
  className?: string;
  label?: string;
  multiline?: boolean;
}

export function Editable({
  value,
  onSave,
  placeholder,
  className,
  label = "Rename",
  multiline = false,
}: EditableProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  async function commit() {
    const trimmed = draft.trim();
    setEditing(false);
    if (trimmed && trimmed !== value) await onSave(trimmed);
    else setDraft(value);
  }

  if (!editing) {
    return (
      <button
        type="button"
        className={className ? `editable-view ${className}` : "editable-view"}
        onClick={() => setEditing(true)}
        data-tip={label}
      >
        {value || <span className="faint">{placeholder ?? "Untitled"}</span>}
      </button>
    );
  }

  const shared = {
    autoFocus: true,
    value: draft,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDraft(e.target.value),
    onBlur: commit,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !multiline) {
        e.preventDefault();
        void commit();
      }
      if (e.key === "Escape") {
        setDraft(value);
        setEditing(false);
      }
    },
  };

  return multiline ? (
    <textarea {...shared} rows={4} placeholder={placeholder} />
  ) : (
    <input type="text" {...shared} placeholder={placeholder} />
  );
}

/* -------------------------------------------------------------------------
   Status labels — text and CSS shapes only, never emoji.
   ------------------------------------------------------------------------- */

export function StatusLabel({
  status,
  className = "",
}: {
  status: string;
  className?: string;
}) {
  return <span className={`chip-small ${className}`}>{status.replace(/_/g, " ")}</span>;
}

export function SeverityMark({ severity }: { severity: "low" | "medium" | "high" }) {
  return (
    <span
      className={`mark mark-severity mark-severity-${severity}`}
      data-tip={`${severity} severity`}
      aria-label={`${severity} severity`}
    />
  );
}

/* -------------------------------------------------------------------------
   Async states — a failure always says what happened, never sits on
   "Loading..." forever.
   ------------------------------------------------------------------------- */

export function Loading({ label = "Loading..." }: { label?: string }) {
  return <p className="empty-state">{label}</p>;
}

export function ErrorNote({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <div className="error-banner" role="alert">
      <h2>Something went wrong</h2>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn-secondary btn-small" onClick={onRetry} data-tip="Run this load again">
          Try again
        </button>
      )}
    </div>
  );
}

/** Reads a promise, exposing an error instead of leaving the UI pending. */
export function useAsync<T>(load: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      setData(await load());
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let live = true;
    setLoading(true);
    setError(null);
    const promise = load();
    if (promise && typeof promise.then === "function") {
      promise
        .then((value) => live && setData(value))
        .catch((err) => live && setError(err))
        .finally(() => live && setLoading(false));
    } else {
      live && setError(new Error("load() must return a promise"));
      live && setLoading(false);
    }
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, error, loading, reload: run, setData };
}

/* -------------------------------------------------------------------------
   Toast — lightweight, self-dismissing notification system
------------------------------------------------------------------------- */

type ToastType = "info" | "success" | "error";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  durationMs?: number;
}

const toastState: {
  toasts: Toast[];
  listeners: Array<() => void>;
} = {
  toasts: [],
  listeners: [],
};

function emitChange() {
  toastState.listeners.forEach((l) => l());
}

export function showToast(message: string, type: ToastType = "info", durationMs = 2800) {
  const toast: Toast = { id: crypto.randomUUID(), message, type, durationMs };
  toastState.toasts.push(toast);
  emitChange();

  setTimeout(() => {
    const idx = toastState.toasts.findIndex((t) => t.id === toast.id);
    if (idx >= 0) {
      toastState.toasts.splice(idx, 1);
      emitChange();
    }
  }, durationMs);
}

export function useToasts() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const listener = () => setTick((n) => n + 1);
    toastState.listeners.push(listener);
    return () => {
      const idx = toastState.listeners.indexOf(listener);
      if (idx >= 0) toastState.listeners.splice(idx, 1);
    };
  }, []);
  return toastState.toasts;
}

export function ToastContainer() {
  const toasts = useToasts();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.style.cssText = `
      position: fixed; bottom: 16px; right: 16px; z-index: 9999;
      display: flex; flex-direction: column; gap: 8px; pointer-events: none;
    `;
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div ref={containerRef}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast-${t.type}`}
          style={{
            pointerEvents: "auto",
            padding: "10px 14px",
            background: t.type === "error" ? "#fef2f2" : t.type === "success" ? "#f0fdf4" : "#eff6ff",
            color: t.type === "error" ? "#991b1b" : t.type === "success" ? "#166534" : "#1e40af",
            border: `1px solid ${t.type === "error" ? "#fecaca" : t.type === "success" ? "#bbf7d0" : "#bfdbfe"}`,
            borderRadius: "var(--radius-sm)",
            fontSize: "13px",
            fontWeight: 500,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            animation: "slideIn 0.2s ease-out",
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.cssText = "position: fixed; left: -9999px; top: 0;";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    showToast("Copied to clipboard", "success");
    return true;
  } catch {
    showToast("Failed to copy to clipboard", "error");
    return false;
  }
}
