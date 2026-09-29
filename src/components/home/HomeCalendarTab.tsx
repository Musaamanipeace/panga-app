import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  listAllCalendarEvents,
  createLocalEvent,
  deleteCalendarEvent,
  type CalendarEvent,
  type CalendarEventSource,
} from "../../data/calendar";
import { listAllProjects } from "../../data/projects";
import { db } from "../../data/db";
import { newId, now } from "../../data/utils";

export default function HomeCalendarTab() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [projects, setProjects] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [viewDate, setViewDate] = useState<Date>(new Date());

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [hangoutLink, setHangoutLink] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState(false);

  // ICS Import
  const [icsFile, setIcsFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showImport, setShowImport] = useState(false);

  async function refresh() {
    const [allEvents, allProjects] = await Promise.all([
      listAllCalendarEvents(),
      listAllProjects(),
    ]);
    setEvents(allEvents);
    const pMap: Record<string, string> = {};
    for (const p of allProjects) {
      pMap[p.id] = p.name;
    }
    setProjects(pMap);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleAddEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !startAt || !endAt) return;
    await createLocalEvent({
      projectId: selectedProjectId || null,
      title: title.trim(),
      description: description.trim(),
      startAt: new Date(startAt).getTime(),
      endAt: new Date(endAt).getTime(),
      hangoutLink: hangoutLink.trim() || null,
    });
    setTitle("");
    setDescription("");
    setStartAt("");
    setEndAt("");
    setHangoutLink("");
    setSelectedProjectId("");
    setShowAddForm(false);
    refresh();
  }

  function parseIcsDate(val: string): number {
    if (!val) return Date.now();
    const trimmed = val.trim();
    const m = trimmed.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?/);
    if (m) {
      const [, yr, mo, da, hr, mi, se, z] = m;
      if (z) {
        return Date.UTC(+yr, +mo - 1, +da, +(hr || 0), +(mi || 0), +(se || 0));
      } else {
        return new Date(+yr, +mo - 1, +da, +(hr || 0), +(mi || 0), +(se || 0)).getTime();
      }
    }
    const date = new Date(trimmed);
    return isNaN(date.getTime()) ? Date.now() : date.getTime();
  }

  function parseIcs(text: string) {
    const parsed: Array<{ title?: string; description?: string; startAt: number; endAt: number; hangoutLink?: string }> = [];
    const lines = text.split(/\r?\n/);
    let current: Partial<{ title?: string; description?: string; startAt: number; endAt: number; hangoutLink?: string }> | null = null;

    for (const line of lines) {
      if (line.startsWith("BEGIN:VEVENT")) {
        current = {};
      } else if (line.startsWith("END:VEVENT") && current) {
        if (current.startAt && current.endAt) parsed.push(current as any);
        current = null;
      } else if (current) {
        if (line.startsWith("SUMMARY:")) current.title = line.slice(8).trim();
        else if (line.startsWith("DESCRIPTION:")) current.description = line.slice(12).trim();
        else if (line.startsWith("DTSTART:") || line.startsWith("DTSTART;")) {
          const val = line.split(":")[1];
          current.startAt = parseIcsDate(val);
        } else if (line.startsWith("DTEND:") || line.startsWith("DTEND;")) {
          const val = line.split(":")[1];
          current.endAt = parseIcsDate(val);
        } else if (line.startsWith("X-GOOGLE-HANGOUT:") || line.startsWith("X-MICROSOFT-TEAMS:") || line.includes("hangoutLink")) {
          current.hangoutLink = line.split(":").slice(1).join(":").trim();
        }
      }
    }
    return parsed;
  }

  async function handleIcsImport(e: React.FormEvent) {
    e.preventDefault();
    if (!icsFile) return;
    setImporting(true);
    setImportStatus(null);
    try {
      const text = await icsFile.text();
      const parsedEvents = parseIcs(text);
      if (parsedEvents.length === 0) {
        setImportStatus({ message: "No events found in the .ics file.", type: "error" });
        return;
      }
      const toImport = parsedEvents.map((ev) => ({
        id: `google_${newId()}`,
        projectId: null,
        title: ev.title ?? "(no title)",
        description: ev.description ?? null,
        startAt: ev.startAt,
        endAt: ev.endAt,
        source: "google" as CalendarEventSource,
        hangoutLink: ev.hangoutLink ?? null,
        syncedAt: Date.now(),
        createdAt: now(),
        updatedAt: now(),
        syncStatus: "pending" as const,
      }));
      await db.calendarEvents.bulkPut(toImport);
      const { syncPushRecord } = await import("../../sync/sync");
      for (const ev of toImport) void syncPushRecord("calendar_events", ev);
      setImportStatus({ message: `Successfully imported ${toImport.length} event(s) from .ics file.`, type: "success" });
      setIcsFile(null);
      refresh();
    } catch (err) {
      setImportStatus({
        message: "Failed to parse .ics file: " + (err instanceof Error ? err.message : String(err)),
        type: "error",
      });
    } finally {
      setImporting(false);
    }
  }

  // Month grid calculations
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleString("default", { month: "long", year: "numeric" });
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  function prevMonth() {
    setViewDate(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setViewDate(new Date(year, month + 1, 1));
  }
  function gotoToday() {
    setViewDate(new Date());
  }

  function selectDay(day: number) {
    const pad = (n: number) => String(n).padStart(2, "0");
    const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
    setStartAt(`${dateStr}T09:00`);
    setEndAt(`${dateStr}T10:00`);
    setShowAddForm(true);
  }

  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div>
      {/* Top action row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className="btn-primary clickable"
            onClick={() => setShowAddForm((s) => !s)}
            data-tip="Schedule a new calendar event"
          >
            {showAddForm ? "Close event form" : "+ Add event"}
          </button>
          <button
            type="button"
            className="btn-secondary clickable"
            onClick={() => setShowImport((s) => !s)}
            data-tip="Import events from Google Calendar .ics export"
          >
            {showImport ? "Close import" : "Import .ics"}
          </button>
        </div>

        <div className="btn-row">
          <button
            type="button"
            className={`chip ${viewMode === "grid" ? "chip-active" : ""}`}
            onClick={() => setViewMode("grid")}
            data-tip="Month grid calendar view"
          >
            Grid view
          </button>
          <button
            type="button"
            className={`chip ${viewMode === "list" ? "chip-active" : ""}`}
            onClick={() => setViewMode("list")}
            data-tip="Chronological list view"
          >
            List view
          </button>
        </div>
      </div>

      {/* ICS Import Drawer/Section */}
      {showImport && (
        <section className="dashboard-section" style={{ background: "white", padding: 14, border: "1px solid var(--color-border)", borderRadius: "var(--radius)", marginBottom: 16 }}>
          <h3 className="section-heading">Import from Google Calendar</h3>
          <p className="form-note">
            Export your Google Calendar as an .ics file (Google Calendar → Settings → Import &amp; export → Export),
            then upload it here. Events will be imported into Panga.
          </p>
          {importStatus && (
            <p className={importStatus.type === "error" ? "otp-error" : "progress-label"} style={{ margin: "6px 0" }}>
              {importStatus.message}
            </p>
          )}
          <form className="resource-form" onSubmit={handleIcsImport}>
            <input
              type="file"
              accept=".ics"
              onChange={(e) => setIcsFile(e.target.files?.[0] ?? null)}
              data-tip="Select exported .ics file"
            />
            <button type="submit" className="btn-primary clickable" disabled={importing || !icsFile}>
              {importing ? "Importing..." : "Import .ics file"}
            </button>
          </form>
        </section>
      )}

      {/* Add Event Form */}
      {showAddForm && (
        <form className="resource-form" onSubmit={handleAddEvent} style={{ marginBottom: 16 }}>
          <div className="field" style={{ flexBasis: "100%" }}>
            <label>Event title</label>
            <input
              type="text"
              placeholder="Event title (e.g. Sprint Review, Strategy Call)..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="field" style={{ flexBasis: "100%" }}>
            <label>Description (optional)</label>
            <textarea
              rows={2}
              placeholder="Meeting notes, agenda, goals..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Start time</label>
            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>End time</label>
            <input
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              required
            />
          </div>

          <div className="field" style={{ flexBasis: "100%" }}>
            <label>Link to project (optional)</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="">No project (General / Personal)</option>
              {Object.entries(projects).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="field" style={{ flexBasis: "100%" }}>
            <label>Video call / Meet link (optional)</label>
            <input
              type="url"
              placeholder="https://meet.google.com/..."
              value={hangoutLink}
              onChange={(e) => setHangoutLink(e.target.value)}
              data-tip="Google Meet or video conference link"
            />
          </div>

          <div style={{ display: "flex", gap: 8, width: "100%" }}>
            <button type="submit" className="btn-primary clickable">
              Save event
            </button>
            <button
              type="button"
              className="btn-secondary clickable"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Calendar Controls & Month Nav */}
      <div className="calendar-view-header">
        <div className="calendar-nav">
          <button type="button" className="btn-secondary btn-small clickable" onClick={prevMonth} data-tip="Previous month">
            &larr; Prev
          </button>
          <strong style={{ fontSize: "15px", minWidth: 140, textAlign: "center" }}>{monthName}</strong>
          <button type="button" className="btn-secondary btn-small clickable" onClick={nextMonth} data-tip="Next month">
            Next &rarr;
          </button>
          <button type="button" className="btn-secondary btn-small clickable" onClick={gotoToday} data-tip="Go to current month">
            Today
          </button>
        </div>
      </div>

      {/* Month Grid View */}
      {viewMode === "grid" && (
        <div className="calendar-grid">
          {DAY_NAMES.map((name) => (
            <div key={name} className="calendar-day-name">
              {name}
            </div>
          ))}
          {/* Blank cells before 1st of month */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="calendar-day-cell empty" />
          ))}
          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const isToday =
              today.getFullYear() === year &&
              today.getMonth() === month &&
              today.getDate() === dayNum;

            const dayEvents = events.filter((e) => {
              const d = new Date(e.startAt);
              return d.getFullYear() === year && d.getMonth() === month && d.getDate() === dayNum;
            });

            return (
              <div
                key={`day-${dayNum}`}
                className={`calendar-day-cell ${isToday ? "today" : ""}`}
                onClick={() => selectDay(dayNum)}
                data-tip={`Click day ${dayNum} to schedule an event`}
              >
                <span className="calendar-day-num">{dayNum}</span>
                {dayEvents.map((e) => (
                  <div
                    key={e.id}
                    className={`calendar-event-pill ${e.source === "google" ? "google" : ""}`}
                    data-tip={`${new Date(e.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}: ${e.title}${e.projectId && projects[e.projectId] ? ` (${projects[e.projectId]})` : ""}`}
                  >
                    {new Date(e.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} {e.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        events.length === 0 ? (
          <p className="empty-state">
            No events scheduled yet. Add an event above or import from Google Calendar.
          </p>
        ) : (
          <ul className="resource-list">
            {events
              .sort((a, b) => a.startAt - b.startAt)
              .map((e) => (
                <li key={e.id} className="resource-item">
                  <span
                    className="resource-category-dot"
                    style={{ backgroundColor: e.source === "google" ? "#4285f4" : "#3b82f6" }}
                  />
                  <span className="resource-text">
                    <span className="resource-title">{e.title}</span>
                    <p className="resource-notes">
                      {new Date(e.startAt).toLocaleString()} — {new Date(e.endAt).toLocaleTimeString()}
                      {e.hangoutLink && (
                        <a
                          href={e.hangoutLink}
                          target="_blank"
                          rel="noreferrer"
                          className="resource-value-link"
                          data-tip="Open video call"
                          style={{ marginLeft: 8 }}
                        >
                          📹 Meet
                        </a>
                      )}
                      {e.description && (
                        <>
                          <br />
                          {e.description}
                        </>
                      )}
                    </p>
                    <span className="chip-small">
                      {e.source === "google" ? "Google Calendar" : "Local"}
                    </span>
                    {e.projectId && projects[e.projectId] && (
                      <Link
                        to={`/project/${e.projectId}?tab=Calendar`}
                        className="chip-small"
                        data-tip="Open project calendar"
                        style={{ marginLeft: 6, textDecoration: "none" }}
                      >
                        📁 {projects[e.projectId]}
                      </Link>
                    )}
                  </span>
                  <button
                    className="btn-icon clickable"
                    data-tip="Delete event"
                    onClick={async () => {
                      if (!confirm(`Delete event "${e.title}"?`)) return;
                      await deleteCalendarEvent(e.id);
                      refresh();
                    }}
                  >
                    ×
                  </button>
                </li>
              ))}
          </ul>
        )
      )}
    </div>
  );
}
