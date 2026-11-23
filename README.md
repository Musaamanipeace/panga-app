# Panga - catch your train of thought, tick off tasks

Offline-first PWA for computers and phones. Capture thoughts in one click, turn them into nested tasks in task lists, keep link folders, categorised notes (with voice typing, pause/resume read-aloud and proofreading), and reminders with selectable tones. Local-first with IndexedDB and unencrypted JSON snapshot export/import (no remote database or cloud sync).

## Architecture

- **Frontend**: React 19 SPA with Vite, TypeScript, and offline-first IndexedDB (Dexie)
- **Backend**: Express 5 on Node.js 22 serving static assets in production and optional Whisper transcription / health routes
- **Storage**: Local IndexedDB as the sole source of truth, paired with unencrypted JSON backup snapshots carrying your JSON account username and workspace data

---

## Features

### Local-First Core
- **Three landing choices**: **Continue local** (keep existing IndexedDB data), **Start afresh** (confirm, then wipe local data and start clean), or **Upload JSON** (restore a previously exported snapshot).
- **Full Offline Support**: All tasks, links, notes, reminders, clipboard history, thoughts, and settings live on your device in IndexedDB.
- **JSON Account & Backup**: Set a local username in Settings, download unencrypted JSON snapshots regularly, and drag-and-drop or upload to restore.
- **Thought train**: Capture fleeting notes (with voice input) and promote a thought to a task (into a chosen list) or to a note.
- **Clipboard**: Paste history with "Save as note" and "Save as task" affordances.

### Task lists (nested checklists)
- **Task lists**: Named containers with folders and order (`Alt+T`). Create, rename, delete, and reorder lists.
- **Nested tasks**: Checkable items belonging to a list or parent task (subtasks). Toggle complete/incomplete, park/activate, optional due date, notes, and tags.

### Link folders
- **Link folders**: Named folders containing links (`Alt+L`) with URL, title, notes, and tags. Open, copy, edit, move between folders, and search.

### Notes & Proofreading
- **Notes editor**: Dedicated notes (`Alt+N`) with plain-text body, native spellcheck, folders, tags, voice typing, pause/resume read-aloud, and inline Proofread trigger.
- **Voice typing**: Offline local Whisper transcription or browser speech recognition across any text field (`Alt+Shift+M`).
- **Read aloud**: Sentence-level Pause/Resume, Stop, voice status detection (`Ready offline`, `Online voices only`, `No voices found`, `Not supported`), and a Settings **Read aloud** setup card with OS-specific voice installation instructions, **Test voice**, and **Recheck**.
- **Proofread**: Standalone **Proofread** tab (`Alt+P`) and reusable modal from Notes and Tasks. Two actions (`Proofread` for grammar/spelling only, `Formatting` for grammar, spelling, and formatting), clarification follow-ups when needed, locked post-edit output with `Copy`, `Edit`, and optional `Apply` back to the source field. Uses your configured AI key from Settings.

### Reminders
- **Reminders**: Message + trigger time (`Alt+R`), optional link to a task or note, and selectable tone (`default`/`chime`/`soft`/`urgent`).
- **Notifications**: System notification + selected tone when due.

### Navigation & Shortcuts
- **Header**: `Panga` home link, **Search**, **💭 Thoughts**, **📋 Paste**, **Shortcuts**, and **Menu** (Settings, Online/Offline status, Install app, Exit).
- **Keyboard shortcuts**:
  - `Alt+T` — Task lists tab
  - `Alt+L` — Links tab
  - `Alt+N` — Notes tab
  - `Alt+R` — Reminders tab
  - `Alt+C` — Clipboard tab
  - `Alt+P` — Proofread tab
  - `Ctrl/Cmd+K` or `Alt+S` — Search
  - `Alt+Shift+M` — Voice dictation
  - `?` — Show shortcuts popover

### AI Integration
- **AI Assistant & Proofread**: Bring your own API key in Settings (OpenRouter, Google Gemini, OpenAI, Anthropic Claude, xAI Grok, Groq). Models are fetched live from the selected provider.

---

## Quick Start

### Local Development

No `.env` file or environment variables are required. Everything runs out of the box:

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

### Zero-Config Client-Side Keys

All AI provider keys are stored locally in IndexedDB and configured directly in **Menu → Settings → AI assistant**. Keys are never included in external telemetry; they stay on your device (and inside your exported JSON snapshots if you choose to back up your workspace).

---

## Data Model

All data lives in IndexedDB (Dexie):

| Table | Description |
|-------|-------------|
| `taskLists` | Task list containers |
| `taskFolders` | Hierarchical folders for task lists |
| `tasks` | Hierarchical checkable tasks (`listId`, `parentId`, `completed`) |
| `linkFolders` | Named link folders |
| `links` | Bookmarks (`url`, `title`, `notes`, `tags`, `folderId`) |
| `noteFolders` | Named note folders |
| `notes` | Dedicated notes (`title`, `body`, `tags`, `folderId`) |
| `reminderFolders` | Named reminder folders |
| `reminders` | Time-based reminders (`toneId`, linked task/note) |
| `trainOfThought` | Quick-capture stream |
| `clips` | Clipboard history (local only) |
| `settings` | User preferences (AI keys, voice settings, JSON account username) |

---

## Snapshot Format

Exported snapshots are plain, unencrypted JSON carrying workspace identity and IndexedDB tables:

```json
{
  "metadata": {
    "version": "1.0",
    "exportedAt": "2026-11-23T12:00:00.000Z",
    "appName": "Panga",
    "dbVersion": 14
  },
  "identity": {
    "userId": "guest_...",
    "username": "your-username",
    "email": "guest@local",
    "loggedIn": false
  },
  "data": {
    "taskLists": [],
    "tasks": [],
    "notes": [],
    "links": [],
    "reminders": [],
    "settings": []
  }
}
```

Save your JSON snapshot regularly from **Menu → Settings → JSON account & backup** — browser storage can be cleared at any time and there is no cloud copy.

---

## Development

### Project Structure

```
src/
├── auth/                # Local session ID, guest/landing transition
├── components/          # UI shell, search, proofread, assistant, tabs
├── data/                # Dexie database schema & entity modules
├── pages/               # Landing, PangaHome, Settings
├── proofread/           # System prompt rules & clarification parser
├── search/              # FlexSearch index over folders, items, task lists
├── speech/              # Sentence-level Pause/Resume TTS & voice setup UI
├── sync/                # Unencrypted JSON snapshot export/import
├── voice/               # Offline Whisper / browser dictation engine
├── shortcuts.ts         # Centralized tab & global keyboard shortcuts
└── App.tsx              # Root router & auth guard
```

### Verification Commands

```bash
npx tsc -b      # TypeScript check
npm test        # Vitest suite
npm run lint    # Oxlint check
npm run build   # Production build
```

---

## Voice Input

Click into any text field and a small mic appears beside it (or press `Alt+Shift+M`).

Choose how speech is recognised in **Menu → Settings → Voice Input**:

| Engine | Works offline | Private | Notes |
| --- | --- | --- | --- |
| **On this device** (default) | Yes, after a one-time model download | Audio never leaves the device | Whisper runs in the browser. Models: Tiny (~40 MB), Base (~80 MB), Small (~260 MB). |
| **Browser speech recognition** | No | No | Live words as you speak (Chrome/Edge/Safari). |
| **Panga server** | No | Audio goes to your server | Appears only when `WHISPER_SERVER_URL` is set. |

---

## Installing Panga as an app (PWA)

Panga is an installable, offline-capable web app. An **Install app** button appears on the landing page, inside **Menu**, and in **Menu → Settings → Install & Offline**.

- Production must be served over **HTTPS** (`http://localhost` also counts as secure).
- `npm run dev` disables the service worker; use `npm run dev:pwa` or `npm run build && npm start` to test installation locally.

---

## Troubleshooting

### "Invalid snapshot file"
- Ensure the uploaded `.json` file was exported from Panga with valid `metadata.version`, `metadata.exportedAt`, and `data` fields.

### Port 3000 already in use
```bash
lsof -ti:3000 | xargs kill -9
```

### Notifications not firing
- Grant notification permission when prompted on the Reminders tab.
- Notifications fire while the app is open; OS power management may throttle closed browser tabs.

---

## License

MIT License.
