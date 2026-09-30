# Codebase Dump

## Directory Structure

```text
.
├── .data/
│   ├── user_usr_35594624f02bfde0.json/
│   │   └── user_usr_35594624f02bfde0.json
│   ├── user_usr_a744863d83aefc35.json/
│   │   └── user_usr_a744863d83aefc35.json
│   ├── user_usr_a8e6eb24a7e9e7b1.json/
│   │   └── user_usr_a8e6eb24a7e9e7b1.json
│   └── users.json/
│       └── users.json
├── .dockerignore/
│   └── .dockerignore
├── .github/
│   └── workflows/
│       └── fly-deploy.yml/
│           └── fly-deploy.yml
├── .gitignore/
│   └── .gitignore
├── .oxlintrc.json/
│   └── .oxlintrc.json
├── Dockerfile/
│   └── Dockerfile
├── README.md/
│   └── README.md
├── api/
│   ├── assistant/
│   │   └── chat.js/
│   │       └── chat.js
│   └── backup/
│       └── email.js/
│           └── email.js
├── doc.md/
│   └── doc.md
├── fly.toml/
│   └── fly.toml
├── index.html/
│   └── index.html
├── metadata.json/
│   └── metadata.json
├── package-lock.json/
│   └── package-lock.json
├── package.json/
│   └── package.json
├── public/
│   ├── favicon.svg/
│   │   └── favicon.svg
│   ├── icons/
│   │   ├── icon-192.png/
│   │   │   └── icon-192.png
│   │   └── icon-512.png/
│   │       └── icon-512.png
│   └── icons.svg/
│       └── icons.svg
├── server.ts/
│   └── server.ts
├── src/
│   ├── App.tsx/
│   │   └── App.tsx
│   ├── assets/
│   │   ├── hero.png/
│   │   │   └── hero.png
│   │   ├── react.svg/
│   │   │   └── react.svg
│   │   └── vite.svg/
│   │       └── vite.svg
│   ├── auth/
│   │   └── session.ts/
│   │       └── session.ts
│   ├── components/
│   │   ├── AIAssistant.tsx/
│   │   │   └── AIAssistant.tsx
│   │   ├── AppShell.tsx/
│   │   │   └── AppShell.tsx
│   │   ├── AssistantPanel.tsx/
│   │   │   └── AssistantPanel.tsx
│   │   ├── GlobalSearch.tsx/
│   │   │   └── GlobalSearch.tsx
│   │   ├── MicButton.tsx/
│   │   │   └── MicButton.tsx
│   │   ├── ProgressBar.tsx/
│   │   │   └── ProgressBar.tsx
│   │   ├── ProjectCard.tsx/
│   │   │   └── ProjectCard.tsx
│   │   ├── home/
│   │   │   ├── HomeCalendarTab.tsx/
│   │   │   │   └── HomeCalendarTab.tsx
│   │   │   ├── HomeContactsTab.tsx/
│   │   │   │   └── HomeContactsTab.tsx
│   │   │   ├── HomeLinksTab.tsx/
│   │   │   │   └── HomeLinksTab.tsx
│   │   │   ├── HomeRemindersTab.tsx/
│   │   │   │   └── HomeRemindersTab.tsx
│   │   │   ├── HomeResourcesTab.tsx/
│   │   │   │   └── HomeResourcesTab.tsx
│   │   │   ├── HomeScheduleTab.tsx/
│   │   │   │   └── HomeScheduleTab.tsx
│   │   │   └── HomeTasksTab.tsx/
│   │   │       └── HomeTasksTab.tsx
│   │   ├── project/
│   │   │   ├── ContactsTab.tsx/
│   │   │   │   └── ContactsTab.tsx
│   │   │   └── InsightsTab.tsx/
│   │   │       └── InsightsTab.tsx
│   │   ├── ui.tsx/
│   │   │   └── ui.tsx
│   │   └── useVoiceInput.ts/
│   │       └── useVoiceInput.ts
│   ├── data/
│   │   ├── calendar.ts/
│   │   │   └── calendar.ts
│   │   ├── contacts.ts/
│   │   │   └── contacts.ts
│   │   ├── conversations.ts/
│   │   │   └── conversations.ts
│   │   ├── dashboard.ts/
│   │   │   └── dashboard.ts
│   │   ├── db.ts/
│   │   │   └── db.ts
│   │   ├── docs.ts/
│   │   │   └── docs.ts
│   │   ├── insights.ts/
│   │   │   └── insights.ts
│   │   ├── issues.ts/
│   │   │   └── issues.ts
│   │   ├── milestones.ts/
│   │   │   └── milestones.ts
│   │   ├── projects.ts/
│   │   │   └── projects.ts
│   │   ├── reminders.ts/
│   │   │   └── reminders.ts
│   │   ├── resources.ts/
│   │   │   └── resources.ts
│   │   ├── scheduler.ts/
│   │   │   └── scheduler.ts
│   │   ├── settings.ts/
│   │   │   └── settings.ts
│   │   ├── tasks.ts/
│   │   │   └── tasks.ts
│   │   └── utils.ts/
│   │       └── utils.ts
│   ├── index.css/
│   │   └── index.css
│   ├── main.tsx/
│   │   └── main.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx/
│   │   │   └── Dashboard.tsx
│   │   ├── Home.tsx/
│   │   │   └── Home.tsx
│   │   ├── Landing.tsx/
│   │   │   └── Landing.tsx
│   │   ├── ProjectView.tsx/
│   │   │   └── ProjectView.tsx
│   │   └── Settings.tsx/
│   │       └── Settings.tsx
│   ├── search/
│   │   └── search.ts/
│   │       └── search.ts
│   └── sync/
│       ├── snapshot.ts/
│       │   └── snapshot.ts
│       └── sync.ts/
│           └── sync.ts
├── test-debug.mjs/
│   └── test-debug.mjs
├── test-fresh.mjs/
│   └── test-fresh.mjs
├── test-migration.mjs/
│   └── test-migration.mjs
├── test-project.mjs/
│   └── test-project.mjs
├── tsconfig.app.json/
│   └── tsconfig.app.json
├── tsconfig.json/
│   └── tsconfig.json
├── tsconfig.node.json/
│   └── tsconfig.node.json
├── vercel.json/
│   └── vercel.json
└── vite.config.ts/
    └── vite.config.ts
```

---

## File Contents

## `.data/user_usr_35594624f02bfde0.json`

Sync data for user amanimosespeace@gmail.com (projects table snapshot).

```json
{
  "userId": "usr_35594624f02bfde0",
  "email": "amanimosespeace@gmail.com",
  "updatedAt": 1790718820661,
  "tables": {
    "projects": {
      "7a143ce6-12ee-4138-b01e-8a1c80c03962": {
        "id": "7a143ce6-12ee-4138-b01e-8a1c80c03962",
        "name": "juu",
        "description": "",
        "status": "active",
        "createdAt": 1790718536858,
        "updatedAt": 1790718536858,
        "syncStatus": "synced"
      }
    },
    "tasks": {},
    "resources": {},
    "milestones": {},
    "issues": {},
    "contacts": {},
    "reminders": {},
    "calendarEvents": {},
    "scheduleItems": {},
    "docEntries": {},
    "insights": {},
    "settings": {}
  },
  "deletions": {}
}
```

---

## `.data/user_usr_a744863d83aefc35.json`

Sync data for user testuser@example.com (projects table snapshot, newer).

```json
{
  "userId": "usr_a744863d83aefc35",
  "email": "testuser@example.com",
  "updatedAt": 1790718727292,
  "tables": {
    "projects": {
      "proj-1": {
        "id": "proj-1",
        "name": "Test Project Alpha",
        "status": "active",
        "updatedAt": 1727645000000,
        "syncStatus": "synced"
      }
    },
    "tasks": {},
    "resources": {},
    "milestones": {},
    "issues": {},
    "contacts": {},
    "reminders": {},
    "calendarEvents": {},
    "scheduleItems": {},
    "docEntries": {},
    "insights": {},
    "settings": {}
  },
  "deletions": {}
}
```

---

## `.data/user_usr_a8e6eb24a7e9e7b1.json`

Sync data for user testuser@example.com (projects table snapshot, older).

```json
{
  "userId": "usr_a8e6eb24a7e9e7b1",
  "email": "testuser@example.com",
  "updatedAt": 1790717983973,
  "tables": {
    "projects": {
      "proj-1": {
        "id": "proj-1",
        "name": "Test Project Alpha",
        "status": "active",
        "updatedAt": 1727645000000,
        "syncStatus": "synced"
      }
    },
    "tasks": {},
    "resources": {},
    "milestones": {},
    "issues": {},
    "contacts": {},
    "reminders": {},
    "calendarEvents": {},
    "scheduleItems": {},
    "docEntries": {},
    "insights": {},
    "settings": {}
  },
  "deletions": {}
}
```

---

## `.data/users.json`

User registry: per-user salt and password hash for local authentication.

```json
{
  "testuser@example.com": {
    "id": "usr_a744863d83aefc35",
    "email": "testuser@example.com",
    "salt": "873fedec96f298ad17fc1cbf2bc80ea4",
    "hash": "47fa9f2621a9c445664de8f5dc9174bdb881499b7d6d4422381717ffe4e433249a3250e43e01181b7e57e1ad0c1eb5555d7fc16688333cef48d35833dbc8dd3d",
    "createdAt": 1790717973842
  },
  "amanimosespeace@gmail.com": {
    "id": "usr_35594624f02bfde0",
    "email": "amanimosespeace@gmail.com",
    "salt": "7ceeadbfb24380b34ade81544e240dcd",
    "hash": "ce72da26d74256ce73abff69ef6c155f1f90356709f94c080f1d64dfefa2457505aaa85057b9b780b91570dba9c7dcbbfdfb44340abf7c2403d81c1ad21bf979",
    "createdAt": 1790718564174
  }
}
```

---

## `.dockerignore`

Docker build context exclusions for node_modules, git, and secrets.

```text
node_modules
dist
.git
.github
.env
.env.local
.env.development
.env.test
.DS_Store
*.log

```

---

## `.github/workflows/fly-deploy.yml`

GitHub Actions workflow for deploying to Fly.io on push to main/master.

```yaml
# See https://fly.io/docs/app-guides/continuous-deployment-with-github-actions/

name: Fly Deploy
on:
  push:
    branches:
      - main
      - master
jobs:
  deploy:
    name: Deploy app
    runs-on: ubuntu-latest
    concurrency: deploy-group    # optional: ensure only one action runs at a time
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}

```

---

## `.gitignore`

Git ignore rules for logs, dependencies, editor files, and environment files.

```text
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local
.env

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
.vercel
.env*

```

---

## `.oxlintrc.json`

Oxlint configuration with React and TypeScript plugin rules.

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

## `Dockerfile`

Multi-stage Dockerfile: builds the frontend bundle and Express server, runs on Node.js 22 in production.

```dockerfile
# Multi-stage Dockerfile for Fly.io deployment
FROM node:22-slim AS builder

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy application source code
COPY . .

# Build the frontend bundle and type check
RUN npm run build

# Production runtime stage
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy package descriptors and install production-only dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy server code and prebuilt static frontend
COPY server.ts ./
COPY --from=builder /app/dist ./dist

# Use unprivileged node user
USER node

EXPOSE 8080

CMD ["npx", "tsx", "server.ts"]
```

---

## `README.md`

Project documentation: architecture overview, features, quick start, deployment, and usage guide.

````markdown
# Panga - Local-First Project & Resource Planner

Personal, offline-first project and resource planner with Gemini AI integration and optional Google Drive synchronization.

## Architecture

- **Frontend**: React 19 SPA with Vite, TypeScript, and offline-first IndexedDB (Dexie)
- **Backend**: Express on Node.js 22 providing secure server-side Gemini AI processing (`/api/assistant/chat`) and health monitoring (`/health`)
- **Storage**: Local IndexedDB as primary source of truth; optional encrypted sync to Google Drive AppData folder
- **Hosting**: Configured for **Fly.io** using Docker and `fly.toml`; can also deploy as static site

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
4. Click **"Connect Google Drive"** — completes OAuth consent flow
5. Your local snapshot is uploaded to the private `appDataFolder`
6. Auto-sync runs every 30 seconds after changes

### Manual Backup/Restore

- **Download Backup (.json)**: Exports full local database to a versioned JSON file
- **Upload Snapshot (.json)**: Restores from a local backup file
- **Sync Now**: Forces immediate upload to Google Drive

### Sync Status Badge

The header shows your sync state:
- `📱 Offline Only` — No Google Drive connection
- `☁️ Google Drive` — Connected, auto-sync active
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

**Security**: Snapshots contain **only application state** — never credentials, API keys, or OAuth tokens.

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
````

---

## `api/assistant/chat.js`

Vercel serverless function: server-side Gemini AI chat proxy with optional web search.

```javascript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { contents, systemInstruction, enableSearch, clientApiKey } = req.body;
    const apiKey = process.env.GEMINI_API_KEY || clientApiKey;

    if (!apiKey) {
      return res.status(400).json({
        error: 'No Gemini API key found. Please configure your key in Settings or environment.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const tools: any[] = [];
    if (enableSearch) {
      tools.push({ googleSearch: {} });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        tools: tools.length > 0 ? tools : undefined,
      },
    });

    return res.status(200).json({
      text: response.text ?? '',
      functionCalls: response.functionCalls,
    });
  } catch (error: any) {
    console.error('Gemini API error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate AI response.',
    });
  }
}
```

---

## `api/backup/email.js`

Vercel serverless function: sends local-first snapshot backups via email (Resend, SendGrid, or Gmail SMTP).

```javascript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

// Email sending function - supports multiple providers
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  attachment: { filename: string; content: string }
): Promise<{ ok: boolean; error?: string }> {
  // Try Resend first (if RESEND_API_KEY is set)
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'Panga <onboarding@resend.dev>',
          to: [to],
          subject,
          html,
          attachments: [{
            filename: attachment.filename,
            content: Buffer.from(attachment.content).toString('base64'),
          }],
        }),
      });
      if (res.ok) return { ok: true };
      const err = await res.json();
      console.warn('Resend failed:', err);
    } catch (e) {
      console.warn('Resend error:', e);
    }
  }

  // Try SendGrid (if SENDGRID_API_KEY is set)
  if (process.env.SENDGRID_API_KEY) {
    try {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: to }],
            subject,
          }],
          from: { email: process.env.SENDGRID_FROM_EMAIL || 'noreply@panga.app' },
          content: [{ type: 'text/html', value: html }],
          attachments: [{
            content: Buffer.from(attachment.content).toString('base64'),
            filename: attachment.filename,
            type: 'application/json',
            disposition: 'attachment',
          }],
        }),
      });
      if (res.ok) return { ok: true };
      const err = await res.json();
      console.warn('SendGrid failed:', err);
    } catch (e) {
      console.warn('SendGrid error:', e);
    }
  }

  // Try Gmail SMTP via nodemailer (if GMAIL_USER and GMAIL_APP_PASSWORD are set)
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.default.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to,
        subject,
        html,
        attachments: [{
          filename: attachment.filename,
          content: attachment.content,
          contentType: 'application/json',
        }],
      });
      return { ok: true };
    } catch (e) {
      console.warn('Gmail SMTP error:', e);
    }
  }

  return { ok: false, error: 'No email provider configured. Set RESEND_API_KEY, SENDGRID_API_KEY, or GMAIL_USER+GMAIL_APP_PASSWORD.' };
}

// Generate the snapshot data (reuse logic from snapshot.ts)
async function generateSnapshot() {
  // This would normally come from IndexedDB, but on server we can't access it.
  // The client will send the snapshot data in the request body.
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, snapshot } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    if (!snapshot) {
      return res.status(400).json({ error: 'Snapshot data is required' });
    }

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `panga-backup-${timestamp}.json`;
    const jsonContent = JSON.stringify(snapshot, null, 2);

    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #1f2937; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">📦 Panga Backup</h1>
          </div>
          <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p>Your Panga data backup is attached as <strong>${filename}</strong>.</p>
            <p>Exported on: ${new Date().toLocaleString()}</p>
            <p style="color: #6b7280; font-size: 14px;">
              This file contains your projects, tasks, resources, notes, milestones, reminders, and settings.
              Import it in Panga Settings → <strong>Upload Snapshot</strong> to restore.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
            <p style="color: #9ca3af; font-size: 12px;">
              This is an automated message from Panga. If you didn't request this backup, you can safely ignore it.
            </p>
          </div>
        </body>
      </html>
    `;

    const result = await sendEmail(email, `Panga Backup - ${timestamp}`, html, {
      filename,
      content: jsonContent,
    });

    if (!result.ok) {
      return res.status(500).json({ error: result.error });
    }

    return res.status(200).json({ ok: true, message: `Backup sent to ${email}` });
  } catch (error: any) {
    console.error('Email backup error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to send backup email' });
  }
}
```

---

## `doc.md`

Implementation spec for the local-first refactor: phases, env config, and data model.

```markdown
You are an expert React developer. Your task is to refactor our application from a traditional server/PostgreSQL architecture to a Local-First architecture using IndexedDB, offline JSON state snapshot downloads/uploads, and automatic background sync via Google Drive (AppData folder).

Follow this implementation spec strictly:

---

### ENVIRONMENT & CREDENTIAL SPECIFICATION
The app relies on client-side Google API configuration stored in environment variables (e.g., `.env.local`):
- `VITE_GOOGLE_CLIENT_ID` (or `REACT_APP_GOOGLE_CLIENT_ID`): Registered in Google Cloud Console.
- `VITE_GOOGLE_API_KEY`: Configured with the Google Drive API enabled.

The exported user snapshot files must strictly contain application state and version metadata ONLY—never include app credentials, client IDs, or session tokens in user backup files.

---

### PHASE 1: Quick Upload Landing & Local-First Core

1. **Zero-Authentication Quick Upload:**
   - On initial app load (or when no local IndexedDB state exists), present a prominent "Quick Upload / Restore Snapshot" dropzone alongside the main workspace option.
   - Dropping or selecting a `.json` snapshot file must validate its schema, write it directly into IndexedDB, and hydrate the application state immediately without requiring Google sign-in or account setup.

2. **IndexedDB Core & Export Utilities:**
   - Configure IndexedDB (using Dexie.js or native IndexedDB wrapper) as the single primary source of truth for all runtime reads and writes.
   - Implement an "Export Backup" feature that packages the full local database state into a structured, downloadable JSON file with versioning metadata:
     `{ metadata: { version: "1.0", exportedAt: "ISO_DATE" }, data: { ... } }`

---

### PHASE 2: Google Drive AppData Sync & Settings Interface

1. **Settings Control Panel:**
   - Build a clear Settings interface featuring:
     - **Sync Status Badge:** Displays real-time status ("Offline Only", "Connected to Google Drive", "Syncing...", or "Last synced at [Timestamp]").
     - **Google Authentication:** "Connect Google Drive" button initiating Google Identity Services (GIS) OAuth flow using the `https://www.googleapis.com/auth/drive.appdata` scope.
     - **Manual Backup Actions:** Explicit "Download Backup (.json)" and "Upload Snapshot (.json)" file input controls.

2. **Automated Background Syncing:**
   - Implement debounced listeners on IndexedDB mutations that automatically upload the serialized snapshot (`app-state-snapshot.json`) to the user's hidden Google Drive `appDataFolder`.
   - Upon explicit Google sign-in on a new device, check `appDataFolder` for an existing snapshot and offer to restore it into IndexedDB.

---

### PHASE 3: Legacy Backend Removal (Execute ONLY after Phases 1 & 2 verification)

1. Remove all legacy PostgreSQL connection utilities, server ORM instances (e.g., Prisma, Drizzle), REST API fetch modules, and server-side authentication routing.
2. Update state management hooks and UI feedback components to reflect local storage and Google Drive sync status exclusively.
```

---

## `fly.toml`

Fly.io application configuration: app name, regions, HTTP service, health checks, and VM sizing.

```toml
# fly.toml app configuration file for Panga backend on Fly.io
#
# Reference: https://fly.io/docs/reference/configuration/

app = 'panga-app'
primary_region = 'iad'

[build]

[env]
  NODE_ENV = 'production'
  PORT = '8080'
  DATA_DIR = '/data'

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = 'stop'
  auto_start_machines = true
  min_machines_running = 0
  processes = ['app']

  [http_service.concurrency]
    type = 'requests'
    soft_limit = 200
    hard_limit = 250

  [[http_service.checks]]
    interval = '15s'
    timeout = '2s'
    grace_period = '5s'
    method = 'GET'
    path = '/health'

[mounts]
  source = 'panga_data'
  destination = '/data'

[[vm]]
  size = 'shared-cpu-1x'
  memory = '512mb'

```

---

## `index.html`

HTML entry point for the Vite/React SPA.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Panga - Project & Resource Planner</title>
    <meta name="description" content="Personal, offline-first project and resource planner." />
    <meta property="og:title" content="Panga - Project & Resource Planner" />
    <meta property="og:description" content="Personal, offline-first project and resource planner." />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>

```

---

## `metadata.json`

App metadata: name, description, permissions, and capabilities for the platform.

```json
{
  "name": "Panga",
  "description": "Personal, offline-first project and resource planner.",
  "permissions": [],
  "capabilities": [
    "MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API"
  ]
}

```

---

## `package-lock.json`

Node.js dependency lock file (npm).

```json
{
  "name": "panga-app",
  "version": "0.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "panga-app",
      "version": "0.0.0",
      "dependencies": {
        "@emailjs/browser": "^4.4.1",
        "@google/genai": "^2.24.0",
        "dexie": "^4.4.6",
        "express": "^5.2.1",
        "flexsearch": "^0.8.212",
        "nodemailer": "^6.9.15",
        "react": "^19.2.8",
        "react-dom": "^19.2.8",
        "react-router-dom": "^7.18.4",
        "tsx": "^4.23.15"
      },
      "devDependencies": {
        "@types/express": "^5.0.6",
        "@types/node": "^24.13.3",
        "@types/nodemailer": "^6.4.16",
        "@types/react": "^19.2.18",
        "@types/react-dom": "^19.2.7",
        "@vercel/node": "^5.1.0",
        "@vitejs/plugin-react": "^6.1.1",
        "fake-indexeddb": "^6.2.5",
        "oxlint": "^1.81.0",
        "playwright-core": "^1.63.0",
        "typescript": "~6.0.2",
        "vite": "^8.3.0",
        "vite-plugin-pwa": "^1.3.0"
      }
    },
    "node_modules/@apideck/better-ajv-errors": {
      "version": "0.3.7",
      "resolved": "https://registry.npmjs.org/@apideck/better-ajv-errors/-/better-ajv-errors-0.3.7.tgz",
      "integrity": "sha512-TajUJwGWbDwkCx/CZi7tRE8PVB7simCvKJfHUsSdvps+aTM/PDPP4gkLmKnc+x3CE//y9i/nj74GqdL/hwk7Iw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "jsonpointer": "^5.0.1",
        "leven": "^3.1.0"
      },
      "engines": {
        "node": ">=10"
      },
      "peerDependencies": {
        "ajv": ">=8"
      }
    },
    "node_modules/@babel/code-frame": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/code-frame/-/code-frame-7.29.7.tgz",
      "integrity": "sha512-Aup7aUOfpbAUg2ROOJN6Iw5f9DMBlzu0mIkm/malLQFN/YQgO48wCj0Kxa3sEHJvPVFg7siR+qRInwXd2qhQKw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-validator-identifier": "^7.29.7",
        "js-tokens": "^4.0.0",
        "picocolors": "^1.1.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/compat-data": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/compat-data/-/compat-data-7.29.7.tgz",
      "integrity": "sha512-locTkQyKvwIEgBzVrn8693ebc97F2U8ZHjbXwDXJ5Fn2TCpNwTlKcaKLkdHop5c/icOFE7qt7Q9JC5hnKNa6Gg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/core": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/core/-/core-7.29.7.tgz",
      "integrity": "sha512-RgHBCvtjbOK2gXSNBNIkNoEc9qoVEtau3hj8gEqKQuL3HZAibKarWFEI3Lfm6EYKkLalOh8eSrj9b+ch9H/VBA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.29.7",
        "@babel/generator": "^7.29.7",
        "@babel/helper-compilation-targets": "^7.29.7",
        "@babel/helper-module-transforms": "^7.29.7",
        "@babel/helpers": "^7.29.7",
        "@babel/parser": "^7.29.7",
        "@babel/template": "^7.29.7",
        "@babel/traverse": "^7.29.7",
        "@babel/types": "^7.29.7",
        "@jridgewell/remapping": "^2.3.5",
        "convert-source-map": "^2.0.0",
        "debug": "^4.1.0",
        "gensync": "^1.0.0-beta.2",
        "json5": "^2.2.3",
        "semver": "^6.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/babel"
      }
    },
    "node_modules/@babel/generator": {
      "version": "7.29.8",
      "resolved": "https://registry.npmjs.org/@babel/generator/-/generator-7.29.8.tgz",
      "integrity": "sha512-gZbepsdh3WDtgZKWL+vTPh71LSBrm/Y4/QDZBVCcYfmeTEEuoOYwlSy+G1StfJg+/Zy550u/3TATbm7qDbbMtg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/parser": "^7.29.8",
        "@babel/types": "^7.29.8",
        "@jridgewell/gen-mapping": "^0.3.12",
        "@jridgewell/trace-mapping": "^0.3.28",
        "jsesc": "^3.0.2"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-annotate-as-pure": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-annotate-as-pure/-/helper-annotate-as-pure-7.29.7.tgz",
      "integrity": "sha512-OoK6239jHPuSQOoS0kfTVKn0b/rVTk0seKq4Gd2UMLtmOVLjDC0ki3e+c90Trqv2gMfvJFqkiljrr568+qddiw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/types": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-compilation-targets": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-compilation-targets/-/helper-compilation-targets-7.29.7.tgz",
      "integrity": "sha512-wem6WaBj4NaVYVdNhLPPVacES6ZJ+KBBfSkTMD3YZxbP3rm3Di85tJU5ljaUNhaOynt+Aj0xruhYuzQBt8n71g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/compat-data": "^7.29.7",
        "@babel/helper-validator-option": "^7.29.7",
        "browserslist": "^4.24.0",
        "lru-cache": "^5.1.1",
        "semver": "^6.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-create-class-features-plugin": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-create-class-features-plugin/-/helper-create-class-features-plugin-7.29.7.tgz",
      "integrity": "sha512-IY3ZD9Tmooqr3TUhc3DUWxiuo8xx1DWLhd5M7hQ+ZWJamqM2BbalrBJb2MisSLoYorOj75U03qULCxQTY9r3hg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-annotate-as-pure": "^7.29.7",
        "@babel/helper-member-expression-to-functions": "^7.29.7",
        "@babel/helper-optimise-call-expression": "^7.29.7",
        "@babel/helper-replace-supers": "^7.29.7",
        "@babel/helper-skip-transparent-expression-wrappers": "^7.29.7",
        "@babel/traverse": "^7.29.7",
        "semver": "^6.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0"
      }
    },
    "node_modules/@babel/helper-create-regexp-features-plugin": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-create-regexp-features-plugin/-/helper-create-regexp-features-plugin-7.29.7.tgz",
      "integrity": "sha512-907Uymvqgg1dwUA+7IGwFAOSYzQOuzPXKNJ1yxzwPffzkYFg2q2eHi1fIOs6sXkG9NbIUMunnUlkYsfRFNvomg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-annotate-as-pure": "^7.29.7",
        "regexpu-core": "^6.3.1",
        "semver": "^6.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0"
      }
    },
    "node_modules/@babel/helper-define-polyfill-provider": {
      "version": "0.6.8",
      "resolved": "https://registry.npmjs.org/@babel/helper-define-polyfill-provider/-/helper-define-polyfill-provider-0.6.8.tgz",
      "integrity": "sha512-47UwBLPpQi1NoWzLuHNjRoHlYXMwIJoBf7MFou6viC/sIHWYygpvr0B6IAyh5sBdA2nr2LPIRww8lfaUVQINBA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-compilation-targets": "^7.28.6",
        "@babel/helper-plugin-utils": "^7.28.6",
        "debug": "^4.4.3",
        "lodash.debounce": "^4.0.8",
        "resolve": "^1.22.11"
      },
      "peerDependencies": {
        "@babel/core": "^7.4.0 || ^8.0.0-0 <8.0.0"
      }
    },
    "node_modules/@babel/helper-globals": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-globals/-/helper-globals-7.29.7.tgz",
      "integrity": "sha512-3nQVUAtvkKH9zahfWgw96Jc/uFOmjACE1kQz82E2lqWmHBgjzbNlsC22nuQTfahmWeQtTq5nQ/4Nnd2A1wj4zA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-member-expression-to-functions": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-member-expression-to-functions/-/helper-member-expression-to-functions-7.29.7.tgz",
      "integrity": "sha512-j+7JYmk1JYDtACIGj0QJqqWZjoUpMoEikQGADMaHgCMCSDqd2+P32rfcibUNrGOMWrlzK1WJBdxrB3JJQZwWtg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/traverse": "^7.29.7",
        "@babel/types": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-module-imports": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-module-imports/-/helper-module-imports-7.29.7.tgz",
      "integrity": "sha512-ejHwrQQYcm9xnTivShn2IDOlIzInN34AXskvq9QicvCtEzq1Vzclu/tKF8Jq1Cg8JG2GL6/EmjgsCT7lXepE3g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/traverse": "^7.29.7",
        "@babel/types": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-module-transforms": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-module-transforms/-/helper-module-transforms-7.29.7.tgz",
      "integrity": "sha512-UPUVSyXbOh627KiCIGQSgwWzGeBKLkaJ9PJEdrngIwMSzxLR4jS4+f1f1jb7VzBbg8nFLaYotvVPFCTqdrmTAg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-module-imports": "^7.29.7",
        "@babel/helper-validator-identifier": "^7.29.7",
        "@babel/traverse": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0"
      }
    },
    "node_modules/@babel/helper-optimise-call-expression": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-optimise-call-expression/-/helper-optimise-call-expression-7.29.7.tgz",
      "integrity": "sha512-+kmGVjcT9RGYzoDwdwEqEvGgKe3BYq+O1iGzjFubaNgZHwYHP6lsF2Yghf4kEuv9BV7tYDZ913aBW9am6YKong==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/types": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-plugin-utils": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-plugin-utils/-/helper-plugin-utils-7.29.7.tgz",
      "integrity": "sha512-G7sHYigPY17oO5SYWnfD/0MTBwVR781S/JI643e/JhUYgVgWE/61SoW3NH9KWUKyKq5LVh3npif99Wkt6j86Jw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-remap-async-to-generator": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-remap-async-to-generator/-/helper-remap-async-to-generator-7.29.7.tgz",
      "integrity": "sha512-16AMiW26DbXWBbr3B8wNozKM0ydMLB892vaOaJW/fPJdnT8vJk5sdkQcU/isqUxyCE0cEoa8wZOcbgDuC4b6Og==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-annotate-as-pure": "^7.29.7",
        "@babel/helper-wrap-function": "^7.29.7",
        "@babel/traverse": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0"
      }
    },
    "node_modules/@babel/helper-replace-supers": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-replace-supers/-/helper-replace-supers-7.29.7.tgz",
      "integrity": "sha512-atfGXWSeCiF4DnKZIfmJfQRkSw9b9gNNXR1kqKjbhG4pGYCOnkp8OcTB8E3NXjBu8NpheSnOeNKz8KT7UNFTmQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-member-expression-to-functions": "^7.29.7",
        "@babel/helper-optimise-call-expression": "^7.29.7",
        "@babel/traverse": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0"
      }
    },
    "node_modules/@babel/helper-skip-transparent-expression-wrappers": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-skip-transparent-expression-wrappers/-/helper-skip-transparent-expression-wrappers-7.29.7.tgz",
      "integrity": "sha512-brcMGQaVzIeUb+6/bs1Av0f8YuNNjKY2JyvfRCsFuFsdKccEQ5Ges2y74D74NZ1Rz8lKJ9ksJkfqwQFJ/iNEyQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/traverse": "^7.29.7",
        "@babel/types": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-string-parser": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-string-parser/-/helper-string-parser-7.29.7.tgz",
      "integrity": "sha512-Pb5ijPrZ89GDH8223L4UP8i6QApWxs04RbPQJTeWDV0/keR2E36MeKnyr6LYmUUvqRRI+Iv87SuF1W6ErINzYw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-validator-identifier": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-validator-identifier/-/helper-validator-identifier-7.29.7.tgz",
      "integrity": "sha512-qehxGkRj55h/ff8EMaJ+cYhyaKlHIxqYDn682wQD7RNp9UujOQsHog2uS0r2vzr4pW+sXf90NeeayjcNaX3fFg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-validator-option": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-validator-option/-/helper-validator-option-7.29.7.tgz",
      "integrity": "sha512-N9ZErrD+yW5geCDtBqnOoxmR8+tNKiGuxKlDpuJxfsqpa2dFcexaziGAE/qoHLiDDreVNMupxGmSoNlyvsA3gw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-wrap-function": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-wrap-function/-/helper-wrap-function-7.29.7.tgz",
      "integrity": "sha512-iES0Skag9ERIF68aXadpO6dbXa03mNWK3sEqJaMnLNs/eC3l0lkImdfoy6Y09/SfkpawdAB4RjQ7PVA7TcVGdw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/template": "^7.29.7",
        "@babel/traverse": "^7.29.7",
        "@babel/types": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helpers": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helpers/-/helpers-7.29.7.tgz",
      "integrity": "sha512-1k2lAGRMfHTcwuNYcCNUmaUffmQv8KWMfh2iJUUeRlwlwH4FdNG7mfPI10NPfLHJFThE4Tyr4mv7kTNZOiPuBg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/template": "^7.29.7",
        "@babel/types": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/parser": {
      "version": "7.29.9",
      "resolved": "https://registry.npmjs.org/@babel/parser/-/parser-7.29.9.tgz",
      "integrity": "sha512-CjXrNHTnvqBVqHgdBysY3vk2T8tpJHb5/RMeHJBTyVa9xgugCB0CJTx/3oO8RV2QRQP391RWpB7D6hLjm8V9uA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/types": "^7.29.8"
      },
      "bin": {
        "parser": "bin/babel-parser.js"
      },
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@babel/plugin-bugfix-firefox-class-in-computed-class-key": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-bugfix-firefox-class-in-computed-class-key/-/plugin-bugfix-firefox-class-in-computed-class-key-7.29.7.tgz",
      "integrity": "sha512-j8SrR0zLZrRsC09DlszEx8FpMiwukKffYXMK0d5LmOglO7vGG6sz/BR/20yHqWH+Lnn31JTt2PE3hIWNgM2J6w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7",
        "@babel/traverse": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0"
      }
    },
    "node_modules/@babel/plugin-bugfix-safari-class-field-initializer-scope": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-bugfix-safari-class-field-initializer-scope/-/plugin-bugfix-safari-class-field-initializer-scope-7.29.7.tgz",
      "integrity": "sha512-r8j8escF+U2FUHo0KOhPUdMzUO+jp9fInva6+ACVAF3Y97Ev+5iNZwiqTghmzNeWwDkOPlYuTcfb1vDaoZKmAQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0"
      }
    },
    "node_modules/@babel/plugin-bugfix-safari-id-destructuring-collision-in-function-expression": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-bugfix-safari-id-destructuring-collision-in-function-expression/-/plugin-bugfix-safari-id-destructuring-collision-in-function-expression-7.29.7.tgz",
      "integrity": "sha512-GE1TFSiuFeGsCxmYXZl8HwoPrVlwe4rHPFE8weieGKZqnDORK+Ar3vgWMgW+AOxQ6/2TgLSKx9p6W7O4rC6qgQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0"
      }
    },
    "node_modules/@babel/plugin-bugfix-safari-rest-destructuring-rhs-array": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-bugfix-safari-rest-destructuring-rhs-array/-/plugin-bugfix-safari-rest-destructuring-rhs-array-7.29.7.tgz",
      "integrity": "sha512-oBNVCvnO5tND+xSopWvV8WNGfpTfgP4Zr/YXXSj8zfmcPktp5Ku/aZlsIowgSD4fjmgHn6sGmB9APVsU5zOdhA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7",
        "@babel/helper-skip-transparent-expression-wrappers": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0"
      }
    },
    "node_modules/@babel/plugin-bugfix-v8-spread-parameters-in-optional-chaining": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-bugfix-v8-spread-parameters-in-optional-chaining/-/plugin-bugfix-v8-spread-parameters-in-optional-chaining-7.29.7.tgz",
      "integrity": "sha512-QQt9qKHZ2sg/kivaLr7lnQr8HVrQDdBNSfCsTjiDxRuX/K5ORyKq+Bu8Xr0cDE3Dfkv0cw28Ve0EKyKMvulkOw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7",
        "@babel/helper-skip-transparent-expression-wrappers": "^7.29.7",
        "@babel/plugin-transform-optional-chaining": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.13.0"
      }
    },
    "node_modules/@babel/plugin-bugfix-v8-static-class-fields-redefine-readonly": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-bugfix-v8-static-class-fields-redefine-readonly/-/plugin-bugfix-v8-static-class-fields-redefine-readonly-7.29.7.tgz",
      "integrity": "sha512-pn6QacGLgvCcwc+syUhKE/qSjV2D1IHDB84RNxWYSt1mW3K/SCtjinZ2p0cETJxAWBjPy3K/1lHwG5BjjPxNlw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7",
        "@babel/traverse": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0"
      }
    },
    "node_modules/@babel/plugin-proposal-private-property-in-object": {
      "version": "7.21.0-placeholder-for-preset-env.2",
      "resolved": "https://registry.npmjs.org/@babel/plugin-proposal-private-property-in-object/-/plugin-proposal-private-property-in-object-7.21.0-placeholder-for-preset-env.2.tgz",
      "integrity": "sha512-SOSkfJDddaM7mak6cPEpswyTRnuRltl429hMraQEglW+OkovnCzsiszTmsrlY//qLFjCpQDFRvjdm2wA5pPm9w==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-import-assertions": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-import-assertions/-/plugin-syntax-import-assertions-7.29.7.tgz",
      "integrity": "sha512-/An1OCBN93thpBAGyfsK2pcf0jvju1SAtKkL2Ny++B5Sy6sqgzXDQH1cZxWbF96Wuk+bn41MDA9bLd4VVAw6rw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-import-attributes": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-import-attributes/-/plugin-syntax-import-attributes-7.29.7.tgz",
      "integrity": "sha512-zGYcYfq/WmZ4V+kBIXQon9dSSc8ircGZqw9ZaNhhGj9nZkeBu1jHLBDQqYYi5WA9uawvA2sIMbry2nCFhf5Djg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-syntax-unicode-sets-regex": {
      "version": "7.18.6",
      "resolved": "https://registry.npmjs.org/@babel/plugin-syntax-unicode-sets-regex/-/plugin-syntax-unicode-sets-regex-7.18.6.tgz",
      "integrity": "sha512-727YkEAPwSIQTv5im8QHz3upqp92JTWhidIC81Tdx4VJYIte/VndKf1qKrfnnhPLiPghStWfvC/iFaMCQu7Nqg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-create-regexp-features-plugin": "^7.18.6",
        "@babel/helper-plugin-utils": "^7.18.6"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0"
      }
    },
    "node_modules/@babel/plugin-transform-arrow-functions": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-arrow-functions/-/plugin-transform-arrow-functions-7.29.7.tgz",
      "integrity": "sha512-N7zArUXWzAMzm+/N0uPBeVB3Fam5lMxtUwMmDK5f/IBBS7a7p1qeUoxd/6CckXoxUdgsntq1Dh8xNW06maZbDQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-async-generator-functions": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-async-generator-functions/-/plugin-transform-async-generator-functions-7.29.7.tgz",
      "integrity": "sha512-d98gXZkgswvkyohMBABkhm3GeXhYj8psWfwQ2C7gtfrKGTykQa/iOIi+JJhwMjPlZ6Vm2XN+DCf3Es1EoG4ZLA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7",
        "@babel/helper-remap-async-to-generator": "^7.29.7",
        "@babel/traverse": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-async-to-generator": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-async-to-generator/-/plugin-transform-async-to-generator-7.29.7.tgz",
      "integrity": "sha512-pcUb2SS+RMo9TWVBwKGI5ShtoG7R+zBsFmCKDa6fe8c+hPr3XJlZgoE5j6i8W7gDjhyvy+85vmYexanvXh3d1w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-module-imports": "^7.29.7",
        "@babel/helper-plugin-utils": "^7.29.7",
        "@babel/helper-remap-async-to-generator": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-block-scoped-functions": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-block-scoped-functions/-/plugin-transform-block-scoped-functions-7.29.7.tgz",
      "integrity": "sha512-cUSmjh72N+rN4PrkFlN1dJwNCwjVp5d38/CQrEsFggkD10UiFlBFgdH3tv5dNsLuHY+3S8db2xCHjhZcv5WgvA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-block-scoping": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-block-scoping/-/plugin-transform-block-scoping-7.29.7.tgz",
      "integrity": "sha512-ONyr4+AZhKh8yKWInVxU9AXA9EbsyeLcL6V0dJy6M2/62vuvpGm29zzuymbTpdc451GEpDIdAyPLP3r+P61yKQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-class-properties": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-class-properties/-/plugin-transform-class-properties-7.29.7.tgz",
      "integrity": "sha512-GtcpjFvanPfzNQi3eTitsCqtRRmmqzpy/A+yhTR1HaZo1Ly3EA8ZXxlPyHdR8/IuRMYc3E4wdGBewB2QKQjAaA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-create-class-features-plugin": "^7.29.7",
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-class-static-block": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-class-static-block/-/plugin-transform-class-static-block-7.29.7.tgz",
      "integrity": "sha512-kibJgmEdX2iMwsHY2tSZNDgj8PwIlCQz7FK9KuGKO8zsuoUwSEhoNnNVp/emKWrbY4HeO6kkXfdMqRKKKXBm2A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-create-class-features-plugin": "^7.29.7",
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.12.0"
      }
    },
    "node_modules/@babel/plugin-transform-classes": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-classes/-/plugin-transform-classes-7.29.7.tgz",
      "integrity": "sha512-qV0OGGBVacduzQHE649JyCneOFI/maT+YKsO+K4Yi3xv2wTPNjM/W2o2gdzMwEAZz7fXNTHAe0NcSg30bIN69g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-annotate-as-pure": "^7.29.7",
        "@babel/helper-compilation-targets": "^7.29.7",
        "@babel/helper-globals": "^7.29.7",
        "@babel/helper-plugin-utils": "^7.29.7",
        "@babel/helper-replace-supers": "^7.29.7",
        "@babel/traverse": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-computed-properties": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-computed-properties/-/plugin-transform-computed-properties-7.29.7.tgz",
      "integrity": "sha512-RK7/IyU5phpuCdBAuig5VkzG/EnbDaui5SQGdU9BFrHdV+mV4cUjLMQ9lJDjLNtWHsqtiefpGZUXQP2BiTYMsA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7",
        "@babel/template": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-destructuring": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-destructuring/-/plugin-transform-destructuring-7.29.7.tgz",
      "integrity": "sha512-iPX8aD6H9zV5s7ZsqTdNocPN/MGQ5sSMnElKrktxjJRMnB2jN/1p2+R7GkfD6CAYoVFqy5A4XnSIUeGgJzIWpg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7",
        "@babel/traverse": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-dotall-regex": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-dotall-regex/-/plugin-transform-dotall-regex-7.29.7.tgz",
      "integrity": "sha512-3qc18hsD2RdZiyJNDNc7HQpv6xbncwh8FYtxNFFzclSyh/trPD9KkVR9BDECUjDLvb7yJVF15GfYUuC+LMkkiQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-create-regexp-features-plugin": "^7.29.7",
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-duplicate-keys": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-duplicate-keys/-/plugin-transform-duplicate-keys-7.29.7.tgz",
      "integrity": "sha512-6IvRRriEMqnBwD6chtxdLpMYCHWEzN+oL5cyQtjykya19UgzbmKhxmhZgKC/LHxS2nYr9Q/qYPZ5Lr6jOL9+yQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-duplicate-named-capturing-groups-regex": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-duplicate-named-capturing-groups-regex/-/plugin-transform-duplicate-named-capturing-groups-regex-7.29.7.tgz",
      "integrity": "sha512-2wiIyo2BjtgU7HufSeDnL9L2O7zr8jmhFKuSr65VpRkUiRKRNpb0mdlk56+XPPKoIrfHqzbMuglDvZun0RISsA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-create-regexp-features-plugin": "^7.29.7",
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0"
      }
    },
    "node_modules/@babel/plugin-transform-dynamic-import": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-dynamic-import/-/plugin-transform-dynamic-import-7.29.7.tgz",
      "integrity": "sha512-giOlEm/EFjfjr+te9NsdjkUo2v4f8rS/SXPumRVHAtbNcyNlvtREkU1dZzaIDclNpnaVhlCqRdFKhJBjBikzLg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-explicit-resource-management": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-explicit-resource-management/-/plugin-transform-explicit-resource-management-7.29.7.tgz",
      "integrity": "sha512-Rstj7coNz8sE+7Ju7ihpHLI564lsK5pUpNNlvptCIC/16E/S5hbl6n3kESPKdNRmqEWlpn5xpS5Q2dvXBsySLw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7",
        "@babel/plugin-transform-destructuring": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-exponentiation-operator": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-exponentiation-operator/-/plugin-transform-exponentiation-operator-7.29.7.tgz",
      "integrity": "sha512-zFpMOTLZBdW5LfObqcSbL6kefg4R4eLdmvS0wbN9M6D5Mym/sKm9toOoWyVOa+xDjvCnuWcHls2YonXwHvH3CQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-export-namespace-from": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-export-namespace-from/-/plugin-transform-export-namespace-from-7.29.7.tgz",
      "integrity": "sha512-24B2nOy2TeJSMheqwPD4DDQOV/elLSIlKxjZt4i05H5AgdPdWR3n18HnNrcJ+j76WJd9gbwb9jPjNYUy6RautA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-for-of": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-for-of/-/plugin-transform-for-of-7.29.7.tgz",
      "integrity": "sha512-zeSIHh0+E1Um1WJRXCFlHQYu2ieJNdivLLjlBEp+dIBu3S51n+SZZmIXjxnItw6pz56Cn+KvK68BIBVsxq2JiQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7",
        "@babel/helper-skip-transparent-expression-wrappers": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-function-name": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-function-name/-/plugin-transform-function-name-7.29.7.tgz",
      "integrity": "sha512-otRWaHXE6fbAGkePvaj/kvs3HsqXfPhlnzwSOlnFgbqCPMd975dW+4wZ00WFBt+/YlBGcJwNrARQTOJOb4ZrIg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-compilation-targets": "^7.29.7",
        "@babel/helper-plugin-utils": "^7.29.7",
        "@babel/traverse": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-json-strings": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-json-strings/-/plugin-transform-json-strings-7.29.7.tgz",
      "integrity": "sha512-RRnE2+eon1rJAq8MnoF1b5kTpY1vU88twHcvcKMrsqP/jxIRqDVs9iJB5fqPuqyeFAW0wJo4MlUIPpQCq/aRsg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-literals": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-literals/-/plugin-transform-literals-7.29.7.tgz",
      "integrity": "sha512-DZ/oLP21ZuWx1vKqnoNv6/tvEK48AQOBRai40CX9dTjGluvT/YZCyY3rryDtyUqCEoyNroy5KKPwX2iQCiRvyw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-logical-assignment-operators": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-logical-assignment-operators/-/plugin-transform-logical-assignment-operators-7.29.7.tgz",
      "integrity": "sha512-A0H91hh6W8MFRkp5TqJmMr39jzGD1A1E1Ysiv2O06Sfbhkapm+XyIzxWCEh5kqwOZ1/8QZ0dY3SeQ7XBqfJd5Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-member-expression-literals": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-member-expression-literals/-/plugin-transform-member-expression-literals-7.29.7.tgz",
      "integrity": "sha512-hl1kwFZCCiDyfH25Xmco9jTrkPgnS9pmOzSG7W5I4SaGbLeqKv417hcU2RKmaxoPEgsoJh7ZPOrnPGq99bHoUg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-modules-amd": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-modules-amd/-/plugin-transform-modules-amd-7.29.7.tgz",
      "integrity": "sha512-fxtQoH3m5ywUSIfaH0FGCzWu4McsYon5bD3K4XnskC7f+OyQMj7rsOMi4NvvmJ83WwBAg4UCe+ov4VZlqEvyew==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-module-transforms": "^7.29.7",
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-modules-commonjs": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-modules-commonjs/-/plugin-transform-modules-commonjs-7.29.7.tgz",
      "integrity": "sha512-j0vCldybPC5b5dwCQOJ21uKtHzt7hxLygJTg9eF1ScfaikEDNfzn94XoW5Fi+seBR0nCyL23xaBFFkq7dTM8XQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-module-transforms": "^7.29.7",
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-modules-systemjs": {
      "version": "7.29.8",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-modules-systemjs/-/plugin-transform-modules-systemjs-7.29.8.tgz",
      "integrity": "sha512-6iSnEK0zlkLKU4heofK/AdmRD4e2SHVpJMtrwnTCzhnaM98ria4rTrOXBBi45BTTYnJtO8txnPsX4fChYXkmeA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-module-transforms": "^7.29.7",
        "@babel/helper-plugin-utils": "^7.29.7",
        "@babel/helper-validator-identifier": "^7.29.7",
        "@babel/traverse": "^7.29.8"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-modules-umd": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-modules-umd/-/plugin-transform-modules-umd-7.29.7.tgz",
      "integrity": "sha512-B4UkaTK3QpgCwJnrxKfMPKdo92CN7OKXAlpAAnM3UPu0Q0lCCk57ylA9AJbRy2v8dDKOPAAWcoR6CMyeoHwRCA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-module-transforms": "^7.29.7",
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-named-capturing-groups-regex": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-named-capturing-groups-regex/-/plugin-transform-named-capturing-groups-regex-7.29.7.tgz",
      "integrity": "sha512-vuFoLwr4qnv2xbZ16SQd6uPcH5FNrLHhk/Jzo++0XJFcaDsr4gjJVg6j398oMHiC+83k/GiBzviwF5KBJkPUtQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-create-regexp-features-plugin": "^7.29.7",
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0"
      }
    },
    "node_modules/@babel/plugin-transform-new-target": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-new-target/-/plugin-transform-new-target-7.29.7.tgz",
      "integrity": "sha512-fEo41GmsOUhOBlw8ioo6zvjX5Xc2Lqkzlyfqbpsk3eB6TReV18uhxZ0esfEokVbY2+PVJAQHNKxER6lGrzNd3A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-nullish-coalescing-operator": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-nullish-coalescing-operator/-/plugin-transform-nullish-coalescing-operator-7.29.7.tgz",
      "integrity": "sha512-idmp1dFaekP9GbcMvG24Kvw2BfhFZjHnNJCkV4WuIY4PskJzwI3f1N5OdgYke38T7rftO6ERulFRn2cFeZwRkg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-numeric-separator": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-numeric-separator/-/plugin-transform-numeric-separator-7.29.7.tgz",
      "integrity": "sha512-zR7fv/z14OjgHl4AgRtkDBvBMhIzCxqV/qN/2BCRC7LjFwvuzjYe7gDWxC4Wl/SNsLM6SE1IWvRPYMgSJaUvNw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-object-rest-spread": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-object-rest-spread/-/plugin-transform-object-rest-spread-7.29.7.tgz",
      "integrity": "sha512-Ld98jn4c0smUywL57m7SgsHq3OpThOa6LqZJif3G6jYOovPleoFhVrBJ1WegRApSFB2wu4+RelAj9AC9G08Z4A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-compilation-targets": "^7.29.7",
        "@babel/helper-plugin-utils": "^7.29.7",
        "@babel/plugin-transform-destructuring": "^7.29.7",
        "@babel/plugin-transform-parameters": "^7.29.7",
        "@babel/traverse": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-object-super": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-object-super/-/plugin-transform-object-super-7.29.7.tgz",
      "integrity": "sha512-Ea/diGcw0twB5IlZPO5sgET6fJsLJqPABqTuFWIR+iMPGPZJkATEIWx0wa+aEQ5UY1CBQyP/gkAiLEqn1vBiQA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7",
        "@babel/helper-replace-supers": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-optional-catch-binding": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-optional-catch-binding/-/plugin-transform-optional-catch-binding-7.29.7.tgz",
      "integrity": "sha512-sLsyndxK2VwX6yNUOakMb7Sh553ZTe/vVM1XJ+9Z5aW1ytsc8xOIwmyk05NNjN60vkc5/KqoTH6hB4V41LJhng==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-optional-chaining": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-optional-chaining/-/plugin-transform-optional-chaining-7.29.7.tgz",
      "integrity": "sha512-6GM1dhvK3gNODkXcEcMCOLEDCLSoZ/sBbro2Ax8HURyasQ4NshagQixkRFdh5niI6E4gmA/jYI/4aT7rRos3ZQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7",
        "@babel/helper-skip-transparent-expression-wrappers": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-parameters": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-parameters/-/plugin-transform-parameters-7.29.7.tgz",
      "integrity": "sha512-ZDOBqV/qLYJI0YElr8DcENEyARsFQeESqWXH6gZlghYXuPPjvweuDhP4VyEi4BlUBlLRFZVjxoZDMjxhLW766g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-private-methods": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-private-methods/-/plugin-transform-private-methods-7.29.7.tgz",
      "integrity": "sha512-/6Rz4DK1ETDEM/bWHsPHcaEe7ZaT1EqSXjtSP/L0DijOYuaUhiRiOKcwpZ8P7zR4xXEHc2ITdiCgBm9Tpyv9ug==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-create-class-features-plugin": "^7.29.7",
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-private-property-in-object": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-private-property-in-object/-/plugin-transform-private-property-in-object-7.29.7.tgz",
      "integrity": "sha512-+BNo06dnrzdNNqCm1X6YUaVv0DKk8Q+JYcoZfOkLhYWNCXzlwTSRq8zGWayT1csjcpNXV9CQTBRRbmTLZac5cA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-annotate-as-pure": "^7.29.7",
        "@babel/helper-create-class-features-plugin": "^7.29.7",
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-property-literals": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-property-literals/-/plugin-transform-property-literals-7.29.7.tgz",
      "integrity": "sha512-bOMRLQuI0A5ZqHq3OWJ89/rXpJ/NJrbVhXiP4zwPGMs6kpcVsuTUNjwoE30K0Qm3mf48a/TnRYYD6vPNqcg6jA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-regenerator": {
      "version": "7.29.8",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-regenerator/-/plugin-transform-regenerator-7.29.8.tgz",
      "integrity": "sha512-0UpIXPtdDtMXfnV2OJAVMLpj3H/92vmkA6lpSRakmycJvj3VUy6Xs1dM8tXRugupykr5WB+LpiVl0J8LMVg2mg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-regexp-modifiers": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-regexp-modifiers/-/plugin-transform-regexp-modifiers-7.29.7.tgz",
      "integrity": "sha512-mB5Fs0VWrJ42ZCmc8114v60qetdaUVNkj9PmSZRmanCZM3S9hm0CFRLjRmYIsuXav14l2jvZ+4T8iiCGnhj3nQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-create-regexp-features-plugin": "^7.29.7",
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0"
      }
    },
    "node_modules/@babel/plugin-transform-reserved-words": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-reserved-words/-/plugin-transform-reserved-words-7.29.7.tgz",
      "integrity": "sha512-5+YhdpVgmfSmwZyLMftfaiffLRMHjzIRHFHHLdibcSyJm2pasMrKHrO3Ptrt2DRshjvpgjEJJ1zVW14WPq/6QA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-shorthand-properties": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-shorthand-properties/-/plugin-transform-shorthand-properties-7.29.7.tgz",
      "integrity": "sha512-I+WYbGBAiCn7nA6xBrlgPH+MB7HWb4u8pv5S0Pv7OtwNvIFvCCb24YlttKEeUFVurfBCEaOTnuhlqsb7f0Z5Dg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-spread": {
      "version": "7.29.8",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-spread/-/plugin-transform-spread-7.29.8.tgz",
      "integrity": "sha512-4S9ksMGVWUshvgK0mKfvZky7leuG5/uoFVwMpAomJ8bMoDJiNHRVmc1EglwW/CmGVSqqWpEbXm9FmbRit22qoA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7",
        "@babel/helper-skip-transparent-expression-wrappers": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-sticky-regex": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-sticky-regex/-/plugin-transform-sticky-regex-7.29.7.tgz",
      "integrity": "sha512-BCHzNYJGe9l7EpwwDBN/ztlL2NYFFq8hp9ddjtUEM9f2O7S7kKV/lL6Fwo7IF7NSkYhPK2vO+86nIGltA90MsA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-template-literals": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-template-literals/-/plugin-transform-template-literals-7.29.7.tgz",
      "integrity": "sha512-NCSEJ4sLFU2gqAub45HYh4fus2yQ36rr6ei6vpU7NdoJqCpxvEG8E6eJpscGyXP3VHD2Ny+fSXr04k1hoUrFqA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-typeof-symbol": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-typeof-symbol/-/plugin-transform-typeof-symbol-7.29.7.tgz",
      "integrity": "sha512-223mNGoTkBiTEWFoK+Q6Go3tueMRclO8vxxxxquNCYuNI4jWOofFKJRRDu6SDrB8Sgo1UEGW9T4GAQ8ZyRso1A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-unicode-escapes": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-unicode-escapes/-/plugin-transform-unicode-escapes-7.29.7.tgz",
      "integrity": "sha512-jCfXxSjf94lf4E0hKE0AByxF6F3/pVFqRdUUNkDJhsY0m1ZKjnN6ZYyMeHNpzflxb/0q5b7t3p+BE+SLF1WOtA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-unicode-property-regex": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-unicode-property-regex/-/plugin-transform-unicode-property-regex-7.29.7.tgz",
      "integrity": "sha512-OgZ+zoAJgZLUCunsTRQ5LAjOywDv5zzZ2/hQ5aMw1pGXyY2rtE8/chXYUmu3AlVHKpm10KEdG9aMwbI/K76ZGw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-create-regexp-features-plugin": "^7.29.7",
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-unicode-regex": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-unicode-regex/-/plugin-transform-unicode-regex-7.29.7.tgz",
      "integrity": "sha512-7D/x/23/d/3VqZ0QA+LGbZMlGwZjztBygSWWWsfTPoQ1oQ6Q1P6Mr3d0kk42XabyUVw+fha3LqdRsFqeKqvCyA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-create-regexp-features-plugin": "^7.29.7",
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-unicode-sets-regex": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-unicode-sets-regex/-/plugin-transform-unicode-sets-regex-7.29.7.tgz",
      "integrity": "sha512-BLOhLht9DOJwIxlmp91wHvkXv1lguuHS3/FwUO8HL1H0u8s4hR1gASVFyilu9iGtcTRYqjTZmlsFFeQletntEg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-create-regexp-features-plugin": "^7.29.7",
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0"
      }
    },
    "node_modules/@babel/preset-env": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/preset-env/-/preset-env-7.29.7.tgz",
      "integrity": "sha512-GYzX36n1nsciIb0uyH0GHwxwtNwPQIcpxSeiVLDtG/B7jB5xXgchnmL1f/jCX5o+pwnaDBtO60ONSJhEBJfxYA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/compat-data": "^7.29.7",
        "@babel/helper-compilation-targets": "^7.29.7",
        "@babel/helper-plugin-utils": "^7.29.7",
        "@babel/helper-validator-option": "^7.29.7",
        "@babel/plugin-bugfix-firefox-class-in-computed-class-key": "^7.29.7",
        "@babel/plugin-bugfix-safari-class-field-initializer-scope": "^7.29.7",
        "@babel/plugin-bugfix-safari-id-destructuring-collision-in-function-expression": "^7.29.7",
        "@babel/plugin-bugfix-safari-rest-destructuring-rhs-array": "^7.29.7",
        "@babel/plugin-bugfix-v8-spread-parameters-in-optional-chaining": "^7.29.7",
        "@babel/plugin-bugfix-v8-static-class-fields-redefine-readonly": "^7.29.7",
        "@babel/plugin-proposal-private-property-in-object": "7.21.0-placeholder-for-preset-env.2",
        "@babel/plugin-syntax-import-assertions": "^7.29.7",
        "@babel/plugin-syntax-import-attributes": "^7.29.7",
        "@babel/plugin-syntax-unicode-sets-regex": "^7.18.6",
        "@babel/plugin-transform-arrow-functions": "^7.29.7",
        "@babel/plugin-transform-async-generator-functions": "^7.29.7",
        "@babel/plugin-transform-async-to-generator": "^7.29.7",
        "@babel/plugin-transform-block-scoped-functions": "^7.29.7",
        "@babel/plugin-transform-block-scoping": "^7.29.7",
        "@babel/plugin-transform-class-properties": "^7.29.7",
        "@babel/plugin-transform-class-static-block": "^7.29.7",
        "@babel/plugin-transform-classes": "^7.29.7",
        "@babel/plugin-transform-computed-properties": "^7.29.7",
        "@babel/plugin-transform-destructuring": "^7.29.7",
        "@babel/plugin-transform-dotall-regex": "^7.29.7",
        "@babel/plugin-transform-duplicate-keys": "^7.29.7",
        "@babel/plugin-transform-duplicate-named-capturing-groups-regex": "^7.29.7",
        "@babel/plugin-transform-dynamic-import": "^7.29.7",
        "@babel/plugin-transform-explicit-resource-management": "^7.29.7",
        "@babel/plugin-transform-exponentiation-operator": "^7.29.7",
        "@babel/plugin-transform-export-namespace-from": "^7.29.7",
        "@babel/plugin-transform-for-of": "^7.29.7",
        "@babel/plugin-transform-function-name": "^7.29.7",
        "@babel/plugin-transform-json-strings": "^7.29.7",
        "@babel/plugin-transform-literals": "^7.29.7",
        "@babel/plugin-transform-logical-assignment-operators": "^7.29.7",
        "@babel/plugin-transform-member-expression-literals": "^7.29.7",
        "@babel/plugin-transform-modules-amd": "^7.29.7",
        "@babel/plugin-transform-modules-commonjs": "^7.29.7",
        "@babel/plugin-transform-modules-systemjs": "^7.29.7",
        "@babel/plugin-transform-modules-umd": "^7.29.7",
        "@babel/plugin-transform-named-capturing-groups-regex": "^7.29.7",
        "@babel/plugin-transform-new-target": "^7.29.7",
        "@babel/plugin-transform-nullish-coalescing-operator": "^7.29.7",
        "@babel/plugin-transform-numeric-separator": "^7.29.7",
        "@babel/plugin-transform-object-rest-spread": "^7.29.7",
        "@babel/plugin-transform-object-super": "^7.29.7",
        "@babel/plugin-transform-optional-catch-binding": "^7.29.7",
        "@babel/plugin-transform-optional-chaining": "^7.29.7",
        "@babel/plugin-transform-parameters": "^7.29.7",
        "@babel/plugin-transform-private-methods": "^7.29.7",
        "@babel/plugin-transform-private-property-in-object": "^7.29.7",
        "@babel/plugin-transform-property-literals": "^7.29.7",
        "@babel/plugin-transform-regenerator": "^7.29.7",
        "@babel/plugin-transform-regexp-modifiers": "^7.29.7",
        "@babel/plugin-transform-reserved-words": "^7.29.7",
        "@babel/plugin-transform-shorthand-properties": "^7.29.7",
        "@babel/plugin-transform-spread": "^7.29.7",
        "@babel/plugin-transform-sticky-regex": "^7.29.7",
        "@babel/plugin-transform-template-literals": "^7.29.7",
        "@babel/plugin-transform-typeof-symbol": "^7.29.7",
        "@babel/plugin-transform-unicode-escapes": "^7.29.7",
        "@babel/plugin-transform-unicode-property-regex": "^7.29.7",
        "@babel/plugin-transform-unicode-regex": "^7.29.7",
        "@babel/plugin-transform-unicode-sets-regex": "^7.29.7",
        "@babel/preset-modules": "0.1.6-no-external-plugins",
        "babel-plugin-polyfill-corejs2": "^0.4.15",
        "babel-plugin-polyfill-corejs3": "^0.14.0",
        "babel-plugin-polyfill-regenerator": "^0.6.6",
        "core-js-compat": "^3.48.0",
        "semver": "^6.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/preset-modules": {
      "version": "0.1.6-no-external-plugins",
      "resolved": "https://registry.npmjs.org/@babel/preset-modules/-/preset-modules-0.1.6-no-external-plugins.tgz",
      "integrity": "sha512-HrcgcIESLm9aIR842yhJ5RWan/gebQUJ6E/E5+rf0y9o6oj7w0Br+sWuL6kEQ/o/AdfvR1Je9jG18/gnpwjEyA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.0.0",
        "@babel/types": "^7.4.4",
        "esutils": "^2.0.2"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0 || ^8.0.0-0 <8.0.0"
      }
    },
    "node_modules/@babel/runtime": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/runtime/-/runtime-7.29.7.tgz",
      "integrity": "sha512-Nq8OhGWiZIZGV6hLHoyAKLLcJihP/xFeBMGJoUrxTX2psI8dCifzLhZISFb+VWS3wFMRDmCGw5R+dOySCqPLhw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/template": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/template/-/template-7.29.7.tgz",
      "integrity": "sha512-puq+Gf35oI24FeN11LkoUQFqv9uwNeWpxXZi/Ji3rRIoKAzKnxRaZ+Gkj0vKS9ZCiTESfng1N9LyOyXvo+m+Gg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.29.7",
        "@babel/parser": "^7.29.7",
        "@babel/types": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/traverse": {
      "version": "7.29.8",
      "resolved": "https://registry.npmjs.org/@babel/traverse/-/traverse-7.29.8.tgz",
      "integrity": "sha512-I5z7H3bf/41ktsNVLtpN0wAa336HkqIHQ5BuPLEhTkt1jVSyZpeNKIzTgEWmlxjdg81R0IgUCcaE+Ok3NvrfZg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.29.7",
        "@babel/generator": "^7.29.8",
        "@babel/helper-globals": "^7.29.7",
        "@babel/parser": "^7.29.8",
        "@babel/template": "^7.29.7",
        "@babel/types": "^7.29.8",
        "debug": "^4.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/types": {
      "version": "7.29.8",
      "resolved": "https://registry.npmjs.org/@babel/types/-/types-7.29.8.tgz",
      "integrity": "sha512-Vj1jF3cPfxg7OAfoI7QnVKLoILlm2JF9pnVHrX8qx7AHMiYWT+NDAA7jChlNgRS4WTLc/fD1lXLmPixluj+3Gg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-string-parser": "^7.29.7",
        "@babel/helper-validator-identifier": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@edge-runtime/format": {
      "version": "2.2.1",
      "resolved": "https://registry.npmjs.org/@edge-runtime/format/-/format-2.2.1.tgz",
      "integrity": "sha512-JQTRVuiusQLNNLe2W9tnzBlV/GvSVcozLl4XZHk5swnRZ/v6jp8TqR8P7sqmJsQqblDZ3EztcWmLDbhRje/+8g==",
      "dev": true,
      "license": "MPL-2.0",
      "engines": {
        "node": ">=16"
      }
    },
    "node_modules/@edge-runtime/node-utils": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/@edge-runtime/node-utils/-/node-utils-2.3.0.tgz",
      "integrity": "sha512-uUtx8BFoO1hNxtHjp3eqVPC/mWImGb2exOfGjMLUoipuWgjej+f4o/VP4bUI8U40gu7Teogd5VTeZUkGvJSPOQ==",
      "dev": true,
      "license": "MPL-2.0",
      "engines": {
        "node": ">=16"
      }
    },
    "node_modules/@edge-runtime/ponyfill": {
      "version": "2.4.2",
      "resolved": "https://registry.npmjs.org/@edge-runtime/ponyfill/-/ponyfill-2.4.2.tgz",
      "integrity": "sha512-oN17GjFr69chu6sDLvXxdhg0Qe8EZviGSuqzR9qOiKh4MhFYGdBBcqRNzdmYeAdeRzOW2mM9yil4RftUQ7sUOA==",
      "dev": true,
      "license": "MPL-2.0",
      "engines": {
        "node": ">=16"
      }
    },
    "node_modules/@edge-runtime/primitives": {
      "version": "4.1.0",
      "resolved": "https://registry.npmjs.org/@edge-runtime/primitives/-/primitives-4.1.0.tgz",
      "integrity": "sha512-Vw0lbJ2lvRUqc7/soqygUX216Xb8T3WBZ987oywz6aJqRxcwSVWwr9e+Nqo2m9bxobA9mdbWNNoRY6S9eko1EQ==",
      "dev": true,
      "license": "MPL-2.0",
      "engines": {
        "node": ">=16"
      }
    },
    "node_modules/@edge-runtime/vm": {
      "version": "3.2.0",
      "resolved": "https://registry.npmjs.org/@edge-runtime/vm/-/vm-3.2.0.tgz",
      "integrity": "sha512-0dEVyRLM/lG4gp1R/Ik5bfPl/1wX00xFwd5KcNH602tzBa09oF7pbTKETEhR1GjZ75K6OJnYFu8II2dyMhONMw==",
      "dev": true,
      "license": "MPL-2.0",
      "dependencies": {
        "@edge-runtime/primitives": "4.1.0"
      },
      "engines": {
        "node": ">=16"
      }
    },
    "node_modules/@emailjs/browser": {
      "version": "4.4.1",
      "resolved": "https://registry.npmjs.org/@emailjs/browser/-/browser-4.4.1.tgz",
      "integrity": "sha512-DGSlP9sPvyFba3to2A50kDtZ+pXVp/0rhmqs2LmbMS3I5J8FSOgLwzY2Xb4qfKlOVHh29EAutLYwe5yuEZmEFg==",
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/@esbuild/aix-ppc64": {
      "version": "0.27.0",
      "resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.27.0.tgz",
      "integrity": "sha512-KuZrd2hRjz01y5JK9mEBSD3Vj3mbCvemhT466rSuJYeE/hjuBrHfjjcjMdTm/sz7au+++sdbJZJmuBwQLuw68A==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "aix"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/android-arm": {
      "version": "0.27.0",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.27.0.tgz",
      "integrity": "sha512-j67aezrPNYWJEOHUNLPj9maeJte7uSMM6gMoxfPC9hOg8N02JuQi/T7ewumf4tNvJadFkvLZMlAq73b9uwdMyQ==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/android-arm64": {
      "version": "0.27.0",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.27.0.tgz",
      "integrity": "sha512-CC3vt4+1xZrs97/PKDkl0yN7w8edvU2vZvAFGD16n9F0Cvniy5qvzRXjfO1l94efczkkQE6g1x0i73Qf5uthOQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/android-x64": {
      "version": "0.27.0",
      "resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.27.0.tgz",
      "integrity": "sha512-wurMkF1nmQajBO1+0CJmcN17U4BP6GqNSROP8t0X/Jiw2ltYGLHpEksp9MpoBqkrFR3kv2/te6Sha26k3+yZ9Q==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/darwin-arm64": {
      "version": "0.27.0",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.27.0.tgz",
      "integrity": "sha512-uJOQKYCcHhg07DL7i8MzjvS2LaP7W7Pn/7uA0B5S1EnqAirJtbyw4yC5jQ5qcFjHK9l6o/MX9QisBg12kNkdHg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/darwin-x64": {
      "version": "0.27.0",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.27.0.tgz",
      "integrity": "sha512-8mG6arH3yB/4ZXiEnXof5MK72dE6zM9cDvUcPtxhUZsDjESl9JipZYW60C3JGreKCEP+p8P/72r69m4AZGJd5g==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/freebsd-arm64": {
      "version": "0.27.0",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.27.0.tgz",
      "integrity": "sha512-9FHtyO988CwNMMOE3YIeci+UV+x5Zy8fI2qHNpsEtSF83YPBmE8UWmfYAQg6Ux7Gsmd4FejZqnEUZCMGaNQHQw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/freebsd-x64": {
      "version": "0.27.0",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.27.0.tgz",
      "integrity": "sha512-zCMeMXI4HS/tXvJz8vWGexpZj2YVtRAihHLk1imZj4efx1BQzN76YFeKqlDr3bUWI26wHwLWPd3rwh6pe4EV7g==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-arm": {
      "version": "0.27.0",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.27.0.tgz",
      "integrity": "sha512-t76XLQDpxgmq2cNXKTVEB7O7YMb42atj2Re2Haf45HkaUpjM2J0UuJZDuaGbPbamzZ7bawyGFUkodL+zcE+jvQ==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-arm64": {
      "version": "0.27.0",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.27.0.tgz",
      "integrity": "sha512-AS18v0V+vZiLJyi/4LphvBE+OIX682Pu7ZYNsdUHyUKSoRwdnOsMf6FDekwoAFKej14WAkOef3zAORJgAtXnlQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-ia32": {
      "version": "0.27.0",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.27.0.tgz",
      "integrity": "sha512-Mz1jxqm/kfgKkc/KLHC5qIujMvnnarD9ra1cEcrs7qshTUSksPihGrWHVG5+osAIQ68577Zpww7SGapmzSt4Nw==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-loong64": {
      "version": "0.27.0",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.27.0.tgz",
      "integrity": "sha512-QbEREjdJeIreIAbdG2hLU1yXm1uu+LTdzoq1KCo4G4pFOLlvIspBm36QrQOar9LFduavoWX2msNFAAAY9j4BDg==",
      "cpu": [
        "loong64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-mips64el": {
      "version": "0.27.0",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.27.0.tgz",
      "integrity": "sha512-sJz3zRNe4tO2wxvDpH/HYJilb6+2YJxo/ZNbVdtFiKDufzWq4JmKAiHy9iGoLjAV7r/W32VgaHGkk35cUXlNOg==",
      "cpu": [
        "mips64el"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-ppc64": {
      "version": "0.27.0",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.27.0.tgz",
      "integrity": "sha512-z9N10FBD0DCS2dmSABDBb5TLAyF1/ydVb+N4pi88T45efQ/w4ohr/F/QYCkxDPnkhkp6AIpIcQKQ8F0ANoA2JA==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-riscv64": {
      "version": "0.27.0",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.27.0.tgz",
      "integrity": "sha512-pQdyAIZ0BWIC5GyvVFn5awDiO14TkT/19FTmFcPdDec94KJ1uZcmFs21Fo8auMXzD4Tt+diXu1LW1gHus9fhFQ==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-s390x": {
      "version": "0.27.0",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.27.0.tgz",
      "integrity": "sha512-hPlRWR4eIDDEci953RI1BLZitgi5uqcsjKMxwYfmi4LcwyWo2IcRP+lThVnKjNtk90pLS8nKdroXYOqW+QQH+w==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.28.2.tgz",
      "integrity": "sha512-4xTZr1FUmSoQW4XIWmit3tzQrUTZM+N3P0XV8xROKYF50XfI7xeO90+1bZvNwxIufQ9hDQVRJH5YhgPVF8A/HQ==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/netbsd-arm64": {
      "version": "0.27.0",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-arm64/-/netbsd-arm64-0.27.0.tgz",
      "integrity": "sha512-6m0sfQfxfQfy1qRuecMkJlf1cIzTOgyaeXaiVaaki8/v+WB+U4hc6ik15ZW6TAllRlg/WuQXxWj1jx6C+dfy3w==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/netbsd-x64": {
      "version": "0.27.0",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.27.0.tgz",
      "integrity": "sha512-xbbOdfn06FtcJ9d0ShxxvSn2iUsGd/lgPIO2V3VZIPDbEaIj1/3nBBe1AwuEZKXVXkMmpr6LUAgMkLD/4D2PPA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/openbsd-arm64": {
      "version": "0.27.0",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-arm64/-/openbsd-arm64-0.27.0.tgz",
      "integrity": "sha512-fWgqR8uNbCQ/GGv0yhzttj6sU/9Z5/Sv/VGU3F5OuXK6J6SlriONKrQ7tNlwBrJZXRYk5jUhuWvF7GYzGguBZQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/openbsd-x64": {
      "version": "0.27.0",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.27.0.tgz",
      "integrity": "sha512-aCwlRdSNMNxkGGqQajMUza6uXzR/U0dIl1QmLjPtRbLOx3Gy3otfFu/VjATy4yQzo9yFDGTxYDo1FfAD9oRD2A==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/openharmony-arm64": {
      "version": "0.27.0",
      "resolved": "https://registry.npmjs.org/@esbuild/openharmony-arm64/-/openharmony-arm64-0.27.0.tgz",
      "integrity": "sha512-nyvsBccxNAsNYz2jVFYwEGuRRomqZ149A39SHWk4hV0jWxKM0hjBPm3AmdxcbHiFLbBSwG6SbpIcUbXjgyECfA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/sunos-x64": {
      "version": "0.27.0",
      "resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.27.0.tgz",
      "integrity": "sha512-Q1KY1iJafM+UX6CFEL+F4HRTgygmEW568YMqDA5UV97AuZSm21b7SXIrRJDwXWPzr8MGr75fUZPV67FdtMHlHA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "sunos"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/win32-arm64": {
      "version": "0.27.0",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.27.0.tgz",
      "integrity": "sha512-W1eyGNi6d+8kOmZIwi/EDjrL9nxQIQ0MiGqe/AWc6+IaHloxHSGoeRgDRKHFISThLmsewZ5nHFvGFWdBYlgKPg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/win32-ia32": {
      "version": "0.27.0",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.27.0.tgz",
      "integrity": "sha512-30z1aKL9h22kQhilnYkORFYt+3wp7yZsHWus+wSKAJR8JtdfI76LJ4SBdMsCopTR3z/ORqVu5L1vtnHZWVj4cQ==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/win32-x64": {
      "version": "0.27.0",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.27.0.tgz",
      "integrity": "sha512-aIitBcjQeyOhMTImhLZmtxfdOcuNRpwlPNmlFKPcHQYPhEssw75Cl1TSXJXpMkzaua9FUetx/4OQKq7eJul5Cg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@fastify/busboy": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/@fastify/busboy/-/busboy-2.1.1.tgz",
      "integrity": "sha512-vBZP4NlzfOlerQTnba4aqZoMhE/a9HY7HRqoOPaETQcSQuWEIyZMHGfVu6w9wGtGK5fED5qRs2DteVCjOH60sA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@google/genai": {
      "version": "2.24.0",
      "resolved": "https://registry.npmjs.org/@google/genai/-/genai-2.24.0.tgz",
      "integrity": "sha512-bIu5eoxF1AaPWs9ivmUJGp1RpDHyapoODvWvnkzRDx2CTIW6UJXFhDdjj0BlRve3ZHMMuEkQBVrA/ALqpW4apA==",
      "hasInstallScript": true,
      "license": "Apache-2.0",
      "dependencies": {
        "google-auth-library": "^10.3.0",
        "p-retry": "^4.6.2",
        "protobufjs": "^7.5.4",
        "ws": "^8.18.0"
      },
      "engines": {
        "node": ">=20.0.0"
      },
      "peerDependencies": {
        "@modelcontextprotocol/sdk": "^1.25.2"
      },
      "peerDependenciesMeta": {
        "@modelcontextprotocol/sdk": {
          "optional": true
        }
      }
    },
    "node_modules/@isaacs/cliui": {
      "version": "9.0.0",
      "resolved": "https://registry.npmjs.org/@isaacs/cliui/-/cliui-9.0.0.tgz",
      "integrity": "sha512-AokJm4tuBHillT+FpMtxQ60n8ObyXBatq7jD2/JA9dxbDDokKQm8KMht5ibGzLVU9IJDIKK4TPKgMHEYMn3lMg==",
      "dev": true,
      "license": "BlueOak-1.0.0",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@isaacs/fs-minipass": {
      "version": "4.0.1",
      "resolved": "https://registry.npmjs.org/@isaacs/fs-minipass/-/fs-minipass-4.0.1.tgz",
      "integrity": "sha512-wgm9Ehl2jpeqP3zw/7mo3kRHFp5MEDhqAdwy1fTGkHAwnkGOVsgpvQhL8B5n1qlb01jV3n/bI0ZfZp5lWA1k4w==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "minipass": "^7.0.4"
      },
      "engines": {
        "node": ">=18.0.0"
      }
    },
    "node_modules/@jridgewell/gen-mapping": {
      "version": "0.3.13",
      "resolved": "https://registry.npmjs.org/@jridgewell/gen-mapping/-/gen-mapping-0.3.13.tgz",
      "integrity": "sha512-2kkt/7niJ6MgEPxF0bYdQ6etZaA+fQvDcLKckhy1yIQOzaoKjBBjSj63/aLVjYE3qhRt5dvM+uUyfCg6UKCBbA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.5.0",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/remapping": {
      "version": "2.3.5",
      "resolved": "https://registry.npmjs.org/@jridgewell/remapping/-/remapping-2.3.5.tgz",
      "integrity": "sha512-LI9u/+laYG4Ds1TDKSJW2YPrIlcVYOwi2fUC6xB43lueCjgxV4lffOCZCtYFiH6TNOX+tQKXx97T4IKHbhyHEQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/gen-mapping": "^0.3.5",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/resolve-uri": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/@jridgewell/resolve-uri/-/resolve-uri-3.1.2.tgz",
      "integrity": "sha512-bRISgCIjP20/tbWSPWMEi54QVPRZExkuD9lJL+UIxUKtwVJA8wW1Trb1jMs1RFXo1CBTNZ/5hpC9QvmKWdopKw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@jridgewell/source-map": {
      "version": "0.3.11",
      "resolved": "https://registry.npmjs.org/@jridgewell/source-map/-/source-map-0.3.11.tgz",
      "integrity": "sha512-ZMp1V8ZFcPG5dIWnQLr3NSI1MiCU7UETdS/A0G8V/XWHvJv3ZsFqutJn1Y5RPmAPX6F3BiE397OqveU/9NCuIA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/gen-mapping": "^0.3.5",
        "@jridgewell/trace-mapping": "^0.3.25"
      }
    },
    "node_modules/@jridgewell/sourcemap-codec": {
      "version": "1.6.0",
      "resolved": "https://registry.npmjs.org/@jridgewell/sourcemap-codec/-/sourcemap-codec-1.6.0.tgz",
      "integrity": "sha512-T7jf+5zgsZHwNJ4lvQ7/aezbyk0nNX+zJVWpmHA7VYsEx7a7qr5Rg5IbtJFqkgze5Y2sruq1RUY8Q837Od7iFw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@jridgewell/trace-mapping": {
      "version": "0.3.31",
      "resolved": "https://registry.npmjs.org/@jridgewell/trace-mapping/-/trace-mapping-0.3.31.tgz",
      "integrity": "sha512-zzNR+SdQSDJzc8joaeP8QQoCQr8NuYx2dIIytl1QeBEZHJ9uW6hebsrYgbz8hJwUQao3TWCMtmfV8Nu1twOLAw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/resolve-uri": "^3.1.0",
        "@jridgewell/sourcemap-codec": "^1.4.14"
      }
    },
    "node_modules/@mapbox/node-pre-gyp": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/@mapbox/node-pre-gyp/-/node-pre-gyp-2.0.3.tgz",
      "integrity": "sha512-uwPAhccfFJlsfCxMYTwOdVfOz3xqyj8xYL3zJj8f0pb30tLohnnFPhLuqp4/qoEz8sNxe4SESZedcBojRefIzg==",
      "dev": true,
      "license": "BSD-3-Clause",
      "dependencies": {
        "consola": "^3.2.3",
        "detect-libc": "^2.0.0",
        "https-proxy-agent": "^7.0.5",
        "node-fetch": "^2.6.7",
        "nopt": "^8.0.0",
        "semver": "^7.5.3",
        "tar": "^7.4.0"
      },
      "bin": {
        "node-pre-gyp": "bin/node-pre-gyp"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@mapbox/node-pre-gyp/node_modules/node-fetch": {
      "version": "2.7.0",
      "resolved": "https://registry.npmjs.org/node-fetch/-/node-fetch-2.7.0.tgz",
      "integrity": "sha512-c4FRfUm/dbcWZ7U+1Wq0AwCyFL+3nt2bEw05wfxSz+DWpWsitgmSgYmy2dQdWyKC1694ELPqMs/YzUSNozLt8A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "whatwg-url": "^5.0.0"
      },
      "engines": {
        "node": "4.x || >=6.0.0"
      },
      "peerDependencies": {
        "encoding": "^0.1.0"
      },
      "peerDependenciesMeta": {
        "encoding": {
          "optional": true
        }
      }
    },
    "node_modules/@mapbox/node-pre-gyp/node_modules/semver": {
      "version": "7.8.5",
      "resolved": "https://registry.npmjs.org/semver/-/semver-7.8.5.tgz",
      "integrity": "sha512-Y7/KDsb8LjooZpwaqGyulO6DQlksgCncchHGk+sZIY4SBvUocMBEFH5Ur1fI4dV+Jvl0w6cjvucaIi40puRioA==",
      "dev": true,
      "license": "ISC",
      "bin": {
        "semver": "bin/semver.js"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/@nodelib/fs.scandir": {
      "version": "2.1.5",
      "resolved": "https://registry.npmjs.org/@nodelib/fs.scandir/-/fs.scandir-2.1.5.tgz",
      "integrity": "sha512-vq24Bq3ym5HEQm2NKCr3yXDwjc7vTsEThRDnkp2DK9p1uqLR+DHurm/NOTo0KG7HYHU7eppKZj3MyqYuMBf62g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@nodelib/fs.stat": "2.0.5",
        "run-parallel": "^1.1.9"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/@nodelib/fs.stat": {
      "version": "2.0.5",
      "resolved": "https://registry.npmjs.org/@nodelib/fs.stat/-/fs.stat-2.0.5.tgz",
      "integrity": "sha512-RkhPPp2zrqDAQA/2jNhnztcPAlv64XdhIp7a7454A5ovI7Bukxgt7MX7udwAu3zg1DcpPU0rz3VV1SeaqvY4+A==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/@nodelib/fs.walk": {
      "version": "1.2.8",
      "resolved": "https://registry.npmjs.org/@nodelib/fs.walk/-/fs.walk-1.2.8.tgz",
      "integrity": "sha512-oGB+UxlgWcgQkgwo8GcEGwemoTFt3FIO9ababBmaGwXIoBKZ+GTy0pP185beGg7Llih/NSHSV2XAs1lnznocSg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@nodelib/fs.scandir": "2.1.5",
        "fastq": "^1.6.0"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/@oxc-project/types": {
      "version": "0.150.0",
      "resolved": "https://registry.npmjs.org/@oxc-project/types/-/types-0.150.0.tgz",
      "integrity": "sha512-rDS5/31E9HfPl/CIzGrn0DOlvBbXFseQ5URJ9sYMfstbKLD/c6Gm9vmRzRGDdAXyOIL4zmO37lc9RIwYqVruZw==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/oxc-project"
      }
    },
    "node_modules/@oxlint/binding-linux-x64-gnu": {
      "version": "1.83.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-linux-x64-gnu/-/binding-linux-x64-gnu-1.83.0.tgz",
      "integrity": "sha512-rS5gM0NgD7ngmuJmbIehsidtrOwKkLFwCQbKEeb9KuyQrrWNq5Zkn0uV6AYdXOMJ0grrWEiLwBuvMxt8w5vsNw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@oxlint/binding-linux-x64-musl": {
      "version": "1.83.0",
      "resolved": "https://registry.npmjs.org/@oxlint/binding-linux-x64-musl/-/binding-linux-x64-musl-1.83.0.tgz",
      "integrity": "sha512-W2IH4EtpcPaWcvNGCA95YoDg4vxqE/ZiPCi3arrxEEpsK7+JQN9WYwrlYFx9pcdP6KPXqRqkv3zdQPHcx7b6YQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@protobufjs/aspromise": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/@protobufjs/aspromise/-/aspromise-1.1.2.tgz",
      "integrity": "sha512-j+gKExEuLmKwvz3OgROXtrJ2UG2x8Ch2YZUxahh+s1F2HZ+wAceUNLkvy6zKCPVRkU++ZWQrdxsUeQXmcg4uoQ==",
      "license": "BSD-3-Clause"
    },
    "node_modules/@protobufjs/base64": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/@protobufjs/base64/-/base64-1.1.2.tgz",
      "integrity": "sha512-AZkcAA5vnN/v4PDqKyMR5lx7hZttPDgClv83E//FMNhR2TMcLUhfRUBHCmSl0oi9zMgDDqRUJkSxO3wm85+XLg==",
      "license": "BSD-3-Clause"
    },
    "node_modules/@protobufjs/codegen": {
      "version": "2.0.5",
      "resolved": "https://registry.npmjs.org/@protobufjs/codegen/-/codegen-2.0.5.tgz",
      "integrity": "sha512-zgXFLzW3Ap33e6d0Wlj4MGIm6Ce8O89n/apUaGNB/jx+hw+ruWEp7EwGUshdLKVRCxZW12fp9r40E1mQrf/34g==",
      "license": "BSD-3-Clause"
    },
    "node_modules/@protobufjs/eventemitter": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/@protobufjs/eventemitter/-/eventemitter-1.1.1.tgz",
      "integrity": "sha512-vW1GmwMZNnL+gMRaovlh9yZX74kc+TTU3FObkkurpMaRtBfLP3ldjS9KQWlwZgraRE0+dheEEoAxdzcJQ8eXZg==",
      "license": "BSD-3-Clause"
    },
    "node_modules/@protobufjs/fetch": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/@protobufjs/fetch/-/fetch-1.1.1.tgz",
      "integrity": "sha512-GpptLrs57adMSuHi3VNj0mAF8dwh36LMaYF6XyJ6JMWlVsc+t42tm1HSEDmOs3A8fC9yyeisgLhsTVQokOZ0zw==",
      "license": "BSD-3-Clause",
      "dependencies": {
        "@protobufjs/aspromise": "^1.1.1"
      }
    },
    "node_modules/@protobufjs/float": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/@protobufjs/float/-/float-1.0.2.tgz",
      "integrity": "sha512-Ddb+kVXlXst9d+R9PfTIxh1EdNkgoRe5tOX6t01f1lYWOvJnSPDBlG241QLzcyPdoNTsblLUdujGSE4RzrTZGQ==",
      "license": "BSD-3-Clause"
    },
    "node_modules/@protobufjs/path": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/@protobufjs/path/-/path-1.1.2.tgz",
      "integrity": "sha512-6JOcJ5Tm08dOHAbdR3GrvP+yUUfkjG5ePsHYczMFLq3ZmMkAD98cDgcT2iA1lJ9NVwFd4tH/iSSoe44YWkltEA==",
      "license": "BSD-3-Clause"
    },
    "node_modules/@protobufjs/pool": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/@protobufjs/pool/-/pool-1.1.0.tgz",
      "integrity": "sha512-0kELaGSIDBKvcgS4zkjz1PeddatrjYcmMWOlAuAPwAeccUrPHdUqo/J6LiymHHEiJT5NrF1UVwxY14f+fy4WQw==",
      "license": "BSD-3-Clause"
    },
    "node_modules/@protobufjs/utf8": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/@protobufjs/utf8/-/utf8-1.1.2.tgz",
      "integrity": "sha512-b1UQwcEZ4yCnMCD8DAL1VlbvBJE9/IX4FTIp7BG1xYpf29SLazLSrqUkj4w7Y5y7cCVP6E5tcqqcI0xemPkHug==",
      "license": "BSD-3-Clause"
    },
    "node_modules/@rolldown/binding-linux-x64-gnu": {
      "version": "1.2.9",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-x64-gnu/-/binding-linux-x64-gnu-1.2.9.tgz",
      "integrity": "sha512-9s0AZ8BFK5/n7B/TBoa2yJE3gI3KURrbXcPBlsAsvjU4VeJKgE90y1YtNxyEUIcHPQkg6/yfF3qihUrcM/Kf0Q==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-x64-musl": {
      "version": "1.2.9",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-x64-musl/-/binding-linux-x64-musl-1.2.9.tgz",
      "integrity": "sha512-P7VWAmV+WdJluH7ovnRGoiv2i8To7GAZ+kGzfGup635cyL7SyYl3lSUaA3Gp5THf0n/Co5EyEqb2zbqq+nMOHQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/pluginutils": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/@rolldown/pluginutils/-/pluginutils-1.0.1.tgz",
      "integrity": "sha512-2j9bGt5Jh8hj+vPtgzPtl72j0yRxHAyumoo6TNfAjsLB04UtpSvPbPcDcBMxz7n+9CYB0c1GxQFxYRg2jimqGw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@rollup/plugin-babel": {
      "version": "6.1.0",
      "resolved": "https://registry.npmjs.org/@rollup/plugin-babel/-/plugin-babel-6.1.0.tgz",
      "integrity": "sha512-dFZNuFD2YRcoomP4oYf+DvQNSUA9ih+A3vUqopQx5EdtPGo3WBnQcI/S8pwpz91UsGfL0HsMSOlaMld8HrbubA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-module-imports": "^7.18.6",
        "@rollup/pluginutils": "^5.0.1"
      },
      "engines": {
        "node": ">=14.0.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0",
        "@types/babel__core": "^7.1.9",
        "rollup": "^1.20.0||^2.0.0||^3.0.0||^4.0.0"
      },
      "peerDependenciesMeta": {
        "@types/babel__core": {
          "optional": true
        },
        "rollup": {
          "optional": true
        }
      }
    },
    "node_modules/@rollup/plugin-node-resolve": {
      "version": "16.0.3",
      "resolved": "https://registry.npmjs.org/@rollup/plugin-node-resolve/-/plugin-node-resolve-16.0.3.tgz",
      "integrity": "sha512-lUYM3UBGuM93CnMPG1YocWu7X802BrNF3jW2zny5gQyLQgRFJhV1Sq0Zi74+dh/6NBx1DxFC4b4GXg9wUCG5Qg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@rollup/pluginutils": "^5.0.1",
        "@types/resolve": "1.20.2",
        "deepmerge": "^4.2.2",
        "is-module": "^1.0.0",
        "resolve": "^1.22.1"
      },
      "engines": {
        "node": ">=14.0.0"
      },
      "peerDependencies": {
        "rollup": "^2.78.0||^3.0.0||^4.0.0"
      },
      "peerDependenciesMeta": {
        "rollup": {
          "optional": true
        }
      }
    },
    "node_modules/@rollup/plugin-replace": {
      "version": "6.0.3",
      "resolved": "https://registry.npmjs.org/@rollup/plugin-replace/-/plugin-replace-6.0.3.tgz",
      "integrity": "sha512-J4RZarRvQAm5IF0/LwUUg+obsm+xZhYnbMXmXROyoSE1ATJe3oXSb9L5MMppdxP2ylNSjv6zFBwKYjcKMucVfA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@rollup/pluginutils": "^5.0.1",
        "magic-string": "^0.30.3"
      },
      "engines": {
        "node": ">=14.0.0"
      },
      "peerDependencies": {
        "rollup": "^1.20.0||^2.0.0||^3.0.0||^4.0.0"
      },
      "peerDependenciesMeta": {
        "rollup": {
          "optional": true
        }
      }
    },
    "node_modules/@rollup/plugin-terser": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/@rollup/plugin-terser/-/plugin-terser-1.0.0.tgz",
      "integrity": "sha512-FnCxhTBx6bMOYQrar6C8h3scPt8/JwIzw3+AJ2K++6guogH5fYaIFia+zZuhqv0eo1RN7W1Pz630SyvLbDjhtQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "serialize-javascript": "^7.0.3",
        "smob": "^1.0.0",
        "terser": "^5.17.4"
      },
      "engines": {
        "node": ">=20.0.0"
      },
      "peerDependencies": {
        "rollup": "^2.0.0||^3.0.0||^4.0.0"
      },
      "peerDependenciesMeta": {
        "rollup": {
          "optional": true
        }
      }
    },
    "node_modules/@rollup/pluginutils": {
      "version": "5.4.0",
      "resolved": "https://registry.npmjs.org/@rollup/pluginutils/-/pluginutils-5.4.0.tgz",
      "integrity": "sha512-MfPp06CjRLfXQ3wY0R8vJDYBy/MvVcc9OulEfR0B8Iv9ko+GCNaRZ+EpJYFl27LhKsZK0o420sYCRHCjfCgeUg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/estree": "^1.0.0",
        "estree-walker": "^2.0.2",
        "picomatch": "^4.0.2"
      },
      "engines": {
        "node": ">=14.0.0"
      },
      "peerDependencies": {
        "rollup": "^1.20.0||^2.0.0||^3.0.0||^4.0.0"
      },
      "peerDependenciesMeta": {
        "rollup": {
          "optional": true
        }
      }
    },
    "node_modules/@rollup/rollup-linux-x64-gnu": {
      "version": "4.63.3",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-gnu/-/rollup-linux-x64-gnu-4.63.3.tgz",
      "integrity": "sha512-SXagRwnI2Wlwlitllu59UK/nGVbD1CKPcNqDplHwIC4BqJcpXFjD32d1R/RbuISa95HdQrZM3/7v4bKiowFaLA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-x64-musl": {
      "version": "4.63.3",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-musl/-/rollup-linux-x64-musl-4.63.3.tgz",
      "integrity": "sha512-2IPozoEALRCziGqE8O9KMK60PMu5TS1huv4fwoeCexj+WjmcwFtX9CTOVbfXCUqcELAubEwRFPYlzb/WvwY2HQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@trickfilm400/rollup-plugin-off-main-thread": {
      "version": "3.0.0-pre1",
      "resolved": "https://registry.npmjs.org/@trickfilm400/rollup-plugin-off-main-thread/-/rollup-plugin-off-main-thread-3.0.0-pre1.tgz",
      "integrity": "sha512-/67zpWDBLV+oYAEL682s1ktXL0HgqX76f6gaVGkGnVZlBbm1zd0v4Bz8MFF2GGhoX9rvfq3KSQHubFHwa6w6/Q==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "ejs": "^3.1.10",
        "json5": "^2.2.3",
        "magic-string": "^0.30.21",
        "string.prototype.matchall": "^4.0.12"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@ts-morph/common": {
      "version": "0.11.1",
      "resolved": "https://registry.npmjs.org/@ts-morph/common/-/common-0.11.1.tgz",
      "integrity": "sha512-7hWZS0NRpEsNV8vWJzg7FEz6V8MaLNeJOmwmghqUXTpzk16V1LLZhdo+4QvE/+zv4cVci0OviuJFnqhEfoV3+g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fast-glob": "^3.2.7",
        "minimatch": "^3.0.4",
        "mkdirp": "^1.0.4",
        "path-browserify": "^1.0.1"
      }
    },
    "node_modules/@ts-morph/common/node_modules/balanced-match": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/balanced-match/-/balanced-match-1.0.2.tgz",
      "integrity": "sha512-3oSeUO0TMV67hN1AmbXsK4yaqU7tjiHlbxRDZOpH0KW9+CeX4bRAaX0Anxt0tx2MrpRpWwQaPwIlISEJhYU5Pw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@ts-morph/common/node_modules/brace-expansion": {
      "version": "1.1.21",
      "resolved": "https://registry.npmjs.org/brace-expansion/-/brace-expansion-1.1.21.tgz",
      "integrity": "sha512-9zeA+KLZNNzglF2TPKRQEDyx6Yby7daAkuy8MiPzpXPsYDWi/DRM8jmwUDxokQjYqBpv5DgPiwD4h4ZZSy1Ujw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "balanced-match": "^1.0.0",
        "concat-map": "0.0.1"
      }
    },
    "node_modules/@ts-morph/common/node_modules/minimatch": {
      "version": "3.1.5",
      "resolved": "https://registry.npmjs.org/minimatch/-/minimatch-3.1.5.tgz",
      "integrity": "sha512-VgjWUsnnT6n+NUk6eZq77zeFdpW2LWDzP6zFGrCbHXiYNul5Dzqk2HHQ5uFH2DNW5Xbp8+jVzaeNt94ssEEl4w==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "brace-expansion": "^1.1.7"
      },
      "engines": {
        "node": "*"
      }
    },
    "node_modules/@types/body-parser": {
      "version": "1.19.6",
      "resolved": "https://registry.npmjs.org/@types/body-parser/-/body-parser-1.19.6.tgz",
      "integrity": "sha512-HLFeCYgz89uk22N5Qg3dvGvsv46B8GLvKKo1zKG4NybA8U2DiEO3w9lqGg29t/tfLRJpJ6iQxnVw4OnB7MoM9g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/connect": "*",
        "@types/node": "*"
      }
    },
    "node_modules/@types/connect": {
      "version": "3.4.38",
      "resolved": "https://registry.npmjs.org/@types/connect/-/connect-3.4.38.tgz",
      "integrity": "sha512-K6uROf1LD88uDQqJCktA4yzL1YYAK6NgfsI0v/mTgyPKWsX1CnJ0XPSDhViejru1GcRkLWb8RlzFYJRqGUbaug==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/node": "*"
      }
    },
    "node_modules/@types/estree": {
      "version": "1.0.9",
      "resolved": "https://registry.npmjs.org/@types/estree/-/estree-1.0.9.tgz",
      "integrity": "sha512-GhdPgy1el4/ImP05X05Uw4cw2/M93BCUmnEvWZNStlCzEKME4Fkk+YpoA5OiHNQmoS7Cafb8Xa3Pya8m1Qrzeg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/express": {
      "version": "5.0.6",
      "resolved": "https://registry.npmjs.org/@types/express/-/express-5.0.6.tgz",
      "integrity": "sha512-sKYVuV7Sv9fbPIt/442koC7+IIwK5olP1KWeD88e/idgoJqDm3JV/YUiPwkoKK92ylff2MGxSz1CSjsXelx0YA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/body-parser": "*",
        "@types/express-serve-static-core": "^5.0.0",
        "@types/serve-static": "^2"
      }
    },
    "node_modules/@types/express-serve-static-core": {
      "version": "5.1.3",
      "resolved": "https://registry.npmjs.org/@types/express-serve-static-core/-/express-serve-static-core-5.1.3.tgz",
      "integrity": "sha512-dPfW8NFiOF4wOHc7+N/QSxlY9cfSsenewGbAz8C8U/MULPd/YZ27LvJUIlzaXie7e6Ove9YunJGgC9tbHD2cKw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/node": "*",
        "@types/qs": "*",
        "@types/range-parser": "*",
        "@types/send": "*"
      }
    },
    "node_modules/@types/http-errors": {
      "version": "2.0.5",
      "resolved": "https://registry.npmjs.org/@types/http-errors/-/http-errors-2.0.5.tgz",
      "integrity": "sha512-r8Tayk8HJnX0FztbZN7oVqGccWgw98T/0neJphO91KkmOzug1KkofZURD4UaD5uH8AqcFLfdPErnBod0u71/qg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/json-schema": {
      "version": "7.0.15",
      "resolved": "https://registry.npmjs.org/@types/json-schema/-/json-schema-7.0.15.tgz",
      "integrity": "sha512-5+fP8P8MFNC+AyZCDxrB2pkZFPGzqQWUzpSeuuVLvm8VMcorNYavBqoFcxK8bQz4Qsbn4oUEEem4wDLfcysGHA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/node": {
      "version": "24.13.5",
      "resolved": "https://registry.npmjs.org/@types/node/-/node-24.13.5.tgz",
      "integrity": "sha512-TXyindR+lBr22aJIdMQzCFHPHR6cR4js838mRDCSz5hOKWZvZwsXSSiXDmjRj4iJmgl+sR9O+1mkoVBSMadNug==",
      "license": "MIT",
      "dependencies": {
        "undici-types": "~7.18.0"
      }
    },
    "node_modules/@types/nodemailer": {
      "version": "6.4.24",
      "resolved": "https://registry.npmjs.org/@types/nodemailer/-/nodemailer-6.4.24.tgz",
      "integrity": "sha512-Ww4u0rT9wQNXh4JiQaIwx3QWdcOFXzOjQA2zc+jtFYNmQiT4mIUqcDin51bDFdkzKubFnQCZNK7FIHlPKQ/q9w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/node": "*"
      }
    },
    "node_modules/@types/qs": {
      "version": "6.15.1",
      "resolved": "https://registry.npmjs.org/@types/qs/-/qs-6.15.1.tgz",
      "integrity": "sha512-GZHUBZR9hckSUhrxmp1nG6NwdpM9fCunJwyThLW1X3AyHgd9IlHb6VANpQQqDr2o/qQp6McZ3y/IA2rVzKzSbw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/range-parser": {
      "version": "1.2.7",
      "resolved": "https://registry.npmjs.org/@types/range-parser/-/range-parser-1.2.7.tgz",
      "integrity": "sha512-hKormJbkJqzQGhziax5PItDUTMAM9uE2XXQmM37dyd4hVM+5aVl7oVxMVUiVQn2oCQFN/LKCZdvSM0pFRqbSmQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/react": {
      "version": "19.3.0",
      "resolved": "https://registry.npmjs.org/@types/react/-/react-19.3.0.tgz",
      "integrity": "sha512-N0rFCuH9YoxG9/m61l9MfpJKfmLOVU0em7ipIz6TRgSSkvReLB9vL85GB+yr8Bs5leqpvg96JSwF4ZS1s4viQg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "csstype": "^3.2.2"
      }
    },
    "node_modules/@types/react-dom": {
      "version": "19.3.0",
      "resolved": "https://registry.npmjs.org/@types/react-dom/-/react-dom-19.3.0.tgz",
      "integrity": "sha512-ZI7bU42mZXXKHn/qNLEw2IrbiINU7X5+vfgdixBHkCNpYWXjKgfQ/P+uyGb5CjOLB9UcnTeg3rylQtV2hym44Q==",
      "dev": true,
      "license": "MIT",
      "peerDependencies": {
        "@types/react": "^19.3.0"
      }
    },
    "node_modules/@types/resolve": {
      "version": "1.20.2",
      "resolved": "https://registry.npmjs.org/@types/resolve/-/resolve-1.20.2.tgz",
      "integrity": "sha512-60BCwRFOZCQhDncwQdxxeOEEkbc5dIMccYLwbxsS4TUNeVECQ/pBJ0j09mrHOl/JJvpRPGwO9SvE4nR2Nb/a4Q==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/retry": {
      "version": "0.12.0",
      "resolved": "https://registry.npmjs.org/@types/retry/-/retry-0.12.0.tgz",
      "integrity": "sha512-wWKOClTTiizcZhXnPY4wikVAwmdYHp8q6DmC+EJUzAMsycb7HB32Kh9RN4+0gExjmPmZSAQjgURXIGATPegAvA==",
      "license": "MIT"
    },
    "node_modules/@types/send": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/@types/send/-/send-1.2.1.tgz",
      "integrity": "sha512-arsCikDvlU99zl1g69TcAB3mzZPpxgw0UQnaHeC1Nwb015xp8bknZv5rIfri9xTOcMuaVgvabfIRA7PSZVuZIQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/node": "*"
      }
    },
    "node_modules/@types/serve-static": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/@types/serve-static/-/serve-static-2.2.0.tgz",
      "integrity": "sha512-8mam4H1NHLtu7nmtalF7eyBH14QyOASmcxHhSfEoRyr0nP/YdoesEtU+uSRvMe96TW/HPTtkoKqQLl53N7UXMQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/http-errors": "*",
        "@types/node": "*"
      }
    },
    "node_modules/@types/trusted-types": {
      "version": "2.0.7",
      "resolved": "https://registry.npmjs.org/@types/trusted-types/-/trusted-types-2.0.7.tgz",
      "integrity": "sha512-ScaPdn1dQczgbl0QFTeTOmVHFULt394XJgOQNoyVhZ6r2vLnMLJfBPd53SB52T/3G36VI1/g2MZaX0cwDuXsfw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@vercel/build-utils": {
      "version": "14.2.0",
      "resolved": "https://registry.npmjs.org/@vercel/build-utils/-/build-utils-14.2.0.tgz",
      "integrity": "sha512-GwmtB31tBXQEzFw11grr8BKFCBdUORmYeooB0ZtonaCXZMZaPCHLBFTMFKsvaV6ZciQORPInRwXShbFvmnjqtg==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "cjs-module-lexer": "1.2.3",
        "es-module-lexer": "1.5.0"
      }
    },
    "node_modules/@vercel/build-utils/node_modules/es-module-lexer": {
      "version": "1.5.0",
      "resolved": "https://registry.npmjs.org/es-module-lexer/-/es-module-lexer-1.5.0.tgz",
      "integrity": "sha512-pqrTKmwEIgafsYZAGw9kszYzmagcE/n4dbgwGWLEXg7J4QFJVQRBld8j3Q3GNez79jzxZshq0bcT962QHOghjw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@vercel/error-utils": {
      "version": "2.2.1",
      "resolved": "https://registry.npmjs.org/@vercel/error-utils/-/error-utils-2.2.1.tgz",
      "integrity": "sha512-9DhP8jP7raLML4hGsBemxX5fXuQnu5xxMV+HjGygGbzEmVK/+KyJ3QP2Cw7PdF0uXdb9N0Qa4c3tRGH34ZX6vw==",
      "dev": true,
      "license": "Apache-2.0"
    },
    "node_modules/@vercel/nft": {
      "version": "1.10.0",
      "resolved": "https://registry.npmjs.org/@vercel/nft/-/nft-1.10.0.tgz",
      "integrity": "sha512-iLOW4fcsgkipfOh2Bw3wB38YDfxTlxr7+j4uFeui2OswkNT28jIitS/aMce7tS0mef1YPQ8zLIDYr3a0aahNrA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@mapbox/node-pre-gyp": "^2.0.0",
        "@rollup/pluginutils": "^5.1.3",
        "acorn": "^8.6.0",
        "acorn-import-attributes": "^1.9.5",
        "async-sema": "^3.1.1",
        "bindings": "^1.4.0",
        "estree-walker": "2.0.2",
        "glob": "^13.0.0",
        "graceful-fs": "^4.2.9",
        "node-gyp-build": "^4.2.2",
        "picomatch": "^4.0.2",
        "resolve-from": "^5.0.0"
      },
      "bin": {
        "nft": "out/cli.js"
      },
      "engines": {
        "node": ">=20"
      }
    },
    "node_modules/@vercel/nft/node_modules/glob": {
      "version": "13.0.6",
      "resolved": "https://registry.npmjs.org/glob/-/glob-13.0.6.tgz",
      "integrity": "sha512-Wjlyrolmm8uDpm/ogGyXZXb1Z+Ca2B8NbJwqBVg0axK9GbBeoS7yGV6vjXnYdGm6X53iehEuxxbyiKp8QmN4Vw==",
      "dev": true,
      "license": "BlueOak-1.0.0",
      "dependencies": {
        "minimatch": "^10.2.2",
        "minipass": "^7.1.3",
        "path-scurry": "^2.0.2"
      },
      "engines": {
        "node": "18 || 20 || >=22"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/@vercel/node": {
      "version": "5.10.2",
      "resolved": "https://registry.npmjs.org/@vercel/node/-/node-5.10.2.tgz",
      "integrity": "sha512-YBXcoQVOh5O2ySXvzE+POhPEQEPMJJo4ctlMMdp5why/NIoa8m6gotv14j8Uo6D5qyZsnc+0+++JgUiV4mYB6w==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@edge-runtime/node-utils": "2.3.0",
        "@edge-runtime/primitives": "4.1.0",
        "@edge-runtime/vm": "3.2.0",
        "@types/node": "20.11.0",
        "@vercel/build-utils": "14.2.0",
        "@vercel/error-utils": "2.2.1",
        "@vercel/nft": "1.10.0",
        "@vercel/static-config": "3.4.1",
        "async-listen": "3.0.0",
        "cjs-module-lexer": "1.2.3",
        "edge-runtime": "2.5.9",
        "es-module-lexer": "1.4.1",
        "esbuild": "0.27.0",
        "etag": "1.8.1",
        "mime-types": "2.1.35",
        "node-fetch": "2.6.9",
        "path-to-regexp": "6.1.0",
        "path-to-regexp-updated": "npm:path-to-regexp@6.3.0",
        "ts-morph": "12.0.0",
        "tsx": "4.21.0",
        "typescript": "npm:typescript@5.9.3",
        "undici": "5.28.4"
      }
    },
    "node_modules/@vercel/node/node_modules/@esbuild/linux-x64": {
      "version": "0.27.0",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.27.0.tgz",
      "integrity": "sha512-1hBWx4OUJE2cab++aVZ7pObD6s+DK4mPGpemtnAORBvb5l/g5xFGk0vc0PjSkrDs0XaXj9yyob3d14XqvnQ4gw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@vercel/node/node_modules/@types/node": {
      "version": "20.11.0",
      "resolved": "https://registry.npmjs.org/@types/node/-/node-20.11.0.tgz",
      "integrity": "sha512-o9bjXmDNcF7GbM4CNQpmi+TutCgap/K3w1JyKgxAjqx41zp9qlIAVFi0IhCNsJcXolEqLWhbFbEeL0PvYm4pcQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "undici-types": "~5.26.4"
      }
    },
    "node_modules/@vercel/node/node_modules/esbuild": {
      "version": "0.27.0",
      "resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.27.0.tgz",
      "integrity": "sha512-jd0f4NHbD6cALCyGElNpGAOtWxSq46l9X/sWB0Nzd5er4Kz2YTm+Vl0qKFT9KUJvD8+fiO8AvoHhFvEatfVixA==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "bin": {
        "esbuild": "bin/esbuild"
      },
      "engines": {
        "node": ">=18"
      },
      "optionalDependencies": {
        "@esbuild/aix-ppc64": "0.27.0",
        "@esbuild/android-arm": "0.27.0",
        "@esbuild/android-arm64": "0.27.0",
        "@esbuild/android-x64": "0.27.0",
        "@esbuild/darwin-arm64": "0.27.0",
        "@esbuild/darwin-x64": "0.27.0",
        "@esbuild/freebsd-arm64": "0.27.0",
        "@esbuild/freebsd-x64": "0.27.0",
        "@esbuild/linux-arm": "0.27.0",
        "@esbuild/linux-arm64": "0.27.0",
        "@esbuild/linux-ia32": "0.27.0",
        "@esbuild/linux-loong64": "0.27.0",
        "@esbuild/linux-mips64el": "0.27.0",
        "@esbuild/linux-ppc64": "0.27.0",
        "@esbuild/linux-riscv64": "0.27.0",
        "@esbuild/linux-s390x": "0.27.0",
        "@esbuild/linux-x64": "0.27.0",
        "@esbuild/netbsd-arm64": "0.27.0",
        "@esbuild/netbsd-x64": "0.27.0",
        "@esbuild/openbsd-arm64": "0.27.0",
        "@esbuild/openbsd-x64": "0.27.0",
        "@esbuild/openharmony-arm64": "0.27.0",
        "@esbuild/sunos-x64": "0.27.0",
        "@esbuild/win32-arm64": "0.27.0",
        "@esbuild/win32-ia32": "0.27.0",
        "@esbuild/win32-x64": "0.27.0"
      }
    },
    "node_modules/@vercel/node/node_modules/mime-db": {
      "version": "1.52.0",
      "resolved": "https://registry.npmjs.org/mime-db/-/mime-db-1.52.0.tgz",
      "integrity": "sha512-sPU4uV7dYlvtWJxwwxHD0PuihVNiE7TyAbQ5SWxDCB9mUYvOgroQOwYQQOKPJ8CIbE+1ETVlOoK1UC2nU3gYvg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/@vercel/node/node_modules/mime-types": {
      "version": "2.1.35",
      "resolved": "https://registry.npmjs.org/mime-types/-/mime-types-2.1.35.tgz",
      "integrity": "sha512-ZDY+bPm5zTTF+YpCrAU9nK0UgICYPT0QtT1NZWFv4s++TNkcgVaT0g6+4R2uI4MjQjzysHB1zxuWL50hzaeXiw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "mime-db": "1.52.0"
      },
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/@vercel/node/node_modules/node-fetch": {
      "version": "2.6.9",
      "resolved": "https://registry.npmjs.org/node-fetch/-/node-fetch-2.6.9.tgz",
      "integrity": "sha512-DJm/CJkZkRjKKj4Zi4BsKVZh3ValV5IR5s7LVZnW+6YMh0W1BfNA8XSs6DLMGYlId5F3KnA70uu2qepcR08Qqg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "whatwg-url": "^5.0.0"
      },
      "engines": {
        "node": "4.x || >=6.0.0"
      },
      "peerDependencies": {
        "encoding": "^0.1.0"
      },
      "peerDependenciesMeta": {
        "encoding": {
          "optional": true
        }
      }
    },
    "node_modules/@vercel/node/node_modules/path-to-regexp": {
      "version": "6.1.0",
      "resolved": "https://registry.npmjs.org/path-to-regexp/-/path-to-regexp-6.1.0.tgz",
      "integrity": "sha512-h9DqehX3zZZDCEm+xbfU0ZmwCGFCAAraPJWMXJ4+v32NjZJilVg3k1TcKsRgIb8IQ/izZSaydDc1OhJCZvs2Dw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@vercel/node/node_modules/tsx": {
      "version": "4.21.0",
      "resolved": "https://registry.npmjs.org/tsx/-/tsx-4.21.0.tgz",
      "integrity": "sha512-5C1sg4USs1lfG0GFb2RLXsdpXqBSEhAaA/0kPL01wxzpMqLILNxIxIOKiILz+cdg/pLnOUxFYOR5yhHU666wbw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "esbuild": "~0.27.0",
        "get-tsconfig": "^4.7.5"
      },
      "bin": {
        "tsx": "dist/cli.mjs"
      },
      "engines": {
        "node": ">=18.0.0"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.3"
      }
    },
    "node_modules/@vercel/node/node_modules/typescript": {
      "version": "5.9.3",
      "resolved": "https://registry.npmjs.org/typescript/-/typescript-5.9.3.tgz",
      "integrity": "sha512-jl1vZzPDinLr9eUt3J/t7V6FgNEw9QjvBPdysz9KfQDD41fQrC2Y4vKQdiaUpFT4bXlb1RHhLpp8wtm6M5TgSw==",
      "dev": true,
      "license": "Apache-2.0",
      "bin": {
        "tsc": "bin/tsc",
        "tsserver": "bin/tsserver"
      },
      "engines": {
        "node": ">=14.17"
      }
    },
    "node_modules/@vercel/node/node_modules/undici-types": {
      "version": "5.26.5",
      "resolved": "https://registry.npmjs.org/undici-types/-/undici-types-5.26.5.tgz",
      "integrity": "sha512-JlCMO+ehdEIKqlFxk6IfVoAUVmgz7cU7zD/h9XZ0qzeosSHmUJVOzSQvvYSYWXkFXC+IfLKSIffhv0sVZup6pA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@vercel/static-config": {
      "version": "3.4.1",
      "resolved": "https://registry.npmjs.org/@vercel/static-config/-/static-config-3.4.1.tgz",
      "integrity": "sha512-kJKTyOg25JDRgDkHEkc+vWlvURxmSQkVKyRPO4EEGD/8HpJT+4u9Z/VGxwnCZ6zZBxYPpma283qBsHwY0gXjfw==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "ajv": "8.6.3",
        "json-schema-to-ts": "1.6.4",
        "ts-morph": "12.0.0"
      }
    },
    "node_modules/@vercel/static-config/node_modules/ajv": {
      "version": "8.6.3",
      "resolved": "https://registry.npmjs.org/ajv/-/ajv-8.6.3.tgz",
      "integrity": "sha512-SMJOdDP6LqTkD0Uq8qLi+gMwSt0imXLSV080qFVwJCpH9U6Mb+SUGHAXM0KNbcBPguytWyvFxcHgMLe2D2XSpw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fast-deep-equal": "^3.1.1",
        "json-schema-traverse": "^1.0.0",
        "require-from-string": "^2.0.2",
        "uri-js": "^4.2.2"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/epoberezkin"
      }
    },
    "node_modules/@vitejs/plugin-react": {
      "version": "6.1.1",
      "resolved": "https://registry.npmjs.org/@vitejs/plugin-react/-/plugin-react-6.1.1.tgz",
      "integrity": "sha512-yxLaQV9gkhS8ezJqCM6+ndU7mDY6gqAg75NQ+0IjwEI8IYOmQCgkRwHKVSfWXW076DsqMo0Dk+0FK1U+M5RgFw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@rolldown/pluginutils": "^1.0.1"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "peerDependencies": {
        "@rolldown/plugin-babel": "^0.1.7 || ^0.2.0",
        "babel-plugin-react-compiler": "^1.0.0",
        "oxc-transform-react": "^0.145.0",
        "vite": "^8.0.0"
      },
      "peerDependenciesMeta": {
        "@rolldown/plugin-babel": {
          "optional": true
        },
        "babel-plugin-react-compiler": {
          "optional": true
        },
        "oxc-transform-react": {
          "optional": true
        }
      }
    },
    "node_modules/abbrev": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/abbrev/-/abbrev-3.0.1.tgz",
      "integrity": "sha512-AO2ac6pjRB3SJmGJo+v5/aK6Omggp6fsLrs6wN9bd35ulu4cCwaAU9+7ZhXjeqHVkaHThLuzH0nZr0YpCDhygg==",
      "dev": true,
      "license": "ISC",
      "engines": {
        "node": "^18.17.0 || >=20.5.0"
      }
    },
    "node_modules/accepts": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/accepts/-/accepts-2.0.0.tgz",
      "integrity": "sha512-5cvg6CtKwfgdmVqY1WIiXKc3Q1bkRqGLi+2W/6ao+6Y7gu/RCwRuAhGEzh5B4KlszSuTLgZYuqFqo5bImjNKng==",
      "license": "MIT",
      "dependencies": {
        "mime-types": "^3.0.0",
        "negotiator": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/acorn": {
      "version": "8.18.0",
      "resolved": "https://registry.npmjs.org/acorn/-/acorn-8.18.0.tgz",
      "integrity": "sha512-lGq+9yr1/GuAWaVYIHRjvvySG5/4VfKIvC8EWxStPdcDh/Ka7FG3twP6v4d5BkravUilhIAsG4Qj83t02LWUPQ==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "acorn": "bin/acorn"
      },
      "engines": {
        "node": ">=0.4.0"
      }
    },
    "node_modules/acorn-import-attributes": {
      "version": "1.9.5",
      "resolved": "https://registry.npmjs.org/acorn-import-attributes/-/acorn-import-attributes-1.9.5.tgz",
      "integrity": "sha512-n02Vykv5uA3eHGM/Z2dQrcD56kL8TyDb2p1+0P83PClMnC/nc+anbQRhIOWnSq4Ke/KvDPrY3C9hDtC/A3eHnQ==",
      "dev": true,
      "license": "MIT",
      "peerDependencies": {
        "acorn": "^8"
      }
    },
    "node_modules/agent-base": {
      "version": "7.1.4",
      "resolved": "https://registry.npmjs.org/agent-base/-/agent-base-7.1.4.tgz",
      "integrity": "sha512-MnA+YT8fwfJPgBx3m60MNqakm30XOkyIoH1y6huTQvC0PwZG7ki8NacLBcrPbNoo8vEZy7Jpuk7+jMO+CUovTQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 14"
      }
    },
    "node_modules/ajv": {
      "version": "8.20.0",
      "resolved": "https://registry.npmjs.org/ajv/-/ajv-8.20.0.tgz",
      "integrity": "sha512-Thbli+OlOj+iMPYFBVBfJ3OmCAnaSyNn4M1vz9T6Gka5Jt9ba/HIR56joy65tY6kx/FCF5VXNB819Y7/GUrBGA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fast-deep-equal": "^3.1.3",
        "fast-uri": "^3.0.1",
        "json-schema-traverse": "^1.0.0",
        "require-from-string": "^2.0.2"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/epoberezkin"
      }
    },
    "node_modules/array-buffer-byte-length": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/array-buffer-byte-length/-/array-buffer-byte-length-1.0.2.tgz",
      "integrity": "sha512-LHE+8BuR7RYGDKvnrmcuSq3tDcKv9OFEXQt/HpbZhY7V6h0zlUXutnAD82GiFx9rdieCMjkvtcsPqBwgUl1Iiw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3",
        "is-array-buffer": "^3.0.5"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/arraybuffer.prototype.slice": {
      "version": "1.0.4",
      "resolved": "https://registry.npmjs.org/arraybuffer.prototype.slice/-/arraybuffer.prototype.slice-1.0.4.tgz",
      "integrity": "sha512-BNoCY6SXXPQ7gF2opIP4GBE+Xw7U+pHMYKuzjgCN3GwiaIR09UUeKfheyIry77QtrCBlC0KK0q5/TER/tYh3PQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "array-buffer-byte-length": "^1.0.1",
        "call-bind": "^1.0.8",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.23.5",
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.6",
        "is-array-buffer": "^3.0.4"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/async": {
      "version": "3.2.6",
      "resolved": "https://registry.npmjs.org/async/-/async-3.2.6.tgz",
      "integrity": "sha512-htCUDlxyyCLMgaM3xXg0C0LW2xqfuQ6p05pCEIsXuyQ+a1koYKTuBMzRNwmybfLgvJDMd0r1LTn4+E0Ti6C2AA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/async-function": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/async-function/-/async-function-1.0.0.tgz",
      "integrity": "sha512-hsU18Ae8CDTR6Kgu9DYf0EbCr/a5iGL0rytQDobUcdpYOKokk8LEjVphnXkDkgpi0wYVsqrXuP0bZxJaTqdgoA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/async-listen": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/async-listen/-/async-listen-3.0.0.tgz",
      "integrity": "sha512-V+SsTpDqkrWTimiotsyl33ePSjA5/KrithwupuvJ6ztsqPvGv6ge4OredFhPffVXiLN/QUWvE0XcqJaYgt6fOg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 14"
      }
    },
    "node_modules/async-sema": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/async-sema/-/async-sema-3.1.1.tgz",
      "integrity": "sha512-tLRNUXati5MFePdAk8dw7Qt7DpxPB60ofAgn8WRhW6a2rcimZnYBP9oxHiv0OHy+Wz7kPMG+t4LGdt31+4EmGg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/at-least-node": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/at-least-node/-/at-least-node-1.0.0.tgz",
      "integrity": "sha512-+q/t7Ekv1EDY2l6Gda6LLiX14rU9TV20Wa3ofeQmwPFZbOMo9DXrLbOjFaaclkXKWidIaopwAObQDqwWtGUjqg==",
      "dev": true,
      "license": "ISC",
      "engines": {
        "node": ">= 4.0.0"
      }
    },
    "node_modules/available-typed-arrays": {
      "version": "1.0.7",
      "resolved": "https://registry.npmjs.org/available-typed-arrays/-/available-typed-arrays-1.0.7.tgz",
      "integrity": "sha512-wvUjBtSGN7+7SjNpq/9M2Tg350UZD3q62IFZLbRAR1bSMlCo1ZaeW+BJ+D090e4hIIZLBcTDWe4Mh4jvUDajzQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "possible-typed-array-names": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/babel-plugin-polyfill-corejs2": {
      "version": "0.4.17",
      "resolved": "https://registry.npmjs.org/babel-plugin-polyfill-corejs2/-/babel-plugin-polyfill-corejs2-0.4.17.tgz",
      "integrity": "sha512-aTyf30K/rqAsNwN76zYrdtx8obu0E4KoUME29B1xj+B3WxgvWkp943vYQ+z8Mv3lw9xHXMHpvSPOBxzAkIa94w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/compat-data": "^7.28.6",
        "@babel/helper-define-polyfill-provider": "^0.6.8",
        "semver": "^6.3.1"
      },
      "peerDependencies": {
        "@babel/core": "^7.4.0 || ^8.0.0-0 <8.0.0"
      }
    },
    "node_modules/babel-plugin-polyfill-corejs3": {
      "version": "0.14.2",
      "resolved": "https://registry.npmjs.org/babel-plugin-polyfill-corejs3/-/babel-plugin-polyfill-corejs3-0.14.2.tgz",
      "integrity": "sha512-coWpDLJ410R781Npmn/SIBZEsAetR4xVi0SxLMXPaMO4lSf1MwnkGYMtkFxew0Dn8B3/CpbpYxN0JCgg8mn67g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-define-polyfill-provider": "^0.6.8",
        "core-js-compat": "^3.48.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.4.0 || ^8.0.0-0 <8.0.0"
      }
    },
    "node_modules/babel-plugin-polyfill-regenerator": {
      "version": "0.6.8",
      "resolved": "https://registry.npmjs.org/babel-plugin-polyfill-regenerator/-/babel-plugin-polyfill-regenerator-0.6.8.tgz",
      "integrity": "sha512-M762rNHfSF1EV3SLtnCJXFoQbbIIz0OyRwnCmV0KPC7qosSfCO0QLTSuJX3ayAebubhE6oYBAYPrBA5ljowaZg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-define-polyfill-provider": "^0.6.8"
      },
      "peerDependencies": {
        "@babel/core": "^7.4.0 || ^8.0.0-0 <8.0.0"
      }
    },
    "node_modules/balanced-match": {
      "version": "4.0.4",
      "resolved": "https://registry.npmjs.org/balanced-match/-/balanced-match-4.0.4.tgz",
      "integrity": "sha512-BLrgEcRTwX2o6gGxGOCNyMvGSp35YofuYzw9h1IMTRmKqttAZZVU67bdb9Pr2vUHA8+j3i2tJfjO6C6+4myGTA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "18 || 20 || >=22"
      }
    },
    "node_modules/base64-js": {
      "version": "1.5.1",
      "resolved": "https://registry.npmjs.org/base64-js/-/base64-js-1.5.1.tgz",
      "integrity": "sha512-AKpaYlHn8t4SVbOHCy+b5+KKgvR4vrsD8vbvrbiQJps7fKDTkjkDry6ji0rUJjC0kzbNePLwzxq8iypo41qeWA==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "MIT"
    },
    "node_modules/baseline-browser-mapping": {
      "version": "2.11.25",
      "resolved": "https://registry.npmjs.org/baseline-browser-mapping/-/baseline-browser-mapping-2.11.25.tgz",
      "integrity": "sha512-gMmEShwwq7FJqMwvfRwvCl00v4kN+KOfJqXn+f4nrufak5gNHJOksd/60Dvjuz7sI8Y5WiSFBa8FEYr+zoyqCw==",
      "dev": true,
      "license": "Apache-2.0",
      "bin": {
        "baseline-browser-mapping": "dist/cli.cjs"
      },
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/bignumber.js": {
      "version": "9.3.1",
      "resolved": "https://registry.npmjs.org/bignumber.js/-/bignumber.js-9.3.1.tgz",
      "integrity": "sha512-Ko0uX15oIUS7wJ3Rb30Fs6SkVbLmPBAKdlm7q9+ak9bbIeFf0MwuBsQV6z7+X768/cHsfg+WlysDWJcmthjsjQ==",
      "license": "MIT",
      "engines": {
        "node": "*"
      }
    },
    "node_modules/bindings": {
      "version": "1.5.0",
      "resolved": "https://registry.npmjs.org/bindings/-/bindings-1.5.0.tgz",
      "integrity": "sha512-p2q/t/mhvuOj/UeLlV6566GD/guowlr0hHxClI0W9m7MWYkL1F0hLo+0Aexs9HSPCtR1SXQ0TD3MMKrXZajbiQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "file-uri-to-path": "1.0.0"
      }
    },
    "node_modules/body-parser": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/body-parser/-/body-parser-2.3.0.tgz",
      "integrity": "sha512-2cGmJupaNgg+QUwVLAucDuWuoMZ6EX9iHDRswZ5lsNYEmwPaRknMPCLZz07yTzVq/83p4o/wzbDZbBrTvGGTIw==",
      "license": "MIT",
      "dependencies": {
        "bytes": "^3.1.2",
        "content-type": "^2.0.0",
        "debug": "^4.4.3",
        "http-errors": "^2.0.1",
        "iconv-lite": "^0.7.2",
        "on-finished": "^2.4.1",
        "qs": "^6.15.2",
        "raw-body": "^3.0.2",
        "type-is": "^2.1.0"
      },
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/body-parser/node_modules/content-type": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/content-type/-/content-type-2.1.0.tgz",
      "integrity": "sha512-mj7UPXE0jaqaOsukNZRUEfEi2AcL7C/vwmwcHV0O97eO1E1pxBZuyjlZrx5seTaNBg1U6+o35wpa35Qfcc+7ag==",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/brace-expansion": {
      "version": "5.0.12",
      "resolved": "https://registry.npmjs.org/brace-expansion/-/brace-expansion-5.0.12.tgz",
      "integrity": "sha512-YovQ3rzhaLMIrDjNDMkNS01tea93qhEhG5xy8f6+R0l+dw3Ki+5sCoIoI942iuLZTHWogWktgwVDhU09iNEimQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "balanced-match": "^4.0.2"
      },
      "engines": {
        "node": "20 || >=22"
      }
    },
    "node_modules/braces": {
      "version": "3.0.3",
      "resolved": "https://registry.npmjs.org/braces/-/braces-3.0.3.tgz",
      "integrity": "sha512-yQbXgO/OSZVD2IsiLlro+7Hf6Q18EJrKSEsdoMzKePKXct3gvD8oLcOQdIzGupr5Fj+EDe8gO/lxc1BzfMpxvA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fill-range": "^7.1.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/browserslist": {
      "version": "4.29.0",
      "resolved": "https://registry.npmjs.org/browserslist/-/browserslist-4.29.0.tgz",
      "integrity": "sha512-3GSvyjvDI4Dur1Meg2BekJquu5uF+9R9a1+5M1Mde192eZoXbeXjzgOsgqPS2V8D5wrrip0gR5Hf/GhWQ9ZzaA==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/browserslist"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "baseline-browser-mapping": "^2.11.23",
        "caniuse-lite": "^1.0.30001810",
        "electron-to-chromium": "^1.5.427",
        "node-releases": "^2.0.55",
        "update-browserslist-db": "^1.3.3"
      },
      "bin": {
        "browserslist": "cli.js"
      },
      "engines": {
        "node": "^6 || ^7 || ^8 || ^9 || ^10 || ^11 || ^12 || >=13.7"
      }
    },
    "node_modules/buffer-equal-constant-time": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/buffer-equal-constant-time/-/buffer-equal-constant-time-1.0.1.tgz",
      "integrity": "sha512-zRpUiDwd/xk6ADqPMATG8vc9VPrkck7T07OIx0gnjmJAnHnTVXNQG3vfvWNuiZIkwu9KrKdA1iJKfsfTVxE6NA==",
      "license": "BSD-3-Clause"
    },
    "node_modules/buffer-from": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/buffer-from/-/buffer-from-1.1.2.tgz",
      "integrity": "sha512-E+XQCRwSbaaiChtv6k6Dwgc+bx+Bs6vuKJHHl5kox/BaKbhiXzqQOwK4cO22yElGp2OCmjwVhT3HmxgyPGnJfQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/bytes": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/bytes/-/bytes-3.1.2.tgz",
      "integrity": "sha512-/Nf7TyzTx6S3yRJObOAV7956r8cr2+Oj8AC5dt8wSP3BQAoeX58NoHyCU8P8zGkNXStjTSi6fzO6F0pBdcYbEg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/call-bind": {
      "version": "1.0.9",
      "resolved": "https://registry.npmjs.org/call-bind/-/call-bind-1.0.9.tgz",
      "integrity": "sha512-a/hy+pNsFUTR+Iz8TCJvXudKVLAnz/DyeSUo10I5yvFDQJBFU2s9uqQpoSrJlroHUKoKqzg+epxyP9lqFdzfBQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.2",
        "es-define-property": "^1.0.1",
        "get-intrinsic": "^1.3.0",
        "set-function-length": "^1.2.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/call-bind-apply-helpers": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/call-bind-apply-helpers/-/call-bind-apply-helpers-1.0.2.tgz",
      "integrity": "sha512-Sp1ablJ0ivDkSzjcaJdxEunN5/XvksFJ2sMBFfq6x0ryhQV/2b/KwFe21cMpmHtPOSij8K99/wSfoEuTObmuMQ==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/call-bound": {
      "version": "1.0.4",
      "resolved": "https://registry.npmjs.org/call-bound/-/call-bound-1.0.4.tgz",
      "integrity": "sha512-+ys997U96po4Kx/ABpBCqhA9EuxJaQWDQg7295H4hBphv3IZg0boBKuwYpt4YXp6MZ5AmZQnU/tyMTlRpaSejg==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.2",
        "get-intrinsic": "^1.3.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/caniuse-lite": {
      "version": "1.0.30001810",
      "resolved": "https://registry.npmjs.org/caniuse-lite/-/caniuse-lite-1.0.30001810.tgz",
      "integrity": "sha512-TITQPUkaz+aVk5GL6NhOdwk1aEaNTSDPsGFWrTuhKGtjTF70jL/Oht2W4c6rXUe5fu7Ie19VIahAXHIIiWWNeg==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/caniuse-lite"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "CC-BY-4.0"
    },
    "node_modules/chownr": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/chownr/-/chownr-3.0.0.tgz",
      "integrity": "sha512-+IxzY9BZOQd/XuYPRmrvEVjF/nqj5kgT4kEq7VofrDoM1MxoRjEWkrCC3EtLi59TVawxTAn+orJwFQcrqEN1+g==",
      "dev": true,
      "license": "BlueOak-1.0.0",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/cjs-module-lexer": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/cjs-module-lexer/-/cjs-module-lexer-1.2.3.tgz",
      "integrity": "sha512-0TNiGstbQmCFwt4akjjBg5pLRTSyj/PkWQ1ZoO2zntmg9yLqSRxwEa4iCfQLGjqhiqBfOJa7W/E8wfGrTDmlZQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/code-block-writer": {
      "version": "10.1.1",
      "resolved": "https://registry.npmjs.org/code-block-writer/-/code-block-writer-10.1.1.tgz",
      "integrity": "sha512-67ueh2IRGst/51p0n6FvPrnRjAGHY5F8xdjkgrYE7DDzpJe6qA07RYQ9VcoUeo5ATOjSOiWpSL3SWBRRbempMw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/commander": {
      "version": "2.20.3",
      "resolved": "https://registry.npmjs.org/commander/-/commander-2.20.3.tgz",
      "integrity": "sha512-GpVkmM8vF2vQUkj2LvZmD35JxeJOLCwJ9cUkugyk2nuhbv3+mJvpLYYt+0+USMxE+oj+ey/lJEnhZw75x/OMcQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/common-tags": {
      "version": "1.8.2",
      "resolved": "https://registry.npmjs.org/common-tags/-/common-tags-1.8.2.tgz",
      "integrity": "sha512-gk/Z852D2Wtb//0I+kRFNKKE9dIIVirjoqPoA1wJU+XePVXZfGeBpk45+A1rKO4Q43prqWBNY/MiIeRLbPWUaA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=4.0.0"
      }
    },
    "node_modules/concat-map": {
      "version": "0.0.1",
      "resolved": "https://registry.npmjs.org/concat-map/-/concat-map-0.0.1.tgz",
      "integrity": "sha512-/Srv4dswyQNBfohGpz9o6Yb3Gz3SrUDqBH5rTuhGR7ahtlbYKnVxw2bCFMRljaA7EXHaXZ8wsHdodFvbkhKmqg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/consola": {
      "version": "3.4.2",
      "resolved": "https://registry.npmjs.org/consola/-/consola-3.4.2.tgz",
      "integrity": "sha512-5IKcdX0nnYavi6G7TtOhwkYzyjfJlatbjMjuLSfE2kYT5pMDOilZ4OvMhi637CcDICTmz3wARPoyhqyX1Y+XvA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^14.18.0 || >=16.10.0"
      }
    },
    "node_modules/content-disposition": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/content-disposition/-/content-disposition-1.1.0.tgz",
      "integrity": "sha512-5jRCH9Z/+DRP7rkvY83B+yGIGX96OYdJmzngqnw2SBSxqCFPd0w2km3s5iawpGX8krnwSGmF0FW5Nhr0Hfai3g==",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/content-type": {
      "version": "1.0.5",
      "resolved": "https://registry.npmjs.org/content-type/-/content-type-1.0.5.tgz",
      "integrity": "sha512-nTjqfcBFEipKdXCv4YDQWCfmcLZKm81ldF0pAopTvyrFGVbcR6P/VAAd5G7N+0tTr8QqiU0tFadD6FK4NtJwOA==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/convert-hrtime": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/convert-hrtime/-/convert-hrtime-3.0.0.tgz",
      "integrity": "sha512-7V+KqSvMiHp8yWDuwfww06XleMWVVB9b9tURBx+G7UTADuo5hYPuowKloz4OzOqbPezxgo+fdQ1522WzPG4OeA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/convert-source-map": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/convert-source-map/-/convert-source-map-2.0.0.tgz",
      "integrity": "sha512-Kvp459HrV2FEJ1CAsi1Ku+MY3kasH19TFykTz2xWmMeq6bk2NU3XXvfJ+Q61m0xktWwt+1HSYf3JZsTms3aRJg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/cookie": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/cookie/-/cookie-1.1.1.tgz",
      "integrity": "sha512-ei8Aos7ja0weRpFzJnEA9UHJ/7XQmqglbRwnf2ATjcB9Wq874VKH9kfjjirM6UhU2/E5fFYadylyhFldcqSidQ==",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/cookie-signature": {
      "version": "1.2.2",
      "resolved": "https://registry.npmjs.org/cookie-signature/-/cookie-signature-1.2.2.tgz",
      "integrity": "sha512-D76uU73ulSXrD1UXF4KE2TMxVVwhsnCgfAyTg9k8P6KGZjlXKrOLe4dJQKI3Bxi5wjesZoFXJWElNWBjPZMbhg==",
      "license": "MIT",
      "engines": {
        "node": ">=6.6.0"
      }
    },
    "node_modules/core-js-compat": {
      "version": "3.50.0",
      "resolved": "https://registry.npmjs.org/core-js-compat/-/core-js-compat-3.50.0.tgz",
      "integrity": "sha512-XGpFGbMLHwSt74YLTKho7Ib242qi6O8MSX+sRokV4oz7iKXvQWGYZthjIhjRGMxjzVkAubBO512dKGYcefmX3Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "browserslist": "^4.28.7"
      },
      "engines": {
        "node": ">=6.4.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/core-js"
      }
    },
    "node_modules/cross-spawn": {
      "version": "7.0.6",
      "resolved": "https://registry.npmjs.org/cross-spawn/-/cross-spawn-7.0.6.tgz",
      "integrity": "sha512-uV2QOWP2nWzsy2aMp8aRibhi9dlzF5Hgh5SHaB9OiTGEyDTiJJyx0uy51QXdyWbtAHNua4XJzUKca3OzKUd3vA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "path-key": "^3.1.0",
        "shebang-command": "^2.0.0",
        "which": "^2.0.1"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/crypto-random-string": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/crypto-random-string/-/crypto-random-string-2.0.0.tgz",
      "integrity": "sha512-v1plID3y9r/lPhviJ1wrXpLeyUIGAZ2SHNYTEapm7/8A9nLPoyvVp3RK/EPFqn5kEznyWgYZNsRtYYIWbuG8KA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/csstype": {
      "version": "3.2.3",
      "resolved": "https://registry.npmjs.org/csstype/-/csstype-3.2.3.tgz",
      "integrity": "sha512-z1HGKcYy2xA8AGQfwrn0PAy+PB7X/GSj3UVJW9qKyn43xWa+gl5nXmU4qqLMRzWVLFC8KusUX8T/0kCiOYpAIQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/data-uri-to-buffer": {
      "version": "4.0.1",
      "resolved": "https://registry.npmjs.org/data-uri-to-buffer/-/data-uri-to-buffer-4.0.1.tgz",
      "integrity": "sha512-0R9ikRb668HB7QDxT1vkpuUBtqc53YyAwMwGeUFKRojY/NWKvdZ+9UYtRfGmhqNbRkTSVpMbmyhXipFFv2cb/A==",
      "license": "MIT",
      "engines": {
        "node": ">= 12"
      }
    },
    "node_modules/data-view-buffer": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/data-view-buffer/-/data-view-buffer-1.0.2.tgz",
      "integrity": "sha512-EmKO5V3OLXh1rtK2wgXRansaK1/mtVdTUEiEI0W8RkvgT05kfxaH29PliLnpLP73yYO6142Q72QNa8Wx/A5CqQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3",
        "es-errors": "^1.3.0",
        "is-data-view": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/data-view-byte-length": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/data-view-byte-length/-/data-view-byte-length-1.0.2.tgz",
      "integrity": "sha512-tuhGbE6CfTM9+5ANGf+oQb72Ky/0+s3xKUpHvShfiz2RxMFgFPjsXuRLBVMtvMs15awe45SRb83D6wH4ew6wlQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3",
        "es-errors": "^1.3.0",
        "is-data-view": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/inspect-js"
      }
    },
    "node_modules/data-view-byte-offset": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/data-view-byte-offset/-/data-view-byte-offset-1.0.1.tgz",
      "integrity": "sha512-BS8PfmtDGnrgYdOonGZQdLZslWIeCGFP9tpan0hi1Co2Zr2NKADsvGYA8XxuG/4UWgJ6Cjtv+YJnB6MM69QGlQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "es-errors": "^1.3.0",
        "is-data-view": "^1.0.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/debug": {
      "version": "4.4.3",
      "resolved": "https://registry.npmjs.org/debug/-/debug-4.4.3.tgz",
      "integrity": "sha512-RGwwWnwQvkVfavKVt22FGLw+xYSdzARwm0ru6DhTVA3umU5hZc28V3kO4stgYryrTlLpuvgI9GiijltAjNbcqA==",
      "license": "MIT",
      "dependencies": {
        "ms": "^2.1.3"
      },
      "engines": {
        "node": ">=6.0"
      },
      "peerDependenciesMeta": {
        "supports-color": {
          "optional": true
        }
      }
    },
    "node_modules/deepmerge": {
      "version": "4.3.1",
      "resolved": "https://registry.npmjs.org/deepmerge/-/deepmerge-4.3.1.tgz",
      "integrity": "sha512-3sUqbMEc77XqpdNO7FRyRog+eW3ph+GYCbj+rK+uYyRMuwsVy0rMiVtPn+QJlKFvWP/1PYpapqYn0Me2knFn+A==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/define-data-property": {
      "version": "1.1.4",
      "resolved": "https://registry.npmjs.org/define-data-property/-/define-data-property-1.1.4.tgz",
      "integrity": "sha512-rBMvIzlpA8v6E+SJZoo++HAYqsLrkg7MSfIinMPFhmkorw7X+dOXVJQs+QT69zGkzMyfDnIMN2Wid1+NbL3T+A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-define-property": "^1.0.0",
        "es-errors": "^1.3.0",
        "gopd": "^1.0.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/define-properties": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/define-properties/-/define-properties-1.2.1.tgz",
      "integrity": "sha512-8QmQKqEASLd5nx0U1B1okLElbUuuttJ/AnYmRXbbbGDWh6uS208EjD4Xqq/I9wK7u0v6O08XhTWnt5XtEbR6Dg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "define-data-property": "^1.0.1",
        "has-property-descriptors": "^1.0.0",
        "object-keys": "^1.1.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/depd": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/depd/-/depd-2.0.0.tgz",
      "integrity": "sha512-g7nH6P6dyDioJogAAGprGpCtVImJhpPk/roCzdb3fIh61/s/nPsfR6onyMwkCAR/OlC3yBC0lESvUoQEAssIrw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/detect-libc": {
      "version": "2.1.2",
      "resolved": "https://registry.npmjs.org/detect-libc/-/detect-libc-2.1.2.tgz",
      "integrity": "sha512-Btj2BOOO83o3WyH59e8MgXsxEQVcarkUOpEYrubB0urwnN10yQ364rsiByU11nZlqWYZm05i/of7io4mzihBtQ==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/dexie": {
      "version": "4.4.6",
      "resolved": "https://registry.npmjs.org/dexie/-/dexie-4.4.6.tgz",
      "integrity": "sha512-hJP/BO6mjB+tX6hToIO1kmxYLNmun90wYbfcoAoLpKEyDYal/k33dg0TAfoUe2TDsbbLoVIzljJ3BN2UbR5EOg==",
      "license": "Apache-2.0"
    },
    "node_modules/dunder-proto": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/dunder-proto/-/dunder-proto-1.0.1.tgz",
      "integrity": "sha512-KIN/nDJBQRcXw0MLVhZE9iQHmG68qAVIBg9CqmUYjmQIhgij9U5MFvrqkUL5FbtyyzZuOeOt0zdeRe4UY7ct+A==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.1",
        "es-errors": "^1.3.0",
        "gopd": "^1.2.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/ecdsa-sig-formatter": {
      "version": "1.0.11",
      "resolved": "https://registry.npmjs.org/ecdsa-sig-formatter/-/ecdsa-sig-formatter-1.0.11.tgz",
      "integrity": "sha512-nagl3RYrbNv6kQkeJIpt6NJZy8twLB/2vtz6yN9Z4vRKHN4/QZJIEbqohALSgwKdnksuY3k5Addp5lg8sVoVcQ==",
      "license": "Apache-2.0",
      "dependencies": {
        "safe-buffer": "^5.0.1"
      }
    },
    "node_modules/edge-runtime": {
      "version": "2.5.9",
      "resolved": "https://registry.npmjs.org/edge-runtime/-/edge-runtime-2.5.9.tgz",
      "integrity": "sha512-pk+k0oK0PVXdlT4oRp4lwh+unuKB7Ng4iZ2HB+EZ7QCEQizX360Rp/F4aRpgpRgdP2ufB35N+1KppHmYjqIGSg==",
      "dev": true,
      "license": "MPL-2.0",
      "dependencies": {
        "@edge-runtime/format": "2.2.1",
        "@edge-runtime/ponyfill": "2.4.2",
        "@edge-runtime/vm": "3.2.0",
        "async-listen": "3.0.1",
        "mri": "1.2.0",
        "picocolors": "1.0.0",
        "pretty-ms": "7.0.1",
        "signal-exit": "4.0.2",
        "time-span": "4.0.0"
      },
      "bin": {
        "edge-runtime": "dist/cli/index.js"
      },
      "engines": {
        "node": ">=16"
      }
    },
    "node_modules/edge-runtime/node_modules/async-listen": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/async-listen/-/async-listen-3.0.1.tgz",
      "integrity": "sha512-cWMaNwUJnf37C/S5TfCkk/15MwbPRwVYALA2jtjkbHjCmAPiDXyNJy2q3p1KAZzDLHAWyarUWSujUoHR4pEgrA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 14"
      }
    },
    "node_modules/edge-runtime/node_modules/picocolors": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.0.0.tgz",
      "integrity": "sha512-1fygroTLlHu66zi26VoTDv8yRgm0Fccecssto+MhsZ0D/DGW2sm8E8AjW7NU5VVTRt5GxbeZ5qBuJr+HyLYkjQ==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/edge-runtime/node_modules/signal-exit": {
      "version": "4.0.2",
      "resolved": "https://registry.npmjs.org/signal-exit/-/signal-exit-4.0.2.tgz",
      "integrity": "sha512-MY2/qGx4enyjprQnFaZsHib3Yadh3IXyV2C321GY0pjGfVBu4un0uDJkwgdxqO+Rdx8JMT8IfJIRwbYVz3Ob3Q==",
      "dev": true,
      "license": "ISC",
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/ee-first": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/ee-first/-/ee-first-1.1.1.tgz",
      "integrity": "sha512-WMwm9LhRUo+WUaRN+vRuETqG89IgZphVSNkdFgeb6sS/E4OrDIN7t48CAewSHXc6C8lefD8KKfr5vY61brQlow==",
      "license": "MIT"
    },
    "node_modules/ejs": {
      "version": "3.1.10",
      "resolved": "https://registry.npmjs.org/ejs/-/ejs-3.1.10.tgz",
      "integrity": "sha512-UeJmFfOrAQS8OJWPZ4qtgHyWExa088/MtK5UEyoJGFH67cDEXkZSviOiKRCZ4Xij0zxI3JECgYs3oKx+AizQBA==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "jake": "^10.8.5"
      },
      "bin": {
        "ejs": "bin/cli.js"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/electron-to-chromium": {
      "version": "1.5.431",
      "resolved": "https://registry.npmjs.org/electron-to-chromium/-/electron-to-chromium-1.5.431.tgz",
      "integrity": "sha512-AAVihz2YwJeOdAynX8MUtqpvjY0gaiARp/7+r4kwqgzqXMrfG1qDN7vwT80uxAoOQRPcZH8t73EI+CA/1OJN8A==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/encodeurl": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/encodeurl/-/encodeurl-2.0.0.tgz",
      "integrity": "sha512-Q0n9HRi4m6JuGIV1eFlmvJB7ZEVxu93IrMyiMsGC0lrMJMWzRgx6WGquyfQgZVb31vhGgXnfmPNNXmxnOkRBrg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/es-abstract": {
      "version": "1.24.2",
      "resolved": "https://registry.npmjs.org/es-abstract/-/es-abstract-1.24.2.tgz",
      "integrity": "sha512-2FpH9Q5i2RRwyEP1AylXe6nYLR5OhaJTZwmlcP0dL/+JCbgg7yyEo/sEK6HeGZRf3dFpWwThaRHVApXSkW3xeg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "array-buffer-byte-length": "^1.0.2",
        "arraybuffer.prototype.slice": "^1.0.4",
        "available-typed-arrays": "^1.0.7",
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.4",
        "data-view-buffer": "^1.0.2",
        "data-view-byte-length": "^1.0.2",
        "data-view-byte-offset": "^1.0.1",
        "es-define-property": "^1.0.1",
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.1.1",
        "es-set-tostringtag": "^2.1.0",
        "es-to-primitive": "^1.3.0",
        "function.prototype.name": "^1.1.8",
        "get-intrinsic": "^1.3.0",
        "get-proto": "^1.0.1",
        "get-symbol-description": "^1.1.0",
        "globalthis": "^1.0.4",
        "gopd": "^1.2.0",
        "has-property-descriptors": "^1.0.2",
        "has-proto": "^1.2.0",
        "has-symbols": "^1.1.0",
        "hasown": "^2.0.2",
        "internal-slot": "^1.1.0",
        "is-array-buffer": "^3.0.5",
        "is-callable": "^1.2.7",
        "is-data-view": "^1.0.2",
        "is-negative-zero": "^2.0.3",
        "is-regex": "^1.2.1",
        "is-set": "^2.0.3",
        "is-shared-array-buffer": "^1.0.4",
        "is-string": "^1.1.1",
        "is-typed-array": "^1.1.15",
        "is-weakref": "^1.1.1",
        "math-intrinsics": "^1.1.0",
        "object-inspect": "^1.13.4",
        "object-keys": "^1.1.1",
        "object.assign": "^4.1.7",
        "own-keys": "^1.0.1",
        "regexp.prototype.flags": "^1.5.4",
        "safe-array-concat": "^1.1.3",
        "safe-push-apply": "^1.0.0",
        "safe-regex-test": "^1.1.0",
        "set-proto": "^1.0.0",
        "stop-iteration-iterator": "^1.1.0",
        "string.prototype.trim": "^1.2.10",
        "string.prototype.trimend": "^1.0.9",
        "string.prototype.trimstart": "^1.0.8",
        "typed-array-buffer": "^1.0.3",
        "typed-array-byte-length": "^1.0.3",
        "typed-array-byte-offset": "^1.0.4",
        "typed-array-length": "^1.0.7",
        "unbox-primitive": "^1.1.0",
        "which-typed-array": "^1.1.19"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/es-abstract-get": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/es-abstract-get/-/es-abstract-get-1.0.0.tgz",
      "integrity": "sha512-6PMWXpdhshVvFp+FoWYs1EvG1Nj0tvk0dZM+XcK0xMEM1czRVcP6ohqPWHy6qPagSpC8j4+p89WXlT+xXJs/fg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.1.2",
        "is-callable": "^1.2.7",
        "object-inspect": "^1.13.4"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/es-define-property": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/es-define-property/-/es-define-property-1.0.1.tgz",
      "integrity": "sha512-e3nRfgfUZ4rNGL232gUgX06QNyyez04KdjFrF+LTRoOXmrOgFKDg4BCdsjW8EnT69eqdYGmRpJwiPVYNrCaW3g==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-errors": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/es-errors/-/es-errors-1.3.0.tgz",
      "integrity": "sha512-Zf5H2Kxt2xjTvbJvP2ZWLEICxA6j+hAmMzIlypy4xcBg1vKVnx89Wy0GbS+kf5cwCVFFzdCFh2XSCFNULS6csw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-module-lexer": {
      "version": "1.4.1",
      "resolved": "https://registry.npmjs.org/es-module-lexer/-/es-module-lexer-1.4.1.tgz",
      "integrity": "sha512-cXLGjP0c4T3flZJKQSuziYoq7MlT+rnvfZjfp7h+I7K9BNX54kP9nyWvdbwjQ4u1iWbOL4u96fgeZLToQlZC7w==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/es-object-atoms": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/es-object-atoms/-/es-object-atoms-1.1.2.tgz",
      "integrity": "sha512-HWcBoN6NileqtSydK2FqHbS/LoDd2pqrnQHLyJzBj4kOp/ky2MWMN694xOfkK8/SnUsW2DH7EfyVlydKCsm1Zw==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-set-tostringtag": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/es-set-tostringtag/-/es-set-tostringtag-2.1.0.tgz",
      "integrity": "sha512-j6vWzfrGVfyXxge+O0x5sh6cvxAog0a/4Rdd2K36zCMV5eJ+/+tOAngRO8cODMNWbVRdVlmGZQL2YS3yR8bIUA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.6",
        "has-tostringtag": "^1.0.2",
        "hasown": "^2.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-to-primitive": {
      "version": "1.3.4",
      "resolved": "https://registry.npmjs.org/es-to-primitive/-/es-to-primitive-1.3.4.tgz",
      "integrity": "sha512-yPDz7wqpg1/mmHLmS3tcfTfbw5f1eryXvyghYBffGdERwe+mV7ZcWzTR8LR17Kvqt3qfPurjlonmnq3MKXIOXw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-abstract-get": "^1.0.0",
        "es-define-property": "^1.0.1",
        "es-errors": "^1.3.0",
        "is-callable": "^1.2.7",
        "is-date-object": "^1.1.0",
        "is-symbol": "^1.1.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/esbuild": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.28.2.tgz",
      "integrity": "sha512-HKVLS8dvII+xoKW9kmqxbRKrnWEXfJJr/FZhhJmiqIB0e053QNYFqOBouTMO/k5sID4MvCiUCvv8b9M4h32wIA==",
      "hasInstallScript": true,
      "license": "MIT",
      "bin": {
        "esbuild": "bin/esbuild"
      },
      "engines": {
        "node": ">=18"
      },
      "optionalDependencies": {
        "@esbuild/aix-ppc64": "0.28.2",
        "@esbuild/android-arm": "0.28.2",
        "@esbuild/android-arm64": "0.28.2",
        "@esbuild/android-x64": "0.28.2",
        "@esbuild/darwin-arm64": "0.28.2",
        "@esbuild/darwin-x64": "0.28.2",
        "@esbuild/freebsd-arm64": "0.28.2",
        "@esbuild/freebsd-x64": "0.28.2",
        "@esbuild/linux-arm": "0.28.2",
        "@esbuild/linux-arm64": "0.28.2",
        "@esbuild/linux-ia32": "0.28.2",
        "@esbuild/linux-loong64": "0.28.2",
        "@esbuild/linux-mips64el": "0.28.2",
        "@esbuild/linux-ppc64": "0.28.2",
        "@esbuild/linux-riscv64": "0.28.2",
        "@esbuild/linux-s390x": "0.28.2",
        "@esbuild/linux-x64": "0.28.2",
        "@esbuild/netbsd-arm64": "0.28.2",
        "@esbuild/netbsd-x64": "0.28.2",
        "@esbuild/openbsd-arm64": "0.28.2",
        "@esbuild/openbsd-x64": "0.28.2",
        "@esbuild/openharmony-arm64": "0.28.2",
        "@esbuild/sunos-x64": "0.28.2",
        "@esbuild/win32-arm64": "0.28.2",
        "@esbuild/win32-ia32": "0.28.2",
        "@esbuild/win32-x64": "0.28.2"
      }
    },
    "node_modules/esbuild/node_modules/@esbuild/aix-ppc64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.28.2.tgz",
      "integrity": "sha512-XExcO+dvLKvVtNTibSTBej1NCAbaGhWn9Ww1ZPx80qsahhPFe/8jgWP0IchNe0F3HwkU7n8ejhH8bjonqht8mQ==",
      "cpu": [
        "ppc64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "aix"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/esbuild/node_modules/@esbuild/android-arm": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.28.2.tgz",
      "integrity": "sha512-kXXoiPVVGQcnIYGOeaovwOURpniDBpSq4A03qkQ+BMQqtGG6HYap3xne9C1O1yo4TR3qxlCX5IqqmX6fFo2Lqg==",
      "cpu": [
        "arm"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/esbuild/node_modules/@esbuild/android-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.28.2.tgz",
      "integrity": "sha512-5YfKeeI8qWfBZIX+u2xZC3Zlb3Os/gLS2sbEKM+I4ZOcsWmHS2WLysCcQZDAFRslDUU5Oiq44gf6PYN1vGwG5A==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/esbuild/node_modules/@esbuild/android-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.28.2.tgz",
      "integrity": "sha512-O387ite7SzUyCcy3JQX4P4bLtEA7bLLkx+esve5JHnyYfNTxcVpXZo9jhdB0lTKN44gztELTdU7nS8Nr16Fs1Q==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/esbuild/node_modules/@esbuild/darwin-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.28.2.tgz",
      "integrity": "sha512-n4KqkOQrraxHJcgjM1RvwbigfQKIKJVpM7xp+KsxiyUSrRdIXnt73VhrPAx0fV44hgfmIVKjxMN9J1t5jySVkw==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/esbuild/node_modules/@esbuild/darwin-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.28.2.tgz",
      "integrity": "sha512-uq6suIWYP37qzGddBKPw5QEQPi6HiLGsO7UmkpfyaYNQ3D+rN6w6WfwH+nuqcGXWvawGwxOEroO4YGnFh95azw==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/esbuild/node_modules/@esbuild/freebsd-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.28.2.tgz",
      "integrity": "sha512-n+I0BTSRIoy+d6RPKnEVwql5UwBJolytvY4mAOIEJorKlqgPII8ix6slVVrfZ5Tnj7glIZvloylbB/EJPMWEXw==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/esbuild/node_modules/@esbuild/freebsd-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.28.2.tgz",
      "integrity": "sha512-78XJTJkvPs0kz2w61301PJjXl4g7q3JqiYMZ/M/yVI73EHBrCRTgkhu9oqG7vPqq+a/yadEW8aD+agKlk5xrmg==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/esbuild/node_modules/@esbuild/linux-arm": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.28.2.tgz",
      "integrity": "sha512-XlDnu2q5yoqems+xay6wSAcg9DDD7K9RLKZEBOMZm3ckNpJBvOX20tSfby8KfrrhINDyv9V2YVZKY/SpoGJI8w==",
      "cpu": [
        "arm"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/esbuild/node_modules/@esbuild/linux-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.28.2.tgz",
      "integrity": "sha512-pW4AC0P3it8c7do9MVM4p51FzHzdM/TZrerurgRcHJ2WTa1VQ1CIq18xncfpBJw4ojkiZZrKW2yIBWBP92j6Ug==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/esbuild/node_modules/@esbuild/linux-ia32": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.28.2.tgz",
      "integrity": "sha512-CYbnj78HsIeA+DhgUKgFCfvNsTHFhMMrinUrMZpDXJXKN8T3XViTZ/+wtHeVxEWY8ewSzTFN+nRmSwO2tZaLUQ==",
      "cpu": [
        "ia32"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/esbuild/node_modules/@esbuild/linux-loong64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.28.2.tgz",
      "integrity": "sha512-buwkd8nsph4R+ajRvw0qM5Hja/TXQow3ptzWO2EbG/cqcIkHloRrdlBtQlshyYGTNFvfkfJ5tpPLVkY4DtsPfQ==",
      "cpu": [
        "loong64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/esbuild/node_modules/@esbuild/linux-mips64el": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.28.2.tgz",
      "integrity": "sha512-ZVykbDyk7519VwiNb9Lcj9m8XM6v5V9uKPvrEMkkEedVewf+0itkhahp4HDpgERXhwLRpWFypsGbG/J8s0QjJA==",
      "cpu": [
        "mips64el"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/esbuild/node_modules/@esbuild/linux-ppc64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.28.2.tgz",
      "integrity": "sha512-CAXl+Dtd9UUuJd8pKKdwh6MLm3MUMiqMPmhZ3tTSXPqfyQ3vDl6R5hZdZ/kYojK4ofXtdfSv1tFq8XzWx3heNQ==",
      "cpu": [
        "ppc64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/esbuild/node_modules/@esbuild/linux-riscv64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.28.2.tgz",
      "integrity": "sha512-GeXCej4IQtU1B+QlDV8W/RRvbzI3O/Stss+/bCXv4lZls5WGRtu2a+3JkA3i4qIUlMXpcHebWpF8AkJhATowuA==",
      "cpu": [
        "riscv64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/esbuild/node_modules/@esbuild/linux-s390x": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.28.2.tgz",
      "integrity": "sha512-3H1weTYZPxt/WOhByszQZybS9w5lKzUn1FDMsgEChbHWQwHYQQRfBxgCcZvPhjHfKyJjIievvMmEUawJrdY9Dg==",
      "cpu": [
        "s390x"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/esbuild/node_modules/@esbuild/netbsd-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-arm64/-/netbsd-arm64-0.28.2.tgz",
      "integrity": "sha512-sSATRjPeDBg3pdgHoQfoYBob11Kk1FGa9lui5RIHZCoCkJa9QKlvl3/vKz2usCmYYjs7ymJR/2Nnsqe+Hjt5nw==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/esbuild/node_modules/@esbuild/netbsd-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.28.2.tgz",
      "integrity": "sha512-lqnzCV+mM0gIADaKihiCg6ifgfU2L3h5E33rNQBN1Y4MaVGnzryzmvvf7UHxprpQdE8hpqLolJ9Rl+SkIRDpyw==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/esbuild/node_modules/@esbuild/openbsd-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-arm64/-/openbsd-arm64-0.28.2.tgz",
      "integrity": "sha512-AL2qJILH7lNjrDmCQDvdxMfAUIv8KMNZOvrwAQ8i8//ntL9FflhOyMJ8OZSMBb8/AWXe3/5v5S20y3zCoZWKoQ==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/esbuild/node_modules/@esbuild/openbsd-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.28.2.tgz",
      "integrity": "sha512-QtiuPytchRyC4rwUKhexJdQKvDuZ6hWloi3igqPQNUJCS1/v9EiO3UTOXR6A3FoMo4fnAKbWJdqaIwhOzh8qEw==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/esbuild/node_modules/@esbuild/openharmony-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/openharmony-arm64/-/openharmony-arm64-0.28.2.tgz",
      "integrity": "sha512-WkhYDmpTjLvGlScA1rwjRUmhl4k8oXR3cIbtqWmELgU/dFeHHlEllxDvdWcNJV9rbzCexB5vz8gtNewWLgCT7Q==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/esbuild/node_modules/@esbuild/sunos-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.28.2.tgz",
      "integrity": "sha512-GPMSkTOtMnv2U2F8gxe4Io6qmVs+YKyp832Etqqxr0hFngmXQ3rzwytelm3GIn7T4VviRUlf3sOgBOiTdvaf7g==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "sunos"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/esbuild/node_modules/@esbuild/win32-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.28.2.tgz",
      "integrity": "sha512-PIhhEkE9uPBleRBrQEJpUn7MBnibZzbGzYWPmY3x+YoVg/95zbjB4CxPPOQ8l5tYYM4mMaCthF8/1DIfBQQyWQ==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/esbuild/node_modules/@esbuild/win32-ia32": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.28.2.tgz",
      "integrity": "sha512-YmJbfTlvU7Sdn9BB+4PRES4oB6pxgS37MAONj+hBr/cpXS1aBPKXxNnDbu+QCWPj0o9dgyxeq79g6c5P8KeuYA==",
      "cpu": [
        "ia32"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/esbuild/node_modules/@esbuild/win32-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.28.2.tgz",
      "integrity": "sha512-5ebpxr3nWMzrL/rnUI755Jkuee0bHL/Gq0WTF9lvcpv73wAp5eu8MfBUgWK9bhWvZjj7yX8etf/8tI8Ney695g==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/escalade": {
      "version": "3.2.0",
      "resolved": "https://registry.npmjs.org/escalade/-/escalade-3.2.0.tgz",
      "integrity": "sha512-WUj2qlxaQtO4g6Pq5c29GTcWGDyd8itL8zTlipgECz3JesAiiOKotd8JU6otB3PACgG6xkJUyVhboMS+bje/jA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/escape-html": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/escape-html/-/escape-html-1.0.3.tgz",
      "integrity": "sha512-NiSupZ4OeuGwr68lGIeym/ksIZMJodUGOSCZ/FSnTxcrekbvqrgdUxlJOMpijaKZVjAJrWrGs/6Jy8OMuyj9ow==",
      "license": "MIT"
    },
    "node_modules/estree-walker": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/estree-walker/-/estree-walker-2.0.2.tgz",
      "integrity": "sha512-Rfkk/Mp/DL7JVje3u18FxFujQlTNR2q6QfMSMB7AvCBx91NGj/ba3kCfza0f6dVDbw7YlRf/nDrn7pQrCCyQ/w==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/esutils": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/esutils/-/esutils-2.0.3.tgz",
      "integrity": "sha512-kVscqXk4OCp68SZ0dkgEKVi6/8ij300KBWTJq32P/dYeWTSwK41WyTxalN1eRmA5Z9UU/LX9D7FWSmV9SAYx6g==",
      "dev": true,
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/eta": {
      "version": "4.6.0",
      "resolved": "https://registry.npmjs.org/eta/-/eta-4.6.0.tgz",
      "integrity": "sha512-lW6is4T1NFOYnmqGZIfvixqj7A7sSvScF+DN8EK6K58xI5MZ5UvYe0GjopxOXQtZvUn4eDdVuZ8XSoYWTMEKwA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=20"
      },
      "funding": {
        "url": "https://github.com/bgub/eta?sponsor=1"
      }
    },
    "node_modules/etag": {
      "version": "1.8.1",
      "resolved": "https://registry.npmjs.org/etag/-/etag-1.8.1.tgz",
      "integrity": "sha512-aIL5Fx7mawVa300al2BnEE4iNvo1qETxLrPI/o05L7z6go7fCw1J6EQmbK4FmJ2AS7kgVF/KEZWufBfdClMcPg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/express": {
      "version": "5.2.1",
      "resolved": "https://registry.npmjs.org/express/-/express-5.2.1.tgz",
      "integrity": "sha512-hIS4idWWai69NezIdRt2xFVofaF4j+6INOpJlVOLDO8zXGpUVEVzIYk12UUi2JzjEzWL3IOAxcTubgz9Po0yXw==",
      "license": "MIT",
      "dependencies": {
        "accepts": "^2.0.0",
        "body-parser": "^2.2.1",
        "content-disposition": "^1.0.0",
        "content-type": "^1.0.5",
        "cookie": "^0.7.1",
        "cookie-signature": "^1.2.1",
        "debug": "^4.4.0",
        "depd": "^2.0.0",
        "encodeurl": "^2.0.0",
        "escape-html": "^1.0.3",
        "etag": "^1.8.1",
        "finalhandler": "^2.1.0",
        "fresh": "^2.0.0",
        "http-errors": "^2.0.0",
        "merge-descriptors": "^2.0.0",
        "mime-types": "^3.0.0",
        "on-finished": "^2.4.1",
        "once": "^1.4.0",
        "parseurl": "^1.3.3",
        "proxy-addr": "^2.0.7",
        "qs": "^6.14.0",
        "range-parser": "^1.2.1",
        "router": "^2.2.0",
        "send": "^1.1.0",
        "serve-static": "^2.2.0",
        "statuses": "^2.0.1",
        "type-is": "^2.0.1",
        "vary": "^1.1.2"
      },
      "engines": {
        "node": ">= 18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/express/node_modules/cookie": {
      "version": "0.7.2",
      "resolved": "https://registry.npmjs.org/cookie/-/cookie-0.7.2.tgz",
      "integrity": "sha512-yki5XnKuf750l50uGTllt6kKILY4nQ1eNIQatoXEByZ5dWgnKqbnqmTrBE5B4N7lrMJKQ2ytWMiTO2o0v6Ew/w==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/extend": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/extend/-/extend-3.0.2.tgz",
      "integrity": "sha512-fjquC59cD7CyW6urNXK0FBufkZcoiGG80wTuPujX590cB5Ttln20E2UB4S/WARVqhXffZl2LNgS+gQdPIIim/g==",
      "license": "MIT"
    },
    "node_modules/fake-indexeddb": {
      "version": "6.2.5",
      "resolved": "https://registry.npmjs.org/fake-indexeddb/-/fake-indexeddb-6.2.5.tgz",
      "integrity": "sha512-CGnyrvbhPlWYMngksqrSSUT1BAVP49dZocrHuK0SvtR0D5TMs5wP0o3j7jexDJW01KSadjBp1M/71o/KR3nD1w==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/fast-deep-equal": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/fast-deep-equal/-/fast-deep-equal-3.1.3.tgz",
      "integrity": "sha512-f3qQ9oQy9j2AhBe/H9VC91wLmKBCCU/gDOnKNAYG5hswO7BLKj09Hc5HYNz9cGI++xlpDCIgDaitVs03ATR84Q==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/fast-glob": {
      "version": "3.3.3",
      "resolved": "https://registry.npmjs.org/fast-glob/-/fast-glob-3.3.3.tgz",
      "integrity": "sha512-7MptL8U0cqcFdzIzwOTHoilX9x5BrNqye7Z/LuC7kCMRio1EMSyqRK3BEAUD7sXRq4iT4AzTVuZdhgQ2TCvYLg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@nodelib/fs.stat": "^2.0.2",
        "@nodelib/fs.walk": "^1.2.3",
        "glob-parent": "^5.1.2",
        "merge2": "^1.3.0",
        "micromatch": "^4.0.8"
      },
      "engines": {
        "node": ">=8.6.0"
      }
    },
    "node_modules/fast-json-stable-stringify": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/fast-json-stable-stringify/-/fast-json-stable-stringify-2.1.0.tgz",
      "integrity": "sha512-lhd/wF+Lk98HZoTCtlVraHtfh5XYijIjalXck7saUtuanSDyLMxnHhSXEDJqHxD7msR8D0uCmqlkwjCV8xvwHw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/fast-uri": {
      "version": "3.1.8",
      "resolved": "https://registry.npmjs.org/fast-uri/-/fast-uri-3.1.8.tgz",
      "integrity": "sha512-GZMtZUTNRpOVIECoXwLNZS5xUGE+mVNbTB8h/7Rwh2TFWcBQiPzTgyZi05BF9UMZKkLJv8XBRJTlU7zg8+ZfMg==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/fastify"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/fastify"
        }
      ],
      "license": "BSD-3-Clause"
    },
    "node_modules/fastq": {
      "version": "1.20.3",
      "resolved": "https://registry.npmjs.org/fastq/-/fastq-1.20.3.tgz",
      "integrity": "sha512-XKv5nnLs6nLF71NgiKJLIZFLkPyIEuOselLG7ujZnGrRfQK8HpvY+WqKhAJUAdLomwVHErVS4LfxFlPq0/FTAw==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "reusify": "^1.0.4"
      }
    },
    "node_modules/fdir": {
      "version": "6.5.0",
      "resolved": "https://registry.npmjs.org/fdir/-/fdir-6.5.0.tgz",
      "integrity": "sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12.0.0"
      },
      "peerDependencies": {
        "picomatch": "^3 || ^4"
      },
      "peerDependenciesMeta": {
        "picomatch": {
          "optional": true
        }
      }
    },
    "node_modules/fetch-blob": {
      "version": "3.2.0",
      "resolved": "https://registry.npmjs.org/fetch-blob/-/fetch-blob-3.2.0.tgz",
      "integrity": "sha512-7yAQpD2UMJzLi1Dqv7qFYnPbaPx7ZfFK6PiIxQ4PfkGPyNyl2Ugx+a/umUonmKqjhM4DnfbMvdX6otXq83soQQ==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/jimmywarting"
        },
        {
          "type": "paypal",
          "url": "https://paypal.me/jimmywarting"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "node-domexception": "^1.0.0",
        "web-streams-polyfill": "^3.0.3"
      },
      "engines": {
        "node": "^12.20 || >= 14.13"
      }
    },
    "node_modules/file-uri-to-path": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/file-uri-to-path/-/file-uri-to-path-1.0.0.tgz",
      "integrity": "sha512-0Zt+s3L7Vf1biwWZ29aARiVYLx7iMGnEUl9x33fbB/j3jR81u/O2LbqK+Bm1CDSNDKVtJ/YjwY7TUd5SkeLQLw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/filelist": {
      "version": "1.0.6",
      "resolved": "https://registry.npmjs.org/filelist/-/filelist-1.0.6.tgz",
      "integrity": "sha512-5giy2PkLYY1cP39p17Ech+2xlpTRL9HLspOfEgm0L6CwBXBTgsK5ou0JtzYuepxkaQ/tvhCFIJ5uXo0OrM2DxA==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "minimatch": "^5.0.1"
      }
    },
    "node_modules/filelist/node_modules/balanced-match": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/balanced-match/-/balanced-match-1.0.2.tgz",
      "integrity": "sha512-3oSeUO0TMV67hN1AmbXsK4yaqU7tjiHlbxRDZOpH0KW9+CeX4bRAaX0Anxt0tx2MrpRpWwQaPwIlISEJhYU5Pw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/filelist/node_modules/brace-expansion": {
      "version": "2.1.7",
      "resolved": "https://registry.npmjs.org/brace-expansion/-/brace-expansion-2.1.7.tgz",
      "integrity": "sha512-uZbew1NqdmPDTMJ8ah1y+b+9QEJrfkXFk3RcTQw3X0jW/xRUvFKsg1CfQdSYGdTbXZWExtU3J3ccxtnfw1Fi0g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "balanced-match": "^1.0.0"
      }
    },
    "node_modules/filelist/node_modules/minimatch": {
      "version": "5.1.9",
      "resolved": "https://registry.npmjs.org/minimatch/-/minimatch-5.1.9.tgz",
      "integrity": "sha512-7o1wEA2RyMP7Iu7GNba9vc0RWWGACJOCZBJX2GJWip0ikV+wcOsgVuY9uE8CPiyQhkGFSlhuSkZPavN7u1c2Fw==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "brace-expansion": "^2.0.1"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/fill-range": {
      "version": "7.1.1",
      "resolved": "https://registry.npmjs.org/fill-range/-/fill-range-7.1.1.tgz",
      "integrity": "sha512-YsGpe3WHLK8ZYi4tWDg2Jy3ebRz2rXowDxnld4bkQB00cc/1Zw9AWnC0i9ztDJitivtQvaI9KaLyKrc+hBW0yg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "to-regex-range": "^5.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/finalhandler": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/finalhandler/-/finalhandler-2.1.1.tgz",
      "integrity": "sha512-S8KoZgRZN+a5rNwqTxlZZePjT/4cnm0ROV70LedRHZ0p8u9fRID0hJUZQpkKLzro8LfmC8sx23bY6tVNxv8pQA==",
      "license": "MIT",
      "dependencies": {
        "debug": "^4.4.0",
        "encodeurl": "^2.0.0",
        "escape-html": "^1.0.3",
        "on-finished": "^2.4.1",
        "parseurl": "^1.3.3",
        "statuses": "^2.0.1"
      },
      "engines": {
        "node": ">= 18.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/flexsearch": {
      "version": "0.8.212",
      "resolved": "https://registry.npmjs.org/flexsearch/-/flexsearch-0.8.212.tgz",
      "integrity": "sha512-wSyJr1GUWoOOIISRu+X2IXiOcVfg9qqBRyCPRUdLMIGJqPzMo+jMRlvE83t14v1j0dRMEaBbER/adQjp6Du2pw==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/ts-thomas"
        },
        {
          "type": "paypal",
          "url": "https://www.paypal.com/donate/?hosted_button_id=GEVR88FC9BWRW"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/flexsearch"
        },
        {
          "type": "patreon",
          "url": "https://patreon.com/user?u=96245532"
        },
        {
          "type": "liberapay",
          "url": "https://liberapay.com/ts-thomas"
        }
      ],
      "license": "Apache-2.0"
    },
    "node_modules/for-each": {
      "version": "0.3.5",
      "resolved": "https://registry.npmjs.org/for-each/-/for-each-0.3.5.tgz",
      "integrity": "sha512-dKx12eRCVIzqCxFGplyFKJMPvLEWgmNtUrpTiJIR5u97zEhRG8ySrtboPHZXx7daLxQVrl643cTzbab2tkQjxg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-callable": "^1.2.7"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/foreground-child": {
      "version": "3.3.1",
      "resolved": "https://registry.npmjs.org/foreground-child/-/foreground-child-3.3.1.tgz",
      "integrity": "sha512-gIXjKqtFuWEgzFRJA9WCQeSJLZDjgJUOMCMzxtvFq/37KojM1BFGufqsCy0r4qSQmYLsZYMeyRqzIWOMup03sw==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "cross-spawn": "^7.0.6",
        "signal-exit": "^4.0.1"
      },
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/formdata-polyfill": {
      "version": "4.0.10",
      "resolved": "https://registry.npmjs.org/formdata-polyfill/-/formdata-polyfill-4.0.10.tgz",
      "integrity": "sha512-buewHzMvYL29jdeQTVILecSaZKnt/RJWjoZCF5OW60Z67/GmSLBkOFM7qh1PI3zFNtJbaZL5eQu1vLfazOwj4g==",
      "license": "MIT",
      "dependencies": {
        "fetch-blob": "^3.1.2"
      },
      "engines": {
        "node": ">=12.20.0"
      }
    },
    "node_modules/forwarded": {
      "version": "0.2.0",
      "resolved": "https://registry.npmjs.org/forwarded/-/forwarded-0.2.0.tgz",
      "integrity": "sha512-buRG0fpBtRHSTCOASe6hD258tEubFoRLb4ZNA6NxMVHNw2gOcwHo9wyablzMzOA5z9xA9L1KNjk/Nt6MT9aYow==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/fresh": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/fresh/-/fresh-2.0.0.tgz",
      "integrity": "sha512-Rx/WycZ60HOaqLKAi6cHRKKI7zxWbJ31MhntmtwMoaTeF7XFH9hhBp8vITaMidfljRQ6eYWCKkaTK+ykVJHP2A==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/fs-extra": {
      "version": "9.1.0",
      "resolved": "https://registry.npmjs.org/fs-extra/-/fs-extra-9.1.0.tgz",
      "integrity": "sha512-hcg3ZmepS30/7BSFqRvoo3DOMQu7IjqxO5nCDt+zM9XWjb33Wg7ziNT+Qvqbuc3+gWpzO02JubVyk2G4Zvo1OQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "at-least-node": "^1.0.0",
        "graceful-fs": "^4.2.0",
        "jsonfile": "^6.0.1",
        "universalify": "^2.0.0"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/fsevents": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/function-bind": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/function-bind/-/function-bind-1.1.2.tgz",
      "integrity": "sha512-7XHNxH7qX9xG5mIwxkhumTox/MIRNcOgDrxWsMt2pAr23WHp6MrRlN7FBSFpCpr+oVO0F744iUgR82nJMfG2SA==",
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/function.prototype.name": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/function.prototype.name/-/function.prototype.name-1.2.0.tgz",
      "integrity": "sha512-jObKIik1P2QjPHP5nz5BaOtUlfgS0fWo8IUByNXkM+o+02sJOi94em77GwJKQSJ3gfPHdgzLNrHc1uokV4P/ew==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.9",
        "call-bound": "^1.0.4",
        "es-define-property": "^1.0.1",
        "es-errors": "^1.3.0",
        "functions-have-names": "^1.2.3",
        "has-property-descriptors": "^1.0.2",
        "hasown": "^2.0.4",
        "is-callable": "^1.2.7",
        "is-document.all": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/functions-have-names": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/functions-have-names/-/functions-have-names-1.2.3.tgz",
      "integrity": "sha512-xckBUXyTIqT97tq2x2AMb+g163b5JFysYk0x4qxNFwbfQkmNZoiRHb6sPzI9/QV33WeuvVYBUIiD4NzNIyqaRQ==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/gaxios": {
      "version": "7.3.1",
      "resolved": "https://registry.npmjs.org/gaxios/-/gaxios-7.3.1.tgz",
      "integrity": "sha512-kB3rzJV7d9juLZh8/56QTXCwQfxyhdOMdyYk1HdQKFtF8TJTDTZQJtixWIwXdE9Jji91mC41DUNpjleo4L4eAQ==",
      "license": "Apache-2.0",
      "dependencies": {
        "extend": "^3.0.2",
        "https-proxy-agent": "^7.0.1",
        "node-fetch": "^3.3.2"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/gcp-metadata": {
      "version": "8.1.2",
      "resolved": "https://registry.npmjs.org/gcp-metadata/-/gcp-metadata-8.1.2.tgz",
      "integrity": "sha512-zV/5HKTfCeKWnxG0Dmrw51hEWFGfcF2xiXqcA3+J90WDuP0SvoiSO5ORvcBsifmx/FoIjgQN3oNOGaQ5PhLFkg==",
      "license": "Apache-2.0",
      "dependencies": {
        "gaxios": "^7.0.0",
        "google-logging-utils": "^1.0.0",
        "json-bigint": "^1.0.0"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/generator-function": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/generator-function/-/generator-function-2.0.1.tgz",
      "integrity": "sha512-SFdFmIJi+ybC0vjlHN0ZGVGHc3lgE0DxPAT0djjVg+kjOnSqclqmj0KQ7ykTOLP6YxoqOvuAODGdcHJn+43q3g==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/gensync": {
      "version": "1.0.0-beta.2",
      "resolved": "https://registry.npmjs.org/gensync/-/gensync-1.0.0-beta.2.tgz",
      "integrity": "sha512-3hN7NaskYvMDLQY55gnW3NQ+mesEAepTqlg+VEbj7zzqEMBVNhzcGYYeqFo/TlYz6eQiFcp1HcsCZO+nGgS8zg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/get-intrinsic": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/get-intrinsic/-/get-intrinsic-1.3.0.tgz",
      "integrity": "sha512-9fSjSaos/fRIVIp+xSJlE6lfwhES7LNtKaCBIamHsjr2na1BiABJPo0mOjjz8GJDURarmCPGqaiVg5mfjb98CQ==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.2",
        "es-define-property": "^1.0.1",
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.1.1",
        "function-bind": "^1.1.2",
        "get-proto": "^1.0.1",
        "gopd": "^1.2.0",
        "has-symbols": "^1.1.0",
        "hasown": "^2.0.2",
        "math-intrinsics": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/get-own-enumerable-property-symbols": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/get-own-enumerable-property-symbols/-/get-own-enumerable-property-symbols-3.0.2.tgz",
      "integrity": "sha512-I0UBV/XOz1XkIJHEUDMZAbzCThU/H8DxmSfmdGcKPnVhu2VfFqr34jr9777IyaTYvxjedWhqVIilEDsCdP5G6g==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/get-proto": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/get-proto/-/get-proto-1.0.1.tgz",
      "integrity": "sha512-sTSfBjoXBp89JvIKIefqw7U2CCebsc74kiY6awiGogKtoSGbgjYE/G/+l9sF3MWFPNc9IcoOC4ODfKHfxFmp0g==",
      "license": "MIT",
      "dependencies": {
        "dunder-proto": "^1.0.1",
        "es-object-atoms": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/get-symbol-description": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/get-symbol-description/-/get-symbol-description-1.1.0.tgz",
      "integrity": "sha512-w9UMqWwJxHNOvoNzSJ2oPF5wvYcvP7jUvYzhp67yEhTi17ZDBBC1z9pTdGuzjD+EFIqLSYRweZjqfiPzQ06Ebg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3",
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.6"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/get-tsconfig": {
      "version": "4.14.3",
      "resolved": "https://registry.npmjs.org/get-tsconfig/-/get-tsconfig-4.14.3.tgz",
      "integrity": "sha512-++QEw4DIY7WGoukz+/+A/8dGYPT9l9yIadnmSgZ8Rjr3YVSVDipQSO9CdnJo9ePqFqUUqh+wk9uIaoiAwsiPkA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "resolve-pkg-maps": "^1.0.0"
      },
      "funding": {
        "url": "https://github.com/privatenumber/get-tsconfig?sponsor=1"
      }
    },
    "node_modules/glob": {
      "version": "11.1.0",
      "resolved": "https://registry.npmjs.org/glob/-/glob-11.1.0.tgz",
      "integrity": "sha512-vuNwKSaKiqm7g0THUBu2x7ckSs3XJLXE+2ssL7/MfTGPLLcrJQ/4Uq1CjPTtO5cCIiRxqvN6Twy1qOwhL0Xjcw==",
      "deprecated": "Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me",
      "dev": true,
      "license": "BlueOak-1.0.0",
      "dependencies": {
        "foreground-child": "^3.3.1",
        "jackspeak": "^4.1.1",
        "minimatch": "^10.1.1",
        "minipass": "^7.1.2",
        "package-json-from-dist": "^1.0.0",
        "path-scurry": "^2.0.0"
      },
      "bin": {
        "glob": "dist/esm/bin.mjs"
      },
      "engines": {
        "node": "20 || >=22"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/glob-parent": {
      "version": "5.1.2",
      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-5.1.2.tgz",
      "integrity": "sha512-AOIgSQCepiJYwP3ARnGx+5VnTu2HBYdzbGP45eLw1vr3zB3vZLeyed1sC9hnbcOc9/SrMyM5RPQrkGz4aS9Zow==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "is-glob": "^4.0.1"
      },
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/globalthis": {
      "version": "1.0.4",
      "resolved": "https://registry.npmjs.org/globalthis/-/globalthis-1.0.4.tgz",
      "integrity": "sha512-DpLKbNU4WylpxJykQujfCcwYWiV/Jhm50Goo0wrVILAv5jOr9d+H+UR3PhSCD2rCCEIg0uc+G+muBTwD54JhDQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "define-properties": "^1.2.1",
        "gopd": "^1.0.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/google-auth-library": {
      "version": "10.9.1",
      "resolved": "https://registry.npmjs.org/google-auth-library/-/google-auth-library-10.9.1.tgz",
      "integrity": "sha512-i1ydyHrqcIxXkWh/uBmVkzCvIuq5yiK2ATndIe5XxKholrG/MTYP9xGYka4sQhrbIAgGjL2B6NOE7rFaiF3fXw==",
      "license": "Apache-2.0",
      "dependencies": {
        "base64-js": "^1.3.0",
        "ecdsa-sig-formatter": "^1.0.11",
        "gaxios": "^7.1.4",
        "gcp-metadata": "8.1.2",
        "google-logging-utils": "1.1.3",
        "jws": "^4.0.0"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/google-logging-utils": {
      "version": "1.1.3",
      "resolved": "https://registry.npmjs.org/google-logging-utils/-/google-logging-utils-1.1.3.tgz",
      "integrity": "sha512-eAmLkjDjAFCVXg7A1unxHsLf961m6y17QFqXqAXGj/gVkKFrEICfStRfwUlGNfeCEjNRa32JEWOUTlYXPyyKvA==",
      "license": "Apache-2.0",
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/gopd": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/gopd/-/gopd-1.2.0.tgz",
      "integrity": "sha512-ZUKRh6/kUFoAiTAtTYPZJ3hw9wNxx+BIBOijnlG9PnrJsCcSjs1wyyD6vJpaYtgnzDrKYRSqf3OO6Rfa93xsRg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/graceful-fs": {
      "version": "4.2.11",
      "resolved": "https://registry.npmjs.org/graceful-fs/-/graceful-fs-4.2.11.tgz",
      "integrity": "sha512-RbJ5/jmFcNNCcDV5o9eTnBLJ/HszWV0P73bc+Ff4nS/rJj+YaS6IGyiOL0VoBYX+l1Wrl3k63h/KrH+nhJ0XvQ==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/has-bigints": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/has-bigints/-/has-bigints-1.1.0.tgz",
      "integrity": "sha512-R3pbpkcIqv2Pm3dUwgjclDRVmWpTJW2DcMzcIhEXEx1oh/CEMObMm3KLmRJOdvhM7o4uQBnwr8pzRK2sJWIqfg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/has-property-descriptors": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/has-property-descriptors/-/has-property-descriptors-1.0.2.tgz",
      "integrity": "sha512-55JNKuIW+vq4Ke1BjOTjM2YctQIvCT7GFzHwmfZPGo5wnrgkid0YQtnAleFSqumZm4az3n2BS+erby5ipJdgrg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-define-property": "^1.0.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/has-proto": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/has-proto/-/has-proto-1.2.0.tgz",
      "integrity": "sha512-KIL7eQPfHQRC8+XluaIw7BHUwwqL19bQn4hzNgdr+1wXoU0KKj6rufu47lhY7KbJR2C6T6+PfyN0Ea7wkSS+qQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "dunder-proto": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/has-symbols": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/has-symbols/-/has-symbols-1.1.0.tgz",
      "integrity": "sha512-1cDNdwJ2Jaohmb3sg4OmKaMBwuC48sYni5HUw2DvsC8LjGTLK9h+eb1X6RyuOHe4hT0ULCW68iomhjUoKUqlPQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/has-tostringtag": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/has-tostringtag/-/has-tostringtag-1.0.2.tgz",
      "integrity": "sha512-NqADB8VjPFLM2V0VvHUewwwsw0ZWBaIdgo+ieHtK3hasLz4qeCRjYcqfB6AQrBggRKppKF8L52/VqdVsO47Dlw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "has-symbols": "^1.0.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/hasown": {
      "version": "2.0.4",
      "resolved": "https://registry.npmjs.org/hasown/-/hasown-2.0.4.tgz",
      "integrity": "sha512-T2UbfbBEF32wiepXIsMlTW9+dDYC6wMh/t/vYA4tuOMKqWz/n3vr1NFSxQiyP+zk2mXsoMA/i/7qV6LKut1t1A==",
      "license": "MIT",
      "dependencies": {
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/http-errors": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/http-errors/-/http-errors-2.0.1.tgz",
      "integrity": "sha512-4FbRdAX+bSdmo4AUFuS0WNiPz8NgFt+r8ThgNWmlrjQjt1Q7ZR9+zTlce2859x4KSXrwIsaeTqDoKQmtP8pLmQ==",
      "license": "MIT",
      "dependencies": {
        "depd": "~2.0.0",
        "inherits": "~2.0.4",
        "setprototypeof": "~1.2.0",
        "statuses": "~2.0.2",
        "toidentifier": "~1.0.1"
      },
      "engines": {
        "node": ">= 0.8"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/https-proxy-agent": {
      "version": "7.0.6",
      "resolved": "https://registry.npmjs.org/https-proxy-agent/-/https-proxy-agent-7.0.6.tgz",
      "integrity": "sha512-vK9P5/iUfdl95AI+JVyUuIcVtd4ofvtrOr3HNtM2yxC9bnMbEdp3x01OhQNnjb8IJYi38VlTE3mBXwcfvywuSw==",
      "license": "MIT",
      "dependencies": {
        "agent-base": "^7.1.2",
        "debug": "4"
      },
      "engines": {
        "node": ">= 14"
      }
    },
    "node_modules/iconv-lite": {
      "version": "0.7.3",
      "resolved": "https://registry.npmjs.org/iconv-lite/-/iconv-lite-0.7.3.tgz",
      "integrity": "sha512-IKXpvIzjnC9XTAUbVBcMfGS0EPaIXtW6v+zr+RRp+hqULEpo0owZax6wyRwPOJbWbzjYspQwusTsfVr0ifh4uQ==",
      "license": "MIT",
      "dependencies": {
        "safer-buffer": ">= 2.1.2 < 3.0.0"
      },
      "engines": {
        "node": ">=0.10.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/idb": {
      "version": "7.1.1",
      "resolved": "https://registry.npmjs.org/idb/-/idb-7.1.1.tgz",
      "integrity": "sha512-gchesWBzyvGHRO9W8tzUWFDycow5gwjvFKfyV9FF32Y7F50yZMp7mP+T2mJIWFx49zicqyC4uefHM17o6xKIVQ==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/inherits": {
      "version": "2.0.4",
      "resolved": "https://registry.npmjs.org/inherits/-/inherits-2.0.4.tgz",
      "integrity": "sha512-k/vGaX4/Yla3WzyMCvTQOXYeIHvqOKtnqBduzTHpzpQZzAskKMhZ2K+EnBiSM9zGSoIFeMpXKxa4dYeZIQqewQ==",
      "license": "ISC"
    },
    "node_modules/internal-slot": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/internal-slot/-/internal-slot-1.1.0.tgz",
      "integrity": "sha512-4gd7VpWNQNB4UKKCFFVcp1AVv+FMOgs9NKzjHKusc8jTMhd5eL1NqQqOpE0KzMds804/yHlglp3uxgluOqAPLw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "hasown": "^2.0.2",
        "side-channel": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/ipaddr.js": {
      "version": "1.9.1",
      "resolved": "https://registry.npmjs.org/ipaddr.js/-/ipaddr.js-1.9.1.tgz",
      "integrity": "sha512-0KI/607xoxSToH7GjN1FfSbLoU0+btTicjsQSWQlh/hZykN8KpmMf7uYwPW3R+akZ6R/w18ZlXSHBYXiYUPO3g==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.10"
      }
    },
    "node_modules/is-array-buffer": {
      "version": "3.0.5",
      "resolved": "https://registry.npmjs.org/is-array-buffer/-/is-array-buffer-3.0.5.tgz",
      "integrity": "sha512-DDfANUiiG2wC1qawP66qlTugJeL5HyzMpfr8lLK+jMQirGzNod0B12cFB/9q838Ru27sBwfw78/rdoU7RERz6A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.3",
        "get-intrinsic": "^1.2.6"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-async-function": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/is-async-function/-/is-async-function-2.1.1.tgz",
      "integrity": "sha512-9dgM/cZBnNvjzaMYHVoxxfPj2QXt22Ev7SuuPrs+xav0ukGB0S6d4ydZdEiM48kLx5kDV+QBPrpVnFyefL8kkQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "async-function": "^1.0.0",
        "call-bound": "^1.0.3",
        "get-proto": "^1.0.1",
        "has-tostringtag": "^1.0.2",
        "safe-regex-test": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-bigint": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/is-bigint/-/is-bigint-1.1.0.tgz",
      "integrity": "sha512-n4ZT37wG78iz03xPRKJrHTdZbe3IicyucEtdRsV5yglwc3GyUfbAfpSeD0FJ41NbUNSt5wbhqfp1fS+BgnvDFQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "has-bigints": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-boolean-object": {
      "version": "1.2.2",
      "resolved": "https://registry.npmjs.org/is-boolean-object/-/is-boolean-object-1.2.2.tgz",
      "integrity": "sha512-wa56o2/ElJMYqjCjGkXri7it5FbebW5usLw/nPmCMs5DeZ7eziSYZhSmPRn0txqeW4LnAmQQU7FgqLpsEFKM4A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3",
        "has-tostringtag": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-callable": {
      "version": "1.2.7",
      "resolved": "https://registry.npmjs.org/is-callable/-/is-callable-1.2.7.tgz",
      "integrity": "sha512-1BC0BVFhS/p0qtw6enp8e+8OD0UrK0oFLztSjNzhcKA3WDuJxxAPXzPuPtKkjEY9UUoEWlX/8fgKeu2S8i9JTA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-core-module": {
      "version": "2.17.0",
      "resolved": "https://registry.npmjs.org/is-core-module/-/is-core-module-2.17.0.tgz",
      "integrity": "sha512-J/vG0zBCbIKOQFfufSwyXdMrsohyJIUNkrnmo6WZGzoM7tr/lsbfW5b2BvisL6zsyMzK9UxV9L6c7AoFbyXHOA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "hasown": "^2.0.4"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-data-view": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/is-data-view/-/is-data-view-1.0.2.tgz",
      "integrity": "sha512-RKtWF8pGmS87i2D6gqQu/l7EYRlVdfzemCJN/P3UOs//x1QE7mfhvzHIApBTRf7axvT6DMGwSwBXYCT0nfB9xw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "get-intrinsic": "^1.2.6",
        "is-typed-array": "^1.1.13"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-date-object": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/is-date-object/-/is-date-object-1.1.0.tgz",
      "integrity": "sha512-PwwhEakHVKTdRNVOw+/Gyh0+MzlCl4R6qKvkhuvLtPMggI1WAHt9sOwZxQLSGpUaDnrdyDsomoRgNnCfKNSXXg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "has-tostringtag": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-document.all": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/is-document.all/-/is-document.all-1.0.0.tgz",
      "integrity": "sha512-+XSoyS05OdBbhFuELhgTCpFNHkpBOJqtsZfUFFpe5QTw+9Sjbh8zitxhQkYAo6wV7e1Vb8cAPvpCk9jGam/82g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.4"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-extglob": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/is-extglob/-/is-extglob-2.1.1.tgz",
      "integrity": "sha512-SbKbANkN603Vi4jEZv49LeVJMn4yGwsbzZworEoyEiutsN3nJYdbO36zfhGJ6QEDpOZIFkDtnq5JRxmvl3jsoQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/is-finalizationregistry": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/is-finalizationregistry/-/is-finalizationregistry-1.1.1.tgz",
      "integrity": "sha512-1pC6N8qWJbWoPtEjgcL2xyhQOP491EQjeUo3qTKcmV8YSDDJrOepfG8pcC7h/QgnQHYSv0mJ3Z/ZWxmatVrysg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-generator-function": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/is-generator-function/-/is-generator-function-1.1.2.tgz",
      "integrity": "sha512-upqt1SkGkODW9tsGNG5mtXTXtECizwtS2kA161M+gJPc1xdb/Ax629af6YrTwcOeQHbewrPNlE5Dx7kzvXTizA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.4",
        "generator-function": "^2.0.0",
        "get-proto": "^1.0.1",
        "has-tostringtag": "^1.0.2",
        "safe-regex-test": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-glob": {
      "version": "4.0.3",
      "resolved": "https://registry.npmjs.org/is-glob/-/is-glob-4.0.3.tgz",
      "integrity": "sha512-xelSayHH36ZgE7ZWhli7pW34hNbNl8Ojv5KVmkJD4hBdD3th8Tfk9vYasLM+mXWOZhFkgZfxhLSnrwRr4elSSg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-extglob": "^2.1.1"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/is-map": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/is-map/-/is-map-2.0.3.tgz",
      "integrity": "sha512-1Qed0/Hr2m+YqxnM09CjA2d/i6YZNfF6R2oRAOj36eUdS6qIV/huPJNSEpKbupewFs+ZsJlxsjjPbc0/afW6Lw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-module": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/is-module/-/is-module-1.0.0.tgz",
      "integrity": "sha512-51ypPSPCoTEIN9dy5Oy+h4pShgJmPCygKfyRCISBI+JoWT/2oJvK8QPxmwv7b/p239jXrm9M1mlQbyKJ5A152g==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/is-negative-zero": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/is-negative-zero/-/is-negative-zero-2.0.3.tgz",
      "integrity": "sha512-5KoIu2Ngpyek75jXodFvnafB6DJgr3u8uuK0LEZJjrU19DrMD3EVERaR8sjz8CCGgpZvxPl9SuE1GMVPFHx1mw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-number": {
      "version": "7.0.0",
      "resolved": "https://registry.npmjs.org/is-number/-/is-number-7.0.0.tgz",
      "integrity": "sha512-41Cifkg6e8TylSpdtTpeLVMqvSBEVzTttHvERD741+pnZ8ANv0004MRL43QKPDlK9cGvNp6NZWZUBlbGXYxxng==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.12.0"
      }
    },
    "node_modules/is-number-object": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/is-number-object/-/is-number-object-1.1.1.tgz",
      "integrity": "sha512-lZhclumE1G6VYD8VHe35wFaIif+CTy5SJIi5+3y4psDgWu4wPDoBhF8NxUOinEc7pHgiTsT6MaBb92rKhhD+Xw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3",
        "has-tostringtag": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-obj": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/is-obj/-/is-obj-1.0.1.tgz",
      "integrity": "sha512-l4RyHgRqGN4Y3+9JHVrNqO+tN0rV5My76uW5/nuO4K1b6vw5G8d/cmFjP9tRfEsdhZNt0IFdZuK/c2Vr4Nb+Qg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/is-promise": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/is-promise/-/is-promise-4.0.0.tgz",
      "integrity": "sha512-hvpoI6korhJMnej285dSg6nu1+e6uxs7zG3BYAm5byqDsgJNWwxzM6z6iZiAgQR4TJ30JmBTOwqZUw3WlyH3AQ==",
      "license": "MIT"
    },
    "node_modules/is-regex": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/is-regex/-/is-regex-1.2.1.tgz",
      "integrity": "sha512-MjYsKHO5O7mCsmRGxWcLWheFqN9DJ/2TmngvjKXihe6efViPqc274+Fx/4fYj/r03+ESvBdTXK0V6tA3rgez1g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "gopd": "^1.2.0",
        "has-tostringtag": "^1.0.2",
        "hasown": "^2.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-regexp": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/is-regexp/-/is-regexp-1.0.0.tgz",
      "integrity": "sha512-7zjFAPO4/gwyQAAgRRmqeEeyIICSdmCqa3tsVHMdBzaXXRiqopZL4Cyghg/XulGWrtABTpbnYYzzIRffLkP4oA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/is-set": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/is-set/-/is-set-2.0.3.tgz",
      "integrity": "sha512-iPAjerrse27/ygGLxw+EBR9agv9Y6uLeYVJMu+QNCoouJ1/1ri0mGrcWpfCqFZuzzx3WjtwxG098X+n4OuRkPg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-shared-array-buffer": {
      "version": "1.0.4",
      "resolved": "https://registry.npmjs.org/is-shared-array-buffer/-/is-shared-array-buffer-1.0.4.tgz",
      "integrity": "sha512-ISWac8drv4ZGfwKl5slpHG9OwPNty4jOWPRIhBpxOoD+hqITiwuipOQ2bNthAzwA3B4fIjO4Nln74N0S9byq8A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-stream": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/is-stream/-/is-stream-2.0.1.tgz",
      "integrity": "sha512-hFoiJiTl63nn+kstHGBtewWSKnQLpyb155KHheA1l39uvtO9nWIop1p3udqPcUd/xbF1VLMO4n7OI6p7RbngDg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/is-string": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/is-string/-/is-string-1.1.1.tgz",
      "integrity": "sha512-BtEeSsoaQjlSPBemMQIrY1MY0uM6vnS1g5fmufYOtnxLGUZM2178PKbhsk7Ffv58IX+ZtcvoGwccYsh0PglkAA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3",
        "has-tostringtag": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-symbol": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/is-symbol/-/is-symbol-1.1.1.tgz",
      "integrity": "sha512-9gGx6GTtCQM73BgmHQXfDmLtfjjTUDSyoxTCbp5WtoixAhfgsDirWIcVQ/IHpvI5Vgd5i/J5F7B9cN/WlVbC/w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "has-symbols": "^1.1.0",
        "safe-regex-test": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-typed-array": {
      "version": "1.1.15",
      "resolved": "https://registry.npmjs.org/is-typed-array/-/is-typed-array-1.1.15.tgz",
      "integrity": "sha512-p3EcsicXjit7SaskXHs1hA91QxgTw46Fv6EFKKGS5DRFLD8yKnohjF3hxoju94b/OcMZoQukzpPpBE9uLVKzgQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "which-typed-array": "^1.1.16"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-weakmap": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/is-weakmap/-/is-weakmap-2.0.2.tgz",
      "integrity": "sha512-K5pXYOm9wqY1RgjpL3YTkF39tni1XajUIkawTLUo9EZEVUFga5gSQJF8nNS7ZwJQ02y+1YCNYcMh+HIf1ZqE+w==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-weakref": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/is-weakref/-/is-weakref-1.1.1.tgz",
      "integrity": "sha512-6i9mGWSlqzNMEqpCp93KwRS1uUOodk2OJ6b+sq7ZPDSy2WuI5NFIxp/254TytR8ftefexkWn5xNiHUNpPOfSew==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-weakset": {
      "version": "2.0.4",
      "resolved": "https://registry.npmjs.org/is-weakset/-/is-weakset-2.0.4.tgz",
      "integrity": "sha512-mfcwb6IzQyOKTs84CQMrOwW4gQcaTOAWJ0zzJCl2WSPDrWk/OzDaImWFH3djXhb24g4eudZfLRozAvPGw4d9hQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3",
        "get-intrinsic": "^1.2.6"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/isarray": {
      "version": "2.0.5",
      "resolved": "https://registry.npmjs.org/isarray/-/isarray-2.0.5.tgz",
      "integrity": "sha512-xHjhDr3cNBK0BzdUJSPXZntQUx/mwMS5Rw4A7lPJ90XGAO6ISP/ePDNuo0vhqOZU+UD5JoodwCAAoZQd3FeAKw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/isexe": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/isexe/-/isexe-2.0.0.tgz",
      "integrity": "sha512-RHxMLp9lnKHGHRng9QFhRCMbYAcVpn69smSGcq3f36xjgVVWThj4qqLbTLlq7Ssj8B+fIQ1EuCEGI2lKsyQeIw==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/jackspeak": {
      "version": "4.2.3",
      "resolved": "https://registry.npmjs.org/jackspeak/-/jackspeak-4.2.3.tgz",
      "integrity": "sha512-ykkVRwrYvFm1nb2AJfKKYPr0emF6IiXDYUaFx4Zn9ZuIH7MrzEZ3sD5RlqGXNRpHtvUHJyOnCEFxOlNDtGo7wg==",
      "dev": true,
      "license": "BlueOak-1.0.0",
      "dependencies": {
        "@isaacs/cliui": "^9.0.0"
      },
      "engines": {
        "node": "20 || >=22"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/jake": {
      "version": "10.9.4",
      "resolved": "https://registry.npmjs.org/jake/-/jake-10.9.4.tgz",
      "integrity": "sha512-wpHYzhxiVQL+IV05BLE2Xn34zW1S223hvjtqk0+gsPrwd/8JNLXJgZZM/iPFsYc1xyphF+6M6EvdE5E9MBGkDA==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "async": "^3.2.6",
        "filelist": "^1.0.4",
        "picocolors": "^1.1.1"
      },
      "bin": {
        "jake": "bin/cli.js"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/js-tokens": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/js-tokens/-/js-tokens-4.0.0.tgz",
      "integrity": "sha512-RdJUflcE3cUzKiMqQgsCu06FPu9UdIJO0beYbPhHN4k6apgJtifcoCtT9bcxOpYBtpD2kCM6Sbzg4CausW/PKQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/jsesc": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/jsesc/-/jsesc-3.1.0.tgz",
      "integrity": "sha512-/sM3dO2FOzXjKQhJuo0Q173wf2KOo8t4I8vHy6lF9poUp7bKT0/NHE8fPX23PwfhnykfqnC2xRxOnVw5XuGIaA==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "jsesc": "bin/jsesc"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/json-bigint": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/json-bigint/-/json-bigint-1.0.0.tgz",
      "integrity": "sha512-SiPv/8VpZuWbvLSMtTDU8hEfrZWg/mH/nV/b4o0CYbSxu1UIQPLdwKOCIyLQX+VIPO5vrLX3i8qtqFyhdPSUSQ==",
      "license": "MIT",
      "dependencies": {
        "bignumber.js": "^9.0.0"
      }
    },
    "node_modules/json-schema-to-ts": {
      "version": "1.6.4",
      "resolved": "https://registry.npmjs.org/json-schema-to-ts/-/json-schema-to-ts-1.6.4.tgz",
      "integrity": "sha512-pR4yQ9DHz6itqswtHCm26mw45FSNfQ9rEQjosaZErhn5J3J2sIViQiz8rDaezjKAhFGpmsoczYVBgGHzFw/stA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/json-schema": "^7.0.6",
        "ts-toolbelt": "^6.15.5"
      }
    },
    "node_modules/json-schema-traverse": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/json-schema-traverse/-/json-schema-traverse-1.0.0.tgz",
      "integrity": "sha512-NM8/P9n3XjXhIZn1lLhkFaACTOURQXjWhV4BA/RnOv8xvgqtqpAX9IO4mRQxSx1Rlo4tqzeqb0sOlruaOy3dug==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/json5": {
      "version": "2.2.3",
      "resolved": "https://registry.npmjs.org/json5/-/json5-2.2.3.tgz",
      "integrity": "sha512-XmOWe7eyHYH14cLdVPoyg+GOH3rYX++KpzrylJwSW98t3Nk+U8XOl8FWKOgwtzdb8lXGf6zYwDUzeHMWfxasyg==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "json5": "lib/cli.js"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/jsonfile": {
      "version": "6.2.1",
      "resolved": "https://registry.npmjs.org/jsonfile/-/jsonfile-6.2.1.tgz",
      "integrity": "sha512-zwOTdL3rFQ/lRdBnntKVOX6k5cKJwEc1HdilT71BWEu7J41gXIB2MRp+vxduPSwZJPWBxEzv4yH1wYLJGUHX4Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "universalify": "^2.0.0"
      },
      "optionalDependencies": {
        "graceful-fs": "^4.1.6"
      }
    },
    "node_modules/jsonpointer": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/jsonpointer/-/jsonpointer-5.0.1.tgz",
      "integrity": "sha512-p/nXbhSEcu3pZRdkW1OfJhpsVtW1gd4Wa1fnQc9YLiTfAjn0312eMKimbdIQzuZl9aa9xUGaRlP9T/CJE/ditQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/jwa": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/jwa/-/jwa-2.0.1.tgz",
      "integrity": "sha512-hRF04fqJIP8Abbkq5NKGN0Bbr3JxlQ+qhZufXVr0DvujKy93ZCbXZMHDL4EOtodSbCWxOqR8MS1tXA5hwqCXDg==",
      "license": "MIT",
      "dependencies": {
        "buffer-equal-constant-time": "^1.0.1",
        "ecdsa-sig-formatter": "1.0.11",
        "safe-buffer": "^5.0.1"
      }
    },
    "node_modules/jws": {
      "version": "4.0.1",
      "resolved": "https://registry.npmjs.org/jws/-/jws-4.0.1.tgz",
      "integrity": "sha512-EKI/M/yqPncGUUh44xz0PxSidXFr/+r0pA70+gIYhjv+et7yxM+s29Y+VGDkovRofQem0fs7Uvf4+YmAdyRduA==",
      "license": "MIT",
      "dependencies": {
        "jwa": "^2.0.1",
        "safe-buffer": "^5.0.1"
      }
    },
    "node_modules/leven": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/leven/-/leven-3.1.0.tgz",
      "integrity": "sha512-qsda+H8jTaUaN/x5vzW2rzc+8Rw4TAQ/4KjB46IwK5VH+IlVeeeje/EoZRpiXvIqjFgK84QffqPztGI3VBLG1A==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/lightningcss": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss/-/lightningcss-1.33.0.tgz",
      "integrity": "sha512-WkUDrojuJs0xkgGf2udWxa3yGBRxPtxUkB79i6aCZLRgc7PM8fZe9TosfPDcvEpQZbuFASnHYmRLBLUbmLOIIA==",
      "dev": true,
      "license": "MPL-2.0",
      "dependencies": {
        "detect-libc": "^2.0.3"
      },
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      },
      "optionalDependencies": {
        "lightningcss-android-arm64": "1.33.0",
        "lightningcss-darwin-arm64": "1.33.0",
        "lightningcss-darwin-x64": "1.33.0",
        "lightningcss-freebsd-x64": "1.33.0",
        "lightningcss-linux-arm-gnueabihf": "1.33.0",
        "lightningcss-linux-arm64-gnu": "1.33.0",
        "lightningcss-linux-arm64-musl": "1.33.0",
        "lightningcss-linux-x64-gnu": "1.33.0",
        "lightningcss-linux-x64-musl": "1.33.0",
        "lightningcss-win32-arm64-msvc": "1.33.0",
        "lightningcss-win32-x64-msvc": "1.33.0"
      }
    },
    "node_modules/lightningcss-linux-x64-gnu": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-gnu/-/lightningcss-linux-x64-gnu-1.33.0.tgz",
      "integrity": "sha512-ar+Ju7LmcN0Jo4FpL4hpFybwNG9/3A/Br5KW2n2jyODg3MEZXaDYADdemoNS+BDNfMgKvylJLj4S5tyRActuAg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-x64-musl": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-musl/-/lightningcss-linux-x64-musl-1.33.0.tgz",
      "integrity": "sha512-RYiYbkokw0trfKqqzfF55lginwEPrD3OJDfTuJzFs1MK6iFnDenaz1fqLLtX4ITG3OktJQXOeTaw1awrBAlZPw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lodash.debounce": {
      "version": "4.0.8",
      "resolved": "https://registry.npmjs.org/lodash.debounce/-/lodash.debounce-4.0.8.tgz",
      "integrity": "sha512-FT1yDzDYEoYWhnSGnpE/4Kj1fLZkDFyqRb7fNt6FdYOSxlUWAtp42Eh6Wb0rGIv/m9Bgo7x4GhQbm5Ys4SG5ow==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/long": {
      "version": "5.3.2",
      "resolved": "https://registry.npmjs.org/long/-/long-5.3.2.tgz",
      "integrity": "sha512-mNAgZ1GmyNhD7AuqnTG3/VQ26o760+ZYBPKjPvugO8+nLbYfX6TVpJPseBvopbdY+qpZ/lKUnmEc1LeZYS3QAA==",
      "license": "Apache-2.0"
    },
    "node_modules/lru-cache": {
      "version": "5.1.1",
      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-5.1.1.tgz",
      "integrity": "sha512-KpNARQA3Iwv+jTA0utUVVbrh+Jlrr1Fv0e56GGzAFOXN7dk/FviaDW8LHmK52DlcH4WP2n6gI8vN1aesBFgo9w==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "yallist": "^3.0.2"
      }
    },
    "node_modules/magic-string": {
      "version": "0.30.21",
      "resolved": "https://registry.npmjs.org/magic-string/-/magic-string-0.30.21.tgz",
      "integrity": "sha512-vd2F4YUyEXKGcLHoq+TEyCjxueSeHnFxyyjNp80yg0XV4vUhnDer/lvvlqM/arB5bXQN5K2/3oinyCRyx8T2CQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.5.5"
      }
    },
    "node_modules/math-intrinsics": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/math-intrinsics/-/math-intrinsics-1.1.0.tgz",
      "integrity": "sha512-/IXtbwEk5HTPyEwyKX6hGkYXxM9nbj64B+ilVJnC/R6B0pH5G4V3b0pVbL7DBj4tkhBAppbQUlf6F6Xl9LHu1g==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/media-typer": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/media-typer/-/media-typer-1.1.1.tgz",
      "integrity": "sha512-yz3xRaG20c6/BOzvYoDaGtPmGscs7YivItZEEqe6GbwNfHuxu9YNmvnEkMzKldAGY4/80pRcQRZSEnhquk9XuQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/merge-descriptors": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/merge-descriptors/-/merge-descriptors-2.0.0.tgz",
      "integrity": "sha512-Snk314V5ayFLhp3fkUREub6WtjBfPdCPY1Ln8/8munuLuiYhsABgBVWsozAG+MWMbVEvcdcpbi9R7ww22l9Q3g==",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/merge2": {
      "version": "1.4.1",
      "resolved": "https://registry.npmjs.org/merge2/-/merge2-1.4.1.tgz",
      "integrity": "sha512-8q7VEgMJW4J8tcfVPy8g09NcQwZdbwFEqhe/WZkoIzjn/3TGDwtOCYtXGxA3O8tPzpczCCDgv+P2P5y00ZJOOg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/micromatch": {
      "version": "4.0.8",
      "resolved": "https://registry.npmjs.org/micromatch/-/micromatch-4.0.8.tgz",
      "integrity": "sha512-PXwfBhYu0hBCPw8Dn0E+WDYb7af3dSLVWKi3HGv84IdF4TyFoC0ysxFd0Goxw7nSv4T/PzEJQxsYsEiFCKo2BA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "braces": "^3.0.3",
        "picomatch": "^2.3.1"
      },
      "engines": {
        "node": ">=8.6"
      }
    },
    "node_modules/micromatch/node_modules/picomatch": {
      "version": "2.3.2",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-2.3.2.tgz",
      "integrity": "sha512-V7+vQEJ06Z+c5tSye8S+nHUfI51xoXIXjHQ99cQtKUkQqqO1kO/KCJUfZXuB47h/YBlDhah2H3hdUGXn8ie0oA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8.6"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/mime-db": {
      "version": "1.54.0",
      "resolved": "https://registry.npmjs.org/mime-db/-/mime-db-1.54.0.tgz",
      "integrity": "sha512-aU5EJuIN2WDemCcAp2vFBfp/m4EAhWJnUNSSw0ixs7/kXbd6Pg64EmwJkNdFhB8aWt1sH2CTXrLxo/iAGV3oPQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/mime-types": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/mime-types/-/mime-types-3.0.2.tgz",
      "integrity": "sha512-Lbgzdk0h4juoQ9fCKXW4by0UJqj+nOOrI9MJ1sSj4nI8aI2eo1qmvQEie4VD1glsS250n15LsWsYtCugiStS5A==",
      "license": "MIT",
      "dependencies": {
        "mime-db": "^1.54.0"
      },
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/minimatch": {
      "version": "10.2.6",
      "resolved": "https://registry.npmjs.org/minimatch/-/minimatch-10.2.6.tgz",
      "integrity": "sha512-vpLQEs+VLCr1nU0BXS07maYoFwlDAH0gngQuuttxIwutDFEMHq2blX+8vpgxDdK3J1PwjCJiep77OitTZ4Ll1A==",
      "dev": true,
      "license": "BlueOak-1.0.0",
      "dependencies": {
        "brace-expansion": "^5.0.8"
      },
      "engines": {
        "node": "18 || 20 || >=22"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/minipass": {
      "version": "7.1.3",
      "resolved": "https://registry.npmjs.org/minipass/-/minipass-7.1.3.tgz",
      "integrity": "sha512-tEBHqDnIoM/1rXME1zgka9g6Q2lcoCkxHLuc7ODJ5BxbP5d4c2Z5cGgtXAku59200Cx7diuHTOYfSBD8n6mm8A==",
      "dev": true,
      "license": "BlueOak-1.0.0",
      "engines": {
        "node": ">=16 || 14 >=14.17"
      }
    },
    "node_modules/minizlib": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/minizlib/-/minizlib-3.1.0.tgz",
      "integrity": "sha512-KZxYo1BUkWD2TVFLr0MQoM8vUUigWD3LlD83a/75BqC+4qE0Hb1Vo5v1FgcfaNXvfXzr+5EhQ6ing/CaBijTlw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "minipass": "^7.1.2"
      },
      "engines": {
        "node": ">= 18"
      }
    },
    "node_modules/mkdirp": {
      "version": "1.0.4",
      "resolved": "https://registry.npmjs.org/mkdirp/-/mkdirp-1.0.4.tgz",
      "integrity": "sha512-vVqVZQyf3WLx2Shd0qJ9xuvqgAyKPLAiqITEtqW0oIUjzo3PePDd6fW9iFz30ef7Ysp/oiWqbhszeGWW2T6Gzw==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "mkdirp": "bin/cmd.js"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/mri": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/mri/-/mri-1.2.0.tgz",
      "integrity": "sha512-tzzskb3bG8LvYGFF/mDTpq3jpI6Q9wc3LEmBaghu+DdCssd1FakN7Bc0hVNmEyGq1bq3RgfkCb3cmQLpNPOroA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/ms": {
      "version": "2.1.3",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",
      "integrity": "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==",
      "license": "MIT"
    },
    "node_modules/nanoid": {
      "version": "3.3.19",
      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.19.tgz",
      "integrity": "sha512-Y2tUNy4ouw6tq5oDSKeQYGOyhkUBhNOcGV/02KC+6kd9eDGqdZd++mjMiIDilrBYvjEnCYvVtsuHCuP+okSfug==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "bin": {
        "nanoid": "bin/nanoid.cjs"
      },
      "engines": {
        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
      }
    },
    "node_modules/negotiator": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/negotiator/-/negotiator-1.1.0.tgz",
      "integrity": "sha512-NMPBRMJgiQHjbd8phG3Vebdx4kZ1H121rbl5IkMqeOsahptB9BKo/d7oJ3zTXqTgagn2bWlNSXkh0QUGM31RYg==",
      "license": "MIT",
      "dependencies": {
        "content-type": "^2.1.0"
      },
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/negotiator/node_modules/content-type": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/content-type/-/content-type-2.1.0.tgz",
      "integrity": "sha512-mj7UPXE0jaqaOsukNZRUEfEi2AcL7C/vwmwcHV0O97eO1E1pxBZuyjlZrx5seTaNBg1U6+o35wpa35Qfcc+7ag==",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/node-domexception": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/node-domexception/-/node-domexception-1.0.0.tgz",
      "integrity": "sha512-/jKZoMpw0F8GRwl4/eLROPA3cfcXtLApP0QzLmUT/HuPCZWyB7IY9ZrMeKw2O/nFIqPQB3PVM9aYm0F312AXDQ==",
      "deprecated": "Use your platform's native DOMException instead",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/jimmywarting"
        },
        {
          "type": "github",
          "url": "https://paypal.me/jimmywarting"
        }
      ],
      "license": "MIT",
      "engines": {
        "node": ">=10.5.0"
      }
    },
    "node_modules/node-fetch": {
      "version": "3.3.2",
      "resolved": "https://registry.npmjs.org/node-fetch/-/node-fetch-3.3.2.tgz",
      "integrity": "sha512-dRB78srN/l6gqWulah9SrxeYnxeddIG30+GOqK/9OlLVyLg3HPnr6SqOWTWOXKRwC2eGYCkZ59NNuSgvSrpgOA==",
      "license": "MIT",
      "dependencies": {
        "data-uri-to-buffer": "^4.0.0",
        "fetch-blob": "^3.1.4",
        "formdata-polyfill": "^4.0.10"
      },
      "engines": {
        "node": "^12.20.0 || ^14.13.1 || >=16.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/node-fetch"
      }
    },
    "node_modules/node-gyp-build": {
      "version": "4.8.4",
      "resolved": "https://registry.npmjs.org/node-gyp-build/-/node-gyp-build-4.8.4.tgz",
      "integrity": "sha512-LA4ZjwlnUblHVgq0oBF3Jl/6h/Nvs5fzBLwdEF4nuxnFdsfajde4WfxtJr3CaiH+F6ewcIB/q4jQ4UzPyid+CQ==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "node-gyp-build": "bin.js",
        "node-gyp-build-optional": "optional.js",
        "node-gyp-build-test": "build-test.js"
      }
    },
    "node_modules/node-releases": {
      "version": "2.0.56",
      "resolved": "https://registry.npmjs.org/node-releases/-/node-releases-2.0.56.tgz",
      "integrity": "sha512-x0InOIyzgdk+eyaWaRJFH5snEtiImgBgblZ2CyPrLmqqcuMQkEvcDPHbzqbD8eDsSeJbVOjn+crzyzHaM4D+/A==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/nodemailer": {
      "version": "6.10.1",
      "resolved": "https://registry.npmjs.org/nodemailer/-/nodemailer-6.10.1.tgz",
      "integrity": "sha512-Z+iLaBGVaSjbIzQ4pX6XV41HrooLsQ10ZWPUehGmuantvzWoDVBnmsdUcOIDM1t+yPor5pDhVlDESgOMEGxhHA==",
      "license": "MIT-0",
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/nopt": {
      "version": "8.1.0",
      "resolved": "https://registry.npmjs.org/nopt/-/nopt-8.1.0.tgz",
      "integrity": "sha512-ieGu42u/Qsa4TFktmaKEwM6MQH0pOWnaB3htzh0JRtx84+Mebc0cbZYN5bC+6WTZ4+77xrL9Pn5m7CV6VIkV7A==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "abbrev": "^3.0.0"
      },
      "bin": {
        "nopt": "bin/nopt.js"
      },
      "engines": {
        "node": "^18.17.0 || >=20.5.0"
      }
    },
    "node_modules/object-inspect": {
      "version": "1.13.4",
      "resolved": "https://registry.npmjs.org/object-inspect/-/object-inspect-1.13.4.tgz",
      "integrity": "sha512-W67iLl4J2EXEGTbfeHCffrjDfitvLANg0UlX3wFUUSTx92KXRFegMHUVgSqE+wvhAbi4WqjGg9czysTV2Epbew==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/object-keys": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/object-keys/-/object-keys-1.1.1.tgz",
      "integrity": "sha512-NuAESUOUMrlIXOfHKzD6bpPu3tYt3xvjNdRIQ+FeT0lNb4K8WR70CaDxhuNguS2XG+GjkyMwOzsN5ZktImfhLA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/object.assign": {
      "version": "4.1.7",
      "resolved": "https://registry.npmjs.org/object.assign/-/object.assign-4.1.7.tgz",
      "integrity": "sha512-nK28WOo+QIjBkDduTINE4JkF/UJJKyf2EJxvJKfblDpyg0Q+pkOHNTL0Qwy6NP6FhE/EnzV73BxxqcJaXY9anw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.3",
        "define-properties": "^1.2.1",
        "es-object-atoms": "^1.0.0",
        "has-symbols": "^1.1.0",
        "object-keys": "^1.1.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/on-finished": {
      "version": "2.4.1",
      "resolved": "https://registry.npmjs.org/on-finished/-/on-finished-2.4.1.tgz",
      "integrity": "sha512-oVlzkg3ENAhCk2zdv7IJwd/QUD4z2RxRwpkcGY8psCVcCYZNq4wYnVWALHM+brtuJjePWiYF/ClmuDr8Ch5+kg==",
      "license": "MIT",
      "dependencies": {
        "ee-first": "1.1.1"
      },
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/once": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/once/-/once-1.4.0.tgz",
      "integrity": "sha512-lNaJgI+2Q5URQBkccEKHTQOPaXdUxnZZElQTZY0MFUAuaEqe1E+Nyvgdz/aIyNi6Z9MzO5dv1H8n58/GELp3+w==",
      "license": "ISC",
      "dependencies": {
        "wrappy": "1"
      }
    },
    "node_modules/own-keys": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/own-keys/-/own-keys-1.0.2.tgz",
      "integrity": "sha512-19YVAg7T+WTrxggPukVq7DjTv6+PJ867TmhCvBsYwmbFCsZd344rq2Ld1p0wo8f8Qrrhgp82c6FJRqdXWtSEhg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.4",
        "get-intrinsic": "^1.3.0",
        "object-keys": "^1.1.1",
        "safe-push-apply": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/oxlint": {
      "version": "1.83.0",
      "resolved": "https://registry.npmjs.org/oxlint/-/oxlint-1.83.0.tgz",
      "integrity": "sha512-cyDzSzaw3uzP0TeCeq3lLRPPoaUxkbB4ZOXj+kn+5r+BX9V+4bNVGk9lxer+WrgcpebH4JxLlJ3KQjveVztOLQ==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "oxlint": "bin/oxlint"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/oxc-project"
      },
      "optionalDependencies": {
        "@oxlint/binding-android-arm-eabi": "1.83.0",
        "@oxlint/binding-android-arm64": "1.83.0",
        "@oxlint/binding-darwin-arm64": "1.83.0",
        "@oxlint/binding-darwin-x64": "1.83.0",
        "@oxlint/binding-freebsd-x64": "1.83.0",
        "@oxlint/binding-linux-arm-gnueabihf": "1.83.0",
        "@oxlint/binding-linux-arm-musleabihf": "1.83.0",
        "@oxlint/binding-linux-arm64-gnu": "1.83.0",
        "@oxlint/binding-linux-arm64-musl": "1.83.0",
        "@oxlint/binding-linux-ppc64-gnu": "1.83.0",
        "@oxlint/binding-linux-riscv64-gnu": "1.83.0",
        "@oxlint/binding-linux-riscv64-musl": "1.83.0",
        "@oxlint/binding-linux-s390x-gnu": "1.83.0",
        "@oxlint/binding-linux-x64-gnu": "1.83.0",
        "@oxlint/binding-linux-x64-musl": "1.83.0",
        "@oxlint/binding-openharmony-arm64": "1.83.0",
        "@oxlint/binding-win32-arm64-msvc": "1.83.0",
        "@oxlint/binding-win32-ia32-msvc": "1.83.0",
        "@oxlint/binding-win32-x64-msvc": "1.83.0"
      },
      "peerDependencies": {
        "oxlint-tsgolint": ">=7.0.2001",
        "vite-plus": "*"
      },
      "peerDependenciesMeta": {
        "oxlint-tsgolint": {
          "optional": true
        },
        "vite-plus": {
          "optional": true
        }
      }
    },
    "node_modules/p-retry": {
      "version": "4.6.2",
      "resolved": "https://registry.npmjs.org/p-retry/-/p-retry-4.6.2.tgz",
      "integrity": "sha512-312Id396EbJdvRONlngUx0NydfrIQ5lsYu0znKVUzVvArzEIt08V1qhtyESbGVd1FGX7UKtiFp5uwKZdM8wIuQ==",
      "license": "MIT",
      "dependencies": {
        "@types/retry": "0.12.0",
        "retry": "^0.13.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/package-json-from-dist": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/package-json-from-dist/-/package-json-from-dist-1.0.1.tgz",
      "integrity": "sha512-UEZIS3/by4OC8vL3P2dTXRETpebLI2NiI5vIrjaD/5UtrkFX/tNbwjTSRAGC/+7CAo2pIcBaRgWmcBBHcsaCIw==",
      "dev": true,
      "license": "BlueOak-1.0.0"
    },
    "node_modules/parse-ms": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/parse-ms/-/parse-ms-2.1.0.tgz",
      "integrity": "sha512-kHt7kzLoS9VBZfUsiKjv43mr91ea+U05EyKkEtqp7vNbHxmaVuEqN7XxeEVnGrMtYOAxGrDElSi96K7EgO1zCA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/parseurl": {
      "version": "1.3.3",
      "resolved": "https://registry.npmjs.org/parseurl/-/parseurl-1.3.3.tgz",
      "integrity": "sha512-CiyeOxFT/JZyN5m0z9PfXw4SCBJ6Sygz1Dpl0wqjlhDEGGBP1GnsUVEL0p63hoG1fcj3fHynXi9NYO4nWOL+qQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/path-browserify": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/path-browserify/-/path-browserify-1.0.1.tgz",
      "integrity": "sha512-b7uo2UCUOYZcnF/3ID0lulOJi/bafxa1xPe7ZPsammBSpjSWQkjNxlt635YGS2MiR9GjvuXCtz2emr3jbsz98g==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/path-key": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/path-key/-/path-key-3.1.1.tgz",
      "integrity": "sha512-ojmeN0qd+y0jszEtoY48r0Peq5dwMEkIlCOu6Q5f41lfkswXuKtYrhgoTpLnyIcHm24Uhqx+5Tqm2InSwLhE6Q==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/path-parse": {
      "version": "1.0.7",
      "resolved": "https://registry.npmjs.org/path-parse/-/path-parse-1.0.7.tgz",
      "integrity": "sha512-LDJzPVEEEPR+y48z93A0Ed0yXb8pAByGWo/k5YYdYgpY2/2EsOsksJrq7lOHxryrVOn1ejG6oAp8ahvOIQD8sw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/path-scurry": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/path-scurry/-/path-scurry-2.0.2.tgz",
      "integrity": "sha512-3O/iVVsJAPsOnpwWIeD+d6z/7PmqApyQePUtCndjatj/9I5LylHvt5qluFaBT3I5h3r1ejfR056c+FCv+NnNXg==",
      "dev": true,
      "license": "BlueOak-1.0.0",
      "dependencies": {
        "lru-cache": "^11.0.0",
        "minipass": "^7.1.2"
      },
      "engines": {
        "node": "18 || 20 || >=22"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/path-scurry/node_modules/lru-cache": {
      "version": "11.5.2",
      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-11.5.2.tgz",
      "integrity": "sha512-4pfM1Ff0x50o0tQwb5ucw/RzNyD0/YJME6IVcStalZuMWxdt3sR3huStTtxz4PUmvZfRguvDejasvQ2kifR11g==",
      "dev": true,
      "license": "BlueOak-1.0.0",
      "engines": {
        "node": "20 || >=22"
      }
    },
    "node_modules/path-to-regexp": {
      "version": "8.4.2",
      "resolved": "https://registry.npmjs.org/path-to-regexp/-/path-to-regexp-8.4.2.tgz",
      "integrity": "sha512-qRcuIdP69NPm4qbACK+aDogI5CBDMi1jKe0ry5rSQJz8JVLsC7jV8XpiJjGRLLol3N+R5ihGYcrPLTno6pAdBA==",
      "license": "MIT",
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/path-to-regexp-updated": {
      "name": "path-to-regexp",
      "version": "6.3.0",
      "resolved": "https://registry.npmjs.org/path-to-regexp/-/path-to-regexp-6.3.0.tgz",
      "integrity": "sha512-Yhpw4T9C6hPpgPeA28us07OJeqZ5EzQTkbfwuhsUg0c237RomFoETJgmp2sa3F/41gfLE6G5cqcYwznmeEeOlQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/picocolors": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/picomatch": {
      "version": "4.0.7",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.7.tgz",
      "integrity": "sha512-qcJu88Q2IWqJsDD529JKMdwGm/dvInW4HvQnRwiH9JtihJvzGOscDtHE3x1pBKeUOTysQ8kVmLnJ2kJu7yhcGA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/playwright-core": {
      "version": "1.63.0",
      "resolved": "https://registry.npmjs.org/playwright-core/-/playwright-core-1.63.0.tgz",
      "integrity": "sha512-rYCsBF/M5HjUch52bbtVONEFjv6Xu8sm8h72dNlR5bzIE1fvC/bxgspzkjSfU+MweEMmPM8KJebG6nnyxo5mCg==",
      "dev": true,
      "license": "Apache-2.0",
      "bin": {
        "playwright-core": "cli.js"
      },
      "engines": {
        "node": ">=20"
      }
    },
    "node_modules/possible-typed-array-names": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/possible-typed-array-names/-/possible-typed-array-names-1.1.0.tgz",
      "integrity": "sha512-/+5VFTchJDoVj3bhoqi6UeymcD00DAwb1nJwamzPvHEszJ4FpF6SNNbUbOS8yI56qHzdV8eK0qEfOSiodkTdxg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/postcss": {
      "version": "8.5.28",
      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.28.tgz",
      "integrity": "sha512-RRuzqDtt5Y9h3quz5hWhK+TPnsmVs6WwSU6LkJMeY4HstUEDuYTG8UJSdawMRzmzAtV+KEoG8N3Qg2qLy5vM/A==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/postcss"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "nanoid": "^3.3.18",
        "picocolors": "^1.1.1",
        "source-map-js": "^1.2.1"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      }
    },
    "node_modules/pretty-bytes": {
      "version": "6.1.1",
      "resolved": "https://registry.npmjs.org/pretty-bytes/-/pretty-bytes-6.1.1.tgz",
      "integrity": "sha512-mQUvGU6aUFQ+rNvTIAcZuWGRT9a6f6Yrg9bHs4ImKF+HZCEK+plBvnAZYSIQztknZF2qnzNtr6F8s0+IuptdlQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^14.13.1 || >=16.0.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/pretty-ms": {
      "version": "7.0.1",
      "resolved": "https://registry.npmjs.org/pretty-ms/-/pretty-ms-7.0.1.tgz",
      "integrity": "sha512-973driJZvxiGOQ5ONsFhOF/DtzPMOMtgC11kCpUrPGMTgqp2q/1gwzCquocrN33is0VZ5GFHXZYMM9l6h67v2Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "parse-ms": "^2.1.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/protobufjs": {
      "version": "7.6.6",
      "resolved": "https://registry.npmjs.org/protobufjs/-/protobufjs-7.6.6.tgz",
      "integrity": "sha512-dYDWdjSl5RNb7SgPxGQcRU+GtvP7s2fpkrY0r432PcOIaZ0/rBcxEZnQN67iJhFuQiVw754JDoPruPCNdGsbjg==",
      "hasInstallScript": true,
      "license": "BSD-3-Clause",
      "dependencies": {
        "@protobufjs/aspromise": "^1.1.2",
        "@protobufjs/base64": "^1.1.2",
        "@protobufjs/codegen": "^2.0.5",
        "@protobufjs/eventemitter": "^1.1.1",
        "@protobufjs/fetch": "^1.1.1",
        "@protobufjs/float": "^1.0.2",
        "@protobufjs/path": "^1.1.2",
        "@protobufjs/pool": "^1.1.0",
        "@protobufjs/utf8": "^1.1.1",
        "@types/node": ">=13.7.0",
        "long": "^5.3.2"
      },
      "engines": {
        "node": ">=12.0.0"
      }
    },
    "node_modules/proxy-addr": {
      "version": "2.0.8",
      "resolved": "https://registry.npmjs.org/proxy-addr/-/proxy-addr-2.0.8.tgz",
      "integrity": "sha512-5nnx0yGyVUcY6t9RnWcARWtwT9F1D8O9rt08htPvnd49W1IgZtmLkhu9WfMzQj1cFxjHIO6connUNVW5k7AVyQ==",
      "license": "MIT",
      "dependencies": {
        "forwarded": "0.2.0",
        "ipaddr.js": "1.9.1"
      },
      "engines": {
        "node": ">= 0.10"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/punycode": {
      "version": "2.3.1",
      "resolved": "https://registry.npmjs.org/punycode/-/punycode-2.3.1.tgz",
      "integrity": "sha512-vYt7UD1U9Wg6138shLtLOvdAu+8DsC/ilFtEVHcH+wydcSpNE20AfSOduf6MkRFahL5FY7X1oU7nKVZFtfq8Fg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/qs": {
      "version": "6.16.0",
      "resolved": "https://registry.npmjs.org/qs/-/qs-6.16.0.tgz",
      "integrity": "sha512-h6fhOIaRrID2CbEY2fqs+7t+UXZo+MLAnU5gRIq85uFtdiUPCdsApMlHhXogKVM4HM2DVbIjGNTTYH2OcmP1vA==",
      "license": "BSD-3-Clause",
      "dependencies": {
        "es-define-property": "^1.0.1",
        "side-channel": "^1.1.1"
      },
      "engines": {
        "node": ">=0.6"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/queue-microtask": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/queue-microtask/-/queue-microtask-1.2.3.tgz",
      "integrity": "sha512-NuaNSa6flKT5JaSYQzJok04JzTL1CA6aGhv5rfLW3PgqA+M2ChpZQnAC8h8i4ZFkBS8X5RqkDBHA7r4hej3K9A==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "MIT"
    },
    "node_modules/range-parser": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/range-parser/-/range-parser-1.3.0.tgz",
      "integrity": "sha512-hek2mFQpPuI4E1BBKrSto+BU3e3x4xuarsbiwr3+lf7p44juvFMV0XFWQAP3xUyqXA4RrXLIoaSUGbSt056ZMw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/raw-body": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/raw-body/-/raw-body-3.0.2.tgz",
      "integrity": "sha512-K5zQjDllxWkf7Z5xJdV0/B0WTNqx6vxG70zJE4N0kBs4LovmEYWJzQGxC9bS9RAKu3bgM40lrd5zoLJ12MQ5BA==",
      "license": "MIT",
      "dependencies": {
        "bytes": "~3.1.2",
        "http-errors": "~2.0.1",
        "iconv-lite": "~0.7.0",
        "unpipe": "~1.0.0"
      },
      "engines": {
        "node": ">= 0.10"
      }
    },
    "node_modules/react": {
      "version": "19.3.0",
      "resolved": "https://registry.npmjs.org/react/-/react-19.3.0.tgz",
      "integrity": "sha512-E8LUcbtBWt20bbl2YoHfx4ZDBdxVTfOKtCZn9cDSJ4l6/nuoApcpIBcj47t2wZoVX8g2ZHuMHbiShgCR1T5Sog==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/react-dom": {
      "version": "19.3.0",
      "resolved": "https://registry.npmjs.org/react-dom/-/react-dom-19.3.0.tgz",
      "integrity": "sha512-JDk8dgif51OjFoDE70+OT9ICyYr+69HlmihNwp1+Nsfbna3t5sIiCa9ZJktDmQ4/1b/rn26hIAR2uYXDMr5r0Q==",
      "license": "MIT",
      "dependencies": {
        "scheduler": "^0.28.0"
      },
      "peerDependencies": {
        "react": "^19.3.0"
      }
    },
    "node_modules/react-router": {
      "version": "7.18.4",
      "resolved": "https://registry.npmjs.org/react-router/-/react-router-7.18.4.tgz",
      "integrity": "sha512-PUPQcMhMGRAslLcvtlPz/kmzBEWPhLdgLFrL7pLNepBL6dX0lWj4WD2cUYVgYCuT3jxvghYFg81cDTj44DhetQ==",
      "license": "MIT",
      "dependencies": {
        "cookie": "^1.0.1",
        "set-cookie-parser": "^2.6.0"
      },
      "engines": {
        "node": ">=20.0.0"
      },
      "peerDependencies": {
        "react": ">=18",
        "react-dom": ">=18"
      },
      "peerDependenciesMeta": {
        "react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/react-router-dom": {
      "version": "7.18.4",
      "resolved": "https://registry.npmjs.org/react-router-dom/-/react-router-dom-7.18.4.tgz",
      "integrity": "sha512-yrfmJHIpDG7taCpqKjT1G5B6q3O2K+RN8/fgNf0lTjCwiPbQ0ei6vXX9ZjQR+7ld8Tr7Z5xmyMnZ8YJrphWQUw==",
      "license": "MIT",
      "dependencies": {
        "react-router": "7.18.4"
      },
      "engines": {
        "node": ">=20.0.0"
      },
      "peerDependencies": {
        "react": ">=18",
        "react-dom": ">=18"
      }
    },
    "node_modules/reflect.getprototypeof": {
      "version": "1.0.10",
      "resolved": "https://registry.npmjs.org/reflect.getprototypeof/-/reflect.getprototypeof-1.0.10.tgz",
      "integrity": "sha512-00o4I+DVrefhv+nX0ulyi3biSHCPDe+yLv5o/p6d/UVlirijB8E16FtfwSAi4g3tcqrQ4lRAqQSoFEZJehYEcw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.23.9",
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.0.0",
        "get-intrinsic": "^1.2.7",
        "get-proto": "^1.0.1",
        "which-builtin-type": "^1.2.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/regenerate": {
      "version": "1.4.2",
      "resolved": "https://registry.npmjs.org/regenerate/-/regenerate-1.4.2.tgz",
      "integrity": "sha512-zrceR/XhGYU/d/opr2EKO7aRHUeiBI8qjtfHqADTwZd6Szfy16la6kqD0MIUs5z5hx6AaKa+PixpPrR289+I0A==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/regenerate-unicode-properties": {
      "version": "10.2.2",
      "resolved": "https://registry.npmjs.org/regenerate-unicode-properties/-/regenerate-unicode-properties-10.2.2.tgz",
      "integrity": "sha512-m03P+zhBeQd1RGnYxrGyDAPpWX/epKirLrp8e3qevZdVkKtnCrjjWczIbYc8+xd6vcTStVlqfycTx1KR4LOr0g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "regenerate": "^1.4.2"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/regexp.prototype.flags": {
      "version": "1.5.4",
      "resolved": "https://registry.npmjs.org/regexp.prototype.flags/-/regexp.prototype.flags-1.5.4.tgz",
      "integrity": "sha512-dYqgNSZbDwkaJ2ceRd9ojCGjBq+mOm9LmtXnAnEGyHhN/5R7iDW2TRw3h+o/jCFxus3P2LfWIIiwowAjANm7IA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "define-properties": "^1.2.1",
        "es-errors": "^1.3.0",
        "get-proto": "^1.0.1",
        "gopd": "^1.2.0",
        "set-function-name": "^2.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/regexpu-core": {
      "version": "6.4.0",
      "resolved": "https://registry.npmjs.org/regexpu-core/-/regexpu-core-6.4.0.tgz",
      "integrity": "sha512-0ghuzq67LI9bLXpOX/ISfve/Mq33a4aFRzoQYhnnok1JOFpmE/A2TBGkNVenOGEeSBCjIiWcc6MVOG5HEQv0sA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "regenerate": "^1.4.2",
        "regenerate-unicode-properties": "^10.2.2",
        "regjsgen": "^0.8.0",
        "regjsparser": "^0.13.0",
        "unicode-match-property-ecmascript": "^2.0.0",
        "unicode-match-property-value-ecmascript": "^2.2.1"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/regjsgen": {
      "version": "0.8.0",
      "resolved": "https://registry.npmjs.org/regjsgen/-/regjsgen-0.8.0.tgz",
      "integrity": "sha512-RvwtGe3d7LvWiDQXeQw8p5asZUmfU1G/l6WbUXeHta7Y2PEIvBTwH6E2EfmYUK8pxcxEdEmaomqyp0vZZ7C+3Q==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/regjsparser": {
      "version": "0.13.3",
      "resolved": "https://registry.npmjs.org/regjsparser/-/regjsparser-0.13.3.tgz",
      "integrity": "sha512-ycwFAS14Jw4mppvmK4GR/J6u3WpWpjkEApehuHtLc/8VpPNpDMbQ4WjqwplXifGeyKOzHSFLmSPqzksDQE2Sfg==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "jsesc": "~3.1.0"
      },
      "bin": {
        "regjsparser": "bin/parser"
      }
    },
    "node_modules/require-from-string": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/require-from-string/-/require-from-string-2.0.2.tgz",
      "integrity": "sha512-Xf0nWe6RseziFMu+Ap9biiUbmplq6S9/p+7w7YXP/JBHhrUDDUhwa+vANyubuqfZWTveU//DYVGsDG7RKL/vEw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/resolve": {
      "version": "1.22.12",
      "resolved": "https://registry.npmjs.org/resolve/-/resolve-1.22.12.tgz",
      "integrity": "sha512-TyeJ1zif53BPfHootBGwPRYT1RUt6oGWsaQr8UyZW/eAm9bKoijtvruSDEmZHm92CwS9nj7/fWttqPCgzep8CA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "is-core-module": "^2.16.1",
        "path-parse": "^1.0.7",
        "supports-preserve-symlinks-flag": "^1.0.0"
      },
      "bin": {
        "resolve": "bin/resolve"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/resolve-from": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/resolve-from/-/resolve-from-5.0.0.tgz",
      "integrity": "sha512-qYg9KP24dD5qka9J47d0aVky0N+b4fTU89LN9iDnjB5waksiC49rvMB0PrUJQGoTmH50XPiqOvAjDfaijGxYZw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/resolve-pkg-maps": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/resolve-pkg-maps/-/resolve-pkg-maps-1.0.0.tgz",
      "integrity": "sha512-seS2Tj26TBVOC2NIc2rOe2y2ZO7efxITtLZcGSOnHHNOQ7CkiUBfw0Iw2ck6xkIhPwLhKNLS8BO+hEpngQlqzw==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://github.com/privatenumber/resolve-pkg-maps?sponsor=1"
      }
    },
    "node_modules/retry": {
      "version": "0.13.1",
      "resolved": "https://registry.npmjs.org/retry/-/retry-0.13.1.tgz",
      "integrity": "sha512-XQBQ3I8W1Cge0Seh+6gjj03LbmRFWuoszgK9ooCpwYIrhhoO80pfq4cUkU5DkknwfOfFteRwlZ56PYOGYyFWdg==",
      "license": "MIT",
      "engines": {
        "node": ">= 4"
      }
    },
    "node_modules/reusify": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/reusify/-/reusify-1.1.0.tgz",
      "integrity": "sha512-g6QUff04oZpHs0eG5p83rFLhHeV00ug/Yf9nZM6fLeUrPguBTkTQOdpAWWspMh55TZfVQDPaN3NQJfbVRAxdIw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "iojs": ">=1.0.0",
        "node": ">=0.10.0"
      }
    },
    "node_modules/rolldown": {
      "version": "1.2.9",
      "resolved": "https://registry.npmjs.org/rolldown/-/rolldown-1.2.9.tgz",
      "integrity": "sha512-hx/Pv0N1haXRb11qkfnK5MXB/iqr7i0yjWQqmO9uHqZpBgQSqzc8UsSnEpalsh+j1I8qQ2CkXAkJC8Br3dKSlg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@oxc-project/types": "=0.150.0",
        "@rolldown/pluginutils": "^1.0.0"
      },
      "bin": {
        "rolldown": "bin/cli.mjs"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "optionalDependencies": {
        "@rolldown/binding-android-arm-eabi": "1.2.9",
        "@rolldown/binding-android-arm64": "1.2.9",
        "@rolldown/binding-darwin-arm64": "1.2.9",
        "@rolldown/binding-darwin-x64": "1.2.9",
        "@rolldown/binding-freebsd-x64": "1.2.9",
        "@rolldown/binding-linux-arm-gnueabihf": "1.2.9",
        "@rolldown/binding-linux-arm64-gnu": "1.2.9",
        "@rolldown/binding-linux-arm64-musl": "1.2.9",
        "@rolldown/binding-linux-ppc64-gnu": "1.2.9",
        "@rolldown/binding-linux-s390x-gnu": "1.2.9",
        "@rolldown/binding-linux-x64-gnu": "1.2.9",
        "@rolldown/binding-linux-x64-musl": "1.2.9",
        "@rolldown/binding-openharmony-arm64": "1.2.9",
        "@rolldown/binding-win32-arm64-msvc": "1.2.9",
        "@rolldown/binding-win32-x64-msvc": "1.2.9"
      }
    },
    "node_modules/rollup": {
      "version": "4.63.3",
      "resolved": "https://registry.npmjs.org/rollup/-/rollup-4.63.3.tgz",
      "integrity": "sha512-1i2XreiAoMMXuPGD6Msj2xWrMMkHojNRKivInxGQcg7/1KuPuYlfUutLyh4drnOxUTHX9cHI4wFoat8D/NKaBw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/estree": "1.0.9"
      },
      "bin": {
        "rollup": "dist/bin/rollup"
      },
      "engines": {
        "node": ">=18.0.0",
        "npm": ">=8.0.0"
      },
      "optionalDependencies": {
        "@napi-rs/lzma-linux-x64-gnu": "1.5.1",
        "@rollup/rollup-android-arm-eabi": "4.63.3",
        "@rollup/rollup-android-arm64": "4.63.3",
        "@rollup/rollup-darwin-arm64": "4.63.3",
        "@rollup/rollup-darwin-x64": "4.63.3",
        "@rollup/rollup-freebsd-arm64": "4.63.3",
        "@rollup/rollup-freebsd-x64": "4.63.3",
        "@rollup/rollup-linux-arm-gnueabihf": "4.63.3",
        "@rollup/rollup-linux-arm-musleabihf": "4.63.3",
        "@rollup/rollup-linux-arm64-gnu": "4.63.3",
        "@rollup/rollup-linux-arm64-musl": "4.63.3",
        "@rollup/rollup-linux-loong64-gnu": "4.63.3",
        "@rollup/rollup-linux-loong64-musl": "4.63.3",
        "@rollup/rollup-linux-ppc64-gnu": "4.63.3",
        "@rollup/rollup-linux-ppc64-musl": "4.63.3",
        "@rollup/rollup-linux-riscv64-gnu": "4.63.3",
        "@rollup/rollup-linux-riscv64-musl": "4.63.3",
        "@rollup/rollup-linux-s390x-gnu": "4.63.3",
        "@rollup/rollup-linux-x64-gnu": "4.63.3",
        "@rollup/rollup-linux-x64-musl": "4.63.3",
        "@rollup/rollup-openbsd-x64": "4.63.3",
        "@rollup/rollup-openharmony-arm64": "4.63.3",
        "@rollup/rollup-win32-arm64-msvc": "4.63.3",
        "@rollup/rollup-win32-ia32-msvc": "4.63.3",
        "@rollup/rollup-win32-x64-gnu": "4.63.3",
        "@rollup/rollup-win32-x64-msvc": "4.63.3",
        "fsevents": "~2.3.2"
      }
    },
    "node_modules/router": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/router/-/router-2.2.0.tgz",
      "integrity": "sha512-nLTrUKm2UyiL7rlhapu/Zl45FwNgkZGaCpZbIHajDYgwlJCOzLSk+cIPAnsEqV955GjILJnKbdQC1nVPz+gAYQ==",
      "license": "MIT",
      "dependencies": {
        "debug": "^4.4.0",
        "depd": "^2.0.0",
        "is-promise": "^4.0.0",
        "parseurl": "^1.3.3",
        "path-to-regexp": "^8.0.0"
      },
      "engines": {
        "node": ">= 18"
      }
    },
    "node_modules/run-parallel": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/run-parallel/-/run-parallel-1.2.0.tgz",
      "integrity": "sha512-5l4VyZR86LZ/lDxZTR6jqL8AFE2S0IFLMP26AbjsLVADxHdhB/c0GUsH+y39UfCi3dzz8OlQuPmnaJOMoDHQBA==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "queue-microtask": "^1.2.2"
      }
    },
    "node_modules/safe-array-concat": {
      "version": "1.1.4",
      "resolved": "https://registry.npmjs.org/safe-array-concat/-/safe-array-concat-1.1.4.tgz",
      "integrity": "sha512-wtZlHyOje6OZTGqAoaDKxFkgRtkF9CnHAVnCHKfuj200wAgL+bSJhdsCD2l0Qx/2ekEXjPWcyKkfGb5CPboslg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.9",
        "call-bound": "^1.0.4",
        "get-intrinsic": "^1.3.0",
        "has-symbols": "^1.1.0",
        "isarray": "^2.0.5"
      },
      "engines": {
        "node": ">=0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/safe-buffer": {
      "version": "5.2.1",
      "resolved": "https://registry.npmjs.org/safe-buffer/-/safe-buffer-5.2.1.tgz",
      "integrity": "sha512-rp3So07KcdmmKbGvgaNxQSJr7bGVSVk5S9Eq1F+ppbRo70+YeaDxkw5Dd8NPN+GD6bjnYm2VuPuCXmpuYvmCXQ==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "MIT"
    },
    "node_modules/safe-push-apply": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/safe-push-apply/-/safe-push-apply-1.0.0.tgz",
      "integrity": "sha512-iKE9w/Z7xCzUMIZqdBsp6pEQvwuEebH4vdpjcDWnyzaI6yl6O9FHvVpmGelvEHNsoY6wGblkxR6Zty/h00WiSA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "isarray": "^2.0.5"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/safe-regex-test": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/safe-regex-test/-/safe-regex-test-1.1.0.tgz",
      "integrity": "sha512-x/+Cz4YrimQxQccJf5mKEbIa1NzeCRNI5Ecl/ekmlYaampdNLPalVyIcCZNNH3MvmqBugV5TMYZXv0ljslUlaw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "es-errors": "^1.3.0",
        "is-regex": "^1.2.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/safer-buffer": {
      "version": "2.1.2",
      "resolved": "https://registry.npmjs.org/safer-buffer/-/safer-buffer-2.1.2.tgz",
      "integrity": "sha512-YZo3K82SD7Riyi0E1EQPojLz7kpepnSQI9IyPbHHg1XXXevb5dJI7tpyN2ADxGcQbHG7vcyRHk0cbwqcQriUtg==",
      "license": "MIT"
    },
    "node_modules/scheduler": {
      "version": "0.28.0",
      "resolved": "https://registry.npmjs.org/scheduler/-/scheduler-0.28.0.tgz",
      "integrity": "sha512-juorfCmIkIw8tT+p5BXSm6PJjQF/ycEYmKyzURCIt/RaZIhL+PulbQ9Yu2z1HdOJDdqDTlxA1+xKBmHXJsczAw==",
      "license": "MIT"
    },
    "node_modules/semver": {
      "version": "6.3.1",
      "resolved": "https://registry.npmjs.org/semver/-/semver-6.3.1.tgz",
      "integrity": "sha512-BR7VvDCVHO+q2xBEWskxS6DJE1qRnb7DxzUrogb71CWoSficBxYsiAGd+Kl0mmq/MprG9yArRkyrQxTO6XjMzA==",
      "dev": true,
      "license": "ISC",
      "bin": {
        "semver": "bin/semver.js"
      }
    },
    "node_modules/send": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/send/-/send-1.2.1.tgz",
      "integrity": "sha512-1gnZf7DFcoIcajTjTwjwuDjzuz4PPcY2StKPlsGAQ1+YH20IRVrBaXSWmdjowTJ6u8Rc01PoYOGHXfP1mYcZNQ==",
      "license": "MIT",
      "dependencies": {
        "debug": "^4.4.3",
        "encodeurl": "^2.0.0",
        "escape-html": "^1.0.3",
        "etag": "^1.8.1",
        "fresh": "^2.0.0",
        "http-errors": "^2.0.1",
        "mime-types": "^3.0.2",
        "ms": "^2.1.3",
        "on-finished": "^2.4.1",
        "range-parser": "^1.2.1",
        "statuses": "^2.0.2"
      },
      "engines": {
        "node": ">= 18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/serialize-javascript": {
      "version": "7.1.1",
      "resolved": "https://registry.npmjs.org/serialize-javascript/-/serialize-javascript-7.1.1.tgz",
      "integrity": "sha512-k3CMsaIvvdSwm8oLB4MXSl0wH2/cwlH7xGcnRd2DaeRmBkbzYmyT8j0tsX60DwD1eRwHTpNpH8ljKu9oUT1MeQ==",
      "dev": true,
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/serve-static": {
      "version": "2.2.1",
      "resolved": "https://registry.npmjs.org/serve-static/-/serve-static-2.2.1.tgz",
      "integrity": "sha512-xRXBn0pPqQTVQiC8wyQrKs2MOlX24zQ0POGaj0kultvoOCstBQM5yvOhAVSUwOMjQtTvsPWoNCHfPGwaaQJhTw==",
      "license": "MIT",
      "dependencies": {
        "encodeurl": "^2.0.0",
        "escape-html": "^1.0.3",
        "parseurl": "^1.3.3",
        "send": "^1.2.0"
      },
      "engines": {
        "node": ">= 18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/set-cookie-parser": {
      "version": "2.7.2",
      "resolved": "https://registry.npmjs.org/set-cookie-parser/-/set-cookie-parser-2.7.2.tgz",
      "integrity": "sha512-oeM1lpU/UvhTxw+g3cIfxXHyJRc/uidd3yK1P242gzHds0udQBYzs3y8j4gCCW+ZJ7ad0yctld8RYO+bdurlvw==",
      "license": "MIT"
    },
    "node_modules/set-function-length": {
      "version": "1.2.2",
      "resolved": "https://registry.npmjs.org/set-function-length/-/set-function-length-1.2.2.tgz",
      "integrity": "sha512-pgRc4hJ4/sNjWCSS9AmnS40x3bNMDTknHgL5UaMBTMyJnU90EgWh1Rz+MC9eFu4BuN/UwZjKQuY/1v3rM7HMfg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "define-data-property": "^1.1.4",
        "es-errors": "^1.3.0",
        "function-bind": "^1.1.2",
        "get-intrinsic": "^1.2.4",
        "gopd": "^1.0.1",
        "has-property-descriptors": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/set-function-name": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/set-function-name/-/set-function-name-2.0.2.tgz",
      "integrity": "sha512-7PGFlmtwsEADb0WYyvCMa1t+yke6daIG4Wirafur5kcf+MhUnPms1UeR0CKQdTZD81yESwMHbtn+TR+dMviakQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "define-data-property": "^1.1.4",
        "es-errors": "^1.3.0",
        "functions-have-names": "^1.2.3",
        "has-property-descriptors": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/set-proto": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/set-proto/-/set-proto-1.0.0.tgz",
      "integrity": "sha512-RJRdvCo6IAnPdsvP/7m6bsQqNnn1FCBX5ZNtFL98MmFF/4xAIJTIg1YbHW5DC2W5SKZanrC6i4HsJqlajw/dZw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "dunder-proto": "^1.0.1",
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/setprototypeof": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/setprototypeof/-/setprototypeof-1.2.0.tgz",
      "integrity": "sha512-E5LDX7Wrp85Kil5bhZv46j8jOeboKq5JMmYM3gVGdGH8xFpPWXUMsNrlODCrkoxMEeNi/XZIwuRvY4XNwYMJpw==",
      "license": "ISC"
    },
    "node_modules/shebang-command": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/shebang-command/-/shebang-command-2.0.0.tgz",
      "integrity": "sha512-kHxr2zZpYtdmrN1qDjrrX/Z1rR1kG8Dx+gkpK1G4eXmvXswmcE1hTWBWYUzlraYw1/yZp6YuDY77YtvbN0dmDA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "shebang-regex": "^3.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/shebang-regex": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/shebang-regex/-/shebang-regex-3.0.0.tgz",
      "integrity": "sha512-7++dFhtcx3353uBaq8DDR4NuxBetBzC7ZQOhmTQInHEd6bSrXdiEyzCvG07Z44UYdLShWUyXt5M/yhz8ekcb1A==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/side-channel": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/side-channel/-/side-channel-1.1.1.tgz",
      "integrity": "sha512-6x6dK6zJdpTzF4sQeNYxwtvBzf6Eg4GtlesS94HOvTudUeyK2WXAaIfmDgsyslYrRBeFIlsi54AYsFGUuhmvrQ==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "object-inspect": "^1.13.4",
        "side-channel-list": "^1.0.1",
        "side-channel-map": "^1.0.1",
        "side-channel-weakmap": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/side-channel-list": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/side-channel-list/-/side-channel-list-1.0.1.tgz",
      "integrity": "sha512-mjn/0bi/oUURjc5Xl7IaWi/OJJJumuoJFQJfDDyO46+hBWsfaVM65TBHq2eoZBhzl9EchxOijpkbRC8SVBQU0w==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "object-inspect": "^1.13.4"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/side-channel-map": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/side-channel-map/-/side-channel-map-1.0.1.tgz",
      "integrity": "sha512-VCjCNfgMsby3tTdo02nbjtM/ewra6jPHmpThenkTYh8pG9ucZ/1P8So4u4FGBek/BjpOVsDCMoLA/iuBKIFXRA==",
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.5",
        "object-inspect": "^1.13.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/side-channel-weakmap": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/side-channel-weakmap/-/side-channel-weakmap-1.0.2.tgz",
      "integrity": "sha512-WPS/HvHQTYnHisLo9McqBHOJk2FkHO/tlpvldyrnem4aeQp4hai3gythswg6p01oSoTl58rcpiFAjF2br2Ak2A==",
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.5",
        "object-inspect": "^1.13.3",
        "side-channel-map": "^1.0.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/signal-exit": {
      "version": "4.1.0",
      "resolved": "https://registry.npmjs.org/signal-exit/-/signal-exit-4.1.0.tgz",
      "integrity": "sha512-bzyZ1e88w9O1iNJbKnOlvYTrWPDl46O1bG0D3XInv+9tkPrxrN8jUUTiFlDkkmKWgn1M6CfIA13SuGqOa9Korw==",
      "dev": true,
      "license": "ISC",
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/smob": {
      "version": "1.6.2",
      "resolved": "https://registry.npmjs.org/smob/-/smob-1.6.2.tgz",
      "integrity": "sha512-RQsvleCbF8cVHEv+xuDGaA4pOizFqJ0GgjtMSRo6oP8pnN7WsigHgVGey6aILRBKv4W2YOMHLqbKdnB6hpB9fw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/source-map": {
      "version": "0.8.0",
      "resolved": "https://registry.npmjs.org/source-map/-/source-map-0.8.0.tgz",
      "integrity": "sha512-d8EqvL+k/SOXCreS/SUzg2ciyHqBBLcN/yuRjFsbvVhHTE2pgei7oAhmPM7kWFbkX6OSMQfUq4KbkF3au9lhYQ==",
      "dev": true,
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">= 12"
      }
    },
    "node_modules/source-map-js": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz",
      "integrity": "sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==",
      "dev": true,
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/source-map-support": {
      "version": "0.5.21",
      "resolved": "https://registry.npmjs.org/source-map-support/-/source-map-support-0.5.21.tgz",
      "integrity": "sha512-uBHU3L3czsIyYXKX88fdrGovxdSCoTGDRZ6SYXtSRxLZUzHg5P/66Ht6uoUlHu9EZod+inXhKo3qQgwXUT/y1w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "buffer-from": "^1.0.0",
        "source-map": "^0.6.0"
      }
    },
    "node_modules/source-map-support/node_modules/source-map": {
      "version": "0.6.1",
      "resolved": "https://registry.npmjs.org/source-map/-/source-map-0.6.1.tgz",
      "integrity": "sha512-UjgapumWlbMhkBgzT7Ykc5YXUT46F0iKu8SGXq0bcwP5dz/h0Plj6enJqjz1Zbq2l5WaqYnrVbwWOWMyF3F47g==",
      "dev": true,
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/statuses": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/statuses/-/statuses-2.0.2.tgz",
      "integrity": "sha512-DvEy55V3DB7uknRo+4iOGT5fP1slR8wQohVdknigZPMpMstaKJQWhwiYBACJE3Ul2pTnATihhBYnRhZQHGBiRw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/stop-iteration-iterator": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/stop-iteration-iterator/-/stop-iteration-iterator-1.1.0.tgz",
      "integrity": "sha512-eLoXW/DHyl62zxY4SCaIgnRhuMr6ri4juEYARS8E6sCEqzKpOiE521Ucofdx+KnDZl5xmvGYaaKCk5FEOxJCoQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "internal-slot": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/string.prototype.matchall": {
      "version": "4.1.0",
      "resolved": "https://registry.npmjs.org/string.prototype.matchall/-/string.prototype.matchall-4.1.0.tgz",
      "integrity": "sha512-tHNHTxInrYLCga9O9YGxWA3G9/nnzQw8UGAyqGx3Ar1pSTTzIuM4woFSq4SowkXCjJIwq5sIiQvEfRI9tCH1qQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.9",
        "call-bound": "^1.0.4",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.24.2",
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.1.2",
        "get-intrinsic": "^1.3.0",
        "gopd": "^1.2.0",
        "has-symbols": "^1.1.0",
        "internal-slot": "^1.1.0",
        "regexp.prototype.flags": "^1.5.4",
        "set-function-name": "^2.0.2",
        "side-channel": "^1.1.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/string.prototype.trim": {
      "version": "1.2.11",
      "resolved": "https://registry.npmjs.org/string.prototype.trim/-/string.prototype.trim-1.2.11.tgz",
      "integrity": "sha512-PwvK7BU+CMTJGYQCTZb5RWXIML92lftJLhQz1tBzgKiqGxJaMlBAa48POXaNAC2s4y8jr3EFqrkF9+44neS46w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.9",
        "call-bound": "^1.0.4",
        "define-data-property": "^1.1.4",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.24.2",
        "es-object-atoms": "^1.1.2",
        "has-property-descriptors": "^1.0.2",
        "safe-regex-test": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/string.prototype.trimend": {
      "version": "1.0.10",
      "resolved": "https://registry.npmjs.org/string.prototype.trimend/-/string.prototype.trimend-1.0.10.tgz",
      "integrity": "sha512-2+3aDAOmPTmuFwjDnmJG2ctEkQKVki7vOSqaxkv42Mowj1V6PnvuwFCRrR5lChUux1TBskPjfkeTOhqczDMxTw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.9",
        "call-bound": "^1.0.4",
        "define-properties": "^1.2.1",
        "es-object-atoms": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/string.prototype.trimstart": {
      "version": "1.0.8",
      "resolved": "https://registry.npmjs.org/string.prototype.trimstart/-/string.prototype.trimstart-1.0.8.tgz",
      "integrity": "sha512-UXSH262CSZY1tfu3G3Secr6uGLCFVPMhIqHjlgCUtCCcgihYc/xKs9djMTMUOb2j1mVSeU8EU6NWc/iQKU6Gfg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.7",
        "define-properties": "^1.2.1",
        "es-object-atoms": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/stringify-object": {
      "version": "3.3.0",
      "resolved": "https://registry.npmjs.org/stringify-object/-/stringify-object-3.3.0.tgz",
      "integrity": "sha512-rHqiFh1elqCQ9WPLIC8I0Q/g/wj5J1eMkyoiD6eoQApWHP0FtlK7rqnhmabL5VUY9JQCcqwwvlOaSuutekgyrw==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "get-own-enumerable-property-symbols": "^3.0.0",
        "is-obj": "^1.0.1",
        "is-regexp": "^1.0.0"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/strip-comments": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/strip-comments/-/strip-comments-2.0.1.tgz",
      "integrity": "sha512-ZprKx+bBLXv067WTCALv8SSz5l2+XhpYCsVtSqlMnkAXMWDq+/ekVbl1ghqP9rUHTzv6sm/DwCOiYutU/yp1fw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/supports-preserve-symlinks-flag": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/supports-preserve-symlinks-flag/-/supports-preserve-symlinks-flag-1.0.0.tgz",
      "integrity": "sha512-ot0WnXS9fgdkgIcePe6RHNk1WA8+muPa6cSjeR3V8K27q9BB1rTE3R1p7Hv0z1ZyAc8s6Vvv8DIyWf681MAt0w==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/tar": {
      "version": "7.5.22",
      "resolved": "https://registry.npmjs.org/tar/-/tar-7.5.22.tgz",
      "integrity": "sha512-MFO/QzvtAOmJbkhOaCTvbGcFN9L9b+JunIsDwaKljSOdcLMea3NJ1k9Usz/rjdfSXTq4dfzfeS7W4p4YOAAHeA==",
      "dev": true,
      "license": "BlueOak-1.0.0",
      "dependencies": {
        "@isaacs/fs-minipass": "^4.0.0",
        "chownr": "^3.0.0",
        "minipass": "^7.1.2",
        "minizlib": "^3.1.0",
        "yallist": "^5.0.0"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tar/node_modules/yallist": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/yallist/-/yallist-5.0.0.tgz",
      "integrity": "sha512-YgvUTfwqyc7UXVMrB+SImsVYSmTS8X/tSrtdNZMImM+n7+QTriRXyXim0mBrTXNeqzVF0KWGgHPeiyViFFrNDw==",
      "dev": true,
      "license": "BlueOak-1.0.0",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/temp-dir": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/temp-dir/-/temp-dir-2.0.0.tgz",
      "integrity": "sha512-aoBAniQmmwtcKp/7BzsH8Cxzv8OL736p7v1ihGb5e9DJ9kTwGWHrQrVB5+lfVDzfGrdRzXch+ig7LHaY1JTOrg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/tempy": {
      "version": "0.6.0",
      "resolved": "https://registry.npmjs.org/tempy/-/tempy-0.6.0.tgz",
      "integrity": "sha512-G13vtMYPT/J8A4X2SjdtBTphZlrp1gKv6hZiOjw14RCWg6GbHuQBGtjlx75xLbYV/wEc0D7G5K4rxKP/cXk8Bw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-stream": "^2.0.0",
        "temp-dir": "^2.0.0",
        "type-fest": "^0.16.0",
        "unique-string": "^2.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/terser": {
      "version": "5.51.2",
      "resolved": "https://registry.npmjs.org/terser/-/terser-5.51.2.tgz",
      "integrity": "sha512-bWnjSNscmuI+GJze6ZupnHP8G/cTcsJF+bXCeQknk2SHQsgbNJnLrqiH9jZ2W4STPVXH2mDKKRX3iwPhc9Cn/Q==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "@jridgewell/source-map": "^0.3.3",
        "acorn": "^8.15.0",
        "commander": "^2.20.0",
        "source-map-support": "~0.5.20"
      },
      "bin": {
        "terser": "bin/terser"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/time-span": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/time-span/-/time-span-4.0.0.tgz",
      "integrity": "sha512-MyqZCTGLDZ77u4k+jqg4UlrzPTPZ49NDlaekU6uuFaJLzPIN1woaRXCbGeqOfxwc3Y37ZROGAJ614Rdv7Olt+g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "convert-hrtime": "^3.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/tinyglobby": {
      "version": "0.2.17",
      "resolved": "https://registry.npmjs.org/tinyglobby/-/tinyglobby-0.2.17.tgz",
      "integrity": "sha512-wXR/dYpcqKmfWpEdZjiKJOwCNFndD0DMnrW/cYjVGttEkBfVgcLFHoNrlj47mjOVic9yyNu65alsgF4NQyTa2g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fdir": "^6.5.0",
        "picomatch": "^4.0.4"
      },
      "engines": {
        "node": ">=12.0.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/SuperchupuDev"
      }
    },
    "node_modules/to-regex-range": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/to-regex-range/-/to-regex-range-5.0.1.tgz",
      "integrity": "sha512-65P7iz6X5yEr1cwcgvQxbbIw7Uk3gOy5dIdtZ4rDveLqhrdJP+Li/Hx6tyK0NEb+2GCyneCMJiGqrADCSNk8sQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-number": "^7.0.0"
      },
      "engines": {
        "node": ">=8.0"
      }
    },
    "node_modules/toidentifier": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/toidentifier/-/toidentifier-1.0.1.tgz",
      "integrity": "sha512-o5sSPKEkg/DIQNmH43V0/uerLrpzVedkUh8tGNvaeXpfpuwjKenlSox/2O/BTlZUtEe+JG7s5YhEz608PlAHRA==",
      "license": "MIT",
      "engines": {
        "node": ">=0.6"
      }
    },
    "node_modules/tr46": {
      "version": "0.0.3",
      "resolved": "https://registry.npmjs.org/tr46/-/tr46-0.0.3.tgz",
      "integrity": "sha512-N3WMsuqV66lT30CrXNbEjx4GEwlow3v6rr4mCcv6prnfwhS01rkgyFdjPNBYd9br7LpXV1+Emh01fHnq2Gdgrw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/ts-morph": {
      "version": "12.0.0",
      "resolved": "https://registry.npmjs.org/ts-morph/-/ts-morph-12.0.0.tgz",
      "integrity": "sha512-VHC8XgU2fFW7yO1f/b3mxKDje1vmyzFXHWzOYmKEkCEwcLjDtbdLgBQviqj4ZwP4MJkQtRo6Ha2I29lq/B+VxA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@ts-morph/common": "~0.11.0",
        "code-block-writer": "^10.1.1"
      }
    },
    "node_modules/ts-toolbelt": {
      "version": "6.15.5",
      "resolved": "https://registry.npmjs.org/ts-toolbelt/-/ts-toolbelt-6.15.5.tgz",
      "integrity": "sha512-FZIXf1ksVyLcfr7M317jbB67XFJhOO1YqdTcuGaq9q5jLUoTikukZ+98TPjKiP2jC5CgmYdWWYs0s2nLSU0/1A==",
      "dev": true,
      "license": "Apache-2.0"
    },
    "node_modules/tsx": {
      "version": "4.23.15",
      "resolved": "https://registry.npmjs.org/tsx/-/tsx-4.23.15.tgz",
      "integrity": "sha512-Yiex1Ovn8z2xPpOWckIiysV1SSyRMY9BkLF++q0yKiDxCqRhosKfMg3janKkiLBwZ5c/YryloKwGZcrEmtwxKw==",
      "license": "MIT",
      "dependencies": {
        "esbuild": "~0.28.0"
      },
      "bin": {
        "tsx": "dist/cli.mjs"
      },
      "engines": {
        "node": ">=18.0.0"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.3"
      }
    },
    "node_modules/type-fest": {
      "version": "0.16.0",
      "resolved": "https://registry.npmjs.org/type-fest/-/type-fest-0.16.0.tgz",
      "integrity": "sha512-eaBzG6MxNzEn9kiwvtre90cXaNLkmadMWa1zQMs3XORCXNbsH/OewwbxC5ia9dCxIxnTAsSxXJaa/p5y8DlvJg==",
      "dev": true,
      "license": "(MIT OR CC0-1.0)",
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/type-is": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/type-is/-/type-is-2.1.0.tgz",
      "integrity": "sha512-faYHw0anBbc/kWF3zFTEnxSFOAGUX9GFbOBthvDdLsIlEoWOFOtS0zgCiQYwIskL9iGXZL3kAXD8OoZ4GmMATA==",
      "license": "MIT",
      "dependencies": {
        "content-type": "^2.0.0",
        "media-typer": "^1.1.0",
        "mime-types": "^3.0.0"
      },
      "engines": {
        "node": ">= 18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/type-is/node_modules/content-type": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/content-type/-/content-type-2.1.0.tgz",
      "integrity": "sha512-mj7UPXE0jaqaOsukNZRUEfEi2AcL7C/vwmwcHV0O97eO1E1pxBZuyjlZrx5seTaNBg1U6+o35wpa35Qfcc+7ag==",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/typed-array-buffer": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/typed-array-buffer/-/typed-array-buffer-1.0.3.tgz",
      "integrity": "sha512-nAYYwfY3qnzX30IkA6AQZjVbtK6duGontcQm1WSG1MD94YLqK0515GNApXkoxKOWMusVssAHWLh9SeaoefYFGw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3",
        "es-errors": "^1.3.0",
        "is-typed-array": "^1.1.14"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/typed-array-byte-length": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/typed-array-byte-length/-/typed-array-byte-length-1.0.3.tgz",
      "integrity": "sha512-BaXgOuIxz8n8pIq3e7Atg/7s+DpiYrxn4vdot3w9KbnBhcRQq6o3xemQdIfynqSeXeDrF32x+WvfzmOjPiY9lg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "for-each": "^0.3.3",
        "gopd": "^1.2.0",
        "has-proto": "^1.2.0",
        "is-typed-array": "^1.1.14"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/typed-array-byte-offset": {
      "version": "1.0.5",
      "resolved": "https://registry.npmjs.org/typed-array-byte-offset/-/typed-array-byte-offset-1.0.5.tgz",
      "integrity": "sha512-0FHJvLPqZ7KJzp17O13jfsAjsqazgrxBu2zEK95PmUz8lv2+GjRuxUInCr2Rk9Dms3ihN21zJ929ZO43yJ95QQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "available-typed-arrays": "^1.0.7",
        "call-bind": "^1.0.9",
        "for-each": "^0.3.5",
        "gopd": "^1.2.0",
        "is-typed-array": "^1.1.15",
        "reflect.getprototypeof": "^1.0.10"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/typed-array-length": {
      "version": "1.0.8",
      "resolved": "https://registry.npmjs.org/typed-array-length/-/typed-array-length-1.0.8.tgz",
      "integrity": "sha512-phPGCwqr2+Qo0fwniCE8e4pKnGu/yFb5nD5Y8bf0EEeiI5GklnACYA9GFy/DrAeRrKHXvHn+1SUsOWgJp6RO+g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.9",
        "for-each": "^0.3.5",
        "gopd": "^1.2.0",
        "is-typed-array": "^1.1.15",
        "possible-typed-array-names": "^1.1.0",
        "reflect.getprototypeof": "^1.0.10"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/typescript": {
      "version": "6.0.3",
      "resolved": "https://registry.npmjs.org/typescript/-/typescript-6.0.3.tgz",
      "integrity": "sha512-y2TvuxSZPDyQakkFRPZHKFm+KKVqIisdg9/CZwm9ftvKXLP8NRWj38/ODjNbr43SsoXqNuAisEf1GdCxqWcdBw==",
      "dev": true,
      "license": "Apache-2.0",
      "bin": {
        "tsc": "bin/tsc",
        "tsserver": "bin/tsserver"
      },
      "engines": {
        "node": ">=14.17"
      }
    },
    "node_modules/unbox-primitive": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/unbox-primitive/-/unbox-primitive-1.1.0.tgz",
      "integrity": "sha512-nWJ91DjeOkej/TA8pXQ3myruKpKEYgqvpw9lz4OPHj/NWFNluYrjbz9j01CJ8yKQd2g4jFoOkINCTW2I5LEEyw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3",
        "has-bigints": "^1.0.2",
        "has-symbols": "^1.1.0",
        "which-boxed-primitive": "^1.1.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/undici": {
      "version": "5.28.4",
      "resolved": "https://registry.npmjs.org/undici/-/undici-5.28.4.tgz",
      "integrity": "sha512-72RFADWFqKmUb2hmmvNODKL3p9hcB6Gt2DOQMis1SEBaV6a4MH8soBvzg+95CYhCKPFedut2JY9bMfrDl9D23g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@fastify/busboy": "^2.0.0"
      },
      "engines": {
        "node": ">=14.0"
      }
    },
    "node_modules/undici-types": {
      "version": "7.18.2",
      "resolved": "https://registry.npmjs.org/undici-types/-/undici-types-7.18.2.tgz",
      "integrity": "sha512-AsuCzffGHJybSaRrmr5eHr81mwJU3kjw6M+uprWvCXiNeN9SOGwQ3Jn8jb8m3Z6izVgknn1R0FTCEAP2QrLY/w==",
      "license": "MIT"
    },
    "node_modules/unicode-canonical-property-names-ecmascript": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/unicode-canonical-property-names-ecmascript/-/unicode-canonical-property-names-ecmascript-2.0.1.tgz",
      "integrity": "sha512-dA8WbNeb2a6oQzAQ55YlT5vQAWGV9WXOsi3SskE3bcCdM0P4SDd+24zS/OCacdRq5BkdsRj9q3Pg6YyQoxIGqg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/unicode-match-property-ecmascript": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/unicode-match-property-ecmascript/-/unicode-match-property-ecmascript-2.0.0.tgz",
      "integrity": "sha512-5kaZCrbp5mmbz5ulBkDkbY0SsPOjKqVS35VpL9ulMPfSl0J0Xsm+9Evphv9CoIZFwre7aJoa94AY6seMKGVN5Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "unicode-canonical-property-names-ecmascript": "^2.0.0",
        "unicode-property-aliases-ecmascript": "^2.0.0"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/unicode-match-property-value-ecmascript": {
      "version": "2.2.1",
      "resolved": "https://registry.npmjs.org/unicode-match-property-value-ecmascript/-/unicode-match-property-value-ecmascript-2.2.1.tgz",
      "integrity": "sha512-JQ84qTuMg4nVkx8ga4A16a1epI9H6uTXAknqxkGF/aFfRLw1xC/Bp24HNLaZhHSkWd3+84t8iXnp1J0kYcZHhg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/unicode-property-aliases-ecmascript": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/unicode-property-aliases-ecmascript/-/unicode-property-aliases-ecmascript-2.2.0.tgz",
      "integrity": "sha512-hpbDzxUY9BFwX+UeBnxv3Sh1q7HFxj48DTmXchNgRa46lO8uj3/1iEn3MiNUYTg1g9ctIqXCCERn8gYZhHC5lQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/unique-string": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/unique-string/-/unique-string-2.0.0.tgz",
      "integrity": "sha512-uNaeirEPvpZWSgzwsPGtU2zVSTrn/8L5q/IexZmH0eH6SA73CmAA5U4GwORTxQAZs95TAXLNqeLoPPNO5gZfWg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "crypto-random-string": "^2.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/universalify": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/universalify/-/universalify-2.0.1.tgz",
      "integrity": "sha512-gptHNQghINnc/vTGIk0SOFGFNXw7JVrlRUtConJRlvaw6DuX0wO5Jeko9sWrMBhh+PsYAZ7oXAiOnf/UKogyiw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 10.0.0"
      }
    },
    "node_modules/unpipe": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/unpipe/-/unpipe-1.0.0.tgz",
      "integrity": "sha512-pjy2bYhSsufwWlKwPc+l3cN7+wuJlK6uz0YdJEOlQDbl6jo/YlPi4mb8agUkVC8BF7V8NuzeyPNqRksA3hztKQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/upath": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/upath/-/upath-1.2.0.tgz",
      "integrity": "sha512-aZwGpamFO61g3OlfT7OQCHqhGnW43ieH9WZeP7QxN/G/jS4jfqUkZxoryvJgVPEcrl5NL/ggHsSmLMHuH64Lhg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=4",
        "yarn": "*"
      }
    },
    "node_modules/update-browserslist-db": {
      "version": "1.3.3",
      "resolved": "https://registry.npmjs.org/update-browserslist-db/-/update-browserslist-db-1.3.3.tgz",
      "integrity": "sha512-pJ2sYawQS0R/WI928Gj5GlPhTGzbMelq0+4INtSYNDV9ErKJcX6xjGWkoG/VnB3dpUm00zALaqkrUD77pO5TDQ==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/browserslist"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "escalade": "^3.2.0",
        "picocolors": "^1.1.1"
      },
      "bin": {
        "update-browserslist-db": "cli.js"
      },
      "peerDependencies": {
        "browserslist": ">= 4.21.0"
      }
    },
    "node_modules/uri-js": {
      "version": "4.4.1",
      "resolved": "https://registry.npmjs.org/uri-js/-/uri-js-4.4.1.tgz",
      "integrity": "sha512-7rKUyy33Q1yc98pQ1DAmLtwX109F7TIfWlW1Ydo8Wl1ii1SeHieeh0HHfPeL2fMXK6z0s8ecKs9frCuLJvndBg==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "punycode": "^2.1.0"
      }
    },
    "node_modules/vary": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/vary/-/vary-1.1.2.tgz",
      "integrity": "sha512-BNGbWLfd0eUPabhkXUVm0j8uuvREyTh5ovRa/dyow/BqAbZJyC+5fU+IzQOzmAKzYqYRAISoRhdQr3eIZ/PXqg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/vite": {
      "version": "8.3.0",
      "resolved": "https://registry.npmjs.org/vite/-/vite-8.3.0.tgz",
      "integrity": "sha512-lhZBVvEHefgE+HQZC9O7EBJgCU/nVzFNl7vkS4RE0APtWLP02/8QVIkQtzBxPquh7lq5/78NHipTj7ODQ6XuyQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "lightningcss": "^1.33.0",
        "picomatch": "^4.0.7",
        "postcss": "^8.5.28",
        "rolldown": "~1.2.6",
        "tinyglobby": "^0.2.17"
      },
      "bin": {
        "vite": "bin/vite.js"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "funding": {
        "url": "https://github.com/vitejs/vite?sponsor=1"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.3"
      },
      "peerDependencies": {
        "@types/node": "^20.19.0 || >=22.12.0",
        "@vitejs/devtools": "^0.7.1",
        "esbuild": "^0.27.0 || ^0.28.0",
        "jiti": ">=1.21.0",
        "less": "^4.0.0",
        "sass": "^1.70.0",
        "sass-embedded": "^1.70.0",
        "stylus": ">=0.54.8",
        "sugarss": "^5.0.0",
        "terser": "^5.16.0",
        "tsx": "^4.8.1",
        "yaml": "^2.4.2"
      },
      "peerDependenciesMeta": {
        "@types/node": {
          "optional": true
        },
        "@vitejs/devtools": {
          "optional": true
        },
        "esbuild": {
          "optional": true
        },
        "jiti": {
          "optional": true
        },
        "less": {
          "optional": true
        },
        "sass": {
          "optional": true
        },
        "sass-embedded": {
          "optional": true
        },
        "stylus": {
          "optional": true
        },
        "sugarss": {
          "optional": true
        },
        "terser": {
          "optional": true
        },
        "tsx": {
          "optional": true
        },
        "yaml": {
          "optional": true
        }
      }
    },
    "node_modules/vite-plugin-pwa": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/vite-plugin-pwa/-/vite-plugin-pwa-1.3.0.tgz",
      "integrity": "sha512-c5kMgN+ITrOtHXp8PAtk2uOIEea6XjP/unCGxOWWBzQ6qa65qj/awHg0wf+QF9E/2u9vh86LqxPwzEPNbM2r5A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "debug": "^4.3.6",
        "pretty-bytes": "^6.1.1",
        "tinyglobby": "^0.2.10",
        "workbox-build": "^7.4.1",
        "workbox-window": "^7.4.1"
      },
      "engines": {
        "node": ">=16.0.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/antfu"
      },
      "peerDependencies": {
        "@vite-pwa/assets-generator": "^1.0.0",
        "vite": "^3.1.0 || ^4.0.0 || ^5.0.0 || ^6.0.0 || ^7.0.0 || ^8.0.0",
        "workbox-build": "^7.4.1",
        "workbox-window": "^7.4.1"
      },
      "peerDependenciesMeta": {
        "@vite-pwa/assets-generator": {
          "optional": true
        }
      }
    },
    "node_modules/web-streams-polyfill": {
      "version": "3.3.3",
      "resolved": "https://registry.npmjs.org/web-streams-polyfill/-/web-streams-polyfill-3.3.3.tgz",
      "integrity": "sha512-d2JWLCivmZYTSIoge9MsgFCZrt571BikcWGYkjC1khllbTeDlGqZ2D8vD8E/lJa8WGWbb7Plm8/XJYV7IJHZZw==",
      "license": "MIT",
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/webidl-conversions": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/webidl-conversions/-/webidl-conversions-3.0.1.tgz",
      "integrity": "sha512-2JAn3z8AR6rjK8Sm8orRC0h/bcl/DqL7tRPdGZ4I1CjdF+EaMLmYxBHyXuKL849eucPFhvBoxMsflfOb8kxaeQ==",
      "dev": true,
      "license": "BSD-2-Clause"
    },
    "node_modules/whatwg-url": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/whatwg-url/-/whatwg-url-5.0.0.tgz",
      "integrity": "sha512-saE57nupxk6v3HY35+jzBwYa0rKSy0XR8JSxZPwgLr7ys0IBzhGviA1/TUGJLmSVqs8pb9AnvICXEuOHLprYTw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "tr46": "~0.0.3",
        "webidl-conversions": "^3.0.0"
      }
    },
    "node_modules/which": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/which/-/which-2.0.2.tgz",
      "integrity": "sha512-BLI3Tl1TW3Pvl70l3yq3Y64i+awpwXqsGBYWkkqMtnbXgrMD+yj7rhW0kuEDxzJaYXGjEW5ogapKNMEKNMjibA==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "isexe": "^2.0.0"
      },
      "bin": {
        "node-which": "bin/node-which"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/which-boxed-primitive": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/which-boxed-primitive/-/which-boxed-primitive-1.1.1.tgz",
      "integrity": "sha512-TbX3mj8n0odCBFVlY8AxkqcHASw3L60jIuF8jFP78az3C2YhmGvqbHBpAjTRH2/xqYunrJ9g1jSyjCjpoWzIAA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-bigint": "^1.1.0",
        "is-boolean-object": "^1.2.1",
        "is-number-object": "^1.1.1",
        "is-string": "^1.1.1",
        "is-symbol": "^1.1.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/which-builtin-type": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/which-builtin-type/-/which-builtin-type-1.2.1.tgz",
      "integrity": "sha512-6iBczoX+kDQ7a3+YJBnh3T+KZRxM/iYNPXicqk66/Qfm1b93iu+yOImkg0zHbj5LNOcNv1TEADiZ0xa34B4q6Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "function.prototype.name": "^1.1.6",
        "has-tostringtag": "^1.0.2",
        "is-async-function": "^2.0.0",
        "is-date-object": "^1.1.0",
        "is-finalizationregistry": "^1.1.0",
        "is-generator-function": "^1.0.10",
        "is-regex": "^1.2.1",
        "is-weakref": "^1.0.2",
        "isarray": "^2.0.5",
        "which-boxed-primitive": "^1.1.0",
        "which-collection": "^1.0.2",
        "which-typed-array": "^1.1.16"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/which-collection": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/which-collection/-/which-collection-1.0.2.tgz",
      "integrity": "sha512-K4jVyjnBdgvc86Y6BkaLZEN933SwYOuBFkdmBu9ZfkcAbdVbpITnDmjvZ/aQjRXQrv5EPkTnD1s39GiiqbngCw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-map": "^2.0.3",
        "is-set": "^2.0.3",
        "is-weakmap": "^2.0.2",
        "is-weakset": "^2.0.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/which-typed-array": {
      "version": "1.1.23",
      "resolved": "https://registry.npmjs.org/which-typed-array/-/which-typed-array-1.1.23.tgz",
      "integrity": "sha512-JMh8aK+1B/0bk/YNupICmH5MgCq6yNLKYQUfsZtSDLLCCmxUkHjUY+oOlIa90lO7lHN1woAfpenLdlKpXy9o+A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "available-typed-arrays": "^1.0.7",
        "call-bind": "^1.0.9",
        "call-bound": "^1.0.4",
        "for-each": "^0.3.5",
        "get-proto": "^1.0.1",
        "gopd": "^1.2.0",
        "has-tostringtag": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/workbox-background-sync": {
      "version": "7.4.1",
      "resolved": "https://registry.npmjs.org/workbox-background-sync/-/workbox-background-sync-7.4.1.tgz",
      "integrity": "sha512-HhT7KE8tOWDm02wRNshXUnUPofMlhenF2DBdUnDPOubhizzPeItkYTmAB6td1Z2cjYPa98vzEiPLEuzn5hN66g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "idb": "^7.0.1",
        "workbox-core": "7.4.1"
      }
    },
    "node_modules/workbox-broadcast-update": {
      "version": "7.4.1",
      "resolved": "https://registry.npmjs.org/workbox-broadcast-update/-/workbox-broadcast-update-7.4.1.tgz",
      "integrity": "sha512-uAlgslKLvbQY+suirIdnBCSYrcgBhjp81Nj4l1lj/Jmj0MJO2CJERnCJjT0GFVwmReV0N+zs78K6gqd5gr9/+A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "workbox-core": "7.4.1"
      }
    },
    "node_modules/workbox-build": {
      "version": "7.4.1",
      "resolved": "https://registry.npmjs.org/workbox-build/-/workbox-build-7.4.1.tgz",
      "integrity": "sha512-SDhxIvEAde9Gy/5w4Yo1Jh/M49Z0qE3q0oteyE8zGq0DScxFqVBcCtIXFuLtmtxRQZCMbf0prco4VyEu3KBQuw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@apideck/better-ajv-errors": "^0.3.1",
        "@babel/core": "^7.24.4",
        "@babel/preset-env": "^7.11.0",
        "@babel/runtime": "^7.11.2",
        "@rollup/plugin-babel": "^6.1.0",
        "@rollup/plugin-node-resolve": "^16.0.3",
        "@rollup/plugin-replace": "^6.0.3",
        "@rollup/plugin-terser": "^1.0.0",
        "@trickfilm400/rollup-plugin-off-main-thread": "^3.0.0-pre1",
        "ajv": "^8.6.0",
        "common-tags": "^1.8.0",
        "eta": "^4.5.1",
        "fast-json-stable-stringify": "^2.1.0",
        "fs-extra": "^9.0.1",
        "glob": "^11.0.1",
        "pretty-bytes": "^5.3.0",
        "rollup": "^4.53.3",
        "source-map": "^0.8.0-beta.0",
        "stringify-object": "^3.3.0",
        "strip-comments": "^2.0.1",
        "tempy": "^0.6.0",
        "upath": "^1.2.0",
        "workbox-background-sync": "7.4.1",
        "workbox-broadcast-update": "7.4.1",
        "workbox-cacheable-response": "7.4.1",
        "workbox-core": "7.4.1",
        "workbox-expiration": "7.4.1",
        "workbox-google-analytics": "7.4.1",
        "workbox-navigation-preload": "7.4.1",
        "workbox-precaching": "7.4.1",
        "workbox-range-requests": "7.4.1",
        "workbox-recipes": "7.4.1",
        "workbox-routing": "7.4.1",
        "workbox-strategies": "7.4.1",
        "workbox-streams": "7.4.1",
        "workbox-sw": "7.4.1",
        "workbox-window": "7.4.1"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/workbox-build/node_modules/pretty-bytes": {
      "version": "5.6.0",
      "resolved": "https://registry.npmjs.org/pretty-bytes/-/pretty-bytes-5.6.0.tgz",
      "integrity": "sha512-FFw039TmrBqFK8ma/7OL3sDz/VytdtJr044/QUJtH0wK9lb9jLq9tJyIxUwtQJHwar2BqtiA4iCWSwo9JLkzFg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/workbox-cacheable-response": {
      "version": "7.4.1",
      "resolved": "https://registry.npmjs.org/workbox-cacheable-response/-/workbox-cacheable-response-7.4.1.tgz",
      "integrity": "sha512-8xaFoJdDc2OjrlbbL3gEeBO1WKcMwRqwLRupgqahYXu75yXajPLuwrbXMrIGZuWYXrQwk0xDjOxZ/ujCy/oJYw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "workbox-core": "7.4.1"
      }
    },
    "node_modules/workbox-core": {
      "version": "7.4.1",
      "resolved": "https://registry.npmjs.org/workbox-core/-/workbox-core-7.4.1.tgz",
      "integrity": "sha512-DT+vu46eh/2vRsSHTY4Xmc32Z1rr9PRlQUXr1Dx30ZuXRWwOsvZgGgcwxcasubQLQmbTNYZjv44LkBAQ4tT5tQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/workbox-expiration": {
      "version": "7.4.1",
      "resolved": "https://registry.npmjs.org/workbox-expiration/-/workbox-expiration-7.4.1.tgz",
      "integrity": "sha512-lRKUF7b+OGbeXkQk1s6MHXOa3d7Xxf7Of31W6c6hCfipfIyrtdWZ89stq21AHZMaoG7VNFoHply4Ox+rU31TWg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "idb": "^7.0.1",
        "workbox-core": "7.4.1"
      }
    },
    "node_modules/workbox-google-analytics": {
      "version": "7.4.1",
      "resolved": "https://registry.npmjs.org/workbox-google-analytics/-/workbox-google-analytics-7.4.1.tgz",
      "integrity": "sha512-Mks1JwLEt++ZAkF6sS1OpSh9RtAMIsiDgRpK+codiHGIPXeaUOgi4cPc3GFadUl8V5QPeypEk8Oxgl3HlwVzHw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "workbox-background-sync": "7.4.1",
        "workbox-core": "7.4.1",
        "workbox-routing": "7.4.1",
        "workbox-strategies": "7.4.1"
      }
    },
    "node_modules/workbox-navigation-preload": {
      "version": "7.4.1",
      "resolved": "https://registry.npmjs.org/workbox-navigation-preload/-/workbox-navigation-preload-7.4.1.tgz",
      "integrity": "sha512-C4KVsjPcYKJOhr631AxR9XoG2rLF3QiTk5aMv36MXOjtWvm8axwNFAtKUPGsWUwLXXAMgYM1En7fsvndaXeXRQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "workbox-core": "7.4.1"
      }
    },
    "node_modules/workbox-precaching": {
      "version": "7.4.1",
      "resolved": "https://registry.npmjs.org/workbox-precaching/-/workbox-precaching-7.4.1.tgz",
      "integrity": "sha512-cdr/9qByww7yzEp7zg/qI4ukUrrNjQLgN+ONQRpjy/VqGQXwkgHwr00KksGJK8v0VifwDXBb8a4cWNZH71jn3Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "workbox-core": "7.4.1",
        "workbox-routing": "7.4.1",
        "workbox-strategies": "7.4.1"
      }
    },
    "node_modules/workbox-range-requests": {
      "version": "7.4.1",
      "resolved": "https://registry.npmjs.org/workbox-range-requests/-/workbox-range-requests-7.4.1.tgz",
      "integrity": "sha512-7i2oxAUE82gHdAJBCAQ04JzNOdRPqzuOzGfoUyJpFSmeqBNYGPrAH8GPoPjUQTfp+NycwrD2H68VtuF8qxv0vQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "workbox-core": "7.4.1"
      }
    },
    "node_modules/workbox-recipes": {
      "version": "7.4.1",
      "resolved": "https://registry.npmjs.org/workbox-recipes/-/workbox-recipes-7.4.1.tgz",
      "integrity": "sha512-gnbVfmV4/TtmQaM4x9AtuXhcdstJsep3XMVeztOrQVPT+R6+6DeBjGTCQ7fFCXm+4GEHUA5VEBTyi5+4gWGeog==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "workbox-cacheable-response": "7.4.1",
        "workbox-core": "7.4.1",
        "workbox-expiration": "7.4.1",
        "workbox-precaching": "7.4.1",
        "workbox-routing": "7.4.1",
        "workbox-strategies": "7.4.1"
      }
    },
    "node_modules/workbox-routing": {
      "version": "7.4.1",
      "resolved": "https://registry.npmjs.org/workbox-routing/-/workbox-routing-7.4.1.tgz",
      "integrity": "sha512-yubJGErZOusuidAenaL5ypfhQOa7urxP/f8E0ws7FPb4039RiWXUWBAyUkmUoOL/BcQGen3h0J8872d51IYxtA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "workbox-core": "7.4.1"
      }
    },
    "node_modules/workbox-strategies": {
      "version": "7.4.1",
      "resolved": "https://registry.npmjs.org/workbox-strategies/-/workbox-strategies-7.4.1.tgz",
      "integrity": "sha512-GZxpaw9NbmOelj7667uZ2kpk5BFpOGbO4X0qjwh5ls8XQ8C+Lha5LQchTiUzsTFSS+NlUpftYAyOVXvQUrcqOQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "workbox-core": "7.4.1"
      }
    },
    "node_modules/workbox-streams": {
      "version": "7.4.1",
      "resolved": "https://registry.npmjs.org/workbox-streams/-/workbox-streams-7.4.1.tgz",
      "integrity": "sha512-HWWtraKUbJknd9kgqGcpQ3G114HOPYvqs8HaJMDs2ebLNAimDkVDaWfAXE6Ybl+m8U6KsCE6pWyLYuigWmnAXw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "workbox-core": "7.4.1",
        "workbox-routing": "7.4.1"
      }
    },
    "node_modules/workbox-sw": {
      "version": "7.4.1",
      "resolved": "https://registry.npmjs.org/workbox-sw/-/workbox-sw-7.4.1.tgz",
      "integrity": "sha512-fez5f2DUlDJWTFYkCWQpY10N8gtztd849NswCbVFk0QlcSM4HT5A8x4g4ii650yem4I8tHY0R7JZahwp3ltIPw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/workbox-window": {
      "version": "7.4.1",
      "resolved": "https://registry.npmjs.org/workbox-window/-/workbox-window-7.4.1.tgz",
      "integrity": "sha512-notZDH2u8VXaqyuD7xaqIfEFi6SRM4SUSd7ewe9PDsVqADuepxX2ZMY3uvuZGxzY5ZOsGC/vD3A/3smFtJt4/A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/trusted-types": "^2.0.2",
        "workbox-core": "7.4.1"
      }
    },
    "node_modules/wrappy": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/wrappy/-/wrappy-1.0.2.tgz",
      "integrity": "sha512-l4Sp/DRseor9wL6EvV2+TuQn63dMkPjZ/sp9XkghTEbV9KlPS1xUsZ3u7/IQO4wxtcFB4bgpQPRcR3QCvezPcQ==",
      "license": "ISC"
    },
    "node_modules/ws": {
      "version": "8.22.0",
      "resolved": "https://registry.npmjs.org/ws/-/ws-8.22.0.tgz",
      "integrity": "sha512-Ydggc987+RO0AnWtZ/7Wq9FtNvcrL1b/RO0ud9mWjUPgDrsAAwQSF51sm2hm1XofbU/4jkpGEsLFsZZxU+1DOg==",
      "license": "MIT",
      "engines": {
        "node": ">=10.0.0"
      },
      "peerDependencies": {
        "bufferutil": "^4.0.1",
        "utf-8-validate": ">=5.0.2"
      },
      "peerDependenciesMeta": {
        "bufferutil": {
          "optional": true
        },
        "utf-8-validate": {
          "optional": true
        }
      }
    },
    "node_modules/yallist": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/yallist/-/yallist-3.1.1.tgz",
      "integrity": "sha512-a4UGQaWPH59mOXUYnAG2ewncQS4i4F43Tv3JoAM+s2VDAmS9NsK8GpDMLrCHPksFT7h3K6TOoUNn2pb7RoXx4g==",
      "dev": true,
      "license": "ISC"
    }
  }
}

```

---

## `package.json`

Project manifest: dependencies, devDependencies, and npm scripts.

```json
{
  "name": "panga-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "build": "tsc -b && vite build",
    "start": "node server.ts",
    "lint": "oxlint",
    "preview": "vite preview"
  },
  "dependencies": {
    "@emailjs/browser": "^4.4.1",
    "@google/genai": "^2.24.0",
    "dexie": "^4.4.6",
    "express": "^5.2.1",
    "flexsearch": "^0.8.212",
    "nodemailer": "^6.9.15",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "react-router-dom": "^7.18.4",
    "tsx": "^4.23.15"
  },
  "devDependencies": {
    "@types/express": "^5.0.6",
    "@types/node": "^24.13.3",
    "@types/nodemailer": "^6.4.16",
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.7",
    "@vercel/node": "^5.1.0",
    "@vitejs/plugin-react": "^6.1.1",
    "fake-indexeddb": "^6.2.5",
    "oxlint": "^1.81.0",
    "playwright-core": "^1.63.0",
    "typescript": "~6.0.2",
    "vite": "^8.3.0",
    "vite-plugin-pwa": "^1.3.0"
  }
}

```

---

## `public/favicon.svg`

Favicon SVG icon displayed in browser tabs and PWA install prompt.

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="46" fill="none" viewBox="0 0 48 46"><path fill="#863bff" d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" style="fill:#863bff;fill:color(display-p3 .5252 .23 1);fill-opacity:1"/><mask id="a" width="48" height="46" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path fill="#000" d="M25.842 44.938c-.664.844-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.183c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.498 0-3.579-1.842-3.579H1.133c-.92 0-1.456-1.04-.92-1.787L9.91.473c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.578 1.842 3.578h11.377c.943 0 1.473 1.088.89 1.832L25.843 44.94z" style="fill:#000;fill-opacity:1"/></mask><g mask="url(#a)"><g filter="url(#b)"><ellipse cx="5.508" cy="14.704" fill="#ede6ff" rx="5.508" ry="14.704" style="fill:#ede6ff;fill:color(display-p3 .9275 .9033 1);fill-opacity:1" transform="matrix(.00324 1 1 -.00324 -4.47 31.516)"/></g><g filter="url(#c)"><ellipse cx="10.399" cy="29.851" fill="#ede6ff" rx="10.399" ry="29.851" style="fill:#ede6ff;fill:color(display-p3 .9275 .9033 1);fill-opacity:1" transform="matrix(.00324 1 1 -.00324 -39.328 7.883)"/></g><g filter="url(#d)"><ellipse cx="5.508" cy="30.487" fill="#7e14ff" rx="5.508" ry="30.487" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(89.814 -25.913 -14.639)scale(1 -1)"/></g><g filter="url(#e)"><ellipse cx="5.508" cy="30.599" fill="#7e14ff" rx="5.508" ry="30.599" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(89.814 -32.644 -3.334)scale(1 -1)"/></g><g filter="url(#f)"><ellipse cx="5.508" cy="30.599" fill="#7e14ff" rx="5.508" ry="30.599" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="matrix(.00324 1 1 -.00324 -34.34 30.47)"/></g><g filter="url(#g)"><ellipse cx="14.072" cy="22.078" fill="#ede6ff" rx="14.072" ry="22.078" style="fill:#ede6ff;fill:color(display-p3 .9275 .9033 1);fill-opacity:1" transform="rotate(93.35 24.506 48.493)scale(-1 1)"/></g><g filter="url(#h)"><ellipse cx="3.47" cy="21.501" fill="#7e14ff" rx="3.47" ry="21.501" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(89.009 28.708 47.59)scale(-1 1)"/></g><g filter="url(#i)"><ellipse cx="3.47" cy="21.501" fill="#7e14ff" rx="3.47" ry="21.501" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(89.009 28.708 47.59)scale(-1 1)"/></g><g filter="url(#j)"><ellipse cx=".387" cy="8.972" fill="#7e14ff" rx="4.407" ry="29.108" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(39.51 .387 8.972)"/></g><g filter="url(#k)"><ellipse cx="47.523" cy="-6.092" fill="#7e14ff" rx="4.407" ry="29.108" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(37.892 47.523 -6.092)"/></g><g filter="url(#l)"><ellipse cx="41.412" cy="6.333" fill="#47bfff" rx="5.971" ry="9.665" style="fill:#47bfff;fill:color(display-p3 .2799 .748 1);fill-opacity:1" transform="rotate(37.892 41.412 6.333)"/></g><g filter="url(#m)"><ellipse cx="-1.879" cy="38.332" fill="#7e14ff" rx="4.407" ry="29.108" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(37.892 -1.88 38.332)"/></g><g filter="url(#n)"><ellipse cx="-1.879" cy="38.332" fill="#7e14ff" rx="4.407" ry="29.108" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(37.892 -1.88 38.332)"/></g><g filter="url(#o)"><ellipse cx="35.651" cy="29.907" fill="#7e14ff" rx="4.407" ry="29.108" style="fill:#7e14ff;fill:color(display-p3 .4922 .0767 1);fill-opacity:1" transform="rotate(37.892 35.651 29.907)"/></g><g filter="url(#p)"><ellipse cx="38.418" cy="32.4" fill="#47bfff" rx="5.971" ry="15.297" style="fill:#47bfff;fill:color(display-p3 .2799 .748 1);fill-opacity:1" transform="rotate(37.892 38.418 32.4)"/></g></g><defs><filter id="b" width="60.045" height="41.654" x="-19.77" y="16.149" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="7.659"/></filter><filter id="c" width="90.34" height="51.437" x="-54.613" y="-7.533" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="7.659"/></filter><filter id="d" width="79.355" height="29.4" x="-49.64" y="2.03" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="e" width="79.579" height="29.4" x="-45.045" y="20.029" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="f" width="79.579" height="29.4" x="-43.513" y="21.178" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="g" width="74.749" height="58.852" x="15.756" y="-17.901" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="7.659"/></filter><filter id="h" width="61.377" height="25.362" x="23.548" y="2.284" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="i" width="61.377" height="25.362" x="23.548" y="2.284" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="j" width="56.045" height="63.649" x="-27.636" y="-22.853" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="k" width="54.814" height="64.646" x="20.116" y="-38.415" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="l" width="33.541" height="35.313" x="24.641" y="-11.323" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="m" width="54.814" height="64.646" x="-29.286" y="6.009" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="n" width="54.814" height="64.646" x="-29.286" y="6.009" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="o" width="54.814" height="64.646" x="8.244" y="-2.416" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter><filter id="p" width="39.409" height="43.623" x="18.713" y="10.588" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17158" stdDeviation="4.596"/></filter></defs></svg>
```

---

## `public/icons.svg`

SVG sprite containing icon symbols: bluesky, discord, documentation, github, social, x.

```svg
<svg xmlns="http://www.w3.org/2000/svg">
  <symbol id="bluesky-icon" viewBox="0 0 16 17">
    <g clip-path="url(#bluesky-clip)"><path fill="#08060d" d="M7.75 7.735c-.693-1.348-2.58-3.86-4.334-5.097-1.68-1.187-2.32-.981-2.74-.79C.188 2.065.1 2.812.1 3.251s.241 3.602.398 4.13c.52 1.744 2.367 2.333 4.07 2.145-2.495.37-4.71 1.278-1.805 4.512 3.196 3.309 4.38-.71 4.987-2.746.608 2.036 1.307 5.91 4.93 2.746 2.72-2.746.747-4.143-1.747-4.512 1.702.189 3.55-.4 4.07-2.145.156-.528.397-3.691.397-4.13s-.088-1.186-.575-1.406c-.42-.19-1.06-.395-2.741.79-1.755 1.24-3.64 3.752-4.334 5.099"/></g>
    <defs><clipPath id="bluesky-clip"><path fill="#fff" d="M.1.85h15.3v15.3H.1z"/></clipPath></defs>
  </symbol>
  <symbol id="discord-icon" viewBox="0 0 20 19">
    <path fill="#08060d" d="M16.224 3.768a14.5 14.5 0 0 0-3.67-1.153c-.158.286-.343.67-.47.976a13.5 13.5 0 0 0-4.067 0c-.128-.306-.317-.69-.476-.976A14.4 14.4 0 0 0 3.868 3.77C1.546 7.28.916 10.703 1.231 14.077a14.7 14.7 0 0 0 4.5 2.306q.545-.748.965-1.587a9.5 9.5 0 0 1-1.518-.74q.191-.14.372-.293c2.927 1.369 6.107 1.369 8.999 0q.183.152.372.294-.723.437-1.52.74.418.838.963 1.588a14.6 14.6 0 0 0 4.504-2.308c.37-3.911-.63-7.302-2.644-10.309m-9.13 8.234c-.878 0-1.599-.82-1.599-1.82 0-.998.705-1.82 1.6-1.82.894 0 1.614.82 1.599 1.82.001 1-.705 1.82-1.6 1.82m5.91 0c-.878 0-1.599-.82-1.599-1.82 0-.998.705-1.82 1.6-1.82.893 0 1.614.82 1.599 1.82 0 1-.706 1.82-1.6 1.82"/>
  </symbol>
  <symbol id="documentation-icon" viewBox="0 0 21 20">
    <path fill="none" stroke="#aa3bff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.35" d="m15.5 13.333 1.533 1.322c.645.555.967.833.967 1.178s-.322.623-.967 1.179L15.5 18.333m-3.333-5-1.534 1.322c-.644.555-.966.833-.966 1.178s.322.623.966 1.179l1.534 1.321"/>
    <path fill="none" stroke="#aa3bff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.35" d="M17.167 10.836v-4.32c0-1.41 0-2.117-.224-2.68-.359-.906-1.118-1.621-2.08-1.96-.599-.21-1.349-.21-2.848-.21-2.623 0-3.935 0-4.983.369-1.684.591-3.013 1.842-3.641 3.428C3 6.449 3 7.684 3 10.154v2.122c0 2.558 0 3.838.706 4.726q.306.383.713.671c.76.536 1.79.64 3.581.66"/>
    <path fill="none" stroke="#aa3bff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.35" d="M3 10a2.78 2.78 0 0 1 2.778-2.778c.555 0 1.209.097 1.748-.047.48-.129.854-.503.982-.982.145-.54.048-1.194.048-1.749a2.78 2.78 0 0 1 2.777-2.777"/>
  </symbol>
  <symbol id="github-icon" viewBox="0 0 19 19">
    <path fill="#08060d" fill-rule="evenodd" d="M9.356 1.85C5.05 1.85 1.57 5.356 1.57 9.694a7.84 7.84 0 0 0 5.324 7.44c.387.079.528-.168.528-.376 0-.182-.013-.805-.013-1.454-2.165.467-2.616-.935-2.616-.935-.349-.91-.864-1.143-.864-1.143-.71-.48.051-.48.051-.48.787.051 1.2.805 1.2.805.695 1.194 1.817.857 2.268.649.064-.507.27-.857.49-1.052-1.728-.182-3.545-.857-3.545-3.87 0-.857.31-1.558.8-2.104-.078-.195-.349-1 .077-2.078 0 0 .657-.208 2.14.805a7.5 7.5 0 0 1 1.946-.26c.657 0 1.328.092 1.946.26 1.483-1.013 2.14-.805 2.14-.805.426 1.078.155 1.883.078 2.078.502.546.799 1.247.799 2.104 0 3.013-1.818 3.675-3.558 3.87.284.247.528.714.528 1.454 0 1.052-.012 1.896-.012 2.156 0 .208.142.455.528.377a7.84 7.84 0 0 0 5.324-7.441c.013-4.338-3.48-7.844-7.773-7.844" clip-rule="evenodd"/>
  </symbol>
  <symbol id="social-icon" viewBox="0 0 20 20">
    <path fill="none" stroke="#aa3bff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.35" d="M12.5 6.667a4.167 4.167 0 1 0-8.334 0 4.167 4.167 0 0 0 8.334 0"/>
    <path fill="none" stroke="#aa3bff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.35" d="M2.5 16.667a5.833 5.833 0 0 1 8.75-5.053m3.837.474.513 1.035c.07.144.257.282.414.309l.93.155c.596.1.736.536.307.965l-.723.73a.64.64 0 0 0-.152.531l.207.903c.164.715-.213.991-.84.618l-.872-.52a.63.63 0 0 0-.577 0l-.872.52c-.624.373-1.003.094-.84-.618l.207-.903a.64.64 0 0 0-.152-.532l-.723-.729c-.426-.43-.289-.864.306-.964l.93-.156a.64.64 0 0 0 .412-.31l.513-1.034c.28-.562.735-.562 1.012 0"/>
  </symbol>
  <symbol id="x-icon" viewBox="0 0 19 19">
    <path fill="#08060d" fill-rule="evenodd" d="M1.893 1.98c.052.072 1.245 1.769 2.653 3.77l2.892 4.114c.183.261.333.48.333.486s-.068.089-.152.183l-.522.593-.765.867-3.597 4.087c-.375.426-.734.834-.798.905a1 1 0 0 0-.118.148c0 .01.236.017.664.017h.663l.729-.83c.4-.457.796-.906.879-.999a692 692 0 0 0 1.794-2.038c.034-.037.301-.34.594-.675l.551-.624.345-.392a7 7 0 0 1 .34-.374c.006 0 .93 1.306 2.052 2.903l2.084 2.965.045.063h2.275c1.87 0 2.273-.003 2.266-.021-.008-.02-1.098-1.572-3.894-5.547-2.013-2.862-2.28-3.246-2.273-3.266.008-.019.282-.332 2.085-2.38l2-2.274 1.567-1.782c.022-.028-.016-.03-.65-.03h-.674l-.3.342a871 871 0 0 1-1.782 2.025c-.067.075-.405.458-.75.852a100 100 0 0 1-.803.91c-.148.172-.299.344-.99 1.127-.304.343-.32.358-.345.327-.015-.019-.904-1.282-1.976-2.808L6.365 1.85H1.8zm1.782.91 8.078 11.294c.772 1.08 1.413 1.973 1.425 1.984.016.017.241.02 1.05.017l1.03-.004-2.694-3.766L7.796 5.75 5.722 2.852l-1.039-.004-1.039-.004z" clip-rule="evenodd"/>
  </symbol>
</svg>

```

---

## `public/icons/icon-192.png`

PWA icon (192x192 PNG) for install banners and mobile homescreen.

```
[Binary file omitted]
```

---

## `public/icons/icon-512.png`

PWA icon (512x512 PNG) for install banners and high-resolution displays.

```
[Binary file omitted]
```

---

## `server.ts`

Express server: health endpoint, server-side Gemini API proxy, and Vite/static file serving.

```typescript
import express from "express";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

app.use(express.json({ limit: "10mb" }));

// Health check endpoint for Fly.io machine monitoring and health checks
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime(), timestamp: Date.now() });
});

// Server-side Gemini API route
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
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const tools: any[] = [];
    if (enableSearch) {
      tools.push({ googleSearch: {} });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction,
        tools: tools.length > 0 ? tools : undefined,
      },
    });

    res.json({
      text: response.text ?? "",
      functionCalls: response.functionCalls,
    });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.status(500).json({
      error: error?.message || "Failed to generate AI response.",
    });
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
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.use((req, res, next) => {
      if (req.method === "GET" && !req.path.startsWith("/api")) {
        res.sendFile(path.resolve(distPath, "index.html"));
      } else {
        next();
      }
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT} [NODE_ENV=${process.env.NODE_ENV || "development"}]`);
  });
}

start();
```

---

## `src/App.tsx`

Root React component: routing, auth guard, initial sync, and app-ready loading state.

```typescript
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import ProjectView from "./pages/ProjectView";
import Settings from "./pages/Settings";
import AppShell from "./components/AppShell";
import { ensureSeedData } from "./data/db";
import { syncAll, restoreSession } from "./sync/sync";
import { isLoggedIn } from "./auth/session";
import "./index.css";

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!isLoggedIn()) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void restoreSession().then(async () => {
      await ensureSeedData();
      if (isLoggedIn()) {
        try {
          await syncAll();
        } catch (e) {
          console.warn("Initial sync error:", e);
        }
      }
      setReady(true);
    });

    const handleFocus = () => {
      if (isLoggedIn()) {
        void syncAll();
      }
    };

    window.addEventListener("focus", handleFocus);
    // Periodically save/sync every 2 minutes if active
    const interval = setInterval(() => {
      if (isLoggedIn()) {
        void syncAll();
      }
    }, 120_000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, []);

  if (!ready) {
    return (
      <div className="page landing">
        <div className="landing-mark" data-tip="Panga">P</div>
        <h1>Panga</h1>
        <p>Project &amp; resource planner.</p>
        <p style={{ color: "var(--color-text-muted)" }}>Loading…</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/project/:projectId" element={<ProjectView />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

```

---

## `src/assets/hero.png`

Hero image asset (binary PNG).

```
[Binary file omitted]
```

---

## `src/assets/react.svg`

React logo SVG asset.

```svg
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="35.93" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 228"><path fill="#00D8FF" d="M210.483 73.824a171.49 171.49 0 0 0-8.24-2.597c.465-1.9.893-3.777 1.273-5.621c6.238-30.281 2.16-54.676-11.769-62.708c-13.355-7.7-35.196.329-57.254 19.526a171.23 171.23 0 0 0-6.375 5.848a155.866 155.866 0 0 0-4.241-3.917C100.759 3.829 77.587-4.822 63.673 3.233C50.33 10.957 46.379 33.89 51.995 62.588a170.974 170.974 0 0 0 1.892 8.48c-3.28.932-6.445 1.924-9.474 2.98C17.309 83.498 0 98.307 0 113.668c0 15.865 18.582 31.778 46.812 41.427a145.52 145.52 0 0 0 6.921 2.165a167.467 167.467 0 0 0-2.01 9.138c-5.354 28.2-1.173 50.591 12.134 58.266c13.744 7.926 36.812-.22 59.273-19.855a145.567 145.567 0 0 0 5.342-4.923a168.064 168.064 0 0 0 6.92 6.314c21.758 18.722 43.246 26.282 56.54 18.586c13.731-7.949 18.194-32.003 12.4-61.268a145.016 145.016 0 0 0-1.535-6.842c1.62-.48 3.21-.974 4.76-1.488c29.348-9.723 48.443-25.443 48.443-41.52c0-15.417-17.868-30.326-45.517-39.844Zm-6.365 70.984c-1.4.463-2.836.91-4.3 1.345c-3.24-10.257-7.612-21.163-12.963-32.432c5.106-11 9.31-21.767 12.459-31.957c2.619.758 5.16 1.557 7.61 2.4c23.69 8.156 38.14 20.213 38.14 29.504c0 9.896-15.606 22.743-40.946 31.14Zm-10.514 20.834c2.562 12.94 2.927 24.64 1.23 33.787c-1.524 8.219-4.59 13.698-8.382 15.893c-8.067 4.67-25.32-1.4-43.927-17.412a156.726 156.726 0 0 1-6.437-5.87c7.214-7.889 14.423-17.06 21.459-27.246c12.376-1.098 24.068-2.894 34.671-5.345a134.17 134.17 0 0 1 1.386 6.193ZM87.276 214.515c-7.882 2.783-14.16 2.863-17.955.675c-8.075-4.657-11.432-22.636-6.853-46.752a156.923 156.923 0 0 1 1.869-8.499c10.486 2.32 22.093 3.988 34.498 4.994c7.084 9.967 14.501 19.128 21.976 27.15a134.668 134.668 0 0 1-4.877 4.492c-9.933 8.682-19.886 14.842-28.658 17.94ZM50.35 144.747c-12.483-4.267-22.792-9.812-29.858-15.863c-6.35-5.437-9.555-10.836-9.555-15.216c0-9.322 13.897-21.212 37.076-29.293c2.813-.98 5.757-1.905 8.812-2.773c3.204 10.42 7.406 21.315 12.477 32.332c-5.137 11.18-9.399 22.249-12.634 32.792a134.718 134.718 0 0 1-6.318-1.979Zm12.378-84.26c-4.811-24.587-1.616-43.134 6.425-47.789c8.564-4.958 27.502 2.111 47.463 19.835a144.318 144.318 0 0 1 3.841 3.545c-7.438 7.987-14.787 17.08-21.808 26.988c-12.04 1.116-23.565 2.908-34.161 5.309a160.342 160.342 0 0 1-1.76-7.887Zm110.427 27.268a347.8 347.8 0 0 0-7.785-12.803c8.168 1.033 15.994 2.404 23.343 4.08c-2.206 7.072-4.956 14.465-8.193 22.045a381.151 381.151 0 0 0-7.365-13.322Zm-45.032-43.861c5.044 5.465 10.096 11.566 15.065 18.186a322.04 322.04 0 0 0-30.257-.006c4.974-6.559 10.069-12.652 15.192-18.18ZM82.802 87.83a323.167 323.167 0 0 0-7.227 13.238c-3.184-7.553-5.909-14.98-8.134-22.152c7.304-1.634 15.093-2.97 23.209-3.984a321.524 321.524 0 0 0-7.848 12.897Zm8.081 65.352c-8.385-.936-16.291-2.203-23.593-3.793c2.26-7.3 5.045-14.885 8.298-22.6a321.187 321.187 0 0 0 7.257 13.246c2.594 4.48 5.28 8.868 8.038 13.147Zm37.542 31.03c-5.184-5.592-10.354-11.779-15.403-18.433c4.902.192 9.899.29 14.978.29c5.218 0 10.376-.117 15.453-.343c-4.985 6.774-10.018 12.97-15.028 18.486Zm52.198-57.817c3.422 7.8 6.306 15.345 8.596 22.52c-7.422 1.694-15.436 3.058-23.88 4.071a382.417 382.417 0 0 0 7.859-13.026a347.403 347.403 0 0 0 7.425-13.565Zm-16.898 8.101a358.557 358.557 0 0 1-12.281 19.815a329.4 329.4 0 0 1-23.444.823c-7.967 0-15.716-.248-23.178-.732a310.202 310.202 0 0 1-12.513-19.846h.001a307.41 307.41 0 0 1-10.923-20.627a310.278 310.278 0 0 1 10.89-20.637l-.001.001a307.318 307.318 0 0 1 12.413-19.761c7.613-.576 15.42-.876 23.31-.876H128c7.926 0 15.743.303 23.354.883a329.357 329.357 0 0 1 12.335 19.695a358.489 358.489 0 0 1 11.036 20.54a329.472 329.472 0 0 1-11 20.722Zm22.56-122.124c8.572 4.944 11.906 24.881 6.52 51.026c-.344 1.668-.73 3.367-1.15 5.09c-10.622-2.452-22.155-4.275-34.23-5.408c-7.034-10.017-14.323-19.124-21.64-27.008a160.789 160.789 0 0 1 5.888-5.4c18.9-16.447 36.564-22.941 44.612-18.3ZM128 90.808c12.625 0 22.86 10.235 22.86 22.86s-10.235 22.86-22.86 22.86s-22.86-10.235-22.86-22.86s10.235-22.86 22.86-22.86Z"></path></svg>
```

---

## `src/assets/vite.svg`

Vite logo SVG asset.

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="77" height="47" fill="none" aria-labelledby="vite-logo-title" viewBox="0 0 77 47"><title id="vite-logo-title">Vite</title><style>.parenthesis{fill:#000}@media (prefers-color-scheme:dark){.parenthesis{fill:#fff}}</style><path fill="#9135ff" d="M40.151 45.71c-.663.844-2.02.374-2.02-.699V34.708a2.26 2.26 0 0 0-2.262-2.262H24.493c-.92 0-1.457-1.04-.92-1.788l7.479-10.471c1.07-1.498 0-3.578-1.842-3.578H15.443c-.92 0-1.456-1.04-.92-1.788l9.696-13.576c.213-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.472c-1.07 1.497 0 3.578 1.842 3.578h11.376c.944 0 1.474 1.087.89 1.83L40.153 45.712z"/><mask id="a" width="48" height="47" x="14" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path fill="#000" d="M40.047 45.71c-.663.843-2.02.374-2.02-.699V34.708a2.26 2.26 0 0 0-2.262-2.262H24.389c-.92 0-1.457-1.04-.92-1.788l7.479-10.472c1.07-1.497 0-3.578-1.842-3.578H15.34c-.92 0-1.456-1.04-.92-1.788l9.696-13.575c.213-.297.556-.474.92-.474H53.93c.92 0 1.456 1.04.92 1.788L47.37 13.03c-1.07 1.498 0 3.578 1.842 3.578h11.376c.944 0 1.474 1.088.89 1.831L40.049 45.712z"/></mask><g mask="url(#a)"><g filter="url(#b)"><ellipse cx="5.508" cy="14.704" fill="#eee6ff" rx="5.508" ry="14.704" transform="rotate(269.814 20.96 11.29)scale(-1 1)"/></g><g filter="url(#c)"><ellipse cx="10.399" cy="29.851" fill="#eee6ff" rx="10.399" ry="29.851" transform="rotate(89.814 -16.902 -8.275)scale(1 -1)"/></g><g filter="url(#d)"><ellipse cx="5.508" cy="30.487" fill="#8900ff" rx="5.508" ry="30.487" transform="rotate(89.814 -19.197 -7.127)scale(1 -1)"/></g><g filter="url(#e)"><ellipse cx="5.508" cy="30.599" fill="#8900ff" rx="5.508" ry="30.599" transform="rotate(89.814 -25.928 4.177)scale(1 -1)"/></g><g filter="url(#f)"><ellipse cx="5.508" cy="30.599" fill="#8900ff" rx="5.508" ry="30.599" transform="rotate(89.814 -25.738 5.52)scale(1 -1)"/></g><g filter="url(#g)"><ellipse cx="14.072" cy="22.078" fill="#eee6ff" rx="14.072" ry="22.078" transform="rotate(93.35 31.245 55.578)scale(-1 1)"/></g><g filter="url(#h)"><ellipse cx="3.47" cy="21.501" fill="#8900ff" rx="3.47" ry="21.501" transform="rotate(89.009 35.419 55.202)scale(-1 1)"/></g><g filter="url(#i)"><ellipse cx="3.47" cy="21.501" fill="#8900ff" rx="3.47" ry="21.501" transform="rotate(89.009 35.419 55.202)scale(-1 1)"/></g><g filter="url(#j)"><ellipse cx="14.592" cy="9.743" fill="#8900ff" rx="4.407" ry="29.108" transform="rotate(39.51 14.592 9.743)"/></g><g filter="url(#k)"><ellipse cx="61.728" cy="-5.321" fill="#8900ff" rx="4.407" ry="29.108" transform="rotate(37.892 61.728 -5.32)"/></g><g filter="url(#l)"><ellipse cx="55.618" cy="7.104" fill="#00c2ff" rx="5.971" ry="9.665" transform="rotate(37.892 55.618 7.104)"/></g><g filter="url(#m)"><ellipse cx="12.326" cy="39.103" fill="#8900ff" rx="4.407" ry="29.108" transform="rotate(37.892 12.326 39.103)"/></g><g filter="url(#n)"><ellipse cx="12.326" cy="39.103" fill="#8900ff" rx="4.407" ry="29.108" transform="rotate(37.892 12.326 39.103)"/></g><g filter="url(#o)"><ellipse cx="49.857" cy="30.678" fill="#8900ff" rx="4.407" ry="29.108" transform="rotate(37.892 49.857 30.678)"/></g><g filter="url(#p)"><ellipse cx="52.623" cy="33.171" fill="#00c2ff" rx="5.971" ry="15.297" transform="rotate(37.892 52.623 33.17)"/></g></g><path d="M6.919 0c-9.198 13.166-9.252 33.575 0 46.789h6.215c-9.25-13.214-9.196-33.623 0-46.789zm62.424 0h-6.215c9.198 13.166 9.252 33.575 0 46.789h6.215c9.25-13.214 9.196-33.623 0-46.789" class="parenthesis"/><defs><filter id="b" width="60.045" height="41.654" x="-5.564" y="16.92" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="7.659"/></filter><filter id="c" width="90.34" height="51.437" x="-40.407" y="-6.762" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="7.659"/></filter><filter id="d" width="79.355" height="29.4" x="-35.435" y="2.801" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="e" width="79.579" height="29.4" x="-30.84" y="20.8" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="f" width="79.579" height="29.4" x="-29.307" y="21.949" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="g" width="74.749" height="58.852" x="29.961" y="-17.13" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="7.659"/></filter><filter id="h" width="61.377" height="25.362" x="37.754" y="3.055" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="i" width="61.377" height="25.362" x="37.754" y="3.055" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="j" width="56.045" height="63.649" x="-13.43" y="-22.082" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="k" width="54.814" height="64.646" x="34.321" y="-37.644" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="l" width="33.541" height="35.313" x="38.847" y="-10.552" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="m" width="54.814" height="64.646" x="-15.081" y="6.78" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="n" width="54.814" height="64.646" x="-15.081" y="6.78" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="o" width="54.814" height="64.646" x="22.45" y="-1.645" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="p" width="39.409" height="43.623" x="32.919" y="11.36" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter></defs></svg>

```

---

## `src/auth/session.ts`

Session management: localStorage-based email/userId sessions, sign-in/sign-up with offline fallback, and snapshot restore.

```typescript
// src/auth/session.ts
// Manages the user session with cloud backend authentication and offline fallback.

const SESSION_EMAIL_KEY = "panga_session_email";
const SESSION_USER_ID_KEY = "panga_session_user_id";
const USERS_STORE_KEY = "panga_users_registry";

export interface AuthResult {
  error?: string;
  successMessage?: string;
  user?: { id: string; email: string };
}

export function getSessionEmail(): string | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  return localStorage.getItem(SESSION_EMAIL_KEY);
}

export function getSessionUserId(): string | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  return localStorage.getItem(SESSION_USER_ID_KEY);
}

export function isLoggedIn(): boolean {
  return !!getSessionEmail() && !!getSessionUserId();
}

export function setSession(email: string, userId: string): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  localStorage.setItem(SESSION_EMAIL_KEY, email);
  localStorage.setItem(SESSION_USER_ID_KEY, userId);
}

export function clearSession(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  localStorage.removeItem(SESSION_EMAIL_KEY);
  localStorage.removeItem(SESSION_USER_ID_KEY);
}

function generateUserId(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = (hash << 5) - hash + email.charCodeAt(i);
    hash |= 0;
  }
  return "usr_" + Math.abs(hash).toString(36) + "_" + Date.now().toString(36);
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return { error: "Email is required." };
  if (!password) return { error: "Password is required." };

  // Try backend cloud authentication first
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, password }),
    });
    const data = await res.json();
    if (res.ok && data.user) {
      setSession(data.user.email, data.user.id);
      return { user: data.user };
    } else if (res.status === 401 || res.status === 400) {
      return { error: data.error || "Invalid email or password." };
    }
  } catch (netErr) {
    console.warn("Backend login network error, falling back to local session:", netErr);
  }

  // Offline fallback
  try {
    const raw = localStorage.getItem(USERS_STORE_KEY);
    const users: Record<string, { id: string; passwordHash?: string }> = raw ? JSON.parse(raw) : {};

    if (users[cleanEmail]) {
      const user = users[cleanEmail];
      if (user.passwordHash && user.passwordHash !== password) {
        return { error: "Invalid password for this account." };
      }
      setSession(cleanEmail, user.id);
      return { user: { id: user.id, email: cleanEmail } };
    }

    const id = generateUserId(cleanEmail);
    users[cleanEmail] = { id, passwordHash: password };
    localStorage.setItem(USERS_STORE_KEY, JSON.stringify(users));
    setSession(cleanEmail, id);
    return { user: { id, email: cleanEmail } };
  } catch (err: any) {
    return { error: err?.message || "Failed to sign in." };
  }
}

/**
 * Restore a session from a snapshot import.
 * Creates/looks up a user ID for the email and sets the session
 * without password verification. Used when importing a snapshot
 * via the Quick Upload dropzone.
 */
export async function restoreSessionFromSnapshot(email: string): Promise<AuthResult> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return { error: "Email is required." };

  try {
    const raw = localStorage.getItem(USERS_STORE_KEY);
    const users: Record<string, { id: string; passwordHash?: string }> = raw ? JSON.parse(raw) : {};

    let id = users[cleanEmail]?.id;
    if (!id) {
      id = generateUserId(cleanEmail);
      users[cleanEmail] = { id, passwordHash: "" }; // no password for snapshot restore
      localStorage.setItem(USERS_STORE_KEY, JSON.stringify(users));
    }
    setSession(cleanEmail, id);
    return { user: { id, email: cleanEmail } };
  } catch (err: any) {
    return { error: err?.message || "Failed to restore session." };
  }
}

export async function signUp(email: string, password: string): Promise<AuthResult> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return { error: "Email is required." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  // Try backend cloud registration first
  try {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, password }),
    });
    const data = await res.json();
    if (res.ok && data.user) {
      setSession(data.user.email, data.user.id);
      return {
        user: data.user,
        successMessage: "Account created and connected to cloud!",
      };
    } else if (res.status === 400) {
      return { error: data.error || "Registration failed." };
    }
  } catch (netErr) {
    console.warn("Backend signup network error, falling back to local:", netErr);
  }

  // Offline fallback
  try {
    const raw = localStorage.getItem(USERS_STORE_KEY);
    const users: Record<string, { id: string; passwordHash?: string }> = raw ? JSON.parse(raw) : {};

    const id = users[cleanEmail]?.id || generateUserId(cleanEmail);
    users[cleanEmail] = { id, passwordHash: password };
    localStorage.setItem(USERS_STORE_KEY, JSON.stringify(users));
    setSession(cleanEmail, id);
    return {
      user: { id, email: cleanEmail },
      successMessage: `Account created successfully!`,
    };
  } catch (err: any) {
    return { error: err?.message || "Failed to create account." };
  }
}

export async function signOut(): Promise<void> {
  clearSession();
  window.location.assign("/");
}

export async function restoreSession(): Promise<void> {
  // Session is maintained in localStorage
}

```

---

## `src/components/AIAssistant.tsx`

Legacy AI assistant FAB panel (placeholder, superseded by AssistantPanel).

```typescript
import { useState } from "react";
import MicButton from "./MicButton";
import { newId } from "../data/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const PLACEHOLDER_REPLY =
  "I'm not connected to a real AI model yet — that wiring happens in a later stage. " +
  "Once connected, I'll be able to see this project's docs, tasks and resources and answer " +
  "with real context, help schedule your day, and pull up the links you need.";

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: newId(), role: "user", text };
    const replyMsg: Message = { id: newId(), role: "assistant", text: PLACEHOLDER_REPLY };
    setMessages((m) => [...m, userMsg, replyMsg]);
    setInput("");
  }

  return (
    <>
      <button
        className="ai-fab clickable"
        data-tip="Ask the assistant about this project"
        onClick={() => setOpen((o) => !o)}
        aria-label="AI Assistant"
      >
        AI
      </button>

      {open && (
        <div className="ai-panel drawer-anim">
          <header className="ai-panel-header">
            <span>Assistant</span>
            <button onClick={() => setOpen(false)} aria-label="Close">✕</button>
          </header>

          <div className="ai-panel-messages">
            {messages.length === 0 ? (
              <p className="empty-state">
                Ask about anything in this project — docs, tasks, resources, or your schedule.
              </p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`ai-msg ai-msg-${m.role}`}>
                  {m.text}
                </div>
              ))
            )}
          </div>

          <form className="ai-panel-input" onSubmit={send}>
            <input
              type="text"
              placeholder="Ask the assistant..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <MicButton onResult={(text) => setInput(text)} />
            <button type="submit" className="btn-primary">Send</button>
          </form>
        </div>
      )}
    </>
  );
}

```

---

## `src/components/AppShell.tsx`

Persistent app shell: header with sync status badge, user email, save button, and logout.

```typescript
import { Link, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import GlobalSearch from "./GlobalSearch";
import AssistantPanel from "./AssistantPanel";
import { getSessionEmail } from "../auth/session";
import { signOut, subscribeSyncStatus, syncAll } from "../sync/sync";

export default function AppShell() {
  const email = getSessionEmail();
  const [syncState, setSyncState] = useState<{ status: string; message: string; timestamp: number }>({
    status: "idle",
    message: "",
    timestamp: 0,
  });

  useEffect(() => {
    const unsubscribe = subscribeSyncStatus((status, message) => {
      setSyncState({ status, message: message || "", timestamp: Date.now() });
    });
    return unsubscribe;
  }, []);

  async function handleLogout() {
    await signOut();
  }

  async function handleManualSync() {
    const result = await syncAll();
    setSyncState({ status: result.ok ? "synced" : "error", message: result.message, timestamp: Date.now() });
  }

  const statusColors: Record<string, string> = {
    idle: "var(--color-text-muted)",
    syncing: "#f59e0b",
    synced: "#10b981",
    error: "#ef4444",
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/dashboard" className="app-logo clickable" data-tip="Back to your project dashboard">
          Panga
        </Link>
        <GlobalSearch />
        <Link
          to="/settings"
          className="btn-secondary btn-small clickable"
          data-tip="Settings: API keys, backup & restore"
        >
          Settings
        </Link>
        <span
          className="user-email"
          style={{
            fontSize: "12px",
            color: "var(--color-text-muted)",
            marginRight: "8px",
            maxWidth: "160px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={email || ""}
        >
          {email || ""}
        </span>
        <button
          className="btn-secondary btn-small clickable"
          onClick={handleManualSync}
          disabled={syncState.status === "syncing"}
          style={{ marginRight: "8px" }}
          data-tip={syncState.message || "Save changes locally"}
        >
          {syncState.status === "syncing" ? "⟳ Saving..." : "💾 Save"}
        </button>
        <span
          className="sync-status"
          style={{
            fontSize: "11px",
            color: statusColors[syncState.status] || "var(--color-text-muted)",
            marginRight: "8px",
            fontFamily: "monospace",
          }}
          title={syncState.message || "Local storage"}
        >
          {syncState.status === "idle" 
            ? "⏸" 
            : syncState.status === "syncing" 
              ? "⟳" 
              : syncState.status === "synced" 
                ? "✓" 
                : "✗"}
        </span>
        <span
          className="offline-badge"
          style={{
            fontSize: "11px",
            color: "var(--color-text-muted)",
            marginRight: "8px",
            fontFamily: "monospace",
          }}
          title="Offline-first mode"
        >
          📱 Offline
        </span>
        <button
          className="btn-secondary btn-small clickable logout-btn"
          data-tip={email ? `Signed in as ${email} — click to log out` : "Log out"}
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <AssistantPanel />
    </div>
  );
}
```

---

## `src/components/AssistantPanel.tsx`

AI Assistant drawer: chat UI, conversation history, action proposals with user approval, and clarification flow.

```typescript
import { useEffect, useRef, useState } from "react";
import {
  listConversations,
  createConversation,
  listMessages,
  addMessage,
  deleteConversation,
  pruneExpiredConversations,
  type Message,
} from "../data/conversations";
import { getGeminiApiKey } from "../data/settings";
import { listAllProjects, createProject } from "../data/projects";
import { listAllTasks, createTask, updateTask, deleteTask } from "../data/tasks";
import { createMilestone } from "../data/milestones";
import { createReminder } from "../data/reminders";
import { createInsight } from "../data/insights";
import { createResource } from "../data/resources";
import { db } from "../data/db";
import { newId } from "../data/utils";
import MicButton from "../components/MicButton";
import { useAsync } from "../components/ui";

interface ActionProposal {
  type:
    | "create_task"
    | "update_task"
    | "delete_task"
    | "create_project"
    | "create_milestone"
    | "create_reminder"
    | "create_insight"
    | "create_link"
    | "add_subcategory";
  description: string;
  data: any;
}

export default function AssistantPanel() {
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [composing, setComposing] = useState(false);
  const [clarifying, setClarifying] = useState<{ question: string; options: string[] } | null>(null);
  const [approvals, setApprovals] = useState<
    { id: string; description: string; action: () => Promise<void> }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  const conversations = useAsync(listConversations, []);
  const messages = useAsync(
    () => (conversationId ? listMessages(conversationId) : Promise.resolve([] as Message[])),
    [conversationId]
  );

  useEffect(() => {
    pruneExpiredConversations();
  }, []);

  async function startNew() {
    const c = await createConversation("New conversation");
    setConversationId(c.id);
    setOpen(true);
    conversations.reload();
  }

  async function buildSystemInstruction(): Promise<string> {
    const [projects, tasks, milestones] = await Promise.all([
      listAllProjects(),
      listAllTasks(),
      db.milestones.toArray(),
    ]);

    const projList = projects
      .map((p) => `- Project "${p.name}" (id: ${p.id}): ${p.description || "no description"} [status: ${p.status}]`)
      .join("\n");
    const taskList = tasks
      .slice(0, 50)
      .map(
        (t) =>
          `- Task "${t.title}" (id: ${t.id}, project: ${t.projectId}): [status: ${t.status}, executor: ${t.executor}${
            t.scheduledAt ? `, scheduled: ${new Date(t.scheduledAt).toLocaleString()}` : ""
          }]`
      )
      .join("\n");
    const milestoneList = milestones
      .map((m) => `- Milestone "${m.title}" (id: ${m.id}, project: ${m.projectId}): ${m.description || "no description"} [status: ${m.status}]`)
      .join("\n");

    return `You are Panga's intelligent personal assistant and agent.
Panga is a personal, offline-first project and resource planner.

Core principles & instructions:
1. Upload & storage philosophy: Panga never stores binary files, only text and cloud links. For images and PDFs, links to Google Drive (or any cloud drive) are stored. For text documents (.txt, .md), their contents are parsed into text.
2. PDF guidance: If asked about PDFs or ingesting PDF documents, explain the upload rule: recommend free, self-service tools such as ilovepdf.com/pdf_to_text to convert the PDF to plain text, and paste that text into Notes or Insights, or store the PDF in Google Drive and paste the share link.
3. Milestones: Milestones are goals with a title and a description body context. Use them to understand user goals, suggest task breakdowns, set reminders, and schedule action items.
4. Agent actions with user approval: You have the ability to read, write, edit, add subcategories, add projects, add tasks, delete tasks, check/tick off tasks, add milestones, add reminders, and save insights.
Whenever the user asks you to perform an action (or when you suggest concrete actions that should be executed), explain what you are doing in your message, and append machine-readable ACTION blocks at the very end of your response, one per action, like this:
ACTION:{"type":"create_task","description":"Add task '...' to project '...'","data":{"projectId":"...","title":"...","notes":"...","executor":"ai"|"manual","scheduledAt":null}}
ACTION:{"type":"update_task","description":"Mark task '...' as completed","data":{"id":"...","status":"completed"}}
ACTION:{"type":"delete_task","description":"Delete task '...'","data":{"id":"..."}}
ACTION:{"type":"create_project","description":"Create project '...'","data":{"name":"...","description":"..."}}
ACTION:{"type":"create_milestone","description":"Create milestone '...'","data":{"projectId":"...","title":"...","description":"..."}}
ACTION:{"type":"create_reminder","description":"Set reminder '...'","data":{"message":"...","triggerAt":1234567890,"projectId":"..."}}
ACTION:{"type":"create_insight","description":"Save insight '...'","data":{"projectId":"...","title":"...","body":"...","type":"note"}}
ACTION:{"type":"create_link","description":"Save link '...'","data":{"url":"https://...","title":"...","description":"...","projectId":null}}
ACTION:{"type":"add_subcategory","description":"Add shared subcategory '...'","data":{"category":"notes","name":"..."}}

If the user's request is ambiguous or missing a critical choice, you can instead ask a clarifying question by starting your response with:
CLARIFY: Question text || Option 1 || Option 2 || Option 3

Current application state:
Projects:
${projList || "None"}

Tasks:
${taskList || "None"}

Milestones:
${milestoneList || "None"}
`;
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const userText = text.trim();
    if (!userText) return;

    let convId = conversationId;
    if (!convId) {
      const c = await createConversation(userText.slice(0, 30));
      convId = c.id;
      setConversationId(c.id);
      conversations.reload();
    }

    setError(null);
    setComposing(true);
    await addMessage(convId, "user", userText);
    setText("");
    messages.reload();

    try {
      const clientApiKey = await getGeminiApiKey();
      const allMsgs = await listMessages(convId);
      const systemInstruction = await buildSystemInstruction();
      const needsSearch = /\b(search|research|look up|find online|latest|what is|news)\b/i.test(userText);

      const contents = allMsgs.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      }));

      // Call server-side proxy route
      let reply = "";
      try {
        const res = await fetch("/api/assistant/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            systemInstruction,
            enableSearch: needsSearch,
            clientApiKey: clientApiKey || undefined,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          reply = data.text ?? "";
        } else {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with ${res.status}`);
        }
      } catch (serverErr) {
        // Fallback to client-side direct call if client has custom API key
        if (clientApiKey) {
          const fallbackRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${clientApiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                system_instruction: { parts: [{ text: systemInstruction }] },
                contents,
              }),
            }
          );
          const fallbackData = await fallbackRes.json();
          reply = fallbackData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        } else {
          throw serverErr;
        }
      }

      if (!reply) throw new Error("Empty response received from the assistant.");

      // Check for clarification
      if (reply.startsWith("CLARIFY:")) {
        const parts = reply.replace("CLARIFY:", "").split("||");
        setClarifying({
          question: parts[0].trim(),
          options: parts.slice(1).map((p: string) => p.trim()).filter(Boolean),
        });
        setComposing(false);
        return;
      }

      // Parse ACTION: blocks
      const lines = reply.split(/\r?\n/);
      const actionProposals: ActionProposal[] = [];
      const cleanLines: string[] = [];

      for (const line of lines) {
        if (line.trim().startsWith("ACTION:")) {
          try {
            const rawJson = line.trim().slice(7).trim();
            const parsed = JSON.parse(rawJson) as ActionProposal;
            if (parsed && parsed.type) {
              actionProposals.push(parsed);
            }
          } catch (e) {
            console.warn("Failed to parse action line:", line, e);
          }
        } else {
          cleanLines.push(line);
        }
      }

      const cleanReply = cleanLines.join("\n").trim();
      if (cleanReply) {
        await addMessage(convId, "assistant", cleanReply);
        messages.reload();
      }

      // Convert parsed actions to approval items
      if (actionProposals.length > 0) {
        const newApprovals = actionProposals.map((act) => ({
          id: newId(),
          description: act.description || `Execute ${act.type}`,
          action: async () => {
            await executeAction(act);
            await addMessage(convId!, "assistant", `Approved and executed: ${act.description}`);
            window.dispatchEvent(new Event("panga-data-updated"));
            messages.reload();
          },
        }));
        setApprovals((prev) => [...prev, ...newApprovals]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Assistant error occurred.");
    } finally {
      setComposing(false);
    }
  }

  async function executeAction(act: ActionProposal): Promise<void> {
    const { type, data } = act;
    switch (type) {
      case "create_task": {
        const defaultProj = (await listAllProjects())[0];
        const projId = data.projectId || defaultProj?.id;
        if (!projId) throw new Error("No project found to attach task to.");
        await createTask({
          projectId: projId,
          title: data.title,
          notes: data.notes ?? "",
          executor: data.executor ?? "manual",
          scheduledAt: data.scheduledAt ? Number(data.scheduledAt) : null,
          dueDate: data.dueDate ? Number(data.dueDate) : null,
          tags: data.tags ?? [],
        });
        break;
      }
      case "update_task": {
        if (!data.id) throw new Error("Task id missing.");
        await updateTask(data.id, data);
        break;
      }
      case "delete_task": {
        if (!data.id) throw new Error("Task id missing.");
        await deleteTask(data.id);
        break;
      }
      case "create_project": {
        await createProject({
          name: data.name,
          description: data.description ?? "",
        });
        break;
      }
      case "create_milestone": {
        const defaultProj = (await listAllProjects())[0];
        const projId = data.projectId || defaultProj?.id;
        if (!projId) throw new Error("No project found to attach milestone to.");
        await createMilestone({
          projectId: projId,
          title: data.title,
          description: data.description ?? "",
          targetDate: data.targetDate ? Number(data.targetDate) : null,
        });
        break;
      }
      case "create_reminder": {
        const currentTime = Date.now();
        await createReminder({
          message: data.message,
          triggerAt: data.triggerAt ? Number(data.triggerAt) : currentTime + 3600000,
          projectId: data.projectId ?? null,
        });
        break;
      }
      case "create_insight": {
        const defaultProj = (await listAllProjects())[0];
        const projId = data.projectId || defaultProj?.id;
        if (!projId) throw new Error("No project found to attach insight to.");
        await createInsight({
          projectId: projId,
          title: data.title,
          body: data.body ?? null,
          type: data.type ?? "note",
          link: data.link ?? null,
          tags: data.tags ?? [],
        });
        break;
      }
      case "create_link": {
        await createResource({
          category: "links",
          title: data.title || data.url,
          url: data.url,
          body: data.description || data.body || null,
          projectId: data.projectId || null,
          tags: data.tags || [],
          provider: data.provider || "other",
        });
        break;
      }
      case "add_subcategory": {
        const cat = data.category || "notes";
        const name = (data.name || "").trim().toLowerCase().replace(/\s+/g, "_");
        if (name) {
          const stored = localStorage.getItem("panga-subcategories-global");
          const existing = stored ? JSON.parse(stored) : {};
          existing[cat] = [...(existing[cat] || []), name].filter((v, i, a) => a.indexOf(v) === i);
          localStorage.setItem("panga-subcategories-global", JSON.stringify(existing));
        }
        break;
      }
      default:
        console.warn("Unknown action type:", type);
    }
  }

  function resolveClarify(option: string) {
    if (!conversationId) return;
    setClarifying(null);
    setText(`${text} [Selected: ${option}]`);
    setComposing(true);
    void handleSend({ preventDefault: () => {} } as React.FormEvent);
  }

  function dismissClarify() {
    setClarifying(null);
  }

  async function approve(id: string) {
    const item = approvals.find((a) => a.id === id);
    if (!item) return;
    setApprovals((prev) => prev.filter((a) => a.id !== id));
    try {
      await item.action();
      messages.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approval failed.");
    }
  }

  function dismissApproval(id: string) {
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  }

  const fabRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={fabRef}
        type="button"
        className="assistant-fab clickable"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="assistant-panel"
        data-tip="Open the AI Assistant agent"
      >
        AI
      </button>

      {open && (
        <div
          id="assistant-panel"
          className="drawer-backdrop drawer-backdrop-right"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Assistant"
        >
          <div className="drawer-panel assistant-panel" onClick={(e) => e.stopPropagation()}>
            <header className="drawer-header">
              <h2>Assistant &amp; Agent</h2>
              <div className="btn-row">
                <button
                  type="button"
                  className="btn-icon clickable"
                  onClick={startNew}
                  data-tip="Start a new conversation"
                >
                  +
                </button>
                <button
                  type="button"
                  className="btn-icon clickable"
                  onClick={() => setOpen(false)}
                  data-tip="Close the assistant"
                >
                  Close
                </button>
              </div>
            </header>

            <div className="assistant-tabs">
              <button
                type="button"
                className={`tab-btn clickable ${conversationId === null ? "tab-btn-active" : ""}`}
                onClick={() => {
                  setConversationId(null);
                  setError(null);
                }}
                data-tip="View conversation history"
              >
                History
              </button>
            </div>

            <div className="drawer-body" style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
              {conversationId === null ? (
                <ConversationList
                  conversations={conversations.data ?? []}
                  onSelect={(id) => {
                    setConversationId(id);
                    setError(null);
                  }}
                  onDelete={async (id) => {
                    await deleteConversation(id);
                    conversations.reload();
                  }}
                />
              ) : (
                <>
                  {error && (
                    <div className="error-banner" style={{ margin: "8px 12px", padding: 8 }}>
                      <p style={{ margin: 0, fontSize: 13 }}>{error}</p>
                      <button
                        type="button"
                        className="btn-secondary btn-small clickable"
                        style={{ marginTop: 6 }}
                        onClick={() => setError(null)}
                        data-tip="Dismiss error"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}

                  <div className="assistant-log" role="log" aria-live="polite">
                    {(messages.data ?? []).length === 0 ? (
                      <p className="empty-state" style={{ margin: "auto", textAlign: "center" }}>
                        Ask me anything about your projects, tasks, schedule, or resources.
                        <br />
                        <span className="text-tiny" style={{ color: "var(--color-text-muted)" }}>
                          I can plan tasks, schedule your day, search the web, and guide you on converting PDFs to text.
                        </span>
                      </p>
                    ) : (
                      (messages.data ?? []).map((m) => (
                        <div
                          key={m.id}
                          className={`assistant-message ${
                            m.role === "user" ? "assistant-message-user" : "assistant-message-assistant"
                          }`}
                        >
                          {m.text}
                        </div>
                      ))
                    )}
                  </div>

                  {clarifying && (
                    <div className="clarify-box" role="alertdialog" aria-label="Clarification needed">
                      <p className="clarify-prompt">{clarifying.question}</p>
                      <div className="clarify-options">
                        {clarifying.options.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            className="btn-secondary btn-small clickable"
                            onClick={() => resolveClarify(opt)}
                            data-tip="Answer with this option"
                          >
                            {opt}
                          </button>
                        ))}
                        <button
                          type="button"
                          className="btn-secondary btn-small clickable"
                          onClick={dismissClarify}
                          data-tip="Dismiss the question"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  )}

                  <form className="assistant-composer" onSubmit={handleSend}>
                    <div className="inline-form" style={{ flex: 1, marginBottom: 0 }}>
                      <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Ask, plan, or command actions..."
                        disabled={composing}
                        aria-label="Your message"
                      />
                      <MicButton onResult={setText} />
                    </div>
                    <button type="submit" className="btn-primary clickable" disabled={composing || !text.trim()}>
                      {composing ? "Thinking..." : "Send"}
                    </button>
                  </form>
                </>
              )}
            </div>

            {approvals.length > 0 && (
              <div className="approval-box" role="alertdialog" aria-label="Waiting for approval">
                <h3>Agent Action Approval ({approvals.length})</h3>
                <div className="approval-list">
                  {approvals.map((a) => (
                    <div key={a.id} className="approval-item">
                      <span>{a.description}</span>
                      <div className="btn-row">
                        <button
                          type="button"
                          className="btn-primary btn-small clickable"
                          onClick={() => approve(a.id)}
                          data-tip="Approve and execute this action"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="btn-secondary btn-small clickable"
                          onClick={() => dismissApproval(a.id)}
                          data-tip="Discard this action"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function ConversationList({
  conversations,
  onSelect,
  onDelete,
}: {
  conversations: { id: string; title: string; updatedAt: number }[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (conversations.length === 0) {
    return (
      <div className="empty-state" style={{ textAlign: "center", padding: 24 }}>
        No conversations yet. Click + to start one.
      </div>
    );
  }
  return (
    <ul className="activity-list" style={{ flex: 1, overflow: "auto" }}>
      {conversations.map((c) => (
        <li key={c.id} className="activity-item" style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <button
            type="button"
            className="editable-view clickable"
            style={{ flex: 1, textAlign: "left", padding: 6, background: "none", border: "none" }}
            onClick={() => onSelect(c.id)}
          >
            <div className="activity-title" style={{ fontWeight: 600 }}>{c.title}</div>
            <div className="activity-time text-tiny">{new Date(c.updatedAt).toLocaleString()}</div>
          </button>
          <button
            type="button"
            className="btn-icon btn-icon-danger clickable"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(c.id);
            }}
            data-tip="Delete this conversation"
            data-tip-edge="left"
          >
            Del
          </button>
        </li>
      ))}
    </ul>
  );
}

```

---

## `src/components/GlobalSearch.tsx`

Global search overlay: Ctrl+K trigger, fuzzy search across all entities, deep-link results.

```typescript
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { globalSearch, type SearchResult } from "../search/search";

const TYPE_ICON: Record<SearchResult["type"], string> = {
  project: "[",
  task: "-",
  resource: "#",
  milestone: "*",
  issue: "!",
  docEntry: "=",
  setting: "@",
  savedFile: "\u00e6", // file glyph
  insight: "i",
};

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  useEffect(() => {
    let cancelled = false;
    globalSearch(query).then((r) => {
      if (!cancelled) setResults(r);
    });
    return () => {
      cancelled = true;
    };
  }, [query]);

  function goTo(result: SearchResult) {
    setOpen(false);
    setQuery("");
    if (result.action === "openSettings") {
      navigate("/settings", { state: { focus: result.target } });
    } else if (result.action === "navigate" && result.target) {
      navigate(result.target);
    }
  }

  return (
    <>
      <button
        className="global-search-trigger clickable"
        data-tip="Global search: query settings, platform features, or open saved files"
        onClick={() => setOpen(true)}
      >
        <span>[ Search ]</span>
        <kbd>Ctrl K</kbd>
      </button>

      {open && (
        <div className="search-overlay" onClick={() => setOpen(false)}>
          <div className="search-panel search-panel-open" onClick={(e) => e.stopPropagation()}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search projects, tasks, resources, milestones, issues, docs, settings, files..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="search-results">
              {query.trim() === "" ? (
                <p className="empty-state">Start typing to search across everything.</p>
              ) : results.length === 0 ? (
                <p className="empty-state">No matches.</p>
              ) : (
                results.map((r) => (
                  <button
                    key={`${r.type}-${r.id}`}
                    className="search-result-row clickable"
                    onClick={() => goTo(r)}
                  >
                    <span className="search-result-icon">{TYPE_ICON[r.type]}</span>
                    <span className="search-result-text">
                      <span className="search-result-title">{r.title}</span>
                      <span className="search-result-subtitle">
                        {r.subtitle} · {r.projectName}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

```

---

## `src/components/MicButton.tsx`

Microphone button wrapping the voice input hook for speech-to-text.

```typescript
import { useVoiceInput } from "./useVoiceInput";

interface Props {
  onResult: (text: string) => void;
}

export default function MicButton({ onResult }: Props) {
  const { listening, start, stop, supported } = useVoiceInput(onResult);
  if (!supported) return null;

  return (
    <button
      type="button"
      className={`mic-btn ${listening ? "mic-btn-active" : ""}`}
      onClick={listening ? stop : start}
      aria-label={listening ? "Stop recording" : "Start voice input"}
      title={listening ? "Listening... click to stop" : "Click to speak"}
      data-tip={listening ? "Listening... click to stop" : "Click to speak"}
    >
      {listening ? "● REC" : "MIC"}
    </button>
  );
}
```

---

## `src/components/ProgressBar.tsx`

Progress bar component showing task completion percentage and pending count.

```typescript
interface Props {
  percent: number;
  pending?: number;
}

export default function ProgressBar({ percent, pending }: Props) {
  const tip =
    pending === undefined
      ? `${percent}% complete`
      : `${percent}% complete · ${pending} pending task${pending === 1 ? "" : "s"}`;
  return (
    <div className="progress-track" aria-label={`${percent}% complete`} data-tip={tip}>
      <div className="progress-fill" style={{ width: `${percent}%` }} />
    </div>
  );
}

```

---

## `src/components/ProjectCard.tsx`

Project card: displays name, description, progress bar, and inline rename/delete actions.

```typescript
import { useState } from "react";
import { Link } from "react-router-dom";
import type { Project } from "../data/db";
import ProgressBar from "./ProgressBar";
import { updateProject, deleteProject } from "../data/projects";

interface Props {
  project: Project;
  progress: number;
  pending?: number;
  onChange: () => void;
}

export default function ProjectCard({ project, progress, pending, onChange }: Props) {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(project.name);

  async function saveRename(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    const trimmed = name.trim();
    if (trimmed && trimmed !== project.name) {
      await updateProject(project.id, { name: trimmed });
    }
    setRenaming(false);
    onChange();
  }

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${project.name}" and everything in it? This can't be undone.`)) return;
    await deleteProject(project.id);
    onChange();
  }

  if (renaming) {
    return (
      <form
        className="project-card project-card-editing"
        onSubmit={saveRename}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
        <div className="project-card-actions">
          <button type="submit" className="btn-primary btn-small clickable">Save</button>
          <button
            type="button"
            className="btn-secondary btn-small clickable"
            onClick={(e) => { e.stopPropagation(); setName(project.name); setRenaming(false); }}
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <Link to={`/project/${project.id}`} className="project-card clickable">
      <div className="project-card-top">
        <h3>{project.name}</h3>
        <div className="project-card-actions">
          <button
            type="button"
            className="btn-icon clickable"
            data-tip="Rename project"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setRenaming(true); }}
          >
            Edit
          </button>
          <button
            type="button"
            className="btn-icon clickable"
            data-tip="Delete project"
            onClick={handleDelete}
          >
            Del
          </button>
        </div>
      </div>
      {project.description && <p>{project.description}</p>}
      <ProgressBar percent={progress} pending={pending} />
      <span className="progress-label">{progress}% complete</span>
    </Link>
  );
}

```

---

## `src/components/home/HomeCalendarTab.tsx`

Home calendar: month grid and list views, .ics import from Google Calendar, and local event creation.

```typescript
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

```

---

## `src/components/home/HomeContactsTab.tsx`

Home contacts view: add, edit, link to projects, filter by type, and delete contacts.

```typescript
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  listAllContacts,
  createContact,
  updateContact,
  deleteContact,
  contactHref,
  CONTACT_TYPE_LABELS,
  linkedProjectIds,
  type Contact,
} from "../../data/contacts";
import { listAllProjects } from "../../data/projects";
import MicButton from "../../components/MicButton";
import { Editable, ErrorNote, Loading, StatusLabel, useAsync } from "../../components/ui";

export default function HomeContactsTab() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | "email" | "phone" | "link">("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"email" | "phone" | "link">("email");
  const [newValue, setNewValue] = useState("");
  const [newTags, setNewTags] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);

  const { data, error, loading, reload, setData } = useAsync(listAllContacts, []);

  useEffect(() => {
    listAllProjects().then((projs) => {
      setProjects(projs.map((p) => ({ id: p.id, name: p.name })));
    });
  }, []);

  const filtered = useMemo(() => {
    let list = data ?? [];
    if (type !== "all") list = list.filter((c) => c.type === type);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.value ?? "").toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [data, query, type]);

  if (error) return <ErrorNote error={error} onRetry={reload} />;
  if (loading) return <Loading label="Loading contacts..." />;

  async function handleAddContact(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newValue.trim()) return;
    await createContact({
      name: newName.trim(),
      type: newType,
      value: newValue.trim(),
      tags: newTags.split(",").map((t) => t.trim()).filter(Boolean),
      linkedProjectIds: selectedProjectId ? [selectedProjectId] : [],
    });
    setNewName("");
    setNewValue("");
    setNewTags("");
    setSelectedProjectId("");
    setShowAddForm(false);
    setData(await listAllContacts());
  }

  async function rename(id: string, name: string) {
    await updateContact(id, { name });
    setData(await listAllContacts());
  }

  async function remove(contact: Contact) {
    if (!confirm(`Delete contact "${contact.name}"?`)) return;
    await deleteContact(contact.id);
    setData(await listAllContacts());
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <button
          type="button"
          className="btn-primary clickable"
          onClick={() => setShowAddForm((s) => !s)}
          data-tip="Add a new contact"
        >
          {showAddForm ? "Close contact form" : "+ Add contact"}
        </button>
      </div>

      {showAddForm && (
        <form className="resource-form" onSubmit={handleAddContact} style={{ marginBottom: 16 }}>
          <div className="field" style={{ flexBasis: "100%" }}>
            <label>Contact name</label>
            <div className="inline-form" style={{ marginBottom: 0 }}>
              <input
                type="text"
                placeholder="Person or organisation name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                autoFocus
              />
              <MicButton onResult={setNewName} />
            </div>
          </div>

          <div className="field">
            <label>Type</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as "email" | "phone" | "link")}
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="link">Link</option>
            </select>
          </div>

          <div className="field" style={{ flexBasis: "100%" }}>
            <label>
              {newType === "email" && "Email address"}
              {newType === "phone" && "Phone number"}
              {newType === "link" && "URL / Link"}
            </label>
            <input
              type={newType === "link" ? "url" : newType === "email" ? "email" : "tel"}
              placeholder={newType === "link" ? "https://..." : newType === "email" ? "you@example.com" : "+1 (555) 000-0000"}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              required
            />
          </div>

          <div className="field" style={{ flexBasis: "100%" }}>
            <label>Link to project (optional)</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="">No project (General contact)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field" style={{ flexBasis: "100%" }}>
            <label>Tags (comma separated)</label>
            <input
              type="text"
              placeholder="work, client, urgent, contractor"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: 8, width: "100%" }}>
            <button type="submit" className="btn-primary clickable">
              Save contact
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

      <div className="inline-form">
        <input
          type="search"
          placeholder="Filter by name, value or tag..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Filter contacts"
          data-tip="Narrows the list below as you type"
        />
        <div className="chip-row" style={{ marginBottom: 0 }}>
          {(["all", "email", "phone", "link"] as const).map((t) => (
            <button
              key={t}
              type="button"
              className={`chip ${type === t ? "chip-active" : ""}`}
              onClick={() => setType(t)}
              data-tip={t === "all" ? "Show every contact type" : `Show only ${CONTACT_TYPE_LABELS[t]} contacts`}
              aria-pressed={type === t}
            >
              {t === "all" ? "All" : CONTACT_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="empty-state">
          {(data?.length ?? 0) === 0
            ? "No contacts yet. Add your first contact above."
            : "No contacts match this filter."}
        </p>
      ) : (
        <ul className="item-list">
          {filtered.map((contact) => {
            const href = contactHref(contact);
            const ct = contact.type;
            return (
              <li key={contact.id} className="item">
                <span
                  className={`mark mark-contact mark-contact-${ct}`}
                  data-tip={CONTACT_TYPE_LABELS[ct]}
                  aria-label={CONTACT_TYPE_LABELS[ct]}
                />
                <span className="item-body">
                  <Editable
                    className="item-title"
                    value={contact.name}
                    onSave={(name) => rename(contact.id, name)}
                    label="Rename contact"
                  />
                  <span className="item-meta">
                    <StatusLabel status={CONTACT_TYPE_LABELS[ct]} />
                    {href ? (
                      <a href={href} data-tip={ct === "email" ? "Compose an email" : "Open this link"}>
                        {contact.value}
                      </a>
                    ) : (
                      <span className="contact-value">{contact.value}</span>
                    )}
                    {contact.tags.map((tag) => (
                      <StatusLabel key={tag} status={tag} />
                    ))}
                    {linkedProjectIds(contact).length > 0 && (
                      <span className="text-tiny">
                        in {linkedProjectIds(contact).length} project(s)
                      </span>
                    )}
                  </span>
                </span>
                <span className="item-actions">
                  {linkedProjectIds(contact)[0] && (
                    <Link
                      to={`/project/${linkedProjectIds(contact)[0]}?tab=Contacts`}
                      className="btn-icon"
                      data-tip="Open the project this contact is linked to"
                      data-tip-edge="left"
                    >
                      Project
                    </Link>
                  )}
                  <button
                    type="button"
                    className="btn-icon btn-icon-danger"
                    onClick={() => remove(contact)}
                    data-tip="Delete this contact"
                    data-tip-edge="left"
                  >
                    Del
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

```

---

## `src/components/home/HomeLinksTab.tsx`

Home links view: filter by provider, project association, search, copy-to-clipboard, and edit/delete.

```typescript
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  listAllLinks,
  createResource,
  updateResource,
  deleteResource,
  type Resource,
  type ResourceProvider,
} from "../../data/resources";
import { listAllProjects } from "../../data/projects";
import MicButton from "../../components/MicButton";

export default function HomeLinksTab() {
  const [links, setLinks] = useState<Resource[]>([]);
  const [projects, setProjects] = useState<Record<string, string>>({});
  const [projectList, setProjectList] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [filter, setFilter] = useState<"all" | "standalone" | "project">("all");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [targetProjectId, setTargetProjectId] = useState<string>(""); // "" = standalone unlinked
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [provider, setProvider] = useState<ResourceProvider>("other");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    const [allLinks, allProjs] = await Promise.all([
      listAllLinks(),
      listAllProjects(),
    ]);
    setLinks(allLinks);
    const pMap: Record<string, string> = {};
    for (const p of allProjs) {
      pMap[p.id] = p.name;
    }
    setProjects(pMap);
    setProjectList(allProjs.map((p) => ({ id: p.id, name: p.name })));
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  function normalizeUrl(input: string): string {
    const trimmed = input.trim();
    if (!trimmed) return "";
    if (!/^https?:\/\//i.test(trimmed)) {
      return "https://" + trimmed;
    }
    return trimmed;
  }

  function resetForm() {
    setEditingId(null);
    setTargetProjectId("");
    setTitle("");
    setUrl("");
    setDescription("");
    setTags("");
    setProvider("other");
    setShowAddForm(false);
    setError(null);
  }

  function startEdit(link: Resource) {
    setEditingId(link.id);
    setTargetProjectId(link.projectId || "");
    setTitle(link.title);
    setUrl(link.url || "");
    setDescription(link.body || "");
    setTags((link.tags || []).join(", "));
    setProvider(link.provider || "other");
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalUrl = normalizeUrl(url);
    if (!finalUrl) {
      setError("Please enter a valid link URL.");
      return;
    }

    let finalTitle = title.trim();
    if (!finalTitle) {
      try {
        const parsed = new URL(finalUrl);
        finalTitle = parsed.hostname.replace(/^www\./, "");
      } catch {
        finalTitle = finalUrl;
      }
    }

    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setSaving(true);
    setError(null);

    try {
      if (editingId) {
        await updateResource(editingId, {
          title: finalTitle,
          url: finalUrl,
          body: description.trim() || null,
          projectId: targetProjectId || null,
          tags: tagList,
          provider: provider || "other",
        });
      } else {
        await createResource({
          category: "links",
          title: finalTitle,
          url: finalUrl,
          body: description.trim() || null,
          projectId: targetProjectId || null,
          tags: tagList,
          provider: provider || "other",
        });
      }
      resetForm();
      await refresh();
    } catch (err: any) {
      console.error("Failed to save link:", err);
      setError(err?.message || "Could not save the link.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, linkTitle: string) {
    if (!confirm(`Delete link "${linkTitle}"?`)) return;
    await deleteResource(id);
    if (editingId === id) resetForm();
    await refresh();
  }

  function handleCopy(id: string, linkUrl: string) {
    navigator.clipboard?.writeText(linkUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  }

  // Filtered links
  const filtered = useMemo(() => {
    let list = links;

    // Filter by linkage (all vs standalone vs project)
    if (filter === "standalone") {
      list = list.filter((r) => !r.projectId);
    } else if (filter === "project") {
      list = list.filter((r) => Boolean(r.projectId));
    }

    // Filter by specific project
    if (selectedProjectId !== "all") {
      list = list.filter((r) => r.projectId === selectedProjectId);
    }

    // Filter by provider
    if (providerFilter !== "all") {
      list = list.filter((r) => r.provider === providerFilter);
    }

    // Search query across title, URL, description (body), tags
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((r) => {
        return (
          r.title.toLowerCase().includes(q) ||
          (r.body ?? "").toLowerCase().includes(q) ||
          (r.url ?? "").toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q))
        );
      });
    }

    return list;
  }, [links, filter, selectedProjectId, providerFilter, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: links.length,
      standalone: links.filter((l) => !l.projectId).length,
      project: links.filter((l) => Boolean(l.projectId)).length,
    };
  }, [links]);

  return (
    <div className="home-links-tab">
      {/* Top Header & Actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <button
            type="button"
            className="btn-primary clickable"
            onClick={() => {
              if (showAddForm) {
                resetForm();
              } else {
                setShowAddForm(true);
              }
            }}
            data-tip="Add a link with a title and description — standalone at Home or tied to a project"
          >
            {showAddForm ? "✕ Close form" : "+ Add link"}
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {projectList.length > 0 && (
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                if (e.target.value !== "all") setFilter("project");
              }}
              style={{ fontSize: 13, padding: "6px 10px", borderRadius: "var(--radius-sm)" }}
              data-tip="Filter links by specific project"
            >
              <option value="all">All Projects</option>
              {projectList.map((p) => (
                <option key={p.id} value={p.id}>
                  📁 {p.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            style={{ fontSize: 13, padding: "6px 10px", borderRadius: "var(--radius-sm)" }}
            data-tip="Filter by AI or link type"
          >
            <option value="all">All Link Types</option>
            <option value="gemini">Gemini</option>
            <option value="claude">Claude</option>
            <option value="gpt">GPT</option>
            <option value="other">Web &amp; Other</option>
          </select>
        </div>
      </div>

      {/* Add / Edit Link Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="stack"
          style={{
            background: "white",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius)",
            padding: "16px",
            marginBottom: "20px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
              {editingId ? "Edit link" : "Add a new link"}
            </h3>
            <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
              {targetProjectId ? "Project-associated link" : "⚡ Standalone link at Home (No project required)"}
            </span>
          </div>

          {/* Project selector — defaults to Standalone */}
          <div>
            <label htmlFor="link-target-project" style={{ fontSize: "13px", fontWeight: 600 }}>
              Project association
            </label>
            <select
              id="link-target-project"
              value={targetProjectId}
              onChange={(e) => setTargetProjectId(e.target.value)}
              style={{ width: "100%", padding: "8px 10px", fontSize: "13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}
            >
              <option value="">⚡ None — Standalone / Quick Link (at Home)</option>
              {projectList.map((p) => (
                <option key={p.id} value={p.id}>
                  📁 Associate with: {p.name}
                </option>
              ))}
            </select>
            <span style={{ fontSize: "11px", color: "var(--color-text-muted)", display: "block", marginTop: "3px" }}>
              Leave as "None" to keep this link as a personal, cross-project standalone link accessible at Home.
            </span>
          </div>

          {/* URL & Link Type */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "260px" }}>
              <label htmlFor="link-url-input" style={{ fontSize: "13px", fontWeight: 600 }}>
                Link URL <span style={{ color: "var(--color-accent-issue)" }}>*</span>
              </label>
              <input
                id="link-url-input"
                type="text"
                autoFocus
                placeholder="https://example.com or paste any URL..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                style={{ width: "100%", padding: "8px 10px", fontSize: "13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}
              />
            </div>

            <div style={{ minWidth: "160px" }}>
              <label htmlFor="link-provider-select" style={{ fontSize: "13px", fontWeight: 600 }}>
                Link type / Provider
              </label>
              <select
                id="link-provider-select"
                value={provider}
                onChange={(e) => setProvider(e.target.value as any)}
                style={{ width: "100%", padding: "8px 10px", fontSize: "13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}
              >
                <option value="other">🌐 Web Link / Bookmark</option>
                <option value="gemini">✨ Gemini Chat / Link</option>
                <option value="claude">🤖 Claude Chat</option>
                <option value="gpt">🟢 ChatGPT Link</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="link-title-input" style={{ fontSize: "13px", fontWeight: 600 }}>
              Title
            </label>
            <div className="inline-form" style={{ marginBottom: 0 }}>
              <input
                id="link-title-input"
                type="text"
                placeholder="e.g. Next.js App Router Documentation, Competitor Analysis..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ padding: "8px 10px", fontSize: "13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}
              />
              <MicButton onResult={(text) => setTitle(text)} />
            </div>
            <span style={{ fontSize: "11px", color: "var(--color-text-muted)", display: "block", marginTop: "3px" }}>
              Give the link a human-friendly name. If left blank, the website domain is used.
            </span>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="link-description-input" style={{ fontSize: "13px", fontWeight: 600 }}>
              Description &amp; Notes
            </label>
            <textarea
              id="link-description-input"
              rows={3}
              placeholder="What is this link about? Add notes, key insights, reminders, or why you saved it..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: "100%", padding: "8px 10px", fontSize: "13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}
            />
            <div style={{ marginTop: "4px" }}>
              <MicButton onResult={(text) => setDescription((prev) => (prev ? prev + " " + text : text))} />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="link-tags-input" style={{ fontSize: "13px", fontWeight: 600 }}>
              Tags <span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>(comma-separated, optional)</span>
            </label>
            <input
              id="link-tags-input"
              type="text"
              placeholder="research, docs, design, tools, reading"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              style={{ width: "100%", padding: "8px 10px", fontSize: "13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "4px" }}>
            <button
              type="button"
              className="btn-secondary clickable"
              onClick={resetForm}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary clickable"
              disabled={saving}
            >
              {saving ? "Saving..." : editingId ? "Save changes" : "Save link"}
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search controls */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: "220px" }}>
          <input
            type="search"
            placeholder="Search links by title, url, description, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius)",
              fontSize: "14px",
            }}
          />
        </div>

        <div className="chip-row" style={{ marginBottom: 0 }}>
          <button
            type="button"
            className={`chip ${filter === "all" ? "chip-active" : ""}`}
            onClick={() => { setFilter("all"); setSelectedProjectId("all"); }}
            data-tip="Show all links"
          >
            All Links ({counts.all})
          </button>
          <button
            type="button"
            className={`chip ${filter === "standalone" ? "chip-active" : ""}`}
            onClick={() => setFilter("standalone")}
            data-tip="Show standalone quick links not tied to any project"
          >
            ⚡ Standalone ({counts.standalone})
          </button>
          <button
            type="button"
            className={`chip ${filter === "project" ? "chip-active" : ""}`}
            onClick={() => setFilter("project")}
            data-tip="Show links tied to projects"
          >
            📁 Project Links ({counts.project})
          </button>
        </div>
      </div>

      {/* Links List */}
      {loading ? (
        <p className="empty-state">Loading links...</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state" style={{ textAlign: "center", padding: "32px 16px" }}>
          <div style={{ fontSize: "28px", marginBottom: "8px" }}>🔗</div>
          <p style={{ margin: "0 0 12px 0", fontWeight: 500 }}>
            {links.length === 0
              ? "No links saved yet. Add your first standalone link above!"
              : "No links match this filter or search query."}
          </p>
          <button
            type="button"
            className="btn-primary btn-small clickable"
            onClick={() => setShowAddForm(true)}
          >
            + Add your first link
          </button>
        </div>
      ) : (
        <ul className="item-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {filtered.map((link) => {
            const projectName = link.projectId ? projects[link.projectId] : null;
            const isCopied = copiedId === link.id;

            return (
              <li
                key={link.id}
                className="item"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: "white",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius)",
                  padding: "14px",
                  marginBottom: "10px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                  transition: "var(--transition)",
                }}
              >
                {/* Header row: Icon + Title + Actions */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: "16px" }} aria-hidden="true">
                      {link.provider === "gemini"
                        ? "✨"
                        : link.provider === "claude"
                        ? "🤖"
                        : link.provider === "gpt"
                        ? "🟢"
                        : "🔗"}
                    </span>
                    <a
                      href={link.url || "#"}
                      target="_blank"
                      rel="noreferrer noopener"
                      style={{
                        fontWeight: 600,
                        fontSize: "15px",
                        color: "var(--color-accent-primary)",
                        textDecoration: "none",
                        wordBreak: "break-word",
                      }}
                      className="clickable"
                      data-tip="Click to open link in a new tab"
                    >
                      {link.title || link.url} ↗
                    </a>
                  </div>

                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <button
                      type="button"
                      className="btn-secondary btn-small clickable"
                      onClick={() => link.url && handleCopy(link.id, link.url)}
                      data-tip="Copy link URL"
                    >
                      {isCopied ? "✓ Copied!" : "Copy"}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary btn-small clickable"
                      onClick={() => startEdit(link)}
                      data-tip="Edit title, URL, description, or project"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-icon clickable"
                      onClick={() => handleDelete(link.id, link.title)}
                      data-tip="Delete link"
                      style={{ color: "var(--color-accent-issue)" }}
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* URL preview */}
                {link.url && (
                  <div style={{ marginTop: "2px", marginBottom: "6px" }}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      style={{
                        fontSize: "12px",
                        color: "var(--color-text-muted)",
                        textDecoration: "none",
                        wordBreak: "break-all",
                      }}
                    >
                      {link.url}
                    </a>
                  </div>
                )}

                {/* Description Body */}
                {link.body && (
                  <div
                    style={{
                      background: "var(--color-bg-subtle)",
                      borderLeft: "3px solid var(--color-accent-primary)",
                      padding: "8px 12px",
                      borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                      fontSize: "13px",
                      lineHeight: "1.5",
                      color: "var(--color-text)",
                      margin: "6px 0 8px 0",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {link.body}
                  </div>
                )}

                {/* Meta badges: Project or Standalone, Provider, Tags */}
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center", marginTop: "4px" }}>
                  {projectName ? (
                    <Link
                      to={`/project/${link.projectId}?tab=Resources`}
                      className="chip-small"
                      style={{
                        textDecoration: "none",
                        color: "var(--color-accent-primary)",
                        background: "#eff6ff",
                        border: "1px solid #bfdbfe",
                        margin: 0,
                      }}
                      data-tip="Open associated project"
                    >
                      📁 {projectName}
                    </Link>
                  ) : (
                    <span
                      className="chip-small"
                      style={{
                        background: "#fef3c7",
                        color: "#92400e",
                        border: "1px solid #fde68a",
                        margin: 0,
                        fontWeight: 600,
                      }}
                      data-tip="Standalone link at Home (not tied to any project)"
                    >
                      ⚡ Standalone
                    </span>
                  )}

                  {link.provider && link.provider !== "other" && (
                    <span
                      className="chip-small"
                      style={{
                        textTransform: "capitalize",
                        background: "#ede9fe",
                        color: "#5b21b6",
                        border: "1px solid #ddd6fe",
                        margin: 0,
                      }}
                    >
                      {link.provider}
                    </span>
                  )}

                  {link.tags &&
                    link.tags.map((tag) => (
                      <span
                        key={tag}
                        className="chip-small"
                        style={{ margin: 0, background: "var(--color-bg-subtle)" }}
                      >
                        #{tag}
                      </span>
                    ))}

                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "11px",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {new Date(link.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

```

---

## `src/components/home/HomeRemindersTab.tsx`

Home reminders: buckets by overdue/due/upcoming, inline edit, time adjustment, and dismiss/delete.

```typescript
import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  listPendingReminders,
  bucketReminders,
  dismissReminder,
  deleteReminder,
  updateReminder,
  type ReminderBucket,
} from "../../data/reminders";
import { listAllProjects } from "../../data/projects";
import { ErrorNote, Loading, StatusLabel, useAsync, Editable } from "../../components/ui";

const BUCKET_ORDER: { id: ReminderBucket; label: string; hint: string }[] = [
  { id: "overdue", label: "Overdue", hint: "Reminders whose time has passed" },
  { id: "due", label: "Due today", hint: "Reminders due later today" },
  { id: "upcoming", label: "Upcoming", hint: "Reminders still in the future" },
];

export default function HomeRemindersTab() {
  const { data, error, loading, reload, setData } = useAsync(async () => {
    const [reminders, projects] = await Promise.all([
      listPendingReminders(),
      listAllProjects(),
    ]);
    return { reminders, projects };
  }, []);

  const projectName = useMemo(
    () => new Map((data?.projects ?? []).map((p) => [p.id, p.name])),
    [data]
  );

  const buckets = useMemo(() => bucketReminders(data?.reminders ?? []), [data]);

  if (error) return <ErrorNote error={error} onRetry={reload} />;
  if (loading) return <Loading label="Loading reminders..." />;

  const total = (data?.reminders ?? []).length;
  if (total === 0) {
    return (
      <p className="empty-state">
        No pending reminders. Create one from a project's Tasks tab, or ask the
        assistant to remind you about something.
      </p>
    );
  }

  async function refresh() {
    setData({
      reminders: await listPendingReminders(),
      projects: await listAllProjects(),
    });
  }

  return (
    <div className="stack">
      {BUCKET_ORDER.map(({ id, label, hint }) => {
        const items = buckets[id];
        return (
          <section key={id} className="dashboard-section">
            <h3 className="section-heading" data-tip={hint}>
              {label} <span className="tab-btn-count">{items.length}</span>
            </h3>
            {items.length === 0 ? (
              <p className="empty-state">Nothing here.</p>
            ) : (
              <ul className="item-list">
                {items.map((reminder) => (
                  <li key={reminder.id} className="item item-row-wrap">
                    <span className="item-body">
                      <Editable
                        className="item-title"
                        value={reminder.message}
                        onSave={async (message) => {
                          await updateReminder(reminder.id, { message });
                          await refresh();
                        }}
                        label="Edit reminder text"
                      />
                      <span className="item-meta">
                        <StatusLabel status={new Date(reminder.triggerAt).toLocaleString()} />
                        {reminder.projectId && (
                          <Link
                            to={`/project/${reminder.projectId}?tab=Tasks`}
                            data-tip="Open the project this reminder belongs to"
                          >
                            {projectName.get(reminder.projectId) ?? "Unknown project"}
                          </Link>
                        )}
                        {id === "overdue" && (
                          <StatusLabel status="overdue" className="chip-overdue" />
                        )}
                      </span>
                    </span>
                    <span className="item-actions">
                      <input
                        type="datetime-local"
                        className="reminder-time-input"
                        defaultValue={toLocalInput(reminder.triggerAt)}
                        aria-label="Reminder time"
                        onChange={async (e) => {
                          if (!e.target.value) return;
                          await updateReminder(reminder.id, {
                            triggerAt: new Date(e.target.value).getTime(),
                          });
                          await refresh();
                        }}
                        data-tip="Move this reminder to a different time"
                        data-tip-edge="left"
                      />
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={async () => {
                          await dismissReminder(reminder.id);
                          await refresh();
                        }}
                        data-tip="Dismiss this reminder"
                        data-tip-edge="left"
                      >
                        Done
                      </button>
                      <button
                        type="button"
                        className="btn-icon btn-icon-danger"
                        onClick={async () => {
                          await deleteReminder(reminder.id);
                          await refresh();
                        }}
                        data-tip="Delete this reminder"
                        data-tip-edge="left"
                      >
                        Del
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

/** datetime-local inputs need a local-time string, not an ISO UTC one. */
export function toLocalInput(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

```

---

## `src/components/home/HomeResourcesTab.tsx`

Home cross-project resources view with category and project filters, custom categories, and file/image link support.

```typescript
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  listAllResources,
  createResource,
  updateResource,
  deleteResource,
  type Resource,
  type ResourceCategory,
  type ResourceImage,
  type ResourceFile,
} from "../../data/resources";
import { listAllProjects } from "../../data/projects";
import MicButton from "../../components/MicButton";

export default function HomeResourcesTab() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [projects, setProjects] = useState<Record<string, string>>({});
  const [projectList, setProjectList] = useState<{ id: string; name: string }[]>([]);

  // Filter & Search states
  const [filter, setFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all"); // "all" | "unlinked" | projectId
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [editing, setEditing] = useState<Resource | null>(null);
  const [targetProjectId, setTargetProjectId] = useState<string>(""); // "" = unlinked quick resource
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<string>("notes");
  const [tags, setTags] = useState("");
  const [provider, setProvider] = useState<"gemini" | "claude" | "gpt" | "other">("other");
  const [images, setImages] = useState<ResourceImage[]>([]);
  const [files, setFiles] = useState<ResourceFile[]>([]);
  const [imgLink, setImgLink] = useState("");
  const [pdfLink, setPdfLink] = useState("");
  const [uploadNote, setUploadNote] = useState<string | null>(null);

  // Custom Categories state (global addition, accessible across all projects)
  const DEFAULT_CATEGORIES: { id: string; label: string }[] = [
    { id: "notes", label: "Notes" },
    { id: "scripts", label: "Scripts" },
    { id: "links", label: "Links" },
    { id: "images", label: "Images" },
    { id: "pdfs", label: "PDFs" },
  ];
  const [customCategories, setCustomCategories] = useState<{ id: string; label: string }[]>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("panga-categories-global");
      if (stored) {
        setCustomCategories(JSON.parse(stored));
      }
    } catch {}
  }, []);

  function saveCustomCategories(cats: { id: string; label: string }[]) {
    setCustomCategories(cats);
    try {
      localStorage.setItem("panga-categories-global", JSON.stringify(cats));
    } catch {}
  }

  function handleAddCategory(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const name = newCatName.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    if (!id) return;
    const exists = DEFAULT_CATEGORIES.some((c) => c.id === id) || customCategories.some((c) => c.id === id);
    if (!exists) {
      const updated = [...customCategories, { id, label: name }];
      saveCustomCategories(updated);
    }
    setCategory(id);
    setNewCatName("");
    setShowAddCategory(false);
  }

  function handleRemoveCategory(catId: string) {
    if (!confirm(`Delete custom category "${CATEGORY_LABELS[catId] || catId}"? Existing items will remain.`)) return;
    const updated = customCategories.filter((c) => c.id !== catId);
    saveCustomCategories(updated);
    if (filter === catId) setFilter("all");
    if (category === catId) setCategory("notes");
  }

  const allCategories: { id: string; label: string }[] = useMemo(() => {
    return [...DEFAULT_CATEGORIES, ...customCategories];
  }, [customCategories]);

  const CATEGORY_LABELS: Record<string, string> = useMemo(() => {
    const map: Record<string, string> = {
      notes: "Notes",
      scripts: "Scripts",
      links: "Links",
      images: "Images",
      pdfs: "PDFs",
    };
    for (const c of customCategories) {
      map[c.id] = c.label;
    }
    return map;
  }, [customCategories]);

  async function refresh() {
    const [allResources, allProjs] = await Promise.all([
      listAllResources(),
      listAllProjects(),
    ]);
    setResources(allResources);
    const pMap: Record<string, string> = {};
    for (const p of allProjs) {
      pMap[p.id] = p.name;
    }
    setProjects(pMap);
    setProjectList(allProjs.map((p) => ({ id: p.id, name: p.name })));
  }

  useEffect(() => {
    refresh();
  }, []);

  function fileToText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  function resetForm() {
    setEditing(null);
    setTargetProjectId("");
    setTitle("");
    setBody("");
    setUrl("");
    setCategory("notes");
    setTags("");
    setProvider("other");
    setImages([]);
    setFiles([]);
    setImgLink("");
    setPdfLink("");
    setUploadNote(null);
    setShowAddForm(false);
  }

  function openEdit(r: Resource) {
    setEditing(r);
    setTargetProjectId(r.projectId ?? "");
    setTitle(r.title || "");
    setBody(r.body ?? "");
    setUrl(r.url ?? "");
    setCategory(r.category);
    setTags((r.tags ?? []).join(", "));
    setProvider((r.provider as any) ?? "other");
    setImages(r.images ?? []);
    setFiles(r.files ?? []);
    setShowAddForm(true);
  }

  async function handleSaveResource(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const input: any = {
      projectId: targetProjectId ? targetProjectId : null,
      category: category as ResourceCategory,
      title: title.trim(),
      tags: parsedTags,
      body: body.trim() || null,
      files,
      images,
      url: url.trim() || null,
      provider: category === "links" ? provider : null,
    };

    if (editing) {
      await updateResource(editing.id, input);
    } else {
      await createResource(input);
    }

    resetForm();
    refresh();
  }

  // Filtered resources
  const filtered = useMemo(() => {
    let list = resources;

    // Filter by category
    if (filter !== "all") {
      list = list.filter((r) => r.category === filter);
    }

    // Filter by project linkage
    if (projectFilter === "unlinked") {
      list = list.filter((r) => !r.projectId);
    } else if (projectFilter !== "all") {
      list = list.filter((r) => r.projectId === projectFilter);
    }

    // Search query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((r) => {
        return (
          r.title.toLowerCase().includes(q) ||
          (r.body ?? "").toLowerCase().includes(q) ||
          (r.url ?? "").toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q))
        );
      });
    }

    return list;
  }, [resources, filter, projectFilter, searchQuery]);

  return (
    <div>
      {/* Top action row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <button
          type="button"
          className="btn-primary clickable"
          onClick={() => {
            if (showAddForm) {
              resetForm();
            } else {
              setShowAddForm(true);
            }
          }}
          data-tip="Create a quick resource (tied to a project or untied for fast access)"
        >
          {showAddForm ? "Close form" : "+ Add quick resource"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            style={{ fontSize: 13, padding: "5px 10px" }}
            data-tip="Filter resources by project or view untied quick items"
          >
            <option value="all">All Projects &amp; Quick Items</option>
            <option value="unlinked">Untied / Quick Resources Only</option>
            {projectList.map((p) => (
              <option key={p.id} value={p.id}>
                Project: {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Add / Edit Resource Form */}
      {showAddForm && (
        <form className="resource-form" onSubmit={handleSaveResource} style={{ marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: 15, fontWeight: 700, width: "100%" }}>
            {editing ? "Edit resource" : "Add quick resource"}
          </h3>

          {/* Project linkage selector */}
          <div className="field" style={{ flexBasis: "100%" }}>
            <label>Project assignment</label>
            <select
              value={targetProjectId}
              onChange={(e) => setTargetProjectId(e.target.value)}
              data-tip="Choose whether this resource belongs to a project or is an untied standalone resource"
            >
              <option value="">No project (Untied / Quick standalone resource)</option>
              {projectList.map((p) => (
                <option key={p.id} value={p.id}>
                  Project: {p.name}
                </option>
              ))}
            </select>
            <span className="text-tiny" style={{ color: "var(--color-text-muted)", marginTop: 2 }}>
              {targetProjectId
                ? `Linked to project "${projects[targetProjectId]}". Also visible inside that project's Resources tab.`
                : "Not tied to any project — instantly accessible anytime right from Home."}
            </span>
          </div>

          {/* Category selection + Add Category */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", width: "100%", marginBottom: 6 }}>
            <div className="field" style={{ flex: 1, minWidth: 200 }}>
              <label>Category</label>
              <select
                value={category}
                onChange={(e) => {
                  if (e.target.value === "__add_new__") {
                    setShowAddCategory(true);
                  } else {
                    setCategory(e.target.value);
                  }
                }}
              >
                {allCategories.map((c: { id: string; label: string }) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
                <option value="__add_new__">+ Add new category...</option>
              </select>
            </div>

            <button
              type="button"
              className="btn-secondary btn-small clickable"
              style={{ marginTop: 18 }}
              onClick={() => setShowAddCategory((s) => !s)}
              data-tip="Add a custom category globally accessible across all projects and Home"
            >
              {showAddCategory ? "Close" : "+ Add category"}
            </button>
          </div>

          {/* Global Category Manager Panel */}
          {showAddCategory && (
            <div className="subcategory-manager" style={{ marginTop: 4, marginBottom: 10, width: "100%" }}>
              <label style={{ fontWeight: 600, fontSize: 13, display: "block", marginBottom: 6 }}>
                Add Category (Global addition, accessible from any project)
              </label>
              <div className="inline-form" style={{ marginBottom: 6 }}>
                <input
                  type="text"
                  placeholder="Category name (e.g. Credentials, Design, Templates, Research)..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                />
                <button type="button" className="btn-primary clickable" onClick={() => handleAddCategory()}>
                  + Add Category
                </button>
                <button type="button" className="btn-secondary clickable" onClick={() => setShowAddCategory(false)}>
                  Cancel
                </button>
              </div>
              {customCategories.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Custom categories:</span>
                  <div className="subcategory-list">
                    {customCategories.map((c) => (
                      <span key={c.id} className="subcategory-tag">
                        {c.label}
                        <button
                          type="button"
                          className="subcategory-remove clickable"
                          onClick={() => handleRemoveCategory(c.id)}
                          data-tip={`Delete ${c.label} category`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Title Field */}
          <div className="field" style={{ flexBasis: "100%" }}>
            <label>Title</label>
            <div className="inline-form" style={{ marginBottom: 0 }}>
              <input
                type="text"
                placeholder={category === "notes" ? "Note title..." : "Resource title..."}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
              <MicButton onResult={(text) => setTitle(text)} />
            </div>
          </div>

          {/* Category-specific fields */}
          {category === "links" && (
            <div className="field" style={{ flexBasis: "100%" }}>
              <label>URL</label>
              <div className="inline-form" style={{ marginBottom: 0 }}>
                <input
                  type="url"
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  data-tip="URL to open"
                />
                <select value={provider} onChange={(e) => setProvider(e.target.value as any)} data-tip="AI provider for chat links">
                  <option value="gemini">Gemini</option>
                  <option value="claude">Claude</option>
                  <option value="gpt">GPT</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          )}

          {/* Body / Content Area */}
          {(category === "notes" || category === "scripts" || category === "links" || category === "pdfs" || !DEFAULT_CATEGORIES.some((c) => c.id === category)) && (
            <div className="field" style={{ flexBasis: "100%" }}>
              <label>
                {category === "notes" ? "Note Body / Content" : "Body / Description / Content"}
              </label>
              <textarea
                placeholder={category === "notes" ? "Write note body, thoughts, quick info..." : "Description or details..."}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                data-tip="Resource body"
              />
              <div style={{ marginTop: 4 }}>
                <MicButton onResult={(text) => setBody((prev) => (prev ? prev + " " + text : text))} />
              </div>
            </div>
          )}

          {uploadNote && (
            <p className="otp-error" style={{ flexBasis: "100%", margin: "4px 0" }}>
              {uploadNote}
            </p>
          )}

          {/* Text file upload for notes/scripts/custom categories */}
          {(!editing && (category === "notes" || category === "scripts" || !DEFAULT_CATEGORIES.some((c) => c.id === category))) && (
            <div style={{ flexBasis: "100%", display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
              <span className="text-tiny" style={{ color: "var(--color-text-muted)" }}>
                Upload rule: Text documents only (.txt, .md). Contents are parsed into body — no files are stored.
              </span>
              <input
                type="file"
                accept=".txt,.md,.doc,.docx"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadNote(null);
                  if (file.name.endsWith(".doc") || file.name.endsWith(".docx")) {
                    setUploadNote("Word documents (.doc/.docx) cannot be parsed directly in the browser. Please save as .txt or .md first, or copy/paste the content.");
                    e.target.value = "";
                    return;
                  }
                  try {
                    const text = await fileToText(file);
                    setBody((prev) => (prev ? prev + "\n\n" + text : text));
                    if (!title.trim()) {
                      setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
                    }
                  } catch {
                    setUploadNote("Failed to read text from file.");
                  }
                  e.target.value = "";
                }}
                data-tip="Upload .txt or .md files to parse into body"
              />
            </div>
          )}

          {/* Image link input */}
          {category === "images" && (
            <div className="field" style={{ flexBasis: "100%" }}>
              <label>Image link</label>
              <div className="inline-form" style={{ marginBottom: 0 }}>
                <input
                  type="url"
                  placeholder="https:// (Google Drive share link)"
                  value={imgLink}
                  onChange={(e) => setImgLink(e.target.value)}
                  data-tip="Paste a link to the image (e.g. Google Drive share link)"
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    if (!imgLink.trim()) return;
                    setImages((prev) => [...prev, { link: imgLink.trim(), name: imgLink.trim(), alt: imgLink.trim() }]);
                    setImgLink("");
                  }}
                >
                  + Add link
                </button>
              </div>
            </div>
          )}

          {/* PDF link input */}
          {category === "pdfs" && (
            <div className="field" style={{ flexBasis: "100%" }}>
              <label>PDF link</label>
              <div className="inline-form" style={{ marginBottom: 0 }}>
                <input
                  type="url"
                  placeholder="https:// (Google Drive share link)"
                  value={pdfLink}
                  onChange={(e) => setPdfLink(e.target.value)}
                  data-tip="Paste a link to the PDF"
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    if (!pdfLink.trim()) return;
                    setFiles((prev) => [...prev, { name: pdfLink.trim(), link: pdfLink.trim() }]);
                    setPdfLink("");
                  }}
                >
                  + Add link
                </button>
              </div>
            </div>
          )}

          {/* Tags input */}
          <div className="field" style={{ flexBasis: "100%" }}>
            <label>Tags (comma separated)</label>
            <input
              type="text"
              placeholder="reference, urgent, personal, sprint-1"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: 8, width: "100%", marginTop: 8 }}>
            <button type="submit" className="btn-primary clickable">
              {editing ? "Save changes" : "Save resource"}
            </button>
            <button
              type="button"
              className="btn-secondary clickable"
              onClick={resetForm}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="inline-form" style={{ marginBottom: 12 }}>
        <input
          type="search"
          placeholder="Filter resources by title, notes, url or tag..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Filter resources"
          data-tip="Narrows the list below as you type"
        />
      </div>

      {/* Filter Chips (All + Categories) */}
      <div className="chip-row">
        <button
          className={`chip ${filter === "all" ? "chip-active" : ""}`}
          data-tip="Show all categories"
          onClick={() => setFilter("all")}
        >
          All
        </button>
        {allCategories.map((c: { id: string; label: string }) => (
          <button
            key={c.id}
            className={`chip ${filter === c.id ? "chip-active" : ""}`}
            data-tip={`Show only ${c.label.toLowerCase()}`}
            onClick={() => setFilter(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Resource List */}
      {filtered.length === 0 ? (
        <p className="empty-state">
          {resources.length === 0
            ? "No resources yet. Add your first quick note, link, or script above."
            : "No resources match this filter."}
        </p>
      ) : (
        <ul className="resource-list">
          {filtered.map((r) => {
            const label = CATEGORY_LABELS[r.category] || r.category;
            const projectName = r.projectId ? projects[r.projectId] : null;

            return (
              <li key={r.id} className="resource-item">
                <span
                  className="resource-category-dot"
                  style={{ backgroundColor: getCategoryColor(r.category) }}
                />
                <span className="resource-text">
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span className="resource-title">{r.title || "(untitled)"}</span>
                    {projectName ? (
                      <Link
                        to={`/project/${r.projectId}?tab=Resources`}
                        className="chip-small"
                        data-tip="Open project resources"
                        style={{ textDecoration: "none", color: "var(--color-accent-primary)" }}
                      >
                        📁 {projectName}
                      </Link>
                    ) : (
                      <span className="chip-small" style={{ background: "#fef3c7", color: "#92400e" }}>
                        ⚡ Quick item
                      </span>
                    )}
                  </div>

                  {r.category === "links" && r.url ? (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="resource-value-link"
                      data-tip="Open link"
                    >
                      {r.url}
                    </a>
                  ) : null}

                  {r.body && (
                    <p className="resource-notes" style={{ whiteSpace: "pre-wrap" }}>
                      {r.body}
                    </p>
                  )}

                  {r.images && r.images.length > 0 && (
                    <div className="resource-image-row">
                      {r.images.map((img, i) =>
                        img.link ? (
                          <a
                            key={i}
                            href={img.link}
                            target="_blank"
                            rel="noreferrer"
                            className="resource-image-link"
                            data-tip="Open image link"
                          >
                            <span className="thumb-link">{img.name || "Image link"}</span>
                          </a>
                        ) : null
                      )}
                    </div>
                  )}

                  {r.files && r.files.length > 0 && (
                    <div className="resource-image-row">
                      {r.files.map((f, i) => (
                        <a
                          key={i}
                          href={f.link || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="file-attachment"
                          data-tip="Open file link"
                        >
                          {f.name}
                        </a>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: 4 }}>
                    <span className="chip-small">{label}</span>
                    {r.tags.map((t) => (
                      <span key={t} className="chip-small">
                        {t}
                      </span>
                    ))}
                  </div>
                </span>

                <button
                  className="btn-icon clickable"
                  data-tip="Edit resource"
                  onClick={() => openEdit(r)}
                >
                  Edit
                </button>
                <button
                  className="task-delete-btn"
                  data-tip="Delete resource"
                  onClick={async () => {
                    if (!confirm(`Delete resource "${r.title}"?`)) return;
                    await deleteResource(r.id);
                    refresh();
                  }}
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function getCategoryColor(cat: string): string {
  const colors: Record<string, string> = {
    notes: "#3b82f6",
    scripts: "#8b5cf6",
    links: "#22c55e",
    images: "#a855f7",
    pdfs: "#f59e0b",
  };
  if (colors[cat]) return colors[cat];
  let hash = 0;
  for (let i = 0; i < cat.length; i++) {
    hash = cat.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 45%)`;
}

```

---

## `src/components/home/HomeScheduleTab.tsx`

Home schedule: groups scheduled tasks and calendar events by day, with Meet link support.

```typescript
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { listScheduledTasks, type Task } from "../../data/tasks";
import { listAllProjects } from "../../data/projects";
import { listAllCalendarEvents, type CalendarEvent } from "../../data/calendar";
import { ErrorNote, Loading, StatusLabel, useAsync } from "../../components/ui";

const DAY = 24 * 60 * 60 * 1000;

export default function HomeScheduleTab() {
  const { data, error, loading, reload } = useAsync(async () => {
    const [tasks, projects, events] = await Promise.all([
      listScheduledTasks(),
      listAllProjects(),
      listAllCalendarEvents(),
    ]);
    return { tasks, projects, events };
  }, []);

  const projectName = useMemo(
    () => new Map((data?.projects ?? []).map((p: any) => [p.id, p.name])),
    [data]
  );

  const { tasksByDay, eventsByDay } = useMemo(() => groupByDay(data), [data]);

  if (error) return <ErrorNote error={error} onRetry={reload} />;
  if (loading) return <Loading label="Loading schedule..." />;

  const days = [...new Set([...tasksByDay.keys(), ...eventsByDay.keys()])].sort();

  if (days.length === 0) {
    return (
      <p className="empty-state">
        Nothing scheduled. Give a task a date and time in a project's Tasks tab, or
        connect Google Calendar in Settings to import events.
      </p>
    );
  }

  return (
    <div className="stack">
      {days.map((day) => (
        <section key={day} className="schedule-day">
          <h3 className="section-heading">{formatDay(day)}</h3>
          <ul className="item-list">
            {(tasksByDay.get(day) ?? []).map((task) => (
              <ScheduleRow
                key={task.id}
                kind="task"
                title={task.title}
                time={task.scheduledAt!}
                meta={`${projectName.get(task.projectId) ?? "Unknown project"} · ${
                  task.executor === "ai" ? "AI" : "Manual"
                }`}
                to={`/project/${task.projectId}?tab=Tasks`}
                openTip="Open this task in its project"
              />
            ))}
            {(eventsByDay.get(day) ?? []).map((event) => (
              <ScheduleRow
                key={event.id}
                kind="event"
                title={event.title}
                time={event.startAt}
                endTime={event.endAt}
                meta={event.source === "google" ? "Google Calendar" : "Local event"}
                meetLink={event.hangoutLink}
                to={event.projectId ? `/project/${event.projectId}?tab=Tasks` : undefined}
                openTip="Open the project this event belongs to"
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function ScheduleRow({
  kind,
  title,
  time,
  endTime,
  meta,
  meetLink,
  to,
  openTip,
}: {
  kind: "task" | "event";
  title: string;
  time: number;
  endTime?: number;
  meta: string;
  meetLink?: string | null;
  to?: string;
  openTip: string;
}) {
  return (
    <li className="item">
      <span className="schedule-time">{formatTime(time)}</span>
      <span className="item-body">
        <span className="item-title">{title}</span>
        <span className="item-meta">
          <StatusLabel status={kind === "task" ? "task" : "event"} />
          <span className="text-tiny">{meta}</span>
          {endTime && endTime > time && (
            <span className="text-tiny">until {formatTime(endTime)}</span>
          )}
        </span>
      </span>
      <span className="item-actions">
        {meetLink && (
          <a
            href={meetLink}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary btn-small"
            data-tip="Join the Google Meet for this event"
            data-tip-edge="left"
          >
            Join Meet
          </a>
        )}
        {to && (
          <Link to={to} className="btn-icon" data-tip={openTip} data-tip-edge="left">
            Open
          </Link>
        )}
      </span>
    </li>
  );
}

function groupByDay(
  data: { tasks: Task[]; events: CalendarEvent[] } | null
): { tasksByDay: Map<number, Task[]>; eventsByDay: Map<number, CalendarEvent[]> } {
  const tasksByDay = new Map<number, Task[]>();
  const eventsByDay = new Map<number, CalendarEvent[]>();
  for (const task of data?.tasks ?? []) {
    if (!task.scheduledAt) continue;
    push(tasksByDay, startOfDay(task.scheduledAt), task);
  }
  for (const event of data?.events ?? []) {
    if (event.startAt < Date.now() - DAY) continue;
    push(eventsByDay, startOfDay(event.startAt), event);
  }
  return { tasksByDay, eventsByDay };
}

function push<T>(map: Map<number, T[]>, key: number, value: T) {
  const list = map.get(key) ?? [];
  list.push(value);
  map.set(key, list);
}

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function formatDay(ts: number): string {
  const d = new Date(ts);
  const today = startOfDay(Date.now());
  if (ts === today) return "Today";
  if (ts === today + DAY) return "Tomorrow";
  if (ts === today - DAY) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short" });
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

```

---

## `src/components/home/HomeTasksTab.tsx`

Home cross-project tasks view with status filters and per-filter counts.

```typescript
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listAllTasks, isOverdue, setTaskStatus, type Task, type TaskStatus } from "../../data/tasks";
import { listAllProjects } from "../../data/projects";
import { reconcileMilestoneStatuses } from "../../data/milestones";
import { ErrorNote, Loading, StatusLabel, useAsync } from "../../components/ui";

type Filter = "all" | "active" | "inactive" | "completed" | "overdue" | "ai" | "scheduled";

const FILTERS: { id: Filter; label: string; hint: string }[] = [
  { id: "all", label: "All", hint: "Every task in every project" },
  { id: "active", label: "Active", hint: "Tasks still to do" },
  { id: "inactive", label: "Inactive", hint: "Tasks parked for now" },
  { id: "overdue", label: "Overdue", hint: "Active tasks past their due date" },
  { id: "scheduled", label: "Scheduled", hint: "Tasks with a date and time set" },
  { id: "ai", label: "AI", hint: "Tasks labelled for the assistant to do" },
  { id: "completed", label: "Done", hint: "Completed tasks" },
];

export default function HomeTasksTab() {
  const [filter, setFilter] = useState<Filter>("active");
  const { data, error, loading, reload } = useAsync(async () => {
    const [tasks, projects] = await Promise.all([listAllTasks(), listAllProjects()]);
    return { tasks, projects };
  }, []);

  async function handleToggleStatus(task: Task) {
    const next: Record<TaskStatus, TaskStatus> = {
      active: "completed",
      completed: "inactive",
      inactive: "active",
    };
    await setTaskStatus(task.id, next[task.status]);
    if (task.projectId) {
      await reconcileMilestoneStatuses(task.projectId);
    }
    reload();
  }

  const projectName = useMemo(
    () => new Map<string, string>((data?.projects ?? []).map((p: any) => [p.id, p.name])),
    [data]
  );

  const counts = useMemo(() => {
    const tasks = data?.tasks ?? [];
    return {
      all: tasks.length,
      active: tasks.filter((t: Task) => t.status === "active").length,
      inactive: tasks.filter((t: Task) => t.status === "inactive").length,
      completed: tasks.filter((t: Task) => t.status === "completed").length,
      overdue: tasks.filter((t: Task) => isOverdue(t)).length,
      ai: tasks.filter((t: Task) => t.executor === "ai" && t.status !== "completed").length,
      scheduled: tasks.filter((t: Task) => t.scheduledAt && t.status !== "completed").length,
    } as Record<Filter, number>;
  }, [data]);

  const filtered = useMemo(() => {
    const tasks = data?.tasks ?? [];
    const list = tasks.filter((t: Task) => {
      switch (filter) {
        case "all":
          return true;
        case "active":
          return t.status === "active";
        case "inactive":
          return t.status === "inactive";
        case "completed":
          return t.status === "completed";
        case "overdue":
          return isOverdue(t);
        case "ai":
          return t.executor === "ai" && t.status !== "completed";
        case "scheduled":
          return t.scheduledAt !== null && t.status !== "completed";
      }
    });
    return list.sort((a: Task, b: Task) => {
      const at = a.scheduledAt ?? a.dueDate ?? Infinity;
      const bt = b.scheduledAt ?? b.dueDate ?? Infinity;
      return at - bt;
    });
  }, [data, filter]);

  if (error) return <ErrorNote error={error} onRetry={reload} />;
  if (loading) return <Loading label="Loading tasks..." />;

  return (
    <div>
      <div className="chip-row">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`chip ${filter === f.id ? "chip-active" : ""}`}
            onClick={() => setFilter(f.id)}
            data-tip={`${f.hint}. ${counts[f.id]} shown.`}
            aria-pressed={filter === f.id}
          >
            {f.label}
            <span className="tab-btn-count">{counts[f.id]}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="empty-state">
          Nothing matches this filter. Tasks are added from a project's Tasks tab.
        </p>
      ) : (
        <ul className="item-list">
          {filtered.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              projectName={projectName.get(task.projectId) ?? ""}
              onToggle={handleToggleStatus}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function TaskRow({
  task,
  projectName,
  onToggle,
}: {
  task: Task;
  projectName: string;
  onToggle: (task: Task) => void;
}) {
  return (
    <li className="item">
      <button
        type="button"
        className={`task-status-btn is-${task.status} clickable`}
        aria-label={`Cycle status: currently ${task.status}`}
        data-tip={`Status: ${task.status}. Click to cycle (active → completed → inactive).`}
        onClick={() => onToggle(task)}
      >
        {task.status === "completed" ? "✓ Done" : task.status === "inactive" ? "— Parked" : "○ Active"}
      </button>
      <span className="item-body">
        <span className="item-title">{task.title}</span>
        <span className="item-meta">
          <Link to={`/project/${task.projectId}?tab=Tasks`} data-tip="Open this project">
            {projectName || "Unknown project"}
          </Link>
          <StatusLabel status={task.status} />
          {task.executor === "ai" && <StatusLabel status="AI" className="chip-ai" />}
          {task.scheduledAt && (
            <span className="text-tiny" data-tip="Scheduled time">
              {new Date(task.scheduledAt).toLocaleString()}
            </span>
          )}
          {isOverdue(task) && (
            <StatusLabel status="overdue" className="chip-overdue" />
          )}
        </span>
      </span>
      <span className="item-actions">
        <Link
          to={`/project/${task.projectId}?tab=Tasks`}
          className="btn-icon"
          data-tip="Open this task in its project"
          data-tip-edge="left"
        >
          Open
        </Link>
      </span>
    </li>
  );
}

```

---

## `src/components/project/ContactsTab.tsx`

Project-scoped contacts tab: list, add, link/unlink to project, and delete contacts.

```typescript
import { useState } from "react";
import {
  listAllContacts,
  createContact,
  updateContact,
  toggleContactProject,
  deleteContact,
  CONTACT_TYPE_LABELS,
  contactHref,
  linkedProjectIds,
  type Contact,
} from "../../data/contacts";
import MicButton from "../../components/MicButton";
import { Editable, ErrorNote, Loading, StatusLabel, useAsync } from "../../components/ui";

export default function ContactsTab({ projectId }: { projectId: string }) {
  const contacts = useAsync(() => listAllContacts(), []);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | "email" | "phone" | "link">("all");

  const shown = (contacts.data ?? []).filter((c) => {
    if (type !== "all" && c.type !== type) return false;
    const q = query.trim().toLowerCase();
    if (q) {
      return (
        c.name.toLowerCase().includes(q) ||
        (c.value ?? "").toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const linked = shown.filter((c) => linkedProjectIds(c).includes(projectId));
  const unlinked = shown.filter((c) => !linkedProjectIds(c).includes(projectId));

  if (contacts.error) return <ErrorNote error={contacts.error} onRetry={contacts.reload} />;

  return (
    <div>
      <AddContactForm projectId={projectId} onCreated={contacts.reload} />

      <div className="inline-form">
        <input
          type="search"
          placeholder="Filter by name, value or tag..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          data-tip="Narrows the list as you type"
        />
        <div className="chip-row" style={{ marginBottom: 0 }}>
          {(["all", "email", "phone", "link"] as const).map((t) => (
            <button
              key={t}
              type="button"
              className={`chip ${type === t ? "chip-active" : ""}`}
              onClick={() => setType(t)}
              data-tip={t === "all" ? "All contact types" : `Only ${CONTACT_TYPE_LABELS[t]}`}
              aria-pressed={type === t}
            >
              {t === "all" ? "All" : CONTACT_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {contacts.loading ? (
        <Loading label="Loading contacts..." />
      ) : linked.length > 0 ? (
        <section className="dashboard-section">
          <h3 className="section-heading">Linked to this project</h3>
          <ul className="item-list">
            {linked.map((c) => (
              <ContactRow
                key={c.id}
                contact={c}
                linked={true}
                projectId={projectId}
                onChange={contacts.reload}
              />
            ))}
          </ul>
        </section>
      ) : (
        <p className="empty-state">
          No contacts linked to this project. Add one above, or link an existing
          contact from the Home Contacts tab.
        </p>
      )}

      {unlinked.length > 0 && (
        <section className="dashboard-section">
          <h3 className="section-heading">Available contacts</h3>
          <ul className="item-list">
            {unlinked.map((c) => (
              <ContactRow
                key={c.id}
                contact={c}
                linked={false}
                projectId={projectId}
                onChange={contacts.reload}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function ContactRow({
  contact,
  linked,
  projectId,
  onChange,
}: {
  contact: Contact;
  linked: boolean;
  projectId: string;
  onChange: () => Promise<void>;
}) {
  const href = contactHref(contact);
  const ct = contact.type;

  return (
    <li className="item item-row-wrap">
      <span className={`mark mark-contact mark-contact-${ct}`} data-tip={CONTACT_TYPE_LABELS[ct]} />
      <span className="item-body">
        <Editable
          className="item-title"
          value={contact.name}
          onSave={async (name) => {
            await updateContact(contact.id, { name });
            await onChange();
          }}
          label="Rename contact"
        />
        <span className="item-meta">
          <StatusLabel status={CONTACT_TYPE_LABELS[ct]} />
          {href ? (
            <a href={href} data-tip={ct === "email" ? "Compose email" : "Open link"}>
              {contact.value}
            </a>
          ) : (
            <span className="contact-value">{contact.value}</span>
          )}
          {contact.tags.map((tag) => (
            <StatusLabel key={tag} status={tag} />
          ))}
          {linkedProjectIds(contact).length > 0 && (
            <span className="text-tiny">
              in {linkedProjectIds(contact).length} project(s)
            </span>
          )}
        </span>
      </span>
      <span className="item-actions">
        <button
          type="button"
          className={`btn-secondary btn-small ${linked ? "btn-primary" : ""}`}
          onClick={async () => {
            await toggleContactProject(contact.id, projectId);
            await onChange();
          }}
          data-tip={linked ? "Unlink from this project" : "Link to this project"}
          data-tip-edge="left"
        >
          {linked ? "Unlink" : "Link"}
        </button>
        <button
          type="button"
          className="btn-icon btn-icon-danger"
          onClick={async () => {
            await deleteContact(contact.id);
            await onChange();
          }}
          data-tip="Delete this contact everywhere"
          data-tip-edge="left"
        >
          Del
        </button>
      </span>
    </li>
  );
}

function AddContactForm({ projectId, onCreated }: { projectId: string; onCreated: () => Promise<void> }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"email" | "phone" | "link">("email");
  const [value, setValue] = useState("");
  const [tags, setTags] = useState("");

  return (
    <form
      className="resource-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!name.trim() || !value.trim()) return;
        await createContact({
          name: name.trim(),
          type,
          value: value.trim(),
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          linkedProjectIds: [projectId],
        });
        setName("");
        setValue("");
        setTags("");
        await onCreated();
      }}
    >
      <div className="field" style={{ flexBasis: "100%" }}>
        <div className="field-label">New contact</div>
        <div className="inline-form" style={{ marginBottom: 0 }}>
          <input
            type="text"
            placeholder="Person or organisation"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <MicButton onResult={setName} />
        </div>
      </div>
      <div className="field">
        <div className="field-label">Type</div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "email" | "phone" | "link")}
          data-tip="Changes the field below and how the value is displayed"
        >
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="link">Link</option>
        </select>
      </div>
      <div className="field" style={{ flexBasis: "100%" }}>
        <div className="field-label">
          {type === "email" && "Email address"}
          {type === "phone" && "Phone number"}
          {type === "link" && "URL"}
        </div>
        <input
          type={type === "link" ? "url" : type === "email" ? "email" : "tel"}
          placeholder={type === "link" ? "https://..." : type === "email" ? "Email address" : "Phone number"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <div className="field" style={{ flexBasis: "100%" }}>
        <div className="field-label">Tags (comma separated)</div>
        <input
          type="text"
          placeholder="work, client, urgent"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>
      <button type="submit" className="btn-primary" data-tip="Create and link this contact">
        + Add contact
      </button>
    </form>
  );
}
```

---

## `src/components/project/InsightsTab.tsx`

Project insights tab: add/edit/delete notes, links, image links, PDF links, and file uploads.

```typescript
import { useState } from "react";
import { useAsync } from "../../components/ui.tsx";
import { listInsights, createInsight, updateInsight, deleteInsight, type InsightType } from "../../data/insights.ts";
import { ErrorNote, Loading, StatusLabel, Editable } from "../../components/ui.tsx";
import MicButton from "../../components/MicButton.tsx";

const INSIGHT_TYPES: { value: InsightType; label: string; placeholder: string }[] = [
  { value: "note", label: "Note", placeholder: "Write your insight..." },
  { value: "link", label: "Link", placeholder: "https://..." },
  { value: "image", label: "Image", placeholder: "https://... (Google Drive share link)" },
  { value: "pdf", label: "PDF", placeholder: "https://... (Google Drive share link)" },
];

const TYPE_HINTS: Record<InsightType, string> = {
  note: "Plain text note — type or paste text, or upload a .txt file",
  link: "A URL to any resource — the link is stored, not the content",
  image: "A Google Drive (or any) image link — the link is stored, not the file",
  pdf: "A Google Drive (or any) PDF link — use the helper below to extract text if needed",
};

const PDF_HELPER_URL = "https://www.ilovepdf.com/pdf_to_text";

export default function InsightsTab({ projectId }: { projectId: string }) {
  const insights = useAsync(() => listInsights(projectId), [projectId]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    type: "note" as InsightType,
    link: "",
    tags: "",
  });

  if (insights.error) return <ErrorNote error={insights.error} onRetry={insights.reload} />;
  if (insights.loading) return <Loading label="Loading insights..." />;

  function resetForm() {
    setFormData({ title: "", body: "", type: "note", link: "", tags: "" });
    setEditingId(null);
    setUploadError(null);
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const tags = formData.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const data = {
      title: formData.title.trim(),
      body: formData.type === "note" ? formData.body.trim() : null,
      type: formData.type,
      link: formData.type !== "note" ? formData.link.trim() : null,
      tags,
    };

    if (editingId) {
      await updateInsight(editingId, data);
    } else {
      await createInsight({ projectId, ...data });
    }
    resetForm();
    insights.reload();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this insight?")) return;
    await deleteInsight(id);
    insights.reload();
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    const isTextDoc = file.name.endsWith(".txt") || file.name.endsWith(".md") || file.type.startsWith("text/");
    if (!isTextDoc) {
      setUploadError("Only text documents (.txt, .md) can be uploaded. For PDFs or Word documents, convert to text first or paste a cloud drive link.");
      e.target.value = "";
      return;
    }

    try {
      const text = await file.text();
      setFormData((prev) => ({
        ...prev,
        body: prev.body ? prev.body + "\n\n" + text : text,
        title: prev.title || file.name.replace(/\.(txt|md)$/i, ""),
      }));
    } catch {
      setUploadError("Could not read text file.");
    }
    e.target.value = "";
  }

  return (
    <div className="insights-tab">
      <div className="section-header-row">
        <div>
          <h2 className="section-heading" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            Insights
            <span
              className="chip-small"
              data-tip="Upload rule: We save text, not files. Store links to cloud files, or drop in a .txt/.md document to parse into notes."
            >
              ℹ Text &amp; Links Only
            </span>
          </h2>
          <p className="form-note" style={{ margin: "2px 0 0 0" }}>
            Personal user notes and quick references — not generated analytics.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => { setShowForm(true); setEditingId(null); setUploadError(null); }}
          data-tip="Add a new insight (note, link, image link, or PDF link)"
        >
          + Add insight
        </button>
      </div>

      {showForm && (
        <form className="insight-form" onSubmit={handleSubmit}>
          {uploadError && (
            <p className="otp-error" style={{ flexBasis: "100%", marginBottom: 8 }}>
              {uploadError}
            </p>
          )}
          <div className="field" style={{ flexBasis: "100%" }}>
            <div className="field-label">Title</div>
            <div className="inline-form" style={{ marginBottom: 0 }}>
              <input
                autoFocus
                type="text"
                placeholder="What is this about?"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <MicButton onResult={(text) => setFormData({ ...formData, title: text })} />
            </div>
          </div>

          <div className="field">
            <div className="field-label">Type</div>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as InsightType })}
              data-tip="Note = plain text. Link/Image/PDF = store a text link to the resource."
            >
              {INSIGHT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {formData.type === "note" ? (
            <div className="field" style={{ flexBasis: "100%" }}>
              <div className="field-label">Text</div>
              <textarea
                rows={4}
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Write your insight, notes, or paste text here..."
              />
              <div className="field" style={{ marginTop: 8 }}>
                <div className="field-label">Or upload a text document (.txt, .md)</div>
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                  data-tip="Upload a .txt or .md file — its text will be parsed and added above"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="field" style={{ flexBasis: "100%" }}>
                <div className="field-label">
                  {formData.type === "link" ? "URL" : formData.type === "image" ? "Image link" : "PDF link"}
                </div>
                <input
                  type="url"
                  placeholder={INSIGHT_TYPES.find((t) => t.value === formData.type)?.placeholder}
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  data-tip={TYPE_HINTS[formData.type]}
                />
              </div>

              {formData.type === "pdf" && (
                <div className="form-note" style={{ marginTop: 4 }}>
                  <span data-tip="Convert PDF to plain text, then paste the result">
                    💡 Need plain text from a PDF? Use a free converter like{" "}
                    <a href={PDF_HELPER_URL} target="_blank" rel="noreferrer">
                      ilovepdf.com/pdf_to_text
                    </a>
                    <span data-tip="1. Upload your PDF. 2. Download the extracted text. 3. Paste it here as a 'note' insight."> — upload, convert, download text, then add as a Note</span>
                  </span>
                </div>
              )}
            </>
          )}

          <div className="field">
            <div className="field-label">Tags (comma separated)</div>
            <input
              type="text"
              placeholder="research, important, follow-up"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              data-tip="Free-form labels for filtering"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" data-tip="Save this insight">
              {editingId ? "Save changes" : "+ Add insight"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={resetForm}
              data-tip="Cancel"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {insights.data!.length === 0 && !showForm ? (
        <p className="empty-state">
          No insights yet. Click <strong>+ Add insight</strong> to save a note, link, image reference, or PDF link.
          <br />
          <span className="faint">Insights are your personal notes — not generated analytics. Add anything you want to remember.</span>
        </p>
      ) : (
        <ul className="item-list">
          {insights.data!.map((insight) => (
            <li key={insight.id} className={`item insight-${insight.type}`}>
              <span className={`mark insight-mark mark-${insight.type}`} data-tip={insight.type} />
              <span className="item-body">
                <Editable
                  className="item-title"
                  value={insight.title}
                  onSave={async (title) => {
                    await updateInsight(insight.id, { title });
                    insights.reload();
                  }}
                  label="Rename insight"
                />
                <span className="item-meta">
                  <StatusLabel status={insight.type} className={`chip-${insight.type}`} />
                  {insight.tags.map((t) => (
                    <StatusLabel key={t} status={t} />
                  ))}
                </span>
                <div className="insight-content">
                  {insight.type === "note" && insight.body && (
                    <p className="item-note">{insight.body}</p>
                  )}
                  {insight.type !== "note" && insight.link && (
                    <a
                      href={insight.link}
                      target="_blank"
                      rel="noreferrer"
                      className="resource-link"
                      data-tip={`Open ${insight.type}`}
                    >
                      {insight.link}
                    </a>
                  )}
                </div>
              </span>
              <span className="item-actions">
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => {
                    setFormData({
                      title: insight.title,
                      body: insight.body ?? "",
                      type: insight.type,
                      link: insight.link ?? "",
                      tags: insight.tags.join(", "),
                    });
                    setEditingId(insight.id);
                    setShowForm(true);
                  }}
                  data-tip="Edit this insight"
                  data-tip-edge="left"
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn-icon btn-icon-danger"
                  onClick={() => handleDelete(insight.id)}
                  data-tip="Delete this insight"
                  data-tip-edge="left"
                >
                  Del
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## `src/components/ui.tsx`

Shared UI primitives: Slide animation, Drawer, Disclosure, Editable text, StatusLabel, Loading, ErrorNote, useAsync.

```typescript
import { useEffect, useState, type ReactNode } from "react";

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

```

---

## `src/components/useVoiceInput.ts`

React hook wrapping Web Speech API for speech recognition with start/stop controls.

```typescript
import { useRef, useState, useCallback } from "react";

export function isVoiceInputSupported(): boolean {
  return typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
}

export function useVoiceInput(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const start = useCallback(() => {
    if (!isVoiceInputSupported()) return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [onResult]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return { listening, start, stop, supported: isVoiceInputSupported() };
}
```

---

## `src/data/calendar.ts`

Calendar event CRUD: local events, Google Calendar .ics import, .ics parsing, and queries.

```typescript
// src/data/calendar.ts
import { db, type CalendarEvent, type CalendarEventSource } from "./db";
import { newId, now } from "./utils";
import { syncPushRecord, syncDeleteRecord } from "../sync/sync";

export type { CalendarEvent, CalendarEventSource };

export async function listCalendarEvents(projectId?: string | null): Promise<CalendarEvent[]> {
  if (projectId) {
    return db.calendarEvents
      .where("projectId")
      .equals(projectId)
      .reverse()
      .sortBy("startAt");
  }
  return db.calendarEvents.orderBy("startAt").reverse().toArray();
}

export async function listAllCalendarEvents(): Promise<CalendarEvent[]> {
  return db.calendarEvents.orderBy("startAt").reverse().toArray();
}

export async function listUpcomingEvents(since: number, projectId?: string | null): Promise<CalendarEvent[]> {
  let query = db.calendarEvents.where("startAt").aboveOrEqual(since);
  if (projectId) query = query.and((e) => e.projectId === projectId);
  return query.sortBy("startAt");
}

export async function getCalendarEvent(id: string): Promise<CalendarEvent | undefined> {
  return db.calendarEvents.get(id);
}

export async function createLocalEvent(input: {
  projectId?: string | null;
  title: string;
  description?: string;
  startAt: number;
  endAt: number;
  hangoutLink?: string | null;
}): Promise<CalendarEvent> {
  const t = now();
  const event: CalendarEvent = {
    id: newId(),
    projectId: input.projectId ?? null,
    title: input.title,
    description: input.description ?? null,
    startAt: input.startAt,
    endAt: input.endAt,
    source: "local",
    hangoutLink: input.hangoutLink ?? null,
    syncedAt: null,
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.calendarEvents.add(event);
  void syncPushRecord("calendar_events", event);
  return event;
}

export async function importGoogleEvents(events: GoogleCalendarEventLike[]): Promise<number> {
  const local: CalendarEvent[] = [];
  for (const e of events) {
    const startAt = e.start?.dateTime
      ? new Date(e.start.dateTime).getTime()
      : e.start?.date
        ? new Date(e.start.date).getTime()
        : 0;
    const endAt = e.end?.dateTime
      ? new Date(e.end.dateTime).getTime()
      : e.end?.date
        ? new Date(e.end.date).getTime()
        : 0;
    local.push({
      id: `google_${e.id}`,
      projectId: null,
      title: e.summary ?? "(no title)",
      description: e.description ?? null,
      startAt,
      endAt,
      source: "google",
      hangoutLink: e.hangoutLink ?? null,
      syncedAt: Date.now(),
      createdAt: now(),
      updatedAt: now(),
      syncStatus: "pending",
    });
  }
  await db.calendarEvents.bulkPut(local);
  for (const ev of local) {
    void syncPushRecord("calendar_events", ev);
  }
  return local.length;
}

export async function updateCalendarEvent(
  id: string,
  changes: Partial<Pick<CalendarEvent, "title" | "description" | "startAt" | "endAt" | "hangoutLink">>
): Promise<void> {
  await db.calendarEvents.update(id, { ...changes, updatedAt: now(), syncStatus: "pending" });
  const updated = await db.calendarEvents.get(id);
  if (updated) void syncPushRecord("calendar_events", updated);
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  await db.calendarEvents.delete(id);
  void syncDeleteRecord("calendar_events", id);
}

export async function deleteEventsForProject(projectId: string): Promise<void> {
  const rows = await db.calendarEvents.where("projectId").equals(projectId).toArray();
  await db.calendarEvents.where("projectId").equals(projectId).delete();
  for (const row of rows) {
    void syncDeleteRecord("calendar_events", row.id);
  }
}

export async function pruneMissingGoogleEvents(seenIds: Set<string>): Promise<void> {
  const allGoogle = await db.calendarEvents.where("source").equals("google").toArray();
  const toDelete = allGoogle.filter((e) => !seenIds.has(e.id)).map((e) => e.id);
  if (toDelete.length) {
    await db.calendarEvents.bulkDelete(toDelete);
    for (const id of toDelete) {
      void syncDeleteRecord("calendar_events", id);
    }
  }
}

export interface GoogleCalendarEventLike {
  id: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  hangoutLink?: string;
  htmlLink?: string;
}

export async function getCalendarAlertEvents(): Promise<CalendarEvent[]> {
  const nowMs = Date.now();
  return db.calendarEvents
    .where("startAt")
    .below(nowMs)
    .and((e) => e.source === "local")
    .sortBy("startAt");
}

export async function getEventsBetween(
  start: number,
  end: number,
  projectId?: string | null
): Promise<CalendarEvent[]> {
  let query = db.calendarEvents.where("startAt").between(start, end);
  if (projectId) query = query.and((e) => e.projectId === projectId);
  return query.sortBy("startAt");
}

```

---

## `src/data/contacts.ts`

Contact CRUD: list, create, update, delete, toggle project links, and contact href helpers.

```typescript
// src/data/contacts.ts
import { db, type Contact, type ContactType } from "./db";
import { newId, now } from "./utils";
import { syncPushRecord, syncDeleteRecord } from "../sync/sync";

export type { Contact, ContactType };

export async function listContacts(projectId?: string | null): Promise<Contact[]> {
  const all = await db.contacts.toArray();
  if (!projectId) return all.sort((a, b) => b.updatedAt - a.updatedAt);
  return all.filter((c) => c.linkedProjectIds.includes(projectId)).sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function listAllContacts(): Promise<Contact[]> {
  return db.contacts.orderBy("updatedAt").reverse().toArray();
}

export async function createContact(input: {
  name: string;
  type: ContactType;
  value: string;
  tags?: string[];
  linkedProjectIds?: string[];
}): Promise<Contact> {
  const t = now();
  const contact: Contact = {
    id: newId(),
    name: input.name,
    type: input.type,
    value: input.value,
    tags: input.tags ?? [],
    linkedProjectIds: input.linkedProjectIds ?? [],
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.contacts.add(contact);
  void syncPushRecord("contacts", contact);
  return contact;
}

export async function updateContact(
  id: string,
  changes: Partial<Pick<Contact, "name" | "type" | "value" | "tags" | "linkedProjectIds">>
): Promise<void> {
  await db.contacts.update(id, { ...changes, updatedAt: now(), syncStatus: "pending" });
  const updated = await db.contacts.get(id);
  if (updated) void syncPushRecord("contacts", updated);
}

export async function deleteContact(id: string): Promise<void> {
  await db.contacts.delete(id);
  void syncDeleteRecord("contacts", id);
}

export async function deleteContactsForProject(projectId: string): Promise<void> {
  const contacts = await db.contacts.where("linkedProjectIds").equals(projectId).toArray();
  for (const c of contacts) {
    await db.contacts.delete(c.id);
    void syncDeleteRecord("contacts", c.id);
  }
}

export async function toggleContactProject(contactId: string, projectId: string): Promise<void> {
  const contact = await db.contacts.get(contactId);
  if (!contact) return;
  const linked = contact.linkedProjectIds.includes(projectId);
  const newLinked = linked
    ? contact.linkedProjectIds.filter((id) => id !== projectId)
    : [...contact.linkedProjectIds, projectId];
  await updateContact(contactId, { linkedProjectIds: newLinked });
}

export function linkedProjectIds(contact: Contact): string[] {
  return contact.linkedProjectIds ?? [];
}

export function contactHref(contact: Contact): string | null {
  switch (contact.type) {
    case "email":
      return `mailto:${contact.value}`;
    case "phone":
      return `tel:${contact.value}`;
    case "link":
      return contact.value;
    default:
      return null;
  }
}

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  email: "Email",
  phone: "Phone",
  link: "Link",
};

```

---

## `src/data/conversations.ts`

Conversation and message storage: create, list, delete, expiry pruning, and retention settings.

```typescript
// src/data/conversations.ts
// Assistant history, stored locally and expired on a timer.
import { db, type Conversation, type Message } from "./db.ts"
import { newId, now } from "./utils.ts"

export type { Conversation, Message };

export const DEFAULT_RETENTION_DAYS = 7;

export async function getRetentionDays(): Promise<number> {
  const row = await db.settings.get("assistantRetentionDays");
  const value = (row?.value as number | undefined) ?? DEFAULT_RETENTION_DAYS;
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_RETENTION_DAYS;
}

export async function setRetentionDays(days: number): Promise<void> {
  await db.settings.put({ key: "assistantRetentionDays", value: days });
}

export async function createConversation(title: string): Promise<Conversation> {
  const t = now();
  const days = await getRetentionDays();
  const conversation: Conversation = {
    id: newId(),
    title: title.slice(0, 80) || "New conversation",
    expiresAt: t + days * 24 * 60 * 60 * 1000,
    createdAt: t,
    updatedAt: t,
  };
  await db.conversations.add(conversation);
  return conversation;
}

export async function listConversations(): Promise<Conversation[]> {
  const all = await db.conversations.toArray();
  return all.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getConversation(id: string): Promise<Conversation | undefined> {
  return db.conversations.get(id);
}

export async function renameConversation(id: string, title: string): Promise<void> {
  await db.conversations.update(id, { title: title.slice(0, 80), updatedAt: now() });
}

export async function deleteConversation(id: string): Promise<void> {
  await db.transaction("rw", [db.conversations, db.messages], async () => {
    await db.conversations.delete(id);
    await db.messages.where("conversationId").equals(id).delete();
  });
}

export async function listMessages(conversationId: string): Promise<Message[]> {
  const all = await db.messages.where("conversationId").equals(conversationId).toArray();
  return all.sort((a, b) => a.createdAt - b.createdAt);
}

export async function addMessage(
  conversationId: string,
  role: Message["role"],
  text: string
): Promise<Message> {
  const t = now();
  const message: Message = { id: newId(), conversationId, role, text, createdAt: t };
  await db.transaction("rw", [db.conversations, db.messages], async () => {
    await db.messages.add(message);
    await db.conversations.update(conversationId, { updatedAt: t });
  });
  return message;
}

/** Drops every conversation and message past its expiry. Safe to call often. */
export async function pruneExpiredConversations(): Promise<number> {
  const t = now();
  const expired = await db.conversations.where("expiresAt").belowOrEqual(t).toArray();
  if (!expired.length) return 0;
  await deleteConversations(expired.map((c) => c.id));
  return expired.length;
}

async function deleteConversations(ids: string[]): Promise<void> {
  await db.transaction("rw", [db.conversations, db.messages], async () => {
    for (const id of ids) {
      await db.conversations.delete(id);
      await db.messages.where("conversationId").equals(id).delete();
    }
  });
}

```

---

## `src/data/dashboard.ts`

Computed dashboard aggregates: alerts (overdue tasks/reminders, missed milestones) and summary stats.

```typescript
// src/data/dashboard.ts
// Computed aggregates for the home screen — alerts, summary stats, progress.
import { db } from "../data/db";
import { listAllActiveTasks } from "./tasks";
import { listProjects } from "./projects";

export interface Alert {
  id: string;
  type: "overdue_task" | "due_reminder" | "overdue_reminder" | "missed_milestone";
  title: string;
  subtitle: string;
  projectId: string | null;
  routerLink?: string; // deep-link target
}

export async function getDashboardAlerts(limit = 10): Promise<Alert[]> {
  const now = Date.now();
  const alerts: Alert[] = [];

  // Overdue tasks (active but past dueDate)
  const activeTasks = await listAllActiveTasks();
  for (const t of activeTasks) {
    if (t.dueDate && t.dueDate < now) {
      alerts.push({
        id: `task-${t.id}`,
        type: "overdue_task",
        title: t.title,
        subtitle: `Overdue task in ${await projectName(t.projectId)}`,
        projectId: t.projectId,
        routerLink: `/project/${t.projectId}?tab=Tasks`,
      });
    }
  }

  // Due or overdue reminders
  const allReminders = await db.reminders.where("status").equals("pending").toArray();
  for (const r of allReminders) {
    if (r.triggerAt <= now) {
      const label = r.triggerAt < now - 60_000 ? "overdue" : "due";
      alerts.push({
        id: `reminder-${r.id}`,
        type: label === "overdue" ? "overdue_reminder" : "due_reminder",
        title: r.message,
        subtitle: `${label === "overdue" ? "Overdue" : "Due"} reminder`,
        projectId: r.projectId,
        routerLink: r.projectId
          ? `/project/${r.projectId}?tab=Reminders`
          : `/dashboard`,
      });
    }
  }

  // Missed milestones
  const allMilestones = await db.milestones.where("status").equals("missed").toArray();
  for (const m of allMilestones) {
    alerts.push({
      id: `milestone-${m.id}`,
      type: "missed_milestone",
      title: m.title,
      subtitle: `Missed milestone in ${await projectName(m.projectId)}`,
      projectId: m.projectId,
      routerLink: `/project/${m.projectId}?tab=Milestones`,
    });
  }

  // Sort by urgency: overdue reminders/tasks first, then missed milestones
  const priority = {
    overdue_task: 0,
    overdue_reminder: 1,
    due_reminder: 2,
    missed_milestone: 3,
  };
  alerts.sort((a, b) => priority[a.type] - priority[b.type]);
  return alerts.slice(0, limit);
}

export interface DashboardSummary {
  activeTaskCount: number;
  remainingTaskCount: number;
  milestoneProgressPercent: number;
  milestoneTotal: number;
  milestoneAchieved: number;
  projectCount: number;
}

export interface SummaryCard {
  key: string;
  label: string;
  value: string | number;
  hint?: string;
  tab?: string;
}

export function summaryCards(summary: DashboardSummary): SummaryCard[] {
  return [
    { key: "active", label: "Active tasks", value: summary.activeTaskCount, hint: `${summary.activeTaskCount} active task(s). Click to view all tasks.`, tab: "Tasks" },
    { key: "total", label: "Tasks (total)", value: summary.remainingTaskCount, hint: `${summary.remainingTaskCount} total task(s) across ${summary.projectCount} project(s).`, tab: "Tasks" },
    { key: "milestones", label: "Milestones", value: `${summary.milestoneProgressPercent}%`, hint: `${summary.milestoneAchieved} of ${summary.milestoneTotal} milestones achieved (${summary.milestoneProgressPercent}%).`, tab: "Milestones" },
    { key: "projects", label: "Projects", value: summary.projectCount, hint: `${summary.projectCount} project(s). Click to see all.`, tab: "Projects" },
  ];
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [projects, tasks, milestones] = await Promise.all([listProjects("active"), listAllActiveTasks(), db.milestones.toArray()]);

  const active = tasks.filter((t) => t.status === "active");
  const completed = tasks.filter((t) => t.status === "completed");
  const remaining = active.length + completed.length;

  const achieved = milestones.filter((m) => m.status === "achieved").length;
  const total = milestones.length;
  const milestoneProgressPercent = total === 0 ? 0 : Math.round((achieved / total) * 100);

  return {
    activeTaskCount: active.length,
    remainingTaskCount: remaining,
    milestoneProgressPercent,
    milestoneTotal: total,
    milestoneAchieved: achieved,
    projectCount: projects.length,
  };
}

async function projectName(id: string): Promise<string> {
  return (await db.projects.get(id))?.name ?? "";
}

```

---

## `src/data/db.ts`

Dexie/IndexedDB database: schema definitions, 7 versioned migrations, export/import, and seed data.

```typescript
// src/data/db.ts
// This is the ONLY file in the app allowed to talk to IndexedDB directly.
// Every other module (UI, sync, search) goes through the functions exported
// from this /data folder — never imports Dexie itself.

import Dexie, { type Table } from "dexie";
import { getSessionUserId } from "../auth/session";

export type TaskStatus = "active" | "inactive" | "completed";
export type ProjectStatus = "active" | "archived";
export type IssueSeverity = "low" | "medium" | "high";
export type IssueStatus = "open" | "resolved";
export type MilestoneStatus = "in_progress" | "achieved" | "missed";
export type SyncStatus = "pending" | "synced";
export type CalendarEventSource = "local" | "google";
export type ResourceProvider = "gemini" | "claude" | "gpt" | "other";
export type ContactType = "email" | "phone" | "link";

export interface Contact {
  id: string;
  name: string;
  type: ContactType;
  value: string;
  tags: string[];
  linkedProjectIds: string[];
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
}

// Fixed and user-added resource categories.
export type ResourceCategory =
  | "notes"
  | "scripts"
  | "links"
  | "images"
  | "pdfs"
  | (string & {});

export interface ResourceImage {
  link: string;
  name: string;
  alt: string;
  dataUrl?: string; // legacy support for existing base64 images
}

export interface ResourceFile {
  name: string;
  link?: string; // for PDFs: Drive link
  text?: string; // for notes: parsed text content
  dataUrl?: string; // legacy support for existing base64 files
  type?: string; // legacy
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  notes: string;
  status: TaskStatus;
  executor: "ai" | "manual";
  dueDate: number | null;
  scheduledAt: number | null;
  estimatedMinutes: number | null;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
}

// Resource: a single unified entity with a fixed `category` enum.
// Category-specific fields live as explicit columns locally.
// Only fields relevant to a given category are populated; the rest are null / empty arrays.
export interface Resource {
  id: string;
  projectId: string | null;
  category: ResourceCategory;
  title: string;
  tags: string[];
  // Category-specific fields:
  url: string | null; // links
  provider: ResourceProvider | null; // links (AI chat links)
  body: string | null; // notes, scripts, links
  images: ResourceImage[]; // images
  files: ResourceFile[]; // notes (attached doc/pdf/spreadsheet), pdfs (Drive file info)
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
}

export interface DocEntry {
  id: string;
  projectId: string;
  type: "outline" | "phase";
  title: string;
  content: string;
  order: number;
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  targetDate: number | null;
  status: MilestoneStatus;
  /** Task ids that must complete before this milestone can be achieved. */
  blockingTaskIds: string[];
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
}

export interface Issue {
  id: string;
  projectId: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  status: IssueStatus;
  labels: string[];
  comments: IssueComment[];
  milestoneId: string | null;
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
}

export interface IssueComment {
  id: string;
  issueId: string;
  text: string;
  createdAt: number;
  updatedAt: number;
}

export interface Reminder {
  id: string;
  projectId: string | null;
  linkedEntityType: "task" | "milestone" | null;
  linkedEntityId: string | null;
  message: string;
  triggerAt: number;
  status: "pending" | "fired" | "dismissed";
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
}

export type InsightType = "note" | "link" | "image" | "pdf";

export interface Insight {
  id: string;
  projectId: string;
  title: string;
  body: string | null;
  type: InsightType;
  link: string | null;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
}

export interface CalendarEvent {
  id: string;
  projectId: string | null;
  title: string;
  description: string | null;
  startAt: number;
  endAt: number;
  source: CalendarEventSource;
  hangoutLink: string | null;
  syncedAt: number | null;
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
}

export interface ScheduleItem {
  id: string;
  projectId: string | null;
  title: string;
  description: string | null;
  scheduledAt: number;
  durationMinutes: number | null;
  sourceTaskId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Conversation {
  id: string;
  title: string;
  expiresAt: number;
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  text: string;
  createdAt: number;
}

// Settings keys used across the app
export const SETTINGS_KEYS = {
  appInitialized: "appInitialized",
  geminiApiKey: "geminiApiKey",
  googleCalendarClientId: "googleCalendarClientId",
  googleCalendarToken: "googleCalendarToken",
  googlePickerKey: "googlePickerKey",
  googleAccessToken: "googleAccessToken",
  driveFolderPrefix: "driveFolder:",
} as const;

// Derive a stable, per-user database name from the logged-in user ID.
// This ensures each user gets their own isolated IndexedDB database.
export function getUserDbName(): string {
  const userId = getSessionUserId();
  if (!userId) return "panga-db";
  return `panga-db-${userId}`;
}

class PangaDB extends Dexie {
  projects!: Table<Project, string>;
  tasks!: Table<Task, string>;
  resources!: Table<Resource, string>;
  docEntries!: Table<DocEntry, string>;
  milestones!: Table<Milestone, string>;
  issues!: Table<Issue, string>;
  contacts!: Table<Contact, string>;
  reminders!: Table<Reminder, string>;
  calendarEvents!: Table<CalendarEvent, string>;
  scheduleItems!: Table<ScheduleItem, string>;
  conversations!: Table<Conversation, string>;
  messages!: Table<Message, string>;
  insights!: Table<Insight, string>;
  settings!: Table<{ key: string; value: any }, string>;

  constructor() {
    super(getUserDbName());
    this.version(2).stores({
      projects: "id, status, updatedAt, syncStatus",
      tasks: "id, projectId, status, dueDate, updatedAt, syncStatus, *tags",
      resources: "id, projectId, category, updatedAt, syncStatus, *tags",
      docEntries: "id, projectId, type, order, updatedAt, syncStatus",
      goals: "id, projectId, status, targetDate, updatedAt, syncStatus",
      issues: "id, projectId, status, severity, updatedAt, syncStatus",
      contacts: "id, name, updatedAt, syncStatus, *linkedProjectIds",
      reminders: "id, projectId, triggerAt, status, updatedAt, syncStatus",
      settings: "key",
    });
    this.version(3)
      .stores({
        projects: "id, status, updatedAt, syncStatus",
        tasks: "id, projectId, status, dueDate, updatedAt, syncStatus, *tags",
        resources: "id, projectId, category, updatedAt, syncStatus, *tags",
        docEntries: "id, projectId, type, order, updatedAt, syncStatus",
        goals: null,
        milestones: "id, projectId, status, targetDate, updatedAt, syncStatus, *blockingTaskIds",
        issues: "id, projectId, status, severity, updatedAt, syncStatus",
        contacts: "id, name, updatedAt, syncStatus, *linkedProjectIds",
        reminders: "id, projectId, triggerAt, status, updatedAt, syncStatus",
        settings: "key",
      })
      .upgrade(async (tx) => {
        const oldGoals = await tx.table("goals").toArray();
        if (oldGoals.length) {
          await tx.table("milestones").bulkAdd(
            oldGoals.map((g: Record<string, unknown>) => ({ ...g, blockingTaskIds: [] }))
          );
        }
      });

    // v4: fixed resource categories + category-specific fields, calendarEvents,
    // scheduleItems, contacts table, drop goals/resourceCategories settings, migrate data.
    this.version(4)
      .stores({
        projects: "id, status, updatedAt, syncStatus",
        tasks: "id, projectId, status, dueDate, scheduledAt, executor, updatedAt, syncStatus, *tags",
        resources: "id, projectId, category, updatedAt, syncStatus, *tags, provider",
        docEntries: "id, projectId, type, order, updatedAt, syncStatus",
        milestones: "id, projectId, status, targetDate, updatedAt, syncStatus, *blockingTaskIds",
        issues: "id, projectId, status, severity, updatedAt, syncStatus",
        contacts: "id, name, type, value, updatedAt, syncStatus, *tags, *linkedProjectIds",
        reminders: "id, projectId, triggerAt, status, updatedAt, syncStatus",
        calendarEvents: "id, projectId, source, startAt, endAt, updatedAt",
        scheduleItems: "id, projectId, scheduledAt, updatedAt",
        conversations: "id, expiresAt, createdAt, updatedAt",
        messages: "id, conversationId, createdAt",
        settings: "key",
      })
      .upgrade(async (tx) => {
        try {
          // --- Migrate resources from freeform categories to fixed categories ---
          const oldResources = await tx.table("resources").toArray();
          const migrated: Record<string, unknown>[] = oldResources.map((r: any) => {
            const cat = r.category as string;
            let newCategory: ResourceCategory = "notes";
            let url: string | null = null;
            let body: string | null = null;
            let provider: ResourceProvider | null = null;

            switch (cat) {
              case "link":
                newCategory = "links";
                url = r.value || null;
                body = r.textBody || r.notes || null;
                break;
              case "script":
                newCategory = "scripts";
                body = r.textBody || r.value || r.notes || null;
                break;
              case "prompts":
                newCategory = "notes";
                body = r.textBody || r.value || r.notes || null;
                break;
              case "ai_chat_links":
                newCategory = "links";
                url = r.value || null;
                provider = r.provider || null;
                body = r.textBody || r.notes || null;
                break;
              case "reports_memos":
                newCategory = "notes";
                body = r.textBody || r.value || r.notes || null;
                break;
              case "location":
                newCategory = "notes";
                body = r.textBody || r.value || r.notes || null;
                break;
              case "name":
                newCategory = "notes";
                body = r.textBody || r.value || r.notes || null;
                break;
              case "reminder":
                newCategory = "notes";
                body = r.textBody || r.value || r.notes || null;
                break;
              case "schedule":
                newCategory = "notes";
                body = r.textBody || r.value || r.notes || null;
                break;
              case "bookmark_group":
                newCategory = "links";
                body = r.textBody || r.value || r.notes || null;
                break;
              case "file":
                newCategory = "notes";
                body = r.textBody || r.notes || null;
                break;
              case "images":
                newCategory = "images";
                break;
              case "pdfs":
                newCategory = "pdfs";
                break;
              default:
                newCategory = "notes";
                body = r.textBody || r.value || r.notes || null;
            }

            return {
              id: r.id,
              projectId: r.projectId,
              category: newCategory,
              title: r.title,
              tags: r.tags || [],
              url,
              provider,
              body,
              images: r.images || [],
              files: [],
              createdAt: r.createdAt,
              updatedAt: r.updatedAt,
              syncStatus: r.syncStatus,
            };
          });

          if (migrated.length) {
            await tx.table("resources").bulkPut(migrated);
          }
        } catch (e) {
          console.warn("Resources upgrade error:", e);
        }

        // Clean up old settings without accessing db directly
        try {
          await tx.table("settings").delete("resourceCategories");
        } catch {}
      });

    // v5: add insights table + milestone description
    this.version(5)
      .stores({
        milestones: "id, projectId, status, targetDate, updatedAt, syncStatus, *blockingTaskIds",
        insights: "id, projectId, type, updatedAt, syncStatus, *tags",
      })
      .upgrade(async (tx) => {
        try {
          // Backfill description for existing milestones
          const ms = await tx.table("milestones").toArray();
          for (const m of ms) {
            if ((m as any).description === undefined || (m as any).description === null) {
              await tx.table("milestones").where("id").equals(m.id).modify({ description: "" });
            }
          }
        } catch (e) {
          console.warn("Milestones upgrade error:", e);
        }
      });

    // v6: index createdAt on tasks and issues for sorting
    this.version(6).stores({
      tasks: "id, projectId, status, dueDate, scheduledAt, executor, createdAt, updatedAt, syncStatus, *tags",
      issues: "id, projectId, status, severity, createdAt, updatedAt, syncStatus",
    });

    // v7: syncStatus on calendarEvents for multi-device sync
    this.version(7)
      .stores({
        calendarEvents: "id, projectId, source, startAt, endAt, updatedAt, syncStatus",
      })
      .upgrade(async (tx) => {
        try {
          const events = await tx.table("calendarEvents").toArray();
          for (const e of events) {
            if ((e as any).syncStatus === undefined) {
              await tx
                .table("calendarEvents")
                .where("id")
                .equals(e.id)
                .modify({ syncStatus: "pending" });
            }
          }
        } catch (err) {
          console.warn("calendarEvents upgrade error:", err);
        }
      });
  }
}

export const db = new PangaDB();

export async function ensureSeedData() {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    const initialized = await db.settings.get(SETTINGS_KEYS.appInitialized);
    if (!initialized) {
      await db.settings.put({ key: SETTINGS_KEYS.appInitialized, value: true });
    }
  } catch (e) {
    console.error("ensureSeedData error:", e);
  }
}

/**
 * Export the entire local database state as a plain serializable object.
 * Used by the snapshot/backup system. Excludes no credentials — this is
 * pure app data only.
 */
export async function exportDbState(): Promise<Record<string, any[]>> {
  if (!db.isOpen()) await db.open();

  const tables = [
    "projects",
    "tasks",
    "resources",
    "docEntries",
    "milestones",
    "issues",
    "contacts",
    "reminders",
    "calendarEvents",
    "scheduleItems",
    "conversations",
    "messages",
    "insights",
    "settings",
  ];

  const data: Record<string, any[]> = {};
  for (const name of tables) {
    try {
      data[name] = await (db as any)[name].toArray();
    } catch {
      data[name] = [];
    }
  }
  return data;
}

/**
 * Replace all user-table contents with the provided data.
 * Clears each table first, then bulk-loads. Call within a write transaction
 * for atomicity.
 */
export async function importDbState(data: Record<string, any[]>): Promise<void> {
  if (!db.isOpen()) await db.open();

  const tables = [
    "projects",
    "tasks",
    "resources",
    "docEntries",
    "milestones",
    "issues",
    "contacts",
    "reminders",
    "calendarEvents",
    "scheduleItems",
    "conversations",
    "messages",
    "insights",
    "settings",
  ];

  // Use the array form of transaction to avoid argument limit
  await db.transaction("rw", tables, async () => {
    for (const name of tables) {
      const tableData = data[name] ?? [];
      const table = (db as any)[name];
      if (table) {
        await table.clear();
        if (tableData.length > 0) {
          await table.bulkAdd(tableData);
        }
      }
    }
  });
}

/** Quick check: does any user data exist in the local database? */
export async function hasLocalData(): Promise<boolean> {
  if (!db.isOpen()) await db.open();
  const tables = [
    "projects", "tasks", "resources", "docEntries", "milestones",
    "issues", "contacts", "reminders", "calendarEvents",
    "scheduleItems", "conversations", "messages", "insights",
  ];
  const counts = await Promise.all(
    tables.map((t) => (db as any)[t]?.count().catch(() => 0))
  );
  return counts.some((c: number) => c > 0);
}

```

---

## `src/data/docs.ts`

Documentation entry CRUD: outline/phase entries with ordering for project docs.

```typescript
// src/data/docs.ts
import { db, type DocEntry } from "./db";
import { newId, now } from "./utils";
import { syncPushRecord, syncDeleteRecord } from "../sync/sync";

export type { DocEntry };

export async function listDocEntries(projectId: string): Promise<DocEntry[]> {
  return db.docEntries.where("projectId").equals(projectId).sortBy("order");
}

export async function createDocEntry(input: {
  projectId: string;
  type: "outline" | "phase";
  title: string;
  content?: string;
}): Promise<DocEntry> {
  const t = now();
  const existing = await listDocEntries(input.projectId);
  const entry: DocEntry = {
    id: newId(),
    projectId: input.projectId,
    type: input.type,
    title: input.title,
    content: input.content ?? "",
    order: existing.length,
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.docEntries.add(entry);
  void syncPushRecord("doc_entries", entry);
  return entry;
}

export async function updateDocEntry(
  id: string,
  changes: Partial<Pick<DocEntry, "title" | "content">>
): Promise<void> {
  await db.docEntries.update(id, { ...changes, updatedAt: now(), syncStatus: "pending" });
  const updated = await db.docEntries.get(id);
  if (updated) void syncPushRecord("doc_entries", updated);
}

export async function deleteDocEntry(id: string): Promise<void> {
  await db.docEntries.delete(id);
  void syncDeleteRecord("doc_entries", id);
}

```

---

## `src/data/insights.ts`

Insight CRUD: notes, links, image links, PDF links with file upload support.

```typescript
// src/data/insights.ts
import { db, type Insight, type InsightType } from "./db";
import { newId, now } from "./utils";
import { syncPushRecord, syncDeleteRecord } from "../sync/sync";

export type { Insight, InsightType };

export async function listInsights(projectId: string): Promise<Insight[]> {
  return db.insights.where("projectId").equals(projectId).reverse().sortBy("updatedAt");
}

export async function getInsight(id: string): Promise<Insight | undefined> {
  return db.insights.get(id);
}

export async function createInsight(input: {
  projectId: string;
  title: string;
  body?: string | null;
  type?: InsightType;
  link?: string | null;
  tags?: string[];
}): Promise<Insight> {
  const t = now();
  const insight: Insight = {
    id: newId(),
    projectId: input.projectId,
    title: input.title,
    body: input.body ?? null,
    type: input.type ?? "note",
    link: input.link ?? null,
    tags: input.tags ?? [],
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.insights.add(insight);
  void syncPushRecord("insights", insight);
  return insight;
}

export async function updateInsight(
  id: string,
  changes: Partial<Pick<Insight, "title" | "body" | "type" | "link" | "tags">>
): Promise<void> {
  await db.insights.update(id, { ...changes, updatedAt: now(), syncStatus: "pending" });
  const updated = await db.insights.get(id);
  if (updated) void syncPushRecord("insights", updated);
}

export async function deleteInsight(id: string): Promise<void> {
  await db.insights.delete(id);
  void syncDeleteRecord("insights", id);
}

export async function deleteInsightsForProject(projectId: string): Promise<void> {
  const rows = await db.insights.where("projectId").equals(projectId).toArray();
  await db.insights.where("projectId").equals(projectId).delete();
  for (const row of rows) {
    void syncDeleteRecord("insights", row.id);
  }
}

```

---

## `src/data/issues.ts`

Issue CRUD: create with severity, comments management, label/milestone updates, and delete.

```typescript
// src/data/issues.ts
import { db, type Issue, type IssueSeverity, type IssueStatus, type IssueComment } from "./db";
import { newId, now } from "./utils";
import { syncPushRecord, syncDeleteRecord } from "../sync/sync";

export type { Issue, IssueSeverity, IssueStatus, IssueComment };

export async function listIssues(projectId: string): Promise<Issue[]> {
  const list = await db.issues.where("projectId").equals(projectId).toArray();
  return list.sort((a, b) => a.createdAt - b.createdAt);
}

export async function createIssue(input: {
  projectId: string;
  title: string;
  description?: string;
  severity?: IssueSeverity;
  milestoneId?: string | null;
}): Promise<Issue> {
  const t = now();
  const issue: Issue = {
    id: newId(),
    projectId: input.projectId,
    title: input.title,
    description: input.description ?? "",
    severity: input.severity ?? "medium",
    status: "open",
    labels: [],
    comments: [],
    milestoneId: input.milestoneId ?? null,
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.issues.add(issue);
  void syncPushRecord("issues", issue);
  return issue;
}

export async function updateIssue(
  id: string,
  changes: Partial<Pick<Issue, "title" | "description" | "severity" | "labels" | "milestoneId">>
): Promise<void> {
  await db.issues.update(id, { ...changes, updatedAt: now(), syncStatus: "pending" });
  const updated = await db.issues.get(id);
  if (updated) void syncPushRecord("issues", updated);
}

export async function setIssueStatus(id: string, status: IssueStatus): Promise<void> {
  await db.issues.update(id, { status, updatedAt: now(), syncStatus: "pending" });
  const updated = await db.issues.get(id);
  if (updated) void syncPushRecord("issues", updated);
}

export async function addIssueComment(issueId: string, text: string): Promise<IssueComment> {
  const t = now();
  const comment: IssueComment = {
    id: newId(),
    issueId,
    text,
    createdAt: t,
    updatedAt: t,
  };
  const issue = await db.issues.get(issueId);
  if (issue) {
    const comments = [...(issue.comments ?? []), comment];
    await db.issues.update(issueId, { comments, updatedAt: now(), syncStatus: "pending" });
    const updated = await db.issues.get(issueId);
    if (updated) void syncPushRecord("issues", updated);
  }
  return comment;
}

export async function deleteIssueComment(issueId: string, commentId: string): Promise<void> {
  const issue = await db.issues.get(issueId);
  if (issue) {
    const comments = (issue.comments ?? []).filter((c) => c.id !== commentId);
    await db.issues.update(issueId, { comments, updatedAt: now(), syncStatus: "pending" });
    const updated = await db.issues.get(issueId);
    if (updated) void syncPushRecord("issues", updated);
  }
}

export async function updateIssueComment(issueId: string, commentId: string, text: string): Promise<void> {
  const issue = await db.issues.get(issueId);
  if (issue) {
    const comments = (issue.comments ?? []).map((c) =>
      c.id === commentId ? { ...c, text, updatedAt: now() } : c
    );
    await db.issues.update(issueId, { comments, updatedAt: now(), syncStatus: "pending" });
    const updated = await db.issues.get(issueId);
    if (updated) void syncPushRecord("issues", updated);
  }
}

export async function setIssueLabels(id: string, labels: string[]): Promise<void> {
  await db.issues.update(id, { labels, updatedAt: now(), syncStatus: "pending" });
  const updated = await db.issues.get(id);
  if (updated) void syncPushRecord("issues", updated);
}

export async function setIssueMilestone(id: string, milestoneId: string | null): Promise<void> {
  await db.issues.update(id, { milestoneId, updatedAt: now(), syncStatus: "pending" });
  const updated = await db.issues.get(id);
  if (updated) void syncPushRecord("issues", updated);
}

export async function deleteIssue(id: string): Promise<void> {
  await db.issues.delete(id);
  void syncDeleteRecord("issues", id);
}

```

---

## `src/data/milestones.ts`

Milestone CRUD: create with blocking task IDs, status management, and auto-reconciliation of completion.

```typescript
// src/data/milestones.ts
import { db, type Milestone, type MilestoneStatus } from "./db";
import { newId, now } from "./utils";
import { syncPushRecord, syncDeleteRecord } from "../sync/sync";

export type { Milestone, MilestoneStatus };

export async function listMilestones(projectId: string): Promise<Milestone[]> {
  return db.milestones.where("projectId").equals(projectId).sortBy("targetDate");
}

export async function createMilestone(input: {
  projectId: string;
  title: string;
  description?: string;
  targetDate?: number | null;
  blockingTaskIds?: string[];
}): Promise<Milestone> {
  const t = now();
  const milestone: Milestone = {
    id: newId(),
    projectId: input.projectId,
    title: input.title,
    description: input.description ?? "",
    targetDate: input.targetDate ?? null,
    status: "in_progress",
    blockingTaskIds: input.blockingTaskIds ?? [],
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.milestones.add(milestone);
  void syncPushRecord("milestones", milestone);
  return milestone;
}

export async function updateMilestone(
  id: string,
  changes: Partial<Pick<Milestone, "title" | "description" | "targetDate" | "blockingTaskIds">>
): Promise<void> {
  await db.milestones.update(id, { ...changes, updatedAt: now(), syncStatus: "pending" });
  const updated = await db.milestones.get(id);
  if (updated) void syncPushRecord("milestones", updated);
}

export async function setMilestoneStatus(id: string, status: MilestoneStatus): Promise<void> {
  await db.milestones.update(id, { status, updatedAt: now(), syncStatus: "pending" });
  const updated = await db.milestones.get(id);
  if (updated) void syncPushRecord("milestones", updated);
}

export async function deleteMilestone(id: string): Promise<void> {
  await db.milestones.delete(id);
  void syncDeleteRecord("milestones", id);
}

/**
 * A milestone auto-completes once every task it's blocked on is completed
 * (if it has any linked tasks at all — manual status still wins otherwise).
 * Call after any task status change so milestones stay in sync.
 */
export async function reconcileMilestoneStatuses(projectId: string): Promise<void> {
  const [milestones, tasks] = await Promise.all([
    listMilestones(projectId),
    db.tasks.where("projectId").equals(projectId).toArray(),
  ]);
  const taskById = new Map(tasks.map((t) => [t.id, t]));
  for (const m of milestones) {
    if (m.blockingTaskIds.length === 0 || m.status === "missed") continue;
    const allDone = m.blockingTaskIds.every((id) => taskById.get(id)?.status === "completed");
    if (allDone && m.status !== "achieved") {
      await setMilestoneStatus(m.id, "achieved");
    } else if (!allDone && m.status === "achieved") {
      await setMilestoneStatus(m.id, "in_progress");
    }
  }
}

```

---

## `src/data/projects.ts`

Project CRUD: list, create, update, archive, delete (with cascade), and task statistics.

```typescript
// src/data/projects.ts
import { db, type Project, type ProjectStatus } from "./db";
import { newId, now } from "./utils";
import { syncPushRecord, syncDeleteRecord } from "../sync/sync";

export type { Project, ProjectStatus };

export async function listProjects(
  status: ProjectStatus = "active"
): Promise<Project[]> {
  if (!db.isOpen()) await db.open();
  return db.projects
    .where("status")
    .equals(status)
    .reverse()
    .sortBy("updatedAt");
}

export async function listAllProjects(): Promise<Project[]> {
  if (!db.isOpen()) await db.open();
  return db.projects.orderBy("updatedAt").reverse().toArray();
}

export async function getProject(id: string): Promise<Project | undefined> {
  if (!db.isOpen()) await db.open();
  return db.projects.get(id);
}

export async function createProject(input: {
  name: string;
  description?: string;
}): Promise<Project> {
  if (!db.isOpen()) await db.open();
  const t = now();
  const project: Project = {
    id: newId(),
    name: input.name,
    description: input.description ?? "",
    status: "active",
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.projects.add(project);
  void syncPushRecord("projects", project);
  return project;
}

export async function updateProject(
  id: string,
  changes: Partial<Pick<Project, "name" | "description" | "status">>
): Promise<void> {
  if (!db.isOpen()) await db.open();
  const updatedAt = now();
  await db.projects.update(id, { ...changes, updatedAt, syncStatus: "pending" });
  const updated = await db.projects.get(id);
  if (updated) void syncPushRecord("projects", updated);
}

export async function archiveProject(id: string): Promise<void> {
  await updateProject(id, { status: "archived" });
}

export async function deleteProject(id: string): Promise<void> {
  if (!db.isOpen()) await db.open();

  // Collect child ids before local cascade so we can delete them remotely.
  const [taskIds, resourceIds, docIds, milestoneIds, issueIds, reminderIds, eventIds, insightIds] =
    await Promise.all([
      db.tasks.where("projectId").equals(id).primaryKeys(),
      db.resources.where("projectId").equals(id).primaryKeys(),
      db.docEntries.where("projectId").equals(id).primaryKeys(),
      db.milestones.where("projectId").equals(id).primaryKeys(),
      db.issues.where("projectId").equals(id).primaryKeys(),
      db.reminders.where("projectId").equals(id).primaryKeys(),
      db.calendarEvents.where("projectId").equals(id).primaryKeys(),
      db.insights.where("projectId").equals(id).primaryKeys(),
    ]);

  await db.transaction(
    "rw",
    [
      db.projects,
      db.tasks,
      db.resources,
      db.docEntries,
      db.milestones,
      db.issues,
      db.reminders,
      db.calendarEvents,
      db.scheduleItems,
      db.insights,
    ],
    async () => {
      await db.tasks.where("projectId").equals(id).delete();
      await db.resources.where("projectId").equals(id).delete();
      await db.docEntries.where("projectId").equals(id).delete();
      await db.milestones.where("projectId").equals(id).delete();
      await db.issues.where("projectId").equals(id).delete();
      await db.reminders.where("projectId").equals(id).delete();
      await db.calendarEvents.where("projectId").equals(id).delete();
      await db.scheduleItems.where("projectId").equals(id).delete();
      await db.insights.where("projectId").equals(id).delete();
      await db.projects.delete(id);
    }
  );

  // Remote cascade deletes
  void syncDeleteRecord("projects", id);
  for (const tid of taskIds) void syncDeleteRecord("tasks", String(tid));
  for (const rid of resourceIds) void syncDeleteRecord("resources", String(rid));
  for (const did of docIds) void syncDeleteRecord("doc_entries", String(did));
  for (const mid of milestoneIds) void syncDeleteRecord("milestones", String(mid));
  for (const iid of issueIds) void syncDeleteRecord("issues", String(iid));
  for (const rid of reminderIds) void syncDeleteRecord("reminders", String(rid));
  for (const eid of eventIds) void syncDeleteRecord("calendar_events", String(eid));
  for (const iid of insightIds) void syncDeleteRecord("insights", String(iid));
}

/** Derived progress (§7 of the plan): completed / total non-archived tasks. */
export async function getProjectProgress(projectId: string): Promise<number> {
  const tasks = await db.tasks.where("projectId").equals(projectId).toArray();
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.status === "completed").length;
  return Math.round((completed / tasks.length) * 100);
}

/** Task counts used to power the milestone hover hint (completion % + pending count). */
export async function getProjectTaskStats(
  projectId: string
): Promise<{ total: number; completed: number; pending: number; percent: number }> {
  const tasks = await db.tasks.where("projectId").equals(projectId).toArray();
  const completed = tasks.filter((t) => t.status === "completed").length;
  const pending = tasks.filter((t) => t.status !== "completed").length;
  const percent = tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);
  return { total: tasks.length, completed, pending, percent };
}

```

---

## `src/data/reminders.ts`

Reminder CRUD: create, update, dismiss, delete, and bucket by overdue/due/upcoming.

```typescript
// src/data/reminders.ts
import { db, type Reminder } from "./db";
import { newId, now } from "./utils";
import { syncPushRecord, syncDeleteRecord } from "../sync/sync";

export type { Reminder };
export type ReminderBucket = "overdue" | "due" | "upcoming";

export async function listReminders(projectId: string): Promise<Reminder[]> {
  return db.reminders.where("projectId").equals(projectId).sortBy("triggerAt");
}

export async function listPendingReminders(): Promise<Reminder[]> {
  return db.reminders.where("status").equals("pending").sortBy("triggerAt");
}

export function bucketReminders(reminders: Reminder[]): Record<ReminderBucket, Reminder[]> {
  const nowMs = Date.now();
  const todayStart = new Date(nowMs);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  return {
    overdue: reminders.filter((r) => r.triggerAt < nowMs),
    due: reminders.filter((r) => r.triggerAt >= nowMs && r.triggerAt < todayEnd.getTime()),
    upcoming: reminders.filter((r) => r.triggerAt >= todayEnd.getTime()),
  };
}

export async function createReminder(input: {
  projectId: string;
  message: string;
  triggerAt: number;
}): Promise<Reminder> {
  const t = now();
  const reminder: Reminder = {
    id: newId(),
    projectId: input.projectId,
    linkedEntityType: null,
    linkedEntityId: null,
    message: input.message,
    triggerAt: input.triggerAt,
    status: "pending",
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.reminders.add(reminder);
  void syncPushRecord("reminders", reminder);
  return reminder;
}

export async function updateReminder(
  id: string,
  changes: Partial<Pick<Reminder, "message" | "triggerAt">>
): Promise<void> {
  await db.reminders.update(id, { ...changes, updatedAt: now(), syncStatus: "pending" });
  const updated = await db.reminders.get(id);
  if (updated) void syncPushRecord("reminders", updated);
}

export async function dismissReminder(id: string): Promise<void> {
  await db.reminders.update(id, { status: "dismissed", updatedAt: now(), syncStatus: "pending" });
  const updated = await db.reminders.get(id);
  if (updated) void syncPushRecord("reminders", updated);
}

export async function deleteReminder(id: string): Promise<void> {
  await db.reminders.delete(id);
  void syncDeleteRecord("reminders", id);
}

```

---

## `src/data/resources.ts`

Resource CRUD: list by project/category, create with category-specific fields, update, and delete.

```typescript
// src/data/resources.ts
import { db, type Resource, type ResourceCategory, type ResourceImage, type ResourceFile, type ResourceProvider } from "./db";
import { newId, now } from "./utils";
import { syncPushRecord, syncDeleteRecord } from "../sync/sync";

export type { Resource, ResourceCategory, ResourceImage, ResourceFile, ResourceProvider };

export async function listResourcesForProject(projectId: string): Promise<Resource[]> {
  if (!db.isOpen()) await db.open();
  const list = await db.resources.where("projectId").equals(projectId).toArray();
  return list.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function listAllResources(): Promise<Resource[]> {
  if (!db.isOpen()) await db.open();
  const all = await db.resources.toArray();
  return all.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function listAllLinks(): Promise<Resource[]> {
  if (!db.isOpen()) await db.open();
  const all = await db.resources.where("category").equals("links").toArray();
  return all.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function listResourcesByCategory(projectId: string, category: ResourceCategory): Promise<Resource[]> {
  if (!db.isOpen()) await db.open();
  return db.resources
    .where("projectId")
    .equals(projectId)
    .and((r) => r.category === category)
    .sortBy("updatedAt");
}

export async function getResource(id: string): Promise<Resource | undefined> {
  if (!db.isOpen()) await db.open();
  return db.resources.get(id);
}

export interface CreateResourceInput {
  projectId?: string | null;
  category: ResourceCategory;
  title: string;
  tags?: string[];
  url?: string | null;
  provider?: ResourceProvider | null;
  body?: string | null;
  images?: ResourceImage[];
  files?: ResourceFile[];
}

export async function createResource(input: CreateResourceInput): Promise<Resource> {
  if (!db.isOpen()) await db.open();
  const t = now();
  const resource: Resource = {
    id: newId(),
    projectId: input.projectId || "global",
    category: input.category,
    title: input.title,
    tags: input.tags ?? [],
    url: input.url ?? null,
    provider: input.provider ?? null,
    body: input.body ?? null,
    images: input.images ?? [],
    files: input.files ?? [],
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.resources.add(resource);
  void syncPushRecord("resources", resource);
  return resource;
}

export async function updateResource(
  id: string,
  changes: Partial<
    Pick<
      Resource,
      "title" | "tags" | "url" | "provider" | "body" | "images" | "files" | "category" | "projectId"
    >
  >
): Promise<void> {
  if (!db.isOpen()) await db.open();
  const updatedAt = now();
  await db.resources.update(id, { ...changes, updatedAt, syncStatus: "pending" });
  const updated = await db.resources.get(id);
  if (updated) void syncPushRecord("resources", updated);
}

export async function deleteResource(id: string): Promise<void> {
  if (!db.isOpen()) await db.open();
  await db.resources.delete(id);
  void syncDeleteRecord("resources", id);
}

export async function deleteResourcesForProject(projectId: string): Promise<void> {
  if (!db.isOpen()) await db.open();
  const rows = await db.resources.where("projectId").equals(projectId).toArray();
  await db.resources.where("projectId").equals(projectId).delete();
  for (const row of rows) {
    void syncDeleteRecord("resources", row.id);
  }
}

```

---

## `src/data/scheduler.ts`

Schedule item CRUD: for time-blocked entries linked to tasks or standalone events.

```typescript
// src/data/scheduler.ts
import { db, type ScheduleItem } from "./db";
import { newId, now } from "./utils";

export async function listScheduleItems(projectId?: string | null): Promise<ScheduleItem[]> {
  const all = await db.scheduleItems.toArray();
  const filtered = projectId ? all.filter((s) => s.projectId === projectId) : all;
  return filtered.sort((a, b) => a.scheduledAt - b.scheduledAt);
}

export async function getScheduleItem(id: string): Promise<ScheduleItem | undefined> {
  return db.scheduleItems.get(id);
}

export async function createScheduleItem(input: {
  projectId?: string | null;
  title: string;
  description?: string;
  scheduledAt: number;
  durationMinutes?: number | null;
  sourceTaskId?: string | null;
}): Promise<ScheduleItem> {
  const t = now();
  const item: ScheduleItem = {
    id: newId(),
    projectId: input.projectId ?? null,
    title: input.title,
    description: input.description ?? null,
    scheduledAt: input.scheduledAt,
    durationMinutes: input.durationMinutes ?? null,
    sourceTaskId: input.sourceTaskId ?? null,
    createdAt: t,
    updatedAt: t,
  };
  await db.scheduleItems.add(item);
  return item;
}

export async function updateScheduleItem(
  id: string,
  changes: Partial<Pick<ScheduleItem, "title" | "description" | "scheduledAt" | "durationMinutes" | "sourceTaskId">>
): Promise<void> {
  await db.scheduleItems.update(id, { ...changes, updatedAt: now() });
}

export async function deleteScheduleItem(id: string): Promise<void> {
  await db.scheduleItems.delete(id);
}

export async function deleteScheduleItemsForProject(projectId: string): Promise<void> {
  await db.scheduleItems.where("projectId").equals(projectId).delete();
}

export async function getUpcomingScheduleItems(since: number, projectId?: string | null): Promise<ScheduleItem[]> {
  const all = await db.scheduleItems.where("scheduledAt").aboveOrEqual(since).toArray();
  const filtered = projectId ? all.filter((s) => s.projectId === projectId) : all;
  return filtered.sort((a, b) => a.scheduledAt - b.scheduledAt);
}

```

---

## `src/data/settings.ts`

App settings: get/set helpers for Gemini API key, Google tokens, Drive folders, and OAuth credentials.

```typescript
// src/data/settings.ts
import { db, SETTINGS_KEYS } from "./db";
import { syncPushSetting } from "../sync/sync";

export { SETTINGS_KEYS };

export async function getSetting<T = any>(key: keyof typeof SETTINGS_KEYS | string): Promise<T | undefined> {
  if (!db.isOpen()) await db.open();
  const dbKey = (SETTINGS_KEYS as any)[key] || key;
  const row = await db.settings.get(dbKey);
  if (row?.value !== undefined && row?.value !== null) {
    return row.value as T;
  }
  return undefined;
}

export async function setSetting(key: keyof typeof SETTINGS_KEYS | string, value: any): Promise<void> {
  if (!db.isOpen()) await db.open();
  const dbKey = (SETTINGS_KEYS as any)[key] || key;
  await db.settings.put({ key: dbKey, value });
  void syncPushSetting(dbKey, value);
}

// Google Calendar
export async function getGoogleCalendarToken(): Promise<any> {
  return await getSetting<any>("googleCalendarToken");
}

export async function setGoogleCalendarToken(token: any): Promise<void> {
  await setSetting("googleCalendarToken", token);
}

export async function getGoogleCalendarClientId(): Promise<string | null> {
  return (await getSetting<string>("googleCalendarClientId")) ?? null;
}

export const getGoogleClientId = getGoogleCalendarClientId;

export async function setGoogleCalendarClientId(clientId: string): Promise<void> {
  await setSetting("googleCalendarClientId", clientId);
}

export const setGoogleClientId = setGoogleCalendarClientId;

export async function getGooglePickerKey(): Promise<string | null> {
  return (await getSetting<string>("googlePickerKey")) ?? null;
}

export async function setGooglePickerKey(key: string): Promise<void> {
  await setSetting("googlePickerKey", key);
}

export async function getDriveFolderId(projectId: string): Promise<string | null> {
  return (await getSetting<string>(`${SETTINGS_KEYS.driveFolderPrefix}${projectId}`)) ?? null;
}

export const getDriveFolder = getDriveFolderId;

export async function setDriveFolderId(projectId: string, folderId: string): Promise<void> {
  await setSetting(`${SETTINGS_KEYS.driveFolderPrefix}${projectId}`, folderId);
}

export const setDriveFolder = setDriveFolderId;

export async function clearDriveFolderId(projectId: string): Promise<void> {
  if (!db.isOpen()) await db.open();
  await db.settings.delete(`${SETTINGS_KEYS.driveFolderPrefix}${projectId}`);
}

export async function getGoogleAccessToken(): Promise<{ access_token: string; expires_at: number } | null> {
  return (await getSetting<{ access_token: string; expires_at: number }>("googleAccessToken")) ?? null;
}

export async function setGoogleAccessToken(token: { access_token: string; expires_at: number }): Promise<void> {
  await setSetting("googleAccessToken", token);
}

export async function clearGoogleAccessToken(): Promise<void> {
  await setSetting("googleAccessToken", null);
}

// Gemini API Key (Saved locally in Dexie)
export async function getGeminiApiKey(): Promise<string | null> {
  return (await getSetting<string>("geminiApiKey")) ?? null;
}

export async function setGeminiApiKey(key: string): Promise<void> {
  await setSetting("geminiApiKey", key);
}

```

---

## `src/data/tasks.ts`

Task CRUD: list, create, update, status changes, and scheduled task queries.

```typescript
// src/data/tasks.ts
import { db, type Task, type TaskStatus } from "./db";
import { newId, now } from "./utils";
import { syncPushRecord, syncDeleteRecord } from "../sync/sync";

export type { Task, TaskStatus };

export async function listTasksForProject(projectId: string): Promise<Task[]> {
  if (!db.isOpen()) await db.open();
  const list = await db.tasks.where("projectId").equals(projectId).toArray();
  return list.sort((a, b) => a.createdAt - b.createdAt);
}

export async function listAllTasks(): Promise<Task[]> {
  if (!db.isOpen()) await db.open();
  const all = await db.tasks.toArray();
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function listScheduledTasks(): Promise<Task[]> {
  if (!db.isOpen()) await db.open();
  return db.tasks.where("scheduledAt").above(0).sortBy("scheduledAt");
}

export async function listAllActiveTasks(): Promise<Task[]> {
  if (!db.isOpen()) await db.open();
  // Used by the AI planner (Stage 9) across all projects.
  return db.tasks.where("status").equals("active").toArray();
}

export function isOverdue(task: Task): boolean {
  return task.status === "active" && task.dueDate !== null && task.dueDate < Date.now();
}

export async function createTask(input: {
  projectId: string;
  title: string;
  notes?: string;
  executor?: "ai" | "manual";
  dueDate?: number | null;
  scheduledAt?: number | null;
  estimatedMinutes?: number | null;
  tags?: string[];
}): Promise<Task> {
  if (!db.isOpen()) await db.open();
  const t = now();
  const task: Task = {
    id: newId(),
    projectId: input.projectId,
    title: input.title,
    notes: input.notes ?? "",
    status: "active",
    executor: input.executor ?? "manual",
    dueDate: input.dueDate ?? null,
    scheduledAt: input.scheduledAt ?? null,
    estimatedMinutes: input.estimatedMinutes ?? null,
    tags: input.tags ?? [],
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.tasks.add(task);
  void syncPushRecord("tasks", task);
  return task;
}

export async function updateTask(
  id: string,
  changes: Partial<
    Pick<Task, "title" | "notes" | "status" | "executor" | "dueDate" | "scheduledAt" | "estimatedMinutes" | "tags">
  >
): Promise<void> {
  if (!db.isOpen()) await db.open();
  const updatedAt = now();
  await db.tasks.update(id, { ...changes, updatedAt, syncStatus: "pending" });
  const updated = await db.tasks.get(id);
  if (updated) void syncPushRecord("tasks", updated);
}

export async function setTaskStatus(id: string, status: TaskStatus): Promise<void> {
  if (!db.isOpen()) await db.open();
  await updateTask(id, { status });
}

export async function deleteTask(id: string): Promise<void> {
  if (!db.isOpen()) await db.open();
  await db.tasks.delete(id);
  void syncDeleteRecord("tasks", id);
}

```

---

## `src/data/utils.ts`

Utility functions: UUID generation and timestamp helper.

```typescript
// src/data/utils.ts
export function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = (Math.random() * 256) | 0;
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
}

export function now(): number {
  return Date.now();
}

```

---

## `src/index.css`

Global CSS: design tokens, component styles, animations, and responsive layout rules.

```css
:root {
  --color-bg: #ffffff;
  --color-bg-subtle: #f9fafb;
  --color-text: #111827;
  --color-text-muted: #6b7280;
  --color-border: #d1d5db;
  --color-border-strong: #b9bec9;
  --color-accent-task: #3b82f6;    /* blue */
  --color-accent-resource: #22c55e; /* green */
  --color-accent-milestone: #f59e0b;     /* amber */
  --color-accent-issue: #ef4444;    /* red */
  --color-accent-primary: #3b82f6;
  --radius: 8px;
  --radius-sm: 6px;
  --transition: 0.18s ease;
  font-family: system-ui, -apple-system, sans-serif;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--color-bg-subtle);
  color: var(--color-text);
  line-height: 1.5;
}

.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 16px;
  animation: slideUp 0.35s ease both;
}

@keyframes slideUp {
  0% { opacity: 0; transform: translateY(12px); }
  100% { opacity: 1; transform: none; }
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.tab-panel {
  margin-top: 16px;
  animation: slideUp 0.3s ease both;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 18px;
  background: var(--color-accent-primary);
  color: white;
  border: 1px solid var(--color-accent-primary);
  border-radius: var(--radius);
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}
.btn-primary:hover { background: #2563eb; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(59, 130, 246, 0.25); }
.btn-primary:active { transform: translateY(0); }

.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  font-size: 13px;
  cursor: pointer;
  transition: var(--transition);
}
.btn-secondary:hover { background: var(--color-bg-subtle); border-color: var(--color-text); }

.btn-small { padding: 5px 10px; font-size: 12px; }
.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-subtle);
  cursor: pointer;
  font-size: 14px;
  transition: var(--transition);
}
.btn-icon:hover { background: var(--color-border); }

.chip {
  padding: 5px 10px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: white;
  font-size: 12px;
  cursor: pointer;
  transition: var(--transition);
}
.chip:hover { background: var(--color-bg-subtle); }
.chip-active {
  background: var(--color-accent-primary);
  color: white;
  border-color: var(--color-accent-primary);
}
.chip-small {
  margin-left: 8px;
  padding: 2px 8px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-bg-subtle);
  font-size: 11px;
  color: var(--color-text-muted);
}

.tab-bar {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.tab-btn {
  padding: 8px 14px;
  border: 1px solid var(--color-border);
  border-bottom: none;
  border-radius: var(--radius) var(--radius) 0 0;
  background: #f9fafb;
  cursor: pointer;
}

.empty-state {
  color: #6b7280;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius);
  padding: 16px;
}

.tab-btn-active {
  background: white;
  border-bottom: 2px solid var(--color-accent-task);
  font-weight: 600;
}

.inline-form {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.inline-form input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 14px;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.project-card {
  display: block;
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--color-accent-resource);
  border-radius: var(--radius);
  padding: 14px;
  text-decoration: none;
  color: var(--color-text);
  background: white;
  transition: var(--transition);
}
.project-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.08); border-color: var(--color-border-strong); }

.project-card h3 {
  margin: 0 0 4px 0;
}

.project-card p {
  margin: 0 0 10px 0;
  color: #6b7280;
  font-size: 14px;
}

.progress-track {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin: 6px 0 4px 0;
}

.progress-fill {
  height: 100%;
  background: var(--color-accent-resource);
  transition: width 0.2s ease;
}

.progress-label {
  font-size: 12px;
  color: #6b7280;
}

/* ---- Dashboard sections ---- */
.dashboard-section {
  margin-bottom: 24px;
}
.section-heading {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-muted);
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.alert-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.alert-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--color-accent-issue);
  border-radius: var(--radius);
  background: #fef2f2;
  font-size: 13px;
}
.alert-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-accent-issue);
  flex-shrink: 0;
}
.alert-text {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.alert-title {
  font-weight: 500;
  color: var(--color-text);
}
.alert-subtitle {
  font-size: 11px;
  color: var(--color-text-muted);
}
.alert-link {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-accent-issue);
  text-decoration: none;
}
.alert-link:hover {
  text-decoration: underline;
}

/* ---- Summary cards ---- */
.summary-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}
.summary-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 12px;
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--color-accent-task);
  border-radius: var(--radius);
  background: white;
  text-decoration: none;
  color: var(--color-text);
  text-align: center;
}
.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}
.summary-card-num {
  font-size: 28px;
  font-weight: 700;
}
.summary-card-label {
  font-size: 12px;
  color: var(--color-text-muted);
}

.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--color-accent-task);
  border-radius: var(--radius);
  padding: 8px 10px;
  background: white;
  transition: var(--transition);
}
.task-item:hover { background: var(--color-bg-subtle); }

.task-completed {
  border-left-color: #9ca3af;
  opacity: 0.7;
}

.task-completed .task-title {
  text-decoration: line-through;
}

.task-inactive {
  border-left-color: #9ca3af;
}

.task-status-btn {
  min-width: 64px;
  height: 26px;
  padding: 0 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: white;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  user-select: none;
}

.task-status-btn.is-active {
  background: #eff6ff;
  color: #2563eb;
  border-color: #bfdbfe;
}
.task-status-btn.is-active:hover {
  background: #dbeafe;
}

.task-status-btn.is-completed {
  background: #ecfdf5;
  color: #059669;
  border-color: #a7f3d0;
}
.task-status-btn.is-completed:hover {
  background: #d1fae5;
}

.task-status-btn.is-inactive {
  background: #f3f4f6;
  color: #6b7280;
  border-color: #d1d5db;
}
.task-status-btn.is-inactive:hover {
  background: #e5e7eb;
}

.task-title {
  flex: 1;
}

.task-status-label {
  font-size: 12px;
  color: #6b7280;
  text-transform: capitalize;
}

.task-delete-btn {
  border: none;
  background: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 14px;
}

.tab-panel {
  margin-top: 16px;
}

/* ---- App shell / header ---- */
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--color-border);
  background: white;
  position: sticky;
  top: 0;
  z-index: 10;
}

.app-logo {
  font-weight: 700;
  font-size: 18px;
  text-decoration: none;
  color: var(--color-text);
}

.app-main {
  flex: 1;
}

/* ---- Global search ---- */
.global-search-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  max-width: 420px;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: #f9fafb;
  color: #6b7280;
  cursor: pointer;
  font-size: 14px;
}

.global-search-trigger kbd {
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 11px;
  background: white;
}

.search-overlay {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.4);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
  z-index: 100;
}

.search-panel {
  width: 90%;
  max-width: 560px;
  background: white;
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.search-panel input {
  width: 100%;
  padding: 16px;
  border: none;
  border-bottom: 1px solid var(--color-border);
  font-size: 16px;
  outline: none;
}

.search-results {
  max-height: 50vh;
  overflow-y: auto;
  padding: 8px;
}

.search-result-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  text-align: left;
  padding: 10px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: var(--radius);
}

.search-result-row:hover {
  background: #f3f4f6;
}

.search-result-icon {
  font-size: 16px;
}

.search-result-text {
  display: flex;
  flex-direction: column;
}

.search-result-title {
  font-weight: 500;
}

.search-result-subtitle {
  font-size: 12px;
  color: #6b7280;
}

/* ---- AI assistant ---- */
.ai-fab {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-accent-task);
  color: white;
  font-size: 22px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
  z-index: 50;
}

.ai-panel {
  position: fixed;
  bottom: 84px;
  right: 20px;
  width: 320px;
  max-width: 90vw;
  height: 420px;
  max-height: 70vh;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  z-index: 50;
}

.ai-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid var(--color-border);
  font-weight: 600;
}

.ai-panel-header button {
  border: none;
  background: none;
  cursor: pointer;
  color: #6b7280;
}

.ai-panel-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ai-msg {
  padding: 8px 10px;
  border-radius: var(--radius);
  font-size: 13px;
  max-width: 90%;
}

.ai-msg-user {
  align-self: flex-end;
  background: var(--color-accent-task);
  color: white;
}

.ai-msg-assistant {
  align-self: flex-start;
  background: #f3f4f6;
}

.ai-panel-input {
  display: flex;
  gap: 6px;
  padding: 10px;
  border-top: 1px solid var(--color-border);
}

.ai-panel-input input {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 13px;
}

/* ---- Resources ---- */
.resource-form {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.resource-form select,
.resource-form input {
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 14px;
}

.resource-form input {
  flex: 1;
  min-width: 160px;
}

.chip-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.chip {
  padding: 5px 10px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: white;
  font-size: 12px;
  cursor: pointer;
}

.chip-active {
  background: var(--color-accent-resource);
  color: white;
  border-color: var(--color-accent-resource);
}

.resource-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--color-accent-resource);
  border-radius: var(--radius);
  padding: 8px 10px;
  background: white;
}

.resource-icon {
  font-size: 16px;
}

.resource-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.resource-title {
  font-weight: 500;
}

.resource-value-link,
.resource-value {
  font-size: 12px;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ---- Documentation ---- */
.doc-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.doc-entry {
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--color-accent-milestone);
  border-radius: var(--radius);
  padding: 12px;
  background: white;
}

.doc-entry h3 {
  margin: 0 0 8px 0;
}

.doc-entry textarea {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 8px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
}

/* ---- Milestones / Issues / Reminders row variants ---- */
.milestone-in_progress .task-title { border-left-color: var(--color-accent-milestone); }
.issue-high { border-left-color: var(--color-accent-issue); }
.issue-medium { border-left-color: var(--color-accent-milestone); }
.issue-low { border-left-color: #9ca3af; }
.reminder-dismissed { opacity: 0.6; }

.btn-secondary {
  padding: 5px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: white;
  font-size: 12px;
  cursor: pointer;
}

/* ---- Voice input ---- */
.mic-btn {
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-bg);
  cursor: pointer;
  font-size: 14px;
  padding: 8px 10px;
}
.mic-btn-active {
  background: var(--color-accent-issue);
  color: white;
  animation: pulse 1.2s infinite;
}
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}

/* ---- Resource editor: text body + images ---- */
.resource-form textarea {
  flex: 1;
  min-width: 160px;
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
}

.image-preview-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}
.image-thumb {
  position: relative;
  width: 64px;
  height: 64px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--color-bg-subtle);
}
.image-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.thumb-remove {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: var(--color-accent-issue);
  color: white;
  font-size: 11px;
  cursor: pointer;
}
.resource-image-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 6px;
}
.resource-image-thumb {
  max-width: 140px;
  max-height: 100px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}
.resource-notes {
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 4px 0 0 0;
  white-space: pre-wrap;
}

/* ---- Modal ---- */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 100;
  animation: slideUp 0.2s ease both;
}
.modal {
  background: white;
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  max-width: 520px;
  width: 100%;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.25s ease both;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border);
  font-weight: 600;
}
.modal-body {
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.category-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px dashed var(--color-border);
}
.category-row:last-child { border-bottom: none; }

/* =====================================================================
   UX/UI additions: tooltip protocol, machete transition, micro-interactions
   ===================================================================== */

/* ---- 2A. Universal hover hint / tooltip protocol ---- */
[data-tip] {
  position: relative;
}
[data-tip]::after {
  content: attr(data-tip);
  position: absolute;
  left: 50%;
  bottom: calc(100% + 8px);
  transform: translateX(-50%) translateY(4px);
  background: #1e293b;
  color: #f1f5f9;
  border: 1px solid #475569;
  border-radius: 4px;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 11px;
  line-height: 1.4;
  padding: 5px 9px;
  max-width: 260px;
  width: max-content;
  white-space: normal;
  text-align: left;
  opacity: 0;
  pointer-events: none;
  z-index: 300;
  transition: opacity 0.12s ease, transform 0.12s ease;
  transition-delay: 0s;
}
[data-tip]:hover::after,
[data-tip]:focus-visible::after {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
  transition-delay: 150ms;
}

/* ---- 2A. Global micro-interaction standard ---- */
.clickable,
button,
.btn-primary,
.btn-secondary,
.btn-icon,
.chip,
.task-status-btn,
.task-delete-btn,
.tab-btn,
.search-result-row,
.project-card {
  transition: transform 0.08s ease, background 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}
.clickable:active,
button:active,
.chip:active,
.task-status-btn:active,
.task-delete-btn:active,
.tab-btn:active {
  transform: scale(0.97);
}
.btn-pressed { transform: scale(0.96); }

/* Dropdown / expandable card expansion */
.dropdown-anim {
  animation: dropdown-expand 0.18s ease both;
  transform-origin: top center;
}
@keyframes dropdown-expand {
  0% { opacity: 0; transform: translateY(-8px) scaleY(0.95); }
  100% { opacity: 1; transform: translateY(0) scaleY(1); }
}

/* Sliding drawers / side panels */
.drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.45);
  z-index: 100;
  display: flex;
  justify-content: flex-end;
}
.drawer-panel {
  width: 380px;
  max-width: 92vw;
  height: 100%;
  background: white;
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  animation: drawer-slide-in 0.22s ease both;
}
@keyframes drawer-slide-in {
  0% { transform: translateX(100%); }
  100% { transform: translateX(0%); }
}
.drawer-anim {
  animation: drawer-slide-in 0.22s ease both;
}

/* Search overlay: instant central overlay scale expansion */
.search-panel-open {
  animation: search-scale-in 0.15s ease-out both;
}
@keyframes search-scale-in {
  0% { opacity: 0; transform: scale(0.94); }
  100% { opacity: 1; transform: scale(1); }
}
.search-result-row:hover {
  transform: translateX(6px);
}

/* ---- Landing page / login ---- */
.landing {
  min-height: 100vh;
  max-width: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 8px;
  background: #0f172a;
  color: #f1f5f9;
}
.landing-mark {
  font-size: 40px;
  margin-bottom: 4px;
}
.landing h1 {
  margin: 0;
  font-size: 40px;
  letter-spacing: 0.02em;
}
.landing p {
  color: #94a3b8;
  margin: 0 0 20px 0;
}
.btn-login {
  position: relative;
  overflow: hidden;
  padding: 12px 32px;
  font-size: 15px;
}
.otp-overlay {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  animation: dropdown-expand 0.18s ease both;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: var(--radius);
  padding: 20px;
  width: 320px;
  max-width: 92vw;
}
.otp-overlay label {
  font-size: 13px;
  color: #cbd5e1;
}
.otp-overlay input {
  background: #0f172a;
  border: 1px solid #475569;
  color: #f1f5f9;
}
.landing-cancel {
  background: transparent;
  border-color: #475569;
  color: #cbd5e1;
}

/* ---- Resource module polish ---- */
.resource-item {
  transition: transform 0.14s ease, box-shadow 0.14s ease;
}
.resource-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}
.resource-value-link {
  transition: transform 0.12s ease;
  display: inline-block;
}
.resource-value-link:hover {
  transform: translateX(3px);
}
.resource-value-link:hover::after {
  content: " ↗";
}
.resource-image-thumb {
  transition: transform 0.2s ease;
}
.resource-image-thumb:hover {
  transform: scale(1.05);
}
.resource-form input[type="file"] {
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius);
  padding: 10px;
  transition: padding 0.18s ease, background 0.18s ease;
}
.resource-form input[type="file"].dropzone-active {
  padding: 20px 10px;
  background: var(--color-bg-subtle);
}

/* ---- Edit/delete CRUD affordances ---- */
.project-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}
.project-card-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
.project-card-editing {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.doc-entry-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.doc-entry-title-input {
  flex: 1;
  font-weight: 600;
  font-size: 15px;
  border: 1px solid transparent;
  background: transparent;
  padding: 4px 6px;
  border-radius: 4px;
}
.doc-entry-title-input:hover,
.doc-entry-title-input:focus {
  border-color: var(--color-border-strong);
  background: white;
}
.task-title-input {
  flex: 1;
  border: 1px solid var(--color-border-strong);
  border-radius: 4px;
  padding: 4px 6px;
}
.reminder-time-input {
  font-size: 12px;
}
.btn-icon {
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
}
.btn-icon:hover {
  border-color: var(--color-border-strong);
  background: var(--color-bg-subtle);
}

/* ---- Auth ---- */
.logout-btn {
  margin-left: auto;
}
.otp-dev-hint {
  background: #0f172a;
  border: 1px dashed #475569;
  color: #fbbf24;
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 12px;
  padding: 8px 10px;
  border-radius: 4px;
  margin: 0;
}
.otp-error {
  color: #f87171;
  font-size: 13px;
  margin: 0;
}

/* ---- Milestones dashboard ---- */
.blocker-picker {
  margin-bottom: 14px;
}
.blocker-picker-label {
  display: block;
  font-size: 12px;
  color: var(--color-text-muted, #64748b);
  margin-bottom: 6px;
}
.milestone-track {
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
  padding-left: 6px;
  border-left: 2px solid var(--color-border-strong);
}
.milestone-node {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  margin-left: -8px;
}
.milestone-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  margin-top: 4px;
  border: 2px solid #94a3b8;
  background: white;
  flex-shrink: 0;
}
.milestone-achieved .milestone-dot { background: #22c55e; border-color: #16a34a; }
.milestone-missed .milestone-dot { background: #ef4444; border-color: #dc2626; }
.milestone-in_progress .milestone-dot { background: #fbbf24; border-color: #d97706; }
.milestone-body {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  flex: 1;
}
.milestone-title {
  font-weight: 600;
}
.milestone-date {
  font-size: 12px;
  color: var(--color-text-muted, #64748b);
}
.milestone-hover-panel {
  position: absolute;
  left: 32px;
  top: 100%;
  z-index: 50;
  background: #1e293b;
  color: #f1f5f9;
  border: 1px solid #475569;
  border-radius: 6px;
  padding: 10px 12px;
  min-width: 220px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}
.milestone-hover-title {
  margin: 0 0 6px 0;
  font-size: 12px;
  font-weight: 600;
  color: #cbd5e1;
}
.milestone-blocker-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}
.milestone-blocker-list li.task-completed { color: #4ade80; }
.milestone-blocker-list li:not(.task-completed) { color: #fbbf24; }

/* ---- Scheduler (§3) ---- */
.scheduler-mode-toggle {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.scheduler-mode-toggle .tab-btn {
  flex: 1;
}
.sliding-prompt-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}
.sliding-prompt-box textarea {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
}
.scheduler-status {
  font-size: 12px;
  padding: 8px 12px;
  border-radius: var(--radius);
  margin: 8px 0;
}
.scheduler-status.loading {
  background: #eff6ff;
  color: var(--color-accent-task);
}
.scheduler-status.done {
  background: #f0fdf4;
  color: #16a34a;
}

/* ---- Calendar (§4) ---- */
.calendar-event-item {
  position: relative;
}
.calendar-hangout-btn {
  margin-left: auto;
}

/* ---- Resources (§1) ---- */
.resource-category-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.resource-category-badge {
  padding: 4px 8px;
  border-radius: 999px;
  background: var(--color-bg-subtle);
  font-size: 12px;
  font-weight: 600;
}
.file-attachment {
  display: inline-block;
  padding: 6px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-bg-subtle);
  font-size: 12px;
  text-decoration: none;
  color: var(--color-text);
  margin-right: 6px;
  transition: var(--transition);
}
.file-attachment:hover {
  background: white;
  transform: translateY(-1px);
}
.file-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-subtle);
}
.file-preview-name {
  font-size: 9px;
  color: var(--color-text-muted);
  text-align: center;
  padding: 2px;
}

/* ---- Secrets vault (§5) ---- */
.secrets-vault {
  margin-top: 12px;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-bg-subtle);
}
.secrets-vault input {
  width: 100%;
  margin-bottom: 8px;
}

/* ---- Settings page (§9) ---- */
.settings-page {
  max-width: 720px;
}
.settings-section {
  margin-bottom: 28px;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: white;
}
.settings-section h2 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
}
.settings-help {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.5;
}
.settings-help a {
  color: var(--color-accent-primary);
  text-decoration: none;
}
.settings-help a:hover {
  text-decoration: underline;
}
.settings-form {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.settings-form input {
  flex: 1;
  min-width: 200px;
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 14px;
}
.settings-form button {
  flex-shrink: 0;
}

/* Calendar Month Grid View */
.calendar-view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}
.calendar-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 4px;
  margin-bottom: 16px;
  background: var(--color-border);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
}
.calendar-day-name {
  background: var(--color-bg-subtle);
  padding: 8px 4px;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
}
.calendar-day-cell {
  background: white;
  min-height: 80px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: background 0.15s ease;
}
.calendar-day-cell:hover {
  background: #f8fafc;
}
.calendar-day-cell.today {
  background: #eff6ff;
}
.calendar-day-cell.empty {
  background: #fafafa;
  cursor: default;
}
.calendar-day-num {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--color-text);
}
.calendar-day-cell.today .calendar-day-num {
  color: var(--color-accent-primary);
}
.calendar-event-pill {
  font-size: 11px;
  padding: 2px 4px;
  border-radius: 3px;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: #e0f2fe;
  color: #0369a1;
  border-left: 2px solid #0284c7;
}
.calendar-event-pill.google {
  background: #eff6ff;
  color: #1d4ed8;
  border-left-color: #2563eb;
}

/* Assistant Drawer & Approval Box */
.assistant-fab {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-accent-primary);
  color: white;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
}
.assistant-fab:hover {
  transform: scale(1.05);
}
.assistant-panel {
  width: 420px;
  max-width: 95vw;
}
.assistant-log {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.assistant-message {
  padding: 10px 14px;
  border-radius: var(--radius);
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}
.assistant-message-user {
  align-self: flex-end;
  background: var(--color-accent-primary);
  color: white;
  max-width: 85%;
}
.assistant-message-assistant {
  align-self: flex-start;
  background: #f1f5f9;
  color: #0f172a;
  border: 1px solid var(--color-border);
  max-width: 90%;
}
.assistant-composer {
  display: flex;
  gap: 6px;
  padding: 10px 14px;
  border-top: 1px solid var(--color-border);
  background: white;
}
.assistant-tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border);
  padding: 0 14px;
}
.clarify-box {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: var(--radius);
  padding: 10px 12px;
  margin: 8px 14px;
}
.clarify-prompt {
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 6px 0;
  color: #92400e;
}
.clarify-options {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.approval-box {
  background: #f0fdf4;
  border-top: 1px solid #86efac;
  padding: 12px 14px;
  max-height: 180px;
  overflow-y: auto;
}
.approval-box h3 {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 600;
  color: #166534;
}
.approval-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.approval-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background: white;
  border: 1px solid #bbf7d0;
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  font-size: 12px;
}
.subcategory-manager {
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 10px 12px;
  margin-top: 8px;
  margin-bottom: 12px;
  width: 100%;
}
.subcategory-list {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 8px;
}
.subcategory-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 11px;
}
.subcategory-remove {
  background: none;
  border: none;
  cursor: pointer;
  color: #ef4444;
  font-size: 13px;
  padding: 0;
  line-height: 1;
}


```

---

## `src/main.tsx`

React entry point: mounts the app to #root with StrictMode.

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

```

---

## `src/pages/Dashboard.tsx`

Dashboard page: project list with progress, summary cards, alerts, and add-project drawer.

```typescript
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listProjects, createProject, getProjectTaskStats } from "../data/projects";
import { getDashboardAlerts, getDashboardSummary, type Alert, type DashboardSummary } from "../data/dashboard";
import type { Project } from "../data/db";
import ProjectCard from "../components/ProjectCard";
import MicButton from "../components/MicButton";

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [progressById, setProgressById] = useState<Record<string, number>>({});
  const [pendingById, setPendingById] = useState<Record<string, number>>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function refresh() {
    const list = await listProjects("active");
    setProjects(list);
    const entries = await Promise.all(
      list.map(async (p) => [p.id, await getProjectTaskStats(p.id)] as const)
    );
    setProgressById(Object.fromEntries(entries.map(([id, s]) => [id, s.percent])));
    setPendingById(Object.fromEntries(entries.map(([id, s]) => [id, s.pending])));
    const [alertData, summaryData] = await Promise.all([getDashboardAlerts(), getDashboardSummary()]);
    setAlerts(alertData);
    setSummary(summaryData);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    await createProject({ name });
    setNewName("");
    setDrawerOpen(false);
    refresh();
  }

  return (
    <div className="page dashboard">
      <header className="page-header">
        <h1>Projects</h1>
        <button
          type="button"
          className="btn-primary clickable"
          data-tip="Create a new project container with dedicated resources and tasks"
          onClick={() => setDrawerOpen(true)}
        >
          + Add project
        </button>
      </header>

      {loading ? (
        <p className="empty-state">Loading...</p>
      ) : (
        <>
          {/* §2 — Alerts (computed, not stored) */}
          {alerts.length > 0 && (
            <section className="dashboard-section">
              <h2 className="section-heading">Alerts</h2>
              <ul className="alert-list">
                {alerts.map((a) => (
                  <li key={a.id} className="alert-item">
                    <span className="alert-dot" />
                    <div className="alert-text">
                      <span className="alert-title">{a.title}</span>
                      <span className="alert-subtitle">{a.subtitle}</span>
                    </div>
                    {a.routerLink && (
                      <Link to={a.routerLink} className="alert-link clickable" data-tip="Go to item">
                        Go
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* §2 — Summary row (clickable cards, deep-link) */}
          {summary && (
            <section className="dashboard-section">
              <h2 className="section-heading">Summary</h2>
              <div className="summary-row">
                <Link
                  to="/dashboard?filter=tasks"
                  className="summary-card clickable"
                  data-tip={`${summary.activeTaskCount} active task(s). Click to view all tasks.`}
                >
                  <span className="summary-card-num">{summary.activeTaskCount}</span>
                  <span className="summary-card-label">Active tasks</span>
                </Link>
                <Link
                  to="/dashboard?filter=remaining"
                  className="summary-card clickable"
                  data-tip={`${summary.remainingTaskCount} total task(s) across ${summary.projectCount} project(s).`}
                >
                  <span className="summary-card-num">{summary.remainingTaskCount}</span>
                  <span className="summary-card-label">Tasks (total)</span>
                </Link>
                <Link
                  to="/dashboard?filter=milestones"
                  className="summary-card clickable"
                  data-tip={`${summary.milestoneAchieved} of ${summary.milestoneTotal} milestones achieved (${summary.milestoneProgressPercent}%).`}
                >
                  <span className="summary-card-num">{summary.milestoneProgressPercent}%</span>
                  <span className="summary-card-label">Milestones</span>
                </Link>
                <Link
                  to="/dashboard?filter=projects"
                  className="summary-card clickable"
                  data-tip={`${summary.projectCount} project(s). Click to see all.`}
                >
                  <span className="summary-card-num">{summary.projectCount}</span>
                  <span className="summary-card-label">Projects</span>
                </Link>
              </div>
            </section>
          )}

          {/* §2 — Project grid */}
          <section className="dashboard-section">
            <h2 className="section-heading">Projects</h2>
            {projects.length === 0 ? (
              <p className="empty-state">
                No projects yet — add your first one above.
              </p>
            ) : (
              <div className="project-grid">
                {projects.map((p) => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    progress={progressById[p.id] ?? 0}
                    pending={pendingById[p.id] ?? 0}
                    onChange={refresh}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Add project drawer */}
      {drawerOpen && (
        <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h2>New project</h2>
              <button
                className="btn-icon clickable"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close"
                data-tip="Close"
              >
                ×
              </button>
            </header>
            <form className="modal-body" onSubmit={handleCreate}>
              <div className="inline-form" style={{ marginBottom: 0 }}>
                <input
                  autoFocus
                  type="text"
                  placeholder="New project name..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <MicButton onResult={(text) => setNewName(text)} />
              </div>
              <button type="submit" className="btn-primary clickable">+ Add project</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

```

---

## `src/pages/Home.tsx`

Home page: dashboard alerts, summary cards, project grid, and cross-project entity tabs.

```typescript
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { listProjects, createProject, getProjectTaskStats } from "../data/projects.ts"
import {
  getDashboardAlerts,
  getDashboardSummary,
  summaryCards,
  type Alert,
  type DashboardSummary,
} from "../data/dashboard.ts"
import type { Project } from "../data/db.ts"
import ProjectCard from "../components/ProjectCard.tsx"
import MicButton from "../components/MicButton.tsx"
import { Drawer, ErrorNote, Loading, Slide, useAsync } from "../components/ui.tsx"
import HomeTasksTab from "../components/home/HomeTasksTab.tsx"
import HomeResourcesTab from "../components/home/HomeResourcesTab.tsx"
import HomeLinksTab from "../components/home/HomeLinksTab.tsx"
import HomeContactsTab from "../components/home/HomeContactsTab.tsx"
import HomeCalendarTab from "../components/home/HomeCalendarTab.tsx"
import HomeScheduleTab from "../components/home/HomeScheduleTab.tsx"
import HomeRemindersTab from "../components/home/HomeRemindersTab.tsx"

const TABS = ["Tasks", "Resources", "Links", "Contacts", "Calendar", "Schedule", "Reminders"] as const;
type Tab = (typeof TABS)[number];

const TAB_HINTS: Record<Tab, string> = {
  Tasks: "Every task across every project, with a status filter",
  Resources: "Quick notes, links, scripts, images and documents — standalone or tied to projects",
  Links: "Add and organize web links and bookmarks with titles and descriptions — standalone at Home or tied to projects",
  Contacts: "Every contact, with links to reach them and add contacts",
  Calendar: "Month grid and list view of all events across projects, with Google Calendar .ics import",
  Schedule: "Tasks with a date and time, plus calendar events and Meet links",
  Reminders: "Reminders grouped into overdue, due and upcoming",
};

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") as Tab | null;
  const activeTab = TABS.includes(tabParam as Tab) ? (tabParam as Tab) : "Tasks";
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, error, loading, reload } = useAsync(async () => {
    const [projects, alerts, summary] = await Promise.all([
      listProjects("active"),
      getDashboardAlerts(),
      getDashboardSummary(),
    ]);
    const statsEntries = await Promise.all(
      projects.map(async (p) => [p.id, await getProjectTaskStats(p.id)] as const)
    );
    const statsMap = Object.fromEntries(statsEntries);
    return { projects, alerts, summary, statsMap };
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      reload();
    };
    window.addEventListener("panga-data-updated", handleUpdate);
    return () => window.removeEventListener("panga-data-updated", handleUpdate);
  }, [reload]);

  const projects: Project[] = data?.projects ?? [];
  const alerts: Alert[] = data?.alerts ?? [];
  const summary: DashboardSummary | null = data?.summary ?? null;
  const statsMap: Record<string, { percent: number; pending: number }> = data?.statsMap ?? {};

  function setTab(tab: Tab) {
    setSearchParams(tab === "Tasks" ? {} : { tab }, { replace: true });
  }

  const cards = useMemo(() => (summary ? summaryCards(summary) : []), [summary]);

  if (error) {
    return (
      <div className="page page-wide">
        <ErrorNote error={error} onRetry={reload} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page page-wide">
        <Loading label="Loading home..." />
      </div>
    );
  }

  return (
    <div className="page page-wide home">
      <header className="page-header">
        <h1>Home</h1>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setDrawerOpen(true)}
          data-tip="Create a project — its own tasks, resources, docs and schedule"
        >
          + Add project
        </button>
      </header>

      {/* Alerts — computed on read, never stored. */}
      {alerts.length > 0 && (
        <section className="dashboard-section">
          <h2 className="section-heading">Alerts</h2>
          <ul className="alert-list">
            {alerts.map((a) => (
              <li key={a.id} className={`alert-item alert-${a.type}`}>
                <span className="alert-dot" aria-hidden="true" />
                <span className="alert-text">
                  <span className="alert-title">{a.title}</span>
                  <span className="alert-subtitle">{a.subtitle}</span>
                </span>
                {a.routerLink && (
                  <Link
                    to={a.routerLink}
                    className="alert-link"
                    data-tip={`Open: ${a.title}`}
                    data-tip-edge="left"
                  >
                    Open
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Summary row — each card deep-links to where that number lives. */}
      {summary && (
        <section className="dashboard-section">
          <h2 className="section-heading">Summary</h2>
          <div className="summary-row">
            {cards.map((card: { key: string; label: string; value: string | number; hint?: string; tab?: string }) =>
              card.tab ? (
                <Link
                  key={card.key}
                  to={`/home${card.tab === "Tasks" ? "" : `?tab=${card.tab}`}`}
                  className="summary-card"
                  data-tip={card.hint}
                >
                  <span className="summary-card-num">{card.value}</span>
                  <span className="summary-card-label">{card.label}</span>
                </Link>
              ) : (
                <div
                  key={card.key}
                  className="summary-card"
                  data-tip={card.hint}
                  role="group"
                  aria-label={card.label}
                >
                  <span className="summary-card-num">{card.value}</span>
                  <span className="summary-card-label">{card.label}</span>
                </div>
              )
            )}
          </div>
        </section>
      )}

      {/* Project grid. */}
      <section className="dashboard-section">
        <h2 className="section-heading">Projects</h2>
        {projects.length === 0 ? (
          <p className="empty-state">
            No projects yet. Add one above and it becomes the container for tasks,
            resources, documentation, milestones and issues.
          </p>
        ) : (
          <div className="project-grid">
             {projects.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                progress={statsMap[p.id]?.percent ?? 0}
                pending={statsMap[p.id]?.pending ?? 0}
                onChange={reload}
              />
            ))}
          </div>
        )}
      </section>

      {/* Cross-project tabs. */}
      <section className="dashboard-section">
        <h2 className="section-heading">Everything</h2>
        <nav className="tab-bar" aria-label="Cross-project views">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`tab-btn ${activeTab === tab ? "tab-btn-active" : ""}`}
              onClick={() => setTab(tab)}
              data-tip={TAB_HINTS[tab]}
              aria-current={activeTab === tab}
            >
              {tab}
            </button>
          ))}
        </nav>
        <Slide
          slideKey={activeTab}
          order={TABS.indexOf(activeTab)}
          previousOrder={0}
        >
          {activeTab === "Tasks" && <HomeTasksTab />}
          {activeTab === "Resources" && <HomeResourcesTab />}
          {activeTab === "Links" && <HomeLinksTab />}
          {activeTab === "Contacts" && <HomeContactsTab />}
          {activeTab === "Calendar" && <HomeCalendarTab />}
          {activeTab === "Schedule" && <HomeScheduleTab />}
          {activeTab === "Reminders" && <HomeRemindersTab />}
        </Slide>
      </section>

      <AddProjectDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onCreated={reload} />
    </div>
  );
}

function AddProjectDrawer({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e?: React.FormEvent | React.MouseEvent) {
    if (e) e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Give the project a name.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createProject({ name: trimmed, description: description.trim() });
      setName("");
      setDescription("");
      onCreated();
      onClose();
    } catch (err) {
      console.error("Failed to create project:", err);
      setError(err instanceof Error ? err.message : "Could not create the project.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="New project"
      edge="right"
      closeTip="Discard this project"
      footer={
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", width: "100%" }}>
          <button
            type="button"
            className="btn-secondary clickable"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-project-form"
            className="btn-primary clickable"
            disabled={saving}
            onClick={handleCreate}
            data-tip="Create the project and open it"
          >
            {saving ? "Creating..." : "Create project"}
          </button>
        </div>
      }
    >
      <form id="add-project-form" onSubmit={handleCreate} className="stack">
        <div>
          <label htmlFor="new-project-name">Project name</label>
          <div className="inline-form" style={{ marginBottom: 0 }}>
            <input
              id="new-project-name"
              autoFocus
              type="text"
              placeholder="e.g. Album release"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreate();
                }
              }}
            />
            <MicButton onResult={setName} />
          </div>
        </div>
        <div>
          <label htmlFor="new-project-description">
            Description <span className="faint">(optional)</span>
          </label>
          <input
            id="new-project-description"
            type="text"
            placeholder="One line on what this is for"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreate();
              }
            }}
          />
        </div>
        {error && <p className="form-error">{error}</p>}
        <p className="form-note">
          The project starts empty. Everything is added from its own workspace tabs.
        </p>
      </form>
    </Drawer>
  );
}

```

---

## `src/pages/Landing.tsx`

Landing page: login/signup form, Quick Upload snapshot dropzone, and email/password auth flow.

```typescript
import { useState, useEffect, useRef, useCallback } from "react";
import { signIn, signUp } from "../sync/sync";
import { hasAnyData, importSnapshot, readSnapshotFile } from "../sync/snapshot";
import { restoreSessionFromSnapshot } from "../auth/session";

type Mode = "login" | "signup";

export default function Landing() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pressed, setPressed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dataChecked = useRef(false);

  function resetMode() {
    setError(null);
    setSuccessNotice(null);
  }

  useEffect(() => {
    if (dataChecked.current) return;
    dataChecked.current = true;
    hasAnyData().then((exists) => setHasData(exists));
  }, []);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    if (mode === "signup" && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setPressed(true);
    setTimeout(() => setPressed(false), 80);
    setError(null);
    setSuccessNotice(null);
    setLoading(true);

    if (mode === "signup") {
      const result = await signUp(email.trim(), password);
      setLoading(false);
      if (result.error) {
        setError(result.error);
        return;
      }
      window.location.assign("/dashboard");
      return;
    }

    // Login
    const result = await signIn(email.trim(), password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    // signIn stores the session; navigate to dashboard
    window.location.assign("/dashboard");
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      setError("Please select a valid .json snapshot file.");
      return;
    }

    await importSnapshotFromFile(file);
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await importSnapshotFromFile(file);
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  async function importSnapshotFromFile(file: File) {
    if (snapshotLoading) return;
    setSnapshotLoading(true);
    setError(null);
    setSuccessNotice(null);

    try {
      const snapshot = await readSnapshotFile(file);
      await importSnapshot(snapshot);

      // Set a session so the app can continue. Use the email from the form
      // if provided, otherwise use a default.
      const sessionEmail = email.trim() || "restored@local";
      const result = await restoreSessionFromSnapshot(sessionEmail);
      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccessNotice("Snapshot restored successfully! Redirecting...");
      setTimeout(() => window.location.assign("/dashboard"), 800);
    } catch (err) {
      setError(`Failed to restore snapshot: ${(err as Error).message}`);
    } finally {
      setSnapshotLoading(false);
    }
  }

  return (
    <div className="page landing">
      <div className="landing-mark" data-tip="Panga">P</div>
      <h1>Panga</h1>
      <p>Project & resource planner.</p>

      <div
        className="auth-mode-container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          margin: "16px 0 20px 0",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            type="button"
            className={`chip ${mode === "login" ? "chip-active" : ""}`}
            onClick={() => { setMode("login"); resetMode(); }}
          >
            Login
          </button>
          <button
            type="button"
            className={`chip ${mode === "signup" ? "chip-active" : ""}`}
            onClick={() => { setMode("signup"); resetMode(); }}
          >
            Sign Up
          </button>
        </div>
      </div>

      <form className="otp-overlay" onSubmit={handleEmailSubmit}>
        <label htmlFor="email-input">
          {mode === "signup" ? "Create an account" : "Welcome back — sign in"}
        </label>

        <input
          id="email-input"
          autoFocus
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          id="password-input"
          type="password"
          required
          minLength={6}
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginTop: "8px" }}
        />

        <button
          type="submit"
          className={`btn-primary btn-login blade-glint clickable ${pressed ? "btn-pressed" : ""}`}
          disabled={loading}
        >
          {loading
            ? "Working..."
            : mode === "signup"
              ? "Create Account"
              : "Login"}
        </button>

        {error && (
          <div style={{ marginTop: "12px" }}>
            <p className="otp-error">{error}</p>
          </div>
        )}

        {successNotice && (
          <p
            className="otp-error"
            style={{
              marginTop: "12px",
              color: "#065f46",
              background: "#ecfdf5",
              borderColor: "#a7f3d0",
              padding: "8px 12px",
              borderRadius: "var(--radius)",
            }}
          >
            ✓ {successNotice}
          </p>
        )}
      </form>

      {/* Quick Upload / Restore Snapshot */}
      {!hasData && (
        <section
          className={`snapshot-dropzone ${dragActive ? "drag-active" : ""}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          style={{
            marginTop: "24px",
            padding: "24px",
            border: "2px dashed var(--color-border)",
            borderRadius: "var(--radius)",
            background: dragActive ? "var(--color-accent-primary-light)" : "transparent",
            transition: "all 0.2s ease",
            textAlign: "center",
          }}
        >
          <p style={{ margin: "0 0 8px 0", fontWeight: 600, fontSize: "16px" }}>
            Quick Upload / Restore Snapshot
          </p>
          <p style={{ margin: "0 0 16px 0", color: "var(--color-text-muted)", fontSize: "14px" }}>
            Drag & drop a <code>.json</code> snapshot backup here, or click to browse.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            style={{ display: "none" }}
            id="snapshot-file-input"
          />

          <button
            type="button"
            className="btn-secondary clickable"
            onClick={() => fileInputRef.current?.click()}
            disabled={snapshotLoading}
            style={{ marginBottom: "12px" }}
          >
            {snapshotLoading ? "Restoring..." : "Choose Snapshot File"}
          </button>

          <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "var(--color-text-muted)" }}>
            Restores projects, tasks, resources, and settings. No account required.
          </p>
        </section>
      )}
    </div>
  );
}
```

---

## `src/pages/ProjectView.tsx`

Project workspace: tabs for documentation, tasks, resources, milestones, insights, issues, reminders, contacts, and calendar.

```typescript
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getProject, getProjectTaskStats } from "../data/projects";
import { listTasksForProject, createTask, updateTask, setTaskStatus, deleteTask, type Task, type TaskStatus } from "../data/tasks";
import { listResourcesForProject, createResource, updateResource, deleteResource, type Resource, type ResourceImage, type ResourceFile } from "../data/resources";
import { listDocEntries, createDocEntry, updateDocEntry, deleteDocEntry, type DocEntry } from "../data/docs";
import { listMilestones, createMilestone, updateMilestone, setMilestoneStatus, deleteMilestone, reconcileMilestoneStatuses, type Milestone } from "../data/milestones";
import { listIssues, createIssue, updateIssue, setIssueStatus, deleteIssue, addIssueComment, deleteIssueComment, type Issue, type IssueSeverity } from "../data/issues";
import { listCalendarEvents, createLocalEvent, deleteCalendarEvent, type CalendarEvent, type CalendarEventSource } from "../data/calendar";
import { listReminders, createReminder, updateReminder, dismissReminder, deleteReminder, type Reminder } from "../data/reminders";
import { db, type Project } from "../data/db";
import { newId, now } from "../data/utils";
import ProgressBar from "../components/ProgressBar";
import MicButton from "../components/MicButton";
import InsightsTab from "../components/project/InsightsTab";
import ContactsTab from "../components/project/ContactsTab";

const TABS = ["Documentation", "Tasks", "Resources", "Milestones", "Insights", "Issues", "Reminders", "Contacts", "Calendar"] as const;
type Tab = (typeof TABS)[number];

const TAB_HINTS: Record<Tab, string> = {
  Documentation: "Project README, wireframes, and structural specs",
  Tasks: "Track active, scheduled, and remaining tasks",
  Resources: "Notes, scripts, links, images, PDFs",
  Milestones: "Phase checkpoints — hover to see blocking tasks",
  Insights: "Your notes — notes, links, images, PDFs",
  Issues: "Log setbacks and blockers with labels, comments, milestones",
  Reminders: "Schedule follow-up nudges for this project",
  Contacts: "Project contacts — emails, phones, links",
  Calendar: "Local events with links to tasks, milestones, resources, and insights",
};

// Map query ?tab= to a tab name
const TAB_QUERY: Record<string, Tab> = {
  Documentation: "Documentation",
  Tasks: "Tasks",
  Resources: "Resources",
  Milestones: "Milestones",
  Insights: "Insights",
  Issues: "Issues",
  Reminders: "Reminders",
  Contacts: "Contacts",
  Calendar: "Calendar",
};

export default function ProjectView() {
  const { projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [project, setProject] = useState<Project | null>(null);
  const [progress, setProgress] = useState(0);
  const [pending, setPending] = useState(0);
  const activeTab = (TAB_QUERY[searchParams.get("tab") ?? ""] as Tab) ?? "Documentation";

  function setActiveTab(tab: Tab) {
    setSearchParams({ tab });
  }

  async function refreshProject() {
    if (!projectId) return;
    setProject((await getProject(projectId)) ?? null);
    const stats = await getProjectTaskStats(projectId);
    setProgress(stats.percent);
    setPending(stats.pending);
  }

  useEffect(() => {
    refreshProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  if (!project || !projectId) {
    return (
      <div className="page project-view">
        <p className="empty-state">Loading project...</p>
      </div>
    );
  }

  return (
    <div className="page project-view">
      <header className="page-header">
        <div>
          <h1>{project.name}</h1>
          {project.description && <p>{project.description}</p>}
        </div>
      </header>

      <ProgressBar percent={progress} pending={pending} />
      <span className="progress-label">{progress}% complete</span>

      <nav className="tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`tab-btn clickable ${activeTab === tab ? "tab-btn-active" : ""}`}
            data-tip={TAB_HINTS[tab]}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className="tab-panel">
        {activeTab === "Documentation" && <DocumentationTab projectId={projectId} />}
        {activeTab === "Tasks" && <TasksTab projectId={projectId} onChange={refreshProject} />}
        {activeTab === "Resources" && <ResourcesTab projectId={projectId} />}
        {activeTab === "Milestones" && <MilestonesTab projectId={projectId} />}
        {activeTab === "Insights" && <InsightsTab projectId={projectId} />}
        {activeTab === "Issues" && <IssuesTab projectId={projectId} />}
        {activeTab === "Reminders" && <RemindersTab projectId={projectId} />}
        {activeTab === "Contacts" && <ContactsTab projectId={projectId} />}
        {activeTab === "Calendar" && <CalendarTab projectId={projectId} />}
      </div>
    </div>
  );
}

// ---------- Documentation ----------
function DocumentationTab({ projectId }: { projectId: string }) {
  const [entries, setEntries] = useState<DocEntry[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [uploadNote, setUploadNote] = useState<string | null>(null);

  async function refresh() {
    setEntries(await listDocEntries(projectId));
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  function fileToText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadNote(null);
    if (file.name.endsWith(".doc") || file.name.endsWith(".docx")) {
      setUploadNote("Word documents (.doc/.docx) cannot be parsed directly in the browser. Please save as .txt or .md first, or paste the content.");
      e.target.value = "";
      return;
    }
    try {
      const text = await fileToText(file);
      setNewContent(text);
      if (!newTitle.trim()) {
        const inferredTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setNewTitle(inferredTitle);
      }
      setUploadNote(`Loaded content from "${file.name}" into body.`);
    } catch {
      setUploadNote("Failed to read text from file.");
    }
    e.target.value = "";
  }

  async function addOutline(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await createDocEntry({
      projectId,
      type: "outline",
      title: newTitle.trim(),
      content: newContent.trim(),
    });
    setNewTitle("");
    setNewContent("");
    setUploadNote(null);
    refresh();
  }

  async function onContentChange(id: string, content: string) {
    await updateDocEntry(id, { content });
  }

  async function onTitleChange(id: string, title: string) {
    if (!title.trim()) return;
    await updateDocEntry(id, { title: title.trim() });
    refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this section?")) return;
    await deleteDocEntry(id);
    refresh();
  }

  return (
    <div>
      <form className="resource-form" onSubmit={addOutline} style={{ marginBottom: 20 }}>
        <div className="field" style={{ flexBasis: "100%" }}>
          <label>Documentation Title</label>
          <div className="inline-form" style={{ marginBottom: 0 }}>
            <input
              type="text"
              placeholder="Section title (e.g. 'Overview', 'Phase 1 Specs', 'Architecture')..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
            <MicButton onResult={(text) => setNewTitle(text)} />
          </div>
        </div>

        <div className="field" style={{ flexBasis: "100%" }}>
          <label>Body / Content</label>
          <textarea
            placeholder="Write section body, documentation notes, technical specs, or outline details..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={4}
          />
          <div style={{ marginTop: 4 }}>
            <MicButton onResult={(text) => setNewContent((prev) => (prev ? prev + " " + text : text))} />
          </div>
        </div>

        <div className="field" style={{ flexBasis: "100%" }}>
          <label style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            Or upload a file instead of typing the body (.txt, .md):
          </label>
          <input
            type="file"
            accept=".txt,.md,.doc,.docx"
            onChange={handleFileUpload}
            data-tip="Upload .txt or .md file to automatically populate title and body"
          />
          {uploadNote && (
            <p className={uploadNote.includes("cannot be parsed") || uploadNote.includes("Failed") ? "otp-error" : "progress-label"} style={{ margin: "4px 0" }}>
              {uploadNote}
            </p>
          )}
        </div>

        <button type="submit" className="btn-primary clickable">
          + Add documentation section
        </button>
      </form>

      {entries.length === 0 ? (
        <p className="empty-state">
          No documentation yet. Add a section above — this is your project outline &amp;
          phased plan, filled in as you go (or by the assistant, once connected).
        </p>
      ) : (
        <div className="doc-list">
          {entries.map((entry) => (
            <div key={entry.id} className="doc-entry">
              <div className="doc-entry-header">
                <input
                  className="doc-entry-title-input"
                  defaultValue={entry.title}
                  onBlur={(e) => onTitleChange(entry.id, e.target.value)}
                />
                <button
                  className="task-delete-btn clickable"
                  data-tip="Delete section"
                  onClick={() => onDelete(entry.id)}
                >
                  ×
                </button>
              </div>
              <textarea
                defaultValue={entry.content}
                placeholder="Write here..."
                rows={5}
                onBlur={(e) => onContentChange(entry.id, e.target.value)}
              />
              <MicButton onResult={(text) => onContentChange(entry.id, entry.content + " " + text)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Tasks ----------
function TasksTab({ projectId, onChange }: { projectId: string; onChange: () => void }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  async function refresh() {
    setTasks(await listTasksForProject(projectId));
    onChange();
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await createTask({ projectId, title: newTitle.trim() });
    setNewTitle("");
    refresh();
  }

  async function cycleStatus(task: Task) {
    const next: Record<TaskStatus, TaskStatus> = {
      active: "completed",
      completed: "inactive",
      inactive: "active",
    };
    await setTaskStatus(task.id, next[task.status]);
    await reconcileMilestoneStatuses(projectId);
    refresh();
  }

  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditValue(task.title);
  }

  async function saveEdit(id: string) {
    if (editValue.trim()) {
      await updateTask(id, { title: editValue.trim() });
    }
    setEditingId(null);
    refresh();
  }

  return (
    <div>
      <form className="inline-form" onSubmit={addTask}>
        <input
          type="text"
          placeholder="New task..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <MicButton onResult={(text) => setNewTitle(text)} />
        <button type="submit" className="btn-primary clickable">+ Add task</button>
      </form>

      {tasks.length === 0 ? (
        <p className="empty-state">No tasks yet. Add one above.</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id} className={`task-item task-${task.status}`}>
              <button
                type="button"
                className={`task-status-btn is-${task.status} clickable`}
                onClick={() => cycleStatus(task)}
                data-tip="Click to cycle status (active → completed → inactive)"
                aria-label={`Cycle status: currently ${task.status}`}
              >
                {task.status === "completed" ? "✓ Done" : task.status === "inactive" ? "— Parked" : "○ Active"}
              </button>
              {editingId === task.id ? (
                <input
                  className="task-title-input"
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => saveEdit(task.id)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit(task.id)}
                />
              ) : (
                <span className="task-title">{task.title}</span>
              )}
              <span className="task-status-label">{task.status}</span>
              <button
                className="btn-icon clickable"
                data-tip="Rename task"
                onClick={() => startEdit(task)}
              >
                Edit
              </button>
              <button
                className="task-delete-btn"
                data-tip="Delete task"
                onClick={async () => { await deleteTask(task.id); refresh(); }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------- Resources ----------
function ResourcesTab({ projectId }: { projectId: string }) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [subfilter, setSubfilter] = useState<string>("all");
  const [editing, setEditing] = useState<Resource | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [provider, setProvider] = useState<"gemini" | "claude" | "gpt" | "other">("other");
  const [images, setImages] = useState<ResourceImage[]>([]);
  const [files, setFiles] = useState<ResourceFile[]>([]);
  const [imgLink, setImgLink] = useState("");
  const [pdfLink, setPdfLink] = useState("");

  const DEFAULT_CATEGORIES: { id: string; label: string }[] = [
    { id: "notes", label: "Notes" },
    { id: "scripts", label: "Scripts" },
    { id: "links", label: "Links" },
    { id: "images", label: "Images" },
    { id: "pdfs", label: "PDFs" },
  ];

  // Custom categories state (global addition, accessible across all projects)
  const [customCategories, setCustomCategories] = useState<{ id: string; label: string }[]>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  // Load custom categories from global storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("panga-categories-global");
      if (stored) {
        setCustomCategories(JSON.parse(stored));
      }
    } catch {}
  }, []);

  function saveCustomCategories(cats: { id: string; label: string }[]) {
    setCustomCategories(cats);
    try {
      localStorage.setItem("panga-categories-global", JSON.stringify(cats));
    } catch {}
  }

  function handleAddCategory(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const name = newCatName.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    if (!id) return;
    const exists = DEFAULT_CATEGORIES.some((c) => c.id === id) || customCategories.some((c) => c.id === id);
    if (!exists) {
      const updated = [...customCategories, { id, label: name }];
      saveCustomCategories(updated);
    }
    setFilter(id);
    setSubfilter("all");
    setNewCatName("");
    setShowAddCategory(false);
  }

  function handleRemoveCategory(catId: string) {
    if (!confirm(`Delete custom category "${CATEGORY_LABELS[catId] || catId}"? Existing items will remain.`)) return;
    const updated = customCategories.filter((c) => c.id !== catId);
    saveCustomCategories(updated);
    if (filter === catId) {
      setFilter("all");
      setSubfilter("all");
    }
  }

  const allCategories: { id: string; label: string }[] = useMemo(() => {
    return [...DEFAULT_CATEGORIES, ...customCategories];
  }, [customCategories]);

  const CATEGORY_LABELS: Record<string, string> = useMemo(() => {
    const map: Record<string, string> = {
      notes: "Notes",
      scripts: "Scripts",
      links: "Links",
      images: "Images",
      pdfs: "PDFs",
    };
    for (const c of customCategories) {
      map[c.id] = c.label;
    }
    return map;
  }, [customCategories]);

  const SUBCATEGORY_LABELS: Record<string, Record<string, string>> = {
    notes: {
      all: "All",
      prompts: "Prompts",
      reports_memos: "Reports & Memos",
    },
    links: {
      all: "All",
      ai_chats: "AI Chats",
      bookmark_groups: "Multi-tab Bookmarks",
      my_links: "My Links",
    },
    scripts: {
      all: "All",
      shell: "Shell",
      snippets: "Snippets",
    },
    images: { all: "All" },
    pdfs: { all: "All" },
  };

  // Custom subcategories state (shared across all projects)
  const [customSubcategories, setCustomSubcategories] = useState<Record<string, string[]>>({});
  const [newSubcategory, setNewSubcategory] = useState("");
  const [showSubcategoryManager, setShowSubcategoryManager] = useState(false);
  const [uploadNote, setUploadNote] = useState<string | null>(null);

  // Load custom subcategories from global storage on mount (migrating any legacy per-project ones)
  useEffect(() => {
    try {
      const globalStored = localStorage.getItem("panga-subcategories-global");
      if (globalStored) {
        setCustomSubcategories(JSON.parse(globalStored));
      } else {
        const legacyStored = localStorage.getItem(`panga-subcategories-${projectId}`);
        if (legacyStored) {
          const parsed = JSON.parse(legacyStored);
          setCustomSubcategories(parsed);
          localStorage.setItem("panga-subcategories-global", JSON.stringify(parsed));
        }
      }
    } catch {}
  }, [projectId]);

  // Save custom subcategories to global storage
  useEffect(() => {
    if (Object.keys(customSubcategories).length > 0) {
      localStorage.setItem("panga-subcategories-global", JSON.stringify(customSubcategories));
    }
  }, [customSubcategories]);

  function addSubcategory() {
    if (!newSubcategory.trim()) return;
    const key = newSubcategory.trim().toLowerCase().replace(/\s+/g, "_");
    const activeCat = filter === "all" ? "notes" : filter;
    setCustomSubcategories((prev) => ({
      ...prev,
      [activeCat]: [...(prev[activeCat] || []), key].filter((v, i, a) => a.indexOf(v) === i),
    }));
    setNewSubcategory("");
  }

  function removeSubcategory(cat: string, subcat: string) {
    setCustomSubcategories((prev) => ({
      ...prev,
      [cat]: (prev[cat] || []).filter((s) => s !== subcat),
    }));
  }

  // Merge default and custom subcategories for display
  const getAllSubcategories = (cat: string) => ({
    ...(SUBCATEGORY_LABELS[cat] || { all: "All" }),
    ...Object.fromEntries((customSubcategories[cat] || []).map((s) => [s, s.replace(/_/g, " ")])),
  });

  async function refresh() {
    setResources(await listResourcesForProject(projectId));
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  function fileToText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  function resetForm() {
    setTitle("");
    setBody("");
    setUrl("");
    setProvider("other");
    setImages([]);
    setFiles([]);
    setImgLink("");
    setPdfLink("");
    setEditing(null);
  }

  async function addResource(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const cat = editing?.category ?? (filter === "all" ? "notes" : filter);
    const subcat = subfilter === "all" ? "" : subfilter;
    const input: any = {
      projectId,
      category: cat,
      title: title.trim(),
      tags: subcat ? [subcat] : [],
      body: body.trim() || null,
      files,
      images,
      url: url.trim() || null,
      provider: cat === "links" && subcat === "ai_chats" ? provider : null,
    };
    if (editing) {
      await updateResource(editing.id, input);
    } else {
      await createResource(input);
    }
    resetForm();
    refresh();
  }

  function openEdit(r: Resource) {
    setEditing(r);
    setTitle(r.title || "");
    setBody(r.body ?? "");
    setUrl(r.url ?? "");
    setProvider((r.provider as any) ?? "other");
    setImages(r.images ?? []);
    setFiles(r.files ?? []);
    if (r.tags.length > 0 && SUBCATEGORY_LABELS[r.category]?.[r.tags[0]]) {
      setSubfilter(r.tags[0]);
    } else {
      setSubfilter("all");
    }
  }

  const activeCategory = editing ? editing.category : (filter === "all" ? "notes" : filter);
  const filtered = filter === "all" ? resources : resources.filter((r) => r.category === filter);
  const subFiltered = subfilter === "all" ? filtered : filtered.filter((r) => r.tags.includes(subfilter));

  return (
    <div>
      <form className="resource-form" onSubmit={addResource}>
        {/* Category Selector + Add Category Button */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", width: "100%", marginBottom: 6 }}>
          {editing ? (
            <span className="resource-category-badge">{CATEGORY_LABELS[editing.category] || editing.category}</span>
          ) : (
            <select
              value={filter}
              onChange={(e) => {
                if (e.target.value === "__add_new__") {
                  setShowAddCategory(true);
                } else if (!editing) {
                  setFilter(e.target.value);
                  setSubfilter("all");
                }
              }}
              data-tip="Select resource category"
            >
              <option value="all">All categories</option>
              {allCategories.map((c: { id: string; label: string }) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
              <option value="__add_new__">+ Add new category...</option>
            </select>
          )}

          {!editing && (
            <button
              type="button"
              className="btn-secondary btn-small clickable"
              onClick={() => setShowAddCategory((s) => !s)}
              data-tip="Add a custom category globally accessible across all projects"
            >
              {showAddCategory ? "Close" : "+ Add category"}
            </button>
          )}

          {/* Subcategory filter for current category */}
          {!editing && filter !== "all" && getAllSubcategories(filter) && Object.keys(getAllSubcategories(filter)).length > 1 && (
            <select
              value={subfilter}
              onChange={(e) => setSubfilter(e.target.value)}
              data-tip="Filter by subcategory / tag"
            >
              {Object.entries(getAllSubcategories(filter)).map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
          )}

          {/* Subcategory manager toggle button */}
          {!editing && filter !== "all" && (
            <button
              type="button"
              className="btn-secondary btn-small clickable"
              onClick={() => setShowSubcategoryManager((s) => !s)}
              data-tip="Manage shared custom subcategories and tags across all projects"
            >
              {showSubcategoryManager ? "Close tags" : "+ Manage tags"}
            </button>
          )}
        </div>

        {/* Global Category Manager Panel */}
        {showAddCategory && (
          <div className="subcategory-manager" style={{ marginTop: 4, marginBottom: 10, width: "100%" }}>
            <label style={{ fontWeight: 600, fontSize: 13, display: "block", marginBottom: 6 }}>
              Add Category (Global addition, accessible from any project)
            </label>
            <div className="inline-form" style={{ marginBottom: 6 }}>
              <input
                type="text"
                placeholder="Category name (e.g. Credentials, Design, Templates, Research)..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
              />
              <button type="button" className="btn-primary clickable" onClick={() => handleAddCategory()}>
                + Add Category
              </button>
              <button type="button" className="btn-secondary clickable" onClick={() => setShowAddCategory(false)}>
                Cancel
              </button>
            </div>
            {customCategories.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Custom categories:</span>
                <div className="subcategory-list">
                  {customCategories.map((c) => (
                    <span key={c.id} className="subcategory-tag">
                      {c.label}
                      <button
                        type="button"
                        className="subcategory-remove clickable"
                        onClick={() => handleRemoveCategory(c.id)}
                        data-tip={`Delete ${c.label} category`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Subcategory manager panel */}
        {!editing && filter !== "all" && showSubcategoryManager && (
          <div className="subcategory-manager" style={{ marginTop: 4, marginBottom: 10, width: "100%" }}>
            <div className="field">
              <label>Add shared tag / subcategory for {CATEGORY_LABELS[filter] || filter}</label>
              <div className="inline-form" style={{ marginBottom: 0 }}>
                <input
                  type="text"
                  placeholder="e.g. research, meeting-notes, reference, sprint-1"
                  value={newSubcategory}
                  onChange={(e) => setNewSubcategory(e.target.value)}
                  data-tip="Enter tag / subcategory name (shared across projects)"
                />
                <button
                  type="button"
                  className="btn-secondary clickable"
                  onClick={addSubcategory}
                  data-tip="Add this subcategory"
                >
                  + Add
                </button>
              </div>
            </div>
            {customSubcategories[filter] && customSubcategories[filter].length > 0 && (
              <div className="subcategory-list">
                {customSubcategories[filter].map((sc) => (
                  <span key={sc} className="subcategory-tag">
                    {sc.replace(/_/g, " ")}
                    <button
                      type="button"
                      className="subcategory-remove clickable"
                      onClick={() => removeSubcategory(filter, sc)}
                      data-tip="Remove this subcategory"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {editing && getAllSubcategories(editing.category) && Object.keys(getAllSubcategories(editing.category)).length > 1 && (
          <select
            value={subfilter}
            onChange={(e) => setSubfilter(e.target.value)}
            data-tip="Subcategory / tag"
            style={{ width: "100%", marginBottom: 8 }}
          >
            {Object.entries(getAllSubcategories(editing.category)).map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
        )}

        {/* Title Field (Clearly marked) */}
        <div className="field" style={{ flexBasis: "100%" }}>
          <label>Title</label>
          <div className="inline-form" style={{ marginBottom: 0 }}>
            <input
              type="text"
              placeholder={activeCategory === "notes" ? "Note title..." : "Resource title..."}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              data-tip="Title"
            />
            <MicButton onResult={(text) => setTitle(text)} />
          </div>
        </div>

        {/* Category-specific fields */}
        {activeCategory === "links" && (
          <div className="field" style={{ flexBasis: "100%" }}>
            <label>URL</label>
            <div className="inline-form" style={{ marginBottom: 0 }}>
              <input
                type="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                data-tip="URL to open"
              />
              {subfilter === "ai_chats" && (
                <select value={provider} onChange={(e) => setProvider(e.target.value as any)} data-tip="AI provider for this chat link">
                  <option value="gemini">Gemini</option>
                  <option value="claude">Claude</option>
                  <option value="gpt">GPT</option>
                  <option value="other">Other</option>
                </select>
              )}
            </div>
          </div>
        )}

        {/* Explicit Note Body / Content Area */}
        {(activeCategory === "notes" || activeCategory === "scripts" || activeCategory === "links" || activeCategory === "pdfs" || !DEFAULT_CATEGORIES.some((c) => c.id === activeCategory)) && (
          <div className="field" style={{ flexBasis: "100%" }}>
            <label>
              {activeCategory === "notes" ? "Note Body" : "Body / Description / Content"}
            </label>
            <textarea
              placeholder={activeCategory === "notes" ? "Note body, details, notes, thoughts, reference text..." : "Description or details..."}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              data-tip="Resource body and notes"
            />
            <div style={{ marginTop: 4 }}>
              <MicButton onResult={(text) => setBody((prev) => (prev ? prev + " " + text : text))} />
            </div>
          </div>
        )}

        {uploadNote && (
          <p className="otp-error" style={{ flexBasis: "100%", margin: "4px 0" }}>
            {uploadNote}
          </p>
        )}

        {/* Text file upload for notes/scripts/custom categories — parse to body, store text not files */}
        {(!editing && (activeCategory === "notes" || activeCategory === "scripts" || !DEFAULT_CATEGORIES.some((c) => c.id === activeCategory))) && (
          <div style={{ flexBasis: "100%", display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
            <span className="text-tiny" style={{ color: "var(--color-text-muted)" }}>
              Upload rule: Text documents only (.txt, .md). Contents are parsed into body — no files are stored.
            </span>
            <input
              type="file"
              accept=".txt,.md,.doc,.docx"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploadNote(null);
                if (file.name.endsWith(".doc") || file.name.endsWith(".docx")) {
                  setUploadNote("Word documents (.doc/.docx) cannot be parsed directly in the browser. Please save as .txt or .md first, or copy/paste the content.");
                  e.target.value = "";
                  return;
                }
                try {
                  const text = await fileToText(file);
                  setBody((prev) => (prev ? prev + "\n\n" + text : text));
                  if (!title.trim()) {
                    setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
                  }
                } catch {
                  setUploadNote("Failed to read text from file.");
                }
                e.target.value = "";
              }}
              data-tip="Upload .txt or .md files — contents parsed into the note body above. Word docs must be saved as .txt/.md first."
            />
          </div>
        )}

        {/* Image link input — paste a Drive/share link, never store the file */}
        {activeCategory === "images" && (
          <div className="field" style={{ flexBasis: "100%" }}>
            <label>Image link</label>
            <input
              type="url"
              placeholder="https:// (Google Drive share link)"
              value={imgLink}
              onChange={(e) => setImgLink(e.target.value)}
              data-tip="Paste a link to the image (e.g. a Google Drive share link). We store the link, not the file."
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                if (!imgLink.trim()) return;
                setImages((prev) => [...prev, { link: imgLink.trim(), name: imgLink.trim(), alt: imgLink.trim() }]);
                setImgLink("");
              }}
              data-tip="Add image link"
            >
              + Add link
            </button>
          </div>
        )}

        {/* PDF link input — paste a Drive/share link + PDF-to-text helper */}
        {activeCategory === "pdfs" && (
          <div className="field" style={{ flexBasis: "100%" }}>
            <label>PDF link</label>
            <input
              type="url"
              placeholder="https:// (Google Drive share link)"
              value={pdfLink}
              onChange={(e) => setPdfLink(e.target.value)}
              data-tip="Paste a link to the PDF (e.g. a Google Drive share link). We store the link, not the file."
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                if (!pdfLink.trim()) return;
                setFiles((prev) => [...prev, { name: pdfLink.trim(), link: pdfLink.trim() }]);
                setPdfLink("");
              }}
              data-tip="Add PDF link"
            >
              + Add link
            </button>
            <p className="form-note" style={{ marginTop: 4 }}>
              <span data-tip="Convert PDF to plain text, then paste the result into the text area above">
                Need plain text from a PDF? Use a free converter like{" "}
                <a href="https://www.ilovepdf.com/pdf_to_text" target="_blank" rel="noreferrer">
                  ilovepdf.com/pdf_to_text
                </a>
                <span data-tip="1. Upload your PDF. 2. Download the extracted text. 3. Paste it into the description below."> — upload, convert, download text, then paste as the PDF description</span>
              </span>
            </p>
          </div>
        )}

        {/* Image link previews */}
        {images.length > 0 && (
          <div className="image-preview-row">
            {images.map((img, i) => (
              <div key={i} className="image-thumb">
                {img.link ? (
                  <a href={img.link || img.dataUrl} target="_blank" rel="noreferrer" data-tip="Open image link">
                    {img.dataUrl ? <img src={img.dataUrl} alt={img.alt} title={img.name} /> : <span className="thumb-link">{img.name}</span>}
                  </a>
                ) : img.dataUrl ? (
                  <img src={img.dataUrl} alt={img.alt} title={img.name} />
                ) : null}
                <button
                  type="button"
                  className="thumb-remove"
                  data-tip="Remove image"
                  onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* File link previews for pdfs (and legacy files) */}
        {files.length > 0 && (
          <div className="image-preview-row">
            {files.map((f, i) => (
              <div key={i} className="image-thumb">
                <div className="file-preview">
                  {f.link ? (
                    <a href={f.link} target="_blank" rel="noreferrer" className="file-attachment" data-tip="Open link">
                      {f.name}
                    </a>
                  ) : (
                    <span className="file-preview-name">{f.name}</span>
                  )}
                </div>
                <button
                  type="button"
                  className="thumb-remove"
                  data-tip="Remove file"
                  onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, width: "100%", marginTop: 8 }}>
          <button type="submit" className="btn-primary clickable">
            {editing ? "Save changes" : "+ Add resource"}
          </button>
          {editing && (
            <button
              type="button"
              className="btn-secondary clickable"
              data-tip="Cancel edit"
              onClick={() => resetForm()}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Filter Chips (Default + Custom Categories) */}
      <div className="chip-row">
        <button
          className={`chip ${filter === "all" ? "chip-active" : ""}`}
          data-tip="Show all resources"
          onClick={() => { setFilter("all"); setSubfilter("all"); }}
        >
          All
        </button>
        {allCategories.map((c: { id: string; label: string }) => (
          <button
            key={c.id}
            className={`chip ${filter === c.id ? "chip-active" : ""}`}
            data-tip={`Show only ${c.label.toLowerCase()}`}
            onClick={() => { setFilter(c.id); setSubfilter("all"); }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {subFiltered.length === 0 ? (
        <p className="empty-state">No resources in this category yet.</p>
      ) : (
        <ul className="resource-list">
          {subFiltered.map((r) => {
            const label = CATEGORY_LABELS[r.category] || r.category;
            const subTag = r.tags[0] && SUBCATEGORY_LABELS[r.category]?.[r.tags[0]] ? SUBCATEGORY_LABELS[r.category][r.tags[0]] : r.tags[0] || "";

            return (
              <li key={r.id} className="resource-item">
                <span className="resource-category-dot" style={{ backgroundColor: getCategoryColor(r.category) }} />
                <span className="resource-text">
                  <span className="resource-title">{r.title || "(untitled)"}</span>
                  {r.category === "links" && r.url ? (
                    <a href={r.url} target="_blank" rel="noreferrer" className="resource-value-link" data-tip="Open link">
                      {r.url}
                    </a>
                  ) : null}
                  {r.body && <p className="resource-notes" style={{ whiteSpace: "pre-wrap" }}>{r.body}</p>}
                  {r.images.length > 0 && (
                    <div className="resource-image-row">
                      {r.images.map((img, i) => (
                        img.link ? (
                          <a key={i} href={img.link} target="_blank" rel="noreferrer" className="resource-image-link" data-tip="Open image link">
                            {img.dataUrl ? <img src={img.dataUrl} alt={img.alt} className="resource-image-thumb" title={img.name} /> : <span className="thumb-link">{img.name}</span>}
                          </a>
                        ) : img.dataUrl ? (
                          <img key={i} src={img.dataUrl} alt={img.alt} className="resource-image-thumb" title={img.name} />
                        ) : null
                      ))}
                    </div>
                  )}
                  {r.files.length > 0 && (
                    <div className="resource-image-row">
                      {r.files.map((f, i) => (
                        <a
                          key={i}
                          href={f.link || f.dataUrl || "#"}
                          target={f.link ? "_blank" : undefined}
                          rel={f.link ? "noreferrer" : undefined}
                          download={f.link ? undefined : f.name}
                          className="file-attachment"
                          data-tip={f.link ? "Open link" : `Download ${f.name}`}
                        >
                          {f.name}
                        </a>
                      ))}
                    </div>
                  )}
                  <span className="chip-small">{label}{subTag ? ` · ${subTag}` : ""}</span>
                </span>
                <button
                  className="btn-icon clickable"
                  data-tip="Edit resource"
                  onClick={() => openEdit(r)}
                >
                  Edit
                </button>
                <button
                  className="task-delete-btn"
                  data-tip="Delete resource"
                  onClick={async () => { await deleteResource(r.id); refresh(); }}
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function getCategoryColor(cat: string): string {
  const colors: Record<string, string> = {
    notes: "#3b82f6",
    scripts: "#8b5cf6",
    links: "#22c55e",
    images: "#a855f7",
    pdfs: "#f59e0b",
  };
  if (colors[cat]) return colors[cat];
  let hash = 0;
  for (let i = 0; i < cat.length; i++) {
    hash = cat.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 45%)`;
}

// ---------- Milestones ----------
function MilestonesTab({ projectId }: { projectId: string }) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [blockingTaskIds, setBlockingTaskIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  async function refresh() {
    await reconcileMilestoneStatuses(projectId);
    const [m, t] = await Promise.all([listMilestones(projectId), listTasksForProject(projectId)]);
    setMilestones(m);
    setTasks(t);
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const taskById = (id: string) => tasks.find((t) => t.id === id);

  async function addMilestone(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await createMilestone({
      projectId,
      title: title.trim(),
      description: description.trim(),
      targetDate: targetDate ? new Date(targetDate).getTime() : null,
      blockingTaskIds,
    });
    setTitle("");
    setDescription("");
    setTargetDate("");
    setBlockingTaskIds([]);
    refresh();
  }

  async function saveEdit(id: string) {
    if (editValue.trim()) await updateMilestone(id, { title: editValue.trim(), description: editDescription.trim() });
    setEditingId(null);
    refresh();
  }

  function toggleBlocker(id: string) {
    setBlockingTaskIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const sorted = [...milestones].sort((a, b) => (a.targetDate ?? Infinity) - (b.targetDate ?? Infinity));

  return (
    <div>
      <form className="resource-form" onSubmit={addMilestone}>
        <div className="field" style={{ flexBasis: "100%" }}>
          <label>Title</label>
          <input
            type="text"
            placeholder="New milestone (phase checkpoint)..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <MicButton onResult={(text) => setTitle(text)} />
        </div>
        <div className="field" style={{ flexBasis: "100%" }}>
          <label>Description</label>
          <textarea
            rows={2}
            placeholder="Describe this goal — gives context to the AI for agentic actions (notifications, reminders, scheduling)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Target date</label>
          <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        </div>
        <button type="submit" className="btn-primary clickable">+ Add milestone</button>
      </form>

      {tasks.length > 0 && (
        <div className="blocker-picker">
          <span className="blocker-picker-label">Blocking tasks for the new milestone:</span>
          <div className="chip-row">
            {tasks.map((t) => (
              <button
                type="button"
                key={t.id}
                className={`chip ${blockingTaskIds.includes(t.id) ? "chip-active" : ""}`}
                data-tip={t.title}
                onClick={() => toggleBlocker(t.id)}
              >
                {t.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <p className="empty-state">
          No milestones yet. Add a phase checkpoint above and (optionally) attach the
          tasks that block it — the milestone auto-completes once they're all done.
        </p>
      ) : (
        <div className="milestone-track">
          {sorted.map((m) => {
            const blockers = m.blockingTaskIds.map(taskById).filter(Boolean) as Task[];
            const pendingBlockers = blockers.filter((t) => t.status !== "completed");
            return (
              <div
                key={m.id}
                className={`milestone-node milestone-${m.status}`}
                onMouseEnter={() => setHoveredId(m.id)}
                onMouseLeave={() => setHoveredId((cur) => (cur === m.id ? null : cur))}
              >
                <div className="milestone-dot" data-tip="Hover to see blocking tasks" />
                <div className="milestone-body">
                  {editingId === m.id ? (
                    <>
                      <input
                        className="task-title-input"
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => saveEdit(m.id)}
                        onKeyDown={(e) => e.key === "Enter" && saveEdit(m.id)}
                      />
                      <textarea
                        className="task-title-input"
                        rows={2}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        onBlur={() => saveEdit(m.id)}
                        placeholder="Description..."
                      />
                    </>
                  ) : (
                    <>
                      <span className="milestone-title">{m.title}</span>
                      {m.description && <span className="milestone-description">{m.description}</span>}
                    </>
                  )}
                  {m.targetDate && (
                    <span className="milestone-date">{new Date(m.targetDate).toLocaleDateString()}</span>
                  )}
                  <select
                    value={m.status}
                    onChange={async (e) => { await setMilestoneStatus(m.id, e.target.value as Milestone["status"]); refresh(); }}
                    data-tip="Milestone status"
                  >
                    <option value="in_progress">In progress</option>
                    <option value="achieved">Achieved</option>
                    <option value="missed">Missed</option>
                  </select>
                  <button
                    className="btn-icon clickable"
                    data-tip="Rename milestone"
                    onClick={() => { setEditingId(m.id); setEditValue(m.title); setEditDescription(m.description); }}
                  >
                    Edit
                  </button>
                  <button
                    className="task-delete-btn"
                    data-tip="Delete milestone"
                    onClick={async () => { await deleteMilestone(m.id); refresh(); }}
                  >
                    ×
                  </button>
                </div>

                {hoveredId === m.id && (
                  <div className="milestone-hover-panel dropdown-anim">
                    {blockers.length === 0 ? (
                      <p className="empty-state">No blocking tasks linked.</p>
                    ) : (
                      <>
                        <p className="milestone-hover-title">
                          {pendingBlockers.length === 0
                            ? "All blocking tasks complete"
                            : `${pendingBlockers.length} of ${blockers.length} blocking task(s) pending`}
                        </p>
                        <ul className="milestone-blocker-list">
                          {blockers.map((t) => (
                            <li key={t.id} className={`task-${t.status}`}>
                              {t.status === "completed" ? "Done" : "o"} {t.title}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- Issues ----------
function IssuesTab({ projectId }: { projectId: string }) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<IssueSeverity>("medium");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingLabels, setEditingLabels] = useState("");
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [newComment, setNewComment] = useState("");

  async function refresh() {
    setIssues(await listIssues(projectId));
    setMilestones(await listMilestones(projectId));
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function addIssue(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await createIssue({ projectId, title: title.trim(), severity, description: description.trim() });
    setTitle("");
    setDescription("");
    refresh();
  }

  async function saveEdit(id: string) {
    if (editValue.trim()) await updateIssue(id, { title: editValue.trim(), description: editingDescription.trim(), labels: editingLabels.split(",").map(l => l.trim()).filter(Boolean), milestoneId: editingMilestoneId });
    setEditingId(null);
    refresh();
  }

  async function addComment(issueId: string) {
    if (!newComment.trim()) return;
    await addIssueComment(issueId, newComment.trim());
    setNewComment("");
    refresh();
  }

  async function deleteComment(issueId: string, commentId: string) {
    await deleteIssueComment(issueId, commentId);
    refresh();
  }

  return (
    <div>
      <form className="resource-form" onSubmit={addIssue}>
        <div className="field" style={{ flexBasis: "100%" }}>
          <label>Title</label>
          <input type="text" placeholder="New issue / setback..." value={title} onChange={(e) => setTitle(e.target.value)} />
          <MicButton onResult={(text) => setTitle(text)} />
        </div>
        <div className="field" style={{ flexBasis: "100%" }}>
          <label>Description</label>
          <textarea rows={2} placeholder="Details..." value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="field">
          <label>Severity</label>
          <select value={severity} onChange={(e) => setSeverity(e.target.value as IssueSeverity)} data-tip="Issue severity">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <button type="submit" className="btn-primary clickable">+ Log issue</button>
      </form>
      {issues.length === 0 ? (
        <p className="empty-state">No issues logged. Good sign.</p>
      ) : (
        <ul className="task-list">
          {issues.map((i) => (
            <li key={i.id} className={`task-item issue-${i.severity}`}>
              {editingId === i.id ? (
                <div className="issue-edit-form">
                  <input
                    className="task-title-input"
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => saveEdit(i.id)}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit(i.id)}
                  />
                  <textarea
                    className="task-title-input"
                    rows={2}
                    value={editingDescription}
                    onChange={(e) => setEditingDescription(e.target.value)}
                    onBlur={() => saveEdit(i.id)}
                    placeholder="Description..."
                  />
                  <div className="field">
                    <label>Labels (comma separated)</label>
                    <input
                      value={editingLabels}
                      onChange={(e) => setEditingLabels(e.target.value)}
                      placeholder="bug, urgent, documentation"
                    />
                  </div>
                  <div className="field">
                    <label>Milestone</label>
                    <select
                      value={editingMilestoneId ?? ""}
                      onChange={(e) => setEditingMilestoneId(e.target.value || null)}
                    >
                      <option value="">None</option>
                      {milestones.map((m) => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-actions">
                    <button type="button" className="btn-primary" onClick={() => saveEdit(i.id)} data-tip="Save changes">Save</button>
                    <button type="button" className="btn-secondary" onClick={() => setEditingId(null)} data-tip="Cancel">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="task-title">{i.title}</span>
                  {i.description && <p className="issue-description">{i.description}</p>}
                  {i.labels && i.labels.length > 0 && (
                    <div className="issue-labels">
                      {i.labels.map((l) => (
                        <span key={l} className="label-chip">{l}</span>
                      ))}
                    </div>
                  )}
                  {i.milestoneId && (
                    <span className="milestone-link">
                      Milestone: {milestones.find((m) => m.id === i.milestoneId)?.title ?? i.milestoneId}
                    </span>
                  )}
                </>
              )}
              <select
                value={i.severity}
                onChange={async (e) => { await updateIssue(i.id, { severity: e.target.value as IssueSeverity }); refresh(); }}
                data-tip="Change severity"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <span className="task-status-label">{i.status}</span>
              {i.status === "open" && (
                <button
                  className="btn-secondary clickable"
                  data-tip="Resolve this issue"
                  onClick={async () => { await setIssueStatus(i.id, "resolved"); refresh(); }}
                >
                  Resolve
                </button>
              )}
              <button
                className="btn-icon clickable"
                data-tip="Edit issue"
                onClick={() => {
                  setEditingId(i.id);
                  setEditValue(i.title);
                  setEditingDescription(i.description ?? "");
                  setEditingLabels(i.labels?.join(", ") ?? "");
                  setEditingMilestoneId(i.milestoneId ?? null);
                }}
              >
                Edit
              </button>
              <button
                className="btn-icon clickable"
                data-tip={showComments[i.id] ? "Hide comments" : "Show comments"}
                onClick={() => setShowComments((prev) => ({ ...prev, [i.id]: !prev[i.id] }))}
              >
                💬 {i.comments?.length ?? 0}
              </button>
              <button
                className="btn-icon clickable"
                data-tip="Edit labels"
                onClick={() => {
                  setEditingId(i.id);
                  setEditingLabels(i.labels?.join(", ") ?? "");
                }}
              >
                Labels
              </button>
              <button
                className="btn-icon clickable"
                data-tip="Link milestone"
                onClick={() => {
                  setEditingId(i.id);
                  setEditingMilestoneId(i.milestoneId ?? null);
                }}
              >
                Milestone
              </button>
              <button
                className="task-delete-btn"
                data-tip="Delete issue"
                onClick={async () => { await deleteIssue(i.id); refresh(); }}
              >
                ×
              </button>
              {showComments[i.id] && (
                <div className="issue-comments">
                  {(i.comments ?? []).map((c) => (
                    <div key={c.id} className="comment-item">
                      <p>{c.text}</p>
                      <small>{new Date(c.createdAt).toLocaleString()}</small>
                      <button
                        className="btn-icon btn-icon-danger"
                        data-tip="Delete comment"
                        onClick={() => deleteComment(i.id, c.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <div className="comment-add">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addComment(i.id)}
                    />
                    <button type="button" className="btn-primary btn-small" onClick={() => addComment(i.id)}>Add</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------- Reminders ----------
function RemindersTab({ projectId }: { projectId: string }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [message, setMessage] = useState("");
  const [when, setWhen] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  async function refresh() {
    setReminders(await listReminders(projectId));
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function addReminder(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || !when) return;
    await createReminder({ projectId, message: message.trim(), triggerAt: new Date(when).getTime() });
    setMessage("");
    setWhen("");
    refresh();
  }

  async function saveEdit(id: string) {
    if (editValue.trim()) await updateReminder(id, { message: editValue.trim() });
    setEditingId(null);
    refresh();
  }

  return (
    <div>
      <form className="resource-form" onSubmit={addReminder}>
        <input type="text" placeholder="Reminder message..." value={message} onChange={(e) => setMessage(e.target.value)} />
        <MicButton onResult={(text) => setMessage(text)} />
        <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} data-tip="When this reminder should fire" />
        <button type="submit" className="btn-primary clickable">+ Set reminder</button>
      </form>
      {reminders.length === 0 ? (
        <p className="empty-state">No reminders set for this project.</p>
      ) : (
        <ul className="task-list">
          {reminders.map((r) => (
            <li key={r.id} className={`task-item reminder-${r.status}`}>
              {editingId === r.id ? (
                <input
                  className="task-title-input"
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => saveEdit(r.id)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit(r.id)}
                />
              ) : (
                <span className="task-title">{r.message}</span>
              )}
              <input
                type="datetime-local"
                className="reminder-time-input"
                defaultValue={new Date(r.triggerAt - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                onChange={async (e) => {
                  if (!e.target.value) return;
                  await updateReminder(r.id, { triggerAt: new Date(e.target.value).getTime() });
                  refresh();
                }}
                data-tip="Change reminder time"
              />
              {r.status === "pending" && (
                <button
                  className="btn-secondary clickable"
                  data-tip="Dismiss this reminder"
                  onClick={async () => { await dismissReminder(r.id); refresh(); }}
                >
                  Dismiss
                </button>
              )}
              <button
                className="btn-icon clickable"
                data-tip="Rename reminder"
                onClick={() => { setEditingId(r.id); setEditValue(r.message); }}
              >
                Edit
              </button>
              <button
                className="task-delete-btn"
                data-tip="Delete reminder"
                onClick={async () => { await deleteReminder(r.id); refresh(); }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------- Calendar ----------
function CalendarTab({ projectId }: { projectId: string }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [hangoutLink, setHangoutLink] = useState("");
  const [icsFile, setIcsFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [viewDate, setViewDate] = useState(() => new Date());

  async function refresh() {
    setEvents(await listCalendarEvents(projectId));
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function addEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !startAt || !endAt) return;
    await createLocalEvent({
      projectId,
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
    refresh();
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
        projectId,
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
      const { syncPushRecord } = await import("../sync/sync");
      for (const ev of toImport) void syncPushRecord("calendar_events", ev);
      setImportStatus({ message: `Imported ${toImport.length} event(s) from .ics file.`, type: "success" });
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
  }

  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div>
      {/* Import .ics section */}
      <section className="dashboard-section">
        <h3 className="section-heading">Import from Google Calendar</h3>
        <p className="form-note">
          Export your Google Calendar as an .ics file (Google Calendar → Settings → Import &amp; export → Export),
          then upload it here. The app will parse events and add them as local calendar events.
        </p>
        {importStatus && (
          <p className={importStatus.type === "error" ? "otp-error" : "progress-label"} style={{ margin: "6px 0" }}>
            {importStatus.message}
          </p>
        )}
        <form className="resource-form" onSubmit={handleIcsImport}>
          <input type="file" accept=".ics" onChange={(e) => setIcsFile(e.target.files?.[0] ?? null)} data-tip="Select an .ics file" />
          <button type="submit" className="btn-primary clickable" disabled={importing || !icsFile}>
            {importing ? "Importing..." : "Import .ics file"}
          </button>
        </form>
      </section>

      {/* Calendar Controls & View Toggle */}
      <div className="calendar-view-header">
        <div className="calendar-nav">
          <button type="button" className="btn-secondary btn-small clickable" onClick={prevMonth} data-tip="Previous month">
            &larr; Prev
          </button>
          <strong style={{ fontSize: "15px", minWidth: 140, textAlign: "center" }}>{monthName}</strong>
          <button type="button" className="btn-secondary btn-small clickable" onClick={nextMonth} data-tip="Next month">
            Next &rarr;
          </button>
          <button type="button" className="btn-secondary btn-small clickable" onClick={gotoToday} data-tip="Go to today">
            Today
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
                    data-tip={`${new Date(e.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}: ${e.title}`}
                  >
                    {new Date(e.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} {e.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Local events form */}
      <form className="resource-form" onSubmit={addEvent}>
        <div className="field" style={{ flexBasis: "100%" }}>
          <label>Title</label>
          <input type="text" placeholder="Event title..." value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field" style={{ flexBasis: "100%" }}>
          <label>Description</label>
          <textarea rows={2} placeholder="Description, links to tasks, milestones, resources, insights..." value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="field">
          <label>Start</label>
          <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} required />
        </div>
        <div className="field">
          <label>End</label>
          <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} required />
        </div>
        <div className="field" style={{ flexBasis: "100%" }}>
          <label>Meet link (optional)</label>
          <input type="url" placeholder="https://meet.google.com/..." value={hangoutLink} onChange={(e) => setHangoutLink(e.target.value)} data-tip="Google Meet or other video call link" />
        </div>
        <button type="submit" className="btn-primary clickable">+ Add event</button>
      </form>

      {/* List View / Event List */}
      {viewMode === "list" && (
        events.length === 0 ? (
          <p className="empty-state">
            No events yet. Add a local event above or import from Google Calendar.
          </p>
        ) : (
          <ul className="resource-list">
            {events
              .sort((a, b) => a.startAt - b.startAt)
              .map((e) => (
                <li key={e.id} className="resource-item">
                  <span className="resource-category-dot" style={{ backgroundColor: e.source === "google" ? "#4285f4" : "#3b82f6" }} />
                  <span className="resource-text">
                    <span className="resource-title">{e.title}</span>
                    <p className="resource-notes">
                      {new Date(e.startAt).toLocaleString()} — {new Date(e.endAt).toLocaleTimeString()}
                      {e.hangoutLink && <a href={e.hangoutLink} target="_blank" rel="noreferrer" className="resource-value-link" data-tip="Open Meet link">📹 Meet</a>}
                      {e.description && <><br />{e.description}</>}
                    </p>
                    <span className="chip-small">{e.source === "google" ? "Google Calendar" : "Local"}</span>
                  </span>
                  <button className="btn-icon clickable" data-tip="Delete event" onClick={async () => { await deleteCalendarEvent(e.id); refresh(); }}>
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

```

---

## `src/pages/Settings.tsx`

Settings page: Gemini API key, local backup/download/upload, and email backup configuration.

```typescript
import { useEffect, useState, useCallback, useRef } from "react";
import { getGeminiApiKey, setGeminiApiKey } from "../data/settings";
import {
  downloadSnapshot,
  readSnapshotFile,
  importSnapshot,
  exportSnapshot,
} from "../sync/snapshot";

export default function Settings() {
  // Gemini settings
  const [geminiKey, setGeminiKey] = useState("");
  const [geminiStatus, setGeminiStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Local storage / backup status
  const [backupStatus, setBackupStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const [backupLoading, setBackupLoading] = useState(false);

  // Email backup
  const [emailBackupEmail, setEmailBackupEmail] = useState("");
  const [emailBackupStatus, setEmailBackupStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [emailBackupMessage, setEmailBackupMessage] = useState<string | null>(null);

  // File input ref for snapshot upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadSettings = useCallback(async () => {
    const key = await getGeminiApiKey();
    setGeminiKey(key ?? "");
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  async function saveGeminiKey(e: React.FormEvent) {
    e.preventDefault();
    setGeminiStatus("saving");
    await setGeminiApiKey(geminiKey.trim());
    setGeminiStatus("saved");
    setTimeout(() => setGeminiStatus("idle"), 2500);
  }

  async function handleDownloadBackup() {
    setBackupLoading(true);
    setBackupStatus("saving");
    setBackupMessage("Preparing backup...");
    try {
      await downloadSnapshot();
      setBackupStatus("saved");
      setBackupMessage("Backup downloaded successfully.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setBackupStatus("error");
      setBackupMessage(`Download failed: ${message}`);
    } finally {
      setBackupLoading(false);
    }
  }

  async function handleUploadSnapshot(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBackupLoading(true);
    setBackupStatus("saving");
    setBackupMessage("Restoring snapshot...");
    try {
      const snapshot = await readSnapshotFile(file);
      await importSnapshot(snapshot);
      setBackupStatus("saved");
      setBackupMessage("Snapshot restored from local file.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setBackupStatus("error");
      setBackupMessage(`Restore failed: ${message}`);
    } finally {
      setBackupLoading(false);
      e.target.value = "";
    }
  }

  async function handleEmailBackup() {
    if (!emailBackupEmail.trim() || !emailBackupEmail.includes('@')) {
      setEmailBackupMessage("Please enter a valid email address.");
      setEmailBackupStatus("error");
      return;
    }

    setBackupLoading(true);
    setEmailBackupStatus("sending");
    setEmailBackupMessage("Generating backup and sending email...");

    try {
      // Generate snapshot
      const snapshot = await exportSnapshot();

      // Send to API
      const response = await fetch('/api/backup/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailBackupEmail.trim(),
          snapshot,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      setEmailBackupStatus("sent");
      setEmailBackupMessage(`Backup sent to ${emailBackupEmail.trim()}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setEmailBackupStatus("error");
      setEmailBackupMessage(`Email backup failed: ${message}`);
    } finally {
      setBackupLoading(false);
    }
  }

  const getStatusBadge = () => {
    const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
      idle: { bg: "#f3f4f6", color: "#6b7280", label: "Ready" },
      saving: { bg: "#fef3c7", color: "#92400e", label: "Working..." },
      sending: { bg: "#fef3c7", color: "#92400e", label: "Sending..." },
      saved: { bg: "#ecfdf5", color: "#065f46", label: "Success" },
      sent: { bg: "#ecfdf5", color: "#065f46", label: "Sent" },
      error: { bg: "#fef2f2", color: "#991b1b", label: "Error" },
    };
    const s = statusStyles[backupStatus] || statusStyles[emailBackupStatus] || statusStyles.idle;
    return (
      <span
        className="chip-small"
        style={{
          background: s.bg,
          color: s.color,
          fontWeight: 600,
        }}
      >
        {s.label}
      </span>
    );
  };

  return (
    <div className="page settings-page">
      <header className="page-header">
        <h1>Settings</h1>
      </header>

      {/* §1 — Local Storage & Backup */}
      <section className="settings-section" style={{ borderLeft: "4px solid var(--color-accent-primary)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <h2 style={{ margin: 0 }}>Data Persistence & Storage</h2>
          {getStatusBadge()}
        </div>

        <p className="settings-help">
          All your projects, tasks, resources, notes, milestones, reminders, and settings are stored safely in
          fast, offline-first IndexedDB storage in your browser. Use the buttons below to create manual backups
          or restore from a snapshot file.
        </p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 12 }}>
          <button
            type="button"
            className="btn-secondary clickable"
            onClick={handleDownloadBackup}
            disabled={backupLoading}
            data-tip="Download a complete JSON backup of your local database"
          >
            📥 Download Backup (.json)
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleUploadSnapshot}
            style={{ display: "none" }}
            id="snapshot-upload"
          />
          <button
            type="button"
            className="btn-secondary clickable"
            onClick={() => fileInputRef.current?.click()}
            disabled={backupLoading}
            data-tip="Restore from a local .json snapshot file"
          >
            📤 Upload Snapshot (.json)
          </button>
        </div>

        {/* Email Backup Section */}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--color-border)" }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: "14px" }}>📧 Email Backup</h3>
          <p className="settings-help" style={{ marginBottom: 12 }}>
            Send a complete backup of your data to any email address as a JSON attachment.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="email"
              placeholder="recipient@example.com"
              value={emailBackupEmail}
              onChange={(e) => setEmailBackupEmail(e.target.value)}
              style={{ minWidth: "280px", flex: 1 }}
              data-tip="Email address to receive the backup"
            />
            <button
              type="button"
              className="btn-primary clickable"
              onClick={handleEmailBackup}
              disabled={backupLoading || emailBackupStatus === "sending"}
              data-tip="Generate backup and send via email"
            >
              {emailBackupStatus === "sending" ? "Sending..." : "📧 Email Backup"}
            </button>
          </div>
        </div>

        {(backupMessage || emailBackupMessage) && (
          <p
            className="progress-label"
            style={{
              marginTop: 10,
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              background:
                backupStatus === "error" || emailBackupStatus === "error" ? "#fef2f2"
                : backupStatus === "saving" || emailBackupStatus === "sending" ? "#fef3c7"
                : "#f0fdf4",
              color: backupStatus === "error" || emailBackupStatus === "error" ? "#991b1b"
                : backupStatus === "saving" || emailBackupStatus === "sending" ? "#92400e"
                : "#166534",
              border: "1px solid var(--color-border)",
            }}
          >
            {backupMessage || emailBackupMessage}
          </p>
        )}
      </section>

      {/* §2 — Gemini API key */}
      <section className="settings-section">
        <h2>Gemini API Key (AI Assistant & Scheduler)</h2>
        <p className="settings-help">
          Used by the AI Assistant chat and natural language planning. Get a free key from{" "}
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">
            Google AI Studio
          </a>
          .
        </p>
        <form className="settings-form" onSubmit={saveGeminiKey}>
          <input
            type="text"
            placeholder="AIza..."
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
            data-tip="Your Gemini API key from Google AI Studio"
          />
          <button type="submit" className="btn-primary clickable" disabled={geminiStatus === "saving"}>
            {geminiStatus === "saving" ? "Saving..." : geminiStatus === "saved" ? "Saved ✓" : "Save Key"}
          </button>
        </form>
        {geminiStatus === "saved" && (
          <p style={{ fontSize: "12px", color: "green", marginTop: 6 }}>
            ✓ Gemini API key saved!
          </p>
        )}
      </section>
    </div>
  );
}
```

---

## `src/search/search.ts`

Global search: substring matching across projects, tasks, resources, milestones, issues, docs, insights, settings, and saved files.

```typescript
// src/search/search.ts
// This is the ONLY file that queries across multiple entity types for
// search purposes. Simple substring matching for now — swappable for
// FlexSearch's indexed engine later without touching any UI code,
// since the UI only ever calls globalSearch().

import { db } from "../data/db";

export type SearchResultType =
  | "project"
  | "task"
  | "resource"
  | "milestone"
  | "issue"
  | "docEntry"
  | "setting"
  | "savedFile"
  | "insight";

export interface SearchResult {
  type: SearchResultType;
  id: string;
  projectId?: string | null;
  projectName: string;
  title: string;
  subtitle?: string;
  // For deep-linking results
  action?: "navigate" | "openSettings";
  target?: string; // route path or settings section
}

export async function globalSearch(rawQuery: string): Promise<SearchResult[]> {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return [];

  const [projects, tasks, resources, milestones, issues, docEntries, insights] = await Promise.all([
    db.projects.toArray(),
    db.tasks.toArray(),
    db.resources.toArray(),
    db.milestones.toArray(),
    db.issues.toArray(),
    db.docEntries.toArray(),
    db.insights.toArray(),
  ]);

  const projectName = (id?: string | null) => (id ? projects.find((p) => p.id === id)?.name ?? "" : "Quick item");
  const matches = (...fields: (string | string[] | undefined | null)[]) =>
    fields.some((f) =>
      Array.isArray(f) ? f.some((x) => x.toLowerCase().includes(q)) : f?.toLowerCase().includes(q)
    );

  const results: SearchResult[] = [];

  for (const p of projects) {
    if (matches(p.name, p.description)) {
      results.push({
        type: "project",
        id: p.id,
        projectId: p.id,
        projectName: p.name,
        title: p.name,
        subtitle: "Project",
        action: "navigate",
        target: `/project/${p.id}`,
      });
    }
  }
  for (const t of tasks) {
    if (matches(t.title, t.notes, t.tags)) {
      results.push({
        type: "task",
        id: t.id,
        projectId: t.projectId,
        projectName: projectName(t.projectId),
        title: t.title,
        subtitle: `Task · ${t.status}`,
        action: "navigate",
        target: `/project/${t.projectId}?tab=Tasks`,
      });
    }
  }
  for (const r of resources) {
    const imageNames = (r.images ?? []).map((i) => i.name + (i.alt ? " " + i.alt : ""));
    const fileNames = (r.files ?? []).map((f) => f.name);
    if (matches(r.title, r.url ?? undefined, r.body, r.tags, imageNames, fileNames)) {
      results.push({
        type: "resource",
        id: r.id,
        projectId: r.projectId,
        projectName: projectName(r.projectId),
        title: r.title,
        subtitle: r.category === "links" ? `Link · ${r.url || ""}` : `Resource · ${r.category}`,
        action: "navigate",
        target: r.projectId
          ? `/project/${r.projectId}?tab=Resources`
          : r.category === "links"
          ? `/home?tab=Links`
          : `/home?tab=Resources`,
      });
    }
  }
  for (const m of milestones) {
    if (matches(m.title)) {
      results.push({
        type: "milestone",
        id: m.id,
        projectId: m.projectId,
        projectName: projectName(m.projectId),
        title: m.title,
        subtitle: `Milestone · ${m.status}`,
        action: "navigate",
        target: `/project/${m.projectId}?tab=Milestones`,
      });
    }
  }
  for (const i of issues) {
    if (matches(i.title, i.description)) {
      results.push({
        type: "issue",
        id: i.id,
        projectId: i.projectId,
        projectName: projectName(i.projectId),
        title: i.title,
        subtitle: `Issue · ${i.severity}`,
        action: "navigate",
        target: `/project/${i.projectId}?tab=Issues`,
      });
    }
  }
  for (const d of docEntries) {
    if (matches(d.title, d.content)) {
      results.push({
        type: "docEntry",
        id: d.id,
        projectId: d.projectId,
        projectName: projectName(d.projectId),
        title: d.title,
        subtitle: "Documentation",
        action: "navigate",
        target: `/project/${d.projectId}?tab=Documentation`,
      });
    }
  }

  // §7 — Insights results
  for (const i of insights) {
    if (matches(i.title, i.body, i.link, i.tags)) {
      results.push({
        type: "insight",
        id: i.id,
        projectId: i.projectId,
        projectName: projectName(i.projectId),
        title: i.title,
        subtitle: `Insight · ${i.type}`,
        action: "navigate",
        target: `/project/${i.projectId}?tab=Insights`,
      });
    }
  }

  // §6 — Settings results
  const settingEntries: { id: string; title: string; subtitle: string; target: string }[] = [
    { id: "gemini-key", title: "Gemini API Key", subtitle: "API key for Scheduler AI Plan mode", target: "gemini" },
    { id: "google-calendar", title: "Google Calendar", subtitle: "OAuth connection for Calendar sync", target: "calendar" },
    { id: "secrets-vault", title: "Secrets Vault", subtitle: "Encrypted secret storage (PBKDF2 + AES-GCM)", target: "secrets" },
  ];
  for (const s of settingEntries) {
    if (matches(s.title, s.subtitle)) {
      results.push({
        type: "setting",
        id: s.id,
        projectId: "",
        projectName: "",
        title: s.title,
        subtitle: s.subtitle,
        action: "openSettings",
        target: s.target,
      });
    }
  }

  // §6 — Saved files results (uploaded note/image attachments by filename)
  const allResources = resources.filter((r) => r.files?.length > 0 || r.images?.length > 0);
  for (const r of allResources) {
    for (const f of (r.files ?? [])) {
      if (f.name.toLowerCase().includes(q)) {
        results.push({
          type: "savedFile",
          id: `file-${r.id}-${f.name}`,
          projectId: r.projectId,
          projectName: projectName(r.projectId),
          title: f.name,
          subtitle: "File attachment",
          action: "navigate",
          target: r.projectId ? `/project/${r.projectId}?tab=Resources` : `/home?tab=Resources`,
        });
      }
    }
    for (const img of (r.images ?? [])) {
      if (img.name.toLowerCase().includes(q)) {
        results.push({
          type: "savedFile",
          id: `img-${r.id}-${img.name}`,
          projectId: r.projectId,
          projectName: projectName(r.projectId),
          title: img.name,
          subtitle: "Image attachment",
          action: "navigate",
          target: r.projectId ? `/project/${r.projectId}?tab=Resources` : `/home?tab=Resources`,
        });
      }
    }
  }

  return results.slice(0, 30);
}

```

---

## `src/sync/snapshot.ts`

Snapshot export/import: serialize IndexedDB to versioned JSON, validate, download, and read .json files.

```typescript
// src/sync/snapshot.ts
// Local-first snapshot export/import. Serializes the entire IndexedDB
// contents to a versioned JSON structure for backup, restore, and
// Google Drive sync. Never includes credentials or env vars.

import { db, exportDbState, importDbState, hasLocalData } from "../data/db";

export const SNAPSHOT_VERSION = "1.0";

export interface SnapshotMetadata {
  version: string;
  exportedAt: string; // ISO date
  appName: string;
  dbVersion: number;
}

export interface Snapshot {
  metadata: SnapshotMetadata;
  data: Record<string, any[]>;
}

/** Validate that a parsed object looks like a Panga snapshot. */
export function validateSnapshot(obj: unknown): Snapshot | null {
  if (!obj || typeof obj !== "object") return null;
  const root = obj as any;
  if (
    typeof root.metadata !== "object" ||
    root.metadata === null ||
    typeof root.metadata.version !== "string" ||
    typeof root.metadata.exportedAt !== "string"
  ) {
    return null;
  }
  if (typeof root.data !== "object" || root.data === null) return null;
  return root as Snapshot;
}

/**
 * Export the entire local database to a snapshot object.
 * Only table data is exported — no credentials, keys, or env vars.
 */
export async function exportSnapshot(): Promise<Snapshot> {
  const data = await exportDbState();
  return {
    metadata: {
      version: SNAPSHOT_VERSION,
      exportedAt: new Date().toISOString(),
      appName: "Panga",
      dbVersion: db.verno,
    },
    data,
  };
}

/**
 * Import (hydrate) a snapshot into IndexedDB.
 * Clears all user tables first, then bulk-loads every record.
 */
export async function importSnapshot(snapshot: Snapshot): Promise<void> {
  await importDbState(snapshot.data);
}

/** Trigger a browser download of the snapshot as a .json file. */
export async function downloadSnapshot(): Promise<Blob> {
  const snapshot = await exportSnapshot();
  const json = JSON.stringify(snapshot, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `panga-snapshot-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return blob;
}

/** Read and validate a snapshot from a File object. */
export async function readSnapshotFile(file: File): Promise<Snapshot> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        const snapshot = validateSnapshot(parsed);
        if (!snapshot) {
          reject(new Error("Invalid snapshot file: missing required metadata or data fields."));
          return;
        }
        resolve(snapshot);
      } catch (e) {
        reject(new Error(`Failed to parse snapshot file: ${(e as Error).message}`));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsText(file);
  });
}

/**
 * Quick check whether any user data exists in IndexedDB.
 * Used on the Landing page to decide whether to show the
 * "Quick Upload / Restore Snapshot" dropzone.
 */
export async function hasAnyData(): Promise<boolean> {
  return hasLocalData();
}

```

---

## `src/sync/sync.ts`

Sync coordination: status subscription, push/delete record, full sync, and re-exports auth functions.

```typescript
// src/sync/sync.ts
// Local persistence, offline status, and sync management.
// This is the primary sync module for the local-first architecture.

import { db } from "../data/db";
import { signIn, signUp, signOut, restoreSession, restoreSessionFromSnapshot, type AuthResult } from "../auth/session";

export type { AuthResult };
export { signIn, signUp, signOut, restoreSession, restoreSessionFromSnapshot };

export type SyncStatusState = "idle" | "syncing" | "synced" | "error";

const LAST_SYNC_KEY = "panga_last_sync_time";

function safeGetStorage(key: string): string | null {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetStorage(key: string, value: string | null) {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return;
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {}
}

let currentStatus: SyncStatusState = "synced";
let lastSyncTimestamp: number = Number(safeGetStorage(LAST_SYNC_KEY) || Date.now());
let statusListeners: Array<(status: SyncStatusState, message?: string) => void> = [];

export function getSyncStatus(): SyncStatusState {
  return currentStatus;
}

export function getLastSyncTime(): number {
  return lastSyncTimestamp;
}

export function subscribeSyncStatus(fn: (status: SyncStatusState, message?: string) => void) {
  statusListeners.push(fn);
  fn(currentStatus, "Local storage synchronized");
  return () => {
    statusListeners = statusListeners.filter((l) => l !== fn);
  };
}

function updateStatus(status: SyncStatusState, message?: string) {
  currentStatus = status;
  for (const listener of statusListeners) {
    try {
      listener(status, message);
    } catch {}
  }
}

function mapDexieTableName(table: string): string {
  const map: Record<string, string> = {
    calendar_events: "calendarEvents",
    doc_entries: "docEntries",
  };
  return map[table] || table;
}

/** Push of a single record when changed in UI — marks as synced locally */
export async function syncPushRecord(
  tableName:
    | "projects"
    | "tasks"
    | "resources"
    | "milestones"
    | "issues"
    | "contacts"
    | "reminders"
    | "calendar_events"
    | "insights"
    | "doc_entries",
  record: any
) {
  try {
    const dexieTable = mapDexieTableName(tableName);
    if (db.isOpen()) {
      await (db as any)[dexieTable]?.update(record.id, { syncStatus: "synced" });
    }
    lastSyncTimestamp = Date.now();
    safeSetStorage(LAST_SYNC_KEY, String(lastSyncTimestamp));
    updateStatus("synced", "Changes saved locally");
  } catch (err) {
    console.warn(`Sync push error (${tableName}):`, err);
  }
}

/** Push of a deletion */
export async function syncDeleteRecord(_tableName: string, _id: string) {
  lastSyncTimestamp = Date.now();
  safeSetStorage(LAST_SYNC_KEY, String(lastSyncTimestamp));
  updateStatus("synced", "Record removed");
}

/** Push of a setting */
export async function syncPushSetting(_key: string, _value: any) {
  lastSyncTimestamp = Date.now();
  safeSetStorage(LAST_SYNC_KEY, String(lastSyncTimestamp));
  updateStatus("synced", "Settings saved");
}

/** Full local reconciliation — opens DB, updates timestamp */
export async function syncAll(): Promise<{ ok: boolean; message: string }> {
  updateStatus("syncing", "Saving changes...");
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    lastSyncTimestamp = Date.now();
    safeSetStorage(LAST_SYNC_KEY, String(lastSyncTimestamp));
    updateStatus("synced", "All data saved locally.");

    return { ok: true, message: "All data saved locally." };
  } catch (err: any) {
    updateStatus("error", err?.message || "Save error");
    return { ok: false, message: `Save error: ${err?.message || String(err)}` };
  }
}
```

---

## `test-debug.mjs`

Playwright E2E test script for debugging console errors and page load behavior.

```javascript
import { chromium } from "playwright-core";
const URL = "http://127.0.0.1:5199/";
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}\n${e.stack}`));
page.on("response", (resp) => {
  if (resp.status() >= 400) console.log(`RESOURCE ${resp.status()}: ${resp.url()}`);
});

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(5000);
console.log("body:", (await page.textContent("body")).replace(/\s+/g," ").slice(0,500));
console.log("errors:", errors.join("\n") || "(none)");
await browser.close();
```

---

## `test-fresh.mjs`

Playwright E2E test: signs up a new user and verifies the home page loads.

```javascript
import { chromium } from "playwright-core";
const URL = "http://127.0.0.1:5199/";
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}\n${e.stack}`));

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForSelector("#email-input", { timeout: 30000 });

// Try signup
await page.fill("#email-input", "test@example.com");
await page.fill("#password-input", "password123");
// Switch to signup mode
await page.click("text=Sign Up");
await page.click("button[type=submit]");
await page.waitForTimeout(2000);

console.log("URL:", page.url());
console.log("body:", (await page.textContent("body")).replace(/\s+/g," ").slice(0,500));
console.log("errors:", errors.join("\n") || "(none)");
await page.screenshot({ path: "/tmp/kilo/fresh.png", fullPage: true });
await browser.close();

```

---

## `test-migration.mjs`

Playwright E2E test: seeds a legacy v2 database, runs migration, and verifies state transformation.

```javascript
import { chromium } from "playwright-core";
const URL = "http://127.0.0.1:5199/";
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}\n${e.stack}`));

// Set the session email so the app uses the correct per-user database name.
const userEmail = "t@e.com";
const dbName = (function(email) {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = ((hash << 5) - hash + email.toLowerCase().charCodeAt(i)) | 0;
  }
  return "panga-db-" + (hash >>> 0);
})(userEmail);
console.log("Seeding into database:", dbName);

// Build a legacy Dexie v2 database (idb version 20) with pre-migration data.
await page.route("**/*", (r) => (r.request().resourceType() === "script" ? r.abort() : r.continue()));
await page.goto(URL, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(500);
const seeded = await page.evaluate(async (email, dbName) => {
  // Set session so the app will use this db on load
  localStorage.setItem("panga_session_email", email);

  await new Promise((res) => { const d = indexedDB.deleteDatabase(dbName); d.onsuccess = () => res("deleted"); d.onerror = () => res("err"); d.onblocked = () => res("blocked"); });

  const schemas = {
    projects: "id, status, updatedAt, syncStatus",
    tasks: "id, projectId, status, dueDate, updatedAt, syncStatus, *tags",
    resources: "id, projectId, category, updatedAt, syncStatus, *tags",
    docEntries: "id, projectId, type, order, updatedAt, syncStatus",
    goals: "id, projectId, status, targetDate, updatedAt, syncStatus",
    issues: "id, projectId, status, severity, updatedAt, syncStatus",
    contacts: "id, name, updatedAt, syncStatus, *linkedProjectIds",
    reminders: "id, projectId, triggerAt, status, updatedAt, syncStatus",
    settings: "key",
  };
  const db = await new Promise((res, rej) => {
    const r = indexedDB.open(dbName, 20);
    r.onupgradeneeded = () => { for (const [n, s] of Object.entries(schemas)) { const st = r.result.createObjectStore(n, { keyPath: "id" }); for (const p of s.split(",").slice(1)) { const t = p.trim(); const multi = t.startsWith("*"); const name = multi ? t.slice(1) : t; st.createIndex(name, name, multi ? { multiEntry: true } : undefined); } } };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
  const put = (store, rec) => new Promise((res, rej) => { const t = db.transaction(store, "readwrite"); t.objectStore(store).put(rec); t.oncomplete = res; t.onerror = () => rej(t.error); });
  await put("projects", { id: "p1", name: "Legacy Project", description: "from v2", status: "active", createdAt: 1, updatedAt: 2, syncStatus: "synced" });
  await put("projects", { id: "p2", name: "Second Legacy", description: "", status: "active", createdAt: 1, updatedAt: 3, syncStatus: "synced" });
  await put("goals", { id: "g1", projectId: "p1", title: "Ship v1", targetDate: 100, status: "achieved", createdAt: 1, updatedAt: 2, syncStatus: "synced" });
  await put("resources", { id: "r1", projectId: "p1", category: "link", title: "Old link", tags: [], value: "https://example.com", textBody: null, images: [], createdAt: 1, updatedAt: 2, syncStatus: "synced" });
  await put("resources", { id: "r2", projectId: "p1", category: "prompt", title: "Old prompt", tags: [], textBody: "hello", images: [], createdAt: 1, updatedAt: 2, syncStatus: "synced" });
  await put("contacts", { id: "c1", name: "Ada", tags: [], linkedProjectIds: ["p1"], email: "ada@example.com", createdAt: 1, updatedAt: 2, syncStatus: "synced" });
  await put("settings", { id: "appInitialized", key: "appInitialized", value: true });
  db.close();
  return "ok";
}, userEmail, dbName);
console.log("seeded:", seeded);
await page.unroute("**/*");

await page.goto(URL, { waitUntil: "networkidle" });
await page.fill("#email-input", userEmail);
await page.click("button[type=submit]");
// Read the OTP code from sessionStorage (set by sendOtp)
const otp = await page.evaluate(() => {
  const raw = sessionStorage.getItem("panga_otp_pending");
  if (!raw) return "";
  try { return JSON.parse(raw).code; } catch { return ""; }
});
await page.fill("#otp-input", otp);
await page.click("button[type=submit]");
await page.waitForTimeout(3000);

const state = await page.evaluate((dbName) => new Promise((res) => {
  const r = indexedDB.open(dbName);
  r.onsuccess = () => {
    const d = r.result; const out = { idbVersion: d.version, stores: [...d.objectStoreNames] };
    const tx = d.transaction(["projects","milestones","resources","contacts","resourceSubcategories"], "readonly");
    for (const s of ["projects","milestones","resources","contacts","resourceSubcategories"]) { const q = tx.objectStore(s).getAll(); q.onsuccess = () => { out[s] = q.result; }; }
    tx.oncomplete = () => { d.close(); res(out); };
  };
  r.onerror = () => res({ error: String(r.error) });
}), dbName);
console.log("idbVersion:", state.idbVersion, "stores:", JSON.stringify(state.stores));
console.log("projects:", JSON.stringify(state.projects));
console.log("milestones:", JSON.stringify(state.milestones));
console.log("resources:", JSON.stringify(state.resources));
console.log("contacts:", JSON.stringify(state.contacts));
console.log("resourceSubcategories:", JSON.stringify(state.resourceSubcategories));
console.log("body:", (await page.textContent("body")).replace(/\s+/g, " ").slice(0, 400));
console.log("ERRORS:", errors.join("\n") || "(none)");
await page.screenshot({ path: "/tmp/kilo/migrate.png", fullPage: true });
await browser.close();

```

---

## `test-project.mjs`

Playwright E2E test: creates a project and verifies it appears in the project view.

```javascript
import { chromium } from "playwright-core";
const URL = "http://127.0.0.1:5199/";
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}\n${e.stack}`));

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForSelector("#email-input", { timeout: 30000 });
await page.fill("#email-input", "test@example.com");
await page.click("button[type=submit]");
// Read the OTP code from sessionStorage (set by sendOtp)
const otp = await page.evaluate(() => {
  const raw = sessionStorage.getItem("panga_otp_pending");
  if (!raw) return "";
  try { return JSON.parse(raw).code; } catch { return ""; }
});
await page.fill("#otp-input", otp);
await page.click("button[type=submit]");
await page.waitForSelector(".page.home", { timeout: 15000 });
await page.waitForTimeout(1000);

// Create a project
await page.click("text=+ Add project");
await page.waitForTimeout(500);
await page.fill("#new-project-name", "Test Project");
await page.fill("#new-project-description", "A test project");
await page.click("button[type=submit]");
await page.waitForTimeout(2000);

// Check project appears
const body = await page.textContent("body");
console.log("After create:", body.replace(/\s+/g," ").slice(0,400));

// Click the project to open it
await page.click(".project-card");
await page.waitForTimeout(2000);
console.log("Project view URL:", page.url());

const projectBody = await page.textContent("body");
console.log("Project view:", projectBody.replace(/\s+/g," ").slice(0,600));

console.log("ERRORS:", errors.join("\n") || "(none)");
await page.screenshot({ path: "/tmp/kilo/project-test.png", fullPage: true });
await browser.close();

```

---

## `tsconfig.app.json`

TypeScript config for the frontend app (React JSX, bundler module resolution).

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

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}

```

---

## `tsconfig.json`

TypeScript project root config referencing app and node configs.

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}

```

---

## `tsconfig.node.json`

TypeScript config for Node-side tooling (vite.config.ts).

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023"],
    "types": ["node"],
    "skipLibCheck": true,

    /* Bundler mode */
    "module": "nodenext",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}

```

---

## `vercel.json`

Vercel deployment configuration: build, output dir, rewrites, headers, and function timeouts.

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/assistant/chat",
      "destination": "/api/assistant/chat"
    },
    {
      "source": "/api/backup/email",
      "destination": "/api/backup/email"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "functions": {
    "api/assistant/chat.js": {
      "maxDuration": 30
    },
    "api/backup/email.js": {
      "maxDuration": 60
    }
  }
}
```

---

## `vite.config.ts`

Vite build configuration with React plugin and PWA (VitePWA) support.

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Panga",
        short_name: "Panga",
        description: "Personal, offline-first project & resource planner.",
        theme_color: "#1f2937",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
      },
    }),
  ],
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: true,
  },
});

```

---
