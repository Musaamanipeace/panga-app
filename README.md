# Panga - catch your train of thought, tick off tasks

Offline-first PWA for computers and phones. Capture thoughts in one click, turn them into nested tasks in task lists, keep link folders, categorised notes (with voice typing, read-aloud and spelling/grammar assists), and reminders with selectable tones. Guest/local-only is always allowed; log in with Supabase for cloud sync. No workspaces. See `CHANGES.md` for what changed in the pivot and how to set up sync.

## Architecture

- **Frontend**: React 19 SPA with Vite, TypeScript, and offline-first IndexedDB (Dexie)
- **Backend**: Express on Node.js 22 providing secure server-side AI processing and health monitoring
- **Storage**: Local IndexedDB as primary source of truth; optional cloud sync via Supabase (auth + last-write-wins sync)
- **Hosting**: Configured for Vite SPA frontend and serverless API routes.

---

## Features

### Local-First Core
- **Guest / unlogged mode**: Start and use the app without any account. Progress is saved on-device (IndexedDB). Log in or connect Supabase later from Settings.
- **Full Offline Support**: All data stored in IndexedDB; works completely offline
- **Snapshot Export/Import**: Download complete backups as versioned JSON files; drag-and-drop to restore
- **Thought train**: Capture fleeting notes (with voice input) and promote a thought → task (into a chosen list) or → note
- **Clipboard**: Paste history with "Save as note" / "Save as task" affordances

### Task lists (nested checklists)
- **Task lists**: Top-level containers with a title, optional description and order. Create, rename, delete and reorder lists.
- **Nested tasks**: Checkable items that belong to a list or a parent task (subtasks, unlimited depth, UI soft-limited to 3 levels). Toggle complete/incomplete, optional due date, notes and tags.
- **Tree view**: Indented checklist with expand/collapse, inline edit, add subtask, drag-style reorder.
- **Filters**: Active / Completed / All.

### Link folders
- **Link folders**: Named folders containing links (URL + title + optional notes/tags). Unsorted "Inbox links" folder. Create/rename/delete/reorder folders and links; open, copy, edit, move between folders, search.

### Notes
- **Notes editor**: Dedicated notes with plain-text body, native spellcheck, categories/tags.
- **Voice typing**: Reuse the offline mic / Whisper path on the notes body.
- **Read aloud**: Browser speech synthesis on note body and selection.
- **Spelling/grammar**: Native browser spellcheck; optional "Suggest corrections" when the user supplies an AI key (never a hard dependency).

### Reminders
- **Reminders**: Message + trigger time, optional link to a task or note, selectable tone (default/chime/soft/urgent).
- **Notifications**: System notification + selected tone when due; permission prompt in Settings / first reminder.

### Train of thought
- Quick-capture stream; promote a thought → task (into a chosen list) or → note.

### Login (Supabase)
- **Supabase Auth**: Username/email + password. Required for cloud sync; guest/local-only still allowed. After login, local rows bind to `user_id` and sync begins.
- **Account panel**: Supabase URL/key, sign up / sign in / sign out, sync status.

### AI Integration
- **AI Assistant Chat**: Natural language planning and task management with your own key (OpenRouter, Gemini, Claude, OpenAI, Grok, Groq).
- **Web Search**: Optional Google Search grounding for responses.

---

## Quick Start

### Local Development

No `.env` file or environment variables are required! All features run out of the box.

```bash
# Install dependencies
npm install

# Start development server on port 5173
npm run dev

# Build for production
npm run build

# Start production server locally
npm start
```

### Zero-Config Environment & Client-Side Keys

Panga is strictly local-first and **requires no `.env` variables to run**. All keys, tokens, and credentials are configured directly in your browser via the **Settings** menu:

- **Gemini API Key**: Configure in **Settings &rarr; Gemini API Key** (free from [Google AI Studio](https://aistudio.google.com/apikey)). The key is passed directly client-side.
- **GitHub Gist Sync**: Enter your **Personal Access Token** (classic or fine-grained with `gist` scope) directly in **Settings &rarr; Cloud Backup &amp; Sync &rarr; GitHub Gist**.
- **Email Backup**: Configure your free **Resend** or **SendGrid** API key in **Settings &rarr; Email Dispatch Key**.

*(Optional: If you are self-hosting a shared backend, optional environment variables like `PORT` or `DATA_DIR` may be configured, but none are required).*

---

## Deploying to Vercel

### 1. Connect Git Repository

1. Push your latest code to your GitHub repository (e.g. `main` branch).
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New... → Project**.
3. Import your GitHub repository.

### 2. Build & Output Settings

Vercel automatically detects the Vite framework using the included `vercel.json`:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 3. Deploy

Click **Deploy**. Vercel will:
1. Run `npm run build` to typecheck and bundle the React SPA.
2. Deploy the static assets with SPA routing.
3. Deploy serverless functions in `/api` (AI assistant, email backup).

---

## Usage Guide

### Offline Mode & Starting Options

From the Landing page, choose how you want to work:

1. **Continue Offline**:
   - **Start Afresh**: Clears any previous local database data on this browser, creates a clean guest session, and starts with an empty planner. (If local projects already exist, it prompts for confirmation before clearing).
   - **Resume Local**: Continues working with the existing data stored in your browser's IndexedDB. If no saved data is found, it prompts you to either Start Afresh or import a JSON backup.
2. **Import JSON Backup**:
   - Drag and drop any previously exported `panga-backup-*.json` or snapshot file directly into the dropzone to restore your full workspace instantly.
3. **Optional Account**:
   - Create a local account or log in with email/password if you want multi-profile management.

### Cloud Sync (Supabase)

Panga syncs to Supabase when you configure a project URL + anon key (in Settings or via `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`).

1. Create a project at https://supabase.com.
2. SQL Editor → run `supabase/schema.sql` (creates task lists, tasks, link folders, links, notes, reminders with RLS) and `supabase/panga_sync.sql`.
3. Authentication → Providers → Email: turn **Confirm email OFF** (usernames become `name@panga.invalid`, so no email is ever sent).
4. Put the project URL and anon key in Settings → Supabase, then Sign up / Sign in.
5. Local Dexie stays primary; Supabase mirrors changes (last-write-wins, deletes tracked via tombstones).

Optional: add repo secrets `SUPABASE_URL` and `SUPABASE_ANON_KEY` so a keepalive workflow stops the free project pausing.

If Supabase rejects the generated address, change the login domain in Settings → Advanced, or sign up with a real email.

### Sync Status Badge

The header shows your sync state:
- `● online` / `○ offline` — network state
- Sync badge — local / syncing / synced / error

---

## Data Model

All data lives in IndexedDB (Dexie) with these tables:

| Table | Description |
|-------|-------------|
| `taskLists` | Task list containers (title, description, order) |
| `tasks` | Hierarchical checkable tasks (listId, parentId, subtasks) |
| `linkFolders` | Named link folders |
| `links` | Bookmarks (URL, title, notes, tags, folderId) |
| `notes` | Dedicated notes (title, body, tags) |
| `reminders` | Time-based reminders (toneId, linked task/note) |
| `resources` | Legacy resources (read-only during transition) |
| `projects` | Legacy projects (read-only during transition) |
| `milestones`, `issues`, `contacts`, `calendarEvents`, `scheduleItems`, `docEntries`, `insights`, `conversations`, `messages` | Legacy tables (read-only during transition) |
| `trainOfThought` | Quick-capture stream |
| `clipboard` / clips | Clipboard history (local only, never synced) |
| `settings` | User preferences (API keys, tokens, etc.) |

Legacy project/workspace tables remain readable for one release but are no longer written by the primary UX.

---

## Snapshot Format

Exported snapshots follow this structure:

```json
{
  "metadata": {
    "version": "1.0",
    "exportedAt": "2026-09-29T12:34:56.789Z",
    "appName": "Panga",
    "dbVersion": 7
  },
  "data": {
    "projects": [...],
    "tasks": [...],
    "resources": [...],
    "milestones": [...],
    "issues": [...],
    "contacts": [...],
    "reminders": [...],
    "calendarEvents": [...],
    "scheduleItems": [...],
    "docEntries": [...],
    "insights": [...],
    "conversations": [...],
    "messages": [...],
    "settings": [...]
  }
}
```

**Security**: Snapshots contain **only application state** — never credentials, API keys, or OAuth tokens. All client-side secrets and access tokens stored in IndexedDB are isolated from export files and scrubbed before upload.

> **GitHub Gist backup file**: Backups are stored as `data.json` inside your private Gist using the GitHub REST API with Authorization Bearer headers. Downloads use the GitHub API and are validated against the snapshot schema before restoring.

---

## Development

### Project Structure

```
src/
├── components/          # React components (AppShell, GlobalSearch, AssistantPanel, etc.)
├── pages/               # Route pages (Landing, Home, ProjectView, Settings)
├── data/
│   ├── db.ts           # Dexie database schema & migrations
│   ├── projects.ts     # Project CRUD + sync
│   ├── tasks.ts        # Task CRUD + sync
│   ├── resources.ts    # Resource CRUD + sync
│   ├── ...             # Other entity modules
│   └── utils.ts        # ID generation, timestamps
├── sync/
│   ├── supabaseSync.ts   # Supabase auth, push/pull + RLS mirroring
│   ├── sync.ts           # Local sync coordination
│   ├── snapshot.ts       # Export/import utilities
│   ├── tombstones.ts     # Delete tracking for sync
│   └── crypto.ts         # Web Crypto API credential encryption
├── auth/
│   └── session.ts        # Session + Supabase auth binding
├── search/
│   └── search.ts         # Global search across entities
└── App.tsx               # Root component, routing, auth guard
```

### Key Patterns

- **Local-first**: All writes go to IndexedDB first; sync is async and non-blocking
- **Sync coordination**: `sync.ts` handles local status; `supabaseSync.ts` handles Supabase push/pull
- **No direct Dexie imports outside `/data`**: Data modules export typed functions

### Running Tests

```bash
# Playwright E2E tests (requires dev server running)
npx playwright test test-*.mjs
```

---

## Troubleshooting

### "Invalid snapshot file"
- Snapshot must be a valid JSON with `metadata.version` and `data` object
- Version mismatches may require manual migration (not yet automated)

### Sync stuck at "Syncing..."
- Check browser console for network errors
- Verify internet connectivity
- Try "Sync Now" manually in Settings
- Ensure Supabase URL + anon key are configured and RLS allows your user_id

### Port 5173 already in use
```bash
lsof -ti:5173 | xargs kill -9
```

### Notifications not firing
- Grant notification permission when prompted (or click "Enable notifications" on the Reminders tab)
- Notifications only fire while the app tab is open (free-tier reliability); OS may throttle when fully closed

---

## License

MIT License — feel free to use, modify, and distribute.

---

## Acknowledgments

- **Dexie.js** — IndexedDB wrapper
- **Vite** — Build tool
- **React 19** — UI framework
- **Dexie.js** — IndexedDB wrapper
- **Vite** — Build tool
- **React 19** — UI framework
- **Supabase** — Auth + cloud sync backend
- **@supabase/supabase-js** — Supabase client
- **@google/genai** — Gemini AI SDK
- **Web Crypto API** — AES-256-GCM credential encryption

---

## Voice Input

Click into **any** text box or textarea and a small mic appears beside it (or press `Alt+Shift+M`). Speak, and the text is inserted **at your cursor**. It never replaces what you've already written: if text is selected, the dictation goes after it. Click into another field mid-dictation and it follows you. `Esc` stops.

Choose how speech is recognised in **Settings → Voice Input**:

| Engine | Works offline | Private | Notes |
| --- | --- | --- | --- |
| **On this device** (default) | Yes, after a one-time model download | Audio never leaves the device | Whisper runs in the browser. Text appears when you pause. Models: Tiny (English, ~40 MB), Base (~80 MB), Small (~260 MB, best for Swahili). |
| **Browser speech recognition** | No | No: the browser vendor receives the audio | Live words as you speak. Chrome/Edge/Safari only. |
| **Panga server** | No (needs the server) | Audio goes to *your* server | Appears only when `WHISPER_SERVER_URL` is set (see below). |

Fields for passwords, e-mail, numbers, dates, and API keys/tokens are skipped automatically. Opt any field (or a whole section) out with a `data-no-voice` attribute.

**How it works:** `src/voice/` contains one global `VoiceProvider` (mounted in `App.tsx`), caret-safe insertion (`insertText.ts`), a voice-activity detector (`audio.ts`), and three interchangeable engines (`engines/`). New inputs get dictation automatically; no per-field code is needed.

**Model hosting:** model files download from huggingface.co the first time they are needed and are then cached by the browser. To use your own mirror, build with `VITE_MODEL_HOST=https://your-host/` (and allow it in the CSP `connect-src`). The WebAssembly runtime is self-hosted from `/ort/` (copied from `node_modules` by `scripts/copy-ort.mjs` before `dev`/`build`).

**Optional self-hosted transcription:** set `WHISPER_SERVER_URL` (and optionally `WHISPER_SERVER_MODEL`) to any OpenAI-compatible `/v1/audio/transcriptions` server. The Express server exposes it to the app through `POST /api/transcribe`.

---

## Installing Panga as an app (PWA)

Panga is an installable, offline-capable web app. An **Install app** button appears on the landing page, in the app header, and in **Settings → Install & Offline**. Where the browser supports one-tap install, the button triggers it; elsewhere it shows step-by-step instructions (iOS: Share → Add to Home Screen; Safari on Mac: File → Add to Dock; Firefox desktop cannot install web apps).

Requirements and testing:

- Production must be served over **HTTPS** (`http://localhost` also counts as secure).
- `npm run dev` has the service worker off. To test installing locally use either `npm run build && npm start`, or `npm run dev:pwa`.
- Installed apps run on the engine of the browser that installed them (WebKit on iOS).

---

## Docker

```bash
docker compose up --build     # http://localhost:5173
```

The `Dockerfile` is multi-stage (deps, build, production-only deps, runtime). The final image has no build tools or sources, runs as a non-root user, and has a `HEALTHCHECK` on `/health`. Your pipeline still just runs `docker build .`; BuildKit caches the dependency layers. Build with `--target test` to run the unit tests as part of the image build.

Environment variables (all optional): `PORT`, `GEMINI_API_KEY`, `WHISPER_SERVER_URL`, `WHISPER_SERVER_MODEL`. Supabase URL/anon key are configured client-side in Settings (or via `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`).

`.github/workflows/ci.yml` is a template that lints, tests, builds, and publishes the image to GHCR on pushes to `main`.

> The speech library pulls in `onnxruntime-node`, whose install script downloads server binaries Panga never uses. Set `ONNXRUNTIME_NODE_INSTALL=skip` when installing (the Dockerfile, CI workflow, and `vercel.json` already do).

### Deployment note

`vercel.json` deploys only the static app. The Express routes (`/api/assistant/chat`, `/api/backup/email`, `/api/transcribe`, `/health`) need the Node server (e.g. the Docker image) and do not run on Vercel as configured, because this repo has no Vercel serverless functions.

## Tests

```bash
npm test     # caret-safe insertion, voice-activity detection, provider behaviour, install logic
```

---

## 2026-10 update: Supabase + multi-model AI + Puter/email removal

### Removed
- **Puter** entirely (SDK, auth, sync, `/puter` static, Landing/Settings UI paths).
- **Email backup** (Resend/SendGrid route, Settings UI, package `@emailjs/browser`).

### Kept
- Local-first **Dexie / IndexedDB** as offline source of truth, with JSON snapshot download/upload and bring-your-own Supabase sync.

### Added
1. **Supabase / Postgres**
   - Schema: `supabase/schema.sql` — tables for projects, tasks, resources, milestones, issues, contacts, reminders, calendar_events, insights, docs, conversations, messages, settings + RLS.
   - Client: `src/data/supabase.ts` — configure via `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` or Settings.
   - Architecture remains offline-first: Dexie is primary; Supabase is the standard remote Postgres for multi-device sync (wire full sync in a follow-up).

2. **Multi-provider AI** (`src/ai/providers.ts`)
   - Providers: Gemini, OpenAI, Anthropic (Claude), xAI (Grok), OpenRouter, Groq.
   - **Free models are never hard-coded** — `fetchAvailableModels(provider, apiKey)` calls the provider’s live list endpoint.
   - Settings helpers: `getAIProvider` / `setAIProvider`, `getAIApiKey` / `setAIApiKey`, `getAIModel` / `setAIModel`.

### Recommended providers (enough free + paid options)

| Goal | Provider | Why |
|------|----------|-----|
| **Best free tier + many models** | **OpenRouter** | Single key, 20+ free models (`:free` suffix), live `/models` list, also routes Gemini/Claude/Grok/OpenAI paid. |
| **Fast free inference** | **Groq** | Very high tokens/s free tier; live model list. |
| **Google free tier** | **Gemini** | Free tier via AI Studio key; list models dynamically. |
| **Paid quality** | **Anthropic Claude**, **OpenAI**, **xAI Grok** | First-party; use when you want native features / best quality. |

**Advice:** Use **OpenRouter** as the default switchable backend. Users paste one key and can pick any free or paid model from the live list. Fall back to direct Gemini / Claude / OpenAI / Grok keys when they prefer first-party billing or features.

### Still TODO (Settings UI + full sync)
- Settings.tsx still contains dead Puter/email state & handlers (imports removed; compile will fail until those UI blocks are deleted or rewritten). Clean the “Cloud Backup”, “Email backup”, and “Puter” sections and replace the Gemini-only key UI with the multi-provider picker + live model dropdown.
- Wire `AssistantPanel` / server AI route to use `src/ai/providers.ts` instead of hard-coded `gemini-3.8-flash`.
- Implement Dexie ↔ Supabase bidirectional sync (outbox + RLS already prepared).

