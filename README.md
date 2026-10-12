# Panga - Local-First Project & Resource Planner

Personal, offline-first project and resource planner with Gemini AI integration and optional Google Drive synchronization.

## Architecture

- **Frontend**: React 19 SPA with Vite, TypeScript, and offline-first IndexedDB (Dexie)
- **Backend**: Express on Node.js 22 providing secure server-side Gemini AI processing (`/api/assistant/chat`) and health monitoring (`/health`)
- **Storage**: Local IndexedDB as primary source of truth; optional cloud sync via Google Drive AppData folder or private GitHub Gist
- **Hosting**: Configured for Vite SPA frontend and serverless API routes.

---

## Features

### Local-First Core
- **Guest / unlogged mode**: Start and use the app without any account. Progress is saved on-device (IndexedDB). Log in or connect cloud later from Settings.
- **Zero-authentication Quick Upload**: Restore from `.json` snapshot on first load (or Landing dropzone) without any account setup
- **Full Offline Support**: All data stored in IndexedDB; works completely offline
- **Snapshot Export/Import**: Download complete backups as versioned JSON files; drag-and-drop to restore
- **Thought train**: Capture fleeting notes (with optional voice input) on the Home screen and scroll history later

### Google Drive Sync (Optional)
- **AppData Folder Sync**: Automatic background sync to your private Google Drive `appDataFolder`
- **Debounced Auto-sync**: Changes debounced (30s) and uploaded automatically
- **Cross-device Restore**: On new device, connect Google Drive and offer to restore existing snapshot
- **Manual Controls**: "Download Backup" / "Upload Snapshot" buttons in Settings

### GitHub Gist Sync (Optional)
- **Zero Server Setup**: Pure client-side backup and restore to a private GitHub Gist using the GitHub REST API.
- **Automatic Gist Provisioning**: Leave the Gist ID blank to automatically create a private Gist on first sync.
- **Secret Scanning Protection**: Built-in credential redaction ensures Personal Access Tokens are never accidentally included in the Gist content.
- **One-Click Restore**: Pull and restore your entire database from your GitHub Gist at any time.

### AI Integration
- **Gemini API Proxy**: Server-side `/api/assistant/chat` endpoint keeps your API key secure
- **AI Assistant Chat**: Natural language planning and task management
- **Web Search**: Optional Google Search grounding for responses

### Project Management
- Projects with tasks, milestones, resources, issues, documentation
- Calendar integration (local events + Google Calendar import)
- Reminders, contacts, insights, conversations
- Global search across all entity types

---

## Quick Start

### Local Development

No `.env` file or environment variables are required! All features run out of the box.

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Build for production
npm run build

# Start production server locally
npm start
```

### Zero-Config Environment & Client-Side Keys

Panga is strictly local-first and **requires no `.env` variables to run**. All keys, tokens, and credentials are configured directly in your browser via the **Settings** menu:

- **Gemini API Key**: Configure in **Settings &rarr; Gemini API Key** (free from [Google AI Studio](https://aistudio.google.com/apikey)). The key is passed directly client-side.
- **Google Drive Sync**: Enter your **Google Client ID** in **Settings &rarr; Cloud Backup &amp; Sync &rarr; Google Drive**.
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

### Cloud Backup & Multi-Sync (Settings)

Panga gives you full control over how and where your backups are stored:

#### 1. Google Drive
- Connect using your own **Google Client ID** in Settings. Backups sync automatically to your hidden Google Drive `appDataFolder`.

#### 2. GitHub Gist
- Sync private backups to a personal GitHub Gist using a GitHub Personal Access Token (`gist` scope).
- Works with classic PAT (`ghp_...`) or fine-grained tokens.
- All tokens are sent exclusively via standard authorization headers (`Authorization: Bearer <token>`) and scrubbed from payloads, preventing token exposure or revocation.
- Leave Gist ID empty to auto-create a private Gist on first sync, or provide an existing Gist ID.

#### 3. Instant Snapshot & Email Backups
- **Download Snapshot**: Instant `.json` file download containing your full workspace.
- **Email Backup**: Send automated backup JSON files directly to your inbox via Resend or SendGrid.

### Sync Status Badge

The header shows your sync state:
- `· local` — Offline / on-device storage
- `☁️ Google Drive` — Connected, auto-sync active
- `🐙 GitHub Gist` — Connected, gist backup active
- `⟳ Saving…` — Sync in progress
- `✓ saved` — Synced successfully
- `✗` — Sync error (check Settings for details)

---

## Data Model

All data lives in IndexedDB (Dexie) with these tables:

| Table | Description |
|-------|-------------|
| `projects` | Project containers |
| `tasks` | Tasks within projects |
| `resources` | Links, notes, scripts, images, PDFs |
| `milestones` | Project milestones with blocking tasks |
| `issues` | Issues with severity, labels, comments |
| `contacts` | People with email/phone/link |
| `reminders` | Time-based notifications |
| `calendarEvents` | Local + Google Calendar events |
| `scheduleItems` | Time-blocked schedule entries |
| `docEntries` | Project documentation (outline/phase) |
| `insights` | AI-generated or manual insights |
| `conversations` | AI chat history |
| `messages` | Individual chat messages |
| `settings` | User preferences (API keys, tokens, etc.) |
| `scheduleItems` | Calendar schedule entries |

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
│   ├── snapshot.ts     # Export/import utilities
│   ├── githubGistSync.ts # GitHub Gist backup & sync
│   ├── googleDriveSync.ts # Google Drive AppData sync
│   ├── googleCalendar.ts # Google Calendar import
│   ├── crypto.ts       # Web Crypto API credential encryption
│   └── sync.ts         # Local sync coordination
├── auth/
│   └── session.ts      # Email/password + snapshot session
├── search/
│   └── search.ts       # Global search across entities
└── App.tsx             # Root component, routing, auth guard
```

### Key Patterns

- **Local-first**: All writes go to IndexedDB first; sync is async and non-blocking
- **Sync coordination**: `sync.ts` handles local status; `driveSync.ts` handles Google Drive
- **No direct Dexie imports outside `/data`**: Data modules export typed functions
- **Debounced auto-sync**: `autoSyncIfNeeded()` called after mutations

### Running Tests

```bash
# Playwright E2E tests (requires dev server running)
npx playwright test test-*.mjs
```

---

## Troubleshooting

### "No snapshot found on Google Drive"
- Ensure you've connected Google Drive and uploaded at least once
- Check that the Drive API is enabled in Google Cloud Console
- Verify the OAuth Client ID matches the one used to upload

### "Invalid snapshot file"
- Snapshot must be a valid JSON with `metadata.version` and `data` object
- Version mismatches may require manual migration (not yet automated)

### Sync stuck at "Syncing..."
- Check browser console for network errors
- Verify internet connectivity
- Try "Sync Now" manually in Settings

### Port 3000 already in use
```bash
lsof -ti:3000 | xargs kill -9
```

### GitHub Gist Sync Issues
- Ensure your Personal Access Token has the `gist` permission scope.
- In Panga, tokens are transmitted purely via Authorization headers (`Bearer <token>`) and are automatically scrubbed from backup contents to avoid GitHub secret scanning auto-revocation.
- If you see "Gist ID not found", click "Clear Gist ID" in Settings to automatically create a fresh private Gist on the next sync.

---

## License

MIT License — feel free to use, modify, and distribute.

---

## Acknowledgments

- **Dexie.js** — IndexedDB wrapper
- **Vite** — Build tool
- **React 19** — UI framework
- **Google Drive API** — AppData folder sync
- **Google Identity Services** — OAuth flow
- **@google/genai** — Gemini AI SDK
- **Web Crypto API** — AES-256-GCM credential encryption
