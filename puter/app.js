/**
 * app.js — Vanilla-JS workspace UI for Panga's Puter edition.
 *
 * Renders a tab-based workspace (Overview, Projects, Activity, Schedule,
 * Resources, Contacts) with instant local feedback. All views are rendered from
 * the in-memory state in state.js; mutations persist to localStorage
 * immediately (instant) and to Puter KV (debounced) so the app feels zero-latency
 * and stays in sync across devices.
 *
 * No page reloads: tab changes and CRUD actions swap views in place and dispatch
 * a `panga:state-changed` event that the subscription handler re-renders from.
 */

import * as State from "./state.js";
import * as Storage from "./storage.js";
import * as Auth from "./auth.js";
import {
  now,
  formatDatetime,
  formatTime,
  formatRelativeDay,
  parseTags,
  hasPuter,
  onReady,
  escapeHTML,
  escAttr,
} from "./lib.js";

/** Top-level workspace tabs. */
const TABS = [
  { id: "Overview", label: "Overview" },
  { id: "Projects", label: "Projects" },
  { id: "Activity", label: "Activity" },
  { id: "Schedule", label: "Schedule" },
  { id: "Resources", label: "Resources" },
  { id: "Contacts", label: "Contacts" },
];

/** Resource category catalogue (mirrors the React app). */
const CATEGORIES = [
  { id: "notes", label: "Notes", icon: "📝" },
  { id: "scripts", label: "Scripts", icon: "💻" },
  { id: "links", label: "Links", icon: "🔗" },
  { id: "images", label: "Images", icon: "🖼️" },
  { id: "pdfs", label: "PDFs", icon: "📄" },
  { id: "lists", label: "Lists", icon: "📋" },
  { id: "checklists", label: "Checklists", icon: "☑️" },
  { id: "preset-list", label: "Preset Lists", icon: "📦" },
];

const STATUS_CYCLE = { active: "completed", completed: "inactive", inactive: "active" };
const STATUS_LABEL = { active: "Active", completed: "Done", inactive: "Parked" };
const CONTACT_TYPES = [
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "link", label: "Link" },
];

let activeTab = "Overview";
const appEl = document.getElementById("app");

// ---- tiny DOM helpers ------------------------------------------------------

function $(sel, ctx = appEl) {
  return ctx?.querySelector(sel);
}
function $$(sel, ctx = appEl) {
  return Array.from(ctx?.querySelectorAll(sel) ?? []);
}

function textNode(text) {
  return document.createTextNode(text == null ? "" : String(text));
}

// ---- entry point -----------------------------------------------------------

onReady(() => {
  appEl.classList.add("panga-loading");
  bootstrap();
});

async function bootstrap() {
  // 1. Probe Puter auth (non-blocking, never blocks first render).
  const user = await Auth.probeAuth();

  // 2. Boot the in-memory state from localStorage (instant) + cloud hydrate.
  await State.init_state(user);

  // 3. Hook auth changes so the header reflects sign-in/out and we re-sync.
  Auth.onAuthStateChanged(async (u) => {
    State.setUser(u);
    if (u) {
      // Re-hydrate the cloud document under the new identity.
      await State.init_state(u);
    } else {
      renderApp();
    }
  });

  // 4. React to any state mutation (from this tab or another via storage event).
  const onStateChanged = () => renderApp();
  State.subscribe(onStateChanged);
  Storage.onCacheChanged((fresh) => {
    // Another tab wrote to localStorage — mirror it in memory and re-render.
    try {
      const snap = JSON.parse(JSON.stringify(fresh));
      // Only accept if it is genuinely newer.
      const cur = State.getState();
      if (!cur || !cur.meta || snap.meta?.lastWriteAt > cur.meta.lastWriteAt) {
        State.importSnapshot({ data: snap });
      }
      renderApp();
    } catch {}
  });

  // 5. First paint.
  appEl.classList.remove("panga-loading");
  renderApp();
}

// ---- app shell -------------------------------------------------------------

function renderApp() {
  if (!appEl) return;
  const st = State.getState();
  if (!st) {
    appEl.innerHTML = `<div class="empty-state">Loading workspace…</div>`;
    return;
  }
  appEl.innerHTML = "";
  appEl.appendChild(renderHeader(st));
  appEl.appendChild(renderTabBar());
  const main = document.createElement("main");
  main.className = "app-main";
  main.appendChild(renderView(activeTab, st));
  appEl.appendChild(main);
}

function renderHeader(st) {
  const header = document.createElement("header");
  header.className = "app-header";

  const logo = document.createElement("a");
  logo.href = "#";
  logo.className = "app-logo clickable";
  logo.innerHTML = '<span class="logo-mark">P</span> Panga';

  const spacer = document.createElement("div");
  spacer.style.flex = "1";

  const title = document.createElement("span");
  title.className = "app-title";
  title.textContent = "workspace";

  const userBadge = renderUserBadge(st.user);
  const syncBadge = renderSyncBadge(st);

  header.append(logo, spacer, title, userBadge, syncBadge);
  return header;
}

function renderUserBadge(user) {
  const el = document.createElement("div");
  el.className = "user-badge";
  if (!user) {
    el.innerHTML = `<button type="button" class="btn-secondary btn-small clickable sign-in-btn" data-action="sign-in">
      Sign in to sync
    </button>`;
    return el;
  }
  const name = user.username || user.name || user.email || "user";
  const initials = (name.match(/[A-Za-z]/g) || []).slice(0, 2).join("").toUpperCase();
  el.innerHTML = `
    <button type="button" class="avatar clickable" data-action="sign-out" title="Signed in as ${escAttr(name)}">
      <span class="avatar-fallback">${escapeHTML(initials || "U")}</span>
      <span class="avatar-name">${escapeHTML(name)}</span>
    </button>`;
  return el;
}

function renderSyncBadge(st) {
  const badges = document.createElement("div");
  badges.className = "sync-badges";
  const cloud = Storage.isCloudAvailable() && !!st.user;
  const dot = document.createElement("span");
  dot.className = "sync-dot";
  dot.style.color = cloud ? "var(--color-accent-resource)" : "var(--color-text-muted)";
  dot.textContent = cloud ? "● cloud" : "○ local";
  dot.title = cloud
    ? "Synced with Puter cloud — available across devices"
    : "Local only — sign in to enable cloud sync";
  const sync = document.createElement("span");
  sync.className = "sync-meta";
  if (st.meta?.lastSyncedAt) {
    sync.textContent = `synced ${formatDatetime(st.meta.lastSyncedAt)}`;
  } else if (cloud) {
    sync.textContent = "syncing…";
  } else {
    sync.textContent = "local-first";
  }
  sync.title = sync.textContent;
  badges.append(dot, sync);
  return badges;
}

function renderTabBar() {
  const nav = document.createElement("nav");
  nav.className = "home-section-nav";
  nav.setAttribute("aria-label", "Workspace tabs");
  for (const t of TABS) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `chip ${activeTab === t.id ? "chip-active" : ""}`;
    btn.dataset.action = "switch-tab";
    btn.dataset.tab = t.id;
    btn.textContent = t.label;
    nav.appendChild(btn);
  }
  return nav;
}

// ---- view dispatcher -------------------------------------------------------

function renderView(tab, st) {
  switch (tab) {
    case "Overview":
      return renderOverview(st);
    case "Projects":
      return renderProjects(st);
    case "Activity":
      return renderActivity(st);
    case "Schedule":
      return renderSchedule(st);
    case "Resources":
      return renderResources(st);
    case "Contacts":
      return renderContacts(st);
    default:
      return renderOverview(st);
  }
}

// ---- Overview --------------------------------------------------------------

function renderOverview(st) {
  const wrap = document.createElement("section");
  wrap.className = "dashboard-section overview";

  // Summary cards
  const projects = st.projects.filter((p) => p.status === "active");
  const tasks = st.tasks;
  const activeTasks = tasks.filter((t) => t.status === "active");
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const overdueTasks = tasks.filter((t) => isOverdue(t));
  const upcoming = tasks.filter((t) => t.scheduledAt && t.scheduledAt > now() && t.status !== "completed");

  const cards = [
    { label: "Active tasks", value: activeTasks.length, hint: "Tasks currently in progress" },
    { label: "Completed", value: completedTasks.length, hint: "Tasks marked done" },
    { label: "Overdue", value: overdueTasks.length, hint: "Active tasks past their due date" },
    { label: "Upcoming", value: upcoming.length, hint: "Tasks scheduled for later" },
    { label: "Projects", value: projects.length, hint: "Active workspaces" },
    { label: "Resources", value: st.resources.length, hint: "Notes, links, scripts & more" },
    { label: "Contacts", value: st.contacts.length, hint: "People you work with" },
  ];

  const row = document.createElement("div");
  row.className = "summary-row";
  cards.forEach((c) => {
    const card = document.createElement("div");
    card.className = "summary-card";
    card.dataset.tip = c.hint;
    card.innerHTML = `
      <span class="summary-card-num">${c.value}</span>
      <span class="summary-card-label">${escapeHTML(c.label)}</span>`;
    row.appendChild(card);
  });
  wrap.appendChild(row);

  // Alerts
  const alerts = buildAlerts(st);
  const alertsBox = document.createElement("section");
  alertsBox.className = "home-section home-section-open";
  alertsBox.innerHTML = `
    <header class="home-section-header">
      <button type="button" class="home-section-toggle" data-action="toggle-section" data-target="alerts">
        <span class="home-section-chevron">▼</span>
        <h2>Alerts</h2>
      </button>
    </header>
    <div class="home-section-body slide-enter">
      ${
        alerts.length === 0
          ? `<p class="empty-state">No alerts — nothing overdue. You're all caught up.</p>`
          : `<ul class="alert-list">${alerts.map((a) => renderAlert(a, st)).join("")}</ul>`
      }
    </div>`;
  wrap.appendChild(alertsBox);

  // Quick actions
  const qa = document.createElement("section");
  qa.className = "home-section home-section-open";
  qa.innerHTML = `
    <header class="home-section-header"><h2>Quick actions</h2></header>
    <div class="home-section-body">
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button type="button" class="btn-primary clickable" data-action="quick-add-task">⚡ Quick task</button>
        <button type="button" class="btn-secondary clickable" data-action="quick-add-resource">📋 Quick resource</button>
        <button type="button" class="btn-secondary clickable" data-action="quick-add-contact">👤 Quick contact</button>
      </div>
    </div>`;
  wrap.appendChild(qa);

  return wrap;
}

function buildAlerts(st) {
  const alerts = [];
  for (const t of st.tasks) {
    if (isOverdue(t)) {
      alerts.push({
        type: "overdue",
        title: t.title,
        subtitle: `Overdue task${t.projectId ? ` in ${projectName(st, t.projectId) || "…"}` : ""} — due ${formatDatetime(t.dueDate)}`,
        action: "toggle-task",
        payload: t.id,
      });
    }
  }
  const upcoming = st.scheduleItems.filter((s) => s.scheduledAt > now() && s.scheduledAt < now() + 7 * 24 * 3600 * 1000);
  for (const s of upcoming.slice(0, 5)) {
    alerts.push({
      type: "upcoming",
      title: s.title,
      subtitle: `Scheduled ${formatRelativeDay(s.scheduledAt)}`,
    });
  }
  return alerts.slice(0, 8);
}

function isOverdue(t) {
  return t.status === "active" && t.dueDate != null && t.dueDate < now();
}

function projectName(st, id) {
  return st.projects.find((p) => p.id === id)?.name;
}

function renderAlert(a, st) {
  const typeColor = a.type === "overdue" ? "var(--color-accent-issue)" : "var(--color-accent-task)";
  const actionBtn = a.action
    ? `<button type="button" class="alert-link" data-action="${a.action}" data-id="${escAttr(a.payload)}">Resolve</button>`
    : "";
  return `
    <li class="alert-item">
      <span class="alert-dot" style="background:${typeColor}"></span>
      <span class="alert-text">
        <span class="alert-title">${escapeHTML(a.title)}</span>
        <span class="alert-subtitle">${escapeHTML(a.subtitle)}</span>
      </span>
      ${actionBtn}
    </li>`;
}

// ---- Projects --------------------------------------------------------------

function renderProjects(st) {
  const box = document.createElement("section");
  box.className = "home-section home-section-open";
  const byKind = {};
  for (const p of st.projects) {
    const kind = p.kind || "project";
    if (!byKind[kind]) byKind[kind] = [];
    byKind[kind].push(p);
  }
  const kinds = ["project", "activity", "idea"];
  const parts = [];
  parts.push(`<header class="home-section-header">
    <h2>Projects</h2>
    <button type="button" class="btn-secondary btn-small clickable" data-action="open-create-project" data-kind="project">+ Project</button>
    <button type="button" class="btn-secondary btn-small clickable" data-action="open-create-project" data-kind="activity">+ Activity</button>
    <button type="button" class="btn-secondary btn-small clickable" data-action="open-create-project" data-kind="idea">+ Idea</button>
  </header>`);
  parts.push(`<div class="home-section-body">`);
  for (const kind of kinds) {
    const list = byKind[kind] || [];
    parts.push(`<h3 class="section-heading">${kindLabel(kind)} (${list.length})</h3>`);
    if (list.length === 0) {
      parts.push(`<p class="empty-state">No ${kind} workspaces yet.</p>`);
    } else {
      parts.push(`<div class="project-grid">`);
      for (const p of list) {
        parts.push(renderProjectCard(p, st));
      }
      parts.push(`</div>`);
    }
  }
  parts.push(`</div>`);
  box.innerHTML = parts.join("");

  // Create-project drawer/inline form via a modal-like panel
  return box;
}

function kindLabel(kind) {
  return { project: "Projects", activity: "Activities", idea: "Ideas" }[kind] || kind;
}

function renderProjectCard(p, st) {
  const progress = projectProgress(st, p.id);
  const taskCount = st.tasks.filter((t) => t.projectId === p.id && t.status !== "completed").length;
  const color = kindColor(p.kind);
  return `
    <div class="project-card" style="--kind-color:${color};border-left-color:${color};" data-tip="Open ${escAttr(p.name)}">
      <div class="project-card-top">
        <div>
          <div data-project-id="${p.id}" class="project-name-editable" style="font-weight:600;font-size:15px;cursor:text;">
            ${escapeHTML(p.name)}
          </div>
          <span class="project-kind-badge" style="font-size:11px;color:var(--color-text-muted);">
            ${escapeHTML(kindLabel(p.kind || "project"))}
          </span>
        </div>
        <div class="project-card-actions">
          <button type="button" class="btn-icon clickable" data-action="edit-project" data-id="${p.id}" data-tip="Edit project">✏️</button>
          <button type="button" class="btn-icon btn-icon-danger clickable" data-action="delete-project" data-id="${p.id}" title="Delete project">🗑</button>
        </div>
      </div>
      <p class="project-desc" style="font-size:12px;color:var(--color-text-muted);margin:6px 0;">
        ${escapeHTML(p.description || "No description…")}
      </p>
      <div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div>
      <div class="progress-label" style="font-size:11px;color:var(--color-text-muted);">
        ${taskCount} open task(s) · ${progress}% complete
      </div>
    </div>`;
}

function projectProgress(st, projectId) {
  const tasks = st.tasks.filter((t) => t.projectId === projectId);
  if (!tasks.length) return 0;
  const done = tasks.filter((t) => t.status === "completed").length;
  return Math.round((done / tasks.length) * 100);
}

function kindColor(kind) {
  return { project: "var(--color-accent-primary)", activity: "var(--color-accent-task)", idea: "var(--color-accent-milestone)" }[kind] || "var(--color-text-muted)";
}

// ---- Activity --------------------------------------------------------------

function renderActivity(st) {
  const box = document.createElement("section");
  box.className = "home-section home-section-open";
  const recent = st.activityLog.slice(0, 60);
  box.innerHTML = `
    <header class="home-section-header"><h2>Activity</h2></header>
    <div class="home-section-body">
      ${recent.length === 0
        ? `<p class="empty-state">No activity yet. Your actions across the workspace will be logged here.</p>`
        : `<ul class="activity-list">${recent.map((a) => renderActivityItem(a, st)).join("")}</ul>`}
    </div>`;
  return box;
}

function renderActivityItem(a, st) {
  const color = activityColor(a.action);
  const project = a.projectId ? projectName(st, a.projectId) : null;
  const time = formatDatetime(a.timestamp);
  return `
    <li class="activity-item">
      <span class="activity-dot" style="background:${color}"></span>
      <span class="activity-body">
        <span class="activity-title">${escapeHTML(a.description)}</span>
        <span class="activity-meta">
          <span class="text-tiny-dim">• ${escapeHTML(a.entityType)}</span>
          ${project ? `<span class="text-tiny-dim">• ${escapeHTML(project)}</span>` : ""}
          <span class="text-tiny-dim">${escapeHTML(time)}</span>
        </span>
      </span>
    </li>`;
}

function activityColor(action) {
  return { created: "#22c55e", updated: "#3b82f6", deleted: "#ef4444", status_changed: "#f59e0b", default: "#94a3b8" }[action] || "#94a3b8";
}

// ---- Schedule --------------------------------------------------------------

function renderSchedule(st) {
  const box = document.createElement("section");
  box.className = "home-section home-section-open";

  // Scheduled tasks + schedule items grouped by day (today → future)
  const schedTasks = st.tasks.filter((t) => t.scheduledAt && t.scheduledAt > now());
  const items = [...st.scheduleItems.filter((s) => s.scheduledAt > now()), ...schedTasks];
  items.sort((a, b) => a.scheduledAt - b.scheduledAt);

  const byDay = groupByDay(items);
  const days = Object.keys(byDay).sort();

  box.innerHTML = `
    <header class="home-section-header">
      <h2>Schedule</h2>
      <button type="button" class="btn-secondary btn-small clickable" data-action="open-add-schedule">+ Block</button>
    </header>
    <div class="home-section-body">
      ${days.length === 0
        ? `<p class="empty-state">Nothing scheduled. Give a task a date & time, or add a time-block above.</p>`
        : days.map((day) => `
            <section class="schedule-day">
              <h3 class="section-heading">${formatDay(day)}</h3>
              <ul class="item-list">${byDay[day].map((it) => renderScheduleItem(it, st)).join("")}</ul>
            </section>`).join("")}
    </div>`;
  return box;
}

function renderScheduleItem(item, st) {
  const proj = item.projectId ? projectName(st, item.projectId) : "General";
  const time = formatTime(item.scheduledAt);
  const isTask = !!st.tasks.find((t) => t.id === item.id);
  const kind = isTask ? "task" : "block";
  return `
    <li class="item schedule-item" data-id="${item.id}">
      <span class="schedule-time">${time}</span>
      <span class="item-body">
        <span class="item-title">${escapeHTML(item.title)}</span>
        <span class="item-meta">
          <span class="text-tiny">${escapeHTML(proj)} · ${kind}</span>
          ${item.durationMinutes ? `<span class="text-tiny">· ${item.durationMinutes} min</span>` : ""}
        </span>
      </span>
      <span class="item-actions">
        <button type="button" class="btn-icon clickable" data-action="delete-schedule" data-id="${item.id}" title="Remove">🗑</button>
      </span>
    </li>`;
}

function groupByDay(items) {
  const groups = {};
  for (const it of items) {
    const day = startOfDayKey(it.scheduledAt);
    (groups[day] ||= []).push(it);
  }
  return groups;
}

function startOfDayKey(ts) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function formatDay(ts) {
  const d = new Date(+ts);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const DAY = 86400000;
  if (+ts === today.getTime()) return "Today";
  if (+ts === today.getTime() + DAY) return "Tomorrow";
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

// ---- Resources -------------------------------------------------------------

function renderResources(st) {
  const box = document.createElement("section");
  box.className = "home-section home-section-open";

  const cats = allCategories(st);
  const selected = getResourceFilter(st);
  const filtered = filterResources(st, selected);

  box.innerHTML = `
    <header class="home-section-header">
      <h2>Resources</h2>
      <button type="button" class="btn-secondary btn-small clickable" data-action="open-add-resource">+ Resource</button>
    </header>
    <div class="home-section-body">
      <div class="chip-row">${cats.map((c) => `
        <button type="button" class="chip ${selected === c.id ? "chip-active" : ""}" data-action="filter-resources" data-filter="${c.id}">
          ${escapeHTML(c.label)} ${c.count ? `<span class="tab-btn-count">${c.count}</span>` : ""}
        </button>`).join("")}</div>
      ${filtered.length === 0
        ? `<p class="empty-state">No resources in this category. Create one with “+ Resource”.</p>`
        : `<ul class="resource-list">${filtered.map((r) => renderResourceItem(r, st)).join("")}</ul>`}
    </div>`;
  return box;
}

function allCategories(st) {
  const map = {};
  for (const r of st.resources) {
    map[r.category] = (map[r.category] || 0) + 1;
  }
  return [{ id: "all", label: "All", count: st.resources.length }, ...CATEGORIES.map((c) => ({ id: c.id, label: c.label, count: map[c.id] || 0 }))];
}

function getResourceFilter(st) {
  try {
    const raw = localStorage.getItem("panga:filter:resources");
    if (raw) return raw;
  } catch {}
  return "all";
}

function setResourceFilter(f) {
  try { localStorage.setItem("panga:filter:resources", f); } catch {}
  emitRefresh();
}

function filterResources(st, cat) {
  let list = st.resources;
  if (cat && cat !== "all") list = list.filter((r) => r.category === cat);
  return list;
}

function renderResourceItem(r, st) {
  const proj = r.projectId ? projectName(st, r.projectId) : null;
  const cat = CATEGORIES.find((c) => c.id === r.category) || { label: r.category, icon: "📁" };
  const tags = (r.tags || []).map((t) => `<span class="chip-small">${escapeHTML(t)}</span>`).join("");
  let detail = "";
  if (r.url) detail += `<a href="${escAttr(r.url)}" target="_blank" rel="noreferrer" class="resource-value-link" data-tip="Open link">🔗 ${shorten(r.url, 60)}</a>`;
  if (r.body) detail += `<p class="resource-notes">${escapeHTML(r.body)}</p>`;
  if (r.listItems && r.listItems.length) {
    detail += `<ul style="list-style:none;padding:0;margin:6px 0;font-size:13px;">` +
      r.listItems.map((li) => `<li style="padding:2px 0;">
        <label style="display:inline-flex;align-items:center;gap:6px;cursor:pointer;">
          <input type="checkbox" ${li.checked ? "checked" : ""} data-action="toggle-list-item" data-rid="${r.id}" data-iid="${li.id}" style="pointer-events:auto;">
          <span style="${li.checked ? "text-decoration:line-through;color:var(--color-text-muted)" : ""}">${escapeHTML(li.title ? `${li.title}: ` : "")}${escapeHTML(li.text)}</span>
        </label>
      </li>`).join("") + `</ul>`;
  }
  return `
    <li class="resource-item">
      <span class="resource-icon" style="font-size:16px;">${cat.icon}</span>
      <span class="resource-text">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
          <span class="resource-title">${escapeHTML(r.title || "(untitled)")}</span>
          ${proj ? `<span class="chip-small" style="background:#eef2ff;color:#3730a3;">📁 ${escapeHTML(proj)}</span>` : ""}
        </div>
        ${detail}
        <div style="margin-top:4px;">${tags}</div>
      </span>
      <span class="item-actions">
        <button type="button" class="btn-icon clickable" data-action="edit-resource" data-id="${r.id}" title="Edit">✏️</button>
        <button type="button" class="btn-icon btn-icon-danger clickable" data-action="delete-resource" data-id="${r.id}" title="Delete">🗑</button>
      </span>
    </li>`;
}

function shorten(str, n) {
  return str.length > n ? str.slice(0, n) + "…" : str;
}

// ---- Contacts --------------------------------------------------------------

function renderContacts(st) {
  const box = document.createElement("section");
  box.className = "home-section home-section-open";
  box.innerHTML = `
    <header class="home-section-header">
      <h2>Contacts</h2>
      <button type="button" class="btn-secondary btn-small clickable" data-action="open-add-contact">+ Contact</button>
    </header>
    <div class="home-section-body">
      ${st.contacts.length === 0
        ? `<p class="empty-state">No contacts yet. Add one to keep track of people you work with.</p>`
        : `<ul class="item-list">${st.contacts.map((c) => renderContactItem(c, st)).join("")}</ul>`}
    </div>`;
  return box;
}

function renderContactItem(c, st) {
  const type = CONTACT_TYPES.find((t) => t.id === c.type) || { label: c.type };
  let href = null;
  if (c.type === "email") href = `mailto:${c.value}`;
  else if (c.type === "phone") href = `tel:${c.value}`;
  else if (c.type === "link") href = c.value;
  const proj = (c.linkedProjectIds || [])[0] ? projectName(st, c.linkedProjectIds[0]) : null;
  const chips = (c.tags || []).map((t) => `<span class="chip-small">${escapeHTML(t)}</span>`).join("");
  const valueEl = href
    ? `<a href="${escAttr(href)}" target="_blank" rel="noreferrer" class="resource-value-link" data-tip="${c.type === "link" ? "Open link" : c.type === "email" ? "Compose email" : "Call"}">${escapeHTML(c.value)}</a>`
    : `<span class="resource-value">${escapeHTML(c.value)}</span>`;
  return `
    <li class="item">
      <span class="resource-icon" style="font-size:16px;">👤</span>
      <span class="item-body">
        <span class="item-title">${escapeHTML(c.name)}</span>
        <span class="item-meta">
          <span class="chip-small">${type.label}</span>
          ${valueEl}
          ${proj ? `<span class="text-tiny-dim">• ${escapeHTML(proj)}</span>` : ""}
          ${chips}
        </span>
      </span>
      <span class="item-actions">
        <button type="button" class="btn-icon clickable" data-action="edit-contact" data-id="${c.id}" title="Edit">✏️</button>
        <button type="button" class="btn-icon btn-icon-danger clickable" data-action="delete-contact" data-id="${c.id}" title="Delete">🗑</button>
      </span>
    </li>`;
}

// ---- inline create/edit forms (drawer-style) --------------------------------

function openDrawer(title, fields) {
  const drawer = document.createElement("div");
  drawer.className = "drawer-backdrop drawer-backdrop-right";
  drawer.setAttribute("role", "dialog");
  drawer.setAttribute("aria-modal", "true");
  drawer.innerHTML = `
    <div class="drawer-panel drawer-anim">
      <header class="drawer-header">
        <h2>${escapeHTML(title)}</h2>
        <button type="button" class="btn-icon" data-action="close-drawer" aria-label="Close">✕</button>
      </header>
      <div class="drawer-body">${fields}</div>
    </div>`;
  appEl.appendChild(drawer);
  const firstInput = drawer.querySelector("input, textarea, select");
  firstInput?.focus();
}

function closeDrawer() {
  const drawer = appEl.querySelector(".drawer-backdrop");
  if (drawer) drawer.remove();
}

function emitRefresh() {
  // Re-render without persisting (used by filter changes).
  renderApp();
}

// ---- centralized event delegation ------------------------------------------

appEl.addEventListener("click", delegate);
appEl.addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.target;
  const action = form.dataset.action;
  if (!action) return;
  handleSubmit(form, action);
});
appEl.addEventListener("blur", (e) => {
  // Commit inline project renames on blur.
  if (e.target && e.target.classList.contains("project-name-editable")) {
    commitInlineRename(e.target);
  }
}, true);

function delegate(e) {
  const trigger = e.target.closest("[data-action]");
  if (!trigger) return;
  const action = trigger.dataset.action;
  const id = trigger.dataset.id;
  const payload = trigger.dataset.payload;
  handleAction(action, id, payload, trigger);
}

async function handleAction(action, id, payload, el) {
  const st = State.getState();
  switch (action) {
    case "switch-tab":
      activeTab = payload || "Overview";
      saveTab();
      renderApp();
      break;
    case "open-create-project":
      openCreateProject(payload || "project");
      break;
    case "open-add-resource":
      openCreateResource();
      break;
    case "open-add-contact":
      openCreateContact();
      break;
    case "open-add-schedule":
      openCreateSchedule();
      break;
    case "quick-add-task":
      openQuickAddTask();
      break;
    case "quick-add-resource":
      openCreateResource();
      break;
    case "quick-add-contact":
      openCreateContact();
      break;
    case "filter-resources":
      setResourceFilter(payload);
      break;
    case "close-drawer":
      closeDrawer();
      break;
    case "edit-project":
      openCreateProject(st.projects.find((p) => p.id === id)?.kind || "project", id);
      break;
    case "edit-resource":
      openCreateResource(id);
      break;
    case "edit-contact":
      openCreateContact(id);
      break;
    case "delete-project":
      if (confirm(`Delete project "${projectName(st, id) || "untitled"}" and all its contents? This cannot be undone.`)) {
        State.deleteProject(id);
        showToast("Project deleted", "success");
      }
      break;
    case "delete-resource":
      State.deleteResource(id);
      showToast("Resource removed", "success");
      break;
    case "delete-contact":
      State.deleteContact(id);
      showToast("Contact removed", "success");
      break;
    case "delete-schedule":
      State.deleteScheduleItem(id);
      showToast("Block removed", "success");
      break;
    case "toggle-task": {
      const task = st.tasks.find((t) => t.id === id);
      State.cycleTaskStatus(id);
      if (task && STATUS_CYCLE[task.status] === "completed") {
        showToast(`Marked "${task.title}" done`, "success");
      }
      break;
    }
    case "toggle-list-item":
      State.toggleListItem(el.dataset.rid, el.dataset.iid);
      break;
    case "sign-in":
      await performSignIn();
      break;
    case "sign-out":
      await Auth.signOut();
      showToast("Signed out — data stays local", "info");
      renderApp();
      break;
    case "archive-project":
      State.updateProject(id, { status: "archived" });
      showToast("Project archived", "success");
      break;
    case "toggle-project-status":
      State.updateProject(id, { status: st.projects.find((p) => p.id === id)?.status === "active" ? "archived" : "active" });
      break;
  }
}

function handleSubmit(form, action) {
  const formData = new FormData(form);
  const data = {};
  for (const [k, v] of formData.entries()) data[k] = v;
  switch (action) {
    case "create-project":
      State.createProject({
        name: data.name || "Untitled project",
        description: data.description || "",
        kind: data.kind || "project",
      });
      closeDrawer();
      showToast(`Created ${kindLabel(data.kind || "project").toLowerCase()}`, "success");
      break;
    case "edit-project":
      State.updateProject(data.id, {
        name: data.name,
        description: data.description,
        kind: data.kind,
      });
      closeDrawer();
      showToast("Project saved", "success");
      break;
    case "create-task":
      State.createTask({
        projectId: data.projectId || null,
        title: data.title || "Untitled task",
        notes: data.notes || "",
        dueDate: data.dueDate ? new Date(data.dueDate).getTime() : null,
        estimatedMinutes: data.estimatedMinutes ? Number(data.estimatedMinutes) : null,
        tags: parseTags(data.tags),
      });
      closeDrawer();
      showToast("Task added", "success");
      break;
    case "create-resource":
      State.createResource({
        projectId: data.projectId || null,
        category: data.category || "notes",
        title: data.title || "Untitled resource",
        url: data.url || null,
        body: data.body || null,
        tags: parseTags(data.tags),
      });
      closeDrawer();
      showToast("Resource saved", "success");
      break;
    case "edit-resource":
      State.updateResource(data.id, {
        projectId: data.projectId || null,
        category: data.category || "notes",
        title: data.title || "Untitled resource",
        url: data.url || null,
        body: data.body || null,
        tags: parseTags(data.tags),
      });
      closeDrawer();
      showToast("Resource updated", "success");
      break;
    case "create-contact":
      State.createContact({
        name: data.name || "Untitled",
        type: data.type || "email",
        value: data.value || "",
        tags: parseTags(data.tags),
        linkedProjectIds: data.projectId ? [data.projectId] : [],
      });
      closeDrawer();
      showToast("Contact added", "success");
      break;
    case "edit-contact":
      State.updateContact(data.id, {
        name: data.name || "Untitled",
        type: data.type || "email",
        value: data.value || "",
        tags: parseTags(data.tags),
        linkedProjectIds: data.projectId ? [data.projectId] : [],
      });
      closeDrawer();
      showToast("Contact updated", "success");
      break;
    case "create-schedule": {
      const scheduledAt = data.scheduledAt ? new Date(data.scheduledAt).getTime() : null;
      if (!scheduledAt) return;
      State.createScheduleItem({
        projectId: data.projectId || null,
        title: data.title || "Untitled block",
        description: data.description || "",
        scheduledAt,
        durationMinutes: data.durationMinutes ? Number(data.durationMinutes) : null,
      });
      closeDrawer();
      showToast("Time block scheduled", "success");
      break;
    }
  }
  renderApp();
}

// ---- drawer builders -------------------------------------------------------

function openCreateProject(kind, id) {
  const existing = id ? State.getProject(id) : null;
  const projects = State.getState().projects;
  const field = "project";
  const fields = `
    <form data-action="create-project" style="display:flex;flex-direction:column;gap:12px;">
      <input type="hidden" name="id" value="${id ? escAttr(id) : ""}">
      <input type="hidden" name="kind" value="${escAttr(kind)}">
      <label><span style="font-size:12px;color:var(--color-text-muted);">Name</span>
        <input type="text" name="name" required placeholder="Project / activity / idea name"
               value="${id ? escAttr(existing?.name) : ""}" style="width:100%;"></label>
      <label><span style="font-size:12px;color:var(--color-text-muted);">Description</span>
        <textarea name="description" rows="2" placeholder="Optional details…" style="width:100%;">${id ? escAttr(existing?.description) : ""}</textarea></label>
    </form>`;
  openDrawer(id ? `Edit ${kindLabel(kind)}` : `New ${kindLabel(kind)}`, fields);
}

function openCreateResource(id) {
  const existing = id ? State.getResource(id) : null;
  const projects = State.getState().projects;
  const projOptions = ['<option value="">No project (quick item)</option>']
    .concat(projects.map((p) => `<option value="${p.id}" ${existing?.projectId === p.id ? "selected" : ""}>${escapeHTML(p.name)}</option>`));
  const catOptions = CATEGORIES.map((c) => `<option value="${c.id}" ${existing?.category === c.id ? "selected" : ""}>${escapeHTML(c.label)}</option>`).join("");
  const fields = `
    <form data-action="${id ? "edit-resource" : "create-resource"}">
      <input type="hidden" name="id" value="${id ? escAttr(id) : ""}">
      <label><span style="font-size:12px;color:var(--color-text-muted);">Project</span>
        <select name="projectId">${projOptions.join("")}</select></label>
      <label><span style="font-size:12px;color:var(--color-text-muted);">Category</span>
        <select name="category">${catOptions}</select></label>
      <label><span style="font-size:12px;color:var(--color-text-muted);">Title</span>
        <input type="text" name="title" required placeholder="Resource title"
               value="${existing?.title ? escAttr(existing.title) : ""}" style="width:100%;"></label>
      <label><span style="font-size:12px;color:var(--color-text-muted);">URL (links)</span>
        <input type="url" name="url" placeholder="https://…" value="${existing?.url ?? ""}" style="width:100%;"></label>
      <label><span style="font-size:12px;color:var(--color-text-muted);">Body</span>
        <textarea name="body" rows="3" placeholder="Notes, script, description…" style="width:100%;">${existing?.body ?? ""}</textarea></label>
      <label><span style="font-size:12px;color:var(--color-text-muted);">Tags (comma separated)</span>
        <input type="text" name="tags" placeholder="urgent, reference" value="${(existing?.tags || []).join(", ")}"></label>
    </form>`;
  openDrawer(id ? "Edit resource" : "Add resource", fields);
}

function openCreateContact(id) {
  const existing = id ? State.getContact(id) : null;
  const projects = State.getState().projects;
  const projOptions = ['<option value="">No project</option>']
    .concat(projects.map((p) => `<option value="${p.id}" ${existing?.linkedProjectIds?.[0] === p.id ? "selected" : ""}>${escapeHTML(p.name)}</option>`));
  const typeOptions = CONTACT_TYPES.map((t) => `<option value="${t.id}" ${existing?.type === t.id ? "selected" : ""}>${t.label}</option>`).join("");
  const fields = `
    <form data-action="${id ? "edit-contact" : "create-contact"}">
      <input type="hidden" name="id" value="${id ? escAttr(id) : ""}">
      <label><span style="font-size:12px;color:var(--color-text-muted);">Name</span>
        <input type="text" name="name" required placeholder="Person or organisation" value="${existing?.name ? escAttr(existing.name) : ""}" style="width:100%;"></label>
      <label><span style="font-size:12px;color:var(--color-text-muted);">Type</span>
        <select name="type">${typeOptions}</select></label>
      <label><span style="font-size:12px;color:var(--color-text-muted);">Value</span>
        <input type="text" name="value" required placeholder="you@example.com, +1234567890, https://…" value="${existing?.value ?? ""}" style="width:100%;"></label>
      <label><span style="font-size:12px;color:var(--color-text-muted);">Project</span>
        <select name="projectId">${projOptions.join("")}</select></label>
      <label><span style="font-size:12px;color:var(--color-text-muted);">Tags (comma separated)</span>
        <input type="text" name="tags" placeholder="client, work" value="${(existing?.tags || []).join(", ")}"></label>
    </form>`;
  openDrawer(id ? "Edit contact" : "Add contact", fields);
}

function openCreateSchedule() {
  const projects = State.getState().projects;
  const projOptions = ['<option value="">No project</option>']
    .concat(projects.map((p) => `<option value="${p.id}">${escapeHTML(p.name)}</option>`));
  const fields = `
    <form data-action="create-schedule">
      <label><span style="font-size:12px;color:var(--color-text-muted);">Title</span>
        <input type="text" name="title" required placeholder="Block title" style="width:100%;"></label>
      <label><span style="font-size:12px;color:var(--color-text-muted);">Date & time</span>
        <input type="datetime-local" name="scheduledAt" required style="width:100%;"></label>
      <label><span style="font-size:12px;color:var(--color-text-muted);">Duration (minutes)</span>
        <input type="number" name="durationMinutes" placeholder="60" min="0" style="width:100%;"></label>
      <label><span style="font-size:12px;color:var(--color-text-muted);">Project</span>
        <select name="projectId">${projOptions.join("")}</select></label>
      <label><span style="font-size:12px;color:var(--color-text-muted);">Note</span>
        <textarea name="description" rows="2" placeholder="Optional…" style="width:100%;"></textarea></label>
    </form>`;
  openDrawer("Add time block", fields);
}

function openQuickAddTask() {
  const projects = State.getState().projects;
  const projOptions = ['<option value="">Standalone (no project)</option>']
    .concat(projects.map((p) => `<option value="${p.id}">${escapeHTML(p.name)}</option>`));
  const fields = `
    <form data-action="create-task">
      <label><span style="font-size:12px;color:var(--color-text-muted);">Task title</span>
        <input type="text" name="title" required placeholder="What needs doing?" style="width:100%;" autofocus></label>
      <label><span style="font-size:12px;color:var(--color-text-muted);">Project</span>
        <select name="projectId">${projOptions.join("")}</select></label>
      <label><span style="font-size:12px;color:var(--color-text-muted);">Due date</span>
        <input type="datetime-local" name="dueDate"></label>
      <label><span style="font-size:12px;color:var(--color-text-muted);">Tags</span>
        <input type="text" name="tags" placeholder="urgent, backend"></label>
    </form>`;
  openDrawer("Quick task", fields);
}

// Inline project rename: editable div → commit on blur/Enter
function commitInlineRename(el) {
  const id = el.dataset.projectId;
  const name = el.textContent.trim();
  if (!id || !name) return;
  const proj = State.getProject(id);
  if (!proj || proj.name === name) return;
  State.updateProject(id, { name });
}

// ---- tab persistence -------------------------------------------------------

function saveTab() {
  try { localStorage.setItem("panga:last_tab", activeTab); } catch {}
}
function restoreTab() {
  try {
    const t = localStorage.getItem("panga:last_tab");
    if (t) activeTab = t;
  } catch {}
}

// ---- toasts ----------------------------------------------------------------

let toastTimer = null;

/**
 * Show a transient, self-dismissing toast. Appended straight to <body> so it
 * survives the app's view re-renders.
 * @param {string} message
 * @param {"info"|"success"|"error"} [type]
 * @param {number} [durationMs]
 */
function showToast(message, type = "info", durationMs = 2200) {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  const bg = type === "error" ? "#fef2f2" : type === "success" ? "#f0fdf4" : "#eff6ff";
  const fg = type === "error" ? "#991b1b" : type === "success" ? "#166534" : "#1e40af";
  const bd = type === "error" ? "#fecaca" : type === "success" ? "#bbf7d0" : "#bfdbfe";
  toast.style.cssText = `
    position: fixed; bottom: 20px; right: 20px; z-index: 99999;
    padding: 10px 14px; border-radius: var(--radius-sm);
    font-size: 13px; font-weight: 500; box-shadow: 0 4px 14px rgba(0,0,0,0.12);
    pointer-events: auto; opacity: 0; transform: translateX(120%);
    transition: opacity .16s ease, transform .16s ease;
    background: ${bg}; color: ${fg}; border: 1px solid ${bd};
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(0)";
  });
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(120%)";
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, durationMs);
}

// ---- auth flow -------------------------------------------------------------

let signInInProgress = false;

/**
 * Drive the Puter sign-in popup and re-hydrate cloud state under the new
 * identity. Local data is preserved and merged onto the cloud document.
 */
async function performSignIn() {
  if (signInInProgress) return;
  signInInProgress = true;
  const btn = appEl.querySelector("[data-action='sign-in']");
  if (btn) { btn.disabled = true; btn.textContent = "Signing in…"; }
  try {
    const user = await Auth.signIn({ attempt_temp_user_creation: false });
    if (user) {
      // Attach the user, then hydrate/reconcile the cloud document.
      State.setUser(user);
      await State.init_state(user);
      showToast("Signed in — workspace syncing to Puter cloud", "success");
    } else {
      showToast("Sign-in was not completed", "error");
    }
  } catch (e) {
    console.error(e);
    showToast("Sign-in failed. You can keep working locally.", "error");
  } finally {
    signInInProgress = false;
  }
}

// ---- boot ------------------------------------------------------------------

restoreTab();
