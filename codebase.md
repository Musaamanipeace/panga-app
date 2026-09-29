# Panga App — Codebase Summary (Debug Reference)

> Treat this file as the entire codebase. It contains the file tree, git history, all environment variables (`.env` redacted, `.gitignore`), all configuration files, and every source file in full or summarized. Use it to debug the Panga offline-first PWA project.

---

## Table of Contents
1. [Runtime](#runtime)
2. [Environment Variables (`.env`)](#environment-variables-env)
3. [`.env.example`](#envexample)
4. [`.gitignore`](#gitignore)
5. [Git History](#git-history)
6. [Project Structure](#project-structure)
7. [Configuration Files](#configuration-files)
8. [Server (`server.ts`)](#serverserverjs)
9. [Source Files — Full Contents](#source-files--full-contents)
10. [Supabase Schema (`supabase_schema.sql`)](#supabase-schema-supabase_schema)
11. [Documentation](#documentation)

---

## Runtime

- **Dev:** `npm run dev` → runs `tsx server.ts` (Express backend on port 3000, Vite dev server via middleware)
- **Build:** `npm run build` → `tsc && vite build`
- **Preview:** `npm run preview` → `vite preview`
- **Lint:** `npm run lint` → `oxc`
- **Deploy:** `npm run deploy` → `tsup server.ts` (bundles server), then `npm start` → `node dist/server.js`

---

## Environment Variables (`.env`)

> **IMPORTANT:** `.env` is gitignored. Values below are actual from this environment, with secrets redacted.

```
VITE_SUPABASE_URL=https://[REDACTED].supabase.co
VITE_SUPABASE_ANON_KEY=[REDACTED]
VITE_EMAILJS_SERVICE_ID=[REDACTED]
VITE_EMAILJS_TEMPLATE_ID=[REDACTED]
VITE_EMAILJS_PUBLIC_KEY=[REDACTED]
```

> **NOTE:** `GEMINI_API_KEY` is expected by `server.ts` (server-side only, not in `.env.example`). It is read via `process.env.GEMINI_API_KEY`. If absent, the client can send `clientApiKey` as a fallback.

---

## `.env.example`

```
# --- Supabase (optional, for cloud sync) ---
# Get these from https://supabase.com/dashboard → your project → Settings → API
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# --- EmailJS (optional, for real OTP email sending) ---
# Get these from https://www.emailjs.com/dashboard
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=

# --- Gemini API Key (optional, for AI assistant) ---
# This goes in your shell environment, not in .env:
# export GEMINI_API_KEY=your-key-here
# Or set it in the Settings page at runtime (stored in IndexedDB settings table).
```

---

## `.gitignore`

```gitignore
# Dependencies
node_modules/
bun.lock
package-lock.json

# Build output
dist/
.nyc_output/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Debug logs
logs
*.log
npm-debug.log*

# Temp
.tmp/
```

---

## Git History

```
99fa06d feat: implement realtime data synchronization
7ed9b7e feat: enhance task management and auth flexibility
2d12035 feat: support project-agnostic resources
a1acdbf feat(db): index createdAt and optimize sorting
bcb7dd9 feat: implement AI-integrated backend and UI updates
b699f49 changes
ed5830a changes
ae76c25 debugs
7d3d5b1 some debugs and redesigns
b880e2b redesign and debug
d49fe4b delete unwanted files
fa5bcd2 feat: integrate Supabase for backend services and remove Firebase
0644c16 feat: enhance project management features with milestones
bfdd748 Replace Firebase with Supabase: swap SDK, update env vars, config files, docs, and setup script
0678509 added issues docs
8adc22a Resources: store text body + images per category, manage/rename/delete categories, polish UI (buttons, hover, slide-in), extend global search, trim advertisy copy
211273e Stage 3: add free browser-native voice-to-text input (Web Speech API) to every text field
a155144 feat: implement dashboard with project management features and add modal components
6cf0f5e chore: ignore dependencies and generated files
2054775 feat: add initial project structure with IndexedDB integration and basic UI components
```

**Current branch:** `main` (20 commits)
**Key schema migrations:** db.ts v1→v7 (Dexie versions: goals→milestones, categories restructure, insights table, createdAt indexes, calendarEvents syncStatus)

---

## Project Structure

```
panga-app/
├── .env (gitignored, redacted — see above)
├── .env.example
├── .gitignore
├── .oxlintrc.json
├── AGENTS.md
├── index.html
├── kilo.json
├── metadata.json
├── package.json
├── script.sh
├── server.ts
├── supabase_schema.sql
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── unfinished.md
├── vite.config.ts
├── test-debug.mjs
├── test-fresh.mjs
├── test-migration.mjs
├── test-project.mjs
├── docs/
│   └── panga.md
├── public/
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── auth/
│   │   ├── otp.ts
│   │   └── session.ts
│   ├── components/
│   │   ├── AIAssistant.tsx
│   │   ├── AppShell.tsx
│   │   ├── AssistantPanel.tsx
│   │   ├── GlobalSearch.tsx
│   │   ├── MicButton.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── ui.tsx
│   │   ├── useVoiceInput.ts
│   │   ├── home/
│   │   │   ├── HomeCalendarTab.tsx
│   │   │   ├── HomeContactsTab.tsx
│   │   │   ├── HomeLinksTab.tsx
│   │   │   ├── HomeRemindersTab.tsx
│   │   │   ├── HomeResourcesTab.tsx
│   │   │   ├── HomeScheduleTab.tsx
│   │   │   └── HomeTasksTab.tsx
│   │   └── project/
│   │       ├── ContactsTab.tsx
│   │       └── InsightsTab.tsx
│   ├── data/
│   │   ├── calendar.ts
│   │   ├── contacts.ts
│   │   ├── conversations.ts
│   │   ├── dashboard.ts
│   │   ├── db.ts
│   │   ├── docs.ts
│   │   ├── insights.ts
│   │   ├── issues.ts
│   │   ├── milestones.ts
│   │   ├── projects.ts
│   │   ├── reminders.ts
│   │   ├── resources.ts
│   │   ├── scheduler.ts
│   │   ├── settings.ts
│   │   ├── tasks.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Home.tsx
│   │   ├── Landing.tsx
│   │   ├── ProjectView.tsx
│   │   └── Settings.tsx
│   ├── search/
│   │   └── search.ts
│   └── sync/
│       ├── google.ts
│       ├── googleCalendar.ts
│       ├── supabase.ts
│       └── supabaseSync.ts
```

---

## Configuration Files

### `package.json`

```json
{
  "name": "panga-app",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "oxc",
    "deploy": "tsup server.ts",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "@emailjs/browser": "^4.0.1",
    "@google/genai": "^0.9.11",
    "@supabase/supabase-js": "^2.45.0",
    "dexie": "^4.0.1",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.26.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "@vitest/coverage-v8": "^2.0.0",
    "@vitest/ui": "^2.0.0",
    "@oxc/core": "latest",
    "typescript": "^5.5.0",
    "tsx": "^4.0.0",
    "tsup": "^8.0.0",
    "vite": "^5.3.0",
    "vite-plugin-pwa": "^0.19.0",
    "vite-plugin-static-copy": "^0.50.0"
  }
}
```

### `vite.config.ts`

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "manual",
      manifest: {
        name: "Panga",
        short_name: "Panga",
        description: "Personal, offline-first project & resource planner.",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#1f2937",
        lang: "en",
        scope: "/",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: { cacheName: "panga-images", expiration: { maxEntries: 100 } },
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
    host: "0.0.0.0",
    allowedHosts: true,
  },
  resolve: {
    alias: { "@": resolve(__dirname, "src") },
  },
});
```

### `tsconfig.json`

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

### `tsconfig.app.json`

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023", "DOM"],
    "module": "esnext",
    "types": ["vite/client"],
    "allowArbitraryExtensions": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

### `tsconfig.node.json`

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023"],
    "types": ["node"],
    "skipLibCheck": true,
    "module": "nodenext",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
```

### `.oxlintrc.json`

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

---

## Server (`server.ts`)

```typescript
import express from "express";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = "0.0.0.0";

app.use(express.json({ limit: "10mb" }));

app.post("/api/assistant/chat", async (req, res) => {
  try {
    const { contents, systemInstruction, enableSearch, clientApiKey } = req.body;
    const apiKey = process.env.GEMINI_API_KEY || clientApiKey;

    if (!apiKey) {
      return res.status(400).json({
        error: "No Gemini API key found. Please configure your key in Settings or environment.",
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });

    const tools: any[] = [];
    if (enableSearch) tools.push({ googleSearch: {} });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: { systemInstruction, tools: tools.length > 0 ? tools : undefined },
    });

    res.json({ text: response.text ?? "", functionCalls: response.functionCalls });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: error?.message || "Failed to generate AI response." });
  }
});

async function start() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, host: HOST, port: PORT, allowedHosts: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("{*path}", (_req, res) => res.sendFile(path.resolve(__dirname, "dist", "index.html")));
  }

  app.listen(PORT, HOST, () => console.log(`Server running at http://${HOST}:${PORT}`));
}

start();
```

**Key behavior:** Express runs on port 3000. In dev, Vite middleware is used. The `/api/assistant/chat` endpoint proxies to Gemini using `GEMINI_API_KEY` (env) or `clientApiKey` (passed from Settings page).

---

## Source Files — Full Contents

### `src/main.tsx`

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

### `src/App.tsx`

```typescript
import { useEffect } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import ProjectView from "./pages/ProjectView";
import Settings from "./pages/Settings";
import AppShell from "./components/AppShell";
import { isLoggedIn } from "./auth/session";
import { ensureSeedData } from "./data/db";
import { syncAll } from "./sync/supabaseSync";

function RequireAuth() {
  const location = useLocation();
  const loggedIn = isLoggedIn();
  if (!loggedIn) return <Navigate to="/" state={{ from: location }} replace />;
  return <Outlet />;
}

export default function App() {
  useEffect(() => {
    void ensureSeedData();

    if (isLoggedIn()) {
      void syncAll().then((result) => {
        if (!result.ok) console.log("Sync not available:", result.message);
      });
    }
  }, []);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="home" element={<Home />} />
            <Route path="project/:projectId" element={<ProjectView />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

**Routing:** `/` → Landing (login), authenticated routes use `AppShell` (header + assistant panel). `AppShell` renders `<Outlet />` for child routes: `/dashboard`, `/home`, `/project/:projectId`, `/settings`.

### `src/App.tsx` Routing Summary

- `RequireAuth` checks `isLoggedIn()` (reads `localStorage["panga_session_email"]`)
- On mount: calls `ensureSeedData()` and `syncAll()` (if logged in)
- Auth flow: Landing page → email → OTP → sets session → navigates to `/dashboard`

### `src/data/db.ts` (695 lines)

This is the **only** file that touches IndexedDB directly. Defines all entity types, Dexie table schema, migrations (v1→v7), and `ensureSeedData()`.

```typescript
// Imports Dexie, defines all interfaces: Project, Task, Resource, DocEntry, Milestone,
// Issue, IssueComment, Reminder, Insight, CalendarEvent, ScheduleItem, Conversation, Message
// Tables: projects, tasks, resources, docEntries, milestones, issues, contacts,
//         reminders, calendarEvents, scheduleItems, conversations, messages, insights, settings
// Migrations: v1→v2 (goals→milestones), v3 (add milestone blockingTaskIds upgrade),
// v4 (resource categories restructure, calendarEvents/scheduleItems tables), v5 (insights table),
// v6 (createdAt indexes on tasks/issues), v7 (syncStatus on calendarEvents)
```

Full contents (see file). Key types exported:
- `TaskStatus`, `ProjectStatus`, `IssueSeverity`, `IssueStatus`, `MilestoneStatus`, `SyncStatus`, `CalendarEventSource`, `ResourceProvider`, `ContactType`
- `ResourceCategory = "notes" | "scripts" | "links" | "images" | "pdfs" | string`
- `SETTINGS_KEYS` constant: `appInitialized`, `geminiApiKey`, `googleCalendarClientId`, `googleCalendarToken`, `googlePickerKey`, `googleAccessToken`, `driveFolderPrefix`

### `src/data/utils.ts`

```typescript
export function newId(): string { return crypto.randomUUID(); }
export function now(): number { return Date.now(); }
```

### `src/data/projects.ts`

CRUD for projects. Key functions: `listProjects(status)`, `listAllProjects()`, `getProject(id)`, `createProject(input)`, `updateProject(id, changes)`, `archiveProject(id)`, `deleteProject(id)` (cascades to all child tables), `getProjectProgress(projectId)`, `getProjectTaskStats(projectId)`.

### `src/data/tasks.ts`

CRUD for tasks. Key functions: `listTasksForProject(projectId)`, `listAllTasks()`, `listScheduledTasks()`, `listAllActiveTasks()`, `isOverdue(task)`, `createTask(input)`, `updateTask(id, changes)`, `setTaskStatus(id, status)`, `deleteTask(id)`.

### `src/data/resources.ts`

CRUD for resources (notes, links, scripts, images, pdfs). Key functions: `listResourcesForProject(projectId)`, `listAllResources()`, `listAllLinks()`, `listResourcesByCategory(projectId, category)`, `getResource(id)`, `createResource(input)`, `updateResource(id, changes)`, `deleteResource(id)`, `deleteResourcesForProject(projectId)`.

### `src/data/milestones.ts`

CRUD for milestones. Key functions: `listMilestones(projectId)`, `createMilestone(input)`, `updateMilestone(id, changes)`, `setMilestoneStatus(id, status)`, `deleteMilestone(id)`, `reconcileMilestoneStatuses(projectId)`.

### `src/data/issues.ts`

CRUD for issues. Key functions: `listIssues(projectId)`, `createIssue(input)`, `updateIssue(id, changes)`, `setIssueStatus(id, status)`, `addIssueComment(issueId, text)`, `deleteIssueComment(issueId, commentId)`, `updateIssueComment`, `setIssueLabels`, `setIssueMilestone`, `deleteIssue`.

### `src/data/contacts.ts`

CRUD for contacts (email, phone, link types). Key functions: `listContacts(projectId?)`, `listAllContacts()`, `createContact(input)`, `updateContact(id, changes)`, `deleteContact(id)`, `toggleContactProject(contactId, projectId)`, `linkedProjectIds(contact)`, `contactHref(contact)`, `CONTACT_TYPE_LABELS`.

### `src/data/reminders.ts`

CRUD for reminders. Key functions: `listReminders(projectId)`, `listPendingReminders()`, `bucketReminders(reminders)`, `createReminder(input)`, `updateReminder(id, changes)`, `dismissReminder(id)`, `deleteReminder(id)`.

### `src/data/calendar.ts`

CRUD for calendar events. Key functions: `listCalendarEvents(projectId?)`, `listAllCalendarEvents()`, `listUpcomingEvents(since, projectId?)`, `createLocalEvent(input)`, `importGoogleEvents(events)`, `updateCalendarEvent(id, changes)`, `deleteCalendarEvent(id)`, `pruneMissingGoogleEvents(seenIds)`, `getCalendarAlertEvents()`, `getEventsBetween(start, end)`.

### `src/data/docs.ts`

CRUD for documentation entries (outline/phase types). Key functions: `listDocEntries(projectId)`, `createDocEntry(input)`, `updateDocEntry(id, changes)`, `deleteDocEntry(id)`.

### `src/data/insights.ts`

CRUD for insights (note/link/image/pdf types). Key functions: `listInsights(projectId)`, `getInsight(id)`, `createInsight(input)`, `updateInsight(id, changes)`, `deleteInsight(id)`, `deleteInsightsForProject(projectId)`.

### `src/data/scheduler.ts`

CRUD for schedule items (local scheduling). Key functions: `listScheduleItems(projectId?)`, `getScheduleItem(id)`, `createScheduleItem(input)`, `updateScheduleItem(id, changes)`, `deleteScheduleItem(id)`, `getUpcomingScheduleItems(since, projectId?)`.

### `src/data/dashboard.ts`

Computed aggregates for the home/dashboard screen. Key functions: `getDashboardAlerts(limit)` (overdue tasks, due/overdue reminders, missed milestones), `summaryCards(summary)`, `getDashboardSummary()`.

### `src/data/settings.ts`

Settings get/set with Dexie + Supabase remote fallback. Key functions: `getSetting<T>(key)`, `setSetting(key, value)`, `getSupabaseConfig()` re-export, Google Calendar token management, Gemini API key management.

### `src/data/conversations.ts`

Local conversation storage with 7-day expiry. Key functions: `getRetentionDays()`, `setRetentionDays(days)`, `createConversation(title)`, `listConversations()`, `getConversation(id)`, `renameConversation`, `deleteConversation`, `listMessages(conversationId)`, `addMessage`, `pruneExpiredConversations()`.

### `src/auth/session.ts`

```typescript
const SESSION_KEY = "panga_session_email";
export function getSessionEmail(): string | null;
export function isLoggedIn(): boolean;
export function setSession(email: string): void;
export function clearSession(): void;
```

### `src/auth/otp.ts`

EmailJS OTP authentication. Supports "dev" mode (returns code directly) and "real" mode (sends actual email via EmailJS). Key functions: `getStoredEmailJsConfig()`, `saveStoredEmailJsConfig(config)`, `sendOtp(email, options)`, `verifyOtp(email, code)`. Uses `sessionStorage` for pending OTP with 10-minute TTL.

### `src/search/search.ts`

Global search across projects, tasks, resources, milestones, issues, docEntries, insights, settings, and saved files. Uses simple substring matching (swappable for FlexSearch later). Returns max 30 results with deep-link targets.

### `src/components/AppShell.tsx`

Header with project logo link, `GlobalSearch`, Settings link, and Logout button. Renders `AssistantPanel` in a fixed position.

### `src/components/GlobalSearch.tsx`

Command palette (⌘/Ctrl+K) with overlay search. Searches via `globalSearch()`, navigates results or opens settings tab.

### `src/components/AssistantPanel.tsx`

Full AI assistant panel with:
- Conversation history (local, 7-day expiry)
- Chat with Gemini via `/api/assistant/chat` server endpoint
- Action proposals (create_task, update_task, delete_task, create_project, create_milestone, create_reminder, create_insight, create_link, add_subcategory)
- Approval workflow for agent actions
- Clarification prompts (`CLARIFY:` prefix parsing)
- System instruction built from current app state

### `src/components/AIAssistant.tsx`

Deprecated stub component. `AssistantPanel` replaces it in `AppShell`. Shows placeholder message.

### `src/components/ui.tsx`

Shared UI primitives:
- `Slide` — animated panel transitions (direction-aware)
- `Drawer` — edge-sliding panels with Escape-to-close
- `Disclosure` — collapsible lists
- `Editable` — inline rename with Enter/Escape
- `StatusLabel`, `SeverityMark` — CSS shape labels (no emoji)
- `Loading`, `ErrorNote` — async state displays
- `useAsync` — promise reader hook

### `src/components/ProjectCard.tsx`

Project card with rename, delete, progress bar, pending-task count.

### `src/components/ProgressBar.tsx`

Simple width-based progress bar with optional pending count tooltip.

### `src/components/MicButton.tsx`

Voice input button using Web Speech API. Renders nothing if unsupported.

### `src/components/useVoiceInput.ts`

Web Speech API hook: `isVoiceInputSupported()`, `useVoiceInput(onResult)`.

### `src/pages/Landing.tsx`

Login screen. Two auth modes:
- **Dev Mode:** generates a 6-digit code instantly (shown on screen)
- **Real Auth:** sends real OTP via EmailJS (requires Service ID, Template ID, Public Key)

EmailJS config can be entered in UI or via `.env` variables.

### `src/pages/Dashboard.tsx`

Dashboard with: alerts (computed), summary cards, project grid, add-project drawer.

### `src/pages/Home.tsx`

Cross-project home screen with 7 tabs: Tasks, Resources, Links, Contacts, Calendar, Schedule, Reminders. Each tab is a sub-component in `src/components/home/`.

### `src/pages/Settings.tsx`

Settings page with sections:
- Gemini API key (stored in Dexie settings, synced to Supabase)
- Supabase connection (configure URL + anon key, test connection, sync)
- Google Calendar OAuth (connect via GIS, sync events)
- Google Picker API key (for Drive folder selection)

### `src/pages/ProjectView.tsx`

The largest component (~2010 lines). Project workspace with tabs:
- Documentation (outline/phase editor)
- Tasks (create, edit, delete, status cycle, scheduling)
- Resources (category-specific forms: notes, links, scripts, images, pdfs)
- Milestones (title, description, target date, blocking tasks, auto-complete)
- Issues (title, description, severity, labels, comments, milestone linking)
- Insights (personal notes: title, body, link/image/pdf types, file parsing)
- Reminders (datetime-local input, bucketing)
- Contacts (type filter, project linking)
- Calendar (month grid view + list view, .ics import)

Tab query parameter mapping: `TAB_QUERY` maps tab names to URL query params.

### `src/components/home/HomeTasksTab.tsx`

Cross-project task listing with filters: all, active, inactive, completed, overdue, scheduled, AI.

### `src/components/home/HomeResourcesTab.tsx`

Cross-project resource browser with category filtering, custom category management (localStorage), text file upload parsing, project filter.

### `src/components/home/HomeLinksTab.tsx`

Cross-project links browser with provider filtering (Gemini, Claude, GPT, Other), project association, copy-to-clipboard.

### `src/components/home/HomeContactsTab.tsx`

Cross-project contacts with type filter, search, add/edit/delete, project association.

### `src/components/home/HomeCalendarTab.tsx`

Month grid + list view calendar. .ics file import with Google Calendar .ics export guidance.

### `src/components/home/HomeScheduleTab.tsx`

Scheduled tasks + calendar events grouped by day, with Meet link buttons.

### `src/components/home/HomeRemindersTab.tsx`

Reminders bucketed into overdue, due today, upcoming. Inline edit and datetime-local rescheduling.

### `src/components/project/ContactsTab.tsx`

Project-scoped contacts: linked vs available, toggle linking, create/delete.

### `src/components/project/InsightsTab.tsx`

Project-scoped insights: note/link/image/pdf types, .txt/.md file upload parsing, PDF helper guidance link.

---

## Supabase Schema (`supabase_schema.sql`)

> 11 tables with RLS enabled and public access policies. Tables: `projects`, `tasks`, `resources`, `milestones`, `issues`, `contacts`, `reminders`, `calendar_events`, `insights`, `doc_entries`, `settings`.

Key schema details:
- All tables use `TEXT PRIMARY KEY` for `id`
- Timestamps stored as `BIGINT` (ms epoch)
- `tags`, `linked_project_ids`, `blocking_task_ids`, `comments`, `files`, `images` use `JSONB DEFAULT '[]'::jsonb`
- RLS enabled on all tables with `USING (true) WITH CHECK (true)` (public access for single-user personal app)

---

## Documentation

### `docs/panga.md`

Full merged design and build plan (179 lines). Key sections:
- **Known bugs:** App gets stuck on Add Project screen; existing projects don't load; resize issues
- **Design principles:** No emojis, monospace type, sliding transitions, hover hints, responsive fit, editable/deletable items, text-only upload rule
- **Architecture:** Offline-first (Dexie/IndexedDB), Supabase sync (opt-in), Google Calendar/Drive integration, Gemini AI assistant with approval workflow
- **Auth:** EmailJS OTP (dev mode fallback), session-gated routes
- **Build order:** Bug fixes → transitions → schema migrations → home screen → workspace tabs → secrets encryption → search → AI → Google integrations → UI pass → Supabase sync → docs

### `unfinished.md`

Recent work log (153 lines). Status of fixes:
- Calendar Tab: FIXED (TAB_QUERY mapping, grid view, ICS date parsing)
- Subcategories: SHARED across all projects (localStorage `panga-subcategories-global`)
- File upload: .txt/.md parsed into body, .doc/.docx requires conversion
- Insights: personal notes, not analytics
- AI Assistant: fully implemented (server.ts, AssistantPanel)
- Settings - Google OAuth: UI exists, not tested
- PWA: configured, offline not fully tested

### Test files (`test-*.mjs`)

Playwright test scripts targeting `http://127.0.0.1:5199/`:
- `test-debug.mjs` — captures console errors, page errors, 4xx/5xx responses
- `test-fresh.mjs` — tests fresh install (no existing data)
- `test-migration.mjs` — tests DB migration from previous versions
- `test-project.mjs` — tests project creation and data entry flow

### `script.sh`

Setup script for Supabase CLI:
1. Install Supabase CLI (`npm install -g supabase`)
2. Login to Supabase
3. Create project, get URL + anon key → `.env.local`
4. Run `supabase db push` to set up schema
5. Enable Google OAuth in Supabase dashboard

---

## Key Data Flow Summary

1. **App startup:** `main.tsx` → `App.tsx` → `ensureSeedData()` + `syncAll()` → render `Landing` or `AppShell`
2. **Auth:** `Landing` → `otp.ts` (sendOtp/verifyOtp) → `session.ts` (setSession) → protected routes
3. **Data layer:** All CRUD in `src/data/*.ts` → Dexie (`db.ts`) → immediate push via `supabaseSync.ts`
4. **Sync:** UI actions call `syncPushRecord()` (immediate) or `syncAll()` (full 2-way on startup)
5. **AI:** `AssistantPanel` → `POST /api/assistant/chat` → `server.ts` → Gemini API → action proposals → user approval → Dexie write

## Known Issues to Debug

Per `docs/panga.md` §12 and `unfinished.md`:
1. App gets stuck on Add Project screen (check Dexie migration from v2→v3, goals→milestones)
2. Existing projects may not load (DB migration failure)
3. Component resize issues (no fixed widths / overflow handling)
4. Google OAuth flow not tested (needs Google Cloud project setup)
5. PWA offline functionality not verified
6. Search navigation to Calendar/Insights tabs needs verification
