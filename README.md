# Panga - Local-First Project & Resource Planner

Personal, offline-first project and resource planner with Gemini AI integration and optional Google Drive synchronization.

## Architecture

- **Frontend**: React 19 SPA with Vite, TypeScript, and offline-first IndexedDB (Dexie)
- **Backend**: Express on Node.js 22 providing secure server-side Gemini AI processing (`/api/assistant/chat`) and health monitoring (`/health`)
- **Storage**: Local IndexedDB as primary source of truth; optional encrypted sync via Google Drive AppData folder or provider-agnostic WebDAV
- **Hosting**: Configured for **Fly.io** using Docker and `fly.toml`; can also deploy as static site (e.g. Vercel)

---

## Features

### Local-First Core
- **Zero-authentication Quick Upload**: Restore from `.json` snapshot on first load without any account setup
- **Full Offline Support**: All data stored in IndexedDB; works completely offline
- **Snapshot Export/Import**: Download complete backups as versioned JSON files; drag-and-drop to restore

### Google Drive Sync (Optional)
- **AppData Folder Sync**: Automatic background sync to your private Google Drive `appDataFolder`
- **Debounced Auto-sync**: Changes debounced (30s) and uploaded automatically
- **Cross-device Restore**: On new device, connect Google Drive and offer to restore existing snapshot
- **Manual Controls**: "Download Backup" / "Upload Snapshot" buttons in Settings

### WebDAV Cloud Backup & Sync (Optional)
- **Provider-agnostic**: Works with any standard WebDAV server — InfiniCLOUD, Nextcloud, ownCloud, pCloud, etc.
- **Encrypted credentials**: Your WebDAV app password is encrypted locally (AES-256-GCM) before being stored in IndexedDB — never persisted plaintext.
- **Test Connection**: Verifies credentials and endpoint reachability via a WebDAV `PROPFIND` request before saving.
- **Manual Export / Import**: "Upload Backup" (PUT) serialises your full database to a single `app_backup.json` on your WebDAV server; "Download Backup" (GET) retrieves, validates, and prompts before restoring.
- **Custom backup path**: Save your backup to a custom folder on the WebDAV server, e.g. `backups/my-backup.json`.
- **No vendor lock-in**: Use your own self-hosted WebDAV/Nextcloud endpoint or a free provider — nothing is routed through Panga's servers.

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

### Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Server-side Gemini API key for AI Assistant | Yes (for AI features) |
| `VITE_GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID (Web app) for Google Drive sync | No (optional sync) |
| `VITE_GOOGLE_API_KEY` | Google API Key with Drive API enabled | No (optional sync) |

**Google Cloud Console Setup** (for Drive sync):
1. Create a project at https://console.cloud.google.com
2. Enable **Google Drive API**
3. Create **OAuth 2.0 Client ID** (Web application type)
4. Add authorized redirect URIs: `http://localhost:3000` (dev), your production domain
5. Copy Client ID to `VITE_GOOGLE_CLIENT_ID`
6. Create **API Key** with Drive API restriction, copy to `VITE_GOOGLE_API_KEY`

---

## Deploying to Fly.io

### 1. Install Flyctl

```bash
# macOS
brew install flyctl

# Linux / WSL
curl -L https://fly.io/install.sh | sh

# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex
```

### 2. Login to Fly.io

```bash
fly auth login
```

### 3. Launch App

```bash
fly launch --copy-config
```

This uses the included `fly.toml` and `Dockerfile`.

### 4. Configure Secrets

```bash
# Set Gemini API key (required for AI features)
fly secrets set GEMINI_API_KEY="your-gemini-api-key"

# Optional: Google Drive sync credentials
fly secrets set VITE_GOOGLE_CLIENT_ID="your-client-id"
fly secrets set VITE_GOOGLE_API_KEY="your-api-key"
```

### 5. Deploy

```bash
fly deploy
```

Fly.io will:
1. Build the production Docker container (Vite frontend + Express server)
2. Start the server listening on internal port `8080` (mapped to public HTTPS 80/443)
3. Validate container health via `/health`

---

## Usage Guide

### First Launch — Quick Upload

1. Open the app — if no local data exists, you'll see the **Quick Upload / Restore Snapshot** dropzone
2. Drag a `.json` snapshot file (from a previous backup) or click "Choose Snapshot File"
3. Enter an email address to associate with this data
4. The snapshot is validated, imported to IndexedDB, and you're redirected to the dashboard

### Normal Sign Up / Login

1. Click "Sign Up" to create an account with email + password
2. Your data is stored locally in IndexedDB (per-user database)
3. No server-side database required — everything stays in your browser

### Connect Google Drive (Optional)

1. Open **Settings** → **Data Persistence & Storage**
2. Enter your **Google OAuth Client ID** (from Google Cloud Console)
3. Click **"Connect Google Drive"** — completes OAuth consent flow
4. Your local snapshot is uploaded to the private `appDataFolder`
5. Auto-sync runs every 30 seconds after changes

### Connect WebDAV Cloud Backup (Optional)

1. Open **Settings** → **Cloud Backup & Sync (WebDAV)**
2. Enter your WebDAV endpoint URL (e.g. `https://your-id.teracloud.jp/dav/`)
3. Enter your **User ID / Username**
4. Enter your **App Password** (app-specific password, not your regular login password)
5. Set a **Backup File Path** (defaults to `app_backup.json`, or use a folder like `backups/my-backup.json`)
6. Click **"Test Connection"** — verifies credentials via a WebDAV `PROPFIND` request
7. Once verified, use **"Upload Backup"** to export your database, or **"Download Backup"** to restore

> **Need free cloud storage?** Sign up at [InfiniCLOUD (20GB Free)](https://www.infiniclouds.com/) → Go to Account Settings → Enable "Apps Connection" to get your WebDAV URL and App Password.

**Recommended free providers:**
- **InfiniCLOUD** — 20 GB free, WebDAV access
- **Nextcloud providers** — many offer free WebDAV accounts

### Manual Backup/Restore

- **Download Backup (.json)**: Exports full local database to a versioned JSON file
- **Upload Snapshot (.json)**: Restores from a local backup file
- **Sync Now**: Forces immediate upload to Google Drive

### Sync Status Badge

The header shows your sync state:
- `📱 Offline Only` — No cloud sync connection configured
- `☁️ Google Drive` — Connected, auto-sync active
- `☁️ WebDAV` — Connected, manual backup/restore available
- `⟳ Syncing...` — Background sync in progress
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

**Security**: Snapshots contain **only application state** — never credentials, API keys, or OAuth tokens. WebDAV app passwords are encrypted locally (AES-256-GCM) in IndexedDB via the `crypto.ts` module before storage; plaintext passwords are discarded from memory after connection verification.

> **WebDAV backup file**: Uploaded backups are stored as `app_backup.json` (or a custom path you specify) at your WebDAV endpoint using HTTP `PUT` with Basic Auth. Downloads use `GET` and are validated against the snapshot schema before restoring.

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
│   ├── webdav.ts       # WebDAV cloud backup client (PUT/GET/PROPFIND)
│   ├── crypto.ts       # AES-256-GCM credential encryption
│   ├── driveSync.ts    # Google Drive AppData sync
│   ├── googleCalendar.ts # Google Calendar import
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

### "WebDAV: Unauthorized / Not Found / Connection failed"
- Verify the endpoint URL — it must end with a trailing slash and include the correct path (e.g. `https://your-id.teracloud.jp/dav/`)
- Use an **App Password**, not your regular login password
- Ensure "Apps Connection" (or equivalent WebDAV/app access) is enabled in your provider's settings
- Check the **Backup File Path** — it must point to a file, not a collection (folder)
- For Nextcloud, the URL typically looks like `https://your-server.com/remote.php/dav/files/username/`
- Ensure your server supports WebDAV over HTTPS; some providers require whitelisting your app

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
- **WebDAV** — Provider-agnostic cloud backup protocol
- **InfiniCLOUD** — Recommended free WebDAV provider (20 GB)
- **Web Crypto API** — AES-256-GCM credential encryption
